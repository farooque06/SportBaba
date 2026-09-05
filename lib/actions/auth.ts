"use server"

import { supabase } from "@/lib/supabase";
import { signIn, signOut, auth } from "@/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import * as OTPAuth from "otpauth";
import { isValidEmail, isValidName, isValidPhone, isValidDateOfBirth, isValidCity, MAX_EMAIL_LENGTH, MAX_NAME_LENGTH, MAX_PASSWORD_LENGTH } from "@/lib/utils";

function getValidDestination(callbackUrl: string | null | undefined, defaultDestination: string): string {
  if (!callbackUrl) return defaultDestination;
  const trimmed = callbackUrl.trim();
  if (
    trimmed.startsWith("/") &&
    !trimmed.startsWith("//") &&
    !trimmed.startsWith("/login") &&
    !trimmed.startsWith("/register")
  ) {
    return trimmed;
  }
  return defaultDestination;
}

export async function registerAction(formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const fullName = (formData.get("fullName") as string)?.trim();
  const accountType = (formData.get("accountType") as string) || "player"; // "player" | "facility"
  const callbackUrl = formData.get("callbackUrl") as string | null;

  // New optional profile fields
  const phone = (formData.get("phone") as string)?.trim() || "";
  const dateOfBirth = (formData.get("dateOfBirth") as string)?.trim() || "";
  const preferredSport = (formData.get("preferredSport") as string)?.trim() || "";
  const city = (formData.get("city") as string)?.trim() || "";

  if (!email || !password || !fullName) {
    return { error: "All fields are required" };
  }
  if (!isValidName(fullName)) {
    return { error: `Name must contain only letters and spaces (2-${MAX_NAME_LENGTH} characters)` };
  }
  if (!isValidEmail(email)) {
    return { error: `Enter a valid email address up to ${MAX_EMAIL_LENGTH} characters` };
  }
  if (password.length < 8 || password.length > MAX_PASSWORD_LENGTH) {
    return { error: `Password must be 8-${MAX_PASSWORD_LENGTH} characters` };
  }

  // Validate optional fields if provided
  if (phone && !isValidPhone(phone)) {
    return { error: "Phone number must be exactly 10 digits" };
  }
  if (dateOfBirth && !isValidDateOfBirth(dateOfBirth)) {
    return { error: "Invalid date of birth. You must be at least 13 years old." };
  }
  if (city && !isValidCity(city)) {
    return { error: "City must contain only letters and spaces (2-100 characters)" };
  }

  const isSuperAdmin = email === 'far00queapril17@gmail.com';
  const role = isSuperAdmin ? 'superadmin' : (accountType === 'facility' ? 'user' : 'player');

  console.log("Registering user:", email, "with role:", role);
  const hashedPassword = await bcrypt.hash(password, 10);

  // 1. Create user in profiles table (with optional extended fields)
  console.log("Inserting into Supabase profiles...");
  const profileData: Record<string, any> = {
    email,
    full_name: fullName,
    password_hash: hashedPassword,
    role: role,
  };
  if (phone) profileData.phone = phone;
  if (dateOfBirth) profileData.date_of_birth = dateOfBirth;
  if (preferredSport) profileData.preferred_sport = preferredSport;
  if (city) profileData.city = city;

  const { data: newProfile, error } = await supabase.from('profiles').insert(profileData).select().single();

  if (error) {
    console.error("Supabase Insertion Error:", error);
    if (error.code === '23505') return { error: "Email already exists" };
    return { error: error.message };
  }

  // 2. Link existing customer bookings/profile if email matches existing customers
  if (role === 'player') {
    try {
      await supabase
        .from('bookings')
        .update({ user_id: newProfile.id })
        .eq('guest_email', email)
        .is('user_id', null);
    } catch (linkErr) {
      console.warn("Auto-link customer bookings warning:", linkErr);
    }
  }

  console.log("User registered successfully. Signing in...");

  // 3. Destination routing (respecting callbackUrl)
  let defaultDestination = "/player";
  if (isSuperAdmin) {
    defaultDestination = "/admin";
  } else if (role !== 'player') {
    defaultDestination = "/dashboard";
  }
  const destination = getValidDestination(callbackUrl, defaultDestination);

  // 4. Sign in the user
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: destination,
    });
  } catch (error: any) {
    if (error.type === "CredentialsSignin") {
      return { error: "Invalid credentials" };
    }
    throw error;
  }

  return { success: true };
}

export async function loginAction(formData: FormData) {
  const email = (formData.get("email") as string).trim().toLowerCase();
  const password = formData.get("password") as string;
  const callbackUrl = formData.get("callbackUrl") as string | null;

  // First validate credentials manually
  const { data: user, error: userError } = await supabase
    .from("profiles")
    .select("id, password_hash, role, totp_enabled, totp_secret")
    .eq("email", email)
    .single();

  if (userError || !user || !user.password_hash) {
    return { error: "Invalid email or password" };
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    return { error: "Invalid email or password" };
  }

  const isSuperAdmin = user.role === 'superadmin' || email.toLowerCase() === 'far00queapril17@gmail.com';

  // Determine redirect destination based on membership, role & callbackUrl
  let defaultDestination = "/player";
  if (isSuperAdmin) {
    defaultDestination = "/admin";
  } else {
    // Check if user has an owner/manager/staff membership
    const { data: membership } = await supabase
      .from('memberships')
      .select('role')
      .eq('profile_id', user.id)
      .in('role', ['owner', 'manager', 'staff'])
      .limit(1)
      .maybeSingle();

    if (membership || user.role === 'owner' || user.role === 'manager' || user.role === 'user') {
      defaultDestination = "/dashboard";
    }
  }

  const destination = getValidDestination(callbackUrl, defaultDestination);

  // Check if 2FA is enabled BEFORE signing in
  if (user.totp_enabled && user.totp_secret) {
    return { requires2FA: true, email };
  }

  // Normal login flow (no 2FA)
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: destination,
    });
  } catch (error: any) {
    if (error.type === "CredentialsSignin" || error.message?.includes("CredentialsSignin")) {
      return { error: "Invalid email or password" };
    }
    // Auth.js v5 uses redirects which throw errors; we MUST re-throw them
    if (error.digest?.includes("NEXT_REDIRECT") || error.message?.includes("NEXT_REDIRECT")) {
        throw error;
    }
    console.error("Login Action Error:", error);
    return { error: "An unexpected error occurred during login." };
  }
}

export async function verify2FAAction(email: string, password: string, totpCode: string, callbackUrl?: string) {
  // 1. Re-validate credentials
  const { data: user, error: userError } = await supabase
    .from("profiles")
    .select("id, password_hash, role, totp_secret, totp_enabled")
    .eq("email", email)
    .single();

  if (userError || !user || !user.password_hash) {
    return { error: "Invalid credentials" };
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    return { error: "Invalid credentials" };
  }

  // 2. Verify TOTP code
  if (!user.totp_secret || !user.totp_enabled) {
    return { error: "2FA is not enabled for this account" };
  }

  const totp = new OTPAuth.TOTP({
    issuer: "SportBaba",
    label: email,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(user.totp_secret),
  });

  const delta = totp.validate({ token: totpCode, window: 1 });
  if (delta === null) {
    return { error: "Invalid authentication code. Please try again." };
  }

  const isSuperAdmin = user.role === 'superadmin' || email.toLowerCase() === 'far00queapril17@gmail.com';
  let defaultDestination = "/player";
  if (isSuperAdmin) {
    defaultDestination = "/admin";
  } else {
    const { data: membership } = await supabase
      .from('memberships')
      .select('role')
      .eq('profile_id', user.id)
      .in('role', ['owner', 'manager', 'staff'])
      .limit(1)
      .maybeSingle();

    if (membership || user.role === 'owner' || user.role === 'manager' || user.role === 'user') {
      defaultDestination = "/dashboard";
    }
  }

  const destination = getValidDestination(callbackUrl, defaultDestination);

  // 3. Code is valid — sign in
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: destination,
    });
  } catch (error: any) {
    if (error.digest?.includes("NEXT_REDIRECT") || error.message?.includes("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("2FA Signin Error:", error);
    return { error: "Failed to complete authentication." };
  }
}

// ─── 2FA Setup Actions ──────────────────────────────────────────────────────────

export async function setup2FA() {
  const session = await auth();
  if (!session?.user?.email) return { error: "Unauthorized" };

  // Generate a new TOTP secret
  const secret = new OTPAuth.Secret({ size: 20 });

  const totp = new OTPAuth.TOTP({
    issuer: "SportBaba",
    label: session.user.email,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: secret,
  });

  // Store the secret (not yet enabled)
  const { error } = await supabase
    .from("profiles")
    .update({ totp_secret: secret.base32 })
    .eq("email", session.user.email);

  if (error) return { error: error.message };

  // Return the otpauth:// URI for QR code generation
  return {
    success: true,
    uri: totp.toString(),
    secret: secret.base32,
  };
}

export async function confirm2FASetup(code: string) {
  const session = await auth();
  if (!session?.user?.email) return { error: "Unauthorized" };

  // Fetch the stored secret
  const { data: user, error: fetchError } = await supabase
    .from("profiles")
    .select("totp_secret")
    .eq("email", session.user.email)
    .single();

  if (fetchError || !user?.totp_secret) {
    return { error: "No 2FA setup in progress. Please start again." };
  }

  // Validate the code
  const totp = new OTPAuth.TOTP({
    issuer: "SportBaba",
    label: session.user.email,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(user.totp_secret),
  });

  const delta = totp.validate({ token: code, window: 1 });
  if (delta === null) {
    return { error: "Invalid code. Make sure your authenticator app is synced." };
  }

  // Enable 2FA
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ totp_enabled: true })
    .eq("email", session.user.email);

  if (updateError) return { error: updateError.message };

  return { success: true };
}

export async function disable2FA(code: string) {
  const session = await auth();
  if (!session?.user?.email) return { error: "Unauthorized" };

  // Fetch and validate
  const { data: user, error: fetchError } = await supabase
    .from("profiles")
    .select("totp_secret, totp_enabled")
    .eq("email", session.user.email)
    .single();

  if (fetchError || !user?.totp_secret || !user?.totp_enabled) {
    return { error: "2FA is not currently enabled" };
  }

  const totp = new OTPAuth.TOTP({
    issuer: "SportBaba",
    label: session.user.email,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(user.totp_secret),
  });

  const delta = totp.validate({ token: code, window: 1 });
  if (delta === null) {
    return { error: "Invalid code. Cannot disable 2FA without a valid code." };
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ totp_enabled: false, totp_secret: null })
    .eq("email", session.user.email);

  if (updateError) return { error: updateError.message };

  return { success: true };
}

export async function get2FAStatus() {
  const session = await auth();
  if (!session?.user?.email) return { enabled: false };

  const { data } = await supabase
    .from("profiles")
    .select("totp_enabled")
    .eq("email", session.user.email)
    .single();

  return { enabled: data?.totp_enabled ?? false };
}

// ─── Existing helpers (unchanged) ───────────────────────────────────────────────

export async function logoutAction() {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  cookieStore.delete("active_facility_id");
  
  await signOut({ redirectTo: "/" });
  revalidatePath("/");
}

export async function getCurrentUser() {
  const session = await auth();
  return session?.user || null;
}

export async function getAnyUserRoleAndFacility() {
  const user = await getCurrentUser();
  if (!user?.id) return { role: null, facilityId: null };

  // Superadmin check
  if (user.email === 'far00queapril17@gmail.com') {
    // For superadmin, we still need a facilityId to show reports. 
    // We'll grab the first one we find in the system as a placeholder or first membership.
    const { data: firstFacility } = await supabase.from('facilities').select('id').limit(1).maybeSingle();
    return { role: 'owner', facilityId: firstFacility?.id || null };
  }

  const { data, error } = await supabase
    .from('memberships')
    .select('role, facility_id')
    .eq('profile_id', user.id)
    .in('role', ['owner', 'manager'])
    .limit(1)
    .maybeSingle();

  if (error || !data) return { role: null, facilityId: null };
  return { role: data.role, facilityId: data.facility_id };
}

export async function getCurrentUserRole(facilityId: string) {
  const user = await getCurrentUser();
  if (!user?.id) return null;

  // 1. Superadmin check (Platform owners)
  if (user.email === 'far00queapril17@gmail.com') return 'owner';

  // 2. Handle "any" fallback (Check if user is owner of AT LEAST one facility)
  if (facilityId === "any" || !facilityId) {
    const { data } = await supabase
      .from('memberships')
      .select('role')
      .eq('profile_id', user.id)
      .in('role', ['owner', 'manager'])
      .limit(1)
      .maybeSingle();
    
    return data?.role || null;
  }

  const { data, error } = await supabase
    .from('memberships')
    .select('role')
    .eq('profile_id', user.id)
    .eq('facility_id', facilityId)
    .maybeSingle();

  if (error) {
    console.error("getCurrentUserRole: Database Error", error);
    return null;
  }

  return data?.role || null;
}

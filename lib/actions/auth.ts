"use server"

import { supabase } from "@/lib/supabase";
import { signIn, signOut, auth } from "@/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import * as OTPAuth from "otpauth";

export async function registerAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;

  if (!email || !password || !fullName) {
    return { error: "All fields are required" };
  }

  const isSuperAdmin = email === 'far00queapril17@gmail.com';

  console.log("Registering user:", email);
  const hashedPassword = await bcrypt.hash(password, 10);

  // 1. Create user in profiles table
  console.log("Inserting into Supabase profiles...");
  const { data, error } = await supabase.from('profiles').insert({
    email,
    full_name: fullName,
    password_hash: hashedPassword,
    role: isSuperAdmin ? 'superadmin' : 'user'
  }).select().single();

  if (error) {
    console.error("Supabase Insertion Error:", error);
    if (error.code === '23505') return { error: "Email already exists" };
    return { error: error.message };
  }

  console.log("User registered successfully. Signing in...");

  // 2. Sign in the user
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: isSuperAdmin ? "/admin" : "/dashboard",
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
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const isSuperAdmin = email === 'far00queapril17@gmail.com';

  // If superadmin, check if 2FA is enabled BEFORE signing in
  if (isSuperAdmin) {
    // First validate credentials manually
    const { data: user, error: userError } = await supabase
      .from("profiles")
      .select("id, password_hash, totp_enabled, totp_secret")
      .eq("email", email)
      .single();

    if (userError || !user || !user.password_hash) {
      return { error: "Invalid email or password" };
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return { error: "Invalid email or password" };
    }

    // If 2FA is enabled, don't sign in yet — ask for the code
    if (user.totp_enabled && user.totp_secret) {
      return { requires2FA: true, email };
    }
  }

  // Normal login flow (no 2FA or non-superadmin)
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: isSuperAdmin ? "/admin" : "/dashboard",
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

export async function verify2FAAction(email: string, password: string, totpCode: string) {
  // 1. Re-validate credentials
  const { data: user, error: userError } = await supabase
    .from("profiles")
    .select("id, password_hash, totp_secret, totp_enabled")
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

  // 3. Code is valid — sign in
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/admin",
    });
  } catch (error: any) {
    if (error.digest?.includes("NEXT_REDIRECT") || error.message?.includes("NEXT_REDIRECT")) {
      throw error;
    }
    return { error: "An unexpected error occurred." };
  }
}

// ─── 2FA Setup Actions ──────────────────────────────────────────────────────────

export async function setup2FA() {
  const session = await auth();
  if (!session?.user?.email) return { error: "Unauthorized" };

  // Only allow superadmin
  if (session.user.email !== 'far00queapril17@gmail.com') {
    return { error: "Only superadmin can enable 2FA" };
  }

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

  if (session.user.email !== 'far00queapril17@gmail.com') {
    return { error: "Only superadmin can enable 2FA" };
  }

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

  if (session.user.email !== 'far00queapril17@gmail.com') {
    return { error: "Only superadmin can manage 2FA" };
  }

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

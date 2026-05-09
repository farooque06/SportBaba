"use server"

import { supabase } from "@/lib/supabase";
import { signIn, signOut, auth } from "@/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

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

export async function logoutAction() {
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

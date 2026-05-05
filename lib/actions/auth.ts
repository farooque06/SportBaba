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

export async function getCurrentUserRole(facilityId: string) {
  const user = await getCurrentUser();
  if (!user?.id || !facilityId) return null;

  const { data, error } = await supabase
    .from('memberships')
    .select('role')
    .eq('profile_id', user.id)
    .eq('facility_id', facilityId)
    .single();

  if (error || !data) return null;
  return data.role;
}

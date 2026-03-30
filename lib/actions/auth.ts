"use server"

import { supabase } from "@/lib/supabase";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function syncUserAction() {
  const { userId } = await auth();
  const user = await currentUser();
  if (!userId || !user) return { error: "Not authenticated" };

  const { data, error } = await supabase.from('profiles').upsert({
    id: userId,
    clerk_id: userId,
    email: user.emailAddresses[0].emailAddress,
    full_name: `${user.firstName} ${user.lastName}`,
    avatar_url: user.imageUrl,
  }, { onConflict: 'id' });

  if (error) return { error: error.message };
  return { success: true, data };
}

export async function getCurrentUserRole() {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) return null;

  const { data, error } = await supabase
    .from('memberships')
    .select('role')
    .eq('user_id', userId)
    .eq('facility_id', orgId)
    .single();

  if (error || !data) return null;
  return data.role;
}

export async function requireAdmin() {
  const role = await getCurrentUserRole();
  const isAdmin = role === 'owner' || role === 'manager';
  
  if (!isAdmin) {
    throw new Error("Unauthorized: Administrative privileges required.");
  }

  return { role, isAdmin: true };
}

export async function canViewReports() {
    const role = await getCurrentUserRole();
    return role === 'owner' || role === 'manager' || role === 'staff';
}

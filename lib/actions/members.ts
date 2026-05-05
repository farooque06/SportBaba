"use server"

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { getCurrentUserRole } from "./auth";

export async function fetchMembers(facilityId: string) {
  const { data, error } = await supabase
    .from('memberships')
    .select(`
      *,
      profile:profiles(id, full_name, email, avatar_url)
    `)
    .eq('facility_id', facilityId)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data;
}

export async function updateMemberRole(membershipId: string, newRole: string, facilityId: string) {
  const currentUserRole = await getCurrentUserRole(facilityId);
  if (currentUserRole !== 'owner') {
    return { error: "Only the facility owner can change roles." };
  }

  const { data, error } = await supabase
    .from('memberships')
    .update({ role: newRole })
    .eq('id', membershipId)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath("/dashboard/members");
  return { success: true, data };
}

export async function removeMember(membershipId: string, facilityId: string) {
  const currentUserRole = await getCurrentUserRole(facilityId);
  if (currentUserRole !== 'owner') {
    return { error: "Only the facility owner can remove members." };
  }

  // Prevent removing oneself (the owner)
  const { data: member } = await supabase.from('memberships').select('role').eq('id', membershipId).single();
  if (member?.role === 'owner') return { error: "The owner cannot be removed." };

  const { error } = await supabase
    .from('memberships')
    .delete()
    .eq('id', membershipId);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/members");
  return { success: true };
}

export async function addMemberByEmail(facilityId: string, email: string, role: string) {
  const currentUserRole = await getCurrentUserRole(facilityId);
  if (currentUserRole !== 'owner' && currentUserRole !== 'manager') {
    return { error: "Unauthorized to add members." };
  }

  // 1. Find the profile by email
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email.toLowerCase())
    .single();

  if (profileError || !profile) {
    return { error: "No user found with this email. Please ensure they have signed up on SportBaba first." };
  }

  // 2. Check if already a member
  const { data: existing } = await supabase
    .from('memberships')
    .select('id')
    .eq('facility_id', facilityId)
    .eq('profile_id', profile.id)
    .single();

  if (existing) return { error: "User is already a member of this facility." };

  // 3. Create membership
  const { data, error } = await supabase
    .from('memberships')
    .insert({
      facility_id: facilityId,
      profile_id: profile.id,
      role
    })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath("/dashboard/members");
  return { success: true, data };
}

export async function fetchFacilityStats(facilityId: string) {
  const now = new Date().toISOString();
  const [bookings, resources, members, live] = await Promise.all([
    supabase.from('bookings').select('id', { count: 'exact' }).eq('facility_id', facilityId),
    supabase.from('resource_units').select('id', { count: 'exact' }).eq('facility_id', facilityId).eq('is_active', true),
    supabase.from('memberships').select('id', { count: 'exact' }).eq('facility_id', facilityId),
    supabase.from('bookings')
      .select('id', { count: 'exact' })
      .eq('facility_id', facilityId)
      .eq('status', 'confirmed')
      .lte('start_time', now)
      .gte('end_time', now)
  ]);

  return {
    totalBookings: bookings.count || 0,
    totalResources: resources.count || 0,
    totalMembers: members.count || 0,
    liveMatches: live.count || 0,
  };
}

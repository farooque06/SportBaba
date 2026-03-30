"use server"

import { supabase } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { clerkClient } from "@clerk/nextjs/server";

export async function registerFacility(formData: FormData) {
  const { orgId, userId } = await auth();
  const clerk = await clerkClient();
  if (!orgId) throw new Error("No organization found");

  const name = formData.get("name") as string;
  const sport_type = formData.get("sport_type") as string;
  const slug = name.toLowerCase().replace(/\s+/g, '-');

  const { data: facility, error: facilityError } = await supabase
    .from('facilities')
    .upsert({
      id: orgId,
      name,
      slug,
      sport_type,
      status: 'pending',
      config: {
        setup_completed: true,
        primary_color: "#22C55E"
      }
    })
    .select()
    .single();

  if (facilityError) {
    return { error: facilityError.message };
  }

  // Create Owner Membership & Sync Role to Clerk
  if (userId) {
    // 1. Database Sync
    await supabase.from('memberships').upsert({
      profile_id: userId,
      facility_id: orgId,
      role: 'owner'
    });

    // 2. Platform Identity Sync (Clerk)
    // This ensures they are recognized as 'Admin' at the platform level for this org
    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: 'owner',
        facilityId: orgId
      }
    });
  }

  revalidatePath("/dashboard");
  return { success: true, data: facility };
}

export async function fetchFacility(id: string) {
  const { data, error } = await supabase
    .from('facilities')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}export async function updateFacilitySettings(id: string, updates: any) {
  const { data, error } = await supabase
    .from('facilities')
    .update({
      name: updates.name,
      config: updates.config // Merged config
    })
    .eq('id', id)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath("/dashboard/settings");
  return { success: true, data };
}

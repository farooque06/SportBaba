"use server"

import { supabase } from "@/lib/supabase";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function registerFacility(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  
  const userId = session.user.id;
  const facilityId = crypto.randomUUID(); // Generate a new ID for the facility

  const name = formData.get("name") as string;
  const sport_type = formData.get("sport_type") as string;
  const slug = name.toLowerCase().replace(/\s+/g, '-');

  const { data: facility, error: facilityError } = await supabase
    .from('facilities')
    .insert({
      id: facilityId,
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

  // Create Owner Membership
  await supabase.from('memberships').insert({
    profile_id: userId,
    facility_id: facilityId,
    role: 'owner'
  });

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
}

export async function updateFacilitySettings(id: string, updates: any) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

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

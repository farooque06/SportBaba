"use server"

import { supabase } from "@/lib/supabase";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function createResourceUnit(payload: { name: string, unit_type: string, base_price: number }, facilityId: string) {
  const session = await auth();
  if (!session?.user || !facilityId) throw new Error("Unauthorized");

  const { name, unit_type, base_price } = payload;

  const { data: createdData, error } = await supabase
    .from('resource_units')
    .insert({
      facility_id: facilityId,
      name,
      unit_type,
      base_price,
      is_active: true
    })
    .select()
    .single();

  if (error) {
    console.error("Supabase Error in createResourceUnit:", error.message);
    return { error: error.message };
  }

  revalidatePath("/dashboard/resources");
  revalidatePath("/dashboard");
  return { success: true, data: createdData };
}

export async function fetchResourceUnits(facilityId: string) {
  const { data: resources, error } = await supabase
    .from('resource_units')
    .select('*')
    .eq('facility_id', facilityId)
    .eq('is_active', true);

  if (error) {
    console.error("Supabase Error in fetchResourceUnits:", error.message);
    return [];
  }
  return resources;
}

export async function deleteResourceUnit(id: string, facilityId: string) {
  const session = await auth();
  if (!session?.user || !facilityId) throw new Error("Unauthorized");

  const { error } = await supabase
    .from('resource_units')
    .update({ is_active: false })
    .eq('id', id)
    .eq('facility_id', facilityId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/resources");
  revalidatePath("/dashboard");
  return { success: true };
}

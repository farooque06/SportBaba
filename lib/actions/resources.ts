"use server"

import { supabase } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function createResourceUnit(formData: FormData) {
  const { orgId } = await auth();
  if (!orgId) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const unit_type = formData.get("unit_type") as string;
  const base_price = parseFloat(formData.get("base_price") as string) || 0;

  const { data, error } = await supabase
    .from('resource_units')
    .insert({
      facility_id: orgId,
      name,
      unit_type,
      base_price,
      is_active: true
    })
    .select()
    .single();


  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true, data };
}

export async function fetchResourceUnits(facilityId: string) {
  const { data, error } = await supabase
    .from('resource_units')
    .select('*')
    .eq('facility_id', facilityId)
    .eq('is_active', true);

  if (error) return [];
  return data;
}

export async function deleteResourceUnit(id: string) {
  const { orgId } = await auth();
  if (!orgId) throw new Error("Unauthorized");

  const { error } = await supabase
    .from('resource_units')
    .update({ is_active: false })
    .eq('id', id)
    .eq('facility_id', orgId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/resources");
  return { success: true };
}

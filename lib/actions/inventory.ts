"use server"

import { supabase } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "./auth";

export async function fetchProducts(facilityId: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('facility_id', facilityId)
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) return [];
  return data;
}

export async function upsertProduct(product: { id?: string, name: string, price: number, category?: string }) {
  await requireAdmin();
  const { orgId } = await auth();
  if (!orgId) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from('products')
    .upsert({
      ...product,
      facility_id: orgId,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  
  revalidatePath("/dashboard/inventory");
  return { success: true, data };
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  const { orgId } = await auth();
  if (!orgId) throw new Error("Unauthorized");

  // Soft delete by setting is_active to false
  const { error } = await supabase
    .from('products')
    .update({ is_active: false })
    .eq('id', id)
    .eq('facility_id', orgId);

  if (error) return { error: error.message };
  
  revalidatePath("/dashboard/inventory");
  return { success: true };
}

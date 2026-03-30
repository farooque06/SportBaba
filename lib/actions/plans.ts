"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export type SubscriptionPlan = {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export async function fetchSubscriptionPlans() {
  try {
    const { data: plans, error } = await supabase
      .from("subscription_plans")
      .select("*")
      .order("price", { ascending: true });

    if (error) throw error;
    return { success: true, data: plans as SubscriptionPlan[] };
  } catch (error: any) {
    console.error("Fetch Subscription Plans Error:", error);
    return { success: false, error: error.message };
  }
}

export async function createSubscriptionPlan(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const interval = formData.get("interval") as string;
    
    // Parse features from a comma-separated string or array
    const featuresRaw = formData.get("features") as string;
    const features = featuresRaw ? featuresRaw.split(",").map(f => f.trim()).filter(f => f) : [];

    const { error } = await supabase
      .from("subscription_plans")
      .insert({
        name,
        description,
        price,
        interval,
        features,
        currency: 'NRS'
      });

    if (error) throw error;
    
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Create Plan Error:", error);
    return { success: false, error: error.message };
  }
}

export async function togglePlanStatus(id: string, isActive: boolean) {
  try {
    const { error } = await supabase
      .from("subscription_plans")
      .update({ is_active: isActive })
      .eq("id", id);

    if (error) throw error;
    
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Toggle Plan Error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteSubscriptionPlan(id: string) {
  try {
    const { error } = await supabase
      .from("subscription_plans")
      .delete()
      .eq("id", id);

    if (error) throw error;
    
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Delete Plan Error:", error);
    return { success: false, error: error.message };
  }
}

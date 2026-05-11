"use server"

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function createTournament(data: {
  facility_id: string;
  name: string;
  sport: string;
  start_date: string;
  end_date: string;
  format: string;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const { data: tournament, error } = await supabase
    .from('tournaments')
    .insert({
      ...data,
      status: 'upcoming'
    })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath("/dashboard/tournaments");
  return { success: true, data: tournament };
}

export async function fetchTournaments(facilityId: string) {
  const session = await auth();
  if (!session?.user || !facilityId) return [];

  const { data, error } = await supabase
    .from('tournaments')
    .select('*, tournament_teams(count)')
    .eq('facility_id', facilityId)
    .order('start_date', { ascending: false });

  if (error) return [];
  return data;
}

export async function updateTournamentStatus(id: string, status: 'upcoming' | 'active' | 'completed', facilityId?: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  let query = supabase
    .from('tournaments')
    .update({ status })
    .eq('id', id);

  // Scope to facility if provided (prevents cross-tenant updates)
  if (facilityId) {
    query = query.eq('facility_id', facilityId);
  }

  const { data, error } = await query
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath("/dashboard/tournaments");
  return { success: true, data };
}

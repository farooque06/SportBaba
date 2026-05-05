import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";
import { auth } from "@/auth";

export async function getFacilityId() {
  const session = await auth();
  if (!session?.user) return null;

  const cookieStore = await cookies();
  const facilityId = cookieStore.get("active_facility_id")?.value;

  if (facilityId) return facilityId;

  const { data: membership } = await supabase
    .from('memberships')
    .select('facility_id')
    .eq('profile_id', session.user.id)
    .limit(1)
    .maybeSingle();
  
  return membership?.facility_id || null;
}

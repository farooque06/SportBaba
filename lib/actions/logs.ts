"use server"

import { supabase } from "@/lib/supabase"
import { auth } from "@/auth"
import { headers } from "next/headers"

interface LogActivityParams {
  facilityId?: string | null;
  action: string;
  entityType: string;
  entityId?: string;
  details?: any;
}

/**
 * Fire-and-forget logging function.
 * Call this function without `await` to log asynchronously without blocking the user's request.
 * Example: `logActivity({ action: 'booking.created', entityType: 'booking', entityId: '123' })`
 */
export async function logActivity(params: LogActivityParams) {
  try {
    const session = await auth();
    if (!session?.user) return; // Silent return if not authenticated

    const actorId = session.user.id;
    const actorName = session.user.name || session.user.email || 'Unknown User';
    
    // Attempt to get IP address from headers
    const headerStore = await headers();
    const forwardedFor = headerStore.get('x-forwarded-for');
    const realIp = headerStore.get('x-real-ip');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0] : (realIp || 'Unknown IP');

    // Insert the log
    const { error } = await supabase
      .from('activity_logs')
      .insert({
        facility_id: params.facilityId || null,
        actor_id: actorId,
        actor_name: actorName,
        action: params.action,
        entity_type: params.entityType,
        entity_id: params.entityId || null,
        details: params.details || null,
        ip_address: ipAddress,
      });

    if (error) {
      console.error("[Activity Log Error]", error.message);
    }
  } catch (err) {
    console.error("[Activity Log Exception]", err);
  }
}

/**
 * Fetch logs for a specific facility
 */
export async function getFacilityLogs(facilityId: string, limit = 50, offset = 0) {
  try {
    const { data, error, count } = await supabase
      .from('activity_logs')
      .select('*', { count: 'exact' })
      .eq('facility_id', facilityId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(error.message);
    return { data, count, success: true };
  } catch (err: any) {
    console.error("Error fetching facility logs:", err);
    return { success: false, error: err.message, data: [], count: 0 };
  }
}

/**
 * Fetch system-wide logs (Superadmin only)
 */
export async function getSystemLogs(limit = 100, offset = 0) {
  try {
    const { data, error, count } = await supabase
      .from('activity_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(error.message);
    return { data, count, success: true };
  } catch (err: any) {
    console.error("Error fetching system logs:", err);
    return { success: false, error: err.message, data: [], count: 0 };
  }
}

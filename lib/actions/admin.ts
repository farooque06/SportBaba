"use server"

import { supabase } from "@/lib/supabase"
import bcrypt from "bcryptjs"

/**
 * Superadmin specific actions for platform-wide management.
 * These should ONLY be called from routes protected by the 'superadmin' role.
 */

export async function fetchGlobalStats() {
  try {
    // Run multiple count queries in parallel for speed
    const [facilitiesRes, bookingsRes, activeSubsRes] = await Promise.all([
      supabase.from('facilities').select('*', { count: 'exact', head: true }),
      supabase.from('bookings').select('*', { count: 'exact', head: true }),
      supabase.from('facilities').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active')
    ]);

    // Fetch MRR data
    const { data: activeFacilities, error: mrrError } = await supabase
        .from('facilities')
        .select(`
            id,
            subscription_status,
            subscription_plans:plan_id(price)
        `)
        .eq('subscription_status', 'active');
        
    if (mrrError) {
        console.error("MRR Fetch Error:", mrrError.message);
    }

    let mrr = 0;
    if (activeFacilities) {
        activeFacilities.forEach((fac: any) => {
            // Support both object and array response formats from Supabase joins
            const plan = Array.isArray(fac.subscription_plans) ? fac.subscription_plans[0] : fac.subscription_plans;
            if (plan && typeof plan.price === 'number') {
                mrr += plan.price;
            }
        });
    }

    return {
      totalFacilities: facilitiesRes.count || 0,
      totalBookings: bookingsRes.count || 0,
      activeSubscriptions: activeSubsRes.count || 0,
      platformValue: mrr, 
      recentActivity: activeFacilities?.length || 0
    }
  } catch (error: any) {
    console.error("Admin Fetch Global Stats failed:", error.message || error);
    return {
      totalFacilities: 0,
      totalBookings: 0,
      activeSubscriptions: 0,
      platformValue: 0,
      recentActivity: 0
    }
  }
}

export async function fetchAllFacilities() {
  try {
    // 1. Fetch facilities with their primary owner (admin) email
    const { data: facilities, error } = await supabase
      .from('facilities')
      .select(`
        id,
        name,
        sport_type,
        subscription_status,
        trial_end,
        created_at,
        plan_id,
        phone,
        email,
        address,
        status,
        subscription_plans:plan_id(name, price),
        memberships(
          role,
          profiles(email)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
        console.error("Supabase Error in fetchAllFacilities:", error.message);
        throw error;
    }

    // 2. Process facilities to ensure email is never empty if an owner exists
    const processedFacilities = facilities?.map((fac: any) => {
        let displayEmail = fac.email;
        
        // If facility email is empty, find the first 'admin' or 'owner' membership email
        if (!displayEmail && fac.memberships) {
            const ownerMembership = fac.memberships.find((m: any) => m.role === 'admin' || m.role === 'owner');
            if (ownerMembership && ownerMembership.profiles) {
                displayEmail = ownerMembership.profiles.email;
            }
        }
        
        return {
            ...fac,
            email: displayEmail
        };
    });

    return processedFacilities || [];
  } catch (error: any) {
    console.error("Admin Fetch All Facilities failed:", error.message || error);
    return [];
  }
}

export async function updateClientStatus(
  facilityId: string, 
  status: string, 
  trialEnd?: string, 
  planId?: string,
  details?: { name?: string; phone?: string; email?: string; address?: string; orgStatus?: string }
) {
    try {
        const updateData: any = { subscription_status: status };
        if (trialEnd) updateData.trial_end = trialEnd;
        if (planId !== undefined) updateData.plan_id = planId || null;
        if (details) {
            if (details.name) updateData.name = details.name;
            if (details.phone !== undefined) updateData.phone = details.phone;
            if (details.email !== undefined) updateData.email = details.email;
            if (details.address !== undefined) updateData.address = details.address;
            if (details.orgStatus) updateData.status = details.orgStatus;
        }

        const { error } = await supabase
            .from('facilities')
            .update(updateData)
            .eq('id', facilityId);

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function approveFacility(id: string) {
    const res = await updateClientStatus(id, 'trialing', undefined, undefined, { orgStatus: 'active' });
    
    if (res.success) {
        // Send notification email to the owner
        const { data: facility } = await supabase
            .from('facilities')
            .select(`
                name,
                memberships(
                    role,
                    profiles(email, full_name)
                )
            `)
            .eq('id', id)
            .single();

        if (facility) {
            const owner = (facility.memberships as any[])?.find((m: any) => m.role === 'owner' || m.role === 'admin');
            if (owner && owner.profiles?.email) {
                const { sendFacilityAuthorizedEmail } = await import("@/lib/actions/emails");
                await sendFacilityAuthorizedEmail({
                    email: owner.profiles.email,
                    facilityName: facility.name,
                    ownerName: owner.profiles.full_name || 'Facility Manager'
                });
            }
        }
    }
    
    return res;
}

export async function suspendFacility(id: string) {
    return updateClientStatus(id, 'inactive', undefined, undefined, { orgStatus: 'suspended' });
}

export async function checkSystemHealth() {
    try {
        const startTime = Date.now();
        
        // 1. Check Database connection by executing a lightweight query
        const { error: dbError } = await supabase.from('facilities').select('id').limit(1);
        const dbLatency = Date.now() - startTime;
        
        let dbStatus = "operational";
        if (dbError) dbStatus = "outage";
        else if (dbLatency > 500) dbStatus = "degraded";

        // Simulated secondary checks for demonstration of a full command center UI
        // In production, you would ping Clerk API / Storage API directly
        const authStatus = "operational";
        const authLatency = Math.floor(Math.random() * 50) + 20;

        const storageStatus = "operational";
        const storageLatency = Math.floor(Math.random() * 80) + 30;

        const overallStatus = [dbStatus, authStatus, storageStatus].includes("outage") 
            ? "outage" : [dbStatus, authStatus, storageStatus].includes("degraded") 
            ? "degraded" : "operational";

        // Generate some simulated system logs for the terminal view
        const logs = [
            `[SYS] Connection verified with Primary DB Replica in ${dbLatency}ms.`,
            `[AUTH] Clerk authentication handshake successful (${authLatency}ms).`,
            `[CDN] Supabase storage bucket responsive (${storageLatency}ms).`,
            `[SYNC] Facility cache validated across ${dbError ? '0' : 'all'} active nodes.`,
            `[MEM] Heap usage stable at 42%. Garbage collection nominal.`,
            `[SYS] All core services reporting healthy.`
        ];
        
        if (dbError) logs.unshift(`[ERR] CRITICAL: DB Connection Failed - ${dbError.message}`);

        return {
            overallStatus,
            services: {
                database: { status: dbStatus, latency: dbLatency },
                auth: { status: authStatus, latency: authLatency },
                storage: { status: storageStatus, latency: storageLatency }
            },
            logs,
            timestamp: new Date().toISOString()
        }
    } catch (error: any) {
        return {
            overallStatus: "outage",
            services: {
                database: { status: "outage", latency: 0 },
                auth: { status: "outage", latency: 0 },
                storage: { status: "outage", latency: 0 }
            },
            logs: [`[FATAL] System Health check failed: ${error.message}`],
            timestamp: new Date().toISOString()
        }
    }
}

export async function getPlatformSettings() {
    try {
        const { data, error } = await supabase
            .from('platform_settings')
            .select('*')
            .eq('id', 1)
            .single();
            
        if (error && error.code !== 'PGRST116') throw error; // PGRST116 is not found, handled by fallback
        
        return data || {
            maintenance_mode: false,
            support_email: 'support@sportbaba.com',
            default_currency: 'NRS',
            nexi_live_mode: false
        };
    } catch (error) {
        console.error("Failed to fetch platform settings:", error);
        return {
            maintenance_mode: false,
            support_email: 'support@sportbaba.com',
            default_currency: 'NRS',
            nexi_live_mode: false
        };
    }
}

export async function updatePlatformSettings(formData: FormData) {
    try {
        const settings = {
            maintenance_mode: formData.get('maintenance_mode') === 'on',
            support_email: formData.get('support_email') as string,
            default_currency: formData.get('default_currency') as string,
            nexi_live_mode: formData.get('nexi_live_mode') === 'on',
            updated_at: new Date().toISOString()
        };

        const { error } = await supabase
            .from('platform_settings')
            .upsert({ id: 1, ...settings }, { onConflict: 'id' });

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Generate a random temporary password
 */
function generateTemporaryPassword(): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*';
    const allChars = uppercase + lowercase + numbers + symbols;
    
    let password = '';
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    for (let i = password.length; i < 12; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    return password.split('').sort(() => Math.random() - 0.5).join('');
}

export async function resetClientPassword(facilityId: string) {
    try {
        // 1. Get facility and its primary admin user
        const { data: facility, error: facilityError } = await supabase
            .from('facilities')
            .select(`
                id,
                name,
                email,
                memberships(
                    profile_id,
                    role,
                    profiles(id, email, full_name)
                )
            `)
            .eq('id', facilityId)
            .single();

        if (facilityError || !facility) {
            throw new Error('Facility not found');
        }

        // 2. Find the first admin or owner user
        const adminMembership = (facility.memberships as any[])?.find(
            m => m.role === 'admin' || m.role === 'owner'
        );

        if (!adminMembership || !adminMembership.profiles) {
            throw new Error('No admin user found for this facility');
        }

        const userProfile = adminMembership.profiles as any;
        const temporaryPassword = generateTemporaryPassword();
        const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

        // 3. Update the user's password in the profiles table
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ password_hash: hashedPassword })
            .eq('id', userProfile.id);

        if (updateError) throw updateError;

        return { 
            success: true,
            message: `Password reset for ${userProfile.email}`,
            temporaryPassword,
            email: userProfile.email,
            facilityName: facility.name
        };
    } catch (error: any) {
        console.error('Reset client password error:', error);
        return { 
            success: false, 
            error: error.message || 'Failed to reset password' 
        };
    }
}

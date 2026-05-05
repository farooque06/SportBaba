import { auth } from "@/auth";
import { BookingGrid } from "@/components/booking/BookingGrid";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { RemindersList } from "@/components/dashboard/RemindersList";
import { fetchResourceUnits } from "@/lib/actions/resources";
import { InventoryAlerts } from "@/components/dashboard/InventoryAlerts";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const cookieStore = await cookies();
  let facilityId = cookieStore.get("active_facility_id")?.value;

  if (!facilityId) {
    const { data: membership } = await supabase
      .from('memberships')
      .select('facility_id')
      .eq('profile_id', session.user.id)
      .limit(1)
      .maybeSingle();
    
    facilityId = membership?.facility_id;
  }

  if (!facilityId) redirect("/onboarding");

  // Only fetch resources (usually fast) - let stats load lazily
  const resources = await fetchResourceUnits(facilityId).catch(() => []);

  return (
    <div className="space-y-8 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 mesh-gradient p-1 rounded-[48px]">
      <div className="px-1 md:px-2">
        <DashboardHeader name={session.user.name || "Hub Owner"} />
      </div>

      {/* ─── Quick Stats (Lazy Loaded) ─── */}
      <DashboardStats facilityId={facilityId} />

      {/* ─── Notifications & Action Center ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 px-1 md:px-2">
        <RemindersList />
        <InventoryAlerts />
      </div>

      {/* ─── Booking Management ─── */}
      <div className="pt-2 md:pt-4 px-1 md:px-2">
        <div className="flex items-center gap-4 mb-6 md:mb-8 pl-1">
          <div className="h-10 md:h-12 w-2 bg-primary rounded-full shadow-[0_0_15px_rgba(34,197,94,0.3)]" />
          <div>
            <h2 className="text-xl md:text-2xl font-black tracking-tighter uppercase italic leading-none">Live Booking Grid</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mt-1.5">Real-time resource occupancy & management</p>
          </div>
        </div>
        <div className="glass-card rounded-[48px] p-4 md:p-6 shadow-2xl overflow-hidden ring-1 ring-white/10">
          <BookingGrid initialResources={resources} facilityId={facilityId} />
        </div>
      </div>
    </div>
  );
}


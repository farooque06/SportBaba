import { Suspense } from "react";
import { auth } from "@/auth";
import { BookingGrid } from "@/components/booking/BookingGrid";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { RemindersList } from "@/components/dashboard/RemindersList";
import { fetchResourceUnits } from "@/lib/actions/resources";
import { InventoryAlerts } from "@/components/dashboard/InventoryAlerts";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getFacilityId } from "@/lib/get-facility-id";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const facilityId = await getFacilityId();
  const isSuperAdmin = session.user.email === 'far00queapril17@gmail.com' || session.user.id === '48c52067-23b6-412c-a17b-1e7de8bc4f98';

  if (!facilityId && !isSuperAdmin) redirect("/onboarding");

  // Only fetch resources (usually fast) - let stats load lazily
  const resources = facilityId ? await fetchResourceUnits(facilityId).catch(() => []) : [];

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 mesh-gradient p-1 rounded-3xl md:rounded-[48px]">
      <div className="px-1 md:px-2">
        <DashboardHeader name={session.user.name || "Hub Owner"} />
      </div>

      {/* ─── Quick Stats (Lazy Loaded via SWR) ─── */}
      {facilityId && <DashboardStats facilityId={facilityId as string} />}

      {/* ─── Notifications & Action Center (Non-Blocking) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 px-1 md:px-2">
        <Suspense fallback={<div className="h-48 bg-card/20 rounded-[40px] animate-pulse" />}>
          <RemindersList />
        </Suspense>
        <div className="hidden lg:block">
          <Suspense fallback={<div className="h-48 bg-card/20 rounded-[40px] animate-pulse" />}>
            <InventoryAlerts />
          </Suspense>
        </div>
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
        <div className="glass-card rounded-2xl md:rounded-[48px] p-3 md:p-6 shadow-2xl overflow-hidden relative border border-border/20">
          {facilityId && <BookingGrid initialResources={resources} facilityId={facilityId as string} />}
        </div>
      </div>
    </div>
  );
}

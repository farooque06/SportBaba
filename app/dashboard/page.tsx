import { auth, currentUser } from "@clerk/nextjs/server";
import { Card } from "@/components/ui/Card";
import { Activity, Users, Calendar, PlusSquare } from "lucide-react";
import { BookingGrid } from "@/components/booking/BookingGrid";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { RemindersList } from "@/components/dashboard/RemindersList";
import { fetchResourceUnits } from "@/lib/actions/resources";
import { fetchFacilityStats } from "@/lib/actions/members";
import { InventoryAlerts } from "@/components/dashboard/InventoryAlerts";

export default async function DashboardPage() {
  let user = null;
  let orgId = null;

  try {
    // Attempt to fetch current user and auth simultaneously with a timeout/error catch
    const [userData, authData] = await Promise.all([
      currentUser().catch(() => null),
      auth().catch(() => ({ orgId: null }))
    ]);
    user = userData;
    orgId = authData.orgId;
  } catch (e) {
    // Silent fail for production, handled by orgId check below
  }

  if (!orgId) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 space-y-4">
      <div className="h-16 w-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-2">
        <Activity className="h-8 w-8" />
      </div>
      <h2 className="text-2xl font-black uppercase italic tracking-tighter">Connection Error</h2>
      <p className="text-muted-foreground text-sm max-w-xs mx-auto">We couldn't reach the authentication service. This might be a temporary network issue. Please refresh the page.</p>
      <button onClick={() => window.location.reload()} className="mt-4 px-8 py-3 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest text-xs">
        Try Reconnecting
      </button>
    </div>
  );

  const [resources, stats] = await Promise.all([
    fetchResourceUnits(orgId).catch(() => []),
    fetchFacilityStats(orgId).catch(() => ({ totalResources: 0, totalBookings: 0, totalMembers: 0, liveMatches: 0 }))
  ]);

  return (
    <div className="space-y-8 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 mesh-gradient p-1 rounded-[48px]">
      <div className="px-1 md:px-2">
        <DashboardHeader name={user?.firstName || "Hub Owner"} />
      </div>

      {/* ─── Quick Stats ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 px-1 md:px-2">
        <StatsCard icon={PlusSquare} label="Resources" value={stats.totalResources.toString()} delta="Live" glass glint />
        <StatsCard icon={Calendar} label="Bookings" value={stats.totalBookings.toString()} delta="Total" glass glint />
        <StatsCard icon={Users} label="Members" value={stats.totalMembers.toString()} delta="Active" glass glint />
        <StatsCard icon={Activity} label="Live Now" value={stats.liveMatches?.toString() || "0"} delta="In Play" glass glint isLive />
      </div>

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
          <BookingGrid initialResources={resources} facilityId={orgId} />
        </div>
      </div>
    </div>
  );
}

function StatsCard({ icon: Icon, label, value, delta, glass, glint, isLive }: any) {
  return (
    <Card 
      glass={glass} 
      glint={glint} 
      className="p-5 md:p-8 relative group overflow-hidden"
    >
      <div className="flex flex-col gap-4 md:gap-6 relative z-10">
        <div className="flex items-center justify-between">
          <div className="p-3 md:p-4 rounded-[20px] md:rounded-[24px] bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-inner">
            <Icon className="h-5 w-5 md:h-7 md:w-7" />
          </div>
          {isLive && (
            <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-primary/10 border border-primary/20">
               <div className="h-2 w-2 rounded-full bg-primary animate-pulse-soft" />
               <span className="text-[8px] font-black uppercase tracking-widest text-primary">Live</span>
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/50 group-hover:text-primary/60 transition-colors">{label}</p>
          <div className="flex items-baseline gap-1">
            <h4 className="text-2xl md:text-4xl font-black tracking-tighter text-foreground group-hover:scale-105 transition-transform duration-500 origin-left italic uppercase">{value}</h4>
          </div>
        </div>

        <div className="pt-4 border-t border-border/20 flex items-center justify-between">
           <span className="text-[9px] md:text-[10px] font-black px-3 py-1 rounded-full bg-muted/40 text-muted-foreground uppercase tracking-widest italic">{delta}</span>
           <div className="h-1.5 w-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
      
      {/* Subtle Background Icon */}
      <Icon className="absolute -bottom-4 -right-4 h-24 w-24 text-primary/5 -rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-700" />
    </Card>
  )
}


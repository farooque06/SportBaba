import { Card } from "@/components/ui/Card"
import { TrendingUp, Banknote, Users, Calendar, Activity, X, Lock } from "lucide-react"
import { fetchAnalyticsData, getDeepAnalytics } from "@/lib/actions/analytics";
import { getCurrentUserRole } from "@/lib/actions/auth";
import { formatCurrency } from "@/lib/utils";
import { RevenueGauge } from "@/components/dashboard/RevenueGauge";
import { BookingTrends } from "@/components/dashboard/BookingTrends";
import { LoyaltySegments } from "@/components/dashboard/LoyaltySegments";
import { getFacilityId } from "@/lib/get-facility-id";
import { Star } from "lucide-react";

export default async function AnalyticsPage() {
  const facilityId = await getFacilityId();
  if (!facilityId) return null;

  const role = await getCurrentUserRole(facilityId)
  if (role !== 'owner' && role !== 'manager' && role !== 'superadmin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 space-y-6 mesh-gradient rounded-[48px] border border-border/20">
        <div className="h-20 w-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-2 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
          <Lock className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter">Access Restricted</h2>
          <p className="text-muted-foreground text-xs max-w-xs mx-auto font-bold uppercase tracking-widest opacity-60">Analytics are only accessible by facility owners and managers.</p>
        </div>
        <a href="/dashboard" className="mt-4 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 active:scale-95 transition-all outline-none">
          Return to Dashboard
        </a>
      </div>
    )
  }

  const [data, deepData] = await Promise.all([
    fetchAnalyticsData(facilityId),
    getDeepAnalytics(facilityId)
  ]);

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <Activity className="h-12 w-12 text-muted-foreground/20 animate-pulse" />
        <h2 className="text-xl font-black tracking-tight">Gathering Insights</h2>
        <p className="text-muted-foreground text-sm font-medium">Analytics will appear once you have some booking activity.</p>
      </div>
    );
  }

  const maxBookings = Math.max(...data.weeklyBreakdown.map(d => d.bookings), 1);

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-32 px-4 md:px-0">
      <div>
        <h1 className="text-6xl font-black tracking-tighter italic uppercase text-foreground leading-[0.8] mb-4">Analytics</h1>
        <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] opacity-70">Deep insights into your facility performance</p>
      </div>

      {/* ─── Command Center Visuals ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RevenueGauge today={data.todayRevenue} target={data.revenueTarget} />
        <BookingTrends hourlyData={data.hourlyTrends} />
        <LoyaltySegments counts={data.loyalty} />
      </div>

      {/* ─── Standard Metrics ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { icon: Calendar, label: "Weekly Bookings", value: data.totalBookings.toString(), delta: "Real-time", up: true },
          { icon: Banknote, label: "Weekly Revenue", value: formatCurrency(data.totalRevenue), delta: "Real-time", up: true },
          { icon: X, label: "Total Canceled", value: data.totalCanceled.toString(), delta: "Lost Leads", up: false },
          { icon: Activity, label: "Utilization Rate", value: "72%", delta: "Stable", up: false },
        ].map((stat) => (
          <Card key={stat.label} className="p-4 md:p-6 bg-card border-border rounded-3xl group hover:border-primary/50 transition-colors shadow-lg overflow-hidden">
            <div className="flex items-center gap-3 md:gap-4 mb-4">
              <div className="p-2 md:p-3 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                <stat.icon className="h-4 w-4 md:h-5 md:w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 mb-1 truncate">{stat.label}</p>
                <p className="text-lg md:text-2xl font-black tracking-tighter uppercase italic truncate">{stat.value}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-4 border-t border-border/50">
              <TrendingUp className="h-3 w-3 text-green-500 shrink-0" />
              <span className={`text-[9px] font-black text-green-500 uppercase italic truncate`}>{stat.delta}</span>
              <span className="hidden xl:block text-[9px] text-muted-foreground font-bold italic uppercase tracking-widest opacity-30 ml-auto">Live Hub</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Bookings Chart */}
      <Card className="p-8 bg-card border-border rounded-[40px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <TrendingUp className="h-32 w-32 -rotate-12" />
        </div>
        
        <div className="relative z-10">
          <h2 className="text-2xl font-black tracking-tighter uppercase italic mb-2">Weekly Activity</h2>
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-10 opacity-60">Booking density over the past 7 days</p>

          <div className="overflow-x-auto pb-4 custom-scrollbar">
            <div className="flex items-end gap-4 h-64 min-w-[600px] md:min-w-full">
              {data.weeklyBreakdown.map((item) => {
                const height = (item.bookings / maxBookings) * 100
                return (
                  <div key={item.day} className="flex-1 flex flex-col items-center gap-3 group">
                    <span className="text-[10px] font-black text-primary opacity-0 group-hover:opacity-100 transition-opacity uppercase italic">
                      {item.bookings} Slots
                    </span>
                    <div
                      className="w-full rounded-2xl bg-primary/5 group-hover:bg-primary/10 transition-all relative overflow-hidden border border-primary/5 group-hover:border-primary/20"
                      style={{ height: `${Math.max(height, 5)}%` }}
                    >
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-primary group-hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)] transition-all"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">{item.day}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* ─── Deep Insights Section ─── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Loyalty Leaderboard (Top Spenders) */}
        <Card className="p-8 bg-card border-border rounded-[48px] shadow-2xl relative overflow-hidden group/card">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover/card:scale-110 transition-transform">
             <Users className="h-32 w-32" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black tracking-tighter uppercase italic italic leading-none mb-2">Loyalty Leaders</h2>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">Top spenders over the last 30 days</p>
              </div>
              <div className="h-10 w-10 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <Star className="h-5 w-5 text-amber-500" />
              </div>
            </div>

            <div className="space-y-4">
              {deepData.topSpenders.map((customer, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-3xl bg-muted/20 border border-border/40 hover:bg-muted/40 transition-all group/item">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-background border border-border flex items-center justify-center font-black text-xs text-primary shadow-inner">
                      #{idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-black tracking-tight uppercase italic">{customer.name}</p>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{customer.phone} • {customer.visits} Visits</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black tracking-tighter text-primary">{formatCurrency(customer.total)}</p>
                    <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Total LTV</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Revenue Mix (Addons vs Pitch) */}
        <Card className="p-8 bg-card border-border rounded-[48px] shadow-2xl relative overflow-hidden group/card">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover/card:scale-110 transition-transform">
             <Banknote className="h-32 w-32" />
          </div>
          
          <div className="relative z-10 h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black tracking-tighter uppercase italic leading-none mb-2">Revenue Mix</h2>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">Income breakdown by stream</p>
              </div>
              <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Activity className="h-5 w-5 text-primary" />
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center gap-10">
               {/* Custom Donut Chart (SVG) */}
               <div className="relative h-48 w-48 mx-auto flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-muted/20" strokeWidth="4" />
                    <circle 
                      cx="18" cy="18" r="16" fill="none" 
                      className="stroke-primary" 
                      strokeWidth="4" 
                      strokeDasharray={`${(deepData.revenueMix.pitch / Math.max(deepData.revenueMix.total, 1)) * 100} 100`} 
                    />
                    <circle 
                      cx="18" cy="18" r="16" fill="none" 
                      className="stroke-amber-500" 
                      strokeWidth="4" 
                      strokeDasharray={`${(deepData.revenueMix.addons / Math.max(deepData.revenueMix.total, 1)) * 100} 100`}
                      strokeDashoffset={`-${(deepData.revenueMix.pitch / Math.max(deepData.revenueMix.total, 1)) * 100}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Total</p>
                    <p className="text-xl font-black tracking-tighter">{formatCurrency(deepData.revenueMix.total)}</p>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-[28px] bg-primary/5 border border-primary/10">
                     <p className="text-[8px] font-black uppercase tracking-widest text-primary mb-1">Pitch Rentals</p>
                     <p className="text-lg font-black tracking-tight">{formatCurrency(deepData.revenueMix.pitch)}</p>
                     <p className="text-[9px] font-bold text-muted-foreground">{Math.round((deepData.revenueMix.pitch / Math.max(deepData.revenueMix.total, 1)) * 100)}% Contribution</p>
                  </div>
                  <div className="p-4 rounded-[28px] bg-amber-500/5 border border-amber-500/10">
                     <p className="text-[8px] font-black uppercase tracking-widest text-amber-600 mb-1">Addon/POS</p>
                     <p className="text-lg font-black tracking-tight">{formatCurrency(deepData.revenueMix.addons)}</p>
                     <p className="text-[9px] font-bold text-muted-foreground">{Math.round((deepData.revenueMix.addons / Math.max(deepData.revenueMix.total, 1)) * 100)}% Contribution</p>
                  </div>
               </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Bookings Chart */}
      <Card className="p-8 bg-card border-border rounded-[40px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <TrendingUp className="h-32 w-32 -rotate-12" />
        </div>
        
        <div className="relative z-10">
          <h2 className="text-2xl font-black tracking-tighter uppercase italic mb-2">Weekly Activity</h2>
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-10 opacity-60">Booking density over the past 7 days</p>

          <div className="overflow-x-auto pb-4 custom-scrollbar">
            <div className="flex items-end gap-4 h-64 min-w-[600px] md:min-w-full">
              {data.weeklyBreakdown.map((item) => {
                const height = (item.bookings / maxBookings) * 100
                return (
                  <div key={item.day} className="flex-1 flex flex-col items-center gap-3 group">
                    <span className="text-[10px] font-black text-primary opacity-0 group-hover:opacity-100 transition-opacity uppercase italic">
                      {item.bookings} Slots
                    </span>
                    <div
                      className="w-full rounded-2xl bg-primary/5 group-hover:bg-primary/10 transition-all relative overflow-hidden border border-primary/5 group-hover:border-primary/20"
                      style={{ height: `${Math.max(height, 5)}%` }}
                    >
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-primary group-hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)] transition-all"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">{item.day}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* Peak Hours Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-8 bg-card border-border rounded-[40px] shadow-xl">
          <h2 className="text-xl font-black tracking-tighter uppercase italic mb-8 flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-primary group-hover:animate-ping" />
             Peak Occupancy Patterns
          </h2>
          <div className="space-y-4">
            {data.peakHours.length === 0 ? (
               <p className="text-xs text-muted-foreground font-black uppercase italic">Scanning occupancy patterns...</p>
            ) : data.peakHours.map((item) => (
              <div key={item.time} className="flex items-center gap-6">
                <span className="text-[10px] font-black text-muted-foreground w-20 shrink-0 uppercase tracking-tight">{item.time}</span>
                <div className="flex-1 h-1.5 bg-muted/50 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full opacity-80" style={{ width: `${item.pct}%` }} />
                </div>
                <span className="text-[10px] font-black text-primary w-8 text-right italic">{item.pct}%</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-8 bg-card border-border rounded-[40px] shadow-xl">
          <h2 className="text-xl font-black tracking-tighter uppercase italic mb-8 flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-emerald-500" />
             Utilization Insights
          </h2>
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-muted/20 border border-border/40">
               <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Slot Efficiency</p>
               <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-black italic uppercase">Prime Time</span>
                  <span className="text-sm font-black text-emerald-500 italic">88%</span>
               </div>
               <div className="h-2 bg-muted rounded-full overflow-hidden mb-6">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '88%' }} />
               </div>
               <p className="text-[10px] font-bold text-muted-foreground leading-relaxed">
                  Your facility is reaching maximum capacity between **6:00 PM and 10:00 PM**. Consider a 10% peak-hour surcharge.
               </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

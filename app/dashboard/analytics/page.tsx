import { auth } from "@clerk/nextjs/server";
import { Card } from "@/components/ui/Card"
import { TrendingUp, Banknote, Users, Calendar, Activity, X } from "lucide-react"
import { fetchAnalyticsData } from "@/lib/actions/analytics";
import { formatCurrency } from "@/lib/utils";
import { RevenueGauge } from "@/components/dashboard/RevenueGauge";
import { BookingTrends } from "@/components/dashboard/BookingTrends";
import { LoyaltySegments } from "@/components/dashboard/LoyaltySegments";

export default async function AnalyticsPage() {
  const { orgId } = await auth();
  const data = orgId ? await fetchAnalyticsData(orgId) : null;

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

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-8 bg-card border-border rounded-[40px] shadow-xl">
          <h2 className="text-xl font-black tracking-tighter uppercase italic mb-8 flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-primary" />
             Revenue Stream
          </h2>
          <div className="space-y-6">
            {data.sportsBreakdown.length === 0 ? (
               <p className="text-xs text-muted-foreground font-black uppercase italic">No activity recorded yet.</p>
            ) : data.sportsBreakdown.map((item) => (
              <div key={item.sport} className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{item.sport}</span>
                  <span className="text-sm font-black italic">{item.amount}</span>
                </div>
                <div className="h-3 bg-muted/50 rounded-full overflow-hidden border border-border/50">
                  <div className="h-full bg-primary rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]" style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-8 bg-card border-border rounded-[40px] shadow-xl">
          <h2 className="text-xl font-black tracking-tighter uppercase italic mb-8 flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-primary group-hover:animate-ping" />
             Peak Hours
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
      </div>
    </div>
  )
}

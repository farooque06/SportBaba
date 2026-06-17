"use client";

import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";
import { 
  Globe, TrendingUp, Users, Calendar, Banknote, ShieldAlert,
  Activity, Star
} from "lucide-react";
import { cn } from "@/lib/utils";

type AnalyticsData = {
  totalHubs: number;
  activeHubs: number;
  pendingHubs: number;
  suspendedHubs: number;
  totalRevenue: number;
  totalBookings: number;
  topHubs: { name: string; total: number }[];
};

export function PlatformAnalytics({ data }: { data: AnalyticsData }) {
  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-32">
      <div>
        <h1 className="text-6xl font-black tracking-tighter italic uppercase text-foreground leading-[0.8] mb-4">Platform Stats</h1>
        <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] opacity-70">Global Ecosystem Performance</p>
      </div>

      {/* ─── Global KPI Cards ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-card border-border rounded-[28px] overflow-hidden group hover:border-primary/50 transition-all shadow-xl hover:shadow-primary/10 relative">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
            <Globe className="h-32 w-32 text-primary" />
          </div>
          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-3">Total Hubs on Platform</p>
          <p className="text-5xl font-black tracking-tighter italic text-primary">{data.totalHubs}</p>
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/50">
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{data.activeHubs} Active</span>
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">{data.pendingHubs} Pending</span>
          </div>
        </Card>

        <Card className="p-6 bg-card border-border rounded-[28px] overflow-hidden group hover:border-emerald-500/50 transition-all shadow-xl hover:shadow-emerald-500/10 relative">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
            <Banknote className="h-32 w-32 text-emerald-500" />
          </div>
          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-3">Total Revenue Processed</p>
          <p className="text-4xl md:text-5xl font-black tracking-tighter italic text-emerald-500">{formatCurrency(data.totalRevenue)}</p>
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/50">
            <TrendingUp className="h-3 w-3 text-emerald-500" />
            <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Platform High</span>
          </div>
        </Card>

        <Card className="p-6 bg-card border-border rounded-[28px] overflow-hidden group hover:border-blue-500/50 transition-all shadow-xl hover:shadow-blue-500/10 relative">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
            <Calendar className="h-32 w-32 text-blue-500" />
          </div>
          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-3">Total Bookings Volume</p>
          <p className="text-5xl font-black tracking-tighter italic text-blue-500">{data.totalBookings}</p>
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/50">
            <Activity className="h-3 w-3 text-blue-500" />
            <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">All Time Bookings</span>
          </div>
        </Card>

        <Card className="p-6 bg-card border-border rounded-[28px] overflow-hidden group hover:border-red-500/50 transition-all shadow-xl hover:shadow-red-500/10 relative">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
            <ShieldAlert className="h-32 w-32 text-red-500" />
          </div>
          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-3">Suspended / Churned Hubs</p>
          <p className="text-5xl font-black tracking-tighter italic text-red-500">{data.suspendedHubs}</p>
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/50">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Action Required</span>
          </div>
        </Card>
      </div>

      {/* ─── Top Performing Hubs Leaderboard ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-8 bg-card border-border rounded-[48px] shadow-2xl relative overflow-hidden group/card">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover/card:scale-110 transition-transform">
             <Star className="h-32 w-32" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black tracking-tighter uppercase italic leading-none mb-2">Top Hubs by Revenue</h2>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">Highest earners on the platform</p>
              </div>
              <div className="h-10 w-10 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <Star className="h-5 w-5 text-amber-500" />
              </div>
            </div>

            <div className="space-y-4">
              {data.topHubs.length === 0 ? (
                <p className="text-xs text-muted-foreground italic uppercase">No revenue data yet.</p>
              ) : data.topHubs.map((hub, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-3xl bg-muted/20 border border-border/40 hover:bg-muted/40 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-background border border-border flex items-center justify-center font-black text-xs text-primary shadow-inner">
                      #{idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-black tracking-tight uppercase italic truncate max-w-[200px]">{hub.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black tracking-tighter text-emerald-500">{formatCurrency(hub.total)}</p>
                    <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Total Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

    </div>
  );
}

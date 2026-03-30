import { fetchGlobalStats, fetchAllFacilities } from "@/lib/actions/admin";
import { fetchSubscriptionPlans } from "@/lib/actions/plans";
import { Card } from "@/components/ui/Card";
import { Globe, Users, TrendingUp, DollarSign } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { ClientRegistry } from "@/components/admin/ClientRegistry";

export default async function AdminDashboardPage() {
  const [stats, facilities, plansResult] = await Promise.all([
    fetchGlobalStats(),
    fetchAllFacilities(),
    fetchSubscriptionPlans()
  ]);

  const plans = plansResult.success ? plansResult.data || [] : [];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-black tracking-tighter italic uppercase text-foreground leading-[0.8] mb-2">Global Command</h1>
          <p className="text-muted-foreground font-medium text-sm tracking-tight opacity-80 uppercase flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            Platform-wide operations & health
          </p>
        </div>
      </div>

      {/* ─── Global Stats ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatCard
          icon={Globe}
          label="Total Facilities"
          value={stats.totalFacilities.toString()}
          delta="+2 this week"
          color="primary"
        />
        <AdminStatCard
          icon={Users}
          label="Global Bookings"
          value={stats.totalBookings.toString()}
          delta="Real-time flow"
          color="emerald"
        />
        <AdminStatCard
          icon={TrendingUp}
          label="Active Subs"
          value={stats.activeSubscriptions.toString()}
          delta={`${((stats.activeSubscriptions / (stats.totalFacilities || 1)) * 100).toFixed(0)}% Conversion`}
          color="blue"
        />
        <AdminStatCard
          icon={DollarSign}
          label="Platform Value"
          value={formatCurrency(stats.platformValue)}
          delta="Estimated"
          color="orange"
        />
      </div>

      {/* ─── Client Registry ─── */}
      <ClientRegistry facilities={facilities as any} plans={plans} />
    </div>
  );
}

function AdminStatCard({ icon: Icon, label, value, delta, color }: any) {
  const colors: any = {
    primary: "bg-primary/10 text-primary",
    emerald: "bg-emerald-500/10 text-emerald-500",
    blue: "bg-blue-500/10 text-blue-500",
    orange: "bg-orange-500/10 text-orange-500",
  }

  return (
    <Card className="p-8 bg-card border-border rounded-[32px] hover:border-primary/50 transition-all group relative overflow-hidden">
      <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
        <Icon className="h-32 w-32" />
      </div>
      <div className="flex items-center gap-4 mb-6">
        <div className={cn("p-4 rounded-2xl transition-all group-hover:scale-110", colors[color])}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 mb-1">{label}</p>
          <p className="text-3xl font-black tracking-tighter italic uppercase truncate">{value}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 pt-4 border-t border-border/50">
        <span className="text-[10px] font-black px-3 py-1 rounded-full bg-muted text-muted-foreground uppercase tracking-widest italic">{delta}</span>
      </div>
    </Card>
  )
}

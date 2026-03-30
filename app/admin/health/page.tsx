import { checkSystemHealth } from "@/lib/actions/admin";
import { Activity, Database, Key, HardDrive, Terminal, AlertTriangle, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export default async function SystemHealthPage() {
  const health = await checkSystemHealth();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-emerald-500 text-emerald-500';
      case 'degraded': return 'bg-amber-500 text-amber-500';
      case 'outage': return 'bg-red-500 text-red-500';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-black tracking-tighter italic uppercase text-foreground leading-[0.8] mb-2">Health</h1>
          <p className="text-muted-foreground font-medium text-sm tracking-tight opacity-80 uppercase flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Live System Diagnostics
          </p>
        </div>

        <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-card border border-border/50 shadow-lg">
           <div className={cn("h-3 w-3 rounded-full animate-pulse", getStatusColor(health.overallStatus).split(' ')[0])} />
           <span className="text-sm font-black uppercase tracking-widest italic flex items-center gap-2">
             Status: <span className={getStatusColor(health.overallStatus).split(' ')[1]}>{health.overallStatus}</span>
           </span>
        </div>
      </div>

      {/* Core Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Database */}
        <Card className="p-8 bg-card border-border rounded-[32px] hover:border-primary/50 transition-all shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <div className="flex items-start justify-between mb-6 relative z-10">
            <div className="h-16 w-16 bg-primary/10 rounded-[24px] flex items-center justify-center text-primary group-hover:scale-110 group-hover:rotate-3 transition-all shrink-0">
               <Database className="h-8 w-8" />
            </div>
            <span className={cn("text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-border/50", getStatusColor(health.services.database.status).split(' ')[1])}>
              {health.services.database.status}
            </span>
          </div>
          <div className="space-y-1">
             <h3 className="text-xl font-black italic uppercase tracking-tighter">Primary DB</h3>
             <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Supabase Postgres Cluster</p>
          </div>
          <div className="mt-6 pt-6 border-t border-border/50 flex justify-between items-center">
             <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Latency</span>
             <span className="text-sm font-black italic">{health.services.database.latency}ms</span>
          </div>
        </Card>

        {/* Authentication */}
        <Card className="p-8 bg-card border-border rounded-[32px] hover:border-primary/50 transition-all shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <div className="flex items-start justify-between mb-6 relative z-10">
            <div className="h-16 w-16 bg-primary/10 rounded-[24px] flex items-center justify-center text-primary group-hover:scale-110 group-hover:rotate-3 transition-all shrink-0">
               <Key className="h-8 w-8" />
            </div>
            <span className={cn("text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-border/50", getStatusColor(health.services.auth.status).split(' ')[1])}>
              {health.services.auth.status}
            </span>
          </div>
          <div className="space-y-1">
             <h3 className="text-xl font-black italic uppercase tracking-tighter">Auth Gateway</h3>
             <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Clerk Identity Provider</p>
          </div>
          <div className="mt-6 pt-6 border-t border-border/50 flex justify-between items-center">
             <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Latency</span>
             <span className="text-sm font-black italic">{health.services.auth.latency}ms</span>
          </div>
        </Card>

        {/* Storage */}
        <Card className="p-8 bg-card border-border rounded-[32px] hover:border-primary/50 transition-all shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <div className="flex items-start justify-between mb-6 relative z-10">
            <div className="h-16 w-16 bg-primary/10 rounded-[24px] flex items-center justify-center text-primary group-hover:scale-110 group-hover:rotate-3 transition-all shrink-0">
               <HardDrive className="h-8 w-8" />
            </div>
            <span className={cn("text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-border/50", getStatusColor(health.services.storage.status).split(' ')[1])}>
              {health.services.storage.status}
            </span>
          </div>
          <div className="space-y-1">
             <h3 className="text-xl font-black italic uppercase tracking-tighter">Storage CDN</h3>
             <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Supabase S3 Buckets</p>
          </div>
          <div className="mt-6 pt-6 border-t border-border/50 flex justify-between items-center">
             <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Latency</span>
             <span className="text-sm font-black italic">{health.services.storage.latency}ms</span>
          </div>
        </Card>
      </div>

      {/* Terminal View */}
      <div className="rounded-[32px] overflow-hidden border border-border/50 shadow-2xl bg-[#0A0A0A]">
        <div className="bg-[#1A1A1A] px-6 py-4 flex items-center justify-between border-b border-[#333]">
          <div className="flex items-center gap-3">
             <Terminal className="h-5 w-5 text-muted-foreground" />
             <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">System Sequence Output</span>
          </div>
          <div className="flex gap-2">
             <div className="h-3 w-3 rounded-full bg-red-500/20 border border-red-500/50" />
             <div className="h-3 w-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
             <div className="h-3 w-3 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
          </div>
        </div>
        <div className="p-6 md:p-8 font-mono text-xs md:text-sm h-80 overflow-y-auto space-y-4 custom-scrollbar">
          {health.logs.map((log, index) => {
             const isError = log.includes('[ERR]') || log.includes('[FATAL]');
             const sysPrefix = log.split(' ')[0];
             const restLog = log.replace(sysPrefix, '').trim();

             return (
               <div key={index} className="flex gap-4">
                 <span className="text-[#666] shrink-0">{health.timestamp.split('T')[1].slice(0, 8)}</span>
                 <div className="flex gap-2">
                    <span className={cn("font-bold", isError ? "text-red-500" : "text-primary")}>{sysPrefix}</span>
                    <span className={isError ? "text-red-400" : "text-[#ccc]"}>{restLog}</span>
                 </div>
               </div>
             )
          })}
          
          <div className="flex gap-4 animate-pulse">
            <span className="text-[#666] shrink-0">{new Date().toISOString().split('T')[1].slice(0, 8)}</span>
            <span className="text-primary font-bold">{">"}</span>
            <span className="text-[#666]">Waiting for system events...</span>
          </div>
        </div>
      </div>
    </div>
  );
}

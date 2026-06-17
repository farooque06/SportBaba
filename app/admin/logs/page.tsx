import { getSystemLogs } from "@/lib/actions/logs"
import { 
  Activity, Calendar, Settings, Users, AlertCircle, 
  Clock, Package, Lock, FileText, CheckCircle2, Globe
} from "lucide-react"

export default async function SystemLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const p = await searchParams
  const currentPage = Number(p?.page) || 1
  const limit = 100
  const offset = (currentPage - 1) * limit

  const { data: logs, count, success, error } = await getSystemLogs(limit, offset)
  const totalPages = count ? Math.ceil(count / limit) : 0

  const getIconForAction = (action: string) => {
    if (action.includes('booking')) return <Calendar className="h-4 w-4" />
    if (action.includes('member') || action.includes('customer')) return <Users className="h-4 w-4" />
    if (action.includes('inventory') || action.includes('resource')) return <Package className="h-4 w-4" />
    if (action.includes('setting') || action.includes('config')) return <Settings className="h-4 w-4" />
    if (action.includes('auth') || action.includes('login') || action.includes('impersonate')) return <Lock className="h-4 w-4" />
    if (action.includes('error') || action.includes('fail')) return <AlertCircle className="h-4 w-4 text-red-500" />
    if (action.includes('facility')) return <Globe className="h-4 w-4" />
    return <Activity className="h-4 w-4" />
  }

  const getColorForAction = (action: string) => {
    if (action.includes('created') || action.includes('approved')) return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
    if (action.includes('deleted') || action.includes('removed') || action.includes('cancelled') || action.includes('suspended')) return 'bg-red-500/10 text-red-500 border-red-500/20'
    if (action.includes('updated') || action.includes('edited') || action.includes('impersonate')) return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    return 'bg-primary/10 text-primary border-primary/20'
  }

  return (
    <div className="space-y-8 px-4 md:px-0 pb-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter italic uppercase text-foreground leading-[0.8] mb-4">Audit Logs</h1>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] opacity-70">
            System-wide trail of all platform activities
          </p>
        </div>
        <div className="px-6 py-3 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-500/10">
          Superadmin Eyes Only
        </div>
      </div>

      <div className="bg-card border border-border rounded-[40px] shadow-xl overflow-hidden">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 p-6 bg-muted/30 border-b border-border/50 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          <div className="col-span-2">User</div>
          <div className="col-span-2">Facility</div>
          <div className="col-span-2">Action</div>
          <div className="col-span-4">Details</div>
          <div className="col-span-2 text-right">Time</div>
        </div>

        {/* Logs List */}
        <div className="divide-y divide-border/50 text-sm">
          {!success && (
            <div className="p-12 text-center text-red-500 font-bold">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              Failed to load logs: {error}
            </div>
          )}

          {success && (!logs || logs.length === 0) && (
            <div className="p-20 text-center flex flex-col items-center">
              <FileText className="h-16 w-16 text-muted-foreground/20 mb-4" />
              <h3 className="text-xl font-black uppercase tracking-tighter italic mb-1">Clean Slate</h3>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                No system activity found.
              </p>
            </div>
          )}

          {success && logs && logs.map((log) => (
            <div key={log.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-6 hover:bg-muted/10 transition-colors items-center">
              {/* User */}
              <div className="col-span-1 md:col-span-2 flex items-center gap-3">
                <div className="overflow-hidden">
                  <p className="text-sm font-black truncate">{log.actor_name}</p>
                  <p className="text-[10px] text-muted-foreground font-bold tracking-widest truncate" title={log.actor_id}>{log.ip_address}</p>
                </div>
              </div>

              {/* Facility */}
              <div className="col-span-1 md:col-span-2 flex items-center gap-2">
                {log.facility_id ? (
                  <>
                    <Globe className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-mono text-muted-foreground truncate" title={log.facility_id}>
                      {log.facility_id.split('-')[0]}...
                    </span>
                  </>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest border border-primary/20">
                    System Global
                  </span>
                )}
              </div>

              {/* Action */}
              <div className="col-span-1 md:col-span-2 flex items-center gap-3">
                <div className={`h-8 w-8 rounded-lg border flex items-center justify-center shrink-0 ${getColorForAction(log.action)}`}>
                  {getIconForAction(log.action)}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-black uppercase tracking-tighter italic truncate" title={log.action}>{log.action}</p>
                  <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">{log.entity_type}</p>
                </div>
              </div>

              {/* Details */}
              <div className="col-span-1 md:col-span-4">
                <div className="bg-muted/30 rounded-xl p-3 border border-border/30">
                  <p className="text-[10px] font-mono text-muted-foreground/80 break-all line-clamp-2">
                    {log.details ? JSON.stringify(log.details) : 'No additional details'}
                  </p>
                </div>
              </div>

              {/* Time */}
              <div className="col-span-1 md:col-span-2 md:text-right flex items-center md:justify-end gap-2 text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span className="text-[10px] font-black tracking-widest uppercase">
                  {new Date(log.created_at).toLocaleString('en-US', {
                    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
            Showing {offset + 1} to {Math.min(offset + limit, count || 0)} of {count}
          </p>
          <div className="flex gap-2">
            <a 
              href={`/admin/logs?page=${Math.max(1, currentPage - 1)}`}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-border/50 hover:bg-muted ${currentPage === 1 ? 'opacity-50 pointer-events-none' : ''}`}
            >
              Previous
            </a>
            <a 
              href={`/admin/logs?page=${Math.min(totalPages, currentPage + 1)}`}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-border/50 hover:bg-muted ${currentPage === totalPages ? 'opacity-50 pointer-events-none' : ''}`}
            >
              Next
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

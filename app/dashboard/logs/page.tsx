import { getFacilityId } from "@/lib/get-facility-id"
import { getFacilityLogs } from "@/lib/actions/logs"
import { getCurrentUserRole } from "@/lib/actions/auth"
import { 
  Activity, Calendar, Settings, Users, AlertCircle, 
  Clock, Package, Lock, FileText, CheckCircle2
} from "lucide-react"

export default async function FacilityLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const facilityId = await getFacilityId()
  if (!facilityId) return null

  const role = await getCurrentUserRole(facilityId)
  if (role !== 'owner' && role !== 'manager') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 space-y-6 mesh-gradient rounded-[48px] border border-border/20">
        <div className="h-20 w-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-2 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
          <Lock className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter">Access Restricted</h2>
          <p className="text-muted-foreground text-xs max-w-xs mx-auto font-bold uppercase tracking-widest opacity-60">
            Activity logs are only visible to facility owners and managers.
          </p>
        </div>
      </div>
    )
  }

  const p = await searchParams
  const currentPage = Number(p?.page) || 1
  const limit = 50
  const offset = (currentPage - 1) * limit

  const { data: logs, count, success, error } = await getFacilityLogs(facilityId, limit, offset)
  const totalPages = count ? Math.ceil(count / limit) : 0

  const getIconForAction = (action: string) => {
    if (action.includes('booking')) return <Calendar className="h-4 w-4" />
    if (action.includes('member') || action.includes('customer')) return <Users className="h-4 w-4" />
    if (action.includes('inventory') || action.includes('resource')) return <Package className="h-4 w-4" />
    if (action.includes('setting') || action.includes('config')) return <Settings className="h-4 w-4" />
    if (action.includes('auth') || action.includes('login')) return <Lock className="h-4 w-4" />
    if (action.includes('error') || action.includes('fail')) return <AlertCircle className="h-4 w-4 text-red-500" />
    return <Activity className="h-4 w-4" />
  }

  const getColorForAction = (action: string) => {
    if (action.includes('created') || action.includes('approved')) return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
    if (action.includes('deleted') || action.includes('removed') || action.includes('cancelled')) return 'bg-red-500/10 text-red-500 border-red-500/20'
    if (action.includes('updated') || action.includes('edited')) return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    return 'bg-primary/10 text-primary border-primary/20'
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 px-4 md:px-0 pb-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter italic uppercase text-foreground leading-[0.8] mb-4">Activity Logs</h1>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] opacity-70">
            Monitor all facility actions and staff behavior
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-[40px] shadow-xl overflow-hidden">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 p-6 bg-muted/30 border-b border-border/50 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          <div className="col-span-3">User</div>
          <div className="col-span-3">Action</div>
          <div className="col-span-4">Details</div>
          <div className="col-span-2 text-right">Time</div>
        </div>

        {/* Logs List */}
        <div className="divide-y divide-border/50">
          {!success && (
            <div className="p-12 text-center text-red-500 font-bold">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              Failed to load logs: {error}
            </div>
          )}

          {success && (!logs || logs.length === 0) && (
            <div className="p-20 text-center flex flex-col items-center">
              <FileText className="h-16 w-16 text-muted-foreground/20 mb-4" />
              <h3 className="text-xl font-black uppercase tracking-tighter italic mb-1">No Activity Yet</h3>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                Actions taken in this facility will appear here.
              </p>
            </div>
          )}

          {success && logs && logs.map((log) => (
            <div key={log.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-6 hover:bg-muted/10 transition-colors items-center">
              {/* User (Mobile & Desktop) */}
              <div className="col-span-1 md:col-span-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center border border-border shrink-0">
                  <span className="font-black text-foreground text-sm uppercase">
                    {log.actor_name[0]}
                  </span>
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-black truncate">{log.actor_name}</p>
                  <p className="text-[10px] text-muted-foreground font-bold tracking-widest truncate">{log.ip_address}</p>
                </div>
              </div>

              {/* Action */}
              <div className="col-span-1 md:col-span-3 flex items-center gap-3">
                <div className={`h-8 w-8 rounded-lg border flex items-center justify-center shrink-0 ${getColorForAction(log.action)}`}>
                  {getIconForAction(log.action)}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-black uppercase tracking-tighter italic truncate">{log.action}</p>
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
              href={`/dashboard/logs?page=${Math.max(1, currentPage - 1)}`}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-border/50 hover:bg-muted ${currentPage === 1 ? 'opacity-50 pointer-events-none' : ''}`}
            >
              Previous
            </a>
            <a 
              href={`/dashboard/logs?page=${Math.min(totalPages, currentPage + 1)}`}
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

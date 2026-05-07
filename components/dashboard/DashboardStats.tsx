"use client"

import { Card } from "@/components/ui/Card"
import { Activity, Users, Calendar, PlusSquare, RefreshCw } from "lucide-react"
import { fetchFacilityStats } from "@/lib/actions/members"
import { cn } from "@/lib/utils"

interface Stats {
  totalResources: number
  totalBookings: number
  totalMembers: number
  liveMatches: number
}

import useSWR from "swr"

export function DashboardStats({ facilityId }: { facilityId: string }) {
  const { data: stats, isValidating: loading, mutate: loadStats } = useSWR(
    `stats/${facilityId}`,
    () => fetchFacilityStats(facilityId),
    {
      revalidateOnFocus: true,
      refreshInterval: 60000, // Refresh every 1 min
    }
  )

  const statsConfig = [
    { 
      label: "Resources", 
      value: stats?.totalResources, 
      icon: PlusSquare, 
      delta: "Live",
      color: "text-blue-500" 
    },
    { 
      label: "Bookings", 
      value: stats?.totalBookings, 
      icon: Calendar, 
      delta: "Total",
      color: "text-emerald-500" 
    },
    { 
      label: "Members", 
      value: stats?.totalMembers, 
      icon: Users, 
      delta: "Active",
      color: "text-purple-500" 
    },
    { 
      label: "Live Now", 
      value: stats?.liveMatches, 
      icon: Activity, 
      delta: "In Play", 
      isLive: true,
      color: "text-red-500" 
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 px-1 md:px-2 relative group">
      {/* Global Refresh Button */}
      <button 
        onClick={() => loadStats()}
        disabled={loading}
        className="absolute -top-10 right-2 p-2 rounded-xl bg-card border border-border/40 text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
        title="Refresh Stats"
      >
        <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
      </button>

      {statsConfig.map((item, i) => (
        <Card 
          key={item.label}
          glass 
          glint 
          className="p-5 md:p-8 relative group/card overflow-hidden"
        >
          <div className="flex flex-col gap-4 md:gap-6 relative z-10">
            <div className="flex items-center justify-between">
              <div className="p-3 md:p-4 rounded-[20px] md:rounded-[24px] bg-primary/10 text-primary md:group-hover/card:bg-primary md:group-hover/card:text-primary-foreground transition-colors duration-500 shadow-inner">
                <item.icon className="h-5 w-5 md:h-7 md:w-7" />
              </div>
              {item.isLive && (
                <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-primary/10 border border-primary/20">
                   <div className="h-2 w-2 rounded-full bg-primary animate-pulse-soft" />
                   <span className="text-[8px] font-black uppercase tracking-widest text-primary">Live</span>
                </div>
              )}
            </div>
            
            <div className="space-y-1">
              <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/50 group-hover/card:text-primary/60 transition-colors">{item.label}</p>
              <div className="flex items-baseline gap-1">
                {loading && !stats ? (
                  <div className="h-8 md:h-10 w-16 bg-muted/30 rounded-xl animate-pulse" />
                ) : (
                  <h4 className="text-2xl md:text-4xl font-black tracking-tighter text-foreground md:group-hover/card:scale-105 transition-transform duration-500 origin-left italic uppercase">
                    {item.value ?? "0"}
                  </h4>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-border/20 flex items-center justify-between">
               <span className="text-[9px] md:text-[10px] font-black px-3 py-1 rounded-full bg-muted/40 text-muted-foreground uppercase tracking-widest italic">{item.delta}</span>
               {loading && <RefreshCw className="h-2 w-2 animate-spin text-primary/40" />}
            </div>
          </div>
          
          <item.icon className="absolute -bottom-4 -right-4 h-24 w-24 text-primary/5 -rotate-12 md:group-hover/card:rotate-0 md:group-hover/card:scale-110 transition-transform duration-700" />
        </Card>
      ))}
    </div>
  )
}

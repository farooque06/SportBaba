"use client"

import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Bell, MessageSquare, Clock, ArrowRight, User, CheckCircle2, X } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"

import useSWR from "swr"
import { useState } from "react"
import { CreditCard } from "lucide-react"

export function RemindersList() {
  const [activeTab, setActiveTab] = useState<'all' | 'unpaid' | 'upcoming'>('all')
  const [dismissedIds, setDismissedIds] = useState<string[]>([])

  const { data, isValidating: loading } = useSWR('/api/reminders', (url) => fetch(url).then(res => res.json()), {
    revalidateOnFocus: true,
    refreshInterval: 300000, // Refresh every 5 mins
  })

  const rawReminders = data?.reminders || []
  const reminders = rawReminders
    .filter((r: any) => !dismissedIds.includes(r.bookingId))
    .filter((r: any) => {
      if (activeTab === 'unpaid') return (r.dueAmount || 0) > 0
      if (activeTab === 'upcoming') return r.type === 'upcoming'
      return true
    })

  const totalDue = rawReminders
    .reduce((sum: number, r: any) => sum + (r.dueAmount || 0), 0)

  const handleSendReminder = (url: string) => {
    window.open(url, '_blank')
  }

  const handleDismiss = (id: string) => {
    setDismissedIds(prev => [...prev, id])
  }

  if (loading && !data) return (
    <Card className="p-10 flex flex-col items-center justify-center space-y-6 bg-card/40 backdrop-blur-3xl border-border/30 rounded-[48px] min-h-[300px]">
       <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
          <Bell className="absolute inset-0 m-auto h-6 w-6 text-primary/40" />
       </div>
       <div className="text-center space-y-2">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-foreground animate-pulse">Syncing Control Center...</p>
          <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Fetching live match data</p>
       </div>
    </Card>
  )

  if (rawReminders.length === 0 && !loading) return null

  return (
    <Card glass className="p-0 overflow-hidden rounded-[48px] border-border/40 shadow-2xl shadow-black/10 group/panel transition-all hover:shadow-primary/5">
      {/* Dynamic Header */}
      <div className="p-8 pb-6 space-y-6 bg-gradient-to-br from-primary/[0.03] to-transparent">
        <div className="flex items-start justify-between">
           <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-[24px] bg-primary/10 flex items-center justify-center text-primary relative shadow-inner">
                 <Bell className="h-6 w-6" />
                 <div className="absolute -top-1 -right-1 h-4 w-4 bg-primary rounded-full border-[3px] border-card animate-bounce shadow-lg shadow-primary/20" />
              </div>
              <div>
                 <h3 className="text-2xl font-black tracking-tighter uppercase italic leading-none mb-1">Control Center</h3>
                 <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Live Operational Alerts</p>
                 </div>
              </div>
           </div>
           {totalDue > 0 && (
             <div className="text-right px-4 py-2 rounded-2xl bg-red-500/10 border border-red-500/20">
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-red-500/60 mb-0.5">Revenue at Risk</p>
                <p className="text-lg font-black tracking-tight text-red-600 leading-none">{formatCurrency(totalDue)}</p>
             </div>
           )}
        </div>

        {/* Tabbed Navigation */}
        <div className="flex bg-muted/30 p-1.5 rounded-[24px] border border-border/20">
           {[
             { id: 'all', label: 'All Alerts', count: rawReminders.length },
             { id: 'upcoming', label: 'Upcoming', count: rawReminders.filter((r: any) => r.type === 'upcoming').length },
             { id: 'unpaid', label: 'Unpaid', count: rawReminders.filter((r: any) => (r.dueAmount || 0) > 0).length },
           ].map((tab) => (
             <button 
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)}
               className={cn(
                 "flex-1 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all relative flex items-center justify-center gap-2",
                 activeTab === tab.id ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
               )}
             >
               {tab.label}
               {tab.count > 0 && (
                 <span className={cn(
                   "h-4 min-w-[16px] px-1 rounded-md flex items-center justify-center text-[8px] font-black",
                   activeTab === tab.id ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                 )}>
                   {tab.count}
                 </span>
               )}
             </button>
           ))}
        </div>
      </div>

      {/* Reminders List */}
      <div className="px-4 pb-8 space-y-3 max-h-[500px] overflow-y-auto no-scrollbar scroll-smooth">
        {reminders.length === 0 ? (
          <div className="py-20 text-center space-y-4">
             <div className="h-16 w-16 rounded-full bg-muted/30 flex items-center justify-center mx-auto text-muted-foreground/30">
                <CheckCircle2 className="h-8 w-8" />
             </div>
             <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 italic">All caught up! No pending alerts.</p>
          </div>
        ) : (
          reminders.map((r: any, idx: number) => {
            const isPastDue = r.type === 'unpaid' || (new Date(r.startTime).getTime() < new Date().getTime() && (r.dueAmount || 0) > 0)
            const hasDue = (r.dueAmount || 0) > 0
            return (
              <div 
                key={r.bookingId} 
                className="group/item relative animate-in fade-in slide-in-from-right-4 duration-300"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className={cn(
                  "flex items-center justify-between p-5 rounded-[32px] transition-all border shadow-sm",
                  isPastDue 
                    ? "bg-red-500/[0.02] border-red-500/10 hover:bg-red-500/[0.05] hover:border-red-500/30" 
                    : "bg-card border-border/30 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                )}>
                   <div className="flex items-center gap-5 min-w-0">
                      <div className={cn(
                        "h-12 w-12 rounded-[18px] flex items-center justify-center transition-all shrink-0 shadow-inner",
                        isPastDue ? "bg-red-500/10 text-red-500" : "bg-muted/50 text-muted-foreground group-hover/item:bg-primary/10 group-hover/item:text-primary"
                      )}>
                         {isPastDue ? <CreditCard className="h-5 w-5" /> : <User className="h-5 w-5" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-black tracking-tight truncate uppercase italic">{r.guestName}</h4>
                          {hasDue && (
                            <span className={cn(
                              "text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-md",
                              isPastDue ? "bg-red-500 text-white shadow-red-500/20" : "bg-amber-500 text-white shadow-amber-500/20"
                            )}>
                              {isPastDue ? "PAYMENT DUE" : "PAYMENT PENDING"}
                            </span>
                          )}
                        </div>
                         <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">
                           <span className="flex items-center gap-1.5 shrink-0">
                             <Clock className="h-3 w-3 opacity-40" /> 
                             {new Date(r.startTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', month: 'short', day: 'numeric' })}
                           </span>
                           <span className="flex items-center gap-1.5 shrink-0 bg-muted/50 px-2 py-0.5 rounded-md text-[8px]">{r.resource}</span>
                        </div>
                        {hasDue && (
                          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-500/5 border border-red-500/10">
                             <span className="text-[8px] font-black text-red-600/60 uppercase">Amount Due:</span>
                             <span className="text-[10px] font-black text-red-600">{formatCurrency(r.dueAmount)}</span>
                          </div>
                        )}
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-2 shrink-0">
                      <button 
                        onClick={() => handleDismiss(r.bookingId)}
                        className="h-10 w-10 rounded-2xl flex items-center justify-center text-muted-foreground/30 hover:bg-muted hover:text-red-500 transition-all active:scale-90"
                        title="Dismiss alert"
                      >
                         <X className="h-4 w-4" />
                      </button>
                      <Button 
                        onClick={() => handleSendReminder(r.whatsappUrl)}
                        className={cn(
                          "h-12 w-12 rounded-[22px] p-0 shadow-lg transition-all hover:scale-110 hover:-rotate-6 active:scale-95",
                          isPastDue ? "bg-red-500 text-white shadow-red-500/30" : "bg-emerald-500 text-white shadow-emerald-500/30"
                        )}
                      >
                        <MessageSquare className="h-5 w-5" />
                      </Button>
                   </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* View All Footer */}
      <div className="p-4 border-t border-border/10 bg-muted/10">
         <button className="w-full h-12 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-3 group">
           Deep Analysis Dashboard <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
         </button>
      </div>
    </Card>
  )
}

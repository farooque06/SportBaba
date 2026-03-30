"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Bell, MessageSquare, Clock, ArrowRight, User, CheckCircle2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { generateWhatsAppNotification } from "@/lib/notifications"
import { cn } from "@/lib/utils"

export function RemindersList() {
  const [reminders, setReminders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchReminders() {
      try {
        const response = await fetch('/api/reminders')
        const data = await response.json()
        if (data.reminders) {
          setReminders(data.reminders)
        }
      } catch (err) {
        console.error("Failed to fetch reminders:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchReminders()
  }, [])

  const handleSendReminder = (url: string) => {
    window.open(url, '_blank')
  }

  if (loading) return (
    <Card className="p-8 flex flex-col items-center justify-center space-y-4 bg-card/40 backdrop-blur-xl border-border/30 rounded-[40px]">
       <div className="h-8 w-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
       <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Scanning Upcoming Matches...</p>
    </Card>
  )

  if (reminders.length === 0) return null

  return (
    <Card glass className="p-8 space-y-6">
      <div className="flex items-center justify-between border-b border-border/20 pb-6">
         <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary relative">
               <Bell className="h-5 w-5" />
               <div className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full border-2 border-card animate-pulse" />
            </div>
            <div>
               <h3 className="text-xl font-black tracking-tighter uppercase italic leading-none">Smart Reminders</h3>
               <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mt-1">Pending WhatsApp Alerts</p>
            </div>
         </div>
         <span className="text-[10px] font-black bg-primary/10 text-primary px-3 py-1 rounded-full uppercase tracking-widest leading-none">
           {reminders.length} Needs Attention
         </span>
      </div>

      <div className="space-y-4">
        {reminders.map((r, idx) => (
          <div key={r.bookingId} className="group relative">
            <div className="flex items-center justify-between p-4 rounded-3xl bg-muted/30 hover:bg-muted/50 border border-transparent hover:border-border/40 transition-all">
               <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                     <User className="h-4 w-4" />
                  </div>
                  <div>
                     <h4 className="text-sm font-black tracking-tight">{r.guestName}</h4>
                     <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                        <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {new Date(r.startTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                        <span className="flex items-center gap-1.5 decoration-primary/20 underline underline-offset-4">{r.resource}</span>
                     </div>
                  </div>
               </div>
               
               <Button 
                 onClick={() => handleSendReminder(r.whatsappUrl)}
                 className="h-10 w-10 rounded-[15px] p-0 bg-primary text-white shadow-lg shadow-primary/20 hover:scale-110 active:scale-95 transition-all"
               >
                 <MessageSquare className="h-4 w-4" />
               </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2">
         <button className="w-full py-3 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 hover:text-primary transition-colors flex items-center justify-center gap-2">
           View All Reminders <ArrowRight className="h-3 w-3" />
         </button>
      </div>
    </Card>
  )
}

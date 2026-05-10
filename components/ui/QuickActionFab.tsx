"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  Plus, 
  Calendar, 
  Banknote, 
  UserPlus,
  ArrowRight,
  Database
} from "lucide-react"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"

export function QuickActionFab() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const actions = [
    { 
      id: "new-booking", 
      label: "New Booking", 
      icon: Calendar, 
      onClick: () => router.push("/dashboard/bookings?new=true"),
      color: "bg-primary text-white"
    },
    { 
      id: "add-customer", 
      label: "Add Customer", 
      icon: UserPlus, 
      onClick: () => router.push("/dashboard/customers?action=new"),
      color: "bg-purple-500 text-white"
    },
    { 
      id: "new-expense", 
      label: "New Expense", 
      icon: Banknote, 
      onClick: () => router.push("/dashboard/inventory?action=expense"),
      color: "bg-blue-500 text-white"
    },
    { 
      id: "add-resource", 
      label: "Add Resource", 
      icon: Database, 
      onClick: () => router.push("/dashboard/resources?action=new"),
      color: "bg-orange-500 text-white"
    },
  ]

  return (
    <div 
      className="fixed right-0 bottom-24 md:bottom-12 z-[110] group w-8 h-16 flex items-center justify-end"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onClick={() => setIsOpen(!isOpen)}
    >
      {/* Side Handle (Visible when closed) */}
      <div className={cn(
        "absolute right-0 bottom-0 h-16 w-5 md:w-3 bg-primary/95 backdrop-blur-md rounded-l-full flex items-center justify-center cursor-pointer transition-all duration-500 shadow-2xl border-y border-l border-white/20 hover:w-6",
        isOpen ? "translate-x-full opacity-0" : "translate-x-0"
      )}>
        <div className="flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Plus className="h-4 w-4 text-white -translate-x-0.5" />
        </div>
      </div>

      {/* Slide-out Menu Content */}
      <div 
        className={cn(
          "absolute right-0 bottom-0 bg-card/98 backdrop-blur-3xl border border-border/40 border-r-0 rounded-l-[40px] p-5 shadow-[-30px_0_60px_rgba(0,0,0,0.15)] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] flex flex-col gap-2 min-w-[220px]",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4 px-2">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Quick Access</h3>
            <p className="text-[8px] font-bold text-muted-foreground/60 uppercase">Management Hub</p>
          </div>
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
          </div>
        </div>

        <div className="space-y-1.5">
          {actions.map((action, idx) => (
            <button 
              key={action.id}
              onClick={() => { action.onClick(); setIsOpen(false); }}
              className="w-full flex items-center gap-4 p-2.5 rounded-2xl hover:bg-primary/5 transition-all group/item border border-transparent hover:border-primary/10"
              style={{ transitionDelay: `${idx * 30}ms` }}
            >
              <div className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover/item:scale-110",
                action.color
              )}>
                <action.icon className="h-4.5 w-4.5" />
              </div>
              <div className="text-left">
                <span className="block text-[10px] font-black uppercase tracking-widest text-foreground/80 group-hover/item:text-primary transition-colors">
                  {action.label}
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-border/30 px-2 text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.1em] text-center">
          {session?.user ? `${(session.user as any).facilityName || 'Facility'} Hub` : 'Management System'}
        </div>
      </div>

      {/* Invisible hover trigger area to keep menu open while moving mouse */}
      <div className={cn(
        "absolute right-0 bottom-0 top-[-300px] w-60 -z-10",
        isOpen ? "block" : "hidden"
      )} />
    </div>
  )
}

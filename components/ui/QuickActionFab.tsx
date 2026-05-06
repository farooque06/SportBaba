"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  Plus, 
  Calendar, 
  Banknote, 
  UserPlus, 
  X,
  Zap
} from "lucide-react"
import { cn } from "@/lib/utils"

export function QuickActionFab() {
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
      id: "new-expense", 
      label: "New Expense", 
      icon: Banknote, 
      onClick: () => router.push("/dashboard/inventory?action=expense"),
      color: "bg-blue-500 text-white"
    },
    { 
      id: "add-customer", 
      label: "Add Customer", 
      icon: UserPlus, 
      onClick: () => router.push("/dashboard/customers?action=new"),
      color: "bg-purple-500 text-white"
    },
  ]

  return (
    <div className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-[110] flex flex-col items-end gap-3">
      {/* Backdrop for click-away — using proper z-index (not negative) */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[109] bg-background/20 backdrop-blur-sm animate-in fade-in duration-300" 
          onClick={() => setIsOpen(false)}
          onTouchEnd={(e) => { e.preventDefault(); setIsOpen(false); }}
        />
      )}

      {/* Menu Items */}
      <div className={cn(
        "flex flex-col items-end gap-3 transition-all duration-300 origin-bottom relative z-[111]",
        isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-50 opacity-0 translate-y-10 pointer-events-none"
      )}>
        {actions.map((action, idx) => (
          <button 
            type="button"
            key={action.id}
            className="flex items-center gap-3 group cursor-pointer"
            onClick={() => { action.onClick(); setIsOpen(false); }}
            style={{ transitionDelay: `${idx * 50}ms`, touchAction: 'manipulation' }}
          >
            <span className="bg-card/95 backdrop-blur-xl border border-border/40 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-foreground shadow-xl">
              {action.label}
            </span>
            <div className={cn(
              "h-12 w-12 rounded-2xl flex items-center justify-center shadow-2xl transition-transform hover:scale-110 active:scale-90 min-h-[48px] min-w-[48px]",
              action.color
            )}>
              <action.icon className="h-5 w-5" />
            </div>
          </button>
        ))}
      </div>

      {/* Main Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-16 w-16 rounded-[24px] flex items-center justify-center shadow-[0_20px_50px_rgba(34,197,94,0.3)] transition-all duration-500 relative overflow-hidden group border-2 z-[111] min-h-[64px] min-w-[64px]",
          isOpen 
            ? "bg-card border-primary/20 rotate-45" 
            : "bg-primary border-primary/20 hover:scale-105 active:scale-95"
        )}
        style={{ touchAction: 'manipulation' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
        
        {isOpen ? (
          <X className="h-6 w-6 text-primary" />
        ) : (
          <div className="relative">
            <Plus className="h-7 w-7 text-white transition-transform group-hover:rotate-90 duration-500" />
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-white rounded-full animate-ping opacity-20" />
          </div>
        )}
        
        {/* Subtle Glow Effect */}
        {!isOpen && (
          <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity blur-xl -z-10" />
        )}
      </button>
    </div>
  )
}

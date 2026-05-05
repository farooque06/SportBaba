"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, Calendar, Users, Trophy, Settings,
  BarChart3, LogOut, CreditCard, Package, UserCheck,
  ChevronLeft, ChevronRight, Sparkles, Globe, ClipboardList
} from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"
import { useSport } from "@/components/providers/SportProvider"
import { cn } from "@/lib/utils"
import { logoutAction } from "@/lib/actions/auth"

const menuItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: Sparkles, label: "Resources", href: "/dashboard/resources" },
  { icon: Calendar, label: "Bookings", href: "/dashboard/bookings" },
  { icon: Trophy, label: "Tournaments", href: "/dashboard/tournaments" },
  { icon: Package, label: "Inventory", href: "/dashboard/inventory" },
  { icon: Users, label: "Members", href: "/dashboard/members" },
  { icon: UserCheck, label: "Customers", href: "/dashboard/customers" },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
  { icon: ClipboardList, label: "Reports", href: "/dashboard/reports" },
  { icon: CreditCard, label: "Billing", href: "/dashboard/billing" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
]

interface SidebarProps {
  subscriptionStatus?: string;
  trialEnd?: string;
  user?: any;
}

export function Sidebar({ subscriptionStatus, trialEnd, user }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { sport, setSport, facilityType } = useSport()
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  const daysLeft = trialEnd
    ? Math.max(0, Math.ceil((new Date(trialEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const isTrialing = subscriptionStatus === 'trialing';
  const isPaid = subscriptionStatus === 'active';

  // Prevent hydration mismatch by returning a stable structure until mounted
  if (!mounted) {
    return <div className="border-r border-border bg-card hidden md:flex flex-col h-full w-24 md:w-72" />;
  }

  return (
    <div className={cn(
      "border-r border-border bg-card hidden md:flex flex-col h-full transition-all duration-300 ease-in-out relative group/sidebar",
      isCollapsed ? "w-24" : "w-72"
    )}>
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-12 h-6 w-6 rounded-full bg-foreground text-background border border-border flex items-center justify-center shadow-lg z-50 hover:scale-110 transition-transform cursor-pointer"
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      {/* Logo + Org Switcher */}
      <div className={cn("p-6 border-b border-border space-y-6 overflow-hidden", isCollapsed && "px-4")}>
        <Link href="/dashboard" className="flex items-center gap-3 group/logo">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-foreground shadow-xl transition-all group-hover/logo:scale-105 group-hover/logo:rotate-3">
            <span className="text-xl font-black text-background">S</span>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-300">
              <span className="text-xl font-black tracking-tighter text-foreground italic uppercase leading-none">SportBaba</span>
              <span className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">Command Hub</span>
            </div>
          )}
        </Link>

        {!isCollapsed && (
          <div className="flex flex-col gap-1 px-1">
             <div className="flex items-center justify-between py-3 px-4 rounded-2xl border border-primary/20 bg-primary/5 shadow-sm group/org">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] leading-none mb-1">Active Hub</span>
                  <span className="text-xs font-black text-foreground uppercase tracking-tight truncate max-w-[140px]">
                    {user?.facilityName || "Primary Hub"}
                  </span>
                </div>
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
             </div>
          </div>
        )}
      </div>

      {/* Sport Toggle */}
      {facilityType === 'both' && (
        <div className={cn("p-4 border-b border-border transition-all overflow-hidden", isCollapsed ? "px-2" : "px-6")}>
          <div className={cn("flex flex-col gap-2 p-1.5 bg-muted rounded-2xl", !isCollapsed && "flex-row")}>
            <button
              onClick={() => setSport('footshall')}
              title="Footshall"
              className={cn(
                "flex items-center justify-center py-2 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest",
                sport === 'footshall' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-foreground',
                isCollapsed ? "h-10 w-full" : "flex-1"
              )}
            >
              {isCollapsed ? "F" : "Footshall"}
            </button>
            <button
              onClick={() => setSport('cricshall')}
              title="Cricshall"
              className={cn(
                "flex items-center justify-center py-2 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest",
                sport === 'cricshall' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-foreground',
                isCollapsed ? "h-10 w-full" : "flex-1"
              )}
            >
              {isCollapsed ? "C" : "Cricshall"}
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
        {/* Admin Hub Link (Conditional) */}
        {(user?.role === 'superadmin' || user?.email === 'far00queapril17@gmail.com') && (
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-4 px-4 h-14 rounded-2xl text-sm font-black transition-all group relative mb-6",
              "bg-primary text-primary-foreground shadow-lg shadow-primary/20 border border-primary/20 hover:scale-105 active:scale-95",
              isCollapsed && "justify-center px-0"
            )}
          >
            <Globe className="h-5 w-5 shrink-0 animate-pulse" />
            {!isCollapsed && (
              <span className="uppercase tracking-tighter italic">Admin Hub</span>
            )}
            {!isCollapsed && (
              <Sparkles className="h-3 w-3 absolute top-2 right-4 opacity-50" />
            )}
          </Link>
        )}

        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.label}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-4 px-4 h-12 rounded-2xl text-sm font-black transition-all group relative active:scale-[0.97]",
                isActive
                  ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent active:bg-muted/80",
                isCollapsed && "justify-center px-0"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 shrink-0 transition-transform group-hover:scale-110 group-active:scale-95",
                isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
              )} />
              {!isCollapsed && (
                <span className="animate-in fade-in slide-in-from-left-2 duration-300 uppercase tracking-tighter italic">{item.label}</span>
              )}
              {isActive && isCollapsed && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-l-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" />
              )}
            </Link>
          )
        })}
      </div>

      {/* Footer Area */}
      <div className={cn("p-4 border-t border-border space-y-6 transition-all", isCollapsed && "items-center")}>
        {!isCollapsed && isTrialing && (
          <div className="bg-primary/5 rounded-3xl p-5 border border-primary/10 relative overflow-hidden group/trial shadow-inner">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover/trial:opacity-20 transition-opacity">
              <Sparkles className="h-8 w-8 text-primary -rotate-12" />
            </div>
            <div className="flex justify-between items-center mb-2 relative z-10">
              <p className="text-[10px] font-black text-primary uppercase tracking-widest italic">Trial Pass</p>
              <p className="text-[10px] font-black text-primary/40">{daysLeft}D</p>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden border border-border/50 relative z-10">
              <div className="h-full bg-primary transition-all duration-1000 shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]" style={{ width: `${Math.min(100, (daysLeft / 30) * 100)}%` }}></div>
            </div>
          </div>
        )}

        <div className={cn("flex items-center justify-between gap-3 px-2", isCollapsed && "flex-col")}>
          <div className="flex items-center gap-3">
             <div className="h-9 w-9 rounded-full ring-2 ring-primary/20 bg-muted flex items-center justify-center text-muted-foreground overflow-hidden">
                {user?.image ? (
                  <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <Users className="h-5 w-5" />
                )}
             </div>
            {!isCollapsed && <span className="text-xs font-black text-muted-foreground italic uppercase tracking-tighter truncate max-w-[120px]">{user?.name || "Account"}</span>}
          </div>
          <ThemeToggle />
        </div>

        <button
          onClick={() => logoutAction()}
          title="Sign Out"
          className={cn(
            "w-full flex items-center gap-3 h-12 rounded-2xl text-[10px] font-black transition-all group cursor-pointer border border-transparent hover:bg-red-500/10 hover:border-red-500/20 text-muted-foreground hover:text-red-500",
            isCollapsed ? "justify-center" : "px-4"
          )}
        >
          <LogOut className="h-5 w-5 shrink-0 group-hover:rotate-12 transition-transform" />
          {!isCollapsed && <span className="uppercase tracking-widest italic">Sign Out</span>}
        </button>
      </div>
    </div>
  )
}
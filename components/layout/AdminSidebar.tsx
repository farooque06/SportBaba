"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Globe, LayoutDashboard, Users, ShieldAlert, 
  Settings, LogOut, Activity, BarChart3,
  ChevronLeft, ChevronRight, Package
} from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import { ThemeToggle } from "@/components/ThemeToggle"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

const adminMenuItems = [
  { icon: Globe, label: "Global Hub", href: "/admin" },
  { icon: Users, label: "Client Registry", href: "/admin/clients" },
  { icon: BarChart3, label: "Subscriptions", href: "/admin/subscriptions" },
  { icon: ShieldAlert, label: "System Health", href: "/admin/health" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
]

export function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()

  useEffect(() => {
    setMounted(true)
  }, [])

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
        className="absolute -right-3 top-12 h-6 w-6 rounded-full bg-primary text-primary-foreground border border-border flex items-center justify-center shadow-lg z-50 hover:scale-110 transition-transform cursor-pointer"
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      {/* Admin Branding */}
      <div className={cn("p-6 border-b border-border space-y-6 overflow-hidden", isCollapsed && "px-4")}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]">
            <span className="text-xl font-black text-primary-foreground">A</span>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-300">
               <span className="text-xl font-black tracking-tighter text-foreground italic uppercase leading-none">AdminHub</span>
               <span className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">SportBaba Command</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
        {adminMenuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.label}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-4 px-4 h-12 rounded-2xl text-sm font-black transition-all group relative",
                isActive 
                  ? "bg-primary/10 text-primary border border-primary/20" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent",
                isCollapsed && "justify-center px-0"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 shrink-0 transition-transform group-hover:scale-110",
                isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
              )} />
              {!isCollapsed && (
                <span className="animate-in fade-in slide-in-from-left-2 duration-300 uppercase tracking-tighter italic">{item.label}</span>
              )}
            </Link>
          )
        })}
      </div>

      {/* Footer Area */}
      <div className={cn("p-4 border-t border-border space-y-6 transition-all", isCollapsed && "items-center")}>
        <div className={cn("flex items-center justify-between gap-3 px-2", isCollapsed && "flex-col")}>
          <div className="flex items-center gap-3">
            {session?.user && (
               <div className="h-9 w-9 rounded-xl bg-primary/20 flex items-center justify-center text-xs font-black text-primary ring-2 ring-primary/10">
                  {session.user.name?.[0].toUpperCase()}
               </div>
            )}
            {!isCollapsed && <span className="text-xs font-black text-muted-foreground italic">ADMIN GATE</span>}
          </div>
          <ThemeToggle />
        </div>

        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className={cn(
            "w-full flex items-center gap-3 h-12 rounded-2xl text-[10px] font-black transition-all group cursor-pointer border border-transparent hover:bg-red-500/10 hover:border-red-500/20 text-muted-foreground hover:text-red-500",
            isCollapsed ? "justify-center" : "px-4"
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span className="uppercase tracking-widest italic">Exit Admin</span>}
        </button>
      </div>
    </div>
  )
}

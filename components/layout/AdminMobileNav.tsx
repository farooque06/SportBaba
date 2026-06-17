"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { 
  Globe, Activity, Users, BarChart3,
  BookOpen, ShieldAlert, Settings, Lock,
  ChevronUp, X, LogOut, FileText
} from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import { ThemeToggle } from "@/components/ThemeToggle"

const primaryTabs = [
  { icon: Globe, label: "Global Hub", href: "/admin" },
  { icon: Activity, label: "Analytics", href: "/admin/analytics" },
  { icon: Users, label: "Clients", href: "/admin/clients" },
  { icon: BarChart3, label: "Subs", href: "/admin/subscriptions" },
]

const secondaryItems = [
  { icon: BookOpen, label: "Financial Ledger", href: "/admin/ledger" },
  { icon: ShieldAlert, label: "System Health", href: "/admin/health" },
  { icon: FileText, label: "Audit Logs", href: "/admin/logs" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
  { icon: Lock, label: "Security", href: "/admin/security" },
]

export function AdminMobileNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [showMore, setShowMore] = useState(false)

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin"
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* ─── Top Header Bar ─── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-[100] h-14 bg-background border-b border-border flex items-center justify-between px-4 safe-area-top">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-black text-primary-foreground">A</span>
          </div>
          <span className="text-lg font-black tracking-tighter text-foreground truncate">
            AdminHub
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {session?.user && (
             <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-black text-primary ring-2 ring-primary/10">
                {session.user.name?.[0].toUpperCase()}
             </div>
          )}
        </div>
      </div>

      {/* ─── Bottom Tab Bar ─── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-background border-t border-border safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {primaryTabs.map((tab) => {
            const active = isActive(tab.href)
            return (
              <Link
                key={tab.label}
                href={tab.href}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 rounded-xl ${
                  active 
                    ? 'text-primary' 
                    : 'text-muted-foreground'
                }`}
              >
                <div className="relative">
                  <tab.icon className={`h-5 w-5 transition-transform ${active ? 'scale-110' : 'group-active:scale-95'}`} />
                  {active && (
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary shadow-[0_0_6px_rgba(var(--primary),0.6)]" />
                  )}
                </div>
                <span className={`text-[9px] font-black uppercase tracking-tighter transition-colors ${active ? 'text-primary' : 'group-active:text-foreground'}`}>
                  {tab.label}
                </span>
              </Link>
            )
          })}

          {/* More Button */}
          <button
            onClick={() => setShowMore(true)}
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 rounded-xl text-muted-foreground`}
          >
            <ChevronUp className="h-5 w-5" />
            <span className="text-[9px] font-black uppercase tracking-tighter">More</span>
          </button>
        </div>
      </div>

      {/* ─── More Sheet (Slide-up) ─── */}
      {showMore && (
        <div className="md:hidden fixed inset-0 z-[150] animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMore(false)} 
          />
          
          {/* Sheet */}
          <div className="absolute bottom-0 left-0 right-0 bg-card rounded-t-[32px] border-t border-border shadow-2xl animate-in slide-in-from-bottom duration-300 safe-area-bottom">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pb-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-foreground">More</h3>
              <button 
                onClick={() => setShowMore(false)}
                className="h-8 w-8 rounded-xl bg-muted flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Secondary Nav Items */}
            <div className="px-4 pb-2 space-y-1">
                {secondaryItems.map((item) => {
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setShowMore(false)}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all active:scale-[0.98] ${
                        active 
                          ? 'bg-primary/10 text-primary' 
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground active:bg-muted/80'
                      }`}
                    >
                      <item.icon className={`h-5 w-5 ${active ? 'text-primary' : ''}`} />
                      {item.label}
                    </Link>
                  )
                })}
            </div>

            {/* Sign Out */}
            <div className="px-4 pb-6 pt-2 border-t border-border mx-4">
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-500/10 transition-all mt-3"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

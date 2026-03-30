"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { 
  LayoutDashboard, Calendar, Package, BarChart3, MoreHorizontal,
  Trophy, Users, CreditCard, Settings, LogOut, X, ChevronUp, UserCheck
} from "lucide-react"
import { UserButton, OrganizationSwitcher, useClerk } from "@clerk/nextjs"
import { ThemeToggle } from "@/components/ThemeToggle"
import { useSport } from "@/components/providers/SportProvider"

const primaryTabs = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: Calendar, label: "Bookings", href: "/dashboard/bookings" },
  { icon: Package, label: "Inventory", href: "/dashboard/inventory" },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
]

const secondaryItems = [
  { icon: Trophy, label: "Tournaments", href: "/dashboard/tournaments" },
  { icon: UserCheck, label: "Customers", href: "/dashboard/customers" },
  { icon: Users, label: "Members", href: "/dashboard/members" },
  { icon: CreditCard, label: "Billing", href: "/dashboard/billing" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
]

export function MobileNav() {
  const pathname = usePathname()
  const { signOut } = useClerk()
  const { sport, setSport, facilityType } = useSport()
  const [showMore, setShowMore] = useState(false)

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* ─── Top Header Bar ─── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-[100] h-14 bg-background/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground">
            <span className="text-sm font-black text-background">S</span>
          </div>
          <span className="text-lg font-black tracking-tighter text-foreground">SportBaba</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Sport Toggle (compact) */}
          {facilityType === 'both' && (
            <div className="flex items-center gap-0.5 p-0.5 bg-muted rounded-lg">
              <button 
                onClick={() => setSport('footshall')}
                className={`py-1 px-2 rounded-md text-[9px] font-black transition-all uppercase tracking-tighter ${
                  sport === 'footshall' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                }`}
              >
                ⚽
              </button>
              <button 
                onClick={() => setSport('cricshall')}
                className={`py-1 px-2 rounded-md text-[9px] font-black transition-all uppercase tracking-tighter ${
                  sport === 'cricshall' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                }`}
              >
                🏏
              </button>
            </div>
          )}
          <ThemeToggle />
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: "h-7 w-7 ring-2 ring-primary/20",
              }
            }}
          />
        </div>
      </div>

      {/* ─── Bottom Tab Bar ─── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-background/80 backdrop-blur-xl border-t border-border safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {primaryTabs.map((tab) => {
            const active = isActive(tab.href)
            return (
              <Link
                key={tab.label}
                href={tab.href}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 rounded-xl transition-all ${
                  active 
                    ? 'text-primary' 
                    : 'text-muted-foreground active:scale-95'
                }`}
              >
                <div className="relative">
                  <tab.icon className={`h-5 w-5 transition-transform ${active ? 'scale-110' : ''}`} />
                  {active && (
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary shadow-[0_0_6px_rgba(var(--primary),0.6)]" />
                  )}
                </div>
                <span className={`text-[9px] font-black uppercase tracking-tighter ${active ? 'text-primary' : ''}`}>
                  {tab.label}
                </span>
              </Link>
            )
          })}

          {/* More Button */}
          <button
            onClick={() => setShowMore(true)}
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 rounded-xl transition-all text-muted-foreground active:scale-95`}
          >
            <ChevronUp className="h-5 w-5" />
            <span className="text-[9px] font-black uppercase tracking-tighter">More</span>
          </button>
        </div>
      </div>

      {/* ─── More Sheet (Slide-up) ─── */}
      {showMore && (
        <div className="md:hidden fixed inset-0 z-[200] animate-in fade-in duration-200">
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

            {/* Org Switcher */}
            <div className="px-6 pb-4">
              <OrganizationSwitcher
                hidePersonal
                afterCreateOrganizationUrl="/dashboard"
                afterSelectOrganizationUrl="/dashboard"
                appearance={{
                  elements: {
                    organizationSwitcherTrigger: "w-full justify-between font-bold text-sm",
                    rootBox: "w-full",
                  }
                }}
              />
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
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                      active 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
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
                onClick={() => signOut({ redirectUrl: '/' })}
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

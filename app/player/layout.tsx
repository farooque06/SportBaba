import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ThemeToggle } from "@/components/ThemeToggle"
import { NotificationBell } from "@/components/ui/NotificationBell"
import { LogOut, LayoutDashboard, Users, Calendar, MapPin, UserCheck } from "lucide-react"
import { signOut } from "@/auth"

export default async function PlayerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const userRole = (session.user as any)?.role
  const userName = session.user.name || "Player"
  const userEmail = session.user.email || ""

  return (
    <div className="min-h-screen bg-[#090D16] text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#090D16]/80 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link href="/player" className="flex items-center gap-3 group">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-3deg]">
                <span className="text-lg font-black text-primary-foreground leading-none">S</span>
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                Sport<span className="text-primary">Baba</span>
              </span>
              <span className="ml-2 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/20 text-primary border border-primary/30">
                Player Hub
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/player"
                className="px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white hover:bg-white/5 transition-colors flex items-center gap-2"
              >
                <LayoutDashboard className="h-3.5 w-3.5 text-primary" />
                My Hub
              </Link>
              <Link
                href="/open-games"
                className="px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2"
              >
                <Users className="h-3.5 w-3.5 text-emerald-400" />
                Open Games
              </Link>
              <Link
                href="/facilities"
                className="px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2"
              >
                <MapPin className="h-3.5 w-3.5 text-indigo-400" />
                Venues & Turfs
              </Link>
            </nav>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {/* User Profile info */}
            <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-white/10">
              <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white leading-none">{userName}</div>
                <div className="text-[10px] text-muted-foreground leading-tight mt-0.5 truncate max-w-[120px]">
                  {userEmail}
                </div>
              </div>
            </div>

            {/* Logout form */}
            <form
              action={async () => {
                "use server"
                await signOut({ redirectTo: "/" })
              }}
            >
              <button
                type="submit"
                className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-muted-foreground hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-colors"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Mobile secondary bar */}
        <div className="md:hidden flex items-center justify-around border-t border-white/5 py-2 px-3 bg-black/20">
          <Link
            href="/player"
            className="flex flex-col items-center gap-1 text-[11px] font-bold text-primary"
          >
            <LayoutDashboard className="h-4 w-4" />
            Hub
          </Link>
          <Link
            href="/open-games"
            className="flex flex-col items-center gap-1 text-[11px] font-bold text-muted-foreground hover:text-white"
          >
            <Users className="h-4 w-4" />
            Games
          </Link>
          <Link
            href="/facilities"
            className="flex flex-col items-center gap-1 text-[11px] font-bold text-muted-foreground hover:text-white"
          >
            <MapPin className="h-4 w-4" />
            Venues
          </Link>
        </div>
      </header>

      {/* Main Player Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </div>
    </div>
  )
}

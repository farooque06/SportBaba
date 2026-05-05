"use client"

import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { LogIn, Menu, X, Users, LogOut } from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"

export function Navbar({ isLoggedIn: initialIsLoggedIn }: { isLoggedIn?: boolean }) {
  const { data: session, status } = useSession()
  const isLoggedIn = status === "authenticated"
  const isSuperAdmin = session?.user?.email === 'far00queapril17@gmail.com'
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 z-[100] w-full">
      {/* Gradient line at very top */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      
      <div className="bg-background/70 backdrop-blur-2xl border-b border-border/50">
        <div className="mx-auto flex h-16 sm:h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-3deg]">
              <span className="text-lg font-extrabold text-primary-foreground leading-none">S</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">
              Sport<span className="text-primary">Baba</span>
            </span>
          </Link>
          
          {/* Desktop Nav */}
          <div className="hidden items-center gap-8 lg:flex">
            {["Features", "Sports", "Pricing"].map((item) => (
              <Link 
                key={item} 
                href={`#${item.toLowerCase()}`} 
                className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-primary rounded-full transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3 sm:gap-4">
            <ThemeToggle />
            
            {!isLoggedIn ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <button 
                  onClick={() => router.push('/login')} 
                  className="hidden md:inline-flex items-center gap-2 h-9 px-4 rounded-lg text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all cursor-pointer outline-none"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </button>
                <button 
                  onClick={() => router.push('/register')} 
                  className="inline-flex items-center justify-center rounded-xl font-semibold text-[13px] transition-all active:scale-95 bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/25 h-9 sm:h-10 px-5 sm:px-6 cursor-pointer outline-none"
                >
                  Get Started
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 sm:gap-4">
                <Link href={isSuperAdmin ? "/admin" : "/dashboard"} className="hidden sm:block">
                  <Button variant="primary" size="md" className="h-10 px-5 rounded-xl font-semibold text-[13px] shadow-lg shadow-primary/25">
                    {isSuperAdmin ? "Admin Hub" : "Dashboard"}
                  </Button>
                </Link>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="h-9 w-9 rounded-full border-2 border-primary/20 bg-muted flex items-center justify-center overflow-hidden hover:bg-red-500/10 hover:border-red-500/30 transition-all group"
                    title="Sign Out"
                  >
                    <LogOut className="h-4 w-4 text-muted-foreground group-hover:text-red-500 transition-colors" />
                  </button>
                </div>
              </div>
            )}

            {/* Mobile hamburger */}
            <button 
              className="lg:hidden p-2 rounded-lg hover:bg-muted/60 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl px-5 py-4 space-y-1">
            {["Features", "Sports", "Pricing"].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase()}`}
                className="block px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {item}
              </Link>
            ))}
            {isLoggedIn && (
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/5 transition-colors mt-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

"use client"

import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { LogIn } from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Show, useClerk, UserButton, OrganizationSwitcher } from "@clerk/nextjs"

export function Navbar({ isLoggedIn }: { isLoggedIn?: boolean }) {
  const { openSignIn } = useClerk();

  return (
    <nav className="fixed top-0 z-[100] w-full border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 sm:h-20 max-w-7xl items-center justify-between px-6 sm:px-8">
        <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
          <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-foreground transition-transform group-hover:scale-110">
            <span className="text-lg sm:text-xl font-black text-background">S</span>
          </div>
          <span className="text-xl sm:text-2xl font-black tracking-tighter text-foreground italic uppercase">SportBaba</span>
        </Link>
        
        <div className="hidden items-center gap-8 lg:flex">
          {["Features", "Enterprise", "Pricing", "Resources"].map((item) => (
            <Link 
              key={item} 
              href={`#${item.toLowerCase()}`} 
              className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all hover:scale-105"
            >
              {item}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <ThemeToggle />
          
          {!isLoggedIn ? (
            <>
              <button onClick={() => openSignIn({ forceRedirectUrl: '/dashboard' })} className="hidden sm:inline-flex items-center justify-center rounded-xl font-black uppercase tracking-widest text-[9px] transition-all active:scale-95 bg-transparent hover:bg-muted text-muted-foreground hover:text-foreground h-9 px-4 gap-2 cursor-pointer outline-none">
                <LogIn className="h-4 w-4" />
                <span>Login</span>
              </button>
              <button onClick={() => openSignIn({ forceRedirectUrl: '/dashboard' })} className="inline-flex items-center justify-center rounded-xl font-black uppercase tracking-widest text-[9px] transition-all active:scale-95 bg-foreground text-background hover:opacity-90 shadow-xl h-9 sm:h-11 px-4 sm:px-6 cursor-pointer outline-none">
                Get Started
              </button>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="hidden sm:block">
                <Button variant="primary" size="sm" className="h-10 px-6 rounded-xl font-black uppercase tracking-widest text-[9px] shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all outline-none">
                  Open Dashboard
                </Button>
              </Link>
              <div className="scale-90 flex items-center gap-3">
                <OrganizationSwitcher 
                  afterCreateOrganizationUrl="/dashboard"
                  afterSelectOrganizationUrl="/dashboard"
                  appearance={{
                    elements: {
                      organizationSwitcherTrigger: "text-foreground font-black text-[10px] uppercase tracking-widest bg-muted/40 px-3 py-1.5 rounded-lg border border-border/50",
                    }
                  }}
                />
                <UserButton />
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

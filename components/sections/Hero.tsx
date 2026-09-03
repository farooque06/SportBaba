"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { ArrowRight, Sparkles, Search, MapPin, Trophy, ShieldCheck, Flame, ChevronRight, Play } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useSession } from "next-auth/react"

export function Hero({ isLoggedIn: initialIsLoggedIn }: { isLoggedIn?: boolean }) {
  const { status } = useSession()
  const isLoggedIn = status === "authenticated"
  const [activeTab, setActiveTab] = useState<'player' | 'partner'>('player')
  const [searchQuery, setSearchQuery] = useState('')

  const popularSports = [
    { label: "⚽ Futsal", value: "futsal" },
    { label: "🏏 Cricket", value: "cricket" },
    { label: "🏸 Badminton", value: "badminton" },
    { label: "🏀 Basketball", value: "basketball" },
  ]

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const targetElement = document.getElementById('find-turf')
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' })
      // Dispatch custom event to trigger search in showcase if available
      window.dispatchEvent(new CustomEvent('lp-search', { detail: searchQuery }))
    }
  }

  const handleSportClick = (sport: string) => {
    const targetElement = document.getElementById('find-turf')
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' })
      window.dispatchEvent(new CustomEvent('lp-sport-filter', { detail: sport }))
    }
  }

  return (
    <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-8 overflow-hidden w-full min-h-[92vh] flex flex-col justify-center">
      {/* Background layers */}
      <div className="absolute inset-0 -z-20">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/70 to-background z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-transparent to-background/90 z-10" />
        <div className="absolute inset-0 noise-overlay z-20" />
        <Image 
          src="/images/cricket_hero_bg.png" 
          alt="Sports Arena" 
          fill 
          sizes="100vw"
          className="object-cover opacity-25 dark:opacity-15 animate-slow-zoom"
          priority
        />
      </div>

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.25] dark:opacity-[0.10]"
        style={{
          backgroundImage: 'radial-gradient(circle, var(--border) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      />

      {/* Ambient Glowing Orbs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[140px] animate-float opacity-70" />
        <div className="absolute bottom-[10%] right-[10%] w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-[130px] animate-float opacity-50" style={{ animationDelay: '-5s' }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/4 w-[850px] h-[650px] bg-primary/8 rounded-full blur-[180px]" />
      </div>

      <div className="relative mx-auto max-w-5xl text-center flex flex-col items-center z-30">
        
        {/* Live Notification Pill */}
        <div className="reveal-up inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-card/80 border border-primary/20 backdrop-blur-xl text-xs font-semibold text-foreground mb-6 shadow-sm">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="flex items-center gap-1.5 text-primary font-bold">
            <Flame className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
            Live Marketplace:
          </span>
          <span className="text-muted-foreground">Over 1,200+ matches reserved this month</span>
        </div>

        {/* Dual Persona Switcher (For Players / For Arenas) */}
        <div className="reveal-up delay-100 inline-flex p-1 rounded-2xl bg-card/60 backdrop-blur-xl border border-border/80 mb-6 shadow-md">
          <button
            type="button"
            onClick={() => setActiveTab('player')}
            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'player'
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-[1.02]'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
            }`}
          >
            🏃 For Players & Teams
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('partner')}
            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'partner'
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-[1.02]'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
            }`}
          >
            🏟️ For Turf & Arena Owners
          </button>
        </div>

        {/* Dynamic Headline Based on Active Persona */}
        {activeTab === 'player' ? (
          <div className="reveal-up delay-100 max-w-4xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.08]">
              Book Your Next Pitch <br className="hidden sm:inline" />
              In <span className="text-primary text-glow relative inline-block">
                Under 60 Seconds
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/40" viewBox="0 0 200 12" fill="none" preserveAspectRatio="none">
                  <path d="M2 8.5C30 3 70 1 100 4C130 7 170 9 198 3.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </span>
            </h1>
            <p className="mt-5 text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Explore verified futsal turfs, cricket pitches, and indoor lanes with real-time slot availability, instant confirmation, and downloadable receipts.
            </p>
          </div>
        ) : (
          <div className="reveal-up delay-100 max-w-4xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.08]">
              Automate Your Venue <br className="hidden sm:inline" />
              With Our <span className="text-primary text-glow relative inline-block">
                Complete Sports OS
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/40" viewBox="0 0 200 12" fill="none" preserveAspectRatio="none">
                  <path d="M2 8.5C30 3 70 1 100 4C130 7 170 9 198 3.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </span>
            </h1>
            <p className="mt-5 text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Eliminate double-bookings, automate lights & POS billing, accept public match bookings, and supercharge court revenue by 28%+.
            </p>
          </div>
        )}

        {/* ─── Interactive Search & Quick Action Card ─── */}
        {activeTab === 'player' ? (
          <div className="reveal-up delay-200 w-full max-w-2xl mt-8">
            <form onSubmit={handleSearchSubmit} className="relative p-2 rounded-2xl sm:rounded-3xl bg-card/80 backdrop-blur-2xl border border-border/80 shadow-2xl flex flex-col sm:flex-row gap-2 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search venue name, sport, or city..."
                  className="w-full h-12 sm:h-13 bg-transparent pl-12 pr-4 text-sm sm:text-base font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full sm:w-auto h-12 sm:h-13 px-7 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base shadow-lg shadow-primary/25 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  Find Turf
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Button>
            </form>

            {/* Quick Sport Filter Tags */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              <span className="text-xs font-semibold text-muted-foreground mr-1">Quick pick:</span>
              {popularSports.map(sport => (
                <button
                  key={sport.value}
                  type="button"
                  onClick={() => handleSportClick(sport.value)}
                  className="px-3.5 py-1.5 rounded-full bg-card/60 backdrop-blur-md border border-border/60 hover:border-primary/40 hover:bg-primary/10 text-xs font-semibold text-foreground transition-all cursor-pointer active:scale-95"
                >
                  {sport.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="reveal-up delay-200 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-8 w-full sm:w-auto">
            <Link href={isLoggedIn ? "/dashboard" : "/register"} className="w-full sm:w-auto">
              <Button 
                variant="primary" 
                size="lg" 
                className="w-full sm:w-auto h-12 sm:h-13 px-8 text-sm sm:text-base rounded-2xl shadow-lg shadow-primary/25 font-bold cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  {isLoggedIn ? "Open Management Hub" : "Start Free Facility Pilot"}
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Button>
            </Link>

            <button
              type="button"
              onClick={() => document.getElementById('roi-calculator')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto h-12 sm:h-13 px-7 text-sm sm:text-base rounded-2xl bg-card/60 backdrop-blur-xl border border-border/80 hover:bg-muted font-bold text-foreground transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Calculate Venue Revenue</span>
              <ChevronRight className="h-4 w-4 text-primary" />
            </button>
          </div>
        )}

        {/* Trust Signals & Verified Partners */}
        <div className="reveal-up delay-300 mt-12 sm:mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs sm:text-sm text-muted-foreground font-medium">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>100% Verified Venues</span>
          </div>
          <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-border" />
          <div className="flex items-center gap-1.5">
            <div className="flex -space-x-1.5">
              {[1, 2, 3, 4, 5].map(i => (
                <svg key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="font-bold text-foreground ml-1">4.9/5 Rating</span>
          </div>
          <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-border" />
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Instant Digital Receipt</span>
          </div>
        </div>

        {/* Live Metrics Showcase */}
        <div className="reveal-up delay-400 mt-12 sm:mt-16 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full max-w-4xl">
          {[
            { label: "Public Booking Speed", value: "< 30s", sub: "Instant Slot Hold" },
            { label: "Active Sports Venues", value: "250+", sub: "Across 8 Cities" },
            { label: "Matches Hosted", value: "45,000+", sub: "Verified Reservations" },
            { label: "Average Revenue Lift", value: "+28%", sub: "For Partner Arenas" }
          ].map((stat, i) => (
            <div 
              key={i} 
              className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-card/40 backdrop-blur-xl border border-border/60 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 shadow-sm text-left relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors" />
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-2xl sm:text-3xl font-black tracking-tight text-foreground group-hover:text-primary transition-colors">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground/80 mt-1 font-medium">{stat.sub}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

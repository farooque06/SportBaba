"use client"

import { useState } from "react"
import { Search, Calendar, FileText, CheckCircle2, Zap, ArrowRight, ShieldCheck, BarChart3, Users } from "lucide-react"

export function HowItWorks() {
  const [role, setRole] = useState<'player' | 'owner'>('player')

  const playerSteps = [
    {
      step: "01",
      icon: Search,
      title: "Discover Nearby Turfs",
      desc: "Browse verified futsal arenas, cricket practice lanes, badminton courts, and indoor sports hubs in real-time."
    },
    {
      step: "02",
      icon: Calendar,
      title: "Pick Your Exact Slot",
      desc: "Select 30 to 120-minute match durations with live morning, afternoon, and evening availability."
    },
    {
      step: "03",
      icon: FileText,
      title: "Instant Digital Receipt",
      desc: "Get an official entry pass with quick WhatsApp squad sharing, PDF download, and zero payment friction."
    }
  ]

  const ownerSteps = [
    {
      step: "01",
      icon: Zap,
      title: "Onboard in 2 Minutes",
      desc: "Set up your facility, define courts, operating hours, and custom peak/off-peak pricing rules."
    },
    {
      step: "02",
      icon: Users,
      title: "Automate All Bookings",
      desc: "Sync online public reservations, walk-ins, phone reservations, and POS sales with zero double-bookings."
    },
    {
      step: "03",
      icon: BarChart3,
      title: "Boost Revenue & Retain",
      desc: "Run tournaments, automate recurring memberships, track customer visits, and gain real-time ledger intelligence."
    }
  ]

  const steps = role === 'player' ? playerSteps : ownerSteps

  return (
    <section className="py-20 sm:py-28 relative overflow-hidden bg-background">
      {/* Background Subtle Gradient */}
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] glow-orb -translate-y-1/2 opacity-20 pointer-events-none" />

      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        
        {/* Header */}
        <div className="text-center mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary mx-auto">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Simple, Fast & Reliable</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            How SportBaba Works
          </h2>

          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto font-medium">
            A frictionless platform built to connect active players with world-class sporting facilities.
          </p>

          {/* Toggle Switch */}
          <div className="pt-3">
            <div className="inline-flex p-1 rounded-2xl bg-card/60 backdrop-blur-xl border border-border/80 shadow-md">
              <button
                type="button"
                onClick={() => setRole('player')}
                className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  role === 'player'
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-[1.02]'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                For Players & Teams
              </button>
              <button
                type="button"
                onClick={() => setRole('owner')}
                className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  role === 'owner'
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-[1.02]'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                For Facility Owners
              </button>
            </div>
          </div>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {steps.map((item, idx) => (
            <div
              key={idx}
              className="p-7 sm:p-8 rounded-3xl bg-card/50 backdrop-blur-xl border border-border/70 hover:border-primary/40 transition-all duration-300 hover:-translate-y-1.5 shadow-sm hover:shadow-xl hover:shadow-primary/5 flex flex-col justify-between relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-6 text-4xl sm:text-5xl font-black text-foreground/5 font-mono select-none group-hover:text-primary/10 transition-colors">
                {item.step}
              </div>

              <div>
                <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-xs">
                  <item.icon className="h-6 w-6" />
                </div>

                <h3 className="text-xl font-extrabold text-foreground tracking-tight mb-3">
                  {item.title}
                </h3>

                <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                  {item.desc}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-border/40 flex items-center text-xs font-bold text-primary">
                <span>Step {idx + 1} of 3</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

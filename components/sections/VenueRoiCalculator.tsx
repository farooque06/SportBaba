"use client"

import { useState } from "react"
import { TrendingUp, Sparkles, ArrowRight, ShieldCheck, CheckCircle2, DollarSign } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"

export function VenueRoiCalculator() {
  const [courtsCount, setCourtsCount] = useState<number>(2)
  const [hourlyRate, setHourlyRate] = useState<number>(1500)
  const [dailyHours, setDailyHours] = useState<number>(8)

  // Calculations
  const currentMonthlyGross = courtsCount * hourlyRate * dailyHours * 30
  // Estimated +28% increase via online bookings, zero dead slots, and automated dunning/memberships
  const extraGainPercentage = 0.28
  const estimatedMonthlyExtra = Math.round(currentMonthlyGross * extraGainPercentage)
  const estimatedAnnualBoost = estimatedMonthlyExtra * 12

  return (
    <section id="roi-calculator" className="py-20 sm:py-28 relative overflow-hidden bg-background border-y border-border/40">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] glow-orb opacity-20 pointer-events-none" />

      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-14 items-center">
          
          {/* Left Text & Value Proposition */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-500">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Revenue Optimizer</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
              See How Much More Your <span className="text-primary text-glow">Venue Can Earn</span>
            </h2>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-medium">
              By enabling instant online reservations, eliminating dead peak-hour slots, and automating payments, SportBaba venues see an average <span className="text-foreground font-bold">+28% lift in monthly recurring turnover</span>.
            </p>

            <div className="space-y-3 pt-2">
              {[
                "Zero double-bookings across walk-ins & online channels",
                "Automated reminder alerts to reduce player no-shows by 70%",
                "Dynamic pricing rules for high-demand evening slots",
                "Instant digital entry passes & counter POS syncing"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-foreground/90">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Interactive Calculator Card */}
          <div className="lg:col-span-6">
            <div className="p-7 sm:p-9 rounded-3xl bg-card/70 backdrop-blur-2xl border border-border/80 shadow-2xl space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-border/50">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Interactive Revenue Estimator</span>
                <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                  Live Calculator
                </span>
              </div>

              {/* Sliders */}
              <div className="space-y-5">
                {/* Courts Count */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-muted-foreground uppercase tracking-wider">Number of Pitches / Courts</span>
                    <span className="text-foreground text-sm font-extrabold">{courtsCount} {courtsCount === 1 ? 'Pitch' : 'Pitches'}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={courtsCount}
                    onChange={(e) => setCourtsCount(Number(e.target.value))}
                    className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
                  />
                </div>

                {/* Hourly Rate */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-muted-foreground uppercase tracking-wider">Average Hourly Rate</span>
                    <span className="text-foreground text-sm font-extrabold">{formatCurrency(hourlyRate)} /hr</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="5000"
                    step="100"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
                  />
                </div>

                {/* Operating Hours */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-muted-foreground uppercase tracking-wider">Average Active Hours / Day</span>
                    <span className="text-foreground text-sm font-extrabold">{dailyHours} Hours</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="16"
                    value={dailyHours}
                    onChange={(e) => setDailyHours(Number(e.target.value))}
                    className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Calculated Result Card */}
              <div className="p-5 rounded-2xl bg-primary/10 border border-primary/20 space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Estimated Monthly Extra</span>
                  <span className="text-2xl sm:text-3xl font-black text-primary tracking-tight">
                    +{formatCurrency(estimatedMonthlyExtra)}
                  </span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-primary/15 text-xs text-muted-foreground">
                  <span>Projected Annual Growth</span>
                  <span className="font-extrabold text-foreground text-sm">+{formatCurrency(estimatedAnnualBoost)} /year</span>
                </div>
              </div>

              <Link href="/register" className="block">
                <button
                  type="button"
                  className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all shadow-lg shadow-primary/25 cursor-pointer"
                >
                  <span>Claim Your Venue Growth Pilot</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>

            </div>
          </div>

        </div>

      </div>
    </section>
  )
}

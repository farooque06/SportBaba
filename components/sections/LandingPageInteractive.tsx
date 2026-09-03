"use client"

import { useState } from "react"
import { Hero } from "@/components/sections/Hero"
import { FacilitiesShowcase } from "@/components/sections/FacilitiesShowcase"
import { HowItWorks } from "@/components/sections/HowItWorks"
import { VenueRoiCalculator } from "@/components/sections/VenueRoiCalculator"
import { FaqSection } from "@/components/sections/FaqSection"
import { FeaturesBento } from "@/components/sections/FeaturesBento"
import { ArrowRight, ShieldCheck, Zap, Users, Trophy, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/Button"
import Link from "next/link"

interface LandingPageInteractiveProps {
  isLoggedIn: boolean;
  featuredFacilities: any[];
}

export function LandingPageInteractive({ isLoggedIn, featuredFacilities }: LandingPageInteractiveProps) {
  const [persona, setPersona] = useState<'player' | 'partner'>('player')

  return (
    <>
      {/* 1. Hero Section with Top Persona Switcher */}
      <Hero 
        isLoggedIn={isLoggedIn} 
        activeTab={persona} 
        onTabChange={(tab) => setPersona(tab)} 
      />

      {/* 2. PERSONA SPECIFIC CONTENT */}
      {persona === 'player' ? (
        /* ═══════════════ PLAYER VIEW ═══════════════ */
        <div className="animate-in fade-in duration-500 space-y-16 sm:space-y-24">
          
          {/* Featured Venues & Live Pitches */}
          <FacilitiesShowcase facilities={featuredFacilities} />

          {/* Quick 3-step guide for players */}
          <HowItWorks />

          {/* Open Games / Matchmaking Callout Banner */}
          <section className="px-4 sm:px-8 max-w-6xl mx-auto">
            <div className="relative rounded-3xl p-7 sm:p-12 overflow-hidden bg-gradient-to-br from-primary/15 via-card/80 to-card/40 border border-primary/25 shadow-2xl backdrop-blur-2xl">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-3 max-w-xl">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
                    <Users className="h-3.5 w-3.5" />
                    <span>Looking for a squad or opponents?</span>
                  </div>
                  <h3 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
                    Join Public <span className="text-primary text-glow">Open Games</span>
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
                    Short on players? Discover open matches hosted by nearby teams, pick your preferred slot, and jump straight into the action.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                  <Link href="/open-games" className="w-full sm:w-auto">
                    <Button variant="primary" size="lg" className="w-full sm:w-auto h-12 px-7 rounded-2xl font-bold shadow-lg shadow-primary/25 text-sm sm:text-base cursor-pointer">
                      <span className="flex items-center gap-2">
                        Browse Open Games
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <FaqSection />
        </div>
      ) : (
        /* ═══════════════ TURF / ARENA OWNER VIEW ═══════════════ */
        <div className="animate-in fade-in duration-500 space-y-16 sm:space-y-24">
          
          {/* Interactive Revenue & ROI Estimator */}
          <VenueRoiCalculator />

          {/* Core Arena Management Platform Features */}
          <FeaturesBento />

          {/* 3 Step Simple Onboarding */}
          <HowItWorks />

          {/* Final Turf Owner CTA */}
          <section className="relative py-20 sm:py-28 px-4 sm:px-8 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] glow-orb -z-10 opacity-30" />
            
            <div className="relative mx-auto max-w-4xl text-center z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary mb-6">
                <Zap className="h-3.5 w-3.5" />
                <span>Zero Double Bookings Guaranteed</span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground mb-6 tracking-tight leading-tight">
                Ready to transform your <br className="hidden sm:inline" />
                <span className="text-primary text-glow">sports facility operations?</span>
              </h2>
              
              <p className="text-base sm:text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
                Set up your courts in under 2 minutes. Gain live scheduling, instant counter POS billing, automated WhatsApp alerts, and online revenue growth.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                <Link href={isLoggedIn ? "/dashboard" : "/register"} className="w-full sm:w-auto">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto h-13 px-8 text-base rounded-2xl shadow-lg shadow-primary/25 font-bold cursor-pointer">
                    <span className="flex items-center gap-2.5">
                      {isLoggedIn ? "Open Management Hub" : "Start Free 14-Day Pilot"}
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Button>
                </Link>
              </div>

              {/* Trust badges */}
              <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm text-muted-foreground font-medium">
                {["Instant Setup", "No Hardware Lock-in", "24/7 Priority Support"].map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <FaqSection />
        </div>
      )}
    </>
  )
}

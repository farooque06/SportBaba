"use client"

import { Button } from "@/components/ui/Button"
import { ArrowRight, Play, Sparkles } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useSession } from "next-auth/react"

export function Hero({ isLoggedIn: initialIsLoggedIn }: { isLoggedIn?: boolean }) {
  const { status } = useSession()
  const isLoggedIn = status === "authenticated"
  return (
    <section className="relative pt-28 sm:pt-36 pb-16 sm:pb-24 px-5 sm:px-8 overflow-hidden w-full min-h-[90vh] flex flex-col justify-center">
      {/* Background layers */}
      <div className="absolute inset-0 -z-20">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/60 to-background z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80 z-10" />
        <div className="absolute inset-0 noise-overlay z-20" />
        <Image 
          src="/images/cricket_hero_bg.png" 
          alt="Sports Arena" 
          fill 
          sizes="100vw"
          className="object-cover opacity-30 dark:opacity-20 animate-slow-zoom"
          priority
        />
      </div>

      {/* Dot grid pattern overlay */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.35] dark:opacity-[0.15]"
        style={{
          backgroundImage: 'radial-gradient(circle, var(--border) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Ambient orbs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[15%] left-[5%] w-[500px] h-[500px] bg-primary/8 rounded-full blur-[140px] animate-float opacity-60" />
        <div className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] animate-float opacity-40" style={{ animationDelay: '-4s' }} />
        {/* Radial spotlight from top center */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/4 w-[800px] h-[600px] bg-primary/6 rounded-full blur-[180px]" />
      </div>
      
      <div className="relative mx-auto max-w-5xl text-center flex flex-col items-center z-30">
        {/* Badge */}
        <div className="reveal-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/8 border border-primary/15 text-xs font-medium text-primary mb-8 shadow-sm">
          <Sparkles className="h-3.5 w-3.5" />
          <span>The #1 Indoor Sports Management Platform</span>
        </div>
        
        {/* Headline */}
        <h1 className="reveal-up delay-100">
          <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.08]">
            Manage Your Sports
          </span>
          <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] mt-1 sm:mt-2">
            Facility <span className="text-primary text-glow relative">
              Like a Pro
              {/* Underline accent */}
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/30" viewBox="0 0 200 12" fill="none" preserveAspectRatio="none">
                <path d="M2 8.5C30 3 70 1 100 4C130 7 170 9 198 3.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </span>
          </span>
        </h1>
        
        {/* Subhead */}
        <p className="reveal-up delay-200 mt-6 sm:mt-8 text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
          Automate bookings, manage memberships, track revenue, and grow your indoor sports facility — all from one beautifully simple dashboard.
        </p>

        {/* CTA buttons */}
        <div className="reveal-up delay-300 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-10 sm:mt-12 w-full sm:w-auto">
          <Link href={isLoggedIn ? "/dashboard" : "/register"} className="w-full sm:w-auto">
            <Button variant="primary" size="lg" className="w-full sm:w-auto h-12 sm:h-13 px-7 sm:px-8 text-sm sm:text-base rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all group font-semibold">
              <span className="flex items-center gap-2.5">
                {isLoggedIn ? "Open Dashboard" : "Start Free Trial"} 
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          </Link>
          <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 sm:h-13 px-7 sm:px-8 text-sm sm:text-base rounded-xl bg-card/40 backdrop-blur-xl hover:bg-card/60 border-border/60 transition-all font-semibold group">
            <Play className="mr-2 h-4 w-4 text-primary fill-primary/20 group-hover:fill-primary/40 transition-colors" />
            Watch Demo
          </Button>
        </div>

        {/* Social proof */}
        <div className="reveal-up delay-400 mt-12 sm:mt-16 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-background bg-gradient-to-br from-primary/40 to-primary/10" />
              ))}
            </div>
            <span className="font-medium">500+ facilities</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-border" />
          <div className="flex items-center gap-1.5">
            {[1,2,3,4,5].map(i => (
              <svg key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="font-medium ml-1">4.9/5 rating</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-border" />
          <span className="font-medium">No credit card required</span>
        </div>

        {/* Stats bar */}
        <div className="reveal-up delay-500 mt-14 sm:mt-20 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 w-full max-w-3xl">
          {[
            { label: "Booking Speed", value: "< 1s" },
            { label: "Uptime", value: "99.9%" },
            { label: "Active Users", value: "50k+" },
            { label: "Revenue Boost", value: "+24%" }
          ].map((stat, i) => (
            <div key={i} className="group flex flex-col items-center p-4 sm:p-5 rounded-2xl bg-card/30 backdrop-blur-xl border border-border/40 hover:border-primary/25 transition-all duration-300 hover:-translate-y-1 border-shimmer">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-xl sm:text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

"use client"

import { Button } from "@/components/ui/Button"
import { ArrowRight, Star, Users, Zap, Trophy } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useSession } from "next-auth/react"

export function SportSection({ isLoggedIn: initialIsLoggedIn }: { isLoggedIn?: boolean }) {
  const { status } = useSession()
  const isLoggedIn = status === "authenticated"
  const sports = [
    {
      title: "Futsal & Indoor Football",
      subtitle: "Pitch Management",
      description: "Manage multiple courts, automate time-slot bookings, handle walk-ins, and track usage metrics — all with zero friction.",
      image: "/images/footshall_card_bg.png",
      features: ["Multi-court management", "Walk-in & online bookings", "Peak-hour pricing"],
      cta: isLoggedIn ? "Open Football Dashboard" : "Explore Football Tools",
      rating: "4.9",
      facilities: "200+",
    },
    {
      title: "Cricket Nets & Arenas",
      subtitle: "Net Management",
      description: "Streamline net bookings, manage bowling machines, coordinate umpire schedules, and automate billing for every session.",
      image: "/images/cricshall_card_bg.png",
      features: ["Net & lane allocation", "Equipment tracking", "Session billing automation"],
      cta: isLoggedIn ? "Open Cricket Dashboard" : "Explore Cricket Tools",
      rating: "4.8",
      facilities: "150+",
    },
  ]

  return (
    <section id="sports" className="py-20 sm:py-28 md:py-36 px-5 sm:px-8 relative overflow-hidden bg-background">
      {/* Ambient */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] glow-orb -z-10 opacity-40 animate-pulse-soft" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] glow-orb -z-10 opacity-25 animate-pulse-soft" style={{ animationDelay: '3s' }} />
      
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="reveal-up mb-14 sm:mb-20 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/8 border border-primary/15 text-xs font-medium text-primary">
            <Zap className="h-3.5 w-3.5" />
            <span>Built for Every Sport</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight max-w-3xl mx-auto">
            One platform, every{" "}
            <span className="text-primary">indoor sport</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Whether you run football pitches, cricket nets, or multi-sport complexes — SportBaba adapts to your exact workflow.
          </p>
        </div>

        {/* Sport Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          {sports.map((sport, idx) => (
            <div 
              key={idx} 
              className={`reveal-up ${idx === 1 ? 'delay-200' : ''} group relative overflow-hidden rounded-3xl border border-border/40 bg-card/40 backdrop-blur-xl shadow-sm hover:shadow-lg transition-all duration-500 hover:-translate-y-1 border-shimmer`}
            >
              {/* Image */}
              <div className="relative h-56 sm:h-64 overflow-hidden">
                <Image 
                  src={sport.image} 
                  alt={sport.title} 
                  fill 
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover opacity-70 group-hover:opacity-85 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                
                {/* Floating badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <div className="px-3 py-1 rounded-lg bg-primary/90 text-primary-foreground text-xs font-semibold shadow-lg shadow-primary/20">
                    {sport.subtitle}
                  </div>
                </div>
                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-background/80 backdrop-blur-md border border-border/30 text-xs font-medium">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {sport.rating}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 sm:p-8 space-y-5">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mb-2">{sport.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{sport.description}</p>
                </div>

                {/* Feature pills */}
                <div className="flex flex-wrap gap-2">
                  {sport.features.map((feat, i) => (
                    <span key={i} className="px-3 py-1 rounded-lg bg-muted/60 text-xs font-medium text-muted-foreground border border-border/30">
                      {feat}
                    </span>
                  ))}
                </div>

                {/* Bottom bar */}
                <div className="flex items-center justify-between pt-3 border-t border-border/40">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="font-medium">{sport.facilities} facilities</span>
                  </div>
                  <Link href={isLoggedIn ? "/dashboard" : "/register"}>
                    <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/8 font-medium group/btn text-sm">
                      {sport.cta}
                      <ArrowRight className="ml-1.5 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional sport hint */}
        <div className="reveal-up delay-300 mt-10 sm:mt-14 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Also supporting <span className="font-medium text-foreground">Badminton</span>, <span className="font-medium text-foreground">Table Tennis</span>, <span className="font-medium text-foreground">Basketball</span>, and more
          </p>
          <Link href={isLoggedIn ? "/dashboard" : "/register"}>
            <Button variant="outline" size="md" className="rounded-xl font-medium text-sm border-border/60 hover:border-primary/30 hover:bg-primary/5 transition-all">
              View All Supported Sports
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

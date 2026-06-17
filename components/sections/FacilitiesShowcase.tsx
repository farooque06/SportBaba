"use client"

import Link from "next/link"
import { ArrowRight, MapPin, Trophy, Star } from "lucide-react"

interface Facility {
  id: string;
  name: string;
  slug: string;
  sport_type: string;
  logo_url: string | null;
}

export function FacilitiesShowcase({ facilities }: { facilities: Facility[] }) {
  if (!facilities || facilities.length === 0) return null

  // Helper to generate a consistent gradient background based on the facility name
  const getGradient = (name: string) => {
    const colors = [
      "from-emerald-500/20 to-teal-500/20",
      "from-blue-500/20 to-indigo-500/20",
      "from-purple-500/20 to-pink-500/20",
      "from-orange-500/20 to-red-500/20",
      "from-primary/20 to-primary/5",
    ]
    const index = name.length % colors.length
    return colors[index]
  }

  return (
    <section className="py-16 sm:py-24 relative overflow-hidden bg-background border-y border-border/40" id="find-turf">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 mb-10 md:mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter italic uppercase text-foreground leading-none mb-3">
            Featured <span className="text-primary text-glow">Venues</span>
          </h2>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs md:text-sm opacity-70">
            Book top-rated pitches near you instantly
          </p>
        </div>
        
        <Link 
          href="/facilities" 
          className="hidden md:flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors group"
        >
          View All Venues
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Horizontal Scroll Snapping Container */}
      <div className="w-full overflow-x-auto pb-8 hide-scrollbar snap-x snap-mandatory px-5 sm:px-8 md:px-[calc(50vw-36rem)] flex gap-4 sm:gap-6">
        {/* Spacer for proper alignment on large screens */}
        <div className="hidden md:block min-w-[1px] shrink-0" />

        {facilities.map((facility) => (
          <Link 
            key={facility.id} 
            href={`/${facility.slug}`}
            className="group relative flex-none w-[280px] sm:w-[320px] snap-center sm:snap-start bg-card/40 backdrop-blur-sm border border-border/50 rounded-3xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
          >
            {/* Image / Gradient Placeholder */}
            <div className={`h-40 sm:h-48 w-full bg-gradient-to-br ${getGradient(facility.name)} relative overflow-hidden flex items-center justify-center`}>
              {facility.logo_url ? (
                <img 
                  src={facility.logo_url} 
                  alt={facility.name} 
                  className="w-full h-full object-cover mix-blend-overlay opacity-80 group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <Trophy className="h-16 w-16 text-foreground/20 group-hover:scale-110 transition-transform duration-500" />
              )}
              
              {/* Badge */}
              <div className="absolute top-4 left-4 px-3 py-1 bg-background/80 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest border border-border/50 text-foreground">
                {facility.sport_type}
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <h3 className="text-xl font-black uppercase tracking-tight italic mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                {facility.name}
              </h3>
              
              <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-6">
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                  4.9
                </span>
                <span className="flex items-center gap-1 truncate">
                  <MapPin className="h-3.5 w-3.5" />
                  Book Now
                </span>
              </div>

              <div className="w-full py-3 bg-primary/10 text-primary border border-primary/20 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                Select Time
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}

        {/* "View All" Card at the end */}
        <Link 
          href="/facilities"
          className="group relative flex-none w-[280px] sm:w-[320px] snap-center sm:snap-start bg-card/20 border-2 border-dashed border-border/50 rounded-3xl overflow-hidden hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 flex flex-col items-center justify-center p-8 text-center min-h-[300px]"
        >
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
            <ArrowRight className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-black uppercase tracking-tight italic mb-2">View All Venues</h3>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
            Discover more pitches, courts, and fields in your area
          </p>
        </Link>
        
        {/* Spacer for proper alignment on right edge */}
        <div className="min-w-[1px] md:min-w-[calc(50vw-36rem)] shrink-0" />
      </div>

      <div className="md:hidden mt-4 px-5 flex justify-center">
        <Link 
          href="/facilities" 
          className="px-6 py-3 rounded-full bg-muted text-foreground text-[10px] font-black uppercase tracking-widest border border-border/50 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
        >
          Browse Directory
        </Link>
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  )
}

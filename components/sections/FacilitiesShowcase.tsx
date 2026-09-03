"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { ArrowRight, MapPin, Trophy, Star, Search, Filter, Sparkles, Clock, CheckCircle2 } from "lucide-react"

interface Facility {
  id: string;
  name: string;
  slug: string;
  sport_type: string;
  logo_url: string | null;
}

export function FacilitiesShowcase({ facilities }: { facilities: Facility[] }) {
  const [activeCategory, setActiveCategory] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState<string>("")

  // Listen for custom search/filter events emitted by the Hero
  useEffect(() => {
    const handleHeroSearch = (e: CustomEvent) => {
      if (typeof e.detail === 'string') setSearchTerm(e.detail)
    }
    const handleHeroSport = (e: CustomEvent) => {
      if (typeof e.detail === 'string') setActiveCategory(e.detail)
    }

    window.addEventListener('lp-search' as any, handleHeroSearch)
    window.addEventListener('lp-sport-filter' as any, handleHeroSport)

    return () => {
      window.removeEventListener('lp-search' as any, handleHeroSearch)
      window.removeEventListener('lp-sport-filter' as any, handleHeroSport)
    }
  }, [])

  const categories = [
    { label: "All Sports", value: "all" },
    { label: "⚽ Futsal & Football", value: "futsal" },
    { label: "🏏 Cricket Lanes", value: "cricket" },
    { label: "🏸 Badminton", value: "badminton" },
    { label: "🏀 Basketball", value: "basketball" },
  ]

  const filteredFacilities = useMemo(() => {
    if (!facilities) return []
    return facilities.filter(f => {
      const matchCat = activeCategory === "all" || 
        f.sport_type?.toLowerCase().includes(activeCategory.toLowerCase()) ||
        f.name.toLowerCase().includes(activeCategory.toLowerCase())

      const matchSearch = !searchTerm.trim() || 
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.sport_type?.toLowerCase().includes(searchTerm.toLowerCase())

      return matchCat && matchSearch
    })
  }, [facilities, activeCategory, searchTerm])

  const getGradient = (name: string) => {
    const colors = [
      "from-emerald-500/20 via-teal-500/10 to-transparent",
      "from-blue-500/20 via-indigo-500/10 to-transparent",
      "from-purple-500/20 via-pink-500/10 to-transparent",
      "from-orange-500/20 via-red-500/10 to-transparent",
      "from-primary/20 via-primary/5 to-transparent",
    ]
    const index = name.length % colors.length
    return colors[index]
  }

  return (
    <section className="py-20 sm:py-28 relative overflow-hidden bg-background border-y border-border/40" id="find-turf">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] glow-orb -translate-y-1/2 opacity-20 pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Instant Online Booking</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
              Featured Venues & <span className="text-primary text-glow">Live Turfs</span>
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base mt-2 max-w-xl font-medium">
              Find verified sports facilities with live time-slot availability and instant receipt generation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              href="/facilities" 
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-card border border-border/80 hover:border-primary/40 hover:bg-muted text-xs sm:text-sm font-bold text-foreground transition-all shadow-xs group"
            >
              <span>Explore All Venues</span>
              <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Filter Tabs & Live Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
          {/* Categories Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
            {categories.map(cat => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setActiveCategory(cat.value)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === cat.value
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]'
                    : 'bg-card/70 border border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Quick Filter Search */}
          <div className="relative min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by venue name..."
              className="w-full h-10 bg-card/60 border border-border/70 rounded-xl pl-9 pr-4 text-xs font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Facilities Grid */}
        {filteredFacilities.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-border/80 bg-card/30">
            <Trophy className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <h4 className="text-base font-bold text-foreground">No matching venues found</h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Try adjusting your sport category or search keywords to find available courts.
            </p>
            <button
              onClick={() => { setActiveCategory('all'); setSearchTerm(''); }}
              className="mt-4 px-4 py-2 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary hover:text-primary-foreground transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredFacilities.map((facility) => (
              <Link 
                key={facility.id} 
                href={`/${facility.slug}`}
                className="group flex flex-col bg-card/60 backdrop-blur-xl border border-border/70 rounded-3xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/10 relative"
              >
                {/* Header Banner */}
                <div className={`h-44 w-full bg-gradient-to-br ${getGradient(facility.name)} relative overflow-hidden flex items-center justify-center p-4`}>
                  {facility.logo_url ? (
                    <img 
                      src={facility.logo_url} 
                      alt={facility.name} 
                      className="w-full h-full object-cover mix-blend-overlay opacity-80 group-hover:scale-105 transition-transform duration-500 rounded-2xl"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-2xl bg-card/50 border border-border/60 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500 shadow-lg">
                      <Trophy className="h-10 w-10 stroke-[1.5]" />
                    </div>
                  )}
                  
                  {/* Badge */}
                  <div className="absolute top-3.5 left-3.5 px-3 py-1 bg-background/90 backdrop-blur-md rounded-full text-[10px] font-extrabold uppercase tracking-wider border border-border/60 text-foreground flex items-center gap-1 shadow-sm">
                    <span>{facility.sport_type || 'Sports Venue'}</span>
                  </div>

                  <div className="absolute top-3.5 right-3.5 px-2.5 py-1 bg-emerald-500/20 backdrop-blur-md rounded-full text-[10px] font-bold text-emerald-500 border border-emerald-500/30 flex items-center gap-1 shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Open Slots</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-lg font-extrabold text-foreground tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
                      {facility.name}
                    </h3>
                    
                    <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium mt-1.5">
                      <span className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star className="h-3.5 w-3.5 fill-amber-400" />
                        4.9
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                        Live Online Booking
                      </span>
                    </div>
                  </div>

                  {/* Booking CTA Button */}
                  <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                    <span className="text-xs font-bold text-primary flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> Book 30-120 Min
                    </span>
                    <div className="h-9 px-4 rounded-xl bg-primary/10 group-hover:bg-primary text-primary group-hover:text-primary-foreground text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs">
                      <span>Reserve Slot</span>
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </section>
  )
}

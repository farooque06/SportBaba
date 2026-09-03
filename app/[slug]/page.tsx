import { notFound } from "next/navigation"
import { getPublicFacility } from "@/lib/actions/public"
import { MapPin, Trophy, Clock, CheckCircle2, ShieldCheck, ArrowLeft, Home } from "lucide-react"
import { PublicBookingEngine } from "@/components/booking/PublicBookingEngine"
import Link from "next/link"

export default async function PublicStorefrontPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const facility = await getPublicFacility(slug)

  if (!facility) {
    return notFound()
  }

  const openTime = facility.config?.open_time || '6:00 AM'
  const closeTime = facility.config?.close_time || '10:00 PM'

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary pb-24">
      {/* Top Navigation Bar with Back & Home actions */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/60 shadow-xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            {/* Direct Back to Landing Page Button */}
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border/70 text-xs sm:text-sm font-semibold text-foreground hover:bg-muted hover:border-border transition-all shadow-xs group"
            >
              <ArrowLeft className="h-4 w-4 text-primary group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Home</span>
            </Link>

            {/* View other venues */}
            <Link 
              href="/facilities" 
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <span>Browse Other Venues</span>
            </Link>
          </div>

          {/* Brand Logo & Verification Badge */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 text-foreground font-extrabold tracking-tight text-sm sm:text-base hover:opacity-90 transition-opacity">
              <div className="h-7 w-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-black text-xs shadow-xs">
                S
              </div>
              <span className="hidden sm:inline">Sport<span className="text-primary">Baba</span></span>
            </Link>

            <div className="h-4 w-px bg-border/60 mx-1 hidden sm:block" />

            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span className="text-[11px] font-bold">Verified Partner</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Venue Header Banner */}
      <section className="relative overflow-hidden pt-6 pb-8 sm:pt-10 sm:pb-12 border-b border-border/40 bg-gradient-to-b from-card/30 via-background to-background print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            <div className="flex items-start gap-4 sm:gap-6">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-card border border-border shadow-md overflow-hidden flex items-center justify-center shrink-0">
                {facility.logo_url ? (
                  <img src={facility.logo_url} alt={facility.name} className="w-full h-full object-cover" />
                ) : (
                  <Trophy className="h-8 w-8 text-primary" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold uppercase tracking-wider">
                    {facility.sport_type || 'Sports Venue'}
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground font-medium">Instant Confirmation</span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                  {facility.name}
                </h1>

                <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
                  Select your pitch, pick an available slot, and reserve your match in under a minute.
                </p>
              </div>
            </div>

            {/* Quick Facility Highlights */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="px-4 py-2.5 rounded-xl bg-card/60 border border-border/60 text-xs">
                <span className="text-muted-foreground text-[10px] uppercase tracking-wider block font-bold">Courts Available</span>
                <span className="font-extrabold text-foreground text-sm">{facility.resources.length} Pitches</span>
              </div>
              <div className="px-4 py-2.5 rounded-xl bg-card/60 border border-border/60 text-xs">
                <span className="text-muted-foreground text-[10px] uppercase tracking-wider block font-bold">Operating Hours</span>
                <span className="font-extrabold text-foreground text-sm">{openTime} – {closeTime}</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Booking Canvas */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        <PublicBookingEngine 
          facilityId={facility.id} 
          resources={facility.resources} 
          config={facility.config} 
          facilityMeta={{
            name: facility.name,
            slug: facility.slug,
            logo_url: facility.logo_url,
            sport_type: facility.sport_type
          }}
        />
      </main>
    </div>
  )
}

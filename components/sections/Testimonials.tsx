import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    name: "Rajesh Sharma",
    role: "Owner, ProPlay Arena",
    location: "Kathmandu",
    quote: "SportBaba completely transformed how we manage our 8-court facility. Bookings that used to take phone calls now happen automatically. Our revenue jumped 30% in the first quarter.",
    rating: 5,
    sport: "Futsal",
  },
  {
    name: "Anita Gurung",
    role: "Manager, CricZone Indoor",
    location: "Pokhara",
    quote: "The real-time booking engine is a game-changer. We went from double-bookings every week to zero conflicts. Staff loves the dashboard — it's incredibly intuitive.",
    rating: 5,
    sport: "Cricket",
  },
  {
    name: "Bikram Thapa",
    role: "Director, SportHub Nepal",
    location: "Lalitpur",
    quote: "We manage 3 locations with SportBaba. The multi-location dashboard gives me complete visibility. Billing is fully automated now — we save 15+ hours every week.",
    rating: 5,
    sport: "Multi-sport",
  },
]

export function Testimonials() {
  return (
    <section className="py-20 sm:py-28 md:py-36 px-5 sm:px-8 relative overflow-hidden bg-background">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-14 sm:mb-20 space-y-4">
          <div className="reveal-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/8 border border-primary/15 text-xs font-medium text-primary mx-auto">
            <Star className="h-3.5 w-3.5 fill-primary" />
            <span>Loved by Facility Owners</span>
          </div>
          <h2 className="reveal-up delay-100 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight max-w-3xl mx-auto">
            Real results from{" "}
            <span className="text-primary">real facilities</span>
          </h2>
          <p className="reveal-up delay-200 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            See how sports facility owners across Nepal are transforming their operations with SportBaba.
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {testimonials.map((t, idx) => (
            <div 
              key={idx} 
              className={`reveal-up ${idx === 1 ? 'delay-100' : idx === 2 ? 'delay-200' : ''} group relative p-7 sm:p-8 rounded-2xl bg-card/50 backdrop-blur-xl border border-border/40 hover:border-primary/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border-shimmer`}
            >
              {/* Quote icon */}
              <div className="absolute top-6 right-6 opacity-[0.06]">
                <Quote className="h-16 w-16 text-foreground" />
              </div>

              {/* Rating */}
              <div className="flex gap-0.5 mb-5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm sm:text-[15px] text-foreground/80 leading-relaxed mb-8 relative z-10">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-5 border-t border-border/40">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/5 flex items-center justify-center text-sm font-bold text-primary">
                  {t.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{t.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{t.role} · {t.location}</p>
                </div>
                <span className="text-[10px] font-medium text-primary bg-primary/8 px-2 py-0.5 rounded-md shrink-0">
                  {t.sport}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

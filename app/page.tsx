import { auth } from "@/auth"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Hero } from "@/components/sections/Hero"
import { FacilitiesShowcase } from "@/components/sections/FacilitiesShowcase"
import { getFeaturedFacilities } from "@/lib/actions/public"
import { SportSection } from "@/components/sections/SportSection"
import { Button } from "@/components/ui/Button"
import { FeaturesBento } from "@/components/sections/FeaturesBento"
import { Testimonials } from "@/components/sections/Testimonials"
import { ArrowRight, ShieldCheck, Activity, Globe, Zap, LayoutDashboard, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default async function Home() {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const featuredFacilities = await getFeaturedFacilities(10);

  return (
    <main className="min-h-screen selection:bg-primary/20 selection:text-primary bg-background">
      <Navbar isLoggedIn={isLoggedIn} />
      
      <Hero isLoggedIn={isLoggedIn} />

      <FacilitiesShowcase facilities={featuredFacilities} />

      {/* Scrolling Marquee — Social Proof */}
      <div className="relative border-y border-border/40 bg-card/20 backdrop-blur-xl overflow-hidden py-4">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(2)].map((_, setIdx) => (
            <div key={setIdx} className="flex items-center gap-8 sm:gap-12 px-4 sm:px-6">
              {[
                "⚡ High-Performance Scheduler",
                "📈 Live Revenue Analytics",
                "🛡️ Enterprise-Grade Security",
                "👥 Automated Member Portals",
                "🏆 Tournament Bracket Engine",
                "💳 Recurring Billing Systems",
                "📊 Multi-court Resource Syncing",
                "📱 Custom Branded Widgets",
                "🌐 API Integration Core",
              ].map((item, i) => (
                <span key={i} className="text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap">
                  {item}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <FeaturesBento />

      <div className="section-line mx-auto max-w-6xl" />
      
      <SportSection isLoggedIn={isLoggedIn} />

      <div className="section-line mx-auto max-w-6xl" />

      {/* Trust & Infrastructure Section */}
      <section className="py-20 sm:py-28 md:py-36 relative overflow-hidden bg-background">
        <div className="absolute inset-0 glow-orb opacity-20 pointer-events-none" />
        
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 sm:gap-20 items-center">
            {/* Left content */}
            <div className="reveal-up space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/8 border border-primary/15 text-xs font-medium text-primary">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Enterprise Ready</span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
                Built for scale,{" "}
                <span className="text-primary">trusted by pros</span>
              </h2>
              
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-lg">
                Orchestrate multi-sport complexes, track complex member lifecycles, and scale without limits. SportBaba provides the security, performance, and uptime that global venues trust.
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-8 sm:gap-12 items-center">
                {[
                  { value: "99.99%", label: "Uptime SLA" },
                  { value: "SOC-2", label: "Security Level" },
                  { value: "24/7/365", label: "Support Desk" },
                ].map((stat, i) => (
                  <div key={i} className="flex flex-col">
                    <span className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">{stat.value}</span>
                    <span className="text-xs font-medium text-muted-foreground mt-1 uppercase tracking-wider">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Right — Feature cards */}
            <div className="reveal-up delay-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: Activity, label: "Real-time Sync Engine", desc: "Event-driven synchronization. Zero double-bookings across all platforms." },
                { icon: LayoutDashboard, label: "Unified Command Center", desc: "High-level executive insights and multi-location telemetry." },
                { icon: Globe, label: "Global Scale Core", desc: "Standardize operations across multiple cities, currencies, and tax codes." },
                { icon: Zap, label: "Rapid Integration API", desc: "Live-sync with your existing access control gates, lights, and POS systems." }
              ].map((item, i) => (
                <div key={i} className="p-6 rounded-2xl bg-card/50 backdrop-blur-xl border border-border/40 space-y-4 group hover:border-primary/25 transition-all duration-300 hover:-translate-y-1 border-shimmer">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold tracking-tight mb-1">{item.label}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="section-line mx-auto max-w-6xl" />

      {/* Testimonials */}
      <Testimonials />

      <div className="section-line mx-auto max-w-6xl" />

      {/* Final CTA */}
      <section className="relative py-24 sm:py-32 md:py-40 px-5 sm:px-8 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background -z-20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] glow-orb -z-10 opacity-40" />
        <div className="absolute inset-0 noise-overlay z-0" />
        
        <div className="relative mx-auto max-w-4xl text-center z-10">
          <div className="reveal-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/8 border border-primary/15 text-xs font-medium text-primary mb-6">
            <Zap className="h-3.5 w-3.5" />
            <span>Scale Your Operations</span>
          </div>
          
          <h2 className="reveal-up delay-100 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight leading-tight">
            Ready to upgrade your{" "}
            <span className="text-primary text-glow">sports infrastructure?</span>
          </h2>
          
          <p className="reveal-up delay-200 text-base sm:text-lg md:text-xl text-muted-foreground mb-10 sm:mb-12 max-w-2xl mx-auto leading-relaxed">
            Empower your operations team and delight your players. Start your pilot or book a consultation with our enterprise solutions architects today.
          </p>

          {/* CTA buttons */}
          <div className="reveal-up delay-300 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <Link href={isLoggedIn ? "/dashboard" : "/register"} className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-auto h-13 px-8 text-base rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all group font-semibold">
                <span className="flex items-center gap-2.5">
                  {isLoggedIn ? "Open Dashboard" : "Start Enterprise Pilot"}
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </Link>
            {!isLoggedIn && (
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-13 px-8 text-base rounded-xl border-border/60 hover:border-primary/30 hover:bg-primary/5 transition-all font-semibold">
                Request Architecture Demo
              </Button>
            )}
          </div>
          
          {/* Trust signals */}
          <div className="reveal-up delay-400 mt-10 sm:mt-14 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {["Flexible Pilots", "Dedicated Setup Support", "SOC-2 Compliant"].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span className="font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

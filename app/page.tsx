import { auth } from "@clerk/nextjs/server"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Hero } from "@/components/sections/Hero"
import { SportSection } from "@/components/sections/SportSection"
import { Button } from "@/components/ui/Button"
import { FeaturesBento } from "@/components/sections/FeaturesBento"
import { ArrowRight, Zap } from "lucide-react"
import Link from "next/link"

export default async function Home() {
  const { userId } = await auth();
  const isLoggedIn = !!userId;

  return (
    <main className="min-h-screen selection:bg-primary selection:text-white bg-background overflow-hidden">
      <Navbar isLoggedIn={isLoggedIn} />
      
      <Hero isLoggedIn={isLoggedIn} />

      <FeaturesBento />
      
      <SportSection isLoggedIn={isLoggedIn} />

      {/* Trust Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-muted/20 skew-y-1 -z-10"></div>
        <div className="mx-auto max-w-7xl px-8 flex flex-col items-center">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-12 opacity-50">Powering Elite Facilities Worldwide</p>
          <div className="flex flex-wrap justify-center gap-12 lg:gap-24 grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
             <span className="text-2xl sm:text-4xl font-black italic tracking-tighter">FOOTLOCKER</span>
             <span className="text-2xl sm:text-4xl font-black italic tracking-tighter">DECATHLON</span>
             <span className="text-2xl sm:text-4xl font-black italic tracking-tighter">PREMIER LEAGUE</span>
             <span className="text-2xl sm:text-4xl font-black italic tracking-tighter">ICC</span>
          </div>
        </div>
      </section>

      {/* Global CTA - Artisan Redesign */}
      <section className="relative py-32 sm:py-48 px-8 overflow-hidden">
        {/* Mesh Gradient Background */}
        <div className="absolute inset-0 bg-foreground -z-20"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(34,197,94,0.25),transparent)] -z-10 opacity-60"></div>
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-10 animate-pulse-soft"></div>
        
        <div className="relative mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-10 mx-auto">
             <Zap className="h-3 w-3 fill-current" />
             <span>Instant Setup</span>
          </div>
          
          <h2 className="text-5xl sm:text-7xl md:text-9xl font-black text-background mb-10 tracking-[ -0.05em] leading-[0.85] italic uppercase">
            Ready to lead<br/> the game?
          </h2>
          
          <p className="text-lg sm:text-xl text-background/60 mb-14 max-w-2xl mx-auto font-medium tracking-tight leading-relaxed">
            Join <span className="text-background font-black">500+ facility owners</span> who have automated their operations and scaled revenue with SportBaba. The standard in modern sports management.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
             <Link href={isLoggedIn ? "/dashboard" : "/sign-up"}>
               <Button variant="primary" size="lg" className="h-20 px-16 text-xl rounded-3xl shadow-[0_20px_40px_rgba(34,197,94,0.3)] hover:scale-105 active:scale-95 transition-all group">
                 {isLoggedIn ? "Open Dashboard" : "Start 14-Day Free Trial"}
                 <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
               </Button>
             </Link>
             {!isLoggedIn && (
               <Button variant="outline" size="lg" className="h-20 px-12 text-xl rounded-3xl border-background/20 text-background hover:bg-background/10 backdrop-blur-md">
                 Talk to Sales
               </Button>
             )}
          </div>
          <p className="mt-10 text-[10px] font-black text-background/30 uppercase tracking-[0.2em] italic">No credit card required. Cancel anytime.</p>
        </div>
      </section>

      <Footer />
    </main>
  )
}

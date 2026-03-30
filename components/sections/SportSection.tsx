import { Button } from "@/components/ui/Button"
import { Trophy, Activity, ArrowRight, Star, Zap } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function SportSection({ isLoggedIn }: { isLoggedIn?: boolean }) {
  return (
    <section className="py-40 px-8 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10 opacity-50"></div>
      
      <div className="mx-auto max-w-7xl">
        <div className="mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
            <Trophy className="h-3 w-3" />
            <span>Select Your Arena</span>
          </div>
          <h2 className="text-5xl sm:text-7xl font-black tracking-tighter italic uppercase text-foreground leading-[0.85]">
            Engineered for <br/><span className="text-primary">Every Arena.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16">
          {/* Footshall Portal */}
          <div className="group relative h-[650px] sm:h-[750px] overflow-hidden rounded-[48px] sm:rounded-[64px] border border-border/50 shadow-2xl transition-all duration-700 hover:-translate-y-4">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110 opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-60"
              style={{ backgroundImage: `url('/images/football_bg.png')` }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
            
            <div className="absolute inset-0 p-10 sm:p-16 flex flex-col justify-end">
              <div className="space-y-8 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="px-4 py-2 rounded-xl bg-primary text-background text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20">FOOTSHALL</div>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(i => <Star key={i} className="h-3 w-3 fill-primary text-primary" />)}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-5xl sm:text-7xl font-black text-foreground tracking-[-0.04em] italic uppercase leading-[0.85]">Elite Football <br/>Execution.</h3>
                  <p className="text-lg sm:text-xl text-muted-foreground max-w-md font-medium tracking-tight opacity-80">Built for pitch owners who demand pure automation, peak occupancy, and absolute performance.</p>
                </div>

                <Link href={isLoggedIn ? "/dashboard" : "/sign-up"}>
                  <Button variant="primary" size="lg" className="w-full gap-4 h-24 text-2xl rounded-[32px] shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all group border-4 border-white/10 uppercase font-black italic">
                    {isLoggedIn ? "Open Football Portal" : "Deploy Football Engine"} 
                    <ArrowRight className="h-8 w-8 group-hover:translate-x-2 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Decorative Overlay Badge */}
            <div className="absolute top-10 right-10 h-24 w-24 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 flex flex-col items-center justify-center rotate-12 group-hover:rotate-0 transition-transform duration-700">
               <Zap className="h-8 w-8 text-primary mb-1 animate-pulse" />
               <span className="text-[8px] font-black uppercase tracking-widest text-primary">Live</span>
            </div>
          </div>

          {/* Cricshall Portal */}
          <div className="group relative h-[650px] sm:h-[750px] overflow-hidden rounded-[48px] sm:rounded-[64px] border border-border/50 shadow-2xl transition-all duration-700 hover:-translate-y-4">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110 opacity-30 grayscale group-hover:grayscale-0 group-hover:opacity-50"
              style={{ backgroundImage: `url('/images/cricket_bg.png')` }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
            
            <div className="absolute inset-0 p-10 sm:p-16 flex flex-col justify-end">
              <div className="space-y-8 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="px-4 py-2 rounded-xl bg-primary text-background text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20">CRICSHALL</div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary italic opacity-80">Premium Standard</span>
                </div>

                <div className="space-y-4">
                  <h3 className="text-5xl sm:text-7xl font-black text-foreground tracking-[-0.04em] italic uppercase leading-[0.85]">Absolute Cricket <br/>Precision.</h3>
                  <p className="text-lg sm:text-xl text-muted-foreground max-w-md font-medium tracking-tight opacity-80">Manage nets, elite umpires, and real-time scorecards with the industry's most precise management stack.</p>
                </div>

                <Link href={isLoggedIn ? "/dashboard" : "/sign-up"}>
                  <Button variant="primary" size="lg" className="w-full gap-4 h-24 text-2xl rounded-[32px] shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all group border-4 border-white/10 uppercase font-black italic">
                    {isLoggedIn ? "Open Cricket Portal" : "Deploy Cricket Engine"}
                    <ArrowRight className="h-8 w-8 group-hover:translate-x-2 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>

             {/* Decorative Overlay Badge */}
             <div className="absolute top-10 right-10 h-24 w-24 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 flex flex-col items-center justify-center -rotate-12 group-hover:rotate-0 transition-transform duration-700">
               <Activity className="h-8 w-8 text-primary mb-1 animate-pulse" />
               <span className="text-[8px] font-black uppercase tracking-widest text-primary">Pro</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

import { Button } from "@/components/ui/Button"
import { ArrowRight, Play, Activity, Zap, TrendingUp, Target } from "lucide-react"
import Link from "next/link"

export function Hero({ isLoggedIn }: { isLoggedIn?: boolean }) {
  return (
    <section className="relative pt-32 pb-0 px-6 overflow-hidden w-full">
      {/* Artisan Mesh Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1000px] bg-[radial-gradient(circle_at_50%_-20%,rgba(34,197,94,0.15),transparent)] pointer-events-none -z-10"></div>
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 animate-pulse-soft"></div>
      <div className="absolute top-[40%] left-[-10%] w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] -z-10 animate-pulse-soft" style={{ animationDelay: '2s' }}></div>

      <div className="relative mx-auto max-w-7xl text-center flex flex-col items-center">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-card/40 backdrop-blur-md border border-border/50 text-[10px] sm:text-xs font-black text-foreground uppercase tracking-[0.2em] mb-10 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="w-2 h-2 rounded-full bg-primary mr-3 animate-pulse"></span>
          Powering 500+ Global Sports Hubs
        </div>
        
        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-[-0.04em] leading-[0.85] mb-10 text-foreground max-w-5xl italic uppercase animate-in fade-in slide-in-from-bottom-8 duration-1000">
          Management<br/>
          <span className="text-primary italic">Engine</span> for <br className="hidden sm:block"/>
          Champions.
        </h1>
        
        <p className="text-lg md:text-2xl text-muted-foreground max-w-3xl mb-14 font-medium leading-relaxed tracking-tight opacity-80 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
          The elite SaaS standard for <strong className="text-foreground italic uppercase">Footshall</strong> and <strong className="text-foreground italic uppercase">Cricshall</strong> facility owners who demand absolute performance.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-24 w-full sm:w-auto px-4 z-20 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
          <Link href={isLoggedIn ? "/dashboard" : "/sign-up"}>
            <Button variant="primary" size="lg" className="h-20 px-12 text-xl rounded-3xl shadow-[0_20px_40px_rgba(34,197,94,0.3)] hover:scale-105 active:scale-95 transition-all group">
              {isLoggedIn ? "Open Dashboard" : "Start Free Trial"} 
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Button variant="outline" size="lg" className="h-20 px-12 text-xl rounded-3xl border-border bg-card/40 backdrop-blur-md hover:bg-muted/50 transition-all">
            <Play className="mr-3 h-6 w-6 fill-current" /> Watch Demo
          </Button>
        </div>

        {/* Artisan Mock Display Center */}
        <div className="w-full max-w-6xl px-4 animate-in fade-in slide-in-from-bottom-24 duration-1500 delay-500">
           <div className="relative group">
             {/* Glow Effect */}
             <div className="absolute inset-0 bg-primary/20 rounded-[48px] blur-[60px] opacity-0 group-hover:opacity-40 transition-opacity duration-1000"></div>
             
             <div className="aspect-[16/9] rounded-t-[48px] sm:rounded-t-[64px] bg-card/60 backdrop-blur-2xl border-x-[8px] border-t-[8px] sm:border-x-[12px] sm:border-t-[12px] border-border/80 shadow-[0_40px_100px_rgba(0,0,0,0.5)] p-6 sm:p-12 overflow-hidden relative">
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background via-background/80 to-transparent z-10 pointer-events-none"></div>
                
                {/* Artisan Dash UI Layer */}
                <div className="w-full h-full bg-muted/20 rounded-[40px] p-8 sm:p-12 border border-white/5 relative">
                   <div className="flex items-center justify-between mb-12">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-primary/20 rounded-xl flex items-center justify-center">
                          <Zap className="h-5 w-5 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <div className="h-3 w-32 bg-primary/20 rounded-full"></div>
                          <div className="h-2 w-20 bg-muted/40 rounded-full"></div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="h-8 w-8 bg-muted/40 rounded-lg"></div>
                        <div className="h-8 w-8 bg-muted/40 rounded-lg"></div>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10 mb-12">
                      {[
                        { icon: TrendingUp, label: "Revenue", val: "+24%" },
                        { icon: Target, label: "Occupancy", val: "92%" },
                        { icon: Activity, label: "Active", val: "1.2k" },
                        { icon: Activity, label: "Health", val: "Elite" }
                      ].map((stat, i) => (
                        <div key={i} className="bg-card/40 border border-white/5 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
                           <stat.icon className="h-6 w-6 text-primary mb-4" />
                           <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 mb-1">{stat.label}</p>
                           <p className="text-2xl font-black italic tracking-tighter uppercase">{stat.val}</p>
                        </div>
                      ))}
                   </div>
                   
                   <div className="space-y-6">
                      <div className="h-6 w-full bg-muted/30 rounded-2xl border border-white/5"></div>
                      <div className="h-6 w-3/4 bg-muted/30 rounded-2xl border border-white/5"></div>
                      <div className="h-6 w-full bg-muted/30 rounded-2xl border border-white/5"></div>
                   </div>

                   {/* Floating Real-Time Analytics Badge */}
                   <div className="absolute top-[30%] right-[10%] p-8 rounded-[40px] bg-primary text-primary-foreground shadow-[0_40px_100px_rgba(34,197,94,0.5)] z-20 scale-75 sm:scale-100 animate-float border-4 border-white/20">
                      <div className="flex items-center gap-4 mb-4">
                        <Activity className="h-10 w-10 animate-pulse" />
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Traffic Flow</p>
                          <p className="text-4xl font-black italic uppercase tracking-tighter tracking-[-0.05em]">High</p>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-white/20">
                        <p className="text-xs font-bold uppercase tracking-widest">+180% Intensity</p>
                      </div>
                   </div>
                </div>
             </div>
           </div>
        </div>
      </div>
    </section>
  )
}

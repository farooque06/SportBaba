import { Card } from "@/components/ui/Card"
import { Calendar, Trophy, Activity, Wallet, Users, Zap } from "lucide-react"

export function FeaturesBento() {
  return (
    <section className="py-40 px-8 relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 opacity-30"></div>

      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-32 space-y-4">
          <h2 className="text-5xl md:text-8xl font-black mb-6 tracking-tighter text-foreground italic uppercase leading-[0.85]">
            Built for <br/><span className="text-primary italic">the Elite.</span>
          </h2>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto font-medium tracking-tight opacity-70">
            Absolute command over your facility, from real-time booking engines to elite tournament logistics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-8 h-auto md:h-[900px]">
          {/* Main Booking Feature */}
          <Card className="md:col-span-2 md:row-span-2 flex flex-col justify-between p-12 sm:p-16 bg-primary/5 border-primary/20 rounded-[48px] sm:rounded-[64px] relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 -z-10"></div>
            <div>
              <div className="w-20 h-20 rounded-3xl bg-primary text-primary-foreground flex items-center justify-center mb-10 shadow-[0_20px_40px_rgba(34,197,94,0.4)]">
                <Calendar className="h-10 w-10" />
              </div>
              <h3 className="text-5xl sm:text-6xl font-black mb-8 tracking-tighter italic uppercase leading-[0.9]">Visual Hub <br/>Engine</h3>
              <p className="text-xl text-muted-foreground font-medium max-w-md tracking-tight opacity-80 leading-relaxed">
                A lightning-fast, glass-styled calendar that dominates peak hours with zero friction.
              </p>
            </div>
            <div className="mt-16 p-8 sm:p-10 rounded-[32px] bg-card/60 backdrop-blur-xl border border-primary/20 shadow-2xl transform group-hover:-translate-y-4 transition-all duration-700">
               <div className="flex gap-4 mb-6">
                  <div className="h-4 w-32 bg-primary/30 rounded-full"></div>
                  <div className="h-4 w-16 bg-muted rounded-full"></div>
               </div>
               <div className="grid grid-cols-7 gap-3">
                  {Array.from({length: 14}).map((_, i) => (
                    <div key={i} className={`h-10 rounded-xl transition-all duration-500 ${i % 3 === 0 ? 'bg-primary/40' : 'bg-muted/40'}`}></div>
                  ))}
               </div>
            </div>
          </Card>

          {/* Tournament Generator */}
          <Card className="md:col-span-2 p-12 sm:p-16 flex flex-col sm:flex-row items-center gap-12 group bg-card transition-all hover:border-primary/40 rounded-[48px] sm:rounded-[64px] shadow-xl">
            <div className="flex-1">
              <div className="w-16 h-16 rounded-2xl bg-muted/50 border border-border/50 text-foreground flex items-center justify-center mb-8">
                <Trophy className="h-8 w-8" />
              </div>
              <h3 className="text-4xl font-black mb-6 tracking-tighter italic uppercase">League Master</h3>
              <p className="text-muted-foreground font-medium tracking-tight opacity-80">Auto-generate brackets, points tables, and match schedules in absolute seconds.</p>
            </div>
            <div className="w-48 h-48 rounded-full border-[12px] border-primary/10 flex items-center justify-center text-primary font-black text-4xl group-hover:rotate-12 group-hover:scale-110 transition-all shadow-inner italic">
               STAGE
            </div>
          </Card>

          {/* Revenue & Analytics */}
          <Card className="p-12 bg-card rounded-[48px] shadow-xl hover:border-primary/40 transition-all">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 border border-border/50 text-foreground flex items-center justify-center mb-10">
              <Wallet className="h-8 w-8" />
            </div>
            <h3 className="text-3xl font-black mb-6 tracking-tighter italic uppercase">Profit Pulse</h3>
            <div className="flex items-end gap-3 mb-4">
              <span className="text-5xl font-black tracking-tighter italic text-primary">+24%</span>
              <span className="text-[10px] font-black text-primary mb-2 uppercase tracking-widest border border-primary/20 px-2 py-0.5 rounded-md">ELITE</span>
            </div>
            <p className="text-sm text-muted-foreground font-medium tracking-tight">Revenue intelligence across all nodes.</p>
          </Card>

          {/* Members & Staff */}
          <Card className="p-12 bg-card rounded-[48px] shadow-xl hover:border-primary/40 transition-all relative overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 border border-border/50 text-foreground flex items-center justify-center mb-10">
              <Users className="h-8 w-8" />
            </div>
            <h3 className="text-3xl font-black mb-6 tracking-tighter italic uppercase">Team Hub</h3>
            <p className="text-sm text-muted-foreground font-medium tracking-tight mb-8">Unified command for players and elite roster management.</p>
            <div className="flex -space-x-5 px-2">
               {[1,2,3,4,5].map(i => (
                 <div key={i} className="w-14 h-14 rounded-full border-4 border-card bg-muted/50 shadow-lg flex items-center justify-center overflow-hidden">
                   <div className="w-full h-full bg-gradient-to-br from-primary/20 to-transparent"></div>
                 </div>
               ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}

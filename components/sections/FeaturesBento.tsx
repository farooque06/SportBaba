import { Card } from "@/components/ui/Card"
import { Calendar, Trophy, TrendingUp, Users, Zap, Shield, Clock, CreditCard } from "lucide-react"

export function FeaturesBento() {
  return (
    <section id="features" className="py-20 sm:py-28 md:py-36 px-5 sm:px-8 relative overflow-hidden bg-background">
      {/* Subtle ambient glow */}
      <div className="absolute top-1/3 left-0 w-[600px] h-[600px] glow-orb -z-10 opacity-40 animate-pulse-soft" />
      <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] glow-orb -z-10 opacity-25 animate-pulse-soft" style={{ animationDelay: '2s' }} />

      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-14 sm:mb-20 space-y-4">
          <div className="reveal-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/8 border border-primary/15 text-xs font-medium text-primary mx-auto">
            <Shield className="h-3.5 w-3.5" />
            <span>Powerful Features</span>
          </div>
          <h2 className="reveal-up delay-100 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight max-w-3xl mx-auto">
            Everything you need to run a{" "}
            <span className="text-primary">world-class facility</span>
          </h2>
          <p className="reveal-up delay-200 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            From booking management to revenue analytics — our professional toolkit gives you complete control over every aspect of your sports venue.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 sm:gap-5">
          
          {/* Main Feature: Smart Booking (spans 4 cols) */}
          <Card className="reveal-up delay-200 md:col-span-4 md:row-span-2 flex flex-col justify-between p-7 sm:p-10 bg-card/50 backdrop-blur-xl border-border/40 rounded-3xl relative overflow-hidden group shadow-sm border-shimmer">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] glow-orb -translate-y-1/2 translate-x-1/2 -z-10 group-hover:opacity-80 transition-opacity duration-700 opacity-30" />
            
            <div>
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary/15 group-hover:scale-105 transition-all duration-300">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3 text-foreground">Smart Booking Engine</h3>
              <p className="text-base text-muted-foreground max-w-md leading-relaxed mb-6">
                The most intuitive booking calendar in the industry. Real-time sync, zero double-bookings, and instant confirmations.
              </p>
              <div className="flex items-center gap-2 bg-primary/5 border border-primary/10 w-fit px-3 py-1.5 rounded-full">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-medium text-primary">Live — syncing across all devices</span>
              </div>
            </div>
            
            {/* Visual calendar mockup */}
            <div className="mt-8 sm:mt-10 p-5 sm:p-7 rounded-2xl bg-background/60 backdrop-blur-xl border border-border/50 shadow-sm group-hover:-translate-y-2 transition-transform duration-500">
              <div className="flex justify-between items-center mb-5">
                <div className="flex gap-2.5">
                  <div className="h-3 w-24 bg-primary/15 rounded-full" />
                  <div className="h-3 w-12 bg-muted-foreground/10 rounded-full" />
                </div>
                <div className="h-8 w-8 rounded-lg bg-primary/8 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2 sm:gap-3">
                {Array.from({length: 14}).map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-8 sm:h-10 rounded-lg transition-all duration-300 hover:scale-110 cursor-pointer border border-transparent hover:border-primary/20 ${
                      i % 3 === 0 
                        ? 'bg-primary/20 shadow-sm' 
                        : i % 5 === 0 
                          ? 'bg-amber-500/10' 
                          : 'bg-muted/40'
                    }`}
                  />
                ))}
              </div>
            </div>
          </Card>

          {/* Tournament Management (spans 2 cols) */}
          <Card className="reveal-up delay-300 md:col-span-2 p-7 sm:p-8 bg-card/50 backdrop-blur-xl rounded-3xl shadow-sm border-border/40 group overflow-hidden relative border-shimmer">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary/15 group-hover:scale-105 transition-all duration-300">
                <Trophy className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold tracking-tight mb-2">Tournaments</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">Auto-generate brackets, manage leagues, and track scores with precision.</p>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">16</span>
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground">Active Leagues</p>
                  <p className="text-xs text-muted-foreground">Running now</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Revenue Analytics (spans 2 cols) */}
          <Card className="reveal-up delay-400 md:col-span-2 p-7 sm:p-8 bg-card/50 backdrop-blur-xl rounded-3xl shadow-sm border-border/40 group overflow-hidden relative border-shimmer">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary/15 group-hover:scale-105 transition-all duration-300">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold tracking-tight mb-2">Revenue Analytics</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">Deep financial insights, projections, and automated billing reports.</p>
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold tracking-tight text-primary text-glow">+24%</span>
                <span className="text-xs font-medium text-primary bg-primary/8 px-2 py-0.5 rounded-md mb-1">↑ revenue</span>
              </div>
            </div>
          </Card>

          {/* Bottom Row: 3 equal features */}
          <Card className="reveal-up delay-400 md:col-span-2 p-7 sm:p-8 bg-card/50 backdrop-blur-xl rounded-3xl shadow-sm border-border/40 group overflow-hidden relative border-shimmer">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary/15 group-hover:scale-105 transition-all duration-300">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold tracking-tight mb-2">Member Management</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">Player profiles, membership tiers, attendance tracking — all centralized.</p>
              <div className="flex -space-x-2.5">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-card bg-gradient-to-br from-primary/30 to-primary/5 shadow-sm hover:scale-110 hover:-translate-y-1 transition-transform cursor-pointer" />
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-card bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shadow-lg shadow-primary/20">
                  +12k
                </div>
              </div>
            </div>
          </Card>

          <Card className="reveal-up delay-500 md:col-span-2 p-7 sm:p-8 bg-card/50 backdrop-blur-xl rounded-3xl shadow-sm border-border/40 group overflow-hidden relative border-shimmer">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary/15 group-hover:scale-105 transition-all duration-300">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold tracking-tight mb-2">Real-time Scheduling</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Dynamic court allocation with conflict detection and instant notifications for staff.</p>
            </div>
          </Card>

          <Card className="reveal-up delay-600 md:col-span-2 p-7 sm:p-8 bg-card/50 backdrop-blur-xl rounded-3xl shadow-sm border-border/40 group overflow-hidden relative border-shimmer">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary/15 group-hover:scale-105 transition-all duration-300">
                <CreditCard className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold tracking-tight mb-2">Automated Billing</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Invoicing, payment tracking, subscription management — zero manual work needed.</p>
            </div>
          </Card>

        </div>
      </div>
    </section>
  )
}

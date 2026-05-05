import { supabase } from "@/lib/supabase"
import { CreditCard, CheckCircle2, Clock, Zap, ShieldCheck, ArrowRight, Activity } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { formatCurrency } from "@/lib/utils"
import { getFacilityId } from "@/lib/get-facility-id"

export default async function BillingPage() {
  const facilityId = await getFacilityId()
  
  const { data: facility } = await supabase
    .from('facilities')
    .select('*')
    .eq('id', facilityId)
    .single()

  const daysLeft = facility?.trial_end 
    ? Math.max(0, Math.ceil((new Date(facility.trial_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0
    
  const isTrial = facility?.subscription_status === 'trialing'
  const isPaid = facility?.subscription_status === 'active'

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-32 px-4 md:px-0">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-6xl font-black tracking-tighter italic uppercase text-foreground leading-[0.8] mb-4">Billing</h1>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] opacity-70">Manage your subscription and facility limits</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Current Plan Card */}
        <div className="lg:col-span-2 space-y-10">
          <div className="relative overflow-hidden p-1 rounded-[48px] bg-gradient-to-br from-primary/30 via-primary/5 to-transparent border border-primary/10 shadow-2xl">
            <div className="bg-[#0A0A0A]/90 backdrop-blur-2xl rounded-[46px] p-8 md:p-12 relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.6)] animate-pulse" />
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.25em]">{isTrial ? "Trial Period" : "Pro Member"}</p>
                  </div>
                  <h2 className="text-5xl font-black tracking-tighter text-foreground italic uppercase leading-none">
                    {isTrial ? "Discovery" : "Professional"}
                  </h2>
                </div>
                <div className="bg-white text-black px-6 py-2.5 rounded-full font-black uppercase tracking-widest text-[10px] shadow-xl">
                  {isPaid ? "Active Access" : "Trial Window"}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                   <div className="flex items-center gap-5">
                      <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                         <Clock className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1 opacity-50">Expiration</p>
                        <p className="text-lg font-black text-foreground italic truncate">
                          {isTrial ? `${daysLeft} Days Left` : "Auto-Renewing"}
                        </p>
                      </div>
                   </div>
                   <div className="flex items-center gap-5">
                      <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                         <Zap className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1 opacity-50">Capacities</p>
                        <p className="text-lg font-black text-foreground italic">Unlimited Power</p>
                      </div>
                   </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-[32px] p-8 border border-white/5 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Activity className="h-12 w-12 text-primary animate-pulse" />
                   </div>
                   <div className="flex justify-between items-center mb-4 relative z-10">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Trial Usage</p>
                      <p className="text-[10px] font-black text-primary italic">{daysLeft}/30</p>
                   </div>
                   <div className="h-4 w-full bg-black/40 rounded-full overflow-hidden mb-5 border border-white/5 p-0.5 relative z-10">
                      <div className="h-full bg-primary rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" style={{ width: `${(daysLeft / 30) * 100}%` }}></div>
                   </div>
                   <p className="text-[9px] text-white/30 font-bold text-center italic uppercase tracking-tighter leading-none relative z-10">Upgrade to preserve historical analytics</p>
                </div>
              </div>
            </div>
            
            {/* Background decorative elements */}
            <div className="absolute bottom-0 right-0 p-12 opacity-5 pointer-events-none">
               <ShieldCheck className="h-64 w-64 text-primary rotate-12" />
            </div>
          </div>
          
          {/* Why Upgrade Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
             {[
               { title: "Elite Support", desc: "Direct line to our senior implementation engineers." },
               { title: "Brand Control", desc: "Customized dashboard with your logo and colors." },
               { title: "Full Audit", desc: "Track every staff interaction with granular logs." }
             ].map((feat, idx) => (
               <div key={idx} className="p-8 rounded-[32px] bg-card border border-border/50 hover:bg-primary/5 transition-all duration-300 group cursor-default">
                  <p className="text-[10px] font-black uppercase tracking-[0.1em] mb-2 text-primary opacity-60 group-hover:opacity-100 transition-opacity">{feat.title}</p>
                  <p className="text-[11px] text-muted-foreground font-bold leading-relaxed">{feat.desc}</p>
               </div>
             ))}
          </div>
        </div>

        {/* Pricing Column */}
        <div className="space-y-8">
           <div className="p-1 rounded-[48px] bg-foreground shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] overflow-hidden relative group">
              <div className="bg-background rounded-[46px] p-10 h-full flex flex-col">
                 <div className="flex justify-between items-center mb-10">
                    <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] italic border border-primary/20">Artisan Tier</span>
                    <CreditCard className="h-6 w-6 text-muted-foreground opacity-20" />
                 </div>
                 
                 <div className="mb-10">
                    <div className="flex items-baseline gap-1">
                       <span className="text-6xl font-black italic tracking-tighter leading-none">NRS 9,999</span>
                       <span className="text-muted-foreground font-bold text-xs tracking-widest uppercase opacity-40">/mo</span>
                    </div>
                    <p className="text-2xl font-black tracking-tighter uppercase italic mt-4 text-foreground/90">Unlimited Growth</p>
                 </div>

                 <div className="space-y-5 mb-12 flex-1">
                    {[
                      "Unrestricted Resources", 
                      "Real-time Smart Insights", 
                      "League Management Engine", 
                      "Unlimited Staff Members",
                      "Automated Cloud Backups"
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-4 group/item">
                         <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center group-hover/item:bg-primary transition-colors">
                            <CheckCircle2 className="h-3 w-3 text-primary group-hover/item:text-background" />
                         </div>
                         <span className="text-xs font-bold text-muted-foreground group-hover/item:text-foreground transition-colors">{item}</span>
                      </div>
                    ))}
                 </div>

                 <Button variant="primary" className="w-full h-20 rounded-[30px] font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 group-hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-2xl shadow-primary/20">
                    Activate Pro
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                 </Button>
                 
                 <p className="text-[10px] text-muted-foreground/40 text-center font-black mt-8 uppercase tracking-widest italic leading-none">
                    No contracts. No hidden fees.
                 </p>
              </div>
           </div>
           
           {/* Contact Support */}
           <div className="p-10 rounded-[48px] border border-dashed border-border/60 flex flex-col items-center text-center space-y-4 hover:bg-muted/10 transition-all cursor-pointer group hover:border-primary/40">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 group-hover:text-primary/60 transition-colors">Bespoke Solutions</p>
              <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors italic leading-relaxed">Scaling beyond limits? Join our enterprise partnership program.</p>
           </div>
        </div>
      </div>
    </div>
  )
}

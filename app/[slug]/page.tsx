import { notFound } from "next/navigation"
import { getPublicFacility } from "@/lib/actions/public"
import { MapPin, Phone, Star, ArrowRight, ShieldCheck, Trophy, Clock } from "lucide-react"
import { PublicBookingEngine } from "@/components/booking/PublicBookingEngine"

export default async function PublicStorefrontPage({ params }: { params: { slug: string } }) {
  const facility = await getPublicFacility(params.slug)

  if (!facility) {
    return notFound()
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-primary/30">
      {/* Hero Section */}
      <div className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0">
           <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] opacity-50 -translate-y-1/2 translate-x-1/3" />
           <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[100px] opacity-30 translate-y-1/3 -translate-x-1/3" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
           <div className="flex justify-center mb-8">
             <div className="h-24 w-24 rounded-full bg-card/50 border border-white/10 backdrop-blur-md flex items-center justify-center shadow-2xl overflow-hidden shadow-primary/20">
               {facility.logo_url ? (
                 <img src={facility.logo_url} alt={facility.name} className="w-full h-full object-cover" />
               ) : (
                 <Trophy className="h-10 w-10 text-primary" />
               )}
             </div>
           </div>

           <div className="text-center max-w-4xl mx-auto space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                 <ShieldCheck className="h-3 w-3" />
                 Official SportBaba Partner
              </div>
              
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.85] text-transparent bg-clip-text bg-gradient-to-br from-white to-white/40 pb-2">
                 {facility.name}
              </h1>
              
              <p className="text-lg md:text-xl font-bold tracking-tight text-white/50 max-w-2xl mx-auto">
                 Book your next match instantly. Secure your slot at {facility.name} through our live booking engine.
              </p>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-40">
        {/* Booking Engine Section */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[40px] p-8 md:p-12 relative overflow-hidden shadow-2xl">
           <div className="absolute top-0 right-0 p-8 opacity-5 -translate-y-1/4 translate-x-1/4 pointer-events-none">
              <Trophy className="h-96 w-96 text-primary" />
           </div>

           <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-white/10 pb-8">
              <div>
                <h2 className="text-4xl font-black tracking-tighter uppercase italic text-white flex items-center gap-4">
                  Reserve a Pitch
                </h2>
                <p className="text-sm font-bold uppercase tracking-widest text-primary/80 mt-2">Live Availability & Instant Confirmation</p>
              </div>
              <div className="mt-6 md:mt-0 flex gap-4">
                 <div className="text-center px-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Total Courts</p>
                    <p className="text-2xl font-black italic">{facility.resources.length}</p>
                 </div>
                 <div className="w-px h-12 bg-white/10" />
                 <div className="text-center px-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Open Until</p>
                    <p className="text-2xl font-black italic">{facility.config?.close_time || '10:00 PM'}</p>
                 </div>
              </div>
           </div>

           {/* The Public Booking UI Component */}
           <PublicBookingEngine 
              facilityId={facility.id} 
              resources={facility.resources} 
              config={facility.config} 
           />
        </div>
      </div>
    </div>
  )
}

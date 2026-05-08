"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { QuickBookingModal } from "./QuickBookingModal"
import { fetchFacility } from "@/lib/actions/facility"
import { useRouter } from "next/navigation"

export function BookingsHeader({ facilityId, resources }: { facilityId: string, resources: any[] }) {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [openHour, setOpenHour] = useState(8)
  const [closeHour, setCloseHour] = useState(22)

  useEffect(() => {
    async function loadConfig() {
       const facility = await fetchFacility(facilityId)
       if (facility?.config?.open_time) {
          setOpenHour(parseInt(facility.config.open_time.split(':')[0]))
       }
       if (facility?.config?.close_time) {
          setCloseHour(parseInt(facility.config.close_time.split(':')[0]))
       }
    }
    loadConfig()
  }, [facilityId])

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/10">
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-1">
             <div className="h-2 w-10 bg-primary rounded-full shadow-[0_0_15px_rgba(34,197,94,0.4)]" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/80">Operations Hub</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic uppercase text-foreground leading-[0.8] mb-2">
            Bookings
          </h1>
          <p className="text-muted-foreground font-black uppercase tracking-[0.2em] text-[10px] opacity-40">Internal Record Management & Match Logistics</p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setIsModalOpen(true)}
          className="h-16 px-10 rounded-[28px] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl flex items-center justify-center gap-4 group overflow-hidden relative active:scale-95 transition-all"
        >
          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          <div className="h-6 w-6 rounded-xl bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform duration-500">
             <Plus className="h-4 w-4" />
          </div>
          Quick Entry
        </Button>
      </div>

      <QuickBookingModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        facilityId={facilityId}
        resources={resources}
        selectedDate={new Date()}
        openHour={openHour}
        closeHour={closeHour}
        onSuccess={() => router.refresh()}
      />
    </>
  )
}

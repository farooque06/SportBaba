"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { QuickBookingModal } from "./QuickBookingModal"
import { fetchFacility } from "@/lib/actions/facility"

export function BookingsHeader({ facilityId, resources }: { facilityId: string, resources: any[] }) {
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-black tracking-tighter italic uppercase text-foreground leading-[0.8] mb-2">Bookings</h1>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] opacity-70">Internal Record Management & Logistics</p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setIsModalOpen(true)}
          className="h-14 px-8 rounded-[24px] font-black uppercase tracking-widest text-xs shadow-2xl flex items-center justify-center gap-3 group overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-white/10 translate-y-full hover:translate-y-0 transition-transform" />
          <Plus className="h-4 w-4" />
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
      />
    </>
  )
}

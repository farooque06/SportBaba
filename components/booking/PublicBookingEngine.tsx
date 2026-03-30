"use client"

import { useState, useEffect } from "react"
import { Calendar as CalendarIcon, Clock, ArrowRight, User, Phone, CheckCircle2, AlertCircle } from "lucide-react"
import { getPublicAvailability, submitPublicBooking } from "@/lib/actions/public"
import { formatCurrency } from "@/lib/utils"

export function PublicBookingEngine({ facilityId, resources, config }: { facilityId: string, resources: any[], config: any }) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [availability, setAvailability] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedTime, setSelectedTime] = useState<{ resourceId: string, start: Date, end: Date, price: number } | null>(null)
  
  // Checkout Form
  const [guestName, setGuestName] = useState("")
  const [guestPhone, setGuestPhone] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  // Facility Hours
  const openHour = config?.open_time ? parseInt(config.open_time.split(':')[0]) : 8
  const closeHour = config?.close_time ? parseInt(config.close_time.split(':')[0]) : 22
  const slots = Array.from({ length: (closeHour - openHour + 1) * 2 }, (_, i) => {
    const hour = Math.floor(i / 2) + openHour
    const minute = (i % 2) * 30
    return { hour, minute }
  })

  useEffect(() => {
    async function fetchAvail() {
      setLoading(true)
      const data = await getPublicAvailability(facilityId, selectedDate.toISOString())
      setAvailability(data)
      setLoading(false)
    }
    fetchAvail()
    setSelectedTime(null) // Reset selection when date changes
  }, [selectedDate, facilityId])

  const isSlotBooked = (resourceId: string, hour: number, minute: number) => {
    const slotStart = new Date(selectedDate)
    slotStart.setHours(hour, minute, 0, 0)
    
    const slotEnd = new Date(selectedDate)
    slotEnd.setHours(hour, minute + 30, 0, 0)

    return availability.some(b => {
      if (b.resource_id !== resourceId) return false
      const bStart = new Date(b.start_time)
      const bEnd = new Date(b.end_time)
      return slotStart < bEnd && slotEnd > bStart
    })
  }

  const handleSelectSlot = (resourceId: string, hour: number, minute: number, priceHour: number) => {
    const start = new Date(selectedDate)
    start.setHours(hour, minute, 0, 0)
    
    // Default setting a 1-hour session
    const end = new Date(start)
    end.setHours(hour + 1, minute, 0, 0)

    setSelectedTime({ resourceId, start, end, price: priceHour })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTime) return
    setIsSubmitting(true)

    const res = await submitPublicBooking({
      facility_id: facilityId,
      resource_id: selectedTime.resourceId,
      guest_name: guestName,
      guest_phone: guestPhone,
      start_time: selectedTime.start.toISOString(),
      end_time: selectedTime.end.toISOString(),
      total_price: selectedTime.price
    })

    setIsSubmitting(false)
    if (res.success) {
      setSuccess(true)
    } else {
      alert("Failed to book slot. It might have just been taken!")
    }
  }

  if (success) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8 bg-black/20 rounded-[32px] border border-emerald-500/20 text-center animate-in zoom-in fade-in duration-500">
         <div className="h-24 w-24 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 text-emerald-400 mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <CheckCircle2 className="h-10 w-10" />
         </div>
         <h3 className="text-4xl font-black italic tracking-tighter uppercase mb-2">Pitch Locked!</h3>
         <p className="text-white/50 text-sm max-w-sm mb-8 font-bold leading-relaxed">Your request is verified. Please arrive 15 minutes early and pay at the counter to start your session.</p>
         
         <div className="bg-background/50 p-6 rounded-2xl border border-white/5 w-full max-w-sm text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
               <CalendarIcon className="h-32 w-32 -rotate-12" />
            </div>
            <p className="text-[10px] font-black uppercase text-white/40 mb-1 tracking-widest">Player Name</p>
            <p className="font-bold mb-4 text-lg">{guestName}</p>
            
            <p className="text-[10px] font-black uppercase text-white/40 mb-1 tracking-widest">Session Time</p>
            <p className="font-bold text-primary italic text-xl">
               {selectedTime?.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
         </div>

         <button onClick={() => window.location.reload()} className="mt-8 text-xs font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">
            Book Another Slot
         </button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
       {/* Left Column: Date & Time Picker */}
       <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-white/5 border border-white/10 p-2 md:p-3 rounded-2xl flex items-center gap-4">
             <input 
               type="date"
               min={new Date().toISOString().split('T')[0]}
               value={selectedDate.toISOString().split('T')[0]}
               onChange={(e) => e.target.value && setSelectedDate(new Date(e.target.value))}
               className="bg-background text-foreground px-4 py-3 md:py-4 rounded-xl font-bold font-sans flex-1 outline-none focus:ring-2 ring-primary/50 transition-all border border-white/5"
             />
             <div className="px-6 text-center hidden md:block border-l border-white/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Status</p>
                <div className="flex items-center gap-2">
                   <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                   <span className="text-xs font-bold text-white/60">Accepting Instantly</span>
                </div>
             </div>
          </div>

          <div className={`overflow-x-auto custom-scrollbar rounded-3xl border border-white/10 bg-black/40 transition-opacity ${loading ? 'opacity-50 blur-sm' : 'opacity-100'}`}>
             <div className="min-w-[700px]">
                <div className="grid border-b border-white/10 bg-white/5" style={{ gridTemplateColumns: `100px repeat(${resources.length}, 1fr)` }}>
                  <div className="p-4 border-r border-white/10 text-[10px] font-black uppercase tracking-widest text-primary">Time</div>
                  {resources.map(res => (
                     <div key={res.id} className="p-4 border-r border-white/10 last:border-0 text-center font-black tracking-tight uppercase text-sm">{res.name}</div>
                  ))}
                </div>

                <div className="max-h-[500px] overflow-y-auto">
                   {slots.map(slot => (
                     <div key={`${slot.hour}-${slot.minute}`} className="grid border-b border-white/5 hover:bg-white/[0.02]" style={{ gridTemplateColumns: `100px repeat(${resources.length}, 1fr)` }}>
                        <div className="p-3 border-r border-white/10 text-[10px] text-white/40 font-bold flex items-center justify-center bg-white/[0.02]">
                           {slot.hour < 10 ? `0${slot.hour}` : slot.hour}:{slot.minute === 0 ? '00' : '30'}
                        </div>
                        {resources.map(res => {
                           const isBooked = isSlotBooked(res.id, slot.hour, slot.minute)
                           
                           // Check if this specific slot is exactly the one currently selected by the user
                           const isSelected = selectedTime?.resourceId === res.id && 
                                              selectedTime?.start.getHours() === slot.hour && 
                                              selectedTime?.start.getMinutes() === slot.minute;

                           return (
                             <div 
                               key={res.id} 
                               onClick={() => !isBooked && handleSelectSlot(res.id, slot.hour, slot.minute, res.base_price)}
                               className={`p-1 border-r border-white/5 last:border-0 h-12 transition-all cursor-pointer relative group
                                 ${isBooked ? 'bg-red-500/10 cursor-not-allowed overflow-hidden' : 
                                   isSelected ? 'bg-primary border-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] z-10 scale-105 rounded-xl' : 'hover:bg-primary/20'}
                               `}
                             >
                               {isBooked && (
                                 <div className="absolute inset-x-1 inset-y-1 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center justify-center">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-red-400">Booked</span>
                                 </div>
                               )}
                               {!isBooked && !isSelected && (
                                 <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[10px] font-bold text-primary">Select</span>
                                 </div>
                               )}
                               {isSelected && (
                                 <div className="absolute inset-0 flex items-center justify-center h-full">
                                    <CheckCircle2 className="h-4 w-4 text-background" />
                                 </div>
                               )}
                             </div>
                           )
                        })}
                     </div>
                   ))}
                </div>
             </div>
          </div>
       </div>

       {/* Right Column: Checkout Summary */}
       <div className="bg-foreground text-background rounded-[32px] p-8 shadow-2xl relative overflow-hidden flex flex-col h-full animate-in fade-in slide-in-from-right-8 duration-700">
          <div className="absolute -bottom-24 -right-24 h-64 w-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />
          
          <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-8 leading-none">Your<br />Match</h3>

          {!selectedTime ? (
             <div className="flex-1 flex flex-col items-center justify-center opacity-30 text-center space-y-4 py-12">
                <Clock className="h-16 w-16 mb-2" />
                <p className="text-2xl font-black italic tracking-tighter">SELECT A SLOT</p>
                <p className="text-[10px] font-bold uppercase tracking-widest max-w-[200px]">Tap any available green time block on the grid to reserve it.</p>
             </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-6 relative z-10 animate-in fade-in duration-300">
               <div className="p-4 bg-background/5 border border-background/10 rounded-2xl relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-background/60 mb-1 ml-2">Selected Resource</p>
                  <p className="text-lg font-bold ml-2 truncate">{resources.find(r => r.id === selectedTime.resourceId)?.name}</p>
               </div>
               
               <div className="p-4 bg-background/5 border border-background/10 rounded-2xl relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-background/60 mb-1 ml-2">Session Details</p>
                  <p className="font-bold ml-2">
                    {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-2xl font-black italic tracking-tighter ml-2 text-primary">
                    {selectedTime.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {selectedTime.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
               </div>

               <div className="space-y-4 pt-4 border-t border-background/10">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-background/60 ml-2">Your Full Name</label>
                     <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-background/40" />
                        <input 
                          required
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          placeholder="John Doe"
                          className="w-full h-14 bg-background/5 border border-background/20 rounded-2xl pl-12 pr-4 text-sm font-bold outline-none focus:ring-2 ring-primary transition-all text-background placeholder:text-background/30 font-sans"
                        />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-background/60 ml-2">Phone Number</label>
                     <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-background/40" />
                        <input 
                          required
                          value={guestPhone}
                          onChange={(e) => setGuestPhone(e.target.value)}
                          placeholder="+977 98XXXXXXXX"
                          className="w-full h-14 bg-background/5 border border-background/20 rounded-2xl pl-12 pr-4 text-sm font-bold outline-none focus:ring-2 ring-primary transition-all text-background placeholder:text-background/30 font-sans"
                        />
                     </div>
                  </div>
               </div>

               <div className="mt-auto pt-6 border-t border-background/10">
                  <div className="flex justify-between items-end mb-6">
                     <p className="text-[10px] font-black uppercase tracking-widest text-background/60">Total Estimated</p>
                     <p className="text-4xl font-black italic tracking-tighter">{formatCurrency(selectedTime.price)}</p>
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-16 rounded-[24px] bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_15px_30px_-10px_rgba(var(--primary-rgb),0.5)] disabled:opacity-50"
                  >
                     {isSubmitting ? "Locking Slot..." : "Confirm Booking"}
                     {!isSubmitting && <ArrowRight className="h-4 w-4" />}
                  </button>
                  <p className="text-[9px] font-bold text-center mt-4 text-background/40 uppercase tracking-widest">Pay cash at the facility counter</p>
               </div>
            </form>
          )}
       </div>
    </div>
  )
}

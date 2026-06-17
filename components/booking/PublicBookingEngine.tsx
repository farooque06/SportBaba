"use client"

import { useState, useEffect, useMemo } from "react"
import { 
  Calendar as CalendarIcon, Clock, ArrowRight, User, Phone, 
  CheckCircle2, ChevronLeft, ChevronRight, Loader2, MapPin
} from "lucide-react"
import { getPublicAvailability, submitPublicBooking } from "@/lib/actions/public"
import { formatCurrency } from "@/lib/utils"

interface Resource {
  id: string;
  name: string;
  unit_type: string;
  base_price: number;
}

export function PublicBookingEngine({ facilityId, resources, config }: { facilityId: string, resources: Resource[], config: any }) {
  // ─── State ───
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [availability, setAvailability] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedResource, setSelectedResource] = useState<Resource | null>(resources[0] || null)
  const [selectedSlot, setSelectedSlot] = useState<{ hour: number, minute: number } | null>(null)
  const [duration, setDuration] = useState(60) // minutes
  
  // Checkout
  const [guestName, setGuestName] = useState("")
  const [guestPhone, setGuestPhone] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [step, setStep] = useState(1) // 1: Pick Resource+Date+Time, 2: Confirm & Pay

  // Facility Hours
  const openHour = config?.open_time ? parseInt(config.open_time.split(':')[0]) : 6
  const closeHour = config?.close_time ? parseInt(config.close_time.split(':')[0]) : 22

  // ─── Generate next 7 days for date selector ───
  const dateOptions = useMemo(() => {
    const dates = []
    const today = new Date()
    for (let i = 0; i < 7; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() + i)
      dates.push(d)
    }
    return dates
  }, [])

  // ─── Generate time slots ───
  const timeSlots = useMemo(() => {
    const slots: { hour: number, minute: number, label: string }[] = []
    for (let h = openHour; h < closeHour; h++) {
      for (let m = 0; m < 60; m += 30) {
        const period = h >= 12 ? 'PM' : 'AM'
        const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h
        const displayMin = m === 0 ? '00' : '30'
        slots.push({ hour: h, minute: m, label: `${displayHour}:${displayMin} ${period}` })
      }
    }
    return slots
  }, [openHour, closeHour])

  // ─── Duration options ───
  const durationOptions = [
    { value: 30, label: '30 min' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' },
  ]

  // ─── Fetch availability ───
  useEffect(() => {
    async function fetchAvail() {
      setLoading(true)
      const data = await getPublicAvailability(facilityId, selectedDate.toISOString())
      setAvailability(data)
      setLoading(false)
    }
    fetchAvail()
    setSelectedSlot(null)
  }, [selectedDate, facilityId])

  // ─── Check if a slot is in the past ───
  const isSlotPast = (hour: number, minute: number) => {
    const now = new Date()
    const slotDate = new Date(selectedDate)
    slotDate.setHours(hour, minute, 0, 0)
    return slotDate <= now
  }

  // ─── Check if a slot range is booked for a resource ───
  const isSlotBooked = (resourceId: string, hour: number, minute: number, durationMins: number) => {
    const slotStart = new Date(selectedDate)
    slotStart.setHours(hour, minute, 0, 0)
    
    const slotEnd = new Date(slotStart)
    slotEnd.setMinutes(slotEnd.getMinutes() + durationMins)

    return availability.some(b => {
      if (b.resource_id !== resourceId) return false
      const bStart = new Date(b.start_time)
      const bEnd = new Date(b.end_time)
      return slotStart < bEnd && slotEnd > bStart
    })
  }

  // ─── Computed values ───
  const selectedResourceData = selectedResource
  const totalPrice = selectedResourceData ? (selectedResourceData.base_price * (duration / 60)) : 0
  
  const startTime = useMemo(() => {
    if (!selectedSlot) return null
    const d = new Date(selectedDate)
    d.setHours(selectedSlot.hour, selectedSlot.minute, 0, 0)
    return d
  }, [selectedSlot, selectedDate])

  const endTime = useMemo(() => {
    if (!startTime) return null
    const d = new Date(startTime)
    d.setMinutes(d.getMinutes() + duration)
    return d
  }, [startTime, duration])

  // ─── Submit ───
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedResource || !startTime || !endTime) return
    setIsSubmitting(true)

    const res = await submitPublicBooking({
      facility_id: facilityId,
      resource_id: selectedResource.id,
      guest_name: guestName,
      guest_phone: guestPhone,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      total_price: totalPrice
    })

    setIsSubmitting(false)
    if (res.success) {
      setSuccess(true)
    } else {
      alert(res.error || "Failed to book. The slot may have just been taken!")
    }
  }

  // ─── Helpers ───
  const isSameDay = (d1: Date, d2: Date) => 
    d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate()

  const isToday = (d: Date) => isSameDay(d, new Date())

  // ─── Success Screen ───
  if (success) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8 bg-black/20 rounded-[32px] border border-emerald-500/20 text-center animate-in zoom-in fade-in duration-500">
         <div className="h-24 w-24 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 text-emerald-400 mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <CheckCircle2 className="h-10 w-10" />
         </div>
         <h3 className="text-4xl font-black italic tracking-tighter uppercase mb-2">Pitch Locked!</h3>
         <p className="text-white/50 text-sm max-w-sm mb-8 font-bold leading-relaxed">Your request is confirmed. Please arrive 15 minutes early and pay at the counter.</p>
         
         <div className="bg-background/50 p-6 rounded-2xl border border-white/5 w-full max-w-sm text-left space-y-3">
            <div>
              <p className="text-[10px] font-black uppercase text-white/40 tracking-widest">Player</p>
              <p className="font-bold text-lg">{guestName}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-white/40 tracking-widest">Court</p>
              <p className="font-bold">{selectedResource?.name}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-white/40 tracking-widest">When</p>
              <p className="font-bold text-primary text-xl italic">
                {startTime?.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}{" "}
                {startTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {endTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-white/40 tracking-widest">Total</p>
              <p className="font-black text-2xl">{formatCurrency(totalPrice)}</p>
            </div>
         </div>

         <button onClick={() => window.location.reload()} className="mt-8 text-xs font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">
            Book Another Slot
         </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      
      {/* ─── Step Indicators ─── */}
      <div className="flex items-center justify-center gap-3 mb-4">
        {[
          { num: 1, label: 'Select Slot' },
          { num: 2, label: 'Your Details' },
        ].map((s) => (
          <button
            key={s.num}
            onClick={() => s.num < step && setStep(s.num)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all
              ${step === s.num 
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' 
                : step > s.num 
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 cursor-pointer hover:bg-emerald-500/20' 
                  : 'bg-white/5 text-white/30 border border-white/10 cursor-default'}`}
          >
            {step > s.num ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span>{s.num}</span>}
            <span className="hidden sm:inline">{s.label}</span>
          </button>
        ))}
      </div>

      {/* ═══════════════ STEP 1: SELECT SLOT ═══════════════ */}
      {step === 1 && (
        <div className="space-y-6 animate-in fade-in duration-300">

          {/* ─── Resource Selector (if multiple) ─── */}
          {resources.length > 1 && (
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">Select Court / Pitch</p>
              <div className="flex flex-wrap gap-2">
                {resources.map(res => (
                  <button
                    key={res.id}
                    onClick={() => { setSelectedResource(res); setSelectedSlot(null) }}
                    className={`px-5 py-3 rounded-2xl text-sm font-black uppercase tracking-tight transition-all border
                      ${selectedResource?.id === res.id 
                        ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/30 scale-105' 
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'}`}
                  >
                    {res.name}
                    <span className="block text-[9px] font-bold tracking-widest mt-0.5 opacity-70">
                      {formatCurrency(res.base_price)}/hr
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ─── Date Selector (Horizontal scroll, 7 days) ─── */}
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">Select Date</p>
            <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar snap-x">
              {dateOptions.map((d, i) => (
                <button
                  key={i}
                  onClick={() => { setSelectedDate(d); setSelectedSlot(null) }}
                  className={`snap-start flex-none flex flex-col items-center px-4 sm:px-5 py-3 rounded-2xl border transition-all min-w-[72px]
                    ${isSameDay(d, selectedDate) 
                      ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/30 scale-105' 
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'}`}
                >
                  <span className="text-[9px] font-black uppercase tracking-widest opacity-70">
                    {isToday(d) ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                  <span className="text-xl font-black mt-0.5">{d.getDate()}</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest opacity-70">
                    {d.toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ─── Duration Selector ─── */}
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">Session Duration</p>
            <div className="flex flex-wrap gap-2">
              {durationOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { setDuration(opt.value); setSelectedSlot(null) }}
                  className={`px-5 py-3 rounded-2xl text-sm font-black uppercase tracking-tight transition-all border
                    ${duration === opt.value 
                      ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/30' 
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* ─── Available Time Slots Grid ─── */}
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-1">
              Available Times
              {loading && <Loader2 className="inline-block h-3 w-3 ml-2 animate-spin" />}
            </p>
            
            {!selectedResource ? (
              <div className="text-center py-12 text-white/30 border border-white/5 rounded-2xl">
                <p className="font-bold text-sm">Select a court first</p>
              </div>
            ) : (
              <div className={`grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 transition-opacity ${loading ? 'opacity-40' : ''}`}>
                {timeSlots.map((slot) => {
                  const past = isSlotPast(slot.hour, slot.minute)
                  const booked = selectedResource ? isSlotBooked(selectedResource.id, slot.hour, slot.minute, duration) : false
                  const isSelected = selectedSlot?.hour === slot.hour && selectedSlot?.minute === slot.minute
                  const unavailable = past || booked

                  return (
                    <button
                      key={`${slot.hour}-${slot.minute}`}
                      onClick={() => !unavailable && setSelectedSlot(slot)}
                      disabled={unavailable}
                      className={`relative py-3.5 px-2 rounded-xl text-sm font-bold transition-all border text-center
                        ${isSelected 
                          ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/40 scale-105 ring-2 ring-primary/30' 
                          : unavailable 
                            ? 'bg-white/[0.02] border-white/5 text-white/15 cursor-not-allowed line-through' 
                            : 'bg-white/5 border-white/10 text-white/80 hover:bg-primary/20 hover:border-primary/30 hover:text-white cursor-pointer'}`}
                    >
                      {slot.label}
                      {booked && !past && (
                        <span className="block text-[8px] font-black uppercase tracking-widest text-red-400/60 mt-0.5">Booked</span>
                      )}
                      {past && (
                        <span className="block text-[8px] font-black uppercase tracking-widest text-white/20 mt-0.5">Past</span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* ─── Continue Button ─── */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10">
            <div className="text-center sm:text-left">
              {selectedSlot && selectedResource ? (
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Estimated Total</p>
                  <p className="text-3xl font-black italic tracking-tighter">{formatCurrency(totalPrice)}</p>
                </div>
              ) : (
                <p className="text-xs font-bold text-white/30 uppercase tracking-widest">Select a time slot to continue</p>
              )}
            </div>
            <button
              onClick={() => selectedSlot && setStep(2)}
              disabled={!selectedSlot}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/30 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════ STEP 2: CONFIRM & PAY ═══════════════ */}
      {step === 2 && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            
            {/* Left: Booking Summary */}
            <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-6 space-y-5">
              <h3 className="text-xl font-black uppercase tracking-tighter italic">Booking Summary</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                  <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Court</p>
                    <p className="font-bold">{selectedResource?.name}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                  <CalendarIcon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Date</p>
                    <p className="font-bold">
                      {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                  <Clock className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Time</p>
                    <p className="font-bold text-primary text-lg italic">
                      {startTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {endTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-[10px] text-white/40 font-bold">{duration} minutes</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Total</p>
                <p className="text-4xl font-black italic tracking-tighter">{formatCurrency(totalPrice)}</p>
              </div>
            </div>

            {/* Right: Customer Form */}
            <form onSubmit={handleSubmit} className="lg:col-span-3 bg-foreground text-background rounded-3xl p-6 sm:p-8 space-y-6">
              <h3 className="text-xl font-black uppercase tracking-tighter italic">Your Details</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-background/50 ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-background/30" />
                    <input 
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full h-14 bg-background/5 border border-background/15 rounded-2xl pl-12 pr-4 text-sm font-bold outline-none focus:ring-2 ring-primary transition-all text-background placeholder:text-background/25 font-sans"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-background/50 ml-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-background/30" />
                    <input 
                      required
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="+977 98XXXXXXXX"
                      className="w-full h-14 bg-background/5 border border-background/15 rounded-2xl pl-12 pr-4 text-sm font-bold outline-none focus:ring-2 ring-primary transition-all text-background placeholder:text-background/25 font-sans"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <button 
                  type="submit"
                  disabled={isSubmitting || !guestName || !guestPhone}
                  className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_15px_30px_-10px_rgba(var(--primary-rgb),0.5)] disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Locking Slot...
                    </>
                  ) : (
                    <>
                      Confirm Booking
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
                
                <button 
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-background/40 hover:text-background/70 transition-colors"
                >
                  ← Change Slot
                </button>
                
                <p className="text-[9px] font-bold text-center text-background/30 uppercase tracking-widest">
                  Pay cash at the facility counter
                </p>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}

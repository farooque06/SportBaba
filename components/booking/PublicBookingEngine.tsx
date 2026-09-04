"use client"

import { useState, useEffect, useMemo } from "react"
import { 
  Calendar as CalendarIcon, Clock, ArrowRight, User, Phone, 
  CheckCircle2, ChevronLeft, ChevronRight, Loader2, MapPin,
  Sparkles, ShieldCheck, AlertCircle, Info, RefreshCw
} from "lucide-react"
import Link from "next/link"
import { getPublicAvailability, submitPublicBooking } from "@/lib/actions/public"
import { formatCurrency, isValidName, isValidPhone, MAX_NAME_LENGTH, MAX_PHONE_LENGTH } from "@/lib/utils"
import { PublicBookingReceipt } from "./PublicBookingReceipt"

interface Resource {
  id: string;
  name: string;
  unit_type: string;
  base_price: number;
}

interface FacilityMeta {
  name?: string;
  slug?: string;
  logo_url?: string | null;
  sport_type?: string;
}

export function PublicBookingEngine({ 
  facilityId, 
  resources, 
  config,
  facilityMeta,
  currentUser
}: { 
  facilityId: string; 
  resources: Resource[]; 
  config: any;
  facilityMeta?: FacilityMeta;
  currentUser?: any;
}) {
  // ─── State ───
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [availability, setAvailability] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedResource, setSelectedResource] = useState<Resource | null>(resources[0] || null)
  const [selectedSlot, setSelectedSlot] = useState<{ hour: number, minute: number } | null>(null)
  const [duration, setDuration] = useState(60) // minutes
  
  // Checkout
  const [guestName, setGuestName] = useState(currentUser?.name || "")
  const [guestPhone, setGuestPhone] = useState("")
  const [bookingNote, setBookingNote] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null)
  const [success, setSuccess] = useState(false)
  const [step, setStep] = useState(1) // 1: Choose Court & Slot, 2: Guest Details

  // Facility Hours
  const openHour = config?.open_time ? parseInt(config.open_time.split(':')[0]) : 6
  const closeHour = config?.close_time ? parseInt(config.close_time.split(':')[0]) : 22

  // ─── Next 14 Days selector ───
  const dateOptions = useMemo(() => {
    const dates = []
    const today = new Date()
    for (let i = 0; i < 14; i++) {
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
    { value: 30, label: '30 min', hint: 'Quick Match' },
    { value: 60, label: '1 hour', hint: 'Standard' },
    { value: 90, label: '1.5 hrs', hint: 'Extended' },
    { value: 120, label: '2 hours', hint: 'Tournament' },
  ]

  // ─── Fetch availability ───
  useEffect(() => {
    let isCancelled = false
    async function fetchAvail() {
      setLoading(true)
      setErrorMsg(null)
      try {
        const data = await getPublicAvailability(facilityId, selectedDate.toISOString())
        if (!isCancelled) {
          setAvailability(data)
        }
      } catch (err) {
        console.error("Availability fetch error:", err)
      } finally {
        if (!isCancelled) setLoading(false)
      }
    }
    fetchAvail()
    setSelectedSlot(null)

    return () => {
      isCancelled = true
    }
  }, [selectedDate, facilityId])

  // ─── Slot Status Checkers ───
  const isSlotPast = (hour: number, minute: number) => {
    const now = new Date()
    const slotDate = new Date(selectedDate)
    slotDate.setHours(hour, minute, 0, 0)
    return slotDate <= now
  }

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

  // ─── Computed Booking Details ───
  const totalPrice = selectedResource ? (selectedResource.base_price * (duration / 60)) : 0
  
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

  // ─── Slot Categorization for intuitive grouping ───
  const slotGroups = useMemo(() => {
    const morning: typeof timeSlots = []
    const afternoon: typeof timeSlots = []
    const evening: typeof timeSlots = []

    timeSlots.forEach(slot => {
      if (slot.hour < 12) morning.push(slot)
      else if (slot.hour < 17) afternoon.push(slot)
      else evening.push(slot)
    })

    return { morning, afternoon, evening }
  }, [timeSlots])

  // ─── Submit Form ───
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedResource || !startTime || !endTime) return
    if (!isValidName(guestName)) {
      setErrorMsg(`Name must be 2-${MAX_NAME_LENGTH} characters.`)
      return
    }
    if (!isValidPhone(guestPhone)) {
      setErrorMsg(`Contact number must contain exactly ${MAX_PHONE_LENGTH} digits.`)
      return
    }
    setIsSubmitting(true)
    setErrorMsg(null)

    try {
      const res = await submitPublicBooking({
        facility_id: facilityId,
        resource_id: selectedResource.id,
        guest_name: guestName.trim(),
        guest_phone: guestPhone.trim(),
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        total_price: totalPrice
      })

      if (res.success) {
        setConfirmedBooking(res.booking)
        setSuccess(true)
      } else {
        setErrorMsg(res.error || "Failed to confirm booking. This slot may have just been reserved.")
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Helpers
  const isSameDay = (d1: Date, d2: Date) => 
    d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate()

  const isToday = (d: Date) => isSameDay(d, new Date())
  const isTomorrow = (d: Date) => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return isSameDay(d, tomorrow)
  }

  // ─── SUCCESS SCREEN & DOWNLOADABLE RECEIPT ───
  if (success && startTime && endTime && selectedResource) {
    return (
      <PublicBookingReceipt
        bookingId={confirmedBooking?.id}
        facilityName={facilityMeta?.name || "Sports Venue"}
        facilitySlug={facilityMeta?.slug}
        facilityLogo={facilityMeta?.logo_url}
        sportType={facilityMeta?.sport_type || "Venue"}
        resourceName={selectedResource.name}
        resourceType={selectedResource.unit_type}
        guestName={guestName}
        guestPhone={guestPhone}
        bookingNote={bookingNote}
        startTime={startTime}
        endTime={endTime}
        durationMinutes={duration}
        totalPrice={totalPrice}
        paymentStatus="unpaid"
        isLoggedIn={!!currentUser}
        onBookAnother={() => {
          setSuccess(false)
          setConfirmedBooking(null)
          setSelectedSlot(null)
          setStep(1)
        }}
      />
    )
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      
      {/* ─── Top Navigation Bar inside Booking Engine ─── */}
      <div className="flex items-center justify-between mb-6">
        <Link 
          href={currentUser ? "/player" : "/facilities"} 
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors py-1.5 px-3 rounded-xl bg-card border border-border/70 hover:bg-muted"
        >
          <ChevronLeft className="h-4 w-4 text-primary" />
          <span>{currentUser ? "Back to Player Hub" : "Back to Venues"}</span>
        </Link>
      </div>

      {/* ─── Breadcrumb / Step Indicator ─── */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className={`h-8 w-8 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
            step === 1 ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30' : 'bg-emerald-500/20 text-emerald-400'
          }`}>
            {step > 1 ? <CheckCircle2 className="h-4 w-4" /> : "1"}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-bold uppercase tracking-wider text-foreground">Select Match Slot</p>
            <p className="text-[11px] text-muted-foreground">Court, date and time</p>
          </div>
        </div>

        <div className="w-12 h-0.5 bg-border/60 mx-2 hidden sm:block" />

        <div className="flex items-center gap-3">
          <div className={`h-8 w-8 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
            step === 2 ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30' : 'bg-muted text-muted-foreground border border-border/60'
          }`}>
            2
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-bold uppercase tracking-wider text-foreground">Player Details</p>
            <p className="text-[11px] text-muted-foreground">Confirm reservation</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/60 px-3 py-1.5 rounded-full border border-border/40">
            Step {step} of 2
          </span>
        </div>
      </div>

      {/* ═══════════════ STEP 1: COURT + DATE + TIME ═══════════════ */}
      {step === 1 && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* 1. Court / Pitch Selector */}
          {resources.length > 1 && (
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                Select Court or Pitch
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {resources.map(res => {
                  const isSelected = selectedResource?.id === res.id
                  return (
                    <button
                      key={res.id}
                      type="button"
                      onClick={() => { setSelectedResource(res); setSelectedSlot(null); }}
                      className={`p-3.5 rounded-2xl text-left border transition-all relative overflow-hidden group ${
                        isSelected 
                          ? 'bg-primary/10 border-primary text-foreground shadow-md shadow-primary/10 ring-2 ring-primary/40' 
                          : 'bg-card/40 border-border/60 text-foreground/80 hover:bg-card/80 hover:border-border'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-sm tracking-tight">{res.name}</span>
                        {isSelected && (
                          <div className="h-2 w-2 rounded-full bg-primary ring-4 ring-primary/20" />
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground font-medium capitalize">{res.unit_type}</p>
                      <p className="text-xs font-black text-primary mt-2">
                        {formatCurrency(res.base_price)}
                        <span className="text-[10px] text-muted-foreground font-normal"> /hr</span>
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* 2. Date Selector (Horizontal Scroll with Clean Date Cards) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <CalendarIcon className="h-3.5 w-3.5 text-primary" />
                Select Date
              </label>
              <span className="text-xs font-medium text-muted-foreground">
                {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            </div>

            <div className="flex gap-2.5 overflow-x-auto pb-3 pt-1 hide-scrollbar snap-x">
              {dateOptions.map((d, i) => {
                const isSelected = isSameDay(d, selectedDate)
                const today = isToday(d)
                const tomorrow = isTomorrow(d)

                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => { setSelectedDate(d); setSelectedSlot(null); }}
                    className={`snap-start shrink-0 flex flex-col items-center justify-center w-[72px] sm:w-[84px] py-3.5 px-2 rounded-2xl border transition-all text-center ${
                      isSelected 
                        ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25 scale-[1.03] ring-2 ring-primary/30' 
                        : 'bg-card/50 border-border/60 text-muted-foreground hover:bg-card hover:border-border hover:text-foreground'
                    }`}
                  >
                    <span className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                      {today ? 'Today' : tomorrow ? 'Tmrw' : d.toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                    <span className="text-xl sm:text-2xl font-black tracking-tight leading-none mb-1">
                      {d.getDate()}
                    </span>
                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground/70'}`}>
                      {d.toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 3. Duration Selector */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-primary" />
              Duration
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {durationOptions.map(opt => {
                const isSelected = duration === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { setDuration(opt.value); setSelectedSlot(null); }}
                    className={`p-3 rounded-2xl border transition-all text-left flex items-center justify-between ${
                      isSelected 
                        ? 'bg-primary/10 border-primary text-foreground ring-2 ring-primary/30 font-bold' 
                        : 'bg-card/40 border-border/60 text-muted-foreground hover:bg-card hover:text-foreground'
                    }`}
                  >
                    <div>
                      <span className="text-sm font-bold block">{opt.label}</span>
                      <span className="text-[10px] text-muted-foreground font-medium">{opt.hint}</span>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 ml-2" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 4. Time Slots Section */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  Available Starting Times
                  {loading && <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />}
                </label>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Showing {duration}-minute slots for {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </p>
              </div>

              {/* Slot Legend */}
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-primary/20 border border-primary/40" /> Available
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-muted border border-border" /> Booked / Past
                </span>
              </div>
            </div>

            {/* Time Slot Grid */}
            {!selectedResource ? (
              <div className="text-center py-12 border border-dashed border-border/70 rounded-2xl bg-card/20">
                <p className="text-sm font-medium text-muted-foreground">Please select a court above first.</p>
              </div>
            ) : (
              <div className={`space-y-4 transition-opacity ${loading ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                {/* Morning Slots */}
                {slotGroups.morning.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                      <span>🌅</span> Morning ({openHour}:00 AM – 12:00 PM)
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {slotGroups.morning.map(slot => renderSlotButton(slot))}
                    </div>
                  </div>
                )}

                {/* Afternoon Slots */}
                {slotGroups.afternoon.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                      <span>☀️</span> Afternoon (12:00 PM – 5:00 PM)
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {slotGroups.afternoon.map(slot => renderSlotButton(slot))}
                    </div>
                  </div>
                )}

                {/* Evening Slots */}
                {slotGroups.evening.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                      <span>🌙</span> Evening ({Math.min(closeHour, 17)}:00 PM – {closeHour > 12 ? closeHour - 12 : closeHour}:00 PM)
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {slotGroups.evening.map(slot => renderSlotButton(slot))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sticky / Bottom Booking Summary Bar */}
          <div className="sticky bottom-4 z-20 mt-8 p-4 sm:p-5 rounded-2xl bg-card/90 backdrop-blur-xl border border-border/80 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                {selectedSlot && selectedResource ? (
                  <>
                    <p className="text-xs font-semibold text-muted-foreground">
                      {selectedResource.name} • {duration} mins
                    </p>
                    <p className="text-sm sm:text-base font-extrabold text-foreground">
                      {startTime?.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {startTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xs font-semibold text-muted-foreground">Select a time slot above</p>
                    <p className="text-sm font-bold text-foreground/70">Pick court, day & hour to continue</p>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
              {selectedSlot && (
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Fee</p>
                  <p className="text-2xl font-black text-foreground tracking-tight">{formatCurrency(totalPrice)}</p>
                </div>
              )}

              <button
                type="button"
                onClick={() => selectedSlot && setStep(2)}
                disabled={!selectedSlot}
                className="px-7 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all shadow-lg shadow-primary/25 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:opacity-30"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ═══════════════ STEP 2: PLAYER DETAILS & CONFIRMATION ═══════════════ */}
      {step === 2 && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left: Interactive Booking Receipt / Summary */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-card/60 backdrop-blur-xl border border-border/80 rounded-3xl p-6 sm:p-7 space-y-6 shadow-xl">
                <div className="flex items-center justify-between pb-4 border-b border-border/50">
                  <div>
                    <h3 className="text-lg font-extrabold text-foreground">Reservation Summary</h3>
                    <p className="text-xs text-muted-foreground">Review your booking before confirming</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setStep(1)} 
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    Change
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-background/50 border border-border/50">
                    <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Facility Resource</span>
                      <p className="font-bold text-foreground text-sm">{selectedResource?.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{selectedResource?.unit_type}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-background/50 border border-border/50">
                    <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                      <CalendarIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Date</span>
                      <p className="font-bold text-foreground text-sm">
                        {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-background/50 border border-border/50">
                    <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Time & Duration</span>
                      <p className="font-bold text-primary text-sm">
                        {startTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {endTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-xs text-muted-foreground">{duration} minutes session</p>
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="pt-4 border-t border-border/50 space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Base Court Rate</span>
                    <span>{formatCurrency(selectedResource?.base_price || 0)}/hr</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Duration Multiplier</span>
                    <span>{duration / 60}x</span>
                  </div>
                  <div className="pt-2 flex justify-between items-baseline border-t border-border/40">
                    <span className="text-sm font-bold text-foreground">Total to Pay</span>
                    <span className="text-3xl font-black text-foreground tracking-tight">{formatCurrency(totalPrice)}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-1">
                    <Info className="h-3.5 w-3.5 text-primary shrink-0" /> Pay cash or QR at the counter upon arrival
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Guest Information Form */}
            <div className="lg:col-span-7">
              <form onSubmit={handleSubmit} className="bg-card/60 backdrop-blur-xl border border-border/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
                <div>
                  <h3 className="text-lg font-extrabold text-foreground">Contact Details</h3>
                  <p className="text-xs text-muted-foreground">We will use this to confirm and hold your pitch</p>
                </div>

                {currentUser ? (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Authenticated Player</div>
                        <div className="text-xs font-bold text-foreground">{currentUser.name || "Logged In"} <span className="text-muted-foreground font-normal">({currentUser.email})</span></div>
                      </div>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/30 shrink-0">
                      Auto-Linked
                    </span>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">
                      Have a player profile? <Link href={`/login?callbackUrl=/${facilityMeta?.slug || ''}`} className="text-primary font-bold hover:underline">Sign in</Link> to automatically save this reservation to your Hub.
                    </p>
                  </div>
                )}

                {errorMsg && (
                  <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/25 flex items-start gap-3 text-red-400 text-xs font-medium animate-in fade-in">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <p>{errorMsg}</p>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input 
                        type="text"
                        required
                        minLength={2}
                        maxLength={MAX_NAME_LENGTH}
                        autoComplete="name"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full h-12 bg-background/80 border border-border/70 rounded-xl pl-11 pr-4 text-sm font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Phone Number <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input 
                        type="tel"
                        required
                        inputMode="numeric"
                        maxLength={MAX_PHONE_LENGTH}
                        pattern="[0-9]{10}"
                        autoComplete="tel"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        placeholder="e.g. 98XXXXXXXX"
                        className="w-full h-12 bg-background/80 border border-border/70 rounded-xl pl-11 pr-4 text-sm font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Optional Note */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Special Requests / Team Name <span className="text-muted-foreground/50 font-normal">(Optional)</span>
                    </label>
                    <input 
                      type="text"
                      maxLength={300}
                      value={bookingNote}
                      onChange={(e) => setBookingNote(e.target.value)}
                      placeholder="e.g. Needs extra bibs / balls"
                      className="w-full h-12 bg-background/80 border border-border/70 rounded-xl px-4 text-sm font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>

                <div className="pt-2 space-y-3">
                  <button 
                    type="submit"
                    disabled={isSubmitting || !guestName.trim() || !guestPhone.trim()}
                    className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2.5 hover:opacity-95 active:scale-[0.99] transition-all shadow-xl shadow-primary/25 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Locking In Slot...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        Confirm Reservation • {formatCurrency(totalPrice)}
                      </>
                    )}
                  </button>

                  <button 
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" /> Back to slot selection
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      )}

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )

  // ─── Slot Render Helper ───
  function renderSlotButton(slot: { hour: number, minute: number, label: string }) {
    const past = isSlotPast(slot.hour, slot.minute)
    const booked = selectedResource ? isSlotBooked(selectedResource.id, slot.hour, slot.minute, duration) : false
    const isSelected = selectedSlot?.hour === slot.hour && selectedSlot?.minute === slot.minute
    const unavailable = past || booked

    return (
      <button
        key={`${slot.hour}-${slot.minute}`}
        type="button"
        onClick={() => !unavailable && setSelectedSlot(slot)}
        disabled={unavailable}
        className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all border text-center relative ${
          isSelected 
            ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/30 ring-2 ring-primary/40 scale-[1.02] z-10' 
            : unavailable 
              ? 'bg-muted/40 border-border/30 text-muted-foreground/30 cursor-not-allowed line-through' 
              : 'bg-card/50 border-border/70 text-foreground/90 hover:bg-primary/10 hover:border-primary/40 hover:text-primary'
        }`}
      >
        <span>{slot.label}</span>
        {booked && !past && (
          <span className="block text-[8px] font-bold text-red-400 mt-0.5 no-underline">Booked</span>
        )}
      </button>
    )
  }
}

"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { ChevronLeft, ChevronRight, Plus, CheckCircle2, XCircle, Bell, AlertTriangle, Calendar as CalendarIcon, Clock, Zap, User } from "lucide-react"
import { QuickBookingModal } from "./QuickBookingModal"
import { BookingDetailModal } from "./BookingDetailModal"
import { fetchFacility } from "@/lib/actions/facility"
import { fetchResourceWithBookings } from "@/lib/actions/booking"
import { useSport } from "@/components/providers/SportProvider"
import { formatCurrency } from "@/lib/utils"

const PX_PER_MINUTE = 2; 
const SLOT_HEIGHT = 30 * PX_PER_MINUTE; // 60px

export function BookingGrid({
  facilityId,
  initialResources = []
}: {
  facilityId: string
  initialResources?: any[]
}) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const dateInputRef = useRef<HTMLInputElement>(null)
  const [resources, setResources] = useState(initialResources)
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalInitialData, setModalInitialData] = useState<{ resourceId?: string, hour?: number, minute?: number }>({})
  const [selectedBooking, setSelectedBooking] = useState<any>(null)
  const { sport } = useSport()
  const [now, setNow] = useState(new Date())
  const [isMounted, setIsMounted] = useState(false)

  // Dynamic Hours
  const [openHour, setOpenHour] = useState(8)
  const [closeHour, setCloseHour] = useState(22)

  // Update current time every 10 seconds for better alert precision
  useEffect(() => {
    setIsMounted(true)
    const timer = setInterval(() => setNow(new Date()), 10000)

    // Fetch Working Hours
    async function loadConfig() {
      const facility = await fetchFacility(facilityId)
      if (facility?.config?.open_time) {
        setOpenHour(parseInt(facility.config.open_time.split(':')[0]))
      }
      if (facility?.config?.close_time) {
        setOpenHour(parseInt(facility.config.close_time.split(':')[0]))
      }
    }
    loadConfig()

    return () => clearInterval(timer)
  }, [facilityId])

  const slots = Array.from({ length: (closeHour - openHour + 1) * 2 }, (_, i) => {
    const hour = Math.floor(i / 2) + openHour
    const minute = (i % 2) * 30
    return { hour, minute, label: `${hour}:${minute === 0 ? '00' : '30'}` }
  })

  const isToday = selectedDate.toDateString() === now.toDateString()
  const currentHour = now.getHours()
  const currentMinutes = now.getMinutes()

  // 2px per minute scaling
  const showTimeIndicator = isMounted && isToday && currentHour >= openHour && currentHour <= closeHour
  const timeIndicatorTop = (currentHour - openHour) * (60 * PX_PER_MINUTE) + (currentMinutes * PX_PER_MINUTE)

  // Fetch data when date changes
  useEffect(() => {
    async function loadData() {
      setLoading(true)

      const startOfDay = new Date(selectedDate)
      startOfDay.setHours(0, 0, 0, 0)

      const endOfDay = new Date(selectedDate)
      endOfDay.setHours(23, 59, 59, 999)

      const data = await fetchResourceWithBookings(facilityId, startOfDay.toISOString(), endOfDay.toISOString())
      if (data) setResources(data)
      setLoading(false)
    }
    loadData()
  }, [selectedDate, facilityId])


  const handlePrevDay = () => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() - 1)
    setSelectedDate(d)
  }

  const handleNextDay = () => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + 1)
    setSelectedDate(d)
  }

  const handleToday = () => setSelectedDate(new Date())

  const openBookingModal = (resourceId?: string, hour?: number, minute?: number) => {
    setModalInitialData({ resourceId, hour, minute })
    setIsModalOpen(true)
  }

  const filteredResources = resources.filter(res => {
    if (!res.is_active) return false;
    
    // Connect the new Resource Manager types to the Sidebar Tabs
    if (sport === 'footshall') {
      return ['pitch', 'court', 'field', 'hall'].includes((res.unit_type || "").toLowerCase());
    }
    if (sport === 'cricshall') {
      return ['net', 'lane'].includes((res.unit_type || "").toLowerCase());
    }
    
    return true; // If 'both' or 'all'
  });

  const activeResources = filteredResources.length > 0 ? filteredResources : [{ name: "Add a Pitch in Resources Tab", id: 'none' }]

  return (
    <div className="space-y-8">
      {/* ─── Premium Toolbar ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="relative">
            <Button
              variant="ghost"
              className="h-11 sm:h-12 px-4 sm:px-6 rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 hover:border-primary/50 flex items-center gap-2.5 transition-all shadow-sm hover:shadow-md"
              onClick={() => dateInputRef.current?.showPicker()}
            >
              <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <CalendarIcon className="h-4 w-4 text-primary" />
              </div>
              <span className="text-base sm:text-xl font-black tracking-tighter">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
              {isToday && (
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest">Today</span>
              )}
            </Button>
            <input
              ref={dateInputRef}
              type="date"
              className="absolute opacity-0 pointer-events-none inset-0"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={(e) => {
                if (e.target.value) setSelectedDate(new Date(e.target.value))
              }}
            />
          </div>

          <div className="flex items-center bg-card/60 backdrop-blur-xl rounded-xl p-0.5 border border-border/30 shadow-sm">
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg hover:bg-muted active:scale-90 transition-all" onClick={handlePrevDay}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-9 px-4 rounded-lg bg-background/80 shadow-sm font-black text-[9px] uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all" onClick={handleToday}>
              Today
            </Button>
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg hover:bg-muted active:scale-90 transition-all" onClick={handleNextDay}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Button 
          variant="primary" 
          className="gap-2 rounded-xl px-5 h-11 sm:h-12 w-full sm:w-auto font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all" 
          onClick={() => openBookingModal()}
        >
          <div className="h-5 w-5 rounded-md bg-white/20 flex items-center justify-center">
            <Plus className="h-3.5 w-3.5" />
          </div>
          Quick Booking
        </Button>
      </div>

      {/* ─── Mobile Card View (shown on small screens) ─── */}
      <div className={`block md:hidden transition-all duration-500 ${loading ? 'opacity-40' : 'opacity-100'}`}>
        {(() => {
          // Collect all bookings from all resources into a flat sorted list
          const allBookings = activeResources
            .flatMap(res => (res.bookings || []).map((b: any) => ({ ...b, resourceName: res.name, resourceType: res.unit_type })))
            .filter((b: any) => {
              const bDate = new Date(b.start_time).toDateString()
              return bDate === selectedDate.toDateString()
            })
            .sort((a: any, b: any) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())

          if (allBookings.length === 0) {
            return (
              <div className="text-center py-16 px-6">
                <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-muted/30 flex items-center justify-center">
                  <CalendarIcon className="h-7 w-7 text-muted-foreground/50" />
                </div>
                <p className="text-lg font-black italic uppercase tracking-tighter text-muted-foreground/60 mb-1">No Bookings</p>
                <p className="text-xs font-bold text-muted-foreground/40 mb-6">Tap below to add a booking for this day</p>
                <Button 
                  variant="primary" 
                  className="gap-2 rounded-xl px-6 h-11 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20"
                  onClick={() => openBookingModal()}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Booking
                </Button>
              </div>
            )
          }

          // Group bookings by hour for time separators
          let lastHour = -1

          return (
            <div className="space-y-2 pb-4">
              {allBookings.map((booking: any) => {
                const start = new Date(booking.start_time)
                const end = new Date(booking.end_time)
                const durationMin = (end.getTime() - start.getTime()) / (1000 * 60)
                const durationH = durationMin >= 60 ? `${(durationMin / 60).toFixed(1)}h` : `${durationMin}m`
                const isLive = booking.status === 'confirmed' && start <= now && end > now
                const isEndingSoon = isLive && (end.getTime() - now.getTime()) < 5 * 60 * 1000
                const isCompleted = booking.status === 'completed'
                const isPending = booking.status === 'pending'
                const isCancelled = booking.status === 'cancelled'
                const showHourSep = start.getHours() !== lastHour
                lastHour = start.getHours()

                return (
                  <div key={booking.id}>
                    {showHourSep && (
                      <div className="flex items-center gap-3 px-1 pt-3 pb-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
                          {start.toLocaleTimeString([], { hour: 'numeric', hour12: true })}
                        </span>
                        <div className="flex-1 h-px bg-border/40" />
                      </div>
                    )}
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all active:scale-[0.98] ${
                        isLive 
                          ? 'bg-red-500/5 border-red-500/20 shadow-sm shadow-red-500/5' 
                          : isEndingSoon
                            ? 'bg-amber-500/5 border-amber-500/20 shadow-sm shadow-amber-500/5 animate-pulse'
                            : isCompleted 
                              ? 'bg-emerald-500/5 border-emerald-500/20' 
                              : isPending
                                ? 'bg-amber-500/5 border-amber-400/20 border-dashed'
                                : isCancelled
                                  ? 'bg-muted/20 border-border/30 opacity-50'
                                  : 'bg-card/60 border-border/40 hover:border-primary/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        {/* Left: Time block */}
                        <div className={`shrink-0 w-14 text-center pt-0.5 ${
                          isLive ? 'text-red-600' : isCompleted ? 'text-emerald-600' : 'text-primary'
                        }`}>
                          <p className="text-lg font-black tracking-tighter leading-none">
                            {start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: false })}
                          </p>
                          <p className="text-[8px] font-bold text-muted-foreground mt-0.5">{durationH}</p>
                        </div>

                        {/* Center: Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-black tracking-tight truncate">{booking.guest_name || 'Guest'}</p>
                            {isLive && <div className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)] animate-pulse shrink-0" />}
                            {isEndingSoon && <Bell className="h-3 w-3 text-amber-500 animate-bounce shrink-0" />}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[9px] font-bold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md">{booking.resourceName}</span>
                            <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md ${
                              isLive ? 'bg-red-500/10 text-red-600' 
                              : isCompleted ? 'bg-emerald-500/10 text-emerald-600'
                              : isPending ? 'bg-amber-500/10 text-amber-600'
                              : isCancelled ? 'bg-muted text-muted-foreground'
                              : 'bg-primary/10 text-primary'
                            }`}>
                              {isLive ? '● LIVE' : booking.status}
                            </span>
                          </div>
                        </div>

                        {/* Right: Price + Payment */}
                        <div className="text-right shrink-0">
                          <p className="text-xs font-black tracking-tight">{formatCurrency(booking.total_price || 0)}</p>
                          <div className={`text-[8px] font-black uppercase tracking-widest mt-0.5 ${
                            booking.payment_status === 'paid' ? 'text-emerald-600'
                            : booking.payment_status === 'partial' ? 'text-amber-600'
                            : 'text-red-500'
                          }`}>
                            {booking.payment_status === 'paid' ? '✓ Paid' 
                             : booking.payment_status === 'partial' ? 'Partial'
                             : 'Unpaid'}
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>
                )
              })}
            </div>
          )
        })()}
      </div>

      {/* ─── Premium Timeline Grid (desktop only) ─── */}
      <div className={`hidden md:block overflow-x-auto rounded-3xl border border-border/60 bg-card/40 backdrop-blur-xl shadow-xl shadow-black/5 transition-all duration-500 ${loading ? 'opacity-40 scale-[0.998]' : 'opacity-100 scale-100'}`}>
        <div className="min-w-[800px]">
          {/* ─── Grid Header ─── */}
          <div
            className="grid bg-gradient-to-r from-muted/40 via-muted/20 to-muted/40"
            style={{ gridTemplateColumns: `90px repeat(${activeResources.length}, 1fr)` }}
          >
            <div className="p-3 md:p-4 flex items-center justify-center border-r border-border/40">
              <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="h-3.5 w-3.5 text-primary" />
              </div>
            </div>
            {activeResources.map((res) => (
              <div key={res.id} className="p-3 md:p-4 text-center border-r last:border-0 border-border/40 flex flex-col items-center justify-center gap-1">
                <span className="text-xs md:text-sm font-black tracking-tight truncate max-w-full">{res.name}</span>
                {res.base_price && (
                  <span className="text-[8px] font-bold text-primary/60 uppercase tracking-widest">{formatCurrency(res.base_price)}/hr</span>
                )}
              </div>
            ))}
          </div>

          {/* ─── Grid Body ─── */}
          <div className="relative">
            {/* ─── Live Time Indicator ─── */}
            {showTimeIndicator && (
              <div
                className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
                style={{ top: `${timeIndicatorTop}px` }}
              >
                <div className="w-[90px] flex justify-center">
                  <div className="bg-red-500 text-[9px] font-black text-white px-2.5 py-1 rounded-lg shadow-lg shadow-red-500/30 whitespace-nowrap flex items-center gap-1">
                    <Zap className="h-2.5 w-2.5" />
                    {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div className="flex-1 h-[2px] bg-gradient-to-r from-red-500 via-red-500/60 to-transparent relative">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-3 w-3 bg-red-500 rounded-full border-2 border-background shadow-[0_0_12px_rgba(239,68,68,0.5)]" />
                </div>
              </div>
            )}

            {slots.map((slot, slotIndex) => {
              const isHourMark = slot.minute === 0;
              const isPast = isToday && (slot.hour < currentHour || (slot.hour === currentHour && slot.minute < currentMinutes));
              return (
              <div
                key={slot.label}
                className={`grid border-b border-border/30 last:border-0 group ${
                  isHourMark ? 'border-border/50' : ''
                } ${isPast ? 'bg-muted/10' : ''}`}
                style={{ gridTemplateColumns: `90px repeat(${activeResources.length}, 1fr)` }}
              >
                <div className={`px-2 md:px-3 border-r border-border/40 flex items-center justify-center h-[60px] ${
                  isHourMark 
                    ? 'text-[10px] md:text-xs font-black text-foreground/70' 
                    : 'text-[9px] md:text-[10px] font-bold text-muted-foreground/50'
                }`}>
                  {slot.label}
                </div>
                {activeResources.map((res) => {
                  const booking = res.bookings?.find((b: any) => {
                    const bStart = new Date(b.start_time);
                    const bEnd = new Date(b.end_time);
                    const slotStart = new Date(selectedDate);
                    slotStart.setHours(slot.hour, slot.minute, 0, 0);
                    const slotEnd = new Date(selectedDate);
                    slotEnd.setHours(slot.hour, slot.minute + 30, 0, 0);
                    return bStart < slotEnd && bEnd > slotStart;
                  })

                  const bStart = booking ? new Date(booking.start_time) : null;
                  const isStartSlot = bStart && bStart.getHours() === slot.hour && bStart.getMinutes() >= slot.minute && bStart.getMinutes() < slot.minute + 30;

                  let bookingHeight = 0;
                  let bookingTop = 0;
                  if (isStartSlot) {
                    const bEnd = new Date(booking.end_time);
                    const durationInMinutes = (bEnd.getTime() - bStart.getTime()) / (1000 * 60);
                    bookingHeight = durationInMinutes * PX_PER_MINUTE;
                    bookingTop = (bStart.getMinutes() % 30) * PX_PER_MINUTE;
                  }

                  return (
                    <div
                      key={`${slot.label}-${res.id}`}
                      className={`h-[60px] border-r last:border-0 border-border/30 transition-all cursor-pointer relative group/slot ${
                        booking 
                          ? 'hover:bg-primary/3' 
                          : isPast 
                            ? 'hover:bg-muted/20' 
                            : 'hover:bg-primary/5'
                      }`}
                      onClick={() => booking ? setSelectedBooking(booking) : openBookingModal(res.id, slot.hour, slot.minute)}
                    >
                      {/* ─── Booking Block ─── */}
                      {isStartSlot && (() => {
                        const start = new Date(booking.start_time);
                        const end = new Date(booking.end_time);
                        const durationH = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                        const isLive = booking.status === 'confirmed' && start <= now && end > now;
                        const isEndingSoon = isLive && (end.getTime() - now.getTime()) < 5 * 60 * 1000;
                        const isCompleted = booking.status === 'completed';
                        const isPending = booking.status === 'pending';

                        const blockStyles = isCompleted 
                          ? 'bg-gradient-to-r from-emerald-500/15 to-emerald-500/5 border-l-[3px] border-emerald-500 shadow-emerald-500/10' 
                          : isEndingSoon 
                            ? 'bg-gradient-to-r from-amber-500/25 to-amber-500/10 border-l-[3px] border-amber-500 shadow-amber-500/20 ring-2 ring-amber-500/20' 
                            : isLive 
                              ? 'bg-gradient-to-r from-red-500/15 to-red-500/5 border-l-[3px] border-red-500 shadow-red-500/10 ring-1 ring-red-500/20' 
                              : isPending
                                ? 'bg-gradient-to-r from-amber-500/10 to-amber-500/5 border-l-[3px] border-amber-400 shadow-amber-400/10 border-dashed'
                                : 'bg-gradient-to-r from-primary/15 to-primary/5 border-l-[3px] border-primary shadow-primary/10';

                        return (
                          <div
                            className={`absolute inset-x-0.5 md:inset-x-1 rounded-xl md:rounded-2xl px-2 py-1.5 flex flex-col justify-center z-[15] shadow-md backdrop-blur-[2px] overflow-hidden transition-all hover:shadow-lg hover:scale-[1.01] ${blockStyles} ${
                              isLive || isEndingSoon ? 'animate-pulse' : 'animate-in fade-in zoom-in-95 duration-300'
                            }`}
                            style={{
                              top: `${bookingTop + 1}px`,
                              height: `${bookingHeight - 2}px`,
                              minHeight: '22px'
                            }}
                          >
                            {/* Row 1: Name + Status */}
                            <div className="flex items-center justify-between gap-1 overflow-hidden">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <div className={`h-4 w-4 rounded-md flex items-center justify-center shrink-0 text-[8px] ${
                                  isCompleted ? 'bg-emerald-500/20' : isLive ? 'bg-red-500/20' : isPending ? 'bg-amber-500/20' : 'bg-primary/20'
                                }`}>
                                  <User className={`h-2.5 w-2.5 ${
                                    isCompleted ? 'text-emerald-600' : isLive ? 'text-red-600' : isPending ? 'text-amber-600' : 'text-primary'
                                  }`} />
                                </div>
                                <p className={`text-[9px] md:text-[10px] font-black uppercase tracking-tight truncate ${
                                  isCompleted ? 'text-emerald-700 dark:text-emerald-400' : isLive ? 'text-red-700 dark:text-red-400' : isPending ? 'text-amber-700 dark:text-amber-400' : 'text-primary'
                                }`}>
                                  {booking.guest_name || booking.player?.full_name}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                {isEndingSoon && <Bell className="h-3 w-3 text-amber-500 animate-bounce" />}
                                {isLive && <div className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]" />}
                                {isCompleted && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                                {isPending && <Clock className="h-3 w-3 text-amber-500" />}
                                <div className={`h-1.5 w-1.5 rounded-full shadow-sm ${
                                  booking.payment_status === 'paid' ? 'bg-emerald-500' 
                                  : booking.payment_status === 'partial' ? 'bg-amber-500' 
                                  : 'bg-red-500'
                                }`} />
                              </div>
                            </div>

                            {/* Row 2: Time range & duration (if block is tall enough) */}
                            {bookingHeight > 44 && (
                              <div className="flex items-center justify-between mt-0.5 gap-1">
                                <p className={`text-[7px] md:text-[8px] font-bold tracking-tight ${
                                  isCompleted ? 'text-emerald-600/60' : isEndingSoon ? 'text-amber-600' : isLive ? 'text-red-600/70' : 'text-primary/60'
                                }`}>
                                  {isEndingSoon ? '⚠ ENDING SOON' 
                                    : `${start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: false })} – ${end.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: false })}`
                                  }
                                </p>
                                {bookingHeight > 60 && (
                                  <span className={`text-[7px] font-black px-1.5 py-0.5 rounded-md ${
                                    isCompleted ? 'bg-emerald-500/10 text-emerald-600' 
                                    : isLive ? 'bg-red-500/10 text-red-600' 
                                    : 'bg-primary/10 text-primary'
                                  }`}>
                                    {durationH}h
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Row 3: Price (if block is very tall) */}
                            {bookingHeight > 80 && booking.total_price && (
                              <p className="text-[7px] font-black text-foreground/40 mt-0.5 tracking-tight">
                                {formatCurrency(booking.total_price)}
                              </p>
                            )}
                          </div>
                        );
                      })()}

                      {/* ─── Empty Slot Hover ─── */}
                      {!booking && !isPast && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/slot:opacity-100 transition-all duration-200">
                          <div className="h-7 w-7 rounded-lg bg-primary/80 text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20 scale-75 group-hover/slot:scale-100 transition-transform duration-200">
                            <Plus className="h-3.5 w-3.5" />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )})}
          </div>
        </div>
      </div>

      <QuickBookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        facilityId={facilityId}
        resources={resources}
        selectedDate={selectedDate}
        initialResourceId={modalInitialData.resourceId}
        initialHour={modalInitialData.hour}
        initialMinute={modalInitialData.minute}
        openHour={openHour}
        closeHour={closeHour}
      />

      {/* POS Checkout Modal — opens when clicking an existing booking block */}
      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onUpdate={(updatedBooking) => setSelectedBooking(updatedBooking)}
        />
      )}
    </div>
  )
}

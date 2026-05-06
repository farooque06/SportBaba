"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/Button"
import { createBooking } from "@/lib/actions/booking"
import { X, AlertCircle, CreditCard, Banknote, CheckCircle2, Phone, Clock, MapPin, User, Calendar, Timer, MessageCircle, Loader2, ChevronDown, Zap } from "lucide-react"
import { formatCurrency, getWhatsAppLink } from "@/lib/utils"
import { ArtisanSelect } from "@/components/ui/ArtisanSelect"
import { Toast, ToastType } from "@/components/ui/Toast"
import { useRouter } from "next/navigation"

interface QuickBookingModalProps {
  isOpen: boolean
  onClose: () => void
  facilityId: string
  resources: any[]
  selectedDate: Date
  initialResourceId?: string
  initialHour?: number
  initialMinute?: number
  openHour?: number
  closeHour?: number
}

export function QuickBookingModal({ 
  isOpen, onClose, facilityId, resources, selectedDate,
  initialResourceId, initialHour, initialMinute, openHour = 6, closeHour = 23
}: QuickBookingModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [bookingDate, setBookingDate] = useState(selectedDate)
  const [selectedResId, setSelectedResId] = useState(initialResourceId || resources[0]?.id)
  const [selectedHour, setSelectedHour] = useState(initialHour !== undefined ? initialHour : 17)
  const [selectedMinute, setSelectedMinute] = useState(initialMinute !== undefined ? initialMinute : 0)
  const [selectedDuration, setSelectedDuration] = useState(1.0)
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'unpaid'>('unpaid')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [isSuccess, setIsSuccess] = useState(false)
  const [createdBooking, setCreatedBooking] = useState<any>(null)
  const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null)

  const showToast = (message: string, type: ToastType = "success") => setToast({ message, type })

  // ─── Hybrid Timing State ───
  const [isCustomTiming, setIsCustomTiming] = useState(false)
  const [customEndHour, setCustomEndHour] = useState(selectedHour + 1)
  const [customEndMinute, setCustomEndMinute] = useState(selectedMinute)

  const allHours = Array.from({ length: closeHour - openHour + 1 }, (_, i) => i + openHour)

  useEffect(() => { if (isOpen) setBookingDate(selectedDate) }, [isOpen, selectedDate])

  // ─── Calculated Values ───
  const selectedResource = resources.find(r => r.id === selectedResId)
  
  const bookingStart = new Date(bookingDate)
  bookingStart.setHours(selectedHour, selectedMinute, 0, 0)
  
  // Calculate Duration based on mode
  useEffect(() => {
    if (isCustomTiming) {
      const startMinutes = selectedHour * 60 + selectedMinute
      const endMinutes = customEndHour * 60 + customEndMinute
      if (endMinutes > startMinutes) {
        setSelectedDuration((endMinutes - startMinutes) / 60)
      }
    }
  }, [isCustomTiming, selectedHour, selectedMinute, customEndHour, customEndMinute])

  const bookingEnd = new Date(bookingStart)
  bookingEnd.setMinutes(bookingStart.getMinutes() + selectedDuration * 60)

  const hasConflict = selectedResource?.bookings?.some((b: any) => {
    const bStart = new Date(b.start_time)
    const bEnd = new Date(b.end_time)
    return bookingStart < bEnd && bookingEnd > bStart
  })

  const getHourStatus = (h: number, m: number = 0) => {
    const now = new Date()
    const slotStart = new Date(bookingDate)
    slotStart.setHours(h, m, 0, 0)
    const slotEnd = new Date(slotStart.getTime() + 30 * 60000)

    const isOccupied = selectedResource?.bookings?.some((b: any) => {
      const bStart = new Date(b.start_time)
      const bEnd = new Date(b.end_time)
      return slotStart < bEnd && slotEnd > bStart
    })

    if (isOccupied) return 'occupied'
    if (slotEnd < now) return 'past'
    return 'available'
  }

  const isInvalidCustomTime = isCustomTiming && (customEndHour * 60 + customEndMinute <= selectedHour * 60 + selectedMinute)

  const isPastMaxHour = selectedHour + selectedDuration > closeHour + 1
  const totalPrice = (selectedResource?.base_price || 0) * selectedDuration

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (hasConflict || isPastMaxHour || isInvalidCustomTime) {
      showToast("Please resolve timing conflicts before saving", "error")
      return
    }
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    
    const start = new Date(bookingDate)
    start.setHours(selectedHour, selectedMinute, 0, 0)
    const end = new Date(start)
    end.setMinutes(start.getMinutes() + selectedDuration * 60)

    const result = await createBooking({
      resource_id: selectedResId,
      guest_name: formData.get("guest_name") as string,
      guest_phone: formData.get("guest_phone") as string,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      notes: formData.get("notes") as string || "",
      payment_status: paymentStatus,
      payment_method: paymentMethod,
    }, facilityId)
    setLoading(false)
    
    if (result.success) {
      setIsSuccess(true)
      setCreatedBooking(result.data)
      router.refresh()
    } else {
      showToast(result.error || "Failed to create booking", "error")
    }
  }

  // Hook Order Fix: Early return AFTER all hooks
  if (!isOpen) return null

  // ─── Success Screen ───
  if (isSuccess && createdBooking) {
    return (
      <div className="fixed inset-0 z-[1000] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-md p-0 md:p-4" onClick={onClose}>
        <div className="bg-card w-full md:max-w-sm rounded-t-[24px] md:rounded-[32px] border border-border/40 shadow-2xl animate-in slide-in-from-bottom-5 md:zoom-in-95 duration-500 overflow-hidden" onClick={(e) => e.stopPropagation()}>
          {/* Drag handle */}
          <div className="md:hidden flex justify-center pt-3"><div className="h-1 w-10 rounded-full bg-foreground/10" /></div>
          
          {/* Success Header */}
          <div className="pt-8 pb-6 px-6 text-center bg-gradient-to-b from-emerald-500/10 to-transparent">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 mb-4">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-black tracking-tighter mb-1">Booking Confirmed!</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Added to your schedule</p>
          </div>

          {/* Summary Card */}
          <div className="px-6 pb-6">
            <div className="p-4 rounded-2xl bg-muted/30 border border-border/30 space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><User className="h-5 w-5 text-primary" /></div>
                <div>
                  <p className="text-sm font-black tracking-tight">{createdBooking.guest_name}</p>
                  <p className="text-[10px] font-bold text-primary">{createdBooking.guest_phone}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border/20">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {new Date(createdBooking.start_time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}
                </div>
                <span className="text-xs font-black">{formatCurrency(totalPrice)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 pb-20 md:pb-0 safe-area-bottom">
              {createdBooking.guest_phone && (
                <a 
                  href={getWhatsAppLink(createdBooking.guest_phone, `Hi ${createdBooking.guest_name}! Your booking at ${selectedResource?.name} is confirmed for ${new Date(createdBooking.start_time).toLocaleDateString()} at ${new Date(createdBooking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. See you there! ⚽`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-12 flex items-center justify-center gap-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-[0.97] transition-all font-black uppercase tracking-widest text-[10px] text-white shadow-lg shadow-emerald-500/20"
                >
                  <MessageCircle className="h-4 w-4" />
                  Notify via WhatsApp
                </a>
              )}
              <Button variant="ghost" className="w-full h-11 rounded-xl font-black uppercase tracking-widest text-[10px]" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ─── Create Booking Form ───
  return (
    <div className="fixed inset-0 z-[1000] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-md p-0 md:p-4" onClick={onClose}>
      <div 
        className="bg-card w-full md:max-w-xl max-h-[92dvh] max-h-[88vh] md:max-h-[90vh] rounded-t-[24px] md:rounded-[32px] border border-border/40 shadow-2xl animate-in slide-in-from-bottom-5 md:zoom-in-95 duration-500 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle (mobile) */}
        <div className="md:hidden flex justify-center pt-3 pb-1"><div className="h-1 w-10 rounded-full bg-foreground/10" /></div>
        
        {/* ─── Header ─── */}
        <div className="px-5 md:px-8 pt-4 md:pt-6 pb-4 border-b border-border/20 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg md:text-xl font-black tracking-tight">New Booking</h2>
            <button onClick={onClose} className="h-8 w-8 rounded-xl bg-foreground/5 hover:bg-foreground/10 flex items-center justify-center transition-colors">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {/* Date & Resource */}
          <div className="flex gap-3">
             <div className="flex-1 relative group">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 ml-1 mb-1.5">Date</p>
                <div className="relative">
                  <input 
                    type="date" 
                    value={bookingDate.toISOString().split('T')[0]}
                    onChange={(e) => { if(e.target.value) setBookingDate(new Date(e.target.value)) }}
                    onClick={(e) => e.currentTarget.showPicker()}
                    className="w-full bg-muted/50 border border-border/30 p-2.5 pl-9 rounded-xl text-xs font-black outline-none ring-primary/20 focus:ring-4 focus:border-primary/40 transition-all cursor-pointer appearance-none"
                    required
                  />
                  <Calendar className="h-3.5 w-3.5 text-primary/60 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
             </div>

             <ArtisanSelect 
                label="Resource"
                className="flex-[1.5]"
                value={selectedResId}
                onChange={setSelectedResId}
                options={resources.map(res => ({
                  value: res.id,
                  label: res.name,
                  subLabel: `${formatCurrency(res.base_price)}/hr`
                }))}
             />
          </div>
        </div>

        {/* ─── Scrollable Form ─── */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-5 md:p-8 space-y-5">
            
            {/* ─── Time Selection ─── */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-primary/60" />
                  <p className="text-[9px] font-black uppercase tracking-widest text-primary/60">Time & Duration</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsCustomTiming(!isCustomTiming)}
                  className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                    isCustomTiming ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {isCustomTiming ? '✓ Custom Mode' : 'Go Custom'}
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-3 items-end">
                <div className="grid grid-cols-2 gap-2">
                  <ArtisanSelect 
                    label="Start Hour"
                    value={selectedHour}
                    onChange={setSelectedHour}
                    options={allHours.map(h => {
                      const status = getHourStatus(h)
                      return {
                        value: h,
                        label: `${h < 10 ? `0${h}` : h}:00`,
                        color: status === 'occupied' ? 'text-red-500' : status === 'past' ? 'text-muted-foreground/30' : '',
                        subLabel: status === 'occupied' ? 'Occupied' : status === 'past' ? 'Past' : 'Available'
                      }
                    })}
                  />
                  <ArtisanSelect 
                    label="Min"
                    value={selectedMinute}
                    onChange={setSelectedMinute}
                    options={(isCustomTiming 
                      ? Array.from({ length: 12 }, (_, i) => ({ value: i * 5, label: `:${(i * 5).toString().padStart(2, '0')}` }))
                      : [0, 15, 30, 45].map(m => ({ value: m, label: `:${m.toString().padStart(2, '0')}` }))
                    ).map(opt => {
                      const status = getHourStatus(selectedHour, opt.value)
                      return {
                        ...opt,
                        color: status === 'occupied' ? 'text-red-500' : status === 'past' ? 'text-muted-foreground/30' : ''
                      }
                    })}
                  />
                </div>

                {isCustomTiming ? (
                  <div className="grid grid-cols-2 gap-2">
                    <ArtisanSelect 
                      label="End Hour"
                      value={customEndHour}
                      onChange={setCustomEndHour}
                      options={allHours.map(h => {
                        const status = getHourStatus(h) // Simple hour check is fine for end
                        return {
                          value: h,
                          label: `${h < 10 ? `0${h}` : h}:00`,
                          color: status === 'occupied' ? 'text-red-500' : status === 'past' ? 'text-muted-foreground/30' : ''
                        }
                      })}
                    />
                    <ArtisanSelect 
                      label="Min"
                      value={customEndMinute}
                      onChange={setCustomEndMinute}
                      options={Array.from({ length: 12 }, (_, i) => {
                        const val = i * 5
                        const status = getHourStatus(customEndHour, val)
                        return { 
                          value: val, 
                          label: `:${val.toString().padStart(2, '0')}`,
                          color: status === 'occupied' ? 'text-red-500' : status === 'past' ? 'text-muted-foreground/30' : ''
                        }
                      })}
                    />
                  </div>
                ) : (
                  <ArtisanSelect 
                    label="Duration"
                    value={selectedDuration}
                    onChange={setSelectedDuration}
                    options={[0.5, 1, 1.5, 2, 2.5, 3, 4, 5].map(d => ({
                      value: d,
                      label: `${d}h`
                    }))}
                  />
                )}
              </div>

              {/* Warnings */}
              {isInvalidCustomTime && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 text-red-600 text-[10px] font-black uppercase tracking-widest border border-red-500/20">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  End time must be after start time
                </div>
              )}
              {!isInvalidCustomTime && hasConflict && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 text-red-600 text-[10px] font-black uppercase tracking-widest animate-pulse border border-red-500/20">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  Time Slot Conflict
                </div>
              )}
              {!isInvalidCustomTime && isPastMaxHour && !hasConflict && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 text-amber-600 text-[10px] font-black uppercase tracking-widest border border-amber-500/20">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  Exceeds closing time
                </div>
              )}
            </div>

            {/* ─── Customer Info ─── */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-primary/60" />
                <p className="text-[9px] font-black uppercase tracking-widest text-primary/60">Customer</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input 
                  name="guest_name"
                  placeholder="Player Name"
                  className="w-full bg-muted/40 border border-border/30 p-3 rounded-xl text-sm font-bold outline-none ring-primary focus:ring-2 transition-all placeholder:text-muted-foreground/40"
                  required
                />
                <input 
                  name="guest_phone"
                  placeholder="+977 98XXXXXXXX"
                  className="w-full bg-muted/40 border border-border/30 p-3 rounded-xl text-sm font-bold outline-none ring-primary focus:ring-2 transition-all placeholder:text-muted-foreground/40"
                  required
                />
              </div>
              <textarea 
                name="notes"
                placeholder="Notes (optional)"
                rows={2}
                className="w-full bg-muted/40 border border-border/30 p-3 rounded-xl text-sm font-bold outline-none ring-primary focus:ring-2 transition-all resize-none placeholder:text-muted-foreground/40"
              />
            </div>

            {/* ─── Payment Toggle ─── */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Banknote className="h-3.5 w-3.5 text-primary/60" />
                <p className="text-[9px] font-black uppercase tracking-widest text-primary/60">Payment</p>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <button 
                  type="button"
                  onClick={() => setPaymentStatus('paid')}
                  className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all active:scale-[0.97] ${
                    paymentStatus === 'paid' 
                      ? 'border-emerald-500 bg-emerald-500/10 shadow-sm shadow-emerald-500/10' 
                      : 'border-border/30 bg-muted/20 hover:border-border/60'
                  }`}
                >
                  <CheckCircle2 className={`h-4 w-4 ${paymentStatus === 'paid' ? 'text-emerald-500' : 'text-muted-foreground/40'}`} />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${paymentStatus === 'paid' ? 'text-emerald-600' : 'text-muted-foreground/60'}`}>Paid</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setPaymentStatus('unpaid')}
                  className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all active:scale-[0.97] ${
                    paymentStatus === 'unpaid' 
                      ? 'border-red-500 bg-red-500/10 shadow-sm shadow-red-500/10' 
                      : 'border-border/30 bg-muted/20 hover:border-border/60'
                  }`}
                >
                  <X className={`h-4 w-4 ${paymentStatus === 'unpaid' ? 'text-red-500' : 'text-muted-foreground/40'}`} />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${paymentStatus === 'unpaid' ? 'text-red-600' : 'text-muted-foreground/60'}`}>Unpaid</span>
                </button>
              </div>

              {paymentStatus === 'paid' && (
                <ArtisanSelect 
                  label="Method"
                  value={paymentMethod}
                  onChange={setPaymentMethod}
                  options={[
                    { value: "cash", label: "💵 Cash" },
                    { value: "card", label: "💳 Card / POS" },
                    { value: "khalti", label: "📱 Khalti" },
                    { value: "esewa", label: "📱 eSewa" },
                    { value: "other", label: "📦 Other" }
                  ]}
                />
              )}

            </div>
          </div>

          {/* ─── Sticky Summary + Submit ─── */}
          <div className="sticky bottom-0 p-5 pb-24 md:p-6 md:pb-6 border-t border-border/20 bg-card/95 backdrop-blur-xl shrink-0 space-y-3 safe-area-bottom">
            {/* Live Summary */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/10">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-muted-foreground truncate">
                    {selectedResource?.name} • {bookingStart.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })} – {bookingEnd.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}
                  </p>
                  <p className="text-[8px] font-bold text-muted-foreground/50">{selectedDuration}h • {bookingDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
              </div>
              <div className="text-right shrink-0 pl-3">
                <p className="text-lg font-black tracking-tighter leading-none">{formatCurrency(totalPrice)}</p>
                <p className={`text-[8px] font-black uppercase tracking-widest mt-0.5 ${paymentStatus === 'paid' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {paymentStatus}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5">
              <Button type="button" variant="ghost" className="flex-1 h-14 md:h-12 rounded-xl font-black uppercase tracking-widest text-[10px] active:scale-[0.97] transition-all" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary" 
                className="flex-[2] h-14 md:h-12 rounded-xl font-black uppercase tracking-widest text-[10px] md:shadow-lg md:shadow-primary/20 active:scale-[0.97] transition-all disabled:opacity-50" 
                disabled={loading || hasConflict || isPastMaxHour || isInvalidCustomTime}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Booking"}
              </Button>
            </div>
          </div>
        </form>
      </div>
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  )
}

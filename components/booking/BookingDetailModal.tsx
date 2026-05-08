"use client"

import { useState, useEffect } from "react"
import { useSWRConfig } from "swr"
import Link from "next/link"
import { X, MapPin, CreditCard, CheckCircle2, Banknote, Clock, Timer, Info, Loader2, Phone, MessageCircle, User, ShoppingBag, Plus, Minus, Zap, Receipt } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { cn, formatCurrency, getWhatsAppLink } from "@/lib/utils"
import { updatePaymentStatus, updateBookingStatus, addBookingAddon, removeBookingAddon, extendBooking, cancelWithCredit } from "@/lib/actions/booking"
import { fetchProducts } from "@/lib/actions/inventory"
import { getCurrentUserRole } from "@/lib/actions/auth"
import { Toast, ToastType } from "@/components/ui/Toast"
import { Portal } from "@/components/ui/Portal"

interface BookingDetailModalProps {
  booking: any | null
  onClose: () => void
  onUpdate?: (updatedBooking: any) => void
}

export function BookingDetailModal({ booking: initialBooking, onClose, onUpdate }: BookingDetailModalProps) {
  const [booking, setBooking] = useState<any>(initialBooking)
  const [isUpdating, setIsUpdating] = useState(false)
  const [availableProducts, setAvailableProducts] = useState<any[]>([])
  const [whatsappPending, setWhatsappPending] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null)
  const { mutate } = useSWRConfig()

  const refreshGrid = (updatedData?: any) => {
    const data = updatedData || booking
    if (!data?.start_time || !data?.facility_id) return
    const dateKey = new Date(data.start_time).toISOString().split('T')[0]
    mutate(`bookings/${data.facility_id}/${dateKey}`)
  }

  const showToast = (message: string, type: ToastType = "success") => setToast({ message, type })

  useEffect(() => { setBooking(initialBooking) }, [initialBooking])

  useEffect(() => {
    async function load() {
      if (booking?.facility_id) {
        const [products, role] = await Promise.all([
          fetchProducts(booking.facility_id),
          getCurrentUserRole(booking.facility_id)
        ])
        setAvailableProducts(products)
        setUserRole(role)
      }
    }
    load()
  }, [booking?.facility_id])

  const maskPhone = (phone: string) => {
    if (!phone) return "";
    const isFacilityUser = userRole === 'owner' || userRole === 'manager' || userRole === 'staff';
    if (isFacilityUser) return phone;
    return phone.replace(/(\d{3})\d+(\d{2})/, "$1******$2");
  }

  if (!booking) return null

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Computed values
  const start = new Date(booking.start_time)
  const end = new Date(booking.end_time)
  const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
  const totalPrice = Number(booking.total_price) || 0
  const paidAmount = Number(booking.paid_amount) || 0
  const dueAmount = Math.max(0, totalPrice - paidAmount)
  const isFullyPaid = paidAmount >= totalPrice
  const isLive = booking.status === 'confirmed' && start <= new Date() && end > new Date()
  const isCompleted = booking.status === 'completed'
  const isPending = booking.status === 'pending'
  const isCancelled = booking.status === 'cancelled'

  const statusConfig = isLive 
    ? { label: '● LIVE', color: 'bg-red-500', textColor: 'text-white', headerBg: 'bg-gradient-to-br from-red-500/15 via-red-500/5 to-transparent' }
    : isCompleted 
      ? { label: '✓ COMPLETED', color: 'bg-emerald-500', textColor: 'text-white', headerBg: 'bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-transparent' }
      : isPending 
        ? { label: '⏳ PENDING', color: 'bg-amber-500', textColor: 'text-white', headerBg: 'bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-transparent' }
        : isCancelled
          ? { label: '✕ CANCELLED', color: 'bg-muted', textColor: 'text-muted-foreground', headerBg: 'bg-gradient-to-br from-muted/30 to-transparent' }
          : { label: 'CONFIRMED', color: 'bg-primary', textColor: 'text-primary-foreground', headerBg: 'bg-gradient-to-br from-primary/15 via-primary/5 to-transparent' }

  // Handlers
  const handleMarkAsPaid = async (method: string) => {
    setIsUpdating(true)
    const result = await updatePaymentStatus(booking.id, 'paid', method, undefined, booking.facility_id)
    if (result.success) {
      setBooking(result.data)
      refreshGrid(result.data)
      if(onUpdate) onUpdate(result.data)
      if (result.whatsappUrl) setWhatsappPending(result.whatsappUrl)
    }
    setIsUpdating(false)
  }

  const handleUpdateStatus = async (status: string) => {
    if (status === 'completed') {
       const isPaid = paidAmount >= totalPrice;
       if (!isPaid && !confirm("This match has an outstanding balance. Mark as completed?")) return;
    }
    setIsUpdating(true)
    const result = await updateBookingStatus(booking.id, status, booking.facility_id)
    if (result.success) {
      setBooking(result.data)
      refreshGrid(result.data)
      if(onUpdate) onUpdate(result.data)
      if (result.whatsappUrl) setWhatsappPending(result.whatsappUrl)
    }
    setIsUpdating(false)
  }

  const handleAddAddon = async (item: { id: string, name: string, price: number }) => {
    setIsUpdating(true)
    const result = await addBookingAddon(booking.id, item, booking.facility_id)
    if (result.success) {
      setBooking(result.data)
      refreshGrid(result.data)
      if(onUpdate) onUpdate(result.data)
    }
    setIsUpdating(false)
  }

  const handleRemoveAddon = async (timestamp: string) => {
    setIsUpdating(true)
    const result = await removeBookingAddon(booking.id, timestamp, booking.facility_id)
    if (result.success) {
      setBooking(result.data)
      refreshGrid(result.data)
      if(onUpdate) onUpdate(result.data)
    }
    setIsUpdating(false)
  }

  const handleExtendMatch = async (minutes: number) => {
    setIsUpdating(true)
    const result = await extendBooking(booking.id, minutes, booking.facility_id)
    if (result.success) {
      setBooking(result.data)
      refreshGrid(result.data)
      if(onUpdate) onUpdate(result.data)
      showToast("Match extended successfully")
    } else {
      showToast(result.error || "Could not extend match. Check for conflicts.", "error")
    }
    setIsUpdating(false)
  }

  const handleCancelWithCredit = async () => {
    if (!confirm("Are you sure you want to cancel and issue credit for this match?")) return
    setIsUpdating(true)
    const res = await cancelWithCredit(booking.id, booking.facility_id)
    if (res.success) {
      showToast(`Cancelled! ${formatCurrency(res.creditIssued || 0)} issued as credit.`, "success")
      refreshGrid(res.data)
      if (onUpdate) onUpdate(res.data)
      onClose()
    } else {
      showToast(res.error || "Failed to cancel", "error")
    }
    setIsUpdating(false)
  }

  const grouped = (booking.bill_items || []).reduce((acc: any[], item: any) => {
    const existing = acc.find((i: any) => i.name === item.name);
    if (existing) {
      existing.count += 1;
      existing.totalPrice += Number(item.price);
      existing.lastTimestamp = item.timestamp;
    } else {
      acc.push({ ...item, count: 1, totalPrice: Number(item.price), lastTimestamp: item.timestamp });
    }
    return acc;
  }, []);

  return (
    <Portal>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-background/60 backdrop-blur-2xl animate-in fade-in duration-500" onClick={onClose} />
        
        <div className="relative w-full max-w-2xl bg-card border border-border/40 rounded-[48px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden animate-in fade-in zoom-in-95 duration-500 flex flex-col max-h-[90vh]">
          {/* Header Section */}
          <div className={cn("p-8 md:p-10 relative shrink-0", statusConfig.headerBg)}>
            <div className="absolute top-8 right-8 flex items-center gap-2">
              <button onClick={onClose} className="h-12 w-12 rounded-2xl bg-background/40 hover:bg-background/60 border border-white/10 flex items-center justify-center transition-all group active:scale-90">
                <X className="h-5 w-5 group-hover:rotate-90 transition-transform" />
              </button>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-4">
                <div className={cn("inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-black/10", statusConfig.color, "text-white")}>
                  <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  {statusConfig.label}
                </div>
                <div className="space-y-1">
                  <h2 className="text-4xl md:text-6xl font-black tracking-tighter italic uppercase leading-none truncate max-w-[400px]">
                    {booking.guest_name || "Guest User"}
                  </h2>
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2">
                       <Phone className="h-3 w-3 text-primary" />
                       <span className="text-[10px] font-black tracking-widest">{maskPhone(booking.guest_phone) || "No Contact"}</span>
                    </div>
                    <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2">
                       <MapPin className="h-3 w-3 text-muted-foreground" />
                       <span className="text-[10px] font-black tracking-widest opacity-60 uppercase">{booking.resource?.name || 'Court'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* Quick Actions Row */}
            <div className="flex items-center gap-3 p-6 md:px-10 border-b border-border/10 bg-muted/20">
               <Button variant="ghost" onClick={() => window.open(getWhatsAppLink(booking.guest_phone, `Hi ${booking.guest_name}, this is regarding your booking at ${booking.facility?.name}...`), '_blank')} className="h-12 rounded-2xl border border-border/40 gap-2 font-black uppercase tracking-widest text-[9px] hover:bg-emerald-500/10 transition-all">
                  <MessageCircle className="h-4 w-4 text-emerald-500" />
                  WhatsApp
               </Button>
               <Button variant="ghost" onClick={() => window.location.href = `tel:${booking.guest_phone}`} className="h-12 rounded-2xl border border-border/40 gap-2 font-black uppercase tracking-widest text-[9px] hover:bg-primary/10 transition-all">
                  <Phone className="h-4 w-4 text-primary" />
                  Call
               </Button>
               <div className="flex-1" />
               <div className="flex flex-col items-end">
                  <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40 mb-1">Booking ID</p>
                  <p className="text-[10px] font-black font-mono opacity-60">#{booking.id.slice(0, 8).toUpperCase()}</p>
               </div>
            </div>

            {/* Time Slot Display */}
            <div className="p-8 md:p-10 border-b border-border/10">
               <div className="flex items-center justify-between gap-6">
                  <div className="space-y-1">
                     <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Start Time</p>
                     <p className="text-3xl font-black tracking-tighter">{start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}</p>
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                  <div className="space-y-1 text-right">
                     <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">End Time</p>
                     <p className="text-3xl font-black tracking-tighter">{end.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}</p>
                  </div>
               </div>
            </div>
            
            {/* ─── Financial Card ─── */}
            <div className="p-6 md:p-8 bg-gradient-to-b from-card to-background">
              {/* Total + Status */}
              <div className="flex items-end justify-between mb-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Final Settlement</p>
                  <p className={cn(
                    "text-4xl md:text-5xl font-black tracking-tighter leading-none text-foreground",
                    isCancelled && "opacity-40"
                  )}>
                    {formatCurrency(totalPrice)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {isCancelled ? (
                    <div className="text-right">
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">Match Status</p>
                      <p className="text-2xl font-black tracking-tighter text-muted-foreground italic">CANCELLED</p>
                    </div>
                  ) : isFullyPaid ? (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shadow-sm">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Settled</span>
                    </div>
                  ) : (
                    <div className="text-right">
                      <p className="text-[9px] font-black uppercase tracking-widest text-red-500/60 mb-1">Outstanding Balance</p>
                      <p className="text-2xl font-black tracking-tighter text-red-600">{formatCurrency(dueAmount)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              {!isCancelled && !isFullyPaid && totalPrice > 0 && (
                <div className="mb-4">
                  <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700 ease-out"
                      style={{ width: `${Math.min(100, (paidAmount / totalPrice) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-[8px] font-bold text-emerald-600">Paid: {formatCurrency(paidAmount)}</span>
                    <span className="text-[8px] font-bold text-muted-foreground">{Math.round((paidAmount / totalPrice) * 100)}%</span>
                  </div>
                </div>
              )}

              {/* Itemized Bill */}
              <div className="space-y-1.5 mb-4">
                <div className="flex justify-between items-center py-1.5 border-b border-dashed border-border/30">
                  <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-primary/40" />
                    Court Fee ({duration}h)
                  </span>
                  <span className="text-[10px] font-bold text-foreground">{formatCurrency((Number(booking.resource?.base_price) || 0) * duration)}</span>
                </div>
                {grouped.map((item: any) => (
                  <div key={item.lastTimestamp} className="flex justify-between items-center py-1.5 border-b border-dashed border-border/20 group/item">
                    <span className="text-[10px] font-bold text-foreground flex items-center gap-1.5">
                      <span className="text-xs">{item.category === 'drink' ? '💧' : item.category === 'food' ? '🍕' : item.category === 'equipment' ? '⚽' : '📦'}</span>
                      {item.name}
                      {item.count > 1 && <span className="text-primary font-black">×{item.count}</span>}
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleRemoveAddon(item.lastTimestamp); }}
                        className="opacity-0 group-hover/item:opacity-100 text-red-500 transition-opacity p-0.5 rounded hover:bg-red-500/10"
                        title="Remove one"
                      >
                        <Minus className="h-2.5 w-2.5" />
                      </button>
                    </span>
                    <span className="text-[10px] font-bold text-foreground">{formatCurrency(item.totalPrice)}</span>
                  </div>
                ))}
              </div>

              {/* Payment Buttons (if not fully paid) */}
              {!isFullyPaid && !isCancelled && (
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <button 
                    disabled={isUpdating}
                    onClick={() => handleMarkAsPaid('cash')}
                    className="flex flex-col items-center justify-center gap-2 p-5 rounded-[24px] bg-emerald-500/5 border border-emerald-500/20 hover:bg-emerald-500/10 hover:border-emerald-500/40 active:scale-[0.95] transition-all disabled:opacity-50 group"
                  >
                    <Banknote className="h-6 w-6 text-emerald-600 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Cash Settlement</span>
                  </button>
                  <button 
                    disabled={isUpdating}
                    onClick={() => handleMarkAsPaid('card')}
                    className="flex flex-col items-center justify-center gap-2 p-5 rounded-[24px] bg-blue-500/5 border border-blue-500/20 hover:bg-blue-500/10 hover:border-blue-500/40 active:scale-[0.95] transition-all disabled:opacity-50 group"
                  >
                    <CreditCard className="h-6 w-6 text-blue-600 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-700">Card / POS</span>
                  </button>
                </div>
              )}
            </div>

            {/* ─── Quick Add POS ─── */}
            {!isCancelled && !isCompleted && (
              <div className="p-6 md:p-8 border-t border-border/10">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-primary" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">Quick-Add Addons</p>
                  </div>
                  <span className="text-[8px] font-black px-2 py-0.5 rounded-md bg-muted text-muted-foreground uppercase">Inventory Sync</span>
                </div>
                {availableProducts.length === 0 ? (
                  <Link href="/dashboard/inventory" className="text-[9px] font-black uppercase tracking-widest text-primary hover:underline block text-center py-6 bg-muted/20 rounded-3xl border border-dashed border-border/40">
                    Configure Inventory POS →
                  </Link>
                ) : (
                  <div className="grid grid-cols-4 gap-3">
                    {availableProducts.slice(0, 8).map((p) => (
                      <button 
                        key={p.id}
                        disabled={isUpdating}
                        onClick={(e) => { e.stopPropagation(); handleAddAddon({ id: p.id, name: p.name, price: Number(p.price) }); }}
                        className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-[20px] bg-muted/30 border border-border/40 hover:border-primary/40 hover:bg-primary/5 active:scale-[0.92] transition-all disabled:opacity-50 group relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform" />
                        <span className="text-xl leading-none relative z-10">
                          {p.category === 'drink' ? '💧' : p.category === 'food' ? '🍕' : p.category === 'equipment' ? '⚽' : '📦'}
                        </span>
                        <div className="text-center relative z-10">
                          <span className="text-[7px] font-black uppercase tracking-tighter block line-clamp-1 mb-0.5">{p.name}</span>
                          <span className="text-[8px] font-black text-primary">{formatCurrency(p.price)}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─── Extend Match ─── */}
            {booking.status === 'confirmed' && !isCancelled && (
              <div className="p-5 md:p-6 border-b border-border/20">
                <div className="flex items-center gap-2 mb-3">
                  <Timer className="h-3.5 w-3.5 text-primary/60" />
                  <p className="text-[9px] font-black uppercase tracking-widest text-primary/60">Extend Duration</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    disabled={isUpdating}
                    onClick={() => handleExtendMatch(30)}
                    className="flex items-center justify-center gap-2 p-3 rounded-xl bg-muted/20 border border-border/30 hover:border-primary/40 hover:bg-primary/5 active:scale-[0.97] transition-all text-xs font-black text-primary disabled:opacity-50"
                  >
                    <Plus className="h-3 w-3" /> 30 min
                  </button>
                  <button 
                    disabled={isUpdating}
                    onClick={() => handleExtendMatch(60)}
                    className="flex items-center justify-center gap-2 p-3 rounded-xl bg-muted/20 border border-border/30 hover:border-primary/40 hover:bg-primary/5 active:scale-[0.97] transition-all text-xs font-black text-primary disabled:opacity-50"
                  >
                    <Plus className="h-3 w-3" /> 1 hour
                  </button>
                </div>
              </div>
            )}

            {/* ─── Notes ─── */}
            {booking.notes && (
              <div className="p-5 md:p-6">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 mb-2">Notes</p>
                <p className="text-xs font-medium text-foreground/70 italic leading-relaxed">{booking.notes}</p>
              </div>
            )}
          </div>

          {/* ─── Action Footer ─── */}
          <div className="p-4 pb-10 md:pb-5 shrink-0 border-t border-border/20 bg-muted/20 space-y-3 safe-area-bottom">
            <div className="flex gap-2.5">
              {(booking.status === 'confirmed' || booking.status === 'pending') && (
                  <div className="flex-1 flex flex-col gap-2">
                    <Button 
                      disabled={isUpdating}
                      variant="ghost" 
                      className="w-full h-10 md:h-11 rounded-lg font-black uppercase tracking-widest text-[9px] text-red-500/70 border border-red-500/10 hover:text-red-600 hover:bg-red-500/5 transition-all"
                      onClick={() => handleUpdateStatus('cancelled')}
                    >
                      Delete Match
                    </Button>
                    {(booking.paid_amount > 0) && (
                      <Button 
                        disabled={isUpdating}
                        className="w-full h-10 md:h-11 rounded-lg font-black uppercase tracking-widest text-[9px] bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-amber-500/20 transition-all flex items-center justify-center gap-1.5"
                        onClick={handleCancelWithCredit}
                      >
                        <Zap className="h-3 w-3" />
                        Cancel & Credit
                      </Button>
                    )}
                  </div>
              )}
              {booking.status === 'pending' && (
                <Button 
                  disabled={isUpdating}
                  className="flex-1 h-12 md:h-14 rounded-xl font-black uppercase tracking-widest text-[10px] bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 active:scale-[0.97] transition-all"
                  onClick={() => handleUpdateStatus('confirmed')}
                >
                  {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : "✓ Confirm"}
                </Button>
              )}
              {booking.status === 'confirmed' && (
                <>
                  <Button 
                    variant="ghost" 
                    className="flex-1 h-12 md:h-14 rounded-xl font-black uppercase tracking-widest text-[10px] text-blue-600 border border-blue-500/20 hover:bg-blue-500/5 active:scale-[0.97] transition-all flex items-center justify-center gap-2"
                    onClick={() => {
                      import('@/lib/notifications').then(async ({ generateWhatsAppNotification }) => {
                        const result = await generateWhatsAppNotification('reminder_1hr', booking);
                        if (result.whatsappUrl) window.open(result.whatsappUrl, '_blank');
                      });
                    }}
                  >
                    <MessageCircle className="h-4 w-4" />
                    Reminder
                  </Button>
                  <Button 
                    disabled={isUpdating}
                    className="flex-1 h-12 md:h-14 rounded-xl font-black uppercase tracking-widest text-[10px] bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl active:scale-[0.97] transition-all"
                    onClick={() => handleUpdateStatus('completed')}
                  >
                    {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                      <span className="flex items-center gap-2">
                        <Zap className="h-3.5 w-3.5" />
                        Finish Match
                      </span>
                    )}
                  </Button>
                </>
              )}
              {booking.status === 'completed' && (
                <Button 
                  variant="ghost" 
                  className="flex-1 h-12 md:h-14 rounded-xl font-black uppercase tracking-widest text-[10px] text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/5 active:scale-[0.97] transition-all flex items-center justify-center gap-2"
                  onClick={() => {
                    import('@/lib/notifications').then(async ({ generateWhatsAppNotification }) => {
                      const result = await generateWhatsAppNotification('booking_completed', booking);
                      if (result.whatsappUrl) window.open(result.whatsappUrl, '_blank');
                    });
                  }}
                >
                  <Receipt className="h-4 w-4" />
                  Send Receipt
                </Button>
              )}
              {booking.status === 'cancelled' && (
                <Button 
                  variant="ghost" 
                  className="flex-1 h-12 md:h-14 rounded-xl font-black uppercase tracking-widest text-[10px] text-red-600 border border-red-500/20 hover:bg-red-500/5 active:scale-[0.97] transition-all flex items-center justify-center gap-2"
                  onClick={() => {
                    import('@/lib/notifications').then(async ({ generateWhatsAppNotification }) => {
                      const result = await generateWhatsAppNotification('booking_cancelled', booking);
                      if (result.whatsappUrl) window.open(result.whatsappUrl, '_blank');
                    });
                  }}
                >
                  <MessageCircle className="h-4 w-4" />
                  Notify Cancel
                </Button>
              )}
            </div>
          </div>

          {/* ─── WhatsApp Notification Toast ─── */}
          {whatsappPending && (
            <div className="p-4 shrink-0 border-t border-emerald-500/20 bg-gradient-to-r from-emerald-500/5 to-emerald-500/10 animate-in slide-in-from-bottom-3 duration-300">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black uppercase tracking-tight text-emerald-700 dark:text-emerald-400">Notify Customer?</p>
                  <p className="text-[9px] font-bold text-muted-foreground truncate">Send to {booking.guest_name} via WhatsApp</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setWhatsappPending(null)}
                    className="px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted transition-colors"
                  >
                    Skip
                  </button>
                  <button
                    onClick={() => {
                      window.open(whatsappPending, '_blank')
                      setWhatsappPending(null)
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <MessageCircle className="h-3 w-3" />
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </Portal>
  )
}

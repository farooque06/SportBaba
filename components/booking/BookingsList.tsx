"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Filter, MapPin, User, Clock, CheckCircle2, XCircle, CreditCard, Banknote, Calendar, ChevronRight, X, Info, Loader2, Package, Phone, Zap } from "lucide-react"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { formatCurrency, getWhatsAppLink, cn } from "@/lib/utils"
import { updatePaymentStatus, updateBookingStatus, addBookingAddon, removeBookingAddon, extendBooking } from "@/lib/actions/booking"
import { fetchProducts } from "@/lib/actions/inventory"
import { useSport } from "@/components/providers/SportProvider"
import { LoyaltyBadge } from "@/components/ui/LoyaltyBadge"
import { BookingDetailModal } from "./BookingDetailModal"

interface BookingsListProps {
  bookings: any[]
}

const statusColors: Record<string, string> = {
  confirmed: "bg-green-500/10 text-green-500 border-green-500/20",
  pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  cancelled: "bg-red-500/10 text-red-500 border-red-500/20 line-through",
  completed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(today.getDate() + 1)

  if (d.toDateString() === today.toDateString()) return "Today"
  if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow"
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function BookingsList({ bookings: initialBookings }: BookingsListProps) {
  const [bookings, setBookings] = useState<any[]>(initialBookings)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBooking, setSelectedBooking] = useState<any>(null)

  // Keep local bookings in sync with props
  useEffect(() => {
    setBookings(initialBookings)
  }, [initialBookings])

  const updateLocalBooking = (updated: any) => {
    setBookings(prev => prev.map(b => b.id === updated.id ? updated : b))
    if (selectedBooking?.id === updated.id) {
      setSelectedBooking(updated)
    }
  }
  const [isUpdating, setIsUpdating] = useState(false)
  const [availableProducts, setAvailableProducts] = useState<any[]>([])
  const { sport, facilityId } = useSport()
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'past' | 'due' | 'cancelled'>('all')
  const [dateFilter, setDateFilter] = useState<'today' | 'all'>('today')
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (selectedBooking && selectedBooking.facility_id) {
       loadAvailableProducts(selectedBooking.facility_id)
    }
  }, [selectedBooking])

  const loadAvailableProducts = async (facilityId: string) => {
    const data = await fetchProducts(facilityId)
    setAvailableProducts(data)
  }

  const handleBookingUpdate = (updated: any) => {
    updateLocalBooking(updated)
  }

  const handleMarkAsPaid = async (method: string) => {
    if (!selectedBooking) return
    setIsUpdating(true)
    const result = await updatePaymentStatus(selectedBooking.id, 'paid', method, undefined, facilityId)
    if (result.success) {
      updateLocalBooking(result.data)
    }
    setIsUpdating(false)
  }

  const handleUpdateStatus = async (status: string) => {
    if (!selectedBooking) return
    
    // Balance validation before completing
    if (status === 'completed') {
       const isPaid = Number(selectedBooking.paid_amount) >= Number(selectedBooking.total_price);
       if (!isPaid && !confirm("This match has an outstanding balance. Are you sure you want to mark it as completed?")) {
          return;
       }
    }

    setIsUpdating(true)
    const result = await updateBookingStatus(selectedBooking.id, status, facilityId!)
    if (result.success) {
      updateLocalBooking(result.data)
    }
    setIsUpdating(false)
  }

  const handleAddAddon = async (item: { id: string, name: string, price: number }) => {
    if (!selectedBooking) return
    setIsUpdating(true)
    const result = await addBookingAddon(selectedBooking.id, item, facilityId!)
    if (result.success) {
      updateLocalBooking(result.data)
    }
    setIsUpdating(false)
  }

  const handleRemoveAddon = async (timestamp: string) => {
    if (!selectedBooking) return
    setIsUpdating(true)
    const result = await removeBookingAddon(selectedBooking.id, timestamp, facilityId!)
    if (result.success) {
      updateLocalBooking(result.data)
    }
    setIsUpdating(false)
  }

  const handleExtendMatch = async (minutes: number) => {
    if (!selectedBooking) return
    setIsUpdating(true)
    const result = await extendBooking(selectedBooking.id, minutes, facilityId!)
    if (result.success) {
      updateLocalBooking(result.data)
    }
    setIsUpdating(false)
  }

  const filteredBookings = bookings
    .filter(b => {
      const bStart = new Date(b.start_time)
      const bEnd = new Date(b.end_time)
      
      const matchesSearch = 
        b.guest_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.id.includes(searchTerm) ||
        b.resource?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;

      // Status Filter
      if (statusFilter === 'upcoming') {
        if (bStart <= now || b.status === 'cancelled') return false;
      }
      if (statusFilter === 'past') {
        if (bEnd > now || b.status === 'cancelled') return false;
      }
      if (statusFilter === 'due') {
        if (b.payment_status === 'paid' || b.status === 'cancelled') return false;
      }
      if (statusFilter === 'cancelled') {
        if (b.status !== 'cancelled') return false;
      } else {
        // By default, hide cancelled matches if not explicitly selected
        if (b.status === 'cancelled' && statusFilter !== 'all') return false;
      }

      // Date Filter
      if (dateFilter === 'today') {
        return bStart.toDateString() === now.toDateString();
      }
      
      return true;
    })
    .sort((a, b) => {
      const aStart = new Date(a.start_time)
      const aEnd = new Date(a.end_time)
      const bStart = new Date(b.start_time)
      const bEnd = new Date(b.end_time)

      const aIsLive = a.status === 'confirmed' && aStart <= now && aEnd > now
      const bIsLive = b.status === 'confirmed' && bStart <= now && bEnd > now
      
      if (aIsLive && !bIsLive) return -1
      if (!aIsLive && bIsLive) return 1

      const aIsUpcoming = a.status === 'confirmed' && aStart > now
      const bIsUpcoming = b.status === 'confirmed' && bStart > now

      if (aIsUpcoming && !bIsUpcoming) return -1
      if (!aIsUpcoming && bIsUpcoming) return 1

      // Otherwise sort by start time
      return aStart.getTime() - bStart.getTime()
    })

  return (
    <div className="space-y-10">
      {/* Mini Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="glass-card p-6 rounded-[32px] border border-border/40 relative overflow-hidden group hover:border-primary/40 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
             <Calendar className="h-12 w-12" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Total Today</p>
          <p className="text-3xl font-black tracking-tighter">
            {bookings.filter(b => new Date(b.start_time).toDateString() === now.toDateString()).length}
          </p>
        </div>
        <div className="glass-card p-6 rounded-[32px] border border-border/40 relative overflow-hidden group hover:border-red-500/40 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
             <Zap className="h-12 w-12" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500/60 mb-2">Live Now</p>
          <p className="text-3xl font-black tracking-tighter text-red-500">
            {bookings.filter(b => {
              const start = new Date(b.start_time);
              const end = new Date(b.end_time);
              return b.status === 'confirmed' && start <= now && end > now;
            }).length}
          </p>
        </div>
        <div className="glass-card p-6 rounded-[32px] border border-border/40 relative overflow-hidden group hover:border-primary/40 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
             <Clock className="h-12 w-12" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Upcoming</p>
          <p className="text-3xl font-black tracking-tighter">
            {bookings.filter(b => new Date(b.start_time) > now && b.status === 'confirmed').length}
          </p>
        </div>
        <div className="glass-card p-6 rounded-[32px] border border-border/40 relative overflow-hidden group hover:border-amber-500/40 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
             <Banknote className="h-12 w-12" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500/60 mb-2">Pending Pmts</p>
          <p className="text-3xl font-black tracking-tighter text-amber-600">
            {formatCurrency(bookings.reduce((s, b) => b.payment_status !== 'paid' && b.status !== 'cancelled' ? s + (Number(b.total_price) - Number(b.paid_amount)) : s, 0))}
          </p>
        </div>
      </div>

      {/* Filtering Toolbar (Premium Command Bar) */}
      <div className="flex flex-col lg:flex-row gap-6 items-center justify-between bg-card/60 p-3 md:p-4 rounded-[40px] border border-border/40 backdrop-blur-3xl shadow-2xl shadow-black/5">
        <div className="flex-1 relative w-full group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input 
            placeholder="Search by customer, pitch or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-border/30 p-5 pl-16 rounded-[28px] text-sm font-bold outline-none focus:ring-4 ring-primary/10 focus:border-primary/30 transition-all placeholder:text-muted-foreground/40"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0 w-full lg:w-auto">
          <div className="flex bg-muted/30 p-1.5 rounded-[24px] border border-border/40 w-full lg:auto overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All' },
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'past', label: 'Past' },
              { id: 'due', label: 'Due' },
              { id: 'cancelled', label: 'Cancelled' },
            ].map((f) => (
              <button 
                key={f.id}
                onClick={() => setStatusFilter(f.id as any)}
                className={cn(
                  "px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 whitespace-nowrap",
                  statusFilter === f.id ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/20' : 'text-muted-foreground hover:bg-white/5'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex bg-muted/30 p-1.5 rounded-[24px] border border-border/40 w-full lg:w-auto shrink-0">
            <button 
              onClick={() => setDateFilter('today')}
              className={`flex-1 lg:flex-none px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${dateFilter === 'today' ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/20' : 'text-muted-foreground hover:bg-white/5'}`}
            >
              Today
            </button>
            <button 
              onClick={() => setDateFilter('all')}
              className={`flex-1 lg:flex-none px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${dateFilter === 'all' ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/20' : 'text-muted-foreground hover:bg-white/5'}`}
            >
              All
            </button>
          </div>
          <Button variant="ghost" className="h-14 w-14 rounded-[22px] border border-border/40 bg-muted/20 hover:bg-primary hover:text-white transition-all active:scale-90">
            <Filter className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredBookings.length === 0 ? (
          <div className="p-20 text-center glass-card border-dashed border-border/40 rounded-[40px] flex flex-col items-center justify-center gap-6">
             <div className="h-20 w-20 rounded-full bg-muted/20 flex items-center justify-center text-muted-foreground/40 animate-pulse">
                <Calendar className="h-10 w-10" />
             </div>
             <div className="space-y-2">
                <p className="text-2xl font-black italic uppercase tracking-tighter">No bookings found</p>
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Adjust filters or create a new match entry</p>
             </div>
          </div>
        ) : (
          filteredBookings.map((booking, idx) => (
            <button 
              type="button"
              key={booking.id}
              onClick={() => setSelectedBooking(booking)}
              className="group relative bg-card/40 hover:bg-card/70 border border-border/40 hover:border-primary/40 p-4 md:p-8 rounded-[40px] cursor-pointer flex flex-col lg:flex-row lg:items-center gap-6 md:gap-8 shadow-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 overflow-hidden text-left animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              {/* Vertical Status Accent */}
              <div className={cn(
                "absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 rounded-r-full transition-all duration-500",
                booking.status === 'confirmed' ? 'bg-primary' : 
                booking.status === 'completed' ? 'bg-emerald-500' :
                booking.status === 'cancelled' ? 'bg-red-500' : 'bg-amber-500'
              )} />

              {/* Time & Logistics Block */}
              <div className="flex flex-col min-w-[180px] border-l-2 border-transparent pl-2 lg:pl-0">
                <div className="flex items-center gap-2 mb-2">
                   <div className="h-2 w-2 rounded-full bg-primary/40" />
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{formatDate(booking.start_time)}</p>
                </div>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-3xl font-black tracking-tighter leading-none">{formatTime(booking.start_time).split(' ')[0]}</span>
                  <span className="text-xs font-black text-muted-foreground uppercase">{formatTime(booking.start_time).split(' ')[1]}</span>
                  <span className="mx-2 text-muted-foreground/30 font-light text-2xl">—</span>
                  <span className="text-lg font-bold text-muted-foreground tracking-tight">{formatTime(booking.end_time)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-muted/50 flex items-center justify-center text-lg shadow-inner">
                     {booking.resource?.unit_type === 'footshall' ? '⚽' : '🏏'}
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none mb-1">Resource</p>
                    <p className="text-sm font-black tracking-tight">{booking.resource?.name}</p>
                  </div>
                </div>
              </div>

              {/* Guest Profile Section */}
              <div className="flex-1 flex items-center gap-4 lg:px-8 lg:border-x border-border/40 py-4 lg:py-0">
                <div className="relative shrink-0">
                  <div className="h-16 w-16 rounded-[24px] bg-gradient-to-br from-muted to-background flex items-center justify-center border border-border shadow-2xl group-hover:scale-105 transition-transform duration-500">
                    <User className="h-7 w-7 text-muted-foreground/50" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-lg bg-background border border-border flex items-center justify-center text-[10px]">
                     <LoyaltyBadge visits={booking.customer?.total_visits} />
                  </div>
                </div>
                <div className="min-w-0">
                  <h4 className="text-2xl font-black tracking-tighter leading-none mb-2 truncate group-hover:text-primary transition-colors">
                    {booking.guest_name || "Anonymous Player"}
                  </h4>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/50 border border-border/40">
                       <Phone className="h-3 w-3 text-muted-foreground" />
                       <span className="text-[10px] font-black tracking-widest text-muted-foreground">{booking.guest_phone || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Settlement & Status Tags */}
              <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-4 shrink-0 lg:min-w-[160px]">
                 <div className="text-right">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mb-1">Settlement</p>
                    <p className="text-2xl font-black tracking-tighter leading-none">{formatCurrency(booking.total_price)}</p>
                 </div>
                 <div className="flex items-center gap-2">
                    {(() => {
                        const start = new Date(booking.start_time)
                        const end = new Date(booking.end_time)
                        const isLive = booking.status === 'confirmed' && start <= now && end > now
                        if (isLive) return (
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-500 text-white shadow-lg shadow-red-500/20">
                             <Zap className="h-3 w-3 animate-pulse" />
                             <span className="text-[8px] font-black uppercase tracking-widest">Live Now</span>
                          </div>
                        )
                        return (
                          <div className={cn(
                            "px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all shadow-sm",
                            statusColors[booking.status] || ''
                          )}>
                            {booking.status}
                          </div>
                        )
                    })()}
                    <div className={cn(
                      "px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest border shadow-sm",
                      booking.payment_status === 'paid' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 
                      booking.payment_status === 'partial' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                      'bg-red-500/10 text-red-500 border-red-500/20'
                    )}>
                      {booking.payment_status}
                    </div>
                 </div>
              </div>

              {/* Desktop Chevron */}
              <div className="hidden lg:flex items-center justify-center pl-4">
                 <div className="h-12 w-12 rounded-[20px] bg-muted/20 flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-white group-hover:scale-110 transition-all duration-500 shadow-sm group-hover:shadow-primary/20 group-hover:shadow-xl">
                    <ChevronRight className="h-6 w-6" />
                 </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <BookingDetailModal 
          booking={selectedBooking} 
          onClose={() => setSelectedBooking(null)} 
          onUpdate={handleBookingUpdate}
        />
      )}
    </div>
  )
}

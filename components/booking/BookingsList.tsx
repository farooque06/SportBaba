"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Filter, MapPin, User, Clock, CheckCircle2, XCircle, CreditCard, Banknote, Calendar, ChevronRight, X, Info, Loader2, Package, Phone } from "lucide-react"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { formatCurrency, getWhatsAppLink } from "@/lib/utils"
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
      const matchesSearch = 
        b.guest_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.id.includes(searchTerm) ||
        b.resource?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (dateFilter === 'today') {
        const bookingDate = new Date(b.start_time).toDateString();
        const today = now.toDateString();
        return matchesSearch && bookingDate === today;
      }
      
      return matchesSearch;
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
    <div className="space-y-6">
      {/* Filtering Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card/40 p-4 rounded-[32px] border border-border/50 backdrop-blur-xl">
        <div className="flex-1 relative w-full group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input 
            placeholder="Search by customer, pitch or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-border/50 p-4 pl-14 rounded-2xl text-sm font-bold outline-none focus:ring-2 ring-primary/20 transition-all"
          />
        </div>
        <div className="flex gap-2 shrink-0">
          <button 
            onClick={() => setDateFilter('today')}
            className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${dateFilter === 'today' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}
          >
            Today
          </button>
          <button 
            onClick={() => setDateFilter('all')}
            className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${dateFilter === 'all' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}
          >
            All Time
          </button>
          <Button variant="ghost" className="h-14 w-14 rounded-2xl border border-border/50">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <Card className="p-20 text-center border-dashed bg-transparent flex flex-col items-center justify-center gap-4 opacity-50">
             <Calendar className="h-12 w-12 text-muted-foreground" />
             <div className="space-y-1">
                <p className="text-xl font-black italic uppercase tracking-tighter">No bookings found</p>
                <p className="text-xs font-bold uppercase tracking-widest">Adjust filters or create a new entry</p>
             </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredBookings.map((booking) => (
              <button 
                type="button"
                key={booking.id}
                onClick={() => setSelectedBooking(booking)}
                className="group relative bg-card/40 hover:bg-card/60 border border-border/50 hover:border-primary/30 p-4 md:p-6 rounded-2xl md:rounded-[32px] cursor-pointer flex flex-col md:flex-row md:items-center gap-4 md:gap-6 shadow-sm hover:shadow-xl hover:shadow-primary/5 overflow-hidden w-full text-left"
              >
                {/* Status Indicator Bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                  booking.status === 'confirmed' ? 'bg-blue-500' : 
                  booking.status === 'completed' ? 'bg-green-500' :
                  booking.status === 'cancelled' ? 'bg-red-500' : 'bg-amber-500'
                }`} />

                {/* Time & Resource Section */}
                <div className="flex flex-col min-w-[140px] pl-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">{formatDate(booking.start_time)}</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-base md:text-lg font-black tracking-tight">{formatTime(booking.start_time)} - {formatTime(booking.end_time)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="h-5 w-5 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                       <MapPin className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-sm font-bold text-foreground/80">{booking.resource?.name}</span>
                  </div>
                </div>

                {/* Player Section */}
                <div className="flex-1 flex items-center gap-3 md:gap-4 border-t md:border-t-0 md:border-l border-border/50 pt-3 md:pt-0 md:pl-6">
                  <div className="h-12 w-12 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center border border-border shadow-inner shrink-0">
                    <User className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                     <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-base md:text-xl font-black tracking-tight leading-none truncate">{booking.guest_name || "Guest User"}</h4>
                        <LoyaltyBadge visits={booking.customer?.total_visits} />
                     </div>
                     <p className="text-xs font-bold text-primary uppercase tracking-widest truncate">{booking.guest_phone || "No contact provided"}</p>
                  </div>
                </div>

                {/* Financial & Status Tags */}
                <div className="flex items-center gap-2 flex-wrap">
                   {(() => {
                      const start = new Date(booking.start_time)
                      const end = new Date(booking.end_time)
                      const isLive = booking.status === 'confirmed' && start <= now && end > now
                      const isUpcoming = booking.status === 'confirmed' && start > now
                      
                      if (isLive) return (
                         <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse">
                            <div className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Live Match</span>
                         </div>
                      )
                      if (isUpcoming) return (
                         <div className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                            <span className="text-[9px] font-black uppercase tracking-widest">Upcoming</span>
                         </div>
                      )
                      return null
                   })()}
                   <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-colors ${statusColors[booking.status] || ''}`}>
                      {booking.status}
                   </div>
                   <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                     booking.payment_status === 'paid' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                     booking.payment_status === 'partial' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                     'bg-red-500/10 text-red-500 border-red-500/20'
                   }`}>
                      {Number(booking.paid_amount) > 0 && Number(booking.paid_amount) < Number(booking.total_price) ? (
                        <>Paid: {formatCurrency(booking.paid_amount)} / {formatCurrency(booking.total_price)}</>
                      ) : (
                        formatCurrency(booking.total_price)
                      )}
                   </div>
                </div>

                {/* View Action */}
                <div className="hidden md:flex justify-end">
                   <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-muted/50 text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      <ChevronRight className="h-5 w-5" />
                   </div>
                </div>
              </button>
            ))}
          </div>
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

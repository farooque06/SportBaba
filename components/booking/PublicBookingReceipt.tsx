"use client"

import { useState } from "react"
import { 
  CheckCircle2, Download, Printer, Share2, 
  MapPin, Clock, Calendar, Phone, ArrowLeft, RefreshCw
} from "lucide-react"
import { formatCurrency, getWhatsAppLink } from "@/lib/utils"

interface BookingReceiptProps {
  bookingId?: string;
  facilityName?: string;
  facilitySlug?: string;
  facilityLogo?: string | null;
  sportType?: string;
  resourceName: string;
  resourceType?: string;
  guestName: string;
  guestPhone: string;
  bookingNote?: string;
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
  totalPrice: number;
  paymentStatus?: string;
  onBookAnother?: () => void;
}

export function PublicBookingReceipt({
  bookingId,
  facilityName = "Sports Venue",
  facilitySlug,
  facilityLogo,
  sportType = "Venue",
  resourceName,
  resourceType,
  guestName,
  guestPhone,
  startTime,
  endTime,
  durationMinutes,
  totalPrice,
  onBookAnother
}: BookingReceiptProps) {
  const dateFormatted = startTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })

  const timeFormatted = `${startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – ${endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  const refCode = bookingId ? `SB-${bookingId.slice(0, 6).toUpperCase()}` : `SB-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

  // WhatsApp squad share text
  const shareMessage = `*Match Booking Confirmed!* ⚽\n\n📍 *Venue:* ${facilityName}\n🏟️ *Court:* ${resourceName}\n📅 *Date:* ${dateFormatted}\n⏰ *Time:* ${timeFormatted} (${durationMinutes} mins)\n👤 *Booked by:* ${guestName}\n💰 *Fee:* ${formatCurrency(totalPrice)}\n\nRef: ${refCode}`

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="max-w-md mx-auto py-6 px-4 animate-in fade-in zoom-in-95 duration-300">
      
      {/* ─── Clean Ticket / Slip ─── */}
      <div 
        id="booking-receipt-canvas" 
        className="bg-card border border-border/80 rounded-3xl p-6 sm:p-7 shadow-xl text-foreground print:border-none print:shadow-none print:p-0"
      >
        {/* Header Icon + Venue */}
        <div className="text-center pb-5 border-b border-dashed border-border/70">
          <div className="h-14 w-14 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-emerald-500/20">
            <CheckCircle2 className="h-7 w-7 stroke-[2.5]" />
          </div>

          <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            Booking Confirmed
          </span>

          <h3 className="text-xl font-black text-foreground mt-3 tracking-tight">
            {facilityName}
          </h3>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            Ref: {refCode}
          </p>
        </div>

        {/* Clean Essential Specs */}
        <div className="py-5 space-y-3.5 text-sm border-b border-dashed border-border/70">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-primary" /> Court / Pitch
            </span>
            <span className="font-bold text-foreground">{resourceName}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-primary" /> Date
            </span>
            <span className="font-bold text-foreground">{dateFormatted}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-primary" /> Time
            </span>
            <span className="font-bold text-primary">{timeFormatted}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs">Player</span>
            <span className="font-semibold text-foreground">{guestName} ({guestPhone})</span>
          </div>
        </div>

        {/* Total Price & Payment Hint */}
        <div className="pt-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Fee</span>
            <p className="text-[11px] text-amber-500 font-semibold">Pay at counter</p>
          </div>
          <span className="text-2xl font-black text-foreground tracking-tight">
            {formatCurrency(totalPrice)}
          </span>
        </div>
      </div>

      {/* ─── Simple Direct Action Buttons ─── */}
      <div className="mt-5 space-y-2.5 print:hidden">
        {/* Download / Print */}
        <button
          type="button"
          onClick={handlePrint}
          className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all shadow-md shadow-primary/20 cursor-pointer"
        >
          <Download className="h-4 w-4" />
          Download / Print Receipt
        </button>

        {/* WhatsApp Share */}
        <a
          href={getWhatsAppLink(guestPhone, shareMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer shadow-xs"
        >
          <Share2 className="h-4 w-4" />
          Share to WhatsApp Squad
        </a>

        {/* Bottom clean links */}
        <div className="flex items-center justify-between pt-3 px-1 text-xs font-semibold">
          <button
            type="button"
            onClick={onBookAnother ? onBookAnother : () => window.location.reload()}
            className="text-primary hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Book Another Slot
          </button>

          <a href="/" className="text-muted-foreground hover:text-foreground">
            Back to Home
          </a>
        </div>
      </div>

    </div>
  )
}

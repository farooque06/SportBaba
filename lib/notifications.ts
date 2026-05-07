"use server"

import { formatCurrency, getWhatsAppLink } from "@/lib/utils"

// ─────────────────────────────────────────────────────────
// WhatsApp Notification Service for SportBaba
// ─────────────────────────────────────────────────────────
// Uses the WhatsApp Web deep link (wa.me) to open pre-filled
// messages. Works instantly on any device with WhatsApp installed.
// Can be upgraded to WhatsApp Business API (Twilio/Meta) later.
// ─────────────────────────────────────────────────────────

export type NotificationType = 
  | 'booking_confirmed' 
  | 'booking_pending' 
  | 'booking_cancelled' 
  | 'booking_completed' 
  | 'payment_received' 
  | 'reminder_1hr'
  | 'payment_request'

interface BookingData {
  id: string
  guest_name: string
  guest_phone?: string
  start_time: string
  end_time: string
  total_price?: number
  paid_amount?: number
  payment_status?: string
  payment_method?: string
  status?: string
  bill_items?: any[]
  resource?: {
    name: string
    unit_type?: string
    base_price?: number
  }
}

interface NotificationResult {
  sent: boolean
  whatsappUrl?: string
  message?: string
  error?: string
}

// ─── Format Helpers ───
function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function formatDuration(startStr: string, endStr: string) {
  const start = new Date(startStr)
  const end = new Date(endStr)
  const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
  return hours >= 1 ? `${hours}h` : `${hours * 60}min`
}

// ─── Message Templates ───
function getMessageTemplate(type: NotificationType, booking: BookingData, facilityName?: string): string {
  const name = booking.guest_name || 'Player'
  const resource = booking.resource?.name || 'Court'
  const date = formatDate(booking.start_time)
  const time = `${formatTime(booking.start_time)} - ${formatTime(booking.end_time)}`
  const duration = formatDuration(booking.start_time, booking.end_time)
  const total = formatCurrency(booking.total_price || 0)
  const paid = formatCurrency(booking.paid_amount || 0)
  const due = formatCurrency(Math.max(0, (Number(booking.total_price) || 0) - (Number(booking.paid_amount) || 0)))
  const refId = booking.id.slice(0, 8).toUpperCase()
  const facility = facilityName || 'SportBaba'

  switch (type) {
    case 'booking_confirmed':
      return [
        `✅ *Booking Confirmed!*`,
        ``,
        `Hi ${name},`,
        `Your booking has been confirmed.`,
        ``,
        `🏟️ *${resource}*`,
        `📅 ${date}`,
        `⏰ ${time} (${duration})`,
        `💰 Total: ${total}`,
        ``,
        `📋 Ref: #${refId}`,
        ``,
        `See you at *${facility}*! 🎉`,
      ].join('\n')

    case 'booking_pending':
      return [
        `⏳ *Booking Request Received*`,
        ``,
        `Hi ${name},`,
        `We've received your booking request.`,
        ``,
        `🏟️ *${resource}*`,
        `📅 ${date}`,
        `⏰ ${time} (${duration})`,
        `💰 Total: ${total}`,
        ``,
        `📋 Ref: #${refId}`,
        ``,
        `We'll confirm your slot shortly!`,
        `— *${facility}*`,
      ].join('\n')

    case 'booking_cancelled':
      return [
        `❌ *Booking Cancelled*`,
        ``,
        `Hi ${name},`,
        `Your booking at *${resource}* on ${date} (${time}) has been cancelled.`,
        ``,
        `📋 Ref: #${refId}`,
        ``,
        `If this was a mistake, please contact us to rebook.`,
        `— *${facility}*`,
      ].join('\n')

    case 'booking_completed':
      return [
        `🏆 *Match Complete!*`,
        ``,
        `Great game, ${name}!`,
        ``,
        `🏟️ *${resource}*`,
        `📅 ${date} • ${time}`,
        ``,
        `━━━ Receipt ━━━`,
        `🏷️ Court Fee: ${total}`,
        ...(booking.bill_items?.length ? [
          ...formatBillItems(booking.bill_items),
          ``,
          `💰 *Grand Total: ${formatCurrency(calculateGrandTotal(booking))}*`,
        ] : []),
        `✅ Paid: ${paid}`,
        ...(Number(booking.total_price) > Number(booking.paid_amount || 0) ? [`⚠️ *Due: ${due}*`] : []),
        `━━━━━━━━━━━━━━`,
        ``,
        `📋 Ref: #${refId}`,
        ``,
        `Thanks for playing at *${facility}*! 🙌`,
        `Book again soon!`,
      ].join('\n')

    case 'payment_received':
      return [
        `💳 *Payment Received*`,
        ``,
        `Hi ${name},`,
        `We've received your payment of ${paid}.`,
        ``,
        `🏟️ ${resource} • ${date}`,
        `📋 Ref: #${refId}`,
        ...(Number(booking.total_price) > Number(booking.paid_amount || 0) 
          ? [`⚠️ Remaining due: ${due}`] 
          : [`✅ *Fully Paid* — Thank you!`]
        ),
        ``,
        `— *${facility}*`,
      ].join('\n')

    case 'reminder_1hr':
      return [
        `⭐ *SMART REMINDER: GAME ON!*`,
        ``,
        `Hi ${name}, your match at *${facility}* is starting soon!`,
        ``,
        `🏟️ *Court:* ${resource}`,
        `⏰ *Time:* ${time}`,
        `📅 *Date:* ${date}`,
        ``,
        `📍 *Location:* https://maps.google.com/?q=${encodeURIComponent(facility)}`,
        ``,
        ...(Number(booking.paid_amount || 0) < Number(booking.total_price || 0) 
          ? [
              `💳 *Settlement Required:*`,
              `Please settle the balance of *${due}* at the counter upon arrival.`,
              ``
            ]
          : [`✅ *Payment:* Fully Settled. See you at the pitch!`, ``]
        ),
        `👟 *Pro-Tips:*`,
        `• Arrive 10 mins early for warm-up.`,
        `• Don't forget your water bottle and proper footwear.`,
        ``,
        `Need to change something? Call us: +977-XXXXXXXXXX`,
        ``,
        `See you soon! ⚽🏀🎾`,
      ].join('\n')

    case 'payment_request':
      return [
        `⚠️ *PAYMENT REMINDER: SETTLEMENT PENDING*`,
        ``,
        `Hi ${name}, we hope you enjoyed your match at *${facility}*!`,
        ``,
        `Our records show a pending balance for your recent booking:`,
        `🏟️ *Court:* ${resource}`,
        `📅 *Date:* ${date}`,
        `⏰ *Time:* ${time}`,
        ``,
        `💰 *Outstanding Amount: ${due}*`,
        ``,
        `Please settle this via our online portal or visit the counter next time.`,
        ``,
        `📋 Ref: #${refId}`,
        `Thank you! 🙏`,
      ].join('\n')

    default:
      return `Booking update for ${name} at ${facility}. Ref: #${refId}`
  }
}

function formatBillItems(items: any[]): string[] {
  const grouped = items.reduce((acc: any, item: any) => {
    const existing = acc.find((i: any) => i.name === item.name)
    if (existing) {
      existing.count += 1
      existing.totalPrice += Number(item.price)
    } else {
      acc.push({ name: item.name, count: 1, totalPrice: Number(item.price) })
    }
    return acc
  }, [])

  return grouped.map((item: any) => 
    `  ${item.count > 1 ? `${item.count}x ` : ''}${item.name}: ${formatCurrency(item.totalPrice)}`
  )
}

function calculateGrandTotal(booking: BookingData): number {
  const base = Number(booking.total_price) || 0
  return base // total_price already includes addons since server-side adds them
}

/**
 * Generate a daily financial summary for the facility owner.
 */
export async function generateDailySummaryNotification(report: any): Promise<NotificationResult> {
  const summary = [
    `📊 *SPORTBABA DAILY CLOSURE*`,
    `📅 Date: ${new Date(report.date).toLocaleDateString()}`,
    ``,
    `💰 *Total Revenue: ${formatCurrency(report.totalRevenue)}*`,
    `🏟️ Matches: ${report.bookingCount}`,
    `❌ Cancellations: ${report.canceledCount} (${formatCurrency(report.lostRevenue || 0)} lost)`,
    ``,
    `*Venue Breakdown:*`,
    ...report.venues.map((v: any) => `• ${v.name}: ${formatCurrency(v.value)}`),
    ``,
    `*Payment Methods:*`,
    ...report.payments.map((p: any) => `• ${p.name}: ${formatCurrency(p.value)}`),
    ``,
    `Generated by: SportBaba Accounts Hub`
  ].join('\n')

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(summary)}`
  
  return {
    sent: true,
    whatsappUrl,
    message: summary
  }
}

// ─── Public API ───

/**
 * Generate a WhatsApp notification URL for a booking event.
 * Returns the URL and formatted message. The frontend can open this URL
 * to send the message via WhatsApp.
 */
export async function generateWhatsAppNotification(
  type: NotificationType,
  booking: BookingData,
  facilityName?: string
): Promise<NotificationResult> {
  if (!booking.guest_phone) {
    return { sent: false, error: 'No phone number provided' }
  }

  const message = getMessageTemplate(type, booking, facilityName)
  const whatsappUrl = getWhatsAppLink(booking.guest_phone, message)

  return {
    sent: true,
    whatsappUrl,
    message
  }
}

/**
 * Auto-send a WhatsApp notification by opening the URL.
 * This is called from server actions and returns the URL
 * so the client can open it in a new tab.
 */
export async function getNotificationForBooking(
  bookingId: string,
  type: NotificationType,
  facilityName?: string
): Promise<NotificationResult> {
  const { supabase } = await import('@/lib/supabase')
  
  const { data: booking } = await supabase
    .from('bookings')
    .select(`
      *,
      resource:resource_units(name, unit_type, base_price)
    `)
    .eq('id', bookingId)
    .single()

  if (!booking) return { sent: false, error: 'Booking not found' }
  
  return generateWhatsAppNotification(type, booking, facilityName)
}

import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { generateWhatsAppNotification } from "@/lib/notifications"

// GET /api/reminders
//
// Cron-ready endpoint that finds bookings starting within the next hour
// and returns WhatsApp reminder URLs for each.
//
// Deploy with Vercel Cron or call every 15 minutes.
// In production, use with WhatsApp Business API to auto-send.
// For now, it returns the URLs so facility staff can send with one click.
export async function GET(request: Request) {
  // Verify cron secret (add CRON_SECRET to .env)
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000)
  const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000) // Don't re-remind if already within 30 min

  // Find bookings starting within the next 45-75 minutes
  // This window accounts for the cron running every 15 min
  const windowStart = new Date(now.getTime() + 45 * 60 * 1000)
  const windowEnd = new Date(now.getTime() + 75 * 60 * 1000)

  const { data: upcomingBookings, error } = await supabase
    .from('bookings')
    .select(`
      *,
      resource:resource_units(name, unit_type, base_price)
    `)
    .gte('start_time', windowStart.toISOString())
    .lte('start_time', windowEnd.toISOString())
    .in('status', ['confirmed', 'pending'])
    .not('guest_phone', 'is', null)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!upcomingBookings || upcomingBookings.length === 0) {
    return NextResponse.json({ message: 'No upcoming bookings to remind', count: 0 })
  }

  // Generate WhatsApp reminder URLs for each booking
  const reminders = await Promise.all(
    upcomingBookings.map(async (booking) => {
      const result = await generateWhatsAppNotification('reminder_1hr', booking)
      return {
        bookingId: booking.id,
        guestName: booking.guest_name,
        guestPhone: booking.guest_phone,
        startTime: booking.start_time,
        resource: booking.resource?.name,
        whatsappUrl: result.whatsappUrl,
        message: result.message,
      }
    })
  )

  return NextResponse.json({
    message: `Found ${reminders.length} booking(s) to remind`,
    count: reminders.length,
    reminders,
  })
}

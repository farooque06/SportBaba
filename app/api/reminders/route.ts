import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { generateWhatsAppNotification } from "@/lib/notifications"
import { auth } from "@/auth"
import { cookies } from "next/headers"

// GET /api/reminders
export async function GET(request: Request) {
  const session = await auth()
  
  // If not authenticated via session, check for cron secret
  if (!session?.user) {
    const authHeader = request.headers.get('authorization')
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const cookieStore = await cookies()
  const facilityId = cookieStore.get("active_facility_id")?.value

  const now = new Date()
  const windowStart = new Date(now.getTime() + 45 * 60 * 1000)
  const windowEnd = new Date(now.getTime() + 75 * 60 * 1000)

  let query = supabase
    .from('bookings')
    .select(`
      *,
      resource:resource_units(name, unit_type, base_price)
    `)
    .gte('start_time', windowStart.toISOString())
    .lte('start_time', windowEnd.toISOString())
    .in('status', ['confirmed', 'pending'])
    .not('guest_phone', 'is', null)

  // Filter by facility if user is logged in
  if (facilityId) {
    query = query.eq('facility_id', facilityId)
  }

  const { data: upcomingBookings, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!upcomingBookings || upcomingBookings.length === 0) {
    return NextResponse.json({ message: 'No upcoming bookings to remind', count: 0, reminders: [] })
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

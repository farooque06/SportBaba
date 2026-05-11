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
  let facilityId = cookieStore.get("active_facility_id")?.value

  // If no cookie, try to resolve facilityId from the user's membership
  if (!facilityId && session?.user?.id) {
    const { data: membership } = await supabase
      .from('memberships')
      .select('facility_id')
      .eq('profile_id', session.user.id)
      .limit(1)
      .maybeSingle()
    facilityId = membership?.facility_id
  }

  // CRITICAL: Never query without a facility filter — it would leak all clients' data
  if (!facilityId) {
    return NextResponse.json({ count: 0, reminders: [] })
  }

  const now = new Date()
  
  // ─── 1. Fetch Upcoming Matches (Starts in next 3 hours) ───
  const upcomingWindowEnd = new Date(now.getTime() + 3 * 60 * 60 * 1000)
  
  const upcomingQuery = supabase
    .from('bookings')
    .select(`*, resource:resource_units(name, unit_type, base_price)`)
    .eq('facility_id', facilityId)
    .gte('start_time', now.toISOString())
    .lte('start_time', upcomingWindowEnd.toISOString())
    .in('status', ['confirmed', 'pending'])
    .not('guest_phone', 'is', null)

  // ─── 2. Fetch Past Due Matches (Ended in last 24h, not paid) ───
  const pastWindowStart = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  
  const pastDueQuery = supabase
    .from('bookings')
    .select(`*, resource:resource_units(name, unit_type, base_price)`)
    .eq('facility_id', facilityId)
    .gte('end_time', pastWindowStart.toISOString())
    .lt('end_time', now.toISOString())
    .eq('payment_status', 'unpaid')
    .in('status', ['confirmed', 'completed'])
    .not('guest_phone', 'is', null)

  const [upcomingResult, pastDueResult] = await Promise.all([
    upcomingQuery,
    pastDueQuery
  ])

  if (upcomingResult.error || pastDueResult.error) {
    return NextResponse.json({ error: upcomingResult.error?.message || pastDueResult.error?.message }, { status: 500 })
  }

  // ─── Process Reminders ───
  const reminders: any[] = []

  // Process Upcoming
  if (upcomingResult.data) {
    for (const b of upcomingResult.data) {
      const result = await generateWhatsAppNotification('reminder_1hr', b)
      reminders.push({
        type: 'upcoming',
        bookingId: b.id,
        guestName: b.guest_name,
        startTime: b.start_time,
        resource: b.resource?.name,
        whatsappUrl: result.whatsappUrl,
        message: result.message,
        paymentStatus: b.payment_status,
        dueAmount: (Number(b.total_price) || 0) - (Number(b.paid_amount) || 0)
      })
    }
  }

  // Process Past Due
  if (pastDueResult.data) {
    for (const b of pastDueResult.data) {
      const result = await generateWhatsAppNotification('payment_request', b)
      reminders.push({
        type: 'past_due',
        bookingId: b.id,
        guestName: b.guest_name,
        startTime: b.start_time,
        resource: b.resource?.name,
        whatsappUrl: result.whatsappUrl,
        message: result.message,
        dueAmount: (Number(b.total_price) || 0) - (Number(b.paid_amount) || 0)
      })
    }
  }

  return NextResponse.json({
    count: reminders.length,
    reminders: reminders.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
  })
}

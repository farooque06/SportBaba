import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createNotification } from '@/lib/actions/notifications'

export async function POST(request: NextRequest) {
  // Verify cron secret
  if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Find bookings starting in approximately 15 minutes (within 10-20 minute window)
    const fifteenMinutesFromNow = new Date(Date.now() + 15 * 60 * 1000)
    const fiveMinutesBefore = new Date(Date.now() + 10 * 60 * 1000)

    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        id,
        user_id,
        facility_id,
        start_time,
        resource_id,
        resource_units(name)
      `)
      .gte('start_time', fiveMinutesBefore.toISOString())
      .lte('start_time', fifteenMinutesFromNow.toISOString())
      .eq('status', 'confirmed')

    if (bookingsError) throw bookingsError

    if (!bookings || bookings.length === 0) {
      return NextResponse.json({ success: true, sent: 0, message: 'No bookings to remind' })
    }

    let remindersCount = 0
    const errors = []

    // Send reminders for each booking
    for (const booking of bookings) {
      try {
        // Check if reminder already sent in last 30 minutes
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)
        const { data: existing } = await supabase
          .from('notification_queue')
          .select('id')
          .eq('booking_id', booking.id)
          .eq('notification_type', 'booking_reminder')
          .gte('sent_at', thirtyMinutesAgo.toISOString())
          .maybeSingle()

        if (existing) {
          console.log(`Reminder already sent for booking ${booking.id}`)
          continue
        }

        // Get user details for email
        const { data: user } = await supabase
          .from('profiles')
          .select('email, full_name')
          .eq('id', booking.user_id)
          .single()

        // Get facility name
        const { data: facility } = await supabase
          .from('facilities')
          .select('name')
          .eq('id', booking.facility_id)
          .single()

        const resourceName = (booking.resource_units as any)?.name || 'Your Reserved Spot'
        const startTime = new Date(booking.start_time).toLocaleString()

        // Create notification (this will also send email if user has it enabled)
        await createNotification({
          facilityId: booking.facility_id,
          recipientId: booking.user_id,
          type: 'booking_reminder',
          title: '⏰ Your Booking Starts Soon!',
          message: `Your booking for ${resourceName} at ${facility?.name} starts in 15 minutes at ${startTime}`,
          relatedBookingId: booking.id,
          data: {
            bookingId: booking.id,
            resourceName,
            facilityName: facility?.name,
            startTime
          }
        })

        // Record in notification queue
        await supabase
          .from('notification_queue')
          .insert({
            booking_id: booking.id,
            recipient_id: booking.user_id,
            notification_type: 'booking_reminder',
            scheduled_for: booking.start_time,
            sent_at: new Date().toISOString()
          })

        remindersCount++
        console.log(`Reminder sent for booking ${booking.id}`)
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        console.error(`Failed to send reminder for booking ${booking.id}:`, errorMsg)
        errors.push({ bookingId: booking.id, error: errorMsg })
      }
    }

    return NextResponse.json({
      success: true,
      sent: remindersCount,
      total: bookings.length,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error in booking reminders cron:', errorMsg)
    return NextResponse.json(
      { error: 'Failed to send reminders', details: errorMsg },
      { status: 500 }
    )
  }
}

// Handle GET for testing
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Booking reminders endpoint',
    method: 'Use POST with CRON_SECRET header'
  })
}

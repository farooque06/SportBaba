import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createNotification, notifyFacilityMembers } from '@/lib/actions/notifications'

// Reminder definitions: type key, config key, time calc
const REMINDER_TYPES = [
  {
    type: 'reminder_30m',
    configKey: 'before_30m',
    label: '30 minutes',
    emoji: '🔔',
    // Bookings starting between 25-35 min from now
    getWindow: () => ({
      from: new Date(Date.now() + 25 * 60 * 1000),
      to: new Date(Date.now() + 35 * 60 * 1000),
    }),
    field: 'start_time' as const,
  },
  {
    type: 'reminder_15m',
    configKey: 'before_15m',
    label: '15 minutes',
    emoji: '⏰',
    // Bookings starting between 10-20 min from now
    getWindow: () => ({
      from: new Date(Date.now() + 10 * 60 * 1000),
      to: new Date(Date.now() + 20 * 60 * 1000),
    }),
    field: 'start_time' as const,
  },
  {
    type: 'reminder_end_5m',
    configKey: 'before_end_5m',
    label: '5 minutes',
    emoji: '🏁',
    // Bookings ending between 2-8 min from now
    getWindow: () => ({
      from: new Date(Date.now() + 2 * 60 * 1000),
      to: new Date(Date.now() + 8 * 60 * 1000),
    }),
    field: 'end_time' as const,
  },
]

export async function POST(request: NextRequest) {
  // Verify cron secret
  if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    let totalSent = 0
    let totalChecked = 0
    const allErrors: { type: string; bookingId: string; error: string }[] = []

    for (const reminder of REMINDER_TYPES) {
      const window = reminder.getWindow()

      // Query bookings that fall into this reminder window
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          user_id,
          facility_id,
          start_time,
          end_time,
          resource_id,
          resource_units(name)
        `)
        .gte(reminder.field, window.from.toISOString())
        .lte(reminder.field, window.to.toISOString())
        .in('status', ['confirmed', 'pending'])

      if (bookingsError) {
        console.error(`Error querying bookings for ${reminder.type}:`, bookingsError)
        continue
      }

      if (!bookings || bookings.length === 0) continue

      // Group bookings by facility_id to batch-fetch configs
      const facilityIds = [...new Set(bookings.map(b => b.facility_id))]
      const { data: facilities } = await supabase
        .from('facilities')
        .select('id, name, config')
        .in('id', facilityIds)

      const facilityMap = new Map<string, any>()
      facilities?.forEach(f => facilityMap.set(f.id, f))

      for (const booking of bookings) {
        totalChecked++
        try {
          // Check facility config to see if this reminder type is enabled
          const facility = facilityMap.get(booking.facility_id)
          const reminders = facility?.config?.reminders
          // Default to enabled if no config set
          if (reminders && reminders[reminder.configKey] === false) {
            continue // Facility has explicitly disabled this reminder
          }

          // Check if this exact reminder was already sent (prevent duplicates)
          const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)
          const { data: existing } = await supabase
            .from('notification_queue')
            .select('id')
            .eq('booking_id', booking.id)
            .eq('notification_type', reminder.type)
            .gte('sent_at', thirtyMinutesAgo.toISOString())
            .maybeSingle()

          if (existing) continue

          // Get facility name (from map)
          const facilityName = facility?.name || 'your facility'
          const resourceName = (booking.resource_units as any)?.name || 'Your Reserved Spot'

          // Build message based on type
          let title: string
          let message: string

          if (reminder.type === 'reminder_end_5m') {
            const endTime = new Date(booking.end_time).toLocaleString('en-US', {
              hour: 'numeric', minute: '2-digit', hour12: true
            })
            title = `${reminder.emoji} Your Game Ends Soon!`
            message = `Your booking for ${resourceName} at ${facilityName} ends in ~5 minutes (${endTime}). Time to wrap up! 🎉`
          } else {
            const startTime = new Date(booking.start_time).toLocaleString('en-US', {
              hour: 'numeric', minute: '2-digit', hour12: true
            })
            title = `${reminder.emoji} Your Booking Starts in ${reminder.label}!`
            message = `Your booking for ${resourceName} at ${facilityName} starts at ${startTime}. Get ready! 💪`
          }

          // Create the in-app notification for the player if user_id is set (+ email if user enabled it)
          if (booking.user_id) {
            await createNotification({
              facilityId: booking.facility_id,
              recipientId: booking.user_id,
              type: reminder.type,
              title,
              message,
              relatedBookingId: booking.id,
              data: {
                bookingId: booking.id,
                resourceName,
                facilityName,
                reminderType: reminder.type,
              }
            })
          }

          // Always notify the facility owners/managers/staff as well so they get a dashboard alert
          await notifyFacilityMembers(
            booking.facility_id,
            reminder.type,
            title,
            message,
            booking.id,
            {
              bookingId: booking.id,
              resourceName,
              facilityName,
              reminderType: reminder.type,
            }
          )

          // Record in notification_queue to prevent duplicates
          await supabase
            .from('notification_queue')
            .insert({
              booking_id: booking.id,
              recipient_id: booking.user_id || null,
              notification_type: reminder.type,
              scheduled_for: reminder.field === 'start_time' ? booking.start_time : booking.end_time,
              sent_at: new Date().toISOString()
            })

          totalSent++
          console.log(`[${reminder.type}] Sent for booking ${booking.id}`)
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error'
          console.error(`[${reminder.type}] Failed for booking ${booking.id}:`, errorMsg)
          allErrors.push({ type: reminder.type, bookingId: booking.id, error: errorMsg })
        }
      }
    }

    return NextResponse.json({
      success: true,
      sent: totalSent,
      checked: totalChecked,
      errors: allErrors.length > 0 ? allErrors : undefined
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

// Handle GET for testing / health check
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Booking reminders endpoint',
    method: 'Use POST with CRON_SECRET header',
    reminderTypes: REMINDER_TYPES.map(r => ({
      type: r.type,
      label: r.label,
      configKey: r.configKey,
      field: r.field,
    }))
  })
}

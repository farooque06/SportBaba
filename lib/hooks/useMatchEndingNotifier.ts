"use client"

import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

export function useMatchEndingNotifier(facilityId?: string) {
  /*
  const notifiedBookings = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!facilityId) return

    const checkMatches = async () => {
      // Only check if we have permission
      if (Notification.permission !== 'granted') return

      const now = new Date()
      // Check bookings ending between 2 to 10 minutes from now
      const windowStart = new Date(now.getTime() + 2 * 60 * 1000).toISOString()
      const windowEnd = new Date(now.getTime() + 10 * 60 * 1000).toISOString()

      const { data: bookings } = await supabase
        .from('bookings')
        .select(`id, end_time, guest_name, resource:resource_units(name)`)
        .eq('facility_id', facilityId)
        .in('status', ['confirmed', 'pending'])
        .gte('end_time', windowStart)
        .lte('end_time', windowEnd)

      if (bookings) {
        bookings.forEach(booking => {
          if (!notifiedBookings.current.has(booking.id)) {
            const endTime = new Date(booking.end_time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
            const resourceName = (booking.resource as any)?.name || 'Resource'
            
            // Create native browser notification
            const notification = new Notification('Match Ending Soon! 🏁', {
              body: `${booking.guest_name}'s match on ${resourceName} ends at ${endTime}.`,
              icon: '/icons/icon.png',
              tag: `match-ending-${booking.id}`
            })

            notifiedBookings.current.add(booking.id)
          }
        })
      }
    }

    // Check immediately and then every minute
    checkMatches()
    const interval = setInterval(checkMatches, 60000)

    return () => clearInterval(interval)
  }, [facilityId])
  */
}

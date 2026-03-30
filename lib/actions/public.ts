"use server"

import { supabase } from "@/lib/supabase"

// Fetch facility info securely without auth
export async function getPublicFacility(slug: string) {
  const { data: facility, error } = await supabase
    .from('facilities')
    .select(`
      id,
      name,
      slug,
      logo_url,
      sport_type,
      config
    `)
    .eq('slug', slug)
    .single()

  if (error || !facility) return null

  // Fetch active resources for this facility
  const { data: resources } = await supabase
    .from('resource_units')
    .select('id, name, unit_type, base_price')
    .eq('facility_id', facility.id)
    .eq('is_active', true)
    .order('name')

  return {
    ...facility,
    resources: resources || []
  }
}

export async function getPublicAvailability(facilityId: string, date: string) {
  // We only fetch start/end times. NO personal data (names/phones) is exposed publicly!
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  const { data: bookings } = await supabase
    .from('bookings')
    .select('resource_id, start_time, end_time')
    .eq('facility_id', facilityId)
    .gte('start_time', startOfDay.toISOString())
    .lte('start_time', endOfDay.toISOString())
    .neq('status', 'cancelled')

  return bookings || []
}

// Sanitize user input to prevent XSS/injection
function sanitize(str: string, maxLength: number = 100): string {
  return str
    .replace(/<[^>]*>/g, '')       // Strip HTML tags
    .replace(/[<>"'`;]/g, '')      // Remove dangerous chars
    .trim()
    .slice(0, maxLength)
}

export async function submitPublicBooking(data: {
  facility_id: string;
  resource_id: string;
  guest_name: string;
  guest_phone: string;
  start_time: string;
  end_time: string;
  total_price: number;
}) {
  // ─── Input Validation ───
  if (!data.guest_name || data.guest_name.trim().length < 2) {
    return { error: "Name must be at least 2 characters." }
  }
  if (!data.guest_phone || !/^[\d+\-\s()]{7,20}$/.test(data.guest_phone)) {
    return { error: "Please provide a valid phone number." }
  }
  if (!data.facility_id || !data.resource_id) {
    return { error: "Missing facility or resource information." }
  }

  const startTime = new Date(data.start_time)
  const endTime = new Date(data.end_time)
  if (isNaN(startTime.getTime()) || isNaN(endTime.getTime()) || endTime <= startTime) {
    return { error: "Invalid booking time range." }
  }

  // ─── Sanitize strings ───
  const cleanData = {
    ...data,
    guest_name: sanitize(data.guest_name, 80),
    guest_phone: sanitize(data.guest_phone, 20),
    payment_status: 'unpaid' as const,
    status: 'pending' as const,
  }

  const { data: booking, error } = await supabase
    .from('bookings')
    .insert(cleanData)
    .select()
    .single()

  if (error) return { error: error.message }
  return { success: true, booking }
}

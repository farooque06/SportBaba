"use server"

import { supabase } from "@/lib/supabase"
import { auth } from "@/auth"

export async function fetchAnalyticsData(facilityId: string) {
  const session = await auth()
  if (!session?.user || !facilityId) throw new Error("Unauthorized")

  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - 7)
  
  const todayStart = new Date(now)
  todayStart.setHours(0,0,0,0)

  // 1. Fetch Bookings for stats
  const { data: weeklyBookings } = await supabase
    .from('bookings')
    .select('*, resource:resource_units(unit_type)')
    .eq('facility_id', facilityId)
    .gte('start_time', startOfWeek.toISOString())

  const { data: cancelledBookings } = await supabase
    .from('bookings')
    .select('id')
    .eq('facility_id', facilityId)
    .eq('status', 'cancelled')
    .gte('start_time', startOfWeek.toISOString())

  const bookings = weeklyBookings || []
  const activeBookings = bookings.filter(b => b.status !== 'cancelled')

  // 2. Weekly Breakdown
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const weeklyBreakdown = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const dateStr = d.toISOString().split('T')[0]
    const dayName = days[d.getDay()]
    
    const count = activeBookings.filter(b => {
      const bDate = new Date(b.start_time).toISOString().split('T')[0]
      return bDate === dateStr
    }).length
    
    return { day: dayName, bookings: count }
  })

  // 3. Peak Hours Heatmap
  const hourCounts = Array.from({ length: 24 }, () => 0)
  activeBookings.forEach(b => {
    const hour = new Date(b.start_time).getHours()
    hourCounts[hour]++
  })
  const maxHourCount = Math.max(...hourCounts, 1)
  const peakHours = hourCounts
    .map((count, hour) => ({ 
      time: `${hour % 12 || 12}${hour >= 12 ? 'PM' : 'AM'}`, 
      pct: Math.round((count / maxHourCount) * 100) 
    }))
    .filter(h => h.pct > 0)
    .slice(0, 6)
    .sort((a, b) => b.pct - a.pct)

  // 4. Today Revenue
  const todayRevenue = activeBookings
    .filter(b => new Date(b.start_time) >= todayStart)
    .reduce((sum, b) => sum + (Number(b.paid_amount) || 0), 0)

  return {
    totalBookings: activeBookings.length,
    totalRevenue: activeBookings.reduce((sum, b) => sum + (Number(b.total_price) || 0), 0),
    totalCanceled: cancelledBookings?.length || 0,
    todayRevenue,
    revenueTarget: 50000, // Hardcoded for demo
    weeklyBreakdown,
    sportsBreakdown: [
      { sport: 'Football', amount: 'Rs. 42k', pct: 65 },
      { sport: 'Cricket', amount: 'Rs. 22k', pct: 35 }
    ],
    peakHours,
    hourlyTrends: hourCounts,
    loyalty: { bronze: 45, silver: 30, gold: 25 }
  }
}

export async function getDeepAnalytics(facilityId: string) {
  const session = await auth()
  if (!session?.user || !facilityId) throw new Error("Unauthorized")

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('facility_id', facilityId)
    .neq('status', 'cancelled')
    .gte('start_time', thirtyDaysAgo.toISOString())

  if (error) throw error

  const hourlyStats = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0, revenue: 0 }))
  const customerSpend: Record<string, { name: string, total: number, visits: number, phone: string }> = {}
  let pitchRevenue = 0
  let addonRevenue = 0

  bookings.forEach(b => {
    const start = new Date(b.start_time)
    const hour = start.getHours()
    hourlyStats[hour].count++
    hourlyStats[hour].revenue += Number(b.total_price)

    const key = b.guest_phone || b.guest_name
    if (!customerSpend[key]) {
      customerSpend[key] = { name: b.guest_name, total: 0, visits: 0, phone: b.guest_phone || '' }
    }
    customerSpend[key].total += Number(b.total_price)
    customerSpend[key].visits++

    const billItems = Array.isArray(b.bill_items) ? b.bill_items : []
    const itemsTotal = billItems.reduce((s: number, item: any) => s + (Number(item.price) || 0), 0)
    addonRevenue += itemsTotal
    pitchRevenue += (Number(b.total_price) - itemsTotal)
  })

  const topSpenders = Object.values(customerSpend)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)

  return {
    peakHours: hourlyStats,
    topSpenders,
    revenueMix: {
      pitch: pitchRevenue,
      addons: addonRevenue,
      total: pitchRevenue + addonRevenue
    }
  }
}

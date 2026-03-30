"use server"

import { supabase } from "@/lib/supabase";

/**
 * fetchAnalyticsData
 * Centralized analytics engine for both the Dashboard Overview and Detailed Analytics.
 */
export async function fetchAnalyticsData(facilityId: string) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - 7);
  startOfWeek.setHours(0, 0, 0, 0);

  const [bookings, customerLoyalty] = await Promise.all([
    supabase
      .from('bookings')
      .select('*, resource:resource_units(unit_type)')
      .eq('facility_id', facilityId)
      .gte('start_time', startOfWeek.toISOString()),
    supabase
      .from('customers')
      .select('total_visits')
      .eq('facility_id', facilityId)
  ]);

  if (!bookings.data) return null;

  // 1. Process Weekly Breakdown
  const daysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayName = daysShort[d.getDay()];
    const dateKey = d.toDateString();
    
    // Calculate count for this specific day
    const count = bookings.data.filter(b => new Date(b.start_time).toDateString() === dateKey).length;
    last7Days.push({ day: dayName, bookings: count });
  }

  // 2. Revenue & Cancellations
  const confirmedBookings = bookings.data.filter(b => b.status === 'confirmed');
  const canceledBookings = bookings.data.filter(b => b.status === 'cancelled');
  
  const totalRevenue = confirmedBookings.reduce((acc, b) => acc + (Number(b.paid_amount) || 0), 0);
  const todayRevenue = confirmedBookings
    .filter(b => {
      const d = new Date(b.start_time);
      return d >= startOfToday && d <= endOfToday;
    })
    .reduce((acc, b) => acc + (Number(b.paid_amount) || 0), 0);

  // 3. Sports Breakdown
  const sportsMap: Record<string, number> = {};
  confirmedBookings.forEach(b => {
    const sport = (b.resource as any)?.unit_type || 'Football';
    sportsMap[sport] = (sportsMap[sport] || 0) + (Number(b.paid_amount) || 0);
  });

  const sportsBreakdown = Object.entries(sportsMap).map(([sport, amount]) => ({
    sport: sport.charAt(0).toUpperCase() + sport.slice(1),
    amount: `NRS ${amount.toLocaleString()}`,
    pct: Math.round((amount / (totalRevenue || 1)) * 100)
  }));

  // 4. Peak Hours & Hourly Distribution
  const hourlyTrends = Array(24).fill(0);
  const hourMap: Record<number, number> = {};
  confirmedBookings.forEach(b => {
    const hour = new Date(b.start_time).getHours();
    hourlyTrends[hour]++;
    hourMap[hour] = (hourMap[hour] || 0) + 1;
  });

  const maxHourCount = Math.max(...Object.values(hourMap), 1);
  const peakHours = Object.entries(hourMap)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([hour, count]) => ({
      time: `${hour}:00`,
      pct: Math.round((count / maxHourCount) * 100)
    }));

  // 5. Loyalty Segments
  const loyaltyCounts = { bronze: 0, silver: 0, gold: 0 };
  customerLoyalty.data?.forEach(c => {
    if (c.total_visits >= 16) loyaltyCounts.gold++;
    else if (c.total_visits >= 6) loyaltyCounts.silver++;
    else if (c.total_visits >= 1) loyaltyCounts.bronze++;
  });

  return {
    totalBookings: confirmedBookings.length,
    totalCanceled: canceledBookings.length,
    totalRevenue,
    todayRevenue,
    revenueTarget: 25000,
    weeklyBreakdown: last7Days,
    sportsBreakdown,
    peakHours,
    hourlyTrends,
    loyalty: loyaltyCounts
  };
}

// Keep the old name as an alias if needed by any other file, 
// but pointing to the same core logic.
export async function fetchDashboardAnalytics(facilityId: string) {
  const data = await fetchAnalyticsData(facilityId);
  if (!data) return { revenue: { today:0, allTime:0, target:25000 }, trends: { hourly: Array(24).fill(0) }, loyalty: { bronze:0, silver:0, gold:0 } };

  return {
    revenue: {
      today: data.todayRevenue,
      allTime: data.totalRevenue,
      target: data.revenueTarget,
    },
    trends: {
      hourly: data.hourlyTrends,
    },
    loyalty: data.loyalty
  };
}

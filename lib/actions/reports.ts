"use server"

import { supabase } from "@/lib/supabase";
import { auth } from "@/auth";

export async function fetchDailyReport(date: string, facilityId: string) {
  const session = await auth();
  if (!session?.user || !facilityId) throw new Error("Unauthorized");

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      *,
      resource:resource_units(name, unit_type, base_price)
    `)
    .eq('facility_id', facilityId)
    .gte('start_time', startOfDay.toISOString())
    .lte('start_time', endOfDay.toISOString());

  if (error) throw error;

  // Aggregations
  let totalRevenue = 0;
  let lostRevenue = 0;
  let canceledCount = 0;
  const venueMap: Record<string, number> = {};
  const paymentMap: Record<string, number> = {
    cash: 0,
    card: 0,
    digital: 0,
    unpaid: 0
  };

  bookings?.forEach(b => {
    const isCanceled = b.status === 'cancelled';
    const amount = Number(b.paid_amount) || 0;
    const price = Number(b.total_price) || 0;

    if (isCanceled) {
      canceledCount++;
      lostRevenue += price;
    } else {
      totalRevenue += amount;

      // By Venue
      const venueName = b.resource?.name || 'Unknown';
      venueMap[venueName] = (venueMap[venueName] || 0) + amount;

      // By Payment Method
      const method = (b.payment_method || 'cash').toLowerCase();
      if (b.payment_status === 'unpaid') {
        paymentMap.unpaid += price;
      } else if (method.includes('khalti') || method.includes('esewa') || method === 'digital') {
        paymentMap.digital += amount;
      } else if (method === 'card' || method.includes('pos')) {
        paymentMap.card += amount;
      } else {
        paymentMap.cash += amount;
      }
    }
  });

  return {
    date,
    totalRevenue,
    lostRevenue,
    canceledCount,
    bookingCount: (bookings?.length || 0) - canceledCount,
    venues: Object.entries(venueMap).map(([name, value]) => ({ name, value })),
    payments: Object.entries(paymentMap).map(([name, value]) => ({ name, value })),
    bookings: bookings || []
  };
}

export async function generateCSVReport(date: string, facilityId: string) {
  const report = await fetchDailyReport(date, facilityId);
  
  const headers = ["ID", "Resource", "Guest", "Phone", "Start Time", "End Time", "Status", "Payment Status", "Payment Method", "Total Price", "Paid Amount"];
  const rows = report.bookings.map(b => [
    b.id.slice(0, 8),
    b.resource?.name || 'N/A',
    b.guest_name,
    b.guest_phone || 'N/A',
    new Date(b.start_time).toLocaleString(),
    new Date(b.end_time).toLocaleString(),
    b.status,
    b.payment_status,
    b.payment_method || 'CASH',
    b.total_price,
    b.paid_amount
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
  ].join("\n");

  return csvContent;
}

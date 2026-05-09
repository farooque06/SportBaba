"use server"

import { supabase } from "@/lib/supabase";
import { auth } from "@/auth";

export async function fetchDailyReport(date: string, facilityId: string) {
  const session = await auth();
  if (!session?.user || !facilityId) throw new Error("Unauthorized");

  // Explicitly set start and end of day in the date's timezone
  const startOfDay = `${date}T00:00:00.000Z`;
  const endOfDay = `${date}T23:59:59.999Z`;

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      *,
      resource:resource_units(name, unit_type, base_price)
    `)
    .eq('facility_id', facilityId)
    .gte('start_time', startOfDay)
    .lte('start_time', endOfDay);

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
  
  const headers = [
    "Booking ID", 
    "Pitch/Resource", 
    "Resource Type",
    "Customer Name", 
    "Phone Number", 
    "Date",
    "Start Time", 
    "End Time", 
    "Duration (Min)",
    "Booking Status", 
    "Payment Status", 
    "Payment Method", 
    "Total Price (NRS)", 
    "Paid Amount (NRS)",
    "Due Amount (NRS)"
  ];

  const rows = report.bookings.map(b => {
    const start = new Date(b.start_time);
    const end = new Date(b.end_time);
    const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
    
    return [
      b.id.slice(0, 8).toUpperCase(),
      b.resource?.name || 'N/A',
      b.resource?.unit_type || 'N/A',
      b.guest_name,
      b.guest_phone || 'N/A',
      new Date(b.start_time).toLocaleDateString(),
      start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      duration,
      b.status.toUpperCase(),
      b.payment_status.toUpperCase(),
      (b.payment_method || 'CASH').toUpperCase(),
      b.total_price,
      b.paid_amount,
      (Number(b.total_price) || 0) - (Number(b.paid_amount) || 0)
    ];
  });

  const csvContent = [
    `# SPORTBABA FINANCIAL REPORT - ${date}`,
    `# Facility ID: ${facilityId}`,
    "",
    headers.join(","),
    ...rows.map(row => row.map(cell => {
      // Escape commas in cells
      const stringCell = String(cell);
      return stringCell.includes(',') ? `"${stringCell}"` : stringCell;
    }).join(","))
  ].join("\n");

  return csvContent;
}

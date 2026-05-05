"use server"

import { supabase } from "@/lib/supabase";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { linkBookingToCustomer } from "./customers";
import { generateWhatsAppNotification } from "@/lib/notifications";

export async function createBooking(data: {
  resource_id: string;
  guest_name: string;
  guest_phone?: string;
  start_time: string;
  end_time: string;
  notes?: string;
  payment_status?: 'paid' | 'unpaid';
  payment_method?: string;
}, facilityId: string) {
  const session = await auth();
  if (!session?.user || !facilityId) throw new Error("Unauthorized");

  // Calculate price based on duration
  const start = new Date(data.start_time);
  const end = new Date(data.end_time);
  
  // Fetch resource price
  const { data: resource } = await supabase
    .from('resource_units')
    .select('base_price')
    .eq('id', data.resource_id)
    .single();

  const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  const total_price = (Number(resource?.base_price) || 0) * durationHours;

  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      ...data,
      facility_id: facilityId,
      total_price,
      paid_amount: data.payment_status === 'paid' ? total_price : 0,
      payment_status: data.payment_status || 'unpaid',
      status: 'confirmed'
    })
    .select()
    .single();

  if (error) return { error: error.message };
  
  // Auto-link to customer profile
  await linkBookingToCustomer(facilityId, booking.id, data.guest_name, data.guest_phone, total_price);

  // Generate WhatsApp notification
  let whatsappUrl: string | undefined;
  if (data.guest_phone) {
    const fullBooking = { ...booking, resource: { name: '', base_price: Number(resource?.base_price) || 0 } };
    // Fetch resource name for the notification
    const { data: resData } = await supabase.from('resource_units').select('name').eq('id', data.resource_id).single();
    if (resData) fullBooking.resource.name = resData.name;
    
    const notification = await generateWhatsAppNotification('booking_confirmed', fullBooking);
    whatsappUrl = notification.whatsappUrl;
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard/customers");
  return { success: true, data: booking, whatsappUrl };
}
export async function fetchBookings(facilityId: string) {
  const session = await auth();
  if (!session?.user || !facilityId) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      resource:resource_units(name, unit_type, base_price),
      customer:customers(id, name, phone, total_visits)
    `)
    .eq('facility_id', facilityId)
    .order('start_time', { ascending: false })
    .limit(50);

  if (error) return [];
  return data;
}

export async function updatePaymentStatus(bookingId: string, status: string, method?: string, amount?: number, facilityId?: string) {
  const session = await auth();
  if (!session?.user || !facilityId) throw new Error("Unauthorized");

  // Fetch current booking data
  const { data: booking } = await supabase
    .from('bookings')
    .select('total_price, paid_amount')
    .eq('id', bookingId)
    .single();

  if (!booking) return { error: "Booking not found" };

  let newPaidAmount = Number(booking.paid_amount) || 0;
  if (amount !== undefined) {
    newPaidAmount += Number(amount);
  } else if (status === 'paid') {
    newPaidAmount = Number(booking.total_price);
  } else if (status === 'unpaid') {
    newPaidAmount = 0;
  }

  // Determine final status based on amount vs total
  let finalStatus = status;
  const totalPrice = Number(booking.total_price);
  
  if (newPaidAmount >= totalPrice) {
    finalStatus = 'paid';
  } else if (newPaidAmount > 0) {
    finalStatus = 'partial';
  } else {
    finalStatus = 'unpaid';
  }

  const { data, error } = await supabase
    .from('bookings')
    .update({ 
      payment_status: finalStatus,
      payment_method: method || null,
      paid_amount: newPaidAmount
    })
    .eq('id', bookingId)
    .eq('facility_id', facilityId)
    .select(`
      *,
      resource:resource_units(name, unit_type, base_price),
      customer:customers(id, name, phone, total_visits)
    `)
    .single();

  if (error) return { error: error.message };
  
  // Generate WhatsApp notification for payment
  let whatsappUrl: string | undefined;
  if (data?.guest_phone) {
    const notification = await generateWhatsAppNotification('payment_received', data);
    whatsappUrl = notification.whatsappUrl;
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard/analytics");
  return { success: true, data, whatsappUrl };
}

export async function updateBookingStatus(bookingId: string, status: string, facilityId: string) {
  const session = await auth();
  if (!session?.user || !facilityId) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId)
    .eq('facility_id', facilityId)
    .select(`
      *,
      resource:resource_units(name, unit_type, base_price),
      customer:customers(id, name, phone, total_visits)
    `)
    .single();

  if (error) return { error: error.message };
  
  // Generate WhatsApp notification based on status
  let whatsappUrl: string | undefined;
  if (data?.guest_phone) {
    const notifType = status === 'completed' ? 'booking_completed' 
      : status === 'confirmed' ? 'booking_confirmed' 
      : status === 'cancelled' ? 'booking_cancelled' 
      : null;
    if (notifType) {
      const notification = await generateWhatsAppNotification(notifType, data);
      whatsappUrl = notification.whatsappUrl;
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/bookings");
  return { success: true, data, whatsappUrl };
}

export async function addBookingAddon(bookingId: string, item: { id: string, name: string, price: number }, facilityId: string) {
  const session = await auth();
  if (!session?.user || !facilityId) throw new Error("Unauthorized");

  // Fetch current booking
  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('bill_items, total_price, paid_amount')
    .eq('id', bookingId)
    .single();

  if (fetchError) return { error: fetchError.message };

  const currentItems = Array.isArray(booking.bill_items) ? booking.bill_items : [];
  const updatedItems = [...currentItems, { ...item, timestamp: new Date().toISOString() }];
  const updatedTotalPrice = (Number(booking.total_price) || 0) + item.price;
  
  // Logic: If total increased, it's unpaid (or partially paid) until fully settled
  let newStatus = 'unpaid';
  const paid = Number(booking.paid_amount) || 0;
  if (paid >= updatedTotalPrice) {
    newStatus = 'paid';
  } else if (paid > 0) {
    newStatus = 'partial';
  }

  const { data, error } = await supabase
    .from('bookings')
    .update({ 
      bill_items: updatedItems,
      total_price: updatedTotalPrice,
      payment_status: newStatus
    })
    .eq('id', bookingId)
    .eq('facility_id', facilityId)
    .select(`
      *,
      resource:resource_units(name, unit_type, base_price),
      customer:customers(id, name, phone, total_visits)
    `)
    .single();

  if (error) return { error: error.message };
  
  revalidatePath("/dashboard/bookings");
  return { success: true, data };
}

export async function removeBookingAddon(bookingId: string, itemTimestamp: string, facilityId: string) {
  const session = await auth();
  if (!session?.user || !facilityId) throw new Error("Unauthorized");

  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('bill_items, total_price, paid_amount')
    .eq('id', bookingId)
    .single();

  if (fetchError) return { error: fetchError.message };

  const currentItems = Array.isArray(booking.bill_items) ? booking.bill_items : [];
  const itemToRemove = currentItems.find((i: any) => i.timestamp === itemTimestamp);
  if (!itemToRemove) return { error: "Item not found" };

  const updatedItems = currentItems.filter((i: any) => i.timestamp !== itemTimestamp);
  const updatedTotalPrice = (Number(booking.total_price) || 0) - itemToRemove.price;
  
  let newStatus = 'unpaid';
  const paid = Number(booking.paid_amount) || 0;
  if (paid >= updatedTotalPrice) {
    newStatus = 'paid';
  } else if (paid > 0) {
    newStatus = 'partial';
  }

  const { data, error } = await supabase
    .from('bookings')
    .update({ 
      bill_items: updatedItems,
      total_price: updatedTotalPrice,
      payment_status: newStatus
    })
    .eq('id', bookingId)
    .eq('facility_id', facilityId)
    .select(`
      *,
      resource:resource_units(name, unit_type, base_price),
      customer:customers(id, name, phone, total_visits)
    `)
    .single();

  if (error) return { error: error.message };
  
  revalidatePath("/dashboard/bookings");
  return { success: true, data };
}
export async function fetchResourceWithBookings(facilityId: string, startDate: string, endDate: string) {
  const session = await auth();
  if (!session?.user || !facilityId) throw new Error("Unauthorized");

  const { data: resources, error: resError } = await supabase
    .from('resource_units')
    .select('*')
    .eq('facility_id', facilityId)
    .eq('is_active', true);

  if (resError || !resources) return [];

  const { data: bookings, error: bookError } = await supabase
    .from('bookings')
    .select(`
      *,
      player:profiles(full_name)
    `)
    .eq('facility_id', facilityId)
    .gte('start_time', startDate)
    .lte('start_time', endDate)
    .neq('status', 'cancelled');

  return resources.map(resource => ({
    ...resource,
    bookings: bookings?.filter(b => b.resource_id === resource.id) || []
  }));
}

export async function extendBooking(bookingId: string, durationMinutes: number, facilityId: string) {
  const session = await auth();
  if (!session?.user || !facilityId) throw new Error("Unauthorized");

  // Fetch current booking and resource price
  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('*, resource:resource_units(base_price)')
    .eq('id', bookingId)
    .single();

  if (fetchError || !booking) return { error: "Booking not found" };

  const currentEnd = new Date(booking.end_time);
  const newEnd = new Date(currentEnd.getTime() + durationMinutes * 60000);

  // Check for conflicts
  const { data: conflicts } = await supabase
    .from('bookings')
    .select('id')
    .eq('resource_id', booking.resource_id)
    .in('status', ['confirmed', 'pending'])
    .lt('start_time', newEnd.toISOString())
    .gt('end_time', currentEnd.toISOString())
    .neq('id', bookingId);

  if (conflicts && conflicts.length > 0) {
    return { error: "Slot not available for extension" };
  }

  // Calculate extra price
  const basePrice = Number((booking as any).resource?.base_price) || 0;
  const extraHours = durationMinutes / 60;
  const extraPrice = basePrice * extraHours;
  const newTotalPrice = (Number(booking.total_price) || 0) + extraPrice;
  const newPaymentStatus = Number(booking.paid_amount) >= newTotalPrice ? 'paid' : (Number(booking.paid_amount) > 0 ? 'partial' : 'unpaid');

  const { data: updated, error: updateError } = await supabase
    .from('bookings')
    .update({ 
      end_time: newEnd.toISOString(),
      total_price: newTotalPrice,
      payment_status: newPaymentStatus
    })
    .eq('id', bookingId)
    .eq('facility_id', facilityId)
    .select(`
      *,
      resource:resource_units(name, unit_type, base_price),
      customer:customers(id, name, phone, total_visits)
    `)
    .single();

  if (updateError) return { error: updateError.message };

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/bookings");
  return { success: true, data: updated };
}

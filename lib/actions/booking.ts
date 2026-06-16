"use server"

import { supabase } from "@/lib/supabase";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { linkBookingToCustomer } from "./customers";
import { generateWhatsAppNotification } from "@/lib/notifications";
import { notifyFacilityMembers } from "./notifications";

export async function createBooking(data: {
  resource_id: string;
  guest_name: string;
  guest_phone?: string;
  start_time: string;
  end_time: string;
  notes?: string;
  payment_status?: 'paid' | 'unpaid' | 'partial';
  payment_method?: string;
  use_credit?: boolean;
  paid_amount?: number;
  guest_email?: string;
}, facilityId: string) {
  const session = await auth();
  if (!session?.user || !facilityId) throw new Error("Unauthorized");

  // Check for conflicts
  const { data: conflicts } = await supabase
    .from('bookings')
    .select('id')
    .eq('resource_id', data.resource_id)
    .neq('status', 'cancelled')
    .lt('start_time', data.end_time)
    .gt('end_time', data.start_time);

  if (conflicts && conflicts.length > 0) {
    return { error: "This slot is already booked. Please choose another time or pitch." };
  }

  // Calculate price based on duration
  const start = new Date(data.start_time);
  const end = new Date(data.end_time);
  
  // Fetch resource details
  const { data: resource } = await supabase
    .from('resource_units')
    .select('name, base_price, custom_pricing')
    .eq('id', data.resource_id)
    .single();

  const basePrice = Number(resource?.base_price) || 0;
  const customPricing = Array.isArray(resource?.custom_pricing) ? resource.custom_pricing : [];
  let total_price = 0;

  if (customPricing.length > 0) {
    let currentTime = start.getTime();
    const endTimeObj = end.getTime();
    let priceSum = 0;
    
    while (currentTime < endTimeObj) {
      const currentMinDate = new Date(currentTime);
      const hours = currentMinDate.getHours().toString().padStart(2, '0');
      const minutes = currentMinDate.getMinutes().toString().padStart(2, '0');
      const timeStr = `${hours}:${minutes}`;
      
      let applicablePrice = basePrice;
      
      for (const rule of customPricing) {
        // Default to all days if not specified
        const ruleDays = Array.isArray(rule.days) ? rule.days : [0, 1, 2, 3, 4, 5, 6];
        const currentDay = currentMinDate.getDay();
        
        if (!ruleDays.includes(currentDay)) continue;

        let isWithin = false;
        if (rule.startTime <= rule.endTime) {
          isWithin = timeStr >= rule.startTime && timeStr < rule.endTime;
        } else {
          // Crosses midnight
          isWithin = timeStr >= rule.startTime || timeStr < rule.endTime;
        }
        if (isWithin) {
          applicablePrice = Number(rule.price) || basePrice;
          break;
        }
      }
      
      priceSum += applicablePrice / 60; // price per minute
      currentTime += 60000; // advance 1 minute
    }
    total_price = Math.round(priceSum);
  } else {
    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    total_price = Math.round(basePrice * durationHours);
  }

  let paid_amount = data.payment_status === 'paid' ? total_price : (Number(data.paid_amount) || 0);
  let final_payment_status: 'paid' | 'unpaid' | 'partial' = data.payment_status || 'unpaid';

  if (paid_amount >= total_price) {
    final_payment_status = 'paid';
  } else if (paid_amount > 0) {
    final_payment_status = 'partial';
  }

  // ─── Credit Handling ───
  let creditUsed = 0;
  if (data.use_credit && data.guest_phone) {
    const { fetchCustomerCredit, deductCustomerCredit, searchCustomers } = await import("./customers");
    const balance = await fetchCustomerCredit(facilityId, data.guest_phone);
    
    if (balance > 0) {
      creditUsed = Math.min(balance, total_price - paid_amount);
      if (creditUsed > 0) {
        // Find customer ID for deduction
        const customers = await searchCustomers(facilityId, data.guest_phone);
        const customer = customers.find(c => c.phone === data.guest_phone);
        if (customer) {
          await deductCustomerCredit(customer.id, creditUsed);
          paid_amount += creditUsed;
          
          if (paid_amount >= total_price) {
            final_payment_status = 'paid';
          } else if (paid_amount > 0) {
            final_payment_status = 'partial';
          }
        }
      }
    }
  }

  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      resource_id: data.resource_id,
      guest_name: data.guest_name,
      guest_phone: data.guest_phone,
      guest_email: data.guest_email,
      start_time: data.start_time,
      end_time: data.end_time,
      notes: data.notes,
      facility_id: facilityId,
      total_price,
      paid_amount,
      payment_status: final_payment_status,
      payment_method: creditUsed > 0 ? (data.payment_method ? `${data.payment_method} + Credit` : 'Credit') : data.payment_method,
      status: 'confirmed'
    })
    .select()
    .single();

  if (error) return { error: error.message };
  
  // Auto-link to customer profile (already updates stats)
  await linkBookingToCustomer(facilityId, booking.id, data.guest_name, data.guest_phone, total_price, data.guest_email);

  // Send in-app notification to all facility members
  const resourceName = resource?.name || 'Resource';
  /*
  const startTimeStr = new Date(booking.start_time).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true
  });
  const dateStr = new Date(booking.start_time).toLocaleDateString('en-US');
  
  await notifyFacilityMembers(
    facilityId,
    'booking_confirmed',
    'New Booking Created! 📅',
    `New booking for ${resourceName} by ${booking.guest_name} on ${dateStr} at ${startTimeStr}.`,
    booking.id,
    {
      bookingId: booking.id,
      guestName: booking.guest_name,
      resourceName,
      startTime: booking.start_time,
      endTime: booking.end_time
    }
  );
  */

  // Generate WhatsApp notification
  let whatsappUrl: string | undefined;
  /*
  if (data.guest_phone) {
    const fullBooking = { ...booking, resource: { name: resourceName, base_price: Number(resource?.base_price) || 0 } };
    const notification = await generateWhatsAppNotification('booking_confirmed', fullBooking);
    whatsappUrl = notification.whatsappUrl;
  }
  */

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

  // Fetch current booking data — scoped to facility
  const { data: booking } = await supabase
    .from('bookings')
    .select('total_price, paid_amount')
    .eq('id', bookingId)
    .eq('facility_id', facilityId)
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
  let finalStatus: any = status;
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

  const amountPaidNow = amount !== undefined ? Number(amount) : (status === 'paid' ? Number(booking.total_price) - (Number(booking.paid_amount) || 0) : 0);
  const paymentTypeStr = finalStatus === 'paid' ? 'Full Payment' : 'Partial Payment';

  // Send in-app notification to all facility members
  const resourceName = (data?.resource as any)?.name || 'Resource';
  /*
  await notifyFacilityMembers(
    facilityId,
    'booking_updated',
    'Payment Received 💳',
    `${paymentTypeStr} of Rs. ${amountPaidNow} received for ${data.guest_name}'s booking of ${resourceName}. Status: ${finalStatus.toUpperCase()}.`,
    bookingId,
    {
      bookingId,
      guestName: data.guest_name,
      resourceName,
      amount: amountPaidNow,
      status: finalStatus
    }
  );
  */
  
  // Generate WhatsApp notification for payment
  let whatsappUrl: string | undefined;
  /*
  if (data?.guest_phone) {
    const notification = await generateWhatsAppNotification('payment_received', data);
    whatsappUrl = notification.whatsappUrl;
  }
  */

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

  // Send in-app notification to all facility members
  const resourceName = (data?.resource as any)?.name || 'Resource';
  const isCancelled = status === 'cancelled';
  /*
  await notifyFacilityMembers(
    facilityId,
    isCancelled ? 'booking_cancelled' : 'booking_confirmed',
    isCancelled ? 'Booking Cancelled ❌' : 'Booking Confirmed ✅',
    `Booking for ${resourceName} by ${data.guest_name} on ${new Date(data.start_time).toLocaleDateString()} has been ${status}.`,
    bookingId,
    {
      bookingId,
      guestName: data.guest_name,
      resourceName,
      status
    }
  );
  */
  
  // Generate WhatsApp notification based on status
  let whatsappUrl: string | undefined;
  /*
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
  */

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/bookings");
  return { success: true, data, whatsappUrl };
}export async function cancelWithCredit(bookingId: string, facilityId: string) {
  const session = await auth();
  if (!session?.user || !facilityId) throw new Error("Unauthorized");

  // Fetch booking with customer info — scoped to facility
  const { data: booking } = await supabase
    .from('bookings')
    .select('*, customer_id')
    .eq('id', bookingId)
    .eq('facility_id', facilityId)
    .single();

  if (!booking) return { error: "Booking not found" };
  
  const paidAmount = Number(booking.paid_amount) || 0;

  // 1. Update Booking Status
  const { data, error: updateError } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId)
    .select(`
      *,
      resource:resource_units(name)
    `)
    .single();

  if (updateError) return { error: updateError.message };

  // 2. Issue Credit if there was a payment
  if (paidAmount > 0 && booking.customer_id) {
    const { issueCustomerCredit } = await import("./customers");
    await issueCustomerCredit(booking.customer_id, paidAmount);
  }

  // Send in-app notification to all facility members
  const resourceName = (data as any)?.resource?.name || 'Resource';
  /*
  await notifyFacilityMembers(
    facilityId,
    'booking_cancelled',
    'Booking Cancelled (Credit Issued) ❌',
    `Booking for ${data.guest_name} on ${new Date(data.start_time).toLocaleDateString()} was cancelled. Rs. ${paidAmount} credit was issued.`,
    bookingId,
    {
      bookingId,
      guestName: data.guest_name,
      resourceName,
      creditIssued: paidAmount
    }
  );
  */

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard/customers");

  return { success: true, data, creditIssued: paidAmount };
}

export async function addBookingAddon(bookingId: string, item: { id: string, name: string, price: number }, facilityId: string) {
  const session = await auth();
  if (!session?.user || !facilityId) throw new Error("Unauthorized");

  // Fetch current booking — scoped to facility
  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('bill_items, total_price, paid_amount')
    .eq('id', bookingId)
    .eq('facility_id', facilityId)
    .single();

  if (fetchError) return { error: fetchError.message };

  const currentItems = Array.isArray(booking.bill_items) ? booking.bill_items : [];
  const updatedItems = [...currentItems, { ...item, timestamp: new Date().toISOString() }];
  const updatedTotalPrice = (Number(booking.total_price) || 0) + item.price;
  
  // Logic: If total increased, it's unpaid (or partially paid) until fully settled
  let newStatus: 'paid' | 'unpaid' | 'partial' = 'unpaid';
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
    .eq('facility_id', facilityId)
    .single();

  if (fetchError) return { error: fetchError.message };

  const currentItems = Array.isArray(booking.bill_items) ? booking.bill_items : [];
  const itemToRemove = currentItems.find((i: any) => i.timestamp === itemTimestamp);
  if (!itemToRemove) return { error: "Item not found" };

  const updatedItems = currentItems.filter((i: any) => i.timestamp !== itemTimestamp);
  const updatedTotalPrice = (Number(booking.total_price) || 0) - itemToRemove.price;
  
  let newStatus: 'paid' | 'unpaid' | 'partial' = 'unpaid';
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
    .lte('start_time', endDate);

  return resources.map(resource => ({
    ...resource,
    bookings: bookings?.filter(b => b.resource_id === resource.id) || []
  }));
}

export async function extendBooking(bookingId: string, durationMinutes: number, facilityId: string) {
  const session = await auth();
  if (!session?.user || !facilityId) throw new Error("Unauthorized");

  // Fetch current booking and resource price — scoped to facility
  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('*, resource:resource_units(base_price, custom_pricing)')
    .eq('id', bookingId)
    .eq('facility_id', facilityId)
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
  const customPricing = Array.isArray((booking as any).resource?.custom_pricing) ? (booking as any).resource.custom_pricing : [];
  let extraPrice = 0;

  if (customPricing.length > 0) {
    let currentTime = currentEnd.getTime();
    const endTimeObj = newEnd.getTime();
    let priceSum = 0;
    
    while (currentTime < endTimeObj) {
      const currentMinDate = new Date(currentTime);
      const hours = currentMinDate.getHours().toString().padStart(2, '0');
      const minutes = currentMinDate.getMinutes().toString().padStart(2, '0');
      const timeStr = `${hours}:${minutes}`;
      
      let applicablePrice = basePrice;
      
      for (const rule of customPricing) {
        const ruleDays = Array.isArray(rule.days) ? rule.days : [0, 1, 2, 3, 4, 5, 6];
        const currentDay = currentMinDate.getDay();
        
        if (!ruleDays.includes(currentDay)) continue;

        let isWithin = false;
        if (rule.startTime <= rule.endTime) {
          isWithin = timeStr >= rule.startTime && timeStr < rule.endTime;
        } else {
          isWithin = timeStr >= rule.startTime || timeStr < rule.endTime;
        }
        if (isWithin) {
          applicablePrice = Number(rule.price) || basePrice;
          break;
        }
      }
      
      priceSum += applicablePrice / 60;
      currentTime += 60000;
    }
    extraPrice = Math.round(priceSum);
  } else {
    const extraHours = durationMinutes / 60;
    extraPrice = Math.round(basePrice * extraHours);
  }

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

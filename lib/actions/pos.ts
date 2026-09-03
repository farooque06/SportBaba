"use server"

import { supabase } from "@/lib/supabase";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/actions/logs";
import { linkBookingToCustomer } from "./customers";

export interface PosWalkInItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
}

export interface PosWalkInBookingPayload {
  resource_id: string;
  guest_name: string;
  guest_phone?: string;
  guest_email?: string;
  start_time: string;
  duration_minutes: number;
  items?: PosWalkInItem[];
  notes?: string;
  payment_method: 'cash' | 'qr' | 'esewa' | 'khalti' | 'card' | 'split' | 'credit';
  paid_amount: number;
  use_credit?: boolean;
}

export async function processWalkInPosCheckout(
  payload: PosWalkInBookingPayload,
  facilityId: string
) {
  const session = await auth();
  if (!session?.user || !facilityId) throw new Error("Unauthorized");

  const startTime = new Date(payload.start_time);
  const endTime = new Date(startTime.getTime() + payload.duration_minutes * 60000);

  // 1. Conflict Check
  const { data: conflicts } = await supabase
    .from('bookings')
    .select('id')
    .eq('resource_id', payload.resource_id)
    .neq('status', 'cancelled')
    .lt('start_time', endTime.toISOString())
    .gt('end_time', startTime.toISOString());

  if (conflicts && conflicts.length > 0) {
    return { error: "This slot is already booked. Please choose another pitch or start time." };
  }

  // 2. Fetch Resource Details for Base / Custom Pricing
  const { data: resource } = await supabase
    .from('resource_units')
    .select('name, base_price, custom_pricing, unit_type')
    .eq('id', payload.resource_id)
    .single();

  const basePrice = Number(resource?.base_price) || 0;
  const customPricing = Array.isArray(resource?.custom_pricing) ? resource.custom_pricing : [];
  let courtPrice = 0;

  if (customPricing.length > 0) {
    let currentTime = startTime.getTime();
    const endTimeMs = endTime.getTime();
    let priceSum = 0;

    while (currentTime < endTimeMs) {
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
    courtPrice = Math.round(priceSum);
  } else {
    const durationHours = payload.duration_minutes / 60;
    courtPrice = Math.round(basePrice * durationHours);
  }

  // 3. Add-on Equipment / Snack Items Total
  const itemsTotal = (payload.items || []).reduce(
    (sum, item) => sum + (Number(item.price) * Number(item.quantity || 1)),
    0
  );

  const grandTotal = courtPrice + itemsTotal;
  let paidAmount = Number(payload.paid_amount) || 0;

  // 4. Handle Customer Credit if applicable
  let creditUsed = 0;
  if (payload.use_credit && payload.guest_phone) {
    const { fetchCustomerCredit, deductCustomerCredit, searchCustomers } = await import("./customers");
    const balance = await fetchCustomerCredit(facilityId, payload.guest_phone);
    if (balance > 0) {
      creditUsed = Math.min(balance, grandTotal - paidAmount);
      if (creditUsed > 0) {
        const customers = await searchCustomers(facilityId, payload.guest_phone);
        const customer = customers.find(c => c.phone === payload.guest_phone);
        if (customer) {
          await deductCustomerCredit(customer.id, creditUsed);
          paidAmount += creditUsed;
        }
      }
    }
  }

  // Determine Payment Status
  let paymentStatus: 'paid' | 'unpaid' | 'partial' = 'unpaid';
  if (paidAmount >= grandTotal) {
    paymentStatus = 'paid';
  } else if (paidAmount > 0) {
    paymentStatus = 'partial';
  }

  // Compose POS Line Items Note
  const itemsNote = (payload.items && payload.items.length > 0)
    ? `\nAdd-ons: ${payload.items.map(i => `${i.name} x${i.quantity} (NRS ${i.price * i.quantity})`).join(', ')}`
    : '';

  const finalNotes = payload.notes 
    ? `${payload.notes}${itemsNote}` 
    : (itemsNote.trim() ? itemsNote.trim() : null);

  const displayMethod = creditUsed > 0 
    ? `${payload.payment_method.toUpperCase()} + Credit (NRS ${creditUsed})` 
    : payload.payment_method.toUpperCase();

  // 5. Insert Booking
  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      facility_id: facilityId,
      resource_id: payload.resource_id,
      guest_name: payload.guest_name.trim() || 'Walk-in Player',
      guest_phone: payload.guest_phone?.trim() || null,
      guest_email: payload.guest_email?.trim() || null,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      total_price: grandTotal,
      paid_amount: paidAmount,
      payment_status: paymentStatus,
      payment_method: displayMethod,
      notes: finalNotes,
      status: 'confirmed'
    })
    .select(`
      *,
      resource:resource_units(name, unit_type, base_price)
    `)
    .single();

  if (error) return { error: error.message };

  // Log activity
  logActivity({
    facilityId: facilityId,
    action: 'pos.walk_in.created',
    entityType: 'booking',
    entityId: booking.id,
    details: {
      guest_name: payload.guest_name,
      grandTotal,
      paidAmount,
      paymentMethod: payload.payment_method,
      itemsCount: payload.items?.length || 0
    }
  });

  // Link to customer directory
  if (payload.guest_name) {
    await linkBookingToCustomer(
      facilityId,
      booking.id,
      payload.guest_name,
      payload.guest_phone || undefined,
      grandTotal,
      payload.guest_email || undefined
    );
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard/pos");
  revalidatePath("/dashboard/customers");

  return {
    success: true,
    booking,
    breakdown: {
      courtPrice,
      itemsTotal,
      grandTotal,
      paidAmount,
      dueAmount: Math.max(0, grandTotal - paidAmount),
      paymentStatus
    }
  };
}

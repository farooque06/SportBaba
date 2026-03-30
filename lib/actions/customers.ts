"use server"

import { supabase } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function fetchCustomers(facilityId: string) {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('facility_id', facilityId)
    .order('last_visit', { ascending: false, nullsFirst: false });

  if (error) return [];
  return data;
}

export async function fetchCustomerProfile(customerId: string) {
  const { data: customer, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', customerId)
    .single();

  if (error || !customer) return null;

  // Fetch booking history for this customer
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      id,
      start_time,
      end_time,
      total_price,
      paid_amount,
      payment_status,
      status,
      guest_name,
      resource:resource_units(name, unit_type)
    `)
    .eq('customer_id', customerId)
    .order('start_time', { ascending: false })
    .limit(50);

  return { ...customer, bookings: bookings || [] };
}

export async function upsertCustomer(facilityId: string, data: {
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
}) {
  const { orgId } = await auth();
  if (!orgId) throw new Error("Unauthorized");

  // Check if customer already exists by phone
  if (data.phone) {
    const { data: existing } = await supabase
      .from('customers')
      .select('id')
      .eq('facility_id', facilityId)
      .eq('phone', data.phone)
      .single();

    if (existing) {
      // Update existing customer
      const { data: updated, error } = await supabase
        .from('customers')
        .update({ name: data.name, email: data.email, notes: data.notes })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) return { error: error.message };
      revalidatePath("/dashboard/customers");
      return { success: true, data: updated };
    }
  }

  // Create new customer
  const { data: customer, error } = await supabase
    .from('customers')
    .insert({
      facility_id: facilityId,
      ...data
    })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath("/dashboard/customers");
  return { success: true, data: customer };
}

// Auto-link a booking to a customer (called from createBooking)
export async function linkBookingToCustomer(
  facilityId: string,
  bookingId: string,
  guestName: string,
  guestPhone?: string,
  totalPrice?: number
) {
  if (!guestPhone) return; // Can't link without phone

  // Find or create customer
  let { data: customer } = await supabase
    .from('customers')
    .select('id, total_visits, total_spent')
    .eq('facility_id', facilityId)
    .eq('phone', guestPhone)
    .single();

  if (!customer) {
    const { data: newCustomer, error } = await supabase
      .from('customers')
      .insert({
        facility_id: facilityId,
        name: guestName,
        phone: guestPhone,
        total_visits: 1,
        total_spent: Number(totalPrice) || 0,
        last_visit: new Date().toISOString()
      })
      .select()
      .single();

    if (error || !newCustomer) return;
    customer = newCustomer;
  } else {
    // Update existing customer stats
    await supabase
      .from('customers')
      .update({
        name: guestName, // Always use latest name
        total_visits: (customer.total_visits || 0) + 1,
        total_spent: (Number(customer.total_spent) || 0) + (Number(totalPrice) || 0),
        last_visit: new Date().toISOString()
      })
      .eq('id', customer.id);
  }

  // Link booking to customer
  if (customer) {
    await supabase
      .from('bookings')
      .update({ customer_id: customer.id })
      .eq('id', bookingId);
  }
}

export async function searchCustomers(facilityId: string, query: string) {
  const { data, error } = await supabase
    .from('customers')
    .select('id, name, phone, total_visits, total_spent')
    .eq('facility_id', facilityId)
    .or(`name.ilike.%${query}%,phone.ilike.%${query}%`)
    .order('total_visits', { ascending: false })
    .limit(10);

  if (error) return [];
  return data;
}

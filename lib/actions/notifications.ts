"use server"

import { supabase } from "@/lib/supabase"
import { auth } from "@/auth"
import { sendNotificationEmail } from "./emails"

// Create a notification
export async function createNotification({
  facilityId,
  recipientId,
  type,
  title,
  message,
  relatedBookingId,
  data = {}
}: {
  facilityId: string
  recipientId: string
  type: string
  title: string
  message: string
  relatedBookingId?: string
  data?: Record<string, any>
}) {
  try {
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        facility_id: facilityId,
        recipient_id: recipientId,
        type,
        title,
        message,
        related_booking_id: relatedBookingId,
        data
      })
      .select()
      .single()

    if (error) throw error

    // Send email if user has email notifications enabled
    const { data: prefs } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('profile_id', recipientId)
      .single()

    if (prefs?.email_notifications) {
      const { data: user } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', recipientId)
        .single()

      if (user?.email) {
        await sendNotificationEmail({
          to: user.email,
          recipientName: user.full_name || 'User',
          subject: title,
          message,
          type
        })
      }
    }

    return notification
  } catch (error) {
    console.error('Error creating notification:', error)
    throw error
  }
}

// Notify all facility owners/managers/staff about an event
export async function notifyFacilityMembers(
  facilityId: string,
  type: string,
  title: string,
  message: string,
  relatedBookingId?: string,
  data: Record<string, any> = {}
) {
  try {
    const { data: members, error } = await supabase
      .from('memberships')
      .select('profile_id')
      .eq('facility_id', facilityId)
      .in('role', ['owner', 'manager', 'staff'])

    if (error) throw error

    const notifications = []
    for (const member of members || []) {
      if (!member.profile_id) continue
      const notif = await createNotification({
        facilityId,
        recipientId: member.profile_id,
        type,
        title,
        message,
        relatedBookingId,
        data
      })
      notifications.push(notif)
    }
    return notifications
  } catch (error) {
    console.error('Error notifying facility members:', error)
    return []
  }
}

// Get user notifications
export async function getUserNotifications(limit = 20, offset = 0) {
  const session = await auth()
  if (!session?.user?.id) return []

  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', session.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return []
  }
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId)
      .eq('recipient_id', session.user.id)

    if (error) throw error
  } catch (error) {
    console.error('Error marking notification as read:', error)
    throw error
  }
}

// Mark all notifications as read
export async function markAllNotificationsAsRead() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('recipient_id', session.user.id)
      .eq('is_read', false)

    if (error) throw error
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    throw error
  }
}

// Get notification preferences
export async function getNotificationPreferences() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  try {
    let { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('profile_id', session.user.id)
      .single()

    // Create default preferences if they don't exist
    if (error && error.code === 'PGRST116') {
      const { data: newPrefs, error: createError } = await supabase
        .from('notification_preferences')
        .insert({ profile_id: session.user.id })
        .select()
        .single()

      if (createError) throw createError
      data = newPrefs
    } else if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error('Error fetching notification preferences:', error)
    throw error
  }
}

// Update notification preferences
export async function updateNotificationPreferences(preferences: Partial<any>) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  try {
    const { error } = await supabase
      .from('notification_preferences')
      .update({ ...preferences, updated_at: new Date().toISOString() })
      .eq('profile_id', session.user.id)

    if (error) throw error
  } catch (error) {
    console.error('Error updating notification preferences:', error)
    throw error
  }
}

// Subscribe to push notifications
export async function subscribeToPushNotifications(subscription: PushSubscriptionJSON) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  try {
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        profile_id: session.user.id,
        endpoint: subscription.endpoint,
        p256dh: (subscription.keys as any)?.p256dh,
        auth: (subscription.keys as any)?.auth,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null
      }, { onConflict: 'profile_id,endpoint' })

    if (error) throw error
  } catch (error) {
    console.error('Error subscribing to push notifications:', error)
    throw error
  }
}

// Get unread notification count
export async function getUnreadNotificationCount() {
  const session = await auth()
  if (!session?.user?.id) return 0

  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', session.user.id)
      .eq('is_read', false)

    if (error) throw error
    return count || 0
  } catch (error) {
    console.error('Error fetching unread count:', error)
    return 0
  }
}

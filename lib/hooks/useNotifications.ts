"use client"

import { useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { supabase } from '@/lib/supabase'
import { subscribeToPushNotifications } from '@/lib/actions/notifications'
import { Toast, ToastType } from '@/components/ui/Toast'

interface UseNotificationsOptions {
  onNotification?: (notification: any) => void;
  showToast?: (message: string, type: ToastType) => void;
}

export function useNotifications({ onNotification, showToast }: UseNotificationsOptions = {}) {
  /*
  const { data: session } = useSession()

  // We rely on Supabase Realtime for in-app notifications

  // Listen to real-time notifications
  const setupRealtimeListener = useCallback(() => {
    if (!session?.user?.id) return

    const channel = supabase
      .channel(`notifications:${session.user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${session.user.id}`
        },
        (payload: any) => {
          const notification = payload.new
          console.log('New notification received:', notification)

          // Call the callback if provided
          if (onNotification) {
            onNotification(notification)
          }

          // Show toast
          if (showToast) {
            showToast(notification.message, 'success')
          }

          // Dispatch a custom event so NotificationBell can update its count without polling
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('new-notification', { detail: notification }))
          }

          // Show browser notification if permission granted
          if (Notification.permission === 'granted') {
            new Notification(notification.title, {
              body: notification.message,
              icon: '/icons/icon.png',
              tag: 'sportbaba-notification'
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session?.user?.id, onNotification, showToast])



  // Initialize on mount
  useEffect(() => {
    if (!session?.user?.id) return

    const cleanup = setupRealtimeListener()

    return cleanup
  }, [session?.user?.id, setupRealtimeListener])
  */
}

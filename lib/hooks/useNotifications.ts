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
  const { data: session } = useSession()

  // Register service worker and request permissions
  const initializePushNotifications = useCallback(async () => {
    if (!session?.user?.id) return

    try {
      // Check if browser supports service workers and push notifications
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.log('Push notifications not supported')
        return
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register('/notification-sw.js', {
        scope: '/'
      })

      console.log('Service Worker registered:', registration)

      // Request notification permission
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission()
        console.log('Notification permission:', permission)
      }

      // If permission granted, subscribe to push notifications
      if (Notification.permission === 'granted') {
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '')
        })

        // Send subscription to backend
        if (subscription) {
          await subscribeToPushNotifications(subscription)
          console.log('Subscribed to push notifications')
        }
      }
    } catch (error) {
      console.error('Error initializing push notifications:', error)
    }
  }, [session?.user?.id])

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

          // Show browser notification if permission granted
          if (Notification.permission === 'granted' && 'serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
              registration.showNotification(notification.title, {
                body: notification.message,
                icon: '/icons/notification-icon.png',
                badge: '/icons/badge.png',
                tag: 'sportbaba-notification',
                data: {
                  url: '/dashboard'
                }
              })
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session?.user?.id, onNotification, showToast])

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  // Initialize on mount
  useEffect(() => {
    if (!session?.user?.id) return

    initializePushNotifications()
    const cleanup = setupRealtimeListener()

    return cleanup
  }, [session?.user?.id, initializePushNotifications, setupRealtimeListener])
}

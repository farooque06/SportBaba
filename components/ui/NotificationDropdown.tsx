"use client"

import { useState, useEffect } from 'react'
import { Trash2, CheckCircle2, Clock, AlertCircle, X } from 'lucide-react'
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/lib/actions/notifications'
import { Button } from './Button'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  is_read: boolean
  created_at: string
  data?: Record<string, any>
}

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const data = await getUserNotifications(15, 0)
      setNotifications(data)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id)
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n))
      window.dispatchEvent(new CustomEvent('notifications-read'))
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead()
      setNotifications(notifications.map(n => ({ ...n, is_read: true })))
      window.dispatchEvent(new CustomEvent('notifications-read'))
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'booking_confirmed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'booking_cancelled':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'booking_reminder':
      case 'reminder_30m':
      case 'reminder_15m':
      case 'reminder_end_5m':
        return <Clock className="h-4 w-4 text-amber-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-blue-500" />
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed right-0 top-16 w-96 max-w-[calc(100vw-1rem)] bg-background border border-border rounded-lg shadow-lg z-50 max-h-[500px] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-sm uppercase tracking-wider">Notifications</h2>
          {typeof window !== 'undefined' && Notification.permission === 'default' && (
            <button 
              onClick={() => Notification.requestPermission().then(() => window.location.reload())}
              className="text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary px-2 py-1 rounded-full hover:bg-primary/20 transition-colors"
              title="Enable Desktop Notifications"
            >
              Enable Push
            </button>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-muted rounded transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground mb-2 opacity-50" />
            <p className="text-sm text-muted-foreground">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map(notification => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer border-l-4 ${
                  notification.is_read
                    ? 'border-l-transparent'
                    : 'border-l-primary'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm">{notification.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-2">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="p-1 hover:bg-background rounded transition-colors flex-shrink-0"
                    >
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-border flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            className="flex-1 text-xs"
          >
            Mark All Read
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="flex-1 text-xs"
          >
            Close
          </Button>
        </div>
      )}
    </div>
  )
}

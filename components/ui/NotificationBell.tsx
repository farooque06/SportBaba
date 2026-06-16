"use client"

import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { getUnreadNotificationCount } from '@/lib/actions/notifications'

interface NotificationBellProps {
  onClick?: () => void;
  className?: string;
}

export function NotificationBell({ onClick, className = '' }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCount = async () => {
      const count = await getUnreadNotificationCount()
      setUnreadCount(count)
      setLoading(false)
    }

    fetchCount()

    const handleNew = () => setUnreadCount(prev => prev + 1)
    const handleRead = () => fetchCount()

    window.addEventListener('new-notification', handleNew)
    window.addEventListener('notifications-read', handleRead)

    return () => {
      window.removeEventListener('new-notification', handleNew)
      window.removeEventListener('notifications-read', handleRead)
    }
  }, [])

  return (
    <button
      onClick={onClick}
      className={`relative p-2 hover:bg-muted rounded-lg transition-colors ${className}`}
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  )
}

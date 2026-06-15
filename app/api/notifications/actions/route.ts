import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { markAllNotificationsAsRead, getUnreadNotificationCount, getNotificationPreferences, updateNotificationPreferences } from '@/lib/actions/notifications'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const action = request.nextUrl.searchParams.get('action')

    if (action === 'mark-all-read') {
      await markAllNotificationsAsRead()
      return NextResponse.json({ success: true })
    }

    if (action === 'unread-count') {
      const count = await getUnreadNotificationCount()
      return NextResponse.json({ unreadCount: count })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error processing notification action:', error)
    return NextResponse.json({ error: 'Failed to process action' }, { status: 500 })
  }
}

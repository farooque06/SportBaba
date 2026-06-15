import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getNotificationPreferences, updateNotificationPreferences } from '@/lib/actions/notifications'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const preferences = await getNotificationPreferences()
    return NextResponse.json(preferences)
  } catch (error) {
    console.error('Error fetching notification preferences:', error)
    return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    await updateNotificationPreferences(body)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating notification preferences:', error)
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 })
  }
}

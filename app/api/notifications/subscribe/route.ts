import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { subscribeToPushNotifications } from '@/lib/actions/notifications'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscription = await request.json()

    if (!subscription.endpoint || !subscription.keys) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })
    }

    await subscribeToPushNotifications(subscription)

    return NextResponse.json({ success: true, message: 'Subscribed to push notifications' })
  } catch (error) {
    console.error('Error subscribing to push notifications:', error)
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
  }
}

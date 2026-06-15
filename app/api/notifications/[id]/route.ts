import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { supabase } from '@/lib/supabase'

export async function PUT(request: NextRequest, context: { params: any }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = context.params
    const body = await request.json()

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: body.is_read ?? true, read_at: new Date().toISOString() })
      .eq('id', id)
      .eq('recipient_id', session.user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 })
  }
}

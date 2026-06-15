# Real-Time Notifications System Setup Guide

## Overview
A complete notifications system with:
- In-app notifications (bell icon + dropdown)
- Browser push notifications (even when app is closed)
- Email notifications
- Booking reminders (15 minutes before)
- User-controlled preferences

## Files Created

### Database
- `supabase/migrations/notifications.sql` - All notification tables and RLS policies

### Backend
- `lib/actions/notifications.ts` - Server actions for notification management
- `lib/actions/emails.ts` - Updated with `sendNotificationEmail` function
- `app/api/notifications/route.ts` - Fetch notifications
- `app/api/notifications/[id]/route.ts` - Mark as read
- `app/api/notifications/actions/route.ts` - Bulk actions
- `app/api/notifications/preferences/route.ts` - User preferences
- `app/api/notifications/subscribe/route.ts` - Push subscription

### Frontend
- `components/ui/NotificationBell.tsx` - Notification bell icon
- `components/ui/NotificationDropdown.tsx` - Notification list dropdown
- `lib/hooks/useNotifications.ts` - Real-time listener hook
- `public/notification-sw.js` - Service worker for push notifications

## Setup Steps

### 1. Run Database Migration
```bash
# Using Supabase dashboard or CLI:
supabase db push  # or paste migration.sql contents into SQL editor
```

### 2. Add Environment Variables
Add these to your `.env.local`:

```env
# For Web Push API (generate using tools like web-push)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here  # Keep secret - used by backend only
VAPID_SUBJECT=mailto:your-email@example.com
```

**Generate VAPID keys:**
```bash
npm install -g web-push
web-push generate-vapid-keys
```

### 3. Update Sidebar Component
Add NotificationBell to your Sidebar header:

```tsx
// In components/layout/Sidebar.tsx - add import
import { NotificationBell } from "@/components/ui/NotificationBell"
import { NotificationDropdown } from "@/components/ui/NotificationDropdown"

// In the component function, add state:
const [notificationOpen, setNotificationOpen] = useState(false)
const [notifications, setNotifications] = useState<any[]>([])

// In the header section (after logo), add:
<div className="flex items-center gap-2">
  <NotificationBell 
    onClick={() => setNotificationOpen(!notificationOpen)}
    className="relative"
  />
</div>

// After the sidebar JSX, add:
{notificationOpen && (
  <NotificationDropdown 
    isOpen={notificationOpen}
    onClose={() => setNotificationOpen(false)}
  />
)}
```

### 4. Initialize Notifications in Dashboard Layout
Update `app/dashboard/layout.tsx`:

```tsx
// Add import
import { useNotifications } from "@/lib/hooks/useNotifications"

// Inside your layout component (wrap it as a client component if needed):
export default function DashboardLayout({ children }) {
  const [toastMessage, setToastMessage] = useState<any>(null)
  
  useNotifications({
    onNotification: (notification) => {
      // Handle new notification
      console.log('New notification:', notification)
    },
    showToast: (message, type) => {
      setToastMessage({ message, type })
    }
  })

  return (
    // ... existing layout
  )
}
```

### 5. Trigger Notifications from Booking Actions
When creating, updating, or cancelling bookings:

```tsx
import { createNotification } from '@/lib/actions/notifications'

// After booking created:
await createNotification({
  facilityId: booking.facility_id,
  recipientId: booking.user_id,
  type: 'booking_confirmed',
  title: 'Booking Confirmed! ✅',
  message: `Your booking for ${resourceName} on ${date} is confirmed.`,
  relatedBookingId: booking.id,
  data: {
    bookingId: booking.id,
    resourceName,
    startTime: booking.start_time,
    endTime: booking.end_time
  }
})
```

## Booking Reminders (15 Minutes Before)

### Setup Cron Job (Vercel)
Create `app/api/cron/send-booking-reminders/route.ts`:

```tsx
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createNotification } from '@/lib/actions/notifications'

export async function POST(request: NextRequest) {
  // Verify cron secret
  if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Find bookings starting in 15 minutes
    const fifteenMinutesFromNow = new Date(Date.now() + 15 * 60 * 1000)
    const fiveMinutesBefore = new Date(Date.now() + 10 * 60 * 1000)

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('id, user_id, facility_id, start_time, resource_id, resource_units(name)')
      .gte('start_time', fiveMinutesBefore.toISOString())
      .lte('start_time', fifteenMinutesFromNow.toISOString())
      .eq('status', 'confirmed')

    if (error) throw error

    // Send reminders
    for (const booking of bookings || []) {
      // Check if reminder already sent
      const { data: existing } = await supabase
        .from('notification_queue')
        .select('id')
        .eq('booking_id', booking.id)
        .eq('notification_type', 'booking_reminder')
        .not('sent_at', 'is', null)
        .single()

      if (!existing) {
        await createNotification({
          facilityId: booking.facility_id,
          recipientId: booking.user_id,
          type: 'booking_reminder',
          title: '⏰ Your Booking Starts Soon!',
          message: `Reminder: Your booking for ${(booking.resource_units as any)?.name} starts in 15 minutes!`,
          relatedBookingId: booking.id,
          data: {
            resourceName: (booking.resource_units as any)?.name,
            startTime: booking.start_time
          }
        })

        // Mark as sent in queue
        await supabase
          .from('notification_queue')
          .insert({
            booking_id: booking.id,
            recipient_id: booking.user_id,
            notification_type: 'booking_reminder',
            scheduled_for: booking.start_time,
            sent_at: new Date().toISOString()
          })
      }
    }

    return NextResponse.json({ success: true, sent: bookings?.length || 0 })
  } catch (error) {
    console.error('Error sending reminders:', error)
    return NextResponse.json({ error: 'Failed to send reminders' }, { status: 500 })
  }
}
```

### Configure Vercel Cron
Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/send-booking-reminders",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

Set `CRON_SECRET` environment variable.

## Usage Examples

### Create a Notification
```tsx
import { createNotification } from '@/lib/actions/notifications'

await createNotification({
  facilityId: 'facility-uuid',
  recipientId: 'user-uuid',
  type: 'booking_cancelled',
  title: 'Booking Cancelled',
  message: 'Your booking has been cancelled.',
  relatedBookingId: 'booking-uuid'
})
```

### Get User Notifications
```tsx
import { getUserNotifications } from '@/lib/actions/notifications'

const notifications = await getUserNotifications(20, 0) // limit, offset
```

### Update User Preferences
```tsx
import { updateNotificationPreferences } from '@/lib/actions/notifications'

await updateNotificationPreferences({
  booking_reminder: true,
  email_notifications: false,
  push_notifications: true,
  reminder_minutes_before: 30
})
```

## Testing

### Test Push Notifications
```tsx
// In browser console:
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then(registration => {
    registration.showNotification('Test Notification', {
      body: 'This is a test push notification',
      icon: '/icons/notification-icon.png'
    })
  })
}
```

### Test Email Notifications
Check that `sendNotificationEmail` is called with correct parameters and Resend API key is set.

## Troubleshooting

**Push notifications not working:**
- Ensure service worker is registered at `/public/notification-sw.js`
- Check browser's notification permissions
- Verify VAPID keys are set correctly
- Check browser console for errors

**Emails not sending:**
- Verify `RESEND_API_KEY` is set
- Check Resend dashboard for API issues
- Ensure email addresses are valid

**Real-time not updating:**
- Check Supabase realtime is enabled
- Verify RLS policies allow access
- Check browser network tab for connection issues

## Features Completed

✅ Database schema with RLS  
✅ In-app notification bell and dropdown  
✅ Browser push notifications  
✅ Email notifications  
✅ Real-time listeners (Supabase)  
✅ Service worker for background notifications  
✅ Notification preferences UI  
✅ User permission handling  
✅ API endpoints  

## Next Steps

1. Run the database migration
2. Set environment variables (VAPID keys, RESEND_API_KEY)
3. Integrate NotificationBell into Sidebar
4. Add useNotifications hook to Dashboard layout
5. Create cron job for booking reminders
6. Test with a booking confirmation
7. Monitor Supabase realtime and push subscription stats

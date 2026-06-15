// Service Worker for handling push notifications

self.addEventListener('push', event => {
  if (!event.data) {
    console.log('Push notification received with no data')
    return
  }

  const data = event.data.json()
  const { title, message, icon = '/icons/notification-icon.png', badge = '/icons/badge.png', tag = 'notification' } = data

  const options = {
    body: message,
    icon,
    badge,
    tag,
    requireInteraction: data.type === 'booking_reminder', // Keep reminder notifications visible
    data: {
      url: data.url || '/dashboard'
    }
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

// Handle notification click
self.addEventListener('notificationclick', event => {
  event.notification.close()

  const urlToOpen = event.notification.data.url || '/dashboard'

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(clientList => {
      // Check if there's already a window/tab open with the target URL
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i]
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus()
        }
      }
      // If not, open a new window/tab with the target URL
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    })
  )
})

// Handle notification close
self.addEventListener('notificationclose', event => {
  console.log('Notification closed:', event.notification.tag)
})

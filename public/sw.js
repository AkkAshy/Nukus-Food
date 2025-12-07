// Service Worker for Push Notifications

self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(clients.claim());
});

self.addEventListener('push', (event) => {
  console.log('Push event received:', event);

  let data = {
    title: 'Yangi bron!',
    body: 'Sizda yangi bron bor',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    url: '/owner/reservations'
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/badge-72.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'reservation-notification',
    renotify: true,
    requireInteraction: true,
    data: {
      url: data.url || '/owner/reservations',
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'view',
        title: "Ko'rish"
      },
      {
        action: 'close',
        title: 'Yopish'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const url = event.notification.data?.url || '/owner/reservations';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Check if there's already a window open
        for (const client of windowClients) {
          if (client.url.includes('/owner') && 'focus' in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Handle background sync for offline support
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-reservations') {
    console.log('Background sync for reservations');
  }
});

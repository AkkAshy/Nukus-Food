// Service Worker: Push Notifications + минимальный офлайн-кэш оболочки.
// При изменении логики кэша бампни CACHE_VERSION — старые кэши снесутся в activate.

const CACHE_VERSION = 'v1';
const PRECACHE = `nukus-precache-${CACHE_VERSION}`;
const RUNTIME = `nukus-runtime-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline';

// Оболочка, доступная без сети. Next.js статику (/_next/static/*) не перечисляем —
// у неё хэшированные имена, она кэшируется рантайм-стратегией ниже.
const PRECACHE_URLS = [
  OFFLINE_URL,
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(PRECACHE);
        // Каждый URL отдельно: один битый не валит всю установку.
        await Promise.allSettled(PRECACHE_URLS.map((u) => cache.add(u)));
      } catch (e) {
        console.error('Precache xatosi:', e);
      }
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(
    (async () => {
      const keep = [PRECACHE, RUNTIME];
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => !keep.includes(k)).map((k) => caches.delete(k))
      );
      await clients.claim();
    })()
  );
});

// Стратегии:
//  • навигация (HTML) — network-first, фолбэк на прекэшенный /offline
//  • статика (_next/static, иконки, шрифты, картинки) — cache-first
//  • API и кросс-домен (бэкенд, карты) — не трогаем, идёт в сеть как есть
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // бэкенд API, Яндекс.Карты и т.п.
  if (url.pathname.startsWith('/api/')) return; // свежесть данных важнее офлайна

  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).catch(() => caches.match(OFFLINE_URL)));
    return;
  }

  const isStatic =
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    /\.(?:js|css|woff2?|ttf|png|jpe?g|svg|webp|gif|ico)$/.test(url.pathname);

  if (isStatic) {
    event.respondWith(
      caches.match(req).then(
        (cached) =>
          cached ||
          fetch(req).then((res) => {
            if (res.ok && res.type === 'basic') {
              const copy = res.clone();
              caches.open(RUNTIME).then((c) => c.put(req, copy));
            }
            return res;
          })
      )
    );
  }
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

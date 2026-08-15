// RulesOff Service Worker for Web Notifications & PWA Support
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle Notification Clicks - Directs user to the Requests screen
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = new URL('/requests', self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if open
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          if ('navigate' in client && !client.url.includes('/requests')) {
            client.navigate(targetUrl);
          }
          return;
        }
      }
      // Open new window if app was minimized/closed
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// Background Push Event Handler
self.addEventListener('push', (event) => {
  if (!event.data) return;
  try {
    const data = event.data.json();
    const title = data.title || 'New Request! 🔥';
    const options = {
      body: data.body || 'You have a new snack request.',
      icon: '/pwa-icon.svg',
      badge: '/pwa-icon.svg',
      vibrate: [200, 100, 200],
      tag: data.tag || 'rulesoff-request',
      data: { url: data.url || '/requests' }
    };
    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.error('[SW] Push parse error:', err);
  }
});

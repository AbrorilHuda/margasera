// public/firebase-messaging-sw.js
// Service Worker untuk Firebase Cloud Messaging (background push notifications)
// File ini HARUS berada di /public agar dapat diakses di root domain

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyAItbowhHu6VU-McJw_5XoTySVFys9GvJ8',
  authDomain: 'margasera-notif.firebaseapp.com',
  projectId: 'margasera-notif',
  messagingSenderId: '317002317271',
  appId: '1:317002317271:web:e0eb37465908f05660df92',
});

const messaging = firebase.messaging();

// Handle background push notifications (ketika tab browser tidak aktif / tertutup)
messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification || {};

  self.registration.showNotification(title || 'Margasera', {
    body: body || 'Ada notifikasi baru',
    icon: icon || '/icon-192-v2.png',
    badge: '/180.png',
    data: payload.data,
    requireInteraction: false,
  });
});

// Klik notifikasi → buka dashboard admin
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/admin/dashboard';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/admin') && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});

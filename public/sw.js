// Margasera Admin Service Worker (Offline Support)
const CACHE_NAME = 'margasera-admin-v1';

const STATIC_PRECACHE_URLS = [
  '/admin/dashboard',
  '/admin/dashboard/bookings',
  '/admin/login',
  '/logo.png',
  '/icon-192.png',
  '/icon-512.png',
  '/admin-manifest.json',
];

// 1. Install Event: Simpan aset dasar dashboard ke cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_PRECACHE_URLS).catch((err) => {
        console.warn('[SW] Some precache assets failed:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// 2. Activate Event: Bersihkan cache versi lama
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Intercept request untuk offline fallback
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Hanya tangani GET request (abaikan POST server action/supabase agar ditangani outbox)
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // Abaikan request ekstensi browser atau domain luar selain origin kita
  if (url.origin !== self.location.origin) {
    return;
  }

  // A. Navigasi Halaman (HTML Page Navigation) -> Network First, Fallback ke Cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(async () => {
          // Jika offline, cari halaman di cache
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // Fallback umum ke dashboard admin jika rute spesifik belum di-cache
          if (url.pathname.startsWith('/admin')) {
            const fallback = await caches.match('/admin/dashboard');
            if (fallback) return fallback;
          }
          return new Response('Halaman tidak tersedia secara offline', {
            status: 503,
            statusText: 'Service Unavailable (Offline)',
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          });
        })
    );
    return;
  }

  // B. Aset Statis (JS, CSS, Font, Image, WebP) -> Cache First / Stale While Revalidate
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image' ||
    request.destination === 'font' ||
    url.pathname.startsWith('/_next/static/')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Ambil dari cache, lalu perbarui cache di background jika online
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(request, networkResponse);
                });
              }
            })
            .catch(() => {});
          return cachedResponse;
        }

        // Jika belum ada di cache, fetch dari network dan simpan
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }
});

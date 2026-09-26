// Margasera Admin Service Worker (Static Asset Caching & PWA Support)
// Versi cache dinaikkan untuk membersihkan cache HTML/RSC lama yang menyebabkan ERR_FAILED di iOS
const CACHE_NAME = 'margasera-static-v5';

// Precache hanya untuk aset statis publik inti
const STATIC_PRECACHE_URLS = [
  '/admin-manifest.json',
  '/logo.png',
  '/icon-192-v2.png',
  '/icon-512-v2.png',
  '/180.png',
];

// 1. Install Event: Simpan aset dasar ke cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.allSettled(
        STATIC_PRECACHE_URLS.map(async (url) => {
          try {
            const res = await fetch(url, { cache: 'no-cache' });
            if (res && res.status === 200) {
              await cache.put(url, res);
            }
          } catch (err) {
            console.warn('[SW Precache] Skip caching:', url, err);
          }
        })
      );
    }).then(() => self.skipWaiting())
  );
});

// 2. Activate Event: Bersihkan seluruh cache versi lama (v4 dsb) & klaim klien segera
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW Activate] Membersihkan cache lama:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Hanya tangani aset statis (JS, CSS, Font, Image)
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Hanya tangani GET request
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // Abaikan request domain luar selain origin aplikasi
  if (url.origin !== self.location.origin) {
    return;
  }

  // ATURAN KRUSIAL UNTUK iOS:
  // Bypass seluruh route admin (/admin & /admin/*).
  // JANGAN PERNAH intercept navigasi HTML, Supabase auth redirect, maupun RSC admin di Service Worker.
  // Ini menyelesaikan masalah ERR_FAILED di iOS Safari saat terjadi redirect autentikasi.
  if (url.pathname === '/admin' || url.pathname.startsWith('/admin/')) {
    return;
  }

  // Hanya tangani Aset Statis -> Stale While Revalidate
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image' ||
    request.destination === 'font' ||
    url.pathname.startsWith('/_next/static/') ||
    STATIC_PRECACHE_URLS.includes(url.pathname)
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Ambil dari cache, perbarui di background jika online
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
        return fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            return new Response('', { status: 408, statusText: 'Offline Asset Unavailable' });
          });
      })
    );
    return;
  }
});

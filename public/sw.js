// Margasera Admin Service Worker (Offline Support)
const CACHE_NAME = 'margasera-admin-v4';

// Hanya precache aset publik & halaman yang bebas dari redirect login
const STATIC_PRECACHE_URLS = [
  '/admin-manifest.json',
  '/logo.png',
  '/icon-192.png',
  '/icon-512.png',
];

// Helper: pastikan response bukan halaman redirect login Supabase
function isAuthRedirect(response) {
  if (!response) return true;
  if (response.redirected) return true;
  if (response.url && response.url.includes('/admin/login')) return true;
  return false;
}

// 1. Install Event: Simpan aset dasar ke cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.allSettled(
        STATIC_PRECACHE_URLS.map(async (url) => {
          try {
            const res = await fetch(url, { cache: 'no-cache' });
            if (res && res.status === 200 && !isAuthRedirect(res)) {
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

// 2. Activate Event: Bersihkan cache versi lama & klaim klien segera
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW Activate] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Intercept request untuk offline fallback
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

  // A. Navigasi Halaman Utama (HTML Page Navigation) -> Network First, Fallback ke Cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          // Jika server mencoba redirect ke /admin/login saat kita meminta halaman dashboard
          if (isAuthRedirect(response) && url.pathname.startsWith('/admin') && url.pathname !== '/admin/login') {
            const cache = await caches.open(CACHE_NAME);
            const cached =
              (await cache.match(request, { ignoreSearch: true })) ||
              (await cache.match(url.pathname, { ignoreSearch: true })) ||
              (await cache.match('/admin/dashboard/bookings', { ignoreSearch: true })) ||
              (await cache.match('/admin/dashboard', { ignoreSearch: true }));

            if (cached && !isAuthRedirect(cached)) {
              return cached;
            }
          }

          // JANGAN PERNAH simpan response redirect login sebagai cache halaman admin
          if (response && response.status === 200 && !isAuthRedirect(response)) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone.clone());
              cache.put(url.pathname, responseClone);
            });
          }
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);

          // 1. Cek cache persis (abaikan parameter query seperti ?action=new)
          let cachedResponse = await cache.match(request, { ignoreSearch: true });
          if (cachedResponse && !isAuthRedirect(cachedResponse)) return cachedResponse;

          // 2. Cek cache berdasarkan pathname bersih (misal /admin/dashboard/bookings)
          cachedResponse = await cache.match(url.pathname, { ignoreSearch: true });
          if (cachedResponse && !isAuthRedirect(cachedResponse)) return cachedResponse;

          // 3. Fallback umum dashboard admin jika halaman spesifik belum sempat di-cache
          // PERINGATAN: JANGAN PERNAH fallback ke /admin/login saat offline!
          if (url.pathname.startsWith('/admin')) {
            const bookingsFallback = await cache.match('/admin/dashboard/bookings', { ignoreSearch: true });
            if (bookingsFallback && !isAuthRedirect(bookingsFallback)) return bookingsFallback;

            const dashboardFallback = await cache.match('/admin/dashboard', { ignoreSearch: true });
            if (dashboardFallback && !isAuthRedirect(dashboardFallback)) return dashboardFallback;
          }

          // 4. Fallback HTML ramah jika belum ada cache sama sekali (bukan halaman login)
          return new Response(
            `<!DOCTYPE html>
            <html lang="id">
            <head>
              <meta charset="utf-8"/>
              <meta name="viewport" content="width=device-width, initial-scale=1"/>
              <title>Mode Offline - Margasera Control Center</title>
              <style>
                body { background: #09090b; color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
                .card { max-width: 380px; width: 100%; background: #18181b; border: 1px solid #27272a; border-radius: 20px; padding: 28px 20px; text-align: center; box-shadow: 0 16px 32px rgba(0,0,0,0.6); }
                .icon { font-size: 32px; margin-bottom: 12px; }
                h1 { font-size: 17px; font-weight: 700; margin: 0 0 8px; color: #ffffff; }
                p { font-size: 13px; color: #a1a1aa; line-height: 1.5; margin: 0 0 20px; }
                a { display: inline-block; background: #0066CC; color: #ffffff; padding: 10px 20px; border-radius: 12px; text-decoration: none; font-size: 13px; font-weight: 600; }
              </style>
            </head>
            <body>
              <div class="card">
                <div class="icon">📡</div>
                <h1>Koneksi Sedang Offline</h1>
                <p>Halaman ini belum tersimpan di memori cache perangkat. Anda dapat mengakses data booking offline yang telah tersimpan sebelumnya.</p>
                <a href="/admin/dashboard/bookings">Buka Booking Offline</a>
              </div>
            </body>
            </html>`,
            {
              status: 200,
              headers: { 'Content-Type': 'text/html; charset=utf-8' },
            }
          );
        })
    );
    return;
  }

  // B. Next.js RSC / Data Navigation Requests (?_rsc= atau header RSC)
  const isRscRequest = url.searchParams.has('_rsc') || request.headers.get('RSC') === '1';
  if (isRscRequest) {
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          if (isAuthRedirect(response)) {
            const cache = await caches.open(CACHE_NAME);
            let cached = await cache.match(request, { ignoreSearch: true });
            if (cached && !isAuthRedirect(cached)) return cached;

            cached = await cache.match(url.pathname + '?_rsc=cached', { ignoreSearch: true });
            if (cached && !isAuthRedirect(cached)) return cached;

            return new Response('Offline RSC Unavailable', {
              status: 503,
              statusText: 'Offline',
              headers: { 'Content-Type': 'text/plain; charset=utf-8' },
            });
          }

          if (response && response.status === 200 && !isAuthRedirect(response)) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone.clone());
              // Simpan juga versi tanpa query _rsc untuk pencocokan fleksibel
              cache.put(url.pathname + '?_rsc=cached', clone);
            });
          }
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          // Coba cari RSC persis
          let cached = await cache.match(request, { ignoreSearch: true });
          if (cached && !isAuthRedirect(cached)) return cached;

          // Coba cari RSC berdasarkan pathname
          cached = await cache.match(url.pathname + '?_rsc=cached', { ignoreSearch: true });
          if (cached && !isAuthRedirect(cached)) return cached;

          // Jika RSC tidak ada di cache saat offline, kembalikan 503 Service Unavailable
          // JANGAN kembalikan HTML atau Response kosong 200 agar Next.js tidak mengira redirect login
          return new Response('Offline RSC Unavailable', {
            status: 503,
            statusText: 'Offline',
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          });
        })
    );
    return;
  }

  // C. Aset Statis (JS, CSS, Font, Image, WebP, dll) -> Cache First / Stale While Revalidate
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
          // Ambil dari cache, lalu perbarui di background jika online
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

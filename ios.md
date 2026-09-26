* **iOS/Safari lebih aman**
* Android tetap aman
* PWA tetap berjalan
* Admin tetap bisa bekerja ketika offline
* Booking bisa dibuat/diubah saat offline
* Data disinkronkan ketika online kembali
* Authentication tetap menggunakan Supabase
* Service Worker tidak lagi meng-cache HTML/RSC admin


# PRD — Margasera Admin Offline-First & iOS Stability

**Project:** Margasera Photography Studio
**Module:** Admin Control Center
**Platform:** Web PWA — Desktop, Android, iOS/Safari
**Stack:** Next.js, React, Supabase, `@supabase/ssr`, Service Worker, IndexedDB
**Status:** Proposed

---

# 1. Latar Belakang

Margasera Admin Control Center saat ini menggunakan Service Worker untuk mendukung offline mode.

Service Worker saat ini melakukan beberapa hal sekaligus:

* precache aset publik
* intercept navigasi HTML
* melakukan network-first terhadap halaman admin
* menyimpan halaman admin ke Cache Storage
* melakukan fallback ke halaman dashboard
* mengintercept Next.js RSC
* menyimpan response RSC
* melakukan fallback ketika koneksi gagal

Contohnya, Service Worker saat ini menangani seluruh request navigasi melalui `request.mode === 'navigate'`. 

Response halaman juga disimpan berdasarkan request dan pathname. 

Selain itu, request RSC Next.js juga di-cache secara manual. 

Pendekatan tersebut berpotensi menimbulkan konflik dengan:

* Supabase authentication
* cookie session
* Next.js App Router
* RSC
* redirect authentication
* Safari/WebKit
* cache yang sudah tidak sesuai dengan session terbaru

Salah satu gejala yang ditemukan adalah:

```text
/admin/dashboard
        ↓
redirect
        ↓
/admin/login?redirectedFrom=%2Fadmin%2Fdashboard
        ↓
ERR_FAILED
```

di iPhone, sementara perangkat Android dapat berjalan normal.

---

# 2. Masalah Utama

## 2.1 Service Worker terlalu banyak menangani Admin

Saat ini Service Worker berperan sebagai:

```text
Network Layer
+
Cache Layer
+
Offline HTML Layer
+
RSC Cache
+
Authentication Redirect Handler
```

Ini terlalu banyak tanggung jawab.

Authentication seharusnya tetap ditangani oleh:

```text
Next.js
+
Supabase Auth
+
proxy.ts
```

Sedangkan Service Worker sebaiknya fokus pada:

```text
PWA
+
static assets
```

---

# 3. Tujuan Produk

## Primary Goal

Membangun sistem **Offline-First Admin** yang:

1. Stabil di iOS Safari.
2. Tidak mengganggu Supabase authentication.
3. Tidak meng-cache halaman admin secara langsung.
4. Tidak meng-cache RSC Next.js.
5. Tetap dapat digunakan ketika koneksi internet terputus.
6. Menyimpan data offline menggunakan IndexedDB.
7. Memiliki mekanisme synchronization queue.
8. Melakukan sinkronisasi ketika koneksi kembali.
9. Menampilkan status online/offline secara jelas.
10. Meminimalkan risiko data offline tertimpa atau hilang.

---

# 4. Prinsip Arsitektur

Arsitektur baru harus mengikuti prinsip:

> **Service Worker untuk application assets, IndexedDB untuk application data.**

Bukan:

```text
Service Worker
    ↓
HTML Cache
    ↓
RSC Cache
    ↓
Offline Admin
```

Tetapi:

```text
Service Worker
    ↓
Static Assets

React Application
    ↓
IndexedDB
    ↓
Offline Data
```

---

# 5. Arsitektur Target

```text
                         ┌─────────────────┐
                         │   Margasera.id  │
                         └────────┬────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                 PUBLIC                       ADMIN
                    │                           │
                    ▼                           ▼
             Service Worker                Next.js
                    │                           │
             Static Assets               proxy.ts
                                                │
                                      ┌─────────┴─────────┐
                                      │                   │
                                   ONLINE              OFFLINE
                                      │                   │
                                      ▼                   ▼
                                  Supabase             IndexedDB
                                      │                   │
                                      └─────────┬─────────┘
                                                │
                                           Sync Queue
                                                │
                                                ▼
                                             Supabase
```

---

# 6. Scope

## In Scope

### Service Worker

* static asset caching
* public asset caching
* PWA support
* cache versioning
* cleanup cache lama
* bypass seluruh `/admin/*`

### IndexedDB

* booking cache
* customer cache
* package cache
* schedule cache
* sync queue
* local metadata
* last synchronization information

### Offline Mode

* membaca data yang sudah tersimpan
* membuat booking offline
* mengubah booking offline
* menyimpan perubahan ke queue
* synchronization ketika online

### Authentication

* mempertahankan Supabase Auth
* mempertahankan `@supabase/ssr`
* menyederhanakan proxy
* tidak menggunakan Service Worker untuk authentication

### UI

* online indicator
* offline indicator
* sync indicator
* pending changes indicator
* sync error indicator

---

# 7. Out of Scope

Untuk tahap pertama, jangan implementasi:

* background sync sebagai satu-satunya mekanisme sync
* offline password reset
* offline account creation
* offline role management
* offline user management
* offline Supabase Auth creation
* offline perubahan permission
* offline penghapusan massal
* offline upload file besar
* offline image synchronization otomatis

---

# 8. Perubahan Service Worker

## 8.1 Admin Harus Bypass Service Worker

Tambahkan rule:

```ts
if (
  url.pathname === '/admin' ||
  url.pathname.startsWith('/admin/')
) {
  return;
}
```

Artinya:

```text
/admin
/admin/login
/admin/dashboard
/admin/reservations
/admin/customers
/admin/settings
```

tidak boleh diproses oleh Service Worker.

---

# 9. Service Worker Tidak Boleh Melakukan

Hapus logic:

### Admin HTML caching

Tidak boleh lagi:

```text
cache.put('/admin/dashboard')
```

### Admin navigation fallback

Tidak boleh lagi:

```text
dashboard fallback
booking fallback
login fallback
```

### RSC caching

Tidak boleh lagi menyimpan:

```text
?_rsc=
```

ke Cache Storage.

### Authentication redirect handling

Service Worker tidak boleh menentukan:

```text
login
vs
dashboard
```

Itu tanggung jawab Next.js/proxy.

---

# 10. Service Worker Target

Service Worker hanya bertanggung jawab terhadap:

```text
/_next/static/*
JS
CSS
Images
Fonts
Public assets
PWA assets
```

Contoh:

```js
if (
  request.destination === 'script' ||
  request.destination === 'style' ||
  request.destination === 'image' ||
  request.destination === 'font' ||
  url.pathname.startsWith('/_next/static/')
) {
    // cache asset
}
```

---

# 11. Cache Strategy

Gunakan cache version:

```text
margasera-static-v1
```

atau:

```text
margasera-assets-v1
```

Tidak lagi menggunakan cache sebagai database halaman admin.

Saat deployment:

```text
v1
 ↓
v2
 ↓
hapus v1
```

Service Worker saat ini memang sudah melakukan cleanup cache lama ketika activation. 

Mekanisme tersebut dapat dipertahankan.

---

# 12. IndexedDB

Gunakan IndexedDB sebagai local database.

Untuk implementasi, disarankan menggunakan abstraction library seperti:

```text
Dexie
```

atau wrapper IndexedDB lain yang ringan.

Jangan membuat abstraction database yang terlalu kompleks jika kebutuhan masih sederhana.

> Prinsip: **jangan over-engineering.**

---

# 13. Database Schema IndexedDB

## 13.1 `bookings`

```ts
{
  id: string;
  remoteId?: string;

  customerId: string;

  packageId?: string;

  bookingDate: string;

  status: string;

  totalPrice: number;

  notes?: string;

  createdAt: string;
  updatedAt: string;

  syncStatus:
    | 'synced'
    | 'pending'
    | 'failed';

  localUpdatedAt: string;
}
```

---

# 14. `customers`

```ts
{
  id: string;
  remoteId?: string;

  name: string;

  phone?: string;

  email?: string;

  address?: string;

  createdAt: string;
  updatedAt: string;

  syncStatus:
    | 'synced'
    | 'pending'
    | 'failed';
}
```

---

# 15. `packages`

```ts
{
  id: string;

  name: string;

  price: number;

  description?: string;

  isActive: boolean;

  updatedAt: string;
}
```

Package merupakan data referensi.

Untuk tahap awal:

```text
Online → update IndexedDB
Offline → read IndexedDB
```

Tidak perlu offline CRUD untuk package.

---

# 16. `schedules`

```ts
{
  id: string;

  bookingId?: string;

  date: string;

  startTime?: string;

  endTime?: string;

  status: string;

  updatedAt: string;
}
```

---

# 17. `sync_queue`

Ini merupakan komponen paling penting.

```ts
{
  id: string;

  entity:
    | 'booking'
    | 'customer'
    | 'schedule';

  entityId: string;

  operation:
    | 'create'
    | 'update'
    | 'delete';

  payload: Record<string, unknown>;

  createdAt: string;

  retryCount: number;

  status:
    | 'pending'
    | 'syncing'
    | 'failed';
}
```

---

# 18. Sync Queue Flow

## Saat Online

```text
User
 ↓
Create Booking
 ↓
Supabase
 ↓
Success
 ↓
IndexedDB
 ↓
synced
```

---

## Saat Offline

```text
User
 ↓
Create Booking
 ↓
IndexedDB
 ↓
syncStatus = pending
 ↓
sync_queue
```

UI langsung menunjukkan:

```text
✓ Booking tersimpan di perangkat
⏳ Menunggu koneksi
```

---

# 19. Automatic Synchronization

Ketika browser mendeteksi:

```js
window.addEventListener('online', sync);
```

jalankan synchronization.

Selain itu, lakukan sync ketika:

```text
Application startup
+
Dashboard opened
+
User manually clicks Sync
```

Jangan bergantung sepenuhnya pada Background Sync API.

---

# 20. Sync Algorithm

```text
sync()
  ↓
ambil pending queue
  ↓
sort berdasarkan createdAt
  ↓
proses satu per satu
  ↓
request Supabase
  ↓
success?
 ├── yes → mark synced
 │
 └── no → retry
```

Jangan menjalankan terlalu banyak mutation secara paralel pada tahap pertama.

Gunakan sequential sync:

```text
001
 ↓
002
 ↓
003
 ↓
004
```

agar debugging lebih mudah.

---

# 21. Retry

Gunakan batas retry:

```text
maxRetry = 3
```

Contoh:

```text
Attempt 1
Attempt 2
Attempt 3
      ↓
failed
```

Setelah gagal:

```text
status = failed
```

dan tampilkan kepada user.

---

# 22. Manual Retry

Jika sync gagal:

```text
⚠ 2 perubahan gagal disinkronkan

[ Coba Lagi ]
```

User dapat melakukan retry manual.

---

# 23. Conflict Handling

Conflict harus ditangani secara eksplisit.

Jangan langsung menggunakan:

```text
last write wins
```

untuk semua kasus tanpa pengecekan.

Minimal gunakan:

```text
updatedAt
```

atau versi data.

Contoh:

```text
Local updatedAt:
10:30

Server updatedAt:
10:32
```

Jika local mencoba mengubah data:

```text
10:33
```

server perlu menentukan apakah update dapat diterapkan.

---

# 24. Strategi Conflict Tahap Pertama

Untuk booking:

### Create

Gunakan ID lokal yang unik:

```text
UUID
```

Contoh:

```text
local:
booking_01J...
```

Ketika sync berhasil:

```text
remoteId:
UUID Supabase
```

Idealnya gunakan UUID yang sama untuk local dan remote jika schema Supabase memungkinkan.

Ini mengurangi risiko duplicate booking.

---

# 25. Update Conflict

Jika:

```text
serverUpdatedAt > localBaseUpdatedAt
```

maka jangan overwrite secara otomatis.

Tandai:

```text
conflict
```

dan tampilkan:

```text
⚠ Data booking berubah di server

[ Lihat Perubahan ]

[ Gunakan Data Server ]

[ Gunakan Perubahan Lokal ]
```

Untuk MVP, jika UI conflict terlalu besar, minimal:

```text
sync failed
reason = conflict
```

dan user harus menyelesaikannya ketika online.

---

# 26. Authentication

Authentication tetap menggunakan:

```text
Supabase Auth
+
@supabase/ssr
```

Jangan membuat sistem authentication kedua di IndexedDB.

---

# 27. Perubahan `proxy.ts`

`proxy.ts` harus fokus pada:

```text
authentication
authorization
redirect
```

dan bukan:

```text
offline data handling
```

---

# 28. Simplifikasi Token Validation

Fungsi manual:

```ts
isSupabaseTokenValid()
```

sebaiknya tidak lagi menjadi sumber kebenaran utama authentication.

Saat ini fungsi tersebut membaca cookie `sb-*auth-token`, melakukan parsing JWT, lalu dalam kondisi parsing gagal dapat menganggap cookie masih valid. Ini berpotensi membuat validasi terlalu permisif.

Target:

```text
Supabase Auth
    ↓
getUser()
    ↓
server verification
```

---

# 29. Flow Proxy Baru

## `/admin/login`

```text
request
 ↓
allow login
```

Jika user sudah login dan session valid:

```text
/admin/login
 ↓
getUser()
 ↓
user exists
 ↓
redirect /admin/dashboard
```

---

# 30. Admin Route

```text
/admin/*
 ↓
proxy
 ↓
getUser()
 ↓
user?
 ├── yes → continue
 └── no → /admin/login
```

---

# 31. Role Authorization

Tetap lakukan pengecekan role:

```text
admin
staff
```

Role berasal dari database/server.

Jangan menjadikan role yang tersimpan di IndexedDB sebagai source of truth ketika online.

---

# 32. Offline Authorization

Ketika offline:

```text
last verified user
+
last verified role
```

dapat digunakan untuk menentukan apakah aplikasi boleh masuk ke **offline workspace**.

Contoh:

```text
Last verified:
2026-09-26 08:30

User:
staff

Offline access:
allowed
```

Tetapi ketika kembali online:

```text
getUser()
 ↓
verify role
 ↓
update local permission
```

---

# 33. Offline Session Policy

Buat metadata:

```ts
{
  userId: string;
  email: string;
  role: 'admin' | 'staff';
  lastVerifiedAt: string;
}
```

Gunakan hanya sebagai informasi offline.

Jangan menyimpan access token secara manual di IndexedDB.

---

# 34. Offline Workspace

Ketika offline, aplikasi menampilkan:

```text
Offline Mode
```

Contoh:

```text
┌──────────────────────────────┐
│ 🟠 Offline                   │
│ Menggunakan data lokal      │
└──────────────────────────────┘
```

---

# 35. Data yang Tersedia Offline

## Prioritas MVP

| Data     | Offline Read | Offline Create | Offline Update |
| -------- | -----------: | -------------: | -------------: |
| Booking  |            ✅ |              ✅ |              ✅ |
| Customer |            ✅ |              ✅ |             ⚠️ |
| Package  |            ✅ |              ❌ |              ❌ |
| Schedule |            ✅ |             ⚠️ |             ⚠️ |
| User     |            ❌ |              ❌ |              ❌ |
| Role     |     Snapshot |              ❌ |              ❌ |
| Settings |     Snapshot |              ❌ |              ❌ |

Untuk MVP, fokus terbesar:

> **Booking**

---

# 36. Data Synchronization

Saat aplikasi online:

```text
Supabase
 ↓
fetch latest data
 ↓
IndexedDB
 ↓
update local snapshot
```

Jangan menyimpan seluruh database.

Gunakan data yang relevan dengan kebutuhan admin.

---

# 37. Offline Data Limit

Untuk menghindari IndexedDB membesar tanpa kontrol:

### Booking

```text
30 hari terakhir
+
90 hari ke depan
```

### Schedule

```text
30 hari ke depan
```

### Package

```text
semua package aktif
```

### Customer

```text
customer terkait booking lokal
```

Nilai ini dapat dijadikan configuration.

---

# 38. UI Status

Tambahkan global status indicator.

## Online

```text
🟢 Online
```

## Offline

```text
🟠 Offline
```

## Sync

```text
🔄 Menyinkronkan...
```

## Pending

```text
⏳ 3 perubahan belum tersinkron
```

## Error

```text
⚠ 2 perubahan gagal disinkronkan
```

---

# 39. Manual Sync Button

Tambahkan:

```text
[ Sync Sekarang ]
```

ketika terdapat:

```text
pending
+
failed
```

---

# 40. Offline Booking UX

Ketika user membuat booking offline:

```text
Simpan
 ↓
IndexedDB
 ↓
success
```

Tampilkan:

> Booking berhasil disimpan di perangkat dan akan disinkronkan ketika koneksi tersedia.

Jangan menampilkan:

> Booking berhasil dibuat

jika sebenarnya belum masuk Supabase.

Ini penting agar admin tidak salah mengira booking sudah tersimpan di server.

---

# 41. Status Booking

Tambahkan status internal:

```text
synced
pending
failed
conflict
```

Contoh:

```text
Booking #MGS-001

Status:
Confirmed

Sync:
✓ Tersinkron
```

atau:

```text
Booking #MGS-002

Status:
Pending

Sync:
⏳ Menunggu koneksi
```

---

# 42. Offline Delete

Untuk MVP, **hindari delete offline** jika belum diperlukan.

Lebih aman:

```text
Delete
 ↓
harus online
```

Karena delete offline mempunyai risiko conflict lebih tinggi.

---

# 43. File Upload

Upload:

* foto
* dokumen
* bukti pembayaran

jangan langsung dibuat offline pada MVP.

Jika user offline:

```text
Upload membutuhkan koneksi internet.
```

Data booking tetap dapat disimpan tanpa file.

---

# 44. PWA Installation

PWA tetap mempertahankan:

```text
manifest
icons
theme
standalone
```

Service Worker tetap aktif.

Perubahan hanya pada strategi caching.

---

# 45. iOS Compatibility

Target implementasi harus menghindari ketergantungan terhadap:

* Background Sync
* cache HTML authenticated
* cache RSC
* Service Worker authentication
* Service Worker redirect handling

Karena authentication harus tetap melalui browser → Next.js → Supabase.

---

# 46. Android Compatibility

Android harus tetap mendukung:

* install PWA
* static asset cache
* offline data
* sync queue
* online/offline indicator

Tidak boleh ada regresi dari perubahan Service Worker.

---

# 47. Desktop Compatibility

Desktop:

* Chrome
* Edge
* Safari

harus tetap mendukung:

```text
online
offline
sync
```

---

# 48. Security Requirements

## Jangan menyimpan:

```text
password
access token
refresh token
service role key
Supabase secret
```

di IndexedDB.

---

# 49. Sensitive Data

Data offline yang disimpan harus dibatasi.

Jangan melakukan:

```text
SELECT *
FROM seluruh_database
```

kemudian memasukkan semuanya ke IndexedDB.

Gunakan field yang benar-benar dibutuhkan.

---

# 50. Local Data Cleanup

Sediakan mekanisme:

```text
logout
 ↓
clear local user data
 ↓
clear sync queue
 ↓
clear IndexedDB
```

Namun jangan menghapus cache static assets secara otomatis jika tidak diperlukan.

---

# 51. Logout

Saat user logout:

```text
Supabase signOut
 ↓
clear local user-specific IndexedDB
 ↓
clear pending queue
 ↓
redirect /admin/login
```

User lain yang login pada device yang sama tidak boleh melihat data lokal user sebelumnya.

---

# 52. Multi-User Safety

IndexedDB harus menggunakan:

```text
userId
```

sebagai bagian dari key atau partition.

Contoh:

```text
bookings:
userId + bookingId
```

Agar:

```text
Admin A
```

tidak melihat snapshot:

```text
Admin B
```

---

# 53. Sync Queue Ownership

Setiap queue harus memiliki:

```ts
userId
```

Contoh:

```ts
{
  id,
  userId,
  entity,
  entityId,
  operation,
  payload
}
```

Sync hanya boleh dilakukan untuk user aktif.

---

# 54. Initial Data Sync

Setelah login pertama:

```text
Login
 ↓
verify user
 ↓
fetch essential data
 ↓
IndexedDB
 ↓
offline workspace ready
```

UI:

```text
Menyiapkan mode offline...
```

Setelah selesai:

```text
✓ Mode offline siap
```

---

# 55. Offline Read Strategy

Saat online:

```text
UI
 ↓
IndexedDB
 ↓
render cepat
 ↓
fetch Supabase
 ↓
update IndexedDB
 ↓
refresh UI
```

Dengan pendekatan ini aplikasi terasa lebih cepat.

---

# 56. Online-First Mutation

Untuk mutation:

```text
if online:
    Supabase
else:
    IndexedDB + Queue
```

Pseudo:

```ts
if (navigator.onLine) {
  await createBookingRemote(data);
  await saveBookingLocal(data);
} else {
  await saveBookingLocal(data);
  await addToSyncQueue(data);
}
```

---

# 57. Jangan Percaya `navigator.onLine` 100%

`navigator.onLine` hanya digunakan sebagai **hint**.

Tetap tangani error request.

Contoh:

```text
navigator.onLine = true
        ↓
Supabase request
        ↓
network error
        ↓
anggap gagal online
        ↓
masukkan queue
```

Jadi:

> `navigator.onLine` bukan source of truth koneksi.

---

# 58. Sync Trigger

Sync harus dijalankan pada:

### 1. App startup

```text
App opened
 ↓
sync pending
```

### 2. `online` event

```text
offline
 ↓
online
 ↓
sync
```

### 3. Dashboard mount

```text
Dashboard
 ↓
check pending
 ↓
sync
```

### 4. Manual

```text
Sync Sekarang
```

---

# 59. Error Handling

Jika Supabase gagal:

```text
network error
```

→ tetap pending.

Jika validation error:

```text
400/422
```

→ jangan retry terus-menerus.

Jika authentication error:

```text
401
```

→ hentikan sync dan minta user login kembali.

Jika conflict:

```text
409
```

→ tandai conflict.

---

# 60. Acceptance Criteria

## Authentication

* [ ] `/admin/login` dapat dibuka di iOS Safari.
* [ ] `/admin/dashboard` dapat redirect ke login tanpa `ERR_FAILED`.
* [ ] Authentication tetap menggunakan Supabase.
* [ ] Service Worker tidak mengintercept `/admin/*`.
* [ ] Role admin/staff tetap diverifikasi server ketika online.

---

# 61. Offline Acceptance Criteria

* [ ] Admin dapat membuka workspace setelah sebelumnya melakukan initialization online.
* [ ] Booking yang telah disimpan dapat dibaca ketika offline.
* [ ] Booking baru dapat dibuat offline.
* [ ] Perubahan offline masuk `sync_queue`.
* [ ] UI menunjukkan status pending.
* [ ] Ketika koneksi kembali, queue otomatis diproses.
* [ ] Data berhasil tersinkron ke Supabase.
* [ ] Queue berubah menjadi synced.
* [ ] Failed sync dapat di-retry manual.

---

# 62. iOS Acceptance Criteria

Minimal test:

```text
iPhone Safari
├── Login
├── Dashboard
├── Booking list
├── Create booking
├── Offline
├── Create booking offline
├── Online kembali
└── Sync
```

Semua flow tersebut harus bekerja tanpa:

```text
ERR_FAILED
```

---

# 63. Android Acceptance Criteria

Test:

```text
Android Chrome
├── Login
├── Dashboard
├── Offline
├── Create booking
└── Sync
```

Tidak boleh ada regression.

---

# 64. Service Worker Acceptance Criteria

Service Worker:

* [ ] cache static assets
* [ ] tidak cache `/admin/*`
* [ ] tidak cache RSC
* [ ] tidak melakukan authentication redirect
* [ ] tidak fallback ke `/admin/dashboard`
* [ ] tidak fallback ke `/admin/login`
* [ ] dapat update versi cache
* [ ] menghapus cache lama

---

# 65. Proxy Acceptance Criteria

`proxy.ts`:

* [ ] fokus authentication
* [ ] fokus authorization
* [ ] redirect unauthenticated user
* [ ] redirect authenticated user dari login
* [ ] validasi role ketika online
* [ ] tidak menangani IndexedDB
* [ ] tidak menangani offline data
* [ ] tidak melakukan cache logic

---

# 66. Developer Rules

Implementasi harus mengikuti:

### Jangan over-engineering

Jangan membuat:

```text
OfflineRepositoryFactory
SyncOrchestratorManager
NetworkStateAbstractionLayer
CacheStrategyManager
```

jika kebutuhan belum membutuhkan itu.

Lebih baik:

```text
db.ts
sync.ts
offline.ts
```

yang sederhana dan mudah dipahami.

---

# 67. Suggested Structure

Contoh struktur:

```text
src/
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   │
│   └── offline/
│       ├── db.ts
│       ├── bookings.ts
│       ├── customers.ts
│       ├── sync.ts
│       └── network.ts
│
├── hooks/
│   ├── useOnlineStatus.ts
│   ├── useOfflineSync.ts
│   └── useOfflineBooking.ts
│
├── components/
│   └── offline/
│       ├── ConnectionStatus.tsx
│       ├── SyncStatus.tsx
│       └── PendingChanges.tsx
│
└── proxy.ts

public/
└── sw.js
```

Sesuaikan struktur tersebut dengan struktur existing project; **jangan melakukan refactor besar-besaran hanya demi mengikuti struktur contoh**.

---

# 68. Tahapan Implementasi

## Phase 1 — Service Worker

1. Backup `sw.js`.
2. Hapus interception `/admin/*`.
3. Hapus HTML admin caching.
4. Hapus RSC caching.
5. Pertahankan static asset caching.
6. Naikkan cache version.
7. Test iOS.

**Goal:** masalah `ERR_FAILED` selesai terlebih dahulu.

---

## Phase 2 — IndexedDB

1. Install/configure IndexedDB wrapper.
2. Buat schema.
3. Buat booking repository sederhana.
4. Simpan snapshot booking.
5. Buat sync queue.

---

## Phase 3 — Offline Read

1. Dashboard membaca IndexedDB.
2. Online → refresh dari Supabase.
3. Offline → gunakan IndexedDB.
4. Tambahkan indicator.

---

## Phase 4 — Offline Create

Implementasi:

```text
Create Booking
 ↓
Online?
 ├── yes → Supabase
 └── no → IndexedDB + queue
```

---

## Phase 5 — Synchronization

Implement:

```text
startup
online event
manual sync
```

Kemudian:

```text
pending
 ↓
syncing
 ↓
synced / failed
```

---

## Phase 6 — Conflict Handling

Setelah basic synchronization stabil:

```text
updatedAt
version
conflict
```

baru diterapkan.

Jangan mengimplementasikan conflict engine kompleks di awal.

---

# 69. Testing Matrix

| Scenario               | Chrome Android | Safari iOS | Desktop |
| ---------------------- | -------------: | ---------: | ------: |
| Login online           |              ✅ |          ✅ |       ✅ |
| Dashboard online       |              ✅ |          ✅ |       ✅ |
| Redirect login         |              ✅ |          ✅ |       ✅ |
| Offline dashboard      |              ✅ |          ✅ |       ✅ |
| Read booking offline   |              ✅ |          ✅ |       ✅ |
| Create booking offline |              ✅ |          ✅ |       ✅ |
| Reconnect              |              ✅ |          ✅ |       ✅ |
| Auto sync              |              ✅ |          ✅ |       ✅ |
| Manual sync            |              ✅ |          ✅ |       ✅ |
| Failed sync            |              ✅ |          ✅ |       ✅ |
| Conflict               |              ✅ |          ✅ |       ✅ |

---

# 70. Definition of Done

Feature dianggap selesai apabila:

### Service Worker

```text
/admin/*
```

tidak lagi di-intercept oleh Service Worker.

### Authentication

Supabase authentication berjalan normal.

### Offline

User yang sudah melakukan initialization dapat:

```text
membuka admin
↓
melihat data tersimpan
↓
membuat booking
↓
menyimpan perubahan
↓
kembali online
↓
sinkronisasi
```

### iOS

Tidak terjadi lagi error:

```text
ERR_FAILED
```

pada flow login/dashboard yang disebabkan oleh interception Service Worker.

### Security

Tidak ada:

```text
password
access token
refresh token
service role key
```

yang disimpan ke IndexedDB.

---

# 71. Arsitektur Final yang Diinginkan

```text
                    MARGASERA ADMIN
                           │
             ┌─────────────┴─────────────┐
             │                           │
          ONLINE                       OFFLINE
             │                           │
             ▼                           ▼
        Supabase                     IndexedDB
             │                           │
             │                       Local Data
             │                           │
             │                      Sync Queue
             │                           │
             └───────────┬───────────────┘
                         │
                    Back Online
                         │
                         ▼
                  Sync to Supabase
                         │
                         ▼
                      Synced
```

Sementara:

```text
                 SERVICE WORKER
                       │
              ┌────────┴────────┐
              │                 │
         Static Assets        Public
              │                 │
            Cache             Cache
              
              /admin/*
                 │
               BYPASS
```

---

## 🎯 Prioritas implementasinya

Saya sangat menyarankan **jangan langsung mengerjakan seluruh offline system sekaligus**.

Urutannya:

```text
1. Fix Service Worker
        ↓
2. Pastikan iOS stabil
        ↓
3. IndexedDB
        ↓
4. Offline read
        ↓
5. Offline booking
        ↓
6. Sync queue
        ↓
7. Conflict handling
```

Dengan begitu kalau setelah Phase 1 iPhone sudah tidak `ERR_FAILED`, kita tahu akar masalahnya. Setelah itu baru kita bangun offline mode yang benar.

**Inti perubahan dari sistemmu sekarang:** Service Worker yang saat ini cukup kompleks—termasuk fallback dashboard dan caching RSC—dipangkas menjadi layer asset saja; data offline dipindahkan ke IndexedDB, sementara Supabase tetap menjadi source of truth. Ini juga membuat arsitekturnya lebih sederhana dan lebih mudah dirawat. 

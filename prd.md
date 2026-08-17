# PRODUCT REQUIREMENTS DOCUMENT (PRD)

## Website Marga Sera Photography

**Brand:** Marga Sera Photography
**Instagram:** @margasera.id
**Website:** margasera.id
**Platform:** Web Responsive
**Frontend:** Next.js + React + TypeScript
**Backend:** Supabase
**Database:** PostgreSQL
**Storage:** Supabase Storage
**Deployment:** Vercel

---

# 1. Ringkasan Produk

Website Marga Sera Photography merupakan platform digital untuk menampilkan portofolio photography sekaligus menyediakan sistem **booking photography berbasis tanggal**.

Website memiliki dua area utama:

1. **Public Website**
2. **Admin Dashboard**

Fokus utama website:

> **Portfolio → Availability → Booking → Booking Status**

Website harus memiliki karakter visual yang sesuai dengan brand photography Marga Sera: **premium, cinematic, editorial, minimal, elegan, dan photography-first**.

Website tidak boleh terasa seperti template bisnis biasa atau SaaS dashboard.

---

# 2. Tujuan Website

Website dibuat untuk:

* Menampilkan karya photography Marga Sera.
* Memperkenalkan layanan dan paket photography.
* Memberikan informasi kontak dan lokasi.
* Menampilkan tanggal yang tersedia untuk booking.
* Memungkinkan calon pelanggan melakukan pemesanan.
* Memberikan kode booking kepada pelanggan.
* Memungkinkan pelanggan mengecek status booking.
* Memudahkan admin mengelola kalender dan booking.
* Menjadi pusat informasi resmi Marga Sera di luar Instagram.

---

# 3. Target Pengguna

## 3.1 Calon Customer

Pengguna yang ingin:

* Melihat hasil photography.
* Mengetahui layanan.
* Melihat harga/paket.
* Mengecek tanggal tersedia.
* Melakukan booking.
* Mengecek status booking.

## 3.2 Admin Marga Sera

Admin yang bertugas:

* Mengelola portfolio.
* Mengelola layanan.
* Mengelola paket.
* Mengatur kalender.
* Mengelola booking.
* Mengubah status booking.
* Memblokir tanggal tertentu.

---

# 4. Struktur Website

Berdasarkan sitemap yang telah ditentukan:

```text
Marga Sera Photography
│
├── Halaman Utama
│   ├── Hero Sinematik
│   ├── Profil Singkat
│   └── Karya Unggulan
│
├── Portofolio
│   ├── Galeri Kategori
│   ├── Detail Project
│   └── Lightbox Penuh Layar
│
├── Layanan & Harga
│   ├── Daftar Paket
│   ├── Detail Layanan
│   └── Pilihan Kustom
│
├── Tentang & Kontak
│   ├── Cerita Fotografer
│   ├── Formulir Kontak
│   └── Lokasi & Madura
│
├── Kalender Ketersediaan
│   ├── Tampilan Kalender
│   ├── Filter Tanggal
│   └── Informasi Status
│
├── Pemesanan
│   ├── Alur Bertahap
│   ├── Isi Data Pelanggan
│   └── Ringkasan & Konfirmasi
│
├── Status Booking
│   ├── Input Kode
│   ├── Tahapan Status
│   └── Notifikasi Perubahan
│
└── Admin Dashboard
    ├── Login Admin
    ├── Manajemen Kalender
    └── Manajemen Booking
```

---

# 5. HALAMAN UTAMA

Route:

`/`

## Hero Sinematik

Hero merupakan bagian paling visual dari website.

Komponen:

* Foto utama/fullscreen.
* Nama Marga Sera.
* Tagline.
* CTA Portfolio.
* CTA Booking.

Contoh:

**MARGA SERA**

*Photography & Visual Stories*

`VIEW OUR WORK`

`BOOK A SESSION`

Hero menggunakan animasi yang halus dan tidak mengganggu foto.

---

## Profil Singkat

Menampilkan deskripsi singkat mengenai Marga Sera.

Tujuan:

* Membangun identitas brand.
* Memberikan konteks kepada pengunjung.
* Mengarahkan pengguna ke halaman About.

---

## Karya Unggulan

Menampilkan karya photography terbaik.

Setiap karya memiliki:

* Cover image.
* Judul.
* Kategori.
* Lokasi/tahun.
* Link ke detail project.

---

# 6. PORTOFOLIO

Route:

`/work`

## Galeri Kategori

Kategori dapat disesuaikan dengan layanan Marga Sera, misalnya:

* Wedding
* Pre-Wedding
* Couple
* Graduation
* Portrait
* Family
* Event

Kategori harus dapat dikelola melalui Admin.

---

## Detail Project

Route:

`/work/[slug]`

Isi:

* Judul project.
* Kategori.
* Lokasi.
* Tanggal.
* Deskripsi.
* Gallery photography.

Layout menggunakan pendekatan editorial.

Foto dapat ditampilkan:

* Full width.
* Two-column.
* Portrait.
* Landscape.
* Asymmetric layout.

---

## Lightbox Penuh Layar

Ketika user memilih foto:

* Foto dibuka fullscreen.
* Bisa next/previous.
* Bisa ditutup.
* Mendukung gesture mobile.
* Tidak melakukan reload halaman.

---

# 7. LAYANAN & HARGA

Route:

`/services`

## Daftar Paket

Menampilkan seluruh paket photography yang tersedia.

Contoh:

### Basic

* Durasi.
* Jumlah fotografer.
* Jumlah foto.
* Editing.
* Digital delivery.

### Signature

Paket utama/rekomendasi.

### Premium

Paket dengan layanan paling lengkap.

Harga dan informasi paket **tidak boleh hard-coded**.

Semua berasal dari Supabase.

---

## Detail Layanan

Setiap layanan mempunyai:

* Nama.
* Deskripsi.
* Foto.
* Durasi.
* Paket terkait.
* Harga mulai jika tersedia.

---

## Pilihan Kustom

Customer dapat memilih kebutuhan khusus jika layanan tidak sesuai dengan paket standar.

Contoh:

* Tambahan jam.
* Tambahan fotografer.
* Lokasi khusus.
* Permintaan khusus.

Permintaan kustom masuk ke data booking sebagai catatan.

---

# 8. TENTANG & KONTAK

Route:

`/about`

## Cerita Fotografer

Menampilkan:

* Profil Marga Sera.
* Cerita brand.
* Filosofi photography.
* Pengalaman.

Gunakan storytelling singkat dan visual.

---

## Formulir Kontak

Field:

* Nama.
* WhatsApp.
* Email.
* Subjek.
* Pesan.

---

## Lokasi & Madura

Menampilkan:

* Area layanan.
* Lokasi.
* Informasi kontak.
* Instagram.
* WhatsApp.

---

# 9. KALENDER KETERSEDIAAN

Route:

`/availability`

Ini merupakan salah satu fitur utama website.

## Tampilan Kalender

User dapat melihat:

* Bulan.
* Tanggal.
* Status ketersediaan.

Status:

🟢 Available
🟡 Almost Full
🔴 Booked
⚫ Blocked

---

## Filter Tanggal

User dapat:

* Memilih bulan.
* Memilih tanggal.
* Melihat status tanggal.

---

## Informasi Status

Ketika tanggal diklik:

### Available

> Tanggal tersedia untuk booking.

CTA:

`BOOK THIS DATE`

### Almost Full

> Slot pada tanggal ini terbatas.

CTA:

`CHECK AVAILABILITY`

### Booked

> Tanggal telah penuh.

Tidak dapat melakukan booking.

### Blocked

> Tanggal tidak tersedia.

Tidak dapat melakukan booking.

---

# 10. PEMESANAN

Route:

`/booking`

Sistem booking menggunakan proses bertahap.

## Step 1 — Pilih Tanggal

Customer memilih tanggal yang tersedia.

Tanggal booked/blocked tidak dapat dipilih.

---

## Step 2 — Pilih Layanan

Contoh:

* Wedding.
* Pre-Wedding.
* Couple.
* Graduation.
* Portrait.
* Event.

---

## Step 3 — Pilih Paket

Menampilkan paket berdasarkan layanan.

---

## Step 4 — Isi Data Pelanggan

Field:

* Nama lengkap.
* Nomor WhatsApp.
* Email.
* Lokasi.
* Jenis acara.
* Catatan.

---

## Step 5 — Ringkasan

Tampilkan:

```text
Nama
Tanggal
Layanan
Paket
Lokasi
Durasi
Harga
Catatan
```

Customer dapat kembali untuk memperbaiki data.

---

## Step 6 — Konfirmasi

Setelah booking dikirim:

Sistem menghasilkan:

**Booking Code**

Contoh:

`MS-260829-001`

Tampilkan:

> Booking berhasil dikirim.
> Tim Marga Sera akan menghubungi Anda untuk konfirmasi.

---

# 11. STATUS BOOKING

Route:

`/booking/status`

Customer memasukkan:

`Booking Code`

Contoh:

`MS-260829-001`

---

## Tahapan Booking

```text
Booking Diterima
       ↓
Sedang Ditinjau
       ↓
Dikonfirmasi
       ↓
Pembayaran
       ↓
Session
       ↓
Selesai
```

Status yang digunakan:

* Pending.
* Confirmed.
* Cancelled.
* Completed.

---

## Notifikasi Perubahan

Jika status berubah, customer dapat memperoleh informasi terbaru pada halaman status booking.

Notifikasi lanjutan dapat dikembangkan menggunakan:

* WhatsApp.
* Email.
* Push notification.

---

# 12. ADMIN DASHBOARD

Route:

`/admin`

Admin Dashboard digunakan untuk mengelola seluruh data website yang berkaitan dengan booking dan konten.

---

# 13. LOGIN ADMIN

Route:

`/admin/login`

Gunakan:

**Supabase Authentication**

Admin dapat login menggunakan:

* Email.
* Password.

Halaman admin tidak boleh dapat diakses oleh user biasa.

---

# 14. MANAJEMEN KALENDER

Admin dapat:

* Melihat kalender.
* Melihat booking.
* Menandai tanggal booked.
* Memblokir tanggal.
* Membuka kembali tanggal.
* Mengubah status tanggal.
* Melihat detail booking berdasarkan tanggal.

Contoh:

```text
29 August

09:00 - 13:00
Wedding Photography
Ahmad
CONFIRMED
```

---

# 15. MANAJEMEN BOOKING

Admin dapat:

* Melihat seluruh booking.
* Melihat detail booking.
* Mengubah status.
* Mengubah jadwal.
* Membatalkan booking.
* Menambahkan booking secara manual.
* Melihat informasi customer.

Filter:

* Pending.
* Confirmed.
* Cancelled.
* Completed.
* Berdasarkan tanggal.
* Berdasarkan layanan.

---

# 16. DATABASE SUPABASE

Gunakan PostgreSQL melalui Supabase.

## profiles

```text
id
name
email
role
created_at
updated_at
```

Role:

```text
admin
staff
```

---

## services

```text
id
name
slug
description
image_url
is_active
created_at
updated_at
```

---

## packages

```text
id
service_id
name
slug
description
price
duration
features
is_active
created_at
updated_at
```

---

## gallery_projects

```text
id
title
slug
category
description
location
event_date
cover_image
is_featured
created_at
updated_at
```

---

## gallery_images

```text
id
project_id
image_url
alt_text
sort_order
created_at
```

---

## availability

```text
id
date
status
notes
created_at
updated_at
```

Status:

```text
available
almost_full
booked
blocked
```

---

## bookings

```text
id
booking_code
customer_name
whatsapp
email
service_id
package_id
booking_date
start_time
end_time
location
notes
status
created_at
updated_at
```

Status:

```text
pending
confirmed
cancelled
completed
```

---

# 17. RELASI DATABASE

```text
services
    │
    └── packages

gallery_projects
    │
    └── gallery_images

services
    │
    └── bookings
             │
             └── packages

availability
    │
    └── booking_date

profiles
    │
    └── admin/staff
```

---

# 18. SECURITY

Gunakan Supabase Row Level Security.

Public:

* Dapat membaca layanan aktif.
* Dapat membaca paket aktif.
* Dapat membaca portfolio published.
* Dapat membaca availability.
* Dapat membuat booking.

Public tidak boleh:

* Membaca booking orang lain.
* Mengubah booking.
* Menghapus booking.
* Membaca data customer lain.
* Mengakses admin.

Admin:

* CRUD portfolio.
* CRUD layanan.
* CRUD paket.
* CRUD availability.
* CRUD booking.

Supabase Service Role Key tidak boleh dikirim ke client/browser.

---

# 19. UI/UX

Karakter desain:

**Cinematic + Editorial + Minimal + Premium**

Prioritas:

1. Photography.
2. Visual storytelling.
3. Typography.
4. Whitespace.
5. Mobile experience.
6. Booking experience.

Gunakan:

* Large imagery.
* Editorial typography.
* Smooth transitions.
* Subtle hover.
* Image reveal.
* Elegant page transitions.

Hindari:

* Terlalu banyak card.
* Gradient berlebihan.
* Warna mencolok.
* UI SaaS.
* Animasi berlebihan.
* Shadow berlebihan.

---

# 20. RESPONSIVE DESIGN

Website harus optimal untuk:

* Mobile.
* Tablet.
* Laptop.
* Desktop.
* Large screen.

Mobile bukan sekadar versi desktop yang diperkecil.

Booking dan kalender harus nyaman digunakan dengan touchscreen.

---

# 21. PERFORMANCE

Gunakan:

* Next.js Image.
* Responsive image.
* Lazy loading.
* WebP/AVIF.
* Blur placeholder.
* CDN.
* Server Components.

Target:

```text
Performance       90+
Accessibility     90+
Best Practices    90+
SEO               90+
```

---

# 22. SEO

Implementasikan:

* Dynamic metadata.
* Open Graph.
* Sitemap.
* Robots.txt.
* Canonical URL.
* Structured data.
* Image alt text.

Setiap project photography memiliki metadata sendiri.

---

# 23. TEKNOLOGI

```text
Next.js
React
TypeScript
Tailwind CSS
Motion
Supabase
PostgreSQL
Supabase Auth
Supabase Storage
Supabase Realtime
FullCalendar
Zod
Vercel
```

Tidak menggunakan backend terpisah.

---

# 24. STRUKTUR FOLDER

```text
app/
├── page.tsx
├── work/
├── services/
├── about/
├── availability/
├── booking/
├── contact/
└── admin/

components/
├── navigation/
├── hero/
├── gallery/
├── services/
├── calendar/
├── booking/
├── status/
└── admin/

lib/
├── supabase/
├── booking/
├── availability/
└── utils/

types/

public/
```

---

# 25. PRIORITAS MVP

## P0 — Wajib

* Homepage.
* Portfolio.
* Detail portfolio.
* Layanan.
* Paket.
* Kalender availability.
* Booking.
* Booking code.
* Status booking.
* Admin login.
* Admin calendar.
* Admin booking management.
* Supabase database.
* RLS.
* Responsive design.

## P1 — Setelah MVP

* WhatsApp integration.
* Email notification.
* Realtime availability.
* Gallery management.
* Analytics.

## P2 — Pengembangan Lanjutan

* Payment gateway.
* Invoice.
* Customer account.
* Push notification.
* Review/testimonial.
* Advanced reporting.

---

# 26. USER JOURNEY UTAMA

```text
Instagram
   ↓
Website Marga Sera
   ↓
Homepage
   ↓
Portfolio
   ↓
Detail Karya
   ↓
Layanan & Harga
   ↓
Kalender Ketersediaan
   ↓
Pilih Tanggal
   ↓
Pilih Layanan
   ↓
Pilih Paket
   ↓
Isi Data
   ↓
Konfirmasi
   ↓
Booking Code
   ↓
Status Booking
```

---

# 27. ADMIN JOURNEY

```text
Admin Login
    ↓
Dashboard
    ↓
Calendar
    ↓
Lihat Booking
    ↓
Review Customer
    ↓
Confirm Booking
    ↓
Tanggal otomatis menjadi BOOKED
    ↓
Customer melihat status CONFIRMED
```

---

# 28. KESIMPULAN

Marga Sera Photography Website bukan hanya website portfolio.

Produk ini merupakan:

> **Premium Photography Portfolio + Availability Calendar + Booking Management System**

Pengalaman utama yang harus dirasakan pengguna:

**"Saya melihat karya → saya percaya dengan fotografernya → saya melihat tanggal tersedia → saya bisa langsung booking."**

Seluruh sistem harus tetap mengutamakan identitas visual Marga Sera dan tidak membuat fitur booking menghilangkan kesan premium dari brand photography.

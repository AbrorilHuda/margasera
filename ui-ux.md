Siap bro. Saya buatkan PRD-nya dengan arah **redesign UI Margasera tanpa rewrite total**, berdasarkan evaluasi sebelumnya: dari sekitar **84/100** diarahkan menjadi pengalaman yang lebih **cinematic, editorial, premium, dan conversion-focused**, terutama di mobile.

# PRD — Margasera Photography UI/UX Redesign

**Project:** Margasera Photography
**Website:** margasera.id
**Platform:** Web Responsive + PWA
**Stack:** Next.js + React + Tailwind CSS + Supabase
**Status:** Planning
**Target:** UI/UX Redesign & Visual Refinement
**Design Direction:** Cinematic Editorial Photography

---

# 1. Ringkasan

Margasera Photography merupakan website photography studio yang digunakan untuk:

* memperkenalkan brand
* menampilkan portfolio
* menampilkan layanan dan paket
* menampilkan testimonial
* mengecek ketersediaan tanggal
* melakukan booking
* mengecek status booking

Website saat ini sudah memiliki fondasi fitur yang cukup lengkap.

Redesign **tidak bertujuan mengganti seluruh sistem**, tetapi meningkatkan kualitas visual dan pengalaman pengguna agar Margasera memiliki karakter yang lebih:

> **Premium · Cinematic · Editorial · Emotional · Modern**

Fokus utama redesign:

1. Visual photography menjadi pusat pengalaman.
2. Mengurangi ketergantungan pada card UI.
3. Memperkuat typography dan whitespace.
4. Membuat portfolio lebih editorial.
5. Memperjelas conversion path menuju booking.
6. Memperkuat testimonial/social proof.
7. Memprioritaskan mobile experience.
8. Menambahkan motion yang halus dan tidak berlebihan.
9. Mempertahankan fitur existing.
10. Tidak melakukan over-engineering.

---

# 2. Problem Statement

Website saat ini sudah memiliki konten dan fitur yang cukup lengkap, tetapi masih dapat ditingkatkan pada:

### Visual Hierarchy

Beberapa informasi memiliki bobot visual yang terlalu mirip sehingga user harus membaca lebih banyak untuk memahami prioritas halaman.

### Photography Presentation

Foto merupakan produk utama Margasera, sehingga visual portfolio harus mendapatkan porsi yang lebih dominan.

### Conversion

User perlu diarahkan lebih jelas dari:

```text
Discover
   ↓
Explore Portfolio
   ↓
Check Availability
   ↓
Booking
```

### Mobile Experience

Website harus diperlakukan sebagai **mobile-first photography experience**, bukan sekadar desktop layout yang dibuat responsive.

### Social Proof

Testimonial perlu memiliki presentation yang lebih kuat agar tidak sekadar menjadi section tambahan.

---

# 3. Design Goal

Redesign harus membuat user merasakan:

> **"Ini brand photography yang serius dan premium."**

dalam beberapa detik pertama setelah membuka website.

User tidak boleh merasa seperti sedang membuka:

```text
website jasa biasa
```

melainkan:

```text
photography studio / editorial portfolio
```

---

# 4. Design Principles

## 4.1 Photography First

Foto adalah elemen UI utama.

Prioritas:

```text
Photo
>
Typography
>
Story
>
UI Components
```

---

## 4.2 Less UI, More Content

Kurangi:

* card berlebihan
* border berlebihan
* container terlalu banyak
* button yang terlalu banyak
* section yang terlalu padat

Gunakan whitespace sebagai bagian dari desain.

---

## 4.3 Editorial Layout

Portfolio harus memiliki rasa seperti:

* photography magazine
* editorial
* gallery
* visual storytelling

Bukan katalog produk biasa.

---

## 4.4 Premium Through Simplicity

Premium tidak harus berarti:

* gradient berlebihan
* animasi berat
* efek glassmorphism
* shadow besar
* layout kompleks

Gunakan:

* whitespace
* typography
* image scale
* alignment
* hierarchy
* subtle motion

---

# 5. Target User

## Primary

### Calon Client

Orang yang mencari jasa:

* Wedding Photography
* Pre-Wedding
* Engagement
* Graduation
* Sidang
* Siraman
* Tasyakuran
* Event photography

---

## Secondary

### Existing Client

Digunakan untuk:

* cek booking
* melihat jadwal
* tracking booking
* komunikasi terkait layanan

---

# 6. Information Architecture

Struktur utama:

```text
HOME
│
├── PORTFOLIO
│   ├── Wedding
│   ├── Engagement
│   ├── Pre-Wedding
│   ├── Graduation
│   └── Other Stories
│
├── SERVICES
│   ├── Services
│   └── Packages
│
├── AVAILABILITY
│
├── BOOKING
│
├── BOOKING STATUS
│
└── ABOUT / STORY
```

Jangan menambahkan halaman baru hanya untuk mengikuti PRD jika kontennya belum dibutuhkan.

---

# 7. Homepage Redesign

Struktur homepage baru:

```text
01 HERO
      ↓
02 FEATURED STORIES
      ↓
03 BRAND STORY
      ↓
04 SERVICES
      ↓
05 SELECTED STORIES
      ↓
06 TESTIMONIAL
      ↓
07 AVAILABILITY
      ↓
08 FINAL CTA
      ↓
09 FOOTER
```

---

# 8. Section 01 — Hero

## Objective

Membuat first impression kuat dalam 3–5 detik.

## Layout

Desktop:

```text
┌───────────────────────────────────────┐
│ MARGASERA                       MENU  │
│                                       │
│                                       │
│             HERO IMAGE                │
│                                       │
│                                       │
│ Photography Studio                    │
│ Moment Satu Hari                      │
│ Untuk Selamanya.                      │
│                                       │
│ [ Explore Stories ] [ Check Date ]    │
└───────────────────────────────────────┘
```

Mobile:

```text
┌─────────────────────┐
│ MARGASERA       ☰   │
│                     │
│                     │
│    HERO IMAGE       │
│                     │
│ Photography Studio  │
│ Moment Satu Hari    │
│ Untuk Selamanya.    │
│                     │
│ [ Explore ]         │
│ [ Check Availability]
└─────────────────────┘
```

## Content

Primary:

> **Moment Satu Hari Untuk Selamanya.**

Secondary:

> Photography Studio · Pamekasan · Madura

CTA:

> Explore Stories

Secondary CTA:

> Check Availability

---

# 9. Hero Requirements

* Hero image harus berkualitas tinggi.
* Gunakan image yang merepresentasikan style Margasera.
* Hindari terlalu banyak teks.
* Hindari carousel hero.
* Jangan menggunakan autoplay video jika memperburuk performance.
* Gunakan subtle entrance animation.
* CTA harus terlihat tanpa scrolling pada mobile.

---

# 10. Section 02 — Featured Stories

Portfolio menjadi salah satu section terbesar di homepage.

Heading:

> **Selected Stories**

Subheading:

> Moments we've had the privilege to capture.

Layout desktop:

```text
┌──────────────────────────┐
│                          │
│       LARGE IMAGE        │
│                          │
└──────────────────────────┘

WEDDING
Arya & Nadia
Toba Heritage Resort

View Story →
```

Kemudian:

```text
┌─────────────┐ ┌────────────────────┐
│             │ │                    │
│    IMAGE    │ │       IMAGE        │
│             │ │                    │
└─────────────┘ └────────────────────┘
```

Gunakan variasi ukuran image.

---

# 11. Portfolio Card Redesign

Kurangi card tradisional.

### Jangan:

```text
┌─────────────────┐
│ image           │
├─────────────────┤
│ title           │
│ description     │
│ button          │
└─────────────────┘
```

### Gunakan:

```text
IMAGE

WEDDING
Arya & Nadia

Toba Heritage Resort
```

Button cukup berupa:

> View Story →

---

# 12. Portfolio Filter

Kategori tetap tersedia:

```text
All
Wedding
Engagement
Pre-Wedding
Graduation
Sidang
Siraman
Tasyakuran
```

Desktop:

```text
ALL   WEDDING   ENGAGEMENT   PRE-WEDDING   GRADUATION
```

Mobile:

Gunakan horizontal scroll:

```text
← All | Wedding | Engagement | Pre-Wedding →
```

Jangan menggunakan dropdown jika horizontal filter masih nyaman digunakan.

---

# 13. Portfolio Detail

Portfolio detail harus terasa seperti visual story.

Struktur:

```text
PROJECT HERO
      ↓
PROJECT INFORMATION
      ↓
THE STORY
      ↓
PHOTO SEQUENCE
      ↓
PHOTO GRID
      ↓
FINAL IMAGE
      ↓
NEXT STORY
```

Contoh:

```text
WEDDING

Arya & Nadia
Toba Heritage Resort
12 May 2026
```

Kemudian foto besar.

---

# 14. Gallery Experience

Tambahkan:

* fullscreen image
* swipe mobile
* keyboard navigation desktop
* next/previous
* close
* image counter

Contoh:

```text
                    03 / 18

             ┌──────────────┐
             │              │
             │     PHOTO    │
             │              │
             └──────────────┘

                 ←       →
```

---

# 15. Section 03 — Brand Story

Tujuan:

Memberikan emotional connection.

Layout:

```text
IMAGE                  STORY

                       MARGASERA

                       Kami percaya
                       setiap momen...
```

Copy harus pendek.

Jangan membuat section "About Us" terlalu panjang.

Target:

**50–100 kata maksimal.**

---

# 16. Section 04 — Services

Layanan ditampilkan lebih editorial.

Contoh:

```text
01
WEDDING

Capturing the emotions,
people and details
that make your day yours.

Explore →
```

Kemudian:

```text
02
PRE-WEDDING
```

```text
03
ENGAGEMENT
```

```text
04
GRADUATION
```

---

# 17. Services Interaction

Desktop:

* hover image
* subtle image scale
* text transition

Mobile:

* no hover dependency
* tap interaction
* natural scrolling

---

# 18. Packages

Packages tetap dipertahankan sebagai fitur.

Namun jangan membuat homepage penuh dengan pricing card.

Gunakan:

```text
Wedding
Starting from ...

View Packages →
```

Detail pricing tetap di halaman/package section.

---

# 19. Section 05 — Selected Stories

Section ini dapat menampilkan project terbaik berdasarkan:

* visual quality
* kategori
* recent project
* featured project

Jangan menampilkan terlalu banyak.

Target:

**3–6 project.**

---

# 20. Section 06 — Testimonials

Redesign testimonial menjadi lebih personal.

Contoh:

```text
★★★★★

"Foto-fotonya benar-benar menangkap
suasana hari itu..."

— Wulantika

Graduation Session
```

Jika tersedia:

* foto client
* nama
* jenis session
* tanggal/project

---

# 21. Testimonial Layout

Desktop:

```text
        ★★★★★

"Quote testimonial..."

       Client Name
       Wedding

←                         →
```

Mobile:

```text
★★★★★

"Quote..."

Client Name
Wedding

● ○ ○
```

---

# 22. Social Proof

Jika jumlah testimonial sudah cukup:

```text
★★★★★ 4.9/5

Based on verified client reviews
```

Jangan menonjolkan angka review jika jumlahnya masih terlalu kecil.

Prioritaskan **quality of testimonial**.

---

# 23. Section 07 — Availability

Tujuan:

Membantu user mengambil keputusan.

Heading:

> **Is Your Date Available?**

Subheading:

> Check our availability before making your booking.

CTA:

> Check Availability

Jangan membuat calendar terlalu besar di homepage.

Calendar adalah **functional tool**, bukan hero visual.

---

# 24. Availability Page

Flow:

```text
Choose Service
      ↓
Choose Date
      ↓
Availability
      ↓
Choose Package
      ↓
Booking
```

Status tanggal:

```text
Available
Limited
Booked
```

Gunakan warna dan label yang accessible.

---

# 25. Section 08 — Final CTA

Tujuan:

Mengubah visitor menjadi calon customer.

Contoh:

```text
YOUR STORY DESERVES
TO BE REMEMBERED.

Ready to create something
meaningful?

[ Book Margasera ]
```

CTA utama:

> Book Margasera

Secondary:

> WhatsApp Us

---

# 26. Navigation

## Desktop

Minimal:

```text
Margasera

Portfolio
Services
Availability

                    Book Now
```

Booking menjadi CTA.

---

## Mobile

```text
Margasera                     ☰
```

Menu:

```text
Portfolio
Services
Availability
Booking Status

────────────

Book Margasera
```

---

# 27. Sticky Mobile CTA

Tambahkan sticky bottom CTA pada halaman penting:

```text
┌────────────────────────────┐
│ Check Date    │ Book Now   │
└────────────────────────────┘
```

Tetapi:

* jangan tampil di login
* jangan tampil di admin
* jangan menutupi konten
* gunakan safe-area iOS

CSS harus mempertimbangkan:

```css
padding-bottom: env(safe-area-inset-bottom);
```

---

# 28. Typography

Gunakan typography hierarchy yang kuat.

Contoh:

```text
Display
64–96px desktop

Heading
40–56px

Subheading
20–24px

Body
16–18px

Metadata
12–14px
```

Mobile:

```text
Display
40–52px

Heading
32–40px

Body
15–17px
```

Jangan menggunakan terlalu banyak font family.

Ideal:

```text
1 display font
+
1 body font
```

atau satu font family dengan beberapa weight.

---

# 29. Color System

Pertahankan identitas brand yang sudah ada.

Gunakan:

```text
Primary
Secondary
Background
Surface
Text
Muted
Border
Success
Warning
Error
```

Namun desain harus lebih banyak menggunakan:

```text
neutral
white/black
brand accent
```

daripada warna dekoratif berlebihan.

---

# 30. Image Treatment

Photography menjadi fokus utama.

Gunakan:

* aspect ratio konsisten
* high-quality image
* responsive image
* lazy loading
* blur placeholder
* optimized formats
* focal point yang benar

Hindari gambar terlalu kecil.

---

# 31. Animation

Animation harus:

> subtle, slow, purposeful.

Gunakan:

* fade
* translate
* scale ringan
* image reveal
* smooth navigation

Jangan menggunakan:

* bounce
* excessive parallax
* spinning
* animation setiap element
* loading animation yang lama

---

# 32. Scroll Experience

Website harus terasa seperti storytelling:

```text
Hero
 ↓
Image
 ↓
Story
 ↓
Image
 ↓
Service
 ↓
Testimonial
 ↓
Booking
```

Gunakan whitespace untuk menciptakan pacing.

---

# 33. Mobile-First

Mobile bukan versi kecil dari desktop.

Prioritas:

1. image
2. readable typography
3. touch target
4. CTA
5. scroll experience

Minimum touch target:

```text
44 × 44 px
```

---

# 34. Accessibility

Target minimal:

* WCAG AA
* sufficient contrast
* keyboard navigation
* focus state
* alt text
* semantic HTML
* aria-label jika diperlukan
* reduced motion support

Tambahkan:

```css
@media (prefers-reduced-motion: reduce) {
  ...
}
```

---

# 35. Performance

Redesign tidak boleh menyebabkan performance turun.

Target:

```text
LCP < 2.5s
CLS < 0.1
INP < 200ms
```

Prioritaskan:

* Next/Image
* responsive images
* WebP/AVIF
* lazy loading
* preload hero image
* minimize JS
* minimize animation
* avoid unnecessary dependencies

---

# 36. SEO

UI redesign tidak boleh merusak SEO.

Pertahankan:

* metadata
* canonical
* sitemap
* robots
* structured data
* semantic heading
* image alt
* Open Graph
* Twitter/X metadata

Heading harus tetap terstruktur:

```text
H1
 ├── H2
 │    └── H3
 ├── H2
 └── H2
```

---

# 37. WhatsApp Integration

WhatsApp tetap menjadi conversion channel.

CTA:

```text
Chat via WhatsApp
```

Pesan dapat diprefill:

```text
Halo Margasera, saya ingin menanyakan
ketersediaan untuk [tanggal].
```

---

# 38. Booking Flow

Target UX:

```text
Portfolio
    ↓
Check Availability
    ↓
Select Date
    ↓
Select Service
    ↓
Select Package
    ↓
Customer Information
    ↓
Review
    ↓
Submit Booking
```

Jangan memaksa user membuat akun jika tidak diperlukan.

---

# 39. Booking Status

Tetap pertahankan fitur:

> Cek Status Booking

Tetapi UI dibuat sederhana.

```text
Booking Code

[MGS-XXXX]

[ Check Status ]
```

Result:

```text
Booking #MGS-XXXX

Wedding Photography

12 October 2026

Status
● Confirmed
```

---

# 40. Responsive Breakpoints

Gunakan breakpoint berdasarkan kebutuhan layout, bukan device tertentu.

Minimal:

```text
Mobile
Tablet
Desktop
Large Desktop
```

Pastikan layout tidak rusak pada:

* 320px
* 375px
* 390px
* 414px
* 768px
* 1024px
* 1280px
* 1440px+

---

# 41. Admin Tidak Ikut Redesign Public

Redesign ini fokus:

```text
margasera.id
```

dan public booking experience.

Admin Control Center memiliki design system sendiri.

Namun komponen global seperti:

* typography
* color token
* spacing
* button
* form

boleh dibuat konsisten jika tidak mengganggu UX admin.

---

# 42. PWA Compatibility

Redesign public tidak boleh merusak:

* manifest
* Service Worker
* install prompt
* icons
* offline admin architecture

PWA tetap menjadi bagian dari ecosystem Margasera.

---

# 43. Design System

Buat token terpusat:

```text
colors
spacing
radius
typography
shadows
transitions
container
breakpoints
```

Contoh:

```ts
const spacing = {
  section: 'clamp(5rem, 10vw, 10rem)',
};
```

Tujuannya agar seluruh halaman memiliki rhythm yang konsisten.

---

# 44. Component Strategy

Prioritaskan reusable component:

```text
Hero
SectionHeading
PortfolioStory
PortfolioGrid
ServiceItem
Testimonial
AvailabilityCTA
BookingCTA
Footer
```

Jangan membuat component abstraction terlalu dalam.

Contoh:

❌

```text
BaseCard
→ InteractiveCard
→ EditorialCard
→ PortfolioCardWrapper
→ FeaturedPortfolioCard
```

Jika tidak dibutuhkan.

Lebih baik:

```text
PortfolioStory
```

yang sederhana.

---

# 45. Dark/Light

Jika brand saat ini menggunakan dark visual, pertahankan sebagai bagian identitas.

Namun jangan membuat seluruh halaman terlalu gelap jika mengurangi keterbacaan foto.

Gunakan:

```text
Dark Hero
Light Content
Dark Story
Light Portfolio
```

atau sebaliknya secara intentional.

Transisi antar section harus terasa natural.

---

# 46. CMS / Content

Pastikan admin dapat mengatur:

* featured portfolio
* portfolio category
* testimonial
* services
* packages
* hero content
* availability

tanpa developer harus mengubah source code.

Jika sistem existing sudah mendukungnya, **jangan membuat CMS baru**.

---

# 47. Analytics

Pertahankan analytics dan tambahkan event:

```text
hero_cta_click
portfolio_open
portfolio_category_select
portfolio_story_open
availability_open
availability_date_select
booking_start
booking_submit
whatsapp_click
testimonial_view
```

Tujuannya mengetahui bagian UI mana yang menghasilkan conversion.

---

# 48. A/B Testing

Tidak wajib pada fase pertama.

Jika traffic sudah cukup, test:

```text
Hero CTA
```

misalnya:

```text
Explore Stories
```

vs

```text
View Portfolio
```

Tetapi jangan melakukan banyak experiment sekaligus.

---

# 49. Implementation Phases

## Phase 1 — Design System

* typography
* colors
* spacing
* buttons
* links
* image styles
* motion

---

## Phase 2 — Navigation

* desktop navbar
* mobile menu
* booking CTA
* sticky mobile CTA

---

## Phase 3 — Homepage

Urutan:

```text
Hero
↓
Featured Stories
↓
Brand Story
↓
Services
↓
Testimonials
↓
Availability
↓
Final CTA
↓
Footer
```

---

## Phase 4 — Portfolio

* category filter
* editorial grid
* project detail
* gallery
* fullscreen
* mobile swipe

---

## Phase 5 — Services & Packages

* service layout
* package presentation
* pricing
* CTA

---

## Phase 6 — Booking

* availability
* booking flow
* review
* success state

---

## Phase 7 — Polish

* responsive
* animation
* accessibility
* performance
* SEO
* analytics

---

# 50. Testing

## Visual

Test:

* Chrome
* Safari
* Firefox
* Edge

## Mobile

Test:

* iPhone Safari
* Android Chrome

Minimal viewport:

```text
320
375
390
414
768
1024
1440
```

---

# 51. Acceptance Criteria

Redesign dianggap selesai apabila:

### Visual

* [ ] Photography menjadi visual utama.
* [ ] Hero memberikan first impression kuat.
* [ ] Card berlebihan dikurangi.
* [ ] Portfolio terasa editorial.
* [ ] Typography memiliki hierarchy jelas.
* [ ] Whitespace digunakan secara konsisten.
* [ ] Brand terasa premium dan modern.

### UX

* [ ] User memahami layanan dalam beberapa scroll.
* [ ] User dapat menemukan portfolio dengan mudah.
* [ ] User dapat menemukan availability.
* [ ] User dapat memulai booking dengan maksimal beberapa langkah.
* [ ] Booking CTA mudah ditemukan.
* [ ] Mobile navigation mudah digunakan.

### Performance

* [ ] Hero image optimized.
* [ ] Images lazy loaded jika bukan above-the-fold.
* [ ] Tidak ada animation berat.
* [ ] Core Web Vitals tidak mengalami regresi.

### Accessibility

* [ ] Keyboard navigation.
* [ ] Focus state.
* [ ] Contrast.
* [ ] Alt text.
* [ ] Reduced motion.

### Compatibility

* [ ] iPhone Safari.
* [ ] Android Chrome.
* [ ] Desktop Chrome.
* [ ] Desktop Safari.
* [ ] PWA tetap berfungsi.

---

# 52. Definition of Success

Redesign dianggap berhasil apabila pengalaman pengguna berubah dari:

```text
"Website jasa fotografi"
```

menjadi:

```text
"Photography brand dengan portfolio yang kuat
dan proses booking yang mudah."
```

User journey yang diharapkan:

```text
                    VISITOR
                       │
                       ▼
                  HERO IMAGE
                       │
                       ▼
                EXPLORE STORIES
                       │
                       ▼
                 VIEW PORTFOLIO
                       │
                       ▼
              "I LIKE THEIR WORK"
                       │
                       ▼
               CHECK AVAILABILITY
                       │
                       ▼
                   BOOK NOW
                       │
                       ▼
                   CLIENT
```

---

# 53. Prioritas Redesign

Kalau dikerjakan bertahap, prioritasnya:

| Prioritas | Area              | Dampak        |
| --------- | ----------------- | ------------- |
| 🔴 P0     | Hero              | Sangat tinggi |
| 🔴 P0     | Portfolio         | Sangat tinggi |
| 🔴 P0     | Mobile UX         | Sangat tinggi |
| 🔴 P0     | Booking CTA       | Sangat tinggi |
| 🟠 P1     | Typography        | Tinggi        |
| 🟠 P1     | Navigation        | Tinggi        |
| 🟠 P1     | Testimonials      | Tinggi        |
| 🟠 P1     | Availability      | Tinggi        |
| 🟡 P2     | Services          | Medium        |
| 🟡 P2     | Footer            | Medium        |
| 🟢 P3     | Micro interaction | Low/Medium    |

---

# 54. Target Design Score

Baseline evaluasi saat ini:

> **84/100**

Target setelah redesign:

> **90+/100**

Tetapi target tersebut **bukan sekadar membuat website lebih cantik**. Ukuran keberhasilannya adalah:

```text
Visual Quality
        +
Portfolio Experience
        +
Mobile UX
        +
Conversion
        +
Performance
        +
Accessibility
```

Dengan arah visual:

> **Cinematic Editorial Photography**

dan prinsip utama:

> **"Let the photography do the talking."**

---

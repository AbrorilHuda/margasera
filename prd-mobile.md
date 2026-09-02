Siap. Saya buatkan **PRD (Product Requirements Document)** untuk transformasi **Margasera Control Center menjadi Mobile PWA dengan iOS-inspired experience**, **tanpa mengubah desain desktop dan tablet yang sudah ada**.

Saya juga ubah naming seperti **“Ikhtisar & Stats”** menjadi gaya **semi-English yang konsisten dan lebih premium**.

---

# PRD — Margasera Control Center

## Mobile PWA iOS-Inspired Experience

### Product

**Margasera Control Center**

### Platform

* Existing Web Dashboard
* Mobile Web
* Progressive Web App (PWA)

### Scope

Transform pengalaman **mobile** menjadi lebih menyerupai aplikasi native bergaya iOS, tanpa melakukan redesign besar pada tampilan:

* Desktop
* Tablet

Identitas visual Margasera harus tetap dipertahankan.

---

# 1. Product Vision

Margasera Control Center adalah dashboard manajemen studio yang memungkinkan admin mengelola:

* Booking & pesanan
* Portfolio
* Layanan
* Paket & pricing
* Kalender availability
* Pengaturan studio

Target pengalaman mobile:

> **Terasa seperti aplikasi native yang nyaman digunakan setiap hari, tetapi tetap membawa identitas visual Margasera.**

Bukan:

```text
Website → diperkecil → mobile
```

Tetapi:

```text
Margasera Web System
        +
Responsive Layout
        +
Native Mobile Interaction
        =
Margasera PWA
```

---

# 2. Core Design Principle

## Preserve the Identity

Elemen berikut **harus tetap dipertahankan**:

* Brand color biru Margasera
* Typography existing
* Letter spacing pada section label
* Outline icon style
* Premium minimal appearance
* Card visual language
* Existing desktop layout

Mobile hanya mengubah:

* Navigation pattern
* Data presentation
* Interaction
* Animation
* Touch feedback
* Modal behavior

---

# 3. Responsive Strategy

## Desktop

```text
Width ≥ 1024px
```

Tidak ada perubahan signifikan.

Tetap menggunakan:

* Persistent sidebar
* Existing header
* Table layout
* Existing filters
* Existing dashboard structure

---

## Tablet

```text
768px – 1023px
```

Tampilan existing tetap dipertahankan.

Sidebar dapat:

* Persistent
* Collapsible

Bottom navigation tidak wajib ditampilkan.

---

## Mobile

```text
< 768px
```

Menggunakan **Mobile App Mode**.

Fitur khusus mobile:

* Compact header
* Drawer navigation
* Bottom navigation
* Bottom sheet
* Mobile cards/list
* Collapsible filters
* Touch feedback
* Safe area support

---

# 4. Naming System — Semi English

Naming harus terasa modern dan konsisten.

Gunakan pola:

> **English untuk fitur utama / navigation**
> **Indonesia untuk konteks bisnis yang lebih natural**

## Navigation

### Sebelum

```text
Ikhtisar & Stats
Pesanan & Booking
Manajemen Portfolio
Kategori Layanan
Paket & Harga Tarif
Kalender Ketersediaan
Pengaturan Studio
```

### Sesudah

```text
Overview
Booking & Orders
Portfolio
Services
Packages & Pricing
Availability Calendar
Studio Settings
```

Ini menurut saya lebih clean dan premium.

---

# Alternatif Semi-English yang lebih cocok dengan target Indonesia

Kalau kamu ingin tidak terlalu full English:

```text
Overview & Stats
Booking & Pesanan
Portfolio Management
Kategori Layanan
Packages & Pricing
Kalender Availability
Studio Settings
```

Namun saya lebih merekomendasikan **versi pertama**, karena lebih konsisten.

---

# 5. Dashboard Naming

### Sebelum

```text
IKHTISAR & RINGKASAN PERFORMA
```

### Sesudah

```text
DASHBOARD OVERVIEW
```

Atau:

```text
PERFORMANCE OVERVIEW
```

Rekomendasi saya:

# **DASHBOARD OVERVIEW**

Karena langsung jelas dan tidak terlalu panjang.

---

## Section naming

### Sebelum

```text
AKSI CEPAT MANAJEMEN STUDIO
```

### Sesudah

```text
QUICK ACTIONS
```

---

### Sebelum

```text
PESANAN TERBARU
```

### Sesudah

```text
RECENT BOOKINGS
```

Atau jika ingin tetap semi Indonesia:

```text
BOOKING TERBARU
```

Saya lebih pilih:

**RECENT BOOKINGS**

---

# 6. Mobile Navigation

Mobile menggunakan **Hybrid Navigation System**.

## Bottom Navigation

```text
┌──────────────────────────────────┐
│                                  │
│          PAGE CONTENT            │
│                                  │
├──────────────────────────────────┤
│                                  │
│   ⌂          ▣          +      ☰ │
│ Home       Booking      Add   Menu│
└──────────────────────────────────┘
```

### Navigation Items

| Icon          | Label   | Function               |
| ------------- | ------- | ---------------------- |
| Home          | Home    | Dashboard              |
| Calendar/List | Booking | Booking & Orders       |
| Plus          | Add     | Open Quick Actions     |
| Menu          | Menu    | Open Navigation Drawer |

---

## Add Button

Tombol `Add` membuka bottom sheet.

```text
╭───────────────────────────────╮
│             ━━━━━             │
│                               │
│          Add New              │
│                               │
├───────────────────────────────┤
│ 📅   New Booking              │
│                               │
│ 📁   Add Portfolio            │
│                               │
│ 📦   Add Package              │
│                               │
│ 🕒   Block Date               │
│                               │
╰───────────────────────────────╯
```

Bottom sheet dapat ditutup dengan:

* Swipe down
* Tap backdrop
* Close button jika diperlukan

---

# 7. Sidebar / Mobile Menu

Sidebar existing **tidak perlu diubah secara besar**.

Perubahan hanya pada behavior.

## Mobile Behavior

```text
Tap Menu
      ↓
Drawer slides from left
      ↓
Backdrop fades + slight blur
      ↓
User selects menu
      ↓
Drawer closes
      ↓
Page transition
```

Durasi animasi:

```text
200ms – 300ms
```

Gunakan spring animation yang halus.

---

# 8. Mobile Header

Header harus lebih compact dibanding versi sekarang.

## Recommended Layout

```text
┌──────────────────────────────┐
│ ☰                            │
│                              │
│ MARGASERA CONTROL            │
│ Dashboard Overview       🌙  │
└──────────────────────────────┘
```

Atau lebih compact:

```text
┌──────────────────────────────┐
│ ☰     Dashboard Overview  🌙 │
│       Margasera Control       │
└──────────────────────────────┘
```

### Mobile Header Rules

* Jangan terlalu tinggi
* Maksimal 2 level hierarchy
* Logout tidak ditampilkan di header
* Primary action tidak terlalu banyak
* Dark mode tetap tersedia

---

# 9. Dashboard Mobile Layout

Urutan:

```text
HEADER
   ↓
DASHBOARD OVERVIEW
   ↓
SUMMARY CARDS
   ↓
PERFORMANCE CHART
   ↓
QUICK ACTIONS
   ↓
RECENT BOOKINGS
```

## Summary

Summary tetap menggunakan visual card Margasera.

Contoh:

```text
┌───────────────┐ ┌───────────────┐
│ TOTAL BOOKING │ │ TOTAL REVENUE │
│               │ │               │
│      24       │ │ Rp 12.500.000 │
└───────────────┘ └───────────────┘
```

Untuk layar kecil, gunakan:

* Horizontal scroll jika card lebih dari 2
* Atau grid 2 kolom

Jangan memaksakan terlalu banyak informasi dalam satu card.

---

# 10. Quick Actions

Section title:

```text
QUICK ACTIONS
```

Items:

```text
┌────────────────┬────────────────┐
│       📁       │       📦       │
│                │                │
│ Add Portfolio  │ Add Package    │
├────────────────┼────────────────┤
│       ＋       │       🕒       │
│                │                │
│ New Booking    │ Block Date     │
└────────────────┴────────────────┘
```

Setiap item:

* Entire card clickable
* Touch feedback
* Slight scale down saat tap

Interaction:

```text
scale: 1
↓
tap
↓
scale: 0.97
↓
release
↓
scale: 1
```

---

# 11. Booking & Orders — Mobile Experience

## Section Name

```text
BOOKING & ORDERS
```

Atau:

```text
BOOKING MANAGEMENT
```

Rekomendasi:

# **BOOKING & ORDERS**

---

## Booking Summary

Tetap berada di atas.

Contoh:

```text
BOOKING SUMMARY

[ All: 8 ] [ Pending: 0 ]

[ Confirmed: 5 ] [ Completed: 3 ]
```

Status dapat horizontal scroll:

```text
[ All ] [ Pending ] [ Confirmed ] [ Completed ]
```

Active state menggunakan biru khas Margasera.

---

# 12. Mobile Filter System

Filter existing:

```text
Filter Bulan
Filter Layanan
Urutkan
Tampilkan
Search
```

Jangan semuanya langsung memenuhi layar.

## Mobile Default

```text
┌──────────────────────────────┐
│ 🔍 Search booking...      ⚙️ │
└──────────────────────────────┘
```

Klik filter membuka bottom sheet:

```text
╭──────────────────────────────╮
│             ━━━━━            │
│                              │
│ Filter Booking        Reset  │
│                              │
│ Event Month                  │
│ [ All Months              › ]│
│                              │
│ Service                      │
│ [ All Services            › ]│
│                              │
│ Sort By                      │
│ [ Latest Booking          › ]│
│                              │
│ Show                         │
│ [ 10 per page             › ]│
│                              │
│                              │
│ [     Apply Filters       ]  │
╰──────────────────────────────╯
```

---

# 13. Export Action

Desktop:

```text
Export PDF
```

tetap seperti sekarang.

Mobile:

Export menjadi secondary action.

```text
┌──────────────────────────────┐
│ + New Booking             •••│
└──────────────────────────────┘
```

Klik `•••`:

```text
Export PDF
Export Excel
```

Jika hanya PDF:

```text
More Actions
↓
Export PDF
```

---

# 14. Table → Mobile Native List

## Desktop & Tablet

Tetap:

```text
TABLE
```

Tidak diubah.

---

## Mobile

Gunakan **grouped list / booking card**.

```text
RECENT BOOKINGS

╭──────────────────────────────╮
│ MS-260919-539              › │
│                              │
│ Aditya & Savira              │
│ Engagement                   │
│ Paket Standard               │
│                              │
│ 📅 19 September 2026         │
│                              │
│              ● Confirmed     │
╰──────────────────────────────╯
```

Card dapat di-tap untuk membuka detail.

---

# 15. Detail Booking

Saat booking dipilih:

```text
Tap Booking
      ↓
Card feedback
      ↓
Detail page / sheet opens
```

Layout:

```text
‹ Back

BOOKING DETAILS

MS-260919-539

CLIENT
Aditya & Savira
082271528005

SERVICE
Engagement
Paket Standard

EVENT DATE
19 September 2026

STATUS
● Confirmed

────────────────

[ Edit Booking ]

[ Cancel Booking ]
```

---

# 16. iOS-Inspired Interaction Rules

UI harus menggunakan prinsip:

## Touch Target

Minimum:

```text
44px × 44px
```

Untuk:

* Button
* Icon
* Navigation
* Close button

---

## Bottom Sheet

Harus memiliki:

```text
Drag Handle
Rounded Top Corners
Backdrop
Swipe to Close
```

Gunakan untuk:

* Add actions
* Filter
* Secondary actions
* Mobile forms sederhana

---

# 17. Animation System

Animasi tidak boleh berlebihan.

## Standard

### Button

```text
120ms – 180ms
```

### Navigation

```text
200ms – 250ms
```

### Drawer

```text
250ms – 300ms
```

### Bottom Sheet

Gunakan:

```text
Spring animation
```

---

## Animation Rules

Gunakan animasi untuk menjelaskan:

> Dari mana sebuah elemen datang, dan ke mana elemen tersebut pergi.

Contoh:

```text
Add Button
↓
Bottom Sheet muncul dari bawah
```

Bukan:

```text
Random fade
Random zoom
Random bounce
```

---

# 18. PWA Native Requirements

## App Shell

Saat PWA dibuka:

* Full-screen feel
* Tidak terasa seperti halaman browser
* Layout menggunakan safe area

Gunakan:

```css
min-height: 100dvh;
```

Dan:

```css
padding-bottom: env(safe-area-inset-bottom);
```

---

## Bottom Navigation

Bottom navigation harus fixed.

Konten diberikan:

```css
padding-bottom
```

agar tidak tertutup navbar.

---

## Safe Area

Support:

* Android gesture navigation
* iPhone home indicator
* Notch

---

# 19. Page Naming System

Final recommendation:

## Dashboard

```text
Dashboard Overview
```

## Sidebar

```text
Overview
Booking & Orders
Portfolio
Services
Packages & Pricing
Availability Calendar
Studio Settings
```

## Sections

```text
Performance Overview
Booking Summary
Quick Actions
Recent Bookings
Upcoming Events
Revenue Overview
Studio Activity
```

## Actions

```text
Add New
New Booking
Add Portfolio
Add Package
Block Date
Apply Filters
Reset Filters
View All
Export PDF
Edit Booking
Cancel Booking
```

---

# 20. Design Language

Margasera mobile harus terasa:

```text
PREMIUM
↓
CALM
↓
FAST
↓
TOUCH FRIENDLY
↓
NATIVE
```

Bukan:

```text
OVER-ANIMATED
TOO MANY CARDS
TOO MANY BORDERS
TOO MANY BUTTONS
```

---

# 21. Final UX Architecture

```text
MARGASERA CONTROL CENTER
│
├── Desktop
│   ├── Persistent Sidebar
│   ├── Existing Layout
│   ├── Tables
│   └── Existing Filters
│
├── Tablet
│   ├── Existing Layout
│   ├── Responsive Sidebar
│   └── Tables
│
└── Mobile PWA
    │
    ├── Compact Header
    │
    ├── Dashboard Overview
    │
    ├── Mobile Summary
    │
    ├── Performance Charts
    │
    ├── Quick Actions
    │
    ├── Native Booking Lists
    │
    ├── Bottom Navigation
    │
    ├── Navigation Drawer
    │
    └── Bottom Sheets
        ├── Add Actions
        ├── Filters
        └── More Actions
```

# Final Product Statement

> **Margasera Control Center tetap menjadi dashboard web premium di desktop dan tablet, tetapi pada mobile berubah menjadi pengalaman PWA yang terasa seperti aplikasi native: cepat, touch-friendly, memiliki bottom navigation, drawer, bottom sheet, dan transisi yang halus—tanpa kehilangan identitas visual Margasera.**

Menurut saya, naming **“Dashboard Overview”, “Booking & Orders”, “Packages & Pricing”, “Quick Actions”, dan “Recent Bookings”** paling cocok dengan style UI yang sudah kamu buat: masih mudah dipahami orang Indonesia, tapi terasa lebih profesional dan modern.

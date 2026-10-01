-- Notifications Schema
-- Jalankan di Supabase Dashboard → SQL Editor

-- Tabel notifikasi
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('booking', 'testimonial', 'gallery_selection')),
  title text not null,
  body text,
  booking_id uuid references bookings(id) on delete set null,
  url text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Index untuk query cepat notifikasi belum dibaca
create index if not exists notifications_is_read_idx on notifications(is_read);
create index if not exists notifications_created_at_idx on notifications(created_at desc);

-- Tabel FCM tokens (admin bisa multi-device)
create table if not exists fcm_tokens (
  id uuid primary key default gen_random_uuid(),
  token text unique not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================

-- 1. Aktifkan RLS di kedua tabel
alter table notifications enable row level security;
alter table fcm_tokens enable row level security;

-- 2. notifications: izinkan SELECT untuk anon & authenticated
--    Ini diperlukan agar Supabase Realtime (postgres_changes) bisa
--    subscribe dari browser admin tanpa service role key.
--    Aman karena:
--    - Notifikasi hanya berisi metadata (title, body, type), bukan data sensitif
--    - INSERT/UPDATE/DELETE tetap diblock (hanya service_role yang bisa via server)
create policy "notifications_public_read"
  on notifications
  for select
  to anon, authenticated
  using (true);

-- 3. fcm_tokens: TIDAK ada public read policy
--    Token FCM sensitif, hanya bisa diakses via service_role (server-side)
--    Tidak perlu policy = diblock by default

-- ============================================================
-- Enable Realtime untuk tabel notifications
-- Jalankan hanya jika belum pernah dijalankan sebelumnya
-- ============================================================
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table notifications;
  end if;
end $$;

-- ================================================================
-- REAL DATABASE DUMP FROM SUPABASE (URL: https://vibgxqzyjwwbukdaslww.supabase.co)
-- Export Date: 2026-08-17T00:32:00.232Z
-- ================================================================

-- ----------------------------------------------------------------
-- 1. SCHEMA DDL (TABLES, TRIGGERS, RLS POLICIES)
-- ----------------------------------------------------------------

-- ================================================================
-- MARGA SERA PHOTOGRAPHY — SUPABASE SQL SCHEMA
-- Jalankan file ini di: Supabase Dashboard → SQL Editor → Run
-- ================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------
-- TABLE: profiles (linked to Supabase Auth users)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT,
  email       TEXT,
  role        TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------
-- TABLE: services
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.services (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  description     TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- TABLE: packages
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.packages (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id          UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  slug                TEXT NOT NULL UNIQUE,
  description         TEXT,
  price               BIGINT NOT NULL DEFAULT 0,
  down_payment        BIGINT,
  duration            TEXT,
  photographer_count  INT,
  edited_photos       TEXT,
  features            TEXT[] NOT NULL DEFAULT '{}',
  is_popular          BOOLEAN NOT NULL DEFAULT FALSE,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- TABLE: gallery_projects
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.gallery_projects (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  category        TEXT NOT NULL,
  category_label  TEXT,
  description     TEXT,
  location        TEXT,
  event_date      TEXT,
  cover_image     TEXT,
  is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- TABLE: gallery_images
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.gallery_images (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id    UUID NOT NULL REFERENCES public.gallery_projects(id) ON DELETE CASCADE,
  image_url     TEXT NOT NULL,
  alt_text      TEXT,
  sort_order    INT NOT NULL DEFAULT 0,
  aspect_ratio  TEXT CHECK (aspect_ratio IN ('portrait', 'landscape', 'square')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- TABLE: availability
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.availability (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date                DATE NOT NULL UNIQUE,
  status              TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'almost_full', 'booked', 'blocked')),
  notes               TEXT,
  wedding_slots       JSONB,
  booked_time_slots   JSONB,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- TABLE: bookings
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bookings (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_code      TEXT NOT NULL UNIQUE,
  customer_name     TEXT NOT NULL,
  whatsapp          TEXT NOT NULL,
  email             TEXT,
  instagram         TEXT,
  service_id        UUID REFERENCES public.services(id) ON DELETE SET NULL,
  service_name      TEXT,
  package_id        UUID REFERENCES public.packages(id) ON DELETE SET NULL,
  package_name      TEXT,
  booking_date      DATE NOT NULL,
  start_time        TEXT,
  end_time          TEXT,
  slot_type         TEXT,
  location          TEXT,
  event_type        TEXT,
  notes             TEXT,
  status            TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  payment_status    TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'dp_paid', 'paid_full')),
  down_payment      BIGINT,
  paid_amount       BIGINT DEFAULT 0,
  remaining_amount  BIGINT,
  total_price       BIGINT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- UPDATED_AT TRIGGER
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['profiles','services','packages','gallery_projects','availability','bookings']
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS set_updated_at ON public.%I;
      CREATE TRIGGER set_updated_at
        BEFORE UPDATE ON public.%I
        FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
    ', tbl, tbl);
  END LOOP;
END $$;

-- ================================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================================

ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings        ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'staff')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- profiles
CREATE POLICY "Admin can manage profiles" ON public.profiles
  FOR ALL USING (public.is_admin());

-- services
CREATE POLICY "Public can read active services" ON public.services
  FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admin can manage services" ON public.services
  FOR ALL USING (public.is_admin());

-- packages
CREATE POLICY "Public can read active packages" ON public.packages
  FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admin can manage packages" ON public.packages
  FOR ALL USING (public.is_admin());

-- gallery_projects
CREATE POLICY "Public can read gallery projects" ON public.gallery_projects
  FOR SELECT USING (TRUE);
CREATE POLICY "Admin can manage gallery projects" ON public.gallery_projects
  FOR ALL USING (public.is_admin());

-- gallery_images
CREATE POLICY "Public can read gallery images" ON public.gallery_images
  FOR SELECT USING (TRUE);
CREATE POLICY "Admin can manage gallery images" ON public.gallery_images
  FOR ALL USING (public.is_admin());

-- availability
CREATE POLICY "Public can read availability" ON public.availability
  FOR SELECT USING (TRUE);
CREATE POLICY "Admin can manage availability" ON public.availability
  FOR ALL USING (public.is_admin());

-- bookings
CREATE POLICY "Public can create booking" ON public.bookings
  FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Public can read own booking by code" ON public.bookings
  FOR SELECT USING (TRUE);
CREATE POLICY "Admin can manage all bookings" ON public.bookings
  FOR ALL USING (public.is_admin());

-- ================================================================
-- SETELAH MENJALANKAN SQL INI:
-- 1. Isi .env.local dengan NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
-- 2. Buat user admin: Supabase → Authentication → Users → Add User
-- 3. Set role: UPDATE public.profiles SET role = 'admin' WHERE email = 'email@kamu.com';
-- ================================================================


-- ----------------------------------------------------------------
-- 2. REAL DATA FROM LIVE SUPABASE DATABASE
-- ----------------------------------------------------------------

-- DATA FOR TABLE: public.profiles (1 rows)
-- Disimpan dengan pengecekan aman agar tidak error foreign key 'profiles_id_fkey' jika user belum terdaftar di Auth
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM auth.users WHERE id = 'e85b0fdc-776b-4365-b03e-b5b48c5169a7') THEN
    INSERT INTO public.profiles (id, name, email, role, created_at, updated_at) VALUES
    ('e85b0fdc-776b-4365-b03e-b5b48c5169a7', 'Admin', 'admin@margasera.id', 'admin', '2026-08-13T10:10:14.808619+00:00', '2026-08-13T10:11:47.081115+00:00')
    ON CONFLICT (id) DO UPDATE SET role = 'admin';
  END IF;
END $$;

-- DATA FOR TABLE: public.services (7 rows)
INSERT INTO public.services (id, name, slug, description, is_active, created_at, updated_at) VALUES
('2a3942d0-ad18-4702-808e-d86d1c272726', 'Wedding', 'wedding', '', TRUE, '2026-08-15T00:55:37.78252+00:00', '2026-08-15T00:55:37.78252+00:00'),
('35bdd069-e380-45bf-9290-93703b908a7e', 'Pre-Wedding', 'pre-wedding', '', TRUE, '2026-08-15T00:55:52.432256+00:00', '2026-08-15T00:55:52.432256+00:00'),
('c81b851e-369d-4867-a3b5-1130073ca3a4', 'Engagement', 'engagement', '', TRUE, '2026-08-15T00:56:17.785219+00:00', '2026-08-15T00:56:17.785219+00:00'),
('2e8fc235-a313-4a66-990b-58e07a25b736', 'Siraman', 'siraman', '', TRUE, '2026-08-15T00:56:33.112363+00:00', '2026-08-15T00:56:33.112363+00:00'),
('24178ed3-3338-49f5-a9b1-36d738d766e4', 'Tasyakuran 40 Hari Bayi / Maternity', 'tasyakuran-40-hari-bayi-maternity', '', TRUE, '2026-08-15T00:57:17.562387+00:00', '2026-08-15T00:57:17.562387+00:00'),
('300c5c37-138d-47bf-a10f-ebae523a2753', 'Wisuda Outdoor', 'wisuda', '', TRUE, '2026-08-15T00:57:35.56243+00:00', '2026-08-15T00:58:04.676629+00:00'),
('35cefca8-ad39-4458-8893-489193a71321', 'Sidang Skripsi', 'sidang-skripsi', '', TRUE, '2026-08-15T00:58:16.925199+00:00', '2026-08-15T00:58:16.925199+00:00')
ON CONFLICT DO NOTHING;

-- DATA FOR TABLE: public.packages (16 rows)
INSERT INTO public.packages (id, service_id, name, slug, description, price, duration, photographer_count, edited_photos, features, is_popular, is_active, created_at, updated_at, down_payment) VALUES
('deb51e69-4990-49c7-9175-8847450610be', '2a3942d0-ad18-4702-808e-d86d1c272726', 'Paket Basic', 'paket-basic', '', 1650000, '7 jam', 2, 'Unlimeted Foto', ARRAY['2 Fotografer', 'Cetak 120 foto ukuran 4R', 'Album magnetic 10 sheet', 'Cetak 1 foto ukuran 10 Rs + frame', 'Flashdisk'], FALSE, TRUE, '2026-08-15T01:05:22.425605+00:00', '2026-08-15T01:05:26.436+00:00', NULL),
('1cd79a00-9c68-46cf-af6b-f2992c0bef49', '2a3942d0-ad18-4702-808e-d86d1c272726', 'Paket Premium', 'paket-premium', '', 3500000, '8 Jam', 2, 'Unlimited foto', ARRAY['2 fotografer 2 videografer', 'Cetak 120 foto ukuran 4R', 'Album magnetic 10 sheet', 'Cetak 1 foto ukuran 12 Rs + frame', ' Cetak 1 foto ukuran 10 Rs + frame', 'Video cinematic 1-3 menit', 'Video dokumentasi maks 60 menit', 'Flashdisk'], FALSE, TRUE, '2026-08-15T04:47:41.392152+00:00', '2026-08-15T04:47:40.71+00:00', NULL),
('2767e266-3d72-4273-8206-2c76344eae1c', '24178ed3-3338-49f5-a9b1-36d738d766e4', 'Paket Standart', 'tasyakuran-40-hari-bayi-maternity-paket-standart', '', 400000, '4 Jam', 2, 'Unlimited foto', ARRAY['1 fotografer', '40 Edit foto', 'All file Google Drive'], FALSE, TRUE, '2026-08-15T05:33:37.852697+00:00', '2026-08-15T05:33:41.767+00:00', NULL),
('1fdfdcec-e838-41bc-bc46-d01e3ca7b99f', '2a3942d0-ad18-4702-808e-d86d1c272726', 'Paket Platinum', 'paket-platinum', '', 5650000, '9 Jam', 2, 'Unlimited foto', ARRAY['2 fotografer 2 videografer', 'Cetak 80 foto ukuran 4R', 'Album magnetic 10 sheet', 'Album magazine (20x30) 30 hlm', 'Cetak 1 foto ukuran 12 Rs + frame', 'Cetak 1 foto ukuran 10 Rs + frame', 'Video dokumentasi maks 60 menit', 'Video cinematic 1-2 menit', 'Flashdisk'], FALSE, TRUE, '2026-08-15T05:00:14.1053+00:00', '2026-08-15T05:00:44.049658+00:00', NULL),
('cd86ef31-c1b9-4775-9579-9ae6e997b42c', '35bdd069-e380-45bf-9290-93703b908a7e', 'Paket Standart', 'pre-wedding-paket-standart', '', 450000, '3 Jam', 2, ' Unlimited foto', ARRAY['2 fotografer', '35 Edit foto', '1 lokasi, 1 dress code', 'All File Google Drive'], FALSE, TRUE, '2026-08-15T05:06:00.940782+00:00', '2026-08-15T05:08:25.387083+00:00', NULL),
('3647ce90-2c4c-44a9-bc1d-927a08c724ec', 'c81b851e-369d-4867-a3b5-1130073ca3a4', 'Paket Premium', 'engagement-paket-premium', '', 1200000, '6 Jam', 2, 'Unlimited foto', ARRAY['Video cinematic 1-2 menit', '2 fotografer dan 1 videografer', '40 Edit foto', 'Cetak 40 foto ukuran 4R + 1 Album', 'All ile google drive'], TRUE, TRUE, '2026-08-15T05:13:12.516092+00:00', '2026-08-15T05:13:17.146848+00:00', NULL),
('cea51d2d-aa4a-4f84-8b8a-5119ab46a672', '35bdd069-e380-45bf-9290-93703b908a7e', 'Paket Premium', 'pre-wedding-paket-premium', '', 1250000, '6 Jam', 2, 'Unlimited foto', ARRAY['2 fotografer dan 1 videografer', '50 Edit foto', '2 lokasi 2 dress code', 'All File Google Drive'], TRUE, TRUE, '2026-08-15T05:08:12.977207+00:00', '2026-08-15T05:13:22.333457+00:00', NULL),
('9f07762d-84fc-47d8-b83a-dc99feb3cc20', '2a3942d0-ad18-4702-808e-d86d1c272726', 'Paket Standart', 'wedding-paket-standart', '', 2350000, '7 Jam', 2, 'Unlimited foto', ARRAY['1 fotografer 1 videografer', 'Cetak 120 foto ukuran 4R', 'Album magnetic 10 sheet', 'Cetak 1 foto ukuran 10 Rs + frame', 'Video cinematic 1-2 menit', 'Flashdisk'], TRUE, TRUE, '2026-08-15T04:45:11.893016+00:00', '2026-08-15T05:13:28.973901+00:00', NULL),
('c14b743f-17a3-4864-a87a-269fca5e5c0d', '2e8fc235-a313-4a66-990b-58e07a25b736', 'Paket Premium', 'siraman-paket-premium', '', 1000000, '6 Jam', 2, ' Unlimited foto', ARRAY['video cinematic 1-2 menit', '1 fotografer dan 1 videografer', '40 Edit foto', 'All file Google Drive'], TRUE, TRUE, '2026-08-15T05:32:13.329431+00:00', '2026-08-15T05:35:18.446522+00:00', NULL),
('fbfb32de-02b9-4e97-beb0-f4f33be0c1c5', '24178ed3-3338-49f5-a9b1-36d738d766e4', 'Paket Premium', 'tasyakuran-40-hari-bayi-maternity-paket-premium', '', 900000, '6 Jam', 2, 'Unlimited foto', ARRAY['video cinematic 1-2 menit', '1 fotografer dan 1 videografer', '40 Edit foto', 'All file Google Drive'], TRUE, TRUE, '2026-08-15T05:35:00.083329+00:00', '2026-08-15T05:35:23.151594+00:00', NULL),
('572b5483-47de-4661-a382-710d58b5d4be', '300c5c37-138d-47bf-a10f-ebae523a2753', 'Paket Premium', 'wisuda-paket-premium', '', 600000, '75 Menit', 2, ' Unlimited foto', ARRAY['Unlimited All Files Google Drive', '40 Edit foto', 'Video cinematic 1 menit'], TRUE, TRUE, '2026-08-15T05:25:14.319735+00:00', '2026-08-15T05:26:06.306352+00:00', NULL),
('c57b03a3-e2f1-490a-a901-974ff06ce6fd', '35cefca8-ad39-4458-8893-489193a71321', 'Paket Standart', 'sidang-skripsi-paket-standart', '', 250000, '40 Menit', 2, ' Unlimited foto', ARRAY['Unlimited All files Google Drive', '30 Edit foto'], FALSE, TRUE, '2026-08-15T05:28:00.614669+00:00', '2026-08-15T05:28:04.556+00:00', NULL),
('d9c93882-d028-402b-b30c-de9d0d3eec36', '35cefca8-ad39-4458-8893-489193a71321', 'Paket Premium', 'sidang-skripsi-paket-premium', '', 350000, '60 Menit', 2, ' Unlimited Foto', ARRAY['Unlimited All files Google Drive', '30 Edit foto', 'Video cinematic 1 menit'], TRUE, TRUE, '2026-08-15T05:29:11.390877+00:00', '2026-08-15T05:29:16.926519+00:00', NULL),
('667a2826-9c75-40b5-8e6a-a11f99107ae5', '2e8fc235-a313-4a66-990b-58e07a25b736', 'Paket Standart', 'siraman-paket-standart', '', 400000, '4 Jam', 2, 'Unlimited foto', ARRAY['1 fotografer', '40 Edit foto', 'All file Google Drive'], FALSE, TRUE, '2026-08-15T05:30:56.318581+00:00', '2026-08-15T05:31:00.227+00:00', NULL),
('33fc6411-e70f-4cf1-8633-9c21c151c5eb', '300c5c37-138d-47bf-a10f-ebae523a2753', 'Paket Standart', 'wisuda-paket-standart', '', 300000, '45 menit', 2, 'Unlimited foto', ARRAY['Unlimited All ile Google Drive', '30 Edit foto'], FALSE, TRUE, '2026-08-15T05:19:24.799061+00:00', '2026-08-16T07:00:13.577512+00:00', 100000),
('9cdd7eaa-ddbf-435c-9eb6-fdcdaa7bf106', 'c81b851e-369d-4867-a3b5-1130073ca3a4', 'Paket Standart', 'engagement-paket-standart', '', 450000, '4 Jam', 2, ' Unlimited foto', ARRAY[' 2 fotografer', '40 Edit foto', 'Cetak 40 foto ukuran 4R  + 1 Album', 'All File Google Drive'], FALSE, TRUE, '2026-08-15T05:10:22.946049+00:00', '2026-08-16T07:00:27.069788+00:00', 100000)
ON CONFLICT DO NOTHING;

-- DATA FOR TABLE: public.gallery_projects (1 rows)
INSERT INTO public.gallery_projects (id, title, slug, category, category_label, description, location, event_date, cover_image, is_featured, created_at, updated_at) VALUES
('51ed95fa-9c68-4705-ae82-3c750a667e73', 'Fortofolio', 'fortofolio-1786773217792', 'engagement', 'Engagement', 'Dokumentasi sinematik foto pilihan Margasera.', 'Madura, Jawa Timur', 'Agustus 2026', 'https://res.cloudinary.com/dasycqpyg/image/upload/v1786773207/margasera/zrki40ufpnywqmgeudr0.png', TRUE, '2026-08-15T05:53:34.673912+00:00', '2026-08-15T05:53:34.673912+00:00')
ON CONFLICT DO NOTHING;

-- DATA FOR TABLE: public.gallery_images (1 rows)
INSERT INTO public.gallery_images (id, project_id, image_url, alt_text, sort_order, aspect_ratio, created_at) VALUES
('4bfbd02a-78b7-4bb2-b39a-e25d2f6abd39', '51ed95fa-9c68-4705-ae82-3c750a667e73', 'https://res.cloudinary.com/dasycqpyg/image/upload/v1786773207/margasera/zrki40ufpnywqmgeudr0.png', 'Fortofolio', 1, 'landscape', '2026-08-15T05:53:34.793208+00:00')
ON CONFLICT DO NOTHING;

-- DATA FOR TABLE: public.availability (0 rows)
-- (No rows found in availability)

-- DATA FOR TABLE: public.bookings (3 rows)
INSERT INTO public.bookings (id, booking_code, customer_name, whatsapp, email, instagram, service_id, service_name, package_id, package_name, booking_date, start_time, end_time, slot_type, location, event_type, notes, status, payment_status, down_payment, paid_amount, remaining_amount, total_price, created_at, updated_at) VALUES
('57e439f4-7b34-49b8-9016-ffb4b48a9065', 'MS-260819-511', 'arifin & jajann', '083846122250', 'miftahularifin265@gmail.com', 'miftahularifin', '2a3942d0-ad18-4702-808e-d86d1c272726', 'Wedding', '9f07762d-84fc-47d8-b83a-dc99feb3cc20', 'Paket Standart', '2026-08-19', '06:08', '13:08', 'custom', 'desa bangsal kec.kedungdung Sampang', NULL, 'Nama Pasangan: jajann
Catatan: kak qku pengen dance brasil', 'pending', 'paid_full', 470000, 2350000, 1880000, 2350000, '2026-08-16T13:01:57.394706+00:00', '2026-08-16T13:05:21.697982+00:00'),
('9ca4e6ae-00ea-421f-89fa-b20190f9e1d6', 'MS-260828-923', 'Noera Wahdaniyah', '085232847212', 'wahdaniyah@gmail.com', 'noeraaa___', '2e8fc235-a313-4a66-990b-58e07a25b736', 'Siraman', '667a2826-9c75-40b5-8e6a-a11f99107ae5', 'Paket Standart', '2026-08-28', '13:00', '17:00', 'custom', 'Jl. Sersan mesrul gang lV A utara taman gladak', NULL, NULL, 'confirmed', 'paid_full', 80000, 0, 320000, 400000, '2026-08-16T04:19:30.419789+00:00', '2026-08-16T04:22:41.944172+00:00'),
('744fe678-c8f6-4edc-a250-02043a42acb4', 'MS-260830-997', 'Wulantika', '081358153901', 'wulantika@gmail.com', 'tika6307', '300c5c37-138d-47bf-a10f-ebae523a2753', 'Wisuda Outdoor', '33fc6411-e70f-4cf1-8633-9c21c151c5eb', 'Paket Standart', '2026-08-30', '06:00', '06:45', 'wedding_morning', 'Kampus UTM', NULL, NULL, 'confirmed', 'dp_paid', 60000, 0, 240000, 300000, '2026-08-16T05:10:25.041893+00:00', '2026-08-16T05:57:00.170623+00:00')
ON CONFLICT DO NOTHING;


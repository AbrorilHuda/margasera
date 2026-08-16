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

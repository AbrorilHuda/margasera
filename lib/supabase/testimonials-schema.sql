-- 1. Buat Tabel Testimonials
CREATE TABLE IF NOT EXISTS public.testimonials (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_code    TEXT,
  name            TEXT NOT NULL,
  event_type      TEXT NOT NULL,
  location        TEXT DEFAULT 'Pamekasan, Madura',
  message         TEXT NOT NULL,
  rating          INT NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  is_published    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Index untuk performa query pencarian dan filter
CREATE INDEX IF NOT EXISTS idx_testimonials_published ON public.testimonials(is_published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_testimonials_booking_code ON public.testimonials(booking_code);
CREATE INDEX IF NOT EXISTS idx_testimonials_event_type ON public.testimonials(event_type);

-- 3. Auto Trigger updated_at saat data diperbarui
CREATE OR REPLACE FUNCTION public.set_testimonials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_testimonials_updated_at ON public.testimonials;
CREATE TRIGGER trigger_set_testimonials_updated_at
  BEFORE UPDATE ON public.testimonials
  FOR EACH ROW EXECUTE FUNCTION public.set_testimonials_updated_at();

-- 4. Aktifkan Row Level Security (RLS)
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Publik dapat membaca testimoni yang berstatus aktif/published
DROP POLICY IF EXISTS "Public can view published testimonials" ON public.testimonials;
CREATE POLICY "Public can view published testimonials" ON public.testimonials
  FOR SELECT USING (is_published = TRUE);

-- Publik (klien dari form /testimoni) dapat mengirim testimoni baru
DROP POLICY IF EXISTS "Public can submit testimonials" ON public.testimonials;
CREATE POLICY "Public can submit testimonials" ON public.testimonials
  FOR INSERT WITH CHECK (TRUE);

-- Admin & Staff dapat mengelola semua testimoni (Ubah, Hapus, Publish/Unpublish)
DROP POLICY IF EXISTS "Admin full access to testimonials" ON public.testimonials;
CREATE POLICY "Admin full access to testimonials" ON public.testimonials
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

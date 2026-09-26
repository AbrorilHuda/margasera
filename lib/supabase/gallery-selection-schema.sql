-- ==============================================================================
-- SKEMA FITUR GALERI SELEKSI FOTO KLIEN — MARGASERA PHOTOGRAPHY
-- Jalankan file SQL ini di Supabase SQL Editor
-- ==============================================================================

-- 1. Tambah Kolom Galeri Seleksi pada tabel bookings (jika belum ada)
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS drive_folder_id TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS drive_folder_url TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS selection_max_count INT DEFAULT 15;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS selection_deadline TIMESTAMPTZ;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS allow_download BOOLEAN DEFAULT FALSE;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS gallery_slug TEXT UNIQUE;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS gallery_token TEXT UNIQUE;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS gallery_sent_at TIMESTAMPTZ;

-- Index untuk pencarian galeri berdasarkan slug & token
CREATE INDEX IF NOT EXISTS idx_bookings_gallery_slug ON public.bookings(gallery_slug);
CREATE INDEX IF NOT EXISTS idx_bookings_gallery_token ON public.bookings(gallery_token);


-- 2. Buat Tabel Cache Daftar Foto Google Drive
-- Menyimpan metadata foto dari folder Drive agar tidak over-fetch ke Google Drive API
CREATE TABLE IF NOT EXISTS public.gallery_files_cache (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id      UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  drive_file_id   TEXT NOT NULL,
  file_name       TEXT NOT NULL,
  thumbnail_link  TEXT,
  image_width     INT,
  image_height    INT,
  fetched_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gallery_files_cache_booking_id ON public.gallery_files_cache(booking_id);
CREATE INDEX IF NOT EXISTS idx_gallery_files_cache_file_id ON public.gallery_files_cache(drive_file_id);


-- 3. Buat Tabel Pilihan Foto Klien
-- Menyimpan foto-foto yang dipilih oleh klien
CREATE TABLE IF NOT EXISTS public.gallery_selections (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id      UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  drive_file_id   TEXT NOT NULL,
  file_name       TEXT NOT NULL,
  selected_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gallery_selections_booking_id ON public.gallery_selections(booking_id);
CREATE INDEX IF NOT EXISTS idx_gallery_selections_file_id ON public.gallery_selections(drive_file_id);


-- 4. Keamanan & Row Level Security (RLS)
ALTER TABLE public.gallery_files_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_selections ENABLE ROW LEVEL SECURITY;

-- Catatan: Akses galeri klien divalidasi via Server Actions / Route Handlers 
-- menggunakan Supabase Service Role Key (createAdminClient), sehingga 
-- tabel cache & selections aman dan tidak perlu diekspos sembarangan ke publik anon.

-- Hak akses Admin & Staff untuk melihat dan mengelola data galeri
DROP POLICY IF EXISTS "Admin full access to gallery_files_cache" ON public.gallery_files_cache;
CREATE POLICY "Admin full access to gallery_files_cache" ON public.gallery_files_cache
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

DROP POLICY IF EXISTS "Admin full access to gallery_selections" ON public.gallery_selections;
CREATE POLICY "Admin full access to gallery_selections" ON public.gallery_selections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

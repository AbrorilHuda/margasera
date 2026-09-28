-- ==============================================================================
-- SCHEMA MODUL KEUANGAN & PENGELUARAN (FINANCE & EXPENSES) - MARGASERA STUDIO
-- ==============================================================================
-- Jalankan skrip ini di SQL Editor Supabase Dashboard Anda.

-- 1. Buat Tabel Expenses
CREATE TABLE IF NOT EXISTS public.expenses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type            TEXT NOT NULL DEFAULT 'expense' CHECK (type IN ('expense', 'income')),
  date            DATE NOT NULL DEFAULT CURRENT_DATE,
  title           TEXT NOT NULL,
  category        TEXT NOT NULL,
  custom_category TEXT,
  amount          NUMERIC(14, 2) NOT NULL DEFAULT 0,
  booking_id      UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  booking_code    TEXT,
  customer_name   TEXT,
  payment_method  TEXT DEFAULT 'transfer',
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Buat Index untuk Performa Filter & Pencarian
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_type ON public.expenses(type);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_booking_id ON public.expenses(booking_id);

-- 3. Auto Trigger updated_at saat data diubah
CREATE OR REPLACE FUNCTION public.set_expenses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_expenses_updated_at ON public.expenses;
CREATE TRIGGER trigger_set_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.set_expenses_updated_at();

-- 4. Keamanan Row Level Security (RLS)
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Hanya Admin dan Staff yang dapat membaca, menambah, mengubah, dan menghapus catatan keuangan
DROP POLICY IF EXISTS "Admin full access to expenses" ON public.expenses;
CREATE POLICY "Admin full access to expenses" ON public.expenses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

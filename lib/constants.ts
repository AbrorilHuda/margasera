import type { StudioSettings } from '@/lib/types';

/** Default fallback Studio Settings (used before Supabase data loads) */
export const DEFAULT_STUDIO_SETTINGS: StudioSettings = {
  studioName: 'Margasera Photography',
  ownerName: 'Royfal Alim',
  whatsapp: '085806138955',
  instagram: 'https://instagram.com/margasera.id',
  tiktok: 'https://www.tiktok.com/@margasera',
  email: 'hello@margasera.id',
  address: 'Pamekasan, Madura, Jawa Timur, Indonesia',
  googleMapsUrl: 'https://maps.google.com/?q=Margasera+Photography+Pamekasan',
  bankName: 'BCA',
  bankAccountNumber: '1234567890',
  bankAccountHolder: 'MARGASERA CREATIVE',
};

/** Default waktu sesi */
export const DEFAULT_START_TIME = '06:00';
export const DEFAULT_END_TIME = '14:00';

/** Default nilai form tambah booking manual */
export const BOOKING_FORM_DEFAULTS = {
  customerName: '',
  whatsapp: '',
  email: '',
  instagram: '',
  serviceId: '',
  packageId: '',
  bookingDate: '',
  startTime: DEFAULT_START_TIME,
  endTime: DEFAULT_END_TIME,
  location: '',
  totalPrice: 14_500_000,
  downPayment: 1_000_000,
  paymentStatus: 'unpaid' as 'unpaid' | 'dp_paid' | 'paid_full',
  notes: '',
};

/** Kategori Pengeluaran & Transaksi Studio */
export const EXPENSE_CATEGORIES = [
  {
    key: 'fee_team',
    label: 'Fee Tim / Freelance',
    badgeClass: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    description: 'Fotografer, videografer, asisten, editor, MUA',
  },
  {
    key: 'production',
    label: 'Produksi & Cetak',
    badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    description: 'Album photobook, cetak kanvas, frame, flashdisk, box',
  },
  {
    key: 'transport_consumption',
    label: 'Transport & Konsumsi',
    badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    description: 'Bensin, e-toll, tiket lokasi, makan & minum tim',
  },
  {
    key: 'equipment',
    label: 'Sewa & Perawatan Alat',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    description: 'Sewa lensa, lighting, baterai, perbaikan kamera',
  },
  {
    key: 'studio_operational',
    label: 'Operasional Studio',
    badgeClass: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    description: 'Listrik, wifi, langganan cloud/Adobe, sewa tempat',
  },
  {
    key: 'other',
    label: 'Lainnya',
    badgeClass: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700',
    description: 'Kategori kustom input manual',
  },
] as const;

export const EXPENSE_CATEGORY_LABELS: Record<string, string> = {
  fee_team: 'Fee Tim / Freelance',
  production: 'Produksi & Cetak',
  transport_consumption: 'Transport & Konsumsi',
  equipment: 'Sewa & Perawatan Alat',
  studio_operational: 'Operasional Studio',
  other: 'Lainnya',
};



import type { StudioSettings } from '@/lib/types';

/** Default fallback Studio Settings (used before Supabase data loads) */
export const DEFAULT_STUDIO_SETTINGS: StudioSettings = {
  studioName: 'Margasera Photography',
  ownerName: 'Royfal Alim',
  whatsapp: '085806138955',
  instagram: 'https://instagram.com/margasera.id',
  tiktok: 'https://www.tiktok.com/@margasera',
  email: 'hello@margasera.id',
  address: 'Jl. Raya Madura No. 88, Madura, Jawa Timur',
  googleMapsUrl: 'https://maps.google.com',
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


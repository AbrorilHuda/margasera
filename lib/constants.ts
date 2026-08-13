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

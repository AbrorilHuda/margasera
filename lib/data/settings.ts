/**
 * lib/data/settings.ts
 * Plain server-side data fetcher (NO 'use server') — safe to call directly
 * from async Server Components like Footer, layout, page, etc.
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { DEFAULT_STUDIO_SETTINGS } from '@/lib/constants';
import type { StudioSettings } from '@/lib/types';

export async function fetchStudioSettings(): Promise<StudioSettings> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      return DEFAULT_STUDIO_SETTINGS;
    }

    const supabase = createAdminClient();

    const { data, error } = await (supabase as any)
      .from('studio_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      return {
        id: data.id,
        studioName: data.studio_name ?? DEFAULT_STUDIO_SETTINGS.studioName,
        ownerName: data.owner_name ?? DEFAULT_STUDIO_SETTINGS.ownerName,
        whatsapp: data.whatsapp ?? DEFAULT_STUDIO_SETTINGS.whatsapp,
        instagram: data.instagram ?? DEFAULT_STUDIO_SETTINGS.instagram,
        tiktok: data.tiktok ?? DEFAULT_STUDIO_SETTINGS.tiktok,
        email: data.email ?? DEFAULT_STUDIO_SETTINGS.email,
        address: data.address ?? DEFAULT_STUDIO_SETTINGS.address,
        googleMapsUrl: data.google_maps_url ?? DEFAULT_STUDIO_SETTINGS.googleMapsUrl,
        bankName: data.bank_name ?? DEFAULT_STUDIO_SETTINGS.bankName,
        bankAccountNumber: data.bank_account_number ?? DEFAULT_STUDIO_SETTINGS.bankAccountNumber,
        bankAccountHolder: data.bank_account_holder ?? DEFAULT_STUDIO_SETTINGS.bankAccountHolder,
      };
    }
  } catch (err) {
    console.error('Error fetching studio settings:', err);
  }

  return DEFAULT_STUDIO_SETTINGS;
}

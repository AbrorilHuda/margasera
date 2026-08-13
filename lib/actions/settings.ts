'use server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { StudioSettings } from '@/lib/types';
import { fetchStudioSettings } from '@/lib/data/settings';

export { fetchStudioSettings as getStudioSettings };
/** Admin: Simpan / Update Pengaturan Studio ke Supabase */
export async function updateStudioSettings(
  settings: StudioSettings
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient();

    const payload = {
      studio_name: settings.studioName,
      owner_name: settings.ownerName,
      whatsapp: settings.whatsapp,
      instagram: settings.instagram,
      tiktok: settings.tiktok,
      email: settings.email,
      address: settings.address,
      google_maps_url: settings.googleMapsUrl,
      bank_name: settings.bankName,
      bank_account_number: settings.bankAccountNumber,
      bank_account_holder: settings.bankAccountHolder,
      updated_at: new Date().toISOString(),
    };

    if (settings.id) {
      const { error } = await (supabase as any)
        .from('studio_settings')
        .update(payload)
        .eq('id', settings.id);

      if (error) return { success: false, error: error.message };
      return { success: true };
    } else {
      const { data: existing } = await (supabase as any)
        .from('studio_settings')
        .select('id')
        .limit(1);

      if (existing && existing.length > 0) {
        const { error } = await (supabase as any)
          .from('studio_settings')
          .update(payload)
          .eq('id', existing[0].id);

        if (error) return { success: false, error: error.message };
        return { success: true };
      } else {
        const { error } = await (supabase as any)
          .from('studio_settings')
          .insert(payload);

        if (error) return { success: false, error: error.message };
        return { success: true };
      }
    }
  } catch (err: any) {
    return { success: false, error: err.message ?? 'Gagal memperbarui pengaturan studio' };
  }
}

'use server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/actions/admin';
import { logAdminAudit } from '@/lib/audit-logger';
import type { StudioSettings } from '@/lib/types';
import { fetchStudioSettings } from '@/lib/data/settings';

export { fetchStudioSettings as getStudioSettings };
/** Admin: Simpan / Update Pengaturan Studio ke Supabase */
export async function updateStudioSettings(
  settings: StudioSettings
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!(await requireAdmin())) return { success: false, error: 'Unauthorized' };
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
      const { error } = await supabase
        .from('studio_settings')
        .update(payload)
        .eq('id', settings.id);

      if (error) return { success: false, error: error.message };
      await logAdminAudit('UPDATE_STUDIO_SETTINGS', settings.id, {
        studioName: settings.studioName,
        bankName: settings.bankName,
        bankAccountNumber: settings.bankAccountNumber,
      });
      return { success: true };
    } else {
      const { data: existing } = await supabase
        .from('studio_settings')
        .select('id')
        .limit(1);

      if (existing && existing.length > 0) {
        const { error } = await supabase
          .from('studio_settings')
          .update(payload)
          .eq('id', existing[0].id);

        if (error) return { success: false, error: error.message };
        await logAdminAudit('UPDATE_STUDIO_SETTINGS', existing[0].id, {
          studioName: settings.studioName,
          bankName: settings.bankName,
          bankAccountNumber: settings.bankAccountNumber,
        });
        return { success: true };
      } else {
        const { error } = await supabase
          .from('studio_settings')
          .insert(payload);

        if (error) return { success: false, error: error.message };
        await logAdminAudit('CREATE_STUDIO_SETTINGS', undefined, {
          studioName: settings.studioName,
          bankName: settings.bankName,
          bankAccountNumber: settings.bankAccountNumber,
        });
        return { success: true };
      }
    }
  } catch (err: any) {
    return { success: false, error: err.message ?? 'Gagal memperbarui pengaturan studio' };
  }
}

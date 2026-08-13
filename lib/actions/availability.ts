'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Database } from '@/lib/supabase/database.types';
import type { Availability, AvailabilityStatus, WeddingSlot, BookedTimeSlot } from '@/lib/types';

type AvailabilityRow = Database['public']['Tables']['availability']['Row'];

function mapAvailability(a: AvailabilityRow): Availability {
  return {
    id: a.id,
    date: a.date,
    status: a.status as AvailabilityStatus,
    notes: a.notes ?? undefined,
    weddingSlots: (a.wedding_slots as WeddingSlot[] | null) ?? undefined,
    bookedTimeSlots: (a.booked_time_slots as BookedTimeSlot[] | null) ?? undefined,
  };
}

/** Ambil semua data availability untuk bulan tertentu (YYYY-MM) dari Supabase */
export async function getAvailability(yearMonth?: string): Promise<Availability[]> {
  const supabase = await createClient();

  let query = (supabase as any)
    .from('availability')
    .select('*')
    .order('date');

  if (yearMonth) {
    const parts = yearMonth.split('-');
    if (parts.length === 2) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const lastDay = new Date(year, month, 0).getDate();
      const startDate = `${yearMonth}-01`;
      const endDate = `${yearMonth}-${String(lastDay).padStart(2, '0')}`;
      query = query.gte('date', startDate).lte('date', endDate);
    }
  }

  const { data, error } = await query;
  if (error || !data) {
    if (error) console.error('Error fetching availability from Supabase:', error.message);
    return [];
  }
  return (data as AvailabilityRow[]).map(mapAvailability);
}

/** Ambil availability untuk range bulan dari Supabase */
export async function getAvailabilityRange(
  startDate: string,
  endDate: string
): Promise<Availability[]> {
  const supabase = await createClient();

  const { data, error } = await (supabase as any)
    .from('availability')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date');

  if (error || !data) {
    if (error) console.error('Error fetching availability range from Supabase:', error.message);
    return [];
  }
  return (data as AvailabilityRow[]).map(mapAvailability);
}

/** Admin: update/upsert status tanggal ke Supabase */
export async function updateAvailabilityStatus(
  date: string,
  status: AvailabilityStatus,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient();

    const payload = {
      date,
      status,
      notes: notes ?? null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await (supabase as any)
      .from('availability')
      .upsert(payload, { onConflict: 'date' });

    if (error) {
      console.error('Supabase availability upsert error:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Unexpected error in updateAvailabilityStatus:', err);
    return { success: false, error: err?.message || 'Terjadi kesalahan sistem' };
  }
}

/** Admin: hapus/reset tanggal (set kembali ke available) di Supabase */
export async function resetAvailabilityDate(
  date: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient();

    const { error } = await (supabase as any)
      .from('availability')
      .delete()
      .eq('date', date);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Gagal me-reset tanggal' };
  }
}

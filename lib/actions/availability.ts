'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/actions/admin';
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

/** Ambil semua data availability & bookings langsung dari Supabase secara real-time */
export async function getAvailability(yearMonth?: string): Promise<Availability[]> {
  const supabase = await createClient();

  let startDateStr = '';
  let endDateStr = '';

  if (yearMonth) {
    const parts = yearMonth.split('-');
    if (parts.length === 2) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const lastDay = new Date(year, month, 0).getDate();
      startDateStr = `${yearMonth}-01`;
      endDateStr = `${yearMonth}-${String(lastDay).padStart(2, '0')}`;
    }
  }

  // 1. Query tabel availability untuk admin override / manual status dari Supabase
  let availQuery = (supabase as any).from('availability').select('*').order('date');
  if (startDateStr && endDateStr) {
    availQuery = availQuery.gte('date', startDateStr).lte('date', endDateStr);
  }

  // 2. Query tabel bookings langsung dari Supabase (kecuali pesanan yang dibatalkan)
  let bookingsQuery = (supabase as any)
    .from('bookings')
    .select('id, booking_code, customer_name, service_name, package_name, booking_date, start_time, end_time, slot_type, status')
    .neq('status', 'cancelled');

  if (startDateStr && endDateStr) {
    bookingsQuery = bookingsQuery.gte('booking_date', startDateStr).lte('booking_date', endDateStr);
  }

  const [availRes, bookingsRes] = await Promise.all([availQuery, bookingsQuery]);

  const rawAvail: AvailabilityRow[] = availRes.data || [];
  const rawBookings: any[] = bookingsRes.data || [];

  const mapMap = new Map<string, Availability>();

  for (const a of rawAvail) {
    const cleanDate = a.date.split('T')[0];
    mapMap.set(cleanDate, mapAvailability(a));
  }

  // Kelompokkan pemesanan berdasarkan tanggal
  const bookingsByDate = new Map<string, any[]>();
  for (const b of rawBookings) {
    if (!b.booking_date) continue;
    const cleanDate = b.booking_date.split('T')[0];
    if (!bookingsByDate.has(cleanDate)) {
      bookingsByDate.set(cleanDate, []);
    }
    bookingsByDate.get(cleanDate)!.push(b);
  }

  // Agregasikan pemesanan ke struktur Availability
  for (const [dateStr, bList] of bookingsByDate.entries()) {
    const existing = mapMap.get(dateStr);

    const weddingSlots: WeddingSlot[] = existing?.weddingSlots
      ? [...existing.weddingSlots]
      : [
          { id: 'w1', name: 'Sesi 1 (Pagi / Siang)', startTime: '08:00', endTime: '14:00', timeRange: '08:00 - 14:00 WIB', isBooked: false },
          { id: 'w2', name: 'Sesi 2 (Sore / Malam)', startTime: '15:00', endTime: '21:00', timeRange: '15:00 - 21:00 WIB', isBooked: false },
        ];

    const bookedTimeSlots: BookedTimeSlot[] = existing?.bookedTimeSlots ? [...existing.bookedTimeSlots] : [];

    let weddingBookedCount = 0;
    let nonWeddingBookedCount = 0;

    for (const b of bList) {
      const isWedding =
        (b.slot_type && b.slot_type.startsWith('wedding')) ||
        (b.service_name &&
          b.service_name.toLowerCase().includes('wedding') &&
          !b.service_name.toLowerCase().includes('pre-wedding'));

      if (isWedding) {
        weddingBookedCount++;
        if (b.slot_type === 'wedding_morning' || !weddingSlots[0].isBooked) {
          weddingSlots[0].isBooked = true;
          weddingSlots[0].bookedBy = b.customer_name;
        } else {
          weddingSlots[1].isBooked = true;
          weddingSlots[1].bookedBy = b.customer_name;
        }
      } else {
        nonWeddingBookedCount++;
        bookedTimeSlots.push({
          startTime: b.start_time || '09:00',
          endTime: b.end_time || '12:00',
          serviceCategory: b.service_name || b.package_name || 'Sesi Studio Photo',
          customerName: b.customer_name,
          bookingCode: b.booking_code,
        });
      }
    }

    // Hitung status otomatis berdasarkan kuota: Non-wedding Max 6, Wedding Max 2
    let computedStatus: AvailabilityStatus = 'available';
    if (existing?.status === 'blocked') {
      computedStatus = 'blocked';
    } else if (existing?.status === 'booked' || nonWeddingBookedCount >= 6 || weddingBookedCount >= 2) {
      computedStatus = 'booked';
    } else if (existing?.status === 'almost_full' || nonWeddingBookedCount >= 4 || weddingBookedCount >= 1) {
      computedStatus = 'almost_full';
    }

    mapMap.set(dateStr, {
      id: existing?.id || `avail-${dateStr}`,
      date: dateStr,
      status: computedStatus,
      notes: existing?.notes,
      weddingSlots,
      bookedTimeSlots,
    });
  }

  return Array.from(mapMap.values());
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
    if (!(await requireAdmin())) return { success: false, error: 'Unauthorized' };
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
    if (!(await requireAdmin())) return { success: false, error: 'Unauthorized' };
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

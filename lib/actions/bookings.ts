'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/actions/admin';
import { isValidUUID, isWeddingService } from '@/lib/utils';
import type { Database } from '@/lib/supabase/database.types';
import type { Booking, BookingStatus, PaymentStatus } from '@/lib/types';

type BookingRow = Database['public']['Tables']['bookings']['Row'];

function generateBookingCode(bookingDate: string): string {
  const d = new Date(bookingDate);
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const seq = String(Math.floor(Math.random() * 900) + 100);
  return `MS-${yy}${mm}${dd}-${seq}`;
}

function mapBooking(b: BookingRow): Booking {
  return {
    id: b.id,
    bookingCode: b.booking_code,
    customerName: b.customer_name,
    whatsapp: b.whatsapp,
    email: b.email,
    instagram: b.instagram ?? undefined,
    serviceId: b.service_id ?? '',
    serviceName: b.service_name ?? undefined,
    packageId: b.package_id ?? '',
    packageName: b.package_name ?? undefined,
    bookingDate: b.booking_date,
    startTime: b.start_time ?? undefined,
    endTime: b.end_time ?? undefined,
    slotType: (b.slot_type as Booking['slotType']) ?? undefined,
    location: b.location ?? '',
    eventType: b.event_type ?? undefined,
    notes: b.notes ?? undefined,
    status: b.status as BookingStatus,
    paymentStatus: (b.payment_status as PaymentStatus) ?? undefined,
    downPayment: b.down_payment ?? undefined,
    paidAmount: b.paid_amount ?? undefined,
    remainingAmount: b.remaining_amount ?? undefined,
    totalPrice: b.total_price ?? undefined,
    createdAt: b.created_at,
  };
}

// isValidUUID & isWeddingService diimport dari '@/lib/utils'

function parseTimeToMinutes(timeStr?: string | null): number | null {
  if (!timeStr || !timeStr.includes(':')) return null;
  const parts = timeStr.trim().split(':');
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
}

function isTimeOverlap(
  startA?: string | null,
  endA?: string | null,
  startB?: string | null,
  endB?: string | null
): boolean {
  const sA = parseTimeToMinutes(startA);
  const eA = parseTimeToMinutes(endA);
  const sB = parseTimeToMinutes(startB);
  const eB = parseTimeToMinutes(endB);

  if (sA === null || eA === null || sB === null || eB === null) return true;
  return sA < eB && eA > sB;
}

/** Public: submit booking baru dari customer */
export async function createBooking(
  formData: Omit<Booking, 'id' | 'bookingCode' | 'status' | 'createdAt'>
): Promise<{ success: boolean; bookingCode?: string; error?: string }> {
  const supabase = await createClient();

  // Validasi ketersediaan tanggal & bentrok jam di database Supabase
  if (formData.bookingDate) {
    // 1. Cek status ketersediaan tanggal dari tabel availability (blocked / booked override)
    const { data: dateAvailability } = await (supabase as any)
      .from('availability')
      .select('status, notes')
      .eq('date', formData.bookingDate)
      .maybeSingle();

    if (dateAvailability) {
      if (dateAvailability.status === 'blocked') {
        return {
          success: false,
          error: `Tanggal ${formData.bookingDate} sedang dikunci / libur studio${dateAvailability.notes ? ` (${dateAvailability.notes})` : ''}. Pemesanan tidak dapat diproses.`,
        };
      }
      if (dateAvailability.status === 'booked') {
        return {
          success: false,
          error: `Tanggal ${formData.bookingDate} sudah terisi penuh (booked). Pemesanan tidak dapat diproses.`,
        };
      }
    }

    // 2. Cek semua pesanan aktif yang sudah terdaftar pada tanggal yang sama di Supabase
    const { data: existingBookings, error: fetchErr } = await (supabase as any)
      .from('bookings')
      .select('id, booking_code, customer_name, service_name, package_name, booking_date, start_time, end_time, slot_type, status')
      .eq('booking_date', formData.bookingDate)
      .neq('status', 'cancelled');

    if (fetchErr) {
      console.error('Error checking existing bookings:', fetchErr.message);
    }

    if (existingBookings && existingBookings.length > 0) {
      const newSName = formData.serviceName || formData.packageName || '';
      const isNewWedding = newSName
        ? isWeddingService(newSName)
        : Boolean(formData.slotType && formData.slotType.startsWith('wedding'));

      const existingWeddingCount = existingBookings.filter((b: any) => {
        const sName = b.service_name || b.package_name || '';
        return sName
          ? isWeddingService(sName)
          : Boolean(b.slot_type && b.slot_type.startsWith('wedding'));
      }).length;

      const existingNonWeddingCount = existingBookings.length - existingWeddingCount;

      // Validasi batas kuota per hari
      if (isNewWedding && existingWeddingCount >= 2) {
        return {
          success: false,
          error: `Kuota pemesanan Wedding pada tanggal ${formData.bookingDate} sudah terisi penuh (maksimal 2 booking/hari). Silakan pilih tanggal lain.`,
        };
      }

      if (!isNewWedding && existingNonWeddingCount >= 6) {
        return {
          success: false,
          error: `Kuota pemesanan Sesi Studio pada tanggal ${formData.bookingDate} sudah terisi penuh (maksimal 6 booking/hari). Silakan pilih tanggal lain.`,
        };
      }

      // 3. VALIDASI BENTROK JAM (TIME OVERLAP VALIDATION)
      for (const b of existingBookings) {
        const bSName = b.service_name || b.package_name || '';
        const bIsWedding = bSName
          ? isWeddingService(bSName)
          : Boolean(b.slot_type && b.slot_type.startsWith('wedding'));

        if (isNewWedding === bIsWedding && isTimeOverlap(formData.startTime, formData.endTime, b.start_time, b.end_time)) {
          const serviceLabel = b.service_name || b.package_name || (isNewWedding ? 'Wedding Package' : 'Sesi Studio Photo');
          const timeText = b.start_time && b.end_time ? `${b.start_time} s/d ${b.end_time} WIB` : 'sepanjang hari';
          const suffix = isNewWedding ? '' : ' Silakan pilih jam lain!';
          return {
            success: false,
            error: `Jam sesi (${formData.startTime || '09:00'} - ${formData.endTime || '12:00'} WIB) pada tanggal ${formData.bookingDate} sudah terisi oleh pemesanan ${isNewWedding ? 'Wedding' : 'studio'} lain (${serviceLabel} - ${timeText}).${suffix}`,
          };
        }
      }
    }
  }

  const bookingCode = generateBookingCode(formData.bookingDate);

  const payload = {
    booking_code: bookingCode,
    customer_name: formData.customerName,
    whatsapp: formData.whatsapp,
    email: formData.email && formData.email.trim() ? formData.email.trim() : null,
    instagram: formData.instagram ?? null,
    service_id: isValidUUID(formData.serviceId) ? formData.serviceId : null,
    service_name: formData.serviceName ?? null,
    package_id: isValidUUID(formData.packageId) ? formData.packageId : null,
    package_name: formData.packageName ?? null,
    booking_date: formData.bookingDate,
    start_time: formData.startTime ?? null,
    end_time: formData.endTime ?? null,
    slot_type: formData.slotType ?? null,
    location: formData.location ?? null,
    event_type: formData.eventType ?? null,
    notes: formData.notes ?? null,
    status: 'pending',
    payment_status: 'unpaid',
    total_price: formData.totalPrice ?? null,
    down_payment: formData.downPayment ?? null,
    remaining_amount: formData.remainingAmount ?? null,
  };

  const { error } = await (supabase as any).from('bookings').insert(payload);
  if (error) return { success: false, error: error.message };
  return { success: true, bookingCode };
}

/** Public: ambil status booking berdasarkan booking code */
export async function getBookingByCode(
  code: string
): Promise<{ booking: Booking | null; error?: string }> {
  const supabase = await createClient();

  const { data, error } = await (supabase as any)
    .from('bookings')
    .select('*')
    .eq('booking_code', code.toUpperCase().trim())
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return { booking: null, error: 'Kode booking tidak ditemukan.' };
    }
    return { booking: null, error: error.message };
  }

  if (!data) return { booking: null, error: 'Kode booking tidak ditemukan.' };
  return { booking: mapBooking(data as BookingRow) };
}

/** Admin: ambil semua booking */
export async function getAllBookings(): Promise<Booking[]> {
  if (!(await requireAdmin())) return [];
  const supabase = createAdminClient();

  const { data, error } = await (supabase as any)
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return (data as BookingRow[]).map(mapBooking);
}

/** Admin: update status booking */
export async function updateBookingStatus(
  id: string,
  status: BookingStatus
): Promise<{ success: boolean; error?: string }> {
  if (!(await requireAdmin())) return { success: false, error: 'Unauthorized' };
  const supabase = createAdminClient();

  const payload = {
    status,
    updated_at: new Date().toISOString(),
  };

  const { error } = await (supabase as any).from('bookings').update(payload).eq('id', id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

/** Admin: update payment status */
export async function updatePaymentStatus(
  id: string,
  paymentStatus: PaymentStatus,
  paidAmount?: number
): Promise<{ success: boolean; error?: string }> {
  if (!(await requireAdmin())) return { success: false, error: 'Unauthorized' };
  const supabase = createAdminClient();

  const payload = {
    payment_status: paymentStatus,
    updated_at: new Date().toISOString(),
    ...(paidAmount !== undefined ? { paid_amount: paidAmount } : {}),
  };

  const { error } = await (supabase as any).from('bookings').update(payload).eq('id', id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

/** Admin: buat booking manual */
export async function createManualBooking(
  formData: Omit<Booking, 'id' | 'createdAt'>
): Promise<{ success: boolean; error?: string }> {
  if (!(await requireAdmin())) return { success: false, error: 'Unauthorized' };
  const supabase = createAdminClient();

  const payload = {
    booking_code: formData.bookingCode,
    customer_name: formData.customerName,
    whatsapp: formData.whatsapp,
    email: formData.email,
    instagram: formData.instagram ?? null,
    service_id: isValidUUID(formData.serviceId) ? formData.serviceId : null,
    service_name: formData.serviceName ?? null,
    package_id: isValidUUID(formData.packageId) ? formData.packageId : null,
    package_name: formData.packageName ?? null,
    booking_date: formData.bookingDate,
    start_time: formData.startTime ?? null,
    end_time: formData.endTime ?? null,
    slot_type: formData.slotType ?? null,
    location: formData.location ?? null,
    event_type: formData.eventType ?? null,
    notes: formData.notes ?? null,
    status: formData.status ?? 'confirmed',
    payment_status: formData.paymentStatus ?? 'unpaid',
    total_price: formData.totalPrice ?? null,
    down_payment: formData.downPayment ?? null,
    paid_amount: formData.paidAmount ?? null,
    remaining_amount: formData.remainingAmount ?? null,
  };

  const { error } = await (supabase as any).from('bookings').insert(payload);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

/** Admin: hapus booking */
export async function deleteBooking(
  id: string
): Promise<{ success: boolean; error?: string }> {
  if (!(await requireAdmin())) return { success: false, error: 'Unauthorized' };
  const supabase = createAdminClient();
  const { error } = await (supabase as any).from('bookings').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

/** Public: pembatalan booking oleh client */
export async function cancelBookingByClient(
  bookingId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { data: existing } = await (supabase as any)
      .from('bookings')
      .select('id, notes, status')
      .eq('id', bookingId)
      .single();

    if (!existing) return { success: false, error: 'Pemesanan tidak ditemukan.' };
    if (existing.status === 'cancelled') return { success: true };
    if (existing.status === 'completed') return { success: false, error: 'Pemesanan yang sudah selesai tidak dapat dibatalkan.' };

    const updatedNotes = [
      existing.notes,
      reason ? `[DIBATALKAN CLIENT]: ${reason}` : '[DIBATALKAN CLIENT]',
    ].filter(Boolean).join('\n');

    const { error } = await (supabase as any)
      .from('bookings')
      .update({
        status: 'cancelled',
        notes: updatedNotes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal membatalkan pemesanan.' };
  }
}

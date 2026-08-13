'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/actions/admin';
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

function isValidUUID(uuid?: string | null): boolean {
  if (!uuid) return false;
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
}

/** Public: submit booking baru dari customer */
export async function createBooking(
  formData: Omit<Booking, 'id' | 'bookingCode' | 'status' | 'createdAt'>
): Promise<{ success: boolean; bookingCode?: string; error?: string }> {
  const supabase = await createClient();

  // Validasi ketersediaan tanggal di database Supabase
  if (formData.bookingDate) {
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
  }

  const bookingCode = generateBookingCode(formData.bookingDate);

  const payload = {
    booking_code: bookingCode,
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

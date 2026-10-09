'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/actions/admin';
import { isValidUUID, isWeddingService, getTodayDateString, generateBookingCode } from '@/lib/utils';
import type { Database } from '@/lib/supabase/database.types';
import type { Booking, BookingStatus, PaymentStatus } from '@/lib/types';
import { sendAdminNotification } from '@/lib/notifications';
import { checkRateLimit } from '@/lib/rate-limit';
import { logAdminAudit } from '@/lib/audit-logger';

type BookingRow = Database['public']['Tables']['bookings']['Row'];


function mapBooking(b: BookingRow): Booking {
  return {
    id: b.id,
    bookingCode: b.booking_code,
    customerName: b.customer_name,
    whatsapp: b.whatsapp,
    email: b.email ?? undefined,
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
    driveFolderId: (b as any).drive_folder_id ?? undefined,
    driveFolderUrl: (b as any).drive_folder_url ?? undefined,
    selectionMaxCount: (b as any).selection_max_count ?? undefined,
    selectionDeadline: (b as any).selection_deadline ?? undefined,
    allowDownload: (b as any).allow_download ?? false,
    gallerySlug: (b as any).gallery_slug ?? undefined,
    galleryToken: (b as any).gallery_token ?? undefined,
    gallerySentAt: (b as any).gallery_sent_at ?? undefined,
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
    // 0. Validasi tanggal tidak boleh berada di masa lalu
    const todayStr = getTodayDateString();
    if (formData.bookingDate < todayStr) {
      return {
        success: false,
        error: `Tanggal pemesanan (${formData.bookingDate}) tidak boleh berada di masa lalu. Silakan pilih tanggal hari ini atau tanggal yang akan datang.`,
      };
    }

    // 1. Cek status ketersediaan tanggal dari tabel availability (blocked / booked override)

    const { data: dateAvailability } = await supabase
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
    const { data: existingBookings, error: fetchErr } = await supabase
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

  let bookingCode = generateBookingCode(formData.bookingDate);

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
    status: 'pending' as const,
    payment_status: 'unpaid' as const,
    total_price: formData.totalPrice ?? null,
    down_payment: formData.downPayment ?? null,
    remaining_amount: formData.remainingAmount ?? null,
  };

  // Retry jika kode bentrok (unique violation 23505)
  let error: any = null;
  for (let i = 0; i < 3; i++) {
    ({ error } = await supabase.from('bookings').insert(payload));
    if (!error || error.code !== '23505') break;
    payload.booking_code = bookingCode = generateBookingCode(formData.bookingDate);
  }
  if (error) return { success: false, error: error.message };

  // Kirim notifikasi ke admin dan tunggu hingga tersimpan
  await sendAdminNotification({
    type: 'booking',
    title: '📅 Booking Baru Masuk',
    body: `${formData.customerName} memesan ${formData.serviceName || formData.packageName || 'sesi foto'} pada ${formData.bookingDate}`,
    bookingId: bookingCode,
    url: `/admin/dashboard/bookings?search=${encodeURIComponent(bookingCode)}&openDetail=true`,
  });

  return { success: true, bookingCode };
}

/** Public: ambil status booking berdasarkan booking code */
export async function getBookingByCode(
  code: string
): Promise<{ booking: Booking | null; error?: string }> {
  if (!(await checkRateLimit('booking-status', 10))) {
    return { booking: null, error: 'Terlalu banyak percobaan. Coba lagi dalam 1 menit.' };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
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

  const { data, error } = await supabase
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

  const { error } = await supabase.from('bookings').update(payload).eq('id', id);
  if (error) return { success: false, error: error.message };

  await logAdminAudit('UPDATE_BOOKING_STATUS', id, { status });
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

  const { error } = await supabase.from('bookings').update(payload).eq('id', id);
  if (error) return { success: false, error: error.message };

  await logAdminAudit('UPDATE_PAYMENT_STATUS', id, { paymentStatus, paidAmount });
  return { success: true };
}

export interface UpdateBookingPayload {
  bookingDate?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  customerName?: string;
  whatsapp?: string;
  email?: string;
  instagram?: string;
  notes?: string;
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
  serviceId?: string;
  serviceName?: string;
  packageId?: string;
  packageName?: string;
  totalPrice?: number;
  downPayment?: number;
  paidAmount?: number;
  remainingAmount?: number;
  baseUpdatedAt?: string;
}

/** Admin: edit/update booking (misal pindah tanggal acara, jadwal, lokasi, atau info klien) */
export async function updateBooking(
  id: string,
  payload: UpdateBookingPayload
): Promise<{ success: boolean; error?: string; conflict?: boolean }> {
  if (!(await requireAdmin())) return { success: false, error: 'Unauthorized' };
  const supabase = createAdminClient();

  // 1. Conflict Detection: Bandingkan serverUpdatedAt dengan baseUpdatedAt lokal
  if (payload.baseUpdatedAt) {
    const { data: serverRecord } = await supabase
      .from('bookings')
      .select('updated_at, customer_name, booking_code')
      .eq('id', id)
      .single();

    if (serverRecord && serverRecord.updated_at) {
      const serverTime = new Date(serverRecord.updated_at).getTime();
      const localBaseTime = new Date(payload.baseUpdatedAt).getTime();

      // Jika server telah diperbarui setelah base snapshot lokal (toleransi 1000ms)
      if (serverTime - localBaseTime > 1000) {
        return {
          success: false,
          conflict: true,
          error: `Data pemesanan "${serverRecord.booking_code}" telah berubah di server (${new Date(serverRecord.updated_at).toLocaleTimeString('id-ID')}). Perubahan lokal ditangguhkan agar tidak menimpa data server.`,
        };
      }
    }
  }

  // 2. Validasi bentrok tanggal & jam jika tanggal/jam berubah
  if (payload.bookingDate || payload.startTime || payload.endTime) {
    // Ambil data booking saat ini untuk perbandingan
    const { data: current } = await supabase
      .from('bookings')
      .select('booking_date, start_time, end_time, service_name, package_name, slot_type, status')
      .eq('id', id)
      .single();

    if (current) {
      const checkDate = payload.bookingDate ?? current.booking_date;
      const checkStart = payload.startTime ?? current.start_time;
      const checkEnd = payload.endTime ?? current.end_time;

      // 1. Cek tabel availability (blocked / booked override)
      const { data: dateAvailability } = await supabase
        .from('availability')
        .select('status, notes')
        .eq('date', checkDate)
        .maybeSingle();

      if (dateAvailability?.status === 'blocked') {
        return {
          success: false,
          error: `Tanggal ${checkDate} sedang dikunci / libur studio${dateAvailability.notes ? ` (${dateAvailability.notes})` : ''}. Reschedule tidak dapat diproses.`,
        };
      }
      if (dateAvailability?.status === 'booked') {
        return {
          success: false,
          error: `Tanggal ${checkDate} sudah terisi penuh (booked). Reschedule tidak dapat diproses.`,
        };
      }

      // 2. Cek booking lain di tanggal yang sama, kecuali booking ini sendiri
      const { data: existingBookings } = await supabase
        .from('bookings')
        .select('id, booking_code, customer_name, service_name, package_name, start_time, end_time, slot_type, status')
        .eq('booking_date', checkDate)
        .neq('status', 'cancelled')
        .neq('id', id); // exclude booking yang sedang diedit

      if (existingBookings && existingBookings.length > 0) {
        const newSName = payload.serviceName ?? current.service_name ?? current.package_name ?? '';
        const isNewWedding = newSName
          ? isWeddingService(newSName)
          : Boolean((payload as any).slotType
            ? String((payload as any).slotType).startsWith('wedding')
            : current.slot_type && String(current.slot_type).startsWith('wedding'));

        // 3. Validasi bentrok jam (time overlap)
        for (const b of existingBookings) {
          const bSName = b.service_name || b.package_name || '';
          const bIsWedding = bSName
            ? isWeddingService(bSName)
            : Boolean(b.slot_type && String(b.slot_type).startsWith('wedding'));

          if (isNewWedding === bIsWedding && isTimeOverlap(checkStart, checkEnd, b.start_time, b.end_time)) {
            const timeText = b.start_time && b.end_time
              ? `${b.start_time} – ${b.end_time} WIB`
              : 'sepanjang hari';
            return {
              success: false,
              error: `Jam sesi (${checkStart || '?'} – ${checkEnd || '?'} WIB) pada tanggal ${checkDate} bentrok dengan booking ${b.booking_code} milik ${b.customer_name} (${timeText}). Pilih jam lain.`,
            };
          }
        }
      }
    }
  }

  const updateData: Database['public']['Tables']['bookings']['Update'] = {
    updated_at: new Date().toISOString(),
  };

  if (payload.bookingDate !== undefined) updateData.booking_date = payload.bookingDate;
  if (payload.startTime !== undefined) updateData.start_time = payload.startTime;
  if (payload.endTime !== undefined) updateData.end_time = payload.endTime;
  if (payload.location !== undefined) updateData.location = payload.location;
  if (payload.customerName !== undefined) updateData.customer_name = payload.customerName;
  if (payload.whatsapp !== undefined) updateData.whatsapp = payload.whatsapp;
  if (payload.email !== undefined) updateData.email = payload.email || null;
  if (payload.instagram !== undefined) updateData.instagram = payload.instagram;
  if (payload.notes !== undefined) updateData.notes = payload.notes;
  if (payload.status !== undefined) updateData.status = payload.status;
  if (payload.paymentStatus !== undefined) updateData.payment_status = payload.paymentStatus;
  if (payload.serviceId !== undefined) updateData.service_id = isValidUUID(payload.serviceId) ? payload.serviceId : null;
  if (payload.serviceName !== undefined) updateData.service_name = payload.serviceName;
  if (payload.packageId !== undefined) updateData.package_id = isValidUUID(payload.packageId) ? payload.packageId : null;
  if (payload.packageName !== undefined) updateData.package_name = payload.packageName;
  if (payload.totalPrice !== undefined) updateData.total_price = payload.totalPrice;
  if (payload.downPayment !== undefined) updateData.down_payment = payload.downPayment;
  if (payload.paidAmount !== undefined) updateData.paid_amount = payload.paidAmount;
  if (payload.remainingAmount !== undefined) updateData.remaining_amount = payload.remainingAmount;

  const { error } = await supabase
    .from('bookings')
    .update(updateData)
    .eq('id', id);

  if (error) return { success: false, error: error.message };

  await logAdminAudit('UPDATE_BOOKING', id, {
    customerName: payload.customerName,
    date: payload.bookingDate,
    status: payload.status,
    paymentStatus: payload.paymentStatus,
  });
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
    email: formData.email || null,
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

  const { error } = await supabase.from('bookings').insert(payload);
  if (error) return { success: false, error: error.message };

  await logAdminAudit('CREATE_MANUAL_BOOKING', formData.bookingCode, {
    customerName: formData.customerName,
    date: formData.bookingDate,
    totalPrice: formData.totalPrice,
  });
  return { success: true };
}

/** Admin: hapus booking */
export async function deleteBooking(
  id: string
): Promise<{ success: boolean; error?: string }> {
  if (!(await requireAdmin())) return { success: false, error: 'Unauthorized' };
  const supabase = createAdminClient();
  const { error } = await supabase.from('bookings').delete().eq('id', id);
  if (error) return { success: false, error: error.message };

  await logAdminAudit('DELETE_BOOKING', id);
  return { success: true };
}

export interface CancelBookingVerification {
  bookingCode: string;
  whatsapp?: string;
}

/** Public: pembatalan booking oleh client dengan proteksi verifikasi (Anti-IDOR) */
export async function cancelBookingByClient(
  bookingId: string,
  verification: CancelBookingVerification,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  // Rate limiting untuk mencegah abuse / brute-force endpoint pembatalan
  if (!(await checkRateLimit('client-cancel', 5, 60_000))) {
    return { success: false, error: 'Terlalu banyak permintaan. Silakan tunggu 1 menit.' };
  }

  const cleanCode = verification?.bookingCode?.trim().toUpperCase();
  if (!cleanCode) {
    return { success: false, error: 'Verifikasi kode booking diperlukan untuk membatalkan pesanan.' };
  }

  try {
    const supabase = await createClient();

    const { data: existing, error: fetchErr } = await supabase
      .from('bookings')
      .select('id, notes, status, booking_code, whatsapp')
      .eq('id', bookingId)
      .eq('booking_code', cleanCode)
      .single();

    if (fetchErr || !existing) {
      return { success: false, error: 'Pemesanan tidak ditemukan atau data verifikasi tidak cocok.' };
    }

    // Jika nomor whatsapp disertakan, periksa kecocokan nomor
    if (verification.whatsapp) {
      const cleanWaInput = verification.whatsapp.replace(/\D/g, '');
      const cleanWaDb = (existing.whatsapp || '').replace(/\D/g, '');
      if (cleanWaInput && cleanWaDb && !cleanWaDb.endsWith(cleanWaInput.slice(-8))) {
        return { success: false, error: 'Verifikasi kontak WhatsApp tidak cocok.' };
      }
    }

    if (existing.status === 'cancelled') return { success: true };
    if (existing.status === 'completed') {
      return { success: false, error: 'Pemesanan yang sudah selesai tidak dapat dibatalkan.' };
    }

    const updatedNotes = [
      existing.notes,
      reason ? `[DIBATALKAN CLIENT]: ${reason}` : '[DIBATALKAN CLIENT]',
    ].filter(Boolean).join('\n');

    const { error } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        notes: updatedNotes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId);

    if (error) return { success: false, error: error.message };
    await logAdminAudit('CLIENT_CANCEL_BOOKING', bookingId, { reason, bookingCode: cleanCode });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal membatalkan pemesanan.' };
  }
}

export interface SaveGallerySettingsInput {
  driveFolderUrl: string;
  driveFolderId?: string;
  selectionMaxCount: number;
  selectionDeadline: string;
  allowDownload: boolean;
  gallerySlug?: string;
  galleryToken?: string;
  gallerySentAt?: string;
}

export async function saveBookingGallerySettings(
  bookingId: string,
  input: SaveGallerySettingsInput
): Promise<{ success: boolean; error?: string; gallerySlug?: string; galleryToken?: string }> {
  try {
    if (!(await requireAdmin())) return { success: false, error: 'Unauthorized' };
    const supabase = createAdminClient();

    // Generate token if not providedi
    const galleryToken = input.galleryToken || Math.random().toString(36).substring(2, 12);

    // Extract folder id if not provided
    let folderId = input.driveFolderId;
    if (!folderId && input.driveFolderUrl) {
      const match =
        input.driveFolderUrl.match(/\/folders\/([a-zA-Z0-9_-]+)/) ||
        input.driveFolderUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (match) folderId = match[1];
    }

    const payload: any = {
      drive_folder_url: input.driveFolderUrl,
      drive_folder_id: folderId || null,
      selection_max_count: input.selectionMaxCount,
      selection_deadline: input.selectionDeadline,
      allow_download: input.allowDownload,
      gallery_token: galleryToken,
      updated_at: new Date().toISOString(),
    };

    if (input.gallerySlug) {
      payload.gallery_slug = input.gallerySlug;
    }
    if (input.gallerySentAt) {
      payload.gallery_sent_at = input.gallerySentAt;
    }

    const { error } = await supabase
      .from('bookings')
      .update(payload)
      .eq('id', bookingId);

    if (error) {
      console.error('[saveBookingGallerySettings] Database update error:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, gallerySlug: input.gallerySlug, galleryToken };
  } catch (err: any) {
    console.error('Error saving gallery settings:', err);
    return { success: false, error: err?.message || 'Gagal menyimpan pengaturan galeri' };
  }
}


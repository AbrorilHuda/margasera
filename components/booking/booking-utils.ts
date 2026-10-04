import type { Service } from '@/lib/types';

export const BOOKING_DRAFT_KEY = 'margasera_booking_draft_v1';

export interface BookingDraft {
  currentStep: number;
  selectedServiceId: string;
  selectedPackageId: string;
  selectedDate: string;
  startTime: string;
  endTime: string;
  slotType: 'wedding_morning' | 'wedding_afternoon' | 'wedding_fullday' | 'custom';
  customerName: string;
  partnerName: string;
  whatsapp: string;
  email: string;
  instagram: string;
  location: string;
  notes: string;
  draftDocId: string;
}

/** Menghasilkan Kode Referensi Dokumen Pra-Reservasi dengan 6 karakter kriptografi acak (huruf & angka) */
export function generateCryptoDocId(): string {
  const today = new Date();
  const yymmdd = today.toISOString().slice(2, 10).replace(/-/g, '');
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let token = '';
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const bytes = new Uint8Array(6);
    window.crypto.getRandomValues(bytes);
    for (let i = 0; i < 6; i++) {
      token += chars[bytes[i] % chars.length];
    }
  } else {
    for (let i = 0; i < 6; i++) {
      token += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  return `MS-PRSV-${yymmdd}-${token}`;
}

/** Validasi nomor HP seluler Indonesia (08xx, 628xx, +628xx antara 10 - 14 digit) */
export function validateIndonesianPhone(phone: string): { isValid: boolean; message?: string } {
  const clean = phone.replace(/[\s\-\(\)\.]/g, '');
  if (!clean) {
    return { isValid: false, message: 'Nomor WhatsApp wajib diisi.' };
  }
  if (!/^(\+628|628|08)/.test(clean)) {
    return {
      isValid: false,
      message: 'Nomor telepon harus nomor Indonesia yang diawali 08, 628, atau +628.',
    };
  }
  const digitsOnly = clean.replace(/\D/g, '');
  const effectiveLen = clean.startsWith('+62') || clean.startsWith('62')
    ? digitsOnly.length - 1
    : digitsOnly.length;

  if (effectiveLen < 10) {
    return {
      isValid: false,
      message: `Nomor telepon terlalu pendek (${effectiveLen} digit). Minimal 10 digit (contoh: 081234567890).`,
    };
  }
  if (effectiveLen > 14) {
    return {
      isValid: false,
      message: `Nomor telepon terlalu panjang (${effectiveLen} digit). Maksimal 14 digit.`,
    };
  }
  const afterPrefix = clean.replace(/^(\+628|628|08)/, '');
  if (afterPrefix.length >= 8 && /^(\d)\1+$/.test(afterPrefix)) {
    return {
      isValid: false,
      message: 'Nomor WhatsApp tidak valid. Masukkan nomor kontak aktif.',
    };
  }

  return { isValid: true };
}

/** Validasi nama lengkap (minimal 3 karakter, tidak boleh angka/simbol aneh saja) */
export function validateFullName(name: string, label = 'Nama Lengkap'): { isValid: boolean; message?: string } {
  const trimmed = name.trim();
  if (!trimmed) {
    return { isValid: false, message: `${label} wajib diisi.` };
  }
  if (trimmed.length < 3) {
    return {
      isValid: false,
      message: `${label} terlalu pendek (minimal 3 karakter, tidak boleh cuma "${trimmed}").`,
    };
  }
  if (!/^[a-zA-Z\u00C0-\u024F\s\.\',\-]+$/.test(trimmed)) {
    return {
      isValid: false,
      message: `${label} hanya boleh berisi huruf dan tanda baca nama yang wajar.`,
    };
  }
  return { isValid: true };
}

/** Helper untuk mengekstrak durasi dalam menit (misal: "45 Menit", "30 mnt", "1.5 Jam", "6 Jam", "Full Day") */
export function getDurationInMinutes(durationStr: string): number {
  if (!durationStr) return 240; // Default 4 hours
  const lower = durationStr.toLowerCase().trim();

  if (lower.includes('unlimited') || lower.includes('full day') || lower.includes('seharian')) {
    return 720; // 12 hours
  }

  const isMinute = lower.includes('menit') || lower.includes('mnt') || lower.includes('min');
  const floatMatch = lower.match(/(\d+(?:[\.,]\d+)?)/);
  if (!floatMatch) return 240;

  const val = parseFloat(floatMatch[1].replace(',', '.'));
  if (isNaN(val)) return 240;

  if (isMinute) {
    return Math.round(val);
  } else {
    return Math.round(val * 60);
  }
}

/** Menghitung jam selesai berdasarkan jam mulai dan string durasi paket */
export function calculateEndTime(startStr: string, durationStr: string): string {
  if (!startStr) return '14:00';
  const [h, m] = startStr.split(':').map(Number);
  if (isNaN(h)) return '14:00';
  const startMins = h * 60 + (m || 0);
  const durationMins = getDurationInMinutes(durationStr);
  const totalEndMins = (startMins + durationMins) % (24 * 60);
  const endH = Math.floor(totalEndMins / 60);
  const endM = totalEndMins % 60;
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
}

/** Mendeteksi apakah layanan termasuk couple/wedding/lamaran yang membutuhkan nama pasangan */
export function isCoupleService(service?: Service): boolean {
  if (!service) return false;
  const s = (service.slug || service.name || '').toLowerCase();
  return (
    s.includes('wedding') ||
    s.includes('pre-wedding') ||
    s.includes('prewedding') ||
    s.includes('engagement') ||
    s.includes('tunangan') ||
    s.includes('lamaran')
  );
}

/** Mengecek info ketersediaan studio pada tanggal tertentu */
export function getSelectedDateInfo(
  availabilityData: import('@/lib/types').Availability[],
  dateStr: string
): { status: import('@/lib/types').AvailabilityStatus; notes?: string } {
  if (!dateStr) return { status: 'available', notes: undefined };
  const found = availabilityData.find(
    (a) => a.date && a.date.split('T')[0] === dateStr.split('T')[0]
  );
  if (found) return { status: found.status, notes: found.notes };
  return { status: 'available', notes: undefined };
}

/** Mengecek konflik jadwal dan slot kuota sesi foto */
export function getSelectedDateConflict(
  availabilityData: import('@/lib/types').Availability[],
  selectedDate: string,
  startTime: string,
  endTime: string,
  selectedService?: Service
): { hasConflict: boolean; reason?: string } {
  if (!selectedDate) return { hasConflict: false };

  const dateEntry = availabilityData.find(
    (a) => a.date && a.date.split('T')[0] === selectedDate.split('T')[0]
  );

  if (!dateEntry) return { hasConflict: false };

  const formattedDate = new Date(selectedDate).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  if (dateEntry.status === 'blocked') {
    return { hasConflict: true, reason: `Tanggal ${formattedDate} sedang dikunci / libur studio.` };
  }
  if (dateEntry.status === 'booked') {
    return { hasConflict: true, reason: `Tanggal ${formattedDate} sudah terisi penuh (booked).` };
  }

  const isWeddingService =
    selectedService?.slug === 'wedding' ||
    (selectedService?.name &&
      selectedService.name.toLowerCase().includes('wedding') &&
      !selectedService.name.toLowerCase().includes('pre-wedding') &&
      !selectedService.name.toLowerCase().includes('prewedding'));

  const toMins = (tStr?: string) => {
    if (!tStr || !tStr.includes(':')) return null;
    const [h, m] = tStr.split(':').map(Number);
    return isNaN(h) || isNaN(m) ? null : h * 60 + m;
  };

  if (isWeddingService) {
    const weddingSlots = dateEntry.weddingSlots || [];
    const bookedWeddingCount = weddingSlots.filter((s) => s.isBooked).length;
    if (bookedWeddingCount >= 2) {
      return {
        hasConflict: true,
        reason: `Kuota Wedding pada tanggal ${formattedDate} sudah terisi penuh (maksimal 2 booking/hari).`,
      };
    }

    const sA = toMins(startTime);
    if (sA !== null) {
      if (sA < 14 * 60 && weddingSlots[0]?.isBooked) {
        return {
          hasConflict: true,
          reason: `Slot Wedding Sesi 1 (Pagi / Siang) pada tanggal ${formattedDate} sudah terisi (${weddingSlots[0].bookedBy || 'Klien Wedding'}). Silakan pilih Sesi 2 (Sore / Malam).`,
        };
      }
      if (sA >= 14 * 60 && weddingSlots[1]?.isBooked) {
        return {
          hasConflict: true,
          reason: `Slot Wedding Sesi 2 (Sore / Malam) pada tanggal ${formattedDate} sudah terisi (${weddingSlots[1].bookedBy || 'Klien Wedding'}). Silakan pilih Sesi 1 (Pagi / Siang).`,
        };
      }
    }
    return { hasConflict: false };
  }

  const sA = toMins(startTime);
  const eA = toMins(endTime);

  if (sA !== null && eA !== null) {
    if (dateEntry.bookedTimeSlots && dateEntry.bookedTimeSlots.length > 0) {
      for (const bts of dateEntry.bookedTimeSlots) {
        const sB = toMins(bts.startTime);
        const eB = toMins(bts.endTime);
        if (sB !== null && eB !== null && sA < eB && eA > sB) {
          const category = bts.serviceCategory || 'Sesi Studio';
          return {
            hasConflict: true,
            reason: `Jam sesi (${startTime} - ${endTime} WIB) bentrok dengan jadwal studio yang sudah terisi (${category} jam ${bts.startTime} - ${bts.endTime} WIB). Silakan pilih jam lain.`,
          };
        }
      }
    }
  }

  return { hasConflict: false };
}


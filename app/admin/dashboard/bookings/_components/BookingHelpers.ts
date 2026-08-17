import type { Booking } from '@/lib/types';

/** Generate URL untuk tambah event ke Google Calendar dari data booking */
export function generateGoogleCalendarUrl(b: Booking): string {
  const title = encodeURIComponent(`[Margasera] ${b.serviceName || 'Photography'} - ${b.customerName} (${b.bookingCode})`);
  const cleanDate = b.bookingDate.replace(/-/g, '');
  const startT = (b.startTime || '08:00').replace(':', '') + '00';
  const endT = (b.endTime || '14:00').replace(':', '') + '00';
  const dates = `${cleanDate}T${startT}/${cleanDate}T${endT}`;
  const details = encodeURIComponent(
    `Kode Booking: ${b.bookingCode}\n` +
    `Client: ${b.customerName}\n` +
    `WhatsApp: ${b.whatsapp}\n` +
    `Layanan: ${b.serviceName || '-'} (${b.packageName || '-'})\n` +
    `Jam Sesi: ${b.startTime || '08:00'} - ${b.endTime || '14:00'} WIB\n` +
    `Lokasi: ${b.location || '-'}\n` +
    `Catatan: ${b.notes || '-'}`
  );
  const loc = encodeURIComponent(b.location || 'Pamekasan');
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${loc}`;
}

/**
 * Hitung jam selesai sesi secara otomatis berdasarkan jam mulai dan string durasi paket.
 * Contoh durasi: "6 Jam", "90 Menit", "Full Day", "Seharian"
 */
export function calculateEndTime(startTime: string, durationStr: string): string {
  if (!startTime) return '14:00';
  const [h, m] = startTime.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return '14:00';

  let addMinutes = 360; // default 6 jam

  const lower = (durationStr || '').toLowerCase();
  const jamMatch = lower.match(/(\d+)\s*jam/);
  const menitMatch = lower.match(/(\d+)\s*menit/);

  if (jamMatch && jamMatch[1]) {
    addMinutes = Number(jamMatch[1]) * 60;
  } else if (menitMatch && menitMatch[1]) {
    addMinutes = Number(menitMatch[1]);
  } else if (lower.includes('full day') || lower.includes('seharian')) {
    addMinutes = 600;
  }

  const totalMinutes = h * 60 + m + addMinutes;
  const endH = Math.floor(totalMinutes / 60) % 24;
  const endM = totalMinutes % 60;

  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
}

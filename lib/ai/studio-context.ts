import { getServices, getPackages } from '@/lib/actions/services';
import { fetchStudioSettings } from '@/lib/data/settings';
import { formatCurrency } from '@/lib/utils';

interface CacheEntry {
  text: string;
  expiry: number;
}

let cachedContext: CacheEntry | null = null;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 menit

/**
 * Menghasilkan ringkasan data studio, layanan, dan paket Margasera
 * untuk disuntikkan ke dalam System Instruction Gemini.
 * Menggunakan in-memory cache 10 menit agar tidak membebani Supabase.
 */
export async function getStudioAiContext(): Promise<string> {
  const now = Date.now();
  if (cachedContext && cachedContext.expiry > now) {
    return cachedContext.text;
  }

  try {
    const [settings, services, packages] = await Promise.all([
      fetchStudioSettings(),
      getServices(),
      getPackages(),
    ]);

    const packagesByService = new Map<string, typeof packages>();
    for (const pkg of packages) {
      const sName = pkg.serviceName || 'Umum';
      const existing = packagesByService.get(sName) || [];
      existing.push(pkg);
      packagesByService.set(sName, existing);
    }

    let packageSummary = '';
    for (const [serviceName, pkgs] of packagesByService.entries()) {
      packageSummary += `\n### Layanan: ${serviceName}\n`;
      for (const p of pkgs) {
        packageSummary += `- **${p.name}**: ${formatCurrency(p.price)} | Durasi: ${p.duration || 'Fleksibel'} | Fotografer: ${p.photographerCount || 1} orang\n`;
        if (p.editedPhotos) {
          packageSummary += `  Foto diedit: ${p.editedPhotos}\n`;
        }
        if (p.features && p.features.length > 0) {
          packageSummary += `  Fasilitas: ${p.features.join(', ')}\n`;
        }
        if (p.description) {
          packageSummary += `  Catatan: ${p.description}\n`;
        }
        packageSummary += `  Link Booking Langsung: /booking?service=${p.serviceId}&package=${p.id}\n`;
      }
    }

    const contextText = `
DATA RESMI MARGASERA PHOTOGRAPHY (SUMBER KEBENARAN TUNGGAL):
Nama Studio: ${settings.studioName || 'Margasera Photography'}
Lokasi / Alamat: ${settings.address || 'Pamekasan, Madura, Jawa Timur'}
WhatsApp Admin: ${settings.whatsapp || '0812-xxxx-xxxx'}
Instagram: @${settings.instagram?.replace('@', '') || 'margasera.id'}
Website: https://margasera.id

KETENTUAN PEMESANAN & PEMBAYARAN:
1. Pemesanan sesi foto dapat dilakukan secara mandiri melalui menu Formulir Booking online di website: /booking
2. Pembayaran DP (Down Payment) dapat dilakukan via transfer bank atau QRIS resmi Margasera.
3. Klien dapat mengecek tanggal yang tersedia di menu Jadwal / Ketersediaan (/availability).
4. Untuk konsultasi konsep khusus, negosiasi acara di luar kota, atau tanya ketersediaan mendadak, klien dapat diarahkan ke WhatsApp Admin: [Chat WhatsApp Admin](/api/wa).

DAFTAR PAKET & HARGA AKTIF:
${packageSummary || 'Semua paket dapat dicek langsung di halaman /services atau formulir /booking.'}
`.trim();

    cachedContext = {
      text: contextText,
      expiry: now + CACHE_TTL_MS,
    };

    return contextText;
  } catch (err) {
    console.error('[AI_CONTEXT] Gagal memuat data studio:', err);
    return 'Margasera Photography adalah studio fotografi profesional di Pamekasan, Madura untuk wedding, pre-wedding, wisuda, portrait, dan event.';
  }
}

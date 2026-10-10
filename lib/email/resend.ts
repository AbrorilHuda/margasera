import { Resend } from 'resend';
import { fetchStudioSettings } from '@/lib/data/settings';
import {
  renderBookingConfirmationEmail,
  type BookingEmailData,
} from './templates/booking-confirmation';
import {
  renderThankYouReviewEmail,
  type ThankYouReviewEmailData,
} from './templates/thank-you-review';

interface SendBookingConfirmationParams extends BookingEmailData {
  to: string;
}

export interface SendThankYouReviewParams extends ThankYouReviewEmailData {
  to: string;
}

/**
 * Mengirimkan email konfirmasi booking otomatis ke klien menggunakan Resend.
 * Aman dan non-blocking: jika API key belum diset atau pengiriman gagal,
 * proses booking utama tetap berhasil.
 */
export async function sendBookingConfirmationEmail(
  params: SendBookingConfirmationParams
): Promise<{ success: boolean; id?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn(
      '[Resend] RESEND_API_KEY belum dikonfigurasi di .env.local. Email konfirmasi klien dilewati.'
    );
    return { success: false, error: 'RESEND_API_KEY_NOT_CONFIGURED' };
  }

  const recipient = (params.to || '').trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!recipient || !emailRegex.test(recipient)) {
    return { success: false, error: 'INVALID_RECIPIENT_EMAIL' };
  }

  try {
    const resend = new Resend(apiKey);
    const settings = await fetchStudioSettings();

    // Default sender: gunakan domain custom jika ada, atau fallback ke onboarding@resend.dev
    const studioName = settings.studioName || 'Margasera Photography';
    const fromEmail =
      process.env.RESEND_FROM_EMAIL || `${studioName} <onboarding@resend.dev>`;

    const { subject, html, text } = renderBookingConfirmationEmail(params, settings);

    const result = await resend.emails.send({
      from: fromEmail,
      to: [recipient],
      subject,
      html,
      text,
    });

    if (result.error) {
      console.error('[Resend] Gagal mengirim email ke klien:', result.error);
      return { success: false, error: result.error.message };
    }

    console.log(
      `[Resend] Berhasil mengirim email konfirmasi booking ke ${recipient} (ID: ${result.data?.id})`
    );
    return { success: true, id: result.data?.id };
  } catch (err: any) {
    console.error('[Resend] Terjadi kesalahan saat memproses pengiriman email:', err);
    return { success: false, error: err.message || 'Unknown error' };
  }
}

/**
 * Mengirimkan email ucapan terima kasih & ajakan ulasan/testimoni ke klien
 * ketika admin mengubah status menjadi 'completed' (selesai) atau pembayaran menjadi 'paid_full' (lunas).
 * Hanya dikirim jika klien menginputkan email (jika kosong, dilewati tanpa error).
 */
export async function sendThankYouReviewEmail(
  params: SendThankYouReviewParams
): Promise<{ success: boolean; id?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn(
      '[Resend] RESEND_API_KEY belum dikonfigurasi di .env.local. Email terima kasih klien dilewati.'
    );
    return { success: false, error: 'RESEND_API_KEY_NOT_CONFIGURED' };
  }

  const recipient = (params.to || '').trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!recipient || !emailRegex.test(recipient)) {
    // Klien tidak menginput email atau format salah -> lewati tanpa error
    return { success: false, error: 'INVALID_RECIPIENT_EMAIL' };
  }

  try {
    const resend = new Resend(apiKey);
    const settings = await fetchStudioSettings();

    const studioName = settings.studioName || 'Margasera Photography';
    const fromEmail =
      process.env.RESEND_FROM_EMAIL || `${studioName} <onboarding@resend.dev>`;

    const { subject, html, text } = renderThankYouReviewEmail(params, settings);

    const result = await resend.emails.send({
      from: fromEmail,
      to: [recipient],
      subject,
      html,
      text,
    });

    if (result.error) {
      console.error('[Resend] Gagal mengirim email terima kasih & ulasan ke klien:', result.error);
      return { success: false, error: result.error.message };
    }

    console.log(
      `[Resend] Berhasil mengirim email terima kasih & ulasan ke ${recipient} (ID: ${result.data?.id})`
    );
    return { success: true, id: result.data?.id };
  } catch (err: any) {
    console.error('[Resend] Terjadi kesalahan saat memproses pengiriman email terima kasih:', err);
    return { success: false, error: err.message || 'Unknown error' };
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { fetchStudioSettings } from '@/lib/data/settings';

export const dynamic = 'force-dynamic';

/**
 * Redirect internal domain margasera.id -> api.whatsapp.com
 * Mencegah filter spam/peringatan domain mismatch di Resend & penyedia email (Gmail/Outlook).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'general';
  const code = (searchParams.get('code') || '').replace(/[^a-zA-Z0-9-]/g, '').slice(0, 40);
  const customText = searchParams.get('text')?.slice(0, 300);

  const settings = await fetchStudioSettings();
  const cleanPhone = (settings.whatsapp || '6281931107481').replace(/\D/g, '');
  const waNumber = cleanPhone.startsWith('0') ? `62${cleanPhone.slice(1)}` : cleanPhone;

  let message = 'Halo Admin Margasera, saya ingin bertanya terkait layanan studio.';

  if (action === 'confirm' && code) {
    message = `Halo Admin Margasera, saya ingin konfirmasi pembayaran DP untuk Kode Booking: ${code}.`;
  } else if (action === 'thanks' && code) {
    message = `Halo Admin Margasera, saya (Kode Booking: ${code}). Terima kasih atas pelayanannya!`;
  } else if (customText) {
    message = customText;
  }

  const targetUrl = `https://api.whatsapp.com/send?phone=${waNumber}&text=${encodeURIComponent(message)}`;
  return NextResponse.redirect(targetUrl, 307);
}

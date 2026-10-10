import { formatCurrency, formatDate, escapeHtml } from '@/lib/utils';
import type { StudioSettings } from '@/lib/types';
import { DEFAULT_STUDIO_SETTINGS } from '@/lib/constants';

export interface ThankYouReviewEmailData {
  customerName: string;
  bookingCode: string;
  serviceName: string;
  packageName: string;
  bookingDate: string;
  totalPrice?: number | null;
  paidAmount?: number | null;
  triggerType?: 'completed' | 'paid_full';
}

export function renderThankYouReviewEmail(
  data: ThankYouReviewEmailData,
  settings: StudioSettings = DEFAULT_STUDIO_SETTINGS
): { subject: string; html: string; text: string } {
  const {
    customerName,
    bookingCode,
    serviceName,
    packageName,
    bookingDate,
    totalPrice = 0,
    triggerType = 'completed',
  } = data;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://margasera.id';
  const reviewUrl = `${siteUrl}/testimoni?code=${encodeURIComponent(bookingCode)}`;
  const statusUrl = `${siteUrl}/booking/status?code=${encodeURIComponent(bookingCode)}`;

  // Gunakan redirect domain internal agar URL selaras dengan domain pengirim (mencegah filter spam Resend)
  const waUrl = `${siteUrl}/api/wa?action=thanks&code=${encodeURIComponent(bookingCode)}`;

  const formattedDate = formatDate(bookingDate);

  const subject =
    triggerType === 'paid_full'
      ? `Terima Kasih atas Pembayaran Lunas — ${bookingCode} Margasera Photography`
      : `Terima Kasih Telah Memilih Margasera Photography — ${bookingCode}`;

  const text = `
HALO ${customerName.toUpperCase()}! 👋

Terima kasih banyak telah mempercayakan dokumentasi momen berharga Anda kepada ${settings.studioName}.
Merupakan sebuah kehormatan bagi seluruh tim kami dapat menjadi bagian dari kisah indah Anda.

INFORMASI PESANAN:
- Kode Booking : ${bookingCode}
- Layanan      : ${serviceName}
- Paket        : ${packageName}
- Tanggal Sesi : ${formattedDate}
- Total Biaya  : ${formatCurrency(totalPrice || 0)} (LUNAS)
- Status Sesi  : ${triggerType === 'paid_full' ? 'Pembayaran Lunas' : 'Selesai'}

BAGIKAN CERITA & ULASAN ANDA ⭐⭐⭐⭐⭐
Pengalaman dan masukan Anda sangat berarti bagi kami untuk terus memberikan karya terbaik.
Silakan berikan ulasan Anda melalui tautan berikut:
${reviewUrl}

Cek status booking & galeri foto online:
${statusUrl}

Ada pertanyaan atau butuh bantuan lebih lanjut? Hubungi kami via WhatsApp:
${waUrl}

"Moment Satu Hari Untuk Selamanya"
Salam hangat,
${settings.studioName}
${settings.address || 'Pamekasan, Madura'}
  `.trim();

  const html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #F8FAFC;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #0F172A;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #F8FAFC;
      padding: 32px 16px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid #E2E8F0;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
    }
    .header {
      background-color: #FFFFFF;
      padding: 32px 28px 20px 28px;
      text-align: center;
      border-top: 5px solid #0066CC;
      border-bottom: 1px solid #F1F5F9;
    }
    .logo-img {
      max-height: 54px;
      width: auto;
      margin: 0 auto 12px auto;
      display: block;
    }
    .header h1 {
      margin: 0;
      font-size: 18px;
      letter-spacing: 2px;
      text-transform: uppercase;
      font-weight: 800;
      color: #0F172A;
    }
    .header p {
      margin: 4px 0 0 0;
      font-size: 11px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #0066CC;
      font-weight: 600;
    }
    .content {
      padding: 32px 28px;
    }
    .greeting {
      font-size: 20px;
      font-weight: 700;
      color: #0F172A;
      margin-top: 0;
      margin-bottom: 8px;
    }
    .intro {
      font-size: 14px;
      color: #475569;
      line-height: 1.6;
      margin-top: 0;
      margin-bottom: 24px;
    }
    .status-badge {
      display: inline-block;
      background-color: #ECFDF5;
      color: #059669;
      border: 1px solid #A7F3D0;
      padding: 6px 14px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.5px;
      margin-bottom: 20px;
    }
    .info-box {
      background-color: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 18px 20px;
      margin-bottom: 28px;
    }
    .info-table {
      width: 100%;
      border-collapse: collapse;
    }
    .info-table td {
      padding: 8px 0;
      font-size: 13px;
      vertical-align: top;
      border-bottom: 1px solid #F1F5F9;
    }
    .info-table tr:last-child td {
      border-bottom: none;
    }
    .info-label {
      color: #64748B;
      width: 40%;
      font-weight: 500;
    }
    .info-value {
      color: #0F172A;
      font-weight: 600;
      text-align: right;
    }
    .review-card {
      background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%);
      border: 2px solid #FDE68A;
      border-radius: 14px;
      padding: 24px 20px;
      text-align: center;
      margin-bottom: 28px;
    }
    .review-stars {
      font-size: 24px;
      letter-spacing: 4px;
      color: #F59E0B;
      margin-bottom: 8px;
    }
    .review-title {
      font-size: 16px;
      font-weight: 700;
      color: #78350F;
      margin-bottom: 6px;
    }
    .review-desc {
      font-size: 13px;
      color: #92400E;
      line-height: 1.5;
      margin: 0 auto 16px auto;
      max-width: 460px;
    }
    .btn-review {
      display: inline-block;
      background-color: #0066CC;
      color: #FFFFFF !important;
      text-decoration: none;
      font-weight: 700;
      font-size: 14px;
      padding: 13px 28px;
      border-radius: 10px;
      box-shadow: 0 4px 10px rgba(0, 102, 204, 0.25);
    }
    .review-hint {
      font-size: 11px;
      color: #B45309;
      margin-top: 10px;
    }
    .btn-group {
      text-align: center;
      margin: 20px 0 12px 0;
    }
    .btn-secondary {
      display: inline-block;
      background-color: #F1F5F9;
      color: #334155 !important;
      text-decoration: none;
      font-weight: 600;
      font-size: 13px;
      padding: 10px 20px;
      border-radius: 8px;
      margin: 4px;
    }
    .btn-whatsapp {
      display: inline-block;
      background-color: #25D366;
      color: #FFFFFF !important;
      text-decoration: none;
      font-weight: 600;
      font-size: 13px;
      padding: 10px 20px;
      border-radius: 8px;
      margin: 4px;
    }
    .footer {
      background-color: #F8FAFC;
      border-top: 1px solid #E2E8F0;
      padding: 24px 28px;
      text-align: center;
      font-size: 12px;
      color: #64748B;
      line-height: 1.6;
    }
    .footer a {
      color: #0066CC;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <!-- HEADER -->
      <div class="header" style="background-color: #FFFFFF; padding: 32px 28px 20px 28px; text-align: center; border-top: 5px solid #0066CC; border-bottom: 1px solid #F1F5F9;">
        <img
          src="${siteUrl}/logo.png"
          alt="${settings.studioName || 'Margasera Photography'}"
          class="logo-img"
          style="max-height: 54px; width: auto; margin: 0 auto 12px auto; display: block;"
        />
        <h1 style="margin: 0; font-size: 18px; letter-spacing: 2px; text-transform: uppercase; font-weight: 800; color: #0F172A;">${settings.studioName || 'MARGASERA PHOTOGRAPHY'}</h1>
        <p style="margin: 4px 0 0 0; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: #0066CC; font-weight: 600;">Studio &amp; Visual Storyteller</p>
      </div>

      <!-- CONTENT -->
      <div class="content" style="padding: 32px 28px;">
        <div style="text-align: center;">
          <div class="status-badge">
            ✓ ${triggerType === 'paid_full' ? 'PEMBAYARAN LUNAS DITERIMA' : 'SESI FOTOGRAFI SELESAI'}
          </div>
        </div>

        <h2 class="greeting" style="font-size: 20px; font-weight: 700; color: #0F172A; margin-top: 0; margin-bottom: 8px;">
          Terima Kasih Banyak, ${escapeHtml(customerName)}! ✨
        </h2>
        <p class="intro" style="font-size: 14px; color: #475569; line-height: 1.6; margin-top: 0; margin-bottom: 24px;">
          Merupakan sebuah kebahagiaan dan kehormatan besar bagi seluruh tim <strong>${escapeHtml(settings.studioName)}</strong> dapat menjadi bagian dalam mendokumentasikan momen istimewa Anda. Kami berharap setiap potret yang kami abadikan dapat membawa senyuman indah untuk Anda dan keluarga selamanya.
        </p>

        <!-- KOTAK DETAIL SESI -->
        <div class="info-box" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px 20px; margin-bottom: 28px;">
          <table class="info-table" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td class="info-label" style="padding: 8px 0; font-size: 13px; color: #64748B; width: 40%; font-weight: 500; border-bottom: 1px solid #F1F5F9;">Kode Booking</td>
              <td class="info-value" style="padding: 8px 0; font-size: 13px; color: #0066CC; font-family: monospace; font-weight: 700; text-align: right; border-bottom: 1px solid #F1F5F9;">${escapeHtml(bookingCode)}</td>
            </tr>
            <tr>
              <td class="info-label" style="padding: 8px 0; font-size: 13px; color: #64748B; width: 40%; font-weight: 500; border-bottom: 1px solid #F1F5F9;">Layanan</td>
              <td class="info-value" style="padding: 8px 0; font-size: 13px; color: #0F172A; font-weight: 600; text-align: right; border-bottom: 1px solid #F1F5F9;">${escapeHtml(serviceName)}</td>
            </tr>
            <tr>
              <td class="info-label" style="padding: 8px 0; font-size: 13px; color: #64748B; width: 40%; font-weight: 500; border-bottom: 1px solid #F1F5F9;">Paket</td>
              <td class="info-value" style="padding: 8px 0; font-size: 13px; color: #0F172A; font-weight: 600; text-align: right; border-bottom: 1px solid #F1F5F9;">${escapeHtml(packageName)}</td>
            </tr>
            <tr>
              <td class="info-label" style="padding: 8px 0; font-size: 13px; color: #64748B; width: 40%; font-weight: 500; border-bottom: 1px solid #F1F5F9;">Tanggal Sesi</td>
              <td class="info-value" style="padding: 8px 0; font-size: 13px; color: #0F172A; font-weight: 600; text-align: right; border-bottom: 1px solid #F1F5F9;">${formattedDate}</td>
            </tr>
            <tr>
              <td class="info-label" style="padding: 8px 0; font-size: 13px; color: #64748B; width: 40%; font-weight: 500;">Status Pembayaran</td>
              <td class="info-value" style="padding: 8px 0; font-size: 13px; color: #059669; font-weight: 700; text-align: right;">${formatCurrency(totalPrice || 0)} (Lunas)</td>
            </tr>
          </table>
        </div>

        <!-- KARTU AJAKAN REVIEW / TESTIMONI (HIGHLIGHT UTAMA) -->
        <div class="review-card" style="background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%); border: 2px solid #FDE68A; border-radius: 14px; padding: 24px 20px; text-align: center; margin-bottom: 28px;">
          <div class="review-stars" style="font-size: 24px; letter-spacing: 4px; color: #F59E0B; margin-bottom: 8px;">★★★★★</div>
          <div class="review-title" style="font-size: 16px; font-weight: 700; color: #78350F; margin-bottom: 6px;">
            Cerita &amp; Ulasan Anda Sangat Berarti Bagi Kami
          </div>
          <div class="review-desc" style="font-size: 13px; color: #92400E; line-height: 1.5; margin: 0 auto 16px auto; max-width: 460px;">
            Bagikan kesan, cerita bahagia, atau pengalaman Anda selama sesi foto bersama Margasera. Ulasan Anda membantu calon klien lain dan memotivasi kami untuk selalu memberikan karya terbaik.
          </div>
          <a
            href="${reviewUrl}"
            target="_blank"
            class="btn-review"
            style="display: inline-block; background-color: #0066CC; color: #FFFFFF !important; text-decoration: none; font-weight: 700; font-size: 14px; padding: 13px 28px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0, 102, 204, 0.25);"
          >
            ⭐ Tulis Ulasan / Testimoni Anda
          </a>
          <div class="review-hint" style="font-size: 11px; color: #B45309; margin-top: 10px;">
            💡 Cukup 1 menit — Kode booking Anda akan otomatis terverifikasi.
          </div>
        </div>

        <!-- TOMBOL AKSI TAMBAHAN -->
        <div class="btn-group" style="text-align: center; margin: 20px 0 12px 0;">
          <a
            href="${statusUrl}"
            target="_blank"
            class="btn-secondary"
            style="display: inline-block; background-color: #F1F5F9; color: #334155 !important; text-decoration: none; font-weight: 600; font-size: 13px; padding: 10px 20px; border-radius: 8px; margin: 4px;"
          >
            🔍 Cek Status Booking &amp; Galeri
          </a>
          <a
            href="${waUrl}"
            target="_blank"
            class="btn-whatsapp"
            style="display: inline-block; background-color: #25D366; color: #FFFFFF !important; text-decoration: none; font-weight: 600; font-size: 13px; padding: 10px 20px; border-radius: 8px; margin: 4px;"
          >
            💬 WhatsApp Kami
          </a>
        </div>
      </div>

      <!-- FOOTER -->
      <div class="footer" style="background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 24px 28px; text-align: center; font-size: 12px; color: #64748B; line-height: 1.6;">
        <p style="margin: 0 0 8px 0; font-style: italic; color: #94A3B8;">&ldquo;Moment Satu Hari Untuk Selamanya&rdquo;</p>
        <p style="margin: 0 0 4px 0; font-weight: 600; color: #334155;">${settings.studioName || 'Margasera Photography'}</p>
        <p style="margin: 0 0 8px 0;">${settings.address || 'Pamekasan, Madura, Jawa Timur'}</p>
        <p style="margin: 0;">
          <a href="${siteUrl}" style="color: #0066CC; text-decoration: none;">margasera.id</a>
          &bull;
          <a href="https://instagram.com/${(settings.instagram || 'margasera').replace('@', '')}" style="color: #0066CC; text-decoration: none;">Instagram</a>
          &bull;
          <a href="${reviewUrl}" style="color: #0066CC; text-decoration: none;">Beri Ulasan</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();

  return { subject, html, text };
}

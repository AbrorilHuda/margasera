import { formatCurrency, formatDate, escapeHtml } from '@/lib/utils';
import type { StudioSettings } from '@/lib/types';
import { DEFAULT_STUDIO_SETTINGS } from '@/lib/constants';

export interface BookingEmailData {
  customerName: string;
  bookingCode: string;
  serviceName: string;
  packageName: string;
  bookingDate: string;
  startTime?: string | null;
  endTime?: string | null;
  location?: string | null;
  notes?: string | null;
  totalPrice?: number | null;
  downPayment?: number | null;
  remainingAmount?: number | null;
}

export function renderBookingConfirmationEmail(
  data: BookingEmailData,
  settings: StudioSettings = DEFAULT_STUDIO_SETTINGS
): { subject: string; html: string; text: string } {
  const {
    customerName,
    bookingCode,
    serviceName,
    packageName,
    bookingDate,
    startTime,
    endTime,
    location,
    notes,
    totalPrice = 0,
    downPayment = 0,
    remainingAmount = 0,
  } = data;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://margasera.id';
  const statusUrl = `${siteUrl}/booking/status?code=${encodeURIComponent(bookingCode)}`;
  
  // Gunakan redirect domain internal agar URL selaras dengan domain pengirim (mencegah filter spam Resend)
  const waUrl = `${siteUrl}/api/wa?action=confirm&code=${encodeURIComponent(bookingCode)}`;

  const formattedDate = formatDate(bookingDate);
  const timeLabel = startTime && endTime ? `${startTime} – ${endTime} WIB` : startTime ? `${startTime} WIB` : 'Sesuai Jadwal Studio';

  const subject = `Bukti Pemesanan: ${bookingCode} — Margasera Photography`;

  const text = `
HALO ${customerName.toUpperCase()}!
Terima kasih telah melakukan pemesanan di ${settings.studioName}.

KODE BOOKING ANDA: ${bookingCode}
Status: Menunggu Pembayaran DP / Konfirmasi Admin

RINCIAN PEMESANAN:
- Layanan: ${serviceName}
- Paket: ${packageName}
- Tanggal Sesi: ${formattedDate}
- Waktu: ${timeLabel}
- Lokasi: ${location || 'Studio Margasera'}
${notes ? `- Catatan: ${notes}\n` : ''}
RINCIAN BIAYA:
- Total Biaya: ${formatCurrency(totalPrice || 0)}
- Uang Muka (DP): ${formatCurrency(downPayment || 0)}
- Sisa Pelunasan: ${formatCurrency(remainingAmount || 0)}

REKENING PEMBAYARAN:
- Bank: ${settings.bankName || 'BCA'}
- No. Rekening: ${settings.bankAccountNumber || '-'}
- Atas Nama: ${settings.bankAccountHolder || settings.ownerName}

Cek status booking online: ${statusUrl}
Konfirmasi WhatsApp: ${waUrl}

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
      max-height: 56px;
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
      font-size: 18px;
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
    .code-card {
      background-color: #F0F7FF;
      border: 2px dashed #0066CC;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      margin-bottom: 28px;
    }
    .code-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #0066CC;
      margin-bottom: 4px;
    }
    .code-val {
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
      font-size: 24px;
      font-weight: 800;
      color: #0F172A;
      letter-spacing: 1px;
      margin: 4px 0;
    }
    .code-badge {
      display: inline-block;
      margin-top: 6px;
      padding: 4px 10px;
      background-color: #FEF3C7;
      color: #92400E;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .section-title {
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #0066CC;
      border-bottom: 1px solid #E2E8F0;
      padding-bottom: 8px;
      margin-top: 24px;
      margin-bottom: 16px;
    }
    .info-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    .info-table td {
      padding: 8px 0;
      font-size: 13px;
      vertical-align: top;
      border-bottom: 1px solid #F1F5F9;
    }
    .info-label {
      color: #64748B;
      width: 38%;
      font-weight: 500;
    }
    .info-value {
      color: #0F172A;
      font-weight: 600;
      text-align: right;
    }
    .payment-box {
      background-color: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 18px 20px;
      margin-bottom: 28px;
    }
    .bank-title {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      color: #334155;
      margin-bottom: 10px;
    }
    .bank-details {
      font-size: 13px;
      color: #0F172A;
      line-height: 1.6;
    }
    .bank-acc {
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
      font-size: 16px;
      font-weight: 800;
      color: #0066CC;
      letter-spacing: 0.5px;
    }
    .btn-group {
      text-align: center;
      margin: 28px 0 12px 0;
    }
    .btn-primary {
      display: inline-block;
      background-color: #0066CC;
      color: #FFFFFF !important;
      text-decoration: none;
      font-weight: 700;
      font-size: 13px;
      padding: 13px 26px;
      border-radius: 10px;
      margin: 6px;
      box-shadow: 0 2px 6px rgba(0, 102, 204, 0.25);
    }
    .btn-secondary {
      display: inline-block;
      background-color: #25D366;
      color: #FFFFFF !important;
      text-decoration: none;
      font-weight: 700;
      font-size: 13px;
      padding: 13px 26px;
      border-radius: 10px;
      margin: 6px;
      box-shadow: 0 2px 6px rgba(37, 211, 102, 0.25);
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
      <div class="content">
        <h2 class="greeting">Halo, ${escapeHtml(customerName)}! 👋</h2>
        <p class="intro">
          Terima kasih telah mempercayakan momen berharga Anda kepada <strong>${escapeHtml(settings.studioName)}</strong>. 
          Pemesanan jadwal sesi foto Anda telah kami terima dan tercatat di sistem kami.
        </p>

        <!-- KARTU KODE BOOKING -->
        <div class="code-card">
          <div class="code-label">KODE BOOKING ANDA</div>
          <div class="code-val">${escapeHtml(bookingCode)}</div>
          <div class="code-badge">Menunggu Konfirmasi / DP</div>
        </div>

        <!-- RINCIAN SESI FOTO -->
        <div class="section-title">Detail Sesi Fotografi</div>
        <table class="info-table">
          <tr>
            <td class="info-label">Layanan</td>
            <td class="info-value">${escapeHtml(serviceName)}</td>
          </tr>
          <tr>
            <td class="info-label">Paket Dipilih</td>
            <td class="info-value">${escapeHtml(packageName)}</td>
          </tr>
          <tr>
            <td class="info-label">Tanggal Pemotretan</td>
            <td class="info-value">${formattedDate}</td>
          </tr>
          <tr>
            <td class="info-label">Waktu Sesi</td>
            <td class="info-value">${timeLabel}</td>
          </tr>
          <tr>
            <td class="info-label">Lokasi</td>
            <td class="info-value">${escapeHtml(location || 'Margasera Studio')}</td>
          </tr>
          ${notes ? `
          <tr>
            <td class="info-label">Catatan Klien</td>
            <td class="info-value">${escapeHtml(notes)}</td>
          </tr>
          ` : ''}
        </table>

        <!-- RINCIAN PEMBAYARAN -->
        <div class="section-title">Rincian Pembayaran</div>
        <table class="info-table">
          <tr>
            <td class="info-label">Total Biaya Paket</td>
            <td class="info-value">${formatCurrency(totalPrice || 0)}</td>
          </tr>
          <tr>
            <td class="info-label">Uang Muka (DP) Wajib</td>
            <td class="info-value" style="color: #0066CC; font-weight: 700;">${formatCurrency(downPayment || 0)}</td>
          </tr>
          <tr>
            <td class="info-label">Sisa Pelunasan (H-Event)</td>
            <td class="info-value">${formatCurrency(remainingAmount || 0)}</td>
          </tr>
        </table>

        <!-- PETUNJUK TRANSFER REKENING -->
        <div class="payment-box">
          <div class="bank-title">💳 Rekening Transfer Resmi Margasera:</div>
          <div class="bank-details">
            Bank: <strong>${settings.bankName || 'BCA'}</strong><br>
            Nomor Rekening: <span class="bank-acc">${settings.bankAccountNumber || '-'}</span><br>
            Atas Nama: <strong>${settings.bankAccountHolder || settings.ownerName}</strong>
          </div>
          <p style="margin: 10px 0 0 0; font-size: 11px; color: #64748B;">
            * Harap konfirmasi bukti transfer via WhatsApp agar jadwal pemotretan Anda langsung dikunci dan berstatus <strong>Confirmed</strong>.
          </p>
        </div>

        <!-- TOMBOL AKSI CEPAT -->
        <div class="btn-group">
          <a href="${statusUrl}" target="_blank" class="btn-primary">
            🔍 Cek Status Booking Online
          </a>
          <a href="${waUrl}" target="_blank" class="btn-secondary">
            💬 Konfirmasi DP via WhatsApp
          </a>
        </div>
      </div>

      <!-- FOOTER -->
      <div class="footer">
        <p style="margin: 0 0 4px 0;">
          <strong>${settings.studioName}</strong> — ${settings.address || 'Pamekasan, Madura'}
        </p>
        <p style="margin: 0 0 8px 0;">
          Instagram: <a href="https://instagram.com/${(settings.instagram || 'margasera').replace('@', '')}">@${(settings.instagram || 'margasera').replace('@', '')}</a>
          &nbsp;•&nbsp;
          Website: <a href="${siteUrl}">${siteUrl.replace('https://', '')}</a>
        </p>
        <p style="margin: 0; font-size: 11px; color: #94A3B8;">
          Email ini dikirim otomatis oleh sistem pemesanan online Margasera Photography. Jika Anda merasa tidak melakukan pemesanan ini, silakan hubungi admin kami.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();

  return { subject, html, text };
}

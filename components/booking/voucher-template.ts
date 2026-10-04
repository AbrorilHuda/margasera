import type { Service, Package, StudioSettings } from '@/lib/types';
import { formatCurrency, formatDate, getTimeOfDayLabel } from '@/lib/utils';

export interface VoucherTemplateParams {
  customerName: string;
  partnerName: string;
  whatsapp: string;
  email: string;
  instagram: string;
  location: string;
  selectedService?: Service;
  selectedPackage?: Package;
  selectedDate: string;
  startTime: string;
  endTime: string;
  draftDocId: string;
  studioSettings: StudioSettings;
}

export function generateVoucherHtml(params: VoucherTemplateParams): string {
  const {
    customerName,
    partnerName,
    whatsapp,
    email,
    instagram,
    location,
    selectedService,
    selectedPackage,
    selectedDate,
    startTime,
    endTime,
    draftDocId,
    studioSettings,
  } = params;

  const docNumber = draftDocId || 'MS-PRSV-DRAFT';
  const depositAmount =
    selectedPackage?.downPayment && selectedPackage.downPayment > 0
      ? selectedPackage.downPayment
      : Math.ceil((selectedPackage?.price || 0) * 0.2);
  const remainingAmount = (selectedPackage?.price || 0) - depositAmount;

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Voucher Pra-Reservasi Margasera - ${customerName || 'Client'}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,700;1,400&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #0f172a;
      background: #f8fafc;
      padding: 30px 15px;
    }
    .voucher-card {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
      overflow: hidden;
      position: relative;
    }
    .voucher-body {
      padding: 36px 40px;
    }
    .kop-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0066CC;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .brand-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 24px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #0f172a;
      font-weight: 700;
    }
    .brand-subtitle {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: #0066CC;
      font-weight: 600;
      margin-top: 3px;
    }
    .brand-tagline {
      font-size: 11px;
      color: #64748b;
      font-style: italic;
      margin-top: 4px;
    }
    .doc-meta {
      text-align: right;
    }
    .doc-badge {
      display: inline-block;
      padding: 4px 10px;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #0066CC;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      border-radius: 6px;
      margin-bottom: 6px;
    }
    .doc-num {
      font-family: monospace;
      font-size: 12px;
      font-weight: 700;
      color: #334155;
    }
    .doc-date {
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
    }
    .doc-title-box {
      text-align: center;
      margin-bottom: 24px;
      padding: 14px;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px dashed #cbd5e1;
    }
    .doc-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 18px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #0f172a;
      font-weight: 700;
    }
    .doc-sub {
      font-size: 11px;
      color: #64748b;
      margin-top: 3px;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 24px;
    }
    .info-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 16px;
    }
    .card-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #0066CC;
      margin-bottom: 12px;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 6px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      padding: 5px 0;
      border-bottom: 1px solid #f8fafc;
    }
    .info-label {
      color: #64748b;
    }
    .info-value {
      font-weight: 600;
      color: #0f172a;
      text-align: right;
    }
    .table-container {
      margin-bottom: 24px;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      overflow: hidden;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    th {
      background: #f1f5f9;
      padding: 10px 14px;
      text-align: left;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #475569;
      font-size: 11px;
    }
    td {
      padding: 12px 14px;
      border-top: 1px solid #f1f5f9;
    }
    .total-box {
      background: #f8fafc;
      padding: 16px;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
      margin-bottom: 24px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 0;
      font-size: 13px;
    }
    .total-grand {
      font-size: 16px;
      font-weight: 700;
      color: #0066CC;
      border-top: 1px solid #cbd5e1;
      padding-top: 8px;
      margin-top: 6px;
    }
    .bank-box {
      background: #f0f7ff;
      border: 1px solid #bfdbfe;
      border-radius: 10px;
      padding: 14px 16px;
      margin-bottom: 24px;
    }
    .terms-box {
      font-size: 11px;
      color: #64748b;
      line-height: 1.6;
      border-top: 1px solid #e2e8f0;
      padding-top: 14px;
      margin-bottom: 24px;
    }
    .terms-box ol {
      padding-left: 18px;
    }
    .terms-box li {
      margin-bottom: 4px;
    }
    .stamp-container {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-top: 16px;
    }
    .signature-area {
      text-align: center;
      font-size: 11px;
      width: 180px;
    }
    .seal-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border: 2px dashed #0066CC;
      background: #eff6ff;
      color: #0066CC;
      font-weight: 700;
      font-size: 11px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      border-radius: 8px;
    }
    @media print {
      body { background: white; padding: 0; }
      .voucher-card { border: none; box-shadow: none; max-width: 100%; border-radius: 0; }
    }
  </style>
</head>
<body>
  <div class="voucher-card">
    <div class="voucher-body">
      <div class="kop-header">
        <div style="display: flex; align-items: center; gap: 16px;">
          <img src="/logo.png" alt="Margasera Logo" style="height: 48px; width: auto; object-fit: contain;" />
          <div style="border-left: 1px solid #cbd5e1; padding-left: 14px;">
            <div class="brand-title">MARGASERA</div>
            <div class="brand-subtitle">Photography &amp; Visual Storytelling</div>
            <div class="brand-tagline">&ldquo;Moment Satu Hari Untuk Selamanya&rdquo;</div>
          </div>
        </div>
        <div class="doc-meta">
          <div class="doc-badge">PRA-RESERVASI DOKUMEN</div>
          <div class="doc-num">${docNumber}</div>
          <div class="doc-date">Tanggal Terbit: ${formatDate(new Date().toISOString())}</div>
        </div>
      </div>

      <div class="doc-title-box">
        <div class="doc-title">Surat Ikhtisar Pra-Reservasi Sesi Dokumentasi</div>
        <div class="doc-sub">Dokumen resmi ringkasan spesifikasi sesi sebelum konfirmasi dan pembayaran Down Payment (DP)</div>
      </div>

      <div class="grid-2">
        <div class="info-card">
          <div class="card-title">I. INFORMASI KLIEN / PEMESAN</div>
          <div class="info-row">
            <span class="info-label">Nama Lengkap</span>
            <span class="info-value">${customerName || '-'}</span>
          </div>
          ${partnerName ? `
          <div class="info-row">
            <span class="info-label">Nama Pasangan</span>
            <span class="info-value">${partnerName}</span>
          </div>` : ''}
          <div class="info-row">
            <span class="info-label">WhatsApp</span>
            <span class="info-value">${whatsapp || '-'}</span>
          </div>
          ${email.trim() ? `
          <div class="info-row">
            <span class="info-label">Email</span>
            <span class="info-value">${email.trim()}</span>
          </div>` : ''}
          <div class="info-row">
            <span class="info-label">Instagram</span>
            <span class="info-value">${instagram || '-'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Lokasi / Venue</span>
            <span class="info-value">${location || '-'}</span>
          </div>
        </div>

        <div class="info-card">
          <div class="card-title">II. SPESIFIKASI SESI &amp; JADWAL</div>
          <div class="info-row">
            <span class="info-label">Layanan</span>
            <span class="info-value">${selectedService?.name || '-'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Paket Dokumentasi</span>
            <span class="info-value">${selectedPackage?.name || '-'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Tanggal Pelaksanaan</span>
            <span class="info-value">${formatDate(selectedDate)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Waktu Sesi (WIB)</span>
            <span class="info-value">${startTime} – ${endTime} WIB (${getTimeOfDayLabel(startTime)})</span>
          </div>
          <div class="info-row">
            <span class="info-label">Durasi Paket</span>
            <span class="info-value">${selectedPackage?.duration || '-'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Tim Fotografer</span>
            <span class="info-value">${selectedPackage?.photographerCount || 1} Fotografer</span>
          </div>
        </div>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Rincian Paket Dokumentasi</th>
              <th style="text-align: center;">Durasi</th>
              <th style="text-align: center;">Tim</th>
              <th style="text-align: right;">Investasi</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong style="color: #0f172a;">${selectedPackage?.name || '-'}</strong> (${selectedService?.name || '-' })<br/>
                <span style="font-size: 11px; color: #64748b;">${selectedPackage?.description || 'Dokumentasi eksklusif Margasera Photography'}</span>
              </td>
              <td style="text-align: center; font-family: monospace;">${selectedPackage?.duration || '-'}</td>
              <td style="text-align: center;">${selectedPackage?.photographerCount || 1} Fotografer</td>
              <td style="text-align: right; font-weight: 700; color: #0066CC; font-size: 13px;">${formatCurrency(selectedPackage?.price || 0)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="total-box">
        <div class="total-row">
          <span>Total Nilai Investasi:</span>
          <span style="font-weight: 600;">${formatCurrency(selectedPackage?.price || 0)}</span>
        </div>
        <div class="total-row">
          <span style="color: #b45309; font-weight: 600;">Minimal Down Payment (DP) Terkunci (20%):</span>
          <span style="font-weight: 700; color: #b45309; font-size: 14px;">${formatCurrency(depositAmount)}</span>
        </div>
        <div class="total-row total-grand">
          <span>Estimasi Sisa Pelunasan (H-Day):</span>
          <span>${formatCurrency(remainingAmount)}</span>
        </div>
      </div>

      <div class="bank-box">
        <div style="font-size: 11px; font-weight: 700; color: #0066CC; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.05em;">
          REKENING RESMI PEMBAYARAN DOWN PAYMENT (DP)
        </div>
        <div style="font-size: 12px; color: #334155;">
          Bank: <strong>${studioSettings.bankName.toUpperCase()}</strong> &nbsp;|&nbsp;
          No. Rekening: <strong style="font-family: monospace; font-size: 13px;">${studioSettings.bankAccountNumber}</strong> &nbsp;|&nbsp;
          a.n <strong>${studioSettings.bankAccountHolder}</strong>
        </div>
      </div>

      <div class="terms-box">
        <strong style="color: #334155;">Ketentuan &amp; Kebijakan Pra-Reservasi:</strong>
        <ol>
          <li>Dokumen pra-reservasi ini diterbitkan otomatis oleh sistem reservasi digital Margasera Photography.</li>
          <li>Jadwal tanggal dan waktu sesi foto dinyatakan <strong>TERKUNCI (LOCKED)</strong> setelah bukti transfer Down Payment (DP) diverifikasi Admin.</li>
          <li>Pelunasan sisa biaya paket dilakukan paling lambat pada hari sesi pemotretan berlangsung (H-Day).</li>
          <li>Perubahan jadwal (reschedule) diperkenankan maksimal H-7 acara dengan konfirmasi ke Customer Service Margasera.</li>
        </ol>
      </div>

      <div class="stamp-container">
        <div class="signature-area">
          <div style="color: #64748b; font-size: 11px;">Pemesan / Klien,</div>
          <div style="height: 56px; display: flex; align-items: flex-end; justify-content: center; border-bottom: 1px solid #94a3b8; margin: 4px auto 6px; padding-bottom: 4px;">
            <span style="font-style: italic; color: #94a3b8; font-size: 11px;">(Tertanda Digital)</span>
          </div>
          <div style="font-weight: 700; font-size: 11px;">${customerName || 'Klien'}</div>
        </div>
        <div>
          <div class="seal-badge">
            MARGASERA OFFICIAL VERIFIED
          </div>
        </div>
        <div class="signature-area">
          <div style="color: #64748b; font-size: 11px;">Margasera Management,</div>
          <div style="height: 56px; display: flex; align-items: center; justify-content: center; border-bottom: 1px solid #94a3b8; margin: 4px auto 6px;">
          </div>
          <div style="font-weight: 700; font-family: monospace; font-size: 11px;">Tim Administrasi Margasera</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export function downloadVoucherDocument(params: VoucherTemplateParams): void {
  const htmlContent = generateVoucherHtml(params);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Voucher-Reservasi-Margasera-${(params.customerName || 'Client').replace(/\s+/g, '_')}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

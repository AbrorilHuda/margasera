import type { Package, StudioSettings } from '@/lib/types';
import { formatCurrency, formatDate, getTimeOfDayLabel } from '@/lib/utils';

export interface BookingCardImageParams {
  bookingCode: string;
  customerName: string;
  selectedDate: string;
  startTime: string;
  endTime: string;
  selectedPackage?: Package;
  studioSettings: StudioSettings;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Menggambar kartu booking resmi ke dalam HTML5 Canvas dan mengunduhnya sebagai file gambar (.PNG)
 */
export async function downloadBookingCardImage(params: BookingCardImageParams): Promise<void> {
  const {
    bookingCode,
    customerName,
    selectedDate,
    startTime,
    endTime,
    selectedPackage,
    studioSettings,
  } = params;

  const depositAmount =
    selectedPackage?.downPayment && selectedPackage.downPayment > 0
      ? selectedPackage.downPayment
      : Math.ceil((selectedPackage?.price || 0) * 0.2);

  // Dimensi kartu HD
  const cardWidth = 720;
  const cardHeight = 980;
  const scale = 2; // 2x Retina Resolution

  const canvas = document.createElement('canvas');
  canvas.width = cardWidth * scale;
  canvas.height = cardHeight * scale;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Gagal menginisialisasi Canvas Context');

  ctx.scale(scale, scale);

  // 1. Background Luar
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(0, 0, cardWidth, cardHeight);

  // 2. Card Container dengan Border & Soft Shadow
  const margin = 20;
  const innerW = cardWidth - margin * 2;
  const innerH = cardHeight - margin * 2;

  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1.5;
  drawRoundedRect(ctx, margin, margin, innerW, innerH, 24);
  ctx.fill();
  ctx.stroke();

  // 4. Load Margasera Logo
  try {
    const logoImg = new Image();
    logoImg.crossOrigin = 'anonymous';
    logoImg.src = '/logo.png';
    await new Promise((resolve) => {
      logoImg.onload = resolve;
      logoImg.onerror = resolve; // Graceful fallback
    });

    if (logoImg.complete && logoImg.naturalWidth > 0) {
      const logoH = 46;
      const logoW = (logoImg.naturalWidth / logoImg.naturalHeight) * logoH;
      ctx.drawImage(logoImg, margin + 24, margin + 28, logoW, logoH);

      // Vertical line after logo
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(margin + 24 + logoW + 16, margin + 28);
      ctx.lineTo(margin + 24 + logoW + 16, margin + 28 + logoH);
      ctx.stroke();

      // Brand text
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 15px Georgia, serif';
      ctx.fillText('MARGASERA', margin + 24 + logoW + 28, margin + 46);

      ctx.fillStyle = '#0066CC';
      ctx.font = '600 9px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('PHOTOGRAPHY & VISUAL STORYTELLING', margin + 24 + logoW + 28, margin + 62);
    } else {
      // Text fallback if logo image is unavailable
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 22px Georgia, serif';
      ctx.fillText('MARGASERA', margin + 24, margin + 55);

      ctx.fillStyle = '#0066CC';
      ctx.font = '600 10px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('PHOTOGRAPHY STUDIO', margin + 24, margin + 72);
    }
  } catch {
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 22px Georgia, serif';
    ctx.fillText('MARGASERA', margin + 24, margin + 55);
  }

  // 5. Header Right: Official Pass Badge
  const badgeW = 160;
  const badgeH = 32;
  const badgeX = margin + innerW - badgeW - 24;
  const badgeY = margin + 35;

  ctx.fillStyle = '#EFF6FF';
  ctx.strokeStyle = '#BFDBFE';
  ctx.lineWidth = 1;
  drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 16);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#0066CC';
  ctx.font = 'bold 10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('DIGITAL BOOKING PASS', badgeX + badgeW / 2, badgeY + 20);
  ctx.textAlign = 'left';

  // 6. Section Divider Line
  ctx.strokeStyle = '#F1F5F9';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(margin + 24, margin + 96);
  ctx.lineTo(margin + innerW - 24, margin + 96);
  ctx.stroke();

  // 7. Booking Code Highlight Box (Hero Ticket Element)
  const codeBoxY = margin + 116;
  const codeBoxH = 130;
  const codeBoxW = innerW - 48;
  const codeBoxX = margin + 24;

  ctx.fillStyle = '#F8FAFC';
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 1;
  drawRoundedRect(ctx, codeBoxX, codeBoxY, codeBoxW, codeBoxH, 18);
  ctx.fill();
  ctx.stroke();

  // Inner Code Box Accent line
  ctx.fillStyle = '#0066CC';
  ctx.fillRect(codeBoxX + 24, codeBoxY + 18, 4, 32);

  ctx.fillStyle = '#64748B';
  ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('KODE RESERVASI RESMI ANDA', codeBoxX + 36, codeBoxY + 32);

  ctx.fillStyle = '#94A3B8';
  ctx.font = '10px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Gunakan kode ini untuk tracking status pemesanan', codeBoxX + 36, codeBoxY + 46);

  // The Big Booking Code
  ctx.fillStyle = '#0066CC';
  ctx.font = 'bold 36px monospace';
  ctx.letterSpacing = '3px';
  ctx.fillText(bookingCode, codeBoxX + 24, codeBoxY + 98);
  ctx.letterSpacing = '0px';

  // Status Chip inside box
  const chipW = 100;
  const chipH = 26;
  const chipX = codeBoxX + codeBoxW - chipW - 20;
  const chipY = codeBoxY + 80;

  ctx.fillStyle = '#ECFDF5';
  ctx.strokeStyle = '#A7F3D0';
  ctx.lineWidth = 1;
  drawRoundedRect(ctx, chipX, chipY, chipW, chipH, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#059669';
  ctx.font = 'bold 10px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('MENUNGGU DP', chipX + chipW / 2, chipY + 17);
  ctx.textAlign = 'left';

  // 8. Grid Details: Client & Session Info
  const detailsY = codeBoxY + codeBoxH + 26;

  const drawInfoRow = (
    label: string,
    value: string,
    x: number,
    y: number,
    w: number,
    isHighlighted = false
  ) => {
    ctx.fillStyle = '#64748B';
    ctx.font = '11px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(label, x, y);

    ctx.fillStyle = isHighlighted ? '#0066CC' : '#0F172A';
    ctx.font = isHighlighted
      ? 'bold 14px "Plus Jakarta Sans", sans-serif'
      : '600 13px "Plus Jakarta Sans", sans-serif';

    // Truncate if text is too wide
    let displayVal = value;
    while (ctx.measureText(displayVal).width > w && displayVal.length > 5) {
      displayVal = displayVal.slice(0, -4) + '...';
    }
    ctx.fillText(displayVal, x, y + 20);
  };

  const col1X = margin + 28;
  const col2X = margin + innerW / 2 + 10;
  const colW = innerW / 2 - 40;

  // Row 1
  drawInfoRow('Nama Klien / Pemesan', customerName || 'Klien Margasera', col1X, detailsY, colW);
  drawInfoRow('Paket Dokumentasi', selectedPackage?.name || 'Paket Sesi', col2X, detailsY, colW, true);

  // Row 2
  drawInfoRow(
    'Tanggal Pelaksanaan',
    formatDate(selectedDate),
    col1X,
    detailsY + 54,
    colW,
    true
  );
  drawInfoRow(
    'Waktu Sesi Acara (WIB)',
    `${startTime} – ${endTime} WIB (${getTimeOfDayLabel(startTime)})`,
    col2X,
    detailsY + 54,
    colW
  );

  // Row 3
  drawInfoRow(
    'Durasi Sesi Foto',
    selectedPackage?.duration || '-',
    col1X,
    detailsY + 108,
    colW
  );
  drawInfoRow(
    'Tim Dokumentasi',
    `${selectedPackage?.photographerCount || 1} Fotografer`,
    col2X,
    detailsY + 108,
    colW
  );

  // 9. Ticket Perforation Notches & Dashed Line
  const notchY = detailsY + 162;
  const notchRadius = 14;

  // Draw dashed line across
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.moveTo(margin + 20, notchY);
  ctx.lineTo(margin + innerW - 20, notchY);
  ctx.stroke();
  ctx.setLineDash([]); // Reset dash

  // Left notch cut
  ctx.fillStyle = '#F8FAFC';
  ctx.beginPath();
  ctx.arc(margin, notchY, notchRadius, -Math.PI / 2, Math.PI / 2);
  ctx.fill();
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Right notch cut
  ctx.beginPath();
  ctx.arc(margin + innerW, notchY, notchRadius, Math.PI / 2, (3 * Math.PI) / 2);
  ctx.fill();
  ctx.stroke();

  // 10. Payment & DP Instruction Card
  const payY = notchY + 28;
  const payH = 145;
  const payW = innerW - 48;
  const payX = margin + 24;

  ctx.fillStyle = '#FFFDF5';
  ctx.strokeStyle = '#FDE68A';
  ctx.lineWidth = 1.5;
  drawRoundedRect(ctx, payX, payY, payW, payH, 16);
  ctx.fill();
  ctx.stroke();

  // DP Tag
  ctx.fillStyle = '#92400E';
  ctx.font = 'bold 10px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('MINIMAL DOWN PAYMENT (DP) UNTUK KUNCI JADWAL:', payX + 18, payY + 26);

  // DP Amount
  ctx.fillStyle = '#B45309';
  ctx.font = 'bold 22px monospace';
  ctx.fillText(formatCurrency(depositAmount), payX + 18, payY + 54);

  // Total Investment
  ctx.fillStyle = '#78350F';
  ctx.font = '11px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(
    `Total Nilai Paket: ${formatCurrency(selectedPackage?.price || 0)}`,
    payX + payW - 200,
    payY + 54
  );

  // Bank Info Divider inside card
  ctx.strokeStyle = '#FEF3C7';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(payX + 18, payY + 68);
  ctx.lineTo(payX + payW - 18, payY + 68);
  ctx.stroke();

  // Bank details
  ctx.fillStyle = '#451A03';
  ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(
    `Bank: ${studioSettings.bankName.toUpperCase()}  |  No. Rek: ${studioSettings.bankAccountNumber}`,
    payX + 18,
    payY + 95
  );

  ctx.fillStyle = '#78350F';
  ctx.font = '11px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`Atas Nama: ${studioSettings.bankAccountHolder}`, payX + 18, payY + 115);

  ctx.fillStyle = '#92400E';
  ctx.font = 'italic 10px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(
    '*Konfirmasi bukti transfer ke Customer Service untuk verifikasi resmi.',
    payX + 18,
    payY + 133
  );

  // 11. Security Seal & Official Footer
  const footerY = payY + payH + 28;

  // Verified Badge (bottom left)
  const sealW = 210;
  const sealH = 26;
  const sealX = margin + 24;
  const sealY = footerY;

  ctx.fillStyle = '#EFF6FF';
  ctx.strokeStyle = '#BFDBFE';
  ctx.lineWidth = 1;
  drawRoundedRect(ctx, sealX, sealY, sealW, sealH, 6);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#0066CC';
  ctx.font = 'bold 9px monospace';
  ctx.fillText('MARGASERA OFFICIAL VERIFIED', sealX + 16, sealY + 17);

  // Studio location and generated date (bottom right)
  ctx.fillStyle = '#94A3B8';
  ctx.font = '10px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('Pamekasan, Madura - Jawa Timur', margin + innerW - 24, footerY + 14);

  const issuedDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  ctx.fillText(`Diterbitkan: ${issuedDate}`, margin + innerW - 24, footerY + 28);
  ctx.textAlign = 'left';

  // 12. Trigger Browser Download
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        resolve();
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Kartu-Booking-Margasera-${bookingCode}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      resolve();
    }, 'image/png');
  });
}

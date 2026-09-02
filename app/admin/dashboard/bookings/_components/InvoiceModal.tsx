'use client';

import Image from 'next/image';
import { X, Receipt, Share2, Printer, Building2 } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { printDocument } from '@/lib/print';
import type { Booking, Package, StudioSettings } from '@/lib/types';

interface InvoiceModalProps {
  booking: Booking;
  packages: Package[];
  studioSettings: StudioSettings;
  onClose: () => void;
}

export function InvoiceModal({ booking: inv, packages, studioSettings, onClose }: InvoiceModalProps) {
  const totalPrice = inv.totalPrice || 0;

  // Match paket untuk ambil fitur, durasi & nominal DP
  const matchedPkg = packages.find((p) => {
    const matchesService =
      (inv.serviceId && p.serviceId === inv.serviceId) ||
      (inv.serviceName && p.serviceName && p.serviceName.toLowerCase().trim() === inv.serviceName.toLowerCase().trim());
    const matchesName = Boolean(inv.packageName && p.name.toLowerCase().trim() === inv.packageName.toLowerCase().trim());
    const matchesId = Boolean(inv.packageId && (p.id === inv.packageId || p.slug === inv.packageId));
    return matchesService && (matchesName || matchesId);
  }) ?? packages.find((p) => inv.packageName && p.name.toLowerCase().trim() === inv.packageName?.toLowerCase().trim());

  const dpAmount = inv.paidAmount && inv.paidAmount > 0
    ? inv.paidAmount
    : inv.downPayment && inv.downPayment > 0
      ? inv.downPayment
      : matchedPkg?.downPayment && matchedPkg.downPayment > 0
        ? matchedPkg.downPayment
        : Math.round(totalPrice * 0.2);

  const isPaidFull = inv.paymentStatus === 'paid_full';
  const isDpPaid = inv.paymentStatus === 'dp_paid';

  const paidTotal = isPaidFull ? totalPrice : isDpPaid ? dpAmount : (inv.paidAmount ?? 0);
  const remainingBalance = Math.max(0, totalPrice - paidTotal);

  const pkgFeatures = matchedPkg?.features || [];
  const notesFeatures = inv.notes
    ? inv.notes.split('\n').filter((l) => l.trim().length > 0 && !l.toLowerCase().startsWith('nama pasangan:'))
    : [];
  const featuresToShow = pkgFeatures.length > 0 ? pkgFeatures : notesFeatures;

  // Ekstrak durasi dari notes jika custom
  let extractedDuration: string | null = null;
  if (inv.notes) {
    const match = inv.notes.match(/(?:durasi\s*(?:sesi)?|s\/d)\s*:?\s*(\d+\s*(?:jam|menit|hari))/i);
    if (match && match[1]) extractedDuration = match[1].trim();
  }

  const displayDuration = matchedPkg?.duration
    ?? extractedDuration
    ?? (inv.startTime && inv.endTime ? `${inv.startTime} – ${inv.endTime} WIB` : null);

  const paymentBadgeStyle = isPaidFull
    ? 'bg-emerald-50 text-emerald-700 border-emerald-400'
    : isDpPaid
      ? 'bg-blue-50 text-blue-700 border-blue-400'
      : 'bg-amber-50 text-amber-700 border-amber-400';

  const paymentBadgeDot = isPaidFull ? 'bg-emerald-600' : isDpPaid ? 'bg-blue-600' : 'bg-amber-600';
  const paymentBadgeLabel = isPaidFull ? 'LUNAS / FULLY PAID' : isDpPaid ? 'DP TERBAYAR' : 'BELUM DP / UNPAID';

  const printInvoice = () => {
    printDocument('printable-invoice', `Invoice Official - INV-${inv.bookingCode}`);
  };

  const generateWaInvoiceMsg = () => {
    const statusText = isPaidFull ? 'LUNAS' : isDpPaid ? 'DP TERBAYAR' : 'BELUM DP';
    const studioName = studioSettings.studioName || 'Margasera Photography';
    const bankName = (studioSettings.bankName || 'BCA').toUpperCase();
    const bankAcc = studioSettings.bankAccountNumber || '1234567890';
    const bankHolder = (studioSettings.bankAccountHolder || 'MARGASERA CREATIVE').toUpperCase();

    const msg = encodeURIComponent(
      `Halo kak ${inv.customerName},\n\n` +
      `Berikut rincian Invoice Pemesanan ${studioName}:\n\n` +
      `📄 *INVOICE:* INV-${inv.bookingCode}\n` +
      `📸 *Layanan:* ${inv.serviceName} (${inv.packageName})\n` +
      `📅 *Tanggal Event:* ${formatDate(inv.bookingDate)}\n` +
      `📍 *Lokasi:* ${inv.location}\n\n` +
      `💰 *Total Investasi:* ${formatCurrency(totalPrice)}\n` +
      `✅ *Status Pembayaran:* ${statusText}\n` +
      `💳 *Total Terbayar:* ${formatCurrency(paidTotal)}\n` +
      `📌 *Sisa Pelunasan:* ${formatCurrency(remainingBalance)}\n\n` +
      `Rekening Pembayaran:\n` +
      `🏦 *${bankName}: ${bankAcc}* a.n *${bankHolder}*\n\n` +
      `Terima kasih telah mempercayakan momen berharga kamu bersama ${studioName}! ✨`
    );
    return `https://wa.me/${inv.whatsapp.replace(/[^0-9]/g, '')}?text=${msg}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl my-auto overflow-hidden">
        {/* Sticky Modal Controls Header */}
        <div className="no-print p-4 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#0066CC]" />
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">Pratinjau Invoice Resmi Studio</h4>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Printable Invoice */}
        <div id="printable-invoice" className="p-6 sm:p-10 bg-white text-zinc-900 font-sans flex flex-col gap-8 flex-1 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-zinc-200 print-flex-row">
            <div className="flex flex-col gap-2">
              <div className="py-1 w-fit">
                <Image src="/logo.png" alt="Margasera Logo" width={160} height={48} className="h-9 w-auto object-contain" priority />
              </div>
              <span className="text-[11px] text-zinc-500 tracking-wider uppercase font-semibold">
                Editorial &amp; Cinematic Visual Stories
              </span>
            </div>
            <div className="flex flex-col text-left sm:text-right text-xs text-zinc-600 font-light leading-relaxed print-text-right">
              <strong className="text-zinc-900 font-semibold text-sm">
                {(studioSettings.studioName || 'MARGASERA PHOTOGRAPHY').toUpperCase()}
              </strong>
              <span>{studioSettings.address || 'Jl. Raya Madura No. 88, Madura, Jawa Timur'}</span>
              <span>WhatsApp: {studioSettings.whatsapp || '0858-0613-8955'} | Email: {studioSettings.email || 'hello@margasera.id'}</span>
              <span>Website: https://margasera.id</span>
            </div>
          </div>

          {/* Invoice Title & Meta */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 print-flex-row">
            <div className="flex flex-col">
              <span className="text-xs font-mono font-bold tracking-widest text-[#0066CC] uppercase">INVOICE OFFICIAL</span>
              <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight font-mono">INV-{inv.bookingCode}</h2>
            </div>
            <div className="sm:text-right print-text-right">
              <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs uppercase font-mono font-bold tracking-wider border shadow-sm ${paymentBadgeStyle}`}>
                <span className={`w-2 h-2 rounded-full ${paymentBadgeDot}`} />
                {paymentBadgeLabel}
              </div>
              <div className="text-[11px] text-zinc-500 font-mono mt-1">
                Tanggal Diterbitkan: {formatDate(new Date().toISOString().split('T')[0])}
              </div>
            </div>
          </div>

          {/* Customer & Event Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-xs print-grid-2">
            <div className="flex flex-col gap-1.5 border-b sm:border-b-0 sm:border-r border-zinc-200 pb-3 sm:pb-0 sm:pr-4">
              <span className="font-mono text-[10px] text-[#0066CC] uppercase font-bold tracking-wider">Ditagihkan Kepada (Client):</span>
              <span className="font-bold text-base text-zinc-900">{inv.customerName}</span>
              <span className="text-zinc-600">WhatsApp: {inv.whatsapp}</span>
              {inv.email && <span className="text-zinc-600">Email: {inv.email}</span>}
              {inv.instagram && <span className="text-zinc-600">IG: {inv.instagram}</span>}
            </div>

            <div className="flex flex-col gap-1.5 sm:pl-2">
              <span className="font-mono text-[10px] text-[#0066CC] uppercase font-bold tracking-wider">Detail Acara &amp; Sesi:</span>
              <span className="text-zinc-800">Tanggal: <strong>{formatDate(inv.bookingDate)}</strong></span>
              {displayDuration && <span className="text-zinc-800">Sesi: <strong>{displayDuration}</strong></span>}
              <span className="text-zinc-800">Lokasi: <strong>{inv.location}</strong></span>
            </div>
          </div>

          {/* Item Breakdown Table */}
          <div className="flex flex-col">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-zinc-900 text-zinc-900 font-mono uppercase text-[11px]">
                  <th className="py-2.5">Deskripsi Layanan &amp; Paket</th>
                  <th className="py-2.5 text-right">Durasi</th>
                  <th className="py-2.5 text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                <tr>
                  <td className="py-3.5 pr-4">
                    <strong className="text-zinc-900 text-sm block">{inv.serviceName}</strong>
                    <span className="text-zinc-600 text-xs font-medium">Paket: {inv.packageName}</span>
                    {featuresToShow.length > 0 && (
                      <ul className="mt-2 space-y-1 text-zinc-600 text-[11px] list-disc list-inside">
                        {featuresToShow.map((f, idx) => (
                          <li key={idx}>{f}</li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td className="py-3.5 text-right font-mono text-zinc-700 whitespace-nowrap">
                    {displayDuration || '-'}
                  </td>
                  <td className="py-3.5 text-right font-mono font-bold text-zinc-900 text-sm whitespace-nowrap">
                    {formatCurrency(totalPrice)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Calculation Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-2 print-flex-row">
            {/* Payment Method Instructions */}
            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl flex flex-col gap-2 max-w-sm w-full text-xs">
              <div className="flex items-center gap-2 text-zinc-900 font-bold font-mono text-xs uppercase">
                <Building2 className="w-4 h-4 text-[#0066CC]" />
                <span>Instruksi Transfer Bank</span>
              </div>
              <div className="flex flex-col text-zinc-700 gap-0.5">
                <span>Bank: <strong>{(studioSettings.bankName || 'BCA').toUpperCase()}</strong></span>
                <span className="font-mono text-sm font-bold text-zinc-900">
                  {studioSettings.bankAccountNumber || '1234567890'}
                </span>
                <span>a.n <strong>{(studioSettings.bankAccountHolder || 'MARGASERA CREATIVE').toUpperCase()}</strong></span>
              </div>
            </div>

            {/* Total Math Table */}
            <div className="flex flex-col gap-2 w-full sm:w-72 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-zinc-200 text-zinc-600">
                <span>Total Investasi:</span>
                <strong className="text-zinc-900">{formatCurrency(totalPrice)}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-200 text-emerald-700">
                <span>Total Terbayar:</span>
                <strong>{formatCurrency(paidTotal)}</strong>
              </div>
              <div className="flex justify-between py-2 border-b-2 border-zinc-900 text-sm font-bold">
                <span className="text-zinc-900">Sisa Pelunasan:</span>
                <span className={remainingBalance > 0 ? 'text-amber-700' : 'text-emerald-700'}>
                  {formatCurrency(remainingBalance)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes / Footer */}
          <div className="flex flex-col sm:flex-row justify-between items-end gap-6 pt-6 border-t border-zinc-200 text-xs text-zinc-500 print-flex-row">
            <div className="flex flex-col gap-1 max-w-md">
              <strong className="text-zinc-800 font-semibold uppercase font-mono text-[10px]">Syarat &amp; Ketentuan Studio:</strong>
              <span>• DP minimal untuk mengunci tanggal pada kalender studio.</span>
              <span>• Pelunasan sisa dilakukan setelah acara selesai (di tempat).</span>
              <span>• Invoice ini merupakan bukti pembayaran sah yang dikeluarkan oleh Margasera.</span>
            </div>
            <div className="text-center sm:text-right flex flex-col items-center sm:items-end gap-1 print-text-right print-items-end">
              <span className="font-mono text-[10px]">Hormat Kami,</span>
              <div className="h-12 w-32 border-b border-zinc-400 flex items-center justify-center italic text-zinc-400 text-xs">
                [ Signed Digital ]
              </div>
              <strong className="text-zinc-900 font-semibold font-mono text-xs">MARGASERA Official</strong>
            </div>
          </div>
        </div>

        {/* Sticky Bottom Actions */}
        <div className="no-print p-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 shrink-0 sticky bottom-0 z-10">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-white hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
          >
            Tutup
          </button>
          <div className="flex items-center gap-3">
            <a
              href={generateWaInvoiceMsg()}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2 shadow-xs"
            >
              <Share2 className="w-4 h-4" />
              <span>Kirim WA Invoice</span>
            </a>
            <button
              onClick={printInvoice}
              className="px-5 py-2.5 bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2 shadow-sm hover:shadow-md cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Save PDF (A4)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

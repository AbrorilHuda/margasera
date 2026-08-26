'use client';

import React from 'react';
import Image from 'next/image';
import { X, Receipt, Share2, Printer, Building2 } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Booking, Package, StudioSettings } from '@/lib/types';

interface InvoiceModalProps {
  booking: Booking;
  packages: Package[];
  studioSettings: StudioSettings;
  onClose: () => void;
}

export function InvoiceModal({ booking: inv, packages, studioSettings, onClose }: InvoiceModalProps) {
  const totalPrice = inv.totalPrice || 0;
  const dpAmount = Math.round(totalPrice * 0.2);
  const isPaidFull = inv.paymentStatus === 'paid_full';
  const isDpPaid = inv.paymentStatus === 'dp_paid';

  const paidTotal = isPaidFull ? totalPrice : isDpPaid ? dpAmount : 0;
  const remainingBalance = totalPrice - paidTotal;

  // Match paket untuk ambil fitur & durasi
  const matchedPkg = packages.find((p) => {
    const matchesService =
      (inv.serviceId && p.serviceId === inv.serviceId) ||
      (inv.serviceName && p.serviceName && p.serviceName.toLowerCase().trim() === inv.serviceName.toLowerCase().trim());
    const matchesName = Boolean(inv.packageName && p.name.toLowerCase().trim() === inv.packageName.toLowerCase().trim());
    const matchesId = Boolean(inv.packageId && (p.id === inv.packageId || p.slug === inv.packageId));
    return matchesService && (matchesName || matchesId);
  }) ?? packages.find((p) => inv.packageName && p.name.toLowerCase().trim() === inv.packageName?.toLowerCase().trim());

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
    const el = document.getElementById('printable-invoice');
    if (!el) { window.print(); return; }

    // Clone invoice content
    const clone = el.cloneNode(true) as HTMLElement;
    clone.style.cssText = 'padding:0;margin:0;';

    // Stash and clear body
    const original = Array.from(document.body.children);
    original.forEach((c) => document.body.removeChild(c));
    document.body.appendChild(clone);

    window.print();

    // Restore
    document.body.removeChild(clone);
    original.forEach((c) => document.body.appendChild(c));
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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full flex flex-col shadow-2xl my-8 overflow-hidden">
        {/* Modal Controls */}
        <div className="no-print p-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#0066CC]" />
            <h4 className="text-sm font-bold text-zinc-100 uppercase tracking-wide">Pratinjau Invoice Resmi Studio</h4>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Invoice */}
        <div id="printable-invoice" className="p-8 sm:p-10 bg-white text-zinc-900 font-sans flex flex-col gap-8">
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

          {/* Client & Event Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 bg-zinc-50 rounded-xl border border-zinc-200/80 text-xs print-grid-2">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest font-semibold">DITUJUKAN KEPADA CLIENT:</span>
              <strong className="text-zinc-900 text-sm font-semibold">{inv.customerName}</strong>
              <span className="text-zinc-600 font-mono">WhatsApp: {inv.whatsapp}</span>
              {inv.instagram && <span className="text-zinc-600 font-mono">Instagram: {inv.instagram}</span>}
              {inv.email && <span className="text-zinc-600 font-mono">Email: {inv.email}</span>}
            </div>
            <div className="flex flex-col gap-1.5 sm:text-right print-text-right">
              <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest font-semibold">DETAIL JADWAL EVENT:</span>
              <strong className="text-zinc-900 text-sm font-semibold">{formatDate(inv.bookingDate)}</strong>
              <span className="text-amber-700 font-mono font-medium">
                Sesi: {inv.startTime || '08:00'} – {inv.endTime || '14:00'} WIB
              </span>
              <span className="text-zinc-600">Venue: {inv.location}</span>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="overflow-x-auto rounded-lg border border-zinc-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-100 border-b border-zinc-200 text-zinc-700 font-mono font-semibold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Deskripsi Layanan &amp; Paket</th>
                  <th className="p-3 text-center">Durasi</th>
                  <th className="p-3 text-right">Harga Satuan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 text-zinc-800">
                <tr>
                  <td className="p-3.5 align-top">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-zinc-900 font-bold text-sm">{inv.serviceName || 'Layanan Studio'}</strong>
                        {inv.packageName && (
                          <>
                            <span className="text-zinc-400 font-bold">•</span>
                            <span className="text-zinc-700 font-semibold text-xs">{inv.packageName}</span>
                          </>
                        )}
                      </div>
                      {featuresToShow.length > 0 ? (
                        <ul className="mt-1 flex flex-col gap-0.5 text-[10px] text-zinc-500 font-light pl-0.5">
                          {featuresToShow.map((ft, fIdx) => (
                            <li key={fIdx} className="flex items-start gap-1.5 leading-tight">
                              <span className="text-zinc-400 select-none">-</span>
                              <span>{ft.replace(/^[-•*]\s*/, '')}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-zinc-500 text-[10.5px] italic mt-0.5">
                          Dokumentasi Visual &amp; Sinematik Marga Sera Photography
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3.5 text-center font-mono align-top">
                    <strong className="text-zinc-900 font-semibold">{displayDuration || '1 Event'}</strong>
                    {displayDuration && <div className="text-[10px] text-zinc-500 font-sans mt-0.5">1 Sesi / Event</div>}
                  </td>
                  <td className="p-3.5 text-right font-mono font-semibold align-top">{formatCurrency(totalPrice)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Calculation & Bank Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 print-grid-2">
            {/* Bank Account */}
            <div className="p-4 bg-blue-50/60 border border-blue-200/80 rounded-xl flex flex-col gap-2 text-xs">
              <span className="text-[10px] font-mono uppercase font-bold text-[#0066CC] tracking-wider flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" /> Rekening Pembayaran Resmi Studio:
              </span>
              {[
                { label: 'Bank:', value: studioSettings.bankName || 'BCA' },
                { label: 'No. Rekening:', value: studioSettings.bankAccountNumber || '1234567890', bold: true },
                { label: 'Atas Nama:', value: studioSettings.bankAccountHolder || 'MARGASERA CREATIVE' },
              ].map(({ label, value, bold }) => (
                <div key={label} className="flex justify-between border-b border-blue-200/60 pb-1 text-zinc-700 font-mono last:border-0 last:pb-0">
                  <span>{label}</span>
                  <strong className={`text-zinc-900 ${bold ? 'text-sm font-extrabold' : ''}`}>{value}</strong>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="flex flex-col gap-2 text-xs text-zinc-700 font-mono justify-end">
              <div className="flex justify-between py-1 border-b border-zinc-200">
                <span>Total Pembayaran Paket:</span>
                <strong className="text-zinc-900">{formatCurrency(totalPrice)}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-200">
                <span>Total Terbayar:</span>
                <strong className="text-emerald-700">{formatCurrency(paidTotal)}</strong>
              </div>
              <div className="flex justify-between py-2 border-b-2 border-zinc-900 text-sm">
                <span className="font-bold text-zinc-900">SISA PELUNASAN:</span>
                <strong className={`font-extrabold ${remainingBalance > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {formatCurrency(remainingBalance)}
                </strong>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-6 border-t border-zinc-200 flex flex-col sm:flex-row justify-between items-end gap-6 text-[11px] text-zinc-500 font-light print-flex-row">
            <div className="flex flex-col gap-1">
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

        {/* Bottom Actions */}
        <div className="no-print p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors"
          >
            Tutup
          </button>
          <div className="flex items-center gap-3">
            <a
              href={generateWaInvoiceMsg()}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2 shadow"
            >
              <Share2 className="w-4 h-4" />
              <span>Kirim WA Invoice</span>
            </a>
            <button
              onClick={printInvoice}
              className="px-5 py-2.5 bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(0,102,204,0.4)] cursor-pointer"
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

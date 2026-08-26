'use client';

import React from 'react';
import Image from 'next/image';
import { X, FileText, Printer } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Booking, Service, StudioSettings } from '@/lib/types';

interface PdfRekapModalProps {
  filteredBookings: Booking[];
  services: Service[];
  studioSettings: StudioSettings;
  totalRevenue: number;
  monthFilter: string;
  serviceFilter: string;
  bookingStatusFilter: string;
  formatMonthLabel: (ym: string) => string;
  onClose: () => void;
}

const STATUS_COLOR: Record<string, string> = {
  confirmed: 'bg-emerald-100 text-emerald-800',
  completed: 'bg-blue-100 text-blue-800',
  pending: 'bg-amber-100 text-amber-800',
  cancelled: 'bg-rose-100 text-rose-800',
};

const PAYMENT_COLOR: Record<string, string> = {
  paid_full: 'text-emerald-700',
  dp_paid: 'text-blue-700',
  unpaid: 'text-amber-700',
};

const PAYMENT_LABEL: Record<string, string> = {
  paid_full: 'Lunas',
  dp_paid: 'DP Terbayar',
  unpaid: 'Belum DP',
};

export function PdfRekapModal({
  filteredBookings,
  services,
  studioSettings,
  totalRevenue,
  monthFilter,
  serviceFilter,
  bookingStatusFilter,
  formatMonthLabel,
  onClose,
}: PdfRekapModalProps) {
  const confirmedCount = filteredBookings.filter((b) => b.status === 'confirmed').length;
  const pendingCount = filteredBookings.filter((b) => b.status === 'pending').length;

  const periodLabel = monthFilter !== 'all' ? formatMonthLabel(monthFilter) : 'Semua Periode / Bulan Ini';
  const serviceLabel = serviceFilter !== 'all' ? services.find((s) => s.id === serviceFilter)?.name : null;

  const printRekap = () => {
    const el = document.getElementById('printable-rekap');
    if (!el) { window.print(); return; }

    const clone = el.cloneNode(true) as HTMLElement;
    clone.style.cssText = 'padding:0;margin:0;';

    const original = Array.from(document.body.children);
    original.forEach((c) => document.body.removeChild(c));
    document.body.appendChild(clone);

    window.print();

    document.body.removeChild(clone);
    original.forEach((c) => document.body.appendChild(c));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl my-auto overflow-hidden">
        {/* Sticky Modal Controls Header */}
        <div className="no-print p-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#0066CC]" />
            <h4 className="text-sm font-bold text-zinc-100 uppercase tracking-wide">Pratinjau Laporan Rekapitulasi PDF</h4>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={printRekap}
              className="px-4 py-2 bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-semibold uppercase tracking-wider rounded-lg flex items-center gap-2 shadow-md transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Save PDF</span>
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer" title="Tutup Modal">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Content */}
        <div id="printable-rekap" className="p-6 sm:p-10 bg-white text-zinc-900 font-sans flex flex-col gap-6 flex-1 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-zinc-300 print-flex-row">
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
            </div>
          </div>

          {/* Document Title */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print-flex-row">
            <div>
              <span className="text-xs font-mono font-bold tracking-widest text-[#0066CC] uppercase">LAPORAN RESMI STUDIO</span>
              <h2 className="text-2xl font-extrabold text-zinc-900 tracking-tight font-sans uppercase">
                Rekapitulasi Pemesanan Client
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5 font-medium">
                Periode: <span className="text-zinc-900 font-semibold">{periodLabel}</span>
                {serviceLabel && ` | Layanan: ${serviceLabel}`}
                {bookingStatusFilter !== 'all' && ` | Status: ${bookingStatusFilter.toUpperCase()}`}
              </p>
            </div>
            <div className="text-left sm:text-right text-xs text-zinc-500 font-mono print-text-right">
              <div>Tanggal Dicetak: {formatDate(new Date().toISOString().split('T')[0])}</div>
              <div>Total Data: {filteredBookings.length} Booking</div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-xs print-grid-4">
            {[
              { label: 'Total Booking Masuk:', value: `${filteredBookings.length} Pesanan`, color: 'text-zinc-900' },
              { label: 'Confirmed:', value: `${confirmedCount} Event`, color: 'text-emerald-700' },
              { label: 'Pending / Terbuka:', value: `${pendingCount} Booking`, color: 'text-amber-700' },
              { label: 'Total Est. Pendapatan:', value: formatCurrency(totalRevenue), color: 'text-[#0066CC]' },
            ].map(({ label, value, color }, i) => (
              <div key={i} className={`flex flex-col gap-0.5 ${i < 3 ? 'border-r border-zinc-200 pr-2' : ''}`}>
                <span className={`text-[10px] font-mono uppercase font-semibold ${color === 'text-zinc-900' ? 'text-zinc-500' : color}`}>{label}</span>
                <strong className={`text-base font-extrabold font-mono ${color}`}>{value}</strong>
              </div>
            ))}
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto rounded-lg border border-zinc-200 mt-2">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead className="bg-zinc-100 border-b border-zinc-200 text-zinc-700 font-mono font-semibold uppercase text-[9px]">
                <tr>
                  <th className="p-2.5 border-r border-zinc-200 text-center">No</th>
                  <th className="p-2.5 border-r border-zinc-200">Kode &amp; Client</th>
                  <th className="p-2.5 border-r border-zinc-200">Layanan &amp; Paket</th>
                  <th className="p-2.5 border-r border-zinc-200">Tanggal &amp; Jam Event</th>
                  <th className="p-2.5 border-r border-zinc-200">Lokasi / Venue</th>
                  <th className="p-2.5 border-r border-zinc-200 text-center">Status</th>
                  <th className="p-2.5 text-right">Total Harga</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 text-zinc-800">
                {filteredBookings.length > 0 ? (
                  filteredBookings.map((b, idx) => (
                    <tr key={b.id} className={idx % 2 === 1 ? 'bg-zinc-50/50' : ''}>
                      <td className="p-2.5 border-r border-zinc-200 text-center font-mono font-semibold text-zinc-500">{idx + 1}</td>
                      <td className="p-2.5 border-r border-zinc-200">
                        <div className="flex flex-col">
                          <span className="font-mono text-[10px] font-bold text-[#0066CC]">INV-{b.bookingCode}</span>
                          <strong className="text-zinc-900 font-semibold">{b.customerName}</strong>
                          <span className="text-zinc-500 text-[10px] font-mono">WA: {b.whatsapp}</span>
                        </div>
                      </td>
                      <td className="p-2.5 border-r border-zinc-200">
                        <div className="flex flex-col">
                          <strong className="text-zinc-900 font-semibold">{b.serviceName || '-'}</strong>
                          <span className="text-zinc-500 text-[10px]">{b.packageName || '-'}</span>
                        </div>
                      </td>
                      <td className="p-2.5 border-r border-zinc-200 font-mono">
                        <div className="flex flex-col">
                          <strong className="text-zinc-900 font-semibold">{formatDate(b.bookingDate)}</strong>
                          <span className="text-amber-700 text-[10px]">{b.startTime || '08:00'} - {b.endTime || '14:00'} WIB</span>
                        </div>
                      </td>
                      <td className="p-2.5 border-r border-zinc-200 text-zinc-700 max-w-[140px] truncate">
                        {b.location || '-'}
                      </td>
                      <td className="p-2.5 border-r border-zinc-200 text-center font-mono">
                        <div className="flex flex-col items-center gap-0.5">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${STATUS_COLOR[b.status] || STATUS_COLOR.cancelled}`}>
                            {b.status}
                          </span>
                          <span className={`text-[8px] font-bold uppercase ${PAYMENT_COLOR[b.paymentStatus ?? 'unpaid'] || PAYMENT_COLOR.unpaid}`}>
                            {PAYMENT_LABEL[b.paymentStatus ?? 'unpaid'] || 'Belum DP'}
                          </span>
                        </div>
                      </td>
                      <td className="p-2.5 text-right font-mono font-extrabold text-zinc-900">
                        {formatCurrency(b.totalPrice || 0)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-zinc-400 font-light italic">
                      Tidak ada data booking yang sesuai dengan filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="pt-6 border-t border-zinc-200 flex justify-between items-end text-xs text-zinc-500 font-light print-flex-row">
            <div className="flex flex-col gap-1">
              <strong className="text-zinc-800 font-semibold uppercase font-mono text-[10px]">Catatan Laporan:</strong>
              <span>• Laporan rekapitulasi ini di-generate secara otomatis dari sistem admin Margasera.</span>
              <span>• Total nilai pendapatan dihitung berdasarkan estimasi nilai paket dari data booking aktif.</span>
            </div>
            <div className="text-right flex flex-col items-end gap-1 print-text-right print-items-end">
              <span className="text-[10px] font-mono text-zinc-400">Penanggung Jawab:</span>
              <div className="h-10 w-28 border-b border-zinc-400 flex items-center justify-end italic text-zinc-400 text-xs">
                [ Signature ]
              </div>
              <strong className="text-zinc-900 font-semibold font-mono text-xs">MARGASERA Official</strong>
            </div>
          </div>
        </div>

        {/* Sticky Bottom Actions */}
        <div className="no-print p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between gap-3 shrink-0 sticky bottom-0 z-10">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
          >
            Tutup
          </button>
          <button
            onClick={printRekap}
            className="px-5 py-2.5 bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Save PDF (A4)</span>
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import {
  Calendar,
  MessageCircle,
  Eye,
  Trash2,
  Clock,
  MapPin,
  FileText,
  Search,
  RefreshCw,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { generateGoogleCalendarUrl } from './BookingHelpers';
import type { Booking, BookingStatus, Package } from '@/lib/types';

interface BookingTableProps {
  filteredBookings: Booking[];
  totalBookings: number;
  monthFilter: string;
  bookingSearch: string;
  bookingStatusFilter: string;
  serviceFilter: string;
  formatMonthLabel: (ym: string) => string;
  onResetFilters: () => void;
  onDetail: (b: Booking) => void;
  onInvoice: (b: Booking) => void;
  onUpdateStatus: (id: string, status: BookingStatus) => void;
  onDelete: (id: string, code: string) => void;
}

const STATUS_STYLE: Record<string, string> = {
  confirmed: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40',
  completed: 'bg-blue-500/15 text-blue-300 border border-blue-500/40',
  pending: 'bg-amber-500/15 text-amber-400 border border-amber-500/40',
  cancelled: 'bg-rose-950/50 text-rose-400 border border-rose-900/60',
};

const STATUS_DOT: Record<string, string> = {
  confirmed: 'bg-emerald-400',
  completed: 'bg-blue-400',
  pending: 'bg-amber-400',
  cancelled: 'bg-rose-500',
};

const PAYMENT_STYLE: Record<string, string> = {
  paid_full: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60',
  dp_paid: 'bg-blue-950/40 text-blue-300 border-blue-800/60',
  unpaid: 'bg-amber-950/40 text-amber-300 border-amber-800/60',
};

const PAYMENT_LABEL: Record<string, string> = {
  paid_full: 'LUNAS (100%)',
  dp_paid: 'DP (30%)',
  unpaid: 'BELUM DP',
};

export function BookingTable({
  filteredBookings,
  totalBookings,
  monthFilter,
  bookingSearch,
  bookingStatusFilter,
  serviceFilter,
  formatMonthLabel,
  onResetFilters,
  onDetail,
  onInvoice,
  onUpdateStatus,
  onDelete,
}: BookingTableProps) {
  const hasActiveFilter = bookingSearch || bookingStatusFilter !== 'all' || monthFilter !== 'all' || serviceFilter !== 'all';

  return (
    <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-light">
          <thead className="bg-zinc-950/90 border-b border-zinc-800 text-[#0066CC] font-mono font-medium tracking-[0.18em] uppercase text-[10px]">
            <tr>
              <th className="p-4">Kode Booking</th>
              <th className="p-4">Client / Contact</th>
              <th className="p-4">Layanan &amp; Paket</th>
              <th className="p-4">Jadwal Acara</th>
              <th className="p-4">Lokasi Venue</th>
              <th className="p-4">Est. Harga</th>
              <th className="p-4">Status &amp; DP</th>
              <th className="p-4 text-right">Aksi Admin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {filteredBookings.map((b) => {
              const initial = b.customerName ? b.customerName.charAt(0).toUpperCase() : 'C';
              const statusStyle = STATUS_STYLE[b.status] || STATUS_STYLE.cancelled;
              const statusDot = STATUS_DOT[b.status] || STATUS_DOT.cancelled;
              const paymentKey = b.paymentStatus ?? 'unpaid';
              const paymentStyle = PAYMENT_STYLE[paymentKey] || PAYMENT_STYLE.unpaid;
              const paymentLabel = PAYMENT_LABEL[paymentKey] || 'BELUM DP';

              return (
                <tr key={b.id} className="hover:bg-zinc-800/50 transition-colors group">
                  {/* Booking Code */}
                  <td className="p-4 font-mono font-bold text-[#0066CC] whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0066CC]" />
                      <span>{b.bookingCode}</span>
                    </div>
                  </td>

                  {/* Client Info */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 font-bold text-zinc-200 flex items-center justify-center text-xs shrink-0 font-mono">
                        {initial}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-zinc-100 tracking-wide truncate">{b.customerName}</span>
                        <a
                          href={`https://wa.me/${b.whatsapp.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-emerald-400 font-mono hover:underline flex items-center gap-1"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>{b.whatsapp}</span>
                        </a>
                      </div>
                    </div>
                  </td>

                  {/* Service & Package */}
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-zinc-100 font-medium">{b.serviceName}</span>
                      <span className="text-[10px] text-zinc-400 font-mono bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800/80 w-fit mt-0.5">
                        {b.packageName}
                      </span>
                    </div>
                  </td>

                  {/* Event Date & Time */}
                  <td className="p-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-zinc-200 font-semibold">{formatDate(b.bookingDate)}</span>
                      <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {b.startTime ? `${b.startTime} – ${b.endTime} WIB` : '08:00 – 14:00 WIB'}
                      </span>
                    </div>
                  </td>

                  {/* Location */}
                  <td className="p-4 text-zinc-400 max-w-[140px]">
                    <div className="flex items-center gap-1 truncate" title={b.location}>
                      <MapPin className="w-3.5 h-3.5 text-[#0066CC] shrink-0" />
                      <span className="truncate">{b.location}</span>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="p-4 font-mono text-sm font-semibold text-[#0066CC] whitespace-nowrap">
                    {b.totalPrice ? formatCurrency(b.totalPrice) : '-'}
                  </td>

                  {/* Status & Payment Status */}
                  <td className="p-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1 items-start">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono tracking-wider font-semibold ${statusStyle}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
                        {b.status}
                      </span>
                      <span className={`px-2 py-0.2 rounded text-[9px] font-bold uppercase font-mono border ${paymentStyle}`}>
                        {paymentLabel}
                      </span>
                    </div>
                  </td>

                  {/* Actions Toolbar */}
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Detail Modal */}
                      <button
                        onClick={() => onDetail(b)}
                        className="p-2 bg-zinc-950 border border-zinc-800 hover:border-[#0066CC] text-zinc-300 hover:text-white rounded-lg transition-all"
                        title="Lihat Detail Booking"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Google Calendar Link */}
                      <a
                        href={generateGoogleCalendarUrl(b)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-400 rounded-lg flex items-center gap-1 text-[10px] font-mono transition-colors"
                        title="Tambah ke Google Calendar"
                      >
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        <span className="hidden xl:inline">+ GCal</span>
                      </a>

                      {/* Invoice Button */}
                      <button
                        onClick={() => onInvoice(b)}
                        className="px-2.5 py-1.5 bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 text-blue-400 rounded-lg flex items-center gap-1 text-[10px] font-mono transition-colors"
                        title="Lihat / Cetak Invoice Pembayaran"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-400" />
                        <span className="hidden xl:inline">Invoice</span>
                      </button>

                      {/* Quick Confirm */}
                      {b.status === 'pending' && (
                        <button
                          onClick={() => onUpdateStatus(b.id, 'confirmed')}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-semibold uppercase tracking-wider rounded-lg transition-colors shadow"
                        >
                          Confirm
                        </button>
                      )}
                      {b.status === 'confirmed' && (
                        <button
                          onClick={() => onUpdateStatus(b.id, 'completed')}
                          className="px-2.5 py-1.5 bg-[#0066CC] hover:bg-[#0052A3] text-white text-[10px] font-semibold uppercase tracking-wider rounded-lg transition-colors shadow"
                        >
                          Complete
                        </button>
                      )}

                      {/* Delete Button */}
                      <button
                        onClick={() => onDelete(b.id, b.bookingCode)}
                        className="p-2 bg-zinc-950 border border-zinc-800 hover:border-rose-900/60 text-zinc-400 hover:text-rose-400 rounded-lg transition-colors"
                        title="Hapus Booking"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {/* Empty State */}
            {filteredBookings.length === 0 && (
              <tr>
                <td colSpan={8} className="p-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-500">
                      <Search className="w-6 h-6" />
                    </div>
                    <span className="text-zinc-300 text-sm font-semibold">Tidak ada booking ditemukan</span>
                    <p className="text-zinc-500 text-xs font-light max-w-sm">
                      Coba sesuaikan kata kunci pencarian, filter status, atau filter bulan acara di atas.
                    </p>
                    {hasActiveFilter && (
                      <button
                        onClick={onResetFilters}
                        className="mt-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-lg flex items-center gap-1.5 font-mono"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Reset Semua Filter
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="p-4 bg-zinc-950/80 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400 font-mono">
        <span>
          Menampilkan <strong>{filteredBookings.length}</strong> dari <strong>{totalBookings}</strong> total booking
        </span>
        {monthFilter !== 'all' && (
          <span className="text-[#0066CC] font-semibold">Filter Bulan: {formatMonthLabel(monthFilter)}</span>
        )}
      </div>
    </div>
  );
}

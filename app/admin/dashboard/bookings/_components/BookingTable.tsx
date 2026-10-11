'use client';

import React from 'react';
import { createPortal } from 'react-dom';
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
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronRight as ArrowRightIcon,
  Share2,
  CalendarClock,
  Images,
  MoreHorizontal,
  Copy,
  Check,
} from 'lucide-react';
import { useToast } from '@/components/ui/toast-context';
import { formatCurrency, formatDate, getWhatsAppUrl } from '@/lib/utils';
import { generateGoogleCalendarUrl } from './BookingHelpers';
import type { Booking, BookingStatus } from '@/lib/types';

interface BookingTableProps {
  paginatedBookings: Booking[];
  filteredCount: number;
  totalBookings: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  startIndex: number;
  endIndex: number;
  monthFilter: string;
  startDate?: string;
  endDate?: string;
  bookingSearch: string;
  bookingStatusFilter: string;
  serviceFilter: string;
  formatMonthLabel: (ym: string) => string;
  onResetFilters: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onDetail: (b: Booking) => void;
  onInvoice: (b: Booking) => void;
  onOpenGallery?: (b: Booking) => void;
  onUpdateStatus: (id: string, status: BookingStatus) => void;
  onShareTestimonial?: (b: Booking) => void;
  onDelete: (id: string, code: string) => void;
  onEdit?: (b: Booking) => void;
}

const STATUS_STYLE: Record<string, string> = {
  confirmed: 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/40',
  completed: 'bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-500/40',
  pending: 'bg-amber-50 dark:bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-500/40',
  cancelled: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-900/60',
};

const STATUS_DOT: Record<string, string> = {
  confirmed: 'bg-emerald-500 dark:bg-emerald-400',
  completed: 'bg-blue-500 dark:bg-blue-400',
  pending: 'bg-amber-500 dark:bg-amber-400',
  cancelled: 'bg-rose-500',
};

const PAYMENT_STYLE: Record<string, string> = {
  paid_full: 'bg-emerald-100/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60',
  dp_paid: 'bg-blue-100/80 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800/60',
  unpaid: 'bg-amber-100/80 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60',
};

const PAYMENT_LABEL: Record<string, string> = {
  paid_full: 'LUNAS (100%)',
  dp_paid: 'DP Terbayar',
  unpaid: 'BELUM DP',
};

export function BookingTable({
  paginatedBookings,
  filteredCount,
  totalBookings,
  currentPage,
  totalPages,
  pageSize,
  startIndex,
  endIndex,
  monthFilter,
  startDate,
  endDate,
  bookingSearch,
  bookingStatusFilter,
  serviceFilter,
  formatMonthLabel,
  onResetFilters,
  onPageChange,
  onPageSizeChange,
  onDetail,
  onInvoice,
  onOpenGallery,
  onUpdateStatus,
  onShareTestimonial,
  onDelete,
  onEdit,
}: BookingTableProps) {
  const { toast } = useToast();
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);
  const [menuPosition, setMenuPosition] = React.useState<{ top?: number; bottom?: number; right: number } | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopyBookingCode = async (e: React.MouseEvent, code: string) => {
    e.stopPropagation();
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(code);
        setCopiedCode(code);
        toast.success(`Kode booking ${code} berhasil disalin!`, 'Disalin');
        setTimeout(() => {
          setCopiedCode((prev) => (prev === code ? null : prev));
        }, 2000);
      }
    } catch {
      toast.error('Gagal menyalin kode booking');
    }
  };

  // Close dropdown menu when clicking outside, scrolling, or resizing
  React.useEffect(() => {
    if (!openMenuId) return;

    const handleClose = () => {
      setOpenMenuId(null);
    };

    window.addEventListener('scroll', handleClose, true);
    window.addEventListener('resize', handleClose);
    document.addEventListener('click', handleClose);

    return () => {
      window.removeEventListener('scroll', handleClose, true);
      window.removeEventListener('resize', handleClose);
      document.removeEventListener('click', handleClose);
    };
  }, [openMenuId]);

  const activeBooking = React.useMemo(
    () => paginatedBookings.find((b) => b.id === openMenuId) || null,
    [paginatedBookings, openMenuId]
  );

  const hasActiveFilter =
    bookingStatusFilter !== 'all' ||
    monthFilter !== 'all' ||
    Boolean(startDate) ||
    Boolean(endDate) ||
    serviceFilter !== 'all' ||
    Boolean(bookingSearch.trim());

  // Generate page numbers e.g. [1, 2, 3]
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-xs dark:shadow-2xl backdrop-blur-md">
      {/* =========================================
          DESKTOP TABLE (≥ 768px)
          ========================================= */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead className="bg-zinc-50/90 dark:bg-zinc-950/90 border-b border-zinc-200 dark:border-zinc-800 text-[#0066CC] font-mono font-semibold tracking-wider uppercase text-[11px]">
            <tr>
              <th className="py-3 px-3.5">Kode Booking</th>
              <th className="py-3 px-3.5">Client / Contact</th>
              <th className="py-3 px-3.5">Layanan &amp; Paket</th>
              <th className="py-3 px-3.5">Jadwal Acara</th>
              <th className="py-3 px-3.5">Lokasi Venue</th>
              <th className="py-3 px-3.5">Est. Harga</th>
              <th className="py-3 px-3.5">Status &amp; DP</th>
              <th className="py-3 px-3.5 text-right">Aksi Admin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
            {paginatedBookings.map((b) => {
              const initial = b.customerName ? b.customerName.charAt(0).toUpperCase() : 'C';
              const statusStyle = STATUS_STYLE[b.status] || STATUS_STYLE.cancelled;
              const statusDot = STATUS_DOT[b.status] || STATUS_DOT.cancelled;
              const paymentKey = b.paymentStatus ?? 'unpaid';
              const paymentStyle = PAYMENT_STYLE[paymentKey] || PAYMENT_STYLE.unpaid;
              const paymentLabel = PAYMENT_LABEL[paymentKey] || 'BELUM DP';

              return (
                <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors group">
                  {/* Booking Code */}
                  <td className="py-3 px-3.5 font-mono text-xs font-bold text-[#0066CC] whitespace-nowrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0066CC]" />
                      <span>{b.bookingCode}</span>
                      <button
                        type="button"
                        onClick={(e) => handleCopyBookingCode(e, b.bookingCode)}
                        className="p-1 rounded-md text-zinc-400 hover:text-[#0066CC] hover:bg-blue-50 dark:hover:bg-blue-950/50 dark:hover:text-blue-400 transition-colors cursor-pointer active:scale-90"
                        title="Salin Kode Booking"
                      >
                        {copiedCode === b.bookingCode ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      {(b as any).isOfflineDraft && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                          Offline Draft
                        </span>
                      )}
                      {(b as any).syncStatus === 'failed' && (
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${(b as any).lastError?.includes('KONFLIK')
                              ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                              : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                            }`}
                          title={(b as any).lastError || 'Gagal sinkron'}
                        >
                          {(b as any).lastError?.includes('KONFLIK') ? '⚠ Konflik Server' : 'Sync Gagal'}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Client Info */}
                  <td className="py-3 px-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-bold text-zinc-800 dark:text-zinc-200 flex items-center justify-center text-[11px] shrink-0 font-mono">
                        {initial}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight truncate">{b.customerName}</span>
                        <a
                          href={getWhatsAppUrl(b.whatsapp)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono hover:underline flex items-center gap-1"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>{b.whatsapp}</span>
                        </a>
                      </div>
                    </div>
                  </td>

                  {/* Service & Package */}
                  <td className="py-3 px-3.5">
                    <div className="flex flex-col">
                      <span className="text-[13px] text-zinc-900 dark:text-zinc-100 font-medium">{b.serviceName}</span>
                      <span className="text-[11px] text-zinc-600 dark:text-zinc-400 font-mono bg-zinc-100 dark:bg-zinc-950 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800/80 w-fit mt-0.5">
                        {b.packageName}
                      </span>
                      {b.notes && (
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 italic mt-1 truncate max-w-[160px]" title={b.notes}>
                          📝 {b.notes}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Event Date & Time */}
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-[13px] text-zinc-900 dark:text-zinc-200 font-semibold">{formatDate(b.bookingDate)}</span>
                      <span className="text-[11px] text-amber-600 dark:text-amber-400 font-mono flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {b.startTime ? `${b.startTime} – ${b.endTime} WIB` : '08:00 – 14:00 WIB'}
                      </span>
                    </div>
                  </td>

                  {/* Location */}
                  <td className="py-3 px-3.5 text-zinc-600 dark:text-zinc-400 max-w-[140px]">
                    <div className="flex items-center gap-1 truncate text-xs" title={b.location}>
                      <MapPin className="w-3.5 h-3.5 text-[#0066CC] shrink-0" />
                      <span className="truncate">{b.location}</span>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="py-3 px-3.5 font-mono text-[13px] font-bold text-[#0066CC] whitespace-nowrap">
                    {b.totalPrice ? formatCurrency(b.totalPrice) : '-'}
                  </td>

                  {/* Status & Payment Status */}
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <div className="flex flex-col gap-1 items-start">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] uppercase font-mono tracking-wider font-semibold ${statusStyle}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
                        {b.status}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono border ${paymentStyle}`}>
                        {paymentLabel}
                      </span>
                    </div>
                  </td>

                  {/* Actions Toolbar (Sleek & Uncluttered) */}
                  <td className="py-3 px-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5 relative action-menu-dropdown">
                      {/* Tombol Utama: Detail */}
                      <button
                        onClick={() => onDetail(b)}
                        className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-900/60 text-[#0066CC] dark:text-blue-300 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-2xs"
                        title="Lihat Detail Lengkap Booking"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Detail</span>
                      </button>

                      {/* Tombol Cepat: Quick Status Action */}
                      {b.status === 'pending' && (
                        <button
                          onClick={() => onUpdateStatus(b.id, 'confirmed')}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold uppercase tracking-wider rounded-lg transition-all shadow-xs cursor-pointer active:scale-95"
                          title="Konfirmasi Pesanan Ini"
                        >
                          Confirm
                        </button>
                      )}
                      {b.status === 'confirmed' && (
                        <button
                          onClick={() => onUpdateStatus(b.id, 'completed')}
                          className="px-2.5 py-1.5 bg-[#0066CC] hover:bg-[#0052A3] text-white text-[11px] font-semibold uppercase tracking-wider rounded-lg transition-all shadow-xs cursor-pointer active:scale-95"
                          title="Selesaikan Booking & Kirim Link Testimoni"
                        >
                          Selesai
                        </button>
                      )}
                      {b.status === 'completed' && onShareTestimonial && (
                        <button
                          onClick={() => onShareTestimonial(b)}
                          className="px-2 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-lg flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                          title="Salin Tautan Ulasan / Testimoni"
                        >
                          <Share2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>Ulasan</span>
                        </button>
                      )}

                      {/* Dropdown Menu Titik Tiga (Aksi Sekunder) */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (openMenuId === b.id) {
                            setOpenMenuId(null);
                          } else {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const spaceBelow = window.innerHeight - rect.bottom;
                            const openUpwards = spaceBelow < 230;

                            setMenuPosition({
                              top: openUpwards ? undefined : rect.bottom + 6,
                              bottom: openUpwards ? window.innerHeight - rect.top + 6 : undefined,
                              right: window.innerWidth - rect.right,
                            });
                            setOpenMenuId(b.id);
                          }
                        }}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${openMenuId === b.id
                            ? 'bg-zinc-200 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white'
                            : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-950 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                          }`}
                        title="Opsi & Aksi Lainnya"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {/* Empty State */}
            {filteredCount === 0 && (
              <tr>
                <td colSpan={8} className="p-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500">
                      <Search className="w-6 h-6" />
                    </div>
                    <span className="text-zinc-900 dark:text-zinc-300 text-sm font-semibold">Tidak ada booking ditemukan</span>
                    <p className="text-zinc-500 text-xs font-light max-w-sm">
                      Coba sesuaikan kata kunci pencarian, filter status, atau filter bulan acara di atas.
                    </p>
                    {hasActiveFilter && (
                      <button
                        onClick={onResetFilters}
                        className="mt-2 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs rounded-lg flex items-center gap-1.5 font-mono cursor-pointer transition-colors border border-zinc-200 dark:border-transparent"
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

      {/* =========================================
          MOBILE VIEW: iOS Grouped Booking Cards (< 768px)
          Matching PRD Section 14
          ========================================= */}
      <div className="flex md:hidden flex-col divide-y divide-zinc-200 dark:divide-zinc-800/80">
        {paginatedBookings.map((b) => {
          const statusStyle = STATUS_STYLE[b.status] || STATUS_STYLE.cancelled;
          const statusDot = STATUS_DOT[b.status] || STATUS_DOT.cancelled;
          const paymentKey = b.paymentStatus ?? 'unpaid';
          const paymentStyle = PAYMENT_STYLE[paymentKey] || PAYMENT_STYLE.unpaid;
          const paymentLabel = PAYMENT_LABEL[paymentKey] || 'BELUM DP';

          return (
            <div
              key={b.id}
              onClick={() => onDetail(b)}
              className="p-4 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 active:scale-[0.98] transition-all cursor-pointer flex flex-col gap-3"
            >
              {/* Top Row: Booking Code + Chevron */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-[#0066CC] flex-wrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0066CC]" />
                  <span>{b.bookingCode}</span>
                  <button
                    type="button"
                    onClick={(e) => handleCopyBookingCode(e, b.bookingCode)}
                    className="p-1 rounded-md text-zinc-400 hover:text-[#0066CC] hover:bg-blue-50 dark:hover:bg-blue-950/50 dark:hover:text-blue-400 transition-colors cursor-pointer active:scale-90"
                    title="Salin Kode Booking"
                  >
                    {copiedCode === b.bookingCode ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  {(b as any).isOfflineDraft && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                      Offline
                    </span>
                  )}
                  {(b as any).syncStatus === 'failed' && (
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-mono border ${(b as any).lastError?.includes('KONFLIK')
                          ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                          : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                        }`}
                      title={(b as any).lastError || 'Gagal sinkron'}
                    >
                      {(b as any).lastError?.includes('KONFLIK') ? '⚠ Konflik Server' : 'Sync Gagal'}
                    </span>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
              </div>

              {/* Client Name & Service Info */}
              <div className="flex flex-col gap-0.5">
                <h4 className="font-bold text-[15px] text-zinc-900 dark:text-zinc-100">
                  {b.customerName}
                </h4>
                <div className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                  {b.serviceName}
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                  {b.packageName}
                </div>
              </div>

              {/* Event Schedule & Location */}
              <div className="flex flex-col gap-1 text-xs text-zinc-600 dark:text-zinc-400 font-mono pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>{formatDate(b.bookingDate)} {b.startTime ? `(${b.startTime} – ${b.endTime} WIB)` : ''}</span>
                </div>
                {b.location && (
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                    <MapPin className="w-3.5 h-3.5 text-[#0066CC] shrink-0" />
                    <span className="truncate">{b.location}</span>
                  </div>
                )}
                {b.notes && (
                  <div className="text-[11px] text-zinc-400 dark:text-zinc-500 italic flex items-start gap-1 pt-0.5">
                    <span className="shrink-0">📝</span>
                    <span className="line-clamp-2">{b.notes}</span>
                  </div>
                )}
              </div>

              {/* Bottom Row: Total Price + Status Badges */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                <span className="font-mono font-bold text-[13px] text-[#0066CC]">
                  {b.totalPrice ? formatCurrency(b.totalPrice) : '-'}
                </span>

                <div className="flex items-center gap-1.5">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono font-semibold ${statusStyle}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
                    {b.status}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase font-mono border ${paymentStyle}`}>
                    {paymentLabel}
                  </span>
                </div>
              </div>

              {/* Mobile Quick Actions (Clean, Safe & Thumb-Friendly) */}
              <div
                className="flex items-center gap-2 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/60"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Primary Action Button */}
                {b.status === 'pending' && (
                  <button
                    type="button"
                    onClick={() => onUpdateStatus(b.id, 'confirmed')}
                    className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold uppercase tracking-wider rounded-xl text-center shadow-xs cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Konfirmasi</span>
                  </button>
                )}
                {b.status === 'confirmed' && (
                  <button
                    type="button"
                    onClick={() => onUpdateStatus(b.id, 'completed')}
                    className="flex-1 py-2 px-3 bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-semibold uppercase tracking-wider rounded-xl text-center shadow-xs cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Selesaikan</span>
                  </button>
                )}
                {b.status === 'completed' && onShareTestimonial && (
                  <button
                    type="button"
                    onClick={() => onShareTestimonial(b)}
                    className="flex-1 py-2 px-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Link Ulasan</span>
                  </button>
                )}
                {b.status === 'cancelled' && (
                  <button
                    type="button"
                    onClick={() => onDetail(b)}
                    className="flex-1 py-2 px-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold rounded-xl text-center shadow-xs cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Lihat Detail</span>
                  </button>
                )}

                {/* Secondary Quick Buttons */}
                <button
                  type="button"
                  onClick={() => onInvoice(b)}
                  className="py-2 px-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-2xs"
                  title="Lihat Invoice"
                >
                  <FileText className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Invoice</span>
                </button>

                {onOpenGallery && (
                  <button
                    type="button"
                    onClick={() => onOpenGallery(b)}
                    className="py-2 px-2.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800/60 text-[#0066CC] dark:text-[#3399FF] text-xs font-semibold rounded-xl flex items-center gap-1 cursor-pointer active:scale-95 transition-all shadow-2xs"
                    title="Kelola Galeri Seleksi Klien"
                  >
                    <Images className="w-3.5 h-3.5 text-[#0066CC]" />
                    <span className="hidden xs:inline">Galeri</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onDetail(b)}
                  className="p-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-xl transition-all cursor-pointer active:scale-95 shadow-2xs shrink-0"
                  title="Detail Lengkap & Opsi Lainnya"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Mobile Empty State */}
        {filteredCount === 0 && (
          <div className="p-8 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
              <Search className="w-6 h-6" />
            </div>
            <span className="text-zinc-900 dark:text-zinc-300 text-sm font-semibold">Tidak ada booking ditemukan</span>
            <p className="text-zinc-500 text-xs font-light max-w-xs">
              Coba sesuaikan kata kunci pencarian, filter status, atau filter bulan acara di atas.
            </p>
            {hasActiveFilter && (
              <button
                onClick={onResetFilters}
                className="mt-2 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs rounded-xl flex items-center gap-1.5 font-mono cursor-pointer transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset Filter
              </button>
            )}
          </div>
        )}
      </div>

      {/* Table Footer with Full Pagination Controls */}
      <div className="p-4 bg-zinc-50 dark:bg-zinc-950/80 border-t border-zinc-200 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-600 dark:text-zinc-400 font-mono">
        <div>
          {filteredCount > 0 ? (
            <span>
              Menampilkan <strong>{startIndex}</strong>–<strong>{endIndex}</strong> dari{' '}
              <strong>{filteredCount}</strong> booking
              {filteredCount !== totalBookings && <span> (Total: {totalBookings})</span>}
            </span>
          ) : (
            <span>Total <strong>{totalBookings}</strong> booking</span>
          )}
        </div>

        {/* Pagination Navigation Controls */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1.5 w-full sm:w-auto justify-between sm:justify-end">
            {/* Mobile-only compact pagination: Prev / Hal X dari Y / Next */}
            <div className="flex sm:hidden items-center justify-between w-full gap-2 pt-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
                className="px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-xs flex items-center gap-1 cursor-pointer active:scale-95 transition-all shadow-2xs"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>

              <span className="text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300">
                Hal {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                className="px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-xs flex items-center gap-1 cursor-pointer active:scale-95 transition-all shadow-2xs"
              >
                <span>Selanjutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Desktop / Tablet full numeric pagination (hidden on mobile) */}
            <div className="hidden sm:flex items-center gap-1.5">
              {/* First Page */}
              <button
                disabled={currentPage === 1}
                onClick={() => onPageChange(1)}
                className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title="Halaman Pertama"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              {/* Prev Page */}
              <button
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
                className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page Number Buttons */}
              <div className="flex items-center gap-1">
                {getPageNumbers().map((p) => (
                  <button
                    key={p}
                    onClick={() => onPageChange(p)}
                    className={`w-7 h-7 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${currentPage === p
                      ? 'bg-[#0066CC] text-white shadow-xs'
                      : 'bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Next Page */}
              <button
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title="Halaman Selanjutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Last Page */}
              <button
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(totalPages)}
                className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title="Halaman Terakhir"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Portaled Action Dropdown (agar tidak terpotong oleh overflow-x table saat row sedikit / 1 user) */}
      {mounted && openMenuId && menuPosition && activeBooking && createPortal(
        <div
          style={{
            position: 'fixed',
            top: menuPosition.top !== undefined ? `${menuPosition.top}px` : undefined,
            bottom: menuPosition.bottom !== undefined ? `${menuPosition.bottom}px` : undefined,
            right: `${menuPosition.right}px`,
            zIndex: 9999,
          }}
          onClick={(e) => e.stopPropagation()}
          className="w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl py-1.5 animate-in fade-in zoom-in-95 duration-100 text-left"
        >
          <button
            onClick={() => {
              setOpenMenuId(null);
              onInvoice(activeBooking);
            }}
            className="w-full px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-[#0066CC] dark:hover:text-blue-300 flex items-center gap-2.5 transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>Invoice Pembayaran</span>
          </button>

          {onOpenGallery && (
            <button
              onClick={() => {
                setOpenMenuId(null);
                onOpenGallery(activeBooking);
              }}
              className="w-full px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-violet-50 dark:hover:bg-violet-950/40 hover:text-violet-600 dark:hover:text-violet-300 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <Images className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400 shrink-0" />
              <span>Kelola Galeri Foto</span>
            </button>
          )}

          <a
            href={generateGoogleCalendarUrl(activeBooking)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpenMenuId(null)}
            className="w-full px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-600 dark:hover:text-amber-300 flex items-center gap-2.5 transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Google Calendar</span>
          </a>

          {onEdit && activeBooking.status !== 'completed' && (
            <button
              onClick={() => {
                setOpenMenuId(null);
                onEdit(activeBooking);
              }}
              className="w-full px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <CalendarClock className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 shrink-0" />
              <span>Pindah Tgl / Edit</span>
            </button>
          )}

          <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />

          <button
            onClick={() => {
              setOpenMenuId(null);
              onDelete(activeBooking.id, activeBooking.bookingCode);
            }}
            className="w-full px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 shrink-0" />
            <span>Hapus Booking</span>
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}


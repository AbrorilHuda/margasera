'use client';

import {
  X,
  MessageCircle,
  FileText,
  Check,
  Calendar,
  MapPin,
  Share2,
  CalendarClock,
  Trash2,
  Images,
  User,
  Clock,
  CreditCard,
  AlertCircle,
} from 'lucide-react';
import { formatCurrency, formatDate, getWhatsAppUrl, getBookingPaidAmount } from '@/lib/utils';
import { generateGoogleCalendarUrl } from './BookingHelpers';
import type { Booking, BookingStatus, PaymentStatus } from '@/lib/types';

interface BookingDetailModalProps {
  booking: Booking;
  onClose: () => void;
  onUpdatePayment: (id: string, status: PaymentStatus) => void;
  onOpenInvoice: (booking: Booking) => void;
  onOpenGallery?: (booking: Booking) => void;
  onUpdateStatus?: (id: string, status: BookingStatus) => void;
  onShareTestimonial?: (booking: Booking) => void;
  onEdit?: (booking: Booking) => void;
  onDelete?: (id: string, code: string) => void;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; badge: string; dot: string }
> = {
  confirmed: {
    label: 'Terkonfirmasi',
    badge: 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/40',
    dot: 'bg-emerald-500 dark:bg-emerald-400',
  },
  completed: {
    label: 'Selesai',
    badge: 'bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-500/40',
    dot: 'bg-blue-500 dark:bg-blue-400',
  },
  pending: {
    label: 'Menunggu Konfirmasi',
    badge: 'bg-amber-50 dark:bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-500/40',
    dot: 'bg-amber-500 dark:bg-amber-400',
  },
  cancelled: {
    label: 'Dibatalkan',
    badge: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-900/60',
    dot: 'bg-rose-500',
  },
};

export function BookingDetailModal({
  booking: b,
  onClose,
  onUpdatePayment,
  onOpenInvoice,
  onOpenGallery,
  onUpdateStatus,
  onShareTestimonial,
  onEdit,
  onDelete,
}: BookingDetailModalProps) {
  const isDpPaid = b.paymentStatus === 'dp_paid';
  const isPaidFull = b.paymentStatus === 'paid_full';
  const totalPrice = b.totalPrice ?? 0;
  const paidAmount = getBookingPaidAmount(b);
  const remainingAmount = isPaidFull
    ? 0
    : typeof b.remainingAmount === 'number' && b.remainingAmount >= 0
      ? b.remainingAmount
      : Math.max(0, totalPrice - paidAmount);

  const paymentStatusStyle = isPaidFull
    ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40'
    : isDpPaid
      ? 'bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-500/40'
      : 'bg-amber-50 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40';

  const paymentStatusLabel = isPaidFull ? 'Lunas (100%)' : isDpPaid ? 'DP Terbayar' : 'Belum DP';
  const statusInfo = STATUS_CONFIG[b.status] || STATUS_CONFIG.cancelled;

  const handleOpenInvoice = () => {
    onClose();
    onOpenInvoice(b);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white dark:bg-zinc-900 border-t sm:border border-zinc-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-2xl max-w-lg w-full max-h-[92vh] sm:max-h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        {/* iOS Drag Handle */}
        <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mt-2.5 sm:hidden shrink-0" />

        {/* Header */}
        <div className="p-4 sm:p-6 bg-white dark:bg-zinc-900 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-widest font-semibold">
              DETAIL PEMESANAN
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-mono text-xl font-bold text-[#0066CC] dark:text-[#38bdf8] tracking-tight">
                {b.bookingCode}
              </h3>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${statusInfo.badge}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                {statusInfo.label}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors active:scale-95 cursor-pointer shrink-0"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto flex flex-col gap-3.5 text-xs text-zinc-700 dark:text-zinc-300">
          {/* Card: CLIENT INFO */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-950/60 rounded-xl border border-zinc-200 dark:border-zinc-800/80 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#0066CC] dark:text-[#38bdf8] font-bold flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>INFORMASI KLIEN</span>
              </span>
              <a
                href={getWhatsAppUrl(b.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 active:scale-95 transition-colors"
                title="Buka Chat WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{b.whatsapp}</span>
              </a>
            </div>

            <div className="flex items-baseline justify-between pt-0.5">
              <span className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                {b.customerName}
              </span>
            </div>

            {b.instagram && (
              <div className="text-[11px] text-zinc-500 pt-1.5 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center gap-1.5">
                <span>Instagram:</span>
                <a
                  href={`https://instagram.com/${b.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[#0066CC] dark:text-[#38bdf8] hover:underline font-semibold"
                >
                  {b.instagram}
                </a>
              </div>
            )}
          </div>

          {/* Card: EVENT DATE & JADWAL */}
          <div className="p-4 bg-amber-50/40 dark:bg-amber-950/15 rounded-xl border border-amber-200/70 dark:border-amber-900/40 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-800 dark:text-amber-400 font-bold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>JADWAL &amp; LOKASI ACARA</span>
              </span>
              {onEdit && b.status !== 'completed' && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEdit(b);
                  }}
                  className="px-2.5 py-1 bg-white dark:bg-zinc-800 hover:bg-amber-100 dark:hover:bg-zinc-700 border border-amber-300 dark:border-amber-700/60 text-amber-800 dark:text-amber-300 rounded-lg text-[11px] font-mono font-semibold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-2xs"
                  title="Pindah Tanggal / Ubah Jadwal Booking"
                >
                  <CalendarClock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Ubah Jadwal</span>
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pt-0.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  {formatDate(b.bookingDate) || 'Tanggal Belum Diisi'}
                </span>
              </div>
              <span className="text-xs text-amber-800 dark:text-amber-300 font-mono font-semibold bg-amber-100/80 dark:bg-amber-900/50 px-2.5 py-1 rounded-md border border-amber-300/60 dark:border-amber-800/60 w-fit flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span>{b.startTime || '08:00'} – {b.endTime || '14:00'} WIB</span>
              </span>
            </div>

            {b.location && (
              <div className="text-[11px] text-zinc-600 dark:text-zinc-400 flex items-start gap-1.5 pt-1.5 border-t border-amber-200/50 dark:border-amber-900/40">
                <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{b.location}</span>
              </div>
            )}
          </div>

          {/* Card: SERVICE & PACKAGE */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-950/60 rounded-xl border border-zinc-200 dark:border-zinc-800/80 flex flex-col gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#0066CC] dark:text-[#38bdf8] font-bold">
              LAYANAN &amp; PAKET FOTO
            </span>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                {b.serviceName}
              </span>
              <span className="text-[11px] text-zinc-600 dark:text-zinc-300 font-mono bg-zinc-200/70 dark:bg-zinc-800 px-2.5 py-0.5 rounded-md font-medium">
                {b.packageName}
              </span>
            </div>

            {b.notes && (
              <div className="mt-1 p-2.5 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80">
                <span className="text-zinc-400 dark:text-zinc-500 font-mono text-[10px] uppercase block mb-0.5">
                  Catatan Khusus:
                </span>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 italic leading-relaxed">
                  &ldquo;{b.notes}&rdquo;
                </p>
              </div>
            )}
          </div>

          {/* Card: STATUS & PEMBAYARAN */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-950/60 rounded-xl border border-zinc-200 dark:border-zinc-800/80 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#0066CC] dark:text-[#38bdf8] font-bold flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                <span>KEUANGAN &amp; PEMBAYARAN</span>
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono flex items-center gap-1 ${paymentStatusStyle}`}
              >
                {paymentStatusLabel}
                {(isPaidFull || isDpPaid) && <Check className="w-3 h-3" />}
              </span>
            </div>

            {/* Rincian Finansial: Total, Terbayar, dan Sisa Piutang */}
            <div className="flex flex-col gap-2 p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80">
              <div className="flex items-baseline justify-between text-xs">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">Total Investasi Layanan:</span>
                <strong className="text-zinc-900 dark:text-zinc-100 font-mono text-sm font-bold">
                  {totalPrice > 0 ? formatCurrency(totalPrice) : '-'}
                </strong>
              </div>

              <div className="flex items-baseline justify-between text-xs">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">Dana Masuk (Terbayar):</span>
                <span className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {paidAmount > 0 ? formatCurrency(paidAmount) : 'Rp 0'}
                  {isDpPaid && <span className="text-[10px] ml-1 font-sans font-normal text-zinc-400">(DP)</span>}
                  {isPaidFull && <span className="text-[10px] ml-1 font-sans font-normal text-zinc-400">(100%)</span>}
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    Sisa Pelunasan (Piutang):
                  </span>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                    {remainingAmount === 0 ? '✓ Pembayaran Lunas' : 'Wajib dilunasi saat / sebelum event'}
                  </span>
                </div>
                <strong
                  className={`font-mono text-base font-extrabold ${
                    remainingAmount > 0
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {remainingAmount > 0 ? formatCurrency(remainingAmount) : 'Rp 0 (Lunas)'}
                </strong>
              </div>
            </div>

            {/* Quick Button Ubah Status Pembayaran */}
            <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 flex flex-col gap-1.5">
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono uppercase">
                Ubah Status Pembayaran:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={isDpPaid || isPaidFull}
                  onClick={() => onUpdatePayment(b.id, 'dp_paid')}
                  className={`py-2 text-xs font-semibold rounded-xl transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                    isDpPaid || isPaidFull
                      ? 'opacity-50 cursor-not-allowed bg-zinc-100 dark:bg-zinc-950 text-zinc-400 dark:text-zinc-500 border border-zinc-200 dark:border-zinc-800'
                      : 'bg-[#0066CC] hover:bg-[#0052A3] text-white shadow-xs active:scale-95'
                  }`}
                >
                  <span>{isDpPaid ? 'DP Terbayar' : isPaidFull ? 'DP Selesai' : 'Set DP Terbayar'}</span>
                  {(isDpPaid || isPaidFull) && <Check className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  disabled={isPaidFull}
                  onClick={() => onUpdatePayment(b.id, 'paid_full')}
                  className={`py-2 text-xs font-semibold rounded-xl transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                    isPaidFull
                      ? 'opacity-50 cursor-not-allowed bg-emerald-100/60 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs active:scale-95'
                  }`}
                >
                  <span>{isPaidFull ? 'Lunas (100%)' : 'Set Lunas (100%)'}</span>
                  {isPaidFull && <Check className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Card: GALERI SELEKSI FOTO KLIEN */}
          <div className="p-4 bg-blue-50/60 dark:bg-blue-950/20 rounded-xl border border-blue-200/80 dark:border-blue-900/40 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#0066CC] dark:text-[#38bdf8] font-bold flex items-center gap-1.5">
                <Images className="w-3.5 h-3.5 text-[#0066CC] dark:text-[#38bdf8]" />
                <span>GALERI SELEKSI FOTO</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-[#0066CC] dark:text-[#38bdf8] font-semibold">
                {b.driveFolderUrl ? 'Link Terhubung' : 'Belum Dibuat'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
              {b.driveFolderUrl
                ? `Folder Google Drive terhubung. Batas kuota: ${b.selectionMaxCount || 15} foto.`
                : 'Hubungkan folder Google Drive untuk membuat link seleksi foto klien.'}
            </p>
            {onOpenGallery && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenGallery(b);
                }}
                className="w-full py-2.5 px-3 bg-[#0066CC] hover:bg-[#0052A3] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shadow-xs"
              >
                <Images className="w-4 h-4" />
                <span>Kelola Galeri Seleksi</span>
              </button>
            )}
          </div>

          {/* Card: ALUR STATUS SESI & ULASAN */}
          <div className="flex flex-col gap-2 pt-1 border-t border-zinc-200/60 dark:border-zinc-800/60">
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono uppercase font-semibold">
              Alur Status Sesi:
            </span>
            {b.status === 'pending' && (
              <button
                type="button"
                onClick={() => {
                  onUpdateStatus?.(b.id, 'confirmed');
                }}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold tracking-wide flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-[0.98]"
              >
                <Check className="w-4 h-4" />
                <span>Konfirmasi Booking</span>
              </button>
            )}
            {b.status === 'confirmed' && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onUpdateStatus?.(b.id, 'completed');
                }}
                className="w-full py-2.5 px-4 bg-[#0066CC] hover:bg-[#0052A3] text-white rounded-xl text-xs font-semibold tracking-wide flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-[0.98]"
              >
                <Check className="w-4 h-4" />
                <span>Tandai Selesai &amp; Buka Testimoni</span>
              </button>
            )}
            {b.status === 'completed' && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onShareTestimonial?.(b);
                }}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold tracking-wide flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-[0.98]"
              >
                <Share2 className="w-4 h-4" />
                <span>Kirim Link Ulasan / Testimoni</span>
              </button>
            )}
          </div>

          {/* Danger Zone: HAPUS BOOKING (HANYA SATU TOMBOL DI SINI) */}
          {onDelete && (
            <div className="mt-2 p-3.5 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl border border-rose-200/70 dark:border-rose-900/40 flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="text-[10px] font-mono uppercase font-bold tracking-wide">
                  Zona Bahaya
                </span>
              </div>
              <p className="text-[11px] text-rose-700/80 dark:text-rose-400/80 leading-relaxed">
                Tindakan menghapus data pesanan bersifat permanen. Jika hanya ingin membatalkan, ubah status menjadi Batal.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDelete(b.id, b.bookingCode);
                }}
                className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold tracking-wide flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-[0.98]"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus Booking Ini</span>
              </button>
            </div>
          )}
        </div>

        {/* Sticky Bottom Actions: 3 Aksi Utama Klien (Bersih & Tanpa Tombol Hapus Dobel) */}
        <div className="p-3.5 sm:p-4 bg-zinc-50 dark:bg-zinc-900/95 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2.5 shrink-0 pb-safe">
          <a
            href={generateGoogleCalendarUrl(b)}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-950/70 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 rounded-xl flex items-center justify-center active:scale-95 transition-colors shrink-0"
            title="Tambah ke Google Calendar"
          >
            <Calendar className="w-4 h-4" />
          </a>

          <a
            href={getWhatsAppUrl(b.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs tracking-wider uppercase text-center rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98]"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat WA</span>
          </a>

          <button
            type="button"
            onClick={handleOpenInvoice}
            className="flex-1 py-3 bg-[#0066CC] hover:bg-[#0052A3] text-white font-semibold text-xs tracking-wider uppercase text-center rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Invoice</span>
          </button>
        </div>
      </div>
    </div>
  );
}


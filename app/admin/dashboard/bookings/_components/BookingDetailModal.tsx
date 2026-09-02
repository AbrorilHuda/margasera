'use client';

import React from 'react';
import { X, MessageCircle, FileText, Check, Calendar, MapPin, ArrowLeft } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { generateGoogleCalendarUrl } from './BookingHelpers';
import type { Booking, BookingStatus, PaymentStatus } from '@/lib/types';

interface BookingDetailModalProps {
  booking: Booking;
  onClose: () => void;
  onUpdatePayment: (id: string, status: PaymentStatus) => void;
  onOpenInvoice: (booking: Booking) => void;
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

export function BookingDetailModal({ booking: b, onClose, onUpdatePayment, onOpenInvoice }: BookingDetailModalProps) {
  const isDpPaid = b.paymentStatus === 'dp_paid';
  const isPaidFull = b.paymentStatus === 'paid_full';

  const paymentStatusStyle = isPaidFull
    ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40'
    : isDpPaid
      ? 'bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-500/40'
      : 'bg-amber-50 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40';

  const paymentStatusLabel = isPaidFull ? 'LUNAS (100%)' : isDpPaid ? 'DP TERBAYAR' : 'BELUM DP';
  const statusStyle = STATUS_STYLE[b.status] || STATUS_STYLE.cancelled;
  const statusDot = STATUS_DOT[b.status] || STATUS_DOT.cancelled;

  const handleOpenInvoice = () => {
    onClose();
    onOpenInvoice(b);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 border-t sm:border border-zinc-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-2xl max-w-lg w-full max-h-[92vh] sm:max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        {/* iOS Drag Handle */}
        <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mt-2.5 sm:hidden shrink-0" />

        {/* Header */}
        <div className="p-4 sm:p-6 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-widest font-semibold">
              BOOKING DETAILS
            </span>
            <h3 className="font-mono text-xl font-bold text-[#0066CC]">{b.bookingCode}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors active:scale-95 cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content - PRD Section 15 Structured Layout */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto flex flex-col gap-4 text-xs text-zinc-700 dark:text-zinc-300">
          {/* Section: CLIENT */}
          <div className="p-3.5 bg-zinc-50 dark:bg-zinc-950/60 rounded-xl border border-zinc-200 dark:border-zinc-800/80 flex flex-col gap-1.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#0066CC] font-bold">CLIENT</span>
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{b.customerName}</span>
              <a
                href={`https://wa.me/${b.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-mono font-medium flex items-center gap-1 active:scale-95"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{b.whatsapp}</span>
              </a>
            </div>
            {b.instagram && (
              <div className="text-[11px] text-zinc-500 pt-1 border-t border-zinc-200/60 dark:border-zinc-800/60">
                Instagram:{' '}
                <a
                  href={`https://instagram.com/${b.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[#0066CC] hover:underline font-semibold"
                >
                  {b.instagram}
                </a>
              </div>
            )}
          </div>

          {/* Section: SERVICE */}
          <div className="p-3.5 bg-zinc-50 dark:bg-zinc-950/60 rounded-xl border border-zinc-200 dark:border-zinc-800/80 flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#0066CC] font-bold">SERVICE</span>
            <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{b.serviceName}</span>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded w-fit">
              {b.packageName}
            </span>
          </div>

          {/* Section: EVENT DATE & SCHEDULE */}
          <div className="p-3.5 bg-zinc-50 dark:bg-zinc-950/60 rounded-xl border border-zinc-200 dark:border-zinc-800/80 flex flex-col gap-1.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#0066CC] font-bold">EVENT DATE</span>
            <div className="flex items-center justify-between">
              <span className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-500" />
                {formatDate(b.bookingDate)}
              </span>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-mono">
                {b.startTime || '08:00'} – {b.endTime || '14:00'} WIB
              </span>
            </div>
            {b.location && (
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 pt-1 border-t border-zinc-200/60 dark:border-zinc-800/60">
                <MapPin className="w-3.5 h-3.5 text-[#0066CC] shrink-0" />
                <span>{b.location}</span>
              </div>
            )}
          </div>

          {/* Section: STATUS & INVESTASI */}
          <div className="p-3.5 bg-zinc-50 dark:bg-zinc-950/60 rounded-xl border border-zinc-200 dark:border-zinc-800/80 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#0066CC] font-bold">STATUS & INVESTASI</span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono font-semibold ${statusStyle}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
                {b.status}
              </span>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-xs text-zinc-500">Estimasi Total:</span>
              <strong className="text-[#0066CC] font-mono text-lg font-extrabold">
                {b.totalPrice ? formatCurrency(b.totalPrice) : '-'}
              </strong>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-zinc-200/60 dark:border-zinc-800/60">
              <span className="text-xs text-zinc-500">Status Pembayaran:</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono flex items-center gap-1 ${paymentStatusStyle}`}>
                {paymentStatusLabel}
                {(isPaidFull || isDpPaid) && <Check className="w-3 h-3" />}
              </span>
            </div>
          </div>

          {b.notes && (
            <div className="p-3.5 bg-zinc-50 dark:bg-zinc-950/60 rounded-xl border border-zinc-200 dark:border-zinc-800/80 flex flex-col gap-1">
              <span className="text-zinc-500 font-mono text-[10px] uppercase">Catatan Khusus:</span>
              <p className="text-xs text-zinc-700 dark:text-zinc-300 italic">
                &ldquo;{b.notes}&rdquo;
              </p>
            </div>
          )}

          {/* Update Payment Quick Action */}
          <div className="flex flex-col gap-2 pt-1">
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono uppercase">Ubah Status Pembayaran:</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                disabled={isDpPaid || isPaidFull}
                onClick={() => onUpdatePayment(b.id, 'dp_paid')}
                className={`py-2.5 text-xs font-semibold uppercase rounded-xl transition-all text-center flex items-center justify-center gap-1 active:scale-95 cursor-pointer ${
                  isDpPaid || isPaidFull
                    ? 'opacity-50 cursor-not-allowed bg-zinc-100 dark:bg-zinc-950 text-zinc-400 dark:text-zinc-500 border border-zinc-200 dark:border-zinc-800'
                    : 'bg-[#0066CC] hover:bg-[#0052A3] text-white shadow-xs'
                }`}
              >
                <span>{isDpPaid ? 'DP Terbayar' : isPaidFull ? 'DP Selesai' : 'Set DP Terbayar'}</span>
                {(isDpPaid || isPaidFull) && <Check className="w-3.5 h-3.5" />}
              </button>

              <button
                disabled={isPaidFull}
                onClick={() => onUpdatePayment(b.id, 'paid_full')}
                className={`py-2.5 text-xs font-semibold uppercase rounded-xl transition-all text-center flex items-center justify-center gap-1 active:scale-95 cursor-pointer ${
                  isPaidFull
                    ? 'opacity-50 cursor-not-allowed bg-emerald-100/60 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                }`}
              >
                <span>{isPaidFull ? 'Lunas (100%)' : 'Set Lunas (100%)'}</span>
                {isPaidFull && <Check className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Sticky Bottom Actions */}
        <div className="p-4 sm:p-6 bg-zinc-50 dark:bg-zinc-900/90 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-3 shrink-0 pb-safe">
          <a
            href={generateGoogleCalendarUrl(b)}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 rounded-xl flex items-center justify-center active:scale-95 transition-colors"
            title="Tambah ke Google Calendar"
          >
            <Calendar className="w-4 h-4" />
          </a>

          <a
            href={`https://wa.me/${b.whatsapp.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs tracking-wider uppercase text-center rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98]"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat WA</span>
          </a>

          <button
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


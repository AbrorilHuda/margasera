'use client';

import React from 'react';
import { X, MessageCircle, FileText, Check } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Booking, PaymentStatus } from '@/lib/types';

interface BookingDetailModalProps {
  booking: Booking;
  onClose: () => void;
  onUpdatePayment: (id: string, status: PaymentStatus) => void;
  onOpenInvoice: (booking: Booking) => void;
}

export function BookingDetailModal({ booking: b, onClose, onUpdatePayment, onOpenInvoice }: BookingDetailModalProps) {
  const isDpPaid = b.paymentStatus === 'dp_paid';
  const isPaidFull = b.paymentStatus === 'paid_full';

  const paymentStatusStyle = isPaidFull
    ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40'
    : isDpPaid
      ? 'bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-500/40'
      : 'bg-amber-50 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40';

  const paymentStatusLabel = isPaidFull ? 'LUNAS (100%)' : isDpPaid ? 'DP TERBAYAR' : 'BELUM DP';

  const handleOpenInvoice = () => {
    onClose();
    onOpenInvoice(b);
  };

  const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex justify-between py-1.5 border-b border-zinc-200 dark:border-zinc-800/60">
      <span className="text-zinc-500 font-mono">{label}</span>
      {children}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Sticky Header */}
        <div className="p-4 sm:p-6 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0 sticky top-0 z-10">
          <div>
            <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Detail Pemesanan</span>
            <h3 className="font-mono text-xl font-bold text-[#0066CC]">{b.bookingCode}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Info Rows */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto flex flex-col gap-3 text-xs text-zinc-700 dark:text-zinc-300 font-light">
          <Row label="Nama Pelanggan:">
            <strong className="text-zinc-900 dark:text-zinc-100 text-sm font-semibold">{b.customerName}</strong>
          </Row>
          <Row label="WhatsApp:">
            <strong className="font-mono text-emerald-600 dark:text-emerald-400">{b.whatsapp}</strong>
          </Row>
          {b.instagram && (
            <Row label="Instagram Client:">
              <a
                href={`https://instagram.com/${b.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[#0066CC] hover:underline font-semibold"
              >
                {b.instagram}
              </a>
            </Row>
          )}
          <Row label="Layanan:">
            <strong className="text-zinc-800 dark:text-zinc-200">{b.serviceName} ({b.packageName})</strong>
          </Row>
          <Row label="Tanggal & Sesi Jam:">
            <strong className="text-amber-600 dark:text-amber-400 font-mono">
              {formatDate(b.bookingDate)} ({b.startTime || '08:00'} – {b.endTime || '14:00'} WIB)
            </strong>
          </Row>
          <Row label="Lokasi / Venue:">
            <strong className="text-zinc-800 dark:text-zinc-200">{b.location}</strong>
          </Row>
          <Row label="Total :">
            <strong className="text-[#0066CC] font-mono text-lg font-bold">
              {b.totalPrice ? formatCurrency(b.totalPrice) : '-'}
            </strong>
          </Row>
          <Row label="Status Pembayaran:">
            <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase font-mono flex items-center gap-1 ${paymentStatusStyle}`}>
              {paymentStatusLabel}
              {(isPaidFull || isDpPaid) && <Check className="w-3 h-3" />}
            </span>
          </Row>

          {b.notes && (
            <div className="flex flex-col gap-1 pt-2">
              <span className="text-zinc-500 font-mono text-[10px] uppercase">Catatan Khusus:</span>
              <p className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-700 dark:text-zinc-300 italic">
                &ldquo;{b.notes}&rdquo;
              </p>
            </div>
          )}

          {/* Payment Action Buttons */}
          <div className="flex flex-col gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono uppercase">Ubah Status Pembayaran:</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                disabled={isDpPaid || isPaidFull}
                onClick={() => onUpdatePayment(b.id, 'dp_paid')}
                className={`py-2 text-xs font-semibold uppercase rounded-lg transition-all text-center flex items-center justify-center gap-1 ${
                  isDpPaid || isPaidFull
                    ? 'opacity-50 cursor-not-allowed bg-zinc-100 dark:bg-zinc-950 text-zinc-400 dark:text-zinc-500 border border-zinc-200 dark:border-zinc-800'
                    : 'bg-[#0066CC] hover:bg-[#0052A3] text-white cursor-pointer shadow-xs'
                }`}
              >
                <span>{isDpPaid ? 'DP Terbayar' : isPaidFull ? 'DP Selesai' : 'Set DP Terbayar'}</span>
                {(isDpPaid || isPaidFull) && <Check className="w-3.5 h-3.5" />}
              </button>

              <button
                disabled={isPaidFull}
                onClick={() => onUpdatePayment(b.id, 'paid_full')}
                className={`py-2 text-xs font-semibold uppercase rounded-lg transition-all text-center flex items-center justify-center gap-1 ${
                  isPaidFull
                    ? 'opacity-50 cursor-not-allowed bg-emerald-100/60 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-xs'
                }`}
              >
                <span>{isPaidFull ? 'Lunas (100%)' : 'Set Lunas (100%)'}</span>
                {isPaidFull && <Check className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Sticky Bottom Actions */}
        <div className="p-4 sm:p-6 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-3 shrink-0 sticky bottom-0 z-10">
          <a
            href={`https://wa.me/${b.whatsapp.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs tracking-wider uppercase text-center rounded-lg flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat WA</span>
          </a>
          <button
            onClick={handleOpenInvoice}
            className="flex-1 py-3 bg-[#0066CC] hover:bg-[#0052A3] text-white font-semibold text-xs tracking-wider uppercase text-center rounded-lg flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Invoice</span>
          </button>
        </div>
      </div>
    </div>
  );
}

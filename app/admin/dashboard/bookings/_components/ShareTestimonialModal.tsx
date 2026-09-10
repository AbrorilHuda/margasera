'use client';

import React, { useState } from 'react';
import {
  Check,
  Copy,
  ExternalLink,
  MessageCircle,
  Share2,
  X,
  Sparkles,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { Booking } from '@/lib/types';

interface ShareTestimonialModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareTestimonialModal({
  booking,
  isOpen,
  onClose,
}: ShareTestimonialModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !booking) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://margasera.id';
  const testimonialUrl = `${origin}/testimoni?code=${encodeURIComponent(booking.bookingCode)}`;

  const cleanPhone = booking.whatsapp.replace(/[^0-9]/g, '');
  const waPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;

  const waMessage = `Halo Kak ${booking.customerName}! ✨\n\nTerima kasih banyak telah mempercayakan momen berharga Anda kepada tim Margasera Photography.\n\nSesi dokumentasi Anda telah kami tandai *Selesai (Completed)*. Kami akan sangat berbahagia jika Kakak berkenan membagikan sedikit ulasan dan cerita bahagia Anda melalui tautan resmi berikut:\n\n👉 ${testimonialUrl}\n\n*(Kode Booking Kakak: ${booking.bookingCode} otomatis terverifikasi)*\n\n"Moment Satu Hari Untuk Selamanya"\nSalam hangat,\nTim Margasera Photography`;

  const waShareUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(waMessage)}`;

  const handleCopy = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(testimonialUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Luminous Top Bar */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#0066CC] via-blue-400 to-emerald-400" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          aria-label="Tutup Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="flex flex-col gap-1 pr-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-[10px] font-mono font-bold uppercase w-fit">
              <ShieldCheck className="w-3 h-3" />
              <span>Booking Telah Selesai</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
              Kirim Tautan Testimoni Klien
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-light">
              Bagikan tautan berikut ke klien agar mereka dapat langsung mengisi ulasan dengan status *Terverifikasi*.
            </p>
          </div>
        </div>

        {/* Booking Summary Box */}
        <div className="mt-5 p-3.5 bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500 dark:text-zinc-400 font-light">Nama Klien:</span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">{booking.customerName}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500 dark:text-zinc-400 font-light">Layanan:</span>
            <span className="font-medium text-zinc-800 dark:text-zinc-200">{booking.serviceName}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500 dark:text-zinc-400 font-light">Kode Booking:</span>
            <span className="font-mono font-bold text-[#0066CC] dark:text-blue-400">{booking.bookingCode}</span>
          </div>
          {booking.bookingDate && (
            <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-200/60 dark:border-zinc-800/60">
              <span className="text-zinc-500 dark:text-zinc-400 font-light">Tanggal Dokumentasi:</span>
              <span className="font-mono text-zinc-700 dark:text-zinc-300 text-[11px] flex items-center gap-1">
                <Calendar className="w-3 h-3 text-amber-500" />
                {formatDate(booking.bookingDate)}
              </span>
            </div>
          )}
        </div>

        {/* Testimonial URL Field with Copy Button */}
        <div className="mt-5 flex flex-col gap-2">
          <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 font-semibold">
            Tautan Khusus Klien:
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-3 py-2.5 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono text-zinc-800 dark:text-zinc-200 truncate select-all">
              {testimonialUrl}
            </div>
            <button
              onClick={handleCopy}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold uppercase font-mono tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-xs ${copied
                  ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900'
                }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Action Buttons: WhatsApp & Direct Preview */}
        <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
          <a
            href={waShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Kirim via WhatsApp</span>
          </a>

          <a
            href={testimonialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-3 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Buka Halaman</span>
          </a>
        </div>

        {/* Footer info note */}
        <div className="mt-4 text-center">
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-light">
            Saat klien membuka tautan di atas, form testimoni otomatis terisi data &amp; mendapatkan badge{' '}
            <strong className="text-emerald-600 dark:text-emerald-400 font-medium">Klien Terverifikasi</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}

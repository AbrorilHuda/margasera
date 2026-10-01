'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  CheckCircle2,
  Send,
  Loader2,
  Search,
  TicketCheck,
  RotateCcw,
  ShieldCheck,
  ArrowLeft,
  Camera,
} from 'lucide-react';
import { submitClientTestimonial } from '@/lib/actions/testimonials';
import { getBookingByCode } from '@/lib/actions/bookings';
import type { Booking } from '@/lib/types';

const SERVICES = [
  'Wedding',
  'Pre-Wedding',
  'Engagement',
  'Siraman',
  'Wisuda Outdoor',
  'Sidang Skripsi',
  'Tasyakuran 40 Hari Bayi',
];

const RATING_DESCRIPTIONS: Record<number, string> = {
  1: 'Kurang Memuaskan',
  2: 'Cukup',
  3: 'Baik & Memuaskan',
  4: 'Sangat Baik & Profesional',
  5: 'Luar Biasa & Sangat Direkomendasikan',
};

export function TestimonialForm() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get('code') || '';

  const [bookingCodeInput, setBookingCodeInput] = useState(initialCode);
  const [isCheckingCode, setIsCheckingCode] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [verifiedBooking, setVerifiedBooking] = useState<Booking | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    eventType: 'Wedding',
    location: '',
    date: '',
    rating: 5,
    message: '',
  });

  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const activeRating = hoverRating !== null ? hoverRating : formData.rating;

  // Cek Kode Booking & Auto-fill Data
  const handleCheckBookingCode = async (codeOverride?: string) => {
    const code = (codeOverride || bookingCodeInput).trim().toUpperCase();
    if (!code) {
      setCodeError('Silakan ketik kode booking Anda (contoh: MS-260815-123).');
      return;
    }

    setIsCheckingCode(true);
    setCodeError('');

    try {
      const res = await getBookingByCode(code);
      if (res.booking) {
        const b = res.booking;
        setVerifiedBooking(b);
        setBookingCodeInput(b.bookingCode);

        // Petakan service name ke salah satu dari 7 layanan resmi
        let matchedService = 'Wedding';
        const svc = (b.serviceName || b.packageName || '').toLowerCase();
        if (svc.includes('pre-wedding') || svc.includes('prewedding')) {
          matchedService = 'Pre-Wedding';
        } else if (svc.includes('engagement') || svc.includes('lamaran') || svc.includes('tunangan')) {
          matchedService = 'Engagement';
        } else if (svc.includes('siraman')) {
          matchedService = 'Siraman';
        } else if (svc.includes('wisuda')) {
          matchedService = 'Wisuda Outdoor';
        } else if (svc.includes('sidang') || svc.includes('skripsi')) {
          matchedService = 'Sidang Skripsi';
        } else if (svc.includes('tasyakuran') || svc.includes('bayi') || svc.includes('maternity')) {
          matchedService = 'Tasyakuran 40 Hari Bayi';
        } else if (svc.includes('wedding') || svc.includes('nikah')) {
          matchedService = 'Wedding';
        }

        setFormData((prev) => ({
          ...prev,
          name: b.customerName || prev.name,
          eventType: matchedService,
          location: b.location ? b.location : prev.location,
          date: b.bookingDate || prev.date,
        }));
      } else {
        setCodeError(
          res.error || 'Kode booking tidak ditemukan. Silakan periksa kembali atau Anda dapat mengisi formulir secara manual.'
        );
      }
    } catch {
      setCodeError('Gagal memverifikasi kode booking. Anda tetap dapat melanjutkan mengisi ulasan secara manual.');
    } finally {
      setIsCheckingCode(false);
    }
  };

  // Auto-trigger jika ada ?code= di URL
  useEffect(() => {
    if (initialCode) {
      handleCheckBookingCode(initialCode);
    }
  }, [initialCode]);

  const handleResetBookingCode = () => {
    setVerifiedBooking(null);
    setBookingCodeInput('');
    setCodeError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name.trim()) {
      setErrorMessage('Mohon masukkan nama lengkap atau nama pasangan Anda.');
      return;
    }
    if (!formData.message.trim()) {
      setErrorMessage('Mohon tuliskan sedikit ulasan atau cerita pengalaman Anda.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitClientTestimonial({
        name: formData.name,
        eventType: formData.eventType,
        location: formData.location ? formData.location.trim() : undefined,
        message: formData.message,
        rating: formData.rating,
        bookingCode: verifiedBooking?.bookingCode || (bookingCodeInput ? bookingCodeInput.trim() : undefined),
      });

      if (res.success) {
        setIsSubmitted(true);
      } else {
        setErrorMessage(res.error || 'Terjadi kendala saat mengirim ulasan. Silakan coba kembali.');
      }
    } catch {
      setErrorMessage('Terjadi kesalahan jaringan. Mohon coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* 1. KODE BOOKING AUTO-FILL BOX */}
      {!isSubmitted && (
        <div className="p-5 sm:p-6 bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-xs transition-colors">
          <div className="flex items-start gap-3.5 mb-4">
            <div className="w-9 h-9 rounded-xl bg-[#0066CC]/10 dark:bg-[#0066CC]/15 border border-[#0066CC]/20 dark:border-[#0066CC]/30 text-[#0066CC] dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
              <TicketCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100 font-sans">
                Punya Kode Booking? Isi Otomatis
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-light mt-0.5 leading-relaxed font-sans">
                Ketik kode pemesanan (contoh: <span className="font-mono text-zinc-800 dark:text-zinc-300 font-medium">MS-260815-123</span>) agar data nama, layanan, dan tanggal langsung terisi.
              </p>
            </div>
          </div>

          {verifiedBooking ? (
            /* State: Kode Booking Terverifikasi */
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-700/40 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono text-emerald-700 dark:text-emerald-300">
                      {verifiedBooking.bookingCode}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 font-medium">
                      Terverifikasi
                    </span>
                  </div>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 font-light mt-0.5 font-sans">
                    Data {verifiedBooking.customerName} ({verifiedBooking.serviceName || verifiedBooking.packageName || 'Sesi Foto'}) otomatis dimuat.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleResetBookingCode}
                className="text-xs text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 font-sans"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Ganti Kode</span>
              </button>
            </div>
          ) : (
            /* State: Input Pencarian Kode */
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCheckBookingCode();
              }}
              className="flex flex-col sm:flex-row gap-2.5"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={bookingCodeInput}
                  onChange={(e) => setBookingCodeInput(e.target.value.toUpperCase())}
                  placeholder="Masukkan Kode Booking (Contoh: MS-260815-123)"
                  className="w-full px-4 py-3 bg-zinc-50/80 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-mono text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 placeholder:font-sans focus:outline-none focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC]/30 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={isCheckingCode}
                className="px-5 py-3 bg-[#0066CC] hover:bg-[#0052A3] disabled:opacity-50 text-white text-xs font-medium tracking-wider uppercase rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer shrink-0 active:scale-95"
              >
                {isCheckingCode ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memeriksa...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Cek Kode</span>
                  </>
                )}
              </button>
            </form>
          )}

          {codeError && (
            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium mt-2.5 font-sans">
              {codeError}
            </p>
          )}
        </div>
      )}

      {/* 2. FORMULIR TESTIMONI */}
      <AnimatePresence mode="wait">
        {isSubmitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="p-8 sm:p-12 bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl text-center flex flex-col items-center gap-6 shadow-xs transition-colors"
          >
            {/* Animated Checkmark Badge */}
            <motion.div
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 18 }}
              className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 my-2"
            >
              <CheckCircle2 className="w-8 h-8" />
            </motion.div>

            <div className="max-w-lg flex flex-col items-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 text-[10px] font-medium tracking-widest uppercase mb-2 font-sans">
                Testimoni Berhasil Terkirim
              </span>

              <h3 className="font-serif-editorial text-2xl sm:text-4xl text-zinc-900 dark:text-zinc-100 font-light mt-1 tracking-wide uppercase">
                Terima Kasih, {formData.name}!
              </h3>

              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-light mt-3 leading-relaxed max-w-md font-sans">
                Cerita dan ulasan hangat Anda untuk dokumentasi <span className="font-medium text-zinc-900 dark:text-zinc-200">{formData.eventType}</span> telah berhasil kami terima. Apresiasi Anda menjadi energi bagi tim Margasera Photography.
              </p>
            </div>

            {/* Action Buttons Centered */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-md pt-4">
              <Link
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-medium tracking-[0.2em] uppercase rounded-full shadow-[0_4px_20px_rgba(0,102,204,0.25)] hover:shadow-[0_4px_28px_rgba(0,102,204,0.4)] transition-all cursor-pointer active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Beranda</span>
              </Link>

              <Link
                href="/work"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-900 dark:bg-zinc-900/60 dark:hover:bg-zinc-800 dark:text-zinc-300 dark:hover:text-white text-xs font-medium tracking-[0.2em] uppercase rounded-full border border-zinc-200 dark:border-zinc-800 transition-all cursor-pointer active:scale-95"
              >
                <Camera className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                <span>Lihat Portofolio</span>
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="p-6 sm:p-10 md:p-12 bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl flex flex-col gap-6 shadow-xs transition-colors"
          >
            {errorMessage && (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl text-xs text-rose-700 dark:text-rose-300 font-medium font-sans">
                {errorMessage}
              </div>
            )}

            {/* Field: Nama Lengkap */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300 font-sans">
                Nama Lengkap / Nama Pasangan <span className="text-rose-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Aulia & Fajar, atau Dinda Lestari"
                className="w-full px-4 py-3 bg-zinc-50/80 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 rounded-xl focus:outline-none focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC]/30 transition-all font-sans text-sm"
              />
            </div>

            {/* Field: Layanan & Lokasi (2 Kolom) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="eventType" className="text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300 font-sans">
                  Layanan Yang Digunakan <span className="text-rose-500">*</span>
                </label>
                <select
                  id="eventType"
                  value={formData.eventType}
                  onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-50/80 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC]/30 transition-all font-sans text-sm cursor-pointer"
                >
                  {SERVICES.map((s) => (
                    <option key={s} value={s} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="location" className="text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300 font-sans">
                    Lokasi Acara / Sesi Foto <span className="text-[11px] font-normal text-zinc-500 dark:text-zinc-400 lowercase">(opsional)</span>
                  </label>
                  {verifiedBooking && formData.location && (
                    <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                      Otomatis dari booking
                    </span>
                  )}
                </div>
                <input
                  id="location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Contoh: Pamekasan, Madura (opsional)"
                  className="w-full px-4 py-3 bg-zinc-50/80 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 rounded-xl focus:outline-none focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC]/30 transition-all font-sans text-sm"
                />
              </div>
            </div>

            {/* Field: Interactive Star Rating */}
            <div className="flex flex-col gap-2.5 p-5 bg-zinc-50/80 dark:bg-zinc-950/60 border border-zinc-200/90 dark:border-zinc-800/80 rounded-xl transition-colors">
              <label className="text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300 font-sans">
                Tingkat Kepuasan &amp; Rating <span className="text-rose-500">*</span>
              </label>

              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="p-1 hover:scale-110 transition-transform cursor-pointer focus:outline-none active:scale-95"
                    aria-label={`Beri rating ${star} bintang`}
                  >
                    <Star
                      className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                        star <= activeRating
                          ? 'fill-amber-400 text-amber-400 drop-shadow-[0_1px_2px_rgba(251,191,36,0.3)]'
                          : 'text-zinc-300 dark:text-zinc-700 hover:text-amber-400 dark:hover:text-amber-300/80'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-sm font-bold font-mono text-amber-600 dark:text-amber-400 ml-2">
                  {activeRating}.0 / 5.0
                </span>
              </div>

              <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium italic font-sans">
                {RATING_DESCRIPTIONS[activeRating]}
              </span>
            </div>

            {/* Field: Ulasan & Cerita Pengalaman */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="message" className="text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300 font-sans">
                Ulasan &amp; Cerita Pengalaman Anda <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="message"
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Bagikan cerita Anda: bagaimana arahan pose fotografer, kenyamanan saat pemotretan, ketepatan waktu, dan kualitas tone hasil foto & album Anda..."
                className="w-full px-4 py-3.5 bg-zinc-50/80 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 rounded-xl focus:outline-none focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC]/30 transition-all font-sans text-sm resize-none leading-relaxed"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full py-4 bg-[#0066CC] hover:bg-[#0052A3] disabled:opacity-50 text-white text-xs font-medium tracking-[0.2em] uppercase rounded-full shadow-[0_4px_20px_rgba(0,102,204,0.25)] hover:shadow-[0_4px_28px_rgba(0,102,204,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-98"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mengirimkan Ulasan...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirimkan Ulasan Sekarang</span>
                </>
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

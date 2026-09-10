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
  5: 'Luar Biasa & Sangat Direkomendasikan! ⭐⭐⭐⭐⭐',
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
    location: 'Pamekasan, Madura',
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
          location: b.location || prev.location,
          date: b.bookingDate || prev.date,
        }));
      } else {
        setCodeError(
          res.error || 'Kode booking tidak ditemukan. Silakan periksa kembali atau Anda dapat mengisi formulir secara manual.'
        );
      }
    } catch (err) {
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
        location: formData.location,
        message: formData.message,
        rating: formData.rating,
        bookingCode: verifiedBooking?.bookingCode || (bookingCodeInput ? bookingCodeInput.trim() : undefined),
      });

      if (res.success) {
        setIsSubmitted(true);
      } else {
        setErrorMessage(res.error || 'Terjadi kendala saat mengirim ulasan. Silakan coba kembali.');
      }
    } catch (err) {
      setErrorMessage('Terjadi kesalahan jaringan. Mohon coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* 1. KODE BOOKING AUTO-FILL BOX */}
      {!isSubmitted && (
        <div className="p-5 sm:p-6 bg-white dark:bg-gradient-to-b dark:from-zinc-900/95 dark:to-zinc-900/80 backdrop-blur-xl border border-zinc-200/90 dark:border-zinc-800/90 rounded-2xl shadow-xs dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
          <div className="flex items-start gap-3.5 mb-4">
            <div className="w-9 h-9 rounded-xl bg-[#0066CC]/10 dark:bg-blue-500/15 border border-[#0066CC]/20 dark:border-blue-400/30 text-[#0066CC] dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
              <TicketCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Punya Kode Booking? Isi Otomatis Lebih Cepat
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-light mt-0.5 leading-relaxed">
                Masukkan kode pemesanan (contoh: <span className="font-mono font-medium text-zinc-800 dark:text-zinc-200">MS-260815-123</span>) agar data nama, layanan, dan lokasi Anda otomatis terisi.
              </p>
            </div>
          </div>

          {verifiedBooking ? (
            /* State: Kode Booking Terverifikasi */
            <div className="p-4 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-600/40 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono text-emerald-700 dark:text-emerald-300">
                      {verifiedBooking.bookingCode}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-medium">
                      Terverifikasi
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300/90 font-light mt-0.5">
                    Data {verifiedBooking.customerName} ({verifiedBooking.serviceName || verifiedBooking.packageName || 'Sesi Foto'}) otomatis dimuat.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleResetBookingCode}
                className="text-xs text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
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
                  className="w-full px-4 py-3 bg-zinc-50/80 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-700/80 rounded-xl text-sm font-mono text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 placeholder:font-sans focus:outline-hidden focus:border-[#0066CC] dark:focus:border-blue-400 focus:ring-2 focus:ring-[#0066CC]/20 dark:focus:ring-blue-500/25 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={isCheckingCode}
                className="px-5 py-3 bg-[#0066CC] hover:bg-[#0052A3] dark:hover:bg-blue-600 disabled:opacity-50 text-white text-xs font-semibold tracking-wider uppercase rounded-xl transition-all shadow-md shadow-[#0066CC]/25 dark:shadow-[0_0_20px_rgba(0,102,204,0.3)] flex items-center justify-center gap-2 cursor-pointer shrink-0"
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
            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium mt-2.5">
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
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
            className="p-8 sm:p-14 bg-white dark:bg-gradient-to-b dark:from-zinc-900/95 dark:to-zinc-950/95 backdrop-blur-xl border border-zinc-200/90 dark:border-zinc-800/90 rounded-3xl text-center shadow-lg dark:shadow-[0_12px_50px_rgba(0,0,0,0.6)] flex flex-col items-center gap-6"
          >
            {/* Animated Checkmark Badge (High Contrast in Light & Dark Mode) */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 18 }}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border-2 border-emerald-500 dark:border-emerald-400 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/25 my-2"
            >
              <CheckCircle2 className="w-9 h-9 sm:w-11 sm:h-11" />
            </motion.div>

            <div className="max-w-lg flex flex-col items-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 text-[10px] font-semibold tracking-widest uppercase mb-2">
                <span>Testimoni Berhasil Dikirimkan</span>
              </div>

              <h3 className="font-serif-editorial text-2xl sm:text-4xl text-zinc-900 dark:text-white font-light mt-1 tracking-wide uppercase">
                Terima Kasih, {formData.name}!
              </h3>

              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300/90 font-light mt-3 leading-relaxed max-w-md">
                Cerita dan ulasan hangat Anda untuk dokumentasi <span className="font-medium text-zinc-900 dark:text-zinc-100">{formData.eventType}</span> telah berhasil kami terima. Apresiasi Anda menjadi energi dan kebanggaan bagi tim Margasera Photography di Pamekasan &amp; Madura.
              </p>
            </div>

            {/* Action Buttons Centered */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md pt-4">
              <Link
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#0066CC] hover:bg-[#0052A3] dark:hover:bg-blue-600 text-white text-xs font-semibold tracking-widest uppercase rounded-xl transition-all duration-300 shadow-md shadow-[#0066CC]/25 dark:shadow-[0_0_24px_rgba(0,102,204,0.4)] hover:shadow-lg hover:shadow-[#0066CC]/35 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Beranda</span>
              </Link>

              <Link
                href="/work"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/90 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-100 text-xs font-semibold tracking-wider uppercase rounded-xl border border-zinc-200/80 dark:border-zinc-700/80 transition-all duration-300 cursor-pointer"
              >
                <Camera className="w-4 h-4 text-[#0066CC] dark:text-blue-400" />
                <span>Lihat Portofolio</span>
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="p-6 sm:p-10 md:p-12 bg-white dark:bg-gradient-to-b dark:from-zinc-900/95 dark:via-zinc-900/90 dark:to-zinc-950/95 backdrop-blur-xl border border-zinc-200/90 dark:border-zinc-800/90 rounded-3xl shadow-md dark:shadow-[0_12px_45px_rgba(0,0,0,0.6)] flex flex-col gap-6"
          >
            {errorMessage && (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl text-xs text-rose-700 dark:text-rose-300 font-medium">
                {errorMessage}
              </div>
            )}

            {/* Field: Nama Lengkap */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                Nama Lengkap / Nama Pasangan <span className="text-rose-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Aulia & Fajar, atau Dinda Lestari"
                className="w-full px-4 py-3.5 bg-zinc-50/80 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-700/80 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-[#0066CC] dark:focus:border-blue-400 focus:ring-2 focus:ring-[#0066CC]/20 dark:focus:ring-blue-500/25 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500 font-sans"
              />
            </div>

            {/* Field: Layanan & Lokasi (2 Kolom) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="eventType" className="text-xs font-semibold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                  Layanan Yang Digunakan <span className="text-rose-500">*</span>
                </label>
                <select
                  id="eventType"
                  value={formData.eventType}
                  onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                  className="w-full px-4 py-3.5 bg-zinc-50/80 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-700/80 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-[#0066CC] dark:focus:border-blue-400 focus:ring-2 focus:ring-[#0066CC]/20 dark:focus:ring-blue-500/25 transition-all font-sans cursor-pointer"
                >
                  {SERVICES.map((s) => (
                    <option key={s} value={s} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="location" className="text-xs font-semibold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                  Lokasi Acara / Sesi Foto
                </label>
                <input
                  id="location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Contoh: Pamekasan, Madura / Sumenep"
                  className="w-full px-4 py-3.5 bg-zinc-50/80 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-700/80 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-[#0066CC] dark:focus:border-blue-400 focus:ring-2 focus:ring-[#0066CC]/20 dark:focus:ring-blue-500/25 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500 font-sans"
                />
              </div>
            </div>

            {/* Field: Interactive Star Rating */}
            <div className="flex flex-col gap-2.5 p-5 bg-zinc-50/90 dark:bg-gradient-to-br dark:from-zinc-950/90 dark:via-zinc-900/60 dark:to-zinc-950/90 border border-zinc-200/90 dark:border-zinc-750/90 dark:border-zinc-700/70 rounded-2xl dark:shadow-inner">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                Tingkat Kepuasan &amp; Rating Anda <span className="text-rose-500">*</span>
              </label>

              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="p-1 text-zinc-300 dark:text-zinc-700 hover:scale-115 transition-transform cursor-pointer focus:outline-none"
                    aria-label={`Beri rating ${star} bintang`}
                  >
                    <Star
                      className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                        star <= activeRating
                          ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]'
                          : 'text-zinc-300 dark:text-zinc-700 hover:text-amber-300 dark:hover:text-amber-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-base font-bold font-mono text-amber-500 dark:text-amber-400 ml-2">
                  {activeRating}.0 / 5.0
                </span>
              </div>

              <span className="text-xs text-zinc-600 dark:text-zinc-300 font-medium italic">
                {RATING_DESCRIPTIONS[activeRating]}
              </span>
            </div>

            {/* Field: Ulasan & Cerita Pengalaman */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="message" className="text-xs font-semibold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                Ulasan &amp; Cerita Pengalaman Anda <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="message"
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Bagikan cerita Anda: bagaimana arahan pose fotografer, kenyamanan saat pemotretan, ketepatan waktu, dan kualitas tone hasil foto & album Anda..."
                className="w-full px-4 py-3.5 bg-zinc-50/80 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-700/80 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-[#0066CC] dark:focus:border-blue-400 focus:ring-2 focus:ring-[#0066CC]/20 dark:focus:ring-blue-500/25 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500 font-sans resize-none leading-relaxed"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-3 w-full py-4 bg-[#0066CC] hover:bg-[#0052A3] dark:bg-[#0066CC] dark:hover:bg-blue-600 disabled:opacity-50 text-white text-xs font-semibold tracking-widest uppercase rounded-xl transition-all duration-300 shadow-lg shadow-[#0066CC]/25 dark:shadow-[0_0_30px_rgba(0,102,204,0.35)] hover:shadow-xl hover:shadow-[#0066CC]/40 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2.5 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mengirimkan Testimoni...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Kirimkan Testimoni Sekarang</span>
                </>
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

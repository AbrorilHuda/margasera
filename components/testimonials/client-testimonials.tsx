'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ArrowRight,
  PenLine,
} from 'lucide-react';
import { CLIENT_TESTIMONIALS, Testimonial } from '@/lib/data/testimonials';

const SERVICE_FILTERS = [
  'Semua Momen',
  'Wedding',
  'Pre-Wedding',
  'Engagement',
  'Siraman',
  'Wisuda Outdoor',
  'Sidang Skripsi',
  'Tasyakuran 40 Hari Bayi',
];

function getInitials(name: string): string {
  const parts = name.replace(/[^a-zA-Z\s]/g, '').trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface ClientTestimonialsProps {
  initialTestimonials?: Testimonial[] | null;
}

export function ClientTestimonials({ initialTestimonials }: ClientTestimonialsProps = {}) {
  const [selectedFilter, setSelectedFilter] = useState('Semua Momen');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  // Gunakan data dari Supabase jika ada, atau fallback ke CLIENT_TESTIMONIALS
  const allTestimonials = useMemo(() => {
    if (initialTestimonials && initialTestimonials.length > 0) {
      return initialTestimonials;
    }
    return CLIENT_TESTIMONIALS;
  }, [initialTestimonials]);

  const filteredTestimonials = useMemo(() => {
    if (selectedFilter === 'Semua Momen') {
      return allTestimonials;
    }
    return allTestimonials.filter(
      (t) => t.eventType.toLowerCase() === selectedFilter.toLowerCase()
    );
  }, [selectedFilter, allTestimonials]);

  // Reset index when filter changes
  useEffect(() => {
    setCurrentIndex(0);
    setDirection(1);
  }, [selectedFilter]);

  // Auto-slide setiap 4.5 detik secara otomatis
  useEffect(() => {
    if (filteredTestimonials.length <= 1) return;

    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % filteredTestimonials.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [filteredTestimonials.length, currentIndex]);

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex(
      (prev) => (prev - 1 + filteredTestimonials.length) % filteredTestimonials.length
    );
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % filteredTestimonials.length);
  };

  const current = filteredTestimonials[currentIndex] || allTestimonials[0];

  return (
    <section
      className="w-full py-20 sm:py-28 px-4 sm:px-6 md:px-12 bg-zinc-50/60 dark:bg-gradient-to-b dark:from-zinc-950 dark:via-zinc-900/20 dark:to-zinc-950 border-t border-zinc-200 dark:border-zinc-900 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-12 sm:gap-16">
        {/* 1. Header Section */}
        <div className="text-center max-w-3xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5">
            <span className="text-xs font-semibold tracking-[0.3em] uppercase text-[#0066CC]">
              KATA MEREKA TENTANG MARGASERA
            </span>
          </div>

          <h2 className="font-serif-editorial text-3xl sm:text-5xl md:text-6xl text-zinc-900 dark:text-zinc-100 font-light tracking-wide uppercase">
            Kepercayaan &amp; Cerita Klien
          </h2>

          <p className="font-serif text-sm sm:text-base text-amber-600 dark:text-amber-300/90 italic mt-2">
            &ldquo;Moment Satu Hari Untuk Selamanya&rdquo;
          </p>

          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-light mt-3 max-w-xl leading-relaxed">
            Pengalaman dan ulasan jujur dari pasangan, keluarga, dan wisudawan yang mempercayakan dokumentasi visual hari berharganya kepada tim Margasera Photography di Pamekasan &amp; Madura.
          </p>

          {/* Key Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full mt-8 pt-8 border-t border-zinc-200/80 dark:border-zinc-800/60">
            <div className="p-3.5 bg-white dark:bg-zinc-900/50 border border-zinc-200/70 dark:border-zinc-800/80 rounded-xl flex flex-col items-center justify-center text-center shadow-2xs">
              <div className="flex items-center gap-1 text-amber-400 mb-0.5">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-mono">5.0 / 5.0</span>
              </div>
              <span className="text-[10px] text-zinc-500 font-light">Rating Kepuasan</span>
            </div>

            <div className="p-3.5 bg-white dark:bg-zinc-900/50 border border-zinc-200/70 dark:border-zinc-800/80 rounded-xl flex flex-col items-center justify-center text-center shadow-2xs">
              <span className="text-sm font-bold text-[#0066CC] dark:text-blue-400 font-mono mb-0.5">100%</span>
              <span className="text-[10px] text-zinc-500 font-light">Klien Merekomendasikan</span>
            </div>

            <div className="p-3.5 bg-white dark:bg-zinc-900/50 border border-zinc-200/70 dark:border-zinc-800/80 rounded-xl flex flex-col items-center justify-center text-center shadow-2xs">
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-mono mb-0.5">7 Kategori</span>
              <span className="text-[10px] text-zinc-500 font-light">Layanan Dokumentasi</span>
            </div>

            <div className="p-3.5 bg-white dark:bg-zinc-900/50 border border-zinc-200/70 dark:border-zinc-800/80 rounded-xl flex flex-col items-center justify-center text-center shadow-2xs">
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono mb-0.5">Pamekasan</span>
              <span className="text-[10px] text-zinc-500 font-light">&amp; Seluruh Madura</span>
            </div>
          </div>
        </div>

        {/* 2. Category Filter Pills */}
        <div className="flex items-center justify-center gap-2 flex-wrap max-w-4xl mx-auto">
          {SERVICE_FILTERS.map((cat) => {
            const isSelected = selectedFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedFilter(cat)}
                className={`px-3.5 py-1.5 text-xs rounded-full transition-all duration-200 cursor-pointer ${isSelected
                  ? 'bg-[#0066CC] text-white font-medium shadow-sm shadow-[#0066CC]/20'
                  : 'bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* 3. Featured Testimonial Card with Spotlight Animation */}
        <div className="w-full relative">
          <div className="relative bg-white dark:bg-zinc-900/70 border border-zinc-200/90 dark:border-zinc-800/90 rounded-2xl p-6 sm:p-10 md:p-14 shadow-sm dark:shadow-[0_0_35px_rgba(0,102,204,0.06)] overflow-hidden">
            <div className="min-h-[220px] sm:min-h-[200px] flex flex-col justify-between relative z-10">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={current.id}
                  custom={direction}
                  initial={{ opacity: 0, x: direction > 0 ? 32 : -32 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction > 0 ? -32 : 32 }}
                  transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
                  className="flex flex-col gap-6"
                >
                  {/* Top Bar: Event Pill, Rating, & Verified Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#0066CC]/10 text-[#0066CC] dark:text-blue-400 border border-[#0066CC]/20">
                        {current.eventType}
                      </span>
                      {current.bookingCode ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/40 font-medium">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Klien Terverifikasi</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] bg-blue-50 dark:bg-blue-950/40 text-[#0066CC] dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/40 font-medium">
                          <PenLine className="w-3.5 h-3.5" />
                          <span>Ulasan Klien</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-amber-400">
                      {Array.from({ length: current.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                      <span className="text-xs font-mono font-semibold text-zinc-800 dark:text-zinc-200 ml-1.5">
                        5.0
                      </span>
                    </div>
                  </div>

                  {/* Message Quote */}
                  <p className="font-serif-editorial text-lg sm:text-2xl md:text-3xl text-zinc-900 dark:text-zinc-100 font-light leading-relaxed italic pr-4">
                    &ldquo;{current.message}&rdquo;
                  </p>

                  {/* Client Info Strip */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-zinc-100 dark:border-zinc-800/60">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#0066CC] to-blue-400 text-white font-semibold text-xs flex items-center justify-center shadow-xs shrink-0 tracking-wider">
                        {getInitials(current.name)}
                      </div>
                      <div>
                        <h4 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-white tracking-wide">
                          {current.name}
                        </h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-light">
                          Dokumentasi di <span className="text-zinc-700 dark:text-zinc-300 font-medium">{current.location}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:text-right">
                      <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
                        {current.date}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Auto-Slide Progress Bar */}
            {filteredTestimonials.length > 1 && (
              <div className="w-full h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mt-6">
                <motion.div
                  key={`progress-${currentIndex}-${current.id}`}
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 4.5, ease: 'linear' }}
                  className="h-full bg-gradient-to-r from-[#0066CC] to-blue-400 rounded-full"
                />
              </div>
            )}

            {/* Carousel Navigation Bar */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800/60 relative z-10">
              {/* Pagination Dots */}
              <div className="flex items-center gap-1.5">
                {filteredTestimonials.map((t, idx) => (
                  <button
                    key={t.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-1.5 transition-all duration-300 rounded-full cursor-pointer ${currentIndex === idx
                      ? 'w-7 bg-[#0066CC]'
                      : 'w-2 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600'
                      }`}
                    aria-label={`Slide ulasan ke-${idx + 1}`}
                  />
                ))}
              </div>

              {/* Prev / Next Arrows */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="w-9 h-9 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 hover:border-[#0066CC] hover:text-[#0066CC] text-zinc-700 dark:text-zinc-300 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                  aria-label="Testimoni Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-9 h-9 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 hover:border-[#0066CC] hover:text-[#0066CC] text-zinc-700 dark:text-zinc-300 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                  aria-label="Testimoni Selanjutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Dedicated Client Testimonial CTA Box (Directs to /testimoni) */}
        <div className="w-full p-6 sm:p-10 bg-gradient-to-br from-white via-blue-50/20 to-white dark:from-zinc-900/90 dark:via-zinc-900/60 dark:to-zinc-950 border border-blue-100 dark:border-zinc-800/90 rounded-2xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-left flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#0066CC]/10 dark:bg-blue-950/40 text-[#0066CC] dark:text-blue-400 flex items-center justify-center shrink-0 mt-1 border border-[#0066CC]/20">
              <PenLine className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-white tracking-wide">
                Pernah Mengabadikan Momen Bersama Margasera?
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-light mt-1 leading-relaxed max-w-xl">
                Bagikan pengalaman dan cerita bahagia Anda bersama kami. Setiap ulasan Anda menjadi inspirasi bagi calon klien lainnya di Pamekasan &amp; Madura.
              </p>
              <div className="flex items-center gap-3 text-[11px] text-zinc-500 font-light mt-2.5">
                <span>✓ Tanpa perlu login akun</span>
                <span>•</span>
                <span>✓ Proses pengisian mudah &amp; cepat</span>
              </div>
            </div>
          </div>

          <Link
            href="/testimoni"
            className="shrink-0 inline-flex items-center gap-2.5 px-6 py-3.5 bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-semibold tracking-wider uppercase rounded-xl transition-all duration-300 shadow-md shadow-[#0066CC]/25 hover:shadow-lg hover:shadow-[#0066CC]/35 hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>Beri Ulasan / Testimoni</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

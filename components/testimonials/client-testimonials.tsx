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
  Calendar,
  Sparkles,
  RotateCcw,
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

  // Ambil hanya data asli dari Supabase (tidak memakai data dummy)
  const allTestimonials = useMemo(() => {
    if (initialTestimonials && initialTestimonials.length > 0) {
      return initialTestimonials;
    }
    return [];
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

  // Auto-slide setiap 4.5 detik jika ulasan lebih dari 1
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

  const current = filteredTestimonials[currentIndex] || filteredTestimonials[0] || null;

  return (
    <section
      className="relative w-full py-20 sm:py-28 px-4 sm:px-6 md:px-12 bg-zinc-50/60 dark:bg-zinc-950 border-t border-zinc-200/80 dark:border-zinc-900 overflow-hidden"
    >
      {/* Dark Mode Ambient Light Orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden select-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[360px] bg-gradient-to-b from-[#0066CC]/15 via-indigo-600/5 to-transparent blur-3xl opacity-70 dark:opacity-80 rounded-full" />
        <div className="absolute top-1/3 -left-32 w-[380px] h-[380px] bg-blue-500/5 dark:bg-[#0066CC]/10 blur-3xl rounded-full" />
        <div className="absolute bottom-10 right-0 w-[420px] h-[350px] bg-amber-500/5 dark:bg-amber-500/8 blur-3xl rounded-full" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto flex flex-col gap-12 sm:gap-16">
        {/* 1. Header Section */}
        <div className="text-center max-w-3xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/20 dark:border-blue-500/30 backdrop-blur-md mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0066CC] dark:bg-blue-400 animate-pulse" />
            <span className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[#0066CC] dark:text-blue-400">
              KATA MEREKA TENTANG MARGASERA
            </span>
          </div>

          <h2 className="font-serif-editorial text-3xl sm:text-5xl md:text-6xl text-zinc-900 dark:text-white font-light tracking-wide uppercase drop-shadow-xs">
            Kepercayaan &amp; Cerita Klien
          </h2>

          <p className="font-serif text-sm sm:text-base text-amber-600 dark:text-amber-400 italic mt-2 dark:drop-shadow-[0_0_12px_rgba(251,191,36,0.25)]">
            &ldquo;Moment Satu Hari Untuk Selamanya&rdquo;
          </p>

          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-light mt-3 max-w-xl leading-relaxed">
            Pengalaman dan ulasan jujur dari pasangan, keluarga, dan wisudawan yang mempercayakan dokumentasi visual hari berharganya kepada tim Margasera Photography di Pamekasan &amp; Madura.
          </p>

          {/* Key Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full mt-8 pt-8 border-t border-zinc-200/80 dark:border-zinc-800/80">
            {allTestimonials.length > 0 ? (
              <>
                <div className="p-3.5 sm:p-4 bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl flex flex-col items-center justify-center text-center shadow-xs dark:shadow-[0_4px_20px_rgba(0,0,0,0.35)] transition-all hover:border-zinc-300 dark:hover:border-zinc-700/80">
                  <div className="flex items-center gap-1.5 text-amber-400 mb-0.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                    <span className="text-sm font-bold text-zinc-900 dark:text-white font-mono">5.0 / 5.0</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-light">Rating Kepuasan</span>
                </div>

                <div className="p-3.5 sm:p-4 bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl flex flex-col items-center justify-center text-center shadow-xs dark:shadow-[0_4px_20px_rgba(0,0,0,0.35)] transition-all hover:border-zinc-300 dark:hover:border-zinc-700/80">
                  <span className="text-sm font-bold text-[#0066CC] dark:text-blue-400 font-mono mb-0.5">
                    {allTestimonials.length}+ Klien
                  </span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-light">Ulasan Terverifikasi</span>
                </div>
              </>
            ) : (
              <>
                <div className="p-3.5 sm:p-4 bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl flex flex-col items-center justify-center text-center shadow-xs dark:shadow-[0_4px_20px_rgba(0,0,0,0.35)] transition-all hover:border-zinc-300 dark:hover:border-zinc-700/80">
                  <span className="text-sm font-bold text-amber-500 dark:text-amber-400 font-mono mb-0.5">Editorial</span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-light">Standar Visual</span>
                </div>

                <div className="p-3.5 sm:p-4 bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl flex flex-col items-center justify-center text-center shadow-xs dark:shadow-[0_4px_20px_rgba(0,0,0,0.35)] transition-all hover:border-zinc-300 dark:hover:border-zinc-700/80">
                  <span className="text-sm font-bold text-[#0066CC] dark:text-blue-400 font-mono mb-0.5">100%</span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-light">Komitmen Kualitas</span>
                </div>
              </>
            )}

            <div className="p-3.5 sm:p-4 bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl flex flex-col items-center justify-center text-center shadow-xs dark:shadow-[0_4px_20px_rgba(0,0,0,0.35)] transition-all hover:border-zinc-300 dark:hover:border-zinc-700/80">
              <span className="text-sm font-bold text-zinc-900 dark:text-white font-mono mb-0.5">7 Kategori</span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-light">Layanan Dokumentasi</span>
            </div>

            <div className="p-3.5 sm:p-4 bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl flex flex-col items-center justify-center text-center shadow-xs dark:shadow-[0_4px_20px_rgba(0,0,0,0.35)] transition-all hover:border-zinc-300 dark:hover:border-zinc-700/80">
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono mb-0.5">Madura</span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-light">&amp; Surabaya</span>
            </div>
          </div>
        </div>

        {/* 2. State: Jika Belum Ada Testimoni Tersimpan di Database */}
        {allTestimonials.length === 0 ? (
          <div className="w-full relative">
            <div className="relative bg-white/90 dark:bg-gradient-to-b dark:from-zinc-900/90 dark:via-zinc-900/60 dark:to-zinc-950/95 border border-dashed border-zinc-300/90 dark:border-zinc-800 rounded-3xl p-8 sm:p-14 text-center flex flex-col items-center justify-center shadow-sm dark:shadow-[0_16px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl overflow-hidden">
              {/* Inner ambient glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-36 bg-[#0066CC]/10 dark:bg-blue-500/15 blur-3xl pointer-events-none" />

              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/60 dark:to-blue-900/30 text-[#0066CC] dark:text-blue-400 flex items-center justify-center mb-4 border border-blue-200 dark:border-blue-500/30 shadow-md shadow-blue-500/10 dark:shadow-[0_0_20px_rgba(0,102,204,0.25)]">
                <PenLine className="w-8 h-8" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-semibold mb-2 shadow-xs">
                <span>Jadilah yang Pertama</span>
              </div>

              <h3 className="font-serif-editorial text-2xl sm:text-4xl text-zinc-900 dark:text-white font-light tracking-wide uppercase">
                Belum Ada Testimoni
              </h3>

              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-light max-w-lg mt-3 leading-relaxed">
                Saat ini belum ada ulasan yang dipublikasikan. Pernah mengabadikan momen pernikahan, wisuda, atau hari bahagia Anda bersama Margasera? Jadilah orang pertama yang membagikan cerita dan pengalaman Anda!
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 relative z-10">
                <Link
                  href="/testimoni"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-xs font-semibold tracking-wider uppercase bg-[#0066CC] hover:bg-[#0052A3] text-white transition-all shadow-md shadow-[#0066CC]/25 dark:shadow-[0_0_25px_rgba(0,102,204,0.4)] hover:scale-[1.02]"
                >
                  <PenLine className="w-4 h-4" />
                  <span>Kirim Testimoni Pertama</span>
                </Link>
                <Link
                  href="/work"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl text-xs font-semibold tracking-wider uppercase bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-800 dark:border dark:border-zinc-700/60 text-zinc-700 dark:text-zinc-200 transition-all shadow-xs"
                >
                  <span>Lihat Portofolio Karya</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* 2. Category Filter Pills */}
            <div className="flex items-center justify-center gap-2 flex-wrap max-w-4xl mx-auto">
              {SERVICE_FILTERS.map((cat) => {
                const isSelected = selectedFilter === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedFilter(cat)}
                    className={`px-3.5 py-1.5 text-xs rounded-full transition-all duration-200 cursor-pointer ${isSelected
                      ? 'bg-[#0066CC] text-white font-medium shadow-sm shadow-[#0066CC]/25 dark:shadow-[0_0_15px_rgba(0,102,204,0.35)]'
                      : 'bg-white/90 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-300 dark:hover:border-zinc-700 backdrop-blur-sm'
                      }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* 3. Testimonial Card or Category Empty State */}
            {filteredTestimonials.length === 0 ? (
              <div className="w-full relative">
                <div className="relative bg-white/95 dark:bg-gradient-to-b dark:from-zinc-900/95 dark:via-zinc-900/70 dark:to-zinc-950/95 border border-zinc-200/90 dark:border-zinc-800/90 rounded-3xl p-8 sm:p-14 text-center flex flex-col items-center justify-center shadow-lg shadow-zinc-200/40 dark:shadow-[0_16px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[#0066CC]/20 dark:before:via-blue-500/40 before:to-transparent">
                  {/* Inner ambient glow */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-36 bg-[#0066CC]/10 dark:bg-blue-500/15 blur-3xl pointer-events-none" />

                  {/* Icon badge */}
                  <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/60 dark:from-blue-950/50 dark:to-blue-900/30 text-[#0066CC] dark:text-blue-400 flex items-center justify-center mb-4 border border-blue-200/80 dark:border-blue-500/30 shadow-md shadow-blue-500/10 dark:shadow-[0_0_20px_rgba(0,102,204,0.25)]">
                    <Sparkles className="w-8 h-8" />
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-800/50 text-[#0066CC] dark:text-blue-300 text-xs font-semibold mb-2.5">
                    <span>Momen: {selectedFilter}</span>
                  </div>

                  <h3 className="font-serif-editorial text-2xl sm:text-3xl text-zinc-900 dark:text-white font-light tracking-wide uppercase">
                    Belum Ada Ulasan untuk Kategori Ini
                  </h3>

                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-light max-w-md mt-2 leading-relaxed">
                    Pernah mempercayakan dokumentasi <span className="font-medium text-zinc-800 dark:text-zinc-200">{selectedFilter}</span> Anda bersama Margasera? Jadilah yang pertama memberikan ulasan dan bagikan cerita bahagia Anda!
                  </p>

                  <div className="mt-8 flex flex-wrap items-center justify-center gap-3 relative z-10">
                    <Link
                      href={`/testimoni?event=${encodeURIComponent(selectedFilter)}`}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-semibold tracking-wider uppercase bg-[#0066CC] hover:bg-[#0052A3] text-white transition-all shadow-md shadow-[#0066CC]/25 dark:shadow-[0_0_20px_rgba(0,102,204,0.35)] hover:scale-[1.02] cursor-pointer"
                    >
                      <PenLine className="w-3.5 h-3.5" />
                      <span>Tulis Ulasan Momen Ini</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => setSelectedFilter('Semua Momen')}
                      className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold tracking-wider uppercase bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/90 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80 text-zinc-700 dark:text-zinc-200 transition-all cursor-pointer shadow-2xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Lihat Semua Momen</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : current ? (
              <div className="w-full relative">
                <div className="relative bg-white/95 dark:bg-gradient-to-b dark:from-zinc-900/95 dark:via-zinc-900/85 dark:to-zinc-950/95 backdrop-blur-xl border border-zinc-200/90 dark:border-zinc-800/90 rounded-3xl p-6 sm:p-10 md:p-14 shadow-xl shadow-zinc-200/50 dark:shadow-[0_16px_50px_rgba(0,0,0,0.6)] overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[#0066CC]/30 dark:before:via-blue-500/50 before:to-transparent">
                  {/* Subtle inner card lighting */}
                  <div className="absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-br from-[#0066CC]/10 dark:from-[#0066CC]/15 to-transparent rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

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
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#0066CC]/10 text-[#0066CC] dark:text-blue-300 dark:bg-blue-500/15 border border-[#0066CC]/20 dark:border-blue-500/30">
                              {current.eventType}
                            </span>
                            {current.bookingCode ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-700/50 font-medium shadow-xs dark:shadow-[0_0_12px_rgba(16,185,129,0.15)]">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>Klien Terverifikasi</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] bg-blue-50 dark:bg-blue-950/50 text-[#0066CC] dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/50 font-medium shadow-xs">
                                <PenLine className="w-3.5 h-3.5" />
                                <span>Ulasan Klien</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <div className="flex items-center gap-1 text-amber-400">
                              {Array.from({ length: current.rating }).map((_, i) => (
                                <Star
                                  key={i}
                                  className="w-4 h-4 fill-amber-400 text-amber-400 drop-shadow-[0_1px_2px_rgba(217,119,6,0.15)] dark:drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                                />
                              ))}
                            </div>
                            <span className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-200 ml-1.5">
                              {current.rating}.0
                            </span>
                          </div>
                        </div>

                        {/* Message Quote */}
                        <p className="font-serif-editorial text-lg sm:text-2xl md:text-3xl text-zinc-900 dark:text-zinc-100 font-light leading-relaxed italic pr-4">
                          &ldquo;{current.message}&rdquo;
                        </p>

                        {/* Client Info Strip */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-zinc-200/70 dark:border-zinc-800/80">
                          <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#0066CC] to-blue-500 text-white font-semibold text-xs flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0 tracking-wider ring-2 ring-white dark:ring-zinc-700/40">
                              {getInitials(current.name)}
                            </div>
                            <div>
                              <h4 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-white tracking-wide">
                                {current.name}
                              </h4>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 sm:text-right text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
                            <Calendar className="w-3 h-3 text-zinc-400 dark:text-zinc-500 shrink-0" />
                            <span>{current.date}</span>
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Auto-Slide Progress Bar */}
                  {filteredTestimonials.length > 1 && (
                    <div className="w-full h-1.5 bg-zinc-200/80 dark:bg-zinc-800/90 rounded-full overflow-hidden mt-6">
                      <motion.div
                        key={`progress-${currentIndex}-${current.id}`}
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 4.5, ease: 'linear' }}
                        className="h-full bg-gradient-to-r from-[#0066CC] via-blue-500 to-indigo-500 dark:shadow-[0_0_8px_rgba(0,102,204,0.6)] rounded-full"
                      />
                    </div>
                  )}

                  {/* Carousel Navigation Bar */}
                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-zinc-200/70 dark:border-zinc-800/80 relative z-10">
                    {/* Pagination Dots */}
                    <div className="flex items-center gap-1.5">
                      {filteredTestimonials.map((t, idx) => (
                        <button
                          key={t.id}
                          onClick={() => setCurrentIndex(idx)}
                          className={`h-2 transition-all duration-300 rounded-full cursor-pointer ${currentIndex === idx
                            ? 'w-7 bg-[#0066CC] dark:bg-blue-400 shadow-xs dark:shadow-[0_0_8px_rgba(96,165,250,0.6)]'
                            : 'w-2 bg-zinc-200 dark:bg-zinc-700/80 hover:bg-zinc-300 dark:hover:bg-zinc-600'
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
                        className="w-10 h-10 rounded-full border border-zinc-200/90 dark:border-zinc-700/80 bg-white hover:bg-zinc-50 dark:bg-zinc-800/90 dark:hover:bg-zinc-700/80 hover:border-[#0066CC] dark:hover:border-blue-400 hover:text-[#0066CC] dark:hover:text-blue-300 text-zinc-700 dark:text-zinc-200 flex items-center justify-center transition-all shadow-xs dark:shadow-md cursor-pointer hover:scale-105 active:scale-95"
                        aria-label="Testimoni Sebelumnya"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleNext}
                        className="w-10 h-10 rounded-full border border-zinc-200/90 dark:border-zinc-700/80 bg-white hover:bg-zinc-50 dark:bg-zinc-800/90 dark:hover:bg-zinc-700/80 hover:border-[#0066CC] dark:hover:border-blue-400 hover:text-[#0066CC] dark:hover:text-blue-300 text-zinc-700 dark:text-zinc-200 flex items-center justify-center transition-all shadow-xs dark:shadow-md cursor-pointer hover:scale-105 active:scale-95"
                        aria-label="Testimoni Selanjutnya"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </>
        )}

        {/* 4. Dedicated Client Testimonial CTA Box (Directs to /testimoni) */}
        <div className="relative w-full p-6 sm:p-10 bg-gradient-to-br from-white via-blue-50/30 to-white dark:from-zinc-900/95 dark:via-zinc-900/80 dark:to-zinc-950 border border-blue-100 dark:border-zinc-800/90 rounded-3xl shadow-xs dark:shadow-[0_12px_40px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-xl">
          {/* Card ambient light */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#0066CC]/10 dark:bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 text-left flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0066CC]/10 to-blue-500/20 dark:from-blue-500/20 dark:to-blue-900/30 text-[#0066CC] dark:text-blue-400 flex items-center justify-center shrink-0 mt-1 border border-[#0066CC]/20 dark:border-blue-500/30 shadow-xs">
              <PenLine className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-white tracking-wide">
                Pernah Mengabadikan Momen Bersama Margasera?
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-light mt-1 leading-relaxed max-w-xl">
                Bagikan pengalaman dan cerita bahagia Anda bersama kami. Setiap ulasan Anda menjadi inspirasi bagi calon klien lainnya di Pamekasan &amp; Madura.
              </p>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] text-zinc-500 dark:text-zinc-400 font-light mt-3">
                <span className="inline-flex items-center gap-1">
                  <span className="text-emerald-500 dark:text-emerald-400 font-semibold">✓</span> Tanpa perlu login akun
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <span className="text-emerald-500 dark:text-emerald-400 font-semibold">✓</span> Proses pengisian mudah &amp; cepat
                </span>
              </div>
            </div>
          </div>

          <Link
            href="/testimoni"
            className="relative z-10 shrink-0 inline-flex items-center gap-2.5 px-6 py-3.5 bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-semibold tracking-wider uppercase rounded-xl transition-all duration-300 shadow-md shadow-[#0066CC]/25 hover:shadow-lg hover:shadow-[#0066CC]/35 dark:shadow-[0_0_20px_rgba(0,102,204,0.35)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <span>Beri Ulasan / Testimoni</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

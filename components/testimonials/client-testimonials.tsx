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
  RotateCcw,
} from 'lucide-react';
import type { Testimonial } from '@/lib/data/testimonials';

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

const SLIDE_DURATION = 10000; // 30 detik perpindahan otomatis

interface ClientTestimonialsProps {
  initialTestimonials?: Testimonial[] | null;
}

export function ClientTestimonials({ initialTestimonials }: ClientTestimonialsProps = {}) {
  const [selectedFilter, setSelectedFilter] = useState('Semua Momen');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  // Ambil hanya data asli dari Supabase
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

  // Reset index & progress saat filter berubah
  useEffect(() => {
    setCurrentIndex(0);
    setProgress(0);
    setDirection(1);
  }, [selectedFilter]);

  // Timer progress bar: berjalan kontinu, pause saat disorot / disentuh
  useEffect(() => {
    if (isPaused || filteredTestimonials.length <= 1) return;

    const stepMs = 50;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setDirection(1);
          setCurrentIndex((curr) => (curr + 1) % filteredTestimonials.length);
          return 0;
        }
        return prev + (stepMs / SLIDE_DURATION) * 100;
      });
    }, stepMs);

    return () => clearInterval(interval);
  }, [isPaused, filteredTestimonials.length]);

  const handlePrev = () => {
    setDirection(-1);
    setProgress(0);
    setCurrentIndex(
      (prev) => (prev - 1 + filteredTestimonials.length) % filteredTestimonials.length
    );
  };

  const handleNext = () => {
    setDirection(1);
    setProgress(0);
    setCurrentIndex((prev) => (prev + 1) % filteredTestimonials.length);
  };

  const handleDotClick = (idx: number) => {
    setDirection(idx > currentIndex ? 1 : -1);
    setProgress(0);
    setCurrentIndex(idx);
  };

  const current = filteredTestimonials[currentIndex] || filteredTestimonials[0] || null;

  return (
    <section className="relative w-full py-20 sm:py-28 px-4 sm:px-6 md:px-12 bg-zinc-950 border-t border-zinc-900 overflow-hidden">
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
        {/* Header Section: Tenang & Editorial */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <span className="text-[11px] font-medium tracking-[0.3em] uppercase text-[#0066CC] font-sans">
            Client Stories
          </span>
          <h2 className="font-serif-editorial text-3xl sm:text-4xl md:text-5xl text-zinc-100 font-light tracking-wide uppercase mt-2">
            Kata Mereka
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-light mt-2.5 leading-relaxed font-sans max-w-md mx-auto">
            Catatan jujur dari pasangan dan keluarga yang mempercayakan momen berharganya kepada Margasera.
          </p>
        </div>

        {/* State: Belum Ada Testimoni */}
        {allTestimonials.length === 0 ? (
          <div className="w-full max-w-xl text-center py-12 px-6 rounded-xl border border-zinc-800/70 bg-zinc-900/30">
            <h3 className="font-serif-editorial text-xl sm:text-2xl text-zinc-200 font-light">
              Belum Ada Ulasan
            </h3>
            <p className="text-xs text-zinc-400 font-light mt-2 max-w-md mx-auto leading-relaxed">
              Jadilah yang pertama membagikan cerita dan pengalaman sesi foto Anda bersama kami.
            </p>
            <div className="mt-6">
              <Link
                href="/testimoni"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium tracking-wider uppercase bg-[#0066CC] hover:bg-[#0052A3] text-white transition-all duration-300"
              >
                <PenLine className="w-3.5 h-3.5" />
                <span>Tulis Ulasan</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            {/* Category Filter: Minimalist & Clean */}
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap max-w-3xl mb-10 sm:mb-12">
              {SERVICE_FILTERS.map((cat) => {
                const isSelected = selectedFilter === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedFilter(cat)}
                    className={`px-3 sm:px-3.5 py-1 sm:py-1.5 text-[11px] sm:text-xs rounded-full transition-all duration-200 cursor-pointer ${isSelected
                        ? 'bg-[#0066CC] text-white font-medium'
                        : 'bg-zinc-900/60 border border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                      }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Testimonial Display Area */}
            {filteredTestimonials.length === 0 ? (
              <div className="text-center py-10 px-6 rounded-xl border border-zinc-800/60 bg-zinc-900/20 max-w-md">
                <p className="text-xs sm:text-sm text-zinc-400 font-light">
                  Belum ada ulasan untuk kategori <span className="text-zinc-200 font-medium">{selectedFilter}</span>.
                </p>
                <div className="mt-4 flex items-center justify-center gap-3">
                  <Link
                    href={`/testimoni?event=${encodeURIComponent(selectedFilter)}`}
                    className="text-xs font-medium text-[#0066CC] hover:text-[#3399FF] transition-colors"
                  >
                    Tulis ulasan kategori ini →
                  </Link>
                  <span className="text-zinc-600">•</span>
                  <button
                    onClick={() => setSelectedFilter('Semua Momen')}
                    className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors inline-flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Lihat Semua</span>
                  </button>
                </div>
              </div>
            ) : current ? (
              <div className="w-full relative">
                {/* Clean Editorial Quote Card (Pause on hover / touch) */}
                <div
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => setIsPaused(false)}
                  onTouchStart={() => setIsPaused(true)}
                  onTouchEnd={() => setIsPaused(false)}
                  className="relative bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 sm:p-10 md:p-12 text-center flex flex-col items-center select-none"
                >
                  <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                      key={current.id}
                      custom={direction}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                      className="flex flex-col items-center max-w-2xl mx-auto w-full"
                    >
                      {/* Rating Stars - Warm Vibrant Gold */}
                      <div className="flex items-center gap-1.5 text-amber-400 mb-5">
                        {Array.from({ length: current.rating || 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 fill-amber-400 text-amber-400"
                          />
                        ))}
                      </div>

                      {/* Main Quote Text */}
                      <blockquote className="font-serif-editorial text-lg sm:text-2xl md:text-3xl text-zinc-200 font-light leading-relaxed italic mb-8 px-2 sm:px-6">
                        &ldquo;{current.message}&rdquo;
                      </blockquote>

                      {/* Client Info & Attribution */}
                      <div className="flex flex-col items-center gap-1.5 pt-6 border-t border-zinc-800/60 w-full max-w-sm">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm sm:text-base font-medium text-zinc-100 tracking-wide font-sans">
                            {current.name}
                          </h4>
                          {current.bookingCode && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium" title="Klien Terverifikasi">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Terverifikasi</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-zinc-400 font-light tracking-wider uppercase font-sans">
                          <span className="text-amber-400/90 font-medium">{current.eventType}</span>
                          {current.date && (
                            <>
                              <span className="text-zinc-600">·</span>
                              <span className="text-zinc-400">{current.date}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Auto-Slide Progress Bar & Status */}
                  {filteredTestimonials.length > 1 && (
                    <div className="w-full mt-7">
                      <div className="w-full h-1 bg-zinc-800/80 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#0066CC] rounded-full transition-all duration-75 ease-linear"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono mt-2 px-0.5">
                        <span className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${isPaused ? 'bg-amber-400' : 'bg-[#0066CC] animate-pulse'}`} />
                          <span>{isPaused ? 'Dijeda (Hover / Touch)' : 'Beralih otomatis'}</span>
                        </span>
                        <span>{Math.max(1, Math.ceil(((100 - progress) / 100) * (SLIDE_DURATION / 1000)))} detik</span>
                      </div>
                    </div>
                  )}

                  {/* Navigation Controls: Clean & Minimalist */}
                  {filteredTestimonials.length > 1 && (
                    <div className="flex items-center justify-between w-full mt-5 pt-5 border-t border-zinc-800/40">
                      {/* Prev Arrow */}
                      <button
                        type="button"
                        onClick={handlePrev}
                        className="w-9 h-9 rounded-full border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                        aria-label="Testimoni Sebelumnya"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      {/* Pagination Dots */}
                      <div className="flex items-center gap-1.5">
                        {filteredTestimonials.map((t, idx) => (
                          <button
                            key={t.id}
                            onClick={() => handleDotClick(idx)}
                            className={`h-1.5 transition-all duration-300 rounded-full cursor-pointer ${currentIndex === idx
                                ? 'w-5 bg-[#0066CC]'
                                : 'w-1.5 bg-zinc-700 hover:bg-zinc-500'
                              }`}
                            aria-label={`Slide ulasan ke-${idx + 1}`}
                          />
                        ))}
                      </div>

                      {/* Next Arrow */}
                      <button
                        type="button"
                        onClick={handleNext}
                        className="w-9 h-9 rounded-full border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                        aria-label="Testimoni Selanjutnya"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {/* Subtle Action Link to Submit Review (Bukan Banner Iklan Besar) */}
            <div className="mt-8 text-center">
              <Link
                href="/testimoni"
                className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-[#0066CC] transition-colors font-medium tracking-wider uppercase group"
              >
                <span>Pernah Difoto Margasera? Beri Ulasan</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

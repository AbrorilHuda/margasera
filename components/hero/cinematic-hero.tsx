'use client';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Camera, Calendar, ArrowDown } from 'lucide-react';

export function CinematicHero() {
  return (
    <section className="relative w-full min-h-[100dvh] flex items-center justify-center overflow-hidden bg-black hero-banner pt-24 pb-20">
      {/* Background Image with Subtle Ken Burns Zoom & Balanced Gradient */}
      <div className="absolute inset-0 z-0 select-none overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.06] }}
          transition={{ duration: 16, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
          className="relative w-full h-full"
        >
          <Image
            src="/bg.jpeg"
            alt="Margasera Photography - Fotografer Pamekasan & Madura"
            fill
            priority
            className="object-cover object-center opacity-75"
          />
        </motion.div>
        {/* Balanced Cinematic Gradient: Top for navbar legibility, clear center for photo showcase, bottom for seamless page blend */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/35 to-black/90" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center gap-6">
        {/* Main Title (Single H1 for Homepage SEO) */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="font-serif-editorial text-4xl sm:text-6xl lg:text-7xl tracking-[0.12em] font-light uppercase !text-white leading-tight drop-shadow-[0_4px_25px_rgba(0,0,0,0.9)]"
        >
          Margasera
          <span className="block text-xs sm:text-sm md:text-base font-sans font-light tracking-[0.25em] text-zinc-300 uppercase mt-3">
            Fotografer Madura &amp; Surabaya
          </span>
        </motion.h1>

        {/* Brand Slogan */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="font-serif-editorial text-xl sm:text-2xl lg:text-3xl text-amber-300 italic tracking-wide drop-shadow-md"
        >
          &ldquo;Moment Satu Hari Untuk Selamanya&rdquo;
        </motion.p>

        {/* Supporting Services Copy - Ringkas & Elegan */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="text-xs sm:text-sm text-zinc-200 font-light tracking-wider max-w-xl font-sans drop-shadow-md leading-relaxed"
        >
          Mengabadikan momen berharga pernikahan, pre-wedding, dan dokumentasi istimewa Anda di Madura &amp; Surabaya dengan karya visual abadi.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center gap-4 mt-4"
        >
          <Link
            href="/booking"
            className="w-full sm:w-auto px-8 py-3.5 bg-[#0066CC] hover:bg-[#0052A3] !text-white text-xs font-semibold tracking-[0.2em] uppercase rounded-lg shadow-[0_0_25px_rgba(0,102,204,0.4)] hover:shadow-[0_0_35px_rgba(0,102,204,0.7)] transition-all duration-300 flex items-center justify-center gap-2.5"
          >
            <Calendar className="w-4 h-4 !text-white" />
            <span className="!text-white font-semibold">Pesan Sesi Foto</span>
          </Link>

          <Link
            href="/work"
            className="w-full sm:w-auto px-8 py-3.5 bg-white/10 hover:bg-white/20 border border-white/25 hover:border-white/50 !text-white text-xs font-medium tracking-[0.2em] uppercase rounded-lg backdrop-blur-md transition-all duration-300 flex items-center justify-center gap-2.5 shadow-lg"
          >
            <Camera className="w-4 h-4 !text-white" />
            <span className="!text-white">Lihat Karya</span>
          </Link>
        </motion.div>
      </div>

      {/* Scroll Down Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-zinc-400 text-[10px] tracking-[0.3em] uppercase font-mono"
      >
        <span className="text-zinc-300 text-[10px]">Gulir Ke Bawah</span>
        <ArrowDown className="w-4 h-4 animate-bounce text-[#0066CC]" />
      </motion.div>
    </section>
  );
}

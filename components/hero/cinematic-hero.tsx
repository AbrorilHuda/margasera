'use client';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Camera, Calendar, ArrowDown } from 'lucide-react';

export function CinematicHero() {
  return (
    <section className="relative w-full h-[92vh] min-h-[680px] flex items-center justify-center overflow-hidden bg-black hero-banner">
      {/* Background Image with Dark Vignette Overlay */}
      <div className="absolute inset-0 z-0 select-none">
        <Image
          src="/bg.jpeg"
          alt="Marga Sera Photography Hero"
          fill
          priority
          className="object-cover object-center scale-105 opacity-60"
        />
        {/* Radial Dark Gradient Overlay for Maximum Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-black/20 via-black/60 to-black/90" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center flex flex-col items-center gap-6 pt-12">
        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="font-serif-editorial text-5xl sm:text-7xl lg:text-8xl tracking-[0.15em] font-light uppercase !text-white leading-none drop-shadow-[0_4px_25px_rgba(0,0,0,0.9)]"
        >
          MargaSera
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-base sm:text-xl !text-zinc-200 font-light tracking-widest max-w-2xl font-sans drop-shadow-md"
        >
          Moment Satu Hari Untuk Selamanya
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center gap-4 mt-6"
        >
          <Link
            href="/booking"
            className="group relative px-8 py-4 bg-[#0066CC] hover:bg-[#0052A3] !text-white text-xs font-semibold tracking-[0.25em] uppercase shadow-[0_0_30px_rgba(0,102,204,0.5)] hover:shadow-[0_0_40px_rgba(0,102,204,0.8)] transition-all duration-300 flex items-center gap-3 rounded-none"
          >
            <Calendar className="w-4 h-4 !text-white" />
            <span className="!text-white font-semibold">Pesan Sesi Foto</span>
          </Link>

          <Link
            href="/work"
            className="group px-8 py-4 bg-black/40 hover:bg-black/70 border border-white/40 hover:border-white !text-white text-xs font-light tracking-[0.25em] uppercase transition-all duration-300 backdrop-blur-md flex items-center gap-3 rounded-none shadow-lg"
          >
            <Camera className="w-4 h-4 !text-white" />
            <span className="!text-white font-light">Lihat Karya</span>
          </Link>
        </motion.div>
      </div>

      {/* Scroll Down Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-zinc-300 text-[10px] tracking-[0.3em] uppercase font-mono"
      >
        <span className="!text-white">Gulir Ke Bawah</span>
        <ArrowDown className="w-4 h-4 animate-bounce text-[#0066CC]" />
      </motion.div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Cog, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative min-h-[80vh] flex items-center justify-center px-6 overflow-hidden">
      {/* Industrial Grid Pattern - Kontras Ditingkatkan */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000018_1px,transparent_1px),linear-gradient(to_bottom,#00000018_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff20_1px,transparent_1px),linear-gradient(to_bottom,#ffffff20_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_75%_60%_at_50%_50%,#000_80%,transparent_100%)] pointer-events-none" />

      {/* Subtle Glow Light untuk memperjelas grid & kontras di mode gelap */}
      <div className="absolute inset-0 bg-radial-[at_50%_40%] from-blue-600/10 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 text-center max-w-lg">
        {/* Visual 404 + Rotating Industrial Gear */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative mb-6"
        >
          <span className="font-mono text-[10rem] sm:text-[14rem] leading-none font-bold text-zinc-300 dark:text-zinc-700/60 select-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            >
              <Cog className="w-14 h-14 sm:w-18 sm:h-18 text-[#0066CC] dark:text-[#3399FF] stroke-[1.5] drop-shadow-[0_0_20px_rgba(0,102,204,0.4)]" />
            </motion.div>
          </div>
        </motion.div>

        {/* Text Content - High Contrast Typography */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-4 rounded-full bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/30 dark:border-blue-400/30 backdrop-blur-md">
            <Compass
              className="w-3.5 h-3.5 text-[#0066CC] dark:text-[#3399FF] animate-spin"
              style={{ animationDuration: "8s" }}
            />
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#0066CC] dark:text-[#3399FF]">
              System Specification Not Found
            </span>
          </div>

          <h1 className="font-sans text-2xl sm:text-3xl font-bold tracking-wide uppercase text-zinc-300 dark:text-zinc-700/60">
            Komponen Tidak Ditemukan
          </h1>

          <p className="text-sm text-zinc-600 dark:text-zinc-300 font-normal leading-relaxed mb-10 max-w-md mx-auto">
            Spesifikasi atau halaman yang Anda tuju berada di luar jalur
            produksi atau telah dipindahkan. Mari kembali ke katalog utama.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-semibold tracking-widest uppercase px-8 py-3.5 transition-all duration-300 shadow-[0_0_30px_rgba(0,102,204,0.35)] hover:shadow-[0_0_40px_rgba(0,102,204,0.6)]"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Link>

          <Link
            href="/services"
            className="inline-flex items-center justify-center gap-2 bg-black/5 dark:bg-zinc-900/60 border border-zinc-300 dark:border-white/30 backdrop-blur-md text-zinc-800 dark:text-zinc-100 hover:text-black dark:hover:text-white text-xs font-semibold tracking-widest uppercase px-8 py-3.5 transition-all duration-300 hover:border-zinc-400 dark:hover:border-white/60"
          >
            Lihat Layanan
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

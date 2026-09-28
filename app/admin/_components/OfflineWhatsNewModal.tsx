'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import {
  Wallet,
  TrendingUp,
  Tag,
  Printer,
  Sparkles,
  ArrowRight,
  X,
} from 'lucide-react';

const STORAGE_KEY = 'margasera_finance_whats_new_seen_v1';

export function OfflineWhatsNewModal() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleDismiss = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // Abaikan jika storage quota penuh
    }
    setIsOpen(false);
  }, []);

  const handleGoToFinance = () => {
    handleDismiss();
    router.push('/admin/dashboard/finance');
  };

  useEffect(() => {
    setMounted(true);
    try {
      const hasSeen = localStorage.getItem(STORAGE_KEY);
      if (!hasSeen) {
        // Tampilkan modal dengan delay halus setelah halaman termuat
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    } catch {
      // Abaikan jika localStorage tidak diizinkan di browser
    }
  }, []);

  // Dukungan tombol keyboard Escape untuk menutup
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleDismiss]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      onClick={handleDismiss}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/65 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="whats-new-title"
    >
      {/* Modal Container: Responsif desktop & mobile, support dark mode & light mode */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm sm:max-w-lg max-h-[92dvh] flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Glow Header Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-400 z-10" />

        {/* Close Button (X) */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 text-zinc-400 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-100 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors z-20 cursor-pointer"
          aria-label="Tutup pemberitahuan"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Scrollable Content Container (Aman untuk berbagai tinggi layar HP) */}
        <div className="p-4 sm:p-7 overflow-y-auto flex flex-col gap-4 sm:gap-5">
          {/* Header Title & Badge */}
          <div className="flex flex-col gap-1.5 sm:gap-2 pr-6">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-mono font-semibold bg-blue-50 dark:bg-blue-950/60 text-[#0066CC] dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/60">
                <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400 animate-pulse" />
                Pembaruan Sistem
              </span>
              <span className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                Fitur Keuangan & Kas
              </span>
            </div>

            <h2
              id="whats-new-title"
              className="font-sans text-lg sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight leading-snug"
            >
              Kini Hadir: Manajemen Keuangan & Arus Kas Studio
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed">
              Kini admin tidak perlu bingung uang budget dipakai ke mana saja. Pantau arus kas masuk, beban operasional per project, dan laba bersih secara transparan.
            </p>
          </div>

          {/* Feature Highlights List */}
          <div className="flex flex-col gap-2.5 sm:gap-3">
            {/* Feature 1: Catat Pengeluaran Project */}
            <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 flex items-start gap-2.5 sm:gap-3 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-[#0066CC] dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Pencatatan Biaya Beban Project
                </span>
                <span className="text-[11px] sm:text-xs text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed">
                  Catat honor freelance fotografer/editor, cetak album, transport, hingga konsumsi tim dengan menghubungkannya langsung ke project klien.
                </span>
              </div>
            </div>

            {/* Feature 2: Laba Bersih Otomatis */}
            <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 flex items-start gap-2.5 sm:gap-3 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Kalkulasi Laba Bersih & Arus Kas Riil
                </span>
                <span className="text-[11px] sm:text-xs text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed">
                  Sistem otomatis menghitung pemasukan DP & pelunasan dikurangi total beban pengeluaran, lengkap dengan persentase margin keuntungan studio.
                </span>
              </div>
            </div>

            {/* Feature 3: Kategori Fleksibel + Input Manual */}
            <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 flex items-start gap-2.5 sm:gap-3 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <Tag className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Preset Kategori & Input Manual (Lainnya)
                </span>
                <span className="text-[11px] sm:text-xs text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed">
                  Tersedia kategori standar studio, serta opsi input manual saat memilih kategori &apos;Lainnya&apos; untuk fleksibilitas pencatatan biaya tidak terduga.
                </span>
              </div>
            </div>

            {/* Feature 4: Cetak Rekap PDF & Siap Offline */}
            <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 flex items-start gap-2.5 sm:gap-3 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                <Printer className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Cetak Laporan Rekap PDF & Siap Offline
                </span>
                <span className="text-[11px] sm:text-xs text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed">
                  Cetak atau simpan laporan keuangan bulanan ber-kop Marga Sera Photography, serta tetap dapat mencatat pengeluaran saat jaringan offline.
                </span>
              </div>
            </div>
          </div>

          {/* Action Button & Note */}
          <div className="flex flex-col gap-2 pt-1">
            <button
              onClick={handleGoToFinance}
              className="w-full py-2.5 sm:py-3 px-4 sm:px-5 rounded-xl sm:rounded-2xl bg-[#0066CC] hover:bg-[#0052a3] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Buka Menu Keuangan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-center text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 font-light">
              Pemberitahuan ini hanya muncul satu kali saat pembaruan pertama.
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

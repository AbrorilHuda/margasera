'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  WifiOff,
  Database,
  CloudOff,
  Sparkles,
  ArrowRight,
  X,
  Smartphone,
} from 'lucide-react';

const STORAGE_KEY = 'margasera_offline_whats_new_seen_v1';

export function OfflineWhatsNewModal() {
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
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/65 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
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
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-400 z-10" />

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
                Fitur Offline Aktif
              </span>
            </div>

            <h2
              id="whats-new-title"
              className="font-sans text-lg sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight leading-snug"
            >
              Kini Hadir: Dukungan Mode Offline Penuh
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed">
              Aplikasi Margasera kini tetap dapat diakses dan digunakan dengan lancar saat tidak ada koneksi internet atau jaringan sedang tidak stabil.
            </p>
          </div>

          {/* Feature Highlights List */}
          <div className="flex flex-col gap-2.5 sm:gap-3">
            {/* Feature 1 */}
            <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 flex items-start gap-2.5 sm:gap-3 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-[#0066CC] dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                <WifiOff className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Akses Langsung Tanpa Internet
                </span>
                <span className="text-[11px] sm:text-xs text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed">
                  Dashboard dan halaman booking dapat dibuka langsung kapan saja tanpa diarahkan ke halaman login.
                </span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 flex items-start gap-2.5 sm:gap-3 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Database className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Layanan & Paket Asli Tersinkron
                </span>
                <span className="text-[11px] sm:text-xs text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed">
                  Kategori layanan, paket foto, dan tarif harga riil otomatis tersimpan di perangkat sehingga formulir selalu lengkap.
                </span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 flex items-start gap-2.5 sm:gap-3 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <CloudOff className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Input Booking & Sinkronisasi Otomatis
                </span>
                <span className="text-[11px] sm:text-xs text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed">
                  Tetap bisa input pesanan baru saat offline. Data disimpan dalam antrean lokal dan otomatis terkirim saat internet kembali online.
                </span>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 flex items-start gap-2.5 sm:gap-3 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Penyimpanan Ringan & Hemat Memori
                </span>
                <span className="text-[11px] sm:text-xs text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed">
                  Menampilkan 5 data booking terbaru saat offline agar performa browser tetap cepat. Riwayat lengkap otomatis tampil saat online.
                </span>
              </div>
            </div>
          </div>

          {/* Action Button & Note */}
          <div className="flex flex-col gap-2 pt-1">
            <button
              onClick={handleDismiss}
              className="w-full py-2.5 sm:py-3 px-4 sm:px-5 rounded-xl sm:rounded-2xl bg-[#0066CC] hover:bg-[#0052a3] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Mengerti & Lanjutkan</span>
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

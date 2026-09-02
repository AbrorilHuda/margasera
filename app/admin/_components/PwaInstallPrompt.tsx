'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Download, Share, PlusSquare, X, Smartphone, CheckCircle, Monitor } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function PwaInstallPrompt() {
  const [mounted, setMounted] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    setMounted(true);

    // 1. Cek apakah sudah berjalan di mode standalone (aplikasi sudah terinstall & dibuka dari app)
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://');

    setIsStandalone(isStandaloneMode);

    if (isStandaloneMode) return;

    // 2. Deteksi Platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isMobileDevice = /android|iphone|ipad|ipod|windows phone/i.test(userAgent);

    setIsIos(isIosDevice);
    setIsDesktop(!isMobileDevice);

    // 3. Tangkap event 'beforeinstallprompt' (untuk Android / Chrome Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 4. Selalu tampilkan pop up mengambang setelah 600ms jika sedang di browser biasa
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 600);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          setIsInstalled(true);
          setTimeout(() => setShowPrompt(false), 2500);
        }
        setDeferredPrompt(null);
      } catch {
        setShowGuideModal(true);
      }
    } else {
      // Jika browser belum menyediakan native prompt langsung, tampilkan panduan sesuai platform
      setShowGuideModal(true);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowGuideModal(false);
  };

  if (!mounted || isStandalone || !showPrompt) return null;

  return createPortal(
    <>
      {/* ===== FLOATING PWA INSTALL CARD (MENGAMBANG) ===== */}
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 animate-in slide-in-from-bottom-6 fade-in duration-300">
        <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200/90 dark:border-zinc-800 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col gap-3.5 text-zinc-900 dark:text-zinc-100 ring-1 ring-black/5 dark:ring-white/10">
          {/* Header Card */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2 flex items-center justify-center shrink-0 shadow-xs">
                <Image
                  src="/logo.png"
                  alt="Margasera Logo"
                  width={40}
                  height={40}
                  className="w-full h-auto object-contain"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold truncate">Margasera Admin</h4>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#0066CC]/15 text-[#0066CC] dark:text-blue-400 border border-[#0066CC]/30 shrink-0">
                    PWA APP
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-normal leading-relaxed mt-0.5 line-clamp-2">
                  Install untuk akses cepat satu klik langsung dari Layar Utama tanpa address bar browser.
                </p>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
              title="Tutup Popup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Action Buttons */}
          {isInstalled ? (
            <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-semibold py-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900/50">
              <CheckCircle className="w-4 h-4" />
              <span>Aplikasi Berhasil Diinstal!</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 pt-0.5">
              <button
                onClick={handleInstallClick}
                className="flex-1 py-3 px-4 bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-semibold uppercase tracking-wider rounded-2xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              >
                {isIos ? (
                  <>
                    <Smartphone className="w-4 h-4" />
                    <span>Cara Install di iOS</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Install Aplikasi</span>
                  </>
                )}
              </button>
              <button
                onClick={handleDismiss}
                className="py-3 px-4 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 text-xs font-medium rounded-2xl transition-all active:scale-95 cursor-pointer"
              >
                Nanti Saja
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ===== MODAL PANDUAN CARA INSTALL (LIGHT & DARK MODE) ===== */}
      {showGuideModal && (
        <div className="fixed inset-0 z-[60] bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border-t sm:border border-zinc-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-3xl max-w-sm w-full p-6 pb-safe flex flex-col gap-4 shadow-2xl animate-in slide-in-from-bottom duration-200 text-zinc-900 dark:text-zinc-100">
            {/* iOS Drag Handle */}
            <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto -mt-1 sm:hidden shrink-0" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#0066CC] flex items-center justify-center">
                  {isIos ? <Smartphone className="w-4 h-4" /> : isDesktop ? <Monitor className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                </div>
                <h4 className="text-sm font-bold uppercase tracking-wide">
                  {isIos ? 'Install di iPhone / Safari' : isDesktop ? 'Install di Desktop / PC' : 'Install di Android'}
                </h4>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Panduan Sesuai Perangkat */}
            {isIos ? (
              <div className="flex flex-col gap-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                <div className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-zinc-950/60 rounded-2xl border border-zinc-200 dark:border-zinc-800/80">
                  <div className="w-6 h-6 rounded-lg bg-[#0066CC] text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">1</div>
                  <div className="leading-relaxed">
                    Tap tombol <strong>Share</strong> (ikon kotak panah <Share className="w-3.5 h-3.5 inline mx-1 text-[#0066CC]" />) di toolbar bawah Safari.
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-zinc-950/60 rounded-2xl border border-zinc-200 dark:border-zinc-800/80">
                  <div className="w-6 h-6 rounded-lg bg-[#0066CC] text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">2</div>
                  <div className="leading-relaxed">
                    Gulir ke bawah pada menu, lalu pilih <strong>&quot;Add to Home Screen&quot;</strong> (atau <em>Tambah ke Layar Utama</em> <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-zinc-500" />).
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-zinc-950/60 rounded-2xl border border-zinc-200 dark:border-zinc-800/80">
                  <div className="w-6 h-6 rounded-lg bg-[#0066CC] text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">3</div>
                  <div className="leading-relaxed">
                    Tap <strong>&quot;Add&quot;</strong> di kanan atas. Aplikasi <strong>Margasera Admin</strong> siap digunakan di Home Screen!
                  </div>
                </div>
              </div>
            ) : isDesktop ? (
              <div className="flex flex-col gap-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                <div className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-zinc-950/60 rounded-2xl border border-zinc-200 dark:border-zinc-800/80">
                  <div className="w-6 h-6 rounded-lg bg-[#0066CC] text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">1</div>
                  <div className="leading-relaxed">
                    Perhatikan bilah alamat (URL bar) browser Chrome/Edge di kanan atas.
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-zinc-950/60 rounded-2xl border border-zinc-200 dark:border-zinc-800/80">
                  <div className="w-6 h-6 rounded-lg bg-[#0066CC] text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">2</div>
                  <div className="leading-relaxed">
                    Klik ikon <strong>Install / Download</strong> <Download className="w-3.5 h-3.5 inline mx-1 text-[#0066CC]" /> di samping ikon bookmark, atau buka menu Titik Tiga &gt; <strong>Install Margasera Admin</strong>.
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                <div className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-zinc-950/60 rounded-2xl border border-zinc-200 dark:border-zinc-800/80">
                  <div className="w-6 h-6 rounded-lg bg-[#0066CC] text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">1</div>
                  <div className="leading-relaxed">
                    Tap menu <strong>Titik Tiga (⋮)</strong> di pojok kanan atas browser Chrome.
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-zinc-950/60 rounded-2xl border border-zinc-200 dark:border-zinc-800/80">
                  <div className="w-6 h-6 rounded-lg bg-[#0066CC] text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">2</div>
                  <div className="leading-relaxed">
                    Pilih <strong>&quot;Install app&quot;</strong> atau <strong>&quot;Tambahkan ke Layar utama&quot;</strong>.
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full py-3 bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-semibold uppercase tracking-wider rounded-2xl transition-all shadow-md active:scale-[0.98] cursor-pointer mt-1"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}
    </>,
    document.body
  );
}

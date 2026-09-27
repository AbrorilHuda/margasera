'use client';

import React from 'react';
import Image from 'next/image';
import {
  CheckCircle2,
  Download,
  MessageCircle,
  RefreshCw,
  Sparkles,
  Clock,
  Images,
} from 'lucide-react';
import { ClientGalleryPhoto, ClientGallerySession } from '@/lib/types';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface SelectionSuccessViewProps {
  session: ClientGallerySession;
  selectedPhotos: ClientGalleryPhoto[];
  onEditSelection: () => void;
  canEdit: boolean;
}

export function SelectionSuccessView({
  session,
  selectedPhotos,
  onEditSelection,
  canEdit,
}: SelectionSuccessViewProps) {
  // Normalize studio WhatsApp
  const rawWa = session.whatsappContact || '085806138955';
  const cleanWa = rawWa.replace(/\D/g, '');
  const targetWa = cleanWa.startsWith('0') ? '62' + cleanWa.slice(1) : cleanWa;

  const waMessage = encodeURIComponent(
    `Halo Margasera Photography! Saya ${session.clientName} telah selesai memilih ${selectedPhotos.length} foto untuk sesi "${session.eventTitle}". Mohon informasi langkah berikutnya ya kak. Terima kasih!`
  );
  const waUrl = `https://wa.me/${targetWa}?text=${waMessage}`;

  const [isDownloadingZip, setIsDownloadingZip] = React.useState(false);
  const [downloadError, setDownloadError] = React.useState<string | null>(null);

  const handleDownloadZip = async () => {
    if (isDownloadingZip || selectedPhotos.length === 0) return;
    setIsDownloadingZip(true);
    setDownloadError(null);

    try {
      const identifier = session.token || session.slug;
      const idsQuery = selectedPhotos.map((p) => p.id).join(',');
      const downloadEndpoint = `/api/gallery/${identifier}/download?ids=${encodeURIComponent(idsQuery)}`;

      const res = await fetch(downloadEndpoint);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error || 'Gagal menyiapkan file ZIP foto.');
      }

      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const safeName = (session.clientName || 'Foto').trim().replace(/[^a-zA-Z0-9_\-]/g, '_');
      const filename = `Foto_Pilihan_${safeName}_Margasera.zip`;

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err: any) {
      console.error('Download ZIP error:', err);
      setDownloadError(err?.message || 'Gagal mengunduh file ZIP. Silakan coba beberapa saat lagi.');
    } finally {
      setIsDownloadingZip(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col justify-center items-center py-12 px-4 sm:px-6 transition-colors duration-300 relative">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeToggle className="w-9 h-9 rounded-xl" />
      </div>

      <div className="w-full max-w-xl mx-auto space-y-6 text-center">
        {/* Top Studio Logo */}
        <div className="flex justify-center pb-2">
          <Image
            src="/logo.png"
            alt="Margasera Photography"
            width={140}
            height={40}
            className="h-8 sm:h-9 w-auto object-contain dark:brightness-110"
            priority
          />
        </div>

        {/* Success Icon Badge */}
        <div className="relative inline-flex items-center justify-center">
          <div className="absolute inset-0 bg-[#0066CC]/20 rounded-full blur-xl transform scale-150" />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-[#003D7A] via-[#0066CC] to-sky-400 p-0.5 shadow-xl">
            <div className="w-full h-full rounded-full bg-white dark:bg-zinc-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-inner">
              <CheckCircle2 className="w-10 h-10 stroke-[2]" />
            </div>
          </div>
        </div>

        {/* Title & Client Name */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs text-[#0066CC] font-medium tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pilihan Berhasil Tersimpan</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif-editorial font-normal tracking-tight text-zinc-900 dark:text-zinc-100">
            Terima Kasih, {session.clientName}!
          </h1>

          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
            Daftar pilihan foto untuk <span className="text-zinc-900 dark:text-zinc-200 font-semibold">"{session.eventTitle}"</span> telah
            berhasil kami terima.
          </p>
        </div>

        {/* Summary Card */}
        <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/90 rounded-2xl p-5 sm:p-6 text-left space-y-4 shadow-lg dark:shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800/80">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Ringkasan Pilihan Foto:</span>
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-[#0066CC]/20 text-[#0066CC] dark:text-[#3399FF] border border-blue-200 dark:border-[#0066CC]/30">
              {selectedPhotos.length} Foto Dipilih
            </span>
          </div>

          <div className="space-y-3 text-xs text-zinc-700 dark:text-zinc-300">
            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-[#0066CC] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-zinc-900 dark:text-zinc-200">Proses Editing & Retouching:</span>
                <span className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Foto pilihanmu segera diproses oleh tim editor Margasera Photography dengan estimasi waktu 7–14 hari kerja.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Images className="w-4 h-4 text-[#0066CC] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-zinc-900 dark:text-zinc-200">Foto yang Dipilih:</span>
                <div className="flex flex-wrap gap-1.5 pt-2 max-h-28 overflow-y-auto no-scrollbar">
                  {selectedPhotos.map((p) => (
                    <span
                      key={p.id}
                      className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-mono text-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                    >
                      {p.fileName}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Download feature if enabled */}
          {session.allowDownload && (
            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800/80 space-y-2">
              <button
                type="button"
                onClick={handleDownloadZip}
                disabled={isDownloadingZip || selectedPhotos.length === 0}
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 border border-zinc-300 dark:border-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isDownloadingZip ? (
                  <>
                    <RefreshCw className="w-4 h-4 text-[#0066CC] animate-spin" />
                    <span>Menyiapkan File ZIP ({selectedPhotos.length} Foto)...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Unduh File Foto Terpilih (.ZIP - {selectedPhotos.length} Foto)</span>
                  </>
                )}
              </button>

              {downloadError && (
                <p className="text-[11px] text-red-500 text-center font-medium">
                  {downloadError}
                </p>
              )}

              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 text-center">
                Semua foto pilihan akan digabung dalam satu file arsip ZIP secara otomatis.
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-6 rounded-xl font-semibold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Konfirmasi ke WhatsApp Studio Margasera</span>
          </a>

          {canEdit && (
            <button
              type="button"
              onClick={onEditSelection}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-medium text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 flex items-center justify-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Ingin Mengubah Pilihan Foto?</span>
            </button>
          )}
        </div>

        <p className="text-[11px] text-zinc-400 dark:text-zinc-600 italic">
          "Moment Satu Hari Untuk Selamanya" — Margasera Photography
        </p>
      </div>
    </div>
  );
}

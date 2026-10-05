'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  X,
  ExternalLink,
  Copy,
  Check,
  Clock,
  Images,
  Link as LinkIcon,
  CheckCircle2,
  FolderOpen,
  AlertCircle,
  Sparkles,
  MessageCircle,
  RefreshCw,
  Loader2,
  Trash2,
  ShieldCheck,
} from 'lucide-react';
import { useToast } from '@/components/ui/toast-context';
import { saveBookingGallerySettings } from '@/lib/actions/bookings';
import { syncBookingGalleryFromDrive, getAdminGallerySelections, clearBookingGalleryDrive } from '@/lib/actions/client-gallery';
import { formatDate } from '@/lib/utils';
import type { Booking } from '@/lib/types';

interface GalleryAdminModalProps {
  booking: Booking;
  siteUrl?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

// Helper: format Date/string ke format lokal input datetime-local (YYYY-MM-DDTHH:mm)
function formatToLocalDateTimeString(dateInput?: Date | string | null): string {
  const d = dateInput ? new Date(dateInput) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function GalleryAdminModal({
  booking: b,
  siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://margasera.id',
  onClose,
  onSuccess,
}: GalleryAdminModalProps) {
  const { toast, confirmModal } = useToast();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'settings' | 'share' | 'results'>('settings');

  // Form State
  const [driveUrl, setDriveUrl] = useState(b.driveFolderUrl || '');
  const [maxCount, setMaxCount] = useState<number>(b.selectionMaxCount || 15);
  const [allowDownload, setAllowDownload] = useState<boolean>(b.allowDownload ?? true);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncedCount, setSyncedCount] = useState<number | null>(null);

  // Live selections from client
  const [realSelections, setRealSelections] = useState<
    { id: string; fileId: string; fileName: string; selectedAt: string; thumbnailUrl?: string }[]
  >([]);
  const [isLoadingSelections, setIsLoadingSelections] = useState(false);

  // Default deadline: format ke waktu lokal pengguna (bukan UTC)
  const [deadline, setDeadline] = useState(() => formatToLocalDateTimeString(b.selectionDeadline));

  // Slug & Token
  const defaultSlug =
    b.gallerySlug ||
    b.customerName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') ||
    'klien';
  const [gallerySlug, setGallerySlug] = useState(defaultSlug);
  const [galleryToken, setGalleryToken] = useState(
    b.galleryToken || crypto.randomUUID().replace(/-/g, '').slice(0, 20)
  );

  const [isSaving, setIsSaving] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedFilenames, setCopiedFilenames] = useState(false);

  // Extract folder ID from Drive URL
  const extractFolderId = (url: string): string | null => {
    if (!url) return null;
    const match = url.match(/\/folders\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };

  const detectedFolderId = extractFolderId(driveUrl);

  // Fetch real selections when opening Tab 3
  useEffect(() => {
    if (activeTab === 'results') {
      setIsLoadingSelections(true);
      getAdminGallerySelections(b.id)
        .then((res) => {
          if (res.success && res.selections) {
            setRealSelections(res.selections);
          }
        })
        .finally(() => setIsLoadingSelections(false));
    }
  }, [activeTab, b.id]);

  // Quick deadline preset helper (tetap dalam waktu lokal)
  const setDeadlineDaysAhead = (days: number) => {
    const d = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    setDeadline(formatToLocalDateTimeString(d));
    toast.info(`Batas waktu diatur ke +${days} hari.`);
  };

  // Gallery URL
  const galleryUrl = `${siteUrl}/g/${gallerySlug}-${galleryToken}`;

  // Helper untuk generate pesan WA dengan data terbaru
  const getFormattedDeadlineDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const [waTemplate, setWaTemplate] = useState(
    () =>
      `Halo kak ${b.customerName}, terima kasih banyak telah mempercayakan momen bahagianya bersama Margasera Photography!\n\n` +
      `Foto sesi "${b.serviceName || 'Foto'}" Anda sudah selesai diunggah. Silakan pilih foto terbaik favorit Anda untuk diproses ke tahap editing & cetak album melalui tautan personal berikut:\n\n` +
      `🔗 ${galleryUrl}\n\n` +
      `📌 Ketentuan Memilih Foto:\n` +
      `• Kuota Foto: Maksimal ${maxCount} foto\n` +
      `• Batas Waktu: ${getFormattedDeadlineDate(deadline)} WIB\n\n` +
      `Jika ada kendala saat membuka link, silakan langsung balas chat ini ya kak. Terima kasih! 🙏\n\n` +
      `"Moment Satu Hari Untuk Selamanya" — Margasera Photography`
  );

  // Update pesan WA secara otomatis saat beralih ke Tab 2 (Share) jika ada perubahan deadline / kuota
  useEffect(() => {
    if (activeTab === 'share') {
      setWaTemplate(
        `Halo kak ${b.customerName}, terima kasih banyak telah mempercayakan momen bahagianya bersama Margasera Photography!\n\n` +
        `Foto sesi "${b.serviceName || 'Foto'}" Anda sudah selesai diunggah. Silakan pilih foto terbaik favorit Anda untuk diproses ke tahap editing & cetak album melalui tautan personal berikut:\n\n` +
        `🔗 ${galleryUrl}\n\n` +
        `📌 Ketentuan Seleksi:\n` +
        `• Kuota Foto: Maksimal ${maxCount} foto\n` +
        `• Batas Waktu: ${getFormattedDeadlineDate(deadline)} WIB\n\n` +
        `Jika ada kendala saat membuka link, silakan langsung balas chat ini ya kak. Terima kasih! 🙏\n\n` +
        `"Moment Satu Hari Untuk Selamanya" — Margasera Photography`
      );
    }
  }, [activeTab, deadline, maxCount, galleryUrl, b.customerName, b.serviceName]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(galleryUrl);
    setCopiedLink(true);
    toast.success('Link galeri berhasil disalin!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Effective display list of selected photos
  const displaySelectedPhotos = realSelections.length > 0 ? realSelections : [];

  const handleCopyAllFilenames = () => {
    if (displaySelectedPhotos.length === 0) {
      toast.info('Belum ada foto yang dipilih klien.');
      return;
    }
    const list = displaySelectedPhotos.map((p) => p.fileName).join(', ');
    navigator.clipboard.writeText(list);
    setCopiedFilenames(true);
    toast.success('Daftar nama file berhasil disalin ke clipboard!');
    setTimeout(() => setCopiedFilenames(false), 2500);
  };

  // Handle Sync Drive Photos
  const handleSyncDrive = async () => {
    if (!driveUrl) {
      toast.error('Masukkan link folder Google Drive terlebih dahulu.');
      return;
    }

    setIsSyncing(true);
    try {
      // 1. Simpan folder URL & settings ke database terlebih dahulu
      await saveBookingGallerySettings(b.id, {
        driveFolderUrl: driveUrl,
        driveFolderId: detectedFolderId || undefined,
        selectionMaxCount: maxCount,
        selectionDeadline: new Date(deadline).toISOString(),
        allowDownload,
        gallerySlug,
        galleryToken,
      });

      // 2. Sinkronkan file dari Google Drive
      const res = await syncBookingGalleryFromDrive(b.id);
      if (res.success) {
        setSyncedCount(res.count ?? 0);
        toast.success(`Berhasil menyinkronkan ${res.count ?? 0} foto dari Google Drive!`);
        onSuccess?.();
      } else {
        toast.error(res.error || 'Gagal menyinkronkan foto dari Google Drive.');
      }
    } catch {
      toast.error('Terjadi kesalahan saat menyinkronkan foto.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Hapus link Drive (salah input)
  const handleClearDrive = () => {
    confirmModal({
      title: 'Hapus Folder Drive & Cache?',
      message: 'Apakah Anda yakin ingin menghapus link Drive, foto cache, dan pilihan klien untuk booking ini?',
      confirmText: 'Ya, Hapus Folder Drive',
      variant: 'danger',
      onConfirm: async () => {
        setIsSyncing(true);
        const res = await clearBookingGalleryDrive(b.id);
        setIsSyncing(false);
        if (res.success) {
          setDriveUrl('');
          setSyncedCount(null);
          setRealSelections([]);
          toast.success('Folder Drive berhasil dihapus. Silakan input ulang.');
          onSuccess?.();
        } else {
          toast.error(res.error || 'Gagal menghapus folder Drive.');
        }
      },
    });
  };

  // Save Settings
  const handleSaveSettings = async () => {
    if (!driveUrl) {
      toast.error('Masukkan link folder Google Drive terlebih dahulu.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await saveBookingGallerySettings(b.id, {
        driveFolderUrl: driveUrl,
        driveFolderId: detectedFolderId || undefined,
        selectionMaxCount: maxCount,
        selectionDeadline: new Date(deadline).toISOString(),
        allowDownload,
        gallerySlug,
        galleryToken,
      });

      if (res.success) {
        toast.success('Pengaturan galeri seleksi berhasil disimpan!');
        setActiveTab('share');
        onSuccess?.();
      } else {
        toast.error(`Gagal menyimpan: ${res.error}`);
      }
    } catch {
      toast.error('Terjadi kesalahan saat menyimpan pengaturan galeri.');
    } finally {
      setIsSaving(false);
    }
  };

  // Send WhatsApp Link
  const handleSendWhatsApp = async () => {
    const cleanWa = b.whatsapp.replace(/\D/g, '');
    const targetWa = cleanWa.startsWith('0') ? '62' + cleanWa.slice(1) : cleanWa;
    const url = `https://wa.me/${targetWa}?text=${encodeURIComponent(waTemplate)}`;

    // Update gallery_sent_at in background
    await saveBookingGallerySettings(b.id, {
      driveFolderUrl: driveUrl,
      selectionMaxCount: maxCount,
      selectionDeadline: new Date(deadline).toISOString(),
      allowDownload,
      gallerySlug,
      galleryToken,
      gallerySentAt: new Date().toISOString(),
    });

    window.open(url, '_blank');
    toast.success('WhatsApp dibuka! Status galeri diperbarui menjadi "Terkirim".');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 border-t sm:border border-zinc-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-2xl max-w-2xl w-full max-h-[92vh] sm:max-h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        {/* iOS Drag Handle */}
        <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mt-2.5 sm:hidden shrink-0" />

        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0066CC]/10 text-[#0066CC] flex items-center justify-center border border-[#0066CC]/20">
              <Images className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-semibold">
                  GALERI SELEKSI KLIEN
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 dark:bg-blue-950/60 text-[#0066CC] dark:text-[#3399FF] border border-blue-200 dark:border-blue-900/60">
                  {b.bookingCode}
                </span>
              </div>
              <h3 className="font-semibold text-base sm:text-lg text-zinc-900 dark:text-zinc-100">
                {b.customerName}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-6 bg-zinc-50/70 dark:bg-zinc-950/40 text-xs shrink-0 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-3.5 font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${activeTab === 'settings'
              ? 'border-[#0066CC] text-[#0066CC] font-semibold'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>1. Pengaturan Galeri</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('share')}
            className={`py-3 px-3.5 font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${activeTab === 'share'
              ? 'border-[#0066CC] text-[#0066CC] font-semibold'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>2. Tautan &amp; Kirim WA</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('results')}
            className={`py-3 px-3.5 font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${activeTab === 'results'
              ? 'border-[#0066CC] text-[#0066CC] font-semibold'
              : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>3. Hasil Pilihan</span>
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto text-xs text-zinc-700 dark:text-zinc-300 space-y-5">
          {/* TAB 1: PENGATURAN GALERI */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              {/* Google Drive Folder URL */}
              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
                  <span>Link Folder Google Drive Klien:</span>
                  <span className="text-[10px] text-zinc-500 font-normal">
                    (Pastikan mode "Viewer/Anyone with link")
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={driveUrl}
                    onChange={(e) => setDriveUrl(e.target.value)}
                    placeholder="https://drive.google.com/drive/folders/1aBcDeFgHiJkLmNoP..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC]"
                  />
                </div>

                {b.driveFolderUrl && (
                  <button
                    type="button"
                    onClick={handleClearDrive}
                    disabled={isSyncing}
                    className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 border border-red-200 dark:border-red-900/50 text-[11px] font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Hapus Folder Drive</span>
                  </button>
                )}

                {detectedFolderId ? (
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
                      <Check className="w-3.5 h-3.5" />
                      <span>Folder ID terdeteksi: {detectedFolderId}</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleSyncDrive}
                      disabled={isSyncing || !driveUrl}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-[#0066CC] dark:text-[#3399FF] border border-blue-200 dark:border-blue-900/60 text-[11px] font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Foto dari Drive'}</span>
                    </button>
                  </div>
                ) : driveUrl ? (
                  <div className="text-[11px] text-amber-600 dark:text-amber-400">
                    ⚠️ Pastikan link berupa URL folder Google Drive yang valid.
                  </div>
                ) : null}

                {syncedCount !== null && (
                  <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-[11px] text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span><strong>{syncedCount} foto</strong> berhasil disinkronkan & disimpan ke cache.</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Grid: Max Photos & Deadline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Max Photos */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-900 dark:text-zinc-100">
                    Maksimal Foto yang Boleh Dipilih:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={500}
                      value={maxCount}
                      onChange={(e) => setMaxCount(parseInt(e.target.value, 10) || 1)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-mono font-semibold"
                    />
                    <span className="text-zinc-500 shrink-0">Foto</span>
                  </div>
                </div>

                {/* Deadline */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-zinc-900 dark:text-zinc-100">
                      Batas Waktu (Deadline):
                    </label>
                    <div className="flex items-center gap-1 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setDeadlineDaysAhead(3)}
                        className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-[#0066CC]"
                      >
                        +3h
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeadlineDaysAhead(7)}
                        className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-[#0066CC]"
                      >
                        +7h
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeadlineDaysAhead(14)}
                        className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-[#0066CC]"
                      >
                        +14h
                      </button>
                    </div>
                  </div>
                  <input
                    type="datetime-local"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Allow Download Switch */}
              <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                    Klien Boleh Download Hasil Foto
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    Menampilkan tombol download file pilihan setelah klien melakukan submit.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowDownload}
                    onChange={(e) => setAllowDownload(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0066CC]" />
                </label>
              </div>

              {/* Slug & Token Configuration */}
              <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 space-y-2">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                  Slug &amp; Token Tautan Personal:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-zinc-500 block mb-0.5">Slug Nama Klien:</label>
                    <input
                      type="text"
                      value={gallerySlug}
                      onChange={(e) => setGallerySlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ''))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 block mb-0.5">Token Akses Acak:</label>
                    <input
                      type="text"
                      value={galleryToken}
                      onChange={(e) => setGalleryToken(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={isSaving || !driveUrl}
                  className="w-full py-3 px-4 bg-[#0066CC] hover:bg-[#0052A3] text-white rounded-xl font-semibold text-xs tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isSaving ? 'Menyimpan...' : 'Simpan & Buat Tautan Galeri'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: TAUTAN & KIRIM WHATSAPP */}
          {activeTab === 'share' && (
            <div className="space-y-4">
              {/* Gallery Link Card */}
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 space-y-2.5 shadow-xs">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                  Tautan Galeri Klien:
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={galleryUrl}
                    className="flex-1 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-mono text-[#0066CC] font-medium"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="p-2 sm:px-3 sm:py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 flex items-center gap-1.5 transition-colors"
                    title="Salin Link"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    <span className="hidden sm:inline">{copiedLink ? 'Tersalin' : 'Salin'}</span>
                  </button>

                  <a
                    href={galleryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 sm:px-3 sm:py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 flex items-center gap-1.5 transition-colors"
                    title="Buka Pratinjau Klien"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="hidden sm:inline">Pratinjau</span>
                  </a>
                </div>
              </div>

              {/* Status Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#0066CC]" />
                    <span className="text-zinc-500 dark:text-zinc-400">Status Galeri:</span>
                  </div>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {b.gallerySentAt
                      ? `Terkirim (${formatDate(b.gallerySentAt)})`
                      : 'Belum Dikirim'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-zinc-500 dark:text-zinc-400">Masa Aktif:</span>
                  </div>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    30 Hari (Auto-Clean)
                  </span>
                </div>
              </div>

              {/* Editable WhatsApp Message Template */}
              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
                  <span>Template Pesan WhatsApp:</span>
                  <span className="text-[10px] text-zinc-500 font-normal">(Bisa diedit sebelum dikirim)</span>
                </label>
                <textarea
                  rows={8}
                  value={waTemplate}
                  onChange={(e) => setWaTemplate(e.target.value)}
                  className="w-full p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-sans leading-relaxed focus:outline-none focus:border-[#0066CC]"
                />
              </div>

              {/* WhatsApp Action Button */}
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-xs tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Kirim Link via WhatsApp ({b.whatsapp})</span>
              </button>
            </div>
          )}

          {/* TAB 3: HASIL PILIHAN KLIEN */}
          {activeTab === 'results' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 flex items-center justify-between">
                <div>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">Total Foto yang Dipilih:</span>
                  <div className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                    {displaySelectedPhotos.length} / {maxCount} Foto
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopyAllFilenames}
                  disabled={displaySelectedPhotos.length === 0}
                  className="px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-40"
                >
                  {copiedFilenames ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFilenames ? 'Nama File Tersalin!' : 'Salin Daftar Nama File'}</span>
                </button>
              </div>

              {isLoadingSelections ? (
                <div className="py-12 flex flex-col items-center justify-center text-zinc-500 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-[#0066CC]" />
                  <span className="text-xs">Memuat pilihan foto klien...</span>
                </div>
              ) : displaySelectedPhotos.length === 0 ? (
                <div className="py-12 px-4 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 text-center space-y-2">
                  <Images className="w-8 h-8 text-zinc-400 mx-auto" />
                  <p className="font-semibold text-xs text-zinc-700 dark:text-zinc-300">
                    Belum Ada Foto yang Dipilih
                  </p>
                  <p className="text-[11px] text-zinc-500 max-w-sm mx-auto">
                    Klien belum mengirimkan seleksi fotonya. Anda dapat membagikan link galeri melalui tab "Tautan & Kirim WA".
                  </p>
                </div>
              ) : (
                /* Selected Photos List */
                <div className="space-y-2">
                  <span className="font-semibold text-xs text-zinc-800 dark:text-zinc-200 block">
                    Daftar Foto yang Terpilih:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
                    {displaySelectedPhotos.map((photo, idx) => (
                      <div
                        key={photo.id}
                        className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/80 flex items-center gap-2.5"
                      >
                        {photo.thumbnailUrl ? (
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-700">
                            <Image
                              src={photo.thumbnailUrl}
                              alt={photo.fileName}
                              fill
                              sizes="40px"
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <span className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-700 text-[10px] font-mono font-bold flex items-center justify-center text-zinc-600 dark:text-zinc-300 shrink-0">
                            {idx + 1}
                          </span>
                        )}
                        <div className="truncate min-w-0 flex-1">
                          <span className="font-mono font-semibold text-xs text-zinc-900 dark:text-zinc-100 block truncate">
                            {photo.fileName}
                          </span>
                          <span className="text-[10px] text-zinc-400 block">
                            {photo.selectedAt ? formatDate(photo.selectedAt) : 'Terpilih'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lightroom Search Helper */}
              <div className="p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 text-xs text-blue-950 dark:text-blue-200/90 leading-relaxed flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-[#0066CC] shrink-0 mt-0.5" />
                <span>
                  <strong>Tips Editing Studio:</strong> Klik "Salin Daftar Nama File" untuk mencari foto sekaligus
                  di Adobe Lightroom / file manager dengan filter pencarian nama file kamera.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/90 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Tutup
          </button>

          <a
            href={galleryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#0066CC] hover:text-[#0052A3] flex items-center gap-1.5 transition-colors"
          >
            <span>Buka Galeri Klien</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

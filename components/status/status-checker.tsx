'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  CheckCircle2,
  Clock,
  Calendar,
  MapPin,
  User,
  Camera,
  Sparkles,
  MessageCircle,
  AlertTriangle,
  XCircle,
  Loader2,
  Copy,
  Check,
} from 'lucide-react';
import { getBookingByCode, cancelBookingByClient } from '@/lib/actions/bookings';
import { Booking, StudioSettings } from '@/lib/types';
import { formatDate, formatCurrency, getTimeOfDayLabel } from '@/lib/utils';
import { DEFAULT_STUDIO_SETTINGS } from '@/lib/constants';
import { useToast } from '@/components/ui/toast-context';

export function StatusChecker({ studioSettings = DEFAULT_STUDIO_SETTINGS }: { studioSettings?: StudioSettings }) {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [inputCode, setInputCode] = useState('');
  const [searchedBooking, setSearchedBooking] = useState<Booking | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Perubahan Jadwal / Tanggal Acara');
  const [isCancelling, setIsCancelling] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    toast.success('Kode booking berhasil disalin!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyAccount = (account: string) => {
    navigator.clipboard.writeText(account);
    setCopiedAccount(true);
    toast.success('Nomor rekening berhasil disalin!');
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleSearch = useCallback(async (codeToSearch: string) => {
    setErrorMsg(null);
    const cleanCode = codeToSearch.trim().toUpperCase();
    if (!cleanCode) {
      setErrorMsg('Silakan masukkan Kode Booking Anda terlebih dahulu.');
      setSearchedBooking(null);
      return;
    }

    setIsLoading(true);
    setSearchedBooking(null);

    try {
      const { booking, error } = await getBookingByCode(cleanCode);
      if (error || !booking) {
        setErrorMsg(error ?? 'Kode booking tidak ditemukan.');
        setSearchedBooking(null);
      } else {
        setSearchedBooking(booking);
      }
    } catch {
      setErrorMsg('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const codeParam = searchParams?.get('code');
    if (codeParam) {
      setInputCode(codeParam);
      handleSearch(codeParam);
    }
  }, [searchParams, handleSearch]);

  const pipelineSteps = [
    { key: 'received', label: 'Booking Diterima' },
    { key: 'review', label: 'Sedang Ditinjau' },
    { key: 'confirmed', label: 'Dikonfirmasi' },
    { key: 'payment', label: 'Pembayaran' },
    { key: 'session', label: 'Sesi Foto' },
    { key: 'completed', label: 'Selesai' },
  ];

  // Map status string to active step index
  const getActiveStepIndex = (status: string) => {
    switch (status) {
      case 'pending': return 1;
      case 'confirmed': return 3;
      case 'completed': return 5;
      case 'cancelled': return -1;
      default: return 1;
    }
  };

  // WhatsApp link generator using studioSettings
  const cleanWaNumber = (studioSettings.whatsapp || '085806138955').replace(/\D/g, '');
  const targetWaNumber = cleanWaNumber.startsWith('0') ? '62' + cleanWaNumber.slice(1) : cleanWaNumber;
  const adminWaChatUrl = searchedBooking
    ? `https://wa.me/${targetWaNumber}?text=${encodeURIComponent(`Halo Margasera Photography, saya ingin koordinasi mengenai Kode Booking: ${searchedBooking.bookingCode}`)}`
    : `https://wa.me/${targetWaNumber}`;

  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-4 sm:px-6">
      {/* Search Input Bar Card */}
      <div className="bg-white/90 dark:bg-zinc-950/90 border border-zinc-200 dark:border-zinc-800/80 p-8 sm:p-12 text-center shadow-lg dark:shadow-2xl rounded-3xl relative overflow-hidden backdrop-blur-sm">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-[#0066CC] to-transparent opacity-70" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0066CC]/10 border border-[#0066CC]/20 text-[#0066CC] text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase mb-2">
          <span>Booking Status Lookup</span>
        </div>

        <h2 className="font-serif-editorial text-3xl sm:text-5xl text-zinc-900 dark:text-zinc-100 font-light tracking-wide uppercase mt-2">
          Cek Status Pemesanan
        </h2>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-light max-w-md mx-auto mt-2 leading-relaxed">
          Masukkan Kode Booking resmi Anda untuk melacak tahapan sesi foto, status DP, dan detail jadwal.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(inputCode);
          }}
          className="mt-8 flex flex-col sm:flex-row items-center gap-3 max-w-lg mx-auto"
        >
          <div className="relative w-full">
            <Search className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Contoh: MS-260829-001"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              disabled={isLoading}
              className="w-full bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 focus:border-[#0066CC] text-zinc-900 dark:text-zinc-100 pl-11 pr-4 py-3.5 rounded-xl font-mono text-sm uppercase focus:outline-none transition-all shadow-inner disabled:opacity-60"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#0066CC] hover:bg-[#0052A3] disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-bold tracking-widest uppercase transition-all rounded-xl whitespace-nowrap shadow-md shadow-[#0066CC]/25 hover:shadow-lg hover:shadow-[#0066CC]/35 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Mencari...</span>
              </>
            ) : (
              'Cari Status'
            )}
          </button>
        </form>

        {errorMsg && (
          <p className="text-xs text-rose-500 dark:text-rose-400 font-medium mt-4">{errorMsg}</p>
        )}
      </div>

      {/* Booking Details & Pipeline Display */}
      <AnimatePresence mode="wait">
        {searchedBooking && (
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="mt-8 bg-white/95 dark:bg-zinc-950/90 border border-zinc-200 dark:border-zinc-800/80 p-6 sm:p-10 flex flex-col gap-8 shadow-xl dark:shadow-2xl rounded-3xl backdrop-blur-sm"
          >
            {/* Status Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800/80">
              <div className="flex flex-col">
                <span className="text-[10px] tracking-[0.25em] uppercase text-zinc-500 dark:text-zinc-400 font-mono">Kode Booking Dipilih:</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-2xl sm:text-3xl font-bold text-[#0066CC] tracking-wider">
                    {searchedBooking.bookingCode}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(searchedBooking.bookingCode)}
                    className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-[#0066CC] text-zinc-500 hover:text-[#0066CC] transition-colors cursor-pointer"
                    title="Salin Kode Booking"
                  >
                    {copiedCode ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono uppercase tracking-wider">Status:</span>
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase font-mono shadow-xs ${searchedBooking.status === 'confirmed'
                  ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/40'
                  : searchedBooking.status === 'completed'
                    ? 'bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/40'
                    : searchedBooking.status === 'cancelled'
                      ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60'
                      : 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/40'
                  }`}>
                  {searchedBooking.status === 'cancelled' ? '🔴 DIBATALKAN' : searchedBooking.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* If Cancelled, show dedicated cancellation notification banner */}
            {searchedBooking.status === 'cancelled' ? (
              <div className="p-6 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-2xl flex items-start gap-4">
                <XCircle className="w-6 h-6 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <h4 className="text-sm font-semibold text-rose-800 dark:text-rose-300 uppercase tracking-wider">
                    Sesi Foto Ini Telah Dibatalkan
                  </h4>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 font-light leading-relaxed">
                    Pemesanan dengan kode <span className="font-mono font-semibold text-rose-600 dark:text-rose-400">{searchedBooking.bookingCode}</span> telah dibatalkan. Slot tanggal di kalender studio sudah dibuka kembali. Apabila Anda ingin menjadwalkan ulang (reschedule) atau memiliki pertanyaan terkait DP, silakan hubungi tim kami via WhatsApp.
                  </p>
                </div>
              </div>
            ) : (
              /* Pipeline Visual Tracker */
              <div className="py-2">
                <h4 className="text-xs font-semibold tracking-widest uppercase text-[#0066CC] mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#0066CC]" />
                  <span>Tahapan Proses Sesi Foto</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {pipelineSteps.map((step, idx) => {
                    const activeIdx = getActiveStepIndex(searchedBooking.status);
                    const isPassed = idx <= activeIdx;
                    const isCurrent = idx === activeIdx;

                    return (
                      <div
                        key={step.key}
                        className={`p-3.5 rounded-2xl border flex flex-col items-center text-center gap-2 transition-all ${isCurrent
                          ? 'border-[#0066CC] bg-[#0066CC]/10 dark:bg-[#0066CC]/15 shadow-sm text-[#0066CC] dark:text-white'
                          : isPassed
                            ? 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/90 text-zinc-800 dark:text-zinc-200'
                            : 'border-zinc-100 dark:border-zinc-900/80 bg-zinc-50/50 dark:bg-zinc-950/40 text-zinc-400 dark:text-zinc-600 opacity-60'
                          }`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-mono ${isCurrent
                          ? 'bg-[#0066CC] text-white shadow-xs'
                          : isPassed
                            ? 'bg-zinc-200 dark:bg-zinc-800 text-[#0066CC]'
                            : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-600'
                          }`}>
                          {isPassed && !isCurrent ? <CheckCircle2 className="w-3.5 h-3.5 text-[#0066CC]" /> : idx + 1}
                        </div>
                        <span className="text-[11px] font-medium leading-tight">
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Detailed Booking Summary Grid */}
            <div className="p-6 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-zinc-600 dark:text-zinc-300 font-light">
              <div className="flex flex-col gap-3.5">
                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                  <User className="w-4 h-4 text-[#0066CC] shrink-0" />
                  <span>Nama Pelanggan: <strong className="text-zinc-900 dark:text-zinc-100">{searchedBooking.customerName}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                  <Calendar className="w-4 h-4 text-[#0066CC] shrink-0" />
                  <span>Tanggal Acara: <strong className="text-zinc-900 dark:text-zinc-100">{formatDate(searchedBooking.bookingDate)}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                  <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
                  <span>Jam &amp; Sesi Acara: </span>
                  <strong className="text-amber-600 dark:text-amber-400 font-mono">
                    {searchedBooking.startTime || '08:00'} WIB ({getTimeOfDayLabel(searchedBooking.startTime || '08:00')}) – {searchedBooking.endTime || '14:00'} WIB ({getTimeOfDayLabel(searchedBooking.endTime || '14:00')})
                  </strong>
                </div>
                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                  <MapPin className="w-4 h-4 text-[#0066CC] shrink-0" />
                  <span>Venue / Lokasi: <strong className="text-zinc-900 dark:text-zinc-100">{searchedBooking.location}</strong></span>
                </div>
              </div>

              <div className="flex flex-col gap-3.5">
                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                  <Camera className="w-4 h-4 text-[#0066CC] shrink-0" />
                  <span>Layanan &amp; Paket: <strong className="text-zinc-900 dark:text-zinc-100">{searchedBooking.serviceName} ({searchedBooking.packageName})</strong></span>
                </div>
                {searchedBooking.totalPrice && (
                  <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                    <Sparkles className="w-4 h-4 text-[#0066CC] shrink-0" />
                    <span>Est. Nilai Sesi: <strong className="text-[#0066CC] font-serif-editorial text-lg font-semibold">{formatCurrency(searchedBooking.totalPrice)}</strong></span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                  <Clock className="w-4 h-4 text-[#0066CC] shrink-0" />
                  <span>Status Pembayaran: </span>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${searchedBooking.paymentStatus === 'paid_full'
                    ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/40'
                    : searchedBooking.paymentStatus === 'dp_paid'
                      ? 'bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/40'
                      : 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/40'
                    }`}>
                    {searchedBooking.paymentStatus === 'paid_full' ? 'LUNAS (100%)' : searchedBooking.paymentStatus === 'dp_paid' ? 'DP TERBAYAR' : 'BELUM DP'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bank Payment Information Box (Dynamic payment badge & Copy button) */}
            <div className="p-6 bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col gap-4 text-xs font-light shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800/80 pb-3">
                <span className="font-semibold text-[#0066CC] uppercase tracking-wider font-mono">
                  Rekening Resmi Pembayaran Studio
                </span>
                <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold border ${searchedBooking.paymentStatus === 'paid_full'
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'
                  : searchedBooking.paymentStatus === 'dp_paid'
                    ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30'
                    : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30'
                  }`}>
                  {searchedBooking.paymentStatus === 'paid_full'
                    ? 'Lunas 100%'
                    : searchedBooking.paymentStatus === 'dp_paid'
                      ? 'DP Terbayar (Sisa Pelunasan di Lokasi)'
                      : 'Menunggu Pembayaran DP'}
                </span>
              </div>
              <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-xl flex items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 block">{studioSettings.bankName.toUpperCase()}</span>
                  <span className="font-mono text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">{studioSettings.bankAccountNumber}</span>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block mt-0.5">a.n {studioSettings.bankAccountHolder}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyAccount(studioSettings.bankAccountNumber)}
                  className="px-3.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-[#0066CC] bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-[#0066CC] flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0"
                >
                  {copiedAccount ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Rekening</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Action Bar: WhatsApp Help & Cancellation Button */}
            <div className="p-6 bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800/90 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-5 shadow-sm dark:shadow-xl">
              <div className="flex items-center gap-3.5 w-full md:w-auto">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Bantuan WhatsApp &amp; Konfirmasi Sesi</span>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-light leading-relaxed">
                    Tanyakan perkembangan jadwal atau konfirmasi bukti transfer langsung ke admin Margasera.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-end">
                {searchedBooking.status !== 'cancelled' && searchedBooking.status !== 'completed' && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="flex-1 md:flex-initial px-4 py-3 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs font-mono font-semibold uppercase tracking-wider transition-all rounded-xl text-center whitespace-nowrap cursor-pointer"
                  >
                    Batalkan Pemesanan
                  </button>
                )}

                <a
                  href={adminWaChatUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 md:flex-initial px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-semibold uppercase tracking-wider transition-all rounded-xl text-center whitespace-nowrap flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Chat Admin Margasera</span>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CANCELLATION MODAL FOR CLIENT */}
      <AnimatePresence>
        {showCancelModal && searchedBooking && (
          <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 sm:p-8 flex flex-col gap-6 shadow-2xl relative text-zinc-900 dark:text-zinc-100"
            >
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono text-rose-600 dark:text-rose-400 uppercase tracking-widest font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  Konfirmasi Pembatalan Pemesanan
                </span>
                <h3 className="font-serif-editorial text-2xl text-zinc-900 dark:text-zinc-100 font-light mt-1">
                  Batalkan Sesi Kode: {searchedBooking.bookingCode}?
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 font-light mt-1 leading-relaxed">
                  Apakah Anda yakin ingin membatalkan jadwal pemesanan sesi foto ini? Slot tanggal di kalender akan dibuka kembali untuk pelanggan lain.
                </p>
              </div>

              <div className="flex flex-col gap-3 text-xs text-zinc-700 dark:text-zinc-300">
                <label className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400 uppercase">Pilih Alasan Pembatalan:</label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-rose-500 p-3 rounded-xl text-zinc-900 dark:text-zinc-100 font-sans focus:outline-none transition-colors cursor-pointer"
                >
                  <option value="Perubahan Jadwal / Tanggal Acara">Perubahan Jadwal / Tanggal Acara</option>
                  <option value="Keperluan Mendadak / Alasan Keluarga">Keperluan Mendadak / Alasan Keluarga</option>
                  <option value="Perubahan Lokasi Acara">Perubahan Lokasi Acara</option>
                  <option value="Salah Memilih Layanan / Paket">Salah Memilih Layanan / Paket</option>
                  <option value="Lainnya">Lainnya</option>
                </select>

                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-xl text-[11px] text-rose-700 dark:text-rose-300 font-light leading-relaxed">
                  ⚠️ <strong>Catatan Kebijakan:</strong> Pembatalan yang disetujui akan mengosongkan slot kalender. Kebijakan klaim DP mengacu pada ketentuan studio Margasera Photography.
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 disabled:opacity-50 text-zinc-700 dark:text-zinc-300 text-xs font-semibold tracking-wider uppercase rounded-xl transition-colors cursor-pointer"
                >
                  Kembali
                </button>
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={async () => {
                    if (!searchedBooking) return;
                    setIsCancelling(true);
                    const res = await cancelBookingByClient(searchedBooking.id, cancelReason);
                    setIsCancelling(false);
                    if (res.success) {
                      setSearchedBooking({
                        ...searchedBooking,
                        status: 'cancelled',
                        notes: searchedBooking.notes
                          ? `${searchedBooking.notes}\n[DIBATALKAN CLIENT]: ${cancelReason}`
                          : `[DIBATALKAN CLIENT]: ${cancelReason}`,
                      });
                      setShowCancelModal(false);
                      toast.success('Pemesanan Anda berhasil dibatalkan. Slot tanggal pada kalender telah dibebaskan.');
                    } else {
                      toast.error(`Gagal membatalkan pemesanan: ${res.error}`);
                    }
                  }}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 disabled:opacity-60 text-white text-xs font-semibold tracking-wider uppercase rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isCancelling ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Membatalkan...</span>
                    </>
                  ) : (
                    <span>Ya, Batalkan Sesi</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


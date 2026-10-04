'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, Calendar, Clock, Copy, Download, Loader2 } from 'lucide-react';
import type { Package, StudioSettings } from '@/lib/types';
import { formatCurrency, formatDate, getTimeOfDayLabel } from '@/lib/utils';
import { useToast } from '@/components/ui/toast-context';
import { downloadBookingCardImage } from '../booking-card-image';

interface Step5ConfirmationProps {
  bookingCode: string;
  customerName: string;
  selectedDate: string;
  startTime: string;
  endTime: string;
  selectedPackage?: Package;
  studioSettings: StudioSettings;
  copied: boolean;
  onCopyCode: () => void;
}

export function Step5Confirmation({
  bookingCode,
  customerName,
  selectedDate,
  startTime,
  endTime,
  selectedPackage,
  studioSettings,
  copied,
  onCopyCode,
}: Step5ConfirmationProps) {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  const depositAmount =
    selectedPackage?.downPayment && selectedPackage.downPayment > 0
      ? selectedPackage.downPayment
      : Math.ceil((selectedPackage?.price || 0) * 0.2);

  const handleDownloadCard = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      await downloadBookingCardImage({
        bookingCode,
        customerName,
        selectedDate,
        startTime,
        endTime,
        selectedPackage,
        studioSettings,
      });
      toast.success('Kartu booking resmi berhasil diunduh sebagai gambar PNG!', 'Unduh Berhasil');
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengunduh kartu booking. Silakan coba lagi.', 'Gagal');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <motion.div
      key="step5"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center text-center gap-6 py-4"
    >
      <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-500">
        <Check className="w-8 h-8" />
      </div>

      <div>
        <span className="text-xs font-semibold tracking-widest uppercase text-emerald-600 dark:text-emerald-400">
          Pemesanan Berhasil Dikirim!
        </span>
        <h3 className="font-serif-editorial text-3xl sm:text-4xl text-zinc-900 dark:text-zinc-100 font-light mt-1">
          Terima Kasih, {customerName || 'Pelanggan Margasera'}
        </h3>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 font-light max-w-lg mx-auto mt-1">
          Simpan <strong>Kode Booking</strong> Anda untuk mengecek perkembangan status persetujuan &amp; jadwal sesi foto.
        </p>
      </div>

      {/* Booking Code Display Box */}
      <div className="w-full max-w-lg p-6 sm:p-8 bg-zinc-50 dark:bg-zinc-900 border border-[#0066CC]/50 rounded-2xl flex flex-col items-center gap-4 shadow-xl">
        <span className="text-[10px] tracking-[0.25em] uppercase text-zinc-500 dark:text-zinc-400 font-mono">
          Kode Booking Anda:
        </span>
        <div className="font-mono text-3xl sm:text-4xl font-bold tracking-wider text-[#0066CC]">{bookingCode}</div>
        <div className="flex items-center justify-center gap-2 text-xs text-zinc-600 dark:text-zinc-300 font-mono pt-1 text-center flex-wrap">
          <span className="inline-flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-[#0066CC]" />
            <span>{formatDate(selectedDate)}</span>
          </span>
          <span className="text-zinc-400">•</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>
              {startTime} WIB ({getTimeOfDayLabel(startTime)}) – {endTime} WIB ({getTimeOfDayLabel(endTime)})
            </span>
          </span>
        </div>

        {/* Action Buttons: Copy Code & Download Card Image */}
        <div className="flex items-center gap-2.5 mt-2 flex-wrap justify-center w-full">
          <button
            type="button"
            onClick={onCopyCode}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold tracking-wider uppercase rounded-xl transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Kode Disalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-[#0066CC]" />
                <span>Salin Kode</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadCard}
            disabled={isDownloading}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-semibold tracking-wider uppercase rounded-xl transition-all shadow-[0_0_15px_rgba(0,102,204,0.3)] disabled:opacity-60 cursor-pointer"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyiapkan Kartu...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-amber-300" />
                <span>Unduh Kartu Booking (.PNG)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Payment Instructions Box */}
      <div className="w-full max-w-lg p-6 bg-zinc-50/80 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-left flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
          <span className="text-xs font-semibold text-[#0066CC] uppercase tracking-wider">
            Instruksi Pembayaran DP (Down Payment)
          </span>
          <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
            DP Minimal
          </span>
        </div>

        <p className="text-xs text-zinc-600 dark:text-zinc-400 font-light">
          Untuk mengunci jadwal sesi foto Anda, silakan melakukan transfer DP minimal sebesar{' '}
          <strong className="text-amber-700 dark:text-amber-300 font-mono font-bold">
            {selectedPackage ? formatCurrency(depositAmount) : 'DP'}
          </strong>{' '}
          ke rekening resmi Margasera:
        </p>

        <div className="grid grid-cols-1 gap-3 pt-1">
          <div className="p-3.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">
            <span className="text-[10px] font-mono text-zinc-500 block">{studioSettings.bankName.toUpperCase()}</span>
            <span className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {studioSettings.bankAccountNumber}
            </span>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">
              a.n {studioSettings.bankAccountHolder}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 pt-2">
        <Link
          href={`/booking/status?code=${bookingCode}`}
          className="px-6 py-3.5 bg-[#0066CC] text-white text-xs font-semibold tracking-widest uppercase hover:bg-[#0052A3] transition-colors shadow-[0_0_20px_rgba(0,102,204,0.3)] rounded-xl"
        >
          Cek Status Booking
        </Link>
        <Link
          href="/"
          className="px-6 py-3.5 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-light tracking-widest uppercase hover:border-zinc-500 transition-colors rounded-xl"
        >
          Kembali Ke Beranda
        </Link>
      </div>
    </motion.div>
  );
}

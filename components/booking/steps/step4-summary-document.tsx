'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Printer,
  Download,
  Award,
  User,
  Calendar,
  Building2,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import type { Service, Package, StudioSettings } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { isCoupleService } from '../booking-utils';

interface Step4SummaryDocumentProps {
  selectedService?: Service;
  selectedPackage?: Package;
  selectedDate: string;
  startTime: string;
  endTime: string;
  customerName: string;
  partnerName: string;
  whatsapp: string;
  email: string;
  instagram: string;
  location: string;
  draftDocId: string;
  studioSettings: StudioSettings;
  isSubmitting: boolean;
  submitError: string | null;
  onPrint: () => void;
  onDownload: () => void;
  onSubmit: () => void;
}

export function Step4SummaryDocument({
  selectedService,
  selectedPackage,
  selectedDate,
  startTime,
  endTime,
  customerName,
  partnerName,
  whatsapp,
  email,
  instagram,
  location,
  draftDocId,
  studioSettings,
  isSubmitting,
  submitError,
  onPrint,
  onDownload,
  onSubmit,
}: Step4SummaryDocumentProps) {
  const isCouple = isCoupleService(selectedService);
  const depositAmount =
    selectedPackage?.downPayment && selectedPackage.downPayment > 0
      ? selectedPackage.downPayment
      : Math.ceil((selectedPackage?.price || 0) * 0.2);
  const remainingAmount = (selectedPackage?.price || 0) - depositAmount;

  return (
    <motion.div
      key="step4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col gap-6"
    >
      {/* Header Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <span className="text-xs font-semibold tracking-widest uppercase text-[#0066CC]">Langkah 4 dari 4</span>
          <h3 className="font-serif-editorial text-2xl sm:text-3xl text-zinc-900 dark:text-zinc-100 font-light mt-1">
            Dokumen Pra-Reservasi Resmi
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 font-light mt-0.5">
            Dokumen ikhtisar resmi pra-pemesanan sesi dokumentasi Margasera Photography.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 no-print shrink-0">
          <button
            type="button"
            onClick={onPrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-xs font-semibold tracking-wider uppercase rounded-xl transition-colors shadow-sm cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-[#0066CC]" />
            <span>Cetak / PDF</span>
          </button>
          <button
            type="button"
            onClick={onDownload}
            className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 bg-[#0066CC]/10 hover:bg-[#0066CC]/20 border border-[#0066CC]/40 text-[#0066CC] dark:text-blue-300 text-xs font-semibold tracking-wider uppercase rounded-xl transition-colors shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh Voucher (.html)</span>
          </button>
        </div>
      </div>

      {/* SEMI-OFFICIAL FORMAL DOCUMENT CARD */}
      <div
        id="booking-official-document"
        className="bg-white text-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-xl rounded-2xl p-4 sm:p-7 md:p-8 print:p-6 flex flex-col gap-4 sm:gap-5 print:gap-4 print:border-none print:shadow-none print:rounded-none relative font-sans"
      >
        {/* Kop Surat / Formal Header */}
        <div className="flex flex-col sm:flex-row print:flex-row justify-between items-start sm:items-center print:items-center gap-4 pb-4 border-b-2 border-[#0066CC]">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="py-1 w-fit shrink-0">
              <Image
                src="/logo.png"
                alt="Margasera Photography"
                width={160}
                height={48}
                className="h-9 sm:h-10 w-auto object-contain"
                priority
              />
            </div>
            <div className="border-l-2 border-zinc-200 pl-3 sm:pl-4 hidden sm:block print:block">
              <div className="text-[11px] font-bold tracking-widest text-[#0066CC] uppercase">
                Photography &amp; Visual Storytelling
              </div>
              <div className="text-[11px] text-zinc-500 italic mt-0.5">
                “Moment Satu Hari Untuk Selamanya”
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right print:text-right flex flex-col items-start sm:items-end print:items-end">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 text-[#0066CC] text-[10px] font-mono font-bold tracking-widest uppercase rounded-full mb-1">
              <Award className="w-3.5 h-3.5 text-[#0066CC]" />
              <span>DRAFT PRA-RESERVASI</span>
            </div>
            <div className="font-mono text-xs sm:text-sm font-extrabold text-zinc-900 tracking-wider">
              {draftDocId || 'MS-PRSV-DRAFT'}
            </div>
            <div className="text-[11px] text-zinc-500">
              Tanggal Terbit: {formatDate(new Date().toISOString())}
            </div>
          </div>
        </div>

        {/* Document Title Banner */}
        <div className="text-center py-2.5 px-4 bg-zinc-50 rounded-xl border border-dashed border-zinc-300">
          <h4 className="font-serif-editorial text-sm sm:text-base font-bold uppercase tracking-wider text-zinc-900">
            Surat Ikhtisar Pra-Reservasi Sesi Dokumentasi
          </h4>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Dokumen resmi ringkasan rincian sesi foto sebelum konfirmasi &amp; verifikasi pelunasan Down Payment (DP)
          </p>
        </div>

        {/* Two Column Section: Client Details & Session Specifications */}
        <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-4 print-grid-2">
          {/* Client Info Card */}
          <div className="p-3.5 sm:p-4 bg-zinc-50/80 rounded-xl border border-zinc-200 flex flex-col gap-1.5">
            <div className="text-xs font-bold text-[#0066CC] uppercase tracking-wider pb-1 border-b border-zinc-200 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Data Klien / Pemesan
            </div>
            <div className="flex items-center justify-between text-xs gap-2 py-0.5">
              <span className="text-zinc-500 shrink-0">Nama Lengkap</span>
              <span className="font-semibold text-zinc-900 text-right truncate">{customerName}</span>
            </div>
            {isCouple && partnerName && (
              <div className="flex items-center justify-between text-xs gap-2 py-0.5">
                <span className="text-zinc-500 shrink-0">Nama Pasangan</span>
                <span className="font-semibold text-zinc-900 text-right truncate">{partnerName}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs gap-2 py-0.5">
              <span className="text-zinc-500 shrink-0">No. WhatsApp</span>
              <span className="font-semibold text-zinc-900 font-mono text-right">{whatsapp}</span>
            </div>
            {email.trim() && (
              <div className="flex items-center justify-between text-xs gap-2 py-0.5">
                <span className="text-zinc-500 shrink-0">Email</span>
                <span className="font-semibold text-zinc-900 text-right truncate max-w-[65%]">{email.trim()}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs gap-2 py-0.5">
              <span className="text-zinc-500 shrink-0">Instagram</span>
              <span className="font-semibold text-[#0066CC] font-mono text-right">{instagram}</span>
            </div>
            <div className="flex items-start justify-between text-xs gap-2 py-0.5">
              <span className="text-zinc-500 shrink-0">Lokasi / Venue</span>
              <span className="font-semibold text-zinc-900 text-right break-words max-w-[65%]">{location}</span>
            </div>
          </div>

          {/* Session Specs Card */}
          <div className="p-3.5 sm:p-4 bg-zinc-50/80 rounded-xl border border-zinc-200 flex flex-col gap-1.5">
            <div className="text-xs font-bold text-[#0066CC] uppercase tracking-wider pb-1 border-b border-zinc-200 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Spesifikasi Sesi &amp; Jadwal
            </div>
            <div className="flex items-center justify-between text-xs gap-2 py-0.5">
              <span className="text-zinc-500 shrink-0">Layanan</span>
              <span className="font-semibold text-zinc-900 text-right truncate">{selectedService?.name || '-'}</span>
            </div>
            <div className="flex items-center justify-between text-xs gap-2 py-0.5">
              <span className="text-zinc-500 shrink-0">Paket Dipilih</span>
              <span className="font-semibold text-zinc-900 text-right truncate">
                {selectedPackage?.name || '-'}
                {selectedService?.name && (
                  <span className="font-normal text-zinc-500"> ({selectedService.name})</span>
                )}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs gap-2 py-0.5">
              <span className="text-zinc-500 shrink-0">Tanggal Acara</span>
              <span className="font-bold text-[#0066CC] text-right">{formatDate(selectedDate)}</span>
            </div>
            <div className="flex items-center justify-between text-xs gap-2 py-0.5">
              <span className="text-zinc-500 shrink-0">Jam Sesi</span>
              <span className="font-mono font-semibold text-amber-700 text-right">
                {startTime} – {endTime} WIB
              </span>
            </div>
            <div className="flex items-center justify-between text-xs gap-2 py-0.5">
              <span className="text-zinc-500 shrink-0">Durasi Paket</span>
              <span className="font-semibold text-zinc-900 text-right">{selectedPackage?.duration || '-'}</span>
            </div>
            <div className="flex items-center justify-between text-xs gap-2 py-0.5">
              <span className="text-zinc-500 shrink-0">Fotografer</span>
              <span className="font-semibold text-zinc-900 text-right">
                {selectedPackage?.photographerCount || 1} Fotografer
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Card Breakdown */}
        <div className="sm:hidden print:hidden p-3.5 bg-zinc-50 rounded-xl border border-zinc-200 flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="font-bold text-zinc-900 text-xs truncate">
                {selectedPackage?.name} <span className="font-normal text-zinc-500">({selectedService?.name})</span>
              </div>
              <p className="text-[10px] text-zinc-500 mt-0.5 line-clamp-2 font-light">
                {selectedPackage?.description || 'Dokumentasi eksklusif Margasera Photography'}
              </p>
            </div>
            <span className="font-bold text-[#0066CC] font-mono text-sm shrink-0">
              {formatCurrency(selectedPackage?.price || 0)}
            </span>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-zinc-200/80 text-[10px] font-mono">
            <span className="bg-amber-500/10 text-amber-700 px-2 py-0.5 rounded border border-amber-500/20">
              Durasi: {selectedPackage?.duration}
            </span>
            <span className="bg-zinc-200/70 text-zinc-600 px-2 py-0.5 rounded">
              {selectedPackage?.photographerCount} Fotografer
            </span>
          </div>
        </div>

        {/* Desktop & Print Table */}
        <div className="hidden sm:block print:block border border-zinc-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-100 text-zinc-700 uppercase tracking-wider font-semibold border-b border-zinc-200">
              <tr>
                <th className="py-2.5 px-3">Rincian Paket Dokumentasi</th>
                <th className="py-2.5 px-3 text-center">Durasi</th>
                <th className="py-2.5 px-3 text-center">Tim</th>
                <th className="py-2.5 px-3 text-right">Biaya Investasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              <tr>
                <td className="py-3 px-3">
                  <span className="font-bold text-zinc-900">{selectedPackage?.name}</span> ({selectedService?.name})
                  <p className="text-[11px] text-zinc-500 mt-0.5 font-light">
                    {selectedPackage?.description || 'Dokumentasi eksklusif Margasera Photography'}
                  </p>
                </td>
                <td className="py-3 px-3 text-center font-mono text-zinc-700">{selectedPackage?.duration}</td>
                <td className="py-3 px-3 text-center text-zinc-700">{selectedPackage?.photographerCount} Fotografer</td>
                <td className="py-3 px-3 text-right font-bold text-[#0066CC] font-mono text-sm">
                  {formatCurrency(selectedPackage?.price || 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Investment Totals & DP Breakdown */}
        <div className="p-3.5 sm:p-4 bg-zinc-50 rounded-xl border border-zinc-200 flex flex-col gap-2 text-xs">
          <div className="flex items-center justify-between text-zinc-700">
            <span>Total Nilai Investasi Sesi:</span>
            <span className="font-semibold text-zinc-900 text-sm font-mono">{formatCurrency(selectedPackage?.price || 0)}</span>
          </div>
          <div className="flex items-center justify-between text-amber-700">
            <span className="font-semibold uppercase tracking-wider text-xs">Minimal Down Payment (DP) Terkunci (20%):</span>
            <span className="font-bold font-mono text-sm">{formatCurrency(depositAmount)}</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-zinc-300 text-sm">
            <span className="font-bold text-zinc-900">Estimasi Sisa Pelunasan (H-Day):</span>
            <span className="font-serif-editorial font-bold text-base text-[#0066CC]">
              {formatCurrency(remainingAmount)}
            </span>
          </div>
        </div>

        {/* Bank Account Information Box */}
        <div className="p-3.5 sm:p-4 bg-blue-50/70 border border-blue-200 rounded-xl flex flex-col gap-1.5 text-xs">
          <div className="text-[#0066CC] font-bold uppercase tracking-wider text-xs flex items-center gap-1.5">
            <Building2 className="w-4 h-4" />
            <span>Rekening Resmi Pembayaran DP Margasera</span>
          </div>
          <div className="flex flex-col sm:flex-row print:flex-row justify-between sm:items-center print:items-center gap-1 text-zinc-700">
            <div>
              Bank: <strong className="text-zinc-900">{(studioSettings.bankName || 'BRI').toUpperCase()}</strong>
              &nbsp;•&nbsp; No. Rekening:{' '}
              <strong className="font-mono text-zinc-900 text-sm">{studioSettings.bankAccountNumber}</strong>
            </div>
            <div>
              a.n <strong className="text-zinc-900">{studioSettings.bankAccountHolder}</strong>
            </div>
          </div>
        </div>

        {/* Terms & Policies */}
        <div className="text-[11px] text-zinc-500 leading-relaxed border-t border-zinc-200 pt-3 flex flex-col gap-1.5">
          <strong className="text-zinc-700 text-xs">Ketentuan &amp; Kebijakan Pra-Reservasi:</strong>
          <ol className="list-decimal pl-4 space-y-1">
            <li>Dokumen pra-reservasi ini diterbitkan otomatis oleh sistem reservasi digital Margasera Photography.</li>
            <li>
              Jadwal tanggal dan waktu sesi foto dinyatakan <strong>TERKUNCI (LOCKED)</strong> secara definitif
              setelah pembayaran Down Payment (DP) diterima dan diverifikasi Admin.
            </li>
            <li>Pelunasan sisa biaya paket dilakukan paling lambat pada hari sesi pemotretan berlangsung (H-Day).</li>
            <li>
              Perubahan jadwal (reschedule) diperkenankan maksimal H-7 acara dengan konfirmasi ke CS Margasera.
            </li>
          </ol>
        </div>

        {/* Mobile Signatures Layout */}
        <div className="sm:hidden print:hidden flex flex-col gap-3 pt-3 border-t border-zinc-200">
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 border-2 border-dashed border-[#0066CC] bg-blue-50 text-[#0066CC] text-[10px] font-bold tracking-widest uppercase rounded-lg shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0066CC]" />
              <span>MARGASERA OFFICIAL VERIFIED</span>
            </div>
            <div className="text-[9.5px] text-zinc-400 font-mono mt-0.5">Pamekasan, Madura - Jawa Timur</div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="text-center text-xs">
              <div className="text-zinc-500 text-[10.5px] font-medium">Pemesan / Klien,</div>
              <div className="h-12 w-full flex items-end justify-center border-b border-zinc-400 my-1 pb-1"></div>
              <div className="font-bold text-zinc-900 text-xs truncate">{customerName || 'Klien'}</div>
            </div>

            <div className="text-center text-xs">
              <div className="text-zinc-500 text-[10.5px] font-medium">Margasera Management,</div>
              <div className="h-12 w-full flex items-center justify-center border-b border-zinc-400 my-1"></div>
              <div className="font-bold text-zinc-900 font-mono text-xs truncate">Tim Admin Margasera</div>
            </div>
          </div>
        </div>

        {/* Desktop & Print Signatures Layout */}
        <div className="hidden sm:flex print:flex justify-between items-end pt-4 border-t border-zinc-200 print-flex-row">
          <div className="text-center text-xs">
            <div className="text-zinc-500 text-xs font-medium">Pemesan / Klien,</div>
            <div className="h-14 sm:h-16 w-36 sm:w-48 mx-auto flex items-end justify-center border-b border-zinc-400 my-1.5 pb-1"></div>
            <div className="font-bold text-zinc-900 text-xs">{customerName || 'Klien'}</div>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border-2 border-dashed border-[#0066CC] bg-blue-50 text-[#0066CC] text-[10.5px] font-bold tracking-widest uppercase rounded-lg shadow-sm">
              <ShieldCheck className="w-4 h-4 text-[#0066CC]" />
              <span>MARGASERA OFFICIAL VERIFIED</span>
            </div>
            <div className="text-[10px] text-zinc-400 font-mono mt-1">Pamekasan, Madura - Jawa Timur</div>
          </div>

          <div className="text-center text-xs">
            <div className="text-zinc-500 text-xs font-medium">Margasera Management,</div>
            <div className="h-14 sm:h-16 w-36 sm:w-48 mx-auto flex items-center justify-center border-b border-zinc-400 my-1.5"></div>
            <div className="font-bold text-zinc-900 font-mono text-xs">Tim Administrasi Margasera</div>
          </div>
        </div>
      </div>

      {/* Submit Error Warning */}
      {submitError && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Confirmation Notice */}
      <div className="p-4 bg-gradient-to-r from-blue-50/90 via-sky-50/50 to-blue-50/80 dark:from-zinc-900/90 dark:via-zinc-900/60 dark:to-zinc-900/90 border border-blue-200/70 dark:border-zinc-800 rounded-2xl flex items-start sm:items-center justify-between gap-3 text-xs text-zinc-700 dark:text-zinc-300 shadow-sm no-print">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#0066CC]/10 dark:bg-[#0066CC]/20 flex items-center justify-center text-[#0066CC] shrink-0 mt-0.5 sm:mt-0">
            <ShieldCheck className="w-4 h-4 text-[#0066CC]" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs">
              Verifikasi &amp; Konfirmasi Data Pemesanan
            </span>
            <span className="text-[11px] text-zinc-600 dark:text-zinc-400 font-light">
              Pastikan rincian jadwal dan kontak di atas sudah sesuai. Klik tombol di bawah untuk mengunci jadwal &amp; menerbitkan <strong>Kode Booking Resmi</strong>.
            </span>
          </div>
        </div>
      </div>

      {/* Submit Action Button */}
      <button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting}
        className="group relative w-full p-4 sm:p-5 bg-gradient-to-r from-[#0066CC] via-[#0055B3] to-[#003E8A] hover:from-[#0052A3] hover:via-[#004499] hover:to-[#003366] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed text-white transition-all rounded-2xl shadow-[0_8px_24px_rgba(0,102,204,0.32)] hover:shadow-[0_12px_32px_rgba(0,102,204,0.42)] flex items-center justify-between gap-3 sm:gap-4 no-print cursor-pointer overflow-hidden border border-white/20"
      >
        {/* Subtle background glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

        {isSubmitting ? (
          <div className="w-full flex items-center justify-center gap-3 py-1">
            <Loader2 className="w-5 h-5 animate-spin text-white" />
            <span className="text-xs sm:text-sm font-semibold tracking-wide">
              Mengirim Pemesanan &amp; Menyiapkan Dokumen...
            </span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 sm:gap-3.5 z-10 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white shrink-0 group-hover:scale-105 group-hover:bg-white/25 transition-all shadow-inner">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col text-left min-w-0">
                <span className="font-bold text-xs sm:text-sm tracking-wide text-white font-sans truncate">
                  Kirim Pemesanan &amp; Dapatkan Kode Booking Resmi
                </span>
                <span className="text-[10px] sm:text-[11px] text-blue-100 font-light truncate">
                  Otomatis terhubung ke CS Margasera &amp; simpan e-voucher
                </span>
              </div>
            </div>

            <div className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl text-white text-xs font-semibold tracking-wider uppercase shrink-0 transition-colors z-10 border border-white/25">
              <span>Kirim</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </>
        )}
      </button>
    </motion.div>
  );
}

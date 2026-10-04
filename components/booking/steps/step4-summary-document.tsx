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
  Sparkles,
  Loader2,
} from 'lucide-react';
import type { Service, Package, StudioSettings } from '@/lib/types';
import { formatCurrency, formatDate, getTimeOfDayLabel } from '@/lib/utils';
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
          <h3 className="font-serif-editorial text-3xl text-zinc-900 dark:text-zinc-100 font-light mt-1">
            Dokumen Pra-Reservasi Resmi
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 font-light mt-0.5">
            Dokumen ikhtisar resmi pra-pemesanan sesi dokumentasi Margasera Photography.
          </p>
        </div>

        <div className="flex items-center gap-2 no-print shrink-0">
          <button
            type="button"
            onClick={onPrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-xs font-semibold tracking-wider uppercase rounded-xl transition-colors shadow-sm cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-[#0066CC]" />
            <span>Cetak / PDF</span>
          </button>
          <button
            type="button"
            onClick={onDownload}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-[#0066CC]/10 hover:bg-[#0066CC]/20 border border-[#0066CC]/40 text-[#0066CC] dark:text-blue-300 text-xs font-semibold tracking-wider uppercase rounded-xl transition-colors shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh Voucher (.html)</span>
          </button>
        </div>
      </div>

      {/* SEMI-OFFICIAL FORMAL DOCUMENT CARD */}
      <div
        id="booking-official-document"
        className="bg-white text-zinc-900 border border-zinc-300 dark:border-zinc-700 shadow-xl rounded-2xl overflow-hidden relative"
      >
        <div className="p-6 sm:p-8 md:p-10 flex flex-col gap-6">
          {/* Kop Surat / Formal Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b-2 border-[#0066CC]">
            <div className="flex items-center gap-4">
              <div className="py-1">
                <Image
                  src="/logo.png"
                  alt="Margasera Photography"
                  width={160}
                  height={48}
                  className="h-10 sm:h-12 w-auto object-contain"
                  priority
                />
              </div>
              <div className="border-l border-zinc-200 dark:border-zinc-700 pl-4 hidden sm:block">
                <div className="text-[11px] font-semibold tracking-widest text-[#0066CC] uppercase">
                  Photography &amp; Visual Storytelling
                </div>
                <div className="text-[11px] text-zinc-500 italic mt-0.5">
                  “Moment Satu Hari Untuk Selamanya”
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right flex flex-col items-start sm:items-end">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 text-[#0066CC] text-[10px] font-mono font-bold tracking-widest uppercase rounded-full mb-1">
                <Award className="w-3 h-3 text-[#0066CC]" />
                <span>DRAFT PRA-RESERVASI</span>
              </div>
              <div className="font-mono text-sm font-extrabold text-zinc-900 tracking-wider">
                {draftDocId || 'MS-PRSV-DRAFT'}
              </div>
              <div className="text-[11px] text-zinc-500 mt-0.5">
                Tanggal Terbit: {formatDate(new Date().toISOString())}
              </div>
            </div>
          </div>

          {/* Document Title Banner */}
          <div className="text-center py-3 px-4 bg-zinc-50 rounded-xl border border-dashed border-zinc-300">
            <h4 className="font-serif-editorial text-lg sm:text-xl font-bold uppercase tracking-wider text-zinc-900">
              Surat Ikhtisar Pra-Reservasi Sesi Dokumentasi
            </h4>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Dokumen resmi ringkasan rincian sesi foto sebelum konfirmasi &amp; verifikasi pelunasan Down Payment (DP)
            </p>
          </div>

          {/* Two Column Section: Client Details & Session Specifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Client Info Card */}
            <div className="p-4 bg-zinc-50/80 rounded-xl border border-zinc-200 flex flex-col gap-2.5">
              <div className="text-xs font-bold text-[#0066CC] uppercase tracking-wider pb-1.5 border-b border-zinc-200 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Data Klien / Pemesan
              </div>
              <div className="grid grid-cols-3 text-xs gap-1 py-0.5">
                <span className="text-zinc-500">Nama Lengkap</span>
                <span className="col-span-2 font-semibold text-zinc-900 text-right">{customerName}</span>
              </div>
              {isCouple && partnerName && (
                <div className="grid grid-cols-3 text-xs gap-1 py-0.5">
                  <span className="text-zinc-500">Nama Pasangan</span>
                  <span className="col-span-2 font-semibold text-zinc-900 text-right">{partnerName}</span>
                </div>
              )}
              <div className="grid grid-cols-3 text-xs gap-1 py-0.5">
                <span className="text-zinc-500">No. WhatsApp</span>
                <span className="col-span-2 font-semibold text-zinc-900 font-mono text-right">{whatsapp}</span>
              </div>
              {email.trim() && (
                <div className="grid grid-cols-3 text-xs gap-1 py-0.5">
                  <span className="text-zinc-500">Email</span>
                  <span className="col-span-2 font-semibold text-zinc-900 text-right truncate">{email.trim()}</span>
                </div>
              )}
              <div className="grid grid-cols-3 text-xs gap-1 py-0.5">
                <span className="text-zinc-500">Instagram</span>
                <span className="col-span-2 font-semibold text-[#0066CC] font-mono text-right">{instagram}</span>
              </div>
              <div className="grid grid-cols-3 text-xs gap-1 py-0.5">
                <span className="text-zinc-500">Lokasi / Venue</span>
                <span className="col-span-2 font-semibold text-zinc-900 text-right">{location}</span>
              </div>
            </div>

            {/* Session Specs Card */}
            <div className="p-4 bg-zinc-50/80 rounded-xl border border-zinc-200 flex flex-col gap-2.5">
              <div className="text-xs font-bold text-[#0066CC] uppercase tracking-wider pb-1.5 border-b border-zinc-200 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Spesifikasi Sesi &amp; Jadwal
              </div>
              <div className="grid grid-cols-3 text-xs gap-1 py-0.5">
                <span className="text-zinc-500">Layanan</span>
                <span className="col-span-2 font-semibold text-zinc-900 text-right">{selectedService?.name || '-'}</span>
              </div>
              <div className="grid grid-cols-3 text-xs gap-1 py-0.5">
                <span className="text-zinc-500">Paket Dipilih</span>
                <span className="col-span-2 font-semibold text-zinc-900 text-right">{selectedPackage?.name || '-'}</span>
              </div>
              <div className="grid grid-cols-3 text-xs gap-1 py-0.5">
                <span className="text-zinc-500">Tanggal Acara</span>
                <span className="col-span-2 font-bold text-[#0066CC] text-right">{formatDate(selectedDate)}</span>
              </div>
              <div className="grid grid-cols-3 text-xs gap-1 py-0.5">
                <span className="text-zinc-500">Jam Sesi (WIB)</span>
                <span className="col-span-2 font-mono font-semibold text-amber-700 text-right">
                  {startTime} – {endTime} WIB ({getTimeOfDayLabel(startTime)})
                </span>
              </div>
              <div className="grid grid-cols-3 text-xs gap-1 py-0.5">
                <span className="text-zinc-500">Durasi Paket</span>
                <span className="col-span-2 font-semibold text-zinc-900 text-right">{selectedPackage?.duration || '-'}</span>
              </div>
              <div className="grid grid-cols-3 text-xs gap-1 py-0.5">
                <span className="text-zinc-500">Fotografer</span>
                <span className="col-span-2 font-semibold text-zinc-900 text-right">
                  {selectedPackage?.photographerCount || 1} Fotografer
                </span>
              </div>
            </div>
          </div>

          {/* Structured Table: Package Breakdown */}
          <div className="border border-zinc-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-100 text-zinc-700 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-3">Rincian Paket Dokumentasi</th>
                  <th className="p-3 text-center">Durasi</th>
                  <th className="p-3 text-center">Tim</th>
                  <th className="p-3 text-right">Biaya Investasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                <tr>
                  <td className="p-3">
                    <span className="font-bold text-zinc-900">{selectedPackage?.name}</span> ({selectedService?.name})
                    <p className="text-[11px] text-zinc-500 mt-0.5 font-light">
                      {selectedPackage?.description || 'Dokumentasi eksklusif Margasera Photography'}
                    </p>
                  </td>
                  <td className="p-3 text-center font-mono">{selectedPackage?.duration}</td>
                  <td className="p-3 text-center">{selectedPackage?.photographerCount} Fotografer</td>
                  <td className="p-3 text-right font-bold text-[#0066CC] font-mono text-sm">
                    {formatCurrency(selectedPackage?.price || 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Investment Totals & DP Breakdown */}
          <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 flex flex-col gap-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-zinc-600">Total Nilai Investasi Sesi:</span>
              <span className="font-semibold text-zinc-900 text-sm">{formatCurrency(selectedPackage?.price || 0)}</span>
            </div>
            <div className="flex items-center justify-between text-amber-700">
              <span className="font-semibold uppercase tracking-wider">Minimal Down Payment (DP) Terkunci (20%):</span>
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
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl flex flex-col gap-1.5 text-xs">
            <div className="text-[#0066CC] font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              <span>Rekening Resmi Pembayaran DP Margasera</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-zinc-700">
              <div>
                Bank: <strong className="text-zinc-900">{studioSettings.bankName.toUpperCase()}</strong>
                &nbsp;•&nbsp; No. Rekening:{' '}
                <strong className="font-mono text-zinc-900 text-sm">{studioSettings.bankAccountNumber}</strong>
              </div>
              <div>
                a.n <strong className="text-zinc-900">{studioSettings.bankAccountHolder}</strong>
              </div>
            </div>
          </div>

          {/* Terms & Policies */}
          <div className="text-[11px] text-zinc-500 leading-relaxed border-t border-zinc-200 pt-3 flex flex-col gap-1">
            <strong className="text-zinc-700">Ketentuan &amp; Kebijakan Pra-Reservasi:</strong>
            <ol className="list-decimal pl-4 space-y-0.5">
              <li>Dokumen pra-reservasi ini diterbitkan otomatis oleh sistem reservasi digital Margasera Photography.</li>
              <li>
                Jadwal tanggal dan waktu sesi foto dinyatakan <strong>TERKUNCI (LOCKED)</strong> secara definitif
                setelah pembayaran Down Payment (DP) diterima dan diverifikasi Admin.
              </li>
              <li>Pelunasan sisa biaya paket dilakukan paling lambat pada hari sesi pemotretan berlangsung (H-Day).</li>
              <li>
                Perubahan jadwal (reschedule) diperkenankan maksimal H-7 acara dengan konfirmasi ke Customer Service
                Margasera.
              </li>
            </ol>
          </div>

          {/* Signatures & Official Digital Seal */}
          <div className="flex justify-between items-end pt-4 border-t border-zinc-200">
            <div className="text-center text-xs">
              <div className="text-zinc-500 text-[11px] font-medium">Pemesan / Klien,</div>
              <div className="h-14 w-36 sm:w-44 mx-auto flex items-end justify-center border-b border-zinc-400 my-1 pb-1">
                <span className="font-serif-editorial italic text-zinc-400 text-xs"></span>
              </div>
              <div className="font-bold text-zinc-900 text-[11px]">{customerName || 'Klien'}</div>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-dashed border-[#0066CC] bg-blue-50 text-[#0066CC] text-[10px] font-bold tracking-widest uppercase rounded-lg shadow-sm">
                <ShieldCheck className="w-4 h-4 text-[#0066CC]" />
                <span>MARGASERA OFFICIAL VERIFIED</span>
              </div>
              <div className="text-[9px] text-zinc-400 font-mono mt-1">Pamekasan, Madura - Jawa Timur</div>
            </div>

            <div className="text-center text-xs">
              <div className="text-zinc-500 text-[11px] font-medium">Margasera Management,</div>
              <div className="h-14 w-36 sm:w-44 mx-auto flex items-center justify-center border-b border-zinc-400 my-1"></div>
              <div className="font-bold text-zinc-900 font-mono text-[11px]">Tim Administrasi Margasera</div>
            </div>
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
      <div className="p-4 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center justify-between gap-4 text-xs text-zinc-600 dark:text-zinc-400 no-print">
        <span className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#0066CC] shrink-0" />
          <span>
            Pastikan seluruh data di atas sudah benar. Klik tombol di bawah untuk mengirim data ke sistem &amp;
            menerbitkan <strong>Kode Booking</strong> resmi Anda.
          </span>
        </span>
      </div>

      {/* Submit Action Button */}
      <button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting}
        className="w-full py-4 bg-[#0066CC] hover:bg-[#0052A3] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-xs tracking-[0.2em] uppercase transition-all rounded-xl shadow-[0_0_20px_rgba(0,102,204,0.35)] flex items-center justify-center gap-2 no-print cursor-pointer"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Mengirim Pemesanan ke Sistem Margasera...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Kirim Pemesanan &amp; Dapatkan Kode Booking Resmi</span>
          </>
        )}
      </button>
    </motion.div>
  );
}

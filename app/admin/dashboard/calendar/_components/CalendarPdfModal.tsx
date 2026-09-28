'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, Printer, FileText } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { printDocument } from '@/lib/print';
import type { Availability, StudioSettings } from '@/lib/types';

interface CalendarPdfModalProps {
  availability: Availability[];
  studioSettings: StudioSettings;
  onClose: () => void;
}

export function CalendarPdfModal({
  availability,
  studioSettings,
  onClose,
}: CalendarPdfModalProps) {
  const [filterMode, setFilterMode] = useState<'all' | 'booked' | 'blocked'>('all');

  const displayedList = availability
    .filter((a) => {
      if (filterMode === 'booked') return a.status === 'booked' || a.status === 'almost_full';
      if (filterMode === 'blocked') return a.status === 'blocked';
      return true;
    })
    .sort((a, b) => (a.date > b.date ? 1 : -1));

  const totalBooked = availability.filter((a) => a.status === 'booked').length;
  const totalAlmostFull = availability.filter((a) => a.status === 'almost_full').length;
  const totalBlocked = availability.filter((a) => a.status === 'blocked').length;

  const handlePrint = () => {
    printDocument('margasera-calendar-schedule-doc', 'Jadwal_Kalender_Margasera');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Toolbar Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#0066CC]" />
            <div>
              <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                Pratinjau Ekspor PDF Jadwal Kalender
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Mencetak seluruh {availability.length} tanggal khusus &amp; jadwal terisi studio
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Filter Toggle */}
            <div className="hidden sm:flex items-center p-0.5 bg-zinc-200/80 dark:bg-zinc-800 rounded-lg text-xs font-mono">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${filterMode === 'all'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-bold shadow-2xs'
                  : 'text-zinc-600 dark:text-zinc-400'
                  }`}
              >
                Semua ({availability.length})
              </button>
              <button
                onClick={() => setFilterMode('booked')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${filterMode === 'booked'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-bold shadow-2xs'
                  : 'text-zinc-600 dark:text-zinc-400'
                  }`}
              >
                Booked ({totalBooked + totalAlmostFull})
              </button>
              <button
                onClick={() => setFilterMode('blocked')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${filterMode === 'blocked'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-bold shadow-2xs'
                  : 'text-zinc-600 dark:text-zinc-400'
                  }`}
              >
                Libur ({totalBlocked})
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-[#0066CC] hover:bg-[#0055b3] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Body */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-zinc-100 dark:bg-zinc-950/50">
          <div
            id="margasera-calendar-schedule-doc"
            className="bg-white text-zinc-900 p-4 sm:p-6 print:p-0 border border-zinc-200 print:border-none mx-auto max-w-4xl text-xs space-y-2"
          >
            {/* Kop Dokumen */}
            <div className="flex items-center justify-between pb-2.5 border-b border-zinc-300 print-flex-row">
              <div className="flex flex-col gap-1">
                <div className="py-0.5 w-fit">
                  <Image
                    src="/logo.png"
                    alt="Margasera Logo"
                    width={140}
                    height={36}
                    className="h-7 w-auto object-contain"
                    priority
                  />
                </div>
                <div>
                  <h1 className="text-xs font-bold uppercase tracking-wider text-zinc-950 font-sans">
                    {studioSettings.studioName || 'MARGASERA PHOTOGRAPHY'}
                  </h1>
                  <p className="text-[10px] text-zinc-600 font-sans leading-tight">
                    {studioSettings.address || 'Pamekasan, Madura, Jawa Timur'}
                  </p>
                  <p className="text-[10px] text-zinc-500 font-sans leading-tight">
                    WhatsApp: {studioSettings.whatsapp || '0858-0613-8955'} | Email: {studioSettings.email || 'hello@margasera.id'}
                  </p>
                </div>
              </div>
              <div className="text-right print-text-right">
                <span className="inline-block px-2 py-0.5 bg-zinc-900 text-white text-[9px] font-mono uppercase font-bold tracking-widest rounded-xs mb-0.5">
                  JADWAL &amp; KETERSEDIAAN
                </span>
                <p className="text-[11px] font-semibold text-zinc-800">
                  {filterMode === 'all'
                    ? `Seluruh Jadwal (${displayedList.length} Tanggal)`
                    : filterMode === 'booked'
                      ? `Jadwal Booked Klien (${displayedList.length} Tanggal)`
                      : `Jadwal Libur Studio (${displayedList.length} Tanggal)`}
                </p>
                <p className="text-[9px] text-zinc-500 font-mono">
                  Dicetak: {formatDate(new Date().toISOString())}
                </p>
              </div>
            </div>

            {/* Table of Schedules */}
            <div className="overflow-x-auto rounded-md border border-zinc-200">
              <table className="w-full text-left text-[10px] border-collapse">
                <thead className="bg-zinc-100 text-zinc-700 font-semibold border-b border-zinc-300 text-[9px] font-mono uppercase">
                  <tr>
                    <th className="py-1.5 px-2 border-r border-zinc-200">Tanggal Event</th>
                    <th className="py-1.5 px-2 border-r border-zinc-200 text-center">Status</th>
                    <th className="py-1.5 px-2 border-r border-zinc-200">Kuota Slot</th>
                    <th className="py-1.5 px-2 border-r border-zinc-200">Rincian Klien &amp; Keterangan</th>
                    <th className="py-1.5 px-2 text-right">Sumber</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 font-sans">
                  {displayedList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-zinc-400 italic">
                        Tidak ada jadwal yang terdaftar pada filter ini.
                      </td>
                    </tr>
                  ) : (
                    displayedList.map((av, idx) => {
                      const weddingBookings = (av.weddingSlots || []).filter((w) => w.isBooked);
                      const regularBookings = av.bookedTimeSlots || [];
                      const isAutoBooking = weddingBookings.length > 0 || regularBookings.length > 0;

                      return (
                        <tr key={av.id || av.date} className={idx % 2 === 1 ? 'bg-zinc-50/50' : ''}>
                          {/* Tanggal */}
                          <td className="py-1.5 px-2 border-r border-zinc-200 whitespace-nowrap font-mono font-bold text-zinc-900 text-[10.5px]">
                            {formatDate(av.date)}
                          </td>

                          {/* Status */}
                          <td className="py-1.5 px-2 border-r border-zinc-200 whitespace-nowrap text-center">
                            <span
                              className={`inline-block px-1.5 py-0.2 rounded-xs text-[8.5px] font-bold uppercase font-mono ${av.status === 'booked'
                                ? 'bg-rose-100 text-rose-800'
                                : av.status === 'blocked'
                                  ? 'bg-zinc-200 text-zinc-800'
                                  : av.status === 'almost_full'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                            >
                              {av.status === 'blocked' ? 'Libur' : av.status.replace('_', ' ')}
                            </span>
                          </td>

                          {/* Kuota Slot */}
                          <td className="py-1.5 px-2 border-r border-zinc-200 whitespace-nowrap font-mono text-[9px] leading-tight">
                            <div>💍 Wed: <strong>{weddingBookings.length}/2</strong></div>
                            <div>📸 Sesi: <strong>{regularBookings.length}/6</strong></div>
                          </td>

                          {/* Rincian Klien */}
                          <td className="py-1.5 px-2 border-r border-zinc-200">
                            {av.notes && (
                              <p className="font-semibold text-zinc-900 text-[9.5px]">📝 {av.notes}</p>
                            )}
                            {isAutoBooking && (
                              <div className="space-y-0.5 text-[9px] text-zinc-700 leading-tight">
                                {weddingBookings.map((w) => (
                                  <div key={w.id}>
                                    • 💍 <strong>{w.bookedBy || 'Client Wedding'}</strong> ({w.name})
                                  </div>
                                ))}
                                {regularBookings.map((rb, bIdx) => (
                                  <div key={bIdx}>
                                    • 📸 <strong>{rb.customerName}</strong> — {rb.serviceCategory} ({rb.startTime} - {rb.endTime})
                                  </div>
                                ))}
                              </div>
                            )}
                            {!av.notes && !isAutoBooking && (
                              <span className="text-zinc-400 italic text-[9px]">
                                Kunci manual libur studio
                              </span>
                            )}
                          </td>

                          {/* Sumber */}
                          <td className="py-1.5 px-2 text-right font-mono text-[9px] text-zinc-500 whitespace-nowrap">
                            {isAutoBooking ? 'Booking' : 'Manual'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer Pengesahan */}
            <div className="pt-2.5 border-t border-zinc-300 flex justify-between items-end text-[10px] text-zinc-500 font-light print-flex-row print-avoid-break">
              <div className="flex flex-col gap-0.5 text-[9px]">
                <strong className="text-zinc-800 font-semibold uppercase font-mono text-[9.5px]">Catatan Jadwal:</strong>
                <span>• Laporan jadwal ini digenerate secara otomatis dari sistem internal Margasera.</span>
                <span>• Mencakup pesanan klien yang terkonfirmasi serta jadwal libur studio.</span>
                <span>• Total Jadwal Terdaftar: <strong>{availability.length} Tanggal</strong></span>
              </div>
              <div className="text-right flex flex-col items-end gap-0.5 print-text-right print-items-end">
                <span className="text-[9px] font-mono text-zinc-400">Penanggung Jawab:</span>
                <div className="h-8 w-24 border-b border-zinc-400 flex items-center justify-end italic text-zinc-400 text-xs">
                  <Image
                    src="/ttd.PNG"
                    alt="Tanda Tangan Margasera"
                    width={200}
                    height={80}
                    className="h-12 w-auto object-contain"
                    priority
                  />
                </div>
                <strong className="text-zinc-900 font-semibold font-mono text-[10.5px]">ROYFAL ALIM, S.Kom</strong>
                <span className="font-mono text-[9px]">Chief Executive Officer(CEO)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

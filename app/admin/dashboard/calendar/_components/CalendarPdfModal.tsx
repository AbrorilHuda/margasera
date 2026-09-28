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
            className="bg-white text-zinc-900 p-6 sm:p-10 rounded-xl shadow-xs border border-zinc-200 mx-auto max-w-3xl space-y-6 text-sm"
          >
            {/* Kop Dokumen */}
            <div className="flex items-center justify-between border-b-2 border-zinc-900 pb-5">
              <div className="flex flex-col gap-1.5">
                <div className="py-1 w-fit">
                  <Image
                    src="/logo.png"
                    alt="Margasera Logo"
                    width={160}
                    height={48}
                    className="h-9 w-auto object-contain"
                    priority
                  />
                </div>
                <div>
                  <h1 className="text-sm font-bold uppercase tracking-wider text-zinc-950 font-sans">
                    {studioSettings.studioName || 'MARGASERA PHOTOGRAPHY'}
                  </h1>
                  <p className="text-xs text-zinc-600 font-sans">
                    {studioSettings.address || 'Pamekasan, Madura, Jawa Timur'}
                  </p>
                  <p className="text-xs text-zinc-500 font-sans">
                    WhatsApp: {studioSettings.whatsapp || '0858-0613-8955'} | Email: {studioSettings.email || 'hello@margasera.id'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-2.5 py-1 bg-zinc-900 text-white text-[10px] font-mono uppercase font-bold tracking-widest rounded-sm mb-1">
                  JADWAL &amp; KETERSEDIAAN
                </span>
                <p className="text-xs font-semibold text-zinc-800">
                  {filterMode === 'all'
                    ? `Seluruh Jadwal (${displayedList.length} Tanggal)`
                    : filterMode === 'booked'
                      ? `Jadwal Booked Klien (${displayedList.length} Tanggal)`
                      : `Jadwal Libur Studio (${displayedList.length} Tanggal)`}
                </p>
                <p className="text-[10px] text-zinc-500 font-mono">
                  Dicetak: {formatDate(new Date().toISOString())}
                </p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
                <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block">
                  Total Booked Penuh
                </span>
                <span className="text-base sm:text-lg font-bold text-rose-700 block mt-0.5">
                  {totalBooked} Tanggal
                </span>
                <span className="text-[10px] text-zinc-500">Kuota terisi penuh</span>
              </div>
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
                <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block">
                  Hampir Penuh
                </span>
                <span className="text-base sm:text-lg font-bold text-amber-700 block mt-0.5">
                  {totalAlmostFull} Tanggal
                </span>
                <span className="text-[10px] text-zinc-500">Sebagian slot terisi</span>
              </div>
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
                <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block">
                  Libur / Maintenance
                </span>
                <span className="text-base sm:text-lg font-bold text-zinc-700 block mt-0.5">
                  {totalBlocked} Tanggal
                </span>
                <span className="text-[10px] text-zinc-500">Dikunci manual studio</span>
              </div>
            </div>

            {/* Table of Schedules */}
            <div>
              <div className="overflow-x-auto border border-zinc-200 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-100 text-zinc-700 font-semibold border-b border-zinc-200 text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">Tanggal Event</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Kuota Slot</th>
                      <th className="py-2.5 px-3">Rincian Klien &amp; Keterangan</th>
                      <th className="py-2.5 px-3 text-right">Sumber</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 font-sans text-[11px]">
                    {displayedList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-zinc-500 italic">
                          Tidak ada jadwal yang terdaftar pada filter ini.
                        </td>
                      </tr>
                    ) : (
                      displayedList.map((av) => {
                        const weddingBookings = (av.weddingSlots || []).filter((w) => w.isBooked);
                        const regularBookings = av.bookedTimeSlots || [];
                        const isAutoBooking = weddingBookings.length > 0 || regularBookings.length > 0;

                        return (
                          <tr key={av.id || av.date} className="hover:bg-zinc-50/70">
                            {/* Tanggal */}
                            <td className="py-2.5 px-3 whitespace-nowrap font-mono font-bold text-zinc-900">
                              {formatDate(av.date)}
                            </td>

                            {/* Status */}
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <span
                                className={`px-2 py-0.5 rounded-sm text-[10px] font-semibold uppercase font-mono ${av.status === 'booked'
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
                            <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[10px]">
                              <div>💍 Wedding: {weddingBookings.length}/2</div>
                              <div>📸 Sesi: {regularBookings.length}/6</div>
                            </td>

                            {/* Rincian Klien */}
                            <td className="py-2.5 px-3">
                              {av.notes && (
                                <p className="font-semibold text-zinc-900">📝 {av.notes}</p>
                              )}
                              {isAutoBooking && (
                                <div className="space-y-0.5 text-[10px] text-zinc-700 mt-0.5">
                                  {weddingBookings.map((w) => (
                                    <div key={w.id}>
                                      • 💍 <strong>{w.bookedBy || 'Client Wedding'}</strong> ({w.name})
                                    </div>
                                  ))}
                                  {regularBookings.map((rb, idx) => (
                                    <div key={idx}>
                                      • 📸 <strong>{rb.customerName}</strong> — {rb.serviceCategory} ({rb.startTime} - {rb.endTime})
                                    </div>
                                  ))}
                                </div>
                              )}
                              {!av.notes && !isAutoBooking && (
                                <span className="text-zinc-400 italic text-[10px]">
                                  Kunci manual libur studio
                                </span>
                              )}
                            </td>

                            {/* Sumber */}
                            <td className="py-2.5 px-3 text-right font-mono text-[10px] text-zinc-500 whitespace-nowrap">
                              {isAutoBooking ? 'Booking' : 'Manual'}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer Pengesahan */}
            <div className="pt-6 border-t border-zinc-200 flex justify-between items-end text-xs text-zinc-500 font-light">
              <div className="flex flex-col gap-1">
                <strong className="text-zinc-800 font-semibold uppercase font-mono text-[10px]">Catatan Jadwal:</strong>
                <span>• Laporan jadwal ini di-generate secara otomatis dari sistem admin Margasera.</span>
                <span>• Jadwal mencakup pesanan klien yang terkonfirmasi serta tanggal libur studio.</span>
                <span>• Total Jadwal Terdaftar: <strong>{availability.length} Tanggal</strong></span>
              </div>
              <div className="text-right flex flex-col items-end gap-1">
                <span className="text-[10px] font-mono text-zinc-400">Penanggung Jawab:</span>
                <div className="h-10 w-28 border-b border-zinc-400 flex items-center justify-end italic text-zinc-400 text-xs">
                  <Image
                    src="/ttd.PNG"
                    alt="Tanda Tangan Margasera"
                    width={250}
                    height={100}
                    className="h-20 w-auto object-contain"
                    priority
                  />
                </div>
                <strong className="text-zinc-900 font-semibold font-mono text-xs">ROYFAL ALIM, S.Kom</strong>
                <span className="font-mono text-[10px]">Chief Executive Officer(CEO)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Sparkles, XCircle, CheckCircle2, Lock } from 'lucide-react';
import type { Service, Package, Availability } from '@/lib/types';
import { formatDate, getTimeOfDayLabel, getTodayDateString } from '@/lib/utils';
import { getSelectedDateInfo, getSelectedDateConflict } from '../booking-utils';

interface Step2DateTimeProps {
  selectedPackage?: Package;
  selectedService?: Service;
  selectedDate: string;
  startTime: string;
  endTime: string;
  availabilityData: Availability[];
  onSelectDate: (date: string) => void;
  onSelectStartTime: (time: string) => void;
}

export function Step2DateTime({
  selectedPackage,
  selectedService,
  selectedDate,
  startTime,
  endTime,
  availabilityData,
  onSelectDate,
  onSelectStartTime,
}: Step2DateTimeProps) {
  const todayStr = getTodayDateString();
  const dateInfo = getSelectedDateInfo(availabilityData, selectedDate);
  const conflict = getSelectedDateConflict(
    availabilityData,
    selectedDate,
    startTime,
    endTime,
    selectedService
  );

  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col gap-6"
    >
      <div>
        <span className="text-xs font-semibold tracking-widest uppercase text-[#0066CC]">Langkah 2 dari 4</span>
        <h3 className="font-serif-editorial text-2xl sm:text-3xl text-zinc-900 dark:text-zinc-100 font-light mt-1">
          Pilih Tanggal &amp; Tentukan Jam Acara
        </h3>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 font-light mt-1">
          Pilih tanggal dan tentukan Jam Mulai. Jam Selesai dihitung otomatis sesuai durasi paket pilihan Anda (
          {selectedPackage?.name} — {selectedPackage?.duration}).
        </p>
      </div>

      <div className="p-3.5 bg-blue-50/80 dark:bg-[#0066CC]/15 border border-blue-200 dark:border-[#0066CC]/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-blue-950 dark:text-zinc-200">
        <span className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#0066CC] shrink-0" />
          <span>
            Paket Dipilih: <strong>{selectedPackage?.name}</strong>
          </span>
        </span>
        <span className="inline-flex items-center gap-1.5 font-mono text-amber-700 dark:text-amber-400 font-semibold bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/30 shrink-0">
          <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>Durasi Paket: {selectedPackage?.duration}</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
        {/* Date Selection & Info */}
        <div className="flex flex-col gap-3">
          <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-widest flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#0066CC]" />
            Tanggal Rencana Acara:
          </label>
          <input
            type="date"
            value={selectedDate}
            min={todayStr}
            onChange={(e) => onSelectDate(e.target.value)}
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC] text-zinc-900 dark:text-zinc-100 p-4 rounded-xl font-mono text-sm focus:outline-none transition-colors"
          />

          {/* Date Status Messages */}
          {selectedDate && selectedDate < todayStr && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-300">
              <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-rose-900 dark:text-rose-200 uppercase tracking-wider text-[11px] font-mono">
                  Tanggal Sudah Lewat
                </span>
                <p className="text-rose-700 dark:text-rose-300 font-light">
                  Tanggal {formatDate(selectedDate)} sudah berada di masa lalu. Silakan pilih tanggal hari ini atau tanggal yang akan datang.
                </p>
              </div>
            </div>
          )}

          {selectedDate && selectedDate >= todayStr && dateInfo.status === 'blocked' && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-300">
              <Lock className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-rose-900 dark:text-rose-200 uppercase tracking-wider text-[11px] font-mono">
                  Tanggal Dikunci / Libur Studio
                </span>
                <p className="text-rose-700 dark:text-rose-300 font-light">
                  {dateInfo.notes ? `Keterangan: "${dateInfo.notes}"` : 'Pemesanan jadwal sesi foto ditutup pada tanggal ini.'} Silakan pilih tanggal lain.
                </p>
              </div>
            </div>
          )}

          {selectedDate && selectedDate >= todayStr && dateInfo.status === 'booked' && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-300">
              <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-rose-900 dark:text-rose-200 uppercase tracking-wider text-[11px] font-mono">
                  Tanggal Terisi Penuh (Booked)
                </span>
                <p className="text-rose-700 dark:text-rose-300 font-light">
                  Jadwal pada tanggal {formatDate(selectedDate)} sudah terisi penuh. Silakan pilih tanggal lain.
                </p>
              </div>
            </div>
          )}

          {selectedDate && selectedDate >= todayStr && dateInfo.status === 'available' && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 font-light">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                Tanggal {formatDate(selectedDate)} <strong>Tersedia (Available)</strong>!
              </span>
            </div>
          )}
        </div>

        {/* Time Selection */}
        <div className="flex flex-col gap-3">
          <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-widest flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#0066CC]" />
            Tentukan Jam Acara (Ditentukan oleh Client):
          </label>

          {selectedService?.slug === 'wedding' && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs text-amber-900 dark:text-amber-300">
              <span>
                <strong>Kuota Wedding Khusus:</strong> Maksimal 2 reservasi per hari.
              </span>
              <span className="font-mono text-[10px] bg-amber-500/20 px-2 py-0.5 rounded text-amber-700 dark:text-amber-400 font-medium shrink-0 self-start sm:self-auto">
                Slot Tersedia
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-zinc-600 dark:text-zinc-400">Jam Mulai Sesi:</span>
                <span className="text-[#0066CC] dark:text-amber-400 font-semibold">{getTimeOfDayLabel(startTime)}</span>
              </div>
              <input
                type="time"
                value={startTime}
                onChange={(e) => onSelectStartTime(e.target.value)}
                className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC] text-zinc-900 dark:text-zinc-100 p-3 rounded-xl font-mono text-sm focus:outline-none transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-zinc-600 dark:text-zinc-400">Jam Selesai (Otomatis):</span>
                <span className="text-amber-700 dark:text-amber-400 font-semibold">{getTimeOfDayLabel(endTime)}</span>
              </div>
              <input
                type="time"
                disabled
                readOnly
                value={endTime}
                className="bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 text-amber-700 dark:text-amber-400 font-semibold p-3 rounded-xl font-mono text-sm cursor-not-allowed opacity-90"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 pt-2">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">
              Pilihan Jam Mulai Populer (Format 24 Jam / WIB):
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {['07:00', '08:00', '09:00', '10:00', '13:00', '14:00', '15:00', '18:00', '19:00'].map((tStr) => (
                <button
                  key={tStr}
                  type="button"
                  onClick={() => onSelectStartTime(tStr)}
                  className={`px-2.5 py-1.5 text-xs font-mono rounded-lg border transition-colors flex items-center gap-1 cursor-pointer ${
                    startTime === tStr
                      ? 'bg-[#0066CC] border-[#0066CC] text-white font-bold shadow-sm'
                      : 'bg-zinc-100 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span>{tStr}</span>
                  <span
                    className={`text-[9px] uppercase font-normal ${
                      startTime === tStr ? 'text-blue-100 dark:text-amber-200' : 'text-zinc-500'
                    }`}
                  >
                    ({getTimeOfDayLabel(tStr)})
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col gap-1 text-xs text-zinc-700 dark:text-zinc-300 mt-1">
            <div className="flex items-center justify-between">
              <span className="text-zinc-600 dark:text-zinc-400 font-medium">Rentang Jam Acara:</span>
              <span className="font-mono text-[#0066CC] dark:text-amber-400 font-bold">
                {startTime} WIB ({getTimeOfDayLabel(startTime)}) s/d {endTime} WIB ({getTimeOfDayLabel(endTime)})
              </span>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono italic">
              Catatan: Jam Selesai ({endTime} WIB) otomatis disesuaikan dengan durasi paket {selectedPackage?.name} (
              {selectedPackage?.duration}).
            </span>
          </div>

          {conflict.hasConflict && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/80 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-200 mt-1">
              <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold uppercase tracking-wider text-[11px] font-mono text-rose-700 dark:text-rose-300">
                  JADWAL BENTROK / TIDAK TERSEDIA
                </span>
                <p className="text-rose-700 dark:text-rose-200 font-light">{conflict.reason}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

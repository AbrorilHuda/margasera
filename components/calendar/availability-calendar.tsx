'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info, CheckCircle2, AlertCircle, XCircle, Slash } from 'lucide-react';
import { MOCK_AVAILABILITY } from '@/lib/mock-data';
import { AvailabilityStatus } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export function AvailabilityCalendar() {
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(7); // 0-indexed: 7 = August 2026
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>('2026-08-20');

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  // Days in selected month math
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const totalDays = getDaysInMonth(currentYear, currentMonth);
  const startDayOffset = getFirstDayOfMonth(currentYear, currentMonth);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Helper to look up status for a YYYY-MM-DD string
  const getStatusForDate = (dateStr: string): { status: AvailabilityStatus; notes?: string } => {
    const found = MOCK_AVAILABILITY.find((a) => a.date === dateStr);
    if (found) {
      return { status: found.status, notes: found.notes };
    }
    // Default mock behavior for demonstration
    const day = parseInt(dateStr.split('-')[2], 10);
    if (day % 7 === 0) return { status: 'booked', notes: 'Sesi Foto Penuh' };
    if (day % 5 === 0) return { status: 'almost_full', notes: 'Sisa 1 Slot Sore' };
    if (day % 11 === 0) return { status: 'blocked', notes: 'Jadwal Libur Studio' };
    return { status: 'available', notes: 'Tanggal Tersedia untuk Booking' };
  };

  const selectedDateInfo = selectedDateStr ? getStatusForDate(selectedDateStr) : null;

  return (
    <div className="w-full max-w-5xl mx-auto py-12 px-6">
      {/* Calendar Header Card */}
      <div className="bg-zinc-950 border border-zinc-800 p-6 md:p-10">
        {/* Top Month Navigation */}
        <div className="flex items-center justify-between pb-8 border-b border-zinc-900">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-6 h-6 text-[#0066CC]" />
            <h3 className="font-serif-editorial text-3xl md:text-4xl text-zinc-100 font-light">
              {monthNames[currentMonth]} {currentYear}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-2.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-[#0066CC] hover:border-[#0066CC]/50 transition-colors"
              aria-label="Bulan Sebelumnya"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-[#0066CC] hover:border-[#0066CC]/50 transition-colors"
              aria-label="Bulan Selanjutnya"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Legend Status Bar */}
        <div className="py-6 flex items-center justify-center gap-6 flex-wrap border-b border-zinc-900 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full status-available" />
            <span>Available (Tersedia)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full status-almost_full" />
            <span>Almost Full (Terbatas)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full status-booked" />
            <span>Booked (Terisi)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full status-blocked" />
            <span>Blocked (Tidak Tersedia)</span>
          </div>
        </div>

        {/* Calendar Grid Header (Days of week) */}
        <div className="grid grid-cols-7 text-center pt-6 pb-4 text-xs font-semibold tracking-widest uppercase text-[#0066CC] border-b border-zinc-900">
          {daysOfWeek.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* Calendar Grid Cells */}
        <div className="grid grid-cols-7 gap-2 pt-4">
          {/* Empty padding cells for start of month */}
          {Array.from({ length: startDayOffset }).map((_, i) => (
            <div key={`empty-${i}`} className="h-20 md:h-24 opacity-0" />
          ))}

          {/* Days of current month */}
          {Array.from({ length: totalDays }).map((_, i) => {
            const dayNum = i + 1;
            const formattedDayStr = String(dayNum).padStart(2, '0');
            const formattedMonthStr = String(currentMonth + 1).padStart(2, '0');
            const dateStr = `${currentYear}-${formattedMonthStr}-${formattedDayStr}`;
            const { status } = getStatusForDate(dateStr);
            const isSelected = selectedDateStr === dateStr;

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDateStr(dateStr)}
                className={`relative h-20 md:h-24 p-2 border flex flex-col justify-between items-start transition-all duration-300 group ${
                  isSelected
                    ? 'border-[#0066CC] bg-[#0066CC]/15 shadow-[0_0_20px_rgba(0,102,204,0.3)]'
                    : 'border-zinc-800/80 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900'
                }`}
              >
                <span className={`text-sm font-semibold ${isSelected ? 'text-[#0066CC] font-bold' : 'text-zinc-300'}`}>
                  {dayNum}
                </span>

                {/* Status Dot Pill */}
                <div className="w-full flex items-center justify-between mt-auto">
                  <span className={`w-2.5 h-2.5 rounded-full status-${status}`} />
                  <span className="text-[10px] text-zinc-500 uppercase tracking-tighter hidden md:inline">
                    {status.replace('_', ' ')}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Information & Action Card */}
      <AnimatePresence mode="wait">
        {selectedDateStr && selectedDateInfo && (
          <motion.div
            key={selectedDateStr}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="mt-8 p-6 md:p-8 bg-zinc-900 border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="flex items-start gap-4">
              <div className="mt-1">
                {selectedDateInfo.status === 'available' && <CheckCircle2 className="w-6 h-6 text-emerald-400" />}
                {selectedDateInfo.status === 'almost_full' && <AlertCircle className="w-6 h-6 text-[#0066CC]" />}
                {selectedDateInfo.status === 'booked' && <XCircle className="w-6 h-6 text-rose-500" />}
                {selectedDateInfo.status === 'blocked' && <Slash className="w-6 h-6 text-zinc-500" />}
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-[#0066CC] font-semibold tracking-widest uppercase">
                  Status Tanggal Dipilih
                </span>
                <h4 className="font-serif-editorial text-2xl text-zinc-100 font-light mt-0.5">
                  {formatDate(selectedDateStr)}
                </h4>
                <p className="text-xs text-zinc-400 font-light mt-1">
                  {selectedDateInfo.notes}
                </p>
              </div>
            </div>

            {/* Action CTA Button according to status */}
            <div>
              {selectedDateInfo.status === 'available' && (
                <Link
                  href={`/booking?date=${selectedDateStr}`}
                  className="px-8 py-3.5 bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-semibold tracking-widest uppercase transition-colors shadow-[0_0_20px_rgba(0,102,204,0.3)] block text-center"
                >
                  Pesan Tanggal Ini (Book Date)
                </Link>
              )}
              {selectedDateInfo.status === 'almost_full' && (
                <Link
                  href={`/booking?date=${selectedDateStr}`}
                  className="px-8 py-3.5 bg-[#0052A3] hover:bg-[#003D7A] text-white text-xs font-semibold tracking-widest uppercase transition-colors shadow-[0_0_20px_rgba(0,82,163,0.3)] block text-center"
                >
                  Ambil Slot Terakhir
                </Link>
              )}
              {selectedDateInfo.status === 'booked' && (
                <button
                  disabled
                  className="px-8 py-3.5 bg-zinc-800 text-zinc-500 text-xs font-semibold tracking-widest uppercase cursor-not-allowed border border-zinc-700"
                >
                  Tanggal Sudah Penuh (Booked)
                </button>
              )}
              {selectedDateInfo.status === 'blocked' && (
                <button
                  disabled
                  className="px-8 py-3.5 bg-zinc-800 text-zinc-500 text-xs font-semibold tracking-widest uppercase cursor-not-allowed border border-zinc-700"
                >
                  Studio Tidak Beroperasi
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

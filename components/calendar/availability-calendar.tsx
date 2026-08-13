'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info, CheckCircle2, AlertCircle, XCircle, Slash, Loader2 } from 'lucide-react';
import { getAvailability } from '@/lib/actions/availability';
import { Availability, AvailabilityStatus } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export function AvailabilityCalendar() {
  const now = new Date();
  const [currentYear, setCurrentYear] = useState<number>(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(now.getMonth());
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [availabilityData, setAvailabilityData] = useState<Availability[]>([]);
  const [isLoadingMonth, setIsLoadingMonth] = useState(false);

  const fetchMonth = useCallback(async (year: number, month: number) => {
    setIsLoadingMonth(true);
    const yearMonth = `${year}-${String(month + 1).padStart(2, '0')}`;
    const data = await getAvailability(yearMonth);
    setAvailabilityData(data);
    setIsLoadingMonth(false);
  }, []);

  useEffect(() => {
    fetchMonth(currentYear, currentMonth);
  }, [currentYear, currentMonth, fetchMonth]);

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

  // Helper to look up status and slot details for a YYYY-MM-DD string
  const getStatusForDate = (dateStr: string): { 
    status: AvailabilityStatus; 
    notes?: string;
    weddingSlots: Array<{ id: string; name: string; startTime: string; endTime: string; timeRange: string; isBooked: boolean; bookedBy?: string }>;
    bookedTimeSlots?: Array<{ startTime: string; endTime: string; serviceCategory: string }>;
  } => {
    const found = availabilityData.find((a) => {
      if (!a.date) return false;
      return a.date.split('T')[0] === dateStr.split('T')[0];
    });
    
    // Default wedding slots structure
    const defaultWeddingSlots = [
      { id: 'w1', name: 'Sesi 1 (Pagi / Siang)', startTime: '08:00', endTime: '14:00', timeRange: '08:00 - 14:00 WIB', isBooked: false },
      { id: 'w2', name: 'Sesi 2 (Sore / Malam)', startTime: '15:00', endTime: '21:00', timeRange: '15:00 - 21:00 WIB', isBooked: false },
    ];

    if (found) {
      return { 
        status: found.status, 
        notes: found.notes,
        weddingSlots: found.weddingSlots || defaultWeddingSlots,
        bookedTimeSlots: found.bookedTimeSlots,
      };
    }

    // Tanggal tidak ada di database = available
    return { 
      status: 'available' as AvailabilityStatus, 
      notes: undefined,
      weddingSlots: defaultWeddingSlots,
    };
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
        <div className={`grid grid-cols-7 gap-1 sm:gap-2 pt-4 relative transition-opacity duration-200 ${isLoadingMonth ? 'opacity-40 pointer-events-none' : ''}`}>
          {isLoadingMonth && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <Loader2 className="w-8 h-8 text-[#0066CC] animate-spin" />
            </div>
          )}
          {/* Empty padding cells for start of month */}
          {Array.from({ length: startDayOffset }).map((_, i) => (
            <div key={`empty-${i}`} className="h-16 sm:h-22 md:h-26 opacity-0" />
          ))}

          {/* Days of current month */}
          {Array.from({ length: totalDays }).map((_, i) => {
            const dayNum = i + 1;
            const formattedDayStr = String(dayNum).padStart(2, '0');
            const formattedMonthStr = String(currentMonth + 1).padStart(2, '0');
            const dateStr = `${currentYear}-${formattedMonthStr}-${formattedDayStr}`;
            const dateData = getStatusForDate(dateStr);
            const status = dateData.status;
            const isSelected = selectedDateStr === dateStr;

            // Calculate remaining wedding slots for preview
            const bookedWeddingCount = dateData.weddingSlots.filter(s => s.isBooked).length;
            const weddingSlotSummary = status === 'blocked' ? 'Blocked' : status === 'booked' ? 'Full' : `${2 - bookedWeddingCount}/2 Wed`;

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDateStr(dateStr)}
                className={`relative h-16 sm:h-22 md:h-26 p-1 sm:p-2 border flex flex-col justify-between items-start transition-all duration-300 group rounded-lg ${
                  isSelected
                    ? 'border-[#0066CC] bg-[#0066CC]/20 shadow-[0_0_15px_rgba(0,102,204,0.35)]'
                    : 'border-zinc-800/80 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900'
                }`}
              >
                <div className="w-full flex items-center justify-between">
                  <span className={`text-xs sm:text-sm font-semibold ${isSelected ? 'text-[#0066CC] font-bold' : 'text-zinc-300'}`}>
                    {dayNum}
                  </span>
                  <span className="text-[8px] sm:text-[9px] text-amber-400/90 font-mono tracking-tighter truncate max-w-[45px] sm:max-w-none">
                    {weddingSlotSummary}
                  </span>
                </div>

                {/* Status Dot Pill */}
                <div className="w-full flex items-center justify-between mt-auto">
                  <span className={`w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full status-${status}`} />
                  <span className="text-[9px] sm:text-[10px] text-zinc-500 uppercase tracking-tighter hidden md:inline">
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
            className="mt-8 p-6 md:p-8 bg-zinc-900 border border-zinc-800 flex flex-col gap-6"
          >
            {/* Top Date Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-zinc-800/80 gap-4">
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  {selectedDateInfo.status === 'available' && <CheckCircle2 className="w-6 h-6 text-emerald-400" />}
                  {selectedDateInfo.status === 'almost_full' && <AlertCircle className="w-6 h-6 text-[#0066CC]" />}
                  {selectedDateInfo.status === 'booked' && <XCircle className="w-6 h-6 text-rose-500" />}
                  {selectedDateInfo.status === 'blocked' && <Slash className="w-6 h-6 text-zinc-500" />}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-[#0066CC] font-semibold tracking-widest uppercase">
                    Detail Jadwal & Slot Tanggal
                  </span>
                  <h4 className="font-serif-editorial text-2xl text-zinc-100 font-light mt-0.5">
                    {formatDate(selectedDateStr)}
                  </h4>
                  <p className="text-xs text-zinc-400 font-light mt-1">
                    {selectedDateInfo.notes}
                  </p>
                </div>
              </div>

              <div>
                {selectedDateInfo.status !== 'blocked' && selectedDateInfo.status !== 'booked' ? (
                  <Link
                    href={`/booking?date=${selectedDateStr}`}
                    className="px-6 py-3 bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-semibold tracking-widest uppercase transition-colors shadow-[0_0_20px_rgba(0,102,204,0.3)] block text-center"
                  >
                    Pesan Tanggal Ini
                  </Link>
                ) : (
                  <button
                    disabled
                    className="px-6 py-3 bg-zinc-800 text-zinc-500 text-xs font-semibold tracking-widest uppercase cursor-not-allowed border border-zinc-700 block text-center"
                  >
                    Slot Tanggal Tidak Tersedia
                  </button>
                )}
              </div>
            </div>

            {/* Time Slot Details Breakdown Grid or Blocked Notice */}
            {selectedDateInfo.status !== 'blocked' && selectedDateInfo.status !== 'booked' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* WEDDING SLOTS BREAKDOWN (MAX 2 PER DAY) */}
                <div className="bg-zinc-950/80 border border-zinc-800/80 p-5 rounded">
                  <div className="flex items-center justify-between mb-3 border-b border-zinc-800/60 pb-2">
                    <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                      💍 Kuota Wedding (Max 2 Booking/Hari)
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {2 - selectedDateInfo.weddingSlots.filter(s => s.isBooked).length} dari 2 Slot Tersedia
                    </span>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Client bebas menentukan Jam Acara (Jam Mulai & Selesai). Setiap hari dibatasi maksimal 2 booking tempat pernikahan.
                    </p>

                    {selectedDateInfo.weddingSlots.map((ws, idx) => (
                      <div
                        key={ws.id}
                        className={`p-3 border flex items-center justify-between transition-colors ${
                          ws.isBooked
                            ? 'border-rose-900/40 bg-rose-950/10 text-zinc-500'
                            : 'border-emerald-800/50 bg-emerald-950/20 text-zinc-200'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-zinc-200">
                            {ws.isBooked ? `Booking Wedding #${idx + 1}` : `Slot Wedding #${idx + 1} Available`}
                          </span>
                          <span className="text-[11px] text-amber-400/90 font-mono mt-0.5">
                            {ws.isBooked ? `Jam Acara: ${ws.timeRange}` : 'Bebas Pilih Jam (Ditentukan Client)'}
                          </span>
                        </div>

                        {ws.isBooked ? (
                          <span className="px-2.5 py-1 bg-rose-950/60 text-rose-400 border border-rose-800/50 text-[10px] uppercase tracking-wider font-semibold">
                            Terisi {ws.bookedBy ? `(${ws.bookedBy})` : ''}
                          </span>
                        ) : (
                          <Link
                            href={`/booking?date=${selectedDateStr}&serviceId=s-wedding`}
                            className="px-3 py-1.5 bg-[#0066CC] hover:bg-[#0052A3] text-white text-[10px] font-semibold uppercase tracking-wider transition-colors"
                          >
                            Isi Jam Acara
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* NON-WEDDING / FLEKSIBEL SLOTS BREAKDOWN */}
                <div className="bg-zinc-950/80 border border-zinc-800/80 p-5 rounded">
                  <div className="flex items-center justify-between mb-3 border-b border-zinc-800/60 pb-2">
                    <span className="text-xs font-semibold text-[#0066CC] uppercase tracking-wider">
                      📷 Sesi Non-Wedding (Pre-Wedding, Portrait, dll.)
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      Sesuai Durasi Paket
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 text-xs text-zinc-300 font-light">
                    <p className="text-[11px] text-zinc-400 leading-relaxed mb-1">
                      Untuk sesi selain pernikahan, Anda dapat menentukan jam mulai sesuai pilihan paket pada halaman booking.
                    </p>

                    {selectedDateInfo.bookedTimeSlots && selectedDateInfo.bookedTimeSlots.length > 0 ? (
                      <div className="mt-1 flex flex-col gap-1.5">
                        <span className="text-[10px] text-rose-400 font-semibold uppercase tracking-wider">Jam Terisi Hari Ini:</span>
                        {selectedDateInfo.bookedTimeSlots.map((bts, idx) => (
                          <div key={idx} className="p-2 bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400 flex items-center justify-between">
                            <span>{bts.startTime} - {bts.endTime} WIB</span>
                            <span className="uppercase text-[9px] text-amber-400">({bts.serviceCategory})</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 text-emerald-300 text-[11px]">
                        ✔ Bebas memilih jam sesi foto (Pagi, Siang, atau Sore).
                      </div>
                    )}

                    <Link
                      href={`/booking?date=${selectedDateStr}&serviceId=s-prewedding`}
                      className="mt-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-[11px] font-semibold text-center uppercase tracking-wider transition-colors"
                    >
                      Pesan Sesi Non-Wedding
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-zinc-950 border border-zinc-800/80 rounded-lg flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-rose-400 font-mono flex items-center gap-2">
                  {selectedDateInfo.status === 'blocked' ? '🔒 Tanggal Dikunci / Libur Studio' : '⛔ Tanggal Terisi Penuh (Booked)'}
                </span>
                <p className="text-xs text-zinc-300 font-light leading-relaxed">
                  {selectedDateInfo.notes
                    ? `Keterangan: "${selectedDateInfo.notes}"`
                    : 'Pemesanan jadwal sesi foto pada tanggal ini sedang ditutup atau sudah terisi penuh.'}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

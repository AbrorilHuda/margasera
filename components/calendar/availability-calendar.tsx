'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Slash,
  Loader2,
  ArrowRight,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { getAvailability } from '@/lib/actions/availability';
import { Availability, AvailabilityStatus } from '@/lib/types';
import { formatDate } from '@/lib/utils';

// Helper untuk mengacak/menyensor nama customer demi privasi (Contoh: Abroril Huda -> Ab*** Hu***)
function censorCustomerName(name?: string): string {
  if (!name || name.trim() === '') return 'Pe*** (Client)';
  const parts = name.trim().split(/\s+/);
  return parts
    .map((p) => {
      if (p.length <= 1) return p + '***';
      if (p.length === 2) return p[0] + '***';
      if (p.length === 3) return p.slice(0, 2) + '*';
      return p.slice(0, 2) + '***';
    })
    .join(' ');
}

export function AvailabilityCalendar() {
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

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

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

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

  const handleJumpToToday = () => {
    const t = new Date();
    setCurrentYear(t.getFullYear());
    setCurrentMonth(t.getMonth());
    setSelectedDateStr(todayStr);
  };

  const isViewingCurrentMonth = currentYear === now.getFullYear() && currentMonth === now.getMonth();

  const getStatusForDate = useCallback((dateStr: string): {
    status: AvailabilityStatus;
    notes?: string;
    weddingSlots: Array<{ id: string; name: string; startTime: string; endTime: string; timeRange: string; isBooked: boolean; bookedBy?: string }>;
    bookedTimeSlots?: Array<{ startTime: string; endTime: string; serviceCategory: string; customerName?: string; bookingCode?: string }>;
  } => {
    const found = availabilityData.find((a) => {
      if (!a.date) return false;
      return a.date.split('T')[0] === dateStr.split('T')[0];
    });

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

    return {
      status: 'available' as AvailabilityStatus,
      notes: undefined,
      weddingSlots: defaultWeddingSlots,
    };
  }, [availabilityData]);

  const monthStats = useMemo(() => {
    let available = 0;
    let almost_full = 0;
    let booked = 0;
    let blocked = 0;

    for (let d = 1; d <= totalDays; d++) {
      const formattedDayStr = String(d).padStart(2, '0');
      const formattedMonthStr = String(currentMonth + 1).padStart(2, '0');
      const dStr = `${currentYear}-${formattedMonthStr}-${formattedDayStr}`;
      const info = getStatusForDate(dStr);
      if (info.status === 'available') available++;
      else if (info.status === 'almost_full') almost_full++;
      else if (info.status === 'booked') booked++;
      else if (info.status === 'blocked') blocked++;
    }
    return { available, almost_full, booked, blocked };
  }, [currentYear, currentMonth, totalDays, getStatusForDate]);

  const selectedDateInfo = selectedDateStr ? getStatusForDate(selectedDateStr) : null;

  return (
    <div className="w-full max-w-5xl mx-auto py-4 sm:py-10 px-2.5 sm:px-6">
      {/* Calendar Header Container */}
      <div className="bg-zinc-950/90 border border-zinc-800/80 rounded-2xl sm:rounded-3xl p-3.5 sm:p-8 md:p-10 shadow-2xl backdrop-blur-2xl">
        {/* Month Header Navigation */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 sm:pb-8 border-b border-zinc-800/60 gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#0066CC]/10 border border-[#0066CC]/25 flex items-center justify-center text-[#0066CC] shadow-[0_0_15px_rgba(0,102,204,0.15)] shrink-0">
              <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] font-mono text-[#0066CC] uppercase tracking-widest font-semibold block">
                Studio Availability
              </span>
              <h3 className="font-serif-editorial text-2xl sm:text-4xl text-zinc-100 font-light tracking-wide mt-0.5">
                {monthNames[currentMonth]} {currentYear}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {!isViewingCurrentMonth && (
              <button
                onClick={handleJumpToToday}
                className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#0066CC]" />
                <span>Hari Ini</span>
              </button>
            )}
            <button
              onClick={handlePrevMonth}
              className="p-2 sm:p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-all shadow-sm active:scale-95"
              aria-label="Bulan Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 sm:p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-all shadow-sm active:scale-95"
              aria-label="Bulan Selanjutnya"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Legend Pills Bar */}
        <div className="py-4 flex items-center justify-center gap-2 sm:gap-4 flex-wrap border-b border-zinc-800/60 text-[11px] sm:text-xs font-mono">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span>Tersedia ({monthStats.available})</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
            <span>Slot Terbatas ({monthStats.almost_full})</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300">
            <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
            <span>Penuh ({monthStats.booked})</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-zinc-600" />
            <span>Libur ({monthStats.blocked})</span>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 text-center pt-4 sm:pt-6 pb-2 sm:pb-3 text-[11px] sm:text-xs font-mono font-semibold tracking-wider uppercase text-zinc-400">
          {daysOfWeek.map((day, idx) => (
            <div key={day} className={idx === 0 || idx === 6 ? 'text-amber-400/80' : ''}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className={`grid grid-cols-7 gap-1 sm:gap-2.5 md:gap-3 pt-2 relative transition-opacity duration-300 ${isLoadingMonth ? 'opacity-40 pointer-events-none' : ''}`}>
          {isLoadingMonth && (
            <div className="absolute inset-0 flex items-center justify-center z-20 bg-zinc-950/40 backdrop-blur-md rounded-2xl">
              <Loader2 className="w-8 h-8 text-[#0066CC] animate-spin" />
            </div>
          )}

          {/* Empty padding cells */}
          {Array.from({ length: startDayOffset }).map((_, i) => (
            <div key={`empty-${i}`} className="h-14 sm:h-20 md:h-24 opacity-0 pointer-events-none" />
          ))}

          {/* Days */}
          {Array.from({ length: totalDays }).map((_, i) => {
            const dayNum = i + 1;
            const formattedDayStr = String(dayNum).padStart(2, '0');
            const formattedMonthStr = String(currentMonth + 1).padStart(2, '0');
            const dateStr = `${currentYear}-${formattedMonthStr}-${formattedDayStr}`;
            const dateData = getStatusForDate(dateStr);
            const status = dateData.status;
            const isSelected = selectedDateStr === dateStr;
            const isToday = dateStr === todayStr;
            const isPast = dateStr < todayStr;

            // Sleek minimalist card styling
            let cardBg = 'bg-emerald-950/20 hover:bg-emerald-900/35 border-emerald-800/30 text-emerald-200';
            let dotBg = 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]';
            let statusLabel = 'Tersedia';
            let statusLabelColor = 'text-emerald-400/90';

            if (status === 'almost_full') {
              cardBg = 'bg-amber-950/20 hover:bg-amber-900/35 border-amber-800/30 text-amber-200';
              dotBg = 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]';
              statusLabel = 'Terbatas';
              statusLabelColor = 'text-amber-400/90';
            } else if (status === 'booked') {
              cardBg = 'bg-rose-950/20 hover:bg-rose-900/35 border-rose-900/30 text-rose-300';
              dotBg = 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]';
              statusLabel = 'Penuh';
              statusLabelColor = 'text-rose-400/90';
            } else if (status === 'blocked') {
              cardBg = 'bg-zinc-900/40 border-zinc-800/60 text-zinc-500';
              dotBg = 'bg-zinc-600';
              statusLabel = 'Libur';
              statusLabelColor = 'text-zinc-500';
            }

            if (isSelected) {
              cardBg = 'bg-[#0066CC]/20 border-2 border-[#0066CC] ring-2 sm:ring-4 ring-[#0066CC]/20 shadow-[0_8px_25px_rgba(0,102,204,0.35)] scale-[1.02] sm:scale-[1.03] z-10';
              dotBg = 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]';
              statusLabelColor = 'text-white font-semibold';
            }

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDateStr(dateStr)}
                className={`relative h-14 sm:h-20 md:h-24 p-1.5 sm:p-3 border rounded-xl sm:rounded-2xl flex flex-col justify-between items-start transition-all duration-300 group text-left ${cardBg} ${isPast && !isSelected ? 'opacity-50 hover:opacity-80' : ''
                  }`}
              >
                {/* Date Header */}
                <div className="w-full flex items-center justify-between">
                  <span className={`font-mono text-xs sm:text-base font-medium ${isSelected ? 'text-white font-bold' : 'text-zinc-200'}`}>
                    {dayNum}
                  </span>

                  {isToday && (
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#0066CC] ring-2 ring-[#0066CC]/40 animate-ping" title="Hari Ini" />
                  )}
                </div>

                {/* Status Dot & Label (Dot only on small screens to prevent overflow, text on sm+) */}
                <div className="w-full flex items-center justify-start sm:justify-between mt-auto">
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <span className={`w-2 h-2 sm:w-2 sm:h-2 rounded-full shrink-0 ${dotBg}`} />
                    <span className={`hidden sm:inline text-[10px] sm:text-[11px] font-mono tracking-tight ${statusLabelColor}`}>
                      {statusLabel}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Information Card */}
      <AnimatePresence mode="wait">
        {selectedDateStr && selectedDateInfo && (
          <motion.div
            key={selectedDateStr}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="mt-6 p-4 sm:p-8 bg-zinc-950/90 border border-zinc-800/80 rounded-2xl sm:rounded-3xl flex flex-col gap-6 shadow-2xl backdrop-blur-2xl"
          >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-zinc-800/60 gap-4">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="mt-1 shrink-0">
                  {selectedDateInfo.status === 'available' && (
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  )}
                  {selectedDateInfo.status === 'almost_full' && (
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  )}
                  {selectedDateInfo.status === 'booked' && (
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                      <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  )}
                  {selectedDateInfo.status === 'blocked' && (
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
                      <Slash className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  )}
                </div>

                <div>
                  <span className="text-[10px] text-[#0066CC] font-mono font-semibold tracking-widest uppercase">
                    Detail Tanggal Terpilih
                  </span>
                  <h4 className="font-serif-editorial text-xl sm:text-3xl text-zinc-100 font-light mt-0.5">
                    {formatDate(selectedDateStr)}
                  </h4>
                  {selectedDateInfo.notes && (
                    <p className="text-xs text-amber-300 font-light mt-1 bg-amber-950/30 border border-amber-900/40 px-3 py-1.5 rounded-xl inline-block">
                      💬 {selectedDateInfo.notes}
                    </p>
                  )}
                </div>
              </div>

              <div>
                {selectedDateInfo.status !== 'blocked' && selectedDateInfo.status !== 'booked' ? (
                  <Link
                    href={`/booking?date=${selectedDateStr}`}
                    className="w-full sm:w-auto px-6 py-3 bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-semibold uppercase tracking-wider rounded-xl sm:rounded-2xl transition-all shadow-[0_0_20px_rgba(0,102,204,0.3)] flex items-center justify-center gap-2"
                  >
                    <span>Pesan Tanggal Ini</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <button
                    disabled
                    className="w-full sm:w-auto px-6 py-3 bg-zinc-900 text-zinc-500 text-xs font-semibold uppercase tracking-wider cursor-not-allowed border border-zinc-800 rounded-xl sm:rounded-2xl"
                  >
                    Tanggal Tidak Tersedia
                  </button>
                )}
              </div>
            </div>

            {/* Time Slot Details */}
            {selectedDateInfo.status !== 'blocked' && selectedDateInfo.status !== 'booked' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Wedding Slots (Max 2 Slot / Hari) */}
                <div className="bg-zinc-900/50 border border-zinc-800/60 p-5 rounded-2xl flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2">
                    <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span>💍</span>
                      <span>Kuota Wedding (Max 2 Slot/Hari)</span>
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {2 - selectedDateInfo.weddingSlots.filter((s) => s.isBooked).length}/2 Available
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    {selectedDateInfo.weddingSlots.map((ws, idx) => (
                      <div
                        key={ws.id}
                        className={`p-3 border rounded-xl flex items-center justify-between transition-colors ${
                          ws.isBooked
                            ? 'border-rose-900/30 bg-rose-950/20 text-zinc-400'
                            : 'border-emerald-800/30 bg-emerald-950/15 text-zinc-200'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-zinc-200 flex items-center gap-2">
                            <span>{ws.isBooked ? `Wedding Slot #${idx + 1}` : `Slot Wedding #${idx + 1} Available`}</span>
                            {ws.isBooked && (
                              <span className="text-[10px] font-mono text-amber-300 font-semibold">
                                👤 Pemesan: {censorCustomerName(ws.bookedBy || 'Klien Wedding')}
                              </span>
                            )}
                          </span>
                          <span className="text-[11px] text-amber-400/90 font-mono mt-0.5">
                            ⏱️ {ws.isBooked ? `Jam Sesi: ${ws.timeRange}` : 'Bebas Pilih Jam (Ditentukan Klien)'}
                          </span>
                        </div>

                        {ws.isBooked ? (
                          <span className="px-2.5 py-1 bg-rose-950/60 text-rose-400 border border-rose-800/40 text-[10px] uppercase font-semibold rounded-lg">
                            Terisi
                          </span>
                        ) : (
                          <Link
                            href={`/booking?date=${selectedDateStr}&serviceId=wedding`}
                            className="px-3 py-1.5 bg-[#0066CC] hover:bg-[#0052A3] text-white text-[10px] font-semibold uppercase rounded-lg transition-colors"
                          >
                            Pilih
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Non-Wedding / Studio Slots (Maksimal 6 Booking / Hari) */}
                {(() => {
                  const bookedTimeSlots = selectedDateInfo.bookedTimeSlots || [];
                  const bookedCount = bookedTimeSlots.length;
                  const maxNonWedding = 6;
                  const remainingNonWedding = Math.max(0, maxNonWedding - bookedCount);

                  return (
                    <div className="bg-zinc-900/50 border border-zinc-800/60 p-5 rounded-2xl flex flex-col gap-3">
                      <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2">
                        <span className="text-xs font-semibold text-[#0066CC] uppercase tracking-wider flex items-center gap-1.5">
                          <span>📷</span>
                          <span>Sesi Studio Non-Wedding</span>
                        </span>
                        <span className="text-[10px] text-zinc-300 font-mono bg-zinc-950 px-2 py-0.5 rounded-md border border-zinc-800">
                          {bookedCount}/{maxNonWedding} Terisi (Max {maxNonWedding}/Hari)
                        </span>
                      </div>

                      {/* Quota Status Alert */}
                      {bookedCount >= maxNonWedding ? (
                        <div className="p-2.5 bg-rose-950/30 border border-rose-900/40 rounded-xl text-rose-300 text-[11px] font-mono flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          <span>⛔ Kuota Sesi Studio Hari Ini Penuh ({bookedCount}/{maxNonWedding} Slot Terisi).</span>
                        </div>
                      ) : bookedCount >= 4 ? (
                        <div className="p-2.5 bg-amber-950/30 border border-amber-900/40 rounded-xl text-amber-300 text-[11px] font-mono flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>⚠️ Kuota Terbatas! Sisa {remainingNonWedding} Slot Studio Tersedia Hari Ini.</span>
                        </div>
                      ) : (
                        <div className="p-2.5 bg-emerald-950/20 border border-emerald-900/30 rounded-xl text-emerald-300 text-[11px] font-mono flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>✔ Slot Tersedia: Sisa {remainingNonWedding} dari {maxNonWedding} Booking Studio.</span>
                        </div>
                      )}

                      {/* Booked Sessions List with Censored Customer Name, Service & Time */}
                      {bookedTimeSlots.length > 0 ? (
                        <div className="flex flex-col gap-2 mt-1">
                          <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider font-semibold">
                            Daftar Sesi Terjadwal Hari Ini ({bookedCount}):
                          </span>
                          {bookedTimeSlots.map((bts, idx) => (
                            <div
                              key={idx}
                              className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-xl text-[11px] font-mono text-zinc-200 flex items-center justify-between gap-2"
                            >
                              <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-zinc-100 font-semibold text-xs">
                                    👤 {censorCustomerName(bts.customerName || 'Pelanggan Studio')}
                                  </span>
                                  {bts.bookingCode && (
                                    <span className="text-[9px] text-zinc-500 bg-zinc-900 px-1.5 py-0.2 rounded border border-zinc-800">
                                      {bts.bookingCode}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[#0066CC] font-mono text-[10px]">
                                  📷 Layanan: {bts.serviceCategory || 'Photo Studio'}
                                </span>
                              </div>

                              <span className="px-2.5 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/25 rounded-md text-[10px] font-mono whitespace-nowrap">
                                ⏱️ {bts.startTime} - {bts.endTime} WIB
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-zinc-400 font-light italic my-1">
                          Belum ada sesi non-wedding yang terisi di tanggal ini. Bebas memilih jam foto.
                        </p>
                      )}

                      {remainingNonWedding > 0 && (
                        <Link
                          href={`/booking?date=${selectedDateStr}&serviceId=portrait`}
                          className="mt-auto py-3 bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-semibold text-center uppercase tracking-wider rounded-xl transition-all shadow-[0_0_15px_rgba(0,102,204,0.3)] hover:shadow-[0_0_20px_rgba(0,102,204,0.5)] flex items-center justify-center gap-2 cursor-pointer group"
                        >
                          <span className="text-white font-semibold">Pesan Sesi Studio ({remainingNonWedding} Slot Tersisa)</span>
                          <ArrowRight className="w-3.5 h-3.5 text-white group-hover:translate-x-1 transition-transform" />
                        </Link>
                      )}
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="p-6 bg-zinc-900/60 border border-zinc-800 rounded-2xl flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase text-rose-400 font-mono flex items-center gap-2">
                  {selectedDateInfo.status === 'blocked' ? '🔒 Studio Libur / Tanggal Dikunci' : '⛔ Tanggal Terisi Penuh'}
                </span>
                <p className="text-xs text-zinc-400 font-light">
                  {selectedDateInfo.notes
                    ? `Keterangan: "${selectedDateInfo.notes}"`
                    : 'Pemesanan jadwal sesi foto pada tanggal ini sedang ditutup.'} Silakan pilih tanggal lain yang berstatus hijau (Tersedia).
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

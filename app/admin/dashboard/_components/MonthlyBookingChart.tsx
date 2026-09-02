'use client';

import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Calendar,
  Flame,
  Award,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { Booking } from '@/lib/types';

interface MonthlyBookingChartProps {
  bookings: Booking[];
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

export function MonthlyBookingChart({ bookings }: MonthlyBookingChartProps) {
  const currentYear = new Date().getFullYear();

  // Dapatkan daftar tahun unik dari data booking
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    years.add(currentYear);

    bookings.forEach((b) => {
      const dateStr = b.bookingDate || b.createdAt;
      if (dateStr) {
        const y = parseInt(dateStr.substring(0, 4), 10);
        if (!isNaN(y) && y >= 2000 && y <= 2100) {
          years.add(y);
        }
      }
    });

    return Array.from(years).sort((a, b) => b - a);
  }, [bookings, currentYear]);

  // State tahun yang dipilih
  const [selectedYear, setSelectedYear] = useState<number>(availableYears[0] || currentYear);
  const [activeHoverMonth, setActiveHoverMonth] = useState<number | null>(null);

  // Kalkulasi data bulanan untuk tahun terpilih
  const { monthlyData, maxCount, maxRevenue, peakMonth, totalYearBookings, totalYearRevenue, activeMonthCount } = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => ({
      monthIndex: i,
      monthName: MONTH_NAMES[i],
      shortName: MONTH_SHORT[i],
      count: 0,
      revenue: 0,
      confirmedCount: 0,
      completedCount: 0,
      pendingCount: 0,
    }));

    let totalBookings = 0;
    let totalRevenue = 0;

    bookings.forEach((b) => {
      const dateStr = b.bookingDate || b.createdAt;
      if (!dateStr) return;

      const y = parseInt(dateStr.substring(0, 4), 10);
      if (y !== selectedYear) return;

      const m = parseInt(dateStr.substring(5, 7), 10) - 1;
      if (m >= 0 && m < 12) {
        months[m].count += 1;
        months[m].revenue += b.totalPrice || 0;
        totalBookings += 1;
        totalRevenue += b.totalPrice || 0;

        if (b.status === 'confirmed') months[m].confirmedCount += 1;
        else if (b.status === 'completed') months[m].completedCount += 1;
        else if (b.status === 'pending') months[m].pendingCount += 1;
      }
    });

    let maxC = 0;
    let maxR = 0;
    let peak = months[0];
    let activeMonths = 0;

    months.forEach((m) => {
      if (m.count > maxC) {
        maxC = m.count;
        peak = m;
      }
      if (m.revenue > maxR) {
        maxR = m.revenue;
      }
      if (m.count > 0) {
        activeMonths += 1;
      }
    });

    return {
      monthlyData: months,
      maxCount: Math.max(maxC, 1),
      maxRevenue: maxR,
      peakMonth: maxC > 0 ? peak : null,
      totalYearBookings: totalBookings,
      totalYearRevenue: totalRevenue,
      activeMonthCount: activeMonths,
    };
  }, [bookings, selectedYear]);

  const avgPerMonth = activeMonthCount > 0 ? Math.round(totalYearBookings / activeMonthCount) : 0;

  return (
    <div className="p-6 sm:p-8 bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl flex flex-col gap-6 shadow-sm dark:shadow-xl transition-colors">
      {/* Header & Year Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0066CC]/15 text-[#0066CC] flex items-center justify-center font-bold">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-[0.2em] text-[#0066CC] uppercase font-semibold block">
                Statistik &amp; Analitik Booking
              </span>
              <h3 className="font-sans text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Tren &amp; Frekuensi Booking Bulanan
              </h3>
            </div>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-light mt-0.5">
            Grafik distribusi pesanan per bulan dan identifikasi periode terpadat di Margasera Studio.
          </p>
        </div>

        {/* Year Filter Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-xl shadow-2xs">
          <Calendar className="w-4 h-4 text-[#0066CC] shrink-0" />
          <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 font-medium">Tahun:</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-transparent text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none cursor-pointer pr-1"
          >
            {availableYears.map((yr) => (
              <option key={yr} value={yr} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                {yr} {yr === currentYear ? '(Tahun Ini)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Peak Month & Insight Highlight Card */}
      {peakMonth ? (
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-emerald-50/50 dark:from-blue-950/30 dark:via-zinc-900/60 dark:to-emerald-950/20 border border-blue-200/80 dark:border-[#0066CC]/30 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#0066CC] text-white flex items-center justify-center shadow-md shrink-0">
              <Award className="w-6 h-6 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700/60 text-amber-800 dark:text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-600 dark:text-amber-400 fill-amber-500" />
                  Bulan Paling Ramai {selectedYear}
                </span>
              </div>
              <h4 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                {peakMonth.monthName} {selectedYear}
              </h4>
              <span className="text-xs text-zinc-600 dark:text-zinc-400 font-light">
                Mencapai rekor tertinggi dengan <strong>{peakMonth.count} pesanan</strong> ({((peakMonth.count / totalYearBookings) * 100).toFixed(0)}% dari total tahunan).
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 border-t md:border-t-0 md:border-l border-zinc-200 dark:border-zinc-800 pt-3 md:pt-0 md:pl-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider font-semibold">Total Order</span>
              <strong className="text-xl font-extrabold font-mono text-[#0066CC]">{peakMonth.count} Event</strong>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider font-semibold">Omset Bulan Ini</span>
              <strong className="text-xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                {formatCurrency(peakMonth.revenue)}
              </strong>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-center text-xs text-zinc-500">
          Belum ada data pemesanan yang tercatat untuk tahun {selectedYear}.
        </div>
      )}

      {/* Main Interactive Bar Chart */}
      <div className="flex flex-col gap-2 pt-2">
        <div className="h-64 sm:h-72 w-full flex items-end justify-between gap-1.5 sm:gap-3 px-2 pt-8 pb-3 relative border-b border-zinc-200 dark:border-zinc-800">
          {/* Subtle Horizontal Grid lines */}
          <div className="absolute inset-x-0 top-8 border-b border-zinc-100 dark:border-zinc-800/40 pointer-events-none" />
          <div className="absolute inset-x-0 top-1/2 border-b border-zinc-100 dark:border-zinc-800/40 pointer-events-none" />
          <div className="absolute inset-x-0 top-3/4 border-b border-zinc-100 dark:border-zinc-800/40 pointer-events-none" />

          {monthlyData.map((m) => {
            const isPeak = peakMonth && m.count > 0 && m.count === peakMonth.count;
            const heightPercent = m.count > 0 ? Math.max((m.count / maxCount) * 100, 12) : 4;
            const isHovered = activeHoverMonth === m.monthIndex;

            return (
              <div
                key={m.monthIndex}
                onMouseEnter={() => setActiveHoverMonth(m.monthIndex)}
                onMouseLeave={() => setActiveHoverMonth(null)}
                className="flex-1 flex flex-col items-center justify-end h-full relative group cursor-pointer"
              >
                {/* Floating Tooltip Card */}
                {isHovered && (
                  <div className="absolute bottom-full mb-3 z-30 pointer-events-none transition-all">
                    <div className="bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 p-2.5 rounded-xl shadow-xl text-center flex flex-col gap-1 min-w-[130px] border border-zinc-700 dark:border-zinc-200">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0066CC]">
                        {m.monthName} {selectedYear}
                      </span>
                      <div className="text-xs font-bold">
                        {m.count} Pesanan
                      </div>
                      <div className="text-[10px] font-mono text-emerald-400 dark:text-emerald-700 font-semibold">
                        {formatCurrency(m.revenue)}
                      </div>
                      {isPeak && (
                        <span className="mt-0.5 text-[8px] font-mono font-bold bg-amber-400 text-black px-1.5 py-0.2 rounded-full uppercase">
                          ★ Bulan Teramai
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Peak Crown / Badge Indicator above Bar */}
                {isPeak && (
                  <div className="mb-1.5 flex items-center justify-center animate-bounce">
                    <span className="text-[10px] bg-[#0066CC] text-white px-1.5 py-0.2 rounded-full font-mono font-bold shadow-xs">
                      Top
                    </span>
                  </div>
                )}

                {/* Booking count label on top of bar */}
                {m.count > 0 && !isPeak && (
                  <span className={`text-[10px] font-mono font-semibold mb-1 transition-colors ${isHovered ? 'text-[#0066CC]' : 'text-zinc-500 dark:text-zinc-400'
                    }`}>
                    {m.count}
                  </span>
                )}

                {/* Bar Element with Dynamic Height and Visual Gradient */}
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full max-w-[42px] rounded-t-lg transition-all duration-300 relative overflow-hidden ${isPeak
                      ? isHovered
                        ? 'bg-gradient-to-t from-[#0052A3] to-[#0066CC] shadow-lg shadow-[#0066CC]/30 scale-105'
                        : 'bg-gradient-to-t from-[#0066CC] to-[#2b88e6] shadow-md shadow-[#0066CC]/20'
                      : m.count > 0
                        ? isHovered
                          ? 'bg-[#0066CC] scale-105 shadow-md'
                          : 'bg-zinc-300 hover:bg-[#0066CC]/80 dark:bg-zinc-700/80 dark:hover:bg-[#0066CC]/80'
                        : 'bg-zinc-100 dark:bg-zinc-800/40'
                    }`}
                >
                  {/* Subtle top light sheen for peak bar */}
                  {isPeak && (
                    <div className="absolute top-0 inset-x-0 h-1 bg-white/40 rounded-t-lg" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Month Labels on X-Axis */}
        <div className="flex justify-between px-2 text-center text-xs font-mono font-medium">
          {monthlyData.map((m) => {
            const isPeak = peakMonth && m.count > 0 && m.count === peakMonth.count;
            const isHovered = activeHoverMonth === m.monthIndex;

            return (
              <div
                key={m.monthIndex}
                onClick={() => setActiveHoverMonth(m.monthIndex)}
                className={`flex-1 py-1.5 transition-colors cursor-pointer ${isPeak
                    ? 'text-[#0066CC] font-bold'
                    : isHovered
                      ? 'text-zinc-900 dark:text-zinc-100 font-semibold'
                      : 'text-zinc-500 dark:text-zinc-400'
                  }`}
              >
                <span className="hidden sm:inline">{m.shortName}</span>
                <span className="sm:hidden text-[10px]">{m.shortName.substring(0, 1)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-col">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider font-semibold">
            Total Booking {selectedYear}
          </span>
          <strong className="text-base sm:text-lg font-extrabold font-mono text-zinc-900 dark:text-zinc-100 mt-0.5">
            {totalYearBookings} Pesanan
          </strong>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider font-semibold">
            Total Omset {selectedYear}
          </span>
          <strong className="text-base sm:text-lg font-extrabold font-mono text-[#0066CC] mt-0.5">
            {formatCurrency(totalYearRevenue)}
          </strong>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider font-semibold">
            Rata-rata / Bulan Aktif
          </span>
          <strong className="text-base sm:text-lg font-extrabold font-mono text-zinc-900 dark:text-zinc-100 mt-0.5">
            {avgPerMonth} Event
          </strong>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider font-semibold">
            Bulan Terpadat
          </span>
          <strong className="text-base sm:text-lg font-extrabold font-mono text-amber-600 dark:text-amber-400 mt-0.5 truncate">
            {peakMonth ? `${peakMonth.shortName} (${peakMonth.count})` : '-'}
          </strong>
        </div>
      </div>
    </div>
  );
}

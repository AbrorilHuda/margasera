'use client';

import React from 'react';
import {
  Filter,
  Calendar,
  Search,
  Plus,
  SlidersHorizontal,
  ArrowUpDown,
  FileText,
  ListFilter,
  X,
} from 'lucide-react';
import type { Booking, Service } from '@/lib/types';

interface BookingFiltersProps {
  bookings: Booking[];
  services: Service[];
  // Filter states
  bookingStatusFilter: string;
  monthFilter: string;
  serviceFilter: string;
  bookingSort: 'newest' | 'oldest' | 'upcoming_event';
  bookingSearch: string;
  pageSize: number;
  filteredCount: number;
  availableMonths: string[];
  // Setters
  setBookingStatusFilter: (v: string) => void;
  setMonthFilter: (v: string) => void;
  setServiceFilter: (v: string) => void;
  setBookingSort: (v: 'newest' | 'oldest' | 'upcoming_event') => void;
  setBookingSearch: (v: string) => void;
  setPageSize: (v: number) => void;
  // Actions
  onOpenPdfRekap: () => void;
  onOpenAddBooking: () => void;
  formatMonthLabel: (ym: string) => string;
}

const STATUS_TABS = [
  { id: 'all', label: 'Semua' },
  { id: 'pending', label: 'Pending' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
] as const;

export function BookingFilters({
  bookings,
  services,
  bookingStatusFilter,
  monthFilter,
  serviceFilter,
  bookingSort,
  bookingSearch,
  pageSize,
  filteredCount,
  availableMonths,
  setBookingStatusFilter,
  setMonthFilter,
  setServiceFilter,
  setBookingSort,
  setBookingSearch,
  setPageSize,
  onOpenPdfRekap,
  onOpenAddBooking,
  formatMonthLabel,
}: BookingFiltersProps) {
  const statusCounts = React.useMemo(() => {
    const counts = { all: bookings.length, pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
    bookings.forEach((b) => {
      if (b.status in counts) {
        counts[b.status as keyof typeof counts]++;
      }
    });
    return counts;
  }, [bookings]);

  return (
    <div className="p-6 bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800/80 rounded-xl flex flex-col gap-5 shadow-xs dark:shadow-xl backdrop-blur-md">
      {/* Row 1: Status Filters & Main Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 uppercase font-mono tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-[#0066CC]" /> Status:
          </span>
          {STATUS_TABS.map((st) => {
            const count = statusCounts[st.id];
            const isActive = bookingStatusFilter === st.id;
            return (
              <button
                key={st.id}
                onClick={() => setBookingStatusFilter(st.id)}
                className={`px-3.5 py-1.5 text-xs tracking-wide rounded-lg transition-all whitespace-nowrap font-medium flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-[#0066CC] text-white font-semibold shadow-md'
                    : 'bg-zinc-100 dark:bg-zinc-950/80 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-zinc-800'
                }`}
              >
                <span>{st.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${
                    isActive ? 'bg-black/30 text-white' : 'bg-zinc-200 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Action Buttons: Export PDF & Add Booking */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenPdfRekap}
            className="px-3.5 py-2 bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-300 hover:border-zinc-400 dark:border-zinc-700/80 dark:hover:border-zinc-600 text-zinc-800 dark:text-zinc-100 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 shadow-xs hover:shadow-sm cursor-pointer group"
            title="Cetak & Export Rekapitulasi Laporan PDF"
          >
            <div className="w-5 h-5 rounded flex items-center justify-center bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 group-hover:scale-105 transition-transform">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <span>Export PDF</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/60">
              {filteredCount}
            </span>
          </button>

          <button
            onClick={onOpenAddBooking}
            className="px-4 py-2 bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 shadow-sm hover:shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Booking</span>
          </button>
        </div>
      </div>

      {/* Row 2: Secondary Filters & Limit Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800/80">
        {/* MONTH FILTER */}
        <div className="flex items-center gap-2 bg-zinc-100/90 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800/80 px-3 py-2 rounded-lg">
          <Calendar className="w-4 h-4 text-[#0066CC] shrink-0" />
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-[9px] font-mono uppercase text-zinc-500 dark:text-zinc-400 font-semibold">Filter Bulan Acara:</span>
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="bg-transparent text-zinc-900 dark:text-zinc-100 text-xs font-medium focus:outline-none cursor-pointer truncate"
            >
              <option value="all" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Semua Bulan Acara</option>
              {availableMonths.map((ym) => (
                <option key={ym} value={ym} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                  {formatMonthLabel(ym)}
                </option>
              ))}
            </select>
          </div>
          {monthFilter !== 'all' && (
            <button onClick={() => setMonthFilter('all')} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white cursor-pointer" title="Reset Filter Bulan">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* SERVICE FILTER */}
        <div className="flex items-center gap-2 bg-zinc-100/90 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800/80 px-3 py-2 rounded-lg">
          <SlidersHorizontal className="w-4 h-4 text-[#0066CC] shrink-0" />
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-[9px] font-mono uppercase text-zinc-500 dark:text-zinc-400 font-semibold">Filter Layanan:</span>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="bg-transparent text-zinc-900 dark:text-zinc-100 text-xs font-medium focus:outline-none cursor-pointer truncate"
            >
              <option value="all" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Semua Layanan</option>
              {services.map((s) => (
                <option key={s.id} value={s.id} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          {serviceFilter !== 'all' && (
            <button onClick={() => setServiceFilter('all')} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white cursor-pointer" title="Reset Filter Layanan">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* SORT SELECTOR */}
        <div className="flex items-center gap-2 bg-zinc-100/90 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800/80 px-3 py-2 rounded-lg">
          <ArrowUpDown className="w-4 h-4 text-[#0066CC] shrink-0" />
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-[9px] font-mono uppercase text-zinc-500 dark:text-zinc-400 font-semibold">Urutkan Data:</span>
            <select
              value={bookingSort}
              onChange={(e) => setBookingSort(e.target.value as typeof bookingSort)}
              className="bg-transparent text-zinc-900 dark:text-zinc-100 text-xs font-medium focus:outline-none cursor-pointer truncate"
            >
              <option value="newest" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Booking Terbaru</option>
              <option value="upcoming_event" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Jadwal Acara Terdekat</option>
              <option value="oldest" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Booking Terlama</option>
            </select>
          </div>
        </div>

        {/* PAGE SIZE / LIMIT SELECTOR */}
        <div className="flex items-center gap-2 bg-zinc-100/90 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800/80 px-3 py-2 rounded-lg">
          <ListFilter className="w-4 h-4 text-[#0066CC] shrink-0" />
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-[9px] font-mono uppercase text-zinc-500 dark:text-zinc-400 font-semibold">Tampilkan:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="bg-transparent text-zinc-900 dark:text-zinc-100 text-xs font-medium focus:outline-none cursor-pointer truncate"
            >
              <option value={5} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">5 Data per Hal</option>
              <option value={10} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">10 Data per Hal</option>
              <option value={25} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">25 Data per Hal</option>
              <option value={50} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">50 Data per Hal</option>
              <option value={9999} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Semua Data</option>
            </select>
          </div>
        </div>

        {/* SEARCH INPUT */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari Kode, Client, WA..."
            value={bookingSearch}
            onChange={(e) => setBookingSearch(e.target.value)}
            className="w-full h-full bg-zinc-100/90 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-[#0066CC] text-zinc-900 dark:text-zinc-100 pl-9 pr-8 py-2 rounded-lg text-xs focus:outline-none transition-colors placeholder:text-zinc-400"
          />
          {bookingSearch && (
            <button
              onClick={() => setBookingSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

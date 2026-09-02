'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  MoreHorizontal,
} from 'lucide-react';
import type { Booking, Service } from '@/lib/types';
import { BookingFilterBottomSheet } from './BookingFilterBottomSheet';

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
  { id: 'all', label: 'All' },
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
  const [mounted, setMounted] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isMoreActionsOpen, setIsMoreActionsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const statusCounts = React.useMemo(() => {
    const counts = { all: bookings.length, pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
    bookings.forEach((b) => {
      if (b.status in counts) {
        counts[b.status as keyof typeof counts]++;
      }
    });
    return counts;
  }, [bookings]);

  // Active secondary filter counter for mobile badge
  const activeSecondaryFilterCount = React.useMemo(() => {
    let count = 0;
    if (monthFilter !== 'all') count++;
    if (serviceFilter !== 'all') count++;
    if (bookingSort !== 'newest') count++;
    if (pageSize !== 10) count++;
    return count;
  }, [monthFilter, serviceFilter, bookingSort, pageSize]);

  const handleResetSecondaryFilters = () => {
    setMonthFilter('all');
    setServiceFilter('all');
    setBookingSort('newest');
    setPageSize(10);
  };

  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col gap-4 sm:gap-5 shadow-xs dark:shadow-xl">
      {/* =========================================
          MOBILE VIEW (< 768px): PRD Section 11, 12, 13
          ========================================= */}
      <div className="flex md:hidden flex-col gap-3">
        {/* Mobile Row 1: Search + Filter Sheet Button (PRD Section 12) */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search booking..."
              value={bookingSearch}
              onChange={(e) => setBookingSearch(e.target.value)}
              className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-[#0066CC] text-zinc-900 dark:text-zinc-100 pl-9 pr-8 py-2.5 rounded-xl text-xs focus:outline-none transition-colors placeholder:text-zinc-400"
            />
            {bookingSearch && (
              <button
                onClick={() => setBookingSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setIsFilterSheetOpen(true)}
            className={`p-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-semibold transition-all active:scale-95 cursor-pointer ${
              activeSecondaryFilterCount > 0
                ? 'bg-blue-50 dark:bg-blue-950/60 border-[#0066CC] text-[#0066CC]'
                : 'bg-zinc-100 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
            }`}
            title="Filter Booking"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {activeSecondaryFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#0066CC] text-white text-[10px] font-mono flex items-center justify-center">
                {activeSecondaryFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Mobile Row 2: Horizontally Scrollable Status Chips (PRD Section 11) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
          {STATUS_TABS.map((st) => {
            const count = statusCounts[st.id];
            const isActive = bookingStatusFilter === st.id;
            return (
              <button
                key={st.id}
                onClick={() => setBookingStatusFilter(st.id)}
                className={`px-3 py-1.5 text-xs tracking-wide rounded-xl transition-all whitespace-nowrap font-medium flex items-center gap-1.5 shrink-0 active:scale-95 cursor-pointer ${
                  isActive
                    ? 'bg-[#0066CC] text-white font-semibold shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
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

        {/* Mobile Row 3: Action Buttons (PRD Section 13: + New Booking & •••) */}
        <div className="flex items-center gap-2 pt-2 border-t border-zinc-200/70 dark:border-zinc-800/60">
          <button
            onClick={onOpenAddBooking}
            className="flex-1 py-2.5 px-4 bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Booking</span>
          </button>

          <button
            onClick={() => setIsMoreActionsOpen(true)}
            className="p-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-950 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl transition-all active:scale-95 cursor-pointer"
            title="More Actions"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS More Actions Sheet on Mobile (PRD Section 13) — Portaled directly to body */}
      {isMoreActionsOpen && mounted && createPortal(
        <div className="fixed inset-0 z-50 flex flex-col justify-end md:hidden">
          <div
            onClick={() => setIsMoreActionsOpen(false)}
            className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm transition-opacity"
          />
          <div className="relative z-10 w-full bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 rounded-t-3xl shadow-2xl p-5 pb-safe flex flex-col gap-3 animate-in slide-in-from-bottom duration-200">
            <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto -mt-1 shrink-0" />
            <div className="text-center font-mono text-[10px] text-zinc-400 uppercase tracking-widest pb-1 border-b border-zinc-200 dark:border-zinc-800">
              More Actions
            </div>

            <button
              onClick={() => {
                setIsMoreActionsOpen(false);
                onOpenPdfRekap();
              }}
              className="w-full p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-semibold flex items-center gap-3 active:scale-[0.98] transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>Export PDF Rekap ({filteredCount} Data)</span>
            </button>

            <button
              onClick={() => {
                setIsMoreActionsOpen(false);
                setBookingStatusFilter('all');
                setMonthFilter('all');
                setServiceFilter('all');
                setBookingSort('newest');
                setBookingSearch('');
                setPageSize(10);
              }}
              className="w-full p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-semibold flex items-center gap-3 active:scale-[0.98] transition-all cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#0066CC]" />
              <span>Reset Semua Filter</span>
            </button>

            <button
              onClick={() => setIsMoreActionsOpen(false)}
              className="w-full py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold active:scale-[0.98] transition-all cursor-pointer mt-1"
            >
              Batal
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* =========================================
          DESKTOP VIEW (≥ 768px): Full toolbar
          ========================================= */}
      <div className="hidden md:flex flex-col gap-5">


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

      {/* Mobile Filter Bottom Sheet Modal */}
      <BookingFilterBottomSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        monthFilter={monthFilter}
        serviceFilter={serviceFilter}
        bookingSort={bookingSort}
        pageSize={pageSize}
        availableMonths={availableMonths}
        services={services}
        formatMonthLabel={formatMonthLabel}
        setMonthFilter={setMonthFilter}
        setServiceFilter={setServiceFilter}
        setBookingSort={setBookingSort}
        setPageSize={setPageSize}
        onResetFilters={handleResetSecondaryFilters}
      />
    </div>
  );
}


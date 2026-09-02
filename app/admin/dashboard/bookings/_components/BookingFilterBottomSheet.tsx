'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronRight, Check } from 'lucide-react';
import type { Service } from '@/lib/types';

interface BookingFilterBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  monthFilter: string;
  serviceFilter: string;
  bookingSort: 'newest' | 'oldest' | 'upcoming_event';
  pageSize: number;
  availableMonths: string[];
  services: Service[];
  formatMonthLabel: (ym: string) => string;
  setMonthFilter: (v: string) => void;
  setServiceFilter: (v: string) => void;
  setBookingSort: (v: 'newest' | 'oldest' | 'upcoming_event') => void;
  setPageSize: (v: number) => void;
  onResetFilters: () => void;
}

export function BookingFilterBottomSheet({
  isOpen,
  onClose,
  monthFilter,
  serviceFilter,
  bookingSort,
  pageSize,
  availableMonths,
  services,
  formatMonthLabel,
  setMonthFilter,
  setServiceFilter,
  setBookingSort,
  setPageSize,
  onResetFilters,
}: BookingFilterBottomSheetProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col justify-end md:hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      />

      {/* Sheet Content — PRD Section 12 Layout */}
      <div className="relative z-10 w-full bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 rounded-t-3xl shadow-2xl p-6 pb-safe flex flex-col gap-5 animate-in slide-in-from-bottom duration-300 max-h-[88vh] overflow-y-auto">
        {/* iOS Drag Handle */}
        <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto -mt-1 shrink-0" />

        {/* Header with Title and Reset Text Button */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            Filter Booking
          </h3>
          <button
            onClick={() => {
              onResetFilters();
            }}
            className="text-xs font-semibold text-[#0066CC] hover:text-[#0052A3] active:opacity-70 transition-opacity font-mono cursor-pointer"
          >
            Reset
          </button>
        </div>

        {/* Filter Form Controls — iOS Grouped Item Selectors with Chevron */}
        <div className="flex flex-col gap-4 text-xs">
          {/* Event Month */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
              Event Month
            </label>
            <div className="relative">
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="w-full p-3.5 pr-10 rounded-xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-medium focus:outline-none focus:border-[#0066CC] appearance-none cursor-pointer"
              >
                <option value="all">All Months</option>
                {availableMonths.map((ym) => (
                  <option key={ym} value={ym}>
                    {formatMonthLabel(ym)}
                  </option>
                ))}
              </select>
              <ChevronRight className="w-4 h-4 text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Service */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
              Service
            </label>
            <div className="relative">
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="w-full p-3.5 pr-10 rounded-xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-medium focus:outline-none focus:border-[#0066CC] appearance-none cursor-pointer"
              >
                <option value="all">All Services</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <ChevronRight className="w-4 h-4 text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Sort By */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
              Sort By
            </label>
            <div className="relative">
              <select
                value={bookingSort}
                onChange={(e) => setBookingSort(e.target.value as typeof bookingSort)}
                className="w-full p-3.5 pr-10 rounded-xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-medium focus:outline-none focus:border-[#0066CC] appearance-none cursor-pointer"
              >
                <option value="newest">Latest Booking</option>
                <option value="upcoming_event">Upcoming Event</option>
                <option value="oldest">Oldest Booking</option>
              </select>
              <ChevronRight className="w-4 h-4 text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Show Limit */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
              Show
            </label>
            <div className="relative">
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="w-full p-3.5 pr-10 rounded-xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-medium focus:outline-none focus:border-[#0066CC] appearance-none cursor-pointer"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={9999}>Show All</option>
              </select>
              <ChevronRight className="w-4 h-4 text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Primary Action Button — PRD Section 12 [ Apply Filters ] */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-xl bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-[0.98] cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Apply Filters</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

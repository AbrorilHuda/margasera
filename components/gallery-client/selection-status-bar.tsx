'use client';

import React from 'react';
import { CheckCircle2, LayoutGrid, Square } from 'lucide-react';

export type FilterMode = 'all' | 'selected' | 'unselected';
export type GridDensity = 'dense' | 'comfortable';

interface SelectionStatusBarProps {
  totalCount: number;
  selectedCount: number;
  maxSelectCount: number;
  activeFilter: FilterMode;
  onFilterChange: (filter: FilterMode) => void;
  gridDensity: GridDensity;
  onDensityChange: (density: GridDensity) => void;
}

export function SelectionStatusBar({
  totalCount,
  selectedCount,
  maxSelectCount,
  activeFilter,
  onFilterChange,
  gridDensity,
  onDensityChange,
}: SelectionStatusBarProps) {
  const percentage = Math.min(100, Math.round((selectedCount / maxSelectCount) * 100));
  const isFull = selectedCount >= maxSelectCount;
  const remaining = Math.max(0, maxSelectCount - selectedCount);

  return (
    <div className="sticky top-0 z-30 bg-white/95 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800/80 transition-colors duration-300 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 space-y-3">
        {/* Top Row: Progress Bar & Counter */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center justify-between sm:justify-start gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">
                Progres Seleksi:
              </span>
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                <span className={isFull ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#0066CC]'}>
                  {selectedCount}
                </span>{' '}
                <span className="text-zinc-400 dark:text-zinc-500 font-normal">/ {maxSelectCount} foto</span>
              </span>
            </div>

            {/* Status Pill */}
            {isFull ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                <CheckCircle2 className="w-3 h-3" />
                Kuota Lengkap
              </span>
            ) : selectedCount > 0 ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 dark:bg-blue-950/60 text-[#0066CC] dark:text-[#3399FF] border border-blue-200 dark:border-blue-900/60">
                Pilih {remaining} foto lagi
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
                Belum ada foto dipilih
              </span>
            )}
          </div>

          {/* Grid View Mode Toggle */}
          <div className="hidden sm:flex items-center gap-1.5 self-end text-xs text-zinc-500 dark:text-zinc-400">
            <span className="text-[11px] mr-1">Tampilan:</span>
            <button
              onClick={() => onDensityChange('dense')}
              className={`p-1.5 rounded-lg border transition-colors ${
                gridDensity === 'dense'
                  ? 'bg-zinc-900 dark:bg-zinc-800 text-white border-zinc-900 dark:border-zinc-700 shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-white'
              }`}
              title="Grid Rapat (3-4 Kolom)"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDensityChange('comfortable')}
              className={`p-1.5 rounded-lg border transition-colors ${
                gridDensity === 'comfortable'
                  ? 'bg-zinc-900 dark:bg-zinc-800 text-white border-zinc-900 dark:border-zinc-700 shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-white'
              }`}
              title="Grid Nyaman (1-2 Kolom)"
            >
              <Square className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-zinc-200 dark:bg-zinc-900 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              isFull
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                : 'bg-gradient-to-r from-[#0066CC] to-[#3399FF]'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-0.5">
          <button
            onClick={() => onFilterChange('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeFilter === 'all'
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 shadow-md font-semibold'
                : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900/90 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800/80'
            }`}
          >
            Semua Foto ({totalCount})
          </button>

          <button
            onClick={() => onFilterChange('selected')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeFilter === 'selected'
                ? 'bg-[#0066CC] text-white shadow-md shadow-[#0066CC]/20 font-semibold'
                : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900/90 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800/80'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Dipilih ({selectedCount})
          </button>

          <button
            onClick={() => onFilterChange('unselected')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeFilter === 'unselected'
                ? 'bg-zinc-800 dark:bg-zinc-700 text-white font-semibold'
                : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900/90 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800/80'
            }`}
          >
            Belum Dipilih ({totalCount - selectedCount})
          </button>
        </div>
      </div>
    </div>
  );
}

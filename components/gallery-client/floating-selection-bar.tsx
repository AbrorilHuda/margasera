'use client';

import React from 'react';
import { Eye, Send, Sparkles } from 'lucide-react';

interface FloatingSelectionBarProps {
  selectedCount: number;
  maxSelectCount: number;
  onOpenReview: () => void;
  onSubmitClick: () => void;
}

export function FloatingSelectionBar({
  selectedCount,
  maxSelectCount,
  onOpenReview,
  onSubmitClick,
}: FloatingSelectionBarProps) {
  const isFull = selectedCount >= maxSelectCount;
  const remaining = Math.max(0, maxSelectCount - selectedCount);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-200 dark:border-zinc-800/90 shadow-[0_-8px_30px_rgba(0,0,0,0.07)] dark:shadow-[0_-10px_30px_rgba(0,0,0,0.7)] pb-safe transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Summary Count */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                {selectedCount}{' '}
                <span className="text-zinc-400 dark:text-zinc-500 font-sans font-normal">/ {maxSelectCount}</span>
              </span>
              <span className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400">foto dipilih</span>
            </div>

            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
              {isFull ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Kuota pas terpenuhi
                </span>
              ) : selectedCount > 0 ? (
                <span>Kurang {remaining} foto lagi</span>
              ) : (
                <span className="text-zinc-400 dark:text-zinc-500">Pilih foto favoritmu</span>
              )}
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {selectedCount > 0 && (
              <button
                type="button"
                onClick={onOpenReview}
                className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900/90 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Eye className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                <span>Tinjau</span>
              </button>
            )}

            <button
              type="button"
              onClick={onSubmitClick}
              disabled={selectedCount === 0}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shadow-md ${
                selectedCount === 0
                  ? 'bg-zinc-200 dark:bg-zinc-850 text-zinc-400 dark:text-zinc-500 cursor-not-allowed border border-zinc-300 dark:border-zinc-800'
                  : isFull
                  ? 'bg-[#0066CC] hover:bg-[#0052A3] text-white shadow-[#0066CC]/30 hover:scale-[1.02]'
                  : 'bg-[#0066CC] hover:bg-[#0052A3] text-white shadow-[#0066CC]/20'
              }`}
            >
              <span>Kirim Pilihan</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

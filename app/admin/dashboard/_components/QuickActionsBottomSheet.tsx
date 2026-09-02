'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, FolderPlus, PackagePlus, Clock, X } from 'lucide-react';

interface QuickActionsBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_ACTIONS = [
  {
    icon: Calendar,
    title: 'New Booking',
    desc: 'Tambah reservasi pesanan klien manual',
    href: '/admin/dashboard/bookings?action=new',
    color: '#0066CC',
    bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/60',
  },
  {
    icon: FolderPlus,
    title: 'Add Portfolio',
    desc: 'Unggah project dokumentasi foto baru',
    href: '/admin/dashboard/portfolio?action=new',
    color: '#0066CC',
    bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/60',
  },
  {
    icon: PackagePlus,
    title: 'Add Package',
    desc: 'Buat paket tarif layanan fotografi baru',
    href: '/admin/dashboard/pricing?action=new',
    color: '#0066CC',
    bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/60',
  },
  {
    icon: Clock,
    title: 'Block Date',
    desc: 'Kunci tanggal libur / maintenance studio',
    href: '/admin/dashboard/calendar?action=block',
    color: '#0066CC',
    bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/60',
  },
];

export function QuickActionsBottomSheet({ isOpen, onClose }: QuickActionsBottomSheetProps) {
  const router = useRouter();

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

  if (!isOpen) return null;

  const handleActionClick = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end md:hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      />

      {/* iOS Bottom Sheet Modal */}
      <div className="relative z-10 w-full bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 rounded-t-3xl shadow-2xl p-6 pb-8 flex flex-col gap-4 animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-y-auto">
        {/* iOS Drag Handle */}
        <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto -mt-1 shrink-0" />

        {/* Sheet Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <span className="text-[10px] font-mono text-[#0066CC] uppercase tracking-widest font-semibold block">
              Quick Actions
            </span>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">
              Add New
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Items */}
        <div className="flex flex-col gap-2.5">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.title}
                onClick={() => handleActionClick(action.href)}
                className="w-full p-4 rounded-2xl bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-800/80 flex items-center gap-4 text-left transition-all active:scale-[0.98] cursor-pointer shadow-2xs"
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${action.bg}`}
                  style={{ color: action.color }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-wide">
                    {action.title}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 font-light truncate">
                    {action.desc}
                  </span>
                </div>
                <span className="text-zinc-400 text-lg font-mono">›</span>
              </button>
            );
          })}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3 mt-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold uppercase tracking-wider transition-colors active:scale-[0.98]"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

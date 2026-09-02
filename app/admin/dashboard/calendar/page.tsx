'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  ListFilter,
  Pencil,
  Trash2,
  X,
  Loader2,
  Info,
  Lock,
  CheckCircle2,
  AlertCircle,
  CalendarCheck2,
  HelpCircle,
} from 'lucide-react';
import { getAvailability, updateAvailabilityStatus, resetAvailabilityDate } from '@/lib/actions/availability';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/toast-context';
import type { Availability } from '@/lib/types';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];
const DAYS_OF_WEEK = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export default function CalendarPage() {
  const { toast, confirmModal } = useToast();
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [tableFilter, setTableFilter] = useState<'all' | 'blocked' | 'booked' | 'almost_full'>('all');
  const [showInfoGuide, setShowInfoGuide] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availabilityForm, setAvailabilityForm] = useState({
    date: new Date().toISOString().split('T')[0],
    status: 'blocked' as Availability['status'],
    notes: '',
  });

  const refreshData = useCallback(async () => {
    setLoadingData(true);
    try {
      const list = await getAvailability();
      setAvailability(list);
    } catch (err) {
      console.error('Failed to load availability data', err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleSaveAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await updateAvailabilityStatus(availabilityForm.date, availabilityForm.status, availabilityForm.notes);
      if (res.success) {
        await refreshData();
        setShowModal(false);
        toast.success(`Status ketersediaan tanggal ${formatDate(availabilityForm.date)} berhasil diperbarui.`);
        setAvailabilityForm({
          date: new Date().toISOString().split('T')[0],
          status: 'blocked',
          notes: '',
        });
      } else {
        toast.error(`Gagal menyetel status tanggal: ${res.error}`);
      }
    } catch (err) {
      console.error('Error saving availability:', err);
      toast.error('Terjadi kesalahan saat menyetel status tanggal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAvailability = (date: string) => {
    confirmModal({
      title: `Reset Tanggal ${formatDate(date)}?`,
      message: `Apakah Anda yakin ingin me-reset status ketersediaan pada tanggal ${formatDate(date)}? Status manual akan dihapus dan kembali otomatis ke kondisi ketersediaan pesanan.`,
      confirmText: 'Ya, Reset Status',
      onConfirm: async () => {
        const res = await resetAvailabilityDate(date);
        if (res.success) {
          await refreshData();
          toast.success(`Status tanggal ${formatDate(date)} berhasil di-reset.`);
        } else {
          toast.error(`Gagal me-reset tanggal: ${res.error}`);
        }
      },
    });
  };

  const getStatusForDate = (dateStr: string) => {
    const found = availability.find((a) => a.date && a.date.split('T')[0] === dateStr);
    return found ?? { id: '', date: dateStr, status: 'available' as const, notes: '' };
  };

  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const startDayOffset = new Date(calYear, calMonth, 1).getDay();
  const todayStr = new Date().toISOString().split('T')[0];

  const handlePrevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y - 1); }
    else setCalMonth((m) => m - 1);
  };
  const handleNextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y + 1); }
    else setCalMonth((m) => m + 1);
  };
  const handleJumpToday = () => {
    const now = new Date();
    setCalYear(now.getFullYear());
    setCalMonth(now.getMonth());
  };

  // Statistik untuk bulan aktif di visual grid
  const currentMonthStats = useMemo(() => {
    const prefix = `${calYear}-${String(calMonth + 1).padStart(2, '0')}`;
    const monthAvails = availability.filter((a) => a.date && a.date.startsWith(prefix));
    const booked = monthAvails.filter((a) => a.status === 'booked').length;
    const almostFull = monthAvails.filter((a) => a.status === 'almost_full').length;
    const blocked = monthAvails.filter((a) => a.status === 'blocked').length;
    return { booked, almostFull, blocked, totalSpecial: monthAvails.length };
  }, [availability, calYear, calMonth]);

  // Filter daftar tabel
  const filteredAvailability = useMemo(() => {
    if (tableFilter === 'all') return availability;
    return availability.filter((a) => a.status === tableFilter);
  }, [availability, tableFilter]);

  if (loadingData) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-28 bg-zinc-200/70 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/60 rounded-xl" />
        <div className="h-96 bg-zinc-200/70 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/60 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top Control Bar */}
      <div className="p-6 bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs dark:shadow-xl transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-[#0066CC] uppercase tracking-widest font-semibold">
              Calendar &amp; Availability System
            </span>
            <button
              onClick={() => setShowInfoGuide(!showInfoGuide)}
              className="text-zinc-400 hover:text-[#0066CC] transition-colors"
              title="Tampilkan / Sembunyikan Panduan Kalender"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
          <h3 className="font-sans text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">
            Kelola Ketersediaan Tanggal Studio
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-light mt-1">
            Pantau jadwal pesanan aktif, atur hari libur studio (Blocked), atau kunci tanggal tertentu secara manual.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-zinc-100 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#0066CC] text-white font-semibold shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Visual Grid</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-[#0066CC] text-white font-semibold shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Daftar Tabel ({availability.length})</span>
            </button>
          </div>

          <button
            onClick={() => {
              setAvailabilityForm({ date: new Date().toISOString().split('T')[0], status: 'blocked', notes: '' });
              setShowModal(true);
            }}
            className="px-4 py-2 bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-sm hover:shadow cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Kunci / Libur Tanggal</span>
          </button>
        </div>
      </div>

      {/* Info Guide Card */}
      {showInfoGuide && (
        <div className="p-5 bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/80 dark:border-[#0066CC]/30 rounded-2xl flex flex-col gap-3 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#0066CC] font-bold uppercase tracking-wider font-mono">
              <Info className="w-4 h-4" />
              <span>Cara Kerja Sistem Kalender &amp; Tanggal Khusus:</span>
            </div>
            <button onClick={() => setShowInfoGuide(false)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 text-xs">
              Tutup ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-zinc-700 dark:text-zinc-300">
            <div className="p-3 bg-white/80 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col gap-1">
              <div className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400 font-mono text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Available (Hijau)</span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Status default. Semua tanggal yang belum dipesan atau belum dikunci otomatis terbuka untuk booking klien.
              </p>
            </div>

            <div className="p-3 bg-white/80 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col gap-1">
              <div className="flex items-center gap-1.5 font-semibold text-amber-700 dark:text-amber-400 font-mono text-[11px]">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Almost Full (Kuning)</span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Terisi sebagian pesanan (misal 1 sesi wedding atau 4 sesi studio). Slot tersisa masih bisa dipesan klien.
              </p>
            </div>

            <div className="p-3 bg-white/80 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col gap-1">
              <div className="flex items-center gap-1.5 font-semibold text-rose-700 dark:text-rose-400 font-mono text-[11px]">
                <CalendarCheck2 className="w-3.5 h-3.5" />
                <span>Booked (Merah)</span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Kuota tanggal telah penuh terisi pesanan klien. Tanggal tidak dapat dipilih lagi di form booking online.
              </p>
            </div>

            <div className="p-3 bg-white/80 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col gap-1">
              <div className="flex items-center gap-1.5 font-semibold text-zinc-700 dark:text-zinc-300 font-mono text-[11px]">
                <Lock className="w-3.5 h-3.5" />
                <span>Blocked / Libur (Abu-abu)</span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Tanggal yang sengaja dikunci/diliburkan oleh admin (contoh: Libur Hari Raya, maintenance, cuti tim).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VISUAL GRID CALENDAR */}
      {viewMode === 'grid' && (
        <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-5 sm:p-8 shadow-xs dark:shadow-xl flex flex-col gap-6 transition-colors">
          {/* Month Navigator */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0066CC]/10 dark:bg-[#0066CC]/20 border border-[#0066CC]/30 flex items-center justify-center text-[#0066CC]">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#0066CC] uppercase tracking-widest font-semibold block">
                  Kalender Bulanan Studio
                </span>
                <h4 className="font-sans text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {MONTH_NAMES[calMonth]} {calYear}
                </h4>
              </div>
            </div>

            {/* Quick stats for active month */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-400">
                <span>{currentMonthStats.totalSpecial} Agenda Terdaftar</span>
                {currentMonthStats.booked > 0 && <span className="text-rose-600 dark:text-rose-400 font-bold">• {currentMonthStats.booked} Booked</span>}
                {currentMonthStats.blocked > 0 && <span className="text-zinc-500 font-bold">• {currentMonthStats.blocked} Libur</span>}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleJumpToday}
                  className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-950 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-700 dark:text-zinc-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#0066CC]" />
                  <span>Hari Ini</span>
                </button>
                <button
                  onClick={handlePrevMonth}
                  className="p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-950 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-[#0066CC] transition-colors cursor-pointer"
                  title="Bulan Sebelumnya"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-950 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-[#0066CC] transition-colors cursor-pointer"
                  title="Bulan Berikutnya"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Day Names */}
          <div className="grid grid-cols-7 text-center pt-2 pb-2 text-xs font-semibold tracking-widest uppercase text-[#0066CC] font-mono border-b border-zinc-200 dark:border-zinc-800">
            {DAYS_OF_WEEK.map((d, i) => (
              <div key={d} className={i === 0 || i === 6 ? 'text-amber-600 dark:text-amber-400 font-bold' : ''}>
                {d}
              </div>
            ))}
          </div>

          {/* Day Cells */}
          <div className="grid grid-cols-7 gap-2 sm:gap-3">
            {Array.from({ length: startDayOffset }).map((_, i) => (
              <div key={`empty-${i}`} className="h-16 sm:h-20 opacity-0 pointer-events-none" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayStatus = getStatusForDate(dStr);
              const isToday = dStr === todayStr;

              // Light mode vs Dark mode cell classes
              let cellClass = 'bg-emerald-50/60 hover:bg-emerald-100/70 border-emerald-200/80 text-emerald-950 dark:bg-emerald-950/20 dark:hover:bg-emerald-900/35 dark:border-emerald-800/30 dark:text-emerald-200';
              let dotBg = 'bg-emerald-500 shadow-xs';
              let statusLabel = 'Available';
              let statusLabelColor = 'text-emerald-700 dark:text-emerald-400';

              if (dayStatus.status === 'almost_full') {
                cellClass = 'bg-amber-50/70 hover:bg-amber-100/80 border-amber-200/90 text-amber-950 dark:bg-amber-950/20 dark:hover:bg-amber-900/35 dark:border-amber-800/30 dark:text-amber-200';
                dotBg = 'bg-amber-500 shadow-xs';
                statusLabel = 'Almost Full';
                statusLabelColor = 'text-amber-700 dark:text-amber-400';
              } else if (dayStatus.status === 'booked') {
                cellClass = 'bg-rose-50/70 hover:bg-rose-100/80 border-rose-200/90 text-rose-950 dark:bg-rose-950/20 dark:hover:bg-rose-900/35 dark:border-rose-900/30 dark:text-rose-300';
                dotBg = 'bg-rose-500 shadow-xs';
                statusLabel = 'Booked';
                statusLabelColor = 'text-rose-700 dark:text-rose-400';
              } else if (dayStatus.status === 'blocked') {
                cellClass = 'bg-zinc-100/80 hover:bg-zinc-200/70 border-zinc-200 text-zinc-700 dark:bg-zinc-900/40 dark:hover:bg-zinc-800/50 dark:border-zinc-800/60 dark:text-zinc-400';
                dotBg = 'bg-zinc-500';
                statusLabel = 'Blocked';
                statusLabelColor = 'text-zinc-600 dark:text-zinc-400';
              }

              // Build informative caption text for calendar grid cell
              let detailText = dayStatus.notes;
              if (!detailText) {
                const wCount = (dayStatus.weddingSlots || []).filter((w) => w.isBooked).length;
                const rCount = (dayStatus.bookedTimeSlots || []).length;
                if (wCount > 0 || rCount > 0) {
                  const parts = [];
                  if (wCount > 0) parts.push(`💍 ${wCount}/2`);
                  if (rCount > 0) parts.push(`📸 ${rCount}/6`);
                  detailText = parts.join(' ');
                }
              }

              return (
                <button
                  key={dStr}
                  onClick={() => {
                    setAvailabilityForm({
                      date: dStr,
                      status: dayStatus.status || 'blocked',
                      notes: dayStatus.notes || '',
                    });
                    setShowModal(true);
                  }}
                  className={`p-2.5 sm:p-3 border rounded-2xl flex flex-col justify-between items-start text-left transition-all duration-200 group hover:-translate-y-0.5 h-16 sm:h-20 cursor-pointer shadow-2xs ${cellClass}`}
                  title={`Klik untuk kelola / edit status tanggal ${formatDate(dStr)}`}
                >
                  <div className="w-full flex items-center justify-between">
                    <span className="font-mono text-sm sm:text-base font-semibold">{dayNum}</span>
                    {isToday && (
                      <span className="px-1.5 py-0.2 rounded-full bg-[#0066CC] text-white text-[9px] font-mono font-bold" title="Hari Ini">
                        Hari Ini
                      </span>
                    )}
                  </div>
                  <div className="w-full flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-1.5 truncate max-w-full">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotBg}`} />
                      <span className={`text-[10px] font-mono tracking-tight truncate font-semibold ${statusLabelColor}`}>
                        {detailText || statusLabel}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* AVAILABILITY LIST TABLE */}
      <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 sm:p-8 shadow-xs dark:shadow-xl transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-mono font-bold text-[#0066CC] uppercase tracking-widest">
                Daftar Tanggal Khusus &amp; Terisi ({filteredAvailability.length})
              </h4>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-light mt-0.5">
              Menampilkan kuota terisi (Wedding maks 2 slot, Non-Wedding maks 6 slot) dan tanggal libur khusus studio.
            </p>
          </div>

          {/* Filter Status Tabs */}
          <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono">
            {[
              { id: 'all', label: `Semua (${availability.length})` },
              { id: 'booked', label: 'Booked' },
              { id: 'blocked', label: 'Libur' },
              { id: 'almost_full', label: 'Almost Full' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTableFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  tableFilter === tab.id
                    ? 'bg-[#0066CC] text-white font-bold shadow-2xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left text-xs font-light">
            <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 text-[#0066CC] font-mono font-medium tracking-[0.2em] uppercase text-[10px]">
              <tr>
                <th className="p-4">Tanggal Event</th>
                <th className="p-4">Status Kalender</th>
                <th className="p-4">Kuota Terisi &amp; Rincian Pesanan</th>
                <th className="p-4">Sumber Status</th>
                <th className="p-4 text-right">Aksi Kelola</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
              {filteredAvailability.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-500 font-light">
                    Belum ada data tanggal pada filter ini.
                  </td>
                </tr>
              ) : (
                filteredAvailability.map((av) => {
                  // Build booking details summary
                  const weddingBookings = (av.weddingSlots || []).filter((w) => w.isBooked);
                  const regularBookings = av.bookedTimeSlots || [];
                  const isAutoBooking = weddingBookings.length > 0 || regularBookings.length > 0;

                  return (
                    <tr key={av.id || av.date} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="p-4 font-mono font-semibold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                        {formatDate(av.date)}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase font-mono tracking-wider font-semibold ${
                            av.status === 'booked'
                              ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-500/30'
                              : av.status === 'blocked'
                              ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700'
                              : av.status === 'almost_full'
                              ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30'
                              : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30'
                          }`}
                        >
                          {av.status === 'blocked' ? 'Libur / Blocked' : av.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-zinc-700 dark:text-zinc-300">
                        <div className="flex flex-col gap-2">
                          {/* Quota Utilization Badges */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                              weddingBookings.length >= 2
                                ? 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/60'
                                : weddingBookings.length === 1
                                ? 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/60'
                                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800'
                            }`}>
                              💍 Wedding: <strong>{weddingBookings.length}/2 Slot</strong>
                            </span>

                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                              regularBookings.length >= 6
                                ? 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/60'
                                : regularBookings.length >= 4
                                ? 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/60'
                                : regularBookings.length > 0
                                ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/60'
                                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800'
                            }`}>
                              📸 Non-Wedding: <strong>{regularBookings.length}/6 Slot</strong>
                            </span>
                          </div>

                          {/* Notes / Booking Details */}
                          {av.notes && (
                            <span className="font-medium text-zinc-900 dark:text-zinc-100 text-xs">
                              📝 {av.notes}
                            </span>
                          )}

                          {isAutoBooking && (
                            <div className="flex flex-col gap-1 text-xs">
                              {weddingBookings.map((w) => (
                                <span key={w.id} className="text-zinc-700 dark:text-zinc-300 font-mono">
                                  • 💍 <strong className="text-zinc-900 dark:text-zinc-100">{w.bookedBy || 'Client Wedding'}</strong> ({w.name})
                                </span>
                              ))}
                              {regularBookings.map((rb, idx) => (
                                <span key={idx} className="text-zinc-700 dark:text-zinc-300 font-mono">
                                  • 📸 <strong className="text-zinc-900 dark:text-zinc-100">{rb.customerName}</strong> — {rb.serviceCategory} ({rb.startTime} - {rb.endTime})
                                </span>
                              ))}
                            </div>
                          )}

                          {!av.notes && !isAutoBooking && (
                            <span className="text-zinc-400 italic text-[11px]">Kunci Manual Admin</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400">
                          {isAutoBooking ? 'Otomatis (Booking Masuk)' : 'Manual (Admin Setting)'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setAvailabilityForm({ date: av.date, status: av.status, notes: av.notes || '' });
                              setShowModal(true);
                            }}
                            className="p-1.5 bg-white hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg transition-colors cursor-pointer shadow-2xs"
                            title="Edit Status Tanggal"
                          >
                            <Pencil className="w-3.5 h-3.5 text-[#0066CC]" />
                          </button>
                          <button
                            onClick={() => handleResetAvailability(av.date)}
                            className="p-1.5 bg-white hover:bg-rose-50 dark:bg-zinc-950 dark:hover:bg-rose-950/40 border border-zinc-200 dark:border-zinc-800 text-rose-600 dark:text-rose-400 rounded-lg transition-colors cursor-pointer shadow-2xs"
                            title="Reset / Kembalikan ke Default"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== MODAL: SET/EDIT AVAILABILITY ===== */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-6 md:p-8 flex flex-col gap-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0066CC]/15 text-[#0066CC] flex items-center justify-center font-bold">
                  <Lock className="w-4 h-4" />
                </div>
                <h3 className="font-sans text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  Set Status Tanggal Studio
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
                title="Tutup Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAvailability} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-600 dark:text-zinc-300 uppercase font-mono font-medium text-[10px]">
                  Pilih Tanggal *
                </label>
                <input
                  type="date"
                  required
                  value={availabilityForm.date}
                  onChange={(e) => setAvailabilityForm({ ...availabilityForm, date: e.target.value })}
                  className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-[#0066CC] p-3 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-600 dark:text-zinc-300 uppercase font-mono font-medium text-[10px]">
                  Status Ketersediaan *
                </label>
                <select
                  value={availabilityForm.status}
                  onChange={(e) => setAvailabilityForm({ ...availabilityForm, status: e.target.value as Availability['status'] })}
                  className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-[#0066CC] p-3 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none cursor-pointer"
                >
                  <option value="blocked">Blocked (Libur / Dikunci Admin)</option>
                  <option value="booked">Booked (Penuh / Terisi Event)</option>
                  <option value="almost_full">Almost Full (Hampir Penuh)</option>
                  <option value="available">Available (Tersedia / Kosong)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-600 dark:text-zinc-300 uppercase font-mono font-medium text-[10px]">
                  Catatan / Keterangan (Opsional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Contoh: Libur Hari Raya Idul Fitri / Studio Maintenance / Cuti Bersama"
                  value={availabilityForm.notes}
                  onChange={(e) => setAvailabilityForm({ ...availabilityForm, notes: e.target.value })}
                  className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-[#0066CC] p-3 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none resize-none placeholder:text-zinc-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-[#0066CC] hover:bg-[#0052A3] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors shadow-sm hover:shadow flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan Status...</span>
                    </>
                  ) : (
                    <span>Simpan Status Tanggal</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

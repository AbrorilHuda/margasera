'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  Plus,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  ListFilter,
  Pencil,
  Trash2,
  X,
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

  const [showModal, setShowModal] = useState(false);
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
  };

  const handleResetAvailability = (date: string) => {
    confirmModal({
      title: `Reset Tanggal ${formatDate(date)}?`,
      message: `Apakah Anda yakin ingin me-reset status ketersediaan pada tanggal ${formatDate(date)}? Status akan kembali ke Otomatis (Available/Booked).`,
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
  const handleJumpToday = () => { const now = new Date(); setCalYear(now.getFullYear()); setCalMonth(now.getMonth()); };

  if (loadingData) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-24 bg-zinc-900/60 border border-zinc-800/60 rounded-xl" />
        <div className="h-96 bg-zinc-900/60 border border-zinc-800/60 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top Control Bar */}
      <div className="p-6 bg-zinc-900/60 border border-zinc-800/80 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div>
          <span className="text-[10px] font-mono text-[#0066CC] uppercase tracking-widest font-semibold">Calendar System</span>
          <h3 className="font-sans text-xl sm:text-2xl font-bold text-zinc-100 uppercase tracking-tight">
            Kelola Ketersediaan Tanggal
          </h3>
          <p className="text-xs text-zinc-400 font-light mt-1">
            Klik tanggal mana saja pada kalender untuk langsung mengubah status (Available, Almost Full, Booked, Blocked).
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-zinc-950 rounded-lg border border-zinc-800 text-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-mono transition-colors ${
                viewMode === 'grid' ? 'bg-[#0066CC] text-white font-semibold shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Visual Grid</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-mono transition-colors ${
                viewMode === 'table' ? 'bg-[#0066CC] text-white font-semibold shadow-sm' : 'text-zinc-400 hover:text-white'
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
            className="px-4 py-2 bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Set Tanggal Baru</span>
          </button>
        </div>
      </div>

      {/* VISUAL GRID CALENDAR */}
      {viewMode === 'grid' && (
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-5 sm:p-8 shadow-xl flex flex-col gap-6">
          {/* Month Navigator */}
          <div className="flex items-center justify-between pb-6 border-b border-zinc-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0066CC]/15 border border-[#0066CC]/30 flex items-center justify-center text-[#0066CC]">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#0066CC] uppercase tracking-widest font-semibold block">
                  Kalender Bulanan Studio
                </span>
                <h4 className="font-sans text-xl sm:text-2xl font-bold text-zinc-100">
                  {MONTH_NAMES[calMonth]} {calYear}
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleJumpToday}
                className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#0066CC]" />
                <span>Hari Ini</span>
              </button>
              <button onClick={handlePrevMonth} className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-[#0066CC] hover:border-[#0066CC]/50 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={handleNextMonth} className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-[#0066CC] hover:border-[#0066CC]/50 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Day Names */}
          <div className="grid grid-cols-7 text-center pt-2 pb-2 text-xs font-semibold tracking-widest uppercase text-[#0066CC] font-mono border-b border-zinc-800/60">
            {DAYS_OF_WEEK.map((d, i) => (
              <div key={d} className={i === 0 || i === 6 ? 'text-amber-400/80' : ''}>{d}</div>
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

              let cellClass = 'bg-emerald-950/20 hover:bg-emerald-900/35 border-emerald-800/30 text-emerald-200';
              let dotBg = 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]';
              let statusLabel = 'Available';
              let statusLabelColor = 'text-emerald-400/90';

              if (dayStatus.status === 'almost_full') {
                cellClass = 'bg-amber-950/20 hover:bg-amber-900/35 border-amber-800/30 text-amber-200';
                dotBg = 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]';
                statusLabel = 'Almost Full';
                statusLabelColor = 'text-amber-400/90';
              } else if (dayStatus.status === 'booked') {
                cellClass = 'bg-rose-950/20 hover:bg-rose-900/35 border-rose-900/30 text-rose-300';
                dotBg = 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]';
                statusLabel = 'Booked';
                statusLabelColor = 'text-rose-400/90';
              } else if (dayStatus.status === 'blocked') {
                cellClass = 'bg-zinc-900/40 border-zinc-800/60 text-zinc-500';
                dotBg = 'bg-zinc-600';
                statusLabel = 'Blocked';
                statusLabelColor = 'text-zinc-500';
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
                  className={`p-2.5 sm:p-3 border rounded-2xl flex flex-col justify-between items-start text-left transition-all duration-300 group hover:-translate-y-0.5 h-16 sm:h-20 ${cellClass}`}
                  title={`Klik untuk edit status tanggal ${formatDate(dStr)}`}
                >
                  <div className="w-full flex items-center justify-between">
                    <span className="font-mono text-sm sm:text-base font-medium text-zinc-200">{dayNum}</span>
                    {isToday && (
                      <span className="w-2 h-2 rounded-full bg-[#0066CC] ring-2 ring-[#0066CC]/40 animate-ping" title="Hari Ini" />
                    )}
                  </div>
                  <div className="w-full flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-1.5 truncate max-w-full">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotBg}`} />
                      <span className={`text-[10px] font-mono tracking-tight truncate ${statusLabelColor}`}>
                        {dayStatus.notes ? `💬 ${dayStatus.notes}` : statusLabel}
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
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-mono font-semibold text-[#0066CC] uppercase tracking-widest">
            Daftar Tanggal Khusus Terdaftar ({availability.length})
          </h4>
          <span className="text-[11px] text-zinc-400 font-light">
            Tanggal di luar tabel ini otomatis berstatus <strong>Available</strong>.
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-zinc-800/80">
          <table className="w-full text-left text-xs font-light">
            <thead className="bg-zinc-950 border-b border-zinc-800 text-[#0066CC] font-mono font-medium tracking-[0.2em] uppercase text-[10px]">
              <tr>
                <th className="p-4">Tanggal</th>
                <th className="p-4">Status Ketersediaan</th>
                <th className="p-4">Catatan / Acara</th>
                <th className="p-4">Aksi Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {availability.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-zinc-400 font-light">
                    Belum ada status khusus. Semua tanggal terbuka secara default (Available).
                  </td>
                </tr>
              ) : (
                availability.map((av) => (
                  <tr key={av.id || av.date} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="p-4 font-mono text-zinc-200">{formatDate(av.date)}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase font-mono tracking-wider font-semibold ${
                          av.status === 'booked'
                            ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                            : av.status === 'blocked'
                            ? 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                            : av.status === 'almost_full'
                            ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {av.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-zinc-300">{av.notes || '-'}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setAvailabilityForm({ date: av.date, status: av.status, notes: av.notes || '' });
                            setShowModal(true);
                          }}
                          className="p-1.5 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-300 rounded transition-colors"
                          title="Edit Status Tanggal"
                        >
                          <Pencil className="w-3.5 h-3.5 text-[#0066CC]" />
                        </button>
                        <button
                          onClick={() => handleResetAvailability(av.date)}
                          className="p-1.5 bg-zinc-950 border border-zinc-800 hover:border-rose-900/50 text-rose-400 rounded transition-colors"
                          title="Reset / Hapus Tanggal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== MODAL: SET/EDIT AVAILABILITY ===== */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-lg w-full p-6 md:p-8 flex flex-col gap-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <h3 className="font-sans text-xl font-bold text-zinc-100">Set Status Tanggal Studio</h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAvailability} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-300 uppercase font-mono font-medium">Pilih Tanggal *</label>
                <input
                  type="date"
                  required
                  value={availabilityForm.date}
                  onChange={(e) => setAvailabilityForm({ ...availabilityForm, date: e.target.value })}
                  className="bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] p-3 rounded-lg text-zinc-100 focus:outline-none font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-300 uppercase font-mono font-medium">Status Ketersediaan *</label>
                <select
                  value={availabilityForm.status}
                  onChange={(e) => setAvailabilityForm({ ...availabilityForm, status: e.target.value as Availability['status'] })}
                  className="bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] p-3 rounded-lg text-zinc-100 focus:outline-none"
                >
                  <option value="blocked">Blocked (Libur / Dikunci Admin)</option>
                  <option value="booked">Booked (Penuh / Terisi Event)</option>
                  <option value="almost_full">Almost Full (Hampir Penuh)</option>
                  <option value="available">Available (Tersedia / Kosong)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-300 uppercase font-mono font-medium">Catatan / Keterangan (Opsional)</label>
                <textarea
                  rows={3}
                  placeholder="Contoh: Internal Maintenance / Libur Studio / Project Out of Town"
                  value={availabilityForm.notes}
                  onChange={(e) => setAvailabilityForm({ ...availabilityForm, notes: e.target.value })}
                  className="bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] p-3 rounded-lg text-zinc-100 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors shadow-md"
                >
                  Simpan Status Tanggal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

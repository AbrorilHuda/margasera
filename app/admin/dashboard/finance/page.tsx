'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  Search,
  Filter,
  Printer,
  Calendar,
  Building2,
  Trash2,
  Edit3,
  WifiOff,
  Tag,
  Clock,
  ArrowDownRight,
  ArrowUpRight,
  Sparkles,
  FileSpreadsheet,
  RefreshCw,
  X,
} from 'lucide-react';
import { getAllExpenses, deleteExpense } from '@/lib/actions/finance';
import { getAllBookings } from '@/lib/actions/bookings';
import { getStudioSettings } from '@/lib/actions/settings';
import {
  getAllLocalExpenses,
  saveLocalExpenses,
  deleteLocalExpense,
  getAllLocalBookings,
} from '@/lib/offline';
import {
  formatCurrency,
  formatDate,
  getBookingPaidAmount,
  getBookingRemainingAmount,
} from '@/lib/utils';
import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_LABELS, DEFAULT_STUDIO_SETTINGS } from '@/lib/constants';
import { useToast } from '@/components/ui/toast-context';
import { ExpenseModal } from './_components/ExpenseModal';
import { FinancePdfReportModal } from './_components/FinancePdfReportModal';
import type { Booking, Expense, StudioSettings } from '@/lib/types';

export default function FinanceDashboardPage() {
  const { toast, confirmModal } = useToast();

  // Network State
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleStatus = () => {
      setIsOffline(typeof navigator !== 'undefined' ? !navigator.onLine : false);
    };
    handleStatus();
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  // Data States
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [studioSettings, setStudioSettings] = useState<StudioSettings>(DEFAULT_STUDIO_SETTINGS);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [monthFilter, setMonthFilter] = useState<string>(() => {
    const now = new Date();
    const yy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    return `${yy}-${mm}`;
  });
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const hasActiveFilter =
    monthFilter !== 'all' ||
    Boolean(startDate) ||
    Boolean(endDate) ||
    categoryFilter !== 'all' ||
    typeFilter !== 'all' ||
    projectFilter !== 'all' ||
    Boolean(searchQuery.trim());

  const resetFilters = () => {
    setMonthFilter('all');
    setStartDate('');
    setEndDate('');
    setCategoryFilter('all');
    setTypeFilter('all');
    setProjectFilter('all');
    setSearchQuery('');
  };

  // Modals
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);

  // Auto open modal jika ?action=new
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('action') === 'new') {
        setShowExpenseModal(true);
      }
    }
  }, []);

  // Load Data with Stale-While-Revalidate (IndexedDB first, then Supabase)
  const loadData = useCallback(async () => {
    // 1. Tampilkan dari IndexedDB lokal secara instan
    try {
      const [localExp, localBookings] = await Promise.all([
        getAllLocalExpenses(),
        getAllLocalBookings(),
      ]);
      if (localExp.length > 0) setExpenses(localExp);
      if (localBookings.length > 0) setBookings(localBookings);
      if (localExp.length > 0 || localBookings.length > 0) setLoading(false);
    } catch (e) {
      console.warn('[Finance] Gagal load local data:', e);
    }

    // 2. Fetch fresh data dari Supabase jika online
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      try {
        const [expList, bookList, settings] = await Promise.all([
          getAllExpenses(),
          getAllBookings(),
          getStudioSettings(),
        ]);

        setExpenses(expList);
        setBookings(bookList);
        if (settings) setStudioSettings(settings);

        // Update IndexedDB cache
        await saveLocalExpenses(expList);
      } catch (err) {
        console.warn('[Finance] Gagal fetch online, tetap menggunakan cache lokal:', err);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Daftar Bulan untuk Filter (Otomatis diekstrak dari tanggal booking & pengeluaran)
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    // Tambahkan bulan sekarang
    const now = new Date();
    set.add(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);

    expenses.forEach((e) => {
      if (e.date) set.add(e.date.slice(0, 7));
    });
    bookings.forEach((b) => {
      if (b.bookingDate) set.add(b.bookingDate.slice(0, 7));
    });

    return Array.from(set).sort().reverse();
  }, [expenses, bookings]);

  const formatMonthLabel = (ym: string) => {
    if (ym === 'all') return 'Semua Periode';
    const [year, month] = ym.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    return new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(date);
  };

  // Filter Bookings sesuai Rentang Tanggal / Bulan yang Dipilih (untuk menghitung pemasukan riil)
  const periodBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (b.status === 'cancelled') return false;
      if (!b.bookingDate) return false;
      if (startDate && b.bookingDate < startDate) return false;
      if (endDate && b.bookingDate > endDate) return false;
      if (!startDate && !endDate && monthFilter !== 'all') {
        return b.bookingDate.startsWith(monthFilter);
      }
      return true;
    });
  }, [bookings, monthFilter, startDate, endDate]);

  // Pemasukan dari Booking pada Periode Ini (DP + Pelunasan riil)
  const bookingRevenue = useMemo(() => {
    return periodBookings.reduce((sum, b) => sum + getBookingPaidAmount(b), 0);
  }, [periodBookings]);

  // Piutang Sisa Tagihan Klien yang belum lunas
  const periodReceivables = useMemo(() => {
    return periodBookings.reduce((sum, b) => sum + getBookingRemainingAmount(b), 0);
  }, [periodBookings]);

  // Filter Expenses sesuai kriteria
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      // 1. Filter Rentang Tanggal / Bulan
      if (startDate && (!exp.date || exp.date < startDate)) return false;
      if (endDate && (!exp.date || exp.date > endDate)) return false;
      if (!startDate && !endDate && monthFilter !== 'all' && (!exp.date || !exp.date.startsWith(monthFilter))) {
        return false;
      }
      // 2. Filter Tipe
      if (typeFilter !== 'all' && exp.type !== typeFilter) {
        return false;
      }
      // 3. Filter Kategori
      if (categoryFilter !== 'all' && exp.category !== categoryFilter) {
        return false;
      }
      // 4. Filter Project
      if (projectFilter === 'linked_only' && !exp.bookingId) return false;
      if (projectFilter === 'general_only' && exp.bookingId) return false;

      // 5. Filter Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = exp.title.toLowerCase().includes(q);
        const matchCustomer = exp.customerName?.toLowerCase().includes(q);
        const matchCode = exp.bookingCode?.toLowerCase().includes(q);
        const matchNotes = exp.notes?.toLowerCase().includes(q);
        const matchCat = exp.customCategory?.toLowerCase().includes(q);
        if (!matchTitle && !matchCustomer && !matchCode && !matchNotes && !matchCat) {
          return false;
        }
      }

      return true;
    });
  }, [expenses, monthFilter, startDate, endDate, typeFilter, categoryFilter, projectFilter, searchQuery]);

  // Total Pengeluaran pada Periode yang Dipilih
  const totalExpense = useMemo(() => {
    return filteredExpenses
      .filter((e) => e.type === 'expense')
      .reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  // Total Pemasukan Manual Tambahan
  const manualIncome = useMemo(() => {
    return filteredExpenses
      .filter((e) => e.type === 'income')
      .reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  // Total Kas Masuk Riil (Booking + Manual)
  const totalIncome = bookingRevenue + manualIncome;

  // Laba Bersih (Net Profit)
  const netProfit = totalIncome - totalExpense;
  const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

  // Handler Delete
  const handleDelete = (exp: Expense) => {
    confirmModal({
      title: 'Hapus Catatan Transaksi?',
      message: `Apakah Anda yakin ingin menghapus "${exp.title}" senilai ${formatCurrency(exp.amount)}? Tindakan ini tidak dapat dibatalkan.`,
      confirmText: 'Ya, Hapus',
      variant: 'danger',
      onConfirm: async () => {
        try {
          if (isOffline) {
            await deleteLocalExpense(exp.id);
            setExpenses((prev) => prev.filter((item) => item.id !== exp.id));
            toast.success('Catatan transaksi telah dihapus dari memori perangkat.', 'Dihapus dari Lokal');
            return;
          }

          const res = await deleteExpense(exp.id);
          if (!res.success) throw new Error(res.error || 'Gagal menghapus transaksi.');

          await deleteLocalExpense(exp.id);
          setExpenses((prev) => prev.filter((item) => item.id !== exp.id));
          toast.success('Catatan transaksi telah dihapus.', 'Berhasil Dihapus');
        } catch (err: any) {
          toast.error(err.message || 'Terjadi kesalahan saat menghapus.', 'Gagal Menghapus');
        }
      },
    });
  };

  // Handler Success Create/Edit
  const handleSuccess = (saved: Expense, isEdit: boolean) => {
    if (isEdit) {
      setExpenses((prev) => prev.map((item) => (item.id === saved.id ? saved : item)));
    } else {
      setExpenses((prev) => [saved, ...prev]);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 sm:h-32 bg-zinc-200/70 dark:bg-zinc-900/60 rounded-xl" />
          ))}
        </div>
        <div className="h-20 bg-zinc-200/70 dark:bg-zinc-900/60 rounded-xl" />
        <div className="h-80 bg-zinc-200/70 dark:bg-zinc-900/60 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      {/* Offline Alert */}
      {isOffline && (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-700 dark:text-amber-400 text-xs sm:text-sm font-medium shadow-xs">
          <WifiOff className="w-4 h-4 shrink-0 text-amber-500 animate-pulse" />
          <span>
            <strong>Mode Offline Aktif</strong> — Menampilkan data kas dari memori IndexedDB. Anda tetap bisa mencatat pengeluaran secara lokal.
          </span>
        </div>
      )}

      {/* ===== HEADER & ACTION BUTTONS ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-[0.25em] text-[#0066CC] uppercase font-semibold">
            Cashflow & Budget Management
          </span>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Keuangan & Arus Kas Studio
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Pantau pemasukan riil, biaya tim/cetak project, dan laba bersih Margasera.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={() => setShowReportModal(true)}
            className="px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-[#0066CC]" />
            <span>Cetak Rekap PDF</span>
          </button>
          <button
            onClick={() => {
              setEditingExpense(null);
              setShowExpenseModal(true);
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#0066CC] hover:bg-[#0055b3] rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Transaksi</span>
          </button>
        </div>
      </div>

      {/* ===== SUMMARY METRIC CARDS ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {/* Total Kas Masuk */}
        <div className="p-4 sm:p-5 bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl flex flex-col justify-between gap-2 shadow-xs group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-[10px] font-mono tracking-wider uppercase font-medium truncate">
              Kas Masuk Riil
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <span className="text-lg sm:text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 truncate">
            {formatCurrency(totalIncome)}
          </span>
          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
            {periodBookings.length} booking ({formatCurrency(bookingRevenue)})
            {manualIncome > 0 && ` + ${formatCurrency(manualIncome)}`}
          </span>
        </div>

        {/* Total Pengeluaran */}
        <div className="p-4 sm:p-5 bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl flex flex-col justify-between gap-2 shadow-xs group hover:border-rose-500/40 transition-all">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-[10px] font-mono tracking-wider uppercase font-medium truncate">
              Beban Pengeluaran
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <span className="text-lg sm:text-2xl font-extrabold tracking-tight text-rose-600 dark:text-rose-400 truncate">
            {formatCurrency(totalExpense)}
          </span>
          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
            {filteredExpenses.filter((e) => e.type === 'expense').length} transaksi tercatat
          </span>
        </div>

        {/* Laba Bersih (Net Profit) */}
        <div className="p-4 sm:p-5 bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl flex flex-col justify-between gap-2 shadow-xs group hover:border-[#0066CC]/40 transition-all">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-[10px] font-mono tracking-wider uppercase font-medium truncate">
              Laba Bersih (Net Profit)
            </span>
            <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${
              netProfit >= 0
                ? 'bg-blue-500/10 border-blue-500/20 text-[#0066CC]'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-600'
            }`}>
              {netProfit >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            </div>
          </div>
          <span className={`text-lg sm:text-2xl font-extrabold tracking-tight truncate ${
            netProfit >= 0 ? 'text-zinc-900 dark:text-zinc-100' : 'text-rose-600 dark:text-rose-400'
          }`}>
            {formatCurrency(netProfit)}
          </span>
          <span className="text-[10px] font-medium truncate flex items-center gap-1">
            <span className={`px-1.5 py-0.2 rounded-sm ${
              netProfit >= 0 ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' : 'bg-rose-100 text-rose-700'
            }`}>
              {profitMargin.toFixed(1)}% margin
            </span>
            <span className="text-zinc-400">dari pemasukan</span>
          </span>
        </div>

        {/* Piutang Berjalan */}
        <div className="p-4 sm:p-5 bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl flex flex-col justify-between gap-2 shadow-xs group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-[10px] font-mono tracking-wider uppercase font-medium truncate">
              Piutang Belum Lunas
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <span className="text-lg sm:text-2xl font-extrabold tracking-tight text-amber-600 dark:text-amber-400 truncate">
            {formatCurrency(periodReceivables)}
          </span>
          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
            Sisa pelunasan tagihan klien
          </span>
        </div>
      </div>

      {/* ===== FILTER TOOLBAR ===== */}
      <div className="p-4 bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Cari keterangan, klien, kode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 rounded-xl focus:outline-hidden focus:border-[#0066CC]"
            />
          </div>

          {/* Month Filter */}
          <div className="relative">
            <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <select
              value={monthFilter}
              onChange={(e) => {
                setMonthFilter(e.target.value);
                setStartDate('');
                setEndDate('');
              }}
              className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 rounded-xl focus:outline-hidden focus:border-[#0066CC] cursor-pointer"
            >
              <option value="all">Semua Periode</option>
              {availableMonths.map((ym) => (
                <option key={ym} value={ym}>
                  {formatMonthLabel(ym)}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 rounded-xl focus:outline-hidden focus:border-[#0066CC] cursor-pointer"
            >
              <option value="all">Semua Kategori</option>
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat.key} value={cat.key}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Project Relation Filter */}
          <div className="relative">
            <Building2 className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 rounded-xl focus:outline-hidden focus:border-[#0066CC] cursor-pointer"
            >
              <option value="all">Semua Pengeluaran (Umum & Project)</option>
              <option value="linked_only">Hanya Terkait Project Booking</option>
              <option value="general_only">Hanya Pengeluaran Umum Studio</option>
            </select>
          </div>
        </div>

        {/* Custom Date Range & Reset Row */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-zinc-500 dark:text-zinc-400 font-mono text-[11px] font-medium flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#0066CC]" /> Rentang Tanggal Kustom:
            </span>
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (monthFilter !== 'all') setMonthFilter('all');
                }}
                className="px-2.5 py-1 text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 rounded-lg focus:outline-hidden focus:border-[#0066CC] text-zinc-800 dark:text-zinc-200 cursor-pointer"
                title="Tanggal Mulai"
              />
              <span className="text-zinc-400 font-mono">–</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  if (monthFilter !== 'all') setMonthFilter('all');
                }}
                className="px-2.5 py-1 text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 rounded-lg focus:outline-hidden focus:border-[#0066CC] text-zinc-800 dark:text-zinc-200 cursor-pointer"
                title="Tanggal Selesai"
              />
            </div>
            {(startDate || endDate) && (
              <button
                type="button"
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="p-1 text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer"
                title="Hapus filter rentang tanggal"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {hasActiveFilter && (
            <button
              onClick={resetFilters}
              className="text-[11px] font-mono font-medium text-[#0066CC] dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer ml-auto"
            >
              <RefreshCw className="w-3 h-3" /> Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* ===== TRANSACTIONS TABLE & LIST ===== */}
      <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Riwayat Transaksi Pengeluaran & Kas
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
              {filteredExpenses.length} data
            </span>
          </div>
          <span className="text-[11px] text-zinc-400 hidden sm:inline">
            Periode: <strong>{startDate && endDate ? `${formatDate(startDate)} – ${formatDate(endDate)}` : formatMonthLabel(monthFilter)}</strong>
          </span>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
              {hasActiveFilter ? <Search className="w-6 h-6" /> : <Wallet className="w-6 h-6" />}
            </div>
            <div className="max-w-xs">
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                {hasActiveFilter ? 'Tidak ada transaksi ditemukan' : 'Belum ada transaksi tercatat'}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                {hasActiveFilter
                  ? 'Tidak ada pengeluaran atau kas yang cocok dengan kriteria filter saat ini.'
                  : 'Catat pengeluaran untuk honor tim, cetak foto, atau operasional studio agar arus kas terpantau jelas.'}
              </p>
            </div>
            {hasActiveFilter ? (
              <button
                onClick={resetFilters}
                className="mt-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Semua Filter</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setEditingExpense(null);
                  setShowExpenseModal(true);
                }}
                className="mt-2 px-4 py-2 bg-[#0066CC] hover:bg-[#0055b3] text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Catat Pengeluaran Pertama</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400 uppercase font-mono text-[10px] tracking-wider border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Keterangan & Rincian</th>
                  <th className="py-3 px-4">Terkait Project</th>
                  <th className="py-3 px-4">Metode</th>
                  <th className="py-3 px-4 text-right">Nominal (Rp)</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/80 dark:divide-zinc-800/60 font-sans">
                {filteredExpenses.map((exp) => {
                  const isIncome = exp.type === 'income';
                  const catConfig = EXPENSE_CATEGORIES.find((c) => c.key === exp.category);
                  const catLabel =
                    exp.category === 'other'
                      ? (exp.customCategory || 'Lainnya')
                      : (catConfig?.label || exp.category);
                  const badgeClass =
                    catConfig?.badgeClass ||
                    'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200';

                  return (
                    <tr
                      key={exp.id}
                      className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors group"
                    >
                      {/* Tanggal */}
                      <td className="py-3 px-4 whitespace-nowrap text-zinc-600 dark:text-zinc-400 font-mono text-[11px]">
                        {formatDate(exp.date)}
                      </td>

                      {/* Kategori Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${badgeClass}`}
                        >
                          {catLabel}
                        </span>
                      </td>

                      {/* Keterangan */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                          {exp.title}
                        </span>
                        {exp.notes && (
                          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block mt-0.5">
                            {exp.notes}
                          </span>
                        )}
                      </td>

                      {/* Terkait Project */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {exp.bookingCode ? (
                          <div className="flex flex-col">
                            <span className="font-mono font-medium text-[10px] text-[#0066CC]">
                              {exp.bookingCode}
                            </span>
                            <span className="text-[11px] text-zinc-700 dark:text-zinc-300 truncate max-w-[160px]">
                              {exp.customerName || 'Klien'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-zinc-400 italic">
                            🏢 Umum Studio
                          </span>
                        )}
                      </td>

                      {/* Metode Bayar */}
                      <td className="py-3 px-4 whitespace-nowrap text-[11px] font-mono text-zinc-600 dark:text-zinc-400 uppercase">
                        {exp.paymentMethod || 'transfer'}
                      </td>

                      {/* Nominal */}
                      <td
                        className={`py-3 px-4 text-right font-mono font-bold whitespace-nowrap text-sm ${
                          isIncome
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {isIncome ? '+' : '-'} {formatCurrency(exp.amount)}
                      </td>

                      {/* Aksi */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100">
                          <button
                            onClick={() => {
                              setEditingExpense(exp);
                              setShowExpenseModal(true);
                            }}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                            title="Edit Transaksi"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(exp)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title="Hapus Transaksi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tambah / Edit Pengeluaran */}
      <ExpenseModal
        isOpen={showExpenseModal}
        onClose={() => {
          setShowExpenseModal(false);
          setEditingExpense(null);
        }}
        onSuccess={handleSuccess}
        editingExpense={editingExpense}
        bookings={bookings}
        isOffline={isOffline}
      />

      {/* Modal Cetak Rekap Laporan PDF */}
      {showReportModal && (
        <FinancePdfReportModal
          expenses={filteredExpenses}
          studioSettings={studioSettings}
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          netProfit={netProfit}
          totalReceivables={periodReceivables}
          monthFilter={monthFilter}
          categoryFilter={categoryFilter}
          formatMonthLabel={formatMonthLabel}
          dateRangeLabel={startDate && endDate ? `${formatDate(startDate)} – ${formatDate(endDate)}` : startDate ? `Mulai ${formatDate(startDate)}` : endDate ? `Sampai ${formatDate(endDate)}` : undefined}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
}

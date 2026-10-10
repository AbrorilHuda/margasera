'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  Calendar,
  Camera,
  Plus,
  Clock,
  ChevronRight,
  ArrowRight,
  WifiOff,
  CalendarClock,
  MapPin,
  MessageCircle,
  CreditCard,
  Wallet,
  CheckCircle2,
} from 'lucide-react';
import { getAllBookings } from '@/lib/actions/bookings';
import { getGalleryProjects } from '@/lib/actions/gallery';
import { getServices, getPackages } from '@/lib/actions/services';
import { getAllExpenses } from '@/lib/actions/finance';
import { cacheMasterData, getCachedMasterData } from '@/lib/offline-queue';
import { getAllLocalBookings, getAllLocalExpenses, saveLocalExpenses, getMasterDataLocal } from '@/lib/offline';
import { formatCurrency, formatDate, getBookingPaidAmount, getBookingRemainingAmount, getWhatsAppUrl } from '@/lib/utils';
import type { Booking, GalleryProject, Service, Package, Expense } from '@/lib/types';
import { MonthlyBookingChart } from './_components/MonthlyBookingChart';
import { ServicePackagePopularityChart } from './_components/ServicePackagePopularityChart';

export default function AdminOverviewPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [projects, setProjects] = useState<GalleryProject[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
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

  const loadData = useCallback(async () => {
    // 1. Tampilkan data dari IndexedDB secara instan jika ada
    try {
      const [localBookings, localExpenses] = await Promise.all([
        getAllLocalBookings(),
        getAllLocalExpenses(),
      ]);
      const [localSrv, localPkg] = await Promise.all([
        getMasterDataLocal<Service[]>('services'),
        getMasterDataLocal<Package[]>('packages'),
      ]);

      if (localBookings.length > 0) setBookings(localBookings);
      if (localExpenses.length > 0) setExpenses(localExpenses);
      if (localSrv && localSrv.length > 0) setServices(localSrv);
      if (localPkg && localPkg.length > 0) setPackages(localPkg);
      if (localBookings.length > 0) setLoading(false);
    } catch {
      const cached = getCachedMasterData();
      if (cached.bookings.length > 0) {
        setBookings(cached.bookings);
        if (cached.services.length > 0) setServices(cached.services);
        if (cached.packages.length > 0) setPackages(cached.packages);
        setLoading(false);
      }
    }

    // 2. Jika online, perbarui data asli dari Supabase di background
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      try {
        const res = await Promise.all([
          getAllBookings(),
          getGalleryProjects(),
          getServices(),
          getPackages(),
          getAllExpenses(),
        ]);
        const bList = res[0];
        const pList = res[1];
        const sList = res[2];
        const pkgList = res[3];
        const expList = res[4];

        // Simpan snapshot ke IndexedDB
        cacheMasterData({
          bookings: bList,
          services: sList,
          packages: pkgList,
        });
        await saveLocalExpenses(expList);

        setBookings(bList);
        setProjects(pList);
        setServices(sList);
        setPackages(pkgList);
        setExpenses(expList);
      } catch (fetchErr) {
        console.warn('[Overview] Gagal mengambil data online, mempertahankan data lokal IndexedDB:', fetchErr);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const realizedRevenue = useMemo(() => bookings.reduce((sum, b) => sum + getBookingPaidAmount(b), 0), [bookings]);
  const pendingReceivables = useMemo(() => bookings.reduce((sum, b) => sum + getBookingRemainingAmount(b), 0), [bookings]);
  const totalExpenses = useMemo(() => expenses.filter((e) => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0), [expenses]);
  const netProfit = realizedRevenue - totalExpenses;
  const confirmedCount = useMemo(() => bookings.filter((b) => b.status === 'confirmed' || b.status === 'completed').length, [bookings]);
  const pendingCount = useMemo(() => bookings.filter((b) => b.status === 'pending').length, [bookings]);

  // Tanggal hari ini format YYYY-MM-DD
  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  // Agenda sesi foto mendatang (Hari ini & kedepan)
  const upcomingBookings = useMemo(() => {
    return bookings
      .filter((b) => b.bookingDate && b.bookingDate >= todayStr && b.status !== 'cancelled')
      .sort((a, b) => a.bookingDate.localeCompare(b.bookingDate))
      .slice(0, 3);
  }, [bookings, todayStr]);

  // Helper WhatsApp link
  const getWhatsAppLink = (phone: string, customerName: string, dateStr: string) => {
    const msg = `Halo Kak ${customerName}, kami dari Studio Margasera ingin mengonfirmasi sesi pemotretan Anda untuk jadwal ${formatDate(dateStr)}.`;
    return getWhatsAppUrl(phone, msg);
  };

  // Helper label tanggal relatif
  const getRelativeDateBadge = (dateStr: string) => {
    if (dateStr === todayStr) {
      return {
        label: 'Hari Ini',
        isToday: true,
        color: 'bg-[#0066CC] text-white shadow-xs',
      };
    }
    const d = new Date(dateStr);
    const now = new Date(todayStr);
    const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diff === 1) {
      return {
        label: 'Besok',
        isToday: false,
        color: 'bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30',
      };
    }
    if (diff === 2) {
      return {
        label: 'Lusa',
        isToday: false,
        color: 'bg-indigo-500/15 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30',
      };
    }
    if (diff <= 7) {
      return {
        label: `${diff} Hari Lagi`,
        isToday: false,
        color: 'bg-amber-500/15 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30',
      };
    }
    return {
      label: formatDate(dateStr),
      isToday: false,
      color: 'bg-blue-50 dark:bg-blue-950/60 text-[#0066CC] dark:text-blue-300 border border-blue-200 dark:border-blue-900/60',
    };
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 sm:h-32 bg-zinc-200/70 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/60 rounded-2xl" />
          ))}
        </div>
        <div className="h-44 bg-zinc-200/70 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/60 rounded-2xl" />
        <div className="h-80 bg-zinc-200/70 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/60 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 sm:gap-8">
      {/* ============================================================
          HEADER GREETING & TODAY'S OPERATIONAL STATUS
          ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
        <div>
          <span className="text-[10px] sm:text-[11px] font-mono tracking-widest text-[#0066CC] uppercase font-semibold">
            {new Date().toLocaleDateString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            Ringkasan Studio Margasera
          </h2>
        </div>

        {/* Operational Attention Badge on Mobile */}
        {pendingCount > 0 ? (
          <Link
            href="/admin/dashboard/bookings?status=pending"
            className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-semibold flex items-center gap-2 active:scale-95 transition-transform shadow-2xs"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>{pendingCount} Pesanan Menunggu DP &rarr;</span>
          </Link>
        ) : (
          <div className="self-start sm:self-auto px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Semua Jadwal Terkonfirmasi</span>
          </div>
        )}
      </div>

      {/* Offline Mode Banner */}
      {isOffline && (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-700 dark:text-amber-400 text-xs font-medium shadow-xs backdrop-blur-xs">
          <WifiOff className="w-4 h-4 shrink-0 text-amber-500 animate-pulse" />
          <span>
            <strong>Mode Offline Aktif</strong> — Menampilkan data lokal IndexedDB ({bookings.length} pesanan). Data akan otomatis disinkronkan saat online.
          </span>
        </div>
      )}

      {/* ============================================================
          1. KEY PERFORMANCE METRICS (Responsive Grid)
          ============================================================ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5">
        {/* Card 1: Kas Masuk Riil */}
        <Link
          href="/admin/dashboard/finance"
          className="col-span-2 sm:col-span-1 p-4 sm:p-5 bg-gradient-to-br from-white to-blue-50/40 dark:from-zinc-900/80 dark:to-blue-950/20 border border-zinc-200/90 dark:border-zinc-800/90 hover:border-[#0066CC]/60 rounded-2xl flex flex-col justify-between gap-2.5 relative overflow-hidden group shadow-xs dark:shadow-lg transition-all active:scale-[0.99]"
        >
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-[10px] sm:text-[11px] font-mono tracking-wider uppercase font-semibold text-zinc-600 dark:text-zinc-300">
              Kas Masuk Riil
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#0066CC]/10 text-[#0066CC] border border-[#0066CC]/30 flex items-center justify-center shrink-0">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="font-sans text-xl sm:text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 block">
              {formatCurrency(realizedRevenue)}
            </span>
            <div className="mt-1 flex items-center justify-between text-[11px] font-medium">
              <span className={netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-rose-600 dark:text-rose-400 font-semibold'}>
                Laba: {formatCurrency(netProfit)}
              </span>
              <span className="text-[#0066CC] font-mono text-[10px] group-hover:translate-x-0.5 transition-transform flex items-center">
                Detail &rarr;
              </span>
            </div>
          </div>
        </Link>

        {/* Card 2: Total Reservasi */}
        <Link
          href="/admin/dashboard/bookings"
          className="p-3.5 sm:p-5 bg-white dark:bg-zinc-900/60 border border-zinc-200/90 dark:border-zinc-800/90 hover:border-[#0066CC]/60 rounded-2xl flex flex-col justify-between gap-2.5 relative overflow-hidden group shadow-xs dark:shadow-lg transition-all active:scale-[0.99]"
        >
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-[10px] sm:text-[11px] font-mono tracking-wider uppercase font-semibold text-zinc-600 dark:text-zinc-300 truncate">
              Total Booking
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-[#0066CC] border border-blue-200 dark:border-blue-900/60 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="font-sans text-lg sm:text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 block">
              {bookings.length} Pesanan
            </span>
            <span className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 font-medium truncate block mt-0.5">
              {confirmedCount} Acara Aktif
            </span>
          </div>
        </Link>

        {/* Card 3: Piutang Klien (Sisa Belum Lunas) */}
        <Link
          href="/admin/dashboard/finance"
          className="p-3.5 sm:p-5 bg-white dark:bg-zinc-900/60 border border-zinc-200/90 dark:border-zinc-800/90 hover:border-amber-500/50 rounded-2xl flex flex-col justify-between gap-2.5 relative overflow-hidden group shadow-xs dark:shadow-lg transition-all active:scale-[0.99]"
        >
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-[10px] sm:text-[11px] font-mono tracking-wider uppercase font-semibold text-zinc-600 dark:text-zinc-300 truncate">
              Sisa Piutang
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60 flex items-center justify-center shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="font-sans text-lg sm:text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 block">
              {formatCurrency(pendingReceivables)}
            </span>
            <span className="text-[10px] sm:text-[11px] text-amber-600 dark:text-amber-400 font-medium truncate block mt-0.5">
              Tagihan belum lunas
            </span>
          </div>
        </Link>

        {/* Card 4: Pengeluaran Studio */}
        <Link
          href="/admin/dashboard/finance"
          className="col-span-2 sm:col-span-1 p-3.5 sm:p-5 bg-white dark:bg-zinc-900/60 border border-zinc-200/90 dark:border-zinc-800/90 hover:border-rose-500/50 rounded-2xl flex flex-col justify-between gap-2.5 relative overflow-hidden group shadow-xs dark:shadow-lg transition-all active:scale-[0.99]"
        >
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-[10px] sm:text-[11px] font-mono tracking-wider uppercase font-semibold text-zinc-600 dark:text-zinc-300">
              Total Pengeluaran
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 flex items-center justify-center shrink-0">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="font-sans text-lg sm:text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 block">
              {formatCurrency(totalExpenses)}
            </span>
            <span className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 font-medium truncate block mt-0.5">
              {expenses.length} Transaksi Kas Keluar
            </span>
          </div>
        </Link>
      </div>

      {/* ============================================================
          2. QUICK ACTIONS (Desain Horizontal Compact & Touch Friendly)
          ============================================================ */}
      <div className="p-4 sm:p-5 bg-white dark:bg-zinc-900/60 border border-zinc-200/90 dark:border-zinc-800/80 rounded-2xl shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-mono tracking-widest text-[#0066CC] uppercase font-semibold">
            Aksi Cepat Admin
          </span>
          <span className="text-[11px] text-zinc-400 font-mono hidden sm:inline">
            Akses Pintas Operasional
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          <Link
            href="/admin/dashboard/bookings?action=new"
            className="p-3 sm:p-3.5 bg-blue-50/70 hover:bg-blue-100/70 dark:bg-blue-950/30 dark:hover:bg-blue-950/50 border border-blue-200/80 dark:border-blue-900/50 rounded-xl flex items-center gap-3 transition-all active:scale-[0.97] group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#0066CC] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <Plus className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                Booking Baru
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono truncate">
                Input Pesanan
              </span>
            </div>
          </Link>

          <Link
            href="/admin/dashboard/finance?action=new"
            className="p-3 sm:p-3.5 bg-emerald-50/70 hover:bg-emerald-100/70 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-900/50 rounded-xl flex items-center gap-3 transition-all active:scale-[0.97] group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <Wallet className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                Catat Biaya
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono truncate">
                Pengeluaran Kas
              </span>
            </div>
          </Link>

          <Link
            href="/admin/dashboard/calendar?action=block"
            className="p-3 sm:p-3.5 bg-amber-50/70 hover:bg-amber-100/70 dark:bg-amber-950/30 dark:hover:bg-amber-950/50 border border-amber-200/80 dark:border-amber-900/50 rounded-xl flex items-center gap-3 transition-all active:scale-[0.97] group"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                Blokir Jadwal
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono truncate">
                Tutup Tanggal
              </span>
            </div>
          </Link>

          <Link
            href="/admin/dashboard/portfolio?action=new"
            className="p-3 sm:p-3.5 bg-purple-50/70 hover:bg-purple-100/70 dark:bg-purple-950/30 dark:hover:bg-purple-950/50 border border-purple-200/80 dark:border-purple-900/50 rounded-xl flex items-center gap-3 transition-all active:scale-[0.97] group"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <Camera className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                Upload Foto
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono truncate">
                Galeri Karya
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* ============================================================
          3. AGENDA SESI FOTO TERDEKAT (Highlight Operasional Mobile)
          ============================================================ */}
      {upcomingBookings.length > 0 && (
        <div className="p-4 sm:p-6 bg-white dark:bg-zinc-900/80 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl flex flex-col gap-3.5 shadow-xs backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#0066CC] dark:text-blue-400 border border-blue-200 dark:border-blue-900/70 flex items-center justify-center shadow-2xs">
                <CalendarClock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#0066CC] dark:text-blue-400 uppercase tracking-wider font-semibold block">
                  Jadwal Operasional
                </span>
                <h3 className="font-sans text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Agenda Sesi Foto Terdekat
                </h3>
              </div>
            </div>

            <Link
              href="/admin/dashboard/calendar"
              className="text-[11px] font-semibold text-[#0066CC] dark:text-blue-400 hover:underline flex items-center gap-0.5 active:scale-95 transition-transform"
            >
              <span>Kalender</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {upcomingBookings.map((b) => {
              const badge = getRelativeDateBadge(b.bookingDate);
              return (
                <div
                  key={b.id}
                  className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 transition-all ${
                    badge.isToday
                      ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-300/80 dark:border-blue-800/80 shadow-xs ring-1 ring-blue-500/20'
                      : 'bg-zinc-50/90 hover:bg-zinc-100/90 dark:bg-zinc-800/40 dark:hover:bg-zinc-800/70 border-zinc-200/90 dark:border-zinc-700/60 shadow-2xs hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider ${badge.color}`}
                    >
                      <Calendar className="w-3 h-3 shrink-0" />
                      <span>{badge.label}</span>
                    </span>

                    <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-700 dark:text-zinc-300 font-medium bg-white/90 dark:bg-zinc-900/90 px-2 py-0.5 rounded-md border border-zinc-200/80 dark:border-zinc-700/70 shadow-2xs">
                      <Clock className="w-3 h-3 text-[#0066CC] dark:text-blue-400 shrink-0" />
                      <span>{b.startTime ? `${b.startTime} WIB` : 'Jadwal Reguler'}</span>
                    </div>
                  </div>

                  <div className="flex flex-col min-w-0">
                    <strong className="text-sm font-bold text-zinc-900 dark:text-zinc-50 truncate">
                      {b.customerName}
                    </strong>
                    <span className="text-xs text-zinc-600 dark:text-zinc-300 truncate mt-0.5">
                      {b.serviceName} {b.packageName ? `• ${b.packageName}` : ''}
                    </span>
                    {b.location && (
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono flex items-center gap-1 truncate mt-1">
                        <MapPin className="w-3 h-3 shrink-0 text-rose-500 dark:text-rose-400" />
                        <span className="truncate">{b.location}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-zinc-200/80 dark:border-zinc-700/60 text-xs">
                    <span className="text-[10px] font-mono font-bold text-[#0066CC] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/70 px-2 py-0.5 rounded-md border border-blue-100 dark:border-blue-900/60">
                      {b.bookingCode}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {b.whatsapp && (
                        <a
                          href={getWhatsAppLink(b.whatsapp, b.customerName, b.bookingDate)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 transition-colors flex items-center gap-1 text-[10px] font-semibold active:scale-95 shadow-2xs"
                          title="Hubungi Klien via WhatsApp"
                        >
                          <MessageCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>WA</span>
                        </a>
                      )}
                      <Link
                        href={`/admin/dashboard/bookings?search=${b.bookingCode}&openDetail=true`}
                        className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-black text-white dark:bg-zinc-700 dark:hover:bg-zinc-600 dark:text-zinc-100 text-[10px] font-semibold transition-all flex items-center gap-1 shadow-2xs active:scale-95"
                      >
                        Detail
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================
          4. GRAFIK BULANAN ANALYTICS
          ============================================================ */}
      <MonthlyBookingChart bookings={bookings} />

      {/* ============================================================
          4b. POPULARITAS LAYANAN & PAKET (SPLIT ANALYTICS)
          ============================================================ */}
      <ServicePackagePopularityChart
        bookings={bookings}
        services={services}
        packages={packages}
      />

      {/* ============================================================
          5. PESANAN TERBARU (DESKTOP TABLE + MOBILE iOS CARDS)
          ============================================================ */}
      <div className="p-4 sm:p-8 bg-white dark:bg-zinc-900/60 border border-zinc-200/90 dark:border-zinc-800/80 rounded-2xl flex flex-col gap-4 shadow-xs dark:shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-[#0066CC] uppercase tracking-widest font-semibold">
              Recent Bookings
            </span>
            <h3 className="font-sans text-base sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">
              Pesanan Terbaru
            </h3>
          </div>
          <Link
            href="/admin/dashboard/bookings"
            className="text-xs text-[#0066CC] hover:underline font-semibold tracking-wide flex items-center gap-1 active:scale-95"
          >
            <span>Semua Booking</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* --- DESKTOP VIEW (Table ≥ 768px) --- */}
        <div className="hidden md:block overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800/80">
          <table className="w-full text-left text-xs font-light">
            <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 text-[#0066CC] font-mono font-medium tracking-[0.2em] uppercase text-[10px]">
              <tr>
                <th className="p-4">Kode Booking</th>
                <th className="p-4">Pelanggan</th>
                <th className="p-4">Layanan</th>
                <th className="p-4">Tanggal Acara</th>
                <th className="p-4">Est. Harga</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
              {bookings.slice(0, 5).map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="p-4 font-mono font-bold text-[#0066CC]">
                    <Link
                      href={`/admin/dashboard/bookings?search=${b.bookingCode}&openDetail=true`}
                      className="hover:underline hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
                    >
                      {b.bookingCode}
                    </Link>
                  </td>
                  <td className="p-4 font-semibold text-zinc-900 dark:text-zinc-100">{b.customerName}</td>
                  <td className="p-4 text-zinc-700 dark:text-zinc-300">{b.serviceName}</td>
                  <td className="p-4 text-zinc-500 dark:text-zinc-400 font-mono">{formatDate(b.bookingDate)}</td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {b.totalPrice ? formatCurrency(b.totalPrice) : '-'}
                      </span>
                      <span className={`text-[10px] font-mono font-medium ${b.paymentStatus === 'paid_full'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : b.paymentStatus === 'dp_paid'
                            ? 'text-[#0066CC]'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}>
                        {b.paymentStatus === 'paid_full'
                          ? 'Lunas'
                          : b.paymentStatus === 'dp_paid'
                            ? `DP: ${formatCurrency(getBookingPaidAmount(b))}`
                            : 'Belum Bayar'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase font-mono tracking-wider font-semibold ${b.status === 'confirmed' || b.status === 'completed'
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30'
                          : b.status === 'cancelled'
                            ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-500/30'
                            : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30'
                        }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${b.status === 'confirmed' || b.status === 'completed'
                            ? 'bg-emerald-500 dark:bg-emerald-400'
                            : b.status === 'cancelled'
                              ? 'bg-rose-500'
                              : 'bg-amber-500'
                          }`}
                      />
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-500 font-light">
                    Belum ada booking terdaftar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- MOBILE VIEW: iOS Ticket Card Style (< 768px) --- */}
        <div className="flex md:hidden flex-col gap-3">
          {bookings.slice(0, 5).map((b) => {
            const initial = b.customerName ? b.customerName.charAt(0).toUpperCase() : 'C';
            const isConfirmed = b.status === 'confirmed' || b.status === 'completed';
            const isCancelled = b.status === 'cancelled';

            return (
              <div
                key={b.id}
                className="p-4 rounded-2xl bg-zinc-50/90 dark:bg-zinc-950/60 border border-zinc-200/90 dark:border-zinc-800/90 hover:border-[#0066CC]/50 flex flex-col gap-3 transition-all shadow-2xs group"
              >
                {/* Header: Code & Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-[#0066CC]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0066CC]" />
                    <span>{b.bookingCode}</span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] uppercase font-mono font-bold ${isConfirmed
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30'
                        : isCancelled
                          ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-500/30'
                          : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30'
                      }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${isConfirmed
                          ? 'bg-emerald-500 dark:bg-emerald-400'
                          : isCancelled
                            ? 'bg-rose-500'
                            : 'bg-amber-500'
                        }`}
                    />
                    {b.status}
                  </span>
                </div>

                {/* Client Info & Service */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold flex items-center justify-center text-xs shrink-0 font-mono shadow-2xs">
                    {initial}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {b.customerName}
                    </span>
                    <span className="text-xs text-zinc-600 dark:text-zinc-400 truncate">
                      {b.serviceName} {b.packageName ? `• ${b.packageName}` : ''}
                    </span>
                  </div>
                </div>

                {/* Date & Location */}
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 dark:text-zinc-400 pt-1">
                  <span className="flex items-center gap-1">
                    📅 {formatDate(b.bookingDate)}
                  </span>
                  {b.location && (
                    <span className="flex items-center gap-1 truncate max-w-[160px]">
                      <MapPin className="w-3 h-3 shrink-0 text-zinc-400" />
                      <span className="truncate">{b.location}</span>
                    </span>
                  )}
                </div>

                {/* Bottom Row: Financial & Quick Actions */}
                <div className="flex items-center justify-between pt-2.5 border-t border-zinc-200/80 dark:border-zinc-800/80">
                  <div className="flex flex-col">
                    <span className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {b.totalPrice ? formatCurrency(b.totalPrice) : '-'}
                    </span>
                    <span className={`text-[10px] font-mono font-semibold ${b.paymentStatus === 'paid_full'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : b.paymentStatus === 'dp_paid'
                          ? 'text-[#0066CC]'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}>
                      {b.paymentStatus === 'paid_full'
                        ? 'Lunas'
                        : b.paymentStatus === 'dp_paid'
                          ? `DP: ${formatCurrency(getBookingPaidAmount(b))}`
                          : 'Belum DP'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {b.whatsapp && (
                      <a
                        href={getWhatsAppLink(b.whatsapp, b.customerName, b.bookingDate)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 text-[10px] font-semibold flex items-center gap-1 active:scale-95 transition-transform"
                      >
                        <MessageCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span>WA</span>
                      </a>
                    )}
                    <Link
                      href={`/admin/dashboard/bookings?search=${b.bookingCode}&openDetail=true`}
                      className="px-3 py-1.5 rounded-lg bg-zinc-200/80 hover:bg-zinc-300/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-[10px] font-semibold flex items-center gap-1 active:scale-95 transition-transform"
                    >
                      <span>Detail</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}

          {bookings.length === 0 && (
            <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 text-center text-zinc-500 text-xs font-light">
              Belum ada booking terdaftar.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

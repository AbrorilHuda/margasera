'use client';

import React, { useState, useMemo } from 'react';
import {
  Layers,
  Flame,
  Trophy,
  TrendingUp,
  Calendar,
  Sparkles,
  PieChart,
  BarChart2,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Loader2,
} from 'lucide-react';
import { formatCurrency, getBookingPaidAmount } from '@/lib/utils';
import { exportAnalyticsToExcel } from '@/lib/export-excel-analytics';
import type { Booking, Service, Package } from '@/lib/types';

interface ServicePackagePopularityChartProps {
  bookings: Booking[];
  services: Service[];
  packages: Package[];
}

interface PackageStat {
  packageId: string;
  packageName: string;
  count: number;
  revenue: number;
  percentageOfService: number;
  isBestSeller: boolean;
}

interface ServiceStat {
  serviceId: string;
  serviceName: string;
  count: number;
  revenue: number;
  percentageOfTotal: number;
  packages: PackageStat[];
  topPackageName?: string;
}

// Palet warna modern untuk irisan Donut Chart & Legenda Paket
const PACKAGE_COLORS = [
  '#0066CC', // 1. Royal Blue (Primary Brand)
  '#10B981', // 2. Emerald Green
  '#F59E0B', // 3. Amber Gold
  '#8B5CF6', // 4. Purple
  '#EC4899', // 5. Pink / Rose
  '#06B6D4', // 6. Cyan / Teal
  '#64748B', // 7. Slate Grey
];

export function ServicePackagePopularityChart({
  bookings,
  services,
  packages,
}: ServicePackagePopularityChartProps) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number | 'all'>(currentYear);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [showAllServices, setShowAllServices] = useState(false);
  const [hoveredPkgIndex, setHoveredPkgIndex] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      await exportAnalyticsToExcel({
        selectedYear,
        bookings,
        services,
        packages,
      });
    } catch (err) {
      console.error('Failed to export excel:', err);
      alert('Gagal mengekspor file Excel. Silakan coba beberapa saat lagi.');
    } finally {
      setIsExporting(false);
    }
  };

  // Ambil daftar tahun dari data booking
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    years.add(currentYear);
    bookings.forEach((b) => {
      const dateStr = b.bookingDate || b.createdAt;
      if (dateStr) {
        const y = parseInt(dateStr.substring(0, 4), 10);
        if (!isNaN(y) && y > 2000 && y < 2100) {
          years.add(y);
        }
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [bookings, currentYear]);

  // Kalkulasi data analitik per Layanan & Paket
  const {
    serviceStats,
    totalBookingsInYear,
    totalRevenueInYear,
    topService,
    maxServiceCount,
  } = useMemo(() => {
    const validBookings = bookings.filter((b) => {
      if (b.status === 'cancelled') return false;
      if (selectedYear === 'all') return true;
      const dateStr = b.bookingDate || b.createdAt;
      if (!dateStr) return false;
      return parseInt(dateStr.substring(0, 4), 10) === selectedYear;
    });

    const totalBookings = validBookings.length;
    let totalRev = 0;

    const serviceMap = new Map<
      string,
      {
        serviceId: string;
        serviceName: string;
        count: number;
        revenue: number;
        packageMap: Map<string, { packageName: string; count: number; revenue: number }>;
      }
    >();

    validBookings.forEach((b) => {
      const paid = getBookingPaidAmount(b) || b.totalPrice || 0;
      totalRev += paid;

      const sId = b.serviceId || 'unknown_service';
      const matchedSrv = services.find((s) => s.id === b.serviceId || s.slug === b.serviceId);
      const sName = b.serviceName || matchedSrv?.name || 'Layanan Lainnya';

      if (!serviceMap.has(sId)) {
        serviceMap.set(sId, {
          serviceId: sId,
          serviceName: sName,
          count: 0,
          revenue: 0,
          packageMap: new Map(),
        });
      }

      const sEntry = serviceMap.get(sId)!;
      sEntry.count += 1;
      sEntry.revenue += paid;

      const pId = b.packageId || 'unknown_package';
      const matchedPkg = packages.find((p) => p.id === b.packageId || p.slug === b.packageId);
      const pName = b.packageName || matchedPkg?.name || 'Paket Reguler';

      if (!sEntry.packageMap.has(pId)) {
        sEntry.packageMap.set(pId, {
          packageName: pName,
          count: 0,
          revenue: 0,
        });
      }

      const pEntry = sEntry.packageMap.get(pId)!;
      pEntry.count += 1;
      pEntry.revenue += paid;
    });

    let maxCount = 1;
    const sortedServices: ServiceStat[] = Array.from(serviceMap.values())
      .map((s) => {
        if (s.count > maxCount) maxCount = s.count;

        const sortedPackages: PackageStat[] = Array.from(s.packageMap.entries())
          .map(([pkgId, p]) => ({
            packageId: pkgId,
            packageName: p.packageName,
            count: p.count,
            revenue: p.revenue,
            percentageOfService: s.count > 0 ? Math.round((p.count / s.count) * 100) : 0,
            isBestSeller: false,
          }))
          .sort((a, b) => b.count - a.count || b.revenue - a.revenue);

        if (sortedPackages.length > 0 && sortedPackages[0].count > 0) {
          sortedPackages[0].isBestSeller = true;
        }

        return {
          serviceId: s.serviceId,
          serviceName: s.serviceName,
          count: s.count,
          revenue: s.revenue,
          percentageOfTotal: totalBookings > 0 ? Math.round((s.count / totalBookings) * 100) : 0,
          packages: sortedPackages,
          topPackageName: sortedPackages[0]?.packageName,
        };
      })
      .sort((a, b) => b.count - a.count || b.revenue - a.revenue);

    return {
      serviceStats: sortedServices,
      totalBookingsInYear: totalBookings,
      totalRevenueInYear: totalRev,
      topService: sortedServices[0] || null,
      maxServiceCount: maxCount,
    };
  }, [bookings, services, packages, selectedYear]);

  // Layanan yang sedang aktif/dipilih oleh user (default: peringkat #1)
  const activeService = useMemo(() => {
    if (!serviceStats || serviceStats.length === 0) return null;
    if (!selectedServiceId) return serviceStats[0];
    const found = serviceStats.find((s) => s.serviceId === selectedServiceId);
    return found || serviceStats[0];
  }, [serviceStats, selectedServiceId]);

  // Daftar layanan yang ditampilkan (Top 5 atau Semua)
  const displayedServices = useMemo(() => {
    if (showAllServices || serviceStats.length <= 5) {
      return serviceStats;
    }
    return serviceStats.slice(0, 5);
  }, [serviceStats, showAllServices]);

  // Kalkulasi Irisan Donut Chart untuk Paket di activeService
  // Radius: 60, Keliling C = 2 * PI * 60 ≈ 376.99
  const DONUT_RADIUS = 60;
  const CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;

  const donutSlices = useMemo(() => {
    if (!activeService || activeService.count === 0 || activeService.packages.length === 0) {
      return [];
    }

    let cumulativePercentage = 0;

    return activeService.packages.map((pkg, index) => {
      const share = pkg.count / activeService.count;
      const strokeLength = share * CIRCUMFERENCE;
      const strokeDasharray = `${strokeLength} ${CIRCUMFERENCE - strokeLength}`;
      const strokeDashoffset = -(cumulativePercentage * CIRCUMFERENCE);

      cumulativePercentage += share;

      return {
        ...pkg,
        color: PACKAGE_COLORS[index % PACKAGE_COLORS.length],
        strokeDasharray,
        strokeDashoffset,
      };
    });
  }, [activeService, CIRCUMFERENCE]);

  // Info yang ditampilkan di tengah lubang Donut Chart
  const donutCenterInfo = useMemo(() => {
    if (!activeService || activeService.count === 0) {
      return { title: '0 Pesanan', subtitle: 'Belum ada data', badge: null };
    }

    if (hoveredPkgIndex !== null && donutSlices[hoveredPkgIndex]) {
      const target = donutSlices[hoveredPkgIndex];
      return {
        title: `${target.percentageOfService}%`,
        subtitle: target.packageName,
        detail: `${target.count} pesanan`,
        badge: target.isBestSeller ? '🔥 Best Seller' : null,
      };
    }

    const bestSeller = activeService.packages.find((p) => p.isBestSeller);
    return {
      title: `${activeService.count}`,
      subtitle: 'Total Order',
      detail: bestSeller ? `Best: ${bestSeller.packageName}` : undefined,
      badge: bestSeller ? '🔥 Best Seller' : null,
    };
  }, [activeService, hoveredPkgIndex, donutSlices]);

  return (
    <div className="p-4 sm:p-6 lg:p-7 bg-white dark:bg-zinc-900/60 border border-zinc-200/90 dark:border-zinc-800/80 rounded-2xl shadow-xs dark:shadow-xl flex flex-col gap-6">
      {/* ============================================================
          HEADER & KONTROL TAHUN
          ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#0066CC] dark:text-blue-400">
              <Trophy className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-mono text-[#0066CC] dark:text-blue-400 uppercase tracking-widest font-semibold">
              Performance Analytics
            </span>
          </div>
          <h3 className="font-sans text-base sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mt-0.5">
            Grafik Layanan &amp; Paket Terlaris
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-light mt-0.5">
            Visualisasi perbandingan order layanan &amp; diagram komposisi paket terpopuler
          </p>
        </div>

        {/* Kontrol Kanan: Tombol Export Excel & Filter Tahun */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Tombol Export Excel */}
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all shadow-2xs active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Download Laporan Excel Lengkap (.xlsx) dengan Gambar Grafik & Analisis 0 Order"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Mengekspor...</span>
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Export Excel (.xlsx)</span>
              </>
            )}
          </button>

          {/* Filter Periode Tahun */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700/80 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={selectedYear}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedYear(val === 'all' ? 'all' : parseInt(val, 10));
              }}
              className="text-xs font-mono font-semibold bg-transparent border-none text-zinc-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
            >
              {availableYears.map((y) => (
                <option key={y} value={y} className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">
                  Tahun {y}
                </option>
              ))}
              <option value="all" className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">
                Semua Periode (All Time)
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* ============================================================
          RINGKASAN METRIK CEPAT (3 CARDS)
          ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/70 dark:border-zinc-800/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-[#0066CC] dark:text-blue-400 flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono uppercase tracking-wider block">Total Booking</span>
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-mono">
              {totalBookingsInYear} <span className="text-xs font-normal text-zinc-400">Order</span>
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/70 dark:border-zinc-800/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Flame className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono uppercase tracking-wider block">Layanan Paling Ramai</span>
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate block" title={topService?.serviceName || '-'}>
              {topService?.serviceName || '-'}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/70 dark:border-zinc-800/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono uppercase tracking-wider block">Estimasi Omset</span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {formatCurrency(totalRevenueInYear)}
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================
          MAIN DATA VISUALIZATION
          KIRI: Ranked Horizontal Bar Chart (Services)
          KANAN: Donut Chart (Packages of Selected Service)
          ============================================================ */}
      {serviceStats.length === 0 ? (
        <div className="p-12 text-center flex flex-col items-center justify-center gap-2 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
          <Layers className="w-8 h-8 text-zinc-300 dark:text-zinc-600" />
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Belum ada data pesanan pada periode {selectedYear === 'all' ? 'ini' : selectedYear}
          </p>
          <span className="text-xs text-zinc-400">Grafik akan terisi otomatis begitu ada pesanan baru.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* --------------------------------------------------------
              KOLOM KIRI: RANKED HORIZONTAL BAR CHART (LAYANAN)
              -------------------------------------------------------- */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase font-mono tracking-wider flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-[#0066CC]" />
                Grafik Volume Layanan
              </span>
              <span className="text-[11px] text-zinc-400 font-light">
                Klik batang untuk melihat paket di kanan
              </span>
            </div>

            {/* Container Bar Chart */}
            <div className="p-4 rounded-xl border border-zinc-200/90 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/50 flex flex-col gap-3.5">
              {displayedServices.map((srv, index) => {
                const isSelected = activeService?.serviceId === srv.serviceId;
                const widthPercent = maxServiceCount > 0
                  ? Math.max(Math.round((srv.count / maxServiceCount) * 100), 10)
                  : 10;

                const isTop1 = index === 0;

                return (
                  <div
                    key={srv.serviceId}
                    onClick={() => setSelectedServiceId(srv.serviceId)}
                    className={`p-2.5 rounded-xl transition-all cursor-pointer border flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-blue-50/80 dark:bg-blue-950/40 border-[#0066CC] dark:border-blue-600 shadow-xs ring-1 ring-[#0066CC]/30'
                        : 'bg-white dark:bg-zinc-900 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/60 border-zinc-200/70 dark:border-zinc-800/70'
                    }`}
                  >
                    {/* Header Bar: Nama Layanan & Angka */}
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-5 h-5 rounded-md text-[10px] font-mono font-bold flex items-center justify-center shrink-0 ${
                            isTop1
                              ? 'bg-amber-500 text-white'
                              : index === 1
                              ? 'bg-slate-500 text-white'
                              : index === 2
                              ? 'bg-orange-500 text-white'
                              : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                          }`}
                        >
                          #{index + 1}
                        </span>
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 truncate">
                          {srv.serviceName}
                        </span>
                        {isTop1 && (
                          <span className="hidden sm:inline-flex px-1.5 py-0.2 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[9px] font-mono font-bold uppercase items-center gap-0.5 shrink-0">
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>Terlaris</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0 font-mono">
                        <strong
                          className={`text-xs ${
                            isSelected ? 'text-[#0066CC] dark:text-blue-400 font-extrabold' : 'text-zinc-900 dark:text-zinc-100'
                          }`}
                        >
                          {srv.count} Order
                        </strong>
                        <span className="text-[11px] text-zinc-400 hidden sm:inline">
                          ({srv.percentageOfTotal}%)
                        </span>
                      </div>
                    </div>

                    {/* Batang Grafik Horizontal Nyata (Visual Chart Bar) */}
                    <div className="w-full h-3.5 rounded-full bg-zinc-100 dark:bg-zinc-800/80 overflow-hidden relative">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-1.5 ${
                          isSelected
                            ? 'bg-gradient-to-r from-blue-600 to-[#0066CC] shadow-inner'
                            : 'bg-gradient-to-r from-blue-400/80 to-blue-500/80 hover:from-blue-500 hover:to-blue-600'
                        }`}
                        style={{ width: `${widthPercent}%` }}
                      >
                        {widthPercent > 25 && (
                          <span className="text-[9px] font-mono font-bold text-white leading-none drop-shadow-xs">
                            {srv.count}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Sub Keterangan: Omset */}
                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
                      <span className="truncate">
                        Paket dominan: <strong className="text-zinc-700 dark:text-zinc-300 font-normal">{srv.topPackageName || '-'}</strong>
                      </span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                        {formatCurrency(srv.revenue)}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Sumbu Skala Bawah (Grid scale indicator) */}
              <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between text-[9px] font-mono text-zinc-400">
                <span>0 pesanan</span>
                <span>{Math.round(maxServiceCount / 2)} pesanan</span>
                <span>Maks: {maxServiceCount} pesanan</span>
              </div>

              {/* Tombol Expand/Collapse jika Layanan > 5 */}
              {serviceStats.length > 5 && (
                <button
                  type="button"
                  onClick={() => setShowAllServices(!showAllServices)}
                  className="mt-1 w-full py-2 px-3 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-all flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer"
                >
                  {showAllServices ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5" />
                      <span>Tutup (Tampilkan Top 5 Saja)</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5" />
                      <span>Lihat Semua ({serviceStats.length} Layanan)</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* --------------------------------------------------------
              KOLOM KANAN: DONUT CHART (DIAGRAM LINGKARAN PAKET)
              -------------------------------------------------------- */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase font-mono tracking-wider flex items-center gap-1.5">
                <PieChart className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Komposisi Paket (Donut Chart)
              </span>
              <span className="text-[11px] text-zinc-400 font-mono truncate max-w-[130px]" title={activeService?.serviceName}>
                {activeService?.serviceName}
              </span>
            </div>

            {/* Container Donut Chart */}
            <div className="p-4 rounded-xl border border-zinc-200/90 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/50 flex flex-col items-center gap-4">
              {/* Header Layanan Aktif */}
              <div className="w-full flex items-center justify-between pb-3 border-b border-zinc-200/60 dark:border-zinc-800/60">
                <div className="min-w-0">
                  <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block">Layanan Terpilih</span>
                  <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                    {activeService?.serviceName}
                  </h4>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block">Subtotal</span>
                  <span className="text-xs font-mono font-bold text-[#0066CC] dark:text-blue-400">
                    {activeService?.count} Order
                  </span>
                </div>
              </div>

              {/* Donut SVG Element */}
              {!activeService || activeService.count === 0 || donutSlices.length === 0 ? (
                <div className="py-10 text-center text-xs text-zinc-400">
                  Belum ada pesanan pada layanan ini.
                </div>
              ) : (
                <div className="relative flex items-center justify-center my-1">
                  <svg
                    width="190"
                    height="190"
                    viewBox="0 0 160 160"
                    className="transform -rotate-90 drop-shadow-xs"
                  >
                    {/* Background Ring */}
                    <circle
                      cx="80"
                      cy="80"
                      r={DONUT_RADIUS}
                      stroke="currentColor"
                      strokeWidth="22"
                      fill="transparent"
                      className="text-zinc-200/70 dark:text-zinc-800"
                    />

                    {/* Donut Slices */}
                    {donutSlices.map((slice, idx) => {
                      const isHovered = hoveredPkgIndex === idx;

                      return (
                        <circle
                          key={slice.packageId}
                          cx="80"
                          cy="80"
                          r={DONUT_RADIUS}
                          stroke={slice.color}
                          strokeWidth={isHovered ? 26 : 22}
                          strokeDasharray={slice.strokeDasharray}
                          strokeDashoffset={slice.strokeDashoffset}
                          fill="transparent"
                          strokeLinecap="round"
                          className="transition-all duration-300 cursor-pointer"
                          onMouseEnter={() => setHoveredPkgIndex(idx)}
                          onMouseLeave={() => setHoveredPkgIndex(null)}
                        />
                      );
                    })}
                  </svg>

                  {/* Konten di Lubang Tengah Donut */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
                    {donutCenterInfo.badge && (
                      <span className="text-[9px] font-mono font-bold text-rose-600 dark:text-rose-400 uppercase tracking-tight mb-0.5">
                        {donutCenterInfo.badge}
                      </span>
                    )}
                    <span className="text-lg sm:text-xl font-mono font-extrabold text-zinc-900 dark:text-zinc-100 leading-tight">
                      {donutCenterInfo.title}
                    </span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium truncate max-w-[100px]">
                      {donutCenterInfo.subtitle}
                    </span>
                    {donutCenterInfo.detail && (
                      <span className="text-[9px] font-mono text-[#0066CC] dark:text-blue-400 font-semibold truncate max-w-[100px]">
                        {donutCenterInfo.detail}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Legenda & Rincian Paket di Bawah Donut */}
              {donutSlices.length > 0 && (
                <div className="w-full flex flex-col gap-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60">
                  <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider flex items-center justify-between pb-0.5">
                    <span>Rincian Paket</span>
                    <span>Order / Omset</span>
                  </div>

                  <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto pr-1">
                    {donutSlices.map((slice, idx) => {
                      const isHovered = hoveredPkgIndex === idx;

                      return (
                        <div
                          key={slice.packageId}
                          onMouseEnter={() => setHoveredPkgIndex(idx)}
                          onMouseLeave={() => setHoveredPkgIndex(null)}
                          className={`p-2 rounded-lg transition-all border flex items-center justify-between gap-2 cursor-pointer ${
                            isHovered
                              ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 shadow-xs'
                              : 'bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800'
                          }`}
                        >
                          {/* Dot Warna & Nama Paket */}
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
                              style={{ backgroundColor: slice.color }}
                            />
                            <div className="min-w-0 flex flex-col">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                                  {slice.packageName}
                                </span>
                                {slice.isBestSeller && (
                                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-[8px] font-mono font-bold uppercase shrink-0">
                                    Best Seller
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] font-mono text-zinc-400">
                                Kontribusi: {slice.percentageOfService}%
                              </span>
                            </div>
                          </div>

                          {/* Angka & Omset */}
                          <div className="text-right shrink-0 font-mono">
                            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                              {slice.count} Order
                            </div>
                            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                              {formatCurrency(slice.revenue)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

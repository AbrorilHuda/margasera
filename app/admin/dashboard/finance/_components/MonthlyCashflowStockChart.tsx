'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Sparkles,
} from 'lucide-react';
import { formatCurrency, getBookingPaidAmount } from '@/lib/utils';
import type { Booking, Expense } from '@/lib/types';

interface MonthlyCashflowStockChartProps {
  bookings: Booking[];
  expenses: Expense[];
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

/**
 * Menghasilkan SVG Smooth Cubic Bezier Path dari serangkaian koordinat (x, y)
 */
function getSmoothBezierPath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i > 0 ? points[i - 1] : points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i !== points.length - 2 ? points[i + 2] : p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  return d;
}

export function MonthlyCashflowStockChart({
  bookings,
  expenses,
}: MonthlyCashflowStockChartProps) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [activeMonthIdx, setActiveMonthIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Ambil daftar tahun unik dari data bookings dan expenses
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    years.add(currentYear);

    bookings.forEach((b) => {
      const d = b.bookingDate || b.createdAt;
      if (d) {
        const y = parseInt(d.substring(0, 4), 10);
        if (!isNaN(y) && y > 2000 && y < 2100) years.add(y);
      }
    });

    expenses.forEach((e) => {
      const d = e.date || e.createdAt;
      if (d) {
        const y = parseInt(d.substring(0, 4), 10);
        if (!isNaN(y) && y > 2000 && y < 2100) years.add(y);
      }
    });

    return Array.from(years).sort((a, b) => b - a);
  }, [bookings, expenses, currentYear]);

  // Kalkulasi data 12 bulan untuk Pemasukan (Hijau) vs Pengeluaran (Merah)
  const {
    monthlySeries,
    yearTotalIncome,
    yearTotalExpense,
    yearNetProfit,
    yearMargin,
    maxVal,
    bestMonth,
  } = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => ({
      monthIndex: i,
      name: MONTH_NAMES[i],
      shortName: MONTH_SHORT[i],
      income: 0,
      expense: 0,
      netProfit: 0,
    }));

    let totInc = 0;
    let totExp = 0;

    // 1. Pemasukan dari Booking (uang riil diterima)
    bookings.forEach((b) => {
      if (b.status === 'cancelled') return;
      const d = b.bookingDate || b.createdAt;
      if (!d) return;

      const y = parseInt(d.substring(0, 4), 10);
      if (y !== selectedYear) return;

      const m = parseInt(d.substring(5, 7), 10) - 1;
      if (m >= 0 && m < 12) {
        const paid = getBookingPaidAmount(b);
        months[m].income += paid;
        totInc += paid;
      }
    });

    // 2. Transaksi dari Expenses (Pemasukan manual & Beban Pengeluaran)
    expenses.forEach((e) => {
      const d = e.date || e.createdAt;
      if (!d) return;

      const y = parseInt(d.substring(0, 4), 10);
      if (y !== selectedYear) return;

      const m = parseInt(d.substring(5, 7), 10) - 1;
      if (m >= 0 && m < 12) {
        if (e.type === 'income') {
          months[m].income += e.amount;
          totInc += e.amount;
        } else if (e.type === 'expense') {
          months[m].expense += e.amount;
          totExp += e.amount;
        }
      }
    });

    let highestProfit = -Infinity;
    let peakM = months[0];
    let ceilingVal = 100000;

    months.forEach((m) => {
      m.netProfit = m.income - m.expense;
      if (m.income > ceilingVal) ceilingVal = m.income;
      if (m.expense > ceilingVal) ceilingVal = m.expense;

      if (m.netProfit > highestProfit && m.income > 0) {
        highestProfit = m.netProfit;
        peakM = m;
      }
    });

    const net = totInc - totExp;
    const margin = totInc > 0 ? (net / totInc) * 100 : 0;

    return {
      monthlySeries: months,
      yearTotalIncome: totInc,
      yearTotalExpense: totExp,
      yearNetProfit: net,
      yearMargin: margin,
      maxVal: ceilingVal * 1.15, // Headroom 15%
      bestMonth: highestProfit > 0 ? peakM : null,
    };
  }, [bookings, expenses, selectedYear]);

  // Dimensi SVG Grafik
  const svgWidth = 900;
  const svgHeight = 280;
  const paddingX = 40;
  const paddingTop = 30;
  const paddingBottom = 40;
  const plotWidth = svgWidth - paddingX * 2;
  const plotHeight = svgHeight - paddingTop - paddingBottom;

  // Koordinat X & Y untuk Pemasukan (Hijau) dan Pengeluaran (Merah)
  const { incomePoints, expensePoints } = useMemo(() => {
    const incPts = monthlySeries.map((m, i) => {
      const x = paddingX + (i / 11) * plotWidth;
      const y = paddingTop + plotHeight - (m.income / maxVal) * plotHeight;
      return { x, y, data: m };
    });

    const expPts = monthlySeries.map((m, i) => {
      const x = paddingX + (i / 11) * plotWidth;
      const y = paddingTop + plotHeight - (m.expense / maxVal) * plotHeight;
      return { x, y, data: m };
    });

    return { incomePoints: incPts, expensePoints: expPts };
  }, [monthlySeries, maxVal, plotWidth, plotHeight, paddingX, paddingTop]);

  // Path SVG Garis & Area Bergradasi
  const incomeLinePath = useMemo(() => getSmoothBezierPath(incomePoints), [incomePoints]);
  const expenseLinePath = useMemo(() => getSmoothBezierPath(expensePoints), [expensePoints]);

  const incomeAreaPath = useMemo(() => {
    if (incomePoints.length === 0) return '';
    const last = incomePoints[incomePoints.length - 1];
    const first = incomePoints[0];
    const baselineY = paddingTop + plotHeight;
    return `${incomeLinePath} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;
  }, [incomeLinePath, incomePoints, paddingTop, plotHeight]);

  const expenseAreaPath = useMemo(() => {
    if (expensePoints.length === 0) return '';
    const last = expensePoints[expensePoints.length - 1];
    const first = expensePoints[0];
    const baselineY = paddingTop + plotHeight;
    return `${expenseLinePath} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;
  }, [expenseLinePath, expensePoints, paddingTop, plotHeight]);

  // Handler pelacakan mouse / sentuhan jari di seluruh permukaan grafik
  const handlePointerMove = (clientX: number) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    const svgX = ratio * svgWidth;
    const relX = svgX - paddingX;
    const idx = Math.round((relX / plotWidth) * 11);
    const clamped = Math.max(0, Math.min(11, idx));
    setActiveMonthIdx(clamped);
  };

  // Data bulan yang sedang aktif
  const currentHoveredData = activeMonthIdx !== null ? monthlySeries[activeMonthIdx] : null;
  const activePtX = activeMonthIdx !== null ? paddingX + (activeMonthIdx / 11) * plotWidth : null;

  // Persentase posisi Tooltip (dengan batas clamp 14% s/d 86% agar tidak terpotong tepi layar)
  const tooltipLeftPercent = activePtX !== null
    ? Math.max(14, Math.min(86, (activePtX / svgWidth) * 100))
    : 50;

  return (
    <div className="p-4 sm:p-7 bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-xs dark:shadow-xl flex flex-col gap-6 transition-colors">
      {/* ============================================================
          HEADER & KONTROL TAHUN
          ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800/60">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <Activity className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-semibold">
              Stock-Style Cashflow Analytics
            </span>
          </div>
          <h3 className="font-sans text-base sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Grafik Tren Arus Kas Bulanan
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-light">
            Kurva pergerakan kas masuk riil (hijau) vs beban pengeluaran (merah) sepanjang tahun {selectedYear}
          </p>
        </div>

        {/* Filter Periode Tahun */}
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-[#0066CC]" />
            <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 font-medium">Tahun:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="text-xs font-mono font-bold bg-transparent border-none text-zinc-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
            >
              {availableYears.map((y) => (
                <option key={y} value={y} className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">
                  {y} {y === currentYear ? '(Tahun Ini)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ============================================================
          METRIK TAHUNAN ALA SAHAM (TOTAL INCOME, EXPENSE, NET PROFIT)
          ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Pemasukan */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-zinc-50/80 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">
                {currentHoveredData ? `Pemasukan (${currentHoveredData.shortName})` : `Total Pemasukan (${selectedYear})`}
              </span>
            </div>
            <strong className="text-base sm:text-xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
              {formatCurrency(currentHoveredData ? currentHoveredData.income : yearTotalIncome)}
            </strong>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ArrowDownRight className="w-4 h-4" />
          </div>
        </div>

        {/* Pengeluaran */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-zinc-50/80 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-xs" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">
                {currentHoveredData ? `Pengeluaran (${currentHoveredData.shortName})` : `Total Pengeluaran (${selectedYear})`}
              </span>
            </div>
            <strong className="text-base sm:text-xl font-extrabold font-mono text-rose-600 dark:text-rose-400 mt-1">
              {formatCurrency(currentHoveredData ? currentHoveredData.expense : yearTotalExpense)}
            </strong>
          </div>
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        {/* Laba Bersih */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-zinc-50/80 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">
                {currentHoveredData ? `Laba Bersih (${currentHoveredData.shortName})` : 'Laba Bersih Tahunan'}
              </span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold uppercase ${
                  (currentHoveredData ? currentHoveredData.netProfit : yearNetProfit) >= 0
                    ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                    : 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
                }`}
              >
                {(currentHoveredData ? currentHoveredData.netProfit : yearNetProfit) >= 0 ? 'Surplus' : 'Defisit'}
              </span>
            </div>
            <strong
              className={`text-base sm:text-xl font-extrabold font-mono mt-1 ${
                (currentHoveredData ? currentHoveredData.netProfit : yearNetProfit) >= 0
                  ? 'text-zinc-900 dark:text-zinc-100'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {formatCurrency(currentHoveredData ? currentHoveredData.netProfit : yearNetProfit)}
            </strong>
          </div>
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              (currentHoveredData ? currentHoveredData.netProfit : yearNetProfit) >= 0
                ? 'bg-blue-500/10 text-[#0066CC] dark:text-blue-400'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
            }`}
          >
            {(currentHoveredData ? currentHoveredData.netProfit : yearNetProfit) >= 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
          </div>
        </div>
      </div>

      {/* ============================================================
          MAIN STOCK-STYLE AREA/LINE CHART (SVG)
          ============================================================ */}
      <div className="relative flex flex-col gap-2 pt-2">
        {/* Floating Tooltip Card saat Hover (Terlihat Sempurna di Mode Siang & Mode Malam) */}
        {currentHoveredData && activePtX !== null && (
          <div
            className="absolute top-1 z-30 pointer-events-none transform -translate-x-1/2 transition-all duration-100"
            style={{ left: `${tooltipLeftPercent}%` }}
          >
            <div className="p-3 rounded-xl bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 shadow-xl dark:shadow-2xl flex flex-col gap-1.5 min-w-[185px]">
              {/* Header Tooltip */}
              <div className="flex items-center justify-between pb-1.5 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100">
                  {currentHoveredData.name} {selectedYear}
                </span>
                <span
                  className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                    currentHoveredData.netProfit >= 0
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                  }`}
                >
                  {currentHoveredData.netProfit >= 0 ? 'Surplus' : 'Defisit'}
                </span>
              </div>

              {/* Baris Kas Masuk */}
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" /> Kas Masuk:
                </span>
                <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                  {formatCurrency(currentHoveredData.income)}
                </strong>
              </div>

              {/* Baris Kas Keluar */}
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" /> Kas Keluar:
                </span>
                <strong className="text-rose-600 dark:text-rose-400 font-bold">
                  {formatCurrency(currentHoveredData.expense)}
                </strong>
              </div>

              {/* Baris Laba Bersih */}
              <div className="pt-1.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-600 dark:text-zinc-300 font-medium">Laba Bersih:</span>
                <strong
                  className={`font-bold ${
                    currentHoveredData.netProfit >= 0
                      ? 'text-zinc-900 dark:text-zinc-100'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {currentHoveredData.netProfit >= 0 ? '+' : ''}
                  {formatCurrency(currentHoveredData.netProfit)}
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* SVG Container Interaktif */}
        <div className="w-full overflow-hidden select-none relative">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-64 sm:h-72 cursor-crosshair"
            onMouseMove={(e) => handlePointerMove(e.clientX)}
            onTouchMove={(e) => {
              if (e.touches[0]) handlePointerMove(e.touches[0].clientX);
            }}
            onMouseLeave={() => setActiveMonthIdx(null)}
            onTouchEnd={() => setActiveMonthIdx(null)}
          >
            <defs>
              {/* Gradasi Hijau untuk Area Pemasukan */}
              <linearGradient id="incomeAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                <stop offset="60%" stopColor="#10B981" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
              </linearGradient>

              {/* Gradasi Merah untuk Area Pengeluaran */}
              <linearGradient id="expenseAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EF4444" stopOpacity="0.25" />
                <stop offset="60%" stopColor="#EF4444" stopOpacity="0.06" />
                <stop offset="100%" stopColor="#EF4444" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Lines Horizontal Halus */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = paddingTop + plotHeight * ratio;
              return (
                <line
                  key={ratio}
                  x1={paddingX}
                  y1={y}
                  x2={svgWidth - paddingX}
                  y2={y}
                  stroke="currentColor"
                  strokeDasharray="4 4"
                  className="text-zinc-200 dark:text-zinc-800"
                  strokeWidth="1"
                />
              );
            })}

            {/* Area Pemasukan (Hijau) */}
            <path
              d={incomeAreaPath}
              fill="url(#incomeAreaGrad)"
              className="transition-all duration-300 pointer-events-none"
            />

            {/* Area Pengeluaran (Merah) */}
            <path
              d={expenseAreaPath}
              fill="url(#expenseAreaGrad)"
              className="transition-all duration-300 pointer-events-none"
            />

            {/* Garis Kurva Pengeluaran (Merah) */}
            <path
              d={expenseLinePath}
              fill="none"
              stroke="#EF4444"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="drop-shadow-sm transition-all duration-300 pointer-events-none"
            />

            {/* Garis Kurva Pemasukan (Hijau) */}
            <path
              d={incomeLinePath}
              fill="none"
              stroke="#10B981"
              strokeWidth="3"
              strokeLinecap="round"
              className="drop-shadow-sm transition-all duration-300 pointer-events-none"
            />

            {/* Garis Pandu Crosshair Vertikal saat Hover */}
            {activePtX !== null && (
              <line
                x1={activePtX}
                y1={paddingTop}
                x2={activePtX}
                y2={paddingTop + plotHeight}
                stroke="currentColor"
                strokeDasharray="3 3"
                className="text-zinc-400 dark:text-zinc-500 pointer-events-none"
                strokeWidth="1.5"
              />
            )}

            {/* Titik Node Bulat pada Kurva */}
            {monthlySeries.map((m, idx) => {
              const incPt = incomePoints[idx];
              const expPt = expensePoints[idx];
              const isHovered = activeMonthIdx === idx;

              return (
                <g key={m.monthIndex} className="pointer-events-none">
                  {/* Outer Glow Ring saat Hover */}
                  {isHovered && (
                    <>
                      <circle
                        cx={incPt.x}
                        cy={incPt.y}
                        r={10}
                        fill="#10B981"
                        opacity={0.25}
                      />
                      <circle
                        cx={expPt.x}
                        cy={expPt.y}
                        r={10}
                        fill="#EF4444"
                        opacity={0.25}
                      />
                    </>
                  )}

                  {/* Titik Pemasukan (Hijau) */}
                  <circle
                    cx={incPt.x}
                    cy={incPt.y}
                    r={isHovered ? 6 : 3.5}
                    fill="#10B981"
                    stroke="#FFFFFF"
                    strokeWidth={isHovered ? 2.5 : 1.5}
                    className="transition-all duration-150 drop-shadow-sm"
                  />

                  {/* Titik Pengeluaran (Merah) */}
                  <circle
                    cx={expPt.x}
                    cy={expPt.y}
                    r={isHovered ? 5.5 : 3}
                    fill="#EF4444"
                    stroke="#FFFFFF"
                    strokeWidth={isHovered ? 2.5 : 1.5}
                    className="transition-all duration-150 drop-shadow-sm"
                  />
                </g>
              );
            })}

            {/* Label Bulan pada Sumbu X di Bagian Bawah */}
            {monthlySeries.map((m, idx) => {
              const x = paddingX + (idx / 11) * plotWidth;
              const y = svgHeight - 12;
              const isHovered = activeMonthIdx === idx;

              return (
                <text
                  key={m.monthIndex}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  className={`text-[10px] font-mono transition-colors pointer-events-none ${
                    isHovered
                      ? 'fill-[#0066CC] dark:fill-blue-400 font-bold'
                      : 'fill-zinc-500 dark:fill-zinc-400 font-medium'
                  }`}
                >
                  {m.shortName}
                </text>
              );
            })}

            {/* Lapisan Pelacak Interaktif Transparan Penuh (Capture All Mouse Events) */}
            <rect
              x={0}
              y={0}
              width={svgWidth}
              height={svgHeight}
              fill="white"
              fillOpacity={0}
              pointerEvents="all"
              className="cursor-crosshair"
            />
          </svg>
        </div>

        {/* Legenda Keterangan & Catatan Bawah */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 rounded-full bg-emerald-500 shadow-xs" />
              <span className="font-semibold text-zinc-800 dark:text-zinc-200 text-xs">
                Kas Masuk (Pemasukan)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 rounded-full bg-rose-500 shadow-xs" />
              <span className="font-semibold text-zinc-800 dark:text-zinc-200 text-xs">
                Kas Keluar (Pengeluaran)
              </span>
            </div>
          </div>

          <div className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
            {bestMonth ? (
              <span>
                ★ Bulan surplus tertinggi: <strong className="text-zinc-700 dark:text-zinc-300">{bestMonth.name}</strong> ({formatCurrency(bestMonth.netProfit)})
              </span>
            ) : (
              <span>Geser kursor di atas grafik untuk memindai arus kas</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

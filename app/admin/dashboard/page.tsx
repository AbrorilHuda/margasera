'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  Calendar,
  Camera,
  Layers,
  TrendingUp,
  FolderPlus,
  PackagePlus,
  Plus,
  Clock,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { getAllBookings } from '@/lib/actions/bookings';
import { getGalleryProjects } from '@/lib/actions/gallery';
import { getServices, getPackages } from '@/lib/actions/services';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Booking, GalleryProject, Service, Package } from '@/lib/types';
import { MonthlyBookingChart } from './_components/MonthlyBookingChart';

export default function AdminOverviewPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [projects, setProjects] = useState<GalleryProject[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [bList, pList, sList, pkgList] = await Promise.all([
        getAllBookings(),
        getGalleryProjects(),
        getServices(),
        getPackages(),
      ]);
      setBookings(bList);
      setProjects(pList);
      setServices(sList);
      setPackages(pkgList);
    } catch (err) {
      console.error('Failed to load overview data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length;

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 sm:h-32 bg-zinc-200/70 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/60 rounded-xl" />
          ))}
        </div>
        <div className="h-80 bg-zinc-200/70 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/60 rounded-2xl" />
        <div className="h-36 bg-zinc-200/70 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/60 rounded-xl" />
        <div className="h-64 bg-zinc-200/70 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/60 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      {/* ===== PERFORMANCE OVERVIEW / METRIC CARDS ===== */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-mono tracking-[0.25em] text-[#0066CC] uppercase font-semibold">
          Performance Overview
        </span>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {/* Revenue */}
          <div className="p-4 sm:p-5 bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 hover:border-[#0066CC]/50 transition-all rounded-2xl flex flex-col justify-between gap-2 relative overflow-hidden group shadow-xs dark:shadow-lg min-w-0">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#0066CC] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
              <span className="text-[9px] sm:text-[10px] font-mono tracking-wider text-zinc-500 dark:text-zinc-400 uppercase font-medium truncate">
                Total Revenue
              </span>
              <div className="w-7 h-7 shrink-0 rounded-lg bg-[#0066CC]/10 border border-[#0066CC]/30 flex items-center justify-center text-[#0066CC]">
                <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <span className="font-sans text-lg sm:text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 truncate">
              {formatCurrency(totalRevenue)}
            </span>
            <span className="text-[9px] sm:text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 truncate">
              <TrendingUp className="w-3 h-3 shrink-0" />
              {confirmedCount} Confirmed
            </span>
          </div>

          {/* Total Bookings */}
          <div className="p-4 sm:p-5 bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 hover:border-[#0066CC]/50 transition-all rounded-2xl flex flex-col justify-between gap-2 relative overflow-hidden group shadow-xs dark:shadow-lg min-w-0">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#0066CC] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
              <span className="text-[9px] sm:text-[10px] font-mono tracking-wider text-zinc-500 dark:text-zinc-400 uppercase font-medium truncate">
                Total Bookings
              </span>
              <div className="w-7 h-7 shrink-0 rounded-lg bg-[#0066CC]/10 border border-[#0066CC]/30 flex items-center justify-center text-[#0066CC]">
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <span className="font-sans text-lg sm:text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 truncate">
              {bookings.length} Pesanan
            </span>
            <span className="text-[9px] sm:text-[10px] text-zinc-500 dark:text-zinc-400 font-light truncate">
              Online &amp; Offline
            </span>
          </div>

          {/* Portfolio */}
          <div className="p-4 sm:p-5 bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 hover:border-[#0066CC]/50 transition-all rounded-2xl flex flex-col justify-between gap-2 relative overflow-hidden group shadow-xs dark:shadow-lg min-w-0">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#0066CC] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
              <span className="text-[9px] sm:text-[10px] font-mono tracking-wider text-zinc-500 dark:text-zinc-400 uppercase font-medium truncate">
                Portfolio
              </span>
              <div className="w-7 h-7 shrink-0 rounded-lg bg-[#0066CC]/10 border border-[#0066CC]/30 flex items-center justify-center text-[#0066CC]">
                <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <span className="font-sans text-lg sm:text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 truncate">
              {projects.length} Projects
            </span>
            <span className="text-[9px] sm:text-[10px] text-zinc-500 dark:text-zinc-400 font-light truncate">
              {projects.filter((p) => p.isFeatured).length} Featured
            </span>
          </div>

          {/* Services & Packages */}
          <div className="p-4 sm:p-5 bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 hover:border-[#0066CC]/50 transition-all rounded-2xl flex flex-col justify-between gap-2 relative overflow-hidden group shadow-xs dark:shadow-lg min-w-0">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#0066CC] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
              <span className="text-[9px] sm:text-[10px] font-mono tracking-wider text-zinc-500 dark:text-zinc-400 uppercase font-medium truncate">
                Packages &amp; Services
              </span>
              <div className="w-7 h-7 shrink-0 rounded-lg bg-[#0066CC]/10 border border-[#0066CC]/30 flex items-center justify-center text-[#0066CC]">
                <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <span className="font-sans text-lg sm:text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 truncate">
              {packages.length} Packages
            </span>
            <span className="text-[9px] sm:text-[10px] text-zinc-500 dark:text-zinc-400 font-light truncate">
              {services.length} Categories
            </span>
          </div>
        </div>
      </div>

      {/* ===== MONTHLY BOOKING ANALYTICS CHART ===== */}
      <MonthlyBookingChart bookings={bookings} />

      {/* ===== QUICK ACTIONS ===== */}
      <div className="p-5 sm:p-8 bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl flex flex-col gap-4 sm:gap-5 shadow-xs dark:shadow-xl">
        <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.25em] text-[#0066CC] uppercase font-semibold">
          Quick Actions
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Link
            href="/admin/dashboard/portfolio?action=new"
            className="p-4 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 hover:border-[#0066CC] rounded-2xl flex flex-col items-center gap-2 text-center transition-all group shadow-xs active:scale-[0.97]"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-center justify-center text-[#0066CC]">
              <FolderPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 tracking-wide">
              Add Portfolio
            </span>
          </Link>

          <Link
            href="/admin/dashboard/pricing?action=new"
            className="p-4 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 hover:border-[#0066CC] rounded-2xl flex flex-col items-center gap-2 text-center transition-all group shadow-xs active:scale-[0.97]"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-center justify-center text-[#0066CC]">
              <PackagePlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 tracking-wide">
              Add Package
            </span>
          </Link>

          <Link
            href="/admin/dashboard/bookings?action=new"
            className="p-4 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 hover:border-[#0066CC] rounded-2xl flex flex-col items-center gap-2 text-center transition-all group shadow-xs active:scale-[0.97]"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-center justify-center text-[#0066CC]">
              <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 tracking-wide">
              New Booking
            </span>
          </Link>

          <Link
            href="/admin/dashboard/calendar?action=block"
            className="p-4 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 hover:border-[#0066CC] rounded-2xl flex flex-col items-center gap-2 text-center transition-all group shadow-xs active:scale-[0.97]"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-center justify-center text-[#0066CC]">
              <Clock className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 tracking-wide">
              Block Date
            </span>
          </Link>
        </div>
      </div>

      {/* ===== RECENT BOOKINGS SECTION ===== */}
      <div className="p-5 sm:p-8 bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl flex flex-col gap-5 shadow-xs dark:shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-[#0066CC] uppercase tracking-widest font-semibold">
              Recent Bookings
            </span>
            <h3 className="font-sans text-lg sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">
              Pesanan Terbaru
            </h3>
          </div>
          <Link
            href="/admin/dashboard/bookings"
            className="text-xs text-[#0066CC] hover:underline font-semibold tracking-wide flex items-center gap-1 active:scale-95"
          >
            <span>View All</span>
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
                  <td className="p-4 font-mono font-bold text-[#0066CC]">{b.bookingCode}</td>
                  <td className="p-4 font-semibold text-zinc-900 dark:text-zinc-100">{b.customerName}</td>
                  <td className="p-4 text-zinc-700 dark:text-zinc-300">{b.serviceName}</td>
                  <td className="p-4 text-zinc-500 dark:text-zinc-400 font-mono">{formatDate(b.bookingDate)}</td>
                  <td className="p-4 font-mono text-sm font-semibold text-[#0066CC]">
                    {b.totalPrice ? formatCurrency(b.totalPrice) : '-'}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase font-mono tracking-wider font-semibold ${
                        b.status === 'confirmed'
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30'
                          : 'bg-blue-50 dark:bg-[#0066CC]/10 text-blue-700 dark:text-[#0066CC] border border-blue-300 dark:border-[#0066CC]/30'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          b.status === 'confirmed' ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-[#0066CC]'
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

        {/* --- MOBILE VIEW (iOS-Style Grouped Cards < 768px) --- */}
        <div className="flex md:hidden flex-col gap-3">
          {bookings.slice(0, 5).map((b) => (
            <Link
              key={b.id}
              href={`/admin/dashboard/bookings`}
              className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-[#0066CC]/50 flex flex-col gap-2.5 transition-all active:scale-[0.98] shadow-2xs group"
            >
              {/* Header: Code + Arrow */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#0066CC] tracking-wider">
                  {b.bookingCode}
                </span>
                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-[#0066CC] transition-colors" />
              </div>

              {/* Client and Service Info */}
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {b.customerName}
                </span>
                <span className="text-xs text-zinc-600 dark:text-zinc-400">
                  {b.serviceName} {b.packageName ? `• ${b.packageName}` : ''}
                </span>
              </div>

              {/* Date, Price, and Status Badge */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-200/70 dark:border-zinc-800/60 text-xs">
                <span className="text-zinc-500 dark:text-zinc-400 font-mono text-[11px] flex items-center gap-1">
                  📅 {formatDate(b.bookingDate)}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-[#0066CC] text-xs">
                    {b.totalPrice ? formatCurrency(b.totalPrice) : '-'}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] uppercase font-mono font-semibold ${
                      b.status === 'confirmed'
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30'
                        : 'bg-blue-50 dark:bg-[#0066CC]/10 text-blue-700 dark:text-[#0066CC] border border-blue-300 dark:border-[#0066CC]/30'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        b.status === 'confirmed' ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-[#0066CC]'
                      }`}
                    />
                    {b.status}
                  </span>
                </div>
              </div>
            </Link>
          ))}

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


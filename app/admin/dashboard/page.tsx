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
} from 'lucide-react';
import { getAllBookings } from '@/lib/actions/bookings';
import { getGalleryProjects } from '@/lib/actions/gallery';
import { getServices, getPackages } from '@/lib/actions/services';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Booking, GalleryProject, Service, Package } from '@/lib/types';

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-zinc-900/60 border border-zinc-800/60 rounded-xl" />
          ))}
        </div>
        <div className="h-40 bg-zinc-900/60 border border-zinc-800/60 rounded-xl" />
        <div className="h-64 bg-zinc-900/60 border border-zinc-800/60 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* ===== METRIC CARDS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue */}
        <div className="p-5 bg-zinc-900/60 border border-zinc-800/80 hover:border-[#0066CC]/50 transition-all rounded-xl flex flex-col gap-2 relative overflow-hidden group shadow-lg min-w-0">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#0066CC] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase font-medium truncate">Est. Investasi Masuk</span>
            <div className="w-7 h-7 shrink-0 rounded-lg bg-[#0066CC]/10 border border-[#0066CC]/30 flex items-center justify-center text-[#0066CC]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <span className="font-sans text-xl sm:text-2xl font-extrabold tracking-tight text-zinc-100 truncate">
            {formatCurrency(totalRevenue)}
          </span>
          <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 truncate">
            <TrendingUp className="w-3.5 h-3.5 shrink-0" />
            {confirmedCount} Pesanan Dikonfirmasi
          </span>
        </div>

        {/* Total Bookings */}
        <div className="p-5 bg-zinc-900/60 border border-zinc-800/80 hover:border-[#0066CC]/50 transition-all rounded-xl flex flex-col gap-2 relative overflow-hidden group shadow-lg min-w-0">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#0066CC] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase font-medium truncate">Total Booking</span>
            <div className="w-7 h-7 shrink-0 rounded-lg bg-[#0066CC]/10 border border-[#0066CC]/30 flex items-center justify-center text-[#0066CC]">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <span className="font-sans text-xl sm:text-2xl font-extrabold tracking-tight text-zinc-100 truncate">
            {bookings.length} Pesanan
          </span>
          <span className="text-[10px] text-zinc-400 font-light truncate">Termasuk Booking Online & Offline</span>
        </div>

        {/* Portfolio */}
        <div className="p-5 bg-zinc-900/60 border border-zinc-800/80 hover:border-[#0066CC]/50 transition-all rounded-xl flex flex-col gap-2 relative overflow-hidden group shadow-lg min-w-0">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#0066CC] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase font-medium truncate">Portofolio Karya</span>
            <div className="w-7 h-7 shrink-0 rounded-lg bg-[#0066CC]/10 border border-[#0066CC]/30 flex items-center justify-center text-[#0066CC]">
              <Camera className="w-4 h-4" />
            </div>
          </div>
          <span className="font-sans text-xl sm:text-2xl font-extrabold tracking-tight text-zinc-100 truncate">
            {projects.length} Project
          </span>
          <span className="text-[10px] text-zinc-400 font-light truncate">
            {projects.filter((p) => p.isFeatured).length} Project Featured Beranda
          </span>
        </div>

        {/* Services & Packages */}
        <div className="p-5 bg-zinc-900/60 border border-zinc-800/80 hover:border-[#0066CC]/50 transition-all rounded-xl flex flex-col gap-2 relative overflow-hidden group shadow-lg min-w-0">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#0066CC] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase font-medium truncate">Layanan & Paket</span>
            <div className="w-7 h-7 shrink-0 rounded-lg bg-[#0066CC]/10 border border-[#0066CC]/30 flex items-center justify-center text-[#0066CC]">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <span className="font-sans text-xl sm:text-2xl font-extrabold tracking-tight text-zinc-100 truncate">
            {packages.length} Paket
          </span>
          <span className="text-[10px] text-zinc-400 font-light truncate">{services.length} Kategori Layanan Aktif</span>
        </div>
      </div>

      {/* ===== QUICK ACTIONS ===== */}
      <div className="p-6 sm:p-8 bg-zinc-900/60 border border-zinc-800/80 rounded-xl flex flex-col gap-5 shadow-xl">
        <span className="text-[11px] font-mono tracking-[0.25em] text-[#0066CC] uppercase font-semibold">
          Aksi Cepat Manajemen Studio
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            href="/admin/dashboard/portfolio"
            className="p-4 bg-zinc-950 border border-zinc-800/80 hover:border-[#0066CC] rounded-xl flex flex-col items-center gap-2 text-center transition-all group shadow-md"
          >
            <FolderPlus className="w-5 h-5 text-[#0066CC] group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-zinc-200 tracking-wide">Tambah Portofolio</span>
          </Link>

          <Link
            href="/admin/dashboard/pricing"
            className="p-4 bg-zinc-950 border border-zinc-800/80 hover:border-[#0066CC] rounded-xl flex flex-col items-center gap-2 text-center transition-all group shadow-md"
          >
            <PackagePlus className="w-5 h-5 text-[#0066CC] group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-zinc-200 tracking-wide">Tambah Paket Baru</span>
          </Link>

          <Link
            href="/admin/dashboard/bookings"
            className="p-4 bg-zinc-950 border border-zinc-800/80 hover:border-[#0066CC] rounded-xl flex flex-col items-center gap-2 text-center transition-all group shadow-md"
          >
            <Plus className="w-5 h-5 text-[#0066CC] group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-zinc-200 tracking-wide">Booking Manual Baru</span>
          </Link>

          <Link
            href="/admin/dashboard/calendar"
            className="p-4 bg-zinc-950 border border-zinc-800/80 hover:border-[#0066CC] rounded-xl flex flex-col items-center gap-2 text-center transition-all group shadow-md"
          >
            <Clock className="w-5 h-5 text-[#0066CC] group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-zinc-200 tracking-wide">Status Tanggal Libur</span>
          </Link>
        </div>
      </div>

      {/* ===== RECENT BOOKINGS TABLE ===== */}
      <div className="p-6 sm:p-8 bg-zinc-900/60 border border-zinc-800/80 rounded-xl flex flex-col gap-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-[#0066CC] uppercase tracking-widest">Aktivitas Terbaru</span>
            <h3 className="font-sans text-xl sm:text-2xl font-bold text-zinc-100 uppercase tracking-tight">
              Pesanan Terbaru
            </h3>
          </div>
          <Link
            href="/admin/dashboard/bookings"
            className="text-xs text-[#0066CC] hover:underline font-medium tracking-wide"
          >
            Lihat Semua Pesanan →
          </Link>
        </div>

        <div className="overflow-x-auto rounded-lg border border-zinc-800/80">
          <table className="w-full text-left text-xs font-light">
            <thead className="bg-zinc-950 border-b border-zinc-800 text-[#0066CC] font-mono font-medium tracking-[0.2em] uppercase text-[10px]">
              <tr>
                <th className="p-4">Kode Booking</th>
                <th className="p-4">Pelanggan</th>
                <th className="p-4">Layanan</th>
                <th className="p-4">Tanggal Acara</th>
                <th className="p-4">Est. Harga</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {bookings.slice(0, 5).map((b) => (
                <tr key={b.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="p-4 font-mono font-bold text-[#0066CC]">{b.bookingCode}</td>
                  <td className="p-4 font-semibold text-zinc-100">{b.customerName}</td>
                  <td className="p-4 text-zinc-300">{b.serviceName}</td>
                  <td className="p-4 text-zinc-400">{formatDate(b.bookingDate)}</td>
                  <td className="p-4 font-mono text-sm font-semibold text-[#0066CC]">
                    {b.totalPrice ? formatCurrency(b.totalPrice) : '-'}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase font-mono tracking-wider font-semibold ${
                        b.status === 'confirmed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-[#0066CC]/10 text-[#0066CC] border border-[#0066CC]/30'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          b.status === 'confirmed' ? 'bg-emerald-400' : 'bg-[#0066CC]'
                        }`}
                      />
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-400 font-light">
                    Belum ada booking terdaftar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

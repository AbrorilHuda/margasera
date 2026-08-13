'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MOCK_BOOKINGS, MOCK_AVAILABILITY } from '@/lib/mock-data';
import { BookingStatus, AvailabilityStatus } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Camera, Calendar, CheckCircle2, Clock, Filter, Lock, LogOut, Plus, Search, Shield, User, XCircle } from 'lucide-react';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'bookings' | 'calendar' | 'services'>('bookings');
  const [bookings, setBookings] = useState(MOCK_BOOKINGS);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const updateBookingStatus = (id: string, newStatus: BookingStatus) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    );
  };

  const filteredBookings = statusFilter === 'all'
    ? bookings
    : bookings.filter((b) => b.status === statusFilter);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-12 max-w-7xl mx-auto">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-zinc-900">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full border border-[#0066CC]/40 flex items-center justify-center bg-black">
            <Camera className="w-5 h-5 text-[#0066CC]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="font-serif-editorial text-3xl text-zinc-100 font-light">
                Admin Dashboard
              </h1>
              <span className="px-2 py-0.5 bg-[#0066CC]/10 border border-[#0066CC]/30 text-[#0066CC] text-[9px] font-semibold tracking-widest uppercase">
                Marga Sera
              </span>
            </div>
            <span className="text-xs text-zinc-400 font-light">
              Manajemen Kalender & Booking Management System
            </span>
          </div>
        </div>

        <Link
          href="/admin/login"
          className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-rose-500/50 text-zinc-400 hover:text-rose-400 text-xs font-semibold tracking-widest uppercase transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar (Logout)</span>
        </Link>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-4 py-6 border-b border-zinc-900">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-6 py-3 text-xs tracking-widest uppercase transition-all ${
            activeTab === 'bookings'
              ? 'bg-[#0066CC] text-white font-semibold shadow-[0_0_15px_rgba(0,102,204,0.3)]'
              : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
          }`}
        >
          Manajemen Booking ({bookings.length})
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-6 py-3 text-xs tracking-widest uppercase transition-all ${
            activeTab === 'calendar'
              ? 'bg-[#0066CC] text-white font-semibold shadow-[0_0_15px_rgba(0,102,204,0.3)]'
              : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
          }`}
        >
          Manajemen Kalender & Status Tanggal
        </button>
      </div>

      {/* TAB 1: BOOKINGS MANAGEMENT */}
      {activeTab === 'bookings' && (
        <div className="py-8 flex flex-col gap-6">
          {/* Status Filter */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#0066CC]" />
              <span className="text-xs text-zinc-400 uppercase tracking-widest">Filter Status:</span>
              {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 text-[11px] tracking-wider uppercase transition-colors ${
                    statusFilter === st
                      ? 'bg-[#0066CC]/20 text-[#0066CC] border border-[#0066CC]/40 font-semibold'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <button className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-[#0066CC] text-zinc-200 text-xs font-semibold tracking-widest uppercase flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#0066CC]" />
              <span>Tambah Booking Manual</span>
            </button>
          </div>

          {/* Bookings Table */}
          <div className="bg-zinc-900 border border-zinc-800 overflow-x-auto">
            <table className="w-full text-left text-xs font-light">
              <thead className="bg-zinc-950 border-b border-zinc-800 text-[#0066CC] font-semibold tracking-widest uppercase text-[10px]">
                <tr>
                  <th className="p-4">Kode Booking</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Layanan & Paket</th>
                  <th className="p-4">Tanggal Acara</th>
                  <th className="p-4">Lokasi</th>
                  <th className="p-4">Total Harga</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Aksi Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-[#0066CC]">{b.bookingCode}</td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-zinc-100">{b.customerName}</span>
                        <span className="text-[10px] text-zinc-400">{b.whatsapp}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-zinc-200 font-semibold">{b.serviceName}</span>
                        <span className="text-[10px] text-zinc-400">{b.packageName}</span>
                      </div>
                    </td>
                    <td className="p-4 text-zinc-300">{formatDate(b.bookingDate)}</td>
                    <td className="p-4 text-zinc-400 max-w-[150px] truncate">{b.location}</td>
                    <td className="p-4 font-serif-editorial text-sm font-semibold text-[#0066CC]">
                      {b.totalPrice ? formatCurrency(b.totalPrice) : '-'}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-widest uppercase ${
                        b.status === 'confirmed'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : b.status === 'pending'
                          ? 'bg-[#0066CC]/20 text-[#0066CC] border border-[#0066CC]/30'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {b.status === 'pending' && (
                          <button
                            onClick={() => updateBookingStatus(b.id, 'confirmed')}
                            className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-bold tracking-widest uppercase transition-colors"
                          >
                            Setujui (Confirm)
                          </button>
                        )}
                        {b.status === 'confirmed' && (
                          <button
                            onClick={() => updateBookingStatus(b.id, 'completed')}
                            className="px-2.5 py-1 bg-[#0066CC] hover:bg-[#0052A3] text-white text-[10px] font-bold tracking-widest uppercase transition-colors"
                          >
                            Selesai (Complete)
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CALENDAR MANAGEMENT */}
      {activeTab === 'calendar' && (
        <div className="py-8 flex flex-col gap-6">
          <div className="p-6 bg-zinc-900 border border-zinc-800 flex flex-col gap-4">
            <h3 className="font-serif-editorial text-2xl text-zinc-100 font-light">
              Kelola Blokir Tanggal & Slot Libur Studio
            </h3>
            <p className="text-xs text-zinc-400 font-light">
              Admin dapat menandai tanggal tertentu sebagai Booked atau Blocked secara langsung untuk mencegah pemesanan ganda.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-semibold tracking-widest uppercase text-zinc-400">Pilih Tanggal:</label>
                <input
                  type="date"
                  className="bg-zinc-950 border border-zinc-800 text-xs p-3 text-zinc-100 rounded focus:outline-none focus:border-[#0066CC]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-semibold tracking-widest uppercase text-zinc-400">Ubah Status Ke:</label>
                <select className="bg-zinc-950 border border-zinc-800 text-xs p-3 text-zinc-100 rounded focus:outline-none focus:border-[#0066CC]">
                  <option value="available">🟢 Available (Tersedia)</option>
                  <option value="almost_full">🔵 Almost Full (Terbatas)</option>
                  <option value="booked">🔴 Booked (Terisi)</option>
                  <option value="blocked">⚫ Blocked (Libur/Terblokir)</option>
                </select>
              </div>
              <div className="flex items-end">
                <button className="w-full py-3 bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-semibold tracking-widest uppercase transition-colors">
                  Simpan Perubahan Tanggal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

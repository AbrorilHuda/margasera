'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import {
  Filter,
  Calendar,
  Search,
  Plus,
  Eye,
  Trash2,
  MessageCircle,
  ArrowUpDown,
  X,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  DollarSign,
  MapPin,
  RefreshCw,
  SlidersHorizontal,
  FileText,
  Printer,
  Check,
  Building2,
  Receipt,
  Share2,
} from 'lucide-react';
import {
  getAllBookings,
  updateBookingStatus,
  updatePaymentStatus,
  createManualBooking,
  deleteBooking,
} from '@/lib/actions/bookings';
import { getServices, getPackages } from '@/lib/actions/services';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Booking, BookingStatus, Service, Package } from '@/lib/types';

function generateGoogleCalendarUrl(b: Booking): string {
  const title = encodeURIComponent(`[Margasera] ${b.serviceName || 'Photography'} - ${b.customerName} (${b.bookingCode})`);
  const cleanDate = b.bookingDate.replace(/-/g, '');
  const startT = (b.startTime || '08:00').replace(':', '') + '00';
  const endT = (b.endTime || '14:00').replace(':', '') + '00';
  const dates = `${cleanDate}T${startT}/${cleanDate}T${endT}`;
  const details = encodeURIComponent(
    `Kode Booking: ${b.bookingCode}\n` +
    `Client: ${b.customerName}\n` +
    `WhatsApp: ${b.whatsapp}\n` +
    `Layanan: ${b.serviceName || '-'} (${b.packageName || '-'})\n` +
    `Jam Sesi: ${b.startTime || '08:00'} - ${b.endTime || '14:00'} WIB\n` +
    `Lokasi: ${b.location || '-'}\n` +
    `Catatan: ${b.notes || '-'}`
  );
  const loc = encodeURIComponent(b.location || 'Medan');
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${loc}`;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Filters State
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [bookingSort, setBookingSort] = useState<'newest' | 'oldest' | 'upcoming_event'>('newest');
  const [bookingSearch, setBookingSearch] = useState<string>('');

  // Modal states
  const [showAddBookingModal, setShowAddBookingModal] = useState(false);
  const [selectedBookingForDetail, setSelectedBookingForDetail] = useState<Booking | null>(null);
  const [selectedInvoiceBooking, setSelectedInvoiceBooking] = useState<Booking | null>(null);

  // Add booking form
  const [newBookingForm, setNewBookingForm] = useState({
    customerName: '',
    whatsapp: '',
    email: '',
    instagram: '',
    serviceId: '',
    packageId: '',
    bookingDate: new Date().toISOString().split('T')[0],
    location: '',
    totalPrice: 14500000,
    notes: '',
  });

  const refreshData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [bList, sList, pkgList] = await Promise.all([
        getAllBookings(),
        getServices(),
        getPackages(),
      ]);
      setBookings(bList);
      setServices(sList);
      setPackages(pkgList);

      if (sList.length > 0 && !newBookingForm.serviceId) {
        const firstPkg = pkgList.find((p) => p.serviceId === sList[0].id);
        setNewBookingForm((prev) => ({
          ...prev,
          serviceId: sList[0].id,
          packageId: firstPkg?.id || '',
          totalPrice: firstPkg?.price || 14500000,
        }));
      }
    } catch (err) {
      console.error('Failed to load bookings data', err);
    } finally {
      setLoadingData(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Actions
  const handleUpdateBookingStatus = async (id: string, newStatus: BookingStatus) => {
    const res = await updateBookingStatus(id, newStatus);
    if (res.success) await refreshData();
    else alert(`Gagal memperbarui status: ${res.error}`);
  };

  const handleUpdatePaymentStatus = async (id: string, newPaymentStatus: 'unpaid' | 'dp_paid' | 'paid_full') => {
    const res = await updatePaymentStatus(id, newPaymentStatus);
    if (res.success) {
      await refreshData();
      if (selectedBookingForDetail && selectedBookingForDetail.id === id) {
        setSelectedBookingForDetail({ ...selectedBookingForDetail, paymentStatus: newPaymentStatus });
      }
    } else {
      alert(`Gagal memperbarui status pembayaran: ${res.error}`);
    }
  };

  const handleDeleteBooking = async (id: string, code: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus booking "${code}"?`)) {
      const res = await deleteBooking(id);
      if (res.success) await refreshData();
      else alert(`Gagal menghapus booking: ${res.error}`);
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDate = newBookingForm.bookingDate.replace(/-/g, '').substring(2);
    const randomNum = String(Math.floor(Math.random() * 900) + 100);
    const selectedSrv = services.find((s) => s.id === newBookingForm.serviceId);
    const selectedPkg = packages.find((p) => p.id === newBookingForm.packageId);
    const bookingCode = `MS-${cleanDate}-${randomNum}`;

    const res = await createManualBooking({
      bookingCode,
      customerName: newBookingForm.customerName || 'Pelanggan Baru',
      whatsapp: newBookingForm.whatsapp || '081931107481',
      email: newBookingForm.email || 'customer@margasera.id',
      instagram: newBookingForm.instagram,
      serviceId: newBookingForm.serviceId,
      serviceName: selectedSrv?.name || 'Wedding Photography',
      packageId: newBookingForm.packageId,
      packageName: selectedPkg?.name || 'Custom Package',
      bookingDate: newBookingForm.bookingDate,
      location: newBookingForm.location || 'Madura',
      status: 'confirmed',
      paymentStatus: 'unpaid',
      totalPrice: Number(newBookingForm.totalPrice) || 10000000,
      notes: newBookingForm.notes,
    });

    if (res.success) {
      await refreshData();
      setShowAddBookingModal(false);
      setNewBookingForm({
        customerName: '',
        whatsapp: '',
        email: '',
        instagram: '',
        serviceId: services[0]?.id || '',
        packageId: packages.find((p) => p.serviceId === services[0]?.id)?.id || '',
        bookingDate: new Date().toISOString().split('T')[0],
        location: '',
        totalPrice: 14500000,
        notes: '',
      });
    } else {
      alert(`Gagal menyimpan booking manual: ${res.error}`);
    }
  };

  // Generate unique list of YYYY-MM months from bookings
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    bookings.forEach((b) => {
      if (b.bookingDate) {
        const ym = b.bookingDate.substring(0, 7);
        monthsSet.add(ym);
      }
    });
    return Array.from(monthsSet).sort().reverse();
  }, [bookings]);

  // Filtered & sorted bookings
  const filteredBookings = useMemo(() => {
    return bookings
      .filter((b) => {
        const matchStatus = bookingStatusFilter === 'all' || b.status === bookingStatusFilter;
        const matchMonth = monthFilter === 'all' || (b.bookingDate && b.bookingDate.startsWith(monthFilter));
        const matchService = serviceFilter === 'all' || b.serviceId === serviceFilter;
        const matchSearch =
          b.bookingCode.toLowerCase().includes(bookingSearch.toLowerCase()) ||
          b.customerName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
          b.whatsapp.includes(bookingSearch) ||
          (b.location && b.location.toLowerCase().includes(bookingSearch.toLowerCase()));

        return matchStatus && matchMonth && matchService && matchSearch;
      })
      .sort((a, b) => {
        if (bookingSort === 'newest')
          return new Date(b.createdAt || b.bookingDate).getTime() - new Date(a.createdAt || a.bookingDate).getTime();
        if (bookingSort === 'oldest')
          return new Date(a.createdAt || a.bookingDate).getTime() - new Date(b.createdAt || b.bookingDate).getTime();
        if (bookingSort === 'upcoming_event')
          return new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime();
        return 0;
      });
  }, [bookings, bookingStatusFilter, monthFilter, serviceFilter, bookingSearch, bookingSort]);

  // Stat Aggregates
  const totalRevenue = useMemo(() => filteredBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0), [filteredBookings]);
  const pendingCount = useMemo(() => bookings.filter((b) => b.status === 'pending').length, [bookings]);
  const confirmedCount = useMemo(() => bookings.filter((b) => b.status === 'confirmed').length, [bookings]);

  // Export to Excel / CSV
  const handleExportExcel = () => {
    if (filteredBookings.length === 0) {
      alert('Tidak ada data booking yang sesuai filter untuk diexport.');
      return;
    }

    const headers = [
      'Kode Booking',
      'Nama Pelanggan',
      'WhatsApp',
      'Email',
      'Instagram',
      'Layanan',
      'Paket',
      'Tanggal Acara',
      'Jam Sesi',
      'Lokasi',
      'Total Harga (IDR)',
      'Status Booking',
      'Status Pembayaran',
      'Catatan',
    ];

    const rows = filteredBookings.map((b) => [
      `"${b.bookingCode}"`,
      `"${b.customerName.replace(/"/g, '""')}"`,
      `"${b.whatsapp}"`,
      `"${b.email || ''}"`,
      `"${b.instagram || ''}"`,
      `"${b.serviceName || ''}"`,
      `"${b.packageName || ''}"`,
      `"${b.bookingDate}"`,
      `"${b.startTime || '08:00'} - ${b.endTime || '14:00'}"`,
      `"${(b.location || '').replace(/"/g, '""')}"`,
      b.totalPrice || 0,
      `"${b.status}"`,
      `"${b.paymentStatus || 'unpaid'}"`,
      `"${(b.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const monthSuffix = monthFilter !== 'all' ? `_${monthFilter}` : '';
    link.setAttribute('download', `Margasera_Bookings${monthSuffix}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatMonthLabel = (ym: string) => {
    const [y, m] = ym.split('-');
    const date = new Date(parseInt(y), parseInt(m) - 1, 1);
    return new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(date);
  };

  if (loadingData) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-zinc-900/60 border border-zinc-800/60 rounded-xl" />
          ))}
        </div>
        <div className="h-24 bg-zinc-900/60 border border-zinc-800/60 rounded-xl" />
        <div className="h-96 bg-zinc-900/60 border border-zinc-800/60 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ===== EXECUTIVE STAT SUMMARY CARDS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Bookings */}
        <div className="p-5 bg-zinc-900/70 border border-zinc-800/80 rounded-xl flex items-center justify-between shadow-lg relative overflow-hidden group">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-medium">Total Booking</span>
            <span className="font-sans text-2xl font-extrabold text-zinc-100">{bookings.length} Pesanan</span>
            <span className="text-[11px] text-zinc-400 font-light">Semua riwayat pemesanan</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#0066CC]/10 border border-[#0066CC]/30 flex items-center justify-center text-[#0066CC]">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        {/* Confirmed Bookings */}
        <div className="p-5 bg-zinc-900/70 border border-zinc-800/80 rounded-xl flex items-center justify-between shadow-lg relative overflow-hidden group">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-medium">Dikonfirmasi</span>
            <span className="font-sans text-2xl font-extrabold text-emerald-400">{confirmedCount} Event</span>
            <span className="text-[11px] text-zinc-400 font-light">Jadwal acara siap eksekusi</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Pending Approval */}
        <div className="p-5 bg-zinc-900/70 border border-zinc-800/80 rounded-xl flex items-center justify-between shadow-lg relative overflow-hidden group">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-medium">Perlu Konfirmasi</span>
            <span className="font-sans text-2xl font-extrabold text-amber-400">{pendingCount} Booking</span>
            <span className="text-[11px] text-zinc-400 font-light">Menunggu verifikasi admin</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Filtered Omset */}
        <div className="p-5 bg-zinc-900/70 border border-zinc-800/80 rounded-xl flex items-center justify-between shadow-lg relative overflow-hidden group">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#0066CC] font-medium">Est. Total Omset</span>
            <span className="font-mono text-xl font-bold text-[#0066CC]">{formatCurrency(totalRevenue)}</span>
            <span className="text-[11px] text-zinc-400 font-light">{filteredBookings.length} booking dalam filter</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#0066CC]/10 border border-[#0066CC]/30 flex items-center justify-center text-[#0066CC]">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ===== ADVANCED CONTROL PANEL (FILTER, SEARCH, EXPORT, ADD) ===== */}
      <div className="p-6 bg-zinc-900/70 border border-zinc-800/80 rounded-xl flex flex-col gap-5 shadow-xl backdrop-blur-md">
        {/* Row 1: Status Filters & Main Action Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            <span className="text-[11px] text-zinc-400 uppercase font-mono tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-[#0066CC]" /> Status:
            </span>
            {[
              { id: 'all', label: 'Semua', count: bookings.length },
              { id: 'pending', label: 'Pending', count: bookings.filter((b) => b.status === 'pending').length },
              { id: 'confirmed', label: 'Confirmed', count: bookings.filter((b) => b.status === 'confirmed').length },
              { id: 'completed', label: 'Completed', count: bookings.filter((b) => b.status === 'completed').length },
              { id: 'cancelled', label: 'Cancelled', count: bookings.filter((b) => b.status === 'cancelled').length },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setBookingStatusFilter(st.id)}
                className={`px-3.5 py-1.5 text-xs tracking-wide rounded-lg transition-all whitespace-nowrap font-medium flex items-center gap-1.5 ${
                  bookingStatusFilter === st.id
                    ? 'bg-[#0066CC] text-white font-semibold shadow-[0_0_12px_rgba(0,102,204,0.4)]'
                    : 'bg-zinc-950/80 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                <span>{st.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${
                  bookingStatusFilter === st.id ? 'bg-black/30 text-white' : 'bg-zinc-900 text-zinc-400'
                }`}>
                  {st.count}
                </span>
              </button>
            ))}
          </div>

          {/* Action Buttons: Export Excel & Add Booking */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleExportExcel}
              className="px-4 py-2.5 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/60 text-emerald-300 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 shadow-md cursor-pointer group"
              title="Export data booking yang aktif ke file Excel / CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Export Excel ({filteredBookings.length})</span>
            </button>

            <button
              onClick={() => {
                const srvId = services[0]?.id || '';
                const firstPkg = packages.find((p) => p.serviceId === srvId);
                setNewBookingForm({
                  customerName: '',
                  whatsapp: '',
                  email: '',
                  instagram: '',
                  serviceId: srvId,
                  packageId: firstPkg?.id || '',
                  bookingDate: new Date().toISOString().split('T')[0],
                  location: '',
                  totalPrice: firstPkg?.price ?? 14500000,
                  notes: '',
                });
                setShowAddBookingModal(true);
              }}
              className="px-4 py-2.5 bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(0,102,204,0.3)] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Booking</span>
            </button>
          </div>
        </div>

        {/* Row 2: Secondary Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-zinc-800/80">
          {/* MONTH FILTER */}
          <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-lg">
            <Calendar className="w-4 h-4 text-[#0066CC] shrink-0" />
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-[9px] font-mono uppercase text-zinc-400">Filter Bulan Acara:</span>
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="bg-transparent text-zinc-100 text-xs font-medium focus:outline-none cursor-pointer truncate"
              >
                <option value="all" className="bg-zinc-900">🗓️ Semua Bulan Acara</option>
                {availableMonths.map((ym) => (
                  <option key={ym} value={ym} className="bg-zinc-900">
                    📅 {formatMonthLabel(ym)}
                  </option>
                ))}
              </select>
            </div>
            {monthFilter !== 'all' && (
              <button onClick={() => setMonthFilter('all')} className="text-zinc-400 hover:text-white" title="Reset Filter Bulan">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* SERVICE FILTER */}
          <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-lg">
            <SlidersHorizontal className="w-4 h-4 text-[#0066CC] shrink-0" />
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-[9px] font-mono uppercase text-zinc-400">Filter Layanan:</span>
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="bg-transparent text-zinc-100 text-xs font-medium focus:outline-none cursor-pointer truncate"
              >
                <option value="all" className="bg-zinc-900">✨ Semua Layanan</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id} className="bg-zinc-900">
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            {serviceFilter !== 'all' && (
              <button onClick={() => setServiceFilter('all')} className="text-zinc-400 hover:text-white" title="Reset Filter Layanan">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* SORT SELECTOR */}
          <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-lg">
            <ArrowUpDown className="w-4 h-4 text-[#0066CC] shrink-0" />
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-[9px] font-mono uppercase text-zinc-400">Urutkan Data:</span>
              <select
                value={bookingSort}
                onChange={(e) => setBookingSort(e.target.value as typeof bookingSort)}
                className="bg-transparent text-zinc-100 text-xs font-medium focus:outline-none cursor-pointer truncate"
              >
                <option value="newest" className="bg-zinc-900">🔥 Booking Terbaru</option>
                <option value="upcoming_event" className="bg-zinc-900">📅 Jadwal Acara Terdekat</option>
                <option value="oldest" className="bg-zinc-900">⏳ Booking Terlama</option>
              </select>
            </div>
          </div>

          {/* SEARCH INPUT */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari Kode, Client, WA, Venue..."
              value={bookingSearch}
              onChange={(e) => setBookingSearch(e.target.value)}
              className="w-full h-full bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] text-zinc-100 pl-9 pr-8 py-2 rounded-lg text-xs focus:outline-none transition-colors"
            />
            {bookingSearch && (
              <button
                onClick={() => setBookingSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ===== BOOKINGS DATA TABLE ===== */}
      <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-light">
            <thead className="bg-zinc-950/90 border-b border-zinc-800 text-[#0066CC] font-mono font-medium tracking-[0.18em] uppercase text-[10px]">
              <tr>
                <th className="p-4">Kode Booking</th>
                <th className="p-4">Client / Contact</th>
                <th className="p-4">Layanan & Paket</th>
                <th className="p-4">Jadwal Acara</th>
                <th className="p-4">Lokasi Venue</th>
                <th className="p-4">Est. Harga</th>
                <th className="p-4">Status & DP</th>
                <th className="p-4 text-right">Aksi Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredBookings.map((b) => {
                const initial = b.customerName ? b.customerName.charAt(0).toUpperCase() : 'C';
                return (
                  <tr key={b.id} className="hover:bg-zinc-800/50 transition-colors group">
                    {/* Booking Code */}
                    <td className="p-4 font-mono font-bold text-[#0066CC] whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0066CC]" />
                        <span>{b.bookingCode}</span>
                      </div>
                    </td>

                    {/* Client Info */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 font-bold text-zinc-200 flex items-center justify-center text-xs shrink-0 font-mono">
                          {initial}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-zinc-100 tracking-wide truncate">{b.customerName}</span>
                          <a
                            href={`https://wa.me/${b.whatsapp.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-emerald-400 font-mono hover:underline flex items-center gap-1"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>{b.whatsapp}</span>
                          </a>
                        </div>
                      </div>
                    </td>

                    {/* Service & Package */}
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-zinc-100 font-medium">{b.serviceName}</span>
                        <span className="text-[10px] text-zinc-400 font-mono bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800/80 w-fit mt-0.5">
                          {b.packageName}
                        </span>
                      </div>
                    </td>

                    {/* Event Date & Time */}
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-zinc-200 font-semibold">{formatDate(b.bookingDate)}</span>
                        <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {b.startTime ? `${b.startTime} – ${b.endTime} WIB` : '08:00 – 14:00 WIB'}
                        </span>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="p-4 text-zinc-400 max-w-[140px]">
                      <div className="flex items-center gap-1 truncate" title={b.location}>
                        <MapPin className="w-3.5 h-3.5 text-[#0066CC] shrink-0" />
                        <span className="truncate">{b.location}</span>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="p-4 font-mono text-sm font-semibold text-[#0066CC] whitespace-nowrap">
                      {b.totalPrice ? formatCurrency(b.totalPrice) : '-'}
                    </td>

                    {/* Status & Payment Status */}
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1 items-start">
                        {/* Booking Status Pill */}
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono tracking-wider font-semibold ${
                            b.status === 'confirmed'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40'
                              : b.status === 'completed'
                              ? 'bg-blue-500/15 text-blue-300 border border-blue-500/40'
                              : b.status === 'pending'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/40'
                              : 'bg-rose-950/50 text-rose-400 border border-rose-900/60'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              b.status === 'confirmed'
                                ? 'bg-emerald-400'
                                : b.status === 'completed'
                                ? 'bg-blue-400'
                                : b.status === 'pending'
                                ? 'bg-amber-400'
                                : 'bg-rose-500'
                            }`}
                          />
                          {b.status}
                        </span>

                        {/* Payment Status Pill */}
                        <span
                          className={`px-2 py-0.2 rounded text-[9px] font-bold uppercase font-mono border ${
                            b.paymentStatus === 'paid_full'
                              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                              : b.paymentStatus === 'dp_paid'
                              ? 'bg-blue-950/40 text-blue-300 border-blue-800/60'
                              : 'bg-amber-950/40 text-amber-300 border-amber-800/60'
                          }`}
                        >
                          {b.paymentStatus === 'paid_full' ? 'LUNAS (100%)' : b.paymentStatus === 'dp_paid' ? 'DP (30%)' : 'BELUM DP'}
                        </span>
                      </div>
                    </td>

                    {/* Actions Toolbar */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Detail Modal */}
                        <button
                          onClick={() => setSelectedBookingForDetail(b)}
                          className="p-2 bg-zinc-950 border border-zinc-800 hover:border-[#0066CC] text-zinc-300 hover:text-white rounded-lg transition-all"
                          title="Lihat Detail Booking"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Google Calendar Link */}
                        <a
                          href={generateGoogleCalendarUrl(b)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-400 rounded-lg flex items-center gap-1 text-[10px] font-mono transition-colors"
                          title="Tambah ke Google Calendar"
                        >
                          <Calendar className="w-3.5 h-3.5 text-amber-400" />
                          <span className="hidden xl:inline">+ GCal</span>
                        </a>

                        {/* Generate Invoice Button */}
                        <button
                          onClick={() => setSelectedInvoiceBooking(b)}
                          className="px-2.5 py-1.5 bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 text-blue-400 rounded-lg flex items-center gap-1 text-[10px] font-mono transition-colors"
                          title="Lihat / Cetak Invoice Pembayaran"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-400" />
                          <span className="hidden xl:inline">Invoice</span>
                        </button>

                        {/* Quick Confirm / Complete Actions */}
                        {b.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateBookingStatus(b.id, 'confirmed')}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-semibold uppercase tracking-wider rounded-lg transition-colors shadow"
                          >
                            Confirm
                          </button>
                        )}
                        {b.status === 'confirmed' && (
                          <button
                            onClick={() => handleUpdateBookingStatus(b.id, 'completed')}
                            className="px-2.5 py-1.5 bg-[#0066CC] hover:bg-[#0052A3] text-white text-[10px] font-semibold uppercase tracking-wider rounded-lg transition-colors shadow"
                          >
                            Complete
                          </button>
                        )}

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteBooking(b.id, b.bookingCode)}
                          className="p-2 bg-zinc-950 border border-zinc-800 hover:border-rose-900/60 text-zinc-400 hover:text-rose-400 rounded-lg transition-colors"
                          title="Hapus Booking"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {/* Empty Filtered State */}
              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-500">
                        <Search className="w-6 h-6" />
                      </div>
                      <span className="text-zinc-300 text-sm font-semibold">Tidak ada booking ditemukan</span>
                      <p className="text-zinc-500 text-xs font-light max-w-sm">
                        Coba sesuaikan kata kunci pencarian, filter status, atau filter bulan acara di atas.
                      </p>
                      {(bookingSearch || bookingStatusFilter !== 'all' || monthFilter !== 'all' || serviceFilter !== 'all') && (
                        <button
                          onClick={() => {
                            setBookingStatusFilter('all');
                            setMonthFilter('all');
                            setServiceFilter('all');
                            setBookingSearch('');
                          }}
                          className="mt-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-lg flex items-center gap-1.5 font-mono"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Reset Semua Filter
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer info */}
        <div className="p-4 bg-zinc-950/80 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400 font-mono">
          <span>Menampilkan <strong>{filteredBookings.length}</strong> dari <strong>{bookings.length}</strong> total booking</span>
          {monthFilter !== 'all' && (
            <span className="text-[#0066CC] font-semibold">Filter Bulan: {formatMonthLabel(monthFilter)}</span>
          )}
        </div>
      </div>

      {/* ===== MODAL: ADD MANUAL BOOKING ===== */}
      {showAddBookingModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-lg w-full p-6 md:p-8 flex flex-col gap-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0066CC]/20 text-[#0066CC] flex items-center justify-center font-bold">
                  +
                </div>
                <h3 className="font-sans text-xl font-bold text-zinc-100">Tambah Booking Manual Baru</h3>
              </div>
              <button onClick={() => setShowAddBookingModal(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-300 uppercase font-mono font-medium">Nama Pelanggan / Client *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rian & Amanda"
                  value={newBookingForm.customerName}
                  onChange={(e) => setNewBookingForm({ ...newBookingForm, customerName: e.target.value })}
                  className="bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] p-3 rounded-lg text-zinc-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-300 uppercase font-mono font-medium">Nomor WhatsApp *</label>
                  <input
                    type="text"
                    required
                    placeholder="081931107481"
                    value={newBookingForm.whatsapp}
                    onChange={(e) => setNewBookingForm({ ...newBookingForm, whatsapp: e.target.value })}
                    className="bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] p-3 rounded-lg text-zinc-100 focus:outline-none font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-300 uppercase font-mono font-medium">Instagram (@username)</label>
                  <input
                    type="text"
                    placeholder="@username"
                    value={newBookingForm.instagram}
                    onChange={(e) => setNewBookingForm({ ...newBookingForm, instagram: e.target.value })}
                    className="bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] p-3 rounded-lg text-zinc-100 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-300 uppercase font-mono font-medium">Tanggal Acara *</label>
                  <input
                    type="date"
                    required
                    value={newBookingForm.bookingDate}
                    onChange={(e) => setNewBookingForm({ ...newBookingForm, bookingDate: e.target.value })}
                    className="bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] p-3 rounded-lg text-zinc-100 focus:outline-none font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-300 uppercase font-mono font-medium">Lokasi / Venue *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Bangkalan, Madura"
                    value={newBookingForm.location}
                    onChange={(e) => setNewBookingForm({ ...newBookingForm, location: e.target.value })}
                    className="bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] p-3 rounded-lg text-zinc-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-300 uppercase font-mono font-medium">Layanan *</label>
                  <select
                    value={newBookingForm.serviceId}
                    onChange={(e) => {
                      const srvId = e.target.value;
                      const availablePkgs = packages.filter((p) => p.serviceId === srvId);
                      const selPkg = availablePkgs[0];
                      setNewBookingForm({
                        ...newBookingForm,
                        serviceId: srvId,
                        packageId: selPkg?.id || '',
                        totalPrice: selPkg?.price ?? newBookingForm.totalPrice,
                      });
                    }}
                    className="bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] p-3 rounded-lg text-zinc-100 focus:outline-none"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-300 uppercase font-mono font-medium">Paket *</label>
                  <select
                    value={newBookingForm.packageId}
                    onChange={(e) => {
                      const pkgId = e.target.value;
                      const selPkg = packages.find((p) => p.id === pkgId);
                      setNewBookingForm({
                        ...newBookingForm,
                        packageId: pkgId,
                        totalPrice: selPkg?.price ?? newBookingForm.totalPrice,
                      });
                    }}
                    className="bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] p-3 rounded-lg text-zinc-100 focus:outline-none"
                  >
                    {packages
                      .filter((p) => !newBookingForm.serviceId || p.serviceId === newBookingForm.serviceId)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} - {formatCurrency(p.price)}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-300 uppercase font-mono font-medium">Total Harga (IDR)</label>
                <input
                  type="number"
                  value={newBookingForm.totalPrice}
                  onChange={(e) => setNewBookingForm({ ...newBookingForm, totalPrice: Number(e.target.value) })}
                  className="bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] p-3 rounded-lg text-zinc-100 focus:outline-none font-mono text-sm font-semibold"
                />
              </div>

              <button
                type="submit"
                className="mt-4 py-3.5 bg-[#0066CC] hover:bg-[#0052A3] text-white font-semibold uppercase tracking-wider rounded-lg transition-colors shadow-md cursor-pointer"
              >
                Simpan Booking Manual
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL: BOOKING DETAIL ===== */}
      {selectedBookingForDetail && (() => {
        const isDpPaid = selectedBookingForDetail.paymentStatus === 'dp_paid';
        const isPaidFull = selectedBookingForDetail.paymentStatus === 'paid_full';

        return (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-lg w-full p-6 md:p-8 flex flex-col gap-6 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Detail Pemesanan</span>
                  <h3 className="font-mono text-xl font-bold text-[#0066CC]">
                    {selectedBookingForDetail.bookingCode}
                  </h3>
                </div>
                <button onClick={() => setSelectedBookingForDetail(null)} className="text-zinc-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col gap-3 text-xs text-zinc-300 font-light">
                <div className="flex justify-between py-1.5 border-b border-zinc-800/60">
                  <span className="text-zinc-500 font-mono">Nama Pelanggan:</span>
                  <strong className="text-zinc-100 text-sm font-semibold">{selectedBookingForDetail.customerName}</strong>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-800/60">
                  <span className="text-zinc-500 font-mono">WhatsApp:</span>
                  <strong className="font-mono text-emerald-400">{selectedBookingForDetail.whatsapp}</strong>
                </div>
                {selectedBookingForDetail.instagram && (
                  <div className="flex justify-between py-1.5 border-b border-zinc-800/60">
                    <span className="text-zinc-500 font-mono">Instagram Client:</span>
                    <a
                      href={`https://instagram.com/${selectedBookingForDetail.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[#0066CC] hover:underline font-semibold"
                    >
                      {selectedBookingForDetail.instagram}
                    </a>
                  </div>
                )}
                <div className="flex justify-between py-1.5 border-b border-zinc-800/60">
                  <span className="text-zinc-500 font-mono">Layanan:</span>
                  <strong className="text-zinc-200">{selectedBookingForDetail.serviceName} ({selectedBookingForDetail.packageName})</strong>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-800/60">
                  <span className="text-zinc-500 font-mono">Tanggal & Sesi Jam:</span>
                  <strong className="text-amber-400 font-mono">
                    {formatDate(selectedBookingForDetail.bookingDate)} ({selectedBookingForDetail.startTime || '08:00'} – {selectedBookingForDetail.endTime || '14:00'} WIB)
                  </strong>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-800/60">
                  <span className="text-zinc-500 font-mono">Lokasi / Venue:</span>
                  <strong className="text-zinc-200">{selectedBookingForDetail.location}</strong>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-800/60">
                  <span className="text-zinc-500 font-mono">Est. Investasi:</span>
                  <strong className="text-[#0066CC] font-mono text-lg font-bold">
                    {selectedBookingForDetail.totalPrice ? formatCurrency(selectedBookingForDetail.totalPrice) : '-'}
                  </strong>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-800/60">
                  <span className="text-zinc-500 font-mono">Status Pembayaran:</span>
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                      isPaidFull
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : isDpPaid
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {isPaidFull ? 'LUNAS (100%) ✓' : isDpPaid ? 'DP TERBAYAR (30%) ✓' : 'BELUM DP'}
                  </span>
                </div>
                {selectedBookingForDetail.notes && (
                  <div className="flex flex-col gap-1 pt-2">
                    <span className="text-zinc-500 font-mono text-[10px] uppercase">Catatan Khusus:</span>
                    <p className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-300 italic">
                      &ldquo;{selectedBookingForDetail.notes}&rdquo;
                    </p>
                  </div>
                )}

                {/* Payment Action Buttons - Disabled Logic */}
                <div className="flex flex-col gap-2 pt-3 border-t border-zinc-800">
                  <span className="text-[10px] text-zinc-400 font-mono uppercase">Ubah Status Pembayaran:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      disabled={isDpPaid || isPaidFull}
                      onClick={() => handleUpdatePaymentStatus(selectedBookingForDetail.id, 'dp_paid')}
                      className={`py-2 text-xs font-semibold uppercase rounded-lg transition-all text-center ${
                        isDpPaid || isPaidFull
                          ? 'opacity-50 cursor-not-allowed bg-zinc-950 text-zinc-500 border border-zinc-800'
                          : 'bg-[#0066CC] hover:bg-[#0052A3] text-white cursor-pointer shadow-md'
                      }`}
                    >
                      {isDpPaid ? 'DP Terbayar ✓' : isPaidFull ? 'DP Selesai ✓' : 'Set DP Terbayar (30%)'}
                    </button>

                    <button
                      disabled={isPaidFull}
                      onClick={() => handleUpdatePaymentStatus(selectedBookingForDetail.id, 'paid_full')}
                      className={`py-2 text-xs font-semibold uppercase rounded-lg transition-all text-center ${
                        isPaidFull
                          ? 'opacity-50 cursor-not-allowed bg-emerald-950/60 text-emerald-400 border border-emerald-800/80'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-md'
                      }`}
                    >
                      {isPaidFull ? 'Lunas (100%) ✓' : 'Set Lunas (100%)'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Chat WA & Generate Invoice */}
              <div className="flex items-center gap-3 pt-2">
                <a
                  href={`https://wa.me/${selectedBookingForDetail.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs tracking-wider uppercase text-center rounded-lg flex items-center justify-center gap-2 shadow-md transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat WA</span>
                </a>
                <button
                  onClick={() => {
                    const currentB = selectedBookingForDetail;
                    setSelectedBookingForDetail(null);
                    setSelectedInvoiceBooking(currentB);
                  }}
                  className="flex-1 py-3 bg-[#0066CC] hover:bg-[#0052A3] text-white font-semibold text-xs tracking-wider uppercase text-center rounded-lg flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Generate Invoice</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ===== MODAL: HIGH-END PRINTABLE INVOICE ===== */}
      {selectedInvoiceBooking && (() => {
        const inv = selectedInvoiceBooking;
        const totalPrice = inv.totalPrice || 0;
        const dpAmount = Math.round(totalPrice * 0.3);
        const isPaidFull = inv.paymentStatus === 'paid_full';
        const isDpPaid = inv.paymentStatus === 'dp_paid';

        let paidTotal = 0;
        let remainingBalance = totalPrice;

        if (isPaidFull) {
          paidTotal = totalPrice;
          remainingBalance = 0;
        } else if (isDpPaid) {
          paidTotal = dpAmount;
          remainingBalance = totalPrice - dpAmount;
        }

        const handlePrintInvoice = () => {
          window.print();
        };

        const generateWaInvoiceMsg = () => {
          const statusText = isPaidFull ? 'LUNAS (100%)' : isDpPaid ? 'DP (30%) TERBAYAR' : 'BELUM DP';
          const msg = encodeURIComponent(
            `Halo kak ${inv.customerName},\n\n` +
            `Berikut rincian Invoice Pemesanan Margasera Photography:\n\n` +
            `📄 *INVOICE:* INV-${inv.bookingCode}\n` +
            `📸 *Layanan:* ${inv.serviceName} (${inv.packageName})\n` +
            `📅 *Tanggal Event:* ${formatDate(inv.bookingDate)}\n` +
            `📍 *Lokasi:* ${inv.location}\n\n` +
            `💰 *Total Investasi:* ${formatCurrency(totalPrice)}\n` +
            `✅ *Status Pembayaran:* ${statusText}\n` +
            `💳 *Total Terbayar:* ${formatCurrency(paidTotal)}\n` +
            `📌 *Sisa Pelunasan:* ${formatCurrency(remainingBalance)}\n\n` +
            `Rekening Pembayaran:\n` +
            `🏦 *BCA: 1234567890* a.n *MARGASERA CREATIVE*\n\n` +
            `Terima kasih telah mempercayakan momen berharga kamu bersama Margasera Photography! ✨`
          );
          return `https://wa.me/${inv.whatsapp.replace(/[^0-9]/g, '')}?text=${msg}`;
        };

        return (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full flex flex-col shadow-2xl my-8 overflow-hidden">
              {/* Top Modal Controls (Hidden in Print) */}
              <div className="no-print p-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-[#0066CC]" />
                  <h4 className="text-sm font-bold text-zinc-100 uppercase tracking-wide">Pratinjau Invoice Resmi Studio</h4>
                </div>
                <button
                  onClick={() => setSelectedInvoiceBooking(null)}
                  className="text-zinc-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* ===== PRINTABLE INVOICE CARD CONTAINER ===== */}
              <div id="printable-invoice" className="p-8 sm:p-10 bg-white text-zinc-900 font-sans flex flex-col gap-8">
                {/* Invoice Header: Logo & Studio Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-zinc-200">
                  <div className="flex flex-col gap-2">
                    <div className="p-3 bg-zinc-950 rounded-xl w-fit shadow-sm">
                      <Image
                        src="/logo.png"
                        alt="Margasera Logo"
                        width={160}
                        height={48}
                        className="h-9 w-auto object-contain"
                        priority
                      />
                    </div>
                    <span className="text-[11px] text-zinc-500 tracking-wider uppercase font-semibold">
                      Editorial & Cinematic Visual Stories
                    </span>
                  </div>

                  <div className="flex flex-col text-left sm:text-right text-xs text-zinc-600 font-light leading-relaxed">
                    <strong className="text-zinc-900 font-semibold text-sm">MARGASERA PHOTOGRAPHY</strong>
                    <span>Jl. Raya Madura No. 88, Madura, Jawa Timur</span>
                    <span>WhatsApp: 0858-0613-8955 | Email: hello@margasera.id</span>
                    <span>Website: www.margasera.id</span>
                  </div>
                </div>

                {/* Invoice Title & Meta */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-mono font-bold tracking-widest text-[#0066CC] uppercase">INVOICE OFFICIAL</span>
                    <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight font-mono">
                      INV-{inv.bookingCode}
                    </h2>
                  </div>

                  {/* Payment Status Stamp Badge */}
                  <div className="sm:text-right">
                    <div
                      className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs uppercase font-mono font-bold tracking-wider border shadow-sm ${
                        isPaidFull
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-400'
                          : isDpPaid
                          ? 'bg-blue-50 text-blue-700 border-blue-400'
                          : 'bg-amber-50 text-amber-700 border-amber-400'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${isPaidFull ? 'bg-emerald-600' : isDpPaid ? 'bg-blue-600' : 'bg-amber-600'}`} />
                      {isPaidFull ? 'LUNAS / FULLY PAID' : isDpPaid ? 'DP 30% TERBAYAR' : 'BELUM DP / UNPAID'}
                    </div>
                    <div className="text-[11px] text-zinc-500 font-mono mt-1">
                      Tanggal Diterbitkan: {formatDate(new Date().toISOString().split('T')[0])}
                    </div>
                  </div>
                </div>

                {/* Client & Event Info Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 bg-zinc-50 rounded-xl border border-zinc-200/80 text-xs">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest font-semibold">DITUJUKAN KEPADA CLIENT:</span>
                    <strong className="text-zinc-900 text-sm font-semibold">{inv.customerName}</strong>
                    <span className="text-zinc-600 font-mono">WhatsApp: {inv.whatsapp}</span>
                    {inv.instagram && <span className="text-zinc-600 font-mono">Instagram: {inv.instagram}</span>}
                    {inv.email && <span className="text-zinc-600 font-mono">Email: {inv.email}</span>}
                  </div>

                  <div className="flex flex-col gap-1.5 sm:text-right">
                    <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest font-semibold">DETAIL JADWAL EVENT:</span>
                    <strong className="text-zinc-900 text-sm font-semibold">{formatDate(inv.bookingDate)}</strong>
                    <span className="text-amber-700 font-mono font-medium">
                      Sesi: {inv.startTime || '08:00'} – {inv.endTime || '14:00'} WIB
                    </span>
                    <span className="text-zinc-600">Venue: {inv.location}</span>
                  </div>
                </div>

                {/* Itemized Services Pricing Table */}
                <div className="overflow-x-auto rounded-lg border border-zinc-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-100 border-b border-zinc-200 text-zinc-700 font-mono font-semibold uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Deskripsi Layanan & Paket</th>
                        <th className="p-3 text-center">Durasi</th>
                        <th className="p-3 text-right">Harga Satuan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 text-zinc-800">
                      <tr>
                        <td className="p-3">
                          <div className="flex flex-col">
                            <strong className="text-zinc-900 font-semibold">{inv.serviceName}</strong>
                            <span className="text-zinc-500 text-[11px]">{inv.packageName} — Dokumentasi Visual Sinematik</span>
                          </div>
                        </td>
                        <td className="p-3 text-center font-mono">1 Event</td>
                        <td className="p-3 text-right font-mono font-semibold">{formatCurrency(totalPrice)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Calculation Summary & Bank Account Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  {/* Rekening Pembayaran */}
                  <div className="p-4 bg-blue-50/60 border border-blue-200/80 rounded-xl flex flex-col gap-2 text-xs">
                    <span className="text-[10px] font-mono uppercase font-bold text-[#0066CC] tracking-wider flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" /> Rekening Pembayaran Resmi Studio:
                    </span>
                    <div className="flex justify-between border-b border-blue-200/60 pb-1 text-zinc-700 font-mono">
                      <span>Bank:</span>
                      <strong className="text-zinc-900">BCA</strong>
                    </div>
                    <div className="flex justify-between border-b border-blue-200/60 pb-1 text-zinc-700 font-mono">
                      <span>No. Rekening:</span>
                      <strong className="text-zinc-900 text-sm font-extrabold">1234567890</strong>
                    </div>
                    <div className="flex justify-between text-zinc-700 font-mono">
                      <span>Atas Nama:</span>
                      <strong className="text-zinc-900">MARGASERA CREATIVE</strong>
                    </div>
                  </div>

                  {/* Price Totals Breakdown */}
                  <div className="flex flex-col gap-2 text-xs text-zinc-700 font-mono justify-end">
                    <div className="flex justify-between py-1 border-b border-zinc-200">
                      <span>Total Investasi Paket:</span>
                      <strong className="text-zinc-900">{formatCurrency(totalPrice)}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-200">
                      <span>Total Terbayar:</span>
                      <strong className="text-emerald-700">{formatCurrency(paidTotal)}</strong>
                    </div>
                    <div className="flex justify-between py-2 border-b-2 border-zinc-900 text-sm">
                      <span className="font-bold text-zinc-900">SISA PELUNASAN:</span>
                      <strong className={`font-extrabold ${remainingBalance > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                        {formatCurrency(remainingBalance)}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Footer Notes & Signatures */}
                <div className="pt-6 border-t border-zinc-200 flex flex-col sm:flex-row justify-between items-end gap-6 text-[11px] text-zinc-500 font-light">
                  <div className="flex flex-col gap-1">
                    <strong className="text-zinc-800 font-semibold uppercase font-mono text-[10px]">Syarat & Ketentuan Studio:</strong>
                    <span>• DP minimal 30% dari total paket untuk mengunci tanggal pada kalender studio.</span>
                    <span>• Pelunasan sisa 70% dilakukan paling lambat H-1 sebelum tanggal eksekusi acara.</span>
                    <span>• Invoice ini merupakan bukti pembayaran sah yang dikeluarkan oleh Margasera Photography.</span>
                  </div>

                  <div className="text-center sm:text-right flex flex-col items-center sm:items-end gap-1">
                    <span className="font-mono text-[10px]">Hormat Kami,</span>
                    <div className="h-12 w-32 border-b border-zinc-400 flex items-center justify-center italic text-zinc-400 text-xs">
                      [ Signed Digital ]
                    </div>
                    <strong className="text-zinc-900 font-semibold font-mono text-xs">MARGASERA CREATIVE</strong>
                  </div>
                </div>
              </div>

              {/* ===== MODAL BOTTOM ACTIONS (HIDDEN IN PRINT) ===== */}
              <div className="no-print p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between gap-3">
                <button
                  onClick={() => setSelectedInvoiceBooking(null)}
                  className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors"
                >
                  Tutup
                </button>

                <div className="flex items-center gap-3">
                  <a
                    href={generateWaInvoiceMsg()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2 shadow"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Kirim WA Invoice</span>
                  </a>

                  <button
                    onClick={handlePrintInvoice}
                    className="px-5 py-2.5 bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(0,102,204,0.4)] cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Cetak / Save PDF (A4)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

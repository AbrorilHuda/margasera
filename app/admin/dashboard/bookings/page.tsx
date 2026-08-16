'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getAllBookings,
  updateBookingStatus,
  updatePaymentStatus,
  deleteBooking,
} from '@/lib/actions/bookings';
import { getServices, getPackages } from '@/lib/actions/services';
import { getStudioSettings } from '@/lib/actions/settings';
import { DEFAULT_STUDIO_SETTINGS } from '@/lib/constants';
import { useToast } from '@/components/ui/toast-context';
import { BookingFilters } from './_components/BookingFilters';
import { BookingTable } from './_components/BookingTable';
import { AddBookingModal } from './_components/AddBookingModal';
import { BookingDetailModal } from './_components/BookingDetailModal';
import { InvoiceModal } from './_components/InvoiceModal';
import { PdfRekapModal } from './_components/PdfRekapModal';
import { calculateEndTime } from './_components/BookingHelpers';
import type { Booking, BookingStatus, PaymentStatus, Service, Package, StudioSettings } from '@/lib/types';

export default function BookingsPage() {
  const { toast, confirmModal } = useToast();

  // Data
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [studioSettings, setStudioSettings] = useState<StudioSettings>(DEFAULT_STUDIO_SETTINGS);
  const [loadingData, setLoadingData] = useState(true);

  // Filter & Sort States
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [bookingSort, setBookingSort] = useState<'newest' | 'oldest' | 'upcoming_event'>('newest');
  const [bookingSearch, setBookingSearch] = useState<string>('');

  // Modal States
  const [showAddBookingModal, setShowAddBookingModal] = useState(false);
  const [selectedBookingForDetail, setSelectedBookingForDetail] = useState<Booking | null>(null);
  const [selectedInvoiceBooking, setSelectedInvoiceBooking] = useState<Booking | null>(null);
  const [showPdfRekapModal, setShowPdfRekapModal] = useState(false);

  // Data Fetching 
  const refreshData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [bList, sList, pkgList, sSettings] = await Promise.all([
        getAllBookings(),
        getServices(),
        getPackages(),
        getStudioSettings(),
      ]);
      setBookings(bList);
      setServices(sList);
      setPackages(pkgList);
      if (sSettings) setStudioSettings(sSettings);
    } catch (err) {
      console.error('Failed to load bookings data', err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Derived Data
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    bookings.forEach((b) => {
      if (b.bookingDate) monthsSet.add(b.bookingDate.substring(0, 7));
    });
    return Array.from(monthsSet).sort().reverse();
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    return bookings
      .filter((b) => {
        const matchStatus = bookingStatusFilter === 'all' || b.status === bookingStatusFilter;
        const matchMonth = monthFilter === 'all' || (b.bookingDate && b.bookingDate.startsWith(monthFilter));
        const matchService = serviceFilter === 'all' || b.serviceId === serviceFilter;
        const query = bookingSearch.toLowerCase();
        const matchSearch =
          b.bookingCode.toLowerCase().includes(query) ||
          b.customerName.toLowerCase().includes(query) ||
          b.whatsapp.includes(bookingSearch) ||
          (b.location && b.location.toLowerCase().includes(query));
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

  const totalRevenue = useMemo(
    () => filteredBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0),
    [filteredBookings]
  );

  const pendingCount = useMemo(() => bookings.filter((b) => b.status === 'pending').length, [bookings]);
  const confirmedCount = useMemo(() => bookings.filter((b) => b.status === 'confirmed').length, [bookings]);

  // Helpers
  const formatMonthLabel = (ym: string) => {
    const [y, m] = ym.split('-');
    const date = new Date(parseInt(y), parseInt(m) - 1, 1);
    return new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(date);
  };

  const resetFilters = () => {
    setBookingStatusFilter('all');
    setMonthFilter('all');
    setServiceFilter('all');
    setBookingSearch('');
  };

  // Handlers
  const handleUpdateBookingStatus = async (id: string, newStatus: BookingStatus) => {
    const res = await updateBookingStatus(id, newStatus);
    if (res.success) {
      await refreshData();
      toast.success(`Status booking berhasil diubah menjadi ${newStatus}.`);
    } else {
      toast.error(`Gagal memperbarui status: ${res.error}`);
    }
  };

  const handleUpdatePaymentStatus = async (id: string, newPaymentStatus: PaymentStatus) => {
    const targetBooking = bookings.find((b) => b.id === id);
    let paidAmt: number | undefined = undefined;

    if (targetBooking) {
      if (newPaymentStatus === 'dp_paid') {
        const matchedPkg = packages.find(
          (p) =>
            (targetBooking.packageId && (p.id === targetBooking.packageId || p.slug === targetBooking.packageId)) ||
            (targetBooking.packageName && p.name.toLowerCase().trim() === targetBooking.packageName.toLowerCase().trim())
        );
        paidAmt =
          targetBooking.downPayment && targetBooking.downPayment > 0
            ? targetBooking.downPayment
            : matchedPkg?.downPayment && matchedPkg.downPayment > 0
              ? matchedPkg.downPayment
              : targetBooking.totalPrice
                ? Math.ceil(targetBooking.totalPrice * 0.2)
                : 0;
      } else if (newPaymentStatus === 'paid_full') {
        paidAmt = targetBooking.totalPrice ?? 0;
      } else {
        paidAmt = 0;
      }
    }

    const res = await updatePaymentStatus(id, newPaymentStatus, paidAmt);
    if (res.success) {
      await refreshData();
      if (selectedBookingForDetail?.id === id) {
        setSelectedBookingForDetail({ ...selectedBookingForDetail, paymentStatus: newPaymentStatus, paidAmount: paidAmt });
      }
      toast.success('Status pembayaran berhasil diperbarui.');
    } else {
      toast.error(`Gagal memperbarui status pembayaran: ${res.error}`);
    }
  };

  const handleDeleteBooking = (id: string, code: string) => {
    confirmModal({
      title: `Hapus Pesanan ${code}?`,
      message: `Apakah Anda yakin ingin menghapus data pemesanan "${code}" secara permanen? Data yang terhapus tidak dapat dikembalikan.`,
      confirmText: 'Ya, Hapus Permanen',
      variant: 'danger',
      onConfirm: async () => {
        const res = await deleteBooking(id);
        if (res.success) {
          await refreshData();
          toast.success(`Data booking ${code} berhasil dihapus.`);
        } else {
          toast.error(`Gagal menghapus booking: ${res.error}`);
        }
      },
    });
  };

  const handleOpenAddBooking = () => {
    setShowAddBookingModal(true);
  };

  // Loading State
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
      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Booking',
            value: `${bookings.length} Pesanan`,
            sub: 'Semua riwayat pemesanan',
            color: '#0066CC',
            icon: '📋',
          },
          {
            label: 'Dikonfirmasi',
            value: `${confirmedCount} Event`,
            sub: 'Jadwal acara siap eksekusi',
            color: '#10b981',
            icon: '✅',
          },
          {
            label: 'Perlu Konfirmasi',
            value: `${pendingCount} Booking`,
            sub: 'Menunggu verifikasi admin',
            color: '#f59e0b',
            icon: '⏳',
          },
          {
            label: 'Est. Total Omset',
            value: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalRevenue),
            sub: `${filteredBookings.length} booking dalam filter`,
            color: '#0066CC',
            icon: '💰',
          },
        ].map(({ label, value, sub, color, icon }) => (
          <div key={label} className="p-5 bg-zinc-900/70 border border-zinc-800/80 rounded-xl flex items-center justify-between shadow-lg">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-mono uppercase tracking-widest font-medium" style={{ color }}>{label}</span>
              <span className="font-sans text-xl font-extrabold" style={{ color }}>{value}</span>
              <span className="text-[11px] text-zinc-400 font-light">{sub}</span>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: `${color}15` }}>
              {icon}
            </div>
          </div>
        ))}
      </div>

      {/* FILTERS */}
      <BookingFilters
        bookings={bookings}
        services={services}
        bookingStatusFilter={bookingStatusFilter}
        monthFilter={monthFilter}
        serviceFilter={serviceFilter}
        bookingSort={bookingSort}
        bookingSearch={bookingSearch}
        filteredCount={filteredBookings.length}
        availableMonths={availableMonths}
        setBookingStatusFilter={setBookingStatusFilter}
        setMonthFilter={setMonthFilter}
        setServiceFilter={setServiceFilter}
        setBookingSort={setBookingSort}
        setBookingSearch={setBookingSearch}
        onOpenPdfRekap={() => setShowPdfRekapModal(true)}
        onOpenAddBooking={handleOpenAddBooking}
        formatMonthLabel={formatMonthLabel}
      />

      {/* TABLE */}
      <BookingTable
        filteredBookings={filteredBookings}
        totalBookings={bookings.length}
        monthFilter={monthFilter}
        bookingSearch={bookingSearch}
        bookingStatusFilter={bookingStatusFilter}
        serviceFilter={serviceFilter}
        formatMonthLabel={formatMonthLabel}
        onResetFilters={resetFilters}
        onDetail={setSelectedBookingForDetail}
        onInvoice={setSelectedInvoiceBooking}
        onUpdateStatus={handleUpdateBookingStatus}
        onDelete={handleDeleteBooking}
      />

      {/* MODALS */}
      {showAddBookingModal && (
        <AddBookingModal
          services={services}
          packages={packages}
          onClose={() => setShowAddBookingModal(false)}
          onSuccess={async () => {
            setShowAddBookingModal(false);
            await refreshData();
          }}
        />
      )}

      {selectedBookingForDetail && (
        <BookingDetailModal
          booking={selectedBookingForDetail}
          onClose={() => setSelectedBookingForDetail(null)}
          onUpdatePayment={handleUpdatePaymentStatus}
          onOpenInvoice={(b) => {
            setSelectedBookingForDetail(null);
            setSelectedInvoiceBooking(b);
          }}
        />
      )}

      {selectedInvoiceBooking && (
        <InvoiceModal
          booking={selectedInvoiceBooking}
          packages={packages}
          studioSettings={studioSettings}
          onClose={() => setSelectedInvoiceBooking(null)}
        />
      )}

      {showPdfRekapModal && (
        <PdfRekapModal
          filteredBookings={filteredBookings}
          services={services}
          studioSettings={studioSettings}
          totalRevenue={totalRevenue}
          monthFilter={monthFilter}
          serviceFilter={serviceFilter}
          bookingStatusFilter={bookingStatusFilter}
          formatMonthLabel={formatMonthLabel}
          onClose={() => setShowPdfRekapModal(false)}
        />
      )}
    </div>
  );
}

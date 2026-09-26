'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ClipboardList, CheckCircle2, Clock, Wallet, WifiOff } from 'lucide-react';
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
import { EditBookingModal } from './_components/EditBookingModal';
import { InvoiceModal } from './_components/InvoiceModal';
import { PdfRekapModal } from './_components/PdfRekapModal';
import { ShareTestimonialModal } from './_components/ShareTestimonialModal';
import { GalleryAdminModal } from './_components/GalleryAdminModal';
import { calculateEndTime } from './_components/BookingHelpers';
import {
  cacheMasterData,
  getCachedMasterData,
  OFFLINE_QUEUE_EVENT,
} from '@/lib/offline-queue';
import { getAllLocalBookings, getMasterDataLocal } from '@/lib/offline';
import { formatCompactIDR, formatCurrency, getBookingPaidAmount, getBookingRemainingAmount } from '@/lib/utils';
import type { Booking, BookingStatus, PaymentStatus, Service, Package, StudioSettings } from '@/lib/types';

export default function BookingsPage() {
  const { toast, confirmModal } = useToast();

  // Connection & Offline State
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const updateOnlineStatus = () => {
      const offline = typeof navigator !== 'undefined' ? !navigator.onLine : false;
      setIsOffline(offline);
    };
    updateOnlineStatus();
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // Data
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [studioSettings, setStudioSettings] = useState<StudioSettings>(DEFAULT_STUDIO_SETTINGS);
  const [loadingData, setLoadingData] = useState(true);

  // Filter & Pagination States
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [bookingSort, setBookingSort] = useState<'newest' | 'oldest' | 'upcoming_event'>('newest');
  const [bookingSearch, setBookingSearch] = useState<string>('');
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Auto Reset to page 1 whenever any filter or limit changes
  useEffect(() => {
    setCurrentPage(1);
  }, [bookingStatusFilter, monthFilter, serviceFilter, bookingSort, bookingSearch, pageSize]);

  // Modal States
  const [showAddBookingModal, setShowAddBookingModal] = useState(false);
  const [selectedBookingForDetail, setSelectedBookingForDetail] = useState<Booking | null>(null);
  const [selectedInvoiceBooking, setSelectedInvoiceBooking] = useState<Booking | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [showPdfRekapModal, setShowPdfRekapModal] = useState(false);
  const [completedBookingForShare, setCompletedBookingForShare] = useState<Booking | null>(null);
  const [selectedGalleryBooking, setSelectedGalleryBooking] = useState<Booking | null>(null);

  // Auto-open Add modal if ?action=new
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('action') === 'new') {
        setShowAddBookingModal(true);
      }
    }
  }, []);

  // Data Fetching: Stale-While-Revalidate via IndexedDB
  const refreshData = useCallback(async (showSkeleton = false) => {
    // 1. Tampilkan data dari IndexedDB secara instan jika tersedia
    try {
      const localBookings = await getAllLocalBookings();
      const [localSrv, localPkg, localSettings] = await Promise.all([
        getMasterDataLocal<Service[]>('services'),
        getMasterDataLocal<Package[]>('packages'),
        getMasterDataLocal<StudioSettings>('settings'),
      ]);

      if (localBookings.length > 0) {
        setBookings(localBookings);
        if (localSrv && localSrv.length > 0) setServices(localSrv);
        if (localPkg && localPkg.length > 0) setPackages(localPkg);
        if (localSettings) setStudioSettings(localSettings);
        setLoadingData(false);
      } else if (showSkeleton) {
        setLoadingData(true);
      }
    } catch {
      const cached = getCachedMasterData();
      if (cached.bookings.length > 0) {
        setBookings(cached.bookings);
        if (cached.services.length > 0) setServices(cached.services);
        if (cached.packages.length > 0) setPackages(cached.packages);
        if (cached.studioSettings) setStudioSettings(cached.studioSettings);
        setLoadingData(false);
      } else if (showSkeleton) {
        setLoadingData(true);
      }
    }

    // 2. Jika online, perbarui data asli dari Supabase di background
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      try {
        const [resBookings, resServices, resPackages, resSettings] = await Promise.all([
          getAllBookings(),
          getServices(),
          getPackages(),
          getStudioSettings(),
        ]);

        // Simpan ke IndexedDB & cache lokal
        cacheMasterData({
          services: resServices,
          packages: resPackages,
          bookings: resBookings,
          studioSettings: resSettings || undefined,
        });

        // Ambil draft offline yang belum tersinkron agar tetap tampil paling atas
        const localItems = await getAllLocalBookings();
        const pendingDrafts = localItems.filter((b) => b.syncStatus === 'pending');
        const existingIds = new Set(resBookings.map((b) => b.id));
        const activeDrafts = pendingDrafts.filter((d) => !existingIds.has(d.id));

        setBookings([...activeDrafts, ...resBookings]);
        if (resServices.length > 0) setServices(resServices);
        if (resPackages.length > 0) setPackages(resPackages);
        if (resSettings) setStudioSettings(resSettings);
      } catch (fetchErr) {
        console.warn('[BookingsPage] Fetch gagal, mempertahankan data lokal IndexedDB:', fetchErr);
      }
    }
    setLoadingData(false);
  }, []);

  useEffect(() => {
    refreshData(true);
  }, [refreshData]);

  // Listener untuk memperbarui tabel jika ada data booking offline baru atau baru selesai disinkronkan
  useEffect(() => {
    const handleQueueChange = () => {
      refreshData(false);
    };
    window.addEventListener(OFFLINE_QUEUE_EVENT, handleQueueChange);
    return () => window.removeEventListener(OFFLINE_QUEUE_EVENT, handleQueueChange);
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

  // Pagination Slice
  const totalFiltered = filteredBookings.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const startIndex = totalFiltered === 0 ? 0 : (validCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalFiltered);
  const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

  const realizedRevenue = useMemo(
    () => filteredBookings.reduce((sum, b) => sum + getBookingPaidAmount(b), 0),
    [filteredBookings]
  );

  const pendingReceivables = useMemo(
    () => filteredBookings.reduce((sum, b) => sum + getBookingRemainingAmount(b), 0),
    [filteredBookings]
  );

  const pendingCount = useMemo(() => bookings.filter((b) => b.status === 'pending').length, [bookings]);
  const confirmedCount = useMemo(
    () => bookings.filter((b) => b.status === 'confirmed' || b.status === 'completed').length,
    [bookings]
  );

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

  // Handlers with Optimistic Updates (Zero Full-Page Reloading)
  const handleUpdateBookingStatus = async (id: string, newStatus: BookingStatus) => {
    const previousBookings = [...bookings];
    const previousSelected = selectedBookingForDetail ? { ...selectedBookingForDetail } : null;
    const targetBooking =
      bookings.find((b) => b.id === id) ||
      (selectedBookingForDetail?.id === id ? selectedBookingForDetail : null);

    // 1. Optimistic local state update
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    );
    if (selectedBookingForDetail?.id === id) {
      setSelectedBookingForDetail((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    // Jika diubah menjadi completed, langsung tampilkan pop up link testimoni
    if (newStatus === 'completed' && targetBooking) {
      setCompletedBookingForShare({ ...targetBooking, status: 'completed' });
    }

    // 2. Background server action execution
    const res = await updateBookingStatus(id, newStatus);
    if (res.success) {
      toast.success(`Status booking berhasil diubah menjadi ${newStatus}.`);
      await refreshData(false);
    } else {
      // Revert if server action failed
      setBookings(previousBookings);
      if (previousSelected) setSelectedBookingForDetail(previousSelected);
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

    const previousBookings = [...bookings];
    const previousSelected = selectedBookingForDetail ? { ...selectedBookingForDetail } : null;

    // 1. Optimistic local state update
    setBookings((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
            ...b,
            paymentStatus: newPaymentStatus,
            paidAmount: paidAmt !== undefined ? paidAmt : b.paidAmount,
            remainingAmount:
              b.totalPrice !== undefined && paidAmt !== undefined
                ? Math.max(0, b.totalPrice - paidAmt)
                : b.remainingAmount,
          }
          : b
      )
    );
    if (selectedBookingForDetail?.id === id) {
      setSelectedBookingForDetail((prev) =>
        prev
          ? {
            ...prev,
            paymentStatus: newPaymentStatus,
            paidAmount: paidAmt !== undefined ? paidAmt : prev.paidAmount,
            remainingAmount:
              prev.totalPrice !== undefined && paidAmt !== undefined
                ? Math.max(0, prev.totalPrice - paidAmt)
                : prev.remainingAmount,
          }
          : null
      );
    }

    // 2. Background server action execution
    const res = await updatePaymentStatus(id, newPaymentStatus, paidAmt);
    if (res.success) {
      toast.success('Status pembayaran berhasil diperbarui.');
      await refreshData(false);
    } else {
      // Revert if server action failed
      setBookings(previousBookings);
      if (previousSelected) setSelectedBookingForDetail(previousSelected);
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
        const previousBookings = [...bookings];
        const previousSelected = selectedBookingForDetail ? { ...selectedBookingForDetail } : null;

        // Optimistic remove
        setBookings((prev) => prev.filter((b) => b.id !== id));
        if (selectedBookingForDetail?.id === id) {
          setSelectedBookingForDetail(null);
        }

        const res = await deleteBooking(id);
        if (res.success) {
          toast.success(`Data booking ${code} berhasil dihapus.`);
          await refreshData(false);
        } else {
          setBookings(previousBookings);
          if (previousSelected) setSelectedBookingForDetail(previousSelected);
          toast.error(`Gagal menghapus booking: ${res.error}`);
        }
      },
    });
  };

  const handleOpenAddBooking = () => {
    setShowAddBookingModal(true);
  };

  // Initial Full Skeleton Loading State (Only on first page load)
  if (loadingData) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-zinc-200/70 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/60 rounded-xl" />
          ))}
        </div>
        <div className="h-24 bg-zinc-200/70 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/60 rounded-xl" />
        <div className="h-96 bg-zinc-200/70 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/60 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Offline Mode Banner */}
      {isOffline && (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-700 dark:text-amber-400 text-xs sm:text-sm font-medium shadow-xs backdrop-blur-xs">
          <WifiOff className="w-4 h-4 shrink-0 text-amber-500 animate-pulse" />
          <span>
            <strong>Mode Offline Aktif</strong> — Menampilkan {bookings.length} pesanan dari database lokal IndexedDB. Anda tetap dapat membaca data dan membuat pesanan offline baru.
          </span>
        </div>
      )}

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          {
            label: 'Total Bookings',
            value: `${bookings.length}`,
            unit: 'Pesanan',
            sub: 'Semua riwayat pemesanan',
            color: '#0066CC',
            icon: ClipboardList,
          },
          {
            label: 'Confirmed',
            value: `${confirmedCount}`,
            unit: 'Event',
            sub: 'Jadwal siap eksekusi',
            color: '#10b981',
            icon: CheckCircle2,
          },
          {
            label: 'Pending Review',
            value: `${pendingCount}`,
            unit: 'Booking',
            sub: 'Menunggu konfirmasi / DP',
            color: '#f59e0b',
            icon: Clock,
          },
          {
            label: 'Kas Masuk (Riil)',
            value: formatCompactIDR(realizedRevenue).value,
            unit: formatCompactIDR(realizedRevenue).unit,
            sub:
              pendingReceivables > 0
                ? `+${formatCompactIDR(pendingReceivables).full} piutang`
                : `${filteredBookings.length} booking aktif`,
            color: '#0066CC',
            icon: Wallet,
            tooltip: `Kas Masuk: ${formatCurrency(realizedRevenue)} | Sisa Piutang: ${formatCurrency(pendingReceivables)}`,
          },
        ].map(({ label, value, unit, sub, color, icon: Icon, tooltip }) => (
          <div key={label} title={tooltip} className="p-4 sm:p-5 bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs backdrop-blur-md">
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest font-semibold truncate" style={{ color }}>{label}</span>
              <div className="flex items-baseline gap-1 truncate">
                <span className="font-sans text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-zinc-100 truncate">{value}</span>
                {unit && <span className="text-xs text-zinc-500 font-medium">{unit}</span>}
              </div>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-light truncate">{sub}</span>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 self-end sm:self-center" style={{ background: `${color}15`, color }}>
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
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
        pageSize={pageSize}
        filteredCount={filteredBookings.length}
        availableMonths={availableMonths}
        setBookingStatusFilter={setBookingStatusFilter}
        setMonthFilter={setMonthFilter}
        setServiceFilter={setServiceFilter}
        setBookingSort={setBookingSort}
        setBookingSearch={setBookingSearch}
        setPageSize={setPageSize}
        onOpenPdfRekap={() => setShowPdfRekapModal(true)}
        onOpenAddBooking={handleOpenAddBooking}
        formatMonthLabel={formatMonthLabel}
      />

      {/* TABLE */}
      <BookingTable
        paginatedBookings={paginatedBookings}
        filteredCount={totalFiltered}
        totalBookings={bookings.length}
        currentPage={validCurrentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        startIndex={totalFiltered === 0 ? 0 : startIndex + 1}
        endIndex={endIndex}
        monthFilter={monthFilter}
        bookingSearch={bookingSearch}
        bookingStatusFilter={bookingStatusFilter}
        serviceFilter={serviceFilter}
        formatMonthLabel={formatMonthLabel}
        onResetFilters={resetFilters}
        onPageChange={(page) => setCurrentPage(page)}
        onPageSizeChange={(size) => setPageSize(size)}
        onDetail={setSelectedBookingForDetail}
        onInvoice={setSelectedInvoiceBooking}
        onOpenGallery={setSelectedGalleryBooking}
        onUpdateStatus={handleUpdateBookingStatus}
        onShareTestimonial={(b) => setCompletedBookingForShare(b)}
        onDelete={handleDeleteBooking}
        onEdit={(b) => setEditingBooking(b)}
      />

      {/* MODALS */}
      {showAddBookingModal && (
        <AddBookingModal
          services={services}
          packages={packages}
          onClose={() => setShowAddBookingModal(false)}
          onSuccess={async () => {
            setShowAddBookingModal(false);
            await refreshData(false);
          }}
        />
      )}

      {/* Modal Edit / Pindah Tanggal Booking */}
      {editingBooking && (
        <EditBookingModal
          booking={editingBooking}
          services={services}
          packages={packages}
          isOpen
          onClose={() => setEditingBooking(null)}
          onSuccess={async () => {
            setEditingBooking(null);
            await refreshData(false);
          }}
        />
      )}

      {selectedBookingForDetail && (
        <BookingDetailModal
          booking={selectedBookingForDetail}
          onClose={() => setSelectedBookingForDetail(null)}
          onUpdateStatus={handleUpdateBookingStatus}
          onShareTestimonial={(b) => setCompletedBookingForShare(b)}
          onUpdatePayment={handleUpdatePaymentStatus}
          onOpenGallery={(b) => {
            setSelectedBookingForDetail(null);
            setSelectedGalleryBooking(b);
          }}
          onEdit={(b) => {
            setSelectedBookingForDetail(null);
            setEditingBooking(b);
          }}
          onOpenInvoice={(b) => {
            setSelectedBookingForDetail(null);
            setSelectedInvoiceBooking(b);
          }}
          onDelete={handleDeleteBooking}
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
          totalRevenue={realizedRevenue}
          pendingReceivables={pendingReceivables}
          monthFilter={monthFilter}
          serviceFilter={serviceFilter}
          bookingStatusFilter={bookingStatusFilter}
          formatMonthLabel={formatMonthLabel}
          onClose={() => setShowPdfRekapModal(false)}
        />
      )}

      {/* Pop-up Link Testimoni untuk Booking Selesai */}
      {completedBookingForShare && (
        <ShareTestimonialModal
          booking={completedBookingForShare}
          isOpen={Boolean(completedBookingForShare)}
          onClose={() => setCompletedBookingForShare(null)}
        />
      )}

      {/* Modal Kelola Galeri Seleksi Klien */}
      {selectedGalleryBooking && (
        <GalleryAdminModal
          booking={selectedGalleryBooking}
          onClose={() => setSelectedGalleryBooking(null)}
          onSuccess={async () => {
            await refreshData(false);
          }}
        />
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Loader2,
  Calendar,
  CalendarClock,
  Clock,
  MapPin,
  User,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Check,
  RotateCcw,
} from 'lucide-react';
import { updateBooking } from '@/lib/actions/bookings';
import { formatCurrency, formatDate } from '@/lib/utils';
import { calculateEndTime } from './BookingHelpers';
import { useToast } from '@/components/ui/toast-context';
import type { Booking, BookingStatus, Service, Package } from '@/lib/types';

interface EditBookingModalProps {
  booking: Booking | null;
  services?: Service[];
  packages?: Package[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const STATUS_CONFIG: Record<BookingStatus, { label: string; style: string; dot: string }> = {
  confirmed: {
    label: 'Terkonfirmasi (Confirmed)',
    style: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
  pending: {
    label: 'Menunggu Konfirmasi (Pending)',
    style: 'border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-400',
    dot: 'bg-amber-500',
  },
  completed: {
    label: 'Selesai (Completed)',
    style: 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400',
    dot: 'bg-blue-500',
  },
  cancelled: {
    label: 'Dibatalkan (Cancelled)',
    style: 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400',
    dot: 'bg-rose-500',
  },
};

/**
 * Normalisasi format tanggal ke format HTML5 standard 'YYYY-MM-DD'.
 * Mengatasi string ISO (2026-08-29T...), string SQL (2026-08-29 00:00:00), dsb.
 */
function normalizeDate(raw?: string | null): string {
  if (!raw) return '';
  const trimmed = String(raw).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  if (trimmed.includes('T')) {
    const part = trimmed.split('T')[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(part)) return part;
  }
  if (trimmed.includes(' ')) {
    const part = trimmed.split(' ')[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(part)) return part;
  }
  try {
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  } catch {
    // fallback
  }
  return '';
}

/**
 * Normalisasi format jam ke 'HH:mm' yang valid untuk input type="time".
 * Mengatasi '08:00:00' (PostgreSQL time column), '08:00 WIB', '8:00', dsb.
 */
function normalizeTime(raw?: string | null, defaultTime = '08:00'): string {
  if (!raw) return defaultTime;
  const cleaned = String(raw).replace(/[^0-9:]/g, '').trim();
  const parts = cleaned.split(':');
  if (parts.length >= 2) {
    const hh = parts[0].padStart(2, '0').slice(-2);
    const mm = parts[1].padStart(2, '0').slice(0, 2);
    return `${hh}:${mm}`;
  }
  if (parts.length === 1 && parts[0].length >= 2) {
    const hh = parts[0].slice(0, 2).padStart(2, '0');
    return `${hh}:00`;
  }
  return defaultTime;
}

export function EditBookingModal({
  booking,
  services = [],
  packages = [],
  isOpen,
  onClose,
  onSuccess,
}: EditBookingModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State - initialized safely from booking
  const [bookingDate, setBookingDate] = useState(() => normalizeDate(booking?.bookingDate));
  const [startTime, setStartTime] = useState(() => normalizeTime(booking?.startTime, '08:00'));
  const [endTime, setEndTime] = useState(() => normalizeTime(booking?.endTime, '14:00'));
  const [location, setLocation] = useState(() => booking?.location || '');
  const [customerName, setCustomerName] = useState(() => booking?.customerName || '');
  const [whatsapp, setWhatsapp] = useState(() => booking?.whatsapp || '');
  const [instagram, setInstagram] = useState(() => booking?.instagram || '');
  const [serviceId, setServiceId] = useState(() => booking?.serviceId || '');
  const [packageId, setPackageId] = useState(() => booking?.packageId || '');
  const [status, setStatus] = useState<BookingStatus>(() => booking?.status || 'confirmed');
  const [notes, setNotes] = useState(() => booking?.notes || '');

  // Populate data whenever modal opens or booking changes
  useEffect(() => {
    if (booking && isOpen) {
      setBookingDate(normalizeDate(booking.bookingDate));
      setStartTime(normalizeTime(booking.startTime, '08:00'));
      setEndTime(normalizeTime(booking.endTime, '14:00'));
      setLocation(booking.location || '');
      setCustomerName(booking.customerName || '');
      setWhatsapp(booking.whatsapp || '');
      setInstagram(booking.instagram || '');
      setServiceId(booking.serviceId || '');
      setPackageId(booking.packageId || '');
      setStatus(booking.status || 'confirmed');
      setNotes(booking.notes || '');
    }
  }, [booking, isOpen]);

  if (!isOpen || !booking) return null;

  const originalDate = normalizeDate(booking.bookingDate);
  const isDateChanged = Boolean(bookingDate && originalDate && originalDate !== bookingDate);
  const isLocationChanged = (booking.location || '') !== location;

  const handleResetDate = () => {
    setBookingDate(normalizeDate(booking.bookingDate));
    setStartTime(normalizeTime(booking.startTime, '08:00'));
    setEndTime(normalizeTime(booking.endTime, '14:00'));
  };

  const handleServiceChange = (srvId: string) => {
    setServiceId(srvId);
    const availablePkgs = packages.filter((p) => p.serviceId === srvId);
    if (availablePkgs.length > 0) {
      const selPkg = availablePkgs[0];
      setPackageId(selPkg.id);
      const autoEnd = calculateEndTime(startTime, selPkg.duration || '6 Jam');
      setEndTime(autoEnd);
    }
  };

  const handlePackageChange = (pkgId: string) => {
    setPackageId(pkgId);
    const selPkg = packages.find((p) => p.id === pkgId);
    if (selPkg) {
      const autoEnd = calculateEndTime(startTime, selPkg.duration || '6 Jam');
      setEndTime(autoEnd);
    }
  };

  const handleStartTimeChange = (newStart: string) => {
    setStartTime(newStart);
    const selPkg = packages.find((p) => p.id === packageId);
    const autoEnd = calculateEndTime(newStart, selPkg?.duration || '6 Jam');
    setEndTime(autoEnd);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDate) {
      toast.warning('Silakan pilih tanggal acara.');
      return;
    }
    if (!customerName.trim()) {
      toast.warning('Nama pelanggan tidak boleh kosong.');
      return;
    }
    if (!whatsapp.trim()) {
      toast.warning('Nomor WhatsApp tidak boleh kosong.');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedSrv = services.find((s) => s.id === serviceId);
      const selectedPkg = packages.find((p) => p.id === packageId);

      const res = await updateBooking(booking.id, {
        bookingDate,
        startTime,
        endTime,
        location: location.trim() || undefined,
        customerName: customerName.trim(),
        whatsapp: whatsapp.trim(),
        instagram: instagram.trim() || undefined,
        serviceId: serviceId || undefined,
        serviceName: selectedSrv?.name || booking.serviceName,
        packageId: packageId || undefined,
        packageName: selectedPkg?.name || booking.packageName,
        status,
        notes: notes.trim() || undefined,
      });

      if (res.success) {
        if (isDateChanged) {
          toast.success(
            `Jadwal booking ${booking.bookingCode} berhasil dipindahkan ke tanggal ${formatDate(bookingDate)}!`
          );
        } else {
          toast.success(`Data booking ${booking.bookingCode} berhasil diperbarui!`);
        }
        onSuccess();
        onClose();
      } else {
        toast.error(res.error || 'Gagal memperbarui booking.');
      }
    } catch (err) {
      console.error('Error updating booking:', err);
      toast.error('Terjadi kesalahan saat menyimpan perubahan booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950/90 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:border-[#0066CC] dark:focus:border-blue-400 focus:ring-2 focus:ring-[#0066CC]/15 dark:focus:ring-blue-500/20 transition-all font-sans [color-scheme:light] dark:[color-scheme:dark]';
  const selectClass =
    'w-full px-3.5 py-2.5 bg-white dark:bg-zinc-950/90 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-[#0066CC] dark:focus:border-blue-400 focus:ring-2 focus:ring-[#0066CC]/15 dark:focus:ring-blue-500/20 transition-all cursor-pointer font-sans [color-scheme:light] dark:[color-scheme:dark]';
  const labelClass =
    'text-[10px] font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 font-mono';

  return (
    <div className="fixed inset-0 z-50 bg-black/70 dark:bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="relative bg-white dark:bg-zinc-900 border-t sm:border border-zinc-200/90 dark:border-zinc-800/90 rounded-t-3xl sm:rounded-3xl max-w-2xl w-full max-h-[92vh] sm:max-h-[88vh] flex flex-col shadow-2xl dark:shadow-[0_24px_70px_rgba(0,0,0,0.85)] overflow-hidden animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[#0066CC]/60 before:to-transparent">
        {/* Subtle Ambient Backlight in Dark Mode */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 bg-[#0066CC]/10 dark:bg-blue-500/15 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-64 h-64 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-3xl" />

        {/* Mobile Drag Indicator */}
        <div className="w-12 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mt-2.5 sm:hidden shrink-0" />

        {/* Header */}
        <div className="p-5 sm:p-6 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between gap-4 shrink-0 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/20 via-blue-500/10 to-indigo-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base sm:text-lg font-extrabold text-[#0066CC] dark:text-blue-400">
                  {booking.bookingCode}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-medium">
                  {booking.customerName}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-light mt-0.5">
                Edit rincian data pemesanan atau jadwalkan ulang tanggal acara.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-all active:scale-95 cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 flex-1 overflow-y-auto flex flex-col gap-5 text-xs pb-safe relative z-10">
          {/* SECTION 1: HERO CARD — PINDAH JADWAL ACARA */}
          <div className="relative p-4 sm:p-5 bg-gradient-to-br from-amber-500/[0.08] via-amber-500/[0.03] to-transparent dark:from-amber-950/25 dark:via-zinc-900/50 dark:to-zinc-950/70 border border-amber-500/30 dark:border-amber-500/30 rounded-2xl flex flex-col gap-4 shadow-xs">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[11px] font-mono uppercase tracking-widest text-amber-700 dark:text-amber-300 font-bold">
                  Jadwal &amp; Pindah Tanggal Acara
                </span>
              </div>

              {isDateChanged && (
                <button
                  type="button"
                  onClick={handleResetDate}
                  className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                  title="Kembalikan ke tanggal awal"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Tanggal Awal</span>
                </button>
              )}
            </div>

            {/* Visual Date Transition Banner */}
            {isDateChanged ? (
              <div className="p-3 bg-white/90 dark:bg-zinc-950/80 border border-amber-400/40 dark:border-amber-500/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-zinc-400 line-through font-mono text-xs">
                    {formatDate(booking.bookingDate)}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="font-bold text-amber-700 dark:text-amber-300 font-mono text-xs flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                    {formatDate(bookingDate)}
                  </span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 uppercase tracking-wider w-fit font-mono">
                  Pindah Tanggal
                </span>
              </div>
            ) : (
              <div className="p-3 bg-white/85 dark:bg-zinc-950/70 border border-zinc-200/90 dark:border-zinc-800/90 rounded-xl flex items-center gap-3 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-zinc-400 dark:text-zinc-500 block font-semibold">
                    Jadwal Acara Saat Ini:
                  </span>
                  <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 font-mono flex items-center gap-1.5 flex-wrap">
                    <span>{bookingDate ? formatDate(bookingDate) : formatDate(booking.bookingDate)}</span>
                    <span className="text-amber-600 dark:text-amber-400">({startTime} – {endTime} WIB)</span>
                  </span>
                </div>
              </div>
            )}

            {/* Date and Time Inputs Grid — selalu tampil */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>
                  Tanggal Acara <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    onClick={(e) => (e.currentTarget as any).showPicker?.()}
                    style={{ colorScheme: 'auto' }}
                    className={`${inputClass} font-mono font-semibold bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 pl-3.5 pr-8 cursor-pointer`}
                  />
                  <Calendar className="w-4 h-4 text-amber-500 absolute right-3 pointer-events-none opacity-80" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Jam Mulai</label>
                <div className="relative flex items-center">
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => handleStartTimeChange(e.target.value)}
                    onClick={(e) => (e.currentTarget as any).showPicker?.()}
                    style={{ colorScheme: 'auto' }}
                    className={`${inputClass} font-mono bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 font-semibold pl-3.5 pr-8 cursor-pointer`}
                  />
                  <Clock className="w-4 h-4 text-amber-500 absolute right-3 pointer-events-none opacity-80" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className={labelClass}>Jam Selesai</label>
                  <span className="text-[9px] font-mono text-zinc-400">(Estimasi)</span>
                </div>
                <div className="relative flex items-center">
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    onClick={(e) => (e.currentTarget as any).showPicker?.()}
                    style={{ colorScheme: 'auto' }}
                    className={`${inputClass} font-mono bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 font-semibold pl-3.5 pr-8 cursor-pointer`}
                  />
                  <Clock className="w-4 h-4 text-amber-500 absolute right-3 pointer-events-none opacity-80" />
                </div>
              </div>
            </div>

            {/* Quick Time Preset Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">Pilihan Jam Cepat:</span>
              {[
                { label: '08:00 – 14:00 (Pagi)', s: '08:00', e: '14:00' },
                { label: '09:00 – 15:00', s: '09:00', e: '15:00' },
                { label: '13:00 – 19:00 (Siang)', s: '13:00', e: '19:00' },
                { label: '15:00 – 21:00 (Sore)', s: '15:00', e: '21:00' },
              ].map((slot) => (
                <button
                  key={slot.label}
                  type="button"
                  onClick={() => {
                    setStartTime(slot.s);
                    setEndTime(slot.e);
                  }}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-mono transition-all cursor-pointer ${
                    startTime === slot.s && endTime === slot.e
                      ? 'bg-amber-500 text-white font-bold shadow-2xs'
                      : 'bg-white/80 dark:bg-zinc-800/80 hover:bg-amber-50 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/80'
                  }`}
                >
                  {slot.label}
                </button>
              ))}
            </div>

            {isDateChanged && (
              <p className="text-[11px] text-amber-700 dark:text-amber-300/90 font-light flex items-start gap-1.5 leading-relaxed pt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" />
                <span>
                  Slot ketersediaan pada kalender publik Margasera akan otomatis membuka tanggal lama dan mengunci tanggal baru secara real-time.
                </span>
              </p>
            )}
          </div>

          {/* SECTION 2: LOKASI & VENUE ACARA */}
          <div className="p-4 bg-zinc-50/80 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className={`${labelClass} flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300`}>
                <MapPin className="w-3.5 h-3.5 text-[#0066CC] dark:text-blue-400" />
                <span>Lokasi Acara / Venue</span>
              </label>
              {isLocationChanged && (
                <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-semibold">
                  Lokasi Diubah
                </span>
              )}
            </div>
            <input
              type="text"
              placeholder="Contoh: Gedung Islamic Center Pamekasan / Rumah Mempelai"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* SECTION 3: INFORMASI KLIEN & KONTAK */}
          <div className="p-4 bg-zinc-50/80 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl flex flex-col gap-3">
            <span className={`${labelClass} flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300`}>
              <User className="w-3.5 h-3.5 text-[#0066CC] dark:text-blue-400" />
              <span>Data Klien &amp; Kontak</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>
                  Nama Klien / Pasangan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rian & Amanda"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>
                  Nomor WhatsApp <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="08123456789"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className={`${inputClass} font-mono`}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Username Instagram (Opsional)</label>
              <input
                type="text"
                placeholder="@username_klien"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className={`${inputClass} font-mono`}
              />
            </div>
          </div>

          {/* SECTION 4: LAYANAN, PAKET, & STATUS PEMESANAN */}
          <div className="p-4 bg-zinc-50/80 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl flex flex-col gap-3">
            <span className={`${labelClass} flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300`}>
              <Sparkles className="w-3.5 h-3.5 text-[#0066CC] dark:text-blue-400" />
              <span>Layanan &amp; Status Pemesanan</span>
            </span>

            {services.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Layanan Foto</label>
                  <select
                    value={serviceId}
                    onChange={(e) => handleServiceChange(e.target.value)}
                    className={selectClass}
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Paket Dokumentasi</label>
                  <select
                    value={packageId}
                    onChange={(e) => handlePackageChange(e.target.value)}
                    className={selectClass}
                  >
                    {packages
                      .filter((p) => !serviceId || p.serviceId === serviceId)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({formatCurrency(p.price)})
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5 pt-1">
              <label className={labelClass}>Status Booking</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as BookingStatus)}
                className={selectClass}
              >
                <option value="pending">Pending (Menunggu Konfirmasi)</option>
                <option value="confirmed">Confirmed (Terkonfirmasi)</option>
                <option value="completed">Completed (Selesai)</option>
                <option value="cancelled">Cancelled (Dibatalkan)</option>
              </select>
            </div>
          </div>

          {/* SECTION 5: CATATAN RESCHEDULE / KETERANGAN */}
          <div className="p-4 bg-zinc-50/80 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl flex flex-col gap-2">
            <label className={labelClass}>Catatan Tambahan / Keterangan Reschedule</label>
            <textarea
              rows={3}
              placeholder="Contoh: Klien meminta reschedule tanggal dari 15 Agustus ke 20 September karena bentrok jadwal keluarga."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={`${inputClass} font-sans resize-none`}
            />
          </div>
        </form>

        {/* Sticky Glass Footer */}
        <div className="p-4 sm:p-5 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-end gap-3 shrink-0 relative z-10 pb-safe">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-300 font-semibold uppercase tracking-wider rounded-xl transition-all cursor-pointer text-xs active:scale-95"
          >
            Batal
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
            className="px-6 py-2.5 bg-gradient-to-r from-[#0066CC] to-[#0052A3] hover:from-[#0052A3] hover:to-blue-700 disabled:opacity-50 text-white font-semibold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-[#0066CC]/25 dark:shadow-[0_0_20px_rgba(0,102,204,0.35)] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer text-xs"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan Perubahan...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Simpan Perubahan Jadwal</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { createManualBooking } from '@/lib/actions/bookings';
import { formatCurrency } from '@/lib/utils';
import { BOOKING_FORM_DEFAULTS } from '@/lib/constants';
import { calculateEndTime } from './BookingHelpers';
import { useToast } from '@/components/ui/toast-context';
import type { Service, Package } from '@/lib/types';

type BookingFormState = typeof BOOKING_FORM_DEFAULTS;

interface AddBookingModalProps {
  services: Service[];
  packages: Package[];
  onClose: () => void;
  onSuccess: () => void;
}

export function AddBookingModal({ services, packages, onClose, onSuccess }: AddBookingModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getInitialForm = (): BookingFormState => {
    const srvId = services[0]?.id || '';
    const firstPkg = packages.find((p) => p.serviceId === srvId);
    const autoEnd = calculateEndTime('08:00', firstPkg?.duration || '6 Jam');
    return {
      ...BOOKING_FORM_DEFAULTS,
      bookingDate: new Date().toISOString().split('T')[0],
      serviceId: srvId,
      packageId: firstPkg?.id || '',
      totalPrice: firstPkg?.price ?? BOOKING_FORM_DEFAULTS.totalPrice,
      downPayment: firstPkg?.downPayment && firstPkg.downPayment > 0 ? firstPkg.downPayment : BOOKING_FORM_DEFAULTS.downPayment,
      endTime: autoEnd,
    };
  };

  const [form, setForm] = useState<BookingFormState>(getInitialForm);

  const patch = (partial: Partial<BookingFormState>) => setForm((prev) => ({ ...prev, ...partial }));

  const handleServiceChange = (srvId: string) => {
    const availablePkgs = packages.filter((p) => p.serviceId === srvId);
    const selPkg = availablePkgs[0];
    const dpAmount = selPkg?.downPayment && selPkg.downPayment > 0
      ? selPkg.downPayment
      : Math.ceil((selPkg?.price ?? 5_000_000) * 0.2);
    const autoEndTime = calculateEndTime(form.startTime, selPkg?.duration || '6 Jam');
    patch({ serviceId: srvId, packageId: selPkg?.id || '', totalPrice: selPkg?.price ?? form.totalPrice, downPayment: dpAmount, endTime: autoEndTime });
  };

  const handlePackageChange = (pkgId: string) => {
    const selPkg = packages.find((p) => p.id === pkgId);
    const dpAmount = selPkg?.downPayment && selPkg.downPayment > 0
      ? selPkg.downPayment
      : Math.ceil((selPkg?.price ?? 5_000_000) * 0.2);
    const autoEndTime = calculateEndTime(form.startTime, selPkg?.duration || '6 Jam');
    patch({ packageId: pkgId, totalPrice: selPkg?.price ?? form.totalPrice, downPayment: dpAmount, endTime: autoEndTime });
  };

  const handleStartTimeChange = (newStart: string) => {
    const selPkg = packages.find((p) => p.id === form.packageId);
    const autoEnd = calculateEndTime(newStart, selPkg?.duration || '6 Jam');
    patch({ startTime: newStart, endTime: autoEnd });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const cleanDate = form.bookingDate.replace(/-/g, '').substring(2);
      const randomNum = String(Math.floor(Math.random() * 900) + 100);
      const selectedSrv = services.find((s) => s.id === form.serviceId);
      const selectedPkg = packages.find((p) => p.id === form.packageId);
      const bookingCode = `MS-${cleanDate}-${randomNum}`;
      const totalPriceVal = Number(form.totalPrice) || (selectedPkg?.price ?? 10_000_000);
      const dpVal = Number(form.downPayment) || (selectedPkg?.downPayment && selectedPkg.downPayment > 0
        ? selectedPkg.downPayment
        : Math.ceil(totalPriceVal * 0.2));

      const paidAmt = form.paymentStatus === 'paid_full' ? totalPriceVal
        : form.paymentStatus === 'dp_paid' ? dpVal : 0;

      const res = await createManualBooking({
        bookingCode,
        customerName: form.customerName || 'Pelanggan Baru',
        whatsapp: form.whatsapp || '081931107481',
        email: form.email || undefined,
        instagram: form.instagram || undefined,
        serviceId: form.serviceId,
        serviceName: selectedSrv?.name || 'Wedding Photography',
        packageId: form.packageId,
        packageName: selectedPkg?.name || 'Custom Package',
        bookingDate: form.bookingDate,
        startTime: form.startTime || '08:00',
        endTime: form.endTime || '14:00',
        location: form.location || 'Madura',
        status: 'confirmed',
        paymentStatus: form.paymentStatus,
        totalPrice: totalPriceVal,
        downPayment: dpVal,
        remainingAmount: Math.max(0, totalPriceVal - paidAmt),
        notes: form.notes || undefined,
      });

      if (res.success) {
        toast.success(`Booking manual berhasil ditambahkan dengan Kode: ${bookingCode}.`);
        onSuccess();
      } else {
        toast.error(`Gagal menyimpan booking manual: ${res.error}`);
      }
    } catch (err) {
      console.error('Error creating booking:', err);
      toast.error('Terjadi kesalahan saat menyimpan booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = 'bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-[#0066CC] p-3 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none transition-colors';
  const selectClass = 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 focus:border-[#0066CC] p-3 rounded-xl text-zinc-900 dark:text-zinc-100 font-semibold focus:outline-none transition-colors';
  const labelClass = 'text-zinc-600 dark:text-zinc-400 uppercase font-mono font-medium text-[10px]';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 border-t sm:border border-zinc-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-2xl max-w-lg w-full max-h-[92vh] sm:max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        {/* iOS Drag Handle */}
        <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mt-2.5 sm:hidden shrink-0" />

        {/* Sticky Header */}
        <div className="p-4 sm:p-6 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-[#0066CC]/15 text-[#0066CC] flex items-center justify-center font-bold text-sm">+</div>
            <h3 className="font-sans text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">Tambah Booking Baru</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors active:scale-95 cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 flex-1 overflow-y-auto flex flex-col gap-4 text-xs pb-safe">
          {/* SECTION 1: Layanan & Paket */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-zinc-50 dark:bg-zinc-950/80 p-3.5 border border-[#0066CC]/30 rounded-2xl">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>1. Kategori Layanan *</label>
              <select value={form.serviceId} onChange={(e) => handleServiceChange(e.target.value)} className={selectClass}>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>2. Paket Dipilih *</label>
              <select value={form.packageId} onChange={(e) => handlePackageChange(e.target.value)} className={selectClass}>
                {packages
                  .filter((p) => !form.serviceId || p.serviceId === form.serviceId)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.duration || '6 Jam'}) - {formatCurrency(p.price)}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* SECTION 2: Jadwal */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Tanggal Acara *</label>
              <input type="date" required value={form.bookingDate}
                onChange={(e) => patch({ bookingDate: e.target.value })}
                className={`${inputClass} font-mono`} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Jam Mulai Sesi</label>
              <input type="time" value={form.startTime}
                onChange={(e) => handleStartTimeChange(e.target.value)}
                className={`${inputClass} text-amber-600 dark:text-amber-400 font-mono`} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={`${labelClass} flex items-center justify-between`}>
                <span>Jam Selesai</span>
                <span className="text-[9px] text-amber-600 dark:text-amber-400 font-mono font-normal">(Auto)</span>
              </label>
              <input type="time" value={form.endTime}
                onChange={(e) => patch({ endTime: e.target.value })}
                className={`${inputClass} text-amber-600 dark:text-amber-400 font-mono`} />
            </div>
          </div>

          {/* SECTION 3: Data Pelanggan */}
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Nama Pelanggan / Client *</label>
            <input type="text" required placeholder="Contoh: Rian & Amanda" value={form.customerName}
              onChange={(e) => patch({ customerName: e.target.value })} className={inputClass} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Nomor WhatsApp *</label>
              <input type="text" required placeholder="081931107481" value={form.whatsapp}
                onChange={(e) => patch({ whatsapp: e.target.value })} className={`${inputClass} font-mono`} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Email (Opsional)</label>
              <input type="email" placeholder="client@example.com" value={form.email}
                onChange={(e) => patch({ email: e.target.value })} className={inputClass} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Instagram (@username)</label>
              <input type="text" placeholder="@username" value={form.instagram}
                onChange={(e) => patch({ instagram: e.target.value })} className={`${inputClass} font-mono`} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Lokasi / Venue Acara *</label>
            <input type="text" required placeholder="Contoh: Gedung Graha Medika, Bangkalan" value={form.location}
              onChange={(e) => patch({ location: e.target.value })} className={inputClass} />
          </div>

          {/* SECTION 4: Keuangan */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Total Harga (IDR)</label>
              <input type="number" value={form.totalPrice}
                onChange={(e) => patch({ totalPrice: Number(e.target.value) })}
                className={`${inputClass} font-mono text-sm font-semibold`} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Nominal DP (IDR)</label>
              <input type="number" value={form.downPayment}
                onChange={(e) => patch({ downPayment: Number(e.target.value) })}
                className={`${inputClass} text-amber-600 dark:text-amber-400 font-mono text-sm font-semibold`} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Status Pembayaran</label>
              <select value={form.paymentStatus} onChange={(e) => patch({ paymentStatus: e.target.value as typeof form.paymentStatus })}
                className={`${inputClass} font-mono text-xs`}>
                <option value="unpaid">Belum DP (Unpaid)</option>
                <option value="dp_paid">DP Terbayar (DP Paid)</option>
                <option value="paid_full">Lunas (Paid Full)</option>
              </select>
            </div>
          </div>

          {/* SECTION 5: Catatan */}
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Catatan / Rincian Fasilitas Tambahan (Notes)</label>
            <textarea rows={3}
              placeholder="Contoh: Nama pasangan: Amanda, Fasilitas kustom: Unlimited raw files, 2 videographer"
              value={form.notes} onChange={(e) => patch({ notes: e.target.value })}
              className={`${inputClass} font-sans resize-none`} />
          </div>

          <button type="submit" disabled={isSubmitting}
            className="mt-2 py-3.5 bg-[#0066CC] hover:bg-[#0052A3] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer">
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan Booking...</span>
              </>
            ) : (
              <span>Simpan Booking Manual</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

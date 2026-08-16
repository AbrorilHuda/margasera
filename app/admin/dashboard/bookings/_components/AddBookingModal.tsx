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

  const inputClass = 'bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] p-3 rounded-lg text-zinc-100 focus:outline-none';
  const selectClass = 'bg-zinc-900 border border-zinc-700 focus:border-[#0066CC] p-3 rounded-lg text-zinc-100 font-semibold focus:outline-none';
  const labelClass = 'text-zinc-300 uppercase font-mono font-medium';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-lg w-full p-6 md:p-8 flex flex-col gap-6 max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0066CC]/20 text-[#0066CC] flex items-center justify-center font-bold">+</div>
            <h3 className="font-sans text-xl font-bold text-zinc-100">Tambah Booking Manual Baru</h3>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          {/* SECTION 1: Layanan & Paket */}
          <div className="grid grid-cols-2 gap-4 bg-zinc-950/80 p-3.5 border border-[#0066CC]/40 rounded-xl">
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
          <div className="grid grid-cols-3 gap-3">
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
                className={`${inputClass} text-amber-300 font-mono`} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={`${labelClass} flex items-center justify-between`}>
                <span>Jam Selesai</span>
                <span className="text-[9px] text-amber-400 font-mono font-normal">(Otomatis)</span>
              </label>
              <input type="time" value={form.endTime}
                onChange={(e) => patch({ endTime: e.target.value })}
                className={`${inputClass} text-amber-300 font-mono`} />
            </div>
          </div>

          {/* SECTION 3: Data Pelanggan */}
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Nama Pelanggan / Client *</label>
            <input type="text" required placeholder="Contoh: Rian & Amanda" value={form.customerName}
              onChange={(e) => patch({ customerName: e.target.value })} className={inputClass} />
          </div>

          <div className="grid grid-cols-3 gap-3">
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
          <div className="grid grid-cols-3 gap-3">
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
                className={`${inputClass} text-amber-300 font-mono text-sm font-semibold`} />
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
              className={`${inputClass} font-sans`} />
          </div>

          <button type="submit" disabled={isSubmitting}
            className="mt-4 py-3.5 bg-[#0066CC] hover:bg-[#0052A3] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold uppercase tracking-wider rounded-lg transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer">
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

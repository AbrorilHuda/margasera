'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, ChevronLeft, Calendar, Camera, Clock, User, Phone, Mail, MapPin, FileText, Copy, CheckCircle2, Sparkles, Loader2, XCircle } from 'lucide-react';
import { InstagramIcon } from '@/components/ui/icons';
import { getServices, getPackages } from '@/lib/actions/services';
import { getAvailability } from '@/lib/actions/availability';
import { createBooking } from '@/lib/actions/bookings';
import type { Service, Package, Availability, AvailabilityStatus, StudioSettings } from '@/lib/types';
import { formatCurrency, formatDate, getTimeOfDayLabel, formatTimeWithPeriod, getTodayDateString } from '@/lib/utils';
import { DEFAULT_STUDIO_SETTINGS } from '@/lib/constants';
import { useToast } from '@/components/ui/toast-context';

export function BookingWizard({ studioSettings = DEFAULT_STUDIO_SETTINGS }: { studioSettings?: StudioSettings }) {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // Data from Supabase
  const [services, setServices] = useState<Service[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [availabilityData, setAvailabilityData] = useState<Availability[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Initial step states
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Time & Slot states
  const [startTime, setStartTime] = useState<string>('08:00');
  const [endTime, setEndTime] = useState<string>('14:00');
  const [slotType, setSlotType] = useState<'wedding_morning' | 'wedding_afternoon' | 'wedding_fullday' | 'custom'>('wedding_morning');

  // Customer details form
  const [customerName, setCustomerName] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [instagram, setInstagram] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  // Generated Booking Code result
  const [bookingCode, setBookingCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch services, packages, and availability on mount, and handle URL query parameters
  useEffect(() => {
    async function loadData() {
      setIsDataLoading(true);
      const [srvList, pkgList, availList] = await Promise.all([
        getServices(),
        getPackages(),
        getAvailability(),
      ]);
      setServices(srvList);
      setPackages(pkgList);
      setAvailabilityData(availList);

      // Check query parameters for preselected package, service, date, and time
      const paramPackageId = searchParams?.get('packageId') || searchParams?.get('package');
      const paramServiceId = searchParams?.get('serviceId') || searchParams?.get('service');
      const paramDate = searchParams?.get('date');
      const paramTime = searchParams?.get('time');

      let targetServiceId = '';
      let targetPackageId = '';

      // 1. Try matching package parameter first (by UUID, slug, or clean name)
      if (paramPackageId && pkgList.length > 0) {
        const cleanPkg = paramPackageId.replace(/^pkg-/, '').toLowerCase();
        const matchedPkg = pkgList.find(
          (p) =>
            p.id === paramPackageId ||
            p.slug.toLowerCase() === paramPackageId.toLowerCase() ||
            p.slug.toLowerCase() === cleanPkg ||
            p.slug.toLowerCase().includes(cleanPkg) ||
            p.name.toLowerCase().includes(cleanPkg)
        );
        if (matchedPkg) {
          targetPackageId = matchedPkg.id;
          targetServiceId = matchedPkg.serviceId;
        }
      }

      // 2. If service isn't resolved yet but serviceId param exists
      if (!targetServiceId && paramServiceId && srvList.length > 0) {
        const cleanSrv = paramServiceId.replace(/^s-/, '').toLowerCase();
        const matchedSrv = srvList.find(
          (s) =>
            s.id === paramServiceId ||
            s.slug.toLowerCase() === paramServiceId.toLowerCase() ||
            s.slug.toLowerCase() === cleanSrv ||
            s.name.toLowerCase().includes(cleanSrv)
        );
        if (matchedSrv) {
          targetServiceId = matchedSrv.id;
        }
      }

      // 3. Fallbacks if not provided in URL
      if (!targetServiceId && srvList.length > 0) {
        targetServiceId = srvList[0].id;
      }
      if (!targetPackageId && targetServiceId) {
        const pkgsForSrv = pkgList.filter((p) => p.serviceId === targetServiceId);
        targetPackageId = pkgsForSrv.length > 0 ? pkgsForSrv[0].id : (pkgList[0]?.id || '');
      }

      if (targetServiceId) setSelectedServiceId(targetServiceId);
      if (targetPackageId) setSelectedPackageId(targetPackageId);
      if (paramDate) {
        const todayStr = getTodayDateString();
        if (paramDate >= todayStr) {
          setSelectedDate(paramDate);
        }
      }
      if (paramTime) setStartTime(paramTime);

      setIsDataLoading(false);
    }

    loadData();
  }, [searchParams]);

  const selectedService = services.find((s) => s.id === selectedServiceId) || services[0];
  const selectedPackage = packages.find((p) => p.id === selectedPackageId) || packages[0];
  const packagesForService = packages.filter((p) => p.serviceId === (selectedServiceId || (services[0]?.id ?? '')));

  const isCoupleService = (service?: Service) => {
    if (!service) return false;
    const s = (service.slug || service.name || '').toLowerCase();
    return (
      s.includes('wedding') ||
      s.includes('pre-wedding') ||
      s.includes('prewedding') ||
      s.includes('engagement') ||
      s.includes('tunangan') ||
      s.includes('lamaran')
    );
  };

  // Helper to extract duration in minutes (supports "45 Menit", "30 mnt", "1.5 Jam", "6 Jam", "Full Day")
  const getDurationInMinutes = (durationStr: string): number => {
    if (!durationStr) return 240; // Default 4 hours
    const lower = durationStr.toLowerCase().trim();

    if (lower.includes('unlimited') || lower.includes('full day') || lower.includes('seharian')) {
      return 720; // 12 hours
    }

    const isMinute = lower.includes('menit') || lower.includes('mnt') || lower.includes('min');
    const floatMatch = lower.match(/(\d+(?:[\.,]\d+)?)/);
    if (!floatMatch) return 240;

    const val = parseFloat(floatMatch[1].replace(',', '.'));
    if (isNaN(val)) return 240;

    if (isMinute) {
      return Math.round(val);
    } else {
      return Math.round(val * 60);
    }
  };

  const calculateEndTime = (startStr: string, durationStr: string): string => {
    if (!startStr) return '14:00';
    const [h, m] = startStr.split(':').map(Number);
    if (isNaN(h)) return '14:00';
    const startMins = h * 60 + (m || 0);
    const durationMins = getDurationInMinutes(durationStr);
    const totalEndMins = (startMins + durationMins) % (24 * 60);
    const endH = Math.floor(totalEndMins / 60);
    const endM = totalEndMins % 60;
    return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
  };

  // Helper to update custom start time and auto calculate end time
  const handleSelectStartTime = (newStart: string) => {
    setStartTime(newStart);
    setSlotType('custom');
  };

  // Auto-calculate Jam Selesai whenever selectedPackage or startTime changes
  useEffect(() => {
    if (selectedPackage && startTime) {
      setEndTime(calculateEndTime(startTime, selectedPackage.duration));
    }
  }, [selectedPackage, startTime]);

  const getSelectedDateInfo = (dateStr: string): { status: AvailabilityStatus; notes?: string } => {
    if (!dateStr) return { status: 'available' as AvailabilityStatus, notes: undefined };
    const found = availabilityData.find(
      (a) => a.date && a.date.split('T')[0] === dateStr.split('T')[0]
    );
    if (found) return { status: found.status, notes: found.notes };
    return { status: 'available' as AvailabilityStatus, notes: undefined };
  };

  const getSelectedDateConflict = (): { hasConflict: boolean; reason?: string } => {
    if (!selectedDate) return { hasConflict: false };

    const dateEntry = availabilityData.find(
      (a) => a.date && a.date.split('T')[0] === selectedDate.split('T')[0]
    );

    if (!dateEntry) return { hasConflict: false };

    if (dateEntry.status === 'blocked') {
      return { hasConflict: true, reason: `Tanggal ${formatDate(selectedDate)} sedang dikunci / libur studio.` };
    }
    if (dateEntry.status === 'booked') {
      return { hasConflict: true, reason: `Tanggal ${formatDate(selectedDate)} sudah terisi penuh (booked).` };
    }

    const isWeddingService = selectedService?.slug === 'wedding' ||
      (selectedService?.name &&
        selectedService.name.toLowerCase().includes('wedding') &&
        !selectedService.name.toLowerCase().includes('pre-wedding') &&
        !selectedService.name.toLowerCase().includes('prewedding'));

    const toMins = (tStr?: string) => {
      if (!tStr || !tStr.includes(':')) return null;
      const [h, m] = tStr.split(':').map(Number);
      return isNaN(h) || isNaN(m) ? null : h * 60 + m;
    };

    if (isWeddingService) {
      const weddingSlots = dateEntry.weddingSlots || [];
      const bookedWeddingCount = weddingSlots.filter((s) => s.isBooked).length;
      if (bookedWeddingCount >= 2) {
        return {
          hasConflict: true,
          reason: `Kuota Wedding pada tanggal ${formatDate(selectedDate)} sudah terisi penuh (maksimal 2 booking/hari).`,
        };
      }

      const sA = toMins(startTime);
      if (sA !== null) {
        if (sA < 14 * 60 && weddingSlots[0]?.isBooked) {
          return {
            hasConflict: true,
            reason: `Slot Wedding Sesi 1 (Pagi / Siang) pada tanggal ${formatDate(selectedDate)} sudah terisi (${weddingSlots[0].bookedBy || 'Klien Wedding'}). Silakan pilih Sesi 2 (Sore / Malam).`,
          };
        }
        if (sA >= 14 * 60 && weddingSlots[1]?.isBooked) {
          return {
            hasConflict: true,
            reason: `Slot Wedding Sesi 2 (Sore / Malam) pada tanggal ${formatDate(selectedDate)} sudah terisi (${weddingSlots[1].bookedBy || 'Klien Wedding'}). Silakan pilih Sesi 1 (Pagi / Siang).`,
          };
        }
      }
      return { hasConflict: false };
    }

    const sA = toMins(startTime);
    const eA = toMins(endTime);

    if (sA !== null && eA !== null) {
      if (dateEntry.bookedTimeSlots && dateEntry.bookedTimeSlots.length > 0) {
        for (const bts of dateEntry.bookedTimeSlots) {
          const sB = toMins(bts.startTime);
          const eB = toMins(bts.endTime);
          if (sB !== null && eB !== null && sA < eB && eA > sB) {
            const category = bts.serviceCategory || 'Sesi Studio';
            return {
              hasConflict: true,
              reason: `Jam sesi (${startTime} - ${endTime} WIB) bentrok dengan jadwal studio yang sudah terisi (${category} jam ${bts.startTime} - ${bts.endTime} WIB). Silakan pilih jam lain.`,
            };
          }
        }
      }
    }

    return { hasConflict: false };
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!selectedServiceId || !selectedPackageId) {
        toast.warning('Silakan pilih Layanan dan Paket Dokumentasi terlebih dahulu.');
        return;
      }
    }
    if (currentStep === 2) {
      if (!selectedDate) {
        toast.warning('Silakan pilih Tanggal Rencana Acara terlebih dahulu.');
        return;
      }
      const todayStr = getTodayDateString();
      if (selectedDate < todayStr) {
        toast.error('Tanggal rencana acara tidak boleh berada di masa lalu (sebelum tanggal hari ini).');
        return;
      }
      if (!startTime || !endTime) {
        toast.warning('Silakan tentukan Jam Mulai dan Jam Selesai Sesi terlebih dahulu.');
        return;
      }
      const dateInfo = getSelectedDateInfo(selectedDate);
      if (dateInfo.status === 'blocked' || dateInfo.status === 'booked') {
        toast.error(
          dateInfo.status === 'blocked'
            ? `Tanggal ${formatDate(selectedDate)} sedang dikunci / libur studio.`
            : `Tanggal ${formatDate(selectedDate)} sudah terisi penuh (booked).`
        );
        return;
      }
      const conflict = getSelectedDateConflict();
      if (conflict.hasConflict) {
        toast.error(conflict.reason || 'Tanggal atau jam yang Anda pilih tidak tersedia.');
        return;
      }
    }
    if (currentStep === 3) {
      if (!customerName.trim()) {
        toast.warning('Silakan isi Nama Lengkap terlebih dahulu.');
        return;
      }
      if (isCoupleService(selectedService) && !partnerName.trim()) {
        toast.warning('Silakan isi Nama Pasangan terlebih dahulu.');
        return;
      }
      if (!whatsapp.trim()) {
        toast.warning('Silakan isi Nomor WhatsApp terlebih dahulu.');
        return;
      }
      if (!instagram.trim()) {
        toast.warning('Silakan isi Username Instagram Client terlebih dahulu.');
        return;
      }
      if (!location.trim()) {
        toast.warning('Silakan isi Lokasi Acara / Venue terlebih dahulu.');
        return;
      }
    }
    if (currentStep === 4) {
      handleSubmitBooking();
      return;
    }
    if (currentStep < 4) setCurrentStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const handleSubmitBooking = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    toast.info('Sedang mengirim data pemesanan Anda...', 'Mengirim Data');

    const fullCustomerName = isCoupleService(selectedService) && partnerName.trim()
      ? `${customerName.trim()} & ${partnerName.trim()}`
      : customerName.trim();

    const combinedNotes = [
      isCoupleService(selectedService) && partnerName.trim() ? `Nama Pasangan: ${partnerName.trim()}` : null,
      notes.trim() ? `Catatan: ${notes.trim()}` : null,
    ].filter(Boolean).join('\n');

    const isWeddingService = selectedService?.slug === 'wedding' ||
      (selectedService?.name &&
        selectedService.name.toLowerCase().includes('wedding') &&
        !selectedService.name.toLowerCase().includes('pre-wedding') &&
        !selectedService.name.toLowerCase().includes('prewedding'));

    const effectiveSlotType = isWeddingService ? slotType : 'custom';

    try {
      const result = await createBooking({
        customerName: fullCustomerName,
        whatsapp: whatsapp.trim(),
        email: email.trim() || undefined,
        instagram: instagram.trim() || undefined,
        serviceId: selectedServiceId,
        serviceName: selectedService?.name,
        packageId: selectedPackageId,
        packageName: selectedPackage?.name,
        bookingDate: selectedDate,
        startTime,
        endTime,
        slotType: effectiveSlotType,
        location: location.trim(),
        eventType: undefined,
        notes: combinedNotes || undefined,
        totalPrice: selectedPackage?.price,
        downPayment: selectedPackage
          ? (selectedPackage.downPayment && selectedPackage.downPayment > 0
            ? selectedPackage.downPayment
            : Math.ceil(selectedPackage.price * 0.2))
          : undefined,
        remainingAmount: selectedPackage
          ? selectedPackage.price -
          (selectedPackage.downPayment && selectedPackage.downPayment > 0
            ? selectedPackage.downPayment
            : Math.ceil(selectedPackage.price * 0.2))
          : undefined,
        paymentStatus: 'unpaid',
      });

      if (result.success && result.bookingCode) {
        setBookingCode(result.bookingCode);
        toast.success(`Booking berhasil dikirim! Kode Booking: ${result.bookingCode}`, 'Pemesanan Berhasil');
        setCurrentStep(5);
      } else {
        const errMsg = result.error ?? 'Booking gagal dikirim. Coba lagi.';
        setSubmitError(errMsg);
        toast.error(errMsg, 'Pemesanan Gagal');
      }
    } catch (err: any) {
      const errMsg = err?.message || 'Terjadi kesalahan. Silakan coba lagi.';
      setSubmitError(errMsg);
      toast.error(errMsg, 'Pemesanan Gagal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyCodeToClipboard = () => {
    if (!bookingCode) return;
    navigator.clipboard.writeText(bookingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const steps = [
    { number: 1, label: 'Layanan & Paket' },
    { number: 2, label: 'Tanggal & Jam' },
    { number: 3, label: 'Data Diri' },
    { number: 4, label: 'Ringkasan' },
  ];

  if (isDataLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto py-28 px-6 text-center flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-[#0066CC] animate-spin" />
        <span className="text-xs text-zinc-400 font-mono uppercase tracking-widest">Memuat Kategori Layanan & Paket...</span>
      </div>
    );
  }

  if (!isDataLoading && services.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto py-16 px-6 text-center bg-zinc-950 border border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-5 shadow-2xl">
        <div className="w-12 h-12 rounded-full bg-[#0066CC]/15 border border-[#0066CC]/40 flex items-center justify-center text-[#0066CC] mx-auto">
          <Camera className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-serif-editorial text-3xl text-zinc-100 font-light">Database Layanan Belum Diisi</h3>
          <p className="text-xs text-zinc-400 font-light max-w-md mx-auto mt-2 leading-relaxed">
            Tabel layanan & paket masih kosong.
          </p>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <Link href="/" className="px-6 py-3.5 bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold tracking-widest uppercase rounded-xl hover:border-zinc-700 transition-colors">
            Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-6">
      {/* Wizard Progress Stepper */}
      {currentStep <= 4 && (
        <div className="mb-12">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-zinc-800 -translate-y-1/2 z-0" />
            <div
              className="absolute top-1/2 left-0 h-[2px] bg-[#0066CC] -translate-y-1/2 z-0 transition-all duration-500"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />

            {steps.map((st) => {
              const isCompleted = currentStep > st.number;
              const isCurrent = currentStep === st.number;
              return (
                <div key={st.number} className="relative z-10 flex flex-col items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${isCompleted
                      ? 'bg-[#0066CC] text-white'
                      : isCurrent
                        ? 'bg-zinc-950 border-2 border-[#0066CC] text-[#0066CC] shadow-[0_0_15px_rgba(0,102,204,0.4)]'
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-500'
                      }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : st.number}
                  </div>
                  <span className={`text-[11px] font-semibold tracking-wider uppercase hidden sm:inline ${isCurrent ? 'text-[#0066CC]' : 'text-zinc-500'
                    }`}>
                    {st.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step Content Panels */}
      <div className="bg-zinc-950 border border-zinc-800 p-8 md:p-12 shadow-2xl rounded-2xl">
        <AnimatePresence mode="wait">
          {/* STEP 1: SELECT SERVICE & PACKAGE FIRST */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-8"
            >
              <div>
                <span className="text-xs font-semibold tracking-widest uppercase text-[#0066CC]">Langkah 1 dari 4</span>
                <h3 className="font-serif-editorial text-3xl text-zinc-100 font-light mt-1">Pilih Layanan & Paket Dokumentasi</h3>
                <p className="text-xs text-zinc-400 font-light mt-1">
                  Pilih kategori layanan dan paket foto terlebih dahulu agar durasi waktu sesi foto dapat disesuaikan secara presisi.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-xs font-medium text-zinc-300 uppercase tracking-widest flex items-center gap-2">
                  <Camera className="w-4 h-4 text-[#0066CC]" /> 1. Kategori Layanan:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {services.map((srv) => (
                    <button
                      key={srv.id}
                      type="button"
                      onClick={() => {
                        setSelectedServiceId(srv.id);
                        const firstPkg = packages.find((p) => p.serviceId === srv.id);
                        if (firstPkg) {
                          setSelectedPackageId(firstPkg.id);
                          setEndTime(calculateEndTime(startTime, firstPkg.duration));
                        }
                      }}
                      className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all ${selectedServiceId === srv.id
                        ? 'border-[#0066CC] bg-[#0066CC]/20 text-white shadow-[0_0_15px_rgba(0,102,204,0.3)]'
                        : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                        }`}
                    >
                      <span className="text-xs font-medium">{srv.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <label className="text-xs font-medium text-zinc-300 uppercase tracking-widest flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#0066CC]" /> 2. Pilih Paket Dokumentasi {selectedService?.name ? `(${selectedService.name})` : ''}:
                  </span>
                  <span className="text-[11px] text-amber-400 font-mono">Durasi Paket Pilihan Anda akan Menentukan Jam Selesai</span>
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {packagesForService.length > 0 ? (
                    packagesForService.map((pkg) => (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => {
                          setSelectedPackageId(pkg.id);
                          setEndTime(calculateEndTime(startTime, pkg.duration));
                        }}
                        className={`p-6 rounded-xl border text-left flex flex-col justify-between transition-all ${selectedPackageId === pkg.id
                          ? 'border-[#0066CC] bg-[#0066CC]/15 shadow-[0_0_20px_rgba(0,102,204,0.3)]'
                          : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                          }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-serif-editorial text-2xl text-zinc-100">{pkg.name}</h4>
                            {pkg.isPopular && (
                              <span className="popular-badge px-2.5 py-0.5 bg-[#0066CC] text-white text-[9px] font-bold tracking-widest uppercase rounded-full shadow-sm flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5 text-white shrink-0" />
                                <span>Popular</span>
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-400 font-light mb-4">{pkg.description}</p>
                          <div className="text-2xl font-serif-editorial text-[#0066CC] font-semibold mb-4">
                            {formatCurrency(pkg.price)}
                          </div>
                        </div>

                        <div className="pt-4 border-t border-zinc-800/80 text-xs text-zinc-300 font-light flex items-center justify-between">
                          <span className="text-amber-400 font-mono font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                            ⏱️ Durasi: {pkg.duration}
                          </span>
                          <span className="font-mono text-zinc-400">{pkg.photographerCount} Fotografer</span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="col-span-2 p-8 text-center bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-light rounded-xl">
                      Belum ada paket standar khusus untuk kategori ini. Anda dapat melanjutkan ke tahap penawaran kustom.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: SELECT DATE & TIME SLOT (ACCORDING TO PACKAGE DURATION) */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6"
            >
              <div>
                <span className="text-xs font-semibold tracking-widest uppercase text-[#0066CC]">Langkah 2 dari 4</span>
                <h3 className="font-serif-editorial text-3xl text-zinc-100 font-light mt-1">Pilih Tanggal & Tentukan Jam Acara</h3>
                <p className="text-xs text-zinc-400 font-light mt-1">
                  Pilih tanggal dan tentukan Jam Mulai. Jam Selesai dihitung otomatis sesuai durasi paket pilihan Anda ({selectedPackage.name} — {selectedPackage.duration}).
                </p>
              </div>

              <div className="p-3.5 bg-[#0066CC]/15 border border-[#0066CC]/40 rounded-xl flex items-center justify-between text-xs text-zinc-200">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#0066CC]" />
                  <span>Paket Dipilih: <strong>{selectedPackage.name}</strong></span>
                </span>
                <span className="font-mono text-amber-400 font-semibold bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/30">
                  ⏱️ Durasi Paket: {selectedPackage.duration}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
                <div className="flex flex-col gap-3">
                  <label className="text-xs font-medium text-zinc-300 uppercase tracking-widest flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#0066CC]" />
                    Tanggal Rencana Acara:
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    min={getTodayDateString()}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#0066CC] text-zinc-100 p-4 rounded-xl font-mono text-sm focus:outline-none transition-colors"
                  />
                  {(() => {
                    const todayStr = getTodayDateString();
                    if (selectedDate && selectedDate < todayStr) {
                      return (
                        <div className="p-3.5 bg-rose-950/40 border border-rose-800/60 rounded-xl flex items-start gap-2.5 text-xs text-rose-300">
                          <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-rose-200 uppercase tracking-wider text-[11px] font-mono">⚠️ Tanggal Sudah Lewat</span>
                            <p className="text-rose-300 font-light">
                              Tanggal {formatDate(selectedDate)} sudah berada di masa lalu. Silakan pilih tanggal hari ini atau tanggal yang akan datang.
                            </p>
                          </div>
                        </div>
                      );
                    }
                    const dateInfo = getSelectedDateInfo(selectedDate);
                    if (dateInfo.status === 'blocked') {
                      return (
                        <div className="p-3.5 bg-rose-950/40 border border-rose-800/60 rounded-xl flex items-start gap-2.5 text-xs text-rose-300">
                          <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-rose-200 uppercase tracking-wider text-[11px] font-mono">🔒 Tanggal Dikunci / Libur Studio</span>
                            <p className="text-rose-300 font-light">
                              {dateInfo.notes ? `Keterangan: "${dateInfo.notes}"` : 'Pemesanan jadwal sesi foto ditutup pada tanggal ini.'} Silakan pilih tanggal lain.
                            </p>
                          </div>
                        </div>
                      );
                    }
                    if (dateInfo.status === 'booked') {
                      return (
                        <div className="p-3.5 bg-rose-950/40 border border-rose-800/60 rounded-xl flex items-start gap-2.5 text-xs text-rose-300">
                          <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-rose-200 uppercase tracking-wider text-[11px] font-mono">⛔ Tanggal Terisi Penuh (Booked)</span>
                            <p className="text-rose-300 font-light">
                              Jadwal pada tanggal {formatDate(selectedDate)} sudah terisi penuh. Silakan pilih tanggal lain.
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-xl flex items-center gap-2 text-xs text-emerald-300 font-light">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Tanggal {formatDate(selectedDate)} <strong>Tersedia (Available)</strong>!</span>
                      </div>
                    );
                  })()}
                </div>

                <div className="flex flex-col gap-3">
                  <label className="text-xs font-medium text-zinc-300 uppercase tracking-widest flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#0066CC]" />
                    Tentukan Jam Acara (Ditentukan oleh Client):
                  </label>

                  {selectedService.slug === 'wedding' && (
                    <div className="p-3 bg-amber-950/20 border border-amber-800/40 rounded-xl flex items-center justify-between text-xs text-amber-300">
                      <span>💍 <strong>Kuota Wedding:</strong> Maksimal 2 booking per hari.</span>
                      <span className="font-mono text-[10px] bg-amber-500/20 px-2 py-0.5 rounded text-amber-400">
                        Slot Tersedia
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-zinc-400">Jam Mulai Sesi:</span>
                        <span className="text-amber-400 font-semibold">{getTimeOfDayLabel(startTime)}</span>
                      </div>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 focus:border-[#0066CC] text-zinc-100 p-3 rounded-xl font-mono text-sm focus:outline-none transition-colors"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-zinc-400">Jam Selesai (Otomatis):</span>
                        <span className="text-amber-400 font-semibold">{getTimeOfDayLabel(endTime)}</span>
                      </div>
                      <input
                        type="time"
                        disabled
                        readOnly
                        value={endTime}
                        className="bg-zinc-950 border border-zinc-800/80 text-amber-400 p-3 rounded-xl font-mono text-sm cursor-not-allowed opacity-90"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 pt-2">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Pilihan Jam Mulai Populer (Format 24 Jam / WIB):</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {['07:00', '08:00', '09:00', '10:00', '13:00', '14:00', '15:00', '18:00', '19:00'].map((tStr) => (
                        <button
                          key={tStr}
                          type="button"
                          onClick={() => handleSelectStartTime(tStr)}
                          className={`px-2.5 py-1.5 text-xs font-mono rounded-lg border transition-colors flex items-center gap-1 ${startTime === tStr
                            ? 'bg-[#0066CC] border-[#0066CC] text-white font-bold shadow-md'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                            }`}
                        >
                          <span>{tStr}</span>
                          <span className={`text-[9px] uppercase font-normal ${startTime === tStr ? 'text-amber-200' : 'text-zinc-500'}`}>
                            ({getTimeOfDayLabel(tStr)})
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3.5 bg-zinc-900/90 border border-zinc-800 rounded-xl flex flex-col gap-1 text-xs text-zinc-300 mt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 font-medium">Rentang Jam Acara Disesuaikan Durasi:</span>
                      <span className="font-mono text-amber-400 font-bold">
                        {startTime} WIB ({getTimeOfDayLabel(startTime)}) s/d {endTime} WIB ({getTimeOfDayLabel(endTime)})
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono italic">
                      💡 Jam Selesai ({endTime} WIB) otomatis disesuaikan dengan durasi paket {selectedPackage.name} ({selectedPackage.duration}).
                    </span>
                  </div>

                  {(() => {
                    const conflict = getSelectedDateConflict();
                    if (conflict.hasConflict) {
                      return (
                        <div className="p-3.5 bg-rose-950/50 border border-rose-800/80 rounded-xl flex items-start gap-2.5 text-xs text-rose-200 mt-1">
                          <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold uppercase tracking-wider text-[11px] font-mono text-rose-300">
                              ⛔ JADWAL BENTROK / TIDAK TERSEDIA
                            </span>
                            <p className="text-rose-200 font-light">{conflict.reason}</p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: CUSTOMER CONTACT FORM */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6"
            >
              <div>
                <span className="text-xs font-semibold tracking-widest uppercase text-[#0066CC]">Langkah 3 dari 4</span>
                <h3 className="font-serif-editorial text-3xl text-zinc-100 font-light mt-1">Isi Data Diri Pelanggan</h3>
                <p className="text-xs text-zinc-400 font-light mt-1">
                  Lengkapi informasi kontak agar tim Marga Sera dapat menghubungi Anda untuk koordinasi sesi foto.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-zinc-300 uppercase tracking-widest flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-[#0066CC]" /> Nama Lengkap Client *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Ahmad Rizky"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#0066CC] text-zinc-100 p-3.5 rounded-xl text-sm focus:outline-none transition-colors"
                  />
                </div>

                {isCoupleService(selectedService) && (
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-zinc-300 uppercase tracking-widest flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-[#0066CC]" /> Nama Pasangan *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Anisa Putri"
                      value={partnerName}
                      onChange={(e) => setPartnerName(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#0066CC] text-zinc-100 p-3.5 rounded-xl text-sm focus:outline-none transition-colors"
                    />
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-zinc-300 uppercase tracking-widest flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#0066CC]" /> Nomor WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 081234567890"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#0066CC] text-zinc-100 p-3.5 rounded-xl text-sm focus:outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-zinc-300 uppercase tracking-widest flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#0066CC]" /> Alamat Email (Opsional)
                  </label>
                  <input
                    type="email"
                    placeholder="Contoh: ahmad@example.com (opsional)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#0066CC] text-zinc-100 p-3.5 rounded-xl text-sm focus:outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-zinc-300 uppercase tracking-widest flex items-center gap-2">
                    <InstagramIcon className="w-3.5 h-3.5 text-[#0066CC]" /> Instagram Client (@username) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: @ahmad.rizky"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#0066CC] text-zinc-100 p-3.5 rounded-xl text-sm focus:outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-zinc-300 uppercase tracking-widest flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#0066CC]" /> Lokasi Acara / Venue *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Pamekasan"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#0066CC] text-zinc-100 p-3.5 rounded-xl text-sm focus:outline-none transition-colors"
                  />
                </div>

                <div className="md:col-span-2 flex flex-col gap-2">
                  <label className="text-xs font-medium text-zinc-300 uppercase tracking-widest flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-zinc-400" /> Catatan / Permintaan Khusus (Opsional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tuliskan jika ada lokasi spesifik, outfit khusus, atau momen penting yang wajib didokumentasikan..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#0066CC] text-zinc-100 p-3.5 rounded-xl text-sm focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: SUMMARY & CONFIRMATION */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6"
            >
              <div>
                <span className="text-xs font-semibold tracking-widest uppercase text-[#0066CC]">Langkah 4 dari 4</span>
                <h3 className="font-serif-editorial text-3xl text-zinc-100 font-light mt-1">Ringkasan Pemesanan</h3>
                <p className="text-xs text-zinc-400 font-light mt-1">
                  Periksa kembali seluruh detail pemesanan sesi foto Anda sebelum dikirimkan ke sistem.
                </p>
              </div>

              <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col gap-4 text-xs font-light text-zinc-300 divide-y divide-zinc-800">
                <div className="flex items-center justify-between pb-3">
                  <span className="text-zinc-500 uppercase tracking-wider">Layanan:</span>
                  <span className="font-semibold text-zinc-100">{selectedService.name}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-zinc-500 uppercase tracking-wider">Paket Dipilih:</span>
                  <span className="font-semibold text-zinc-100">{selectedPackage.name} ({selectedPackage.duration})</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-zinc-500 uppercase tracking-wider">Tanggal Sesi:</span>
                  <span className="font-semibold text-[#0066CC] text-sm">{formatDate(selectedDate)}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-zinc-500 uppercase tracking-wider">Jam & Waktu Sesi:</span>
                  <span className="font-semibold text-amber-400 font-mono text-xs">
                    {startTime} WIB ({getTimeOfDayLabel(startTime)}) – {endTime} WIB ({getTimeOfDayLabel(endTime)})
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-zinc-500 uppercase tracking-wider">Nama Client:</span>
                  <span className="font-semibold text-zinc-100">{customerName}</span>
                </div>
                {isCoupleService(selectedService) && partnerName && (
                  <div className="flex items-center justify-between py-3">
                    <span className="text-zinc-500 uppercase tracking-wider">Nama Pasangan:</span>
                    <span className="font-semibold text-zinc-100">{partnerName}</span>
                  </div>
                )}
                <div className="flex items-center justify-between py-3">
                  <span className="text-zinc-500 uppercase tracking-wider">WhatsApp & Email:</span>
                  <span className="font-semibold text-zinc-100">{whatsapp}{email.trim() ? ` • ${email.trim()}` : ''}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-zinc-500 uppercase tracking-wider">Instagram & Venue:</span>
                  <span className="font-semibold text-zinc-100">{instagram} • {location}</span>
                </div>
                <div className="flex items-center justify-between pt-3 text-sm">
                  <span className="text-[#0066CC] font-semibold uppercase tracking-wider">Total Est. Investasi:</span>
                  <span className="font-serif-editorial text-2xl text-[#0066CC] font-bold">{formatCurrency(selectedPackage?.price ?? 0)}</span>
                </div>
                {selectedPackage && (
                  <div className="flex items-center justify-between py-1.5 border-t border-zinc-900 text-xs">
                    <span className="text-amber-400 font-semibold uppercase tracking-wider">Minimal DP Terkunci:</span>
                    <span className="font-mono font-bold text-amber-300">
                      {formatCurrency(
                        selectedPackage.downPayment && selectedPackage.downPayment > 0
                          ? selectedPackage.downPayment
                          : Math.ceil(selectedPackage.price * 0.2)
                      )}
                    </span>
                  </div>
                )}
              </div>

              {submitError && (
                <p className="text-xs text-rose-400 font-medium text-center">{submitError}</p>
              )}

              <button
                type="button"
                onClick={handleSubmitBooking}
                disabled={isSubmitting}
                className="w-full py-4 bg-[#0066CC] hover:bg-[#0052A3] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-xs tracking-[0.2em] uppercase transition-all rounded-xl shadow-[0_0_20px_rgba(0,102,204,0.4)] flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mengirim Pemesanan...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Kirim Pemesanan & Dapatkan Kode Booking</span>
                  </>
                )}
              </button>
            </motion.div>
          )}

          {/* STEP 5: BOOKING RECEIPT & PAYMENT INFO */}
          {currentStep === 5 && bookingCode && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center gap-6 py-4"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                <Check className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-semibold tracking-widest uppercase text-emerald-400">Pemesanan Berhasil Dikirim!</span>
                <h3 className="font-serif-editorial text-3xl sm:text-4xl text-zinc-100 font-light mt-1">
                  Terima Kasih, {customerName || 'Pelanggan Margasera'}
                </h3>
                <p className="text-xs text-zinc-400 font-light max-w-lg mx-auto mt-1">
                  Simpan <strong>Kode Booking</strong> Anda untuk mengecek perkembangan status persetujuan & jadwal sesi foto.
                </p>
              </div>

              {/* Booking Code Display Box */}
              <div className="w-full max-w-md p-6 bg-zinc-900 border border-[#0066CC]/50 rounded-2xl flex flex-col items-center gap-3 shadow-xl">
                <span className="text-[10px] tracking-[0.25em] uppercase text-zinc-400 font-mono">Kode Booking Anda:</span>
                <div className="font-mono text-3xl font-bold tracking-wider text-[#0066CC]">
                  {bookingCode}
                </div>
                <div className="text-xs text-zinc-300 font-mono pt-1 text-center">
                  📅 {formatDate(selectedDate)} | ⏰ {startTime} WIB ({getTimeOfDayLabel(startTime)}) – {endTime} WIB ({getTimeOfDayLabel(endTime)})
                </div>

                <button
                  onClick={copyCodeToClipboard}
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold tracking-widest uppercase rounded-lg transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Kode Berhasil Disalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-[#0066CC]" />
                      <span>Salin Kode Booking</span>
                    </>
                  )}
                </button>
              </div>

              {/* Payment Instructions Box */}
              <div className="w-full max-w-md p-6 bg-zinc-900/90 border border-zinc-800 rounded-2xl text-left flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="text-xs font-semibold text-[#0066CC] uppercase tracking-wider">Instruksi Pembayaran DP (Down Payment)</span>
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                    DP Minimal
                  </span>
                </div>

                <p className="text-xs text-zinc-400 font-light">
                  Untuk mengunci jadwal sesi foto Anda, silakan melakukan transfer DP minimal sebesar{' '}
                  <strong className="text-amber-300 font-mono">
                    {selectedPackage
                      ? formatCurrency(
                        selectedPackage.downPayment && selectedPackage.downPayment > 0
                          ? selectedPackage.downPayment
                          : Math.ceil(selectedPackage.price * 0.2)
                      )
                      : 'DP'}
                  </strong>{' '}
                  ke rekening resmi Margasera:
                </p>

                <div className="grid grid-cols-1 gap-3 pt-1">
                  <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
                    <span className="text-[10px] font-mono text-zinc-500 block">{studioSettings.bankName.toUpperCase()}</span>
                    <span className="font-mono text-sm font-bold text-zinc-100">{studioSettings.bankAccountNumber}</span>
                    <span className="text-[10px] text-zinc-400 block">a.n {studioSettings.bankAccountHolder}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <Link
                  href={`/booking/status?code=${bookingCode}`}
                  className="px-6 py-3.5 bg-[#0066CC] text-white text-xs font-semibold tracking-widest uppercase hover:bg-[#0052A3] transition-colors shadow-[0_0_20px_rgba(0,102,204,0.3)]"
                >
                  Cek Status Booking
                </Link>
                <Link
                  href="/"
                  className="px-6 py-3.5 border border-zinc-700 text-zinc-300 text-xs font-light tracking-widest uppercase hover:border-zinc-500 transition-colors"
                >
                  Kembali Ke Beranda
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Wizard Controls Footer */}
        {currentStep < 5 && (
          <div className="mt-10 pt-6 border-t border-zinc-900 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold tracking-widest uppercase transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={handleNextStep}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0066CC] text-white disabled:opacity-60 disabled:cursor-not-allowed text-xs font-semibold tracking-widest uppercase hover:bg-[#0052A3] transition-colors shadow-[0_0_15px_rgba(0,102,204,0.3)] cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : currentStep === 4 ? (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Kirim Pemesanan</span>
                </>
              ) : (
                <>
                  <span>Selanjutnya</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

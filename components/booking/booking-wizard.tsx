'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import {
  Check,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Camera,
  Calendar,
  User,
  ShieldCheck,
  Sparkles,
  Loader2,
  RotateCcw,
} from 'lucide-react';
import { printDocument } from '@/lib/print';
import { getServices, getPackages } from '@/lib/actions/services';
import { getAvailability } from '@/lib/actions/availability';
import { createBooking } from '@/lib/actions/bookings';
import { cacheMasterData, getCachedMasterData } from '@/lib/offline-queue';
import type { Service, Package, Availability, StudioSettings } from '@/lib/types';
import { formatDate, getTodayDateString } from '@/lib/utils';
import { DEFAULT_STUDIO_SETTINGS } from '@/lib/constants';
import { useToast } from '@/components/ui/toast-context';

import {
  BOOKING_DRAFT_KEY,
  generateCryptoDocId,
  validateIndonesianPhone,
  validateFullName,
  calculateEndTime,
  isCoupleService,
  getSelectedDateInfo,
  getSelectedDateConflict,
} from './booking-utils';
import { downloadVoucherDocument } from './voucher-template';
import { Step1ServicePackage } from './steps/step1-service-package';
import { Step2DateTime } from './steps/step2-date-time';
import { Step3ClientInfo } from './steps/step3-client-info';
import { Step4SummaryDocument } from './steps/step4-summary-document';
import { Step5Confirmation } from './steps/step5-confirmation';

export function BookingWizard({ studioSettings = DEFAULT_STUDIO_SETTINGS }: { studioSettings?: StudioSettings }) {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // Local draft restoration status
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);
  const hasHydratedRef = useRef(false);
  const wizardTopRef = useRef<HTMLDivElement>(null);

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

  // Validation errors state for Step 3
  const [fieldErrors, setFieldErrors] = useState<{
    customerName?: string;
    partnerName?: string;
    whatsapp?: string;
    instagram?: string;
    location?: string;
  }>({});

  // Generated Booking Code result
  const [bookingCode, setBookingCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Draft Document Reference ID for Step 4
  const [draftDocId, setDraftDocId] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Generate crypto doc ID when reaching step 4 if not yet generated
  useEffect(() => {
    if (currentStep === 4 && !draftDocId) {
      setDraftDocId(generateCryptoDocId());
    }
  }, [currentStep, draftDocId]);

  // Auto-scroll to wizard top on step change for mobile UX
  useEffect(() => {
    if (hasHydratedRef.current && wizardTopRef.current && currentStep > 1) {
      const rect = wizardTopRef.current.getBoundingClientRect();
      if (rect.top < 0 || rect.top > 250) {
        wizardTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [currentStep]);

  const handleStepClick = (targetStep: number) => {
    // Only allow navigating back to completed steps to avoid bypassing validation
    if (targetStep < currentStep && !isSubmitting) {
      setCurrentStep(targetStep);
    }
  };

  // Reset form and purge draft from localStorage
  const handleResetDraft = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(BOOKING_DRAFT_KEY);
      }
    } catch (e) {
      console.warn('[BookingWizard] Gagal menghapus draf:', e);
    }
    setCustomerName('');
    setPartnerName('');
    setWhatsapp('');
    setEmail('');
    setInstagram('');
    setLocation('');
    setNotes('');
    setSelectedDate('');
    setStartTime('08:00');
    setEndTime('14:00');
    setSlotType('wedding_morning');
    setDraftDocId('');
    setCurrentStep(1);
    if (services.length > 0) {
      setSelectedServiceId(services[0].id);
      const pkgs = packages.filter((p) => p.serviceId === services[0].id);
      const firstPkg = pkgs.length > 0 ? pkgs[0] : packages[0];
      if (firstPkg) {
        setSelectedPackageId(firstPkg.id);
        setEndTime(calculateEndTime('08:00', firstPkg.duration));
      }
    }
    setFieldErrors({});
    setHasRestoredDraft(false);
    toast.info('Formulir pemesanan telah diatur ulang ke awal.', 'Mulai Ulang');
  };

  // Fetch services, packages, and availability on mount, and handle URL query parameters & local draft
  useEffect(() => {
    async function loadData() {
      setIsDataLoading(true);
      let srvList: Service[] = [];
      let pkgList: Package[] = [];
      let availList: Availability[] = [];

      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        const cached = getCachedMasterData();
        srvList = cached.services;
        pkgList = cached.packages;
      } else {
        try {
          const res = await Promise.all([
            getServices(),
            getPackages(),
            getAvailability(),
          ]);
          srvList = res[0];
          pkgList = res[1];
          availList = res[2];
          cacheMasterData({ services: srvList, packages: pkgList });
        } catch (err) {
          console.warn('[BookingWizard] Gagal memuat data online, mencoba cache lokal:', err);
          const cached = getCachedMasterData();
          srvList = cached.services;
          pkgList = cached.packages;
        }
      }

      setServices(srvList);
      setPackages(pkgList);
      setAvailabilityData(availList);

      // Check query parameters for preselected package, service, date, and time
      const paramPackageId = searchParams?.get('packageId') || searchParams?.get('package');
      const paramServiceId = searchParams?.get('serviceId') || searchParams?.get('service');
      const paramDate = searchParams?.get('date');
      const paramTime = searchParams?.get('time');

      // Check saved draft from localStorage
      let draft: any = null;
      try {
        const raw = typeof window !== 'undefined' ? localStorage.getItem(BOOKING_DRAFT_KEY) : null;
        if (raw) {
          draft = JSON.parse(raw);
        }
      } catch (err) {
        console.warn('[BookingWizard] Gagal membaca draf lokal:', err);
      }

      let targetServiceId = '';
      let targetPackageId = '';

      // 1. Try matching package parameter from URL first (by UUID, slug, or clean name)
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

      // 3. If neither package nor service was set by URL, restore from saved draft
      if (!targetPackageId && !targetServiceId && draft) {
        if (draft.selectedPackageId && pkgList.some((p) => p.id === draft.selectedPackageId)) {
          targetPackageId = draft.selectedPackageId;
          const pkg = pkgList.find((p) => p.id === targetPackageId);
          targetServiceId = pkg?.serviceId || draft.selectedServiceId || '';
        } else if (draft.selectedServiceId && srvList.some((s) => s.id === draft.selectedServiceId)) {
          targetServiceId = draft.selectedServiceId;
          const pkgsForSrv = pkgList.filter((p) => p.serviceId === targetServiceId);
          targetPackageId = pkgsForSrv[0]?.id || '';
        }
      }

      // 4. Fallbacks if not provided in URL and no draft
      if (!targetServiceId && srvList.length > 0) {
        targetServiceId = srvList[0].id;
      }
      if (!targetPackageId && targetServiceId) {
        const pkgsForSrv = pkgList.filter((p) => p.serviceId === targetServiceId);
        targetPackageId = pkgsForSrv[0]?.id || '';
      }

      if (targetServiceId) setSelectedServiceId(targetServiceId);
      if (targetPackageId) setSelectedPackageId(targetPackageId);

      const todayStr = getTodayDateString();

      // Date resolution: URL param > Draft (if valid >= today)
      if (paramDate && paramDate >= todayStr) {
        setSelectedDate(paramDate);
      } else if (draft?.selectedDate && draft.selectedDate >= todayStr) {
        setSelectedDate(draft.selectedDate);
      }

      // Time resolution: URL param > Draft
      if (paramTime) {
        setStartTime(paramTime);
      } else if (draft?.startTime) {
        setStartTime(draft.startTime);
      }

      if (draft?.endTime) {
        setEndTime(draft.endTime);
      } else if (targetPackageId) {
        const pkg = pkgList.find((p) => p.id === targetPackageId);
        if (pkg) {
          setEndTime(calculateEndTime(draft?.startTime || paramTime || '08:00', pkg.duration));
        }
      }

      if (draft?.slotType) {
        setSlotType(draft.slotType);
      }

      // Restore personal details & document info from draft
      let restoredAny = false;
      if (draft) {
        if (draft.customerName) {
          setCustomerName(draft.customerName);
          restoredAny = true;
        }
        if (draft.partnerName) {
          setPartnerName(draft.partnerName);
          restoredAny = true;
        }
        if (draft.whatsapp) {
          setWhatsapp(draft.whatsapp);
          restoredAny = true;
        }
        if (draft.email) {
          setEmail(draft.email);
          restoredAny = true;
        }
        if (draft.instagram) {
          setInstagram(draft.instagram);
          restoredAny = true;
        }
        if (draft.location) {
          setLocation(draft.location);
          restoredAny = true;
        }
        if (draft.notes) {
          setNotes(draft.notes);
          restoredAny = true;
        }
        if (draft.draftDocId) {
          setDraftDocId(draft.draftDocId);
        }

        if (typeof draft.currentStep === 'number' && draft.currentStep >= 1 && draft.currentStep <= 4) {
          setCurrentStep(draft.currentStep);
          if (draft.currentStep > 1) {
            restoredAny = true;
          }
        }
      }

      if (restoredAny) {
        setHasRestoredDraft(true);
      }

      setIsDataLoading(false);
      hasHydratedRef.current = true;
    }

    loadData();
  }, [searchParams]);

  // Auto-save draft changes to localStorage whenever state changes
  useEffect(() => {
    if (!hasHydratedRef.current || isDataLoading) return;
    if (currentStep >= 5) return;

    const hasMeaningfulInput =
      Boolean(customerName.trim()) ||
      Boolean(partnerName.trim()) ||
      Boolean(whatsapp.trim()) ||
      Boolean(email.trim()) ||
      Boolean(instagram.trim()) ||
      Boolean(location.trim()) ||
      Boolean(notes.trim()) ||
      Boolean(selectedDate) ||
      currentStep > 1;

    if (!hasMeaningfulInput) return;

    const draftData = {
      currentStep,
      selectedServiceId,
      selectedPackageId,
      selectedDate,
      startTime,
      endTime,
      slotType,
      customerName,
      partnerName,
      whatsapp,
      email,
      instagram,
      location,
      notes,
      draftDocId,
    };

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(BOOKING_DRAFT_KEY, JSON.stringify(draftData));
      }
    } catch (err) {
      console.warn('[BookingWizard] Gagal menyimpan draf:', err);
    }
  }, [
    isDataLoading,
    currentStep,
    selectedServiceId,
    selectedPackageId,
    selectedDate,
    startTime,
    endTime,
    slotType,
    customerName,
    partnerName,
    whatsapp,
    email,
    instagram,
    location,
    notes,
    draftDocId,
  ]);

  const selectedService = services.find((s) => s.id === selectedServiceId) || services[0];
  const selectedPackage = packages.find((p) => p.id === selectedPackageId) || packages[0];

  // Auto-calculate Jam Selesai whenever selectedPackage or startTime changes
  useEffect(() => {
    if (selectedPackage && startTime) {
      setEndTime(calculateEndTime(startTime, selectedPackage.duration));
    }
  }, [selectedPackage, startTime]);

  // Handlers for Step 1
  const handleSelectService = (srvId: string) => {
    setSelectedServiceId(srvId);
    const firstPkg = packages.find((p) => p.serviceId === srvId);
    if (firstPkg) {
      setSelectedPackageId(firstPkg.id);
      setEndTime(calculateEndTime(startTime, firstPkg.duration));
    }
  };

  const handleSelectPackage = (pkgId: string) => {
    setSelectedPackageId(pkgId);
    const pkg = packages.find((p) => p.id === pkgId);
    if (pkg) {
      setEndTime(calculateEndTime(startTime, pkg.duration));
    }
  };

  // Handlers for Step 2
  const handleSelectStartTime = (newStart: string) => {
    setStartTime(newStart);
    setSlotType('custom');
  };

  // Handlers for Step 3 input changes with real-time validation
  const handleCustomerNameChange = (val: string) => {
    setCustomerName(val);
    if (fieldErrors.customerName) {
      const res = validateFullName(val, 'Nama Lengkap');
      setFieldErrors((prev) => ({ ...prev, customerName: res.isValid ? undefined : res.message }));
    }
  };

  const handlePartnerNameChange = (val: string) => {
    setPartnerName(val);
    if (fieldErrors.partnerName) {
      const res = validateFullName(val, 'Nama Pasangan');
      setFieldErrors((prev) => ({ ...prev, partnerName: res.isValid ? undefined : res.message }));
    }
  };

  const handleWhatsappChange = (val: string) => {
    setWhatsapp(val);
    if (fieldErrors.whatsapp) {
      const res = validateIndonesianPhone(val);
      setFieldErrors((prev) => ({ ...prev, whatsapp: res.isValid ? undefined : res.message }));
    }
  };

  const handleInstagramChange = (val: string) => {
    setInstagram(val);
    if (fieldErrors.instagram) {
      const clean = val.trim();
      setFieldErrors((prev) => ({
        ...prev,
        instagram: !clean ? 'Username Instagram wajib diisi.' : clean.replace(/^@/, '').length < 2 ? 'Username Instagram minimal 2 karakter.' : undefined,
      }));
    }
  };

  const handleLocationChange = (val: string) => {
    setLocation(val);
    if (fieldErrors.location) {
      const clean = val.trim();
      setFieldErrors((prev) => ({
        ...prev,
        location: !clean ? 'Lokasi Acara / Venue wajib diisi.' : clean.length < 3 ? 'Lokasi minimal 3 karakter.' : undefined,
      }));
    }
  };

  // Document action handlers for Step 4
  const handlePrintDocument = () => {
    printDocument('booking-official-document', `Pra-Reservasi Margasera - ${draftDocId || 'DRAFT'}`);
  };

  const handleDownloadDocument = () => {
    if (!selectedService || !selectedPackage) return;
    downloadVoucherDocument({
      customerName,
      partnerName,
      whatsapp,
      email,
      instagram,
      location,
      selectedService,
      selectedPackage,
      selectedDate,
      startTime,
      endTime,
      draftDocId,
      studioSettings,
    });
    toast.success('Voucher pra-reservasi resmi berhasil diunduh!');
  };

  // Step Navigation & Validation Logic
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
      const dateInfo = getSelectedDateInfo(availabilityData, selectedDate);
      if (dateInfo.status === 'blocked' || dateInfo.status === 'booked') {
        toast.error(
          dateInfo.status === 'blocked'
            ? `Tanggal ${formatDate(selectedDate)} sedang dikunci / libur studio.`
            : `Tanggal ${formatDate(selectedDate)} sudah terisi penuh (booked).`
        );
        return;
      }
      const conflict = getSelectedDateConflict(
        availabilityData,
        selectedDate,
        startTime,
        endTime,
        selectedService
      );
      if (conflict.hasConflict) {
        toast.error(conflict.reason || 'Tanggal atau jam yang Anda pilih tidak tersedia.');
        return;
      }
    }

    if (currentStep === 3) {
      const nameRes = validateFullName(customerName, 'Nama Lengkap');
      if (!nameRes.isValid) {
        setFieldErrors((prev) => ({ ...prev, customerName: nameRes.message }));
        toast.error(nameRes.message || 'Nama Lengkap tidak valid.', 'Periksa Data Diri');
        return;
      }

      if (isCoupleService(selectedService)) {
        const partnerRes = validateFullName(partnerName, 'Nama Pasangan');
        if (!partnerRes.isValid) {
          setFieldErrors((prev) => ({ ...prev, partnerName: partnerRes.message }));
          toast.error(partnerRes.message || 'Nama Pasangan tidak valid.', 'Periksa Data Diri');
          return;
        }
      }

      const phoneRes = validateIndonesianPhone(whatsapp);
      if (!phoneRes.isValid) {
        setFieldErrors((prev) => ({ ...prev, whatsapp: phoneRes.message }));
        toast.error(phoneRes.message || 'Nomor WhatsApp tidak valid.', 'Periksa Nomor WhatsApp');
        return;
      }

      const cleanIg = instagram.trim();
      if (!cleanIg || cleanIg.replace(/^@/, '').length < 2) {
        setFieldErrors((prev) => ({
          ...prev,
          instagram: 'Username Instagram minimal 2 karakter (contoh: @margasera).',
        }));
        toast.warning('Silakan isi Username Instagram Client yang valid.');
        return;
      }

      const cleanLoc = location.trim();
      if (!cleanLoc || cleanLoc.length < 3) {
        setFieldErrors((prev) => ({
          ...prev,
          location: 'Lokasi Acara / Venue minimal 3 karakter.',
        }));
        toast.warning('Silakan isi Lokasi Acara / Venue minimal 3 karakter.');
        return;
      }

      setFieldErrors({});
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

  // Submit Booking to Supabase Action
  const handleSubmitBooking = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    toast.info('Sedang mengirim data pemesanan Anda...', 'Mengirim Data');

    const fullCustomerName =
      isCoupleService(selectedService) && partnerName.trim()
        ? `${customerName.trim()} & ${partnerName.trim()}`
        : customerName.trim();

    const combinedNotes = [
      isCoupleService(selectedService) && partnerName.trim() ? `Nama Pasangan: ${partnerName.trim()}` : null,
      notes.trim() ? `Catatan: ${notes.trim()}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    const isWeddingService =
      selectedService?.slug === 'wedding' ||
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
          ? selectedPackage.downPayment && selectedPackage.downPayment > 0
            ? selectedPackage.downPayment
            : Math.ceil(selectedPackage.price * 0.2)
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
        try {
          if (typeof window !== 'undefined') {
            localStorage.removeItem(BOOKING_DRAFT_KEY);
          }
        } catch (e) {
          console.warn('[BookingWizard] Gagal membersihkan draf lokal:', e);
        }
        setHasRestoredDraft(false);
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
    {
      number: 1,
      label: 'Layanan & Paket',
      shortLabel: 'Paket',
      description: 'Pilih layanan & paket',
      icon: Camera,
    },
    {
      number: 2,
      label: 'Tanggal & Jam',
      shortLabel: 'Jadwal',
      description: 'Atur tanggal & waktu sesi',
      icon: Calendar,
    },
    {
      number: 3,
      label: 'Data Diri',
      shortLabel: 'Kontak',
      description: 'Data klien & lokasi acara',
      icon: User,
    },
    {
      number: 4,
      label: 'Ringkasan',
      shortLabel: 'Review',
      description: 'Review draf pra-reservasi',
      icon: ShieldCheck,
    },
  ];

  if (isDataLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto py-28 px-6 text-center flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-[#0066CC] animate-spin" />
        <span className="text-xs text-zinc-400 font-mono uppercase tracking-widest">
          Memuat Kategori Layanan &amp; Paket...
        </span>
      </div>
    );
  }

  if (!isDataLoading && services.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto py-16 px-6 text-center bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-5 shadow-xl dark:shadow-2xl">
        <div className="w-12 h-12 rounded-full bg-[#0066CC]/15 border border-[#0066CC]/40 flex items-center justify-center text-[#0066CC] mx-auto">
          <Camera className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-serif-editorial text-3xl text-zinc-900 dark:text-zinc-100 font-light">
            Database Layanan Belum Diisi
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 font-light max-w-md mx-auto mt-2 leading-relaxed">
            Tabel layanan &amp; paket masih kosong. Silakan tambahkan layanan di panel admin terlebih dahulu.
          </p>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <Link
            href="/"
            className="px-6 py-3.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold tracking-widest uppercase rounded-xl hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors"
          >
            Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-5 sm:py-12 px-3 sm:px-6">
      <div ref={wizardTopRef} className="scroll-mt-4" />

      {/* Restored Draft Notice Banner */}
      {hasRestoredDraft && currentStep <= 4 && (
        <div className="mb-4 sm:mb-8 p-3 sm:p-3.5 bg-blue-50/80 dark:bg-blue-950/40 border border-[#0066CC]/30 dark:border-blue-900/60 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 text-xs text-[#0066CC] dark:text-blue-300 no-print animate-in fade-in duration-300">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 shrink-0 text-[#0066CC] dark:text-blue-400" />
            <span>
              <strong>Draf Tersimpan:</strong> Data formulir pemesanan dari sesi sebelumnya telah dipulihkan.
            </span>
          </div>
          <button
            type="button"
            onClick={handleResetDraft}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white dark:bg-zinc-900 border border-blue-200 dark:border-blue-800 hover:bg-rose-50 dark:hover:bg-rose-950/60 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-300 rounded-lg text-[11px] font-medium transition-all shrink-0 cursor-pointer shadow-sm text-zinc-700 dark:text-zinc-300"
          >
            <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
            <span>Mulai Baru</span>
          </button>
        </div>
      )}

      {/* Wizard Progress Stepper */}
      {currentStep <= 4 && (
        <div className="mb-5 sm:mb-12 no-print">
          {/* Mobile Stepper Card (App-like experience) */}
          <div className="sm:hidden bg-white/95 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200/90 dark:border-zinc-800/90 rounded-2xl p-3.5 shadow-sm">
            {/* Header: Badge & Status */}
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-[#0066CC]/20 border border-blue-200/80 dark:border-[#0066CC]/40 text-[11px] font-semibold text-[#0066CC] dark:text-blue-300">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0066CC] animate-pulse" />
                <span>Langkah {currentStep} dari 4</span>
              </div>
              <span className="text-[11px] font-mono font-medium text-zinc-500 dark:text-zinc-400">
                {Math.round((currentStep / 4) * 100)}% Selesai
              </span>
            </div>

            {/* Active Step Highlight Banner */}
            <div className="flex items-center gap-2.5 mb-3 bg-zinc-50/70 dark:bg-zinc-800/40 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800/60">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0066CC] to-[#0052A3] text-white flex items-center justify-center shrink-0 shadow-sm">
                {React.createElement(steps[currentStep - 1]?.icon || Camera, { className: 'w-4 h-4' })}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                  {steps[currentStep - 1]?.label}
                </h4>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                  {currentStep < 4
                    ? `Berikutnya: ${steps[currentStep]?.label}`
                    : 'Tahap konfirmasi pra-reservasi'}
                </p>
              </div>
            </div>

            {/* Segmented Progress Track */}
            <div className="grid grid-cols-4 gap-1.5 mb-2.5">
              {steps.map((st) => {
                const isCompleted = currentStep > st.number;
                const isCurrent = currentStep === st.number;
                return (
                  <button
                    key={st.number}
                    type="button"
                    disabled={!isCompleted}
                    onClick={() => handleStepClick(st.number)}
                    title={isCompleted ? `Kembali ke ${st.label}` : st.label}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      isCompleted
                        ? 'bg-[#0066CC] cursor-pointer hover:opacity-85 active:scale-95'
                        : isCurrent
                        ? 'bg-[#0066CC] ring-2 ring-[#0066CC]/25 shadow-sm'
                        : 'bg-zinc-200 dark:bg-zinc-800 cursor-default'
                    }`}
                  />
                );
              })}
            </div>

            {/* Step Pills Quick Navigation */}
            <div className="grid grid-cols-4 gap-1 pt-0.5">
              {steps.map((st) => {
                const isCompleted = currentStep > st.number;
                const isCurrent = currentStep === st.number;
                const IconComponent = st.icon;

                return (
                  <button
                    key={st.number}
                    type="button"
                    disabled={!isCompleted && !isCurrent}
                    onClick={() => handleStepClick(st.number)}
                    className={`py-1 px-1 rounded-lg text-center flex flex-col items-center gap-0.5 transition-all ${
                      isCompleted
                        ? 'bg-blue-50/80 dark:bg-blue-950/40 text-[#0066CC] dark:text-blue-300 cursor-pointer active:scale-95 hover:bg-blue-100/80'
                        : isCurrent
                        ? 'bg-[#0066CC] text-white font-semibold shadow-sm'
                        : 'text-zinc-400 dark:text-zinc-600 cursor-default opacity-50'
                    }`}
                  >
                    <div className="flex items-center justify-center">
                      {isCompleted ? (
                        <Check className="w-3 h-3 shrink-0" />
                      ) : (
                        <IconComponent className="w-3 h-3 shrink-0" />
                      )}
                    </div>
                    <span className="text-[10px] leading-tight font-medium truncate max-w-full">
                      {st.shortLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Desktop Stepper (Timeline with interactive nodes) */}
          <div className="hidden sm:block">
            <div className="flex items-center justify-between relative">
              <div className="absolute top-5 left-0 right-0 h-[2px] bg-zinc-200 dark:bg-zinc-800 -translate-y-1/2 z-0" />
              <div
                className="absolute top-5 left-0 h-[2px] bg-[#0066CC] -translate-y-1/2 z-0 transition-all duration-500"
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              />

              {steps.map((st) => {
                const isCompleted = currentStep > st.number;
                const isCurrent = currentStep === st.number;
                const IconComponent = st.icon;

                return (
                  <button
                    key={st.number}
                    type="button"
                    disabled={!isCompleted}
                    onClick={() => handleStepClick(st.number)}
                    className={`relative z-10 flex flex-col items-center gap-2 group transition-all text-center ${
                      isCompleted ? 'cursor-pointer' : 'cursor-default'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                        isCompleted
                          ? 'bg-[#0066CC] text-white shadow-sm group-hover:scale-110 group-hover:bg-[#0052A3]'
                          : isCurrent
                          ? 'bg-white dark:bg-zinc-950 border-2 border-[#0066CC] text-[#0066CC] shadow-[0_0_15px_rgba(0,102,204,0.3)] font-bold scale-105'
                          : 'bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <IconComponent className="w-4 h-4" />
                      )}
                    </div>
                    <div className="text-center">
                      <span
                        className={`text-[11px] font-semibold tracking-wider uppercase block ${
                          isCurrent
                            ? 'text-[#0066CC]'
                            : isCompleted
                            ? 'text-zinc-700 dark:text-zinc-300 group-hover:text-[#0066CC]'
                            : 'text-zinc-400 dark:text-zinc-500'
                        }`}
                      >
                        {st.label}
                      </span>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-light hidden md:block">
                        {st.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Step Content Panels */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-4 sm:p-8 md:p-12 shadow-xl dark:shadow-2xl rounded-2xl sm:rounded-3xl transition-colors">
        <AnimatePresence mode="wait">
          {/* STEP 1: SELECT SERVICE & PACKAGE */}
          {currentStep === 1 && (
            <Step1ServicePackage
              services={services}
              packages={packages}
              selectedServiceId={selectedServiceId}
              selectedPackageId={selectedPackageId}
              onSelectService={handleSelectService}
              onSelectPackage={handleSelectPackage}
            />
          )}

          {/* STEP 2: SELECT DATE & TIME */}
          {currentStep === 2 && (
            <Step2DateTime
              selectedPackage={selectedPackage}
              selectedService={selectedService}
              selectedDate={selectedDate}
              startTime={startTime}
              endTime={endTime}
              availabilityData={availabilityData}
              onSelectDate={setSelectedDate}
              onSelectStartTime={handleSelectStartTime}
            />
          )}

          {/* STEP 3: CUSTOMER CONTACT FORM */}
          {currentStep === 3 && (
            <Step3ClientInfo
              selectedService={selectedService}
              customerName={customerName}
              partnerName={partnerName}
              whatsapp={whatsapp}
              email={email}
              instagram={instagram}
              location={location}
              notes={notes}
              fieldErrors={fieldErrors}
              onChangeCustomerName={handleCustomerNameChange}
              onChangePartnerName={handlePartnerNameChange}
              onChangeWhatsapp={handleWhatsappChange}
              onChangeEmail={setEmail}
              onChangeInstagram={handleInstagramChange}
              onChangeLocation={handleLocationChange}
              onChangeNotes={setNotes}
            />
          )}

          {/* STEP 4: SUMMARY DRAFT VOUCHER DOCUMENT */}
          {currentStep === 4 && (
            <Step4SummaryDocument
              selectedService={selectedService}
              selectedPackage={selectedPackage}
              selectedDate={selectedDate}
              startTime={startTime}
              endTime={endTime}
              customerName={customerName}
              partnerName={partnerName}
              whatsapp={whatsapp}
              email={email}
              instagram={instagram}
              location={location}
              draftDocId={draftDocId}
              studioSettings={studioSettings}
              isSubmitting={isSubmitting}
              submitError={submitError}
              onPrint={handlePrintDocument}
              onDownload={handleDownloadDocument}
              onSubmit={handleSubmitBooking}
            />
          )}

          {/* STEP 5: BOOKING RECEIPT & PAYMENT CONFIRMATION */}
          {currentStep === 5 && bookingCode && (
            <Step5Confirmation
              bookingCode={bookingCode}
              customerName={customerName}
              selectedDate={selectedDate}
              startTime={startTime}
              endTime={endTime}
              selectedPackage={selectedPackage}
              selectedService={selectedService}
              studioSettings={studioSettings}
              copied={copied}
              onCopyCode={copyCodeToClipboard}
            />
          )}
        </AnimatePresence>

        {/* Wizard Controls Footer */}
        {currentStep < 5 && (
          <div className="mt-8 sm:mt-10 pt-4 sm:pt-6 border-t border-zinc-200 dark:border-zinc-900 flex items-center justify-between gap-3 no-print">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-400 dark:hover:border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold tracking-wider uppercase transition-all rounded-xl cursor-pointer active:scale-[0.98] min-h-[44px]"
              >
                <ChevronLeft className="w-4 h-4 shrink-0" />
                <span>Sebelumnya</span>
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={handleNextStep}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-5 sm:px-6 py-2.5 bg-[#0066CC] text-white disabled:opacity-60 disabled:cursor-not-allowed text-xs font-semibold tracking-wider uppercase hover:bg-[#0052A3] transition-all shadow-[0_0_15px_rgba(0,102,204,0.3)] cursor-pointer rounded-xl active:scale-[0.98] min-h-[44px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span>Memproses...</span>
                </>
              ) : currentStep === 4 ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                  <span>Kirim Pemesanan</span>
                </>
              ) : (
                <>
                  <span>Selanjutnya</span>
                  <ChevronRight className="w-4 h-4 shrink-0" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

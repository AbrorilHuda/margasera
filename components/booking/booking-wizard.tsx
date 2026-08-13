'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, ChevronLeft, Calendar, Camera, Clock, User, Phone, Mail, MapPin, FileText, Copy, CheckCircle2, Sparkles } from 'lucide-react';
import { MOCK_SERVICES, MOCK_PACKAGES } from '@/lib/mock-data';
import { formatCurrency, formatDate } from '@/lib/utils';

export function BookingWizard() {
  const searchParams = useSearchParams();

  // Initial step states
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState<string>('2026-08-29');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('s-wedding');
  const [selectedPackageId, setSelectedPackageId] = useState<string>('pkg-w-signature');

  // Customer details form
  const [customerName, setCustomerName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [eventType, setEventType] = useState('Wedding Reception');
  const [notes, setNotes] = useState('');

  // Generated Booking Code result
  const [bookingCode, setBookingCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const paramDate = searchParams?.get('date');
    const paramService = searchParams?.get('serviceId');
    const paramPackage = searchParams?.get('packageId');

    if (paramDate) setSelectedDate(paramDate);
    if (paramService) setSelectedServiceId(paramService);
    if (paramPackage) setSelectedPackageId(paramPackage);
  }, [searchParams]);

  const selectedService = MOCK_SERVICES.find((s) => s.id === selectedServiceId) || MOCK_SERVICES[0];
  const selectedPackage = MOCK_PACKAGES.find((p) => p.id === selectedPackageId) || MOCK_PACKAGES[0];
  const packagesForService = MOCK_PACKAGES.filter((p) => p.serviceId === selectedServiceId);

  const handleNextStep = () => {
    if (currentStep < 5) setCurrentStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    // Generate code format: MS-YYMMDD-XXX
    const cleanDate = selectedDate.replace(/-/g, '').substring(2);
    const randomNum = String(Math.floor(Math.random() * 900) + 100);
    const code = `MS-${cleanDate}-${randomNum}`;
    setBookingCode(code);
    setCurrentStep(6);
  };

  const copyCodeToClipboard = () => {
    if (!bookingCode) return;
    navigator.clipboard.writeText(bookingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const steps = [
    { number: 1, label: 'Tanggal' },
    { number: 2, label: 'Layanan' },
    { number: 3, label: 'Paket' },
    { number: 4, label: 'Data Diri' },
    { number: 5, label: 'Ringkasan' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-6">
      {/* Wizard Progress Stepper */}
      {currentStep <= 5 && (
        <div className="mb-12">
          <div className="flex items-center justify-between relative">
            {/* Progress Line */}
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
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                      isCompleted
                        ? 'bg-[#0066CC] text-white'
                        : isCurrent
                        ? 'bg-zinc-950 border-2 border-[#0066CC] text-[#0066CC] shadow-[0_0_15px_rgba(0,102,204,0.4)]'
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-500'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : st.number}
                  </div>
                  <span className={`text-[11px] font-semibold tracking-wider uppercase hidden sm:inline ${
                    isCurrent ? 'text-[#0066CC]' : 'text-zinc-500'
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
      <div className="bg-zinc-950 border border-zinc-800 p-8 md:p-12 shadow-2xl">
        <AnimatePresence mode="wait">
          {/* STEP 1: SELECT DATE */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6"
            >
              <div>
                <span className="text-xs font-semibold tracking-widest uppercase text-[#0066CC]">Langkah 1 dari 5</span>
                <h3 className="font-serif-editorial text-3xl text-zinc-100 font-light mt-1">Pilih Tanggal Sesi Foto</h3>
                <p className="text-xs text-zinc-400 font-light mt-1">
                  Masukkan tanggal acara yang Anda rencanakan. Sistem akan memverifikasi slot ketersediaan fotografer.
                </p>
              </div>

              <div className="flex flex-col gap-3 max-w-md pt-4">
                <label className="text-xs font-medium text-zinc-300 uppercase tracking-widest flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#0066CC]" />
                  Tanggal Rencana Acara:
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#0066CC] text-zinc-100 p-4 rounded text-sm focus:outline-none transition-colors"
                />
              </div>

              <div className="p-4 bg-emerald-950/30 border border-emerald-800/40 rounded flex items-center gap-3 text-xs text-emerald-300 font-light mt-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Tanggal {formatDate(selectedDate)} saat ini <strong>Tersedia (Available)</strong> untuk pemesanan!</span>
              </div>
            </motion.div>
          )}

          {/* STEP 2: SELECT SERVICE */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6"
            >
              <div>
                <span className="text-xs font-semibold tracking-widest uppercase text-[#0066CC]">Langkah 2 dari 5</span>
                <h3 className="font-serif-editorial text-3xl text-zinc-100 font-light mt-1">Pilih Kategori Layanan</h3>
                <p className="text-xs text-zinc-400 font-light mt-1">
                  Pilih jenis dokumentasi yang sesuai dengan kebutuhan momen Anda.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                {MOCK_SERVICES.map((srv) => (
                  <button
                    key={srv.id}
                    onClick={() => {
                      setSelectedServiceId(srv.id);
                      // Auto pick first available package for this service
                      const firstPkg = MOCK_PACKAGES.find((p) => p.serviceId === srv.id);
                      if (firstPkg) setSelectedPackageId(firstPkg.id);
                    }}
                    className={`p-6 border text-left flex flex-col justify-between transition-all ${
                      selectedServiceId === srv.id
                        ? 'border-[#0066CC] bg-[#0066CC]/15 shadow-[0_0_20px_rgba(0,102,204,0.3)]'
                        : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-3">
                      <span className="font-serif-editorial text-2xl text-zinc-100 font-light">{srv.name}</span>
                      <Camera className={`w-5 h-5 ${selectedServiceId === srv.id ? 'text-[#0066CC]' : 'text-zinc-500'}`} />
                    </div>
                    <p className="text-xs text-zinc-400 font-light line-clamp-2">{srv.description}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 3: SELECT PACKAGE */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6"
            >
              <div>
                <span className="text-xs font-semibold tracking-widest uppercase text-[#0066CC]">Langkah 3 dari 5</span>
                <h3 className="font-serif-editorial text-3xl text-zinc-100 font-light mt-1">Pilih Paket Dokumentasi</h3>
                <p className="text-xs text-zinc-400 font-light mt-1">
                  Paket tersedia untuk layanan: <strong>{selectedService.name}</strong>
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                {packagesForService.length > 0 ? (
                  packagesForService.map((pkg) => (
                    <button
                      key={pkg.id}
                      onClick={() => setSelectedPackageId(pkg.id)}
                      className={`p-6 border text-left flex flex-col justify-between transition-all ${
                        selectedPackageId === pkg.id
                          ? 'border-[#0066CC] bg-[#0066CC]/15 shadow-[0_0_20px_rgba(0,102,204,0.3)]'
                          : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-serif-editorial text-2xl text-zinc-100">{pkg.name}</h4>
                          {pkg.isPopular && (
                            <span className="px-2 py-0.5 bg-[#0066CC] text-white text-[9px] font-bold tracking-widest uppercase">Popular</span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 font-light mb-4">{pkg.description}</p>
                        <div className="text-2xl font-serif-editorial text-[#0066CC] font-semibold mb-4">
                          {formatCurrency(pkg.price)}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-zinc-800/80 text-xs text-zinc-300 font-light flex items-center justify-between">
                        <span>Durasi: {pkg.duration}</span>
                        <span>{pkg.photographerCount} Fotografer</span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="col-span-2 p-8 text-center bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-light">
                    Belum ada paket standar khusus untuk kategori ini. Anda dapat memilih penawaran kustom pada tahap data diri.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 4: CUSTOMER CONTACT FORM */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6"
            >
              <div>
                <span className="text-xs font-semibold tracking-widest uppercase text-[#0066CC]">Langkah 4 dari 5</span>
                <h3 className="font-serif-editorial text-3xl text-zinc-100 font-light mt-1">Isi Data Diri Pelanggan</h3>
                <p className="text-xs text-zinc-400 font-light mt-1">
                  Lengkapi informasi kontak agar tim Marga Sera dapat menghubungi Anda untuk konfirmasi jadwal.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-zinc-300 uppercase tracking-widest flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-[#0066CC]" /> Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Ahmad Rizky"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#0066CC] text-zinc-100 p-3.5 rounded text-sm focus:outline-none transition-colors"
                  />
                </div>

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
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#0066CC] text-zinc-100 p-3.5 rounded text-sm focus:outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-zinc-300 uppercase tracking-widest flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#0066CC]" /> Alamat Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="Contoh: ahmad@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#0066CC] text-zinc-100 p-3.5 rounded text-sm focus:outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-zinc-300 uppercase tracking-widest flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#0066CC]" /> Lokasi Acara / Venue *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: JW Marriott Medan"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#0066CC] text-zinc-100 p-3.5 rounded text-sm focus:outline-none transition-colors"
                  />
                </div>

                <div className="md:col-span-2 flex flex-col gap-2">
                  <label className="text-xs font-medium text-zinc-300 uppercase tracking-widest flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-[#0066CC]" /> Catatan / Permintaan Khusus
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tuliskan jika ada lokasi spesifik, outfit khusus, atau momen penting yang wajib didokumentasikan..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#0066CC] text-zinc-100 p-3.5 rounded text-sm focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 5: SUMMARY & CONFIRMATION */}
          {currentStep === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6"
            >
              <div>
                <span className="text-xs font-semibold tracking-widest uppercase text-[#0066CC]">Langkah 5 dari 5</span>
                <h3 className="font-serif-editorial text-3xl text-zinc-100 font-light mt-1">Ringkasan Pemesanan</h3>
                <p className="text-xs text-zinc-400 font-light mt-1">
                  Periksa kembali seluruh detail pemesanan sesi foto Anda sebelum dikirimkan ke sistem.
                </p>
              </div>

              <div className="p-6 bg-zinc-900 border border-zinc-800 flex flex-col gap-4 text-xs font-light text-zinc-300 divide-y divide-zinc-800">
                <div className="flex items-center justify-between pb-3">
                  <span className="text-zinc-500 uppercase tracking-wider">Tanggal Sesi:</span>
                  <span className="font-semibold text-[#0066CC] text-sm">{formatDate(selectedDate)}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-zinc-500 uppercase tracking-wider">Layanan:</span>
                  <span className="font-semibold text-zinc-100">{selectedService.name}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-zinc-500 uppercase tracking-wider">Paket Dipilih:</span>
                  <span className="font-semibold text-zinc-100">{selectedPackage.name} ({selectedPackage.duration})</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-zinc-500 uppercase tracking-wider">Nama Pemesan:</span>
                  <span className="font-semibold text-zinc-100">{customerName || 'Ahmad Rizky'}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-zinc-500 uppercase tracking-wider">WhatsApp & Email:</span>
                  <span className="font-semibold text-zinc-100">{whatsapp || '081234567890'} • {email || 'ahmad@example.com'}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-zinc-500 uppercase tracking-wider">Lokasi Acara:</span>
                  <span className="font-semibold text-zinc-100">{location || 'Medan'}</span>
                </div>
                <div className="flex items-center justify-between pt-3 text-sm">
                  <span className="text-[#0066CC] font-semibold uppercase tracking-wider">Total Est. Investasi:</span>
                  <span className="font-serif-editorial text-2xl text-[#0066CC] font-bold">{formatCurrency(selectedPackage.price)}</span>
                </div>
              </div>

              <button
                onClick={handleSubmitBooking}
                className="w-full py-4 bg-gradient-to-r from-[#0066CC] to-[#0052A3] text-white font-semibold text-xs tracking-[0.25em] uppercase shadow-[0_0_30px_rgba(0,102,204,0.4)] hover:shadow-[0_0_40px_rgba(0,102,204,0.6)] transition-all mt-4"
              >
                Kirimkan Pemesanan Sesi Foto Sekarang
              </button>
            </motion.div>
          )}

          {/* STEP 6: CONFIRMATION SUCCESS & BOOKING CODE GENERATED */}
          {currentStep === 6 && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center gap-6 py-6"
            >
              <div className="w-16 h-16 rounded-full bg-[#0066CC]/15 border-2 border-[#0066CC] flex items-center justify-center shadow-[0_0_30px_rgba(0,102,204,0.3)]">
                <Sparkles className="w-8 h-8 text-[#0066CC]" />
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold tracking-[0.3em] uppercase text-[#0066CC]">Pemesanan Berhasil Dikirim!</span>
                <h3 className="font-serif-editorial text-3xl sm:text-4xl text-zinc-100 font-light">
                  Terima Kasih, Pemesanan Anda Telah Kami Terima
                </h3>
                <p className="text-xs text-zinc-400 font-light max-w-lg mx-auto">
                  Simpan <strong>Kode Booking</strong> Anda untuk mengecek perkembangan status persetujuan & jadwal sesi foto.
                </p>
              </div>

              {/* Booking Code Display Box */}
              <div className="w-full max-w-md p-6 bg-zinc-900 border border-[#0066CC]/50 rounded flex flex-col items-center gap-3">
                <span className="text-[10px] tracking-[0.25em] uppercase text-zinc-400">Kode Booking Anda:</span>
                <div className="font-mono text-3xl font-bold tracking-wider text-[#0066CC]">
                  {bookingCode}
                </div>

                <button
                  onClick={copyCodeToClipboard}
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold tracking-widest uppercase transition-colors"
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

              <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
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
        {currentStep <= 5 && (
          <div className="mt-10 pt-6 border-t border-zinc-900 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                onClick={handlePrevStep}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 text-xs font-semibold tracking-widest uppercase transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < 5 && (
              <button
                onClick={handleNextStep}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0066CC] text-white text-xs font-semibold tracking-widest uppercase hover:bg-[#0052A3] transition-colors shadow-[0_0_15px_rgba(0,102,204,0.3)]"
              >
                <span>Selanjutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

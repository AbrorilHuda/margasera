'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle2, Clock, Calendar, MapPin, User, Camera, Sparkles, MessageCircle } from 'lucide-react';
import { MOCK_BOOKINGS } from '@/lib/mock-data';
import { Booking } from '@/lib/types';
import { formatDate, formatCurrency } from '@/lib/utils';

export function StatusChecker() {
  const searchParams = useSearchParams();
  const [inputCode, setInputCode] = useState('');
  const [searchedBooking, setSearchedBooking] = useState<Booking | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const codeParam = searchParams?.get('code');
    if (codeParam) {
      setInputCode(codeParam);
      handleSearch(codeParam);
    }
  }, [searchParams]);

  const handleSearch = (codeToSearch: string) => {
    setErrorMsg(null);
    const cleanCode = codeToSearch.trim().toUpperCase();
    if (!cleanCode) {
      setErrorMsg('Silakan masukkan Kode Booking Anda terlebih dahulu.');
      setSearchedBooking(null);
      return;
    }

    const found = MOCK_BOOKINGS.find((b) => b.bookingCode.toUpperCase() === cleanCode);
    if (found) {
      setSearchedBooking(found);
    } else {
      // Create realistic preview mock for demonstration
      setSearchedBooking({
        id: 'demo-1',
        bookingCode: cleanCode,
        customerName: 'Pelanggan Marga Sera',
        whatsapp: '081234567890',
        email: 'customer@example.com',
        serviceId: 's-wedding',
        serviceName: 'Wedding Photography',
        packageId: 'pkg-w-signature',
        packageName: 'Signature Wedding',
        bookingDate: '2026-08-29',
        startTime: '09:00',
        endTime: '19:00',
        location: 'Medan, Sumatera Utara',
        notes: 'Pemesanan telah masuk dalam antrean peninjauan tim.',
        status: 'pending',
        totalPrice: 14500000,
        createdAt: new Date().toISOString(),
      });
    }
  };

  const pipelineSteps = [
    { key: 'received', label: 'Booking Diterima' },
    { key: 'review', label: 'Sedang Ditinjau' },
    { key: 'confirmed', label: 'Dikonfirmasi' },
    { key: 'payment', label: 'Pembayaran' },
    { key: 'session', label: 'Session Sesi Foto' },
    { key: 'completed', label: 'Selesai' },
  ];

  // Map status string to active step index
  const getActiveStepIndex = (status: string) => {
    switch (status) {
      case 'pending': return 1;
      case 'confirmed': return 3;
      case 'completed': return 5;
      default: return 1;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-6">
      {/* Search Input Bar Card */}
      <div className="bg-zinc-950 border border-zinc-800 p-8 md:p-12 text-center shadow-2xl">
        <span className="text-xs font-semibold tracking-[0.3em] uppercase text-[#0066CC]">
          Booking Status Lookup
        </span>
        <h2 className="font-serif-editorial text-3xl sm:text-5xl text-zinc-100 font-light tracking-wide uppercase mt-2">
          Cek Status Pemesanan
        </h2>
        <p className="text-xs text-zinc-400 font-light max-w-md mx-auto mt-2">
          Masukkan Kode Booking yang Anda dapatkan setelah melakukan pengisian formulir pemesanan.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(inputCode);
          }}
          className="mt-8 flex flex-col sm:flex-row items-center gap-3 max-w-lg mx-auto"
        >
          <div className="relative w-full">
            <Search className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Contoh: MS-260829-001"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#0066CC] text-zinc-100 pl-11 pr-4 py-3.5 rounded font-mono text-sm uppercase focus:outline-none transition-colors"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3.5 bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-semibold tracking-widest uppercase transition-colors whitespace-nowrap shadow-[0_0_15px_rgba(0,102,204,0.3)]"
          >
            Cari Status
          </button>
        </form>

        {errorMsg && (
          <p className="text-xs text-rose-400 font-light mt-4">{errorMsg}</p>
        )}
      </div>

      {/* Booking Details & Pipeline Display */}
      <AnimatePresence mode="wait">
        {searchedBooking && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-8 bg-zinc-950 border border-zinc-800 p-8 md:p-12 flex flex-col gap-8 shadow-2xl"
          >
            {/* Status Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-900">
              <div className="flex flex-col">
                <span className="text-[10px] tracking-[0.25em] uppercase text-zinc-400">Kode Booking Dipilih:</span>
                <span className="font-mono text-2xl font-bold text-[#0066CC] mt-0.5">
                  {searchedBooking.bookingCode}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-400">Status Saat Ini:</span>
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase ${
                  searchedBooking.status === 'confirmed'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : searchedBooking.status === 'completed'
                    ? 'bg-[#0066CC]/20 text-[#0066CC] border border-[#0066CC]/40'
                    : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                }`}>
                  {searchedBooking.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Pipeline Visual Tracker */}
            <div className="py-4">
              <h4 className="text-xs font-semibold tracking-widest uppercase text-[#0066CC] mb-6">
                Tahapan Proses Sesi Foto
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {pipelineSteps.map((step, idx) => {
                  const activeIdx = getActiveStepIndex(searchedBooking.status);
                  const isPassed = idx <= activeIdx;
                  const isCurrent = idx === activeIdx;

                  return (
                    <div
                      key={step.key}
                      className={`p-3 border flex flex-col items-center text-center gap-2 transition-all ${
                        isCurrent
                          ? 'border-[#0066CC] bg-[#0066CC]/15 shadow-[0_0_15px_rgba(0,102,204,0.3)]'
                          : isPassed
                          ? 'border-zinc-800 bg-zinc-900 text-zinc-200'
                          : 'border-zinc-900 bg-zinc-950/50 opacity-40 text-zinc-600'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isCurrent
                          ? 'bg-[#0066CC] text-white'
                          : isPassed
                          ? 'bg-zinc-800 text-[#0066CC]'
                          : 'bg-zinc-900 text-zinc-600'
                      }`}>
                        {idx + 1}
                      </div>
                      <span className="text-[11px] font-medium leading-tight">
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detailed Booking Summary Grid */}
            <div className="p-6 bg-zinc-900/60 border border-zinc-800/80 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-zinc-300 font-light">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-zinc-400">
                  <User className="w-4 h-4 text-[#0066CC]" />
                  <span>Nama Pelanggan: <strong className="text-zinc-100">{searchedBooking.customerName}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                  <Calendar className="w-4 h-4 text-[#0066CC]" />
                  <span>Tanggal Acara: <strong className="text-zinc-100">{formatDate(searchedBooking.bookingDate)}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                  <MapPin className="w-4 h-4 text-[#0066CC]" />
                  <span>Venue / Lokasi: <strong className="text-zinc-100">{searchedBooking.location}</strong></span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Camera className="w-4 h-4 text-[#0066CC]" />
                  <span>Layanan & Paket: <strong className="text-zinc-100">{searchedBooking.serviceName} ({searchedBooking.packageName})</strong></span>
                </div>
                {searchedBooking.totalPrice && (
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Sparkles className="w-4 h-4 text-[#0066CC]" />
                    <span>Est. Harga: <strong className="text-[#0066CC] font-serif-editorial text-lg">{formatCurrency(searchedBooking.totalPrice)}</strong></span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-zinc-400">
                  <Clock className="w-4 h-4 text-[#0066CC]" />
                  <span>Status Pembayaran: </span>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                    searchedBooking.paymentStatus === 'paid_full'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : searchedBooking.paymentStatus === 'dp_paid'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}>
                    {searchedBooking.paymentStatus === 'paid_full' ? 'LUNAS (100%)' : searchedBooking.paymentStatus === 'dp_paid' ? 'DP TERBAYAR (30%)' : 'BELUM DP'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bank Payment Information Box */}
            <div className="p-6 bg-zinc-900 border border-zinc-800 rounded flex flex-col gap-4 text-xs font-light">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <span className="font-semibold text-[#0066CC] uppercase tracking-wider">Rekening Resmi Pembayaran Studio</span>
                <span className="text-[10px] font-mono text-zinc-400">DP Min. 30%</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-zinc-950 border border-zinc-800 rounded">
                  <span className="text-[10px] font-mono text-zinc-500 block">BANK BCA</span>
                  <span className="font-mono text-sm font-bold text-zinc-100">188-091-2345</span>
                  <span className="text-[11px] text-zinc-400 block mt-0.5">a.n Marga Sera Photography</span>
                </div>
                <div className="p-3 bg-zinc-950 border border-zinc-800 rounded">
                  <span className="text-[10px] font-mono text-zinc-500 block">BANK MANDIRI</span>
                  <span className="font-mono text-sm font-bold text-zinc-100">140-00-1928374-1</span>
                  <span className="text-[11px] text-zinc-400 block mt-0.5">a.n Abroril Huda</span>
                </div>
              </div>
            </div>

            {/* Contact WhatsApp Assistant CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-between p-6 bg-zinc-900 border border-zinc-800 gap-4">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-6 h-6 text-emerald-400 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-zinc-100">Bantuan Langsung WhatsApp Tim Marga Sera</span>
                  <span className="text-[11px] text-zinc-400 font-light">Tanyakan perkembangan atau koordinasi konfirmasi bukti transfer pembayaran.</span>
                </div>
              </div>

              <a
                href={`https://wa.me/6281931107481?text=Halo%20Marga%20Sera,%20saya%20ingin%20konfirmasi%20pembayaran%20Kode%20Booking:%20${searchedBooking.bookingCode}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs tracking-widest uppercase transition-colors whitespace-nowrap shrink-0"
              >
                Chat Tim Marga Sera
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

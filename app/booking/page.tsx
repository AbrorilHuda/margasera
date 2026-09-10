import React, { Suspense } from 'react';
import { BookingWizard } from '@/components/booking/booking-wizard';
import { fetchStudioSettings } from '@/lib/data/settings';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Pemesanan Sesi Foto',
  description: 'Formulir pemesanan online sesi fotografi wedding, pre-wedding story, couple, portrait, dan wisuda Margasera Photography Pamekasan Madura.',
  alternates: {
    canonical: '/booking',
  },
  openGraph: {
    title: 'Pemesanan Sesi Foto | Margasera Photography Pamekasan',
    description: 'Pesan sesi foto wedding, pre-wedding, couple, portrait, dan wisuda secara online di Margasera Photography.',
    url: '/booking',
  },
};

export default async function BookingPage() {
  const studioSettings = await fetchStudioSettings();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pt-8 pb-20">
      <div className="text-center max-w-3xl mx-auto px-6 mb-4">
        <span className="text-xs font-semibold tracking-[0.3em] uppercase text-[#0066CC]">
          Booking Session
        </span>
        <h1 className="font-serif-editorial text-4xl sm:text-6xl text-zinc-100 font-light tracking-wide uppercase mt-2">
          Formulir Pemesanan
        </h1>
        <p className="text-sm text-zinc-400 font-light leading-relaxed mt-3">
          Ikuti langkah bertahap di bawah ini untuk memesan tanggal dan paket dokumentasi Anda.
        </p>
      </div>

      <Suspense fallback={<div className="text-center py-20 text-xs text-zinc-500">Memuat Formulir Pemesanan...</div>}>
        <BookingWizard studioSettings={studioSettings} />
      </Suspense>
    </div>
  );
}

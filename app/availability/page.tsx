import React from 'react';
import { AvailabilityCalendar } from '@/components/calendar/availability-calendar';

export const metadata = {
  title: 'Kalender Ketersediaan Tanggal',
  description: 'Cek jadwal ketersediaan tanggal fotografer Marga Sera Photography secara real-time.',
};

export default function AvailabilityPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pt-8 pb-20">
      <div className="text-center max-w-3xl mx-auto px-6 mb-4">
        <span className="text-xs font-semibold tracking-[0.3em] uppercase text-[#0066CC]">
          Availability Calendar
        </span>
        <h1 className="font-serif-editorial text-4xl sm:text-6xl text-zinc-100 font-light tracking-wide uppercase mt-2">
          Kalender Ketersediaan
        </h1>
        <p className="text-sm text-zinc-400 font-light leading-relaxed mt-3">
          Tentukan tanggal impian Anda dan pastikan slot ketersediaan sebelum melakukan booking resmi.
        </p>
      </div>

      <AvailabilityCalendar />
    </div>
  );
}

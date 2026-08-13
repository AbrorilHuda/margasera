import React, { Suspense } from 'react';
import { StatusChecker } from '@/components/status/status-checker';

export const metadata = {
  title: 'Cek Status Booking — Marga Sera Photography',
  description: 'Pantau perkembangan status jadwal & persetujuan pemesanan sesi foto Marga Sera Photography.',
};

export default function BookingStatusPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pt-8 pb-20">
      <Suspense fallback={<div className="text-center py-20 text-xs text-zinc-500">Memuat Pemantau Status...</div>}>
        <StatusChecker />
      </Suspense>
    </div>
  );
}

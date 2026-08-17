import React, { Suspense } from 'react';
import { StatusChecker } from '@/components/status/status-checker';
import { fetchStudioSettings } from '@/lib/data/settings';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Cek Status Booking',
  description: 'Pantau perkembangan status jadwal & persetujuan pemesanan sesi foto Marga Sera Photography.',
};

export default async function BookingStatusPage() {
  const studioSettings = await fetchStudioSettings();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pt-8 pb-20">
      <Suspense fallback={<div className="text-center py-20 text-xs text-zinc-500">Memuat Pemantau Status...</div>}>
        <StatusChecker studioSettings={studioSettings} />
      </Suspense>
    </div>
  );
}

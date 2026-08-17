import React from 'react';
import { ServicesPricing } from '@/components/services/services-pricing';

export const metadata = {
  title: 'Layanan & Paket Harga',
  description: 'Daftar paket dan layanan photography wedding, pre-wedding, couple, & portraiture Marga Sera Photography.',
};

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pt-8 pb-20">
      <ServicesPricing />
    </div>
  );
}

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Sparkles, Clock } from 'lucide-react';
import type { Service, Package } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface Step1ServicePackageProps {
  services: Service[];
  packages: Package[];
  selectedServiceId: string;
  selectedPackageId: string;
  onSelectService: (serviceId: string) => void;
  onSelectPackage: (packageId: string) => void;
}

export function Step1ServicePackage({
  services,
  packages,
  selectedServiceId,
  selectedPackageId,
  onSelectService,
  onSelectPackage,
}: Step1ServicePackageProps) {
  const selectedService = services.find((s) => s.id === selectedServiceId) || services[0];
  const packagesForService = packages.filter(
    (p) => p.serviceId === (selectedServiceId || (services[0]?.id ?? ''))
  );

  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col gap-6 sm:gap-8"
    >
      <div>
        <span className="text-xs font-semibold tracking-widest uppercase text-[#0066CC]">Langkah 1 dari 4</span>
        <h3 className="font-serif-editorial text-2xl sm:text-3xl text-zinc-900 dark:text-zinc-100 font-light mt-1">
          Pilih Layanan &amp; Paket Dokumentasi
        </h3>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 font-light mt-1">
          Pilih kategori layanan dan paket foto terlebih dahulu agar durasi waktu sesi foto dapat disesuaikan secara presisi.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-widest flex items-center gap-2">
          <Camera className="w-4 h-4 text-[#0066CC]" /> 1. Kategori Layanan:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {services.map((srv) => (
            <button
              key={srv.id}
              type="button"
              onClick={() => onSelectService(srv.id)}
              className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                selectedServiceId === srv.id
                  ? 'border-[#0066CC] bg-[#0066CC]/15 dark:bg-[#0066CC]/20 text-[#0066CC] dark:text-white shadow-[0_0_15px_rgba(0,102,204,0.25)] font-semibold'
                  : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <span className="text-xs">{srv.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-2">
        <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-widest flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#0066CC]" /> 2. Pilih Paket Dokumentasi{' '}
            {selectedService?.name ? `(${selectedService.name})` : ''}:
          </span>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-mono">
            Durasi Paket Pilihan Anda Menentukan Jam Selesai
          </span>
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {packagesForService.length > 0 ? (
            packagesForService.map((pkg) => (
              <button
                key={pkg.id}
                type="button"
                onClick={() => onSelectPackage(pkg.id)}
                className={`p-4 sm:p-6 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  selectedPackageId === pkg.id
                    ? 'border-[#0066CC] bg-blue-50/50 dark:bg-[#0066CC]/15 shadow-[0_0_20px_rgba(0,102,204,0.2)]'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-serif-editorial text-2xl text-zinc-900 dark:text-zinc-100">{pkg.name}</h4>
                    {pkg.isPopular && (
                      <span className="popular-badge px-2.5 py-0.5 bg-[#0066CC] text-white text-[9px] font-bold tracking-widest uppercase rounded-full shadow-sm flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-white shrink-0" />
                        <span>Popular</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 font-light mb-4">{pkg.description}</p>
                  <div className="text-2xl font-serif-editorial text-[#0066CC] font-semibold mb-4">
                    {formatCurrency(pkg.price)}
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800/80 text-xs text-zinc-600 dark:text-zinc-300 font-light flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-mono font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                    <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    <span>Durasi: {pkg.duration}</span>
                  </span>
                  <span className="font-mono text-zinc-500 dark:text-zinc-400">{pkg.photographerCount} Fotografer</span>
                </div>
              </button>
            ))
          ) : (
            <div className="col-span-2 p-8 text-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-light rounded-xl">
              Belum ada paket standar khusus untuk kategori ini. Anda dapat melanjutkan ke tahap penawaran kustom.
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

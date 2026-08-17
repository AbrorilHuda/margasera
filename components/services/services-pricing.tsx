'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, Sparkles, Clock, Users, Image as ImageIcon, ArrowRight, Loader2 } from 'lucide-react';
import { getServices, getPackages } from '@/lib/actions/services';
import type { Service, Package } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface ServicesPricingProps {
  initialServices?: Service[];
  initialPackages?: Package[];
}

export function ServicesPricing({ initialServices = [], initialPackages = [] }: ServicesPricingProps) {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [packages, setPackages] = useState<Package[]>(initialPackages);
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    initialServices[0]?.id || ''
  );
  const [loading, setLoading] = useState(
    initialServices.length === 0 && initialPackages.length === 0
  );

  useEffect(() => {
    if (initialServices.length > 0) {
      setServices(initialServices);
      if (!selectedServiceId && initialServices[0]?.id) {
        setSelectedServiceId(initialServices[0].id);
      }
    }
    if (initialPackages.length > 0) {
      setPackages(initialPackages);
    }
  }, [initialServices, initialPackages]);

  useEffect(() => {
    if (services.length > 0 && packages.length > 0) {
      setLoading(false);
      return;
    }
    async function load() {
      setLoading(true);
      const [srvList, pkgList] = await Promise.all([getServices(), getPackages()]);
      setServices(srvList);
      setPackages(pkgList);
      if (srvList.length > 0 && !selectedServiceId) {
        setSelectedServiceId(srvList[0].id);
      }
      setLoading(false);
    }
    load();
  }, []);

  const filteredPackages = packages.filter(
    (pkg) => pkg.serviceId === selectedServiceId
  );

  if (loading) {
    return (
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto text-center flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-[#0066CC] animate-spin" />
        <span className="text-xs text-zinc-400 font-mono uppercase tracking-widest">Memuat Paket Layanan...</span>
      </section>
    );
  }

  if (!loading && services.length === 0) {
    return (
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto text-center">
        <div className="p-12 bg-zinc-950 border border-zinc-800 rounded-2xl max-w-xl mx-auto flex flex-col items-center gap-4 shadow-xl">
          <h3 className="font-serif-editorial text-3xl text-zinc-100 font-light">Belum Ada Layanan Tersedia</h3>
          <p className="text-xs text-zinc-400 font-light leading-relaxed">
            Data layanan & paket belum ada.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
      {/* Header Title */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-semibold tracking-[0.3em] uppercase text-[#0066CC]">
          Investment & Packages
        </span>
        <h1 className="font-serif-editorial text-4xl sm:text-6xl text-zinc-100 font-light tracking-wide uppercase mt-2">
          Layanan & Paket Harga
        </h1>
        <p className="text-sm text-zinc-400 font-light leading-relaxed mt-4">
          Setiap momen abadi pantas didokumentasikan dengan tingkat ketelitian dan estetika terbaik. Pilih kategori layanan dan temukan paket yang paling sesuai dengan kebutuhan sesi foto Anda.
        </p>
      </div>

      {/* Service Category Tabs */}
      <div className="flex items-center justify-center gap-3 flex-wrap mb-16">
        {services.map((srv) => (
          <button
            key={srv.id}
            onClick={() => setSelectedServiceId(srv.id)}
            className={`px-6 py-3 text-xs tracking-widest uppercase transition-all duration-300 ${selectedServiceId === srv.id
              ? 'bg-[#0066CC] text-white font-semibold shadow-[0_0_20px_rgba(0,102,204,0.3)]'
              : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
              }`}
          >
            {srv.name}
          </button>
        ))}
      </div>

      {/* Package Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {filteredPackages.map((pkg, idx) => (
          <motion.div
            key={pkg.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: idx * 0.15 }}
            className={`relative flex flex-col justify-between p-8 rounded-2xl border transition-all duration-500 ${pkg.isPopular
              ? 'popular-card border-[#0066CC] shadow-[0_0_30px_rgba(0,102,204,0.25)] bg-gradient-to-b from-[#0066CC]/20 via-zinc-950 to-zinc-950'
              : 'bg-zinc-950/80 border-zinc-800/80 hover:border-zinc-700'
              }`}
          >
            {/* Popular Badge */}
            {pkg.isPopular && (
              <div className="popular-badge absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-[#0066CC] text-white text-[10px] font-bold tracking-[0.25em] uppercase shadow-lg shadow-[#0066CC]/30 flex items-center gap-1.5 rounded-full z-10">
                <Sparkles className="w-3.5 h-3.5 text-white" />
                <span>Paling Direkomendasikan</span>
              </div>
            )}

            <div>
              {/* Package Header */}
              <div className="flex flex-col gap-2 pb-6 border-b border-zinc-900">
                <h3 className="font-serif-editorial text-3xl text-zinc-100 font-light">
                  {pkg.name}
                </h3>
                <p className="text-xs text-zinc-400 font-light leading-relaxed min-h-[36px]">
                  {pkg.description}
                </p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-serif-editorial text-[#0066CC] font-semibold">
                    {formatCurrency(pkg.price)}
                  </span>
                </div>
              </div>

              {/* Package Meta Quick Info */}
              <div className="py-6 flex flex-col gap-3 text-xs text-zinc-300 font-light border-b border-zinc-900">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-[#0066CC] shrink-0" />
                  <span>Durasi Sesi: <strong>{pkg.duration}</strong></span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-[#0066CC] shrink-0" />
                  <span>Tim Dokumentasi: <strong>{pkg.photographerCount} Orang Tim</strong></span>
                </div>
                <div className="flex items-center gap-3">
                  <ImageIcon className="w-4 h-4 text-[#0066CC] shrink-0" />
                  <span>Output Foto: <strong>{pkg.editedPhotos}</strong></span>
                </div>
              </div>

              {/* Included Features List */}
              <div className="py-6 flex flex-col gap-3">
                <span className="text-[11px] font-semibold tracking-widest uppercase text-zinc-400">
                  Fasilitas Termasuk:
                </span>
                <ul className="flex flex-col gap-2.5">
                  {pkg.features.map((ft, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-3 text-xs text-zinc-300 font-light">
                      <div className="w-4 h-4 rounded-full bg-[#0066CC]/15 border border-[#0066CC]/40 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 text-[#0066CC]" />
                      </div>
                      <span>{ft}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action CTA */}
            <div className="pt-6">
              <Link
                href={`/booking?packageId=${pkg.id}&serviceId=${pkg.serviceId}`}
                className={`w-full py-4 text-center text-xs font-semibold tracking-[0.25em] uppercase flex items-center justify-center gap-2 rounded-xl transition-all duration-300 ${pkg.isPopular
                  ? 'bg-[#0066CC] text-white hover:bg-[#0052A3] shadow-md shadow-[#0066CC]/20'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-200 hover:border-[#0066CC] hover:text-[#0066CC]'
                  }`}
              >
                <span>Pilih Paket Ini</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Custom Request Info Box */}
      <div className="mt-16 p-8 bg-zinc-900/60 border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col gap-2 text-center md:text-left">
          <h4 className="font-serif-editorial text-2xl text-zinc-100">
            Butuh Konsep / Paket Kustom Khusus?
          </h4>
          <p className="text-xs text-zinc-400 font-light max-w-2xl">
            Jika lokasi acara di luar kota Medan, membutuhkan durasi khusus, atau paket gabungan pre-wedding & wedding, kami dapat menyusun proposal khusus untuk Anda.
          </p>
        </div>
        <Link
          href="/booking?custom=true"
          className="px-6 py-3.5 bg-zinc-800 hover:bg-[#0066CC] hover:text-white border border-zinc-700 text-xs font-semibold tracking-widest uppercase transition-all whitespace-nowrap"
        >
          Minta Penawaran Kustom
        </Link>
      </div>
    </section>
  );
}

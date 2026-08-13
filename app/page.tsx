import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CinematicHero } from '@/components/hero/cinematic-hero';
import { FeaturedWorks } from '@/components/gallery/featured-works';
import { ServicesPricing } from '@/components/services/services-pricing';
import { AvailabilityCalendar } from '@/components/calendar/availability-calendar';
import { ArrowRight, Camera, Sparkles, Heart, Award } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col w-full bg-zinc-950 text-zinc-100">
      {/* 1. Hero Sinematik */}
      <CinematicHero />

      {/* 2. Profil Singkat & Filosofi Brand */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-b border-zinc-900">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-6 relative h-[480px] w-full overflow-hidden group border border-zinc-800">
            <Image
              src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1600&auto=format&fit=crop"
              alt="Marga Sera Photography Philosophy"
              fill
              className="object-cover img-editorial filter brightness-90"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 p-4 bg-zinc-950/80 backdrop-blur-md border border-zinc-800">
              <span className="text-amber-400 font-serif-editorial text-xl italic">
                &ldquo;Every frame tells a story that outlasts time.&rdquo;
              </span>
            </div>
          </div>

          <div className="md:col-span-6 flex flex-col gap-6">
            <span className="text-xs font-semibold tracking-[0.3em] uppercase text-amber-400">
              Tentang Marga Sera
            </span>
            <h2 className="font-serif-editorial text-4xl sm:text-5xl text-zinc-100 font-light tracking-wide uppercase leading-tight">
              Seni Visual Sinematik & Storytelling Abadi
            </h2>
            <p className="text-sm text-zinc-400 font-light leading-relaxed">
              Marga Sera Photography lahir dari passion untuk mengabadikan momen cinta, kebahagiaan, dan ekspresi paling otentik. Kami memadukan pendekatan visual editorial berstandar internasional dengan kehangatan rasa lokal Medan & Sumatera Utara.
            </p>
            
            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-zinc-900">
              <div className="flex flex-col gap-1">
                <span className="font-serif-editorial text-3xl text-amber-400 font-bold">500+</span>
                <span className="text-xs text-zinc-400 font-light uppercase tracking-wider">Pasangan Ditangani</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-serif-editorial text-3xl text-amber-400 font-bold">100%</span>
                <span className="text-xs text-zinc-400 font-light uppercase tracking-wider">Kepuasan Visual</span>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.25em] uppercase text-amber-400 hover:text-amber-300 transition-colors"
              >
                <span>Baca Cerita Selengkapnya</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Karya Unggulan (Portfolio Grid Preview) */}
      <FeaturedWorks limit={3} />

      {/* 4. Layanan & Paket Harga */}
      <ServicesPricing />

      {/* 5. Kalender Ketersediaan Tanggal */}
      <section className="py-20 bg-zinc-950 border-t border-zinc-900">
        <div className="text-center max-w-3xl mx-auto px-6 mb-8">
          <span className="text-xs font-semibold tracking-[0.3em] uppercase text-amber-400">
            Real-Time Availability
          </span>
          <h2 className="font-serif-editorial text-4xl sm:text-5xl text-zinc-100 font-light tracking-wide uppercase mt-2">
            Cek Kalender Tanggal
          </h2>
          <p className="text-sm text-zinc-400 font-light mt-3">
            Pilih tanggal yang sesuai untuk melihat status ketersediaan fotografer Marga Sera.
          </p>
        </div>

        <AvailabilityCalendar />
      </section>
    </div>
  );
}

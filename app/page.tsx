import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CinematicHero } from '@/components/hero/cinematic-hero';
import { FeaturedWorks } from '@/components/gallery/featured-works';
import { ServicesPricing } from '@/components/services/services-pricing';
import { AvailabilityCalendar } from '@/components/calendar/availability-calendar';
import { ClientTestimonials } from '@/components/testimonials/client-testimonials';
import { FAQSection } from '@/components/faq/faq-section';
import { ArrowRight } from 'lucide-react';
import { getServices, getPackages } from '@/lib/actions/services';
import { getGalleryProjects } from '@/lib/actions/gallery';
import { getPublishedTestimonials } from '@/lib/actions/testimonials';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [services, packages, projects, testimonials] = await Promise.all([
    getServices(),
    getPackages(),
    getGalleryProjects({ limit: 6 }),
    getPublishedTestimonials(),
  ]);

  return (
    <div className="flex flex-col w-full bg-zinc-950 text-zinc-100">
      {/* 1. Hero Sinematik */}
      <CinematicHero />

      {/* 2. Profil Singkat & Filosofi Brand (Entity Narrative Pamekasan Madura) */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-b border-zinc-900">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-6 relative h-[480px] w-full overflow-hidden group border border-zinc-800">
            <Image
              src="/about.jpeg"
              alt="Margasera Photography Studio Pamekasan Madura"
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
              Fotografer Pamekasan &amp; Madura
            </span>
            <h2 className="font-serif-editorial text-4xl sm:text-5xl text-zinc-100 font-light tracking-wide uppercase leading-tight">
              Seni Visual Sinematik &amp; Storytelling Abadi
            </h2>
            <p className="text-sm text-zinc-400 font-light leading-relaxed">
              Margasera Photography adalah creative photography studio yang berbasis di Pamekasan, Madura dengan filosofi &ldquo;Moment Satu Hari Untuk Selamanya&rdquo;. Kami mendedikasikan diri untuk mengabadikan momen berharga Anda melalui karya visual berstandar editorial dan sinematik.
            </p>
            <p className="text-sm text-zinc-400 font-light leading-relaxed">
              Layanan utama kami meliputi Wedding, Pre-Wedding, Engagement, Siraman, Wisuda Outdoor, Sidang Skripsi, serta Tasyakuran 40 Hari Bayi di Pamekasan, Madura (Sumenep, Sampang, Bangkalan), Jawa Timur, hingga seluruh Indonesia.
            </p>

            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-zinc-900">
              <div className="flex flex-col gap-1">
                <span className="font-serif-editorial text-3xl text-amber-400 font-bold">500+</span>
                <span className="text-xs text-zinc-400 font-light uppercase tracking-wider">Pasangan &amp; Klien Ditangani</span>
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
                <span>Baca Cerita Brand Selengkapnya</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Karya Unggulan (Portfolio Grid Preview with Pre-rendered Data) */}
      <FeaturedWorks limit={3} initialProjects={projects} initialServices={services} />

      {/* 4. Layanan & Paket Harga */}
      <ServicesPricing initialServices={services} initialPackages={packages} />

      {/* 5. Testimonial Klien (Social Proof & Local SEO) */}
      <ClientTestimonials initialTestimonials={testimonials} />

      {/* 6. Kalender Ketersediaan Tanggal */}
      <section className="py-20 bg-zinc-950 border-t border-zinc-900">
        <div className="text-center max-w-3xl mx-auto px-6 mb-8">
          <span className="text-xs font-semibold tracking-[0.3em] uppercase text-[#0066CC]">
            Real-Time Availability
          </span>
          <h2 className="font-serif-editorial text-4xl sm:text-5xl text-zinc-100 font-light tracking-wide uppercase mt-2">
            Cek Kalender Tanggal
          </h2>
          <p className="text-sm text-zinc-400 font-light mt-3">
            Pilih tanggal yang sesuai untuk melihat status ketersediaan fotografer Margasera Photography di Pamekasan &amp; Madura.
          </p>
        </div>

        <AvailabilityCalendar />
      </section>

      {/* 7. FAQ Section (Local SEO & Schema FAQPage) */}
      <FAQSection />
    </div>
  );
}

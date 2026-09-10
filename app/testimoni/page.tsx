import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { TestimonialForm } from '@/components/testimonials/testimonial-form';
import { ChevronRight, MessageSquareHeart, Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Isi Ulasan & Testimoni Klien',
  description: 'Formulir ulasan dan cerita pengalaman klien bersama Margasera Photography di Pamekasan & Madura — "Moment Satu Hari Untuk Selamanya". Bagikan kesan bahagia Anda.',
  alternates: {
    canonical: '/testimoni',
  },
  openGraph: {
    title: 'Isi Ulasan & Testimoni Klien | Margasera Photography',
    description: 'Bagikan ulasan dan pengalaman Anda bersama Margasera Photography di Pamekasan & Madura — "Moment Satu Hari Untuk Selamanya".',
    url: '/testimoni',
    siteName: 'Margasera Photography',
  },
};

export default function TestimoniPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Formulir Ulasan & Testimoni Klien Margasera Photography',
    description: 'Halaman pengisian ulasan dan testimoni pengalaman klien Margasera Photography di Pamekasan, Madura.',
    url: 'https://margasera.id/testimoni',
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 pt-8 pb-20 transition-colors">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumbs */}
      <div className="max-w-5xl mx-auto px-6 mb-6">
        <nav className="flex items-center gap-2 text-xs text-zinc-500 font-light">
          <Link href="/" className="hover:text-[#0066CC] transition-colors">
            Beranda
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-800 dark:text-zinc-300 font-medium">Isi Testimoni</span>
        </nav>
      </div>

      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto px-6 mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#0066CC]/10 border border-[#0066CC]/30 text-[#0066CC] dark:text-blue-400 text-[10px] tracking-[0.28em] uppercase rounded-full mb-4">
          <MessageSquareHeart className="w-3.5 h-3.5" />
          <span>Client Experience &amp; Story</span>
        </div>

        <h1 className="font-serif-editorial text-4xl sm:text-6xl text-zinc-900 dark:text-zinc-100 font-light tracking-wide uppercase">
          Kirimkan Cerita Anda
        </h1>

        <p className="font-serif text-sm sm:text-base text-amber-600 dark:text-amber-300/90 italic mt-3">
          &ldquo;Moment Satu Hari Untuk Selamanya&rdquo;
        </p>

        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-light leading-relaxed mt-4 max-w-xl mx-auto">
          Terima kasih telah mempercayakan dokumentasi momen berharga Anda kepada Margasera Photography di Pamekasan &amp; Madura. Ulasan tulus Anda adalah kebanggaan dan inspirasi terbesar bagi kami untuk terus berkarya.
        </p>
      </div>

      {/* Form Section */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 mb-24">
        <Suspense
          fallback={
            <div className="p-10 bg-white dark:bg-zinc-900/80 border border-zinc-200/90 dark:border-zinc-800/90 rounded-2xl text-center flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-[#0066CC]" />
              <span className="text-xs text-zinc-400 font-mono">Memuat formulir testimoni...</span>
            </div>
          }
        >
          <TestimonialForm />
        </Suspense>
      </section>
    </div>
  );
}

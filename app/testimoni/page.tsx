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
    <div className="relative min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 pt-8 pb-24 transition-colors overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Ambient Atmospheric Glows for Dark Mode */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#0066CC]/15 dark:bg-[#0066CC]/20 blur-[130px] rounded-full" />
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-amber-500/5 dark:bg-amber-500/10 blur-[130px] rounded-full" />
        <div className="absolute top-2/3 -right-32 w-80 h-80 bg-blue-500/5 dark:bg-blue-500/10 blur-[130px] rounded-full" />
      </div>

      {/* Breadcrumbs */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 mb-8 relative z-10">
        <nav className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-zinc-900/70 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 text-xs text-zinc-500 dark:text-zinc-400 font-light shadow-2xs">
          <Link href="/" className="hover:text-[#0066CC] dark:hover:text-blue-400 transition-colors">
            Beranda
          </Link>
          <ChevronRight className="w-3 h-3 text-zinc-400 dark:text-zinc-600" />
          <span className="text-zinc-900 dark:text-zinc-200 font-medium">Isi Testimoni</span>
        </nav>
      </div>

      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto px-4 sm:px-6 mb-12 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#0066CC]/10 dark:bg-blue-500/10 border border-[#0066CC]/25 dark:border-blue-400/25 text-[#0066CC] dark:text-blue-400 text-[10px] tracking-[0.28em] uppercase rounded-full mb-4 shadow-xs">
          <MessageSquareHeart className="w-3.5 h-3.5" />
          <span>Client Experience &amp; Story</span>
        </div>

        <h1 className="font-serif-editorial text-4xl sm:text-6xl text-zinc-900 dark:text-white font-light tracking-wide uppercase leading-tight drop-shadow-xs">
          Kirimkan Cerita Anda
        </h1>

        <p className="font-serif text-sm sm:text-base text-amber-600 dark:text-amber-400/90 italic mt-3 drop-shadow-[0_0_12px_rgba(251,191,36,0.15)]">
          &ldquo;Moment Satu Hari Untuk Selamanya&rdquo;
        </p>

        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300/85 font-light leading-relaxed mt-4 max-w-xl mx-auto">
          Terima kasih telah mempercayakan dokumentasi momen berharga Anda kepada Margasera Photography di Pamekasan &amp; Madura. Jadilah yang pertama kali membagikan cerita, kesan, dan pengalaman bahagia Anda bersama kami!
        </p>
      </div>

      {/* Form Section */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 mb-24 relative z-10">
        <Suspense
          fallback={
            <div className="p-10 bg-white/90 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200/90 dark:border-zinc-800/90 rounded-3xl text-center flex flex-col items-center justify-center gap-3 shadow-sm">
              <Loader2 className="w-6 h-6 animate-spin text-[#0066CC] dark:text-blue-400" />
              <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">Memuat formulir testimoni...</span>
            </div>
          }
        >
          <TestimonialForm />
        </Suspense>
      </section>
    </div>
  );
}

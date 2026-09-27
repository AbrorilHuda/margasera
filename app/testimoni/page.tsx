import React, { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { TestimonialForm } from "@/components/testimonials/testimonial-form";
import { ChevronRight, MessageSquareHeart, Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Isi Ulasan & Testimoni Klien",
  description:
    'Formulir ulasan dan cerita pengalaman klien bersama Margasera Photography di Pamekasan & Madura — "Moment Satu Hari Untuk Selamanya". Bagikan kesan bahagia Anda.',
  alternates: {
    canonical: "/testimoni",
  },
  openGraph: {
    title: "Isi Ulasan & Testimoni Klien - Margasera Photography",
    description:
      'Bagikan ulasan dan pengalaman Anda bersama Margasera Photography di Pamekasan & Madura — "Moment Satu Hari Untuk Selamanya".',
    url: "/testimoni",
    siteName: "Margasera Photography",
  },
};

export default function TestimoniPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Formulir Ulasan & Testimoni Klien Margasera Photography",
    description:
      "Halaman pengisian ulasan dan testimoni pengalaman klien Margasera Photography di Pamekasan, Madura.",
    url: "https://margasera.id/testimoni",
  };

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100 pt-8 pb-24 overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumbs - Minimalist */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 mb-8 relative z-10">
        <nav className="inline-flex items-center gap-2 text-xs text-zinc-400 font-light font-sans">
          <Link
            href="/"
            className="hover:text-zinc-200 transition-colors"
          >
            Beranda
          </Link>
          <ChevronRight className="w-3 h-3 text-zinc-600" />
          <span className="text-zinc-200 font-medium">
            Isi Testimoni
          </span>
        </nav>
      </div>

      {/* Hero Header: Tenang, Berkelas, Editorial */}
      <div className="text-center max-w-2xl mx-auto px-4 sm:px-6 mb-12 relative z-10">
        <span className="text-[11px] font-medium tracking-[0.3em] uppercase text-[#0066CC] font-sans">
          Client Experience
        </span>

        <h1 className="font-serif-editorial text-4xl sm:text-5xl md:text-6xl text-zinc-100 font-light tracking-wide uppercase mt-2 leading-tight">
          Kirimkan Cerita Anda
        </h1>

        <p className="font-serif-editorial text-base sm:text-lg text-amber-300/90 italic mt-2.5">
          &ldquo;Moment Satu Hari Untuk Selamanya&rdquo;
        </p>

        <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed mt-3 max-w-lg mx-auto font-sans">
          Terima kasih telah mempercayakan dokumentasi hari berharga Anda kepada Margasera. Bagikan kesan, cerita, dan pengalaman bahagia Anda bersama kami.
        </p>
      </div>

      {/* Form Section */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 mb-24 relative z-10">
        <Suspense
          fallback={
            <div className="p-10 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl text-center flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-[#0066CC]" />
              <span className="text-xs text-zinc-400 font-mono">
                Memuat formulir testimoni...
              </span>
            </div>
          }
        >
          <TestimonialForm />
        </Suspense>
      </section>
    </div>
  );
}

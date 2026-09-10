import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import { Camera, MapPin, MessageCircle, Mail, Phone, Send, Sparkles } from 'lucide-react';
import { InstagramIcon } from '@/components/ui/icons';

export const metadata: Metadata = {
  title: 'Tentang & Kontak Fotografer Pamekasan',
  description: 'Profil Margasera Photography di Pamekasan, Madura — "Moment Satu Hari Untuk Selamanya". Melayani Wedding, Pre-Wedding, Engagement, Siraman, Wisuda Outdoor, Sidang Skripsi, dan Tasyakuran 40 Hari Bayi.',
  keywords: [
    'Tentang Margasera Photography',
    'Moment Satu Hari Untuk Selamanya',
    'Fotografer Pamekasan',
    'Fotografer Madura',
    'Studio Foto Pamekasan',
    'Kontak Fotografer Wedding Madura',
  ],
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'Tentang & Kontak | Margasera Photography Pamekasan',
    description: 'Profil Margasera Photography di Pamekasan, Madura — "Moment Satu Hari Untuk Selamanya". Melayani Wedding, Pre-Wedding, Engagement, Siraman, Wisuda Outdoor, Sidang Skripsi, dan Tasyakuran 40 Hari Bayi.',
    url: '/about',
    siteName: 'Margasera Photography',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Tentang Margasera Photography Pamekasan Madura',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
};

export default function AboutPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'Tentang Margasera Photography',
    description: 'Profil Margasera Photography, creative photography studio di Pamekasan, Madura.',
    url: 'https://margasera.id/about',
    mainEntity: {
      '@type': 'PhotographyBusiness',
      name: 'Margasera Photography',
      url: 'https://margasera.id',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Pamekasan',
        addressRegion: 'Jawa Timur',
        addressCountry: 'ID',
      },
    },
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pt-8 pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Brand Story Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-6 flex flex-col gap-6">
            <span className="text-xs font-semibold tracking-[0.3em] uppercase text-[#0066CC]">
              The Artist & Storyteller
            </span>
            <h1 className="font-serif-editorial text-4xl sm:text-6xl text-zinc-100 font-light tracking-wide uppercase leading-tight">
              Cerita Di Balik Margasera
            </h1>
            <p className="text-sm text-zinc-400 font-light leading-relaxed">
              Margasera Photography adalah creative photography studio yang berbasis di Pamekasan, Madura dengan mengusung filosofi &ldquo;Moment Satu Hari Untuk Selamanya&rdquo;. Kami mendedikasikan karya kami untuk merangkum momen sakral dan berharga melalui pendekatan visual editorial dan sinematik untuk Wedding, Pre-Wedding, Engagement, Siraman, Wisuda Outdoor, Sidang Skripsi, serta Tasyakuran 40 Hari Bayi.
            </p>
            <p className="text-sm text-zinc-400 font-light leading-relaxed">
              Kami percaya bahwa fotografi bukan sekadar menekan shutter kamera, melainkan merangkum cahaya, emosi tulus, dan kenangan otentik menjadi karya seni visual yang abadi lintas generasi. Margasera melayani kebutuhan fotografi di Pamekasan, Madura (Sumenep, Sampang, Bangkalan), Jawa Timur, serta berbagai destinasi di Indonesia.
            </p>

            <div className="p-6 bg-zinc-900 border border-zinc-800 flex items-center gap-4 mt-2">
              <Sparkles className="w-6 h-6 text-[#0066CC] shrink-0" />
              <p className="text-xs text-zinc-300 font-light italic">
                &ldquo;Moment Satu Hari Untuk Selamanya — Kemewahan sebuah dokumentasi terletak pada kejujuran emosi di dalamnya.&rdquo;
              </p>
            </div>
          </div>

          <div className="md:col-span-6 relative h-[560px] w-full border border-zinc-800">
            <Image
              src="/about.jpeg"
              alt="Margasera Photography Studio Lead Pamekasan Madura"
              fill
              className="object-cover img-editorial filter brightness-90"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* Contact Form & Location Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pt-16 border-t border-zinc-900">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Contact Details */}
          <div className="md:col-span-5 flex flex-col gap-6">
            <span className="text-xs font-semibold tracking-[0.3em] uppercase text-[#0066CC]">
              Hubungi Tim Kami
            </span>
            <h2 className="font-serif-editorial text-3xl sm:text-5xl text-zinc-100 font-light uppercase">
              Mari Berdiskusi
            </h2>
            <p className="text-xs text-zinc-400 font-light leading-relaxed">
              Memiliki pertanyaan khusus mengenai jadwal, lokasi destination wedding, atau kolaborasi visual di Pamekasan, Madura, maupun luar kota? Kirimkan pesan Anda melalui formulir di samping.
            </p>

            <div className="flex flex-col gap-4 text-xs text-zinc-300 font-light pt-4 border-t border-zinc-900">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-[#0066CC] shrink-0" />
                <span>Pamekasan, Madura, Jawa Timur, Indonesia</span>
              </div>
              <div className="flex items-center gap-3">
                <InstagramIcon className="w-4 h-4 text-[#0066CC] shrink-0" />
                <span>@margasera.id</span>
              </div>
              <div className="flex items-center gap-3">
                <MessageCircle className="w-4 h-4 text-[#0066CC] shrink-0" />
                <span>WhatsApp: +62 812-3456-7890</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#0066CC] shrink-0" />
                <span>Email: contact@margasera.id</span>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-7 bg-zinc-900 border border-zinc-800 p-8 md:p-10">
            <form className="flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-zinc-300 uppercase tracking-widest">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Anda"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] text-zinc-100 p-3.5 rounded text-xs focus:outline-none transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-zinc-300 uppercase tracking-widest">
                    Nomor WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0812xxxx"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] text-zinc-100 p-3.5 rounded text-xs focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-zinc-300 uppercase tracking-widest">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="email@domain.com"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] text-zinc-100 p-3.5 rounded text-xs focus:outline-none transition-colors"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-zinc-300 uppercase tracking-widest">
                  Pesan / Subjek *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tuliskan pesan atau pertanyaan Anda di sini..."
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] text-zinc-100 p-3.5 rounded text-xs focus:outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-semibold tracking-widest uppercase transition-colors shadow-[0_0_20px_rgba(0,102,204,0.3)] flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Kirim Pesan Kontak</span>
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

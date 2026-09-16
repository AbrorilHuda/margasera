import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  Camera,
  MapPin,
  MessageCircle,
  Mail,
  Sparkles,
  Heart,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { InstagramIcon } from '@/components/ui/icons';
import { fetchStudioSettings } from '@/lib/data/settings';
import { AboutContactForm } from '@/components/about/about-contact-form';

export const metadata: Metadata = {
  title: 'Tentang & Kontak Fotografer Pamekasan',
  description:
    'Profil Margasera Photography di Pamekasan, Madura — "Moment Satu Hari Untuk Selamanya". Melayani Wedding, Pre-Wedding, Engagement, Siraman, Wisuda Outdoor, Sidang Skripsi, dan Tasyakuran 40 Hari Bayi.',
  keywords: [
    'Tentang Margasera Photography',
    'Moment Satu Hari Untuk Selamanya',
    'Fotografer Pamekasan',
    'Fotografer Madura',
    'Studio Foto Pamekasan',
    'Kontak Fotografer Wedding Madura',
    'Royfal Alim Fotografer',
  ],
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'Tentang & Kontak - Margasera Photography',
    description:
      'Profil Margasera Photography di Pamekasan, Madura — "Moment Satu Hari Untuk Selamanya". Melayani Wedding, Pre-Wedding, Engagement, Siraman, Wisuda Outdoor, Sidang Skripsi, dan Tasyakuran 40 Hari Bayi.',
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

export default async function AboutPage() {
  const settings = await fetchStudioSettings();

  const waNumber = settings.whatsapp.replace(/\D/g, '');
  const waLink = `https://wa.me/${waNumber.startsWith('0') ? '62' + waNumber.slice(1) : waNumber}`;

  const igHandle = settings.instagram
    ? '@' + settings.instagram.replace(/^https?:\/\/(www\.)?instagram\.com\/?/, '').replace(/\/$/, '')
    : '@margasera.id';

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
      telephone: settings.whatsapp,
      email: settings.email,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Pamekasan',
        addressRegion: 'Jawa Timur',
        addressCountry: 'ID',
      },
    },
  };

  return (
    <div className="min-h-screen bg-zinc-50/70 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 pt-8 pb-24 transition-colors duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. Brand Story & Founder Profile Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-6 flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 py-1.5">
              <span className="text-xs font-semibold tracking-[0.3em] uppercase text-[#0066CC]">
                TENTANG MARGASERA PHOTOGRAPHY
              </span>
            </div>

            <h1 className="font-serif-editorial text-4xl sm:text-6xl text-zinc-900 dark:text-zinc-100 font-light tracking-wide uppercase leading-tight">
              Menjaga Cerita, Merangkum Rasa
            </h1>

            <p className="font-serif text-sm sm:text-base text-amber-600 dark:text-amber-400 italic">
              &ldquo;Moment Satu Hari Untuk Selamanya&rdquo;
            </p>

            <p className="text-sm text-zinc-600 dark:text-zinc-400 font-light leading-relaxed">
              Margasera Photography adalah creative photography studio yang lahir di Pamekasan, Madura, didirikan dengan tekad menghadirkan dokumentasi visual berstandar editorial, sinematik, dan sarat kejujuran emosi.
            </p>

            <p className="text-sm text-zinc-600 dark:text-zinc-400 font-light leading-relaxed">
              Di bawah arahan <strong>{settings.ownerName}</strong> bersama tim kreatif Margasera, kami memandang setiap peristiwa sakral mulai dari pernikahan, kehangatan engagement, siraman adat, wisuda, hingga kelahiran buah hati bukan sekadar kumpulan foto, melainkan warisan cerita berharga yang akan terus hidup dan menghangatkan hati lintas generasi.
            </p>

            <div className="p-5 sm:p-6 bg-white/90 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl flex items-start gap-4 shadow-xs dark:shadow-md">
              <Sparkles className="w-5 h-5 text-[#0066CC] shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 tracking-wide uppercase">
                  Filosofi Karya
                </span>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 font-light italic leading-relaxed">
                  &ldquo;Hari bahagia mungkin hanya berlangsung dalam satu hari, namun rasa haru, tawa, dan keagungan momen di dalamnya kami rajut menjadi karya seni abadi.&rdquo;
                </p>
              </div>
            </div>
          </div>

          <div className="md:col-span-6 relative h-[420px] sm:h-[500px] md:h-[560px] w-full border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
            <Image
              src="/about.jpeg"
              alt="Margasera Photography Studio Lead Pamekasan Madura"
              fill
              className="object-cover img-editorial filter brightness-95"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 p-4 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl">
              <span className="text-white font-serif-editorial text-sm sm:text-base block">
                {settings.ownerName} &amp; Tim Margasera
              </span>
              <span className="text-white text-[11px] font-light">
                Creative Visual Storyteller • Pamekasan, Madura
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Core Values & Visual Standards Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16 border-t border-zinc-200 dark:border-zinc-900">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-semibold tracking-[0.3em] uppercase text-[#0066CC]">
            Nilai &amp; Standar Karya
          </span>
          <h2 className="font-serif-editorial text-3xl sm:text-5xl text-zinc-900 dark:text-zinc-100 font-light tracking-wide uppercase mt-2">
            Komitmen Visual Margasera
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-light mt-2.5 leading-relaxed">
            Tiga pilar utama yang senantiasa kami hadirkan dalam setiap sesi pemotretan di Madura, Surabaya, dan destinasi lainnya di Indonesia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Pilar 1 */}
          <div className="p-8 bg-white/90 dark:bg-zinc-900/80 border border-zinc-200/90 dark:border-zinc-800/90 rounded-3xl flex flex-col gap-4 shadow-xs dark:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#0066CC]/10 text-[#0066CC] flex items-center justify-center border border-[#0066CC]/20">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="font-serif-editorial text-2xl text-zinc-900 dark:text-zinc-100 font-light">
              Kejujuran Emosi
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-light leading-relaxed">
              Kami menangkap tawa hangat, linangan air mata haru, dan tatapan mata yang tulus secara natural tanpa arahan pose yang kaku atau terasa dipaksakan.
            </p>
          </div>

          {/* Pilar 2 */}
          <div className="p-8 bg-white/90 dark:bg-zinc-900/80 border border-zinc-200/90 dark:border-zinc-800/90 rounded-3xl flex flex-col gap-4 shadow-xs dark:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#0066CC]/10 text-[#0066CC] flex items-center justify-center border border-[#0066CC]/20">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="font-serif-editorial text-2xl text-zinc-900 dark:text-zinc-100 font-light">
              Komposisi Sinematik
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-light leading-relaxed">
              Memadukan teknik pencahayaan presisi, framing berstandar editorial majalah, serta grading warna elegan yang abadi (*timeless*) melintasi zaman.
            </p>
          </div>

          {/* Pilar 3 */}
          <div className="p-8 bg-white/90 dark:bg-zinc-900/80 border border-zinc-200/90 dark:border-zinc-800/90 rounded-3xl flex flex-col gap-4 shadow-xs dark:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#0066CC]/10 text-[#0066CC] flex items-center justify-center border border-[#0066CC]/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-serif-editorial text-2xl text-zinc-900 dark:text-zinc-100 font-light">
              Pelayanan Terpercaya
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-light leading-relaxed">
              Konsultasi pra-sesi yang komunikatif, ketepatan waktu hadir di lokasi, penyerahan file digital cepat, hingga jaminan cetak album berkualitas tinggi.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Contact Form & Studio Info Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pt-16 border-t border-zinc-200 dark:border-zinc-900">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          {/* Official Contact Details */}
          <div className="md:col-span-5 flex flex-col gap-6">
            <span className="text-xs font-semibold tracking-[0.3em] uppercase text-[#0066CC]">
              Hubungi Tim Kami
            </span>
            <h2 className="font-serif-editorial text-3xl sm:text-5xl text-zinc-900 dark:text-zinc-100 font-light uppercase">
              Mari Berdiskusi
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-light leading-relaxed">
              Punya rencana pernikahan, ingin sesi foto wisuda, atau butuh konsultasi paket kustom di Pamekasan, Madura, maupun luar kota? Kirimkan pesan melalui form atau hubungi kontak resmi kami.
            </p>

            <div className="flex flex-col gap-4 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 font-light pt-4 border-t border-zinc-200 dark:border-zinc-900">
              {/* WhatsApp Link */}
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3.5 p-3.5 bg-white/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl hover:border-[#0066CC] transition-all group shadow-xs"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">WhatsApp Resmi</span>
                  <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-[#0066CC] transition-colors">
                    {settings.whatsapp}
                  </span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 ml-auto text-zinc-400 group-hover:text-[#0066CC]" />
              </a>

              {/* Instagram Link */}
              {settings.instagram && (
                <a
                  href={settings.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3.5 p-3.5 bg-white/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl hover:border-[#0066CC] transition-all group shadow-xs"
                >
                  <div className="w-9 h-9 rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0">
                    <InstagramIcon className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">Instagram Resmi</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-[#0066CC] transition-colors">
                      {igHandle}
                    </span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 ml-auto text-zinc-400 group-hover:text-[#0066CC]" />
                </a>
              )}

              {/* Email Link */}
              {settings.email && (
                <a
                  href={`mailto:${settings.email}`}
                  className="flex items-center gap-3.5 p-3.5 bg-white/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl hover:border-[#0066CC] transition-all group shadow-xs"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#0066CC]/10 text-[#0066CC] flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">Email Studio</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-[#0066CC] transition-colors">
                      {settings.email}
                    </span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 ml-auto text-zinc-400 group-hover:text-[#0066CC]" />
                </a>
              )}

              {/* Address & Maps Link */}
              <a
                href={settings.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(settings.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3.5 p-3.5 bg-white/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl hover:border-[#0066CC] transition-all group shadow-xs"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">Lokasi Studio</span>
                  <span className="text-xs text-zinc-800 dark:text-zinc-200 leading-snug group-hover:text-[#0066CC] transition-colors">
                    {settings.address}
                  </span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 ml-auto text-zinc-400 group-hover:text-[#0066CC]" />
              </a>
            </div>
          </div>

          {/* Interactive Form */}
          <div className="md:col-span-7">
            <AboutContactForm whatsappNumber={settings.whatsapp} />
          </div>
        </div>
      </section>

      {/* 4. Bottom CTA Strip */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pt-16">
        <div className="p-8 sm:p-12 bg-white/95 dark:bg-gradient-to-br dark:from-zinc-900 dark:via-zinc-900/90 dark:to-zinc-950 text-zinc-900 dark:text-white rounded-3xl border border-zinc-200 dark:border-zinc-800/80 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg shadow-zinc-200/50 dark:shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#0066CC]/10 blur-3xl pointer-events-none rounded-full" />

          <div className="relative z-10 flex flex-col gap-1.5 text-center md:text-left">
            <h3 className="font-serif-editorial text-2xl sm:text-4xl font-light text-zinc-900 dark:text-zinc-100">
              Ingin Mengetahui Karya &amp; Jadwal Kami?
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-light max-w-xl">
              Jelajahi dokumentasi momen nyata yang telah kami abadikan atau periksa ketersediaan tanggal acara Anda sekarang.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-3 shrink-0 flex-wrap justify-center">
            <Link
              href="/work"
              className="px-6 py-3.5 rounded-xl text-xs font-semibold tracking-wider uppercase bg-zinc-100 hover:bg-zinc-200 dark:bg-white/10 dark:hover:bg-white/20 border border-zinc-200 dark:border-white/20 text-zinc-800 dark:text-white transition-all backdrop-blur-md shadow-xs"
            >
              Lihat Portofolio
            </Link>
            <Link
              href="/availability"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-xs font-bold tracking-wider uppercase bg-[#0066CC] hover:bg-[#0052A3] text-white transition-all shadow-md shadow-[#0066CC]/30 hover:scale-[1.02]"
            >
              <span>Cek Jadwal Tanggal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}


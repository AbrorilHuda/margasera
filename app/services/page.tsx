import React from 'react';
import type { Metadata } from 'next';
import { ServicesPricing } from '@/components/services/services-pricing';
import { FAQSection } from '@/components/faq/faq-section';
import { getServices, getPackages } from '@/lib/actions/services';
import { formatCurrency } from '@/lib/utils';

export const revalidate = 3600; // revalidate every hour

export async function generateMetadata(): Promise<Metadata> {
  const packages = await getPackages();
  const prices = packages.map((p) => p.price).filter(Boolean);
  const minPrice = prices.length > 0 ? Math.min(...prices) : null;
  const priceText = minPrice ? ` mulai dari ${formatCurrency(minPrice)}` : '';

  return {
    title: 'Layanan & Paket Harga',
    description: `Daftar paket & harga dokumentasi fotografi profesional Margasera Photography di Pamekasan, Madura${priceText} — "Moment Satu Hari Untuk Selamanya". Melayani Wedding, Pre-Wedding, Engagement, Siraman, Wisuda Outdoor, Sidang Skripsi, serta Tasyakuran 40 Hari Bayi.`,
    keywords: [
      'Layanan Fotografer Pamekasan',
      'Paket Foto Wedding Pamekasan',
      'Prewedding Madura Harga',
      'Harga Fotografer Pernikahan Madura',
      'Foto Wisuda Pamekasan Harga',
      'Margasera Photography Pricing',
      'Studio Foto Pamekasan',
      'Fotografi Sinematik Madura',
    ],
    alternates: {
      canonical: '/services',
    },
    openGraph: {
      title: 'Layanan & Paket Harga Fotografer Pamekasan & Madura | Margasera Photography',
      description: `Daftar paket & harga dokumentasi fotografi profesional Margasera Photography di Pamekasan, Madura${priceText}.`,
      url: '/services',
      siteName: 'Margasera Photography',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'Layanan & Paket Harga Margasera Photography Pamekasan',
        },
      ],
      locale: 'id_ID',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Layanan & Paket Harga | Margasera Photography',
      description: `Daftar paket & harga dokumentasi fotografi di Pamekasan, Madura${priceText}.`,
      images: ['/og-image.png'],
    },
  };
}

export default async function ServicesPage() {
  const [services, packages] = await Promise.all([
    getServices(),
    getPackages(),
  ]);

  const prices = packages.map((p) => p.price).filter(Boolean);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Jasa & Paket Fotografi Margasera Photography Pamekasan Madura',
    description: 'Layanan dan daftar paket harga fotografi sinematik & editorial untuk pernikahan (wedding), pre-wedding story, couple, portrait, dan graduation di Pamekasan, Madura.',
    brand: {
      '@type': 'Brand',
      name: 'Margasera Photography',
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'IDR',
      lowPrice: minPrice,
      highPrice: maxPrice,
      offerCount: packages.length,
      offers: packages.map((pkg) => ({
        '@type': 'Offer',
        name: pkg.name,
        description: pkg.description,
        price: pkg.price,
        priceCurrency: 'IDR',
        availability: 'https://schema.org/InStock',
        url: 'https://margasera.id/services',
      })),
    },
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pt-8 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="text-center max-w-3xl mx-auto px-6 mb-4">
        <span className="text-xs font-semibold tracking-[0.3em] uppercase text-[#0066CC]">
          Investment &amp; Packages
        </span>
        <h1 className="font-serif-editorial text-4xl sm:text-6xl text-zinc-100 font-light tracking-wide uppercase mt-2">
          Layanan &amp; Paket Harga
        </h1>
        <p className="text-sm text-zinc-400 font-light leading-relaxed mt-4">
          Dokumentasi fotografi profesional di Pamekasan, Madura dengan pendekatan visual sinematik dan editorial — &ldquo;Moment Satu Hari Untuk Selamanya&rdquo;. Temukan paket terbaik untuk Wedding, Pre-Wedding, Engagement, Siraman, Wisuda Outdoor, Sidang Skripsi, dan Tasyakuran 40 Hari Bayi.
        </p>
      </div>

      <ServicesPricing initialServices={services} initialPackages={packages} hideHeader={true} />
      <FAQSection />
    </div>
  );
}

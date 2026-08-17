import React from 'react';
import type { Metadata } from 'next';
import { ServicesPricing } from '@/components/services/services-pricing';
import { getServices, getPackages } from '@/lib/actions/services';
import { formatCurrency } from '@/lib/utils';

export const dynamic = 'force-dynamic';


export async function generateMetadata(): Promise<Metadata> {
  const packages = await getPackages();
  const prices = packages.map((p) => p.price).filter(Boolean);
  const minPrice = prices.length > 0 ? Math.min(...prices) : null;
  const priceText = minPrice ? ` mulai dari ${formatCurrency(minPrice)}` : '';

  return {
    title: 'Layanan & Paket Harga',
    description: `Daftar paket & harga terjangkau dokumentasi fotografi pernikahan (wedding), pre-wedding, couple, graduation & portraiture Margasera Photography Madura dan sekitarnya ${priceText}. Booking tanggal online.`,
    keywords: [
      'Layanan Foto Wedding Madura',
      'Paket Prewedding Madura',
      'Harga Fotografer Pernikahan',
      'Harga Foto Wedding Madura',
      'Margasera Pricing',
      'Paket Dokumentasi Foto',
      'Fotografi Sinematik Madura',
      'margasera harga',
    ],
    alternates: {
      canonical: '/services',
    },
    openGraph: {
      title: 'Layanan & Paket Harga',
      description: `Daftar paket & harga terjangkau dokumentasi fotografi pernikahan (wedding), pre-wedding, couple, graduation & portraiture Margasera Photography Madura dan sekitarnya ${priceText}.`,
      url: '/services',
      siteName: 'Margasera Photography',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'Layanan & Paket Harga Margasera Photography',
        },
      ],
      locale: 'id_ID',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Layanan & Paket Harga',
      description: `Daftar paket & harga terjangkau dokumentasi fotografi pernikahan (wedding), pre-wedding, couple, graduation & portraiture Margasera Photography Madura dan sekitarnya ${priceText}.`,
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
    name: 'Jasa & Paket Fotografi Margasera Photography',
    description: 'Layanan dan daftar paket harga fotografi sinematik & editorial untuk pernikahan (wedding), pre-wedding, couple, dan portraiture.',
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
      <ServicesPricing initialServices={services} initialPackages={packages} />
    </div>
  );
}

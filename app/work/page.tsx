import React from 'react';
import type { Metadata } from 'next';
import { FeaturedWorks } from '@/components/gallery/featured-works';
import { getGalleryProjects } from '@/lib/actions/gallery';
import { getServices } from '@/lib/actions/services';

export const metadata: Metadata = {
  title: 'Portofolio Karya & Galeri Foto',
  description: 'Galeri portofolio fotografi sinematik dan editorial Margasera Photography — "Moment Satu Hari Untuk Selamanya". Menampilkan dokumentasi Wedding, Pre-Wedding, Engagement, Siraman, Wisuda Outdoor, Sidang Skripsi, dan Tasyakuran Bayi di Pamekasan & Madura.',
  keywords: [
    'Portofolio Margasera Photography',
    'Galeri Foto Wedding Pamekasan',
    'Prewedding Madura',
    'Foto Pernikahan Pamekasan',
    'Foto Wisuda Outdoor Pamekasan',
    'Siraman Pamekasan',
    'Fotografer Madura Karya',
  ],
  alternates: {
    canonical: '/work',
  },
  openGraph: {
    title: 'Portofolio Karya & Galeri Foto | Margasera Photography',
    description: 'Galeri portofolio fotografi sinematik dan editorial Margasera Photography — "Moment Satu Hari Untuk Selamanya" di Pamekasan, Madura.',
    url: '/work',
    siteName: 'Margasera Photography',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Portofolio Karya Margasera Photography',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
};

export default async function WorkPage() {
  const [projects, services] = await Promise.all([
    getGalleryProjects(),
    getServices(),
  ]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Portofolio Karya Margasera Photography',
    description: 'Galeri portofolio fotografi sinematik dan editorial untuk wedding, pre-wedding story, couple, portrait, dan graduation di Pamekasan, Madura.',
    url: 'https://margasera.id/work',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: projects.map((p, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        url: `https://margasera.id/work/${p.slug}`,
        name: p.title,
      })),
    },
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pt-8 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="text-center max-w-3xl mx-auto px-6 mb-8">
        <span className="text-xs font-semibold tracking-[0.3em] uppercase text-[#0066CC]">
          Editorial Gallery
        </span>
        <h1 className="font-serif-editorial text-4xl sm:text-6xl text-zinc-100 font-light tracking-wide uppercase mt-2">
          Portofolio Karya
        </h1>
        <p className="text-sm text-zinc-400 font-light leading-relaxed mt-4">
          Jelajahi koleksi momen-momen terbaik di Pamekasan, Madura, dan sekitarnya yang kami abadikan dalam harmoni estetika sinematik, pencahayaan dramatis, dan komposisi editorial.
        </p>
      </div>

      <FeaturedWorks initialProjects={projects} initialServices={services} />
    </div>
  );
}

import React from 'react';
import { FeaturedWorks } from '@/components/gallery/featured-works';

export const metadata = {
  title: 'Portofolio Gallery - Margasera Photography',
  description: 'Galeri portofolio photography editorial untuk wedding, pre-wedding, couple, portrait, dan event di Medan.',
};

export default function WorkPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pt-8 pb-20">
      <div className="text-center max-w-3xl mx-auto px-6 mb-8">
        <span className="text-xs font-semibold tracking-[0.3em] uppercase text-amber-400">
          Editorial Gallery
        </span>
        <h1 className="font-serif-editorial text-4xl sm:text-6xl text-zinc-100 font-light tracking-wide uppercase mt-2">
          Portofolio Karya
        </h1>
        <p className="text-sm text-zinc-400 font-light leading-relaxed mt-4">
          Jelajahi koleksi momen-momen terbaik yang kami abadikan dalam harmoni estetika sinematik, pencahayaan dramatis, dan komposisi editorial.
        </p>
      </div>

      <FeaturedWorks />
    </div>
  );
}

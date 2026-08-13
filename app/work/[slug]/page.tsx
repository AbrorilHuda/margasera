import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getGalleryProjectBySlug } from '@/lib/actions/gallery';
import { MapPin, Calendar, ArrowLeft, Camera } from 'lucide-react';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const project = await getGalleryProjectBySlug(resolvedParams.slug);
  if (!project) return { title: 'Portofolio - Margasera Photography' };
  return {
    title: `${project.title} - Margasera Photography`,
    description: project.description,
  };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const project = await getGalleryProjectBySlug(resolvedParams.slug);

  if (!project) notFound();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pt-8 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
      {/* Back Button */}
      <div className="mb-8">
        <Link
          href="/work"
          className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-[#0066CC] hover:text-[#0052A3] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Portofolio</span>
        </Link>
      </div>

      {/* Project Header */}
      <div className="flex flex-col gap-4 mb-12 border-b border-zinc-900 pb-8">
        <span className="px-3 py-1 bg-[#0066CC]/10 border border-[#0066CC]/30 text-[#0066CC] text-[10px] tracking-[0.25em] uppercase w-max">
          {project.categoryLabel}
        </span>

        <h1 className="font-serif-editorial text-4xl sm:text-6xl text-zinc-100 font-light tracking-wide uppercase">
          {project.title}
        </h1>

        <div className="flex items-center gap-6 text-xs text-zinc-400 font-light">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#0066CC]" />
            {project.location}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#0066CC]" />
            {project.eventDate}
          </span>
        </div>

        <p className="text-sm text-zinc-300 font-light max-w-3xl leading-relaxed mt-2">
          {project.description}
        </p>
      </div>

      {/* Hero Cover Image */}
      <div className="relative w-full h-[520px] mb-12 border border-zinc-800">
        <Image
          src={project.coverImage}
          alt={project.title}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      </div>

      {/* Editorial Photo Stream Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {project.images?.map((img, idx) => (
          <div
            key={img.id || idx}
            className={`relative border border-zinc-800 bg-zinc-900 ${img.aspectRatio === 'landscape' ? 'md:col-span-2 h-[500px]' : 'h-[600px]'
              }`}
          >
            <Image
              src={img.imageUrl}
              alt={img.altText}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        ))}
      </div>

      {/* CTA Box */}
      <div className="mt-20 p-12 bg-zinc-900 border border-zinc-800 text-center flex flex-col items-center gap-4">
        <h3 className="font-serif-editorial text-3xl text-zinc-100 font-light">
          Tertarik Menyusun Konsep Sesi Foto Seperti Ini?
        </h3>
        <p className="text-xs text-zinc-400 font-light max-w-lg">
          Kami siap mengabadikan momen berharga Anda dengan sentuhan visual eksklusif Marga Sera.
        </p>
        <Link
          href={`/booking?serviceId=${project.category}`}
          className="mt-2 px-8 py-4 bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-semibold tracking-widest uppercase transition-colors shadow-[0_0_20px_rgba(0,102,204,0.3)]"
        >
          Pesan Sesi {project.categoryLabel} Sekarang
        </Link>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Camera, ArrowRight, Eye, MapPin, Calendar as CalendarIcon } from 'lucide-react';
import { MOCK_PROJECTS } from '@/lib/mock-data';
import { GalleryProject, ServiceCategory } from '@/lib/types';
import { Lightbox } from './lightbox';

export function FeaturedWorks({ limit }: { limit?: number }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeProject, setActiveProject] = useState<GalleryProject | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const categories = [
    { id: 'all', label: 'Semua Karya' },
    { id: 'wedding', label: 'Wedding' },
    { id: 'pre-wedding', label: 'Pre-Wedding' },
    { id: 'couple', label: 'Couple' },
    { id: 'portrait', label: 'Portrait' },
  ];

  const filteredProjects = selectedCategory === 'all'
    ? MOCK_PROJECTS
    : MOCK_PROJECTS.filter((p) => p.category === selectedCategory);

  const displayedProjects = limit ? filteredProjects.slice(0, limit) : filteredProjects;

  const openLightboxForProject = (project: GalleryProject, imageIndex = 0) => {
    setActiveProject(project);
    setLightboxIndex(imageIndex);
    setLightboxOpen(true);
  };

  return (
    <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
      {/* Section Title Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
        <div>
          <span className="text-xs font-semibold tracking-[0.3em] uppercase text-[#0066CC]">
            Selected Portfolio
          </span>
          <h2 className="font-serif-editorial text-4xl sm:text-6xl text-zinc-100 font-light tracking-wide uppercase mt-2">
            Karya Unggulan
          </h2>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 text-xs tracking-widest uppercase transition-all duration-300 rounded-none whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-[#0066CC] text-white font-semibold shadow-[0_0_15px_rgba(0,102,204,0.3)]'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Asymmetric Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {displayedProjects.map((project, idx) => {
          // Asymmetric column widths for editorial visual variation
          const colSpan = idx % 3 === 0 ? 'md:col-span-8' : idx % 3 === 1 ? 'md:col-span-4' : 'md:col-span-12';
          const heightClass = idx % 3 === 0 ? 'h-[480px]' : idx % 3 === 1 ? 'h-[480px]' : 'h-[540px]';

          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: idx * 0.15 }}
              className={`group relative overflow-hidden bg-zinc-900 ${colSpan} ${heightClass} border border-zinc-800/80 cursor-pointer`}
            >
              {/* Cover Image */}
              <Image
                src={project.coverImage}
                alt={project.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-center img-editorial filter brightness-90 group-hover:brightness-100"
              />

              {/* Gradient Vignette & Content */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-85 group-hover:opacity-95 transition-opacity duration-500 flex flex-col justify-between p-8">
                {/* Category Tag */}
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-[10px] tracking-[0.25em] uppercase text-[#0066CC] border border-[#0066CC]/30">
                    {project.categoryLabel}
                  </span>
                  <button
                    onClick={() => openLightboxForProject(project, 0)}
                    className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-zinc-700 flex items-center justify-center text-zinc-300 group-hover:text-[#0066CC] group-hover:border-[#0066CC] transition-colors"
                    aria-label="Buka Fullscreen Lightbox"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

                {/* Project Info */}
                <div className="flex flex-col gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="flex items-center gap-4 text-xs text-zinc-400 font-light">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#0066CC]" />
                      {project.location}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="w-3.5 h-3.5 text-[#0066CC]" />
                      {project.eventDate}
                    </span>
                  </div>

                  <h3 className="font-serif-editorial text-2xl md:text-3xl text-zinc-100 font-light group-hover:text-[#0066CC] transition-colors">
                    {project.title}
                  </h3>

                  <p className="text-xs text-zinc-400 line-clamp-2 font-light max-w-xl">
                    {project.description}
                  </p>

                  <div className="pt-2 flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-[#0066CC]">
                    <span>Lihat Detail Project</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* View All Button */}
      {limit && (
        <div className="mt-16 text-center">
          <Link
            href="/work"
            className="inline-flex items-center gap-3 px-8 py-4 bg-zinc-900 border border-zinc-800 hover:border-[#0066CC] text-zinc-200 hover:text-[#0066CC] text-xs font-semibold tracking-[0.25em] uppercase transition-all duration-300"
          >
            <Camera className="w-4 h-4" />
            <span>Jelajahi Seluruh Galeri Portofolio ({MOCK_PROJECTS.length} Project)</span>
          </Link>
        </div>
      )}

      {/* Lightbox Modal */}
      {activeProject && (
        <Lightbox
          images={activeProject.images || [{ id: '1', projectId: activeProject.id, imageUrl: activeProject.coverImage, altText: activeProject.title, sortOrder: 1 }]}
          currentIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          onNavigate={(idx) => setLightboxIndex(idx)}
          projectTitle={activeProject.title}
          projectLocation={activeProject.location}
          projectDate={activeProject.eventDate}
        />
      )}
    </section>
  );
}

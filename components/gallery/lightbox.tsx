'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, MapPin, Calendar, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { GalleryImage } from '@/lib/types';

interface LightboxProps {
  images: GalleryImage[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
  projectTitle?: string;
  projectSlug?: string;
  projectLocation?: string;
  projectDate?: string;
}

export function Lightbox({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
  projectTitle,
  projectSlug,
  projectLocation,
  projectDate,
}: LightboxProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];

  const handleNext = () => {
    onNavigate((currentIndex + 1) % images.length);
  };

  const handlePrev = () => {
    onNavigate((currentIndex - 1 + images.length) % images.length);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-3.5 sm:p-6 md:p-8"
      >
        {/* Top Header Controls */}
        <div className="flex items-center justify-between z-10 w-full max-w-7xl mx-auto gap-3">
          <div className="flex flex-col min-w-0">
            <h3 className="font-serif-editorial text-base sm:text-2xl text-zinc-100 font-light tracking-wide truncate">
              {projectTitle || 'Marga Sera Gallery'}
            </h3>
            <div className="flex items-center gap-3 text-[11px] sm:text-xs text-zinc-400 font-light mt-0.5 sm:mt-1">
              {projectLocation && (
                <span className="flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3 text-[#0066CC] shrink-0" />
                  {projectLocation}
                </span>
              )}
              {projectDate && (
                <span className="flex items-center gap-1 shrink-0">
                  <Calendar className="w-3 h-3 text-[#0066CC] shrink-0" />
                  {projectDate}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {projectSlug && (
              <Link
                href={`/work/${projectSlug}`}
                onClick={onClose}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[#0066CC] hover:bg-[#0052A3] text-white text-[10px] sm:text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5 shadow-md"
              >
                <span className="hidden sm:inline">Halaman Album</span>
                <span className="sm:hidden">Album</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
            <button
              onClick={onClose}
              className="p-2.5 sm:p-3 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-[#0066CC] transition-colors focus:outline-none"
              aria-label="Tutup Lightbox"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Main Center Image Container */}
        <div className="relative flex-1 w-full max-w-6xl mx-auto my-2 sm:my-4 flex items-center justify-center">
          {images.length > 1 && (
            <button
              onClick={handlePrev}
              className="absolute left-1 sm:left-4 md:left-6 z-20 p-2.5 sm:p-3 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-300 hover:text-[#0066CC] hover:border-[#0066CC] transition-all focus:outline-none"
              aria-label="Foto Sebelumnya"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}

          <motion.div
            key={currentImage.id || currentIndex}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3 }}
            className="relative w-full h-full max-h-[75vh] flex items-center justify-center"
          >
            <Image
              src={currentImage.imageUrl}
              alt={currentImage.altText || projectTitle || 'Photography Photo'}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </motion.div>

          {images.length > 1 && (
            <button
              onClick={handleNext}
              className="absolute right-1 sm:right-4 md:right-6 z-20 p-2.5 sm:p-3 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-300 hover:text-[#0066CC] hover:border-[#0066CC] transition-all focus:outline-none"
              aria-label="Foto Selanjutnya"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}
        </div>

        {/* Bottom Footer Info */}
        <div className="flex items-center justify-between text-[11px] sm:text-xs text-zinc-400 max-w-7xl mx-auto w-full pt-3 sm:pt-4 border-t border-zinc-900">
          <p className="font-light truncate max-w-xs sm:max-w-md">
            {currentImage.altText || 'Marga Sera Photography Editorial Collection'}
          </p>
          <span className="font-mono text-[#0066CC]">
            {currentIndex + 1} / {images.length}
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

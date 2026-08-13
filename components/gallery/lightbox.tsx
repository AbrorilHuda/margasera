'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, MapPin, Calendar } from 'lucide-react';
import { GalleryImage } from '@/lib/types';

interface LightboxProps {
  images: GalleryImage[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
  projectTitle?: string;
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
        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-4 md:p-8"
      >
        {/* Top Header Controls */}
        <div className="flex items-center justify-between z-10 w-full max-w-7xl mx-auto">
          <div className="flex flex-col">
            <h3 className="font-serif-editorial text-xl sm:text-2xl text-zinc-100 font-light tracking-wide">
              {projectTitle || 'Marga Sera Gallery'}
            </h3>
            <div className="flex items-center gap-4 text-xs text-zinc-400 font-light mt-1">
              {projectLocation && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#0066CC]" />
                  {projectLocation}
                </span>
              )}
              {projectDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#0066CC]" />
                  {projectDate}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-3 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-[#0066CC] transition-colors focus:outline-none"
            aria-label="Tutup Lightbox"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Main Center Image Container */}
        <div className="relative flex-1 w-full max-w-6xl mx-auto my-4 flex items-center justify-center">
          {images.length > 1 && (
            <button
              onClick={handlePrev}
              className="absolute left-2 md:left-6 z-20 p-3 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-300 hover:text-[#0066CC] hover:border-[#0066CC] transition-all focus:outline-none"
              aria-label="Foto Sebelumnya"
            >
              <ChevronLeft className="w-6 h-6" />
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
              className="absolute right-2 md:right-6 z-20 p-3 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-300 hover:text-[#0066CC] hover:border-[#0066CC] transition-all focus:outline-none"
              aria-label="Foto Selanjutnya"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Bottom Footer Info */}
        <div className="flex items-center justify-between text-xs text-zinc-400 max-w-7xl mx-auto w-full pt-4 border-t border-zinc-900">
          <p className="font-light truncate max-w-md">
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

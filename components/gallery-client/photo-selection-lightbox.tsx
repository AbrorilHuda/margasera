'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { ClientGalleryPhoto } from '@/lib/types';

interface PhotoSelectionLightboxProps {
  photos: ClientGalleryPhoto[];
  currentPhoto: ClientGalleryPhoto | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (photo: ClientGalleryPhoto) => void;
  selectedPhotoIds: Set<string>;
  onToggleSelect: (photoId: string) => void;
  maxSelectCount: number;
}

export function PhotoSelectionLightbox({
  photos,
  currentPhoto,
  isOpen,
  onClose,
  onNavigate,
  selectedPhotoIds,
  onToggleSelect,
  maxSelectCount,
}: PhotoSelectionLightboxProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || !currentPhoto) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentPhoto, photos]);

  if (!isOpen || !currentPhoto) return null;

  const currentIndex = photos.findIndex((p) => p.id === currentPhoto.id);
  const isSelected = selectedPhotoIds.has(currentPhoto.id);
  const isMaxReached = selectedPhotoIds.size >= maxSelectCount && !isSelected;

  const handleNext = () => {
    if (currentIndex < photos.length - 1) {
      onNavigate(photos[currentIndex + 1]);
    } else {
      onNavigate(photos[0]);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      onNavigate(photos[currentIndex - 1]);
    } else {
      onNavigate(photos[photos.length - 1]);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-between"
      >
        {/* Top Bar Controls */}
        <div className="flex items-center justify-between p-4 sm:p-6 z-20 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm sm:text-base text-zinc-100 font-medium">
              {currentPhoto.fileName}
            </span>
            <span className="text-xs text-zinc-500 font-mono">
              ({currentIndex + 1} / {photos.length})
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Tutup Pratinjau Foto"
            className="p-2 sm:p-2.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Center Main Image & Navigation Buttons */}
        <div className="relative flex-1 w-full max-w-6xl mx-auto flex items-center justify-center px-2 sm:px-8">
          {photos.length > 1 && (
            <button
              onClick={handlePrev}
              aria-label="Foto Sebelumnya"
              className="absolute left-2 sm:left-4 z-20 p-2.5 sm:p-3 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-300 hover:text-white hover:border-[#0066CC] transition-all"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}

          <motion.div
            key={currentPhoto.id}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            className="relative w-full h-[65vh] sm:h-[75vh] flex items-center justify-center"
          >
            <Image
              src={currentPhoto.url}
              alt={currentPhoto.fileName}
              fill
              className="object-contain"
              sizes="100vw"
              priority
              unoptimized
            />
          </motion.div>

          {photos.length > 1 && (
            <button
              onClick={handleNext}
              aria-label="Foto Selanjutnya"
              className="absolute right-2 sm:right-4 z-20 p-2.5 sm:p-3 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-300 hover:text-white hover:border-[#0066CC] transition-all"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}
        </div>

        {/* Bottom Action Bar: Toggle Selection inside Lightbox */}
        <div className="p-4 sm:p-6 z-20 border-t border-zinc-900 bg-zinc-950/80 backdrop-blur-md">
          <div className="max-w-md mx-auto flex items-center justify-center gap-3">
            <button
              onClick={() => onToggleSelect(currentPhoto.id)}
              disabled={isMaxReached}
              className={`w-full py-3 px-6 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                isSelected
                  ? 'bg-[#0066CC] hover:bg-[#0052A3] text-white shadow-[#0066CC]/40 border border-white/20'
                  : isMaxReached
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 shadow-md'
              }`}
            >
              {isSelected ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Foto Terpilih (Ketuk untuk Batal)</span>
                </>
              ) : isMaxReached ? (
                <span>Batas Maksimal Terpenuhi ({maxSelectCount} foto)</span>
              ) : (
                <span>+ Pilih Foto Ini</span>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

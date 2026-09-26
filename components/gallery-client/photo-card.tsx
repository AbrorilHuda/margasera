'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Check, Maximize2 } from 'lucide-react';
import { ClientGalleryPhoto } from '@/lib/types';

interface PhotoCardProps {
  photo: ClientGalleryPhoto;
  isSelected: boolean;
  onToggleSelect: (photoId: string) => void;
  onOpenLightbox: (photo: ClientGalleryPhoto) => void;
  isMaxReached: boolean;
}

export function PhotoCard({
  photo,
  isSelected,
  onToggleSelect,
  onOpenLightbox,
  isMaxReached,
}: PhotoCardProps) {
  // Determine aspect ratio from photo prop or natural image dimensions
  const [aspect, setAspect] = useState<'landscape' | 'portrait' | 'square'>(
    photo.aspectRatio || 'landscape'
  );

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (naturalWidth && naturalHeight) {
      if (naturalWidth / naturalHeight >= 1.15) {
        setAspect('landscape');
      } else if (naturalHeight / naturalWidth >= 1.15) {
        setAspect('portrait');
      } else {
        setAspect('square');
      }
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSelect(photo.id);
  };

  const handlePhotoClick = () => {
    onOpenLightbox(photo);
  };

  const aspectClass =
    aspect === 'landscape'
      ? 'aspect-[3/2]'
      : aspect === 'portrait'
      ? 'aspect-[2/3]'
      : 'aspect-square';

  return (
    <div
      onClick={handlePhotoClick}
      className={`group relative overflow-hidden rounded-xl border cursor-pointer transition-all duration-300 ${
        isSelected
          ? 'border-[#0066CC] shadow-md shadow-[#0066CC]/20'
          : 'border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-400 dark:hover:border-zinc-600 shadow-xs'
      } bg-zinc-100 dark:bg-zinc-900`}
    >
      {/* Strict Aspect Ratio Container — Edge-to-Edge Image, Zero White Space */}
      <div className={`relative w-full ${aspectClass} overflow-hidden bg-zinc-200 dark:bg-zinc-800`}>
        <Image
          src={photo.thumbnailUrl || photo.url}
          alt={photo.fileName}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onLoad={handleImageLoad}
        />

        {/* High-Contrast Bottom Vignette for Filename Legibility in Light Mode */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />

        {/* Top-Right: Sleek, Minimalist Checklist Button (Thumb-Friendly Target 44x44px) */}
        <div className="absolute top-1 right-1 z-10">
          <button
            type="button"
            onClick={handleCheckboxClick}
            aria-label={isSelected ? `Batalkan pilihan ${photo.fileName}` : `Pilih ${photo.fileName}`}
            className="w-11 h-11 flex items-center justify-center focus:outline-none"
          >
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                isSelected
                  ? 'bg-[#0066CC] text-white shadow-md shadow-[#0066CC]/50 scale-105 border border-white/40'
                  : isMaxReached
                  ? 'bg-black/50 text-zinc-500 border border-zinc-600/50'
                  : 'bg-black/40 hover:bg-black/60 text-white/90 border border-white/70 hover:border-white shadow-sm'
              }`}
            >
              {isSelected ? (
                <Check className="w-4 h-4 stroke-[2.5]" />
              ) : (
                <div className="w-2.5 h-2.5 rounded-full border border-white/50" />
              )}
            </div>
          </button>
        </div>

        {/* Bottom-Left: File Name Badge — High-Contrast in Light & Dark Mode */}
        <div className="absolute bottom-2 left-2 z-10 pointer-events-none">
          <span className="inline-block px-2.5 py-1 rounded-md bg-zinc-950/85 backdrop-blur-md text-[11px] font-mono text-white font-medium border border-white/20 tracking-wider shadow-md">
            {photo.fileName}
          </span>
        </div>

        {/* Bottom-Right: Quick Zoom Button */}
        <div className="absolute bottom-2 right-2 z-10 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="p-1.5 rounded-md bg-zinc-950/75 backdrop-blur-md text-white/90 hover:text-white border border-white/20 flex items-center justify-center shadow-md">
            <Maximize2 className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
}

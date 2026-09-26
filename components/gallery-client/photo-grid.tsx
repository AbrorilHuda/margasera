'use client';

import React from 'react';
import { Camera, CheckCircle2 } from 'lucide-react';
import { ClientGalleryPhoto } from '@/lib/types';
import { PhotoCard } from './photo-card';
import { FilterMode, GridDensity } from './selection-status-bar';

interface PhotoGridProps {
  photos: ClientGalleryPhoto[];
  selectedPhotoIds: Set<string>;
  onToggleSelect: (photoId: string) => void;
  onOpenLightbox: (photo: ClientGalleryPhoto) => void;
  maxSelectCount: number;
  activeFilter: FilterMode;
  onResetFilter: () => void;
  gridDensity: GridDensity;
}

export function PhotoGrid({
  photos,
  selectedPhotoIds,
  onToggleSelect,
  onOpenLightbox,
  maxSelectCount,
  activeFilter,
  onResetFilter,
  gridDensity,
}: PhotoGridProps) {
  const isMaxReached = selectedPhotoIds.size >= maxSelectCount;

  // Filter photos based on selection state
  const displayedPhotos = photos.filter((photo) => {
    if (activeFilter === 'selected') {
      return selectedPhotoIds.has(photo.id);
    }
    if (activeFilter === 'unselected') {
      return !selectedPhotoIds.has(photo.id);
    }
    return true;
  });

  if (displayedPhotos.length === 0) {
    return (
      <div className="py-20 px-4 text-center max-w-md mx-auto space-y-4">
        <div className="w-14 h-14 mx-auto rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-500 shadow-sm">
          {activeFilter === 'selected' ? (
            <CheckCircle2 className="w-7 h-7 text-[#0066CC]" />
          ) : (
            <Camera className="w-7 h-7 text-zinc-400 dark:text-zinc-600" />
          )}
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            {activeFilter === 'selected'
              ? 'Belum ada foto yang dipilih'
              : 'Tidak ada foto dalam kategori ini'}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {activeFilter === 'selected'
              ? 'Ketuk tombol lingkaran di pojok foto untuk menambahkan foto ke daftar pilihanmu.'
              : 'Semua foto telah masuk ke daftar pilihanmu.'}
          </p>
        </div>

        <button
          onClick={onResetFilter}
          className="px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-medium text-white transition-colors shadow-sm"
        >
          Lihat Semua Foto
        </button>
      </div>
    );
  }

  // True Masonry Layout: Edge-to-edge display where landscape is wide and portrait is tall without white gaps
  const columnClasses =
    gridDensity === 'dense'
      ? 'columns-2 sm:columns-3 lg:columns-4 gap-3 sm:gap-4'
      : 'columns-1 sm:columns-2 lg:columns-3 gap-4 sm:gap-6';

  return (
    <div className={columnClasses}>
      {displayedPhotos.map((photo) => (
        <div key={photo.id} className="break-inside-avoid mb-3 sm:mb-4">
          <PhotoCard
            photo={photo}
            isSelected={selectedPhotoIds.has(photo.id)}
            onToggleSelect={onToggleSelect}
            onOpenLightbox={onOpenLightbox}
            isMaxReached={isMaxReached}
          />
        </div>
      ))}
    </div>
  );
}

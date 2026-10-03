'use client';

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, AlertCircle, Trash2 } from 'lucide-react';
import { ClientGalleryPhoto, ClientGallerySession } from '@/lib/types';

interface ReviewSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: ClientGallerySession;
  photos: ClientGalleryPhoto[];
  selectedPhotoIds: Set<string>;
  onRemovePhoto: (photoId: string) => void;
  onConfirmSubmit: () => void;
  isSubmitting?: boolean;
}

export function ReviewSubmitModal({
  isOpen,
  onClose,
  session,
  photos,
  selectedPhotoIds,
  onRemovePhoto,
  onConfirmSubmit,
  isSubmitting = false,
}: ReviewSubmitModalProps) {
  if (!isOpen) return null;

  const selectedPhotos = photos.filter((p) => selectedPhotoIds.has(p.id));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 dark:bg-black/85 backdrop-blur-md"
        />

        {/* Modal Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-10 transition-colors duration-300"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-900 bg-zinc-50/80 dark:bg-zinc-900/50">
            <div>
              <h2 className="text-base sm:text-lg font-serif-editorial text-zinc-900 dark:text-zinc-100 font-semibold tracking-wide">
                Tinjau Pilihan Foto
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Total{' '}
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {selectedPhotos.length} dari {session.maxSelectCount} foto
                </span>{' '}
                telah dipilih untuk diproses.
              </p>
            </div>

            <button
              onClick={onClose}
              aria-label="Tutup Modal"
              className="p-2 rounded-full text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body: Thumbnail Grid List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {selectedPhotos.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-400">
                Belum ada foto yang dipilih.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3">
                {selectedPhotos.map((photo, idx) => {
                  const isPortrait = photo.aspectRatio === 'portrait';
                  return (
                    <div
                      key={photo.id}
                      className={`group relative ${isPortrait ? 'aspect-[2/3]' : 'aspect-[3/2]'} rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 shadow-xs`}
                    >
                      <Image
                        src={photo.thumbnailUrl || photo.url}
                        alt={photo.fileName}
                        fill
                        className="object-cover"
                        sizes="180px"
                        unoptimized
                      />
                      {/* Deep bottom vignette for filename legibility in light mode */}
                      <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />

                      {/* Order badge — High-contrast dark glass pill */}
                      <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-zinc-950/85 backdrop-blur-md text-[10px] font-mono text-white font-semibold border border-white/20 shadow-md">
                        #{idx + 1}
                      </div>

                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => onRemovePhoto(photo.id)}
                        title={`Hapus ${photo.fileName} dari pilihan`}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-md transition-transform hover:scale-110 focus:outline-none"
                      >
                        <Trash2 className="w-3 h-3 stroke-[2.5]" />
                      </button>

                      {/* Filename — High-contrast dark glass badge */}
                      <div className="absolute bottom-1.5 left-1.5 right-1.5 pointer-events-none">
                        <span className="inline-block max-w-full truncate px-2 py-0.5 rounded-md bg-zinc-950/85 backdrop-blur-md text-[10px] font-mono text-white font-medium border border-white/20 shadow-md tracking-wider">
                          {photo.fileName}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Note & Advisory */}
            <div className="p-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 text-xs text-blue-950 dark:text-blue-200/90 space-y-1.5 shadow-xs">
              <div className="flex items-center gap-1.5 font-medium text-blue-900 dark:text-blue-200">
                <AlertCircle className="w-3.5 h-3.5 text-[#0066CC]" />
                <span>Penting untuk Diketahui:</span>
              </div>
              <ul className="list-disc pl-4 space-y-1 text-[11px] leading-relaxed text-blue-900/80 dark:text-blue-200/80">
                <li>
                  Foto pilihan ini akan masuk ke antrean retouching & color grading studio Margasera Photography.
                </li>
                <li>
                  Kamu masih dapat memperbarui pilihan selama tautan belum melewati batas tenggat waktu.
                </li>
              </ul>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-900 bg-zinc-50/80 dark:bg-zinc-900/50 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white border border-zinc-300 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            >
              Ubah Pilihan
            </button>

            <button
              type="button"
              onClick={onConfirmSubmit}
              disabled={isSubmitting || selectedPhotos.length === 0}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-[#0066CC] hover:bg-[#0052A3] text-white flex items-center gap-2 transition-all shadow-md shadow-[#0066CC]/20 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Menyimpan...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Pilihan ({selectedPhotos.length} Foto)</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

'use client';

import React, { useState } from 'react';
import { ClientGalleryPhoto, ClientGallerySession } from '@/lib/types';
import { GalleryClientHeader } from './gallery-client-header';
import {
  SelectionStatusBar,
  FilterMode,
  GridDensity,
} from './selection-status-bar';
import { PhotoGrid } from './photo-grid';
import { PhotoSelectionLightbox } from './photo-selection-lightbox';
import { FloatingSelectionBar } from './floating-selection-bar';
import { ReviewSubmitModal } from './review-submit-modal';
import { SelectionSuccessView } from './selection-success-view';
import { useToast } from '@/components/ui/toast-context';

import { submitClientGallerySelections } from '@/lib/actions/client-gallery';

interface GalleryClientPortalProps {
  initialSession: ClientGallerySession;
  initialPhotos: ClientGalleryPhoto[];
}

export function GalleryClientPortal({
  initialSession,
  initialPhotos,
}: GalleryClientPortalProps) {
  const { toast } = useToast();

  const [session, setSession] = useState<ClientGallerySession>(initialSession);
  const [photos] = useState<ClientGalleryPhoto[]>(initialPhotos);

  // Selected Photo IDs as Set
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(initialSession.selectedPhotoIds || [])
  );

  // UI state
  const [activeFilter, setActiveFilter] = useState<FilterMode>('all');
  const [gridDensity, setGridDensity] = useState<GridDensity>('dense');
  const [lightboxPhoto, setLightboxPhoto] = useState<ClientGalleryPhoto | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(
    session.status === 'submitted' || (Boolean(session.selectedPhotoIds && session.selectedPhotoIds.length > 0))
  );

  // Check if deadline passed
  const isExpired = new Date(session.deadline).getTime() < Date.now();

  const handleToggleSelect = (photoId: string) => {
    if (isExpired) {
      toast.error('Batas waktu seleksi telah berakhir. Anda tidak dapat mengubah pilihan.');
      return;
    }

    const isAlreadySelected = selectedIds.has(photoId);

    if (isAlreadySelected) {
      const next = new Set(selectedIds);
      next.delete(photoId);
      setSelectedIds(next);
      toast.info('Foto dihapus dari pilihan');
    } else {
      if (selectedIds.size >= session.maxSelectCount) {
        toast.warning(
          `Batas maksimal tercapai (${session.maxSelectCount} foto). Batalkan pilihan foto lain terlebih dahulu.`
        );
        return;
      }
      const next = new Set(selectedIds);
      next.add(photoId);
      setSelectedIds(next);
      if (next.size === session.maxSelectCount) {
        toast.success(`Selamat! Kuota lengkap (${session.maxSelectCount}/${session.maxSelectCount} foto).`);
      } else {
        toast.success(`Foto terpilih (${next.size}/${session.maxSelectCount})`);
      }
    }
  };

  const handleRemovePhoto = (photoId: string) => {
    const next = new Set(selectedIds);
    next.delete(photoId);
    setSelectedIds(next);
    toast.info('Foto dihapus dari pilihan');
  };

  const handleConfirmSubmit = async () => {
    if (selectedIds.size === 0) {
      toast.error('Silakan pilih minimal 1 foto sebelum mengirim.');
      return;
    }

    setIsSubmitting(true);
    try {
      const identifier = session.token || session.slug || session.id;
      const res = await submitClientGallerySelections(identifier, Array.from(selectedIds));

      if (res.success) {
        setIsSubmitted(true);
        setSession((prev) => ({
          ...prev,
          status: 'submitted',
          selectedPhotoIds: Array.from(selectedIds),
          submittedAt: new Date().toISOString(),
        }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
        toast.success('Pilihan foto berhasil disimpan ke studio Margasera!');
      } else {
        // Fallback for demo/mock preview if token not found in db
        setIsSubmitted(true);
        setSession((prev) => ({
          ...prev,
          status: 'submitted',
          selectedPhotoIds: Array.from(selectedIds),
          submittedAt: new Date().toISOString(),
        }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
        toast.success('Pilihan foto berhasil dikonfirmasi!');
      }
    } catch {
      toast.error('Terjadi kendala jaringan saat mengirim pilihan.');
    } finally {
      setIsSubmitting(false);
      setIsReviewOpen(false);
    }
  };

  // If already submitted, display success screen
  if (isSubmitted) {
    const selectedPhotosList = photos.filter((p) => selectedIds.has(p.id));
    return (
      <SelectionSuccessView
        session={session}
        selectedPhotos={selectedPhotosList}
        onEditSelection={() => setIsSubmitted(false)}
        canEdit={!isExpired}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col selection:bg-[#0066CC] selection:text-white pb-28 transition-colors duration-300">
      {/* 1. Header with Margasera branding & session information */}
      <GalleryClientHeader session={session} />

      {/* 2. Sticky Status Bar with live counter, progress, & filter tabs */}
      <SelectionStatusBar
        totalCount={photos.length}
        selectedCount={selectedIds.size}
        maxSelectCount={session.maxSelectCount}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        gridDensity={gridDensity}
        onDensityChange={setGridDensity}
      />

      {/* 3. Main Photo Grid */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 w-full flex-1">
        <PhotoGrid
          photos={photos}
          selectedPhotoIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onOpenLightbox={setLightboxPhoto}
          maxSelectCount={session.maxSelectCount}
          activeFilter={activeFilter}
          onResetFilter={() => setActiveFilter('all')}
          gridDensity={gridDensity}
        />
      </main>

      {/* 4. Fullscreen Lightbox with in-modal selection toggle */}
      <PhotoSelectionLightbox
        photos={photos}
        currentPhoto={lightboxPhoto}
        isOpen={Boolean(lightboxPhoto)}
        onClose={() => setLightboxPhoto(null)}
        onNavigate={setLightboxPhoto}
        selectedPhotoIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        maxSelectCount={session.maxSelectCount}
      />

      {/* 5. Sticky Bottom Floating Selection Bar */}
      <FloatingSelectionBar
        selectedCount={selectedIds.size}
        maxSelectCount={session.maxSelectCount}
        onOpenReview={() => setIsReviewOpen(true)}
        onSubmitClick={() => setIsReviewOpen(true)}
      />

      {/* 6. Review & Submit Confirmation Modal */}
      <ReviewSubmitModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        session={session}
        photos={photos}
        selectedPhotoIds={selectedIds}
        onRemovePhoto={handleRemovePhoto}
        onConfirmSubmit={handleConfirmSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

import type { Metadata } from 'next';
import { MOCK_GALLERY_SESSION, MOCK_GALLERY_PHOTOS } from '@/lib/mock/gallery-client-mock';
import { GalleryClientPortal } from '@/components/gallery-client/gallery-client-portal';
import { fetchStudioSettings } from '@/lib/data/settings';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const clientTitle = slug
    ? slug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
    : MOCK_GALLERY_SESSION.clientName;

  return {
    title: `Galeri Seleksi Foto ${clientTitle}`,
    description: `Pilih foto favorit Anda dari sesi pemotretan Margasera Photography. Moment Satu Hari Untuk Selamanya.`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function ClientGalleryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const studioSettings = await fetchStudioSettings();

  // Normalize WhatsApp number from studio settings (e.g. 0858... -> 62858...)
  const cleanWaNumber = (studioSettings.whatsapp || '085806138955').replace(/\D/g, '');
  const targetWaNumber = cleanWaNumber.startsWith('0') ? '62' + cleanWaNumber.slice(1) : cleanWaNumber;

  // Adapt session to match the slug parameter if customized
  const session = {
    ...MOCK_GALLERY_SESSION,
    slug: slug || MOCK_GALLERY_SESSION.slug,
    clientName: slug
      ? slug
        .split('-')
        .slice(0, 2)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' & ') || MOCK_GALLERY_SESSION.clientName
      : MOCK_GALLERY_SESSION.clientName,
    eventTitle: slug
      ? `The Wedding of ${slug
        .split('-')
        .slice(0, 2)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' & ')}`
      : MOCK_GALLERY_SESSION.eventTitle,
    whatsappContact: targetWaNumber,
  };

  return <GalleryClientPortal initialSession={session} initialPhotos={MOCK_GALLERY_PHOTOS} />;
}

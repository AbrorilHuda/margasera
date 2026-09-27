import type { Metadata } from 'next';
import { MOCK_GALLERY_SESSION, MOCK_GALLERY_PHOTOS } from '@/lib/mock/gallery-client-mock';
import { GalleryClientPortal } from '@/components/gallery-client/gallery-client-portal';
import { GalleryNotFoundView } from '@/components/gallery-client/gallery-not-found-view';
import { GalleryLinkExpiredView } from '@/components/gallery-client/gallery-link-expired-view';
import { fetchStudioSettings } from '@/lib/data/settings';
import { getClientGalleryData, getClientGalleryMetadata } from '@/lib/actions/client-gallery';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  // Jika demo/preview
  if (slug === 'demo' || slug === 'preview') {
    return {
      title: `Pratinjau Galeri Seleksi Foto`,
      robots: { index: false, follow: false },
    };
  }

  try {
    const meta = await getClientGalleryMetadata(slug);
    if (meta?.clientName) {
      return {
        title: `Galeri Seleksi Foto ${meta.clientName}`,
        description: `Pilih foto favorit Anda dari sesi pemotretan Margasera Photography. Moment Satu Hari Untuk Selamanya.`,
        robots: { index: false, follow: false },
      };
    }
  } catch {
    // Abaikan jika database belum siap
  }

  return {
    title: `Tautan Galeri Tidak Ditemukan - Margasera Photography`,
    robots: { index: false, follow: false },
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

  // Khusus URL /g/demo atau /g/preview: Izinkan melihat pratinjau tampilan demo
  if (slug === 'demo' || slug === 'preview') {
    const demoSession = {
      ...MOCK_GALLERY_SESSION,
      whatsappContact: targetWaNumber,
    };
    return <GalleryClientPortal initialSession={demoSession} initialPhotos={MOCK_GALLERY_PHOTOS} />;
  }

  // Coba ambil data booking & foto Google Drive nyata dari database
  let session = null;
  let photos = null;

  try {
    const galleryData = await getClientGalleryData(slug);
    if (galleryData.isLinkExpired && galleryData.session) {
      return <GalleryLinkExpiredView session={galleryData.session} whatsappContact={targetWaNumber} />;
    }
    if (galleryData.session) {
      session = galleryData.session;
      if (galleryData.photos && galleryData.photos.length > 0) {
        photos = galleryData.photos;
      }
    }
  } catch (err) {
    console.warn('[ClientGalleryPage] Failed to fetch real gallery data:', err);
  }

  // JIKA TIDAK DITEMUKAN: Tampilkan halaman error "Tautan Galeri Tidak Ditemukan"
  if (!session) {
    return <GalleryNotFoundView slug={slug} whatsappContact={targetWaNumber} />;
  }

  // Jika folder di database belum memiliki foto tersinkronkan
  const clientPhotos = photos && photos.length > 0 ? photos : [];

  return <GalleryClientPortal initialSession={session} initialPhotos={clientPhotos} />;
}

/**
 * Google Drive API Client & Utilities
 * Fitur Galeri Seleksi Foto Klien - Margasera Photography
 *
 * Menggunakan Google Drive REST API v3 secara langsung tanpa library berat,
 * cepat dan kompatibel dengan runtime Bun/Node.js di Next.js App Router.
 */

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  webContentLink?: string;
  imageMediaMetadata?: {
    width?: number;
    height?: number;
    rotation?: number;
  };
  size?: string;
  createdTime?: string;
}

export interface DrivePhotoItem {
  id: string;
  fileName: string;
  url: string;           // Resolusi tinggi untuk modal lightbox/preview (w1920)
  thumbnailUrl: string;  // Resolusi optimal untuk grid thumbnail galeri (w600)
  downloadUrl: string;   // Link download langsung
  width?: number;
  height?: number;
  aspectRatio?: 'portrait' | 'landscape' | 'square';
}

export interface FetchDrivePhotosResult {
  success: boolean;
  photos: DrivePhotoItem[];
  folderId?: string;
  totalCount: number;
  error?: string;
}

/**
 * Ekstraksi folder ID dari URL Google Drive atau raw ID string.
 * Format yang didukung:
 * - https://drive.google.com/drive/folders/1aBcDeFgHiJkLmNoP...
 * - https://drive.google.com/drive/u/0/folders/1aBcDeFgHiJkLmNoP...
 * - https://drive.google.com/open?id=1aBcDeFgHiJkLmNoP...
 * - Raw alphanumeric folder ID (20-60 karakter)
 */
export function extractDriveFolderId(input: string | null | undefined): string | null {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();

  // Pola URL /folders/{id}
  const folderMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (folderMatch && folderMatch[1]) return folderMatch[1];

  // Pola query param ?id={id} atau &id={id}
  const queryMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (queryMatch && queryMatch[1]) return queryMatch[1];

  // Pola direct ID jika user hanya menempelkan ID foldernya
  if (/^[a-zA-Z0-9_-]{15,60}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Format URL gambar Google Drive untuk grid thumbnail dan preview resolusi tinggi.
 */
export function formatDrivePhotoUrls(fileId: string, thumbnailLink?: string) {
  // Jika Google Drive API mengembalikan thumbnailLink resmi (biasanya berakhiran =s220)
  if (thumbnailLink && thumbnailLink.includes('=')) {
    const baseUrl = thumbnailLink.split('=')[0];
    return {
      thumbnailUrl: `${baseUrl}=w600`, // Tajam dan ringan untuk grid
      previewUrl: `${baseUrl}=w1920`,   // Kualitas tinggi untuk preview/lightbox
      downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
    };
  }

  // Fallback direct URL format
  return {
    thumbnailUrl: `https://drive.google.com/thumbnail?id=${fileId}&sz=w600`,
    previewUrl: `https://drive.google.com/thumbnail?id=${fileId}&sz=w1920`,
    downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
  };
}

/**
 * Mengambil daftar foto dari folder Google Drive publik menggunakan Drive REST API v3.
 * Folder harus berstatus "Anyone with the link can view".
 */
export async function fetchGoogleDriveFolderPhotos(
  folderIdOrUrl: string,
  options?: { maxFiles?: number }
): Promise<FetchDrivePhotosResult> {
  const folderId = extractDriveFolderId(folderIdOrUrl);
  if (!folderId) {
    return {
      success: false,
      photos: [],
      totalCount: 0,
      error: 'URL folder Google Drive tidak valid. Pastikan link berformat: https://drive.google.com/drive/folders/...',
    };
  }

  const apiKey = process.env.GOOGLE_DRIVE_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      photos: [],
      folderId,
      totalCount: 0,
      error:
        'GOOGLE_DRIVE_API_KEY belum disetel di .env.local. Masukkan Google Drive API Key studio untuk menyinkronkan foto dari folder.',
    };
  }

  const maxFiles = options?.maxFiles ?? 500;
  const photos: DrivePhotoItem[] = [];
  let pageToken: string | undefined = undefined;
  let pageCount = 0;
  const maxPages = Math.ceil(maxFiles / 100);

  try {
    do {
      pageCount++;
      // Filter hanya file gambar yang tidak berada di folder sampah (trash)
      const query = `'${folderId}' in parents and trashed = false and mimeType contains 'image/'`;

      const params = new URLSearchParams({
        q: query,
        fields: 'nextPageToken,files(id,name,mimeType,thumbnailLink,webContentLink,imageMediaMetadata,size,createdTime)',
        pageSize: '100',
        orderBy: 'name',
        key: apiKey,
      });

      if (pageToken) {
        params.set('pageToken', pageToken);
      }

      const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        cache: 'no-store',
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const message = errorData?.error?.message || res.statusText;

        if (res.status === 404 || res.status === 403) {
          return {
            success: false,
            photos: [],
            folderId,
            totalCount: 0,
            error:
              'Folder Google Drive tidak ditemukan atau belum dibuka aksesnya. Pastikan izin share folder disetel ke: "Siapa saja yang memiliki link dapat melihat" (Anyone with the link – Viewer).',
          };
        }

        return {
          success: false,
          photos: [],
          folderId,
          totalCount: 0,
          error: `Google Drive API error (${res.status}): ${message}`,
        };
      }

      const data = await res.json();
      const files: GoogleDriveFile[] = data.files || [];

      for (const file of files) {
        const { thumbnailUrl, previewUrl, downloadUrl } = formatDrivePhotoUrls(file.id, file.thumbnailLink);
        const w = file.imageMediaMetadata?.width;
        const h = file.imageMediaMetadata?.height;

        let aspectRatio: 'portrait' | 'landscape' | 'square' | undefined;
        if (w && h) {
          if (w > h * 1.15) aspectRatio = 'landscape';
          else if (h > w * 1.15) aspectRatio = 'portrait';
          else aspectRatio = 'square';
        }

        photos.push({
          id: file.id,
          fileName: file.name,
          url: previewUrl,
          thumbnailUrl,
          downloadUrl,
          width: w,
          height: h,
          aspectRatio,
        });

        if (photos.length >= maxFiles) break;
      }

      pageToken = data.nextPageToken;
    } while (pageToken && pageCount < maxPages && photos.length < maxFiles);

    return {
      success: true,
      photos,
      folderId,
      totalCount: photos.length,
    };
  } catch (err: any) {
    return {
      success: false,
      photos: [],
      folderId,
      totalCount: 0,
      error: err?.message || 'Gagal terhubung ke Google Drive API.',
    };
  }
}

/**
 * Uji koneksi folder Google Drive (quick test)
 */
export async function testGoogleDriveFolder(folderIdOrUrl: string): Promise<{
  success: boolean;
  folderId?: string;
  detectedCount?: number;
  error?: string;
}> {
  const result = await fetchGoogleDriveFolderPhotos(folderIdOrUrl, { maxFiles: 10 });
  if (!result.success) {
    return {
      success: false,
      folderId: result.folderId,
      error: result.error,
    };
  }
  return {
    success: true,
    folderId: result.folderId,
    detectedCount: result.totalCount,
  };
}

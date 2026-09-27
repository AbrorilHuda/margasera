import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';
import { getClientGalleryData } from '@/lib/actions/client-gallery';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Izinkan proses zip berjalan hingga 60 detik jika foto banyak

/**
 * Fetch buffer gambar langsung dari Google Drive
 */
async function fetchPhotoBuffer(driveFileId: string): Promise<{ buffer: ArrayBuffer; ok: boolean }> {
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY;

  // 1. Coba via Google Drive REST API alt=media jika API key tersedia
  if (apiKey) {
    try {
      const res = await fetch(
        `https://www.googleapis.com/drive/v3/files/${driveFileId}?alt=media&key=${apiKey}`,
        { cache: 'no-store' }
      );
      if (res.ok) {
        const buffer = await res.arrayBuffer();
        if (buffer.byteLength > 0) {
          return { buffer, ok: true };
        }
      }
    } catch (e) {
      console.warn(`[Download ZIP] Error fetching from Drive API for ${driveFileId}:`, e);
    }
  }

  // 2. Fallback: Google user content proxy
  try {
    const res = await fetch(`https://lh3.googleusercontent.com/d/${driveFileId}`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const buffer = await res.arrayBuffer();
      if (buffer.byteLength > 0) {
        return { buffer, ok: true };
      }
    }
  } catch (e) {
    console.warn(`[Download ZIP] Fallback error for ${driveFileId}:`, e);
  }

  return { buffer: new ArrayBuffer(0), ok: false };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    if (!token) {
      return NextResponse.json({ error: 'Token galeri tidak valid.' }, { status: 400 });
    }

    // 1. Ambil data galeri
    const data = await getClientGalleryData(token);
    if (!data.session) {
      return NextResponse.json(
        { error: 'Galeri tidak ditemukan atau tautan sudah tidak aktif.' },
        { status: 404 }
      );
    }

    if (data.isLinkExpired) {
      return NextResponse.json(
        { error: 'Masa aktif tautan unduh (30 hari) telah berakhir. Silakan hubungi studio Margasera.' },
        { status: 410 }
      );
    }

    // 2. Cek izin unduh
    if (!data.session.allowDownload) {
      return NextResponse.json(
        { error: 'Unduh file foto belum diizinkan oleh studio untuk sesi ini.' },
        { status: 403 }
      );
    }

    // 3. Tentukan foto mana yang akan diunduh
    // Cek apakah ada query param ?ids=id1,id2
    const searchParams = request.nextUrl.searchParams;
    const requestedIdsParam = searchParams.get('ids');
    let targetIds: string[] = [];

    if (requestedIdsParam) {
      targetIds = requestedIdsParam.split(',').map((id) => id.trim()).filter(Boolean);
    } else {
      targetIds = data.selectedPhotoIds || [];
    }

    // Filter dari daftar foto galeri
    const photosToDownload = data.photos.filter((p) => targetIds.includes(p.id));

    if (photosToDownload.length === 0) {
      return NextResponse.json(
        { error: 'Tidak ada foto terpilih yang siap diunduh.' },
        { status: 400 }
      );
    }

    // 4. Siapkan zip & penanganan nama file unik
    const zip = new JSZip();
    const usedFileNames = new Set<string>();

    function getUniqueFileName(originalName: string, index: number): string {
      let name = (originalName || `Foto_${index + 1}`).trim();
      if (!/\.[a-zA-Z0-9]{3,4}$/.test(name)) {
        name += '.jpg';
      }
      let unique = name;
      let counter = 1;
      while (usedFileNames.has(unique.toLowerCase())) {
        const dotIdx = name.lastIndexOf('.');
        const base = dotIdx !== -1 ? name.slice(0, dotIdx) : name;
        const ext = dotIdx !== -1 ? name.slice(dotIdx) : '';
        unique = `${base}_${counter}${ext}`;
        counter++;
      }
      usedFileNames.add(unique.toLowerCase());
      return unique;
    }

    // 5. Unduh foto per batch 5 item bersamaan agar cepat dan hemat koneksi
    const BATCH_SIZE = 5;
    for (let i = 0; i < photosToDownload.length; i += BATCH_SIZE) {
      const chunk = photosToDownload.slice(i, i + BATCH_SIZE);
      await Promise.all(
        chunk.map(async (photo, idx) => {
          const { buffer, ok } = await fetchPhotoBuffer(photo.id);
          if (ok && buffer.byteLength > 0) {
            const fileName = getUniqueFileName(photo.fileName, i + idx);
            zip.file(fileName, buffer);
          }
        })
      );
    }

    // 6. Generate ZIP file
    const zipUint8 = await zip.generateAsync({
      type: 'uint8array',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    const safeClientName = (data.session.clientName || 'Foto_Pilihan')
      .replace(/[^a-zA-Z0-9_\-]/g, '_')
      .slice(0, 40);
    const zipFilename = `Foto_Pilihan_${safeClientName}_Margasera.zip`;

    return new NextResponse(zipUint8 as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${zipFilename}"`,
        'Content-Length': zipUint8.byteLength.toString(),
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('[API Gallery Download Error]:', error);
    return NextResponse.json(
      { error: error?.message || 'Gagal membuat file ZIP foto pilihan.' },
      { status: 500 }
    );
  }
}

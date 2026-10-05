'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/actions/admin';
import {
  fetchGoogleDriveFolderPhotos,
  testGoogleDriveFolder,
  type DrivePhotoItem,
} from '@/lib/google-drive';
import { fetchStudioSettings } from '@/lib/data/settings';
import type { ClientGallerySession, ClientGalleryPhoto } from '@/lib/types';
import { sendAdminNotification } from '@/lib/notifications';
import { checkRateLimit } from '@/lib/rate-limit';

/**
 * Hapus link Drive & semua foto cache + pilihan klien untuk sebuah booking.
 * Dipakai admin saat salah input folder Drive.
 */
export async function clearBookingGalleryDrive(
  bookingId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!(await requireAdmin())) return { success: false, error: 'Unauthorized' };
    const supabase = createAdminClient() as any;

    await supabase.from('gallery_selections').delete().eq('booking_id', bookingId);
    await supabase.from('gallery_files_cache').delete().eq('booking_id', bookingId);

    const { error } = await supabase
      .from('bookings')
      .update({
        drive_folder_url: null,
        drive_folder_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Gagal menghapus folder Drive.' };
  }
}

/**
 * Validasi dan uji koneksi folder Google Drive langsung dari link atau folder ID.
 */
export async function checkDriveFolderAction(
  urlOrId: string
): Promise<{ success: boolean; folderId?: string; detectedCount?: number; error?: string }> {
  try {
    if (!(await requireAdmin())) return { success: false, error: 'Unauthorized' };
    const res = await testGoogleDriveFolder(urlOrId);
    return res;
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Terjadi kesalahan saat memeriksa folder Google Drive.',
    };
  }
}

/**
 * Sinkronisasi foto dari Google Drive ke database Supabase (tabel gallery_files_cache)
 * Dipanggil oleh Admin dari Dashboard saat setup atau klik "Refresh Folder".
 */
export async function syncBookingGalleryFromDrive(
  bookingId: string
): Promise<{
  success: boolean;
  count?: number;
  photos?: DrivePhotoItem[];
  error?: string;
}> {
  try {
    if (!(await requireAdmin())) return { success: false, error: 'Unauthorized' };
    const supabase = createAdminClient();

    // 1. Ambil data booking untuk mendapatkan drive_folder_id / url
    const { data: booking, error: bErr } = await supabase
      .from('bookings')
      .select('id, customer_name, drive_folder_id, drive_folder_url')
      .eq('id', bookingId)
      .single();

    if (bErr || !booking) {
      return { success: false, error: 'Data booking tidak ditemukan.' };
    }

    const folderTarget = booking.drive_folder_id || booking.drive_folder_url;
    if (!folderTarget) {
      return {
        success: false,
        error: 'Link folder Google Drive belum diisi pada booking ini.',
      };
    }

    // 2. Tarik daftar foto dari Google Drive API
    const driveResult = await fetchGoogleDriveFolderPhotos(folderTarget);
    if (!driveResult.success) {
      return { success: false, error: driveResult.error };
    }

    const photos = driveResult.photos;

    // 3. Simpan ke gallery_files_cache di Supabase
    // Hapus cache lama untuk booking ini
    const { error: delErr } = await supabase
      .from('gallery_files_cache')
      .delete()
      .eq('booking_id', bookingId);
    if (delErr) {
      return { success: false, error: `Gagal menghapus cache lama: ${delErr.message}` };
    }

    // Deduplikasi foto dari drive sebelum insert
    const seenDriveIds = new Set<string>();
    const uniquePhotos = photos.filter((p) => {
      if (!p.id || seenDriveIds.has(p.id)) return false;
      seenDriveIds.add(p.id);
      return true;
    });

    // Insert foto-foto baru
    const rowsToInsert = uniquePhotos.map((p) => ({
      booking_id: bookingId,
      drive_file_id: p.id,
      file_name: p.fileName,
      thumbnail_link: p.thumbnailUrl,
      image_width: p.width || null,
      image_height: p.height || null,
      fetched_at: new Date().toISOString(),
    }));

    // Insert batch per 100 baris untuk efisiensi
    for (let i = 0; i < rowsToInsert.length; i += 100) {
      const { error: insErr } = await supabase
        .from('gallery_files_cache')
        .insert(rowsToInsert.slice(i, i + 100));
      if (insErr) {
        return { success: false, error: `Gagal menyimpan foto ke cache: ${insErr.message}` };
      }
    }

    return {
      success: true,
      count: photos.length,
      photos,
    };
  } catch (err: any) {
    console.error('Error syncing gallery from Google Drive:', err);
    return {
      success: false,
      error: err?.message || 'Gagal menyinkronkan foto dari Google Drive.',
    };
  }
}

/**
 * Mengambil daftar foto galeri untuk sebuah booking.
 * Mengutamakan membaca dari `gallery_files_cache`. Jika kosong dan folder terdaftar,
 * otomatis menyinkronkan dari Google Drive.
 */
export async function getGalleryPhotosForBooking(
  bookingId: string,
  options?: { forceRefresh?: boolean }
): Promise<ClientGalleryPhoto[]> {
  const supabase = createAdminClient();

  if (!options?.forceRefresh) {
    try {
      const { data: cached, error } = await supabase
        .from('gallery_files_cache')
        .select('*')
        .eq('booking_id', bookingId)
        .order('file_name', { ascending: true });

      if (!error && cached && cached.length > 0) {
        // Deduplikasi berdasarkan drive_file_id agar tidak pernah ada foto kembar
        const seenFileIds = new Set<string>();
        const uniqueCached = cached.filter((c: any) => {
          if (!c.drive_file_id || seenFileIds.has(c.drive_file_id)) return false;
          seenFileIds.add(c.drive_file_id);
          return true;
        });

        return uniqueCached.map((c: any) => {
          let aspectRatio: 'portrait' | 'landscape' | 'square' | undefined;
          if (c.image_width && c.image_height) {
            if (c.image_width > c.image_height * 1.15) aspectRatio = 'landscape';
            else if (c.image_height > c.image_width * 1.15) aspectRatio = 'portrait';
            else aspectRatio = 'square';
          }

          // Pastikan URL thumbnail & preview menggunakan format permanen anti-403
          let thumb = c.thumbnail_link || '';
          if (!thumb || thumb.includes('drive-storage')) {
            thumb = `https://lh3.googleusercontent.com/d/${c.drive_file_id}=w600`;
          }

          const previewUrl =
            !c.thumbnail_link || c.thumbnail_link.includes('drive-storage')
              ? `https://lh3.googleusercontent.com/d/${c.drive_file_id}=w1920`
              : thumb.replace(/=w\d+.*$/, '=w1920').replace(/=s\d+.*$/, '=w1920');

          return {
            id: c.drive_file_id,
            fileName: c.file_name,
            url: previewUrl || thumb,
            thumbnailUrl: thumb,
            width: c.image_width ?? undefined,
            height: c.image_height ?? undefined,
            aspectRatio,
          };
        });
      }
    } catch (err) {
      console.warn('[getGalleryPhotosForBooking] Cache read fallback:', err);
    }
  }

  // Jika cache kosong atau forceRefresh = true, coba sync dari Google Drive
  const syncRes = await syncBookingGalleryFromDrive(bookingId);
  if (syncRes.success && syncRes.photos) {
    const seen = new Set<string>();
    const uniquePhotos = syncRes.photos.filter((p) => {
      if (!p.id || seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });

    return uniquePhotos.map((p) => ({
      id: p.id,
      fileName: p.fileName,
      url: p.url,
      thumbnailUrl: p.thumbnailUrl,
      width: p.width,
      height: p.height,
      aspectRatio: p.aspectRatio,
    }));
  }

  return [];
}

/**
 * Lightweight metadata fetcher untuk generateMetadata() di Next.js
 * Hanya membaca customer_name dari bookings, tidak menyinkronkan foto Drive sehingga tidak memicu race condition.
 */
export async function getClientGalleryMetadata(
  slugOrToken: string
): Promise<{ clientName?: string } | null> {
  try {
    const supabase = createAdminClient();
    const cleaned = slugOrToken.trim();

    // 1. Exact match token
    const { data: byToken } = await supabase
      .from('bookings')
      .select('customer_name')
      .eq('gallery_token', cleaned)
      .maybeSingle();

    if (byToken) return { clientName: byToken.customer_name };

    // 2. Exact match slug
    const { data: bySlug } = await supabase
      .from('bookings')
      .select('customer_name')
      .eq('gallery_slug', cleaned)
      .maybeSingle();

    if (bySlug) return { clientName: bySlug.customer_name };

    // 3. Slug-token combo
    const parts = cleaned.split('-');
    if (parts.length > 1) {
      const potentialToken = parts[parts.length - 1];
      const { data: byTokenPart } = await supabase
        .from('bookings')
        .select('customer_name')
        .eq('gallery_token', potentialToken)
        .maybeSingle();

      if (byTokenPart) return { clientName: byTokenPart.customer_name };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Public Data Fetcher untuk halaman klien /g/[slug]
 * Menemukan booking dari slug atau token, mengambil foto dari cache Drive,
 * serta memuat status seleksi klien.
 */
export async function getClientGalleryData(slugOrToken: string): Promise<{
  session: ClientGallerySession | null;
  photos: ClientGalleryPhoto[];
  selectedPhotoIds: string[];
  isLinkExpired?: boolean;
  linkExpiryDate?: string;
  error?: string;
}> {
  try {
    const supabase = createAdminClient();
    const studioSettings = await fetchStudioSettings();

    // Normalisasi nomor WhatsApp studio
    const cleanWaNumber = (studioSettings.whatsapp || '085806138955').replace(/\D/g, '');
    const targetWa = cleanWaNumber.startsWith('0') ? '62' + cleanWaNumber.slice(1) : cleanWaNumber;

    // Parameter bisa berupa:
    // 1. Full string: "budi-ani-a1b2c3d4"
    // 2. Token saja: "a1b2c3d4"
    // 3. Slug saja: "budi-ani"
    const cleaned = slugOrToken.trim();

    // Coba temukan booking
    let booking: any = null;

    // Prioritas 1: Exact match token
    const { data: byToken } = await supabase
      .from('bookings')
      .select('*')
      .eq('gallery_token', cleaned)
      .maybeSingle();

    if (byToken) {
      booking = byToken;
    } else if (cleaned.includes('-')) {
      // Prioritas 2: Format kombinasi slug-token (misal "budi-ani-a1b2c3d4")
      // Ambil potongan token terakhir (8-10 karakter acak)
      const parts = cleaned.split('-');
      const potentialToken = parts[parts.length - 1];

      const { data: byTokenPart } = await supabase
        .from('bookings')
        .select('*')
        .eq('gallery_token', potentialToken)
        .maybeSingle();

      if (byTokenPart) {
        booking = byTokenPart;
      }
    } else {
      // Prioritas 3 (Fallback Legacy): Hanya izinkan slug murni jika booking tersebut belum memiliki gallery_token
      const { data: bySlug } = await supabase
        .from('bookings')
        .select('*')
        .eq('gallery_slug', cleaned)
        .is('gallery_token', null)
        .maybeSingle();

      if (bySlug) {
        booking = bySlug;
      }
    }

    if (!booking) {
      return {
        session: null,
        photos: [],
        selectedPhotoIds: [],
        error: 'Tautan galeri tidak ditemukan atau sudah tidak aktif. Silakan hubungi admin Margasera Photography.',
      };
    }

    // Cek batas waktu (deadline)
    const now = new Date();
    const deadlineDate = booking.selection_deadline ? new Date(booking.selection_deadline) : null;
    const isExpired = deadlineDate ? now.getTime() > deadlineDate.getTime() : false;

    // Cek masa aktif tautan galeri (30 hari sejak dibuat / dikirim)
    // Berikan toleransi jika admin memperpanjang deadline lebih lama dari 30 hari
    const linkBaseDate = booking.gallery_sent_at
      ? new Date(booking.gallery_sent_at)
      : booking.created_at
        ? new Date(booking.created_at)
        : new Date(booking.booking_date || Date.now());

    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    const defaultExpiryTime = linkBaseDate.getTime() + THIRTY_DAYS_MS;
    const deadlineTime = deadlineDate ? deadlineDate.getTime() : 0;
    const linkExpiryTime = Math.max(defaultExpiryTime, deadlineTime);
    const isLinkExpired = now.getTime() > linkExpiryTime;

    // Ambil pilihan foto yang sudah tersimpan sebelumnya
    let selectedPhotoIds: string[] = [];
    try {
      const { data: existingSelections } = await supabase
        .from('gallery_selections')
        .select('drive_file_id')
        .eq('booking_id', booking.id);

      if (existingSelections && existingSelections.length > 0) {
        selectedPhotoIds = existingSelections.map((s: any) => s.drive_file_id);
      }
    } catch {
      // Abaikan jika tabel selections belum ada
    }

    // Jika masa aktif tautan 30 hari telah berakhir
    if (isLinkExpired) {
      // Hapus cache foto dari Supabase agar database tetap bersih & hemat ruang
      try {
        await supabase
          .from('gallery_files_cache')
          .delete()
          .eq('booking_id', booking.id);
      } catch (cleanErr) {
        console.warn('[getClientGalleryData] Auto-clean cache notice:', cleanErr);
      }

      const expiredSession: ClientGallerySession = {
        id: booking.id,
        slug: booking.gallery_slug || cleaned,
        token: booking.gallery_token || undefined,
        clientName: booking.customer_name,
        eventTitle: booking.service_name || booking.event_type || `Sesi Foto ${booking.customer_name}`,
        eventDate: booking.booking_date,
        location: booking.location || 'Studio Margasera',
        maxSelectCount: booking.selection_max_count || 15,
        deadline: booking.selection_deadline || new Date().toISOString(),
        allowDownload: false,
        status: 'expired',
        selectedPhotoIds,
        whatsappContact: targetWa,
      };

      return {
        session: expiredSession,
        photos: [],
        selectedPhotoIds,
        isLinkExpired: true,
        linkExpiryDate: new Date(linkExpiryTime).toISOString(),
      };
    }

    const hasSubmitted = selectedPhotoIds.length > 0;
    const sessionStatus: ClientGallerySession['status'] = hasSubmitted
      ? 'submitted'
      : isExpired
        ? 'expired'
        : 'active';

    // Ambil foto dari cache / Drive
    const photos = await getGalleryPhotosForBooking(booking.id);

    const session: ClientGallerySession = {
      id: booking.id,
      slug: booking.gallery_slug || cleaned,
      token: booking.gallery_token || undefined,
      clientName: booking.customer_name,
      eventTitle: booking.service_name || booking.event_type || `Sesi Foto ${booking.customer_name}`,
      eventDate: booking.booking_date,
      location: booking.location || 'Studio Margasera',
      maxSelectCount: booking.selection_max_count || 15,
      deadline: booking.selection_deadline || new Date(Date.now() + 7 * 86400000).toISOString(),
      allowDownload: Boolean(booking.allow_download),
      status: sessionStatus,
      selectedPhotoIds,
      whatsappContact: targetWa,
    };

    return {
      session,
      photos,
      selectedPhotoIds,
      isLinkExpired: false,
      linkExpiryDate: new Date(linkExpiryTime).toISOString(),
    };
  } catch (err: any) {
    console.error('Error fetching client gallery data:', err);
    return {
      session: null,
      photos: [],
      selectedPhotoIds: [],
      error: err?.message || 'Gagal memuat data galeri.',
    };
  }
}

/**
 * Submit pilihan foto oleh klien
 */
export async function submitClientGallerySelections(
  bookingIdOrToken: string,
  selectedFileIds: string[],
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  if (!(await checkRateLimit('gallery-selection-submit', 10, 60_000))) {
    return { success: false, error: 'Terlalu banyak permintaan. Silakan tunggu 1 menit.' };
  }

  try {
    const supabase = createAdminClient();

    // 1. Cari booking
    let booking: any = null;
    const cleanId = (bookingIdOrToken || '').trim();

    // Prioritas A: Cari berdasarkan gallery_token
    const { data: byToken } = await supabase
      .from('bookings')
      .select('*')
      .eq('gallery_token', cleanId)
      .maybeSingle();

    if (byToken) {
      booking = byToken;
    } else if (cleanId.includes('-')) {
      // Prioritas B: Jika format slug-token gabungan, ambil token di bagian akhir
      const parts = cleanId.split('-');
      const lastPart = parts[parts.length - 1];
      const { data: byEndToken } = await supabase
        .from('bookings')
        .select('*')
        .eq('gallery_token', lastPart)
        .maybeSingle();
      if (byEndToken) booking = byEndToken;
    } else {
      // Prioritas C (Fallback Legacy): Hanya izinkan slug jika booking belum memiliki token
      const { data: bySlug } = await supabase
        .from('bookings')
        .select('*')
        .eq('gallery_slug', cleanId)
        .is('gallery_token', null)
        .maybeSingle();
      if (bySlug) booking = bySlug;
    }

    if (!booking) {
      return { success: false, error: 'Sesi galeri tidak valid.' };
    }

    // 2. Validasi deadline
    if (booking.selection_deadline) {
      const deadline = new Date(booking.selection_deadline).getTime();
      if (Date.now() > deadline) {
        return {
          success: false,
          error: 'Batas waktu pemilihan foto sudah berakhir. Silakan hubungi studio jika membutuhkan perpanjangan waktu.',
        };
      }
    }

    // 3. Validasi kuota maksimal
    const maxCount = booking.selection_max_count || 15;

    // 4. Ambil nama file dari cache dan validasi bahwa ID foto sah milik booking ini
    const { data: cachedFiles } = await supabase
      .from('gallery_files_cache')
      .select('drive_file_id, file_name')
      .eq('booking_id', booking.id);

    const nameMap = new Map<string, string>();
    if (cachedFiles) {
      for (const cf of cachedFiles) {
        nameMap.set(cf.drive_file_id, cf.file_name);
      }
    }

    // Sanitasi input: filter ID unik, format alfanumerik valid, dan terdaftar di cache folder sesi ini
    const validFileIds = Array.from(
      new Set(selectedFileIds.map((id) => String(id).trim()))
    ).filter((id) => /^[a-zA-Z0-9_-]{10,60}$/.test(id) && (nameMap.size === 0 || nameMap.has(id)));

    if (validFileIds.length === 0) {
      return {
        success: false,
        error: 'Pilih minimal 1 foto yang sah sebelum mengirimkan pilihan.',
      };
    }

    if (validFileIds.length > maxCount) {
      return {
        success: false,
        error: `Jumlah foto yang dipilih (${validFileIds.length}) melebihi kuota maksimal (${maxCount} foto).`,
      };
    }

    // 5. Replace pilihan lama (delete lalu insert baru)
    await supabase
      .from('gallery_selections')
      .delete()
      .eq('booking_id', booking.id);

    const rows = validFileIds.map((id) => ({
      booking_id: booking.id,
      drive_file_id: id,
      file_name: nameMap.get(id) || `Foto-${id}`,
      selected_at: new Date().toISOString(),
    }));

    const { error: insErr } = await supabase
      .from('gallery_selections')
      .insert(rows);

    if (insErr) {
      console.error('Error inserting gallery selections:', insErr);
      return { success: false, error: insErr.message };
    }

    // Kirim notifikasi ke admin dan tunggu hingga tersimpan
    await sendAdminNotification({
      type: 'gallery_selection',
      title: '🖼️ Klien Pilih Foto',
      body: `${booking.customer_name} telah memilih ${validFileIds.length} foto dari galeri mereka`,
      bookingId: booking.id,
      url: '/admin/dashboard/bookings',
    });

    return { success: true };
  } catch (err: any) {
    console.error('Error submitting selections:', err);
    return { success: false, error: err?.message || 'Gagal menyimpan pilihan foto.' };
  }
}

/**
 * Mengambil daftar pilihan foto klien untuk ditampilkan di Tab 3 Admin Modal
 */
export async function getAdminGallerySelections(bookingId: string): Promise<{
  success: boolean;
  selections: { id: string; fileId: string; fileName: string; selectedAt: string; thumbnailUrl?: string }[];
  error?: string;
}> {
  try {
    if (!(await requireAdmin())) return { success: false, selections: [], error: 'Unauthorized' };
    const supabase = createAdminClient();

    const { data: selections, error: selErr } = await supabase
      .from('gallery_selections')
      .select('id, drive_file_id, file_name, selected_at')
      .eq('booking_id', bookingId)
      .order('selected_at', { ascending: true });

    if (selErr) {
      return { success: false, selections: [], error: selErr.message };
    }

    // Ambil thumbnail dari cache
    const { data: cache } = await supabase
      .from('gallery_files_cache')
      .select('drive_file_id, thumbnail_link')
      .eq('booking_id', bookingId);

    const thumbMap = new Map<string, string>();
    if (cache) {
      for (const c of cache) {
        if (c.thumbnail_link) thumbMap.set(c.drive_file_id, c.thumbnail_link);
      }
    }

    const formatted = (selections || []).map((s: any) => {
      let thumb = thumbMap.get(s.drive_file_id);
      if (!thumb || thumb.includes('drive-storage')) {
        thumb = `https://lh3.googleusercontent.com/d/${s.drive_file_id}=w600`;
      }

      return {
        id: s.id,
        fileId: s.drive_file_id,
        fileName: s.file_name,
        selectedAt: s.selected_at,
        thumbnailUrl: thumb,
      };
    });

    return { success: true, selections: formatted };
  } catch (err: any) {
    return { success: false, selections: [], error: err?.message || 'Gagal mengambil hasil pilihan.' };
  }
}

/**
 * Membersihkan cache foto dari tabel gallery_files_cache untuk menghemat storage Supabase
 */
export async function clearBookingGalleryCache(bookingId: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!(await requireAdmin())) return { success: false, error: 'Unauthorized' };
    const supabase = createAdminClient();

    const { error } = await supabase
      .from('gallery_files_cache')
      .delete()
      .eq('booking_id', bookingId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Gagal membersihkan cache foto.' };
  }
}


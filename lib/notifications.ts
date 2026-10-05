// lib/notifications.ts
// Helper server-side: simpan notifikasi ke DB + kirim FCM push

import { createAdminClient } from '@/lib/supabase/admin';
import { getFirebaseAdminMessaging } from '@/lib/firebase/admin';

export type NotificationType = 'booking' | 'testimonial' | 'gallery_selection';

export interface SendNotificationPayload {
  type: NotificationType;
  title: string;
  body: string;
  bookingId?: string;
  url?: string;
}

/**
 * Simpan notifikasi ke tabel `notifications` dan kirim FCM push ke semua token admin.
 * Dipanggil dari server actions setelah event terjadi.
 */
export async function sendAdminNotification(payload: SendNotificationPayload): Promise<void> {
  try {
    const supabase = createAdminClient();

    // 1. Simpan ke tabel notifications
    const { error: insertErr } = await supabase.from('notifications').insert({
      type: payload.type,
      title: payload.title,
      body: payload.body,
      booking_id: payload.bookingId || null,
      url: payload.url || null,
      is_read: false,
    });

    if (insertErr) {
      console.error('[notification] Gagal menyimpan notifikasi ke DB:', insertErr.message);
    }

    // 2. Ambil semua FCM tokens yang aktif
    const { data: tokens, error: tokenFetchErr } = await supabase
      .from('fcm_tokens')
      .select('token');

    if (tokenFetchErr) {
      console.error('[notification] Gagal mengambil fcm_tokens:', tokenFetchErr.message);
      return;
    }

    if (!tokens || tokens.length === 0) return;

    // 3. Kirim FCM push notification ke semua device admin
    const messaging = getFirebaseAdminMessaging();
    const tokenList: string[] = tokens.map((t: { token: string }) => t.token);

    if (tokenList.length === 0) return;

    const response = await messaging.sendEachForMulticast({
      tokens: tokenList,
      // Data-only message: tidak ada field 'notification' agar FCM tidak
      // otomatis menampilkan notifikasi. Hanya onBackgroundMessage di SW
      // yang akan menampilkan notifikasi → tidak dobel.
      webpush: {
        fcmOptions: {
          link: payload.url || '/admin/dashboard',
        },
      },
      data: {
        title: payload.title,
        body: payload.body,
        type: payload.type,
        url: payload.url || '/admin/dashboard',
        bookingId: payload.bookingId || '',
      },
    });

    // Bersihkan token FCM kedaluwarsa secara otomatis
    const invalidTokens: string[] = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success && resp.error?.code === 'messaging/registration-token-not-registered') {
        invalidTokens.push(tokenList[idx]);
      }
    });

    if (invalidTokens.length > 0) {
      await supabase.from('fcm_tokens').delete().in('token', invalidTokens);
    }
  } catch (err: any) {
    // Notifikasi gagal tidak boleh crash proses utama
    console.error('[notification] Error sending notification:', err?.message || err);
    if (err?.code) console.error('[notification] Error code:', err.code);
  }
}

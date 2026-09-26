import { createManualBooking, updateBooking } from '@/lib/actions/bookings';
import {
  getPendingSyncQueue,
  updateSyncQueueItem,
  removeFromSyncQueue,
  saveLocalBooking,
  getLocalBooking,
  type SyncQueueItem,
} from './db';
import {
  removeFromOfflineQueue,
  OFFLINE_QUEUE_EVENT,
} from '@/lib/offline-queue';

export const MAX_RETRY_ATTEMPTS = 3;

let isSyncRunning = false;

export interface SyncResult {
  total: number;
  successCount: number;
  failedCount: number;
  remainingCount: number;
  errors: { id: string; error: string }[];
}

/**
 * Algoritma Sinkronisasi Sekuensial Sesuai PRD ios.md:
 * - Mengambil seluruh antrean pending / failed
 * - Urutkan FIFO (berdasarkan createdAt)
 * - Eksekusi satu per satu (001 -> 002 -> 003)
 * - Error handling terisolasi per item
 */
export async function processSyncQueue(): Promise<SyncResult> {
  if (typeof window === 'undefined') {
    return { total: 0, successCount: 0, failedCount: 0, remainingCount: 0, errors: [] };
  }

  if (!navigator.onLine) {
    const queue = await getPendingSyncQueue();
    return {
      total: queue.length,
      successCount: 0,
      failedCount: 0,
      remainingCount: queue.length,
      errors: [],
    };
  }

  if (isSyncRunning) {
    console.log('[Sync] Sinkronisasi sedang berjalan, lewati request paralel.');
    const queue = await getPendingSyncQueue();
    return {
      total: queue.length,
      successCount: 0,
      failedCount: 0,
      remainingCount: queue.length,
      errors: [],
    };
  }

  isSyncRunning = true;
  let successCount = 0;
  let failedCount = 0;
  const errors: { id: string; error: string }[] = [];

  try {
    const queue = await getPendingSyncQueue();
    if (queue.length === 0) {
      return { total: 0, successCount: 0, failedCount: 0, remainingCount: 0, errors: [] };
    }

    console.log(`[Sync] Memulai pemrosesan ${queue.length} antrean secara sekuensial...`);

    for (const item of queue) {
      await updateSyncQueueItem(item.id, 'syncing');

      try {
        let isSuccess = false;
        let errorMessage = '';

        if (item.entity === 'booking') {
          if (item.operation === 'create') {
            const res = await createManualBooking(item.payload as any);
            isSuccess = res.success;
            errorMessage = res.error || '';
          } else if (item.operation === 'update') {
            const res = await updateBooking(item.entityId, item.payload as any);
            isSuccess = res.success;
            errorMessage = res.error || '';
          }
        }

        if (isSuccess) {
          // 1. Hapus dari sync_queue IndexedDB & localStorage
          await removeFromSyncQueue(item.id);
          removeFromOfflineQueue(item.entityId);

          // 2. Tandai booking di IndexedDB sebagai synced
          if (item.entity === 'booking' && item.payload) {
            await saveLocalBooking({
              id: item.entityId,
              ...(item.payload as any),
              syncStatus: 'synced',
              isOfflineDraft: false,
              localUpdatedAt: new Date().toISOString(),
            });
          }

          successCount++;
          console.log(`[Sync] Berhasil sinkronisasi: ${item.entity} (${item.entityId})`);
        } else {
          // Gagal dari respons server (misal validasi, bentrok, atau conflict)
          const attempts = (item.retryCount || 0) + 1;
          const isConflict =
            errorMessage.toLowerCase().includes('berubah di server') ||
            errorMessage.toLowerCase().includes('conflict');

          // Jika konflik data, langsung tandai failed tanpa retry berulang
          const status = isConflict || attempts >= MAX_RETRY_ATTEMPTS ? 'failed' : 'pending';
          const formattedError = isConflict ? `[KONFLIK] ${errorMessage}` : errorMessage;

          await updateSyncQueueItem(item.id, status, formattedError);

          // Tandai juga pada record booking di IndexedDB agar tabel menampilkan badge konflik
          if (item.entity === 'booking') {
            const existing = await getLocalBooking(item.entityId);
            if (existing) {
              await saveLocalBooking({
                ...existing,
                syncStatus: 'failed',
                lastError: formattedError,
                localUpdatedAt: new Date().toISOString(),
              });
            }
          }

          failedCount++;
          errors.push({ id: item.id, error: formattedError });
          console.warn(`[Sync] Item gagal (${status}): ${item.id} - ${formattedError}`);
        }
      } catch (err: unknown) {
        // Kesalahan jaringan atau fetch thrown
        const errorMsg = err instanceof Error ? err.message : 'Kesalahan koneksi jaringan';
        const attempts = (item.retryCount || 0) + 1;
        const status = attempts >= MAX_RETRY_ATTEMPTS ? 'failed' : 'pending';
        await updateSyncQueueItem(item.id, status, errorMsg);

        failedCount++;
        errors.push({ id: item.id, error: errorMsg });
        console.warn(`[Sync] Exception saat sinkronisasi: ${item.id} - ${errorMsg}`);
      }
    }

    // Trigger update UI event ke seluruh listener
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(OFFLINE_QUEUE_EVENT));
    }

    const remaining = await getPendingSyncQueue();
    return {
      total: queue.length,
      successCount,
      failedCount,
      remainingCount: remaining.length,
      errors,
    };
  } finally {
    isSyncRunning = false;
  }
}

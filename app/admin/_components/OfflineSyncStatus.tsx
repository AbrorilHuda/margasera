'use client';

import { useState, useEffect, useCallback } from 'react';
import { WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import {
  getOfflineQueue,
  syncOfflineQueue,
  cacheMasterData,
  OFFLINE_QUEUE_EVENT,
  type OfflineBookingItem,
} from '@/lib/offline-queue';
import { migrateFromLocalStorageIfNeeded, getPendingSyncQueue } from '@/lib/offline';
import { getServices, getPackages } from '@/lib/actions/services';
import { getStudioSettings } from '@/lib/actions/settings';
import { useToast } from '@/components/ui/toast-context';

export function OfflineSyncStatus() {
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(true);
  const [queue, setQueue] = useState<OfflineBookingItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // 1. Refresh status antrean lokal dari IndexedDB & localStorage
  const updateQueueState = useCallback(async () => {
    try {
      const dbQueue = await getPendingSyncQueue();
      if (dbQueue && dbQueue.length > 0) {
        setQueue(
          dbQueue.map((q) => ({
            tempId: q.entityId,
            data: q.payload as any,
            createdAt: q.createdAt,
            syncAttempts: q.retryCount,
            lastError: q.lastError,
          }))
        );
        return;
      }
    } catch {}
    const currentQueue = getOfflineQueue();
    setQueue(currentQueue);
  }, []);

  // 2. Fungsi Sinkronisasi Data (Sequential FIFO Sync)
  const handleSync = useCallback(async (isAutomatic = false) => {
    if (!navigator.onLine) {
      if (!isAutomatic) {
        toast.error('Perangkat masih dalam kondisi offline. Sambungkan internet terlebih dahulu.');
      }
      return;
    }

    const currentQueue = getOfflineQueue();
    let dbCount = currentQueue.length;
    try {
      const dbQ = await getPendingSyncQueue();
      if (dbQ) dbCount = Math.max(dbCount, dbQ.length);
    } catch {}

    if (dbCount === 0) {
      if (!isAutomatic) toast.info('Semua data sudah tersinkronkan.');
      return;
    }

    setIsSyncing(true);
    try {
      const res = await syncOfflineQueue();
      if (res.successCount > 0) {
        toast.success(`Berhasil menyinkronkan ${res.successCount} data offline ke server.`);
      }
      if (res.failedCount > 0) {
        toast.error(`${res.failedCount} data gagal disinkronkan. Klik untuk mencoba lagi.`);
      }
    } catch (err) {
      console.error('[OfflineSync] Gagal menyinkronkan:', err);
      if (!isAutomatic) toast.error('Gagal menyinkronkan antrean offline.');
    } finally {
      setIsSyncing(false);
      await updateQueueState();
    }
  }, [toast, updateQueueState]);

  useEffect(() => {
    // Inisialisasi status koneksi & migrasi data lokal
    const online = typeof navigator !== 'undefined' ? navigator.onLine : true;
    setIsOnline(online);

    migrateFromLocalStorageIfNeeded()
      .then(async () => {
        await updateQueueState();
        // Auto-sync jika online saat app startup
        if (online) {
          handleSync(true);
        }
      })
      .catch(() => updateQueueState());

    // 3. Register Service Worker untuk Cache PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          reg.update().catch(() => {});
        })
        .catch((err) => {
          console.warn('[SW Registration Error]:', err);
        });
    }

    // 4. Listeners untuk event Online / Offline
    const handleOnline = () => {
      setIsOnline(true);
      toast.info('Koneksi internet kembali online. Menyinkronkan antrean...');
      handleSync(true);

      // Re-fetch dan re-cache data master asli dari Supabase
      Promise.all([getServices(), getPackages(), getStudioSettings()])
        .then(([srvList, pkgList, settings]) => {
          cacheMasterData({
            services: srvList,
            packages: pkgList,
            studioSettings: settings,
          });
        })
        .catch((err) => {
          console.warn('[OfflineSync] Gagal memperbarui cache data master:', err);
        });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('Anda sedang offline. Input data baru akan disimpan ke antrean lokal.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 5. Listener kustom saat antrean offline berubah
    const handleQueueChanged = () => {
      updateQueueState();
    };

    window.addEventListener(OFFLINE_QUEUE_EVENT, handleQueueChanged);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener(OFFLINE_QUEUE_EVENT, handleQueueChanged);
    };
  }, [handleSync, toast, updateQueueState]);

  const queueCount = queue.length;
  const hasFailed = queue.some((q) => (q.syncAttempts || 0) >= 3);

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
      {/* Jika Sedang Offline */}
      {!isOnline ? (
        <div
          className="flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-mono font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-xs shrink-0"
          title="Mode Offline aktif. Data tersimpan di memori perangkat."
        >
          <WifiOff className="w-3 h-3 animate-pulse text-amber-500 shrink-0" />
          <span>Offline{queueCount > 0 ? ` (${queueCount})` : ''}</span>
        </div>
      ) : queueCount > 0 ? (
        /* Jika Online & Ada Antrean Menunggu Sinkron atau Gagal */
        <button
          onClick={() => handleSync(false)}
          disabled={isSyncing}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-mono font-semibold transition-all shadow-xs active:scale-95 cursor-pointer shrink-0 ${
            hasFailed
              ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-500/40 hover:bg-rose-100 dark:hover:bg-rose-900/40'
              : 'bg-blue-50 dark:bg-blue-950/50 text-[#0066CC] dark:text-blue-400 border border-[#0066CC]/30 hover:bg-[#0066CC]/15'
          }`}
          title={
            hasFailed
              ? 'Terdapat perubahan yang gagal dikirim. Klik untuk mencoba lagi.'
              : 'Klik untuk menyinkronkan data offline ke server sekarang'
          }
        >
          {isSyncing ? (
            <RefreshCw className="w-3 h-3 shrink-0 animate-spin" />
          ) : hasFailed ? (
            <AlertCircle className="w-3 h-3 shrink-0 text-rose-500" />
          ) : (
            <RefreshCw className="w-3 h-3 shrink-0" />
          )}
          <span>
            {isSyncing
              ? 'Menyinkronkan...'
              : hasFailed
                ? `${queueCount} Perlu Retry`
                : `${queueCount} Antrean Sync`}
          </span>
        </button>
      ) : (
        /* Jika Online Normal & Bersih (Tampil di Desktop & Mobile) */
        <div
          className="flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-mono font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 shadow-xs shrink-0"
          title="Terhubung ke server Margasera"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span>Online</span>
        </div>
      )}
    </div>
  );
}

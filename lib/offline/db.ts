import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { Booking } from '@/lib/types';

export interface LocalBooking extends Booking {
  syncStatus?: 'synced' | 'pending' | 'failed';
  localUpdatedAt?: string;
  lastError?: string;
  isOfflineDraft?: boolean;
}

export interface SyncQueueItem {
  id: string;
  entity: 'booking' | 'customer' | 'schedule';
  entityId: string;
  operation: 'create' | 'update' | 'delete';
  payload: Record<string, unknown>;
  createdAt: string;
  retryCount: number;
  status: 'pending' | 'syncing' | 'failed';
  lastError?: string;
}

export interface MargaseraDB extends DBSchema {
  bookings: {
    key: string;
    value: LocalBooking;
    indexes: {
      'by-syncStatus': string;
      'by-bookingDate': string;
      'by-createdAt': string;
    };
  };
  sync_queue: {
    key: string;
    value: SyncQueueItem;
    indexes: {
      'by-status': string;
      'by-createdAt': string;
    };
  };
  master_data: {
    key: string;
    value: {
      key: string;
      data: unknown;
      updatedAt: string;
    };
  };
}

const DB_NAME = 'margasera_offline_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<MargaseraDB>> | null = null;

export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof indexedDB !== 'undefined';
}

/** Mengambil instance koneksi IndexedDB singleton */
export function getDB(): Promise<IDBPDatabase<MargaseraDB>> | null {
  if (!isBrowser()) return null;

  if (!dbPromise) {
    dbPromise = openDB<MargaseraDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // 1. Store Bookings
        if (!db.objectStoreNames.contains('bookings')) {
          const bookingStore = db.createObjectStore('bookings', { keyPath: 'id' });
          bookingStore.createIndex('by-syncStatus', 'syncStatus');
          bookingStore.createIndex('by-bookingDate', 'bookingDate');
          bookingStore.createIndex('by-createdAt', 'createdAt');
        }

        // 2. Store Sync Queue
        if (!db.objectStoreNames.contains('sync_queue')) {
          const queueStore = db.createObjectStore('sync_queue', { keyPath: 'id' });
          queueStore.createIndex('by-status', 'status');
          queueStore.createIndex('by-createdAt', 'createdAt');
        }

        // 3. Store Master Data (Layanan, Paket, Settings)
        if (!db.objectStoreNames.contains('master_data')) {
          db.createObjectStore('master_data', { keyPath: 'key' });
        }
      },
    });
  }

  return dbPromise;
}

// ==========================================
// 1. REPOSITORY BOOKINGS
// ==========================================

/** Ambil seluruh booking lokal (snapshot dari server + draft lokal offline) */
export async function getAllLocalBookings(): Promise<LocalBooking[]> {
  const db = await getDB();
  if (!db) return [];
  try {
    const list = await db.getAll('bookings');
    // Urutkan dari yang terbaru dibuat
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.error('[IndexedDB] Gagal mengambil booking:', err);
    return [];
  }
}

/** Simpan atau perbarui satu booking ke IndexedDB */
export async function saveLocalBooking(booking: LocalBooking): Promise<void> {
  const db = await getDB();
  if (!db) return;
  try {
    await db.put('bookings', {
      ...booking,
      localUpdatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[IndexedDB] Gagal menyimpan booking:', err);
  }
}

/** Simpan banyak booking (snapshot dari Supabase saat online) ke IndexedDB */
export async function saveLocalBookingsBatch(bookings: Booking[]): Promise<void> {
  const db = await getDB();
  if (!db) return;
  try {
    const tx = db.transaction('bookings', 'readwrite');
    for (const b of bookings) {
      // Pertahankan status pending jika ada draft offline dengan ID yang sama
      const existing = await tx.store.get(b.id);
      if (existing && existing.syncStatus === 'pending') {
        continue;
      }
      await tx.store.put({
        ...b,
        syncStatus: 'synced',
        localUpdatedAt: new Date().toISOString(),
      });
    }
    await tx.done;
  } catch (err) {
    console.error('[IndexedDB] Gagal batch save booking:', err);
  }
}

/** Hapus booking dari IndexedDB */
export async function deleteLocalBooking(id: string): Promise<void> {
  const db = await getDB();
  if (!db) return;
  try {
    await db.delete('bookings', id);
  } catch (err) {
    console.error('[IndexedDB] Gagal menghapus booking:', err);
  }
}

/** Ambil satu booking dari IndexedDB berdasarkan ID */
export async function getLocalBooking(id: string): Promise<LocalBooking | null> {
  const db = await getDB();
  if (!db) return null;
  try {
    const item = await db.get('bookings', id);
    return item || null;
  } catch (err) {
    console.error('[IndexedDB] Gagal mengambil booking by id:', err);
    return null;
  }
}

// ==========================================
// 2. REPOSITORY SYNC QUEUE
// ==========================================

/** Masukkan mutasi baru ke antrean sinkronisasi */
export async function addToSyncQueue(
  entity: 'booking' | 'customer' | 'schedule',
  entityId: string,
  operation: 'create' | 'update' | 'delete',
  payload: Record<string, unknown>
): Promise<SyncQueueItem> {
  const db = await getDB();
  const id = `queue_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const item: SyncQueueItem = {
    id,
    entity,
    entityId,
    operation,
    payload,
    createdAt: new Date().toISOString(),
    retryCount: 0,
    status: 'pending',
  };

  if (db) {
    try {
      await db.put('sync_queue', item);
    } catch (err) {
      console.error('[IndexedDB] Gagal menambahkan ke sync_queue:', err);
    }
  }

  return item;
}

/** Ambil seluruh antrean yang berstatus pending atau failed */
export async function getPendingSyncQueue(): Promise<SyncQueueItem[]> {
  const db = await getDB();
  if (!db) return [];
  try {
    const all = await db.getAll('sync_queue');
    return all
      .filter((q) => q.status === 'pending' || q.status === 'failed')
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  } catch (err) {
    console.error('[IndexedDB] Gagal membaca sync_queue:', err);
    return [];
  }
}

/** Perbarui status antrean (misal ke syncing, failed, atau update retryCount) */
export async function updateSyncQueueItem(
  id: string,
  status: 'pending' | 'syncing' | 'failed',
  lastError?: string
): Promise<void> {
  const db = await getDB();
  if (!db) return;
  try {
    const item = await db.get('sync_queue', id);
    if (item) {
      item.status = status;
      if (lastError !== undefined) item.lastError = lastError;
      if (status === 'failed') item.retryCount = (item.retryCount || 0) + 1;
      await db.put('sync_queue', item);
    }
  } catch (err) {
    console.error('[IndexedDB] Gagal update sync_queue:', err);
  }
}

/** Hapus item dari antrean setelah sukses disinkronkan ke Supabase */
export async function removeFromSyncQueue(id: string): Promise<void> {
  const db = await getDB();
  if (!db) return;
  try {
    await db.delete('sync_queue', id);
  } catch (err) {
    console.error('[IndexedDB] Gagal menghapus dari sync_queue:', err);
  }
}

// ==========================================
// 3. REPOSITORY MASTER DATA
// ==========================================

export async function saveMasterDataLocal<T>(key: 'services' | 'packages' | 'settings', data: T): Promise<void> {
  const db = await getDB();
  if (!db) return;
  try {
    await db.put('master_data', {
      key,
      data,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error(`[IndexedDB] Gagal menyimpan master data ${key}:`, err);
  }
}

export async function getMasterDataLocal<T>(key: 'services' | 'packages' | 'settings'): Promise<T | null> {
  const db = await getDB();
  if (!db) return null;
  try {
    const entry = await db.get('master_data', key);
    return entry ? (entry.data as T) : null;
  } catch (err) {
    console.error(`[IndexedDB] Gagal membaca master data ${key}:`, err);
    return null;
  }
}

// ==========================================
// 4. MIGRATION DARI LOCALSTORAGE
// ==========================================

/** Migrasikan data lama dari localStorage ke IndexedDB saat startup */
export async function migrateFromLocalStorageIfNeeded(): Promise<void> {
  if (!isBrowser()) return;
  const db = await getDB();
  if (!db) return;

  const MIGRATED_FLAG = 'margasera_indexeddb_migrated_v1';
  if (localStorage.getItem(MIGRATED_FLAG)) return;

  try {
    // 1. Migrasi antrean offline
    const rawQueue = localStorage.getItem('margasera_offline_bookings_queue');
    if (rawQueue) {
      const queue = JSON.parse(rawQueue);
      if (Array.isArray(queue)) {
        for (const item of queue) {
          await db.put('sync_queue', {
            id: item.tempId || `queue_${Date.now()}`,
            entity: 'booking',
            entityId: item.tempId,
            operation: 'create',
            payload: item.data || {},
            createdAt: item.createdAt || new Date().toISOString(),
            retryCount: item.syncAttempts || 0,
            status: 'pending',
            lastError: item.lastError,
          });

          if (item.data) {
            await db.put('bookings', {
              id: item.tempId,
              ...item.data,
              createdAt: item.createdAt || new Date().toISOString(),
              syncStatus: 'pending',
              isOfflineDraft: true,
            });
          }
        }
      }
    }

    // 2. Migrasi master data
    const rawSrv = localStorage.getItem('margasera_cached_services');
    if (rawSrv) await saveMasterDataLocal('services', JSON.parse(rawSrv));

    const rawPkg = localStorage.getItem('margasera_cached_packages');
    if (rawPkg) await saveMasterDataLocal('packages', JSON.parse(rawPkg));

    const rawSet = localStorage.getItem('margasera_cached_settings');
    if (rawSet) await saveMasterDataLocal('settings', JSON.parse(rawSet));

    localStorage.setItem(MIGRATED_FLAG, 'true');
    console.log('[IndexedDB] Sukses migrasi data dari localStorage ke IndexedDB');
  } catch (err) {
    console.warn('[IndexedDB] Migrasi localStorage dilewati:', err);
  }
}

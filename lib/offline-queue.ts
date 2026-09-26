import type { Booking, Service, Package, StudioSettings } from '@/lib/types';
import {
  saveLocalBooking,
  saveLocalBookingsBatch,
  addToSyncQueue,
  removeFromSyncQueue,
  saveMasterDataLocal,
} from './offline/db';
import { processSyncQueue } from './offline/sync';

export interface OfflineBookingItem {
  tempId: string;
  data: Omit<Booking, 'id' | 'createdAt'>;
  createdAt: string;
  syncAttempts?: number;
  lastError?: string;
}

const STORAGE_KEY_QUEUE = 'margasera_offline_bookings_queue';
const STORAGE_KEY_SERVICES = 'margasera_cached_services';
const STORAGE_KEY_PACKAGES = 'margasera_cached_packages';
const STORAGE_KEY_BOOKINGS = 'margasera_cached_bookings';
const STORAGE_KEY_SETTINGS = 'margasera_cached_settings';

export const OFFLINE_QUEUE_EVENT = 'margasera_offline_queue_changed';

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function dispatchQueueChange() {
  if (isBrowser()) {
    const queue = getOfflineQueue();
    window.dispatchEvent(new CustomEvent(OFFLINE_QUEUE_EVENT, { detail: queue }));
  }
}

/** Ambil seluruh antrean booking offline */
export function getOfflineQueue(): OfflineBookingItem[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_QUEUE);
    if (!raw) return [];
    return JSON.parse(raw) as OfflineBookingItem[];
  } catch (err) {
    console.error('[OfflineQueue] Gagal membaca antrean offline:', err);
    return [];
  }
}

/** Simpan data booking ke antrean lokal offline & IndexedDB */
export function saveToOfflineQueue(
  bookingData: Omit<Booking, 'id' | 'createdAt'>
): OfflineBookingItem {
  if (!isBrowser()) {
    throw new Error('Penyimpanan lokal hanya dapat diakses di sisi browser.');
  }

  const queue = getOfflineQueue();
  const tempId = `offline_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const item: OfflineBookingItem = {
    tempId,
    data: {
      ...bookingData,
      bookingCode: bookingData.bookingCode || `MS-OFFLINE-${Date.now().toString().slice(-6)}`,
    },
    createdAt: new Date().toISOString(),
    syncAttempts: 0,
  };

  queue.push(item);
  try {
    localStorage.setItem(STORAGE_KEY_QUEUE, JSON.stringify(queue));
  } catch (err) {
    console.error('[OfflineQueue] Gagal menyimpan ke localStorage:', err);
  }

  // Simpan juga ke IndexedDB
  saveLocalBooking({
    id: tempId,
    ...item.data,
    createdAt: item.createdAt,
    syncStatus: 'pending',
    isOfflineDraft: true,
  }).catch((err) => console.warn('[IndexedDB] Simpan draft booking gagal:', err));

  addToSyncQueue('booking', tempId, 'create', item.data as unknown as Record<string, unknown>).catch(
    (err) => console.warn('[IndexedDB] Antrean sync gagal:', err)
  );

  dispatchQueueChange();
  return item;
}

/** Hapus item dari antrean setelah sukses disinkronkan */
export function removeFromOfflineQueue(tempId: string): void {
  if (!isBrowser()) return;
  const queue = getOfflineQueue();
  const filtered = queue.filter((item) => item.tempId !== tempId);
  try {
    localStorage.setItem(STORAGE_KEY_QUEUE, JSON.stringify(filtered));
  } catch (err) {
    console.error('[OfflineQueue] Gagal memperbarui antrean:', err);
  }

  // Hapus juga dari IndexedDB sync_queue
  removeFromSyncQueue(tempId).catch(() => { });

  dispatchQueueChange();
}

/** Sinkronkan seluruh antrean booking offline ke Supabase via sequential sync engine */
export async function syncOfflineQueue(): Promise<{
  total: number;
  successCount: number;
  failedCount: number;
}> {
  const result = await processSyncQueue();
  return {
    total: result.total,
    successCount: result.successCount,
    failedCount: result.failedCount,
  };
}

export const OFFLINE_MASTER_DATA_EVENT = 'margasera_offline_master_data_changed';

/** Cache data master (Layanan, Paket, Booking, Settings) ke localStorage & IndexedDB */
export function cacheMasterData(data: {
  services?: Service[];
  packages?: Package[];
  bookings?: Booking[];
  studioSettings?: StudioSettings;
}) {
  if (!isBrowser()) return;
  try {
    let hasChanged = false;
    if (data.services && data.services.length > 0) {
      localStorage.setItem(STORAGE_KEY_SERVICES, JSON.stringify(data.services));
      saveMasterDataLocal('services', data.services).catch(() => { });
      hasChanged = true;
    }
    if (data.packages && data.packages.length > 0) {
      localStorage.setItem(STORAGE_KEY_PACKAGES, JSON.stringify(data.packages));
      saveMasterDataLocal('packages', data.packages).catch(() => { });
      hasChanged = true;
    }
    if (data.bookings) {
      // Simpan batch seluruh booking ke IndexedDB (kapasitas besar)
      saveLocalBookingsBatch(data.bookings).catch(() => { });

      // Simpan juga versi ringkas di localStorage sebagai fallback instan
      const MAX_CACHED_BOOKINGS = 10;
      const trimmedBookings = data.bookings.slice(0, MAX_CACHED_BOOKINGS);
      try {
        localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(trimmedBookings));
        hasChanged = true;
      } catch (err) {
        console.warn('[OfflineQueue] Gagal menyimpan cache booking:', err);
      }
    }
    if (data.studioSettings) {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(data.studioSettings));
      saveMasterDataLocal('settings', data.studioSettings).catch(() => { });
      hasChanged = true;
    }

    if (hasChanged && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(OFFLINE_MASTER_DATA_EVENT));
    }
  } catch (err) {
    console.warn('[OfflineQueue] Kuota cache lokal penuh / tidak tersedia:', err);
  }
}

/** Ambil data master dari cache saat offline */
export function getCachedMasterData(): {
  services: Service[];
  packages: Package[];
  bookings: Booking[];
  studioSettings: StudioSettings | null;
} {
  if (!isBrowser()) {
    return { services: [], packages: [], bookings: [], studioSettings: null };
  }

  try {
    const sRaw = localStorage.getItem(STORAGE_KEY_SERVICES);
    const pRaw = localStorage.getItem(STORAGE_KEY_PACKAGES);
    const bRaw = localStorage.getItem(STORAGE_KEY_BOOKINGS);
    const setRaw = localStorage.getItem(STORAGE_KEY_SETTINGS);

    return {
      services: sRaw ? (JSON.parse(sRaw) as Service[]) : [],
      packages: pRaw ? (JSON.parse(pRaw) as Package[]) : [],
      bookings: bRaw ? (JSON.parse(bRaw) as Booking[]) : [],
      studioSettings: setRaw ? (JSON.parse(setRaw) as StudioSettings) : null,
    };
  } catch (err) {
    console.error('[OfflineQueue] Gagal mengambil cache master data:', err);
    return { services: [], packages: [], bookings: [], studioSettings: null };
  }
}

/** Konversi antrean offline menjadi objek Booking agar bisa ditampilkan langsung di tabel */
export function convertOfflineQueueToBookings(queue: OfflineBookingItem[]): (Booking & { isOfflineDraft: boolean })[] {
  return queue.map((item) => ({
    id: item.tempId,
    bookingCode: item.data.bookingCode,
    customerName: item.data.customerName,
    whatsapp: item.data.whatsapp,
    email: item.data.email,
    instagram: item.data.instagram,
    serviceId: item.data.serviceId,
    serviceName: item.data.serviceName,
    packageId: item.data.packageId,
    packageName: item.data.packageName,
    bookingDate: item.data.bookingDate,
    startTime: item.data.startTime,
    endTime: item.data.endTime,
    slotType: item.data.slotType,
    location: item.data.location,
    eventType: item.data.eventType,
    notes: item.data.notes,
    status: item.data.status,
    paymentStatus: item.data.paymentStatus,
    downPayment: item.data.downPayment,
    paidAmount: item.data.paidAmount,
    remainingAmount: item.data.remainingAmount,
    totalPrice: item.data.totalPrice,
    createdAt: item.createdAt,
    isOfflineDraft: true,
  }));
}

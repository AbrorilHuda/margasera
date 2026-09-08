import type { Booking, Service, Package, StudioSettings } from '@/lib/types';
import { createManualBooking } from '@/lib/actions/bookings';

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

/** Simpan data booking ke antrean lokal offline */
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
  dispatchQueueChange();
}

/** Sinkronkan seluruh antrean booking offline ke Supabase */
export async function syncOfflineQueue(): Promise<{
  total: number;
  successCount: number;
  failedCount: number;
}> {
  if (!isBrowser()) return { total: 0, successCount: 0, failedCount: 0 };
  if (!navigator.onLine) {
    return { total: getOfflineQueue().length, successCount: 0, failedCount: 0 };
  }

  const queue = getOfflineQueue();
  if (queue.length === 0) {
    return { total: 0, successCount: 0, failedCount: 0 };
  }

  let successCount = 0;
  let failedCount = 0;

  for (const item of [...queue]) {
    try {
      const res = await createManualBooking(item.data);
      if (res.success) {
        removeFromOfflineQueue(item.tempId);
        successCount++;
      } else {
        item.syncAttempts = (item.syncAttempts || 0) + 1;
        item.lastError = res.error || 'Gagal menyimpan data ke server';
        failedCount++;
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Kesalahan jaringan';
      item.syncAttempts = (item.syncAttempts || 0) + 1;
      item.lastError = errorMsg;
      failedCount++;
    }
  }

  // Simpan kembali antrean dengan status error jika ada yang gagal
  if (failedCount > 0) {
    const currentQueue = getOfflineQueue();
    const updated = currentQueue.map((q) => {
      const found = queue.find((item) => item.tempId === q.tempId);
      return found || q;
    });
    try {
      localStorage.setItem(STORAGE_KEY_QUEUE, JSON.stringify(updated));
    } catch {}
    dispatchQueueChange();
  }

  return { total: queue.length, successCount, failedCount };
}

export const OFFLINE_MASTER_DATA_EVENT = 'margasera_offline_master_data_changed';

/** Cache data master (Layanan, Paket, Booking, Settings) agar tersedia saat offline */
export function cacheMasterData(data: {
  services?: Service[];
  packages?: Package[];
  bookings?: Booking[];
  studioSettings?: StudioSettings;
}) {
  if (!isBrowser()) return;
  try {
    let hasChanged = false;
    // Jangan menimpa data yang sudah tersimpan dengan array kosong saat offline
    if (data.services && data.services.length > 0) {
      localStorage.setItem(STORAGE_KEY_SERVICES, JSON.stringify(data.services));
      hasChanged = true;
    }
    if (data.packages && data.packages.length > 0) {
      localStorage.setItem(STORAGE_KEY_PACKAGES, JSON.stringify(data.packages));
      hasChanged = true;
    }
    if (data.bookings) {
      // Batasi maksimal 5 booking terbaru agar penyimpanan localStorage super ringan (~2 KB)
      const MAX_CACHED_BOOKINGS = 5;
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

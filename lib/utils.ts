import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  try {
    return twMerge(clsx(inputs));
  } catch {
    return inputs.filter(Boolean).join(" ");
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactIDR(amount: number): { value: string; unit: string; full: string } {
  const full = formatCurrency(amount);
  if (amount >= 1_000_000) {
    const inJt = amount / 1_000_000;
    const formatted = Number(inJt.toFixed(3)).toString();
    return { value: `Rp ${formatted}`, unit: 'jt', full };
  }
  if (amount >= 1_000) {
    const inRb = amount / 1_000;
    const formatted = Number(inRb.toFixed(1)).toString();
    return { value: `Rp ${formatted}`, unit: 'rb', full };
  }
  return { value: `Rp ${amount.toLocaleString('id-ID')}`, unit: '', full };
}

export function formatDate(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function getTimeOfDayLabel(timeStr: string): string {
  if (!timeStr) return "";
  const hour = parseInt(timeStr.split(":")[0], 10);
  if (isNaN(hour)) return "";

  if (hour >= 5 && hour < 11) return "Pagi";
  if (hour >= 11 && hour < 15) return "Siang";
  if (hour >= 15 && hour < 18) return "Sore";
  return "Malam";
}

export function formatTimeWithPeriod(timeStr: string): string {
  if (!timeStr) return "";
  const period = getTimeOfDayLabel(timeStr);
  return `${timeStr} WIB (${period})`;
}

/** Validasi apakah string adalah UUID v4 yang valid */
export function isValidUUID(uuid?: string | null): boolean {
  if (!uuid) return false;
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
}

/**
 * Deteksi apakah nama layanan/paket termasuk kategori "Wedding"
 * (bukan pre-wedding atau prewedding)
 */
export function isWeddingService(name: string): boolean {
  const lower = name.toLowerCase();
  return lower.includes('wedding') && !lower.includes('pre-wedding') && !lower.includes('prewedding');
}

/** Mengembalikan string tanggal hari ini dalam format YYYY-MM-DD berdasarkan waktu lokal */
export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Menghitung dana yang sudah riil masuk/diterima dari sebuah booking.
 * Mengabaikan pesanan yang berstatus cancelled atau belum membayar (unpaid).
 */
export function getBookingPaidAmount(b: {
  status?: string;
  paymentStatus?: string;
  paidAmount?: number;
  downPayment?: number;
  totalPrice?: number;
}): number {
  if (b.status === 'cancelled') return 0;

  // Jika paidAmount sudah tercatat secara eksplisit
  if (typeof b.paidAmount === 'number' && b.paidAmount > 0) {
    return b.paidAmount;
  }

  // Fallback berdasarkan status pembayaran
  if (b.paymentStatus === 'paid_full') {
    return b.totalPrice || 0;
  }
  if (b.paymentStatus === 'dp_paid') {
    return b.downPayment || (b.totalPrice ? Math.ceil(b.totalPrice * 0.2) : 0);
  }

  return 0;
}

/**
 * Menghitung sisa piutang / pembayaran yang belum lunas untuk booking valid (confirmed/completed).
 */
export function getBookingRemainingAmount(b: {
  status?: string;
  paymentStatus?: string;
  remainingAmount?: number;
  paidAmount?: number;
  downPayment?: number;
  totalPrice?: number;
}): number {
  if (b.status === 'cancelled' || b.status === 'pending') return 0;
  if (b.paymentStatus === 'paid_full') return 0;

  if (typeof b.remainingAmount === 'number' && b.remainingAmount >= 0) {
    return b.remainingAmount;
  }

  const paid = getBookingPaidAmount(b);
  const total = b.totalPrice || 0;
  return Math.max(0, total - paid);
}


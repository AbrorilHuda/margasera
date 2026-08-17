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


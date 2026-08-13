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

/**
 * In-memory sliding window rate limiter untuk proteksi endpoint publik (seperti /api/chat).
 * Mencegah bot / spam looping tanpa memerlukan dependensi eksternal seperti Redis.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const ipRequestMap = new Map<string, RateLimitRecord>();

// Bersihkan data lama setiap 10 menit agar tidak terjadi memory leak
const CLEANUP_INTERVAL = 10 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupExpired() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  const oneHourAgo = now - 60 * 60 * 1000;
  for (const [ip, record] of ipRequestMap.entries()) {
    const validTimestamps = record.timestamps.filter((t) => t > oneHourAgo);
    if (validTimestamps.length === 0) {
      ipRequestMap.delete(ip);
    } else {
      record.timestamps = validTimestamps;
    }
  }
}

export interface RateLimitOptions {
  maxRequestsPerMinute?: number;
  maxRequestsPerHour?: number;
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): { allowed: boolean; remaining: number; resetInSeconds: number } {
  cleanupExpired();

  const maxPerMinute = options.maxRequestsPerMinute ?? 5;
  const maxPerHour = options.maxRequestsPerHour ?? 25;

  const now = Date.now();
  const oneMinuteAgo = now - 60 * 1000;
  const oneHourAgo = now - 60 * 60 * 1000;

  let record = ipRequestMap.get(identifier);
  if (!record) {
    record = { timestamps: [] };
    ipRequestMap.set(identifier, record);
  }

  // Filter ke 1 jam terakhir
  record.timestamps = record.timestamps.filter((t) => t > oneHourAgo);

  // Hitung request dalam 1 menit terakhir
  const countLastMinute = record.timestamps.filter((t) => t > oneMinuteAgo).length;
  // Hitung request dalam 1 jam terakhir
  const countLastHour = record.timestamps.length;

  if (countLastMinute >= maxPerMinute) {
    const oldestInMinute = record.timestamps.find((t) => t > oneMinuteAgo) || now;
    const resetInSeconds = Math.max(1, Math.ceil((oldestInMinute + 60 * 1000 - now) / 1000));
    return { allowed: false, remaining: 0, resetInSeconds };
  }

  if (countLastHour >= maxPerHour) {
    const oldestInHour = record.timestamps[0] || now;
    const resetInSeconds = Math.max(1, Math.ceil((oldestInHour + 60 * 60 * 1000 - now) / 1000));
    return { allowed: false, remaining: 0, resetInSeconds };
  }

  // Catat request saat ini
  record.timestamps.push(now);
  const remaining = Math.max(0, maxPerMinute - (countLastMinute + 1));

  return { allowed: true, remaining, resetInSeconds: 60 };
}

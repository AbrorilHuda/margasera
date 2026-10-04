import { headers } from 'next/headers';

// disimpan di memori server (reset saat restart / per instance serverless).
const hits = new Map<string, { count: number; resetAt: number }>();

/** Return true jika request masih diizinkan. */
export async function checkRateLimit(key: string, limit = 10, windowMs = 60_000): Promise<boolean> {
  const h = await headers();
  const ip = h.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  const id = `${key}:${ip}`;
  const now = Date.now();

  // Bersihkan entri kedaluwarsa agar Map tidak membengkak
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (v.resetAt < now) hits.delete(k);
  }

  const entry = hits.get(id);
  if (!entry || entry.resetAt < now) {
    hits.set(id, { count: 1, resetAt: now + windowMs });
    return true;
  }
  entry.count++;
  return entry.count <= limit;
}

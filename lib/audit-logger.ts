import { getAdminSession } from '@/lib/actions/admin';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  targetId?: string;
  details?: Record<string, unknown>;
}

// In-memory buffer untuk 100 log aktivitas admin terakhir di server
const memoryAuditLogs: AuditLogEntry[] = [];

/**
 * Mencatat aktivitas penting admin (perubahan status, pembayaran, hapus data, keuangan)
 * Sederhana, aman, tidak membebani database, dan tercatat di server console log.
 */
export async function logAdminAudit(
  action: string,
  targetId?: string,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    const session = await getAdminSession();
    const actor = session.email || session.name || 'admin@margasera.internal';
    const timestamp = new Date().toISOString();
    const entry: AuditLogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp,
      actor,
      action,
      targetId,
      details,
    };

    memoryAuditLogs.unshift(entry);
    if (memoryAuditLogs.length > 100) {
      memoryAuditLogs.pop();
    }

    console.info(`[AUDIT] [${timestamp}] [Actor: ${actor}] [${action}]`, {
      targetId,
      details,
    });
  } catch (err) {
    console.warn('[AUDIT] Gagal mencatat log aktivitas:', err);
  }
}

/** Ambil 50 log aktivitas admin terbaru (server memory) */
export async function getRecentAuditLogs(): Promise<AuditLogEntry[]> {
  return memoryAuditLogs.slice(0, 50);
}

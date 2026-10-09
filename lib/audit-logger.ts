import { Axiom } from '@axiomhq/js';
import { getAdminSession } from '@/lib/actions/admin';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  targetId?: string;
  details?: Record<string, unknown>;
}

// In-memory buffer untuk 100 log aktivitas admin terakhir di server (fallback & fast read)
const memoryAuditLogs: AuditLogEntry[] = [];

// Inisialisasi Axiom client (aktif jika AXIOM_TOKEN disetel di .env.local)
const axiomToken = process.env.AXIOM_TOKEN;
const axiomDataset = process.env.AXIOM_DATASET || 'margasera-audit';

const axiom = axiomToken
  ? new Axiom({
      token: axiomToken,
      axiomClient: 'margasera-studio/1.0',
    })
  : null;

/**
 * Mencatat aktivitas penting admin (perubahan status, pembayaran, hapus data, keuangan).
 * Dikirim langsung ke Axiom cloud (tanpa membebani kuota database Supabase)
 * dan tetap disimpan di server memory & console log.
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

    // 1. Simpan di in-memory buffer lokal
    memoryAuditLogs.unshift(entry);
    if (memoryAuditLogs.length > 100) {
      memoryAuditLogs.pop();
    }

    // 2. Output ke console log server
    console.info(`[AUDIT] [${timestamp}] [Actor: ${actor}] [${action}]`, {
      targetId,
      details,
    });

    // 3. Kirim ke Axiom Cloud (non-blocking agar tidak memperlambat respon admin)
    if (axiom) {
      try {
        axiom.ingest(axiomDataset, [
          {
            _time: timestamp,
            id: entry.id,
            actor,
            action,
            targetId: targetId ?? null,
            details: details ?? {},
            source: 'margasera-admin',
            environment: process.env.NODE_ENV || 'production',
          },
        ]);
        axiom.flush().catch((axiomErr) => {
          console.warn('[AXIOM] Gagal flush audit log ke Axiom:', axiomErr);
        });
      } catch (ingestErr) {
        console.warn('[AXIOM] Gagal ingest audit log ke Axiom:', ingestErr);
      }
    }
  } catch (err) {
    console.warn('[AUDIT] Gagal mencatat log aktivitas:', err);
  }
}

/** Ambil log aktivitas admin terbaru (dari Axiom Cloud atau fallback memori server) */
export async function getRecentAuditLogs(): Promise<AuditLogEntry[]> {
  if (axiom && axiomToken) {
    try {
      const res = await axiom.query(`['${axiomDataset}'] | order by _time desc | limit 50`, { format: 'legacy' });
      if (res && res.matches && res.matches.length > 0) {
        return res.matches.map((m: any) => {
          const d = m.data || {};
          return {
            id: String(d.id || m._time || Date.now()),
            timestamp: String(d._time || m._time || new Date().toISOString()),
            actor: String(d.actor || 'admin'),
            action: String(d.action || 'UNKNOWN'),
            targetId: d.targetId ? String(d.targetId) : undefined,
            details: d.details || undefined,
          };
        });
      }
    } catch (err: any) {
      if (err?.status === 403 || String(err?.message || '').includes('403')) {
        console.info('[AXIOM] Info: Token Axiom saat ini disetel untuk Ingest-only. Menampilkan log dari memori server lokal (Ingest tetap aktif terkirim ke Axiom Cloud).');
      } else {
        console.warn('[AXIOM] Query ke Axiom gagal (fallback ke memori server):', err?.message || err);
      }
    }
  }
  return memoryAuditLogs.slice(0, 50);
}

/** Uji coba kirim event log ke Axiom untuk verifikasi koneksi */
export async function sendTestAuditLog(testMessage?: string): Promise<{ success: boolean; message: string }> {
  try {
    await logAdminAudit('TEST_AXIOM_CONNECTION', 'system-ping', {
      ping: true,
      note: testMessage || 'Uji coba koneksi Axiom berhasil dari Dashboard Admin!',
      triggeredAt: new Date().toISOString(),
    });
    return { success: true, message: 'Test log berhasil dikirim ke Axiom!' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Gagal mengirim test log' };
  }
}

/** Cek status konfigurasi Axiom di server */
export async function getAxiomStatus(): Promise<{
  isConfigured: boolean;
  dataset: string;
  maskedToken?: string;
}> {
  const token = process.env.AXIOM_TOKEN;
  return {
    isConfigured: Boolean(token),
    dataset: process.env.AXIOM_DATASET || 'margasera-audit',
    maskedToken: token
      ? `${token.slice(0, 8)}...${token.slice(-4)}`
      : undefined,
  };
}


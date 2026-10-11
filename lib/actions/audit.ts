'use server';

import { requireAdmin } from '@/lib/actions/admin';
import {
  getRecentAuditLogs,
  sendTestAuditLog,
  getAxiomStatus,
  type AuditLogEntry,
} from '@/lib/audit-logger';

export async function fetchAuditLogsAction(limit = 100): Promise<{
  success: boolean;
  logs: AuditLogEntry[];
  error?: string;
}> {
  if (!(await requireAdmin())) {
    return { success: false, logs: [], error: 'Unauthorized' };
  }
  try {
    const logs = await getRecentAuditLogs(limit);
    return { success: true, logs };
  } catch (err: any) {
    return { success: false, logs: [], error: err.message || 'Gagal memuat log audit' };
  }
}

export async function testAxiomAction(customNote?: string): Promise<{
  success: boolean;
  message: string;
}> {
  if (!(await requireAdmin())) {
    return { success: false, message: 'Unauthorized' };
  }
  return await sendTestAuditLog(customNote);
}

export async function checkAxiomStatusAction(): Promise<{
  isConfigured: boolean;
  dataset: string;
  maskedToken?: string;
}> {
  if (!(await requireAdmin())) {
    return { isConfigured: false, dataset: '' };
  }
  return await getAxiomStatus();
}

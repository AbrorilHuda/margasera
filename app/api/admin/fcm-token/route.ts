import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/actions/admin';

// POST — simpan token baru
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { token } = await req.json();
  if (!token || typeof token !== 'string') {
    return NextResponse.json({ error: 'Token tidak valid' }, { status: 400 });
  }

  const supabase = createAdminClient();
  // Upsert agar tidak duplikat token yang sama
  await (supabase as any).from('fcm_tokens').upsert({ token }, { onConflict: 'token' });

  return NextResponse.json({ success: true });
}

// DELETE — hapus token (logout / revoke)
export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { token } = await req.json();
  if (!token) return NextResponse.json({ error: 'Token tidak valid' }, { status: 400 });

  const supabase = createAdminClient();
  await (supabase as any).from('fcm_tokens').delete().eq('token', token);

  return NextResponse.json({ success: true });
}

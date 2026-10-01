import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/actions/admin';

// GET — ambil notifikasi terbaru (50 item)
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data, error } = await (supabase as any)
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ notifications: data || [] });
}

// PATCH — mark satu notifikasi as read
export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, markAll } = await req.json();
  const supabase = createAdminClient();

  if (markAll) {
    await (supabase as any).from('notifications').update({ is_read: true }).eq('is_read', false);
  } else if (id) {
    await (supabase as any).from('notifications').update({ is_read: true }).eq('id', id);
  }

  return NextResponse.json({ success: true });
}

// DELETE — hapus notifikasi (single id atau semua)
export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, deleteAll } = await req.json();
    const supabase = createAdminClient();

    if (deleteAll) {
      const { error } = await (supabase as any)
        .from('notifications')
        .delete()
        .gte('created_at', '1970-01-01T00:00:00Z');
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else if (id) {
      const { error } = await (supabase as any)
        .from('notifications')
        .delete()
        .eq('id', id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

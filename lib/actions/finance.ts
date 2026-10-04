'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/actions/admin';
import type { Database } from '@/lib/supabase/database.types';
import type { Expense } from '@/lib/types';

type ExpenseRow = Database['public']['Tables']['expenses']['Row'];

function mapExpense(row: ExpenseRow): Expense {
  return {
    id: row.id,
    type: (row.type as Expense['type']) || 'expense',
    date: row.date,
    title: row.title,
    category: row.category,
    customCategory: row.custom_category ?? undefined,
    amount: Number(row.amount) || 0,
    bookingId: row.booking_id ?? undefined,
    bookingCode: row.booking_code ?? undefined,
    customerName: row.customer_name ?? undefined,
    paymentMethod: (row.payment_method as Expense['paymentMethod']) ?? 'transfer',
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Mengambil seluruh data transaksi keuangan (pengeluaran & pemasukan manual)
 */
export async function getAllExpenses(): Promise<Expense[]> {
  if (!(await requireAdmin())) return [];
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error || !data) {
    if (error) console.error('Error fetching expenses:', error.message);
    return [];
  }

  return (data as ExpenseRow[]).map(mapExpense);
}

export interface CreateExpensePayload {
  type?: 'expense' | 'income';
  date: string;
  title: string;
  category: string;
  customCategory?: string;
  amount: number;
  bookingId?: string;
  bookingCode?: string;
  customerName?: string;
  paymentMethod?: 'cash' | 'transfer' | 'other';
  notes?: string;
}

/**
 * Menambahkan catatan pengeluaran / pemasukan baru
 */
export async function createExpense(
  payload: CreateExpensePayload
): Promise<{ success: boolean; data?: Expense; error?: string }> {
  if (!(await requireAdmin())) return { success: false, error: 'Unauthorized' };

  if (!payload.title?.trim()) {
    return { success: false, error: 'Keterangan transaksi wajib diisi.' };
  }
  if (!payload.amount || payload.amount <= 0) {
    return { success: false, error: 'Nominal transaksi harus lebih besar dari 0.' };
  }
  if (!payload.category) {
    return { success: false, error: 'Kategori transaksi wajib dipilih.' };
  }

  const supabase = createAdminClient();

  const insertData = {
    type: payload.type || 'expense',
    date: payload.date || new Date().toISOString().split('T')[0],
    title: payload.title.trim(),
    category: payload.category,
    custom_category: payload.category === 'other' ? payload.customCategory?.trim() || null : null,
    amount: payload.amount,
    booking_id: payload.bookingId || null,
    booking_code: payload.bookingCode || null,
    customer_name: payload.customerName || null,
    payment_method: payload.paymentMethod || 'transfer',
    notes: payload.notes?.trim() || null,
  };

  const { data, error } = await supabase
    .from('expenses')
    .insert(insertData)
    .select()
    .single();

  if (error || !data) {
    console.error('Error inserting expense:', error?.message);
    return { success: false, error: error?.message || 'Gagal menyimpan transaksi.' };
  }

  revalidatePath('/admin/dashboard');
  revalidatePath('/admin/dashboard/finance');

  return { success: true, data: mapExpense(data as ExpenseRow) };
}

/**
 * Memperbarui catatan transaksi
 */
export async function updateExpense(
  id: string,
  payload: Partial<CreateExpensePayload>
): Promise<{ success: boolean; data?: Expense; error?: string }> {
  if (!(await requireAdmin())) return { success: false, error: 'Unauthorized' };

  const supabase = createAdminClient();

  const updateData: Database['public']['Tables']['expenses']['Update'] = {
    updated_at: new Date().toISOString(),
  };

  if (payload.type !== undefined) updateData.type = payload.type;
  if (payload.date !== undefined) updateData.date = payload.date;
  if (payload.title !== undefined) updateData.title = payload.title.trim();
  if (payload.category !== undefined) {
    updateData.category = payload.category;
    updateData.custom_category =
      payload.category === 'other' ? payload.customCategory?.trim() || null : null;
  }
  if (payload.amount !== undefined) updateData.amount = payload.amount;
  if (payload.bookingId !== undefined) updateData.booking_id = payload.bookingId || null;
  if (payload.bookingCode !== undefined) updateData.booking_code = payload.bookingCode || null;
  if (payload.customerName !== undefined) updateData.customer_name = payload.customerName || null;
  if (payload.paymentMethod !== undefined) updateData.payment_method = payload.paymentMethod;
  if (payload.notes !== undefined) updateData.notes = payload.notes?.trim() || null;

  const { data, error } = await supabase
    .from('expenses')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    console.error('Error updating expense:', error?.message);
    return { success: false, error: error?.message || 'Gagal memperbarui transaksi.' };
  }

  revalidatePath('/admin/dashboard');
  revalidatePath('/admin/dashboard/finance');

  return { success: true, data: mapExpense(data as ExpenseRow) };
}

/**
 * Menghapus transaksi
 */
export async function deleteExpense(id: string): Promise<{ success: boolean; error?: string }> {
  if (!(await requireAdmin())) return { success: false, error: 'Unauthorized' };

  const supabase = createAdminClient();
  const { error } = await supabase.from('expenses').delete().eq('id', id);

  if (error) {
    console.error('Error deleting expense:', error.message);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/dashboard');
  revalidatePath('/admin/dashboard/finance');

  return { success: true };
}

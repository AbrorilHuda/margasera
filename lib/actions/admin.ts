'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { Database } from '@/lib/supabase/database.types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

/** Guard: wajib dipanggil di awal tiap server action admin.
 *  Mengembalikan true jika user login dan role-nya admin/staff. */
export async function requireAdmin(): Promise<boolean> {
  const { isAdmin } = await getAdminSession();
  return isAdmin;
}

/** Login admin dengan email & password */
export async function signInAdmin(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return {
      success: false,
      error: 'Email atau password salah. Silakan coba lagi.',
    };
  }

  return { success: true };
}

/** Logout admin */
export async function signOutAdmin(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/admin/login');
}

/** Cek apakah user yang sedang login adalah admin */
export async function getAdminSession(): Promise<{
  isAdmin: boolean;
  email?: string;
  name?: string;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { isAdmin: false };

  // Cek profile role di tabel profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, role')
    .eq('id', user.id)
    .single();

  const prof = profile as Pick<ProfileRow, 'name' | 'role'> | null;

  if (!prof || !['admin', 'staff'].includes(prof.role)) {
    return { isAdmin: false };
  }

  return {
    isAdmin: true,
    email: user.email,
    name: prof.name ?? user.email,
  };
}

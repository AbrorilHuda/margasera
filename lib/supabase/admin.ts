import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

/**
 * Admin Supabase client menggunakan Service Role Key.
 * HANYA untuk Server Actions dan Route Handlers.
 * JANGAN digunakan di Client Components atau browser.
 */
let adminClientInstance: ReturnType<typeof createClient<Database>> | null = null;

export function createAdminClient() {
  if (adminClientInstance) return adminClientInstance;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!url || !key) {
    console.warn('Supabase URL or Key is missing in environment variables.');
  }

  adminClientInstance = createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  return adminClientInstance;
}

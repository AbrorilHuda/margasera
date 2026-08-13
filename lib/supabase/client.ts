import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';

let browserClientInstance: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createClient() {
  if (typeof window !== 'undefined' && browserClientInstance) {
    return browserClientInstance;
  }

  const client = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  if (typeof window !== 'undefined') {
    browserClientInstance = client;
  }

  return client;
}

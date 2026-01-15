/**
 * Supabase Client
 *
 * Provides Supabase clients for browser and server contexts.
 */

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

// Get env vars - may be missing during build time
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if we have valid Supabase configuration
const hasValidSupabaseConfig =
  supabaseUrl &&
  !supabaseUrl.includes('[YOUR-PROJECT-REF]') &&
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey;

// Singleton instance for browser client
let browserClient: SupabaseClient | null = null;

/**
 * Browser client - uses anon key, handles auth cookies automatically
 */
export function createClient(): SupabaseClient {
  if (!hasValidSupabaseConfig) {
    throw new Error(
      'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
    );
  }

  if (!browserClient) {
    browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  return browserClient;
}

/**
 * Get client safely - returns null if not configured
 */
export function getClientSafe(): SupabaseClient | null {
  if (!hasValidSupabaseConfig) {
    return null;
  }
  return createClient();
}

// Lazy getter for default export
export default {
  get client() {
    return createClient();
  },
};

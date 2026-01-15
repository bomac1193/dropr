/**
 * Supabase Server Client
 *
 * For use in API routes and server components.
 */

import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

// Get env vars with fallbacks for build time
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if we have valid Supabase configuration
const hasValidSupabaseConfig =
  supabaseUrl &&
  !supabaseUrl.includes('[YOUR-PROJECT-REF]') &&
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey;

/**
 * Create a Supabase client for Server Components
 * Reads auth session from cookies
 */
export async function createServerClient() {
  if (!hasValidSupabaseConfig) {
    throw new Error(
      'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
    );
  }

  const cookieStore = await cookies();

  return createSupabaseServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing sessions.
        }
      },
    },
  });
}

/**
 * Create a Supabase admin client with service role
 * Bypasses RLS - use carefully!
 */
export function createAdminClient() {
  if (!hasValidSupabaseConfig) {
    throw new Error(
      'Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL in .env.local'
    );
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin operations');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

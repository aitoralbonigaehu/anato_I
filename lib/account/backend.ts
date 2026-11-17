import { mockBackend } from './mock';
import { supabaseBackend } from './supabase';
import type { AccountBackend } from './types';

/**
 * Which backend accounts use: Supabase when lib/account/supabase.ts provides one and
 * NEXT_PUBLIC_ACCOUNTS=supabase; in development, the pretend one when this browser asks for it
 * (`localStorage['enbrioatlas:dev-kontuak'] = 'mock'`); otherwise none (accounts off).
 */
export function getBackend(): AccountBackend | null {
  if (process.env.NEXT_PUBLIC_ACCOUNTS === 'supabase' && supabaseBackend) return supabaseBackend;
  if (process.env.NODE_ENV !== 'production') {
    try {
      if (window.localStorage.getItem('enbrioatlas:dev-kontuak') === 'mock') return mockBackend;
    } catch {
      // No storage: no pretend accounts.
    }
  }
  return null;
}

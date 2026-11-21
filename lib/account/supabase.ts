import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';
import type { ProgressBlob } from './snapshot';
import { checkName, checkPin, type AccountBackend, type AccountUser, type AuthError, type AuthResult } from './types';

// This module is also imported during server rendering. Only construct a browser client on demand.
let client: SupabaseClient | null = null;
function browserClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (typeof window === 'undefined' || !url || !key) return null;
  return (client ??= createClient(url, key, { auth: { persistSession: true, detectSessionInUrl: false } }));
}

function accountUser(user: User): AccountUser {
  const metadata = user.user_metadata ?? {};
  return {
    id: user.id,
    name: metadata.name || metadata.full_name || '',
    provider: 'pin',
  };
}

async function pinAuth(action: 'signin' | 'signup', name: string, pin: string): Promise<AuthResult> {
  if (checkName(name) || checkPin(pin)) return { ok: false, error: 'invalid' };
  const supabase = browserClient();
  if (!supabase) return { ok: false, error: 'unavailable' };
  try {
    const response = await fetch('/api/kontua/pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, name, pin }),
    });
    const result = await response.json();
    if (!response.ok || !result.ok) {
      const allowed: AuthError[] = ['taken', 'wrong', 'locked', 'invalid', 'unavailable', 'network'];
      const error: AuthError = allowed.includes(result.error) ? result.error : 'network';
      return { ok: false, error, ...(typeof result.retryAfterSec === 'number' ? { retryAfterSec: result.retryAfterSec } : {}) };
    }
    const { data, error } = await supabase.auth.setSession(result.session);
    if (error || !data.user) return { ok: false, error: 'network' };
    return { ok: true, user: accountUser(data.user) };
  } catch {
    return { ok: false, error: 'network' };
  }
}

export const supabaseBackend: AccountBackend = {
  kind: 'supabase',
  async currentUser() {
    const supabase = browserClient();
    if (!supabase) return null;
    const { data, error } = await supabase.auth.getSession();
    return !error && data.session?.user ? accountUser(data.session.user) : null;
  },
  onSessionChange(listener) {
    browserClient()?.auth.onAuthStateChange((_event, session) => {
      listener(session?.user ? accountUser(session.user) : null);
    });
  },
  signInWithPin: (name, pin) => pinAuth('signin', name, pin),
  signUpWithPin: (name, pin) => pinAuth('signup', name, pin),
  async signOut() {
    const supabase = browserClient();
    if (!supabase) throw new Error('Supabase is not configured');
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
  async loadProgress(owner) {
    const supabase = browserClient();
    if (!supabase) throw new Error('Supabase is not configured');
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || session.session?.user.id !== owner) throw sessionError ?? new Error('Study account changed');
    const { data, error } = await supabase.from('user_progress').select('data,updated_at').eq('user_id', owner).maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const blob = data.data as ProgressBlob;
    if (blob?.v !== 1 || !Number.isFinite(blob.savedAt) || !blob.data ||
        typeof blob.data !== 'object' || Array.isArray(blob.data) || typeof data.updated_at !== 'string') {
      throw new Error('Invalid saved study progress');
    }
    return { blob, revision: data.updated_at };
  },
  async saveProgress(owner, blob, revision) {
    try {
      const supabase = browserClient();
      if (!supabase) return 'failed';
      const { data: session } = await supabase.auth.getSession();
      if (session.session?.user.id !== owner) return 'failed';
      const table = supabase.from('user_progress');
      if (revision === null) {
        const { error } = await table.insert({ user_id: owner, data: blob });
        return error?.code === '23505' ? 'conflict' : error ? 'failed' : 'saved';
      }
      const { data, error } = await table.update({ data: blob })
        .eq('user_id', owner).eq('updated_at', revision).select('user_id').maybeSingle();
      return error ? 'failed' : data ? 'saved' : 'conflict';
    } catch {
      return 'failed';
    }
  },
};

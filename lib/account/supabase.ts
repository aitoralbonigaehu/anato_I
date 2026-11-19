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
  async loadProgress() {
    const supabase = browserClient();
    if (!supabase) throw new Error('Supabase is not configured');
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session.session?.user) throw sessionError ?? new Error('No active session');
    const { data, error } = await supabase.from('user_progress').select('data').eq('user_id', session.session.user.id).maybeSingle();
    if (error) throw error;
    return data ? data.data as ProgressBlob : null;
  },
  async saveProgress(blob) {
    try {
      const supabase = browserClient();
      if (!supabase) return false;
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) return false;
      const { error } = await supabase.from('user_progress').upsert({ user_id: session.session.user.id, data: blob });
      return !error;
    } catch {
      return false;
    }
  },
};

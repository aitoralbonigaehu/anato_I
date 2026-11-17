import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const user = { id: 'user-1', user_metadata: { name: 'Ane', provider: 'pin' } };
  const maybeSingle = vi.fn();
  const eq = vi.fn(() => ({ maybeSingle }));
  const select = vi.fn(() => ({ eq }));
  const upsert = vi.fn();
  return {
    user, maybeSingle, eq, select, upsert,
    getSession: vi.fn(), setSession: vi.fn(), signInWithOAuth: vi.fn(), signOut: vi.fn(),
  };
});

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: { getSession: mocks.getSession, setSession: mocks.setSession, signInWithOAuth: mocks.signInWithOAuth, signOut: mocks.signOut },
    from: () => ({ select: mocks.select, upsert: mocks.upsert }),
  }),
}));

import { supabaseBackend } from '@/lib/account/supabase';

beforeEach(() => {
  vi.stubGlobal('window', { location: { href: 'https://example.com/aurrerapena' } });
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'public-key');
  mocks.getSession.mockResolvedValue({ data: { session: { user: mocks.user } }, error: null });
  mocks.setSession.mockResolvedValue({ data: { user: mocks.user }, error: null });
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.clearAllMocks(); });

describe('Supabase account client', () => {
  it('restores a PIN session and saves and loads only the current user progress', async () => {
    const blob = { v: 1 as const, savedAt: 1, data: {} };
    mocks.maybeSingle.mockResolvedValue({ data: { data: blob }, error: null });
    mocks.upsert.mockResolvedValue({ error: null });
    expect(await supabaseBackend.currentUser()).toEqual({ id: 'user-1', name: 'Ane', provider: 'pin' });
    expect(await supabaseBackend.loadProgress()).toEqual(blob);
    expect(mocks.eq).toHaveBeenCalledWith('user_id', 'user-1');
    expect(await supabaseBackend.saveProgress(blob as never)).toBe(true);
    expect(mocks.upsert).toHaveBeenCalledWith({ user_id: 'user-1', data: blob });
  });

  it('sends PIN requests and installs the returned session', async () => {
    const session = { access_token: 'access', refresh_token: 'refresh' };
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true, session }) });
    vi.stubGlobal('fetch', fetchMock);
    expect(await supabaseBackend.signInWithPin('Ane', '1234')).toEqual({ ok: true, user: { id: 'user-1', name: 'Ane', provider: 'pin' } });
    expect(fetchMock).toHaveBeenCalledWith('/api/kontua/pin', expect.objectContaining({ body: JSON.stringify({ action: 'signin', name: 'Ane', pin: '1234' }) }));
    expect(mocks.setSession).toHaveBeenCalledWith(session);
  });

  it('preserves lock errors and handles failed storage operations', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({ ok: false, error: 'locked', retryAfterSec: 60 }) }));
    expect(await supabaseBackend.signInWithPin('Ane', '1234')).toEqual({ ok: false, error: 'locked', retryAfterSec: 60 });
    mocks.upsert.mockResolvedValue({ error: { message: 'offline' } });
    expect(await supabaseBackend.saveProgress({} as never)).toBe(false);
  });

  it('distinguishes a missing progress row from a failed read', async () => {
    mocks.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    expect(await supabaseBackend.loadProgress()).toBeNull();
    mocks.maybeSingle.mockResolvedValueOnce({ data: null, error: new Error('offline') });
    await expect(supabaseBackend.loadProgress()).rejects.toThrow('offline');
  });

  it('does not report a successful sign-out when Supabase rejects it', async () => {
    mocks.signOut.mockResolvedValueOnce({ error: new Error('offline') });
    await expect(supabaseBackend.signOut()).rejects.toThrow('offline');
  });
});

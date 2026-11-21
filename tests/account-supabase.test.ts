import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const user = { id: 'user-1', user_metadata: { name: 'Ane', provider: 'pin' } };
  const maybeSingle = vi.fn();
  const eq = vi.fn(() => ({ maybeSingle }));
  const select = vi.fn(() => ({ eq }));
  const insert = vi.fn();
  const updateResult = vi.fn();
  const revisionFilter = vi.fn(() => ({ select: () => ({ maybeSingle: updateResult }) }));
  const ownerFilter = vi.fn(() => ({ eq: revisionFilter }));
  const update = vi.fn(() => ({ eq: ownerFilter }));
  return {
    user, maybeSingle, eq, select, insert, update, ownerFilter, revisionFilter, updateResult,
    getSession: vi.fn(), setSession: vi.fn(), signInWithOAuth: vi.fn(), signOut: vi.fn(),
  };
});

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: { getSession: mocks.getSession, setSession: mocks.setSession, signInWithOAuth: mocks.signInWithOAuth, signOut: mocks.signOut },
    from: () => ({ select: mocks.select, insert: mocks.insert, update: mocks.update }),
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
    const revision = '2026-11-21T17:00:00+00:00';
    mocks.maybeSingle.mockResolvedValue({ data: { data: blob, updated_at: revision }, error: null });
    mocks.insert.mockResolvedValue({ error: null });
    expect(await supabaseBackend.currentUser()).toEqual({ id: 'user-1', name: 'Ane', provider: 'pin' });
    expect(await supabaseBackend.loadProgress('user-1')).toEqual({ blob, revision });
    expect(mocks.eq).toHaveBeenCalledWith('user_id', 'user-1');
    expect(await supabaseBackend.saveProgress('user-1', blob, null)).toBe('saved');
    expect(mocks.insert).toHaveBeenCalledWith({ user_id: 'user-1', data: blob });
    mocks.updateResult.mockResolvedValueOnce({ data: { user_id: 'user-1' }, error: null });
    expect(await supabaseBackend.saveProgress('user-1', blob, revision)).toBe('saved');
    expect(mocks.ownerFilter).toHaveBeenCalledWith('user_id', 'user-1');
    expect(mocks.revisionFilter).toHaveBeenCalledWith('updated_at', revision);
    mocks.updateResult.mockResolvedValueOnce({ data: null, error: null });
    expect(await supabaseBackend.saveProgress('user-1', blob, revision)).toBe('conflict');
    mocks.insert.mockResolvedValueOnce({ error: { code: '23505' } });
    expect(await supabaseBackend.saveProgress('user-1', blob, null)).toBe('conflict');
    expect(await supabaseBackend.saveProgress('user-2', blob, null)).toBe('failed');
    expect(mocks.insert).toHaveBeenCalledTimes(2);
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
    mocks.insert.mockResolvedValue({ error: { message: 'offline' } });
    expect(await supabaseBackend.saveProgress('user-1', { v: 1, savedAt: 1, data: {} }, null)).toBe('failed');
  });

  it('distinguishes a missing progress row from a failed read', async () => {
    mocks.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    expect(await supabaseBackend.loadProgress('user-1')).toBeNull();
    mocks.maybeSingle.mockResolvedValueOnce({ data: null, error: new Error('offline') });
    await expect(supabaseBackend.loadProgress('user-1')).rejects.toThrow('offline');
  });

  it('does not report a successful sign-out when Supabase rejects it', async () => {
    mocks.signOut.mockResolvedValueOnce({ error: new Error('offline') });
    await expect(supabaseBackend.signOut()).rejects.toThrow('offline');
  });
});

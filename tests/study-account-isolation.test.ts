import { afterEach, expect, it, vi } from 'vitest';
import type { AccountUser } from '@/lib/account/types';

const auth = vi.hoisted(() => ({
  user: null as AccountUser | null,
  listener: undefined as ((user: AccountUser | null) => void) | undefined,
}));

vi.mock('@/lib/account/backend', () => ({
  getBackend: () => ({
    kind: 'supabase',
    currentUser: async () => auth.user,
    onSessionChange: (listener: typeof auth.listener) => { auth.listener = listener; },
    signOut: async () => { auth.user = null; },
  }),
}));

afterEach(() => vi.unstubAllGlobals());

it('keeps legacy guest data and each account separate across changes and reloads', async () => {
  const answersKey = 'enbrioatlas:answers';
  const visitedKey = 'enbrioatlas:visited';
  const legacyAnswers = JSON.stringify({ guest: { right: 1 } });
  const values = new Map<string, string>([
    [answersKey, legacyAnswers],
    [visitedKey, JSON.stringify({ 7: ['guest-stage'] })],
  ]);
  const reload = vi.fn();
  vi.stubGlobal('window', {
    addEventListener: vi.fn(),
    setTimeout: (callback: () => void) => callback(),
    location: { replace: reload },
    localStorage: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    },
  });
  const ane: AccountUser = { id: '101', name: 'Ane', provider: 'pin' };
  const ion: AccountUser = { id: '102', name: 'Ion', provider: 'pin' };
  async function open(user: AccountUser | null) {
    vi.resetModules();
    auth.user = user;
    const account = await import('@/components/account/account');
    await account.startAccounts();
    const progress = await import('@/components/shell/progress');
    const answers = await import('@/components/shell/answers');
    const snapshots = await import('@/lib/account/snapshot');
    return { ...account, ...progress, ...answers, ...snapshots };
  }

  const first = await open(ane);
  expect(first.readVisited(7)).toEqual([]);
  expect(first.collectSnapshot()[answersKey]).toBeUndefined();
  first.markVisited(7, 'ane-stage');
  first.recordAnswer('ane-question', true);

  // A different tab signs in as Ion. Delayed work in the old document still belongs to Ane.
  auth.user = ion;
  auth.listener?.(ion);
  expect(reload).toHaveBeenCalledExactlyOnceWith('/aurrerapena');
  expect(first.accountState().status).toBe('loading');
  first.markVisited(7, 'last-ane-stage');

  const second = await open(ion);
  expect(second.readVisited(7)).toEqual([]);
  expect(second.collectSnapshot()[answersKey]).toBeUndefined();
  second.markVisited(7, 'ion-stage');
  await second.signOut();
  expect(reload).toHaveBeenCalledTimes(2);

  const guest = await open(null);
  expect(guest.readVisited(7)).toEqual(['guest-stage']);
  expect(values.get(answersKey)).toBe(legacyAnswers);
  const restored = await open(ane);
  expect(restored.readVisited(7)).toEqual(['ane-stage', 'last-ane-stage']);
  expect(restored.collectSnapshot()[answersKey]).toHaveProperty('ane-question');
  expect((await open(ion)).readVisited(7)).toEqual(['ion-stage']);
});

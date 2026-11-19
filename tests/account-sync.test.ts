import { afterEach, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  kind: 'mock', loadProgress: vi.fn(), saveProgress: vi.fn(), collectSnapshot: vi.fn(),
}));
vi.mock('@/lib/account/backend', () => ({
  getBackend: () => ({
    kind: mocks.kind,
    currentUser: async () => ({ id: 'user-1', name: 'Ane', provider: 'pin' }),
    loadProgress: mocks.loadProgress, saveProgress: mocks.saveProgress,
  }),
}));
vi.mock('@/lib/account/snapshot', () => ({
  collectSnapshot: mocks.collectSnapshot, applySnapshot: vi.fn(), mergeSnapshot: vi.fn(), sameSnapshot: vi.fn(),
}));


afterEach(() => vi.unstubAllGlobals());

it('does not push local progress when reading the remote copy fails', async () => {
  vi.stubGlobal('window', { setInterval: vi.fn(), addEventListener: vi.fn() });
  vi.stubGlobal('document', { addEventListener: vi.fn() });
  mocks.loadProgress.mockRejectedValue(new Error('offline'));
  const { startAccounts, syncNow } = await import('@/components/account/account');
  await startAccounts();
  await syncNow();
  expect(mocks.loadProgress).toHaveBeenCalled();
  expect(mocks.collectSnapshot).not.toHaveBeenCalled();
  expect(mocks.saveProgress).not.toHaveBeenCalled();
});

it('keeps progress local when a Supabase account signs in', async () => {
  vi.resetModules();
  vi.clearAllMocks();
  mocks.kind = 'supabase';
  vi.stubGlobal('window', { setInterval: vi.fn(), addEventListener: vi.fn() });
  vi.stubGlobal('document', { addEventListener: vi.fn() });
  const { accountState, startAccounts, syncNow } = await import('@/components/account/account');
  await startAccounts();
  await syncNow();
  expect(accountState().status).toBe('in');
  expect(mocks.loadProgress).not.toHaveBeenCalled();
  expect(mocks.collectSnapshot).not.toHaveBeenCalled();
  expect(mocks.saveProgress).not.toHaveBeenCalled();
});

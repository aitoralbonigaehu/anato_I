import { afterEach, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  loadProgress: vi.fn(), saveProgress: vi.fn(), collectSnapshot: vi.fn(),
}));
vi.mock('@/lib/account/backend', () => ({
  getBackend: () => ({
    currentUser: async () => ({ id: 'user-1', name: 'Ane', provider: 'pin' }),
    loadProgress: mocks.loadProgress, saveProgress: mocks.saveProgress,
  }),
}));
vi.mock('@/lib/account/snapshot', () => ({
  collectSnapshot: mocks.collectSnapshot, applySnapshot: vi.fn(), mergeSnapshot: vi.fn(), sameSnapshot: vi.fn(),
}));
import { startAccounts, syncNow } from '@/components/account/account';

afterEach(() => vi.unstubAllGlobals());

it('does not push local progress when reading the remote copy fails', async () => {
  vi.stubGlobal('window', { setInterval: vi.fn() });
  vi.stubGlobal('document', { addEventListener: vi.fn() });
  mocks.loadProgress.mockRejectedValue(new Error('offline'));
  await startAccounts();
  await syncNow();
  expect(mocks.loadProgress).toHaveBeenCalled();
  expect(mocks.collectSnapshot).not.toHaveBeenCalled();
  expect(mocks.saveProgress).not.toHaveBeenCalled();
});

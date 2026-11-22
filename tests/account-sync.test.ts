import { afterEach, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  kind: 'mock', loadProgress: vi.fn(), saveProgress: vi.fn(), collectSnapshot: vi.fn(), mergeSnapshot: vi.fn(),
}));
vi.mock('@/lib/account/backend', () => ({
  getBackend: () => ({
    kind: mocks.kind,
    currentUser: async () => ({ id: 'user-1', name: 'Ane', provider: 'pin' }),
    loadProgress: mocks.loadProgress, saveProgress: mocks.saveProgress,
  }),
}));
vi.mock('@/lib/account/snapshot', () => ({
  collectSnapshot: mocks.collectSnapshot, applySnapshot: vi.fn(), isEmptySnapshot: () => false,
  mergeSnapshot: mocks.mergeSnapshot, sameSnapshot: Object.is,
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

it('re-reads and merges Supabase progress when another device wins the first write', async () => {
  vi.resetModules();
  vi.clearAllMocks();
  mocks.kind = 'supabase';
  vi.stubGlobal('window', { setInterval: vi.fn(), addEventListener: vi.fn() });
  vi.stubGlobal('document', { addEventListener: vi.fn() });
  const local = { local: true };
  const remote = { remote: true };
  const merged = { ...local, ...remote };
  mocks.collectSnapshot.mockReturnValue(local);
  mocks.loadProgress.mockResolvedValueOnce(null).mockResolvedValueOnce({ blob: { data: remote }, revision: 'r1' });
  mocks.mergeSnapshot.mockReturnValue(merged);
  mocks.saveProgress.mockResolvedValueOnce('conflict').mockResolvedValueOnce('saved');
  const { accountState, startAccounts, syncNow } = await import('@/components/account/account');
  await startAccounts();
  await syncNow();
  expect(accountState().status).toBe('in');
  expect(accountState().synced).toBeGreaterThan(0);
  expect(mocks.loadProgress).toHaveBeenCalledTimes(2);
  expect(mocks.mergeSnapshot).toHaveBeenCalledWith(local, remote);
  expect(mocks.saveProgress).toHaveBeenNthCalledWith(1, 'user-1', expect.objectContaining({ data: local }), null);
  expect(mocks.saveProgress).toHaveBeenNthCalledWith(2, 'user-1', expect.objectContaining({ data: merged }), 'r1');
});

it('finishes syncing an edit made while the preceding write was pending', async () => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.stubGlobal('window', { setInterval: vi.fn(), addEventListener: vi.fn() });
  vi.stubGlobal('document', { addEventListener: vi.fn() });
  const initial = { marks: 'red' };
  const final = { marks: null };
  mocks.collectSnapshot.mockReturnValueOnce(initial).mockReturnValueOnce(final);
  mocks.loadProgress.mockResolvedValueOnce(null).mockResolvedValueOnce({ blob: { data: initial }, revision: 'r1' });
  mocks.mergeSnapshot.mockReturnValueOnce(final);

  let completeFirstWrite!: (result: 'saved') => void;
  const firstWrite = new Promise<'saved'>((resolve) => { completeFirstWrite = resolve; });
  mocks.saveProgress.mockReturnValueOnce(firstWrite).mockResolvedValueOnce('saved');
  const { requestProgressSync, startAccounts, syncNow } = await import('@/components/account/account');
  await startAccounts();
  await vi.waitFor(() => expect(mocks.saveProgress).toHaveBeenCalledTimes(1));

  requestProgressSync();
  const syncing = syncNow();
  completeFirstWrite('saved');
  await syncing;
  expect(mocks.saveProgress).toHaveBeenNthCalledWith(2, 'user-1', expect.objectContaining({ data: final }), 'r1');
});

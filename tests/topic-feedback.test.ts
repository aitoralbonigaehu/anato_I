import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from '@/app/api/feedback/route';

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  maybeSingle: vi.fn(),
  upsert: vi.fn(),
}));
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: { getUser: mocks.getUser },
    from: (table: string) => table === 'pin_accounts'
      ? { select: () => ({ eq: () => ({ maybeSingle: mocks.maybeSingle }) }) }
      : { upsert: mocks.upsert },
  }),
}));

const base = { topic: 17, clarity: 5, navigation: 4, comment: '  Ona  ', id: '817143a8-672b-42d8-9c78-bab91bd26f8a' };
const request = (body: object, headers: HeadersInit = {}) =>
  new Request('https://example.test/api/feedback', { method: 'POST', headers, body: JSON.stringify(body) });

describe('topic feedback', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv('SUPABASE_URL', 'https://example.test');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-key');
    mocks.upsert.mockReturnValue({ abortSignal: async () => ({ error: null }) });
  });
  afterEach(() => vi.unstubAllEnvs());

  it('stores only coarse browser data for visitors and trims the optional comment', async () => {
    const response = await POST(request({ ...base, account_name: 'fake' }, {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0',
    }));
    expect(response.status).toBe(204);
    expect(mocks.upsert.mock.calls[0][0]).toEqual({
      submission_id: base.id, topic: 17, clarity: 5, navigation: 4, comment: 'Ona',
      user_id: null, account_name: null, device: 'desktop', os: 'Windows', browser: 'Firefox',
    });
  });

  it('uses the verified account name and omits browser metadata for signed-in students', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'verified' } }, error: null });
    mocks.maybeSingle.mockResolvedValue({ data: { name: 'Ane' }, error: null });
    expect((await POST(request(base, { authorization: 'Bearer session' }))).status).toBe(204);
    expect(mocks.getUser).toHaveBeenCalledWith('session');
    expect(mocks.upsert.mock.calls[0][0]).toMatchObject({
      user_id: 'verified', account_name: 'Ane', device: null, os: null, browser: null,
    });
  });

  it('rejects invalid ratings, cross-site submissions and expired sessions', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: true });
    expect((await POST(request({ ...base, clarity: 6 }))).status).toBe(400);
    expect((await POST(request(base, { 'sec-fetch-site': 'cross-site' }))).status).toBe(403);
    expect((await POST(request(base, { authorization: 'Bearer expired' }))).status).toBe(401);
    expect(mocks.upsert).not.toHaveBeenCalled();
  });
});

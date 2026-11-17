import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from '../app/api/kontua/pin/route';

const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
const request = (body: unknown) => new Request('http://localhost/api/kontua/pin', {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
});

describe('PIN endpoint', () => {
  beforeEach(() => {
    vi.stubEnv('SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon');
    vi.stubEnv('PIN_PEPPER', Buffer.alloc(32, 7).toString('base64'));
    vi.stubEnv('PIN_EMAIL_DOMAIN', 'pin.example.org');
    vi.stubEnv('VERCEL', '0');
  });
  afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

  it('rejects invalid data without contacting Supabase', async () => {
    const fetchMock = vi.fn(); vi.stubGlobal('fetch', fetchMock);
    const response = await POST(request({ action: 'signin', name: 'Ane', pin: '12' }));
    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('reserves the attempt before authentication and returns a session for the matching registry user', async () => {
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(reply({ allowed: true }))
      .mockResolvedValueOnce(reply([{ user_id: 'user-1', name: 'Ané' }]))
      .mockResolvedValueOnce(reply({ user: { id: 'user-1' }, access_token: 'access', refresh_token: 'refresh' }))
      .mockResolvedValueOnce(reply(null));
    vi.stubGlobal('fetch', fetchMock);
    const response = await POST(request({ action: 'signin', name: 'ANE', pin: '4321' }));
    expect(await response.json()).toEqual({ ok: true, user: { id: 'user-1', name: 'Ané', provider: 'pin' }, session: { access_token: 'access', refresh_token: 'refresh' } });
    expect(String(fetchMock.mock.calls[0][0])).toContain('/rpc/pin_reserve_attempt');
    const reservation = JSON.parse(fetchMock.mock.calls[0][1]!.body as string);
    expect(reservation.p_name_key).toBe('ane');
    expect(reservation.p_ip_key).not.toContain('unknown');
    expect(String(fetchMock.mock.calls[2][0])).toContain('/auth/v1/token');
    expect(JSON.parse(fetchMock.mock.calls[3][1]!.body as string).p_token).toBe(reservation.p_token);
    expect(response.headers.get('cache-control')).toBe('no-store');
  });

  it('does not try a PIN when the distributed reservation rejects it', async () => {
    const fetchMock = vi.fn().mockResolvedValue(reply({ allowed: false, retry_after: 60 }));
    vi.stubGlobal('fetch', fetchMock);
    const response = await POST(request({ action: 'signin', name: 'Ane', pin: '4321' }));
    expect(response.status).toBe(429);
    expect(await response.json()).toEqual({ ok: false, error: 'locked', retryAfterSec: 60 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('fails closed when the reservation is unavailable', async () => {
    const fetchMock = vi.fn().mockResolvedValue(reply({}, 500)); vi.stubGlobal('fetch', fetchMock);
    const response = await POST(request({ action: 'signin', name: 'Ane', pin: '4321' }));
    expect(response.status).toBe(503);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('never returns a session for a user absent from the name registry', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(reply({ allowed: true })).mockResolvedValueOnce(reply([]))
      .mockResolvedValueOnce(reply({ user: { id: 'orphan' }, access_token: 'access', refresh_token: 'refresh' }));
    vi.stubGlobal('fetch', fetchMock);
    const response = await POST(request({ action: 'signin', name: 'Ane', pin: '4321' }));
    expect(await response.json()).toEqual({ ok: false, error: 'wrong' });
  });

  it('recovers an orphan only after verifying its PIN and reserving an attempt', async () => {
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(reply({ allowed: true })).mockResolvedValueOnce(reply([]))
      .mockResolvedValueOnce(reply({ code: 'email_exists' }, 422))
      .mockResolvedValueOnce(reply({ user: { id: 'orphan' }, access_token: 'access', refresh_token: 'refresh' }))
      .mockResolvedValueOnce(reply(null, 201)).mockResolvedValueOnce(reply(null));
    vi.stubGlobal('fetch', fetchMock);
    const response = await POST(request({ action: 'signup', name: 'Ane', pin: '4321' }));
    expect(response.status).toBe(200);
    expect(JSON.parse(fetchMock.mock.calls[0][1]!.body as string).p_signin).toBe(true);
    expect(JSON.parse(fetchMock.mock.calls[4][1]!.body as string).user_id).toBe('orphan');
    expect(String(fetchMock.mock.calls[5][0])).toContain('pin_complete_success');
  });

  it('does not delete a user if concurrent recovery already registered that same user', async () => {
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(reply({ allowed: true })).mockResolvedValueOnce(reply([]))
      .mockResolvedValueOnce(reply({ id: 'user-1' }, 201)).mockResolvedValueOnce(reply({}, 409))
      .mockResolvedValueOnce(reply([{ user_id: 'user-1' }]));
    vi.stubGlobal('fetch', fetchMock);
    const response = await POST(request({ action: 'signup', name: 'Ane', pin: '4321' }));
    expect(await response.json()).toEqual({ ok: false, error: 'taken' });
    expect(fetchMock).toHaveBeenCalledTimes(5);
  });
});

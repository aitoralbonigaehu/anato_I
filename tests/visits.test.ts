import { describe, expect, it } from 'vitest';
import { parseUa } from '@/lib/visits/parse';

describe('visit collector', () => {
  it('names browser, system and device', () => {
    const win = parseUa('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36');
    expect(win).toMatchObject({ browser: 'Chrome', browserVersion: '141', os: 'Windows', device: 'desktop', bot: false });
    const edge = parseUa('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.3537.71');
    expect(edge.browser).toBe('Edge');
    const iphone = parseUa('Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1');
    expect(iphone).toMatchObject({ browser: 'Safari', os: 'iOS', osVersion: '18.6', device: 'mobile' });
    const ipadDesktop = parseUa('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15', 5);
    expect(ipadDesktop).toMatchObject({ os: 'iPadOS', device: 'tablet' });
    const mac = parseUa('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15', 0);
    expect(mac).toMatchObject({ os: 'macOS', device: 'desktop' });
    const tab = parseUa('Mozilla/5.0 (Linux; Android 14; SM-X710) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36');
    expect(tab).toMatchObject({ os: 'Android', device: 'tablet' });
    const phone = parseUa('Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36');
    expect(phone.device).toBe('mobile');
    const ff = parseUa('Mozilla/5.0 (X11; Linux x86_64; rv:144.0) Gecko/20100101 Firefox/144.0');
    expect(ff).toMatchObject({ browser: 'Firefox', os: 'Linux' });
    expect(parseUa('Googlebot/2.1 (+http://www.google.com/bot.html)').bot).toBe(true);
  });

});

describe('/api/bisita', () => {
  it('requires production opt-in and reports a rejected insert without exposing the key', async () => {
    const { vi } = await import('vitest');
    const { POST } = await import('@/app/api/bisita/route');
    const send = vi.fn().mockResolvedValue(new Response(null, { status: 403 }));
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.stubGlobal('fetch', send);
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('SUPABASE_URL', 'https://proba.supabase.co');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'sb_secret_proba');
    vi.stubEnv('VISITS_ENABLED', '0');
    const req = () => new Request('http://x/api/bisita', { method: 'POST', body: '{}' });
    try {
      expect((await POST(req())).status).toBe(204);
      expect(send).not.toHaveBeenCalled();
      vi.stubEnv('VISITS_ENABLED', '1');
      expect((await POST(req())).status).toBe(502);
      const headers = new Headers(send.mock.calls[0][1].headers);
      expect(headers.get('apikey')).toBe('sb_secret_proba');
      expect(headers.has('authorization')).toBe(false);
      expect(warn).toHaveBeenCalledWith('[visits] Supabase rejected insert', { status: 403 });
    } finally {
      warn.mockRestore();
      vi.unstubAllGlobals();
      vi.unstubAllEnvs();
    }
  });

  it('only writes the categories used by the views, even when a legacy client submits extra data', async () => {
    const { vi } = await import('vitest');
    const { POST } = await import('@/app/api/bisita/route');
    const calls: { url: string; body: Record<string, unknown> }[] = [];
    vi.stubGlobal('fetch', async (url: string, init: RequestInit) => {
      calls.push({ url, body: JSON.parse(String(init.body)) });
      return new Response(null, { status: 201 });
    });
    const req = () =>
      new Request('http://x/api/bisita', {
        method: 'POST',
        headers: {
          'x-forwarded-for': '85.84.12.201, 10.0.0.1',
          'x-vercel-ip-city': 'Donostia%20-%20San%20Sebasti%C3%A1n',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
        },
        body: JSON.stringify({ path: '/astea/7', ref: 'https://www.google.com/search?q=x', hour: 22, sw: 1920, tz: 'Europe/Madrid', touch: 0, scheme: 'dark', evil: 'x'.repeat(9999) }),
      });
    try {
      expect((await POST(req())).status).toBe(204);
      expect(calls).toHaveLength(0);
      vi.stubEnv('SUPABASE_URL', 'https://proba.supabase.co/');
      vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'k');
      expect((await POST(req())).status).toBe(204);
      expect(calls).toHaveLength(1);
      expect(calls[0].url).toBe('https://proba.supabase.co/rest/v1/visits');
      expect(calls[0].body).toEqual({ browser: 'Chrome', os: 'Windows', device: 'desktop', is_bot: false });
      const crossSite = new Request('http://x/api/bisita', { method: 'POST', headers: { 'Sec-Fetch-Site': 'cross-site' } });
      expect((await POST(crossSite)).status).toBe(403);
      expect(calls).toHaveLength(1);
    } finally {
      vi.unstubAllGlobals();
      vi.unstubAllEnvs();
    }
  });
});

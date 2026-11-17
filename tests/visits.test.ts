import { describe, expect, it } from 'vitest';
import { clientIp, parseUa, referrerSite, truncateIp } from '@/lib/visits/parse';

describe('visit collector', () => {
  it('shortens IPv4 to its /24 and IPv6 to its /48', () => {
    expect(truncateIp('85.84.12.201')).toBe('85.84.12.0');
    expect(truncateIp('::ffff:10.1.2.3')).toBe('10.1.2.0');
    expect(truncateIp('2a02:9130:84a3:1:abcd::17')).toBe('2a02:9130:84a3::');
    expect(truncateIp('2001:db8::1')).toBe('2001:db8:0::');
    expect(truncateIp('fe80::1%eth0')).toBe('fe80:0:0::');
    expect(truncateIp('not-an-ip')).toBeNull();
    expect(truncateIp(null)).toBeNull();
  });

  it('takes the first hop of x-forwarded-for', () => {
    expect(clientIp(new Headers({ 'x-forwarded-for': '85.84.12.201, 10.0.0.1' }))).toBe('85.84.12.201');
    expect(clientIp(new Headers({ 'x-real-ip': '1.2.3.4' }))).toBe('1.2.3.4');
    expect(clientIp(new Headers())).toBeNull();
  });

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

  it('keeps only the site of a referrer', () => {
    expect(referrerSite('https://www.google.com/search?q=ane+proba')).toBe('www.google.com');
    expect(referrerSite('nonsense')).toBeNull();
    expect(referrerSite(42)).toBeNull();
  });
});

describe('/api/bisita', () => {
  it('stores one row with the shortened IP, and nothing without Supabase', async () => {
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
      expect(calls[0].body).toMatchObject({ ip_trunc: '85.84.12.0', city: 'Donostia - San Sebastián', browser: 'Chrome', os: 'Windows', device: 'desktop', path: '/astea/7', referrer: 'www.google.com', local_hour: 22, screen_w: 1920, timezone: 'Europe/Madrid', color_scheme: 'dark', signed_in: false });
      expect(JSON.stringify(calls[0].body)).not.toContain('85.84.12.201');
      expect(calls[0].body).not.toHaveProperty('evil');
    } finally {
      vi.unstubAllGlobals();
      vi.unstubAllEnvs();
    }
  });
});

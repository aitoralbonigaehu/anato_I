/**
 * Visit collector helpers (server side): what browser, system and kind of device a user agent is, and
 * the IP address shortened so it no longer points at one person (IPv4: last block zeroed; IPv6: the
 * first three groups, a /48 — still enough for country, city and provider).
 */

export interface UaInfo {
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  device: 'desktop' | 'tablet' | 'mobile';
  bot: boolean;
}

const first = (ua: string, re: RegExp) => ua.match(re)?.[1] ?? '';

export function parseUa(raw: string | null | undefined, touchPoints = 0): UaInfo {
  const ua = (raw ?? '').slice(0, 512);
  const bot = /bot|crawler|spider|crawling|headless|lighthouse|preview|facebookexternalhit|slurp/i.test(ua);

  let browser = 'Beste bat';
  let browserVersion = '';
  if (/Edg(e|A|iOS)?\//.test(ua)) [browser, browserVersion] = ['Edge', first(ua, /Edg(?:e|A|iOS)?\/([\d.]+)/)];
  else if (/OPR\/|Opera/.test(ua)) [browser, browserVersion] = ['Opera', first(ua, /(?:OPR|Opera)\/([\d.]+)/)];
  else if (/SamsungBrowser\//.test(ua)) [browser, browserVersion] = ['Samsung Internet', first(ua, /SamsungBrowser\/([\d.]+)/)];
  else if (/Firefox\/|FxiOS\//.test(ua)) [browser, browserVersion] = ['Firefox', first(ua, /(?:Firefox|FxiOS)\/([\d.]+)/)];
  else if (/CriOS\//.test(ua)) [browser, browserVersion] = ['Chrome', first(ua, /CriOS\/([\d.]+)/)];
  else if (/Chrome\//.test(ua)) [browser, browserVersion] = ['Chrome', first(ua, /Chrome\/([\d.]+)/)];
  else if (/Safari\//.test(ua) && /Version\//.test(ua)) [browser, browserVersion] = ['Safari', first(ua, /Version\/([\d.]+)/)];
  browserVersion = browserVersion.split('.')[0] ?? '';

  let os = 'Beste bat';
  let osVersion = '';
  if (/Windows NT/.test(ua)) [os, osVersion] = ['Windows', first(ua, /Windows NT ([\d.]+)/)];
  else if (/iPhone|iPod/.test(ua)) [os, osVersion] = ['iOS', first(ua, /OS ([\d_]+)/).replace(/_/g, '.')];
  else if (/iPad/.test(ua)) [os, osVersion] = ['iPadOS', first(ua, /OS ([\d_]+)/).replace(/_/g, '.')];
  else if (/Android/.test(ua)) [os, osVersion] = ['Android', first(ua, /Android ([\d.]+)/)];
  else if (/CrOS/.test(ua)) os = 'ChromeOS';
  else if (/Mac OS X|Macintosh/.test(ua)) [os, osVersion] = ['macOS', first(ua, /Mac OS X ([\d_]+)/).replace(/_/g, '.')];
  else if (/Linux/.test(ua)) os = 'Linux';

  // iPads ask for the desktop site and say "Macintosh": a Mac with a touch screen is an iPad.
  if (os === 'macOS' && touchPoints > 1) os = 'iPadOS';
  const device: UaInfo['device'] =
    os === 'iPadOS' || /Tablet|iPad/.test(ua) || (os === 'Android' && !/Mobile/.test(ua)) ? 'tablet' : /Mobi|iPhone|iPod|Android/.test(ua) ? 'mobile' : 'desktop';

  return { browser, browserVersion, os, osVersion, device, bot };
}

/** The visitor's IP from the proxy headers (first hop of x-forwarded-for), or null. */
export function clientIp(h: Headers): string | null {
  const xff = h.get('x-forwarded-for')?.split(',')[0]?.trim();
  return xff || h.get('x-real-ip')?.trim() || null;
}

/** IPv4 → a.b.c.0; IPv6 → first three groups + ::. Anything else → null. */
export function truncateIp(ip: string | null): string | null {
  if (!ip) return null;
  const v4 = ip.replace(/^::ffff:/i, '');
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(v4)) return v4.replace(/\.\d{1,3}$/, '.0');
  if (ip.includes(':')) {
    const [head] = ip.split('%');
    const parts = head.split('::');
    const left = parts[0] ? parts[0].split(':') : [];
    const right = parts.length > 1 && parts[1] ? parts[1].split(':') : [];
    const groups = parts.length > 1 ? [...left, ...Array(Math.max(0, 8 - left.length - right.length)).fill('0'), ...right] : left;
    if (groups.length !== 8 || !groups.every((g) => /^[0-9a-f]{1,4}$/i.test(g))) return null;
    return `${groups.slice(0, 3).map((g) => g.toLowerCase().replace(/^0+(?=.)/, '')).join(':')}::`;
  }
  return null;
}

/** A referrer reduced to its site (no path or query: those can carry personal data). */
export function referrerSite(ref: unknown): string | null {
  if (typeof ref !== 'string' || !ref) return null;
  try {
    return new URL(ref).hostname.slice(0, 120) || null;
  } catch {
    return null;
  }
}

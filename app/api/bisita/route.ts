import { allow } from '@/lib/kimu/guard';
import { clientIp, parseUa, referrerSite, truncateIp } from '@/lib/visits/parse';
import { storeVisit, visitsConfigured, type VisitRow } from '@/lib/visits/store';

export const runtime = 'nodejs';

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const str = (v: unknown, n: number) => (typeof v === 'string' && v ? v.slice(0, n) : null);
const int = (v: unknown, max: number) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= max ? Math.round(v) : null);
const geo = (h: Headers, k: string) => {
  const v = h.get(k);
  if (!v) return null;
  try {
    return decodeURIComponent(v).slice(0, 80);
  } catch {
    return v.slice(0, 80);
  }
};

/**
 * One row per visit (a browser session): browser, system, device, screen, language, time zone, the
 * hour, the page it started on, the referring site, and the IP shortened to its network. The browser
 * sends only what it knows (components/visits/VisitBeacon); the IP and the place come from the headers.
 * Always answers 204: a visit that cannot be stored is simply not counted.
 */
export async function POST(request: Request) {
  const done = new Response(null, { status: 204 });
  if (process.env.NODE_ENV === 'production' && process.env.VISITS_ENABLED !== '1') return done;
  if (!visitsConfigured()) return done;
  const h = request.headers;
  const ip = clientIp(h);
  if (!allow(`bisita:${ip ?? 'x'}`, 20, 10 * 60_000)) return done;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return done;
  }
  if (!isRecord(body)) return done;

  const ua = h.get('user-agent') ?? '';
  const touch = int(body.touch, 20);
  const info = parseUa(ua, touch ?? 0);
  const row: VisitRow = {
    ip_trunc: truncateIp(ip),
    country: geo(h, 'x-vercel-ip-country') ?? geo(h, 'cf-ipcountry'),
    region: geo(h, 'x-vercel-ip-country-region'),
    city: geo(h, 'x-vercel-ip-city'),
    user_agent: ua.slice(0, 512),
    browser: info.browser,
    browser_version: info.browserVersion,
    os: info.os,
    os_version: info.osVersion,
    device: info.device,
    is_bot: info.bot,
    language: str(body.lang, 20),
    languages: str(body.langs, 120),
    timezone: str(body.tz, 60),
    local_hour: int(body.hour, 23),
    screen_w: int(body.sw, 10000),
    screen_h: int(body.sh, 10000),
    viewport_w: int(body.vw, 10000),
    viewport_h: int(body.vh, 10000),
    dpr: typeof body.dpr === 'number' && body.dpr > 0 && body.dpr < 10 ? Math.round(body.dpr * 100) / 100 : null,
    touch_points: touch,
    color_scheme: body.scheme === 'dark' || body.scheme === 'light' ? body.scheme : null,
    path: str(body.path, 200),
    referrer: referrerSite(body.ref),
    signed_in: body.signedIn === true,
  };
  await storeVisit(row);
  return done;
}

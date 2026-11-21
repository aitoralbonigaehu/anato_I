import { allow } from '@/lib/kimu/guard';
import { parseUa } from '@/lib/visits/parse';
import { storeVisit, visitsConfigured } from '@/lib/visits/store';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const done = new Response(null, { status: 204 });
  if (process.env.NODE_ENV === 'production' && process.env.VISITS_ENABLED !== '1') return done;
  if (!visitsConfigured()) {
    if (process.env.NODE_ENV !== 'production') return done;
    console.warn('[visits] Missing Supabase configuration');
    return new Response(null, { status: 503 });
  }

  const headers = request.headers;
  if (headers.get('sec-fetch-site') === 'cross-site') return new Response(null, { status: 403 });
  if (!allow('bisita', 300, 60_000)) return new Response(null, { status: 429 });

  const info = parseUa(headers.get('user-agent'), headers.get('x-visit-touch') === '1' ? 2 : 0);
  return await storeVisit({
    browser: info.browser,
    os: info.os,
    device: info.device,
    is_bot: info.bot,
  }) ? done : new Response(null, { status: 502 });
}

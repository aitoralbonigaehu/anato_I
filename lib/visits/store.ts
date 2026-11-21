/**
 * Where visits are stored: a Supabase table (`public.visits`, see supabase/migrations/0002_kontuak_bisitak.sql),
 * written from the server with the service-role key over PostgREST. Without SUPABASE_URL and
 * SUPABASE_SERVICE_ROLE_KEY set this is a no-op: nothing is stored and nothing breaks.
 * Server only: never import this from a client component (the key must not reach the browser).
 */

export interface VisitRow {
  browser: string;
  os: string;
  device: string;
  is_bot: boolean;
}

export const visitsConfigured = () => !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function storeVisit(row: VisitRow): Promise<boolean> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return false;
  try {
    const res = await fetch(`${url.replace(/\/+$/, '')}/rest/v1/visits`, {
      method: 'POST',
      headers: {
        apikey: key,
        ...(key.startsWith('sb_secret_') ? {} : { Authorization: `Bearer ${key}` }),
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(row),
      cache: 'no-store',
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) console.warn('[visits] Supabase rejected insert', { status: res.status });
    return res.ok;
  } catch {
    console.warn('[visits] Supabase insert request failed');
    return false;
  }
}

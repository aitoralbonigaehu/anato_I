/**
 * Where visits are stored: a Supabase table (`public.visits`, see supabase/migrations/0002_kontuak_bisitak.sql),
 * written from the server with the service-role key over PostgREST. Without SUPABASE_URL and
 * SUPABASE_SERVICE_ROLE_KEY set this is a no-op: nothing is stored and nothing breaks.
 * Server only: never import this from a client component (the key must not reach the browser).
 */

export interface VisitRow {
  ip_trunc: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  user_agent: string;
  browser: string;
  browser_version: string;
  os: string;
  os_version: string;
  device: string;
  is_bot: boolean;
  language: string | null;
  languages: string | null;
  timezone: string | null;
  local_hour: number | null;
  screen_w: number | null;
  screen_h: number | null;
  viewport_w: number | null;
  viewport_h: number | null;
  dpr: number | null;
  touch_points: number | null;
  color_scheme: string | null;
  path: string | null;
  referrer: string | null;
  signed_in: boolean;
}

export const visitsConfigured = () => !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function storeVisit(row: VisitRow): Promise<boolean> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return false;
  try {
    const res = await fetch(`${url.replace(/\/+$/, '')}/rest/v1/visits`, {
      method: 'POST',
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify(row),
      cache: 'no-store',
    });
    return res.ok;
  } catch {
    return false;
  }
}

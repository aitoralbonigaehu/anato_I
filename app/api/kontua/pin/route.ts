import { createHmac, randomUUID } from 'node:crypto';
import { isIP } from 'node:net';
import { checkName, checkPin, cleanName, nameKey } from '@/lib/account/types';

export const runtime = 'nodejs';

type Failure = 'invalid' | 'taken' | 'wrong' | 'locked' | 'unavailable';
type Config = { url: string; service: string; anon: string; pepper: Buffer; domain: string };

function failure(error: Failure, status: number, retryAfterSec?: number) {
  return Response.json({ ok: false, error, ...(retryAfterSec ? { retryAfterSec } : {}) }, {
    status, headers: { 'Cache-Control': 'no-store' },
  });
}

function config(): Config | null {
  const { SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: service, NEXT_PUBLIC_SUPABASE_ANON_KEY: anon,
    PIN_PEPPER: encoded, PIN_EMAIL_DOMAIN: domain } = process.env;
  if (!url || !service || !anon || !encoded || !domain || !/^[a-zA-Z0-9.-]+$/.test(domain) || !domain.includes('.')) return null;
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)) return null;
  const pepper = Buffer.from(encoded, 'base64');
  if (pepper.length < 32 || pepper.toString('base64') !== encoded) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && !(process.env.NODE_ENV !== 'production' && parsed.hostname === 'localhost')) return null;
    return { url: url.replace(/\/+$/, ''), service, anon, pepper, domain: domain.toLowerCase() };
  } catch { return null; }
}

function digest(pepper: Buffer, text: string) {
  return createHmac('sha256', pepper).update(text).digest('base64url');
}

function headers(key: string) {
  return { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
}

async function jsonResponse(response: Response): Promise<Record<string, unknown> | null> {
  try {
    const data: unknown = await response.json();
    return data && typeof data === 'object' && !Array.isArray(data) ? data as Record<string, unknown> : null;
  } catch { return null; }
}

// Vercel overwrites this header at its edge. Elsewhere, fail closed into one shared bucket;
// do not accept an arbitrary client-provided address as an identity.
function ipBucket(request: Request, pepper: Buffer) {
  const candidate = process.env.VERCEL === '1' ? request.headers.get('x-vercel-forwarded-for')?.trim() : undefined;
  return digest(pepper, `ip:${candidate && isIP(candidate) ? candidate : 'unknown'}`);
}

async function boundedBody(request: Request): Promise<unknown> {
  if (!request.body) throw new Error('missing body');
  const reader = request.body.getReader();
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 2048) { await reader.cancel(); throw new Error('body too large'); }
    chunks.push(value);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

export async function POST(request: Request) {
  const cfg = config();
  if (!cfg) return failure('unavailable', 503);
  let input: unknown;
  try { input = await boundedBody(request); } catch { return failure('invalid', 400); }
  if (!input || typeof input !== 'object' || Array.isArray(input)) return failure('invalid', 400);
  const { action, name, pin } = input as Record<string, unknown>;
  if ((action !== 'signup' && action !== 'signin') || typeof name !== 'string' || name.length > 128 ||
      typeof pin !== 'string' || checkName(name) || checkPin(pin)) return failure('invalid', 400);

  const key = nameKey(name);
  const displayName = cleanName(name);
  const email = `p-${digest(cfg.pepper, `email:${key}`).slice(0, 32)}@${cfg.domain}`;
  const password = digest(cfg.pepper, `${key}:${pin}`);
  const token = randomUUID();
  const serviceHeaders = headers(cfg.service);
  let createdUserId: string | undefined;
  try {
    const reservation = await fetch(`${cfg.url}/rest/v1/rpc/pin_reserve_attempt`, {
      method: 'POST', headers: serviceHeaders, cache: 'no-store',
      body: JSON.stringify({ p_ip_key: ipBucket(request, cfg.pepper), p_name_key: key, p_signin: true, p_token: token }),
    });
    const reserved = await jsonResponse(reservation);
    if (!reservation.ok || typeof reserved?.allowed !== 'boolean') return failure('unavailable', 503);
    if (!reserved.allowed) {
      const retry = typeof reserved.retry_after === 'number' && reserved.retry_after > 0 ? Math.ceil(reserved.retry_after) : 900;
      return failure('locked', 429, retry);
    }
    const registry = await fetch(`${cfg.url}/rest/v1/pin_accounts?name_key=eq.${encodeURIComponent(key)}&select=user_id,name`, {
      headers: serviceHeaders, cache: 'no-store',
    });
    if (!registry.ok) return failure('unavailable', 503);
    const rows: unknown = await registry.json();
    if (!Array.isArray(rows) || rows.length > 1) return failure('unavailable', 503);
    const signIn = () => fetch(`${cfg.url}/auth/v1/token?grant_type=password`, {
      method: 'POST', headers: headers(cfg.anon), cache: 'no-store', body: JSON.stringify({ email, password }),
    });
    let recoveredSession: Record<string, unknown> | null = null;
    if (action === 'signup') {
      if (rows.length) return failure('taken', 409);
      const created = await fetch(`${cfg.url}/auth/v1/admin/users`, {
        method: 'POST', headers: serviceHeaders, cache: 'no-store',
        body: JSON.stringify({ email, password, email_confirm: true, user_metadata: { name: displayName, provider: 'pin' } }),
      });
      const newUser = await jsonResponse(created);
      if (created.ok && typeof newUser?.id === 'string') {
        createdUserId = newUser.id;
      } else if (newUser?.code === 'email_exists' || newUser?.code === 'user_already_exists') {
        // A previous create may have committed despite a lost response. Recover only if the
        // supplied PIN authenticates that synthetic identity; all recovery attempts are reserved.
        const recovered = await signIn();
        recoveredSession = await jsonResponse(recovered);
        const recoveredUser = recoveredSession?.user;
        if (recovered.ok && recoveredUser && typeof recoveredUser === 'object' &&
            typeof (recoveredUser as Record<string, unknown>).id === 'string') {
          createdUserId = (recoveredUser as Record<string, unknown>).id as string;
        } else {
          // Give an in-flight registration time to publish its registry entry.
          for (let i = 0; i < 4; i++) {
            await new Promise(resolve => setTimeout(resolve, 200));
            const check = await fetch(`${cfg.url}/rest/v1/pin_accounts?name_key=eq.${encodeURIComponent(key)}&select=user_id`, {
              headers: serviceHeaders, cache: 'no-store',
            });
            if (!check.ok) return failure('unavailable', 503);
            const found: unknown = await check.json();
            if (Array.isArray(found) && found.length) return failure('taken', 409);
          }
          return failure('unavailable', 503);
        }
      } else return failure('unavailable', 503);
      const inserted = await fetch(`${cfg.url}/rest/v1/pin_accounts`, {
        method: 'POST', headers: { ...serviceHeaders, Prefer: 'return=minimal' }, cache: 'no-store',
        body: JSON.stringify({ name_key: key, user_id: createdUserId, name: displayName }),
      });
      if (!inserted.ok) {
        // A parallel recovery may have registered this same user. Delete only when a fresh
        // registry read proves a different user owns the name; otherwise retain the identity.
        if (inserted.status === 409) {
          if (created.ok) {
            const check = await fetch(`${cfg.url}/rest/v1/pin_accounts?name_key=eq.${encodeURIComponent(key)}&select=user_id`, {
              headers: serviceHeaders, cache: 'no-store',
            });
            const owners: unknown = check.ok ? await check.json() : null;
            if (Array.isArray(owners) && owners.length === 1 && owners[0]?.user_id !== createdUserId) {
              await fetch(`${cfg.url}/auth/v1/admin/users/${encodeURIComponent(createdUserId)}`, {
                method: 'DELETE', headers: serviceHeaders, cache: 'no-store',
              });
            }
          }
          return failure('taken', 409);
        }
        return failure('unavailable', 503);
      }
    }
    const auth = recoveredSession ? null : await signIn();
    const session = recoveredSession ?? await jsonResponse(auth!);
    if (auth && !auth.ok) return auth.status === 400 ? failure('wrong', 401) : failure('unavailable', 503);
    const user = session?.user;
    if (!user || typeof user !== 'object' || typeof (user as Record<string, unknown>).id !== 'string' ||
        typeof session?.access_token !== 'string' || typeof session.refresh_token !== 'string') return failure('unavailable', 503);
    const id = (user as Record<string, unknown>).id as string;
    if (action === 'signin' && (!rows.length || rows[0]?.user_id !== id)) return failure('wrong', 401);
    if (action === 'signup' && createdUserId !== id) return failure('unavailable', 503);
    {
      // Fail closed if the success cannot be recorded. A stale reservation cannot reset later guesses.
      const cleared = await fetch(`${cfg.url}/rest/v1/rpc/pin_complete_success`, {
        method: 'POST', headers: serviceHeaders, cache: 'no-store', body: JSON.stringify({ p_name_key: key, p_token: token }),
      });
      if (!cleared.ok) return failure('unavailable', 503);
    }
    return Response.json({ ok: true, user: { id, name: action === 'signin' ? rows[0].name : displayName, provider: 'pin' },
      session: { access_token: session.access_token, refresh_token: session.refresh_token } }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    // Never log names, PINs, derived credentials, service keys, or upstream bodies.
    return failure('unavailable', 503);
  }
}

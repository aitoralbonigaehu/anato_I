import { createClient } from '@supabase/supabase-js';
import { allow } from '@/lib/kimu/guard';
import { parseUa } from '@/lib/visits/parse';

const score = (value: unknown) => typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 5;
const reply = (status: number) => new Response(null, { status });

async function readSubmission(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error('Missing body');
  const bytes = new Uint8Array(4096);
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (size + value.length > bytes.length) throw new Error('Body too large');
      bytes.set(value, size);
      size += value.length;
    }
    return JSON.parse(new TextDecoder().decode(bytes.subarray(0, size)));
  } finally {
    await reader.cancel();
  }
}

export async function POST(request: Request) {
  if (request.headers.get('sec-fetch-site') === 'cross-site') return reply(403);
  const ip = request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() || 'local';
  if (!allow('topic-feedback:' + ip, 24, 60_000)) return reply(429);

  const input = await readSubmission(request).catch(() => null);
  if (!input || !Number.isInteger(input.topic) || input.topic < 1 || input.topic > 19 ||
      !score(input.clarity) || !score(input.navigation) ||
      typeof input.comment !== 'string' || input.comment.length > 600 ||
      typeof input.id !== 'string' || !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(input.id)) return reply(400);

  const url = process.env.SUPABASE_URL;
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !secret) return reply(503);

  const db = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
  const authorization = request.headers.get('authorization');
  let userId: string | null = null;
  let accountName: string | null = null;
  if (authorization !== null) {
    const token = /^Bearer (\S+)$/.exec(authorization)?.[1];
    if (!token) return reply(401);
    const { data, error } = await db.auth.getUser(token);
    if (error || !data.user) return reply(401);
    userId = data.user.id;
    const account = await db.from('pin_accounts').select('name').eq('user_id', userId).maybeSingle();
    if (account.error) return reply(503);
    if (typeof account.data?.name !== 'string') return reply(401);
    accountName = account.data.name;
  }

  const info = parseUa(request.headers.get('user-agent'), request.headers.get('x-visit-touch') === '1' ? 2 : 0);
  const { error } = await db.from('topic_feedback').upsert({
    submission_id: input.id, topic: input.topic, clarity: input.clarity, navigation: input.navigation,
    comment: input.comment.trim() || null, user_id: userId, account_name: accountName,
    device: userId ? null : info.device, os: userId ? null : info.os, browser: userId ? null : info.browser,
  }, { onConflict: 'submission_id', ignoreDuplicates: true }).abortSignal(AbortSignal.timeout(8000));
  return reply(error ? 503 : 204);
}

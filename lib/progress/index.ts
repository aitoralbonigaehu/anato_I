/**
 * Study-progress client for Supabase (PostgREST over plain fetch, no SDK).
 * Every function is a silent no-op unless NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
 * and NEXT_PUBLIC_PROGRESS_ENABLED === '1' are all set. Nothing here ever throws.
 * Not wired into the UI yet: see supabase/README.md.
 */

export interface TopicProgress {
  topic: number;
  totalSeconds: number;
  answersCount: number;
  correctCount: number;
  /** 0–100, or null when there are no answers for the topic yet. */
  percentCorrect: number | null;
}

interface TopicProgressRow {
  topic: number;
  total_seconds: number | string | null;
  answers_count: number | null;
  correct_count: number | null;
  percent_correct: number | string | null;
}

interface Config {
  url: string;
  anonKey: string;
}

// Read with literal property access so Next inlines the NEXT_PUBLIC_* values into the client bundle.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const PROGRESS_FLAG = process.env.NEXT_PUBLIC_PROGRESS_ENABLED;

/** True only when the feature flag is on and the Supabase project is configured. */
export function isProgressEnabled(): boolean {
  return PROGRESS_FLAG === '1' && !!SUPABASE_URL && !!SUPABASE_ANON_KEY;
}

function config(): Config | null {
  if (!isProgressEnabled() || !SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  return { url: SUPABASE_URL.replace(/\/+$/, ''), anonKey: SUPABASE_ANON_KEY };
}

let accessToken: string | null = null;

/** The signed-in user's Supabase JWT. RLS rejects every call without one; pass null on sign-out. */
export function setProgressAccessToken(token: string | null): void {
  accessToken = token;
}

async function rest(path: string, init: RequestInit = {}): Promise<Response | null> {
  const cfg = config();
  if (!cfg || !accessToken) return null;
  try {
    const res = await fetch(`${cfg.url}/rest/v1/${path}`, {
      ...init,
      headers: {
        apikey: cfg.anonKey,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...init.headers,
      },
    });
    return res.ok ? res : null;
  } catch {
    return null;
  }
}

/** Records time spent on one stage of a topic. Resolves to true when the row was stored. */
export async function recordStudyTime(topic: number, stageId: string, seconds: number): Promise<boolean> {
  if (!isProgressEnabled() || !Number.isFinite(seconds) || seconds <= 0) return false;
  const res = await rest('study_sessions', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      topic,
      stage_id: stageId,
      seconds: Math.round(seconds),
      started_at: new Date(Date.now() - seconds * 1000).toISOString(),
    }),
  });
  return res !== null;
}

/** Records one quiz answer. Resolves to true when the row was stored. */
export async function recordAnswer(topic: number, questionId: string, correct: boolean): Promise<boolean> {
  if (!isProgressEnabled()) return false;
  const res = await rest('answers', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ topic, question_id: questionId, correct }),
  });
  return res !== null;
}

/** The signed-in user's progress per topic, sorted by topic. Empty when disabled, signed out or on any error. */
export async function fetchTopicProgress(): Promise<TopicProgress[]> {
  if (!isProgressEnabled()) return [];
  const res = await rest('topic_progress?select=topic,total_seconds,answers_count,correct_count,percent_correct&order=topic.asc');
  if (!res) return [];
  try {
    const rows = (await res.json()) as TopicProgressRow[];
    return rows.map((r) => ({
      topic: r.topic,
      totalSeconds: Number(r.total_seconds ?? 0),
      answersCount: r.answers_count ?? 0,
      correctCount: r.correct_count ?? 0,
      percentCorrect: r.percent_correct === null ? null : Number(r.percent_correct),
    }));
  } catch {
    return [];
  }
}

import { studyKey } from '@/lib/study/storage-scope';

/**
 * Belortzioak flashcards: one card per structure (an arrow on a figure → its name), on Leitner boxes,
 * and the study mode ("Ikasketa modua"): one arrow lit at a time, the student thinks of the name,
 * turns the card and says whether they knew it. Cards missed come back later in the same session
 * until they are right (at most three times), and sooner in the next ones.
 */

export interface Card {
  /** Leitner box: 0 new … 5 well known. */
  b: number;
  due: number;
  ok: number;
  bad: number;
}
export type Cards = Record<string, Card>;

export const STORE = 'enbrioatlas:belortzioak';
export const MIN = 60_000;
export const DAY = 86_400_000;
export const INTERVAL = [0, 10 * MIN, DAY, 3 * DAY, 7 * DAY, 21 * DAY];
/** From this box on, a card counts as known. */
export const KNOWN = 2;

export const readCards = (): Cards => {
  try {
    return JSON.parse(window.localStorage.getItem(studyKey(STORE)) ?? '{}') as Cards;
  } catch {
    return {};
  }
};
export const writeCards = (c: Cards) => {
  try {
    window.localStorage.setItem(studyKey(STORE), JSON.stringify(c));
  } catch {
    // Without storage the progress is only lost; studying still works.
  }
};

export const grade = (c: Card | undefined, ok: boolean, now: number): Card => {
  const prev = c ?? { b: 0, due: 0, ok: 0, bad: 0 };
  const b = ok ? Math.min(5, prev.b + 1) : 1;
  return { b, due: now + (ok ? INTERVAL[b] : MIN), ok: prev.ok + (ok ? 1 : 0), bad: prev.bad + (ok ? 0 : 1) };
};

// ---- Ikasketa modua --------------------------------------------------------------------------------

export interface StudyRef {
  plate: string;
  key: string;
}

export interface StudySession {
  queue: StudyRef[];
  /** Keys answered at least once this session, and how many times each was missed. */
  misses: Record<string, number>;
  seen: string[];
  /** First-try results (what is saved and scored). */
  right: number;
  wrong: number;
  total: number;
  flipped: boolean;
}

/** How many cards a session holds: a few minutes of study. */
export const SESSION_SIZE = 20;
/** A missed card comes back after this many others. */
const BACK_AFTER = 3;
/** A card missed this many times in one session is left for the next one. */
const MAX_MISSES = 3;

/**
 * What to study now: first what is due (oldest first), then what is still weak, then new cards (in
 * figure order, so a figure is learnt together), up to `size`.
 */
export function buildStudyQueue(items: readonly StudyRef[], cards: Cards, now: number, size = SESSION_SIZE): StudyRef[] {
  const due = items.filter((x) => cards[x.key] && cards[x.key].due <= now).sort((a, b) => cards[a.key].due - cards[b.key].due);
  const weak = items.filter((x) => cards[x.key] && cards[x.key].due > now && cards[x.key].b < 3).sort((a, b) => cards[a.key].b - cards[b.key].b || cards[a.key].due - cards[b.key].due);
  const fresh = items.filter((x) => !cards[x.key]);
  const out: StudyRef[] = [];
  const keys = new Set<string>();
  for (const x of [...due, ...weak, ...fresh]) {
    if (out.length >= size) break;
    if (keys.has(x.key)) continue;
    keys.add(x.key);
    out.push(x);
  }
  return out;
}

export const startStudy = (queue: StudyRef[]): StudySession => ({ queue, misses: {}, seen: [], right: 0, wrong: 0, total: queue.length, flipped: false });

export const flipStudy = (s: StudySession): StudySession => ({ ...s, flipped: true });

/** Whether this answer is the card's first in the session (only that one moves its Leitner box). */
export const isFirstTry = (s: StudySession) => !!s.queue[0] && !s.seen.includes(s.queue[0].key);

/** The student says whether they knew the current card; a miss puts it back a few cards later. */
export function answerStudy(s: StudySession, knew: boolean): StudySession {
  const head = s.queue[0];
  if (!head) return s;
  const first = !s.seen.includes(head.key);
  const rest = s.queue.slice(1);
  const misses = { ...s.misses };
  if (!knew) {
    misses[head.key] = (misses[head.key] ?? 0) + 1;
    if (misses[head.key] < MAX_MISSES) rest.splice(Math.min(rest.length, BACK_AFTER), 0, head);
  }
  return {
    ...s,
    queue: rest,
    misses,
    seen: first ? [...s.seen, head.key] : s.seen,
    right: s.right + (first && knew ? 1 : 0),
    wrong: s.wrong + (first && !knew ? 1 : 0),
    flipped: false,
  };
}

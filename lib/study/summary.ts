/**
 * The progress page's numbers, from the study stores: experience points and the level they reach
 * (levels are stages of development, from zygote to anatomist), the daily streak, today's goal, per
 * topic what was seen and how often, flashcards by box, and the badges. Pure: the page gathers the
 * stores and passes them in.
 */

import { dayKey, type Activity } from './activity';

export interface TopicMeta {
  week: number;
  title: string;
  stages: { id: string; title: string }[];
  /** Built and openable (topics still being prepared do not count towards "all seen"). */
  ready: boolean;
}

interface AnswerRec {
  right: number;
  wrong: number;
  hist?: [number, 0 | 1][];
}
interface BelCard {
  b: number;
  due: number;
  ok: number;
  bad: number;
}

export interface SummaryInput {
  now: number;
  activity: Activity;
  visited: Record<string, string[]>;
  answers: Record<string, AnswerRec>;
  /** The topic a question belongs to (undefined: an image question, no topic). */
  questionWeek: (id: string) => number | undefined;
  bel: Record<string, BelCard>;
  belSystems: { id: string; title: string; keys: string[] }[];
  /** Scheme flashcards (Eratorriak): reviewed, and remembered at their last review. */
  scheme: { reviewed: number; known: number };
  topics: TopicMeta[];
}

export interface StageRow {
  id: string;
  title: string;
  views: number;
  seconds: number;
  last: number;
}
export interface TopicRow {
  week: number;
  title: string;
  ready: boolean;
  stages: StageRow[];
  seen: number;
  total: number;
  views: number;
  seconds: number;
  right: number;
  wrong: number;
  last: number;
}
export interface Level {
  index: number;
  name: string;
  /** XP where this level starts, and where the next one does (null at the top). */
  from: number;
  to: number | null;
}
export interface Badge {
  id: string;
  title: string;
  text: string;
  /** Which medal glyph to draw. */
  icon: string;
  got: boolean;
  /** 0–1 towards it. */
  progress: number;
  /** "12/50" */
  count: string;
}
export interface Summary {
  xp: number;
  level: Level;
  streak: { current: number; best: number; today: boolean };
  goal: { seconds: number; recalls: number; target: { seconds: number; recalls: number }; done: number };
  totals: { stagesSeen: number; stages: number; views: number; seconds: number; right: number; wrong: number; cardsKnown: number; cards: number; due: number };
  topics: TopicRow[];
  bel: { id: string; title: string; boxes: [number, number, number, number]; total: number; due: number }[];
  /** Per day (YYYY-MM-DD): a 0–4 intensity for the calendar. */
  days: Record<string, { level: number; seconds: number; recalls: number }>;
  badges: Badge[];
}

export const LEVELS: [number, string][] = [
  [0, 'Zigotoa'],
  [60, 'Morula'],
  [180, 'Blastozistoa'],
  [360, 'Disko bilaminarra'],
  [600, 'Gastrula'],
  [950, 'Neurula'],
  [1400, 'Enbrioia'],
  [2000, 'Fetua'],
  [2800, 'Jaioberria'],
  [3800, 'Anatomista'],
];

export function levelOf(xp: number): Level {
  let i = 0;
  while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1][0]) i++;
  return { index: i, name: LEVELS[i][1], from: LEVELS[i][0], to: LEVELS[i + 1]?.[0] ?? null };
}

/** Today's goal: a quarter of an hour, or twenty cards and questions. */
export const GOAL = { seconds: 15 * 60, recalls: 20 };

const shiftDay = (key: string, by: number) => {
  const [y, m, d] = key.split('-').map(Number);
  return dayKey(new Date(y, m - 1, d + by, 12).getTime());
};
const prevDay = (key: string) => shiftDay(key, -1);

export function summarize(inp: SummaryInput): Summary {
  const { activity, now } = inp;

  // Days: the activity log, plus every timed answer (older than the log itself).
  const days: Summary['days'] = {};
  const dayAdd = (k: string, seconds: number, recalls: number) => {
    const d = (days[k] ??= { level: 0, seconds: 0, recalls: 0 });
    d.seconds += seconds;
    d.recalls += recalls;
  };
  for (const [k, d] of Object.entries(activity.days)) dayAdd(k, d.s, 0);
  const logged = new Map(Object.entries(activity.days).map(([k, d]) => [k, d.ok + d.bad]));
  const fromAnswers = new Map<string, number>();
  for (const a of Object.values(inp.answers)) for (const [t] of a.hist ?? []) fromAnswers.set(dayKey(t), (fromAnswers.get(dayKey(t)) ?? 0) + 1);
  for (const k of new Set([...logged.keys(), ...fromAnswers.keys()])) dayAdd(k, 0, Math.max(logged.get(k) ?? 0, fromAnswers.get(k) ?? 0));
  for (const [k, d] of Object.entries(activity.days)) if (d.st && !days[k].seconds && !days[k].recalls) days[k].seconds = 1;
  for (const d of Object.values(days)) {
    const p = Math.max(d.seconds / GOAL.seconds, d.recalls / GOAL.recalls);
    d.level = d.seconds + d.recalls === 0 ? 0 : p < 0.25 ? 1 : p < 0.6 ? 2 : p < 1 ? 3 : 4;
  }

  // Streak: days in a row with any study, ending today (or yesterday, while today is still open).
  const active = (k: string) => !!days[k] && (days[k].seconds > 0 || days[k].recalls > 0);
  const today = dayKey(now);
  let current = 0;
  let k = active(today) ? today : prevDay(today);
  while (active(k)) {
    current++;
    k = prevDay(k);
  }
  let best = 0;
  for (const key of Object.keys(days).sort()) {
    if (!active(key) || active(prevDay(key))) continue;
    let run = 0;
    let x = key;
    while (active(x)) {
      run++;
      x = shiftDay(x, 1);
    }
    best = Math.max(best, run);
  }
  best = Math.max(best, current);

  // Topics and their stages.
  const qStats = new Map<number, { right: number; wrong: number }>();
  for (const [id, a] of Object.entries(inp.answers)) {
    const w = inp.questionWeek(id);
    if (w === undefined) continue;
    const s = qStats.get(w) ?? { right: 0, wrong: 0 };
    s.right += a.right;
    s.wrong += a.wrong;
    qStats.set(w, s);
  }
  const topics: TopicRow[] = inp.topics.map((t) => {
    const visited = new Set(inp.visited[t.week] ?? []);
    const stages = t.stages.map((s) => {
      const st = activity.stages[`${t.week}/${s.id}`];
      return { id: s.id, title: s.title, views: st?.n || (visited.has(s.id) ? 1 : 0), seconds: st?.s ?? 0, last: st?.last ?? 0 };
    });
    const q = qStats.get(t.week) ?? { right: 0, wrong: 0 };
    return {
      week: t.week,
      title: t.title,
      ready: t.ready,
      stages,
      seen: stages.filter((s) => s.views > 0).length,
      total: stages.length,
      views: stages.reduce((a, s) => a + s.views, 0),
      seconds: stages.reduce((a, s) => a + s.seconds, 0),
      right: q.right,
      wrong: q.wrong,
      last: Math.max(0, ...stages.map((s) => s.last)),
    };
  });

  // Flashcards by box: new (never answered), learning (box 1), known (2–3), mastered (4–5).
  const bel = inp.belSystems.map((sys) => {
    const boxes: [number, number, number, number] = [0, 0, 0, 0];
    let due = 0;
    for (const key of sys.keys) {
      const c = inp.bel[key];
      if (!c) boxes[0]++;
      else if (c.b <= 1) boxes[1]++;
      else if (c.b <= 3) boxes[2]++;
      else boxes[3]++;
      if (c && c.due <= now) due++;
    }
    return { id: sys.id, title: sys.title, boxes, total: sys.keys.length, due };
  });

  const answersRight = Object.values(inp.answers).reduce((a, x) => a + x.right, 0);
  const answersWrong = Object.values(inp.answers).reduce((a, x) => a + x.wrong, 0);
  const belCards = Object.values(inp.bel);
  const belOk = belCards.reduce((a, c) => a + c.ok, 0);
  const belBad = belCards.reduce((a, c) => a + c.bad, 0);
  const cardsKnown = bel.reduce((a, s) => a + s.boxes[2] + s.boxes[3], 0) + inp.scheme.known;
  const cards = bel.reduce((a, s) => a + s.total, 0);
  const stagesSeen = topics.reduce((a, t) => a + t.seen, 0);
  const seconds = Object.values(activity.stages).reduce((a, s) => a + s.s, 0);
  const views = topics.reduce((a, t) => a + t.views, 0);
  const right = answersRight + belOk;
  const wrong = answersWrong + belBad;
  const recallsDone = belOk + belBad + answersRight + answersWrong + inp.scheme.reviewed;
  const fullTopics = topics.filter((t) => t.ready && t.total > 0 && t.seen === t.total).length;
  const startedTopics = topics.filter((t) => t.seen > 0).length;
  const readyStages = topics.filter((t) => t.ready).reduce((a, t) => a + t.total, 0);
  const readySeen = topics.filter((t) => t.ready).reduce((a, t) => a + t.seen, 0);

  // Experience: a new stage 15, an opening again 3 (up to five), a minute 1, a right answer 4, a
  // wrong one 1 (trying counts), a known card 2, a whole topic 100.
  const stageXp = topics.reduce((a, t) => a + t.stages.reduce((b, s) => b + (s.views ? 15 + 3 * Math.min(5, s.views - 1) : 0), 0), 0);
  const xp = Math.round(stageXp + seconds / 60 + 4 * right + wrong + inp.scheme.reviewed + 2 * cardsKnown + 100 * fullTopics);

  const td = days[today] ?? { seconds: 0, recalls: 0 };
  const goal = {
    seconds: td.seconds,
    recalls: td.recalls,
    target: GOAL,
    done: Math.min(1, Math.max(td.seconds / GOAL.seconds, td.recalls / GOAL.recalls)),
  };

  const badge = (id: string, icon: string, title: string, text: string, have: number, need: number): Badge => ({
    id,
    icon,
    title,
    text,
    got: have >= need,
    progress: Math.min(1, have / need),
    count: `${Math.min(have, need)}/${need}`,
  });
  const badges = [
    badge('lehen-urratsa', 'seed', 'Lehen urratsa', 'Ireki zure lehen etapa simulagailuan.', stagesSeen, 1),
    badge('esploratzailea', 'compass', 'Esploratzailea', 'Hasi 5 gai desberdin.', startedTopics, 5),
    badge('gai-osoa', 'flag', 'Gai osoa', 'Ikusi gai baten etapa guztiak.', fullTopics, 1),
    badge('atlas-osoa', 'map', 'Atlas osoa', 'Ikusi gai prest guztietako etapa guztiak.', readySeen, Math.max(1, readyStages)),
    badge('bolada-3', 'flame', '3 eguneko bolada', 'Ikasi 3 egun jarraian.', best, 3),
    badge('bolada-7', 'bolt', 'Aste osoa', 'Ikasi 7 egun jarraian.', best, 7),
    badge('bolada-30', 'trophy', 'Hilabete osoa', 'Ikasi 30 egun jarraian.', best, 30),
    badge('txartelak-50', 'cards', 'Txartel-zalea', 'Erantzun 50 txartel edo galdera.', recallsDone, 50),
    badge('belortzio-maisua', 'target', 'Belortzio-maisua', 'Ikasi 100 belortzio-txartel.', bel.reduce((a, s) => a + s.boxes[2] + s.boxes[3], 0), 100),
    badge('galdera-ehiztaria', 'brain', 'Galdera-ehiztaria', 'Asmatu 100 galdera edo txartel.', right, 100),
    badge('ordu-bat', 'clock', 'Ordu bat', 'Ikasi ordubete simulagailuan.', Math.floor(seconds / 60), 60),
    badge('hamar-ordu', 'cap', 'Hamar ordu', 'Ikasi 10 ordu simulagailuan.', Math.floor(seconds / 60), 600),
  ];

  return {
    xp,
    level: levelOf(xp),
    streak: { current, best, today: active(today) },
    goal,
    totals: { stagesSeen, stages: topics.reduce((a, t) => a + t.total, 0), views, seconds, right, wrong, cardsKnown, cards, due: bel.reduce((a, s) => a + s.due, 0) },
    topics,
    bel,
    days,
    badges,
  };
}

/**
 * Topics 19 and 20 come in two versions, one per class (taldea): each class has its own notes. A topic's id is a
 * number everywhere in the app (routes, progress, notes ids), so the versions have ids of their own:
 *
 *   19 = 19. gaia, class 32 · 20 = 20. gaia, class 32 · 21 = 19. gaia, class 31 · 22 = 20. gaia, class 31
 *
 * The number a student sees is `topicNo(id)`, and a version's title names its class ("Nerbio sistema (31. taldea)"),
 * so every list tells the two apart. No imports: the homepage and the server read this too.
 */

export type Taldea = 31 | 32;

const VERSIONS: Record<number, { no: number; taldea: Taldea }> = {
  19: { no: 19, taldea: 32 },
  20: { no: 20, taldea: 32 },
  21: { no: 19, taldea: 31 },
  22: { no: 20, taldea: 31 },
};

/** The topic's number as the notes and the course call it (19 for both classes' 19. gaia). */
export function topicNo(id: number): number;
export function topicNo(id: number | undefined): number | undefined;
export function topicNo(id: number | undefined) {
  return id === undefined ? undefined : (VERSIONS[id]?.no ?? id);
}

/** The highest topic number the course has (two ids each for 19 and 20). */
export const LAST_TOPIC_NO = 20;

/**
 * The id of the topic a student names by its number ("19. gaian"): for a topic with versions, the one of the class
 * they are in (that of `from`, else the remembered class, else 32).
 */
export function topicId(no: number, from?: number): number {
  const taldea = (from !== undefined ? taldeaOf(from) : undefined) ?? myTaldea() ?? 32;
  const ids = Object.keys(VERSIONS).map(Number).filter((id) => VERSIONS[id].no === no);
  return ids.find((id) => VERSIONS[id].taldea === taldea) ?? ids[0] ?? no;
}

/** The class a topic's version belongs to (none for a topic both classes share). */
export const taldeaOf = (id: number): Taldea | undefined => VERSIONS[id]?.taldea;

/** "19. gaia (31. taldea)" for a class's version, "18. gaia" otherwise. */
export const topicLabel = (id: number) => `${topicNo(id)}. gaia${taldeaOf(id) ? ` (${taldeaOf(id)}. taldea)` : ''}`;

/** The class the student last studied a class's version of (kept on this device), to carry on in that class. */
const KEY = 'enbrioatlas:taldea';
export function rememberTaldea(id: number) {
  const t = taldeaOf(id);
  if (!t || typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, String(t));
  } catch {}
}
export function myTaldea(): Taldea | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const v = Number(window.localStorage.getItem(KEY));
    return v === 31 || v === 32 ? v : undefined;
  } catch {
    return undefined;
  }
}

/**
 * The topics one student goes through, in order: the shared ones and one class's versions (the class of `from` if
 * it is a version, else the remembered class, else 32, whose versions come first). Next and previous topic follow it.
 */
export function inLine<T extends { week: number }>(list: readonly T[], from: number, taldea = taldeaOf(from) ?? myTaldea() ?? 32): T[] {
  return list.filter((w) => !taldeaOf(w.week) || taldeaOf(w.week) === taldea);
}

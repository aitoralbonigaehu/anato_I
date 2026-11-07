import type { WeekDef } from '@/lib/sim/types';

/** One row of the command bar: a place to go, or something to do. */
export interface Command {
  id: string;
  group: CommandGroup;
  title: string;
  /** Second line: where it is, what it does. */
  sub?: string;
  href?: string;
  /** An action the page performs (sent as the `enbrioatlas:command` event). */
  action?: string;
  /** Its keyboard shortcut, shown so the student learns it. */
  kbd?: string;
  /** Extra words it answers to (Spanish names, other Basque names, synonyms). */
  also?: string[];
  /** Topic number (the badge of topics, stages and structures). */
  week?: number;
}

export type CommandGroup = 'azkenak' | 'ekintzak' | 'gaiak' | 'etapak' | 'egiturak' | 'orriak';

export const GROUP_LABEL: Record<CommandGroup, string> = {
  azkenak: 'Azkenak',
  ekintzak: 'Ekintzak',
  gaiak: 'Gaiak',
  etapak: 'Etapak',
  egiturak: 'Egiturak',
  orriak: 'Orriak',
};

/** Results order when searching: a structure or stage is what is usually looked for. */
export const GROUP_ORDER: CommandGroup[] = ['azkenak', 'gaiak', 'etapak', 'egiturak', 'orriak', 'ekintzak'];

/** Lower case, no accents, single spaces: "Bitelo-zakua" and "bitelo zakua" meet. */
export const fold = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9ñ]+/g, ' ')
    .trim();

export const PAGES: Command[] = [
  { id: 'p:home', group: 'orriak', title: 'Hasiera', sub: 'Gaiak, mapa eta kronologia', href: '/', also: ['home', 'inicio'] },
  { id: 'p:ikasgela', group: 'orriak', title: 'Ikasgelak', sub: 'Gai bakoitzaren mapa, taulak eta fitxak', href: '/ikasgela', also: ['aula', 'mapa'] },
  { id: 'p:eratorriak', group: 'orriak', title: 'Eratorriak', sub: 'Nondik datoz, zer bihurtzen dira', href: '/eratorriak', also: ['derivados', 'jatorria', 'taulak'] },
  { id: 'p:belortzioak', group: 'orriak', title: 'Belortzioak', sub: 'Gezia → izena', href: '/belortzioak', also: ['flechas', 'gezia'] },
  { id: 'p:irudiak', group: 'orriak', title: 'Irudiak', sub: 'Etiketarik gabeko irudiak irakurtzen', href: '/irudiak', also: ['imagenes', 'figuras', 'pdf'] },
  { id: 'p:egiturak', group: 'orriak', title: 'Egiturak', sub: 'Egitura guztien atlasa', href: '/egiturak', also: ['atlas', 'estructuras'] },
  { id: 'p:fitxak', group: 'orriak', title: 'Fitxak', sub: 'Irudiak zenbakiekin', href: '/fitxak', also: ['fichas', 'laminas'] },
  { id: 'p:kronologia', group: 'orriak', title: 'Kronologia', sub: 'Zer dago egun bakoitzean?', href: '/kronologia', also: ['cronologia', 'egunak', 'denbora'] },
];

/** Things to do. `sim` ones only exist inside the simulator. */
export const ACTIONS: (Command & { sim?: boolean })[] = [
  { id: 'a:kimu', group: 'ekintzak', title: 'Galdetu Kimuri', sub: 'Galdetu edozer; azalpenera eramango zaitu', action: 'kimu', kbd: 'K', also: ['ayuda', 'preguntar', 'laguntzailea'] },
  { id: 'a:galderak', group: 'ekintzak', title: 'Galderak', sub: 'Aukera anitzekoak, azalpenarekin', action: 'galderak', sim: true, also: ['quiz', 'test', 'frogatu', 'preguntas'] },
  { id: 'a:aurkitu', group: 'ekintzak', title: 'Aurkitu irudian', sub: 'Egitura irudian klikatu', action: 'aurkitu', sim: true, also: ['encontrar', 'frogatu'] },
  { id: 'a:apunteak', group: 'ekintzak', title: 'Apunteak', sub: 'Jatorrizko apunteak simulazioaren ondoan', action: 'apunteak', kbd: 'N', sim: true, also: ['apuntes', 'notas'] },
  { id: 'a:laburpena', group: 'ekintzak', title: 'Laburpena', sub: 'Etaparen gakoak, datak eta egiturak', action: 'laburpena', kbd: ']', sim: true, also: ['resumen'] },
  { id: 'a:fokua', group: 'ekintzak', title: 'Foku modua', sub: 'Pantaila osoa, irudia eta azalpena bakarrik', action: 'fokua', kbd: 'F', sim: true, also: ['pantalla completa', 'fullscreen'] },
  { id: 'a:glosarioa', group: 'ekintzak', title: 'Glosarioa', sub: 'Terminoak eta definizioak', action: 'glosarioa', sim: true, also: ['glosario', 'hiztegia'] },
  { id: 'a:laguntza', group: 'ekintzak', title: 'Laguntza eta laster-teklak', sub: 'Nola erabili simulagailua', action: 'laguntza', kbd: '?', sim: true, also: ['ayuda', 'atajos', 'teklak'] },
  { id: 'a:argia', group: 'ekintzak', title: 'Itxura argia', sub: 'Paper beroa, egunez irakurtzeko', action: 'theme:light', also: ['tema claro', 'light', 'zuria', 'gai argia'] },
  { id: 'a:iluna', group: 'ekintzak', title: 'Itxura iluna', sub: 'Proiekzio gela', action: 'theme:dark', also: ['tema oscuro', 'dark', 'beltza', 'gai iluna'] },
  { id: 'a:sistema', group: 'ekintzak', title: 'Itxura: gailuaren arabera', sub: 'Gailuaren ezarpena jarraitu', action: 'theme:system', also: ['sistema', 'automatico'] },
];

/** Every topic, stage and structure as a command (built once, when the bar first opens). */
export function buildIndex(weeks: WeekDef[], structureStages: Map<string, { week: number; stage: string }>, structures: Map<string, { name: string; es?: string; aka?: string[]; definition?: string }>): Command[] {
  const out: Command[] = [];
  for (const w of weeks) {
    out.push({ id: `g:${w.week}`, group: 'gaiak', title: w.title, sub: w.subtitle, href: `/astea/${w.week}`, week: w.week, also: [`${w.week}. gaia`, `gaia ${w.week}`] });
    for (const s of w.stages) {
      if (s.views.every((v) => v.description === 'Prestatzen')) continue;
      out.push({ id: `e:${w.week}:${s.id}`, group: 'etapak', title: s.title, sub: `${w.week}. gaia · ${s.day}`, href: `/astea/${w.week}?etapa=${s.id}`, week: w.week, also: s.subtitle ? [s.subtitle] : undefined });
    }
  }
  for (const [id, def] of structures) {
    const at = structureStages.get(id);
    out.push({
      id: `s:${id}`,
      group: 'egiturak',
      title: def.name,
      sub: def.es ? `${def.es}${at ? ` · ${at.week}. gaia` : ''}` : at ? `${at.week}. gaia` : 'Egituren atlasa',
      href: at ? `/astea/${at.week}?etapa=${at.stage}&egitura=${id}` : `/egiturak?egitura=${id}`,
      week: at?.week,
      also: [...(def.aka ?? []), ...(def.es ? [def.es] : [])],
    });
  }
  return out;
}

/** How well a command answers a query: 0 = not at all. Whole words beat parts, starts beat middles. */
export function score(c: Command, q: string): number {
  if (!q) return 1;
  const words = q.split(' ');
  const title = fold(c.title);
  const also = (c.also ?? []).map(fold);
  let best = 0;
  for (const [text, weight] of [[title, 1], ...also.map((a) => [a, 0.8] as const), [fold(c.sub ?? ''), 0.35]] as const) {
    if (!text) continue;
    let s = 0;
    if (text === q) s = 10;
    else if (text.startsWith(q)) s = 8;
    else if (` ${text}`.includes(` ${q}`)) s = 6;
    else if (words.every((w) => ` ${text}`.includes(` ${w}`))) s = 5;
    else if (text.includes(q)) s = 3;
    else if (weight === 1 && q.length >= 4 && subsequence(text, q)) s = 1;
    best = Math.max(best, s * weight);
  }
  // Shorter names win ties: "Bihotza" before "Bihotz-hodi primitiboaren tolestura".
  return best ? best + 1 / (8 + title.length) : 0;
}

/** The query's letters in order, close together (a typo or a skipped letter, not a scattered match). */
const subsequence = (text: string, q: string) => {
  let i = 0;
  let start = -1;
  for (let k = 0; k < text.length && i < q.length; k++)
    if (text[k] === q[i]) {
      if (start < 0) start = k;
      i++;
      if (i === q.length) return k - start < q.length * 1.6;
    }
  return false;
};

/** The rows to show for a query, grouped and capped per group. */
export function search(all: Command[], raw: string, caps: Partial<Record<CommandGroup, number>> = {}): { group: CommandGroup; items: Command[] }[] {
  const q = fold(raw);
  const by = new Map<CommandGroup, { c: Command; s: number }[]>();
  for (const c of all) {
    const s = score(c, q);
    if (!s) continue;
    const list = by.get(c.group) ?? [];
    list.push({ c, s });
    by.set(c.group, list);
  }
  // Groups follow their best answer (an exact stage beats a topic that only mentions the word).
  return GROUP_ORDER.filter((g) => by.has(g))
    .map((g) => {
      const rows = by.get(g)!.sort((a, b) => b.s - a.s);
      return { group: g, best: rows[0].s, items: rows.slice(0, caps[g] ?? 6).map((x) => x.c) };
    })
    .sort((a, b) => b.best - a.best || GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group))
    .map(({ group, items }) => ({ group, items }));
}

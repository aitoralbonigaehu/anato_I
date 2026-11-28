import type { QuizQuestion, StageDef, StructureDef, WeekDef } from '@/lib/sim/types';
import { stages21a } from './week21a';
import { stages21b } from './week21b';
import { stages21c } from './week21c';
import { structures21a } from './week21a-structures';
import { structures21b } from './week21b-structures';
import { structures21c } from './week21c-structures';
import { structures20All } from './week20';
import { quiz19a } from './week19a-quiz';
import { quiz19b } from './week19b-quiz';
import { quiz19c } from './week19c-quiz';

/**
 * Topic 19 for class 31 (id 21, shown as "19. gaia": content/topic-no.ts), from that class's corrected notes
 * (13 sections). Three parts: 21a (the adult system: sections 1–5, with the cord stages of 21d), 21b (the
 * development: sections 6–9) and 21c (the meninges of the head, thalamus, cortex, ventricles and CSF: 3, 10–13).
 * The scenes are topic 19's; where class 31 goes through a scene in another order, it has its own copy (the *31
 * exports in components/scenes/week19).
 */

/** The first definition of a structure wins (both parts may name the same thing). */
const once = (lists: StructureDef[][]) => [...new Map(lists.flat().reverse().map((s) => [s.id, s])).values()].reverse();

/** The stages come from three files; the topic keeps the notes' order (content/notes.ts). */
const ORDER = [
  'sarrera', 'mozketak-ardatzak', 'zentrala-periferikoa', 'somatikoa-autonomoa', 'sustraiak-gongoila',
  'meningeak', 'garuneko-meningeak', 'gai-grisa-zuria', 'borondatezko-mugimenduak', 'aktu-erreflexua',
  'gandor-neurala', 'gandor-eratorriak', 'ornomuin-geruzak', 'ornomuin-plakak', 'ornomuinaren-igoera', 'puntzioa-epidurala',
  'plaka-neurala', 'hiru-xixkuak', 'bost-xixkuak', 'talamoa', 'kortexa', 'bentrikuluak', 'likido-zefalorrakideoa',
];

const inOrder = (list: StageDef[]) => [...list].sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id));
const stages = inOrder([...stages21a, ...stages21b, ...stages21c]);

/** Class 32's questions on the stages both classes share (the facts are the same lecture's). */
const ids = new Set(stages.map((s) => s.id));
const shared = (list: QuizQuestion[]) => list.filter((q) => q.stageId && ids.has(q.stageId)).map((q) => ({ ...q, id: q.id.replace(/^w19-/, 'w21-') }));

const OWNED20 = new Set(structures20All.map((s) => s.id));

export const week21: WeekDef = {
  week: 21,
  slug: 'nerbio-sistema-31',
  title: 'Nerbio sistema (31. taldea)',
  subtitle: 'Nerbio sistema zentrala eta periferikoa, meningeak, ornomuina, talamoa, kortexa eta bentrikuluak',
  dayRange: [18, 266],
  stages,
  // Topic 20 (class 32, listed first) owns the brain's parts it names first: they are reused from there.
  structures: once([structures21a, structures21b, structures21c]).filter((s) => !OWNED20.has(s.id)),
  quiz: shared([...quiz19a, ...quiz19b, ...quiz19c]),
  source: { file: '19. GAIA. NERBIO SISTEMA (zuzenduta).docx', section: '19. gaia' },
  inPreparation: true,
};

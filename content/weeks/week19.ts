import type { StageDef, StructureDef, WeekDef } from '@/lib/sim/types';
import { stages19a } from './week19a';
import { stages19b } from './week19b';
import { stages19c } from './week19c';
import { structures19a } from './week19a-structures';
import { structures19b } from './week19b-structures';
import { structures19c } from './week19c-structures';
import { quiz19a } from './week19a-quiz';
import { quiz19b } from './week19b-quiz';
import { quiz19c } from './week19c-quiz';

/**
 * Topic 19 for class 32 (id 19; class 31's is id 21: content/topic-no.ts), from that class's notes of 2026-11-23,
 * sections 1–9: their sections 10–11 (the brain's parts, the cranial pairs) are topic 20 now. Three parts: 19a (the
 * adult system: sections 1–3, plus the spinal meninges of 5.1 from week19d), 19b (the development: sections 4–6) and
 * 19c (ventricles, CSF and the meninges of the head: sections 7–9).
 */

/** The first definition of a structure wins (both parts may name the same thing). */
const once = (lists: StructureDef[][]) => [...new Map(lists.flat().reverse().map((s) => [s.id, s])).values()].reverse();

/** The stages come from three files; the topic keeps the notes' order (content/notes.ts). */
const ORDER = [
  'sarrera', 'mozketak-ardatzak', 'zentrala-periferikoa', 'somatikoa-autonomoa', 'gai-grisa-zuria', 'sustraiak-gongoila',
  'aktu-erreflexua', 'borondatezko-mugimenduak', 'mugimendu-automatikoak',
  'plaka-neurala', 'gandor-neurala', 'gandor-eratorriak', 'ornomuin-geruzak', 'ornomuin-plakak',
  'ornomuinaren-igoera', 'puntzioa-epidurala', 'meningeak',
  'hiru-xixkuak', 'bost-xixkuak', 'bentrikuluak', 'likido-zefalorrakideoa', 'garuneko-meningeak',
];

const inOrder = (list: StageDef[]) => [...list].sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id));
const stages = inOrder([...stages19a, ...stages19b, ...stages19c]);
/** The structures its stages name (the brain's parts are defined with topic 20 now). */
const used = new Set(stages.flatMap((s) => s.structures));

export const week19: WeekDef = {
  week: 19,
  slug: 'nerbio-sistema',
  title: 'Nerbio sistema (32. taldea)',
  subtitle: 'Nerbio sistema zentrala eta periferikoa, meningeak, ornomuina eta entzefaloaren garapena',
  dayRange: [18, 266],
  stages,
  structures: once([structures19a, structures19b, structures19c]).filter((s) => used.has(s.id)),
  quiz: [...quiz19a, ...quiz19b, ...quiz19c],
  source: { file: '19. gaia_ Nerbio sistema (ZUZENDU GABE).pdf', section: '19. gaia' },
  inPreparation: true,
};

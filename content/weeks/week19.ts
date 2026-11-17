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
 * Topic 19, the nervous system (docs/handover/topic-19-plan.md). Three parts built side by side: 19a (the adult
 * system: sections 1–5; agent 19-A), 19b (its development: sections 6–9; agent 19-B) and 19c (thalamus, cortex,
 * ventricles and CSF: sections 10–13; agent 19-C).
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

export const week19: WeekDef = {
  week: 19,
  slug: 'nerbio-sistema',
  title: 'Nerbio sistema',
  subtitle: 'Nerbio sistema zentrala eta periferikoa, meningeak, ornomuina eta entzefaloaren garapena',
  dayRange: [18, 266],
  stages: inOrder([...stages19a, ...stages19b, ...stages19c]),
  structures: once([structures19a, structures19b, structures19c]),
  quiz: [...quiz19a, ...quiz19b, ...quiz19c],
  source: { file: '19. GAIA. NERBIO SISTEMA (zuzendu gabe).docx', section: '19. gaia' },
  inPreparation: true,
};

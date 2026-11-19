/**
 * The light half of the question pool: the competences and the keys progress is recorded under. Its own
 * module so a page that only records or reads progress (the simulator, the figures) does not build the
 * whole pool (every question, a second of work) when it loads. `pool.ts` re-exports all of it.
 */
import type { Competence } from '@/lib/sim/types';

export const COMPETENCES: { id: Competence; label: string; hint: string }[] = [
  { id: 'noiz', label: 'Noiz?', hint: 'Kronologia: eguna, astea, ordena, zer dagoen eta zer ez' },
  { id: 'jatorria', label: 'Nondik?', hint: 'Jatorria: zein egitura edo ernetze orritatik dator' },
  { id: 'eraketa', label: 'Nola sortzen da?', hint: 'Eraketa: prozesuaren urratsak' },
  { id: 'kokapena', label: 'Non?', hint: 'Kokapena: non dagoen eta zeren artean' },
  { id: 'erlazioak', label: 'Erlazioak', hint: 'Zer den zer, zerekin jarraitzen duen, zer osatzen duten' },
  { id: 'patua', label: 'Zertan bihurtzen da?', hint: 'Patua: eratorriak eta helmuga' },
  { id: 'kausa', label: 'Zergatik?', hint: 'Kausalitatea: zerk eragiten duen' },
  { id: 'irudia', label: 'Irudian', hint: 'Irudi batean ezagutzea (Aurkitu)' },
];

/** Competence key: what "mastering" is measured on (a structure × a competence, or a competence alone). */
export const compKey = (comp: Competence, concept?: string) => `${comp}:${concept ?? '*'}`;
/** The id under which an image-recognition attempt ("Aurkitu") is recorded. */
export const imageId = (concept: string) => `irudia:${concept}`;

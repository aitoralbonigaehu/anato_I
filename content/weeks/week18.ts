import type { StageDef, StructureDef, WeekDef } from '@/lib/sim/types';
import { stages18a } from './week18a';
import { stages18b } from './week18b';
import { stages18c } from './week18c';
import { stages18d } from './week18d';
import { stages18e } from './week18e';
import { stages18f } from './week18f';
import { stages18g } from './week18g';
import { stages18h } from './week18h';
import { stages18i } from './week18i';
import { stages18j } from './week18j';
import { stages18k } from './week18k';
import { stages18l } from './week18l';
import { stages18m } from './week18m';
import { structures18a } from './week18a-structures';
import { structures18b } from './week18b-structures';
import { structures18c } from './week18c-structures';
import { structures18d } from './week18d-structures';
import { structures18e } from './week18e-structures';
import { structures18f } from './week18f-structures';
import { structures18g } from './week18g-structures';
import { structures18h } from './week18h-structures';
import { structures18i } from './week18i-structures';
import { structures18j } from './week18j-structures';
import { structures18k } from './week18k-structures';
import { structures18l } from './week18l-structures';
import { structures18m } from './week18m-structures';
import { structures18q } from './week18q-structures';
import { quiz18 } from './week18-quiz';
import { week17 } from './week17';

/** The first definition of a structure wins (two parts of the topic may name the same thing). */
const once = (lists: StructureDef[][]) => [...new Map(lists.flat().reverse().map((s) => [s.id, s])).values()].reverse();

/** The stages come from several files; the topic keeps the notes' order. */
const ORDER = ['sarrera', 'arraildurak-poltsak', 'lehen-poltsa', 'bigarren-poltsa', 'hirugarren-poltsa', 'laugarren-poltsa', 'lehen-arraildura', 'beste-arraildurak', 'guruinen-jaisketa', 'mihiaren-gorputza', 'mihiaren-sustraia', 'mihiaren-inerbazioa', 'mihiaren-muskuluak', 'tiroidea-sorrera', 'tiroidea-jaisketa', 'tiroidea-heldua', 'aurpegia-hasiera', 'sudur-plakodak', 'aurpegi-fusioa', 'ildo-nasolagrimala', 'maxilar-arteko-segmentua', 'aho-sabai-gandorrak', 'sudur-trenkada-korneteak', 'aho-sabai-akatsak', 'koanak', 'hortz-lamina', 'txano-kanpai', 'hortzaren-geruzak', 'esne-behin-betiko'];
/** Defined by an earlier topic: that topic owns the definition (each id has one owner, and the registry keeps the first). */
const EARLIER = new Set(['hodi-tiroglosoa', 'estomodeoa', 'mintz-bukofaringeoa', 'odontoblastoak', 'aurpegi-nerbioa', 'somita-okzipitalak', 'mihiaren-muskuluak', 'mailua', 'ingudea', 'ointokia', 'trakea', 'faringe-poltsak', 'faringe-hestea', ...week17.structures.map((s) => s.id)]);

const inOrder = (list: StageDef[]) => [...list].sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id));

export const week18: WeekDef = {
  week: 18,
  slug: 'burua-lepoa-2',
  title: 'Burua eta lepoa (II)',
  subtitle: 'Poltsak eta arraildurak, mihia, tiroidea, aurpegia, aho sabaia eta hortzak',
  dayRange: [22, 266],
  stages: inOrder([...stages18a, ...stages18b, ...stages18c, ...stages18d, ...stages18e, ...stages18f, ...stages18g, ...stages18h, ...stages18i, ...stages18j, ...stages18k, ...stages18l, ...stages18m]),
  structures: once([structures18a, structures18b, structures18c, structures18d, structures18e, structures18f, structures18g, structures18h, structures18i, structures18j, structures18k, structures18l, structures18m, structures18q]).filter((s) => !EARLIER.has(s.id)),
  quiz: quiz18,
  source: { file: '18. GAIA_ Burua eta lepoa ll (Zuzenduta).pdf', section: '18. gaia' },
};

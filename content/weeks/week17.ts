import type { StageDef, StructureDef, WeekDef } from '@/lib/sim/types';
import { stages17a } from './week17a';
import { stages17b } from './week17b';
import { stages17c } from './week17c';
import { stages17d } from './week17d';
import { stages17e } from './week17e';
import { stages17f } from './week17f';
import { stages17g } from './week17g';
import { stages17h } from './week17h';
import { stages17i } from './week17i';
import { structures17a } from './week17a-structures';
import { structures17b } from './week17b-structures';
import { structures17c } from './week17c-structures';
import { structures17d } from './week17d-structures';
import { structures17e } from './week17e-structures';
import { structures17f } from './week17f-structures';
import { structures17g } from './week17g-structures';
import { structures17h } from './week17h-structures';
import { structures17i } from './week17i-structures';
import { structures17q } from './week17q-structures';
import { quiz17 } from './week17-quiz';

/** The first definition of a structure wins (two parts of the topic may name the same thing). */
const once = (lists: StructureDef[][]) => [...new Map(lists.flat().reverse().map((s) => [s.id, s])).values()].reverse();

/** The stages come from several files; the topic keeps the notes' order. */
const ORDER = ['sarrera', 'kraneoaren-bi-atalak', 'hezurtze-motak', 'josturak-fontanelak', 'buru-ganga', 'kondrokraneoa', 'errai-kraneoa', 'faringe-arkuak', 'arkuaren-osagaiak', 'bikote-kranealak', 'trigeminoa', 'lehen-arkua-luzapenak', 'lehen-arkua-kartilagoak', 'lehen-arkua-muskuluak', 'bigarren-arkua', 'bigarren-arkua-muskuluak', 'hirugarren-arkua', 'bosgarren-arkua', 'bagoa', 'laringeko-kartilagoak', 'laugarren-seigarren-muskuluak', 'arkuen-mapa'];
/** Defined by an earlier topic: that topic owns the definition (each id has one owner, and the registry keeps the first). */
const EARLIER = new Set(['mesenkima', 'osteoblastoak', 'kondrozitoak', 'mintzezko-hezurtzapena', 'hezurtzapen-endokondrala', 'kartilago-eredua', 'hezur-espikulak', 'kondrokraneoa', 'okzipitalaren-ezkata', 'esklerotoma-okzipitalak', 'kartilago-parakordalak', 'hipofisi-kartilagoak', 'trenkada-kranialak', 'kapsula-periotikoa', 'hego-tenporala', 'begizulo-hegoa', 'okzipitalaren-oinaldea', 'esfenoidesaren-gorputza', 'etmoidesa', 'harkaitza', 'esfenoidesaren-hego-handia', 'esfenoidesaren-hego-txikia', 'usaimen-nerbioa']);

const inOrder = (list: StageDef[]) => [...list].sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id));

export const week17: WeekDef = {
  week: 17,
  slug: 'burua-lepoa-1',
  title: 'Burua eta lepoa (I)',
  subtitle: 'Kraneoaren garapena eta faringe-arkuak: nerbioak, kartilagoak eta muskuluak',
  dayRange: [22, 56],
  stages: inOrder([...stages17a, ...stages17b, ...stages17c, ...stages17d, ...stages17e, ...stages17f, ...stages17g, ...stages17h, ...stages17i]),
  structures: once([structures17a, structures17c, structures17b, structures17d, structures17e, structures17f, structures17g, structures17h, structures17i, structures17q]).filter((s) => !EARLIER.has(s.id)),
  quiz: quiz17,
  source: { file: '17. GAIA. BURUA ETA LEPOA (ZUZENDUTA).pdf', section: '17. gaia' },
};

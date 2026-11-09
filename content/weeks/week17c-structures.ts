import type { StructureDef } from '@/lib/sim/types';

/** Topic 17, section 2 (start): the arches from behind and what is inside one. Colours: the arches' own (ARCH in common.tsx). */
const VESSEL = '#e5484d';
const VEIN = '#5a7fd8';
const NERVE = '#ffe36e';
const CART = '#a7dbd2';

export const structures17c: StructureDef[] = [
  { id: 'lehen-arkua', name: 'I. arkua', category: 'anatomia' as const, color: '#f0883e', definition: 'Goieneko faringe-arkua. Kolore laranja bere eratorri guztietan.', location: 'Faringearen alde bietan, goian.' },
  { id: 'bigarren-arkua', name: 'II. arkua', category: 'anatomia' as const, color: '#4f9be8', definition: 'Bigarren faringe-arkua. Kolore urdina bere eratorri guztietan.', location: 'Lehenengoaren azpian.' },
  { id: 'bosgarren-arkua', name: 'V. arkua', category: 'anatomia' as const, color: '#a9a6b5', definition: 'Garatu eta jarraian endekatzen da; ez du eratorririk uzten, batzuetan ez da existitzen.' },
  { id: 'arkuko-arteria', name: 'Arkuko arteria', category: 'anatomia' as const, color: VESSEL, definition: 'Arku bakoitzean, mesenkimaren barnean, arteria bat dago.' },
  { id: 'arkuko-zaina', name: 'Arkuko zaina', category: 'anatomia' as const, color: VEIN, definition: 'Arku bakoitzean, mesenkimaren barnean, zain bat dago.' },
  { id: 'arkuko-nerbioa', name: 'Arkuko nerbioa', category: 'anatomia' as const, color: NERVE, definition: 'Arku bakoitzean, mesenkimaren barnean, nerbio bat dago.' },
  { id: 'arkuko-kartilagoa', name: 'Arkuko kartilagoa', category: 'anatomia' as const, color: CART, definition: 'Arku gehienetan, mesenkimaren barnean, kartilago bat dago (batzuetan ez).' },
  { id: 'lehen-poltsa', name: 'Lehen faringe-poltsa', category: 'anatomia' as const, color: '#f6d365', definition: 'Lehen eta bigarren arkuen arteko barneko inbaginazioa, endodermikoa.' },
  { id: 'lehen-arraildura', name: 'Lehen faringe-arraildura', category: 'anatomia' as const, color: '#7cc0ee', definition: 'Lehen eta bigarren arkuen arteko kanpoko ildoa, ektodermikoa.' },
  { id: 'faringe-arraildurak', name: 'Faringe-arraildurak', aka: ['Arraildura brankialak'], category: 'anatomia' as const, color: '#7cc0ee', definition: 'Kanpotik, arkuen artean nabaritzen diren ildoak, ektodermikoak.' },
  { id: 'laringe-zuloa', name: 'Laringe-zuloa', category: 'anatomia' as const, color: '#4a2a22', definition: 'Faringearen aurreko paretan, behean, arnas aparatuaren hastapena.' },
];

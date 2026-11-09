import type { StructureDef } from '@/lib/sim/types';

const IV = '#e4505a';
const VI = '#3fb57f';

export const structures17h: StructureDef[] = [
  { id: 'tiroide-goiko-atala', name: 'Tiroide kartilagoaren goiko aldea', category: 'mesodermoa', color: IV, definition: 'Tiroide kartilagoaren goiko atala: IV. arkuaren eratorria.', related: ['tiroide-kartilagoa', 'laugarren-arkua'] },
  { id: 'tiroide-beheko-atala', name: 'Tiroide kartilagoaren beheko atala', category: 'mesodermoa', color: VI, definition: 'Tiroide kartilagoaren beheko atala: VI. arkuaren eratorria.', related: ['tiroide-kartilagoa', 'seigarren-arkua'] },
  { id: 'kartilago-kornikulatua', name: 'Kartilago kornikulatuak', aka: ['Kornikulatuak'], category: 'mesodermoa', color: VI, definition: 'Laringeko kartilago bikoitzak, VI. arkutik.', related: ['seigarren-arkua'] },
  { id: 'kartilago-kuneiformea', name: 'Kartilago kuneiformeak', aka: ['Kuneiformeak'], category: 'mesodermoa', color: VI, definition: 'Laringeko kartilago bikoitzak, VI. arkutik.', related: ['seigarren-arkua'] },
  { id: 'faringea', name: 'Faringea', category: 'endodermoa', color: '#f6d365', definition: 'Laringearen atzean dagoen hodia; bere hormako muskulu ertzatzaileak III. eta IV. arkuetatik datoz.', related: ['goiko-ertzatzailea', 'tarteko-ertzatzailea', 'beheko-ertzatzailea'] },
];

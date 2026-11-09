import type { StructureDef } from '@/lib/sim/types';

const ENDO = '#f6d365';
const ECTO = '#7cc0ee';
const P3 = '#c05fe0';
const P4 = '#1fc8b4';

/** Topic 18 §1: the pouches, the clefts and the third and fourth pouches' derivatives. */
export const structures18a: StructureDef[] = [
  { id: 'lehen-poltsa', name: 'Lehenengo poltsa', aka: ['1. poltsa'], category: 'endodermoa', color: ENDO, definition: 'I. eta II. arkuen arteko faringe poltsa, endodermikoa.', fate: 'Eustakioren tronpa eta tinpano-kutxa.', related: ['faringe-poltsak'] },
  { id: 'bigarren-poltsa', name: 'Bigarren poltsa', aka: ['2. poltsa'], category: 'endodermoa', color: ENDO, definition: 'II. eta III. arkuen arteko faringe poltsa, endodermikoa.', fate: 'Aho sabaiko amigdala.', related: ['faringe-poltsak'] },
  { id: 'hirugarren-poltsa', name: 'Hirugarren poltsa', aka: ['3. poltsa'], category: 'endodermoa', color: P3, definition: 'III. eta IV. arkuen arteko faringe poltsa; bi alde ditu, dortsala eta bentrala.', fate: 'Dortsala: beheko paratiroide guruina. Bentrala: timoa.', related: ['faringe-poltsak', 'beheko-paratiroidea', 'timoa'] },
  { id: 'laugarren-poltsa', name: 'Laugarren poltsa', aka: ['4. poltsa'], category: 'endodermoa', color: P4, definition: 'Azken faringe poltsa (4 eta 5 batera ikasten dira); bi alde ditu, dortsala eta bentrala.', fate: 'Dortsala: goiko paratiroide guruina. Bentrala: gorputz ultimobrankiala.', related: ['faringe-poltsak', 'goiko-paratiroidea', 'gorputz-ultimobrankiala'] },
  { id: 'lehen-arraildura', name: 'Lehenengo arraildura', aka: ['1. arraildura'], category: 'ektodermoa', color: ECTO, definition: 'I. eta II. arkuen arteko kanpoko ildoa, ektodermikoa.', fate: 'Kanpoko entzumen hodia.', related: ['faringe-arraildurak'] },
  { id: 'faringe-arraildurak', name: 'Faringe arraildurak', aka: ['Arraildura brankialak', 'Arraildura faringeoak', 'Arraildurak'], category: 'ektodermoa', color: ECTO, definition: 'Arku faringeoen kanpoko aldean, arkuen artean dauden ildoak, ektodermikoak.', fate: 'Lehenengoak izan ezik, desagertu egiten dira.' },
  { id: 'goragune-epikardikoa', name: 'Goragune epikardikoa', category: 'mesodermoa', definition: 'Lepoaren behealdeko goragunea; II. arkua hazten denean harekin fusionatzen da.' },
  { id: 'laringe-zuloa', name: 'Laringe zuloa', category: 'endodermoa', color: '#e7bc4a', definition: 'Faringearen aurreko paretako zuloa, behealdean; hortik ebaginatzen da arnas aparatuaren hastapena.', space: true },
  { id: 'aorta-dortsala', name: 'Aorta dortsala', aka: ['Aorta dortsalak'], category: 'mesodermoa', color: '#e5484d', definition: 'Aorta arkuak jasotzen dituen arteria, faringearen atzean.', related: ['aorta-arkuak'] },
  { id: 'beheko-paratiroidea', name: 'Beheko paratiroide guruina', aka: ['Beheko paratiroidea', 'Beheko paratiroideak', 'Beheko paratiroide guruinak'], category: 'endodermoa', color: P3, definition: 'Paratohormona ekoizten duen guruina.', origin: 'Hirugarren poltsaren alde dortsala.', fate: 'Timoarekin jaitsi eta tiroidearen behekaldean kokatzen da.', caution: 'Goiko poltsan hasten da: izena behin betiko kokapenarena da.', related: ['hirugarren-poltsa', 'timoa', 'goiko-paratiroidea'] },
  { id: 'goiko-paratiroidea', name: 'Goiko paratiroide guruina', aka: ['Goiko paratiroidea', 'Goiko paratiroideak', 'Goiko paratiroide guruinak'], category: 'endodermoa', color: P4, definition: 'Paratohormona ekoizten duen guruina.', origin: 'Laugarren poltsaren alde dortsala.', fate: 'Gutxi jaisten da eta tiroidearen goialdean geratzen da.', caution: 'Beheko poltsan hasten da: izena behin betiko kokapenarena da.', related: ['laugarren-poltsa', 'beheko-paratiroidea'] },
  { id: 'timoa', name: 'Timoa', category: 'endodermoa', color: P3, definition: 'Pubertaroraino garatzen den organoa; gero endekatu eta helduan ia ez du funtziorik.', origin: 'Hirugarren poltsaren alde bentrala.', fate: 'Beherantz eta alde medialerantz jaisten da.', related: ['hirugarren-poltsa', 'beheko-paratiroidea'] },
  { id: 'gorputz-ultimobrankiala', name: 'Gorputz ultimobrankiala', category: 'endodermoa', color: P4, definition: 'Laugarren poltsaren alde bentraletik sortzen den egitura.', fate: 'Jaitsi eta tiroide guruinean barneratzen da: C zelulak (kaltzitonina).', related: ['laugarren-poltsa'] },
];

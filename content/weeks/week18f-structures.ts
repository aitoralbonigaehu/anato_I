import type { StructureDef } from '@/lib/sim/types';

/** Topic 18, section 2: the tongue. Colours as the scene draws them (each arch's own colour, components/scenes/week17/common.tsx). */

const I = '#f0883e';
const II = '#4f9be8';
const III = '#f2cd3f';
const IV = '#e4505a';
const NERVE = '#ffe36e';
const MUSCLE = '#d9625c';

export const structures18f: StructureDef[] = [
  { id: 'alboko-goraguneak', name: 'Alboko goraguneak', aka: ['Goragune lateralak'], es: 'Protuberancias linguales laterales', category: 'mesodermoa', color: I, definition: 'Lehen arkuaren mesenkiman, erdikalderantz ateratzen diren bi goragune; mihiaren gorputzaren parte.', related: ['tuberkulu-bakoitia', 'mihiaren-gorputza'] },
  { id: 'tuberkulu-bakoitia', name: 'Tuberkulu bakoitia', es: 'Tubérculo impar', category: 'mesodermoa', color: I, definition: 'Bi alboko goraguneen artean, lehen arkutik ere ateratzen den goragunea.', related: ['alboko-goraguneak', 'mihiaren-gorputza', 'zulo-itsua'] },
  { id: 'mihiaren-gorputza', name: 'Mihiaren gorputza', es: 'Cuerpo de la lengua', category: 'mesodermoa', color: I, definition: 'Bi alboko goraguneak eta tuberkulu bakoitia fusionatuta: osoa 1. arkutik. Mihiaren aurreko bi herenak.', fate: 'V3: sentsibilitate orokorra; VII: dastamena.', related: ['mihiaren-sustraia', 'ildo-terminala'] },
  { id: 'kupula', name: 'Kupula', aka: ['Kopula'], es: 'Cópula', category: 'mesodermoa', color: III, definition: 'II., III. eta IV. arkuen (azken honen atal baten) erdian ateratzen den goragunea. Hortik mihiaren sustraia.', related: ['mihiaren-sustraia'] },
  { id: 'mihiaren-sustraia', name: 'Mihiaren sustraia', es: 'Raíz de la lengua', category: 'mesodermoa', color: III, definition: 'Kupulatik sortua (II., III. eta IV. arkuaren atal bat). Luzatu eta leporaino heltzen da. Mihiaren atzeko herena.', fate: 'IX aurrean, X atzean; bakoitzak dastamena eta orokorra.', related: ['kupula', 'mihiaren-gorputza', 'ildo-terminala'] },
  { id: 'ildo-terminala', name: 'Ildo terminala', es: 'Surco terminal', category: 'mesodermoa', color: '#8a4a22', definition: 'Gorputza eta sustraiaren arteko V formako ildoa edo muga. Erpinean zulo itsua.', related: ['zulo-itsua', 'mihiaren-gorputza', 'mihiaren-sustraia'] },
  { id: 'zulo-itsua', name: 'Zulo itsua', es: 'Agujero ciego', category: 'endodermoa', color: '#4a2410', definition: 'Tuberkulu bakoitia eta kupularen arteko mugan garatzen den aztarnatxoa; gero ildo terminalaren erpinean geratzen da.', related: ['ildo-terminala', 'hodi-tiroglosoa'] },
  { id: 'epiglotisa', name: 'Epiglotisa', es: 'Epiglotis', category: 'mesodermoa', color: IV, definition: 'IV. arkuaren erdi dortsaletik, kupularen behekaldean. Laringe zuloa estaltzen du, janaria arnasbideetara joan ez dadin.', caution: 'Jaioberriek ez dute sistema hau garatuta: jan eta arnasa batera egin dezakete.', related: ['laringe-zuloa'] },
  { id: 'laringe-zuloa', name: 'Laringe zuloa', es: 'Orificio laríngeo', category: 'endodermoa', color: '#2b1512', space: true, definition: 'Faringearen zoruan, epiglotisaren atzean, arnasbideen sarrera.', related: ['epiglotisa', 'aritenoide-goraguneak'] },
  { id: 'aritenoide-goraguneak', name: 'Aritenoides goraguneak', es: 'Tumefacciones aritenoideas', category: 'mesodermoa', color: '#e3b39a', definition: 'Laringe zuloaren alboetan sortzen diren goraguneak; gero aritenoides kartilagoak ematen dituzte.', related: ['laringe-zuloa'] },
  { id: 'lehen-arkua', name: 'Lehen faringe-arkua', aka: ['I. arkua'], es: 'Primer arco faríngeo', category: 'mesodermoa', color: I, definition: 'Lehen faringe-arkua: mihian, gorputz osoa ematen du.' },
  { id: 'bigarren-arkua', name: 'Bigarren faringe-arkua', aka: ['II. arkua'], es: 'Segundo arco faríngeo', category: 'mesodermoa', color: II, definition: 'Bigarren faringe-arkua: mihian, kupularen parte.' },
  { id: 'hirugarren-arkua', name: 'Hirugarren faringe-arkua', aka: ['III. arkua'], es: 'Tercer arco faríngeo', category: 'mesodermoa', color: III, definition: 'Hirugarren faringe-arkua: mihian, kupularen parte.' },
  { id: 'laugarren-arkua', name: 'Laugarren faringe-arkua', aka: ['IV. arkua'], es: 'Cuarto arco faríngeo', category: 'mesodermoa', color: IV, definition: 'Laugarren faringe-arkua: mihian atal bat bakarrik, erdi dortsaletik baitator epiglotisa.' },
  { id: 'barail-nerbioa', name: 'Barail nerbioa (V3)', aka: ['Trigeminoaren barail adarra'], es: 'Nervio mandibular (V3)', category: 'ektodermoa', color: I, definition: 'Trigeminoaren barail adarra: mihiaren gorputzaren sentsibilitate orokorra.', related: ['mihiaren-gorputza'] },
  { id: 'aurpegi-nerbioa', name: 'Aurpegi nerbioa (VII)', es: 'Nervio facial (VII)', category: 'ektodermoa', color: II, definition: 'VII. bikote kraneala: bere adar batek mihiaren gorputzaren dastamena hartzen du.', related: ['mihiaren-gorputza'] },
  { id: 'glosofaringeoa', name: 'Nerbio glosofaringeoa (IX)', es: 'Nervio glosofaríngeo (IX)', category: 'ektodermoa', color: III, definition: 'IX. bikote kraneala: mihiaren sustraiaren aurreko aldeko informazio sentsitibo osoa (dastamena eta orokorra).', related: ['mihiaren-sustraia'] },
  { id: 'goiko-laringe-nerbioa', name: 'Goiko laringe nerbioa (X)', es: 'Nervio laríngeo superior (X)', category: 'ektodermoa', color: IV, definition: 'Bagoaren adar bat: mihiaren sustraiaren atzeko aldeko informazio sentsitibo osoa (dastamena eta orokorra).', related: ['mihiaren-sustraia'] },
  { id: 'hipoglosoa', name: 'Nerbio hipoglosoa (XII)', es: 'Nervio hipogloso (XII)', category: 'ektodermoa', color: NERVE, definition: 'XII. bikote kraneala, motorra: mihia mugitzen du. Ez dago arkuekin zuzenean lotuta.', related: ['mihiaren-muskuluak'] },
  { id: 'somita-okzipitalak', name: 'Somita bikote okzipitalak', es: 'Somitas occipitales', category: 'mesodermoa', color: '#e58a8a', definition: 'Mihiaren barneko muskuluen jatorria: 3 somita bikote okzipital. 4. somita bikote kraneala desagertu egiten da.', related: ['mioblasto-okzipitalak', 'mihiaren-muskuluak'] },
  { id: 'mioblasto-okzipitalak', name: 'Mioblasto okzipitalak', es: 'Mioblastos occipitales', category: 'mesodermoa', color: MUSCLE, definition: 'Somita okzipitaletatik mugitu eta mihiaren barrura migratzen duten zelulak.', related: ['somita-okzipitalak', 'mihiaren-muskuluak'] },
  { id: 'mihiaren-muskuluak', name: 'Mihiaren muskulu intrinsekoak', aka: ['Mihiaren barneko muskuluak'], es: 'Músculos intrínsecos de la lengua', category: 'mesodermoa', color: MUSCLE, definition: 'Ez dira arkuetatik garatzen, 3 somita bikote okzipitaleko mioblastoetatik baizik. XII. nerbioak inerbatzen ditu.', related: ['hipoglosoa', 'somita-okzipitalak'] },
];

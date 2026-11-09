/**
 * What's new ("Berriak"): the changes and improvements students can see, newest first, in the students'
 * words (what it means for studying, not how it was built). A new entry goes at the top; its `date` is
 * the day it reached the app. `visual` picks the little picture its card shows.
 */
export type ChangeKind = 'gaia' | 'berria' | 'hobekuntza' | 'diseinua';

export interface Change {
  id: string;
  /** ISO day it reached the app. */
  date: string;
  kind: ChangeKind;
  title: string;
  text: string;
  /** Short points: what exactly is new. */
  points?: string[];
  /** Where to see it. */
  href?: string;
  cta?: string;
  /** The card's picture: a topic's own scene, or one of the drawn ones. */
  visual?: { topic: number } | 'opening' | 'theme' | 'search' | 'story' | 'map' | 'kimu' | 'cards';
}

export const KIND: Record<ChangeKind, { label: string; hue: number }> = {
  gaia: { label: 'Gai berria', hue: 150 },
  berria: { label: 'Berria', hue: 28 },
  hobekuntza: { label: 'Hobekuntza', hue: 255 },
  diseinua: { label: 'Diseinua', hue: 320 },
};

export const CHANGES: Change[] = [
  {
    id: 'burua-lepoa',
    date: '2026-11-09',
    kind: 'gaia',
    title: 'Bi gai berri: burua eta lepoa',
    text: '17. gaia (kraneoa eta faringe-arkuak: arku bakoitzaren nerbioa, kartilagoa eta muskuluak) eta 18. gaia (poltsak eta arraildurak, mihia, tiroidea, aurpegia, aho sabaia eta hortzak), 3D eredu animatuekin eta apunteetako esaldiekin. Arku bakoitzak kolore bat du enbrioitik heldura: laranja ikusten baduzu, I. arkutik dator.',
    points: [
      'Arkuen taula osoa: arkua, nerbioa, kartilago-hezurrak eta muskuluak errenkada bakarrean',
      'Poltsen eta arrailduren taula, paratiroideen alderantzizko izenarekin argi azalduta',
      'Galderak, eskemak eta kronologia, bi gaietarako',
    ],
    href: '/astea/17',
    cta: 'Ireki 17. gaia',
    visual: { topic: 17 },
  },
  {
    id: 'belortzio-egitura-osoa',
    date: '2026-11-08',
    kind: 'hobekuntza',
    title: 'Belortzioak: egitura osoa argitzen da',
    text: 'Zirkulazio- eta digestio-irudietan, izen baten gainetik pasatzean ez da gezi-puntako zirkulu txiki bat bakarrik argitzen: egitura osoa argitzen da, hasieratik bukaeraraino. Adibidez, eskuineko aurreko zain kardinala burutik bihotzeraino, edo heste-lakioa adar biekin. Ertz fin batek erakusten du non bukatzen den.',
    points: [
      'Irudian bertan egituraren edozein lekutan jarrita ere, haren izena argitzen da',
      '«Non dago?» galderetan, egituraren edozein puntu ukitzea zuzena da',
      'Marrazkiak bere ertzik erakusten ez duenean, lehengo zirkulua geratzen da',
    ],
    href: '/belortzioak?irudia=p11',
    cta: 'Probatu zainekin',
    visual: { topic: 13 },
  },
  {
    id: 'sarrera-berria',
    date: '2026-11-07',
    kind: 'berria',
    title: 'Sarrera berria: ernalkuntzatik EnbrioAtlas-era',
    text: 'Aplikazioa irekitzean, mikroskopioaren argipean, espermatozoide batek obozitoa ernaltzen du: distira, uhin kaltzikoa, eta zigotoa zatitzen hasten da blastozisto bihurtu arte, egunen kontagailuarekin. Gero blastozistoa logo bihurtzen da eta orria diafragma batek bezala irekitzen da.',
    points: ['Itzultzen zarenean, sarrera laburra eta non utzi zenuen gogorarazten dizu', 'Esc edo klik batekin salta daiteke'],
    href: '/',
    cta: 'Sarrera berriro ikusi (orri oinean)',
    visual: 'opening',
  },
  {
    id: 'gernu-non-gaude',
    date: '2026-11-07',
    kind: 'hobekuntza',
    title: 'Gernu-sistema: inoiz ez galtzeko',
    text: '15. gaiko etapa guztiak enbrioi osotik hasten dira: eskualdea argitzen da eta kamera barrura sartzen da. Barruan, «Non gaude?» mapa txiki batek apunteetako irudia jarraitzen du: hiru giltzurrunak bizkarrean, eta ikusten ari zarena argituta.',
    points: ['Mozketa baten maila marra batekin', 'Lupa bat handitutako ereduetan (giltzurruna, nefrona, glandea)'],
    href: '/astea/15',
    cta: 'Ireki 15. gaia',
    visual: { topic: 15 },
  },
  {
    id: 'egunez-egun',
    date: '2026-11-07',
    kind: 'berria',
    title: 'Garapena egunez egun, korritu ahala',
    text: 'Hasierako orrian, apunteetako 12 gako-data ordenan: korritu ahala eszena mugitzen da, eguna, zer sortzen den eta apunteetako esaldia ikusiz.',
    points: ['«Asmatu eguna»: egunak ezkutatu, lehenik zeuk gogoratzeko', 'Data bakoitzetik zuzenean simulagailura'],
    href: '/#garapena',
    cta: 'Ikusi hasieran',
    visual: 'story',
  },
  {
    id: 'antzokia',
    date: '2026-11-07',
    kind: 'diseinua',
    title: 'Simulagailua, antzoki ilun bat',
    text: 'Eszenak erdiko oihal ilun osoa hartzen du, gaiaren kolorez argituta, eta azalpena azpian flotatzen du, irakurtzeko paper gisa. Azalpenak ez du inoiz eszena estaltzen.',
    href: '/astea/7',
    cta: 'Ireki simulagailua',
    visual: { topic: 7 },
  },
  {
    id: 'gaien-koloreak',
    date: '2026-11-07',
    kind: 'diseinua',
    title: 'Gai bakoitzak bere kolorea',
    text: 'Gai bakoitzak bere kolorea du (barrunbeak more, hezurrak hare, zirkulazioa gorri eta urdin, digestioa berde…), eta leku guztietan berdin agertzen da: txarteletan, gai-hautatzailean, ikasgeletan eta simulagailuan.',
    href: '/#gaiak',
    cta: 'Ikusi gaiak',
    visual: 'map',
  },
  {
    id: 'itxura-argia',
    date: '2026-11-07',
    kind: 'berria',
    title: 'Itxura argia (eta iluna)',
    text: 'Orain itxura argia ere badago, paper beroa egunez irakurtzeko. Gailuaren ezarpena jarraitzen du, edo goiko barrako eguzki/ilargi botoiarekin aukera dezakezu. Eszenak beti mikroskopioaren hondo ilunean ikusten dira.',
    visual: 'theme',
  },
  {
    id: 'bilatzailea',
    date: '2026-11-07',
    kind: 'berria',
    title: 'Dena bilatu: Ctrl K',
    text: 'Edozein orritatik, Ctrl K (Mac-en ⌘K) sakatuta: gaiak, etapa guztiak, egitura guztiak (gaztelaniazko izenarekin ere) eta orriak. Ekintzak ere bai: Kimuri galdetu, galderak, apunteak, foku modua…',
    points: ['Azken bilaketak lehenik', 'Lasterbide bakoitza bere ondoan, ikasteko'],
    visual: 'search',
  },
  {
    id: 'ikasgelak',
    date: '2026-11-07',
    kind: 'hobekuntza',
    title: 'Ikasgelak: fitxa eta taula berriak',
    text: 'Fitxak benetako txartelak dira orain (galdera erdian, gaiaren kolorea ertzean), eta taulak atlas bateko orriak bezala irakurtzen dira. «Proba moduan» erantzunak ukitu arte ezkutatuta daude.',
    href: '/ikasgela',
    cta: 'Ireki ikasgelak',
    visual: 'cards',
  },
  {
    id: 'kimu-animo',
    date: '2026-11-05',
    kind: 'berria',
    title: 'Kimuk animoak ematen dizkizu',
    text: 'Aplikazioa irekitzean Kimu handi agertzen da, salto batzuk egin eta «Animo!!!!» esaten dizu, eta gero bere txokora itzultzen da.',
    visual: 'kimu',
  },
  {
    id: 'irudiak-pdf',
    date: '2026-11-05',
    kind: 'hobekuntza',
    title: 'Irudiak: apunteetako marrazkiak, gezi eta izenekin',
    text: 'Irudi-laborategian PDFetako orrien ordez, marrazkiak bakarrik ageri dira, Belortzioetan bezala geziekin eta izenekin.',
    href: '/irudiak',
    cta: 'Ireki Irudiak',
    visual: { topic: 8 },
  },
  {
    id: 'gaiak-15-16',
    date: '2026-11-04',
    kind: 'gaia',
    title: 'Bi gai berri: gernu-sistema eta gonadak',
    text: '15. gaia (gernu-sistema: pronefrosatik giltzurrunera, maskuria eta uretra) eta 16. gaia (sistema urogenitala: gonadak, hodi genitalak eta kanpo genitalak), 3D eredu animatuekin eta apunteetako izen guztiekin.',
    href: '/astea/16',
    cta: 'Ireki 16. gaia',
    visual: { topic: 16 },
  },
  {
    id: 'digestioa',
    date: '2026-11-04',
    kind: 'hobekuntza',
    title: 'Digestio-aparatua, argiago',
    text: '14. gaiko eszenak garbiagoak dira: kamera hobeto kokatuta, izenak ez dira elkarren gainean jartzen, eta eredu bakoitza enbrioi osotik sartzen da.',
    href: '/astea/14',
    cta: 'Ireki 14. gaia',
    visual: { topic: 14 },
  },
];

/** The newest change's day: the "what's new" dot shows until the student has seen it. */
export const LATEST = CHANGES.reduce((a, c) => (c.date > a ? c.date : a), '');
export const SEEN_KEY = 'enbrioatlas:berriak-seen';

const MONTHS = ['urtarrilaren', 'otsailaren', 'martxoaren', 'apirilaren', 'maiatzaren', 'ekainaren', 'uztailaren', 'abuztuaren', 'irailaren', 'urriaren', 'azaroaren', 'abenduaren'];
/** "2026ko azaroaren 7a". */
export const longDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return `${y}ko ${MONTHS[m - 1]} ${d}a`;
};

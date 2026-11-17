import type { StageDef } from '@/lib/sim/types';
import { ArchMap17, S_MAP } from '@/components/scenes/week17/Muscles17';

const FILE = '17. GAIA. BURUA ETA LEPOA (ZUZENDUTA) fitxategiaren kopia.pdf';
const ORIENT = { top: 'Kraneala', bottom: 'Kaudala' };

export const stages17i: StageDef[] = [
  {
    id: 'arkuen-mapa',
    day: '5. astea',
    dayRange: [29, 35],
    title: 'Arkuen mapa',
    subtitle: 'Arku bakoitza: nerbioa, kartilagoak eta muskuluak',
    intro: 'Gaiaren laburpena, arkuz arku errezitatzeko moduan: buruan pizten da arku bakoitzak utzi duena, eta taulan idatzita geratzen da. Bi arkuren artean banatzen diren egiturak zuriz nabarmentzen dira bukaeran.',
    duration: 62,
    structures: ['lehen-arkua', 'bigarren-arkua', 'hirugarren-arkua', 'laugarren-arkua', 'seigarren-arkua', 'trigeminoa'],
    keyPoints: ['I: V3 · Meckel · baraila, mailua, ingudea · murtxikatzaileak', 'II: VII · Reichert · ointokia, estiloide apofisia · mimikoak', 'III: IX · hioidearen behekoa · estilofaringeoa', 'IV: X, goiko laringe-nerbioa · tarteko eta beheko ertzatzaileak', 'VI: X, laringe-nerbio atzerakaria · laringe barneko muskuluak'],
    source: { file: FILE, section: '2.2-2.6. Arku faringeoak' },
    views: [
      {
        id: 'mapa',
        label: 'Arkuen mapa 3D',
        plane: 'eskema',
        description: 'Fetu-burua 3D eta taula: errenkada bakoitza arku bat da, bere kolorearekin (I laranja, II urdina, III horia, IV gorria, VI berdea), eta buruan arku horren nerbioa, hezurrak eta muskuluak pizten dira. Zuriz, bi arkuren artean banatzen diren egiturak. Arrastatu burua biratzeko.',
        orientation: ORIENT,
        scene: ArchMap17,
        travel: false,
      },
    ],
    beats: [
      {
        at: S_MAP[0],
        notes: ['w17/2.2.2/p3/s2', 'w17/2.2.1/p3/s1', 'w17/2.2.1/p3/s2', 'w17/2.2.1/p5/s1', 'w17/2.2.3/p3/s2', 'w17/2.2.3/p3/s3', 'w17/2.2.3/p4/s1'],
        idea: 'I. arkua: V3, Meckel, baraila, mailua eta ingudea, murtxikatzaileak.',
        text: 'Lehenengo arkua. Bere nerbioa V3 da, barail-nerbioa: trigeminoaren hirugarren adarra. Meckel kartilagoaren goiko muturretik mailua eta ingudea sortzen dira, eta haren inguruko mesenkimatik baraila. Arku beretik hezur maxilarra, zigomatikoa eta loki hezurraren atal bat. Muskuluak: murtxikatzaileak, maseteroa eta tenporala, eta milohioideoa.',
        focus: ['lehen-arkua'],
        exam: 'I. arkua: V3 · Meckel · baraila, mailua, ingudea · murtxikatzaileak.',
        view: 'mapa',
      },
      {
        at: S_MAP[1],
        notes: ['w17/2.3.2/p3/s1', 'w17/2.3.2/p3/s2', 'w17/2.3.1/p3/s1', 'w17/2.3.1/p3/s2', 'w17/2.3.1/p3/s3', 'w17/2.3.3/p3/s1', 'w17/2.3.3/p3/s3', 'w17/2.3.3/p4/s1', 'w17/2.3.3/p4/s2', 'w17/2.2.1/p6/s1', 'w17/2.2.1/p6/s2', 'w17/2.2.3/p5/s1'],
        idea: 'II. arkua: VII, Reichert, ointokia eta estiloide apofisia, mimikoak.',
        text: 'Bigarren arkua, VII.a, aurpegi-nerbioa. Reichert kartilagoa endekatu egiten da eta muturretan bakarrik uzten ditu hezurrak: ointokia eta estiloide apofisia. Muskuluak: mimikoak eta platisma, aurikularrak, okzipitala eta estilohioideoa. Digastrikoa bitan banatzen da: aurreko sabela I. arkutik, V3k inerbatuta, eta atzeko sabela II.etik, VII.ak inerbatuta.',
        caution: 'Beste liburu batzuetan ingudearen adar luzea II. arkutik dator; apunteetan horri ez zaio kasurik egiten: mailua eta ingudea I. arkutik.',
        focus: ['bigarren-arkua'],
        exam: 'II. arkua: VII · Reichert · ointokia, estiloide apofisia · mimikoak.',
        view: 'mapa',
      },
      {
        at: S_MAP[2],
        notes: ['w17/2.4.2/p3/s1', 'w17/2.4.2/p3/s2', 'w17/2.4.2/p3/s3', 'w17/2.4.1/p3/s1', 'w17/2.4.1/p3/s2', 'w17/2.4.3/p3/s6', 'w17/2.4.3/p4/s1', 'w17/2.4.3/p4/s2'],
        idea: 'III. arkua: IX, hioidearen behekoa, estilofaringeoa.',
        text: 'Hirugarren arkua, IX.a, glosofaringeoa. Ez du beste bien bezalako kartilagorik: hioidearen gorputzaren beheko erdia eta adar nagusiak bakarrik ematen ditu; goiko erdia eta adar txikiak II. arkutik datoz. Muskuluak, sakonagoak: estilofaringeoa eta faringearen goiko ertzatzaileak.',
        focus: ['hirugarren-arkua'],
        exam: 'III. arkua: IX · hioidearen behekoa · estilofaringeoa.',
        view: 'mapa',
      },
      {
        at: S_MAP[3],
        notes: ['w17/2.6.1/p3/s1', 'w17/2.6.1/p4/s2', 'w17/2.6.2/p3/s1', 'w17/2.6.3/p4/s2'],
        idea: 'IV. arkua: bagoa, goiko laringe-nerbioa, tarteko eta beheko ertzatzaileak.',
        text: 'Laugarren arkuari bagoaren adar bat heltzen zaio, goiko laringe-nerbioa. Laugarrenean eta seigarrenean ez da hezurrik eratzen, kartilagoak bakarrik. Muskuluak: faringearen tarteko eta beheko ertzatzaileak; goikoak III. arkutik datoz.',
        focus: ['laugarren-arkua'],
        exam: 'IV. arkua: X, goiko laringe-nerbioa · tarteko eta beheko ertzatzaileak.',
        view: 'mapa',
      },
      {
        at: S_MAP[4],
        notes: ['w17/2.6.1/p5/s2', 'w17/2.6.2/p3/s2', 'w17/2.6.2/p3/s3', 'w17/2.6.2/p3/s4', 'w17/2.6.3/p5/s2'],
        idea: 'VI. arkua: laringe-nerbio atzerakaria, laringe barneko muskuluak.',
        text: 'Seigarren arkuari bagoaren beste adarra, laringe-nerbio atzerakaria. Tiroide kartilagoaren goiko aldea, goranzko adarra, IV. arkutik dator; gorputzaren beheko atala eta beste kartilagoak VI.etik: krikoidea, aritenoidea, kornikulatuak eta kuneiformeak. Muskuluak: laringe barneko muskulu intrintsekoak.',
        caution: 'Epiglotisa: gai honek «4. eta 6. arkuetatik» besterik ez du esaten; 18. gaiak zehazten du 4. arkuaren alde dortsaletik datorrela.',
        focus: ['seigarren-arkua'],
        exam: 'VI. arkua: X, atzerakaria · laringe barneko muskuluak.',
        view: 'mapa',
      },
      {
        at: S_MAP[5],
        notes: ['w17/2/p4/s9', 'w17/2.2.3/p3/s1', 'w17/2.2.3/p6/s1', 'w17/2.6.3/p6/s1'],
        idea: 'Muskulu baten jatorria: bere nerbioak esaten du.',
        text: 'Mapa osoa: lau nerbio, bost arku, bagoa bi arkuetan banatzen delako. Muskuluek migratu egiten dute, baina inerbatzen dituen nerbioak esaten digu zein arkutatik datozen. Zuriz nabarmendutakoak dira ikasi beharrekoak, bi arkuren artean banatzen direlako: hioidea, tiroidea, digastrikoa eta faringe-ertzatzaileak.',
        focus: ['lehen-arkua', 'bigarren-arkua', 'hirugarren-arkua', 'laugarren-arkua', 'seigarren-arkua'],
        view: 'mapa',
      },
    ],
  },
];

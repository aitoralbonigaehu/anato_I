import type { StructureDef } from '@/lib/sim/types';

/** Topic 18, notes 4.1: the palate, the septum, the conchae and the choanae. */

const ORANGE = '#f0883e';
const YELLOW = '#f6d95a';

export const structures18e: StructureDef[] = [
  { id: 'maxilar-arteko-segmentua', name: 'Maxilar arteko segmentua', aka: ['Segmentu intermaxilarra'], category: 'anatomia', color: YELLOW, definition: 'Bi aldeetako luzakin maxilarrak eta erdian ertz medialak fusionatu ondoren sortzen den egitura. Hasierako aho sabaiaren hirukia osatzen du.', fate: 'Hasierako aho sabaia.', related: ['hasierako-aho-sabaia', 'luzapen-maxilarra'] },
  { id: 'hasierako-aho-sabaia', name: 'Hasierako aho sabaia', aka: ['Aho sabai primarioa'], category: 'anatomia', color: YELLOW, definition: 'Aho sabaiaren aurre-aurreko atala, hiruki formakoa, sudur-hastapenen ertz medialetatik. Hemen txertatzen dira 4 ebakortzak.', related: ['maxilar-arteko-segmentua', 'ebakortz-zuloa', 'ebakortzak'] },
  { id: 'ebakortz-zuloa', name: 'Ebakortz zuloa', category: 'anatomia', color: '#5b4a66', definition: 'Hasierako aho sabaiaren hirukiaren erpinean dagoen markatxoa. Errafea hemen gelditzen da.', related: ['hasierako-aho-sabaia', 'aho-sabaiko-errafea'] },
  { id: 'ebakortzak', name: '4 ebakortzak', aka: ['Ebakortzak'], category: 'anatomia', color: '#fbf8ee', definition: 'Hasierako aho sabaian txertatzen dira; horregatik deitzen zaio "4 ebakortzen hezur maxilarraren atala".', related: ['hasierako-aho-sabaia'] },
  { id: 'aho-sabai-gandorrak', name: 'Aho-sabaiko gandorrak', aka: ['Aho sabaiaren plakak', 'Aho-sabaiko plakak', 'Luzakin maxilarren luzapenak'], category: 'anatomia', color: ORANGE, definition: 'Prozesu maxilarretatik ateratzen dira. 6. astean beherantz, mihiaren alboetan; 7. astean horizontal, mihiaren gainean; 9. astean erdian fusionatzen dira.', origin: 'I. arkuaren luzapen maxilarrak.', fate: 'Aho sabaiaren atzeko atal handia.', related: ['luzapen-maxilarra', 'aho-sabaiko-errafea', 'aho-sabai-gogorra'] },
  { id: 'aho-sabaiko-errafea', name: 'Aho sabaiaren errafea', aka: ['Errafea'], category: 'anatomia', color: '#e9d9a4', definition: 'Bi plaken jostura-aztarna, aho sabaiaren erdian. Ez da ebakortzetaraino heltzen: ebakortz zuloraino bakarrik.', related: ['aho-sabai-gandorrak', 'ebakortz-zuloa'] },
  { id: 'aho-sabai-gogorra', name: 'Aho sabai gogorra', aka: ['Hezurrezko aho sabaia'], category: 'anatomia', color: ORANGE, definition: 'Hiru atalak batera: 2 plakak eta hasierako aho sabaia. Aurreko atala.', parts: ['hasierako-aho-sabaia', 'aho-sabai-gandorrak'], related: ['aho-sabai-biguna'] },
  { id: 'aho-sabai-biguna', name: 'Aho sabai biguna', category: 'anatomia', color: '#e9a7a0', definition: 'Aho sabaiaren atzeko aldea. Ez da inoiz hezurtuko: hezurtzea ez da ubularaino heltzen.', related: ['aho-sabai-gogorra', 'ubula'] },
  { id: 'ubula', name: 'Ubula', aka: ['Kanpanilla'], category: 'anatomia', color: '#e9a7a0', definition: 'Aho sabai bigunaren atzeko muturra (kanpanilla).', related: ['aho-sabai-biguna'] },
  { id: 'sudur-trenkada', name: 'Sudur trenkada', category: 'anatomia', color: '#efe5cf', definition: 'Goitik behera hazten da, etmoidetik. 10.–12. asteetan aho sabaira heldu eta fusionatzen da. Aurrekaldea kartilagoz, atzekaldea hezurrez.', related: ['sudur-barrunbea', 'aho-sabai-gandorrak'] },
  { id: 'sudur-barrunbea', name: 'Sudur barrunbea', aka: ['Sudur barrunbeak'], category: 'barrunbea', color: '#3b3346', definition: 'Trenkadak bitan banatzen du. Alboko hormak bihurriak dira: korneteak.', space: true, related: ['sudur-trenkada', 'korneteak', 'koana'] },
  { id: 'aho-barrunbea', name: 'Aho barrunbea', category: 'barrunbea', color: '#4a3540', definition: 'Aho sabaiaren azpiko barrunbea; koanen bidez lotzen da sudur barrunbearekin.', space: true, related: ['sudur-barrunbea'] },
  { id: 'mihia', name: 'Mihia', category: 'anatomia', color: '#d96a6a', definition: '6. astean gandorrak baino gorago dago; 7. astean behera doa eta gandorrak horizontalizatu daitezke.', related: ['aho-sabai-gandorrak'] },
  { id: 'korneteak', name: 'Korneteak', aka: ['Maskorrak'], category: 'anatomia', color: '#a7dbd2', definition: 'Sudur barrunbeen alboko hormen egitura bihurriak. 3 bikote: goikoa, tartekoa eta behekoa.', parts: ['goiko-kornetea', 'tarteko-kornetea', 'beheko-kornetea'] },
  { id: 'goiko-kornetea', name: 'Goiko kornetea', category: 'anatomia', color: '#a7dbd2', definition: 'Etmoide hezurraren (errai-hezurra) atala.', related: ['korneteak'] },
  { id: 'tarteko-kornetea', name: 'Tarteko kornetea', aka: ['Erdiko kornetea'], category: 'anatomia', color: '#a7dbd2', definition: 'Etmoide hezurraren (errai-hezurra) atala.', related: ['korneteak'] },
  { id: 'beheko-kornetea', name: 'Beheko kornetea', category: 'anatomia', color: '#c7a6e0', definition: 'Hezur propioa, soltea.', related: ['korneteak'] },
  { id: 'goiko-ezpaina', name: 'Goiko ezpaina', category: 'anatomia', color: '#efc4ae', definition: 'Bi jatorri: alde medialerantz mugitutako luzapen maxilarrak eta sudur hastapenen ertz mediala.', related: ['erbi-ezpaina'] },
  { id: 'erbi-ezpaina', name: 'Erbi-ezpaina', aka: ['Labio leporinoa'], category: 'anatomia', color: '#6b5a70', definition: 'Fusio akatsa goiko ezpainean; alde batekoa edo aldebikoa.', related: ['goiko-ezpaina', 'aho-sabai-arraila'] },
  { id: 'aho-sabai-arraila', name: 'Aho-sabai arraila', category: 'anatomia', color: '#6b5a70', definition: 'Aho sabaia ondo fusionatu gabe. Jateko arazoak eragiten ditu, janaria sudur barrunbeetara pasa baitaiteke. Kirurgiaz konpon daiteke.', related: ['aho-sabai-gandorrak'] },
  { id: 'mintz-bukonasala', name: 'Mintz bukonasala', category: 'anatomia', color: '#f4efe6', definition: '6. astean sudur barrunbearen eta ahoaren artean aurkitzen den mintz fina. 7. astean apurtu eta desagertzen da.', fate: 'Hasierako koana irekitzen du.', related: ['koana', 'sudur-barrunbea'] },
  { id: 'koana', name: 'Koanak', aka: ['Koana', 'Hasierako koana'], category: 'barrunbea', color: '#5a4b78', definition: 'Sudur eta aho barrunbeen arteko komunikabideak, kraneoaren barnean. Hasieran aurrean; gero atzerantz, faringerantz.', space: true, related: ['narina', 'mintz-bukonasala'] },
  { id: 'narina', name: 'Narinak', aka: ['Narina'], category: 'barrunbea', color: '#3b3346', definition: 'Sudurraren 2 zulo nagusi kanpoan.', space: true, related: ['koana'] },
];

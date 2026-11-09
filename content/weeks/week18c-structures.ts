import type { StructureDef } from '@/lib/sim/types';

/** Topic 18 §4–4.1, the face (components/scenes/week18/face-model.ts). Colours as the notes' figures. */
const ORANGE = '#f0883e';
const YELLOW = '#f5d94e';
const BLUE = '#86cdf0';

export const structures18c: StructureDef[] = [
  { id: 'goragune-frontonasala', name: 'Goragune frontonasala', aka: ['Bekoki goragunea'], category: 'anatomia', color: '#efcdb8', definition: 'Estomodeoaren goikaldeko goragunea. Bertan agertzen dira sudur plakodak.', location: 'Estomodeoaren gainean, erdian.', related: ['sudur-plakoda', 'estomodeoa'] },
  { id: 'luzapen-maxilarra', name: 'Luzapen maxilarra', aka: ['Luzakin maxilarra', 'Maxilar prozesua'], category: 'anatomia', color: ORANGE, definition: 'I. arkuaren osagaia, estomodeoaren alboan. Alde medialerantz eta aurrerantz luzatzen da.', origin: 'I. faringe-arkua.', fate: 'Goiko ezpainaren alboak eta masailak; barruan aho sabaiko gandorrak.', related: ['barail-luzapena', 'estomodeoa'] },
  { id: 'barail-luzapena', name: 'Barail luzapena', aka: ['Barail-luzakina', 'Barail prozesua'], category: 'anatomia', color: ORANGE, definition: 'I. arkuaren osagaia, estomodeoaren azpian.', origin: 'I. faringe-arkua.', related: ['luzapen-maxilarra', 'estomodeoa'] },
  { id: 'estomodeoa', name: 'Estomodeoa', aka: ['Hasierako ahoa'], category: 'ektodermoa', color: '#8e4348', definition: 'Hasierako ahoa, epitelio ektodermikoa. Luzapen maxilarren eta barail luzapenen erdian.', space: true, related: ['mintz-bukofaringeoa'] },
  { id: 'mintz-bukofaringeoa', name: 'Mintz bukofaringeoa', category: 'anatomia', color: '#e0a6a6', definition: 'Estomodeoaren hondoko mintza, barnerago: argazkietan ez da ikusten.', location: 'Estomodeoaren hondoan.', related: ['estomodeoa'] },
  { id: 'bigarren-arkua', name: 'II. faringe-arkua', aka: ['Bigarren arkua'], category: 'anatomia', color: '#4f9be8', definition: 'Bigarren faringe-arkua, I. arkuaren azpian.' },
  { id: 'sudur-plakoda', name: 'Sudur plakoda', aka: ['Sudur hodi hastapena', 'Sudur hastapena'], category: 'ektodermoa', color: YELLOW, definition: '5. astean goragune frontonasalean agertzen den lodiunea (2 daude). Sudur hobitxoa + bi ertzak.', parts: ['sudur-ertz-mediala', 'sudur-ertz-laterala', 'sudur-hobitxoa'], related: ['goragune-frontonasala'] },
  { id: 'sudur-ertz-mediala', name: 'Sudur plakodaren ertz mediala', aka: ['Ertz mediala', 'Ertz barnekoa', 'Ertz nasala'], category: 'anatomia', color: YELLOW, definition: 'Sudur plakodaren barneko ertza (horia, nasala).', fate: 'Fusionatuta: sudurraren erdiko atala, goiko ezpainaren erdiko atala eta, barnetik, hasierako aho sabaia.' },
  { id: 'sudur-ertz-laterala', name: 'Sudur plakodaren ertz laterala', aka: ['Ertz laterala', 'Ertz kanpokoa', 'Ertz tenporala'], category: 'anatomia', color: BLUE, definition: 'Sudur plakodaren kanpoko ertza (urdina, tenporala).', fate: 'Sudur hegalak.' },
  { id: 'sudur-hobitxoa', name: 'Sudur hobitxoa', aka: ['Usaimen hobitxoa', 'Sudur hobia'], category: 'barrunbea', color: '#74393e', definition: 'Bi ertzen arteko sakonunea, gero eta sakonagoa. Ez dira begiak.', space: true },
  { id: 'ildo-nasolagrimala', name: 'Ildo nasolagrimala', category: 'anatomia', color: '#a84a24', definition: 'Sudur plakodaren ertz lateralaren (sudur-hegalaren) eta luzapen maxilarraren arteko ildoa.', fate: 'Hodi nasolagrimala eta malko zakua.' },
  { id: 'hodi-nasolagrimala', name: 'Hodi nasolagrimala', aka: ['Malko hodia'], category: 'anatomia', color: '#9b6cf0', definition: 'Ildo nasolagrimalaren barnean eratzen den hodia: sudur barrunbea eta begiaren mutur mediala komunikatzen ditu.', origin: 'Ildo nasolagrimala.' },
  { id: 'malko-zakua', name: 'Malko zakua', category: 'anatomia', color: '#c9a4ff', definition: 'Malko hodiaren goikaldeko zabalgunea, begiaren erpin medialean.' },
  { id: 'sudurraren-erdiko-atala', name: 'Sudurraren erdiko atala', category: 'anatomia', color: YELLOW, definition: 'Bi ertz medialen fusioaren eratorria (10. astea).', origin: 'Sudur plakoden ertz medialak.' },
  { id: 'goiko-ezpainaren-erdiko-atala', name: 'Goiko ezpainaren erdiko atala', category: 'anatomia', color: YELLOW, definition: 'Kanpotik, ertz medialen eratorria; ez dator luzapen maxilarretatik.', origin: 'Sudur plakoden ertz medialak.' },
  { id: 'sudur-hegalak', name: 'Sudur hegalak', category: 'anatomia', color: BLUE, definition: 'Plakoden ertz lateralen eratorriak.', origin: 'Sudur plakoden ertz lateralak.' },
];

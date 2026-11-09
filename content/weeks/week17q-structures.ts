import type { StructureDef } from '@/lib/sim/types';

/**
 * Topic 17: the safety net. Shared ids no part of the topic defined; a definition in week17a..i wins over these
 * (see `once` in week17.ts). Worded from the notes.
 */

const I = '#f0883e';
const II = '#4f9be8';
const III = '#f2cd3f';
const IV = '#e4505a';
const VI = '#3fb57f';

export const structures17q: StructureDef[] = [
  // ---- Nerbioak ----
  {
    id: 'glosofaringeoa',
    name: 'Nerbio glosofaringeoa',
    aka: ['IX. bikote kraneala'],
    category: 'anatomia',
    color: III,
    definition: 'IX. bikote kraneala, hirugarren arkuaren nerbioa. Mistoa da: luzatu egiten da eta mihiarekin erlazionatutako eta faringeko muskuluak inerbatzera heltzen da.',
    origin: 'Hirugarren arku faringeoa.',
    related: ['hirugarren-arkua'],
  },
  {
    id: 'bagoa',
    name: 'Nerbio bagoa',
    aka: ['X. bikote kraneala'],
    category: 'anatomia',
    color: IV,
    definition: 'X. bikote kraneala, mistoa eta nerbio parasinpatiko nagusiena. IV. eta VI. arkuetara luzatzen da, baina bakoitzari adar bat heltzen zaio; aurreko eta tarteko hestetik ateratzen diren errai guztiak eta bihotza inerbatzen ditu.',
    origin: 'IV. eta VI. arku faringeoak.',
    fate: 'Adarrak: goiko laringe nerbioa (IV. arkua) eta laringe nerbio atzekaria (VI. arkua).',
    related: ['goiko-laringe-nerbioa', 'laringe-atzerakaria', 'laugarren-arkua', 'seigarren-arkua'],
  },
  {
    id: 'goiko-laringe-nerbioa',
    name: 'Goiko laringe nerbioa',
    category: 'anatomia',
    color: IV,
    definition: 'Nerbio bagoaren adarra, IV. arku faringeoaren muskuluetara heltzen dena: tarteko eta beheko muskulu ertzatzaileak inerbatzen ditu.',
    origin: 'Nerbio bagoaren adarra (IV. arkua).',
    related: ['bagoa', 'laugarren-arkua'],
  },
  {
    id: 'laringe-atzerakaria',
    name: 'Laringe nerbio atzekaria',
    aka: ['Laringe atzerakaria'],
    category: 'anatomia',
    color: VI,
    definition: 'Nerbio bagoaren adarra, VI. arkuen muskuluak inerbatzen dituena: laringe barneko muskuluak.',
    origin: 'Nerbio bagoaren adarra (VI. arkua).',
    related: ['bagoa', 'seigarren-arkua'],
  },
  // ---- Hezurrak ----
  {
    id: 'hezur-maxilarra',
    name: 'Hezur maxilarra',
    category: 'anatomia',
    color: I,
    definition: 'Luzapen maxilarretik ateratzen den hezurra, zigomatikoarekin eta tenporalaren ezkatarekin batera.',
    origin: 'Lehenengo arkuaren luzapen maxilarra.',
    related: ['luzapen-maxilarra', 'lehen-arkua'],
  },
  {
    id: 'zigomatikoa',
    name: 'Zigomatikoa',
    category: 'anatomia',
    color: I,
    definition: 'Luzapen maxilarretik ateratzen den hezurra.',
    origin: 'Lehenengo arkuaren luzapen maxilarra.',
    related: ['luzapen-maxilarra', 'lehen-arkua'],
  },
  {
    id: 'estiloide-apofisia',
    name: 'Estiloide apofisia',
    aka: ['Tenporalaren estiloide apofisia', 'Apofisi estiloideoa'],
    category: 'anatomia',
    color: II,
    definition: 'Tenporalaren apofisia, 2. arkuaren kartilagoaren beheko muturrean eratua. Oso garrantzitsua da, muskulu asko hemen txertatzen direlako.',
    origin: 'Bigarren arku faringeoa.',
    related: ['reichert-kartilagoa', 'bigarren-arkua'],
  },
  {
    id: 'hioide-gorputza',
    name: 'Hioide hezurraren gorputza',
    category: 'anatomia',
    definition: 'Hioide hezurraren erdiko atala, bi jatorrikoa: goiko erdia 2. arkutik eta beheko erdia 3. arkutik.',
    origin: 'Goiko erdia: 2. arkua. Beheko erdia: 3. arkua.',
    related: ['hioide-hezurra', 'bigarren-arkua', 'hirugarren-arkua'],
  },
  {
    id: 'hioide-adar-txikia',
    name: 'Hioide hezurraren adar txikia',
    category: 'anatomia',
    color: II,
    definition: '2. arkuaren kartilagoaren beheko muturrean eratzen da.',
    origin: 'Bigarren arku faringeoa.',
    related: ['hioide-hezurra', 'reichert-kartilagoa', 'bigarren-arkua'],
  },
  {
    id: 'hioide-adar-nagusia',
    name: 'Hioidearen adar nagusiak',
    aka: ['Hioide hezurraren adar nagusia'],
    category: 'anatomia',
    color: III,
    definition: 'Bi dira, ezkerrean bat eta bestea eskuinean; hirugarren arkutik eratzen dira.',
    origin: 'Hirugarren arku faringeoa.',
    related: ['hioide-hezurra', 'hirugarren-arkua'],
  },
  // ---- Laringea ----
  {
    id: 'tiroide-kartilagoa',
    name: 'Tiroide kartilagoa',
    category: 'anatomia',
    color: IV,
    definition: 'Laringeko hiru kartilago nagusietako bat.',
    origin: '4. eta 6. arku faringeoak.',
    related: ['laugarren-arkua', 'seigarren-arkua'],
  },
  {
    id: 'krikoide-kartilagoa',
    name: 'Krikoide kartilagoa',
    category: 'anatomia',
    color: VI,
    definition: 'Laringeko hiru kartilago nagusietako bat. Haren mailan, aurrekaldean, gelditzen da tiroide guruina.',
    origin: '4. eta 6. arku faringeoak.',
    related: ['laugarren-arkua', 'seigarren-arkua', 'tiroide-guruina'],
  },
  {
    id: 'epiglotisa',
    name: 'Epiglotisa',
    category: 'anatomia',
    color: IV,
    definition: 'Laringeko hiru kartilago nagusietako bat, "L" formakoa. Laringe zuloa estaltzen du, helduetan janaria arnasbideetara ez joateko.',
    origin: '4. arkuaren alde erdi dortsala, kupularen behekaldean.',
    related: ['laugarren-arkua'],
  },
  {
    id: 'aritenoide-kartilagoa',
    name: 'Aritenoide kartilagoa',
    category: 'anatomia',
    color: VI,
    definition: 'Laringeko kartilagoa, hiru nagusien ondoren aipatzen dena; gero beste bi bikote daude, kornikulatuak eta kuneiformeak.',
    origin: '4. eta 6. arku faringeoak.',
    related: ['laugarren-arkua', 'seigarren-arkua'],
  },
];

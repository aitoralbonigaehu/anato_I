import type { StructureDef } from '@/lib/sim/types';

/** Topic 17, embryo arches: nerves and processes. Colours follow ARCH (a nerve wears its arch's colour). */
const I = '#f0883e';
export const structures17b: StructureDef[] = [
  { id: 'lehen-arkua', name: 'I. arkua', category: 'mesodermoa', color: I, definition: 'Arkurik kranealena, estomodeoaren inguruan: luzapen maxilarra eta barail luzapena. Nerbioa: V3, barail-nerbioa (trigeminoaren hirugarren adarra).' },
  { id: 'luzapen-maxilarra', name: 'Luzapen maxilarra', aka: ['Atal maxilarra', 'Prozesu maxilarra', 'Luzakin maxilarra'], category: 'mesodermoa', color: I, definition: 'I. arkuaren alde dortsala, estomodeoaren goikaldetik. Hemen garatzen da, besteak beste, hezur maxilarra.' },
  { id: 'barail-luzapena', name: 'Barail luzapena', aka: ['Barail prozesua', 'Barail-luzakina'], category: 'mesodermoa', color: I, definition: 'I. arkuaren atala, estomodeoaren behekaldetik. Bere kartilagoa Meckel-ena da; hemen garatzen da baraila.' },
  { id: 'bigarren-arkua', name: 'II. arkua', category: 'mesodermoa', color: '#4f9be8', definition: 'Bigarren arkua. Nerbioa: VII (aurpegi-nerbioa).' },
  { id: 'hirugarren-arkua', name: 'III. arkua', category: 'mesodermoa', color: '#f2cd3f', definition: 'Hirugarren arkua. Nerbioa: IX (glosofaringeoa).' },
  { id: 'laugarren-arkua', name: 'IV. arkua', category: 'mesodermoa', color: '#e4505a', definition: 'Laugarren arkua, VI.arekin batera. Nerbioa: X (goiko laringe nerbioa).' },
  { id: 'bosgarren-arkua', name: 'V. arkua', category: 'mesodermoa', color: '#a9a6b5', definition: 'Hasieran agertzen da, garapenean desagertu edo endekatu egiten da: ez du eratorririk uzten.' },
  { id: 'seigarren-arkua', name: 'VI. arkua', category: 'mesodermoa', color: '#3fb57f', definition: 'Seigarren arkua, IV.arekin batera. Nerbioa: X (laringe nerbio atzerakaria).' },
  { id: 'trigeminoa', name: 'Trigeminoa (V)', aka: ['V. bikote kraneala', 'Nerbio trigeminoa'], category: 'ektodermoa', color: I, definition: 'V. bikote kraneala. Buruko eta lepoko sentsibilitate orokor ia guztia hartzen du. Gasser gongoiletik hiru adar: V1, V2 eta V3. I. arkuaren nerbioa hirugarren adarra da, V3 (barail-nerbioa); V1 eta V2 ez daude lehen arkuan.' },
  { id: 'gasser-gongoila', name: 'Gasser gongoila', aka: ['Trigeminoaren gongoila'], category: 'ektodermoa', color: I, definition: 'Trigeminoaren gongoil nagusia: hortik ateratzen dira hiru adarrak.' },
  { id: 'nerbio-oftalmikoa', name: 'Nerbio oftalmikoa (V1)', aka: ['Adar oftalmikoa', 'V1'], category: 'ektodermoa', color: I, definition: 'Trigeminoaren aurreko adarra: begirantz doa, ez dauka ikusmenarekin zerikusirik. Gehien bat sentsitiboa.' },
  { id: 'nerbio-maxilarra', name: 'Nerbio maxilarra (V2)', aka: ['Adar maxilarra', 'V2'], category: 'ektodermoa', color: I, definition: 'Trigeminoaren tarteko adarra: hezur maxilarrera doa. Sentsitiboa.' },
  { id: 'barail-nerbioa', name: 'Barail-nerbioa (V3)', aka: ['V3'], category: 'ektodermoa', color: I, definition: 'Trigeminoaren azken adarra: barail ingururantz. Mistoa; I. arkuko muskuluak mugitzen ditu.' },
];

import type { StructureDef } from '@/lib/sim/types';
import { structures8 } from './week8-structures';

/** Topic 8 already defined these (same names, same looks): the notes of 17 only repeat them. */
const SHARED = [
  'mesenkima', 'osteoblastoak', 'kondrozitoak', 'mintzezko-hezurtzapena', 'hezurtzapen-endokondrala', 'kartilago-eredua', 'hezur-espikulak',
  'kondrokraneoa', 'esklerotoma-okzipitalak', 'kartilago-parakordalak', 'hipofisi-kartilagoak', 'trenkada-kranialak', 'kapsula-periotikoa', 'hego-tenporala', 'begizulo-hegoa',
  'okzipitalaren-oinaldea', 'okzipitalaren-ezkata', 'esfenoidesaren-gorputza', 'etmoidesa', 'harkaitza', 'esfenoidesaren-hego-handia', 'esfenoidesaren-hego-txikia',
];

export const structures17f: StructureDef[] = [
  ...structures8.filter((s) => SHARED.includes(s.id)),
  {
    id: 'hezur-lauak',
    name: 'Hezur lauak',
    es: 'Huesos planos',
    category: 'anatomia',
    color: '#efe5cf',
    definition: 'Mintzezko hezurtzeaz sortutako hezurrak: mesenkimatik zuzenean, kartilagorik gabe.',
    location: 'Parietalak, okzipitalaren ezkata eta aurpegiarekin erlazionatutako hezurrak.',
    origin: 'Mesenkima, mintzezko hezurtzearen bidez.',
    related: ['mintzezko-hezurtzapena', 'mesenkima', 'okzipitalaren-ezkata'],
  },
  {
    id: 'hezur-endokondrala',
    name: 'Kartilagotik sortutako hezurra',
    es: 'Hueso endocondral',
    category: 'anatomia',
    color: '#efe5cf',
    definition: 'Lehenago kartilago izan den hezurra: kartilago hori hezurtzen da (kondrozitoak osteoblasto bihurtu).',
    location: 'Kraneoaren oinaldeko hezur gehienak.',
    origin: 'Mesenkima → kartilagoa → hezurra (hezurtze endokondrala).',
    related: ['hezurtzapen-endokondrala', 'kartilago-eredua', 'kondrozitoak', 'osteoblastoak', 'kondrokraneoa'],
  },
];

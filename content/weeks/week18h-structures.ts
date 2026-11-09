import type { StructureDef } from '@/lib/sim/types';

/** Structures of notes 1.1.1 and 1.1.2. Names as the notes write them; the arches keep their colours. */
const ENDO = '#f6d365';
const I = '#f0883e';
const II = '#4f9be8';
const III = '#f2cd3f';
const ECTO = '#7cc0ee';

export const structures18h: StructureDef[] = [
  { id: 'lehen-poltsa', name: 'Lehenengo poltsa faringeoa', es: 'Primera bolsa faríngea', aka: ['Lehenengo poltsa', '1. poltsa'], category: 'endodermoa', color: ENDO, definition: 'Faringearen endodermoaren barruko inbaginazioa, I. eta II. arkuen artean.', fate: 'Sakonune tubotinpanikoa: Eustakioren tronpa eta tinpano-kutxa.', related: ['sakonune-tubotinpanikoa', 'eustakioren-tronpa', 'tinpano-kutxa'] },
  { id: 'sakonune-tubotinpanikoa', name: 'Sakonune tubotinpanikoa', es: 'Receso tubotimpánico', category: 'endodermoa', color: ENDO, definition: 'Lehenengo poltsa faringeoaren endodermoa asko sakontzean sortzen den sakonunea.', origin: 'Lehenengo poltsaren endodermoa.', fate: 'Bi egitura: Eustakioren tronpa (hurbileko atala) eta tinpano-kutxa (muturra).', related: ['lehen-poltsa'] },
  { id: 'eustakioren-tronpa', name: 'Eustakioren tronpa', es: 'Trompa de Eustaquio', aka: ['Tronpa faringeotinpanikoa'], category: 'endodermoa', color: ENDO, definition: 'Tarteko belarria (tinpano-kutxa) eta faringea komunikatzen dituen hodia.', origin: 'Sakonune tubotinpanikoaren hurbileko atala.', related: ['tinpano-kutxa', 'lehen-poltsa'] },
  { id: 'tinpano-kutxa', name: 'Tinpano-kutxa', es: 'Caja del tímpano', aka: ['Tinpano kutxa', 'Tarteko belarria'], category: 'endodermoa', color: ENDO, space: true, definition: 'Lehenengo poltsaren muturra zabaltzean eratzen den barrunbea; han daude tarteko belarriaren hiru hezurtxoak.', origin: 'Sakonune tubotinpanikoaren muturra.', related: ['mailua', 'ingudea', 'ointokia'] },
  { id: 'mailua', name: 'Mailua', es: 'Martillo', category: 'mesodermoa', color: I, definition: 'Tarteko belarriaren hezurtxoa, tinpano-kutxan.', origin: 'I. arku faringeoa.', related: ['ingudea', 'ointokia', 'tinpano-kutxa'] },
  { id: 'ingudea', name: 'Ingudea', es: 'Yunque', category: 'mesodermoa', color: I, definition: 'Tarteko belarriaren hezurtxoa, tinpano-kutxan.', origin: 'I. arku faringeoa.', related: ['mailua', 'ointokia', 'tinpano-kutxa'] },
  { id: 'ointokia', name: 'Ointokia', es: 'Estribo', category: 'mesodermoa', color: II, definition: 'Tarteko belarriaren hezurtxoa, tinpano-kutxan.', origin: 'II. arku faringeoa.', related: ['mailua', 'ingudea', 'tinpano-kutxa'] },
  { id: 'bigarren-poltsa', name: 'Bigarren poltsa faringeoa', es: 'Segunda bolsa faríngea', aka: ['Bigarren poltsa', '2. poltsa'], category: 'endodermoa', color: ENDO, definition: 'Faringearen endodermoaren barruko inbaginazioa, II. eta III. arkuen artean.', fate: 'Aho-sabaiko amigdala.', related: ['aho-sabaiko-amigdala'] },
  { id: 'aho-sabaiko-amigdala', name: 'Aho-sabaiko amigdala', es: 'Amígdala palatina', aka: ['Aho sabaiko amigdala'], category: 'endodermoa', color: '#e39ac4', definition: 'Bigarren poltsa faringeotik eratzen den amigdala. 5. astean hasten da; 5. hilabetean funtzionala da.', origin: 'Bigarren poltsa faringeoa.', related: ['bigarren-poltsa', 'ehun-linfatikoa'] },
  { id: 'ehun-linfatikoa', name: 'Ehun linfatikoa', es: 'Tejido linfático', aka: ['Ehun-linfatikoa'], category: 'mesodermoa', color: '#8a5fd0', definition: 'Aho-sabaiko amigdalaren barnean, 3.–5. hilabetera arte agertzen ez dena.', related: ['aho-sabaiko-amigdala'] },
  { id: 'faringe-hestea', name: 'Faringe hestea', es: 'Intestino faríngeo', aka: ['Faringea'], category: 'endodermoa', color: ENDO, definition: 'Aurreko hestearen goiko atala; bere alboetan arkuak eta poltsak daude.' },
  { id: 'lehen-arkua', name: 'I. arku faringeoa', es: 'Primer arco faríngeo', aka: ['Lehen arkua', 'Lehenengo arkua'], category: 'mesodermoa', color: I, definition: 'Lehenengo arku faringeoa: lehenengo poltsaren gainean.' },
  { id: 'bigarren-arkua', name: 'II. arku faringeoa', es: 'Segundo arco faríngeo', aka: ['Bigarren arkua'], category: 'mesodermoa', color: II, definition: 'Bigarren arku faringeoa: lehenengo eta bigarren poltsen artean.' },
  { id: 'hirugarren-arkua', name: 'III. arku faringeoa', es: 'Tercer arco faríngeo', aka: ['Hirugarren arkua'], category: 'mesodermoa', color: III, definition: 'Hirugarren arku faringeoa: bigarren poltsaren azpian.' },
  { id: 'lehen-arraildura', name: 'Lehenengo arraildura faringeoa', es: 'Primera hendidura faríngea', aka: ['Lehen arraildura'], category: 'ektodermoa', color: ECTO, definition: 'Ektodermoaren kanpoko inbaginazioa, lehenengo poltsaren parean.' },
];

import type { StructureDef } from '@/lib/sim/types';

const cat = 'anatomia' as const;

/** Topic 18, section 1.2: the first cleft and the tympanic membrane; the others covered by the second arch. */
export const structures18g: StructureDef[] = [
  { id: 'tinpano-mintza', name: 'Tinpano mintza', category: cat, color: '#d8c6a8', definition: 'Lehen arraildura eta lehen poltsaren arteko muga: oso fina, ia gardena, hiru jatorrikoa.', location: 'Kanpoko entzumen hodiaren amaieran.', origin: 'Ektodermoa, mesodermoa eta endodermoa.' },
  { id: 'tinpano-kanpoko-epitelioa', name: 'Tinpano mintzaren kanpoko epitelioa', category: cat, color: '#7cc0ee', definition: 'Jatorri ektodermikoa (lehen arraildura).' },
  { id: 'tinpano-tarteko-geruza', name: 'Tinpano mintzaren tarteko geruza', category: cat, color: '#c08a63', definition: 'Tartean dauden zelulak: jatorri mesodermikoa duen geruza oso fina.' },
  { id: 'tinpano-barneko-epitelioa', name: 'Tinpano mintzaren barneko epitelioa', category: cat, color: '#f6d365', definition: 'Jatorri endodermikoa (lehen poltsa).' },
  { id: 'kanpoko-entzumen-hodia', name: 'Kanpoko entzumen hodia', category: cat, color: '#7cc0ee', definition: 'Kanpoko belarria eta tinpanoa lotzen dituen hodia.', origin: 'Lehen arraildura, sakondu eta luzatuta.' },
  { id: 'tinpano-kutxa', name: 'Tinpano-kutxa', category: cat, color: '#f6d365', definition: 'Lehen poltsaren zati distala.' },
  { id: 'eustakioren-tronpa', name: 'Eustakioren tronpa', aka: ['Tronpa faringotinpanikoa'], category: cat, color: '#f6d365', definition: 'Lehen poltsaren zati proximala.' },
  { id: 'lehen-poltsa', name: 'Lehen faringe-poltsa', category: cat, color: '#f6d365', definition: 'Lehen eta bigarren arkuen arteko barneko inbaginazioa, endodermikoa.' },
  { id: 'lehen-arraildura', name: 'Lehen faringe-arraildura', category: cat, color: '#7cc0ee', definition: 'Lehen eta bigarren arkuen arteko kanpoko ildoa, ektodermikoa. Mantentzen den bakarra.', fate: 'Kanpoko entzumen hodia.' },
  { id: 'faringe-arraildurak', name: 'Faringe-arraildurak', aka: ['Arraildura brankialak'], category: cat, color: '#7cc0ee', definition: 'Kanpotik, arkuen artean nabaritzen diren ildoak, ektodermikoak. Lehena ez beste guztiak desagertzen dira.' },
  { id: 'bigarren-arkua', name: 'Bigarren faringe-arkua', aka: ['II. arkua'], category: cat, color: '#4f9be8', definition: 'Bigarren faringe-arkua. Bere mesenkima beherantz hazten da arrailduren gainetik.' },
  { id: 'lehen-arkua', name: 'Lehen faringe-arkua', aka: ['I. arkua'], category: cat, color: '#f0883e', definition: 'Goieneko faringe-arkua.' },
  { id: 'goragune-epikardikoa', name: 'Goragune epikardikoa', category: cat, color: '#c08a63', definition: 'Bihotzaren gaineko goragunea: bigarren arkua honekin fusionatzen da.' },
  { id: 'sinu-zerbikala', name: 'Sinu zerbikala', category: cat, color: '#2c6c9b', definition: 'Estalitako arrailduren aztarna txikia; gero desagertzen da.', caution: 'Batzuetan mantentzen da: lepoan barrunbe bat, likido serosoa meta daitekeena.' },
];

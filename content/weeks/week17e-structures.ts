import type { StructureDef } from '@/lib/sim/types';

/** Topic 17: the muscles of the pharyngeal arches. Each wears its arch's colour; told apart by their nerve. */

const I = '#f0883e';
const II = '#4f9be8';
const III = '#f2cd3f';
const IV = '#e4505a';
const VI = '#3fb57f';

const m = (id: string, name: string, es: string, color: string, definition: string, location: string, origin: string, related: string[] = []): StructureDef => ({
  id,
  name,
  es,
  category: 'mesodermoa',
  color,
  definition,
  location,
  origin,
  related,
});

export const structures17e: StructureDef[] = [
  m('maseteroa', 'Maseteroa', 'Masetero', I, 'Muskulu murtxikatzailea, indartsuenetarikoa: baraila igotzen du.', 'Arku zigomatikotik barailaren adarrera.', 'I. arkua; barail-nerbioa (V3).', ['muskulu-tenporala', 'barail-nerbioa', 'baraila']),
  m('muskulu-tenporala', 'Muskulu tenporala', 'Músculo temporal', I, 'Muskulu murtxikatzailea, haizemaile formakoa: baraila igotzen du.', 'Kraneoaren alboan, lokian.', 'I. arkua; barail-nerbioa (V3).', ['maseteroa', 'barail-nerbioa']),
  m('milohioideoa', 'Milohioideoa', 'Milohioideo', I, 'Ahoaren zorua eratzen duen muskulu nagusiena; degluzioan parte hartzen du.', 'Ahoaren zoruan, barailaren eta hioidearen artean.', 'I. arkua; barail-nerbioa (V3).', ['digastrikoaren-aurreko-sabela', 'barail-nerbioa']),
  m('digastrikoa', 'Digastrikoa', 'Digástrico', II, 'V formako muskulua, bi sabelekoa (di = bi, gastriko = sabela); baraila jaisten du.', 'Belarriaren mailatik hioidera eta barailera.', 'Bi jatorri: aurreko sabela I. arkua (V3), atzeko sabela II. arkua (VII).', ['digastrikoaren-aurreko-sabela', 'digastrikoaren-atzeko-sabela']),
  m('digastrikoaren-aurreko-sabela', 'Digastrikoaren aurreko sabela', 'Vientre anterior del digástrico', I, 'Hioide hezurretik barailera doan atala.', 'Ahoaren zoruaren azpian.', 'I. arkua; barail-nerbioa (V3).', ['digastrikoa', 'digastrikoaren-atzeko-sabela', 'barail-nerbioa']),
  m('digastrikoaren-atzeko-sabela', 'Digastrikoaren atzeko sabela', 'Vientre posterior del digástrico', II, 'Belarriaren mailatik hioidera doan atala.', 'Barailaren atzean.', 'II. arkua; aurpegi-nerbioa (VII).', ['digastrikoa', 'digastrikoaren-aurreko-sabela', 'aurpegi-nerbioa']),
  m('begietako-orbikularra', 'Begietako muskulu orbikularra', 'Orbicular de los ojos', II, 'Muskulu mimikoa, begiaren inguruan.', 'Begi-zuloaren inguruan.', 'II. arkua; aurpegi-nerbioa (VII).', ['muskulu-mimikoak']),
  m('ahoko-orbikularra', 'Ahoko muskulu orbikularra', 'Orbicular de la boca', II, 'Muskulu mimikoa, ahoaren inguruan.', 'Ezpainetan.', 'II. arkua; aurpegi-nerbioa (VII).', ['muskulu-mimikoak']),
  m('muskulu-aurikularrak', 'Muskulu aurikularrak', 'Músculos auriculares', II, 'Belarria mugitzeko muskuluak, gizakietan funtzio gabeak.', 'Belarriaren inguruan.', 'II. arkua; aurpegi-nerbioa (VII).', ['aurpegi-nerbioa']),
  m('okzipitala', 'Okzipitala', 'Occipital', II, 'Kraneoaren atzeko muskulu azalekoa.', 'Kraneoaren atzealdean.', 'II. arkua; aurpegi-nerbioa (VII).', ['aurpegi-nerbioa']),
  m('estilohioideoa', 'Estilohioideoa', 'Estilohioideo', II, 'Apofisi estiloideotik hioide hezurrera doan muskulua (apunteek «hezur» diote, baina muskulua da).', 'Digastrikoaren atzeko sabelaren gainean.', 'II. arkua; aurpegi-nerbioa (VII).', ['estiloide-apofisia', 'hioide-hezurra']),
  m('platisma', 'Platisma', 'Platisma', II, 'Lepoaren larruazala mugitzeaz arduratzen den muskulua.', 'Lepoaren larruazalaren azpian.', 'II. arkua; aurpegi-nerbioa (VII).', ['aurpegi-nerbioa']),
  m('estilofaringeoa', 'Estilofaringeoa', 'Estilofaríngeo', III, 'Apofisi estiloideotik faringera doan muskulu sakona.', 'Faringearen alboan.', 'III. arkua; glosofaringeoa (IX).', ['glosofaringeoa']),
  m('goiko-ertzatzailea', 'Faringearen goiko muskulu ertzatzailea', 'Constrictor superior de la faringe', III, 'Goiko faringea estutzen du.', 'Faringearen goiko atalaren inguruan.', 'III. arkua; glosofaringeoa (IX).', ['glosofaringeoa', 'tarteko-ertzatzailea', 'beheko-ertzatzailea']),
  m('krikotiroidea', 'Muskulu krikotiroideoa', 'Músculo cricotiroideo', IV, 'Krikoide eta tiroide kartilagoen arteko muskulua (apunteetako irudian: m. krikotiroideak).', 'Laringearen aurrealdean.', 'IV. arkuko kolorean; goiko laringe-nerbioa.', ['goiko-laringe-nerbioa', 'tiroide-kartilagoa', 'krikoide-kartilagoa']),
];

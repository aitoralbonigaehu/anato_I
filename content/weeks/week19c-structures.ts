import type { StructureDef } from '@/lib/sim/types';
import { C19 } from '@/components/scenes/week19/tones';

/** Topic 19, part c: the brain's parts and cavities (sections 10–13). Ids shared with earlier topics are reused. */
export const structures19c: StructureDef[] = [
  { id: 'hipotalamoa', name: 'Hipotalamoa', category: 'ektodermoa', color: C19.dien, definition: 'Talamoaren behekaldean: hormonen arduradun nagusia (gosearen zentroa, loaren zentroa…).', origin: 'Dientzefaloa' },
  { id: 'epitalamoa', name: 'Epitalamoa', category: 'ektodermoa', color: C19.dien, definition: 'Talamoaren goikaldean.', origin: 'Dientzefaloa', caution: 'Apunteetako irudian ez da ageri.' },
  { id: 'zubia', name: 'Zubia', category: 'ektodermoa', color: C19.met, definition: 'Erraboilaren eta mesentzefaloaren artean, garuntxoaren aurrean.', origin: 'Metentzefaloa' },
  { id: 'erraboila', name: 'Erraboila', category: 'ektodermoa', color: C19.miel, definition: 'Garunaren eta ornomuinaren arteko lotura: hemendik luzatzen da ornomuina (erraboila = bulboa, potoloa).', origin: 'Mielentzefaloa' },
  { id: 'bentrikulu-sistema', name: 'Bentrikulu sistema', aka: ['Bentrikuluak (garuna)'], category: 'barrunbea', color: C19.csf, definition: 'Hodi neuralaren barrunbea garunean: xixkuen barnean zabaldutako hutsuneak, denak komunikatuta, likido zefalorrakideoz beteta.', space: true, related: ['alboko-bentrikuluak', 'hirugarren-bentrikulua', 'garun-akueduktoa', 'laugarren-bentrikulua', 'hodi-ependimarioa'] },
  { id: 'alboko-bentrikuluak', name: 'Alboko bentrikuluak', aka: ['Bentrikulu lateralak'], category: 'barrunbea', color: C19.csf, definition: 'Telentzefaloan, hemisferio bakoitzean bat: bi, bata bestearen parean; helduetan nahiko handiak.', caution: 'Ez esan "I. eta II. bentrikuluak".', space: true, related: ['monro-zuloak'] },
  { id: 'hirugarren-bentrikulua', name: 'III. bentrikulua', category: 'barrunbea', color: C19.csf, definition: 'Dientzefaloan, talamoaren mailan; alboko bentrikuluekin Monro-ren zuloen bidez komunikatua.', space: true, related: ['monro-zuloak', 'garun-akueduktoa'] },
  { id: 'monro-zuloak', name: 'Monro-ren zuloak', aka: ['Bentrikulu arteko zuloak'], category: 'barrunbea', color: C19.csf, definition: 'Alboko bentrikuluak eta III. bentrikulua komunikatzen dituzten zuloak.', space: true },
  { id: 'garun-akueduktoa', name: 'Garun akueduktoa', aka: ['Mesentzefalo akueduktoa', 'Akueduktoa'], category: 'barrunbea', color: C19.csf, definition: 'Mesentzefaloan estututako hodia: III. bentrikulutik IV.era.', space: true },
  { id: 'luschka-zuloak', name: 'Luschka-ren zuloak', category: 'barrunbea', color: C19.csf, definition: 'IV. bentrikuluaren bi alboko zuloak: likidoa sistema bentrikularretik kanpora.', space: true, related: ['magendie-zuloa', 'laugarren-bentrikulua'] },
  { id: 'magendie-zuloa', name: 'Magendie-ren zuloa', category: 'barrunbea', color: C19.csf, definition: 'IV. bentrikuluaren erdiko zuloa: likidoa sistema bentrikularretik kanpora.', space: true, related: ['luschka-zuloak', 'laugarren-bentrikulua'] },
  { id: 'sare-koroideak', name: 'Sare koroideak', category: 'anatomia', color: '#e0607a', definition: 'Arteriolez eta benulez eratutako sareak, alboko, 3. eta 4. bentrikuluen sabaian: likido zefalorrakideoa ekoizten dute.', related: ['likido-zefalorrakideoa'] },
];

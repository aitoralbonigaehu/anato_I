import type { StructureDef } from '@/lib/sim/types';

// Literal arch colours: importing common.tsx here would enter its cycle with HeadMap.tsx from the wrong end.
const ARCH = { iv: '#e4505a', vi: '#3fb57f' };

/** Stages bikote-kranealak and bagoa. Reused by id: aurpegi-nerbioa (topic 9), laringea, trakea, hestegorria, aorta, bihotza, birikak, urdaila, gibela. */
const QUIET = '#b7b6bd';
const n = (id: string, name: string, color: string, definition: string, extra: Partial<StructureDef> = {}): StructureDef => ({ id, name, category: 'ektodermoa', color, definition, ...extra });

export const structures17g: StructureDef[] = [
  n('usaimen-nerbioa', 'Usaimen-nerbioak', QUIET, 'I. bikote kraneala. Ez dago arku faringeoekin lotuta.', { es: 'nervio olfatorio' }),
  n('ikusmen-nerbioa', 'Ikusmen-nerbioak', QUIET, 'II. bikote kraneala. Ez dago arku faringeoekin lotuta.', { es: 'nervio óptico' }),
  n('okulomotorea', 'Okulomotorea', QUIET, 'III. bikote kraneala. Begien mugimenduan parte hartzen du.', { es: 'motor ocular común' }),
  n('patetikoa', 'Patetiko-troklearra', QUIET, 'IV. bikote kraneala. Begien mugimenduan parte hartzen du.', { es: 'nervio patético' }),
  n('kanpoko-okulomotorea', 'Kanpoko nerbio okulomotorea', QUIET, 'VI. bikote kraneala. Begien mugimenduan parte hartzen du.', { es: 'motor ocular externo' }),
  n('belarriko-nerbioa', 'Belarriko nerbioa (bestibulokoklearra)', QUIET, 'VIII. bikote kraneala. Ez dago arku faringeoekin lotuta.', { es: 'nervio auditivo' }),
  n('bagoa', 'Nerbio bagoa', ARCH.iv, 'X. bikote kraneala, mistoa eta nerbio parasinpatiko nagusia. Adarrak ematen ditu IV. eta VI. arkuetara.', { es: 'nervio vago, neumogástrico', related: ['goiko-laringe-nerbioa', 'laringe-atzerakaria'] }),
  n('laguntzailea', 'Nerbio laguntzailea', QUIET, 'XI. bikote kraneala. Ez dago arku faringeoekin lotuta.', { es: 'nervio espinal' }),
  n('laringe-atzerakaria', 'Laringe nerbio atzerakaria', ARCH.vi, 'Bagoaren adarra, VI. arkuetako muskuluetara: laringe barneko muskuluak.', { es: 'nervio laríngeo recurrente', related: ['bagoa'] }),
  { id: 'tarteko-ertzatzailea', name: 'Tarteko muskulu ertzatzailea', category: 'mesodermoa', color: ARCH.iv, definition: 'IV. arkuko muskulua; goiko laringe nerbioak inerbatzen du.' },
  { id: 'beheko-ertzatzailea', name: 'Beheko muskulu ertzatzailea', category: 'mesodermoa', color: ARCH.iv, definition: 'IV. arkuko muskulua; goiko laringe nerbioak inerbatzen du.' },
  { id: 'laringe-barneko-muskuluak', name: 'Laringe barneko muskuluak', category: 'mesodermoa', color: ARCH.vi, definition: 'VI. arkuetako muskuluak; laringe nerbio atzerakariak inerbatzen ditu.' },
  { id: 'tarteko-hestea', name: 'Tarteko hestea', category: 'endodermoa', definition: 'Bagoak parasinpatikoki inerbatzen ditu bere eratorriak.' },
];

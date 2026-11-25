/**
 * The whole-topic maps' shared shapes (Ikasgela "Mapa osoa", topics 15, 16 …): every structure of a topic's
 * notes as a node and the relations between them as typed links, walked in one 3D model
 * (components/shell/eratorriak/kit/MapRoom.tsx). Each topic's data lives in content/eratorriak/mapN.ts.
 */

export type Layer = 'meso' | 'endo' | 'ekto' | 'neural' | 'germ' | 'kanpo';

export const LAYER_NAME: Record<Layer, string> = {
  meso: 'Mesodermoa',
  endo: 'Endodermoa',
  ekto: 'Ektodermoa',
  neural: 'Gandor neurala (ektodermoa)',
  germ: 'Bitelo zakua (hozi zelulak)',
  kanpo: 'Kanpo genitalak (azala eta mesenkima)',
};

export interface MapNode {
  id: string;
  /** Notes section (1.1 … 6.2). */
  sec: string;
  layer: Layer;
  /** First and last moment of the map at which it is drawn (or its container is). */
  at: number;
  until?: number;
  /** Only in one sex (the map switches to it when picked). */
  sex?: 'm' | 'f';
  /** Drawn in the 3D map as itself (omit) or lit through its container. */
  in3d?: string;
  /** The simulator stage that shows it close (/astea/N?etapa=…). */
  stage?: string;
  /** One line: what it is, in the notes' words. */
  what: string;
  /** A notes trap. */
  kontuz?: string;
}

/**
 * ematen: a gives / becomes b · kimua: b sprouts (branches) out of a · isuri: a empties / opens into b ·
 * ondoan: a lies against b (both ways) · ordez: a is followed (replaced) by b · zatia: a is a part of b ·
 * homologoa: a (male) and b (female) come from the same primordium.
 */
export type LinkKind = 'ematen' | 'kimua' | 'isuri' | 'ondoan' | 'ordez' | 'zatia' | 'homologoa';

export interface MapLink {
  a: string;
  kind: LinkKind;
  b: string;
  /** Optional precision (when, in whom, how). */
  say?: string;
}

/** How a link reads from each end (the panel's group titles). */
export const LINK_READ: Record<LinkKind, { out: string; in: string }> = {
  ematen: { out: 'Zer ematen du', in: 'Nondik dator' },
  kimua: { out: 'Hemendik ateratzen da', in: 'Nondik ateratzen da' },
  isuri: { out: 'Nora isurtzen du', in: 'Zer isurtzen da hemen' },
  ondoan: { out: 'Ondoan', in: 'Ondoan' },
  ordez: { out: 'Ondoren', in: 'Aurretik' },
  zatia: { out: 'Zeren zatia', in: 'Zatiak' },
  homologoa: { out: 'Beste sexuan (homologoa)', in: 'Beste sexuan (homologoa)' },
};

/** The order the panel shows the groups in. */
export const GROUP_ORDER = [
  'Nondik dator',
  'Nondik ateratzen da',
  'Zeren zatia',
  'Zatiak',
  'Zer ematen du',
  'Hemendik ateratzen da',
  'Nora isurtzen du',
  'Zer isurtzen da hemen',
  'Beste sexuan (homologoa)',
  'Aurretik',
  'Ondoren',
  'Ondoan',
];

/** Ready-made walks through the map ("bideak"): each a chain read in order, the 3D lighting step by step. */
export interface MapTrail {
  id: string;
  title: string;
  /** What the walk teaches, one line. */
  lead: string;
  /** Node ids in order; each may set the moment (and the sex) to show it at. */
  steps: { id: string; moment?: number; sex?: 'm' | 'f'; line: string }[];
}

/**
 * One colour per arch, carried from the embryo to the adult through both topics (a derivative always wears its
 * arch's colour). They are the notes' own figure colours: the cartilage figure of 2.2.2 and the tongue of 2.1.
 *
 * Its own file because common.tsx and HeadMap.tsx import each other: a module-level read of ARCH must not depend
 * on which of those two loads first.
 */
export const ARCH = {
  i: '#f0883e',
  ii: '#4f9be8',
  iii: '#f2cd3f',
  iv: '#e4505a',
  vi: '#3fb57f',
  /** Arch V: appears and regresses, leaves nothing. */
  v: '#a9a6b5',
} as const;

/** Deep tints of the arch colours (`deep` of an item). */
export const ARCH_DEEP = {
  i: '#8f4716',
  ii: '#1f5596',
  iii: '#8c7410',
  iv: '#85202a',
  vi: '#17694a',
  v: '#55525f',
} as const;

import { createContext } from 'react';

/**
 * The simulator's default "taught this year" mode (topics 15+, notes panel "skip blue"): true while the stage on
 * screen should leave out what the notes set in blue or grey. A 3D stage reads it to show a step's taught-only
 * foot note (`plainNote`) instead of its full one.
 */
export const TaughtOnly = createContext(false);

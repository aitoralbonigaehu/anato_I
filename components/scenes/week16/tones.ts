/**
 * Topic 16's ground: the body wall every model lies on or is cut from, the same tissue in the same tone in all
 * six models (so a flight from one into the next reads as one body), and light enough to be a ground: a part
 * that is not lit at the moment still stands out of it as a darker shape, and the lit ones as the only colours.
 *
 * The 3D layer shows a colour darker than its hex reads (about hex^2.2), so these are chosen by what is seen:
 * the wall a warm stone at about 40 % of white, a cut face a little lighter and warmer (cut tissue), a body
 * cavity a blue-grey recess that is clearly a space and never a black hole.
 */
export const G16 = {
  wall: '#c0b2aa',
  wallDeep: '#70605a',
  cut: '#ddc6bc',
  cutDeep: '#8a7067',
  cavity: '#6c7690',
  cavityDeep: '#3a4156',
} as const;

/** The same for topic 15's wall model (uro-model's `tone`). */
export const WALL_TONE16 = { wall: G16.wall, wallDeep: G16.wallDeep, cut: G16.cut, cutDeep: G16.cutDeep } as const;

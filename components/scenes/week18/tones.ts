import { G16 } from '@/components/scenes/week16/tones';

/**
 * Topic 18's ground: the tissue every model lies on or is cut from, the same tissue in the same tone in all the
 * topic's models (so a flight from one into the next reads as one body), and light enough to be a ground: a part
 * that is not lit at the moment still stands out of it as a darker shape, and the lit ones as the only colours.
 *
 * The 3D layer shows a colour much darker than its hex reads (about hex^2.2), so these were chosen by what is seen
 * on screen (pixels of the topic-16 and topic-18 sheets), not by the hex:
 * - `cut`: a cut face of the head's tissue (mesenchyme cut through, the sagittal and coronal sections): a warm
 *   light stone, the same as topic 16's cut so the two topics read alike.
 * - `wall`: an uncut surface of the same tissue seen from inside (a gutter, the far wall of a cavity).
 * - `skin`: the embryo's outside (ectoderm over the head and neck): a warm pale flesh, lighter than the cut so
 *   the outline of a section reads.
 * - `cavity`: a space (the lumen of the pharynx, the mouth, the nasal cavity): a blue-grey recess, never black.
 * Use with `ground: true` and `quiet: true` on context items (they keep their colour while the lit parts glow).
 */
export const G18 = {
  cut: G16.cut,
  cutDeep: G16.cutDeep,
  wall: G16.wall,
  wallDeep: G16.wallDeep,
  skin: '#f0cdb9',
  skinDeep: '#9a6b55',
  cavity: G16.cavity,
  cavityDeep: G16.cavityDeep,
} as const;

/**
 * Topic 17's ground: the tissue every model lies on or is cut from (the head's soft tissue round the skull, the cut
 * face of the head down the middle, the table the ossification blocks lie on), the same tissue in the same tone in
 * every model of the topic, so a flight from one model into the next reads as one head, and light enough to be a
 * ground: an unlit part still stands out of it as a darker shape, and the lit ones are the only strong colours.
 *
 * The 3D layer shows a colour much darker than its hex reads (about hex^2.2): these are chosen by what is seen on
 * screen (topic 16's measured ground, `G16`, is the reference: a warm stone at about 40 % of white), not by the hex.
 * A cavity (the mouth, the pharynx's lumen, the cranial cavity seen through the base) is a blue-grey recess, never
 * black.
 */
export const G17 = {
  /** Soft tissue, the table, the head's skin when it is context. */
  ground: '#c0b2aa',
  groundDeep: '#70605a',
  /** A cut face (the head down the middle, a tissue block's sides): a little lighter and warmer. */
  cut: '#ddc6bc',
  cutDeep: '#8a7067',
  /** A space: the cranial cavity, the mouth, the pharynx. */
  cavity: '#6c7690',
  cavityDeep: '#3a4156',
  /** The embryo's skin (surface ectoderm) when it is context, not the subject. */
  skin: '#e2c3b2',
  skinDeep: '#8f6a58',
  /** Bone that is context (a skull round the subject), not lit. */
  bone: '#e6dccb',
  boneDeep: '#8c806a',
} as const;

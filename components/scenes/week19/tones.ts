/**
 * Topic 19's colours (docs/handover/topic-19-plan.md "Colour code"): one code for the whole topic, embryo to
 * adult, in every model. Functional colours follow topic 9's spinal nerve (motor red, sensory blue, vegetative
 * green, nerves yellow); the neural tube and crest keep topic 4's blue and teal.
 *
 * The 3D layer shows a colour much darker than its hex reads (about hex^2.2): grounds are chosen by the pixels
 * of a screenshot, light enough that an unlit part still stands out of them.
 */
export const C19 = {
  /** Function. */
  motor: '#f0525f',
  motorDeep: '#7a1420',
  sens: '#4aa8f0',
  sensDeep: '#0c3a66',
  symp: '#4cc26e',
  sympDeep: '#145a2a',
  para: '#a78bfa',
  paraDeep: '#43307a',
  inter: '#f2b24a',
  /** Peripheral nerves as cables; the ganglia a little warmer. */
  nerve: '#f4d35e',
  nerveDeep: '#7a6210',
  ganglion: '#f2c04e',
  /** Neural tissue. */
  brain: '#efc3b6',
  brainDeep: '#8a5148',
  grey: '#b48c94',
  greyDeep: '#5a3a42',
  white: '#f3ece0',
  whiteDeep: '#8e8270',
  ependyma: '#7fb6e6',
  /** Meninges and CSF. */
  dura: '#7f9ccf',
  duraDeep: '#2c3f68',
  arach: '#cdb4ef',
  arachDeep: '#5a4282',
  pia: '#ea7c9c',
  piaDeep: '#7a2440',
  csf: '#8fd0f5',
  csfDeep: '#2a6a92',
  /** Embryo (topic 4). */
  tube: '#3a5fd9',
  tubeDeep: '#162a6e',
  crest: '#2dd4bf',
  crestDeep: '#0d5c52',
  ecto: '#7aa7f5',
  /** Vesicles (the notes' p12 / p14 figures): prosencephalon blues, mesencephalon green, rhombencephalon oranges. */
  pros: '#6f9df0',
  tel: '#a9c8f7',
  dien: '#5a86e0',
  mes: '#72c27a',
  rhomb: '#f0a07a',
  met: '#f3b08e',
  miel: '#e2805f',
  /** Bone and organs. */
  bone: '#efe6d2',
  boneDeep: '#8a7d62',
  muscle: '#d8605a',
  muscleDeep: '#6e1e1c',
  skin: '#e9b99a',
} as const;

/**
 * The ground: the body every model lies on or is cut from, the same tissue in the same tone in all of them, and
 * light enough to be a ground. A body cavity is a blue-grey recess, never black.
 */
export const G19 = {
  body: '#c9b8ac',
  bodyDeep: '#75625a',
  cut: '#e2cdc1',
  cutDeep: '#8e7368',
  cavity: '#6c7690',
  cavityDeep: '#3a4156',
  bone: C19.bone,
  boneDeep: C19.boneDeep,
} as const;

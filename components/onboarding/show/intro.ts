import { CELLS, SWARM, lookAt, model, multiply, perspective, type M4, type Shape, type Shot } from './engine';
import { L } from './shapes';

/**
 * The opening show's timeline, in seconds, on a 120 bpm grid (a bar is 2 s): every cut lands on the score's
 * beats (scripts/intro-v3/score.py renders the music from the same numbers).
 *
 *  0–4    the notes' words write themselves in, then lift off the page
 *  4      the zygote (bar 2), then four divisions on the beats: 2, 4, 8, 16 cells; the morula presses together
 *  8      the drop: the week-5 embryo
 *  12     the fetal skull of topic 17, arch colours
 *  16     the face of topic 18 at week 5, then its prominences move in and fuse (week 10)
 *  20     everything gathers into the wordmark; the title holds; at 23 the journey takes over (its points fly on)
 */
export const T = {
  write: [0.3, 2.7],
  lift: [2.9, 4.0],
  divide: [4.5, 5.0, 5.5, 6.0],
  compact: [6.2, 7.7],
  embryo: [8.0, 9.3],
  skull: [12.0, 13.3],
  face: [16.0, 17.0],
  fuse: [17.1, 19.7],
  logo: [20.0, 21.4],
  end: 23,
} as const;
export const END = T.end;
/** The words have become dust; from here it falls into the zygote. */
const LIFT_MID = 3.5;

export const FOV = (30 * Math.PI) / 180;
export const EYE_Z = 6.2;

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
export const ramp = (a: number, b: number, t: number) => clamp01((t - a) / (b - a));
export const ease = (a: number, b: number, t: number) => {
  const u = ramp(a, b, t);
  return u * u * (3 - 2 * u);
};
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

/** Half the visible height and width of the plane through the origin. */
export function frustum(aspect: number) {
  const h = EYE_Z * Math.tan(FOV / 2);
  return { h, w: h * aspect };
}

/** A kick: out on the beat (quickly), then back (slowly). */
const kick = (at: number, t: number) => (t < at - 0.12 ? 0 : t < at + 0.1 ? ease(at - 0.12, at + 0.1, t) : Math.exp(-(t - at - 0.1) * 1.5));
/**
 * The camera's distance over the film: a slow push into the words, closer through the divisions, a kick back on
 * the drop and on each new subject, a long push into the skull, and a step back for the title.
 */
export function eyeZ(t: number) {
  const k =
    1.05 -
    0.05 * ease(0.2, 3.0, t) -
    0.07 * ease(4.0, 7.8, t) * (1 - ease(7.85, 8.05, t)) +
    0.09 * kick(8.0, t) +
    0.06 * kick(12.0, t) -
    0.05 * ease(12.4, 15.9, t) * (1 - ease(15.9, 16.3, t)) +
    0.05 * kick(16.0, t) +
    0.07 * kick(20.0, t) -
    0.03 * ease(21.0, 23, t);
  return EYE_Z * k;
}

export function camera(aspect: number, t: number, orbit = 1, z = EYE_Z) {
  const eye: [number, number, number] = [0.32 * Math.sin(t * 0.21) * orbit, (0.12 + 0.1 * Math.sin(t * 0.13)) * orbit, z];
  const view = lookAt(eye, [0, 0, 0]);
  const proj = perspective(FOV, aspect, 0.1, 60);
  return { viewProj: multiply(proj, view), eye };
}

const WARM: [number, number, number] = [1, 0.8, 0.62];

/**
 * The week-5 embryo turns solid: the earlier film's skin render (components/intro-review, the volume ray-marched)
 * is drawn over the points, placed exactly where they are. For that the points take the earlier film's camera:
 * its axes (z up), its turn (`skinYaw`, `SKIN_TILT`), and no perspective while the skin shows (`flatten`).
 */
/** The surface's frame in the earlier film's coordinates (bake-clouds.test.ts prints it): bounding-box centre, radius. */
const EMBRYO_FRAME = { c: [-0.00061, -2.39624, 0.18896], r: 4.26564 };
/** The earlier film's camera centre (components/intro-review/optics.ts `centre`). */
const SKIN_CENTRE = [0, -2.43, 0.18];
const SKIN_TILT = -0.105;
/** The embryo turns the whole time it is on screen ("biratu"). */
const skinYaw = (t: number) => lerp(-0.62, 0.16, ease(T.embryo[0], T.skull[0] + 0.6, t));
/** How solid the skin is: it condenses out of the points after the drop and gives way before the skull. */
export const skinK = (t: number) => ease(9.05, 9.95, t) * (1 - ease(11.45, 12.05, t));
/** Perspective off while the skin shows (the earlier film's view is orthographic), back on for the skull. */
const flatK = (t: number) => ease(7.7, 8.4, t) * (1 - ease(12.1, 13.0, t));
/** The camera's slow sway rests while the skin is placed over the points. */
const orbitK = (t: number) => 1 - ease(7.6, 8.4, t) * (1 - ease(12.1, 13.2, t));

/** The earlier film's camera basis at turn a, tilt b (optics.ts): right, up, forward. */
function basis(a: number, b: number) {
  const right = [Math.sin(a), -Math.cos(a), 0];
  const fwd = [Math.cos(a) * Math.cos(b), Math.sin(a) * Math.cos(b), Math.sin(b)];
  const up = [-Math.cos(a) * Math.sin(b), -Math.sin(a) * Math.sin(b), Math.cos(b)];
  return { right, up, fwd };
}
/** World = at + k·R·(raw − centre), raw = r·u + c (u the baked unit coordinates); R's rows are right, up, −forward. */
function embryoMatrix(k: number, at: number[], a: number, b: number): M4 {
  const { right, up, fwd } = basis(a, b);
  const R = [right, up, fwd.map((v) => -v)];
  const { c, r } = EMBRYO_FRAME;
  const d = [c[0] - SKIN_CENTRE[0], c[1] - SKIN_CENTRE[1], c[2] - SKIN_CENTRE[2]];
  const m = new Float32Array(16);
  for (let col = 0; col < 3; col++) for (let row = 0; row < 3; row++) m[col * 4 + row] = k * r * R[row][col];
  for (let row = 0; row < 3; row++) m[12 + row] = at[row] + k * (R[row][0] * d[0] + R[row][1] * d[1] + R[row][2] * d[2]);
  m[15] = 1;
  return m;
}
/** Where the embryo sits (world), its scale (world per raw unit) and the earlier camera's point `at` (raw centre). */
function embryoPlace(aspect: number, t: number) {
  const { h, w } = frustum(aspect);
  const fit = Math.min(h * 0.8, w * 0.58);
  const k = (fit * 0.98) / EMBRYO_FRAME.r;
  const a = skinYaw(t);
  const { right, up, fwd } = basis(a, SKIN_TILT);
  const { c } = EMBRYO_FRAME;
  const d = [c[0] - SKIN_CENTRE[0], c[1] - SKIN_CENTRE[1], c[2] - SKIN_CENTRE[2]];
  const dot = (v: number[]) => v[0] * d[0] + v[1] * d[1] + v[2] * d[2];
  // The bounding-box centre lands at (0, lift, 0): the raw centre is that minus k·R·d.
  const at = [-k * dot(right), h * 0.1 - k * dot(up), k * dot(fwd)];
  return { k, a, at };
}
/** The skin render's placement in CSS pixels for a W×H picture (null when it is not showing). */
export function skinAt(t: number, W: number, H: number) {
  const skin = skinK(t);
  if (skin <= 0.001) return null;
  const aspect = W / Math.max(1, H);
  const { k, a, at } = embryoPlace(aspect, t);
  const f = 1 / Math.tan(FOV / 2);
  const wRef = eyeZ(t) - at[2];
  const px = ((H / 2) * f) / wRef;
  return { skin, box: [W / 2 + at[0] * px, H / 2 - at[1] * px, k * px] as [number, number, number], angles: [a, SKIN_TILT] as [number, number] };
}

/** What the captions say, and when (seconds): shown by the page over the canvas. */
export const LINES = [
  { at: [3.0, 5.7], text: 'Baina enbrioia ez da orrialde bat.' },
  { at: [9.4, 11.7], text: 'Hazi, tolestu eta biratu egiten da.' },
  { at: [13.4, 15.7], text: 'Egitura bakoitza, bere jatorriarekin.' },
  { at: [17.4, 19.8], text: 'Eta mugitzen dena, zure aurrean mugitzen da.' },
] as const;

/** The small instrument labels (top left of the picture): what the points are now. */
export function label(t: number): { kicker: string; value: string } | null {
  if (t < 0.6) return null;
  if (t < 3.6) return { kicker: 'Apunteak', value: '18. gaia · 4.1' };
  if (t < 7.9) {
    const n = t < T.divide[0] ? 1 : t < T.divide[1] ? 2 : t < T.divide[2] ? 4 : t < T.divide[3] ? 8 : 16;
    return { kicker: t > T.compact[0] ? 'Morula' : 'Zigotoa', value: `${n} zelula` };
  }
  if (t < 11.9) return { kicker: '4. gaia', value: '5. asteko enbrioia' };
  if (t < 15.9) return { kicker: '17. gaia', value: 'Fetuaren burezurra' };
  if (t < 19.95) {
    const w = 5 + Math.round(5 * ease(T.fuse[0], T.fuse[1], t));
    return { kicker: '18. gaia · Aurpegia', value: `${w}. astea` };
  }
  return null;
}

/** The beats the page flashes on (a ring of light on the label). */
export const HITS = [4.0, ...T.divide, 8.0, 12.0, 16.0, 20.0];

/**
 * The shot at time t. `aspect` = width / height. Points are fewer on weak machines (`count`); the pointer is in
 * device pixels.
 */
export function introShot(t: number, aspect: number, count: number, pointer: [number, number], push: number): Shot {
  const { h, w } = frustum(aspect);
  const cam = camera(aspect, t, orbitK(t), eyeZ(t));
  const fit = Math.min(h * 0.8, w * 0.58);
  const lift = h * 0.1;
  const text = (k = 1): Shape => ({ layer: L.text, model: model(Math.min(w * 0.82, h * 2.4) * k, 0, 0, [0, 0.05, 0]) });
  const cells = (): Shape => ({ layer: CELLS, model: model(1.25 * fit * (1 + 0.05 * Math.sin(t * 2)), t * 0.35, 0.25 + 0.1 * Math.sin(t * 0.5), [0, lift * 0.6, 0]), tint: WARM });
  const swarm = (s = 1): Shape => ({ layer: SWARM, model: model(Math.max(h, w) * 0.7 * s, t * 0.05, 0), tint: [0.9, 0.7, 0.55] });
  const place = embryoPlace(aspect, t);
  const embryo = (): Shape => ({ layer: L.embryo, model: embryoMatrix(place.k, place.at, place.a, SKIN_TILT) });
  const skull = (): Shape => ({ layer: L.skull, model: model(fit * 0.9, lerp(0.85, -0.55, ease(T.skull[0], T.face[0] + 0.5, t)), lerp(0.18, -0.06, ease(T.skull[0], T.face[0], t)), [0, lift + fit * 0.11, 0]) });
  // The close-up: no wider than the picture can hold beside the instrument label (tablets, narrow windows).
  const faceK = lerp(fit * 1.15, Math.min(fit * 1.5, w * 0.68), ease(T.face[0], T.fuse[1], t));
  const face = (layer: number): Shape => ({ layer, model: model(faceK, lerp(0.42, 0.06, ease(T.face[0], T.fuse[1], t)), lerp(-0.02, 0.1, ease(T.face[0], T.fuse[1], t)), [0, lift + faceK * 0.32, 0]) });
  // The words' dust: a wide, slow cloud a little above the page.
  const ash = (): Shape => ({ layer: SWARM, model: model(Math.min(w, h * 2) * 0.3, t * 0.12, 0.2, [0, 0.35 * h * ease(T.lift[0], T.lift[1], t), 0]), tint: [1, 0.86, 0.72] });
  const logo = (): Shape => ({ layer: L.logo, model: model(Math.min(w * 0.62, h * 1.6), 0.05 * Math.sin(t * 0.4), 0, [0, 0.12, 0]) });

  const base: Omit<Shot, 'a' | 'b' | 'mix' | 'spread' | 'sweep' | 'stir'> = {
    t,
    drift: 0.004,
    cells: 0,
    compact: 0,
    viewProj: cam.viewProj,
    eye: cam.eye,
    focus: eyeZ(t),
    aperture: 0.55,
    exposure: 1.0,
    size: 15,
    bloom: 0.9,
    count,
    pointer,
    push,
    fade: 1,
    color: 1,
    flash: 0,
  };
  const flashAt = (at: number, len = 0.5) => (t >= at && t < at + len ? 1 - (t - at) / len : 0);

  let shot: Shot;
  if (t < T.lift[0]) {
    // Dust gathering into the words, left to right, as if written.
    shot = { ...base, a: swarm(1.3), b: text(), mix: ease(T.write[0], T.write[1] + 0.5, t), spread: 0.62, sweep: 1, stir: 0.5, fade: ease(0, 0.5, t), exposure: 1.1, size: 11, aperture: 0.4 };
    shot.sweepAxis = 0;
  } else if (t < LIFT_MID) {
    // The words come apart, in the order they were written, and rise as dust.
    shot = { ...base, a: text(), b: ash(), mix: ease(T.lift[0], LIFT_MID, t), spread: 0.6, sweep: 1, stir: 0.9, size: 11, exposure: 1.1, aperture: 0.4 };
    shot.sweepAxis = 0;
  } else if (t < T.divide[0] - 0.05) {
    // The dust falls in on itself: one cell, on the downbeat.
    shot = { ...base, a: ash(), b: cells(), mix: ease(LIFT_MID, T.lift[1] + 0.05, t), spread: 0.3, sweep: 0, stir: 0.5, size: lerp(11, 15, ramp(LIFT_MID, T.lift[1], t)), flash: flashAt(4.0, 0.6), exposure: lerp(1.1, 1, ramp(LIFT_MID, T.lift[1], t)) };
  } else if (t < T.embryo[0]) {
    const d = T.divide;
    const cellsNow = t < d[0] ? 0 : t < d[1] ? ease(d[0], d[0] + 0.32, t) : t < d[2] ? 1 + ease(d[1], d[1] + 0.32, t) : t < d[3] ? 2 + ease(d[2], d[2] + 0.32, t) : 3 + ease(d[3], d[3] + 0.32, t);
    const c = cells();
    shot = { ...base, a: c, b: c, mix: 1, spread: 0, sweep: 0, stir: 0, cells: cellsNow, compact: ease(T.compact[0], T.compact[1], t), drift: 0.01, flash: Math.max(...d.map((x) => flashAt(x, 0.35))) * 0.8, aperture: 0.7 };
  } else if (t < T.skull[0]) {
    // The drop: the morula bursts and the embryo assembles from its tail up.
    const c = cells();
    shot = { ...base, a: c, b: embryo(), mix: ease(T.embryo[0], T.embryo[1], t), spread: 0.55, sweep: 1, stir: 1.6, cells: 4, compact: 1, flash: flashAt(8.0, 0.7) };
  } else if (t < T.face[0]) {
    shot = { ...base, a: embryo(), b: skull(), mix: ease(T.skull[0], T.skull[1], t), spread: 0.55, sweep: -1, stir: 1.8, flash: flashAt(12.0, 0.7), exposure: 0.85 };
  } else if (t < T.fuse[0]) {
    shot = { ...base, a: skull(), b: face(L.face5), mix: ease(T.face[0], T.face[1], t), spread: 0.5, sweep: 1, stir: 1.2, flash: flashAt(16.0, 0.6), exposure: 1.0 };
  } else if (t < T.logo[0]) {
    // The fusion itself: the same surface points, week 5 to week 10. No turbulence: the tissue moves, it does not scatter.
    shot = { ...base, a: face(L.face5), b: face(L.face10), mix: ease(T.fuse[0], T.fuse[1], t), spread: 0.12, sweep: 0, stir: 0.03, exposure: 1.0 };
  } else {
    const k = ease(T.logo[0], T.logo[1], t);
    shot = {
      ...base,
      a: face(L.face10),
      b: logo(),
      mix: k,
      spread: 0.5,
      sweep: 1,
      stir: 1.5,
      flash: flashAt(20.0, 0.9),
      size: lerp(15, 10, k),
      color: 1,
      exposure: lerp(1.0, 1.15, k),
      aperture: lerp(0.55, 0.3, k),
    };
    shot.sweepAxis = 0;
  }
  // The beat's shock wave from the subject's centre: strong on the big hits, small on the divisions.
  const hits: [number, number][] = [[4.0, 0.7], [4.5, 0.35], [5.0, 0.35], [5.5, 0.35], [6.0, 0.35], [8.0, 1], [12.0, 0.9], [16.0, 0.8], [20.0, 1]];
  const hit = hits.filter(([at]) => t >= at).pop();
  if (hit && t - hit[0] < 1.6) {
    const centre: [number, number, number] = hit[0] >= 20 ? [0, 0.12, 0] : hit[0] >= 16 ? [0, lift + faceK * 0.32, 0] : [0, lift, 0];
    shot.wave = [...centre, t - hit[0]];
    shot.waveAmp = hit[1];
  }
  if (t >= T.fuse[0] && t < T.logo[0]) shot.moveGlow = 1;
  // The embryo's skin: perspective off under it, and the points dim to a glitter on its surface.
  shot.flatten = flatK(t);
  shot.flatAt = place.at as [number, number, number];
  const sk = skinK(t);
  shot.exposure *= 1 - 0.78 * sk;
  return shot;
}

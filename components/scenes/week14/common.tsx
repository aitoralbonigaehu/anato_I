'use client';

import { Note, type SceneProps } from '@/components/kit';
import { Loading3D, type At3 } from '@/components/kit/three/Stage3D';
import { ModelView, cameraAt, type CalloutSpec } from '@/components/scenes/week10/Heart3D';
import { ColourKey } from '@/components/scenes/week12/common';
import { mixHex } from '@/components/scenes/week10/model3d';
import { seg } from '@/lib/sim/anim';
import { EMBRYO5, sectionMatrix } from '@/lib/three-d/embryo5';
import { flyIn, reveal, type Plane } from '@/lib/three-d/flyin';
import { useGeoReady } from '@/lib/three-d/offthread';
import { fitCamera, pointsOf, type FitSpec } from '@/lib/three-d/framing';
import type { Camera3, V3 } from '@/lib/three-d/math';
import type { Item3, Look3 } from '@/lib/three-d/scene';
import { GC, gutModel, type GutOpts, type GutPose } from './gut3d';

export { cameraAt, orbit, type CalloutSpec } from '@/components/scenes/week10/Heart3D';
export { vis } from '@/components/scenes/week10/common';
export { ColourKey };

/** Every 3D view of topic 14 shares one continuity: a stage change glides the camera, never cuts. */
export const CONT = 'digestioa-14';

/** Colour keys of the topic. */
export const KEY14 = {
  endo: [{ color: GC.endo, text: 'endodermoa' }],
  three: [
    { color: GC.fore, text: 'aurreko hestea' },
    { color: GC.mid, text: 'bitarteko hestea' },
    { color: GC.hind, text: 'atzeko hestea' },
  ],
  four: [
    { color: GC.pharynx, text: 'faringe hestea' },
    { color: GC.fore, text: 'aurreko hestea' },
    { color: GC.mid, text: 'bitarteko hestea' },
    { color: GC.hind, text: 'atzeko hestea' },
  ],
  arteries: [
    { color: GC.fore, text: 'enbor zeliakoa → aurreko hestea' },
    { color: GC.mid, text: 'goiko a. mesenterikoa → bitarteko hestea' },
    { color: GC.hind, text: 'beheko a. mesenterikoa → atzeko hestea' },
  ],
  peritoneum: [
    { color: GC.cavity, text: 'peritoneo barrunbea' },
    { color: GC.visceral, text: 'errai peritoneoa' },
    { color: GC.parietal, text: 'paretako peritoneoa' },
    { color: GC.septum, text: 'septum transversuma' },
  ],
} as const;

type Num<T> = { [K in keyof T as T[K] extends number | undefined ? K : never]?: number };
export type PoseTo<P = GutPose> = Partial<P>;
export type OptsTo<O = GutOpts> = Num<O>;

export interface NameSpec {
  id: string;
  /** The model point (defaults to the id). */
  p?: string | V3;
  text?: string;
  sub?: string;
  small?: boolean;
  key?: string;
  /** When in the step the name comes in (0..1 of the step; default 0): said → shown. */
  from?: number;
}

export interface Step<P = GutPose, O = GutOpts> {
  /** Pose and context the step animates to (from wherever the previous steps left them). */
  to?: PoseTo<P>;
  opts?: OptsTo<O>;
  /** When in the step the change runs (0..1 of the step; default 0.08–0.7). */
  run?: readonly [number, number];
  cam: Camera3;
  /**
   * What the camera frames when the stage fits its views (`StageSpec.fit`): these ids or groups (default: the
   * step's lit set `dim`, else every named structure), or false to keep `cam` exactly as written.
   */
  fit?: string[] | false;
  glide?: number;
  names?: (string | NameSpec)[];
  note?: string;
  warn?: boolean;
  /** Only these ids or groups at full strength; the rest see-through. */
  dim?: string[];
  /** Small words at model points (the notes' figure letters, borders). */
  marks?: { p: V3 | string; text: string; dx?: number; dy?: number }[];
  caption?: string;
  key?: readonly { color: string; text: string }[];
  keyTitle?: string;
}

export interface StageSpec<P = GutPose, O = GutOpts> {
  /** Step starts (stage time, 0..1); one per step. */
  S: readonly number[];
  pose: P;
  opts: O;
  steps: Step<P, O>[];
  caption: string;
  key?: readonly { color: string; text: string }[];
  keyTitle?: string;
  /** Extra overlay. */
  over?: (t: number, at: At3, pose: P) => React.ReactNode;
  /**
   * A 2D inset synced with the pose (the live transverse section): how much it shows and what it draws, given
   * the step's lit ids. While it shows, the left name column keeps above it (`left`).
   */
  section?: (t: number, pose: P, lit: readonly string[] | null) => { show: number; node: React.ReactNode; left: [number, number] } | null;
  /** Other axes than the body's (a section block whose up is dorsal): the frame's edge pills and the axis key. */
  axes?: React.ComponentProps<typeof ModelView>['axes'];
  /** The right name column's span (top, bottom), to keep it above the camera keys. */
  right?: [number, number];
  /** Topic 14: how much closer than its specs the cameras sit (default 0.82; 1 keeps them as written). */
  near?: number;
  /**
   * "Where in the body is this?": the stage opens on the whole embryo seen from outside, the region glows, the
   * embryo turns to glass and fades while the camera flies in to the first step's view (as topics 7 and 9 do).
   */
  where?: Where;
  /** The rendering (topics 15 on: ambient occlusion); omitted = topic 14's look. */
  look?: Look3;
  /**
   * Topics 15 on: each step's camera keeps its direction but is brought to frame what the step is about (see
   * `Step.fit`) in the free middle of the frame, at the step's end pose. Omitted or false: cameras as written.
   */
  fit?: FitSpec | false;
}

/** Where a model sits in the 5-week embryo (lib/three-d/embryo5) for the fly-in that opens a stage. */
export interface Where {
  /** The angle along the embryo's curled body axis that sits at `at` (neck ≈ 1.2, mid-trunk 0, tail ≈ −2). */
  th: number;
  /** The model point where the body's axis at θ falls. */
  at: V3;
  /**
   * The model's axes: 'trunk' (x left, y cranial, z ventral; the default), 'block' (x left, y dorsal, z cranial)
   * or 'perineum' (x left, y ventral, z caudal: the external genitalia seen from below).
   */
  frame?: 'trunk' | 'block' | 'perineum';
  /** Model units per embryo unit (default 1). */
  scale?: number;
  /** The region's glowing faces, in model space. */
  planes?: Plane[];
  /** The bottom note while the embryo shows: what this view is and where it lies. */
  note: string;
  /** Stage time the fly-in takes (default 0.07: three or four seconds). */
  span?: number;
}

const FRAMES = {
  trunk: { lateral: [1, 0, 0] as V3, dorsal: [0, 0, -1] as V3, cranial: [0, 1, 0] as V3 },
  block: { lateral: [1, 0, 0] as V3, dorsal: [0, 1, 0] as V3, cranial: [0, 0, 1] as V3 },
  perineum: { lateral: [1, 0, 0] as V3, dorsal: [0, -1, 0] as V3, cranial: [0, 0, -1] as V3 },
};

/** The fly-in at stage time t, onto the view's own camera (null when the stage has none). */
function whereAt(W: Where | undefined, t: number, reduced: boolean, end: Camera3) {
  if (!W) return null;
  const f = FRAMES[W.frame ?? 'trunk'];
  const s = W.scale ?? 1;
  const M = sectionMatrix(W.th, W.at, f.lateral, f.dorsal, s);
  const u = reduced ? 1 : seg(t, 0, W.span ?? 0.07, (q) => q);
  return flyIn(u, M, end, W.planes ?? [], { dist: 17 * s, cranial: f.cranial, dorsal: f.dorsal });
}

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

/** The step that holds stage time t. */
export const stepAt = (S: readonly number[], t: number) => {
  let i = 0;
  for (let k = 0; k < S.length; k++) if (t >= S[k]) i = k;
  return i;
};

/** The pose and options of the moment: every step's change applied in order, each eased over its own window. */
export function poseAt<P = GutPose, O = GutOpts>(spec: Pick<StageSpec<P, O>, 'S' | 'pose' | 'opts' | 'steps'>, t: number): { pose: P; opts: O } {
  const pose: P = { ...spec.pose };
  const opts: O = { ...spec.opts };
  spec.steps.forEach((st, k) => {
    const a = spec.S[k];
    const b = spec.S[k + 1] ?? 1;
    const run = st.run ?? [0.08, 0.7];
    const u = seg(t, a + run[0] * (b - a), a + run[1] * (b - a));
    if (u <= 0) return;
    if (st.to) for (const [key, v] of Object.entries(st.to)) (pose as unknown as Record<string, number>)[key] = lerp((pose as unknown as Record<string, number>)[key], v as number, u);
    if (st.opts) for (const [key, v] of Object.entries(st.opts)) (opts as unknown as Record<string, number>)[key] = lerp(((opts as unknown as Record<string, number>)[key] ?? 0) as number, v as number, u);
  });
  return { pose, opts };
}

/** The stage's end pose (the next stage starts from it). */
export const endPose = <P = GutPose, O = GutOpts>(spec: Pick<StageSpec<P, O>, 'S' | 'pose' | 'opts' | 'steps'>) => poseAt(spec, 1);

/** What a stage's model function returns. */
export interface PoseModel {
  items: Item3[];
  pts: Record<string, V3>;
}

/**
 * While a step lights some structures, everything else turns to a neutral grey glass instead of a darker copy of
 * its own colour: the lit things keep the only strong colours on screen (as topics 12–13 read), and a stack of
 * see-through red and brown layers no longer muddies the picture. Opacity is the model's own (unchanged).
 */
const SLATE = '#9aa4b6';
const SLATE_DEEP = '#2f3644';
function recede(items: Item3[], dim: { ids: readonly string[]; k: number } | null): Item3[] {
  if (!dim || dim.k <= 0.001) return items;
  const k = 0.6 * dim.k;
  const lit = (it: Item3) => !!it.id && (dim.ids.includes(it.id) || (it.groups ?? []).some((g) => dim.ids.includes(g)));
  return items.map((it) => (it.stream || it.ground || lit(it) ? it : { ...it, color: mixHex(it.color, SLATE, k), deep: mixHex(it.deep ?? it.color, SLATE_DEEP, k) }));
}

/** Topic 14's cameras sit a little closer than their specs say: the gut fills more of the frame. */
const closer = (cam: Camera3, k: number): Camera3 =>
  k === 1 ? cam : { ...cam, eye: [cam.target[0] + (cam.eye[0] - cam.target[0]) * k, cam.target[1] + (cam.eye[1] - cam.target[1]) * k, cam.target[2] + (cam.eye[2] - cam.target[2]) * k] };

/** A step's camera fitted to what it shows at the end of its change (see `StageSpec.fit`). */
function fitStep<P, O extends { dim?: { ids: readonly string[]; k: number } | null }>(spec: StageSpec<P, O>, build: (pose: P, opts: O) => PoseModel, k: number, cam: Camera3): Camera3 {
  const st = spec.steps[k];
  if (!spec.fit || st.fit === false) return cam;
  const a = spec.S[k];
  const b = spec.S[k + 1] ?? 1;
  const { pose, opts } = poseAt(spec, a + (st.run?.[1] ?? 0.7) * (b - a) + 0.002);
  const model = build(pose, { ...opts, dim: null });
  const items = model.items;
  const ids = st.fit ?? st.dim ?? null;
  const seen = (it: Item3) => !!it.id && !it.quiet && (it.opacity ?? 1) * (it.show ?? 1) > 0.2;
  let pts = pointsOf(items, (it) => (spec.fit && spec.fit.ground && it.ground) || (seen(it) && (!ids || ids.includes(it.id!) || (it.groups ?? []).some((g) => ids.includes(g)))));
  if (pts.length < 9) pts = pointsOf(items, seen);
  // Whatever the step names, and every drawn structure's naming point the written camera shows, stays in the
  // frame: a closer view must not cut off what the step's text or names point at.
  const drawn = new Set(items.filter(seen).flatMap((it) => [it.id!, ...(it.groups ?? [])]));
  const named = (st.names ?? []).map((n) => (typeof n === 'string' ? { id: n } : n)).map((n) => (Array.isArray(n.p) ? (n.p as V3) : model.pts[(n.p as string | undefined) ?? n.id]));
  const keep = [...named, ...Object.entries(model.pts).filter(([id]) => drawn.has(id)).map(([, p]) => p)].filter((p): p is V3 => !!p);
  return fitCamera(cam, pts, spec.fit, keep);
}

/** vis with the stage-end case: a name or note of the last step stays to the end. */
const vis2 = (t: number, a: number, b: number) => Math.min(a <= 0 ? 1 : seg(t, a, a + 0.03), b >= 1.5 ? 1 : 1 - seg(t, b - 0.03, b));

/** A whole stage on the gut model: a camera key per step, names said then shown, one note per step. */
export function gutStage(spec: StageSpec) {
  return poseStage(spec, (pose, opts) => gutModel(pose, opts), true);
}

/**
 * A whole stage on any posed model (the embryo's gut, the trunk's foregut): a camera key per step, names said
 * then shown, one note per step, the step's lit set. `embryo`: the model uses the shared week-5 embryo body.
 * `continuity`: the topic's camera continuity (topics 15–16 use the same machinery with their own).
 */
export function poseStage<P, O extends { dim?: { ids: readonly string[]; k: number } | null }>(spec: StageSpec<P, O>, build: (pose: P, opts: O) => PoseModel, embryo = false, continuity = CONT) {
  const { S, steps } = spec;
  // The steps' cameras, fitted once (on first draw) to what each step shows at its end.
  let fitted: Camera3[] | null = null;
  const camsOf = (near: number) => (fitted ??= steps.map((s, k) => fitStep(spec, build, k, closer(s.cam, near))));
  function View({ t, reduced }: SceneProps) {
    const i = stepAt(S, t);
    const st = steps[i];
    const { pose, opts } = poseAt(spec, t);
    const span = (k: number) => (S[k + 1] ?? 1) - S[k];
    // The lit set fades in at the step's start (no flicker when the step before was lit too).
    const prevDim = i > 0 && !!steps[i - 1].dim;
    const dimK = st.dim ? (prevDim ? 1 : seg(t, S[i], S[i] + 0.025)) : prevDim ? 1 - seg(t, S[i], S[i] + 0.025) : 0;
    const dimIds = st.dim ?? (prevDim ? steps[i - 1].dim! : []);
    const dim = dimK > 0.001 ? { ids: dimIds, k: dimK } : null;
    const built = build(pose, { ...opts, dim });
    const near = continuity === CONT ? (spec.near ?? 0.82) : 1;
    const cams = camsOf(near);
    const viewCam = cameraAt(
      t,
      steps.map((s, k) => (s.glide ? ([S[k], cams[k], s.glide] as const) : ([S[k], cams[k]] as const))),
    );
    // The opening fly-in: the embryo from outside, then into the model (which shows as the embryo clears).
    const F = whereAt(spec.where, t, reduced, viewCam);
    const own = recede(built.items, dim);
    let m = { ...built, items: own };
    if (F && (F.block < 0.999 || F.labels < 0.999 || F.items.length)) {
      const mine = own.map((it) => ({ ...it }));
      reveal(mine, F);
      m = { ...built, items: [...F.items, ...mine] };
    }
    const camera = F?.camera ?? viewCam;
    const L = F?.labels ?? 1;
    // A name kept by the next step stays up (one callout, no fade between steps).
    const runs: { n: NameSpec; a: number; b: number; k: number }[] = [];
    steps.forEach((s, k) => {
      for (const n of s.names ?? []) {
        const n1: NameSpec = typeof n === 'string' ? { id: n } : n;
        const same = runs.find((r) => r.b === S[k] && r.n.id === n1.id && String(r.n.p ?? '') === String(n1.p ?? '') && r.n.text === n1.text && r.n.sub === n1.sub && !n1.from);
        if (same) same.b = S[k + 1] ?? 2;
        else runs.push({ n: n1, a: S[k] + (n1.from ?? 0) * span(k), b: S[k + 1] ?? 2, k });
      }
    });
    const names: CalloutSpec[] = runs.map(({ n, a, b, k }) => ({ id: n.id, p: n.p ?? n.id, show: vis2(t, a, b), text: n.text, sub: n.sub, small: n.small, key: `${n.key ?? n.id}:${k}` }));
    const key = st.key ?? spec.key;
    const sec = spec.section?.(t, pose, st.dim ?? null);
    const secOn = !!sec && sec.show > 0.05;
    return (
      <ModelView
        model={m}
        continuity={continuity}
        camera={camera}
        names={names}
        caption={st.caption ?? spec.caption}
        left={secOn ? sec.left : undefined}
        axes={spec.axes}
        right={spec.right}
        labels={L}
        look={spec.look}
        over={(at) => (
          <>
            {F && F.where > 0.01 && (
              <>
                <Note x={at(F.head).x} y={at(F.head).y - 14} size={13} show={F.where}>
                  Burua
                </Note>
                <Note x={at(F.tail).x} y={at(F.tail).y + 22} size={13} show={F.where}>
                  Buztana
                </Note>
                <Note x={500} y={612} tone="accent" show={F.where}>
                  {spec.where!.note}
                </Note>
              </>
            )}
            {key && <ColourKey items={[...key]} show={L} title={st.keyTitle ?? spec.keyTitle ?? 'Kolorea'} y={46} />}
            {steps.map((s, k) =>
              s.note ? (
                <Note key={`n${k}`} x={500} y={612} tone={s.warn ? 'warn' : 'accent'} show={vis2(t, S[k], S[k + 1] ?? 2) * L}>
                  {s.note}
                </Note>
              ) : null,
            )}
            {steps.map((s, k) =>
              (s.marks ?? []).map((mk, j) => {
                const p = typeof mk.p === 'string' ? m.pts[mk.p] : mk.p;
                if (!p) return null;
                const q = at(p);
                const show = vis2(t, S[k] + 0.2 * span(k), S[k + 1] ?? 2) * L;
                if (show <= 0.02) return null;
                return (
                  <text key={`m${k}-${j}`} x={q.x + (mk.dx ?? 0)} y={q.y + (mk.dy ?? -10)} textAnchor="middle" className="note note-accent" opacity={show} style={{ fontSize: 12.5, fontWeight: 600 }} pointerEvents="none">
                    {mk.text}
                  </text>
                );
              }),
            )}
            {L > 0.01 && <g opacity={L}>{spec.over?.(t, at, pose)}</g>}
            {secOn && L > 0.01 && <g opacity={L}>{sec.node}</g>}
          </>
        )}
      />
    );
  }
  if (!embryo && !spec.where) return View;
  function Scene(props: SceneProps) {
    return useGeoReady([EMBRYO5]) ? <View {...props} /> : <Loading3D />;
  }
  Scene.geo = ['embryo5'];
  return Scene;
}

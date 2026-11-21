'use client';

import { useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { mix } from '@/lib/sim/anim';
import { aimCamera, blendCamera, centreOf, flyCamera, showCamera } from '@/lib/three-d/aim';
import { len, mulM, norm, sub, viewOf, project, type Camera3, type M4, type V3, type View3 } from '@/lib/three-d/math';
import { lookTurn, orbitCamera } from '@/lib/three-d/orbit';
import { pickAt } from '@/lib/three-d/pick';
import { frameMesh, planeMesh, type Plane } from '@/lib/three-d/flyin';
import { between, sameM } from '@/lib/three-d/place';
import { KEY_LIGHT, projectItem, type Item3, type Projected, type Scene3 } from '@/lib/three-d/scene';
import { Part } from '../Part';
import { BridgeLookContext, GhostContext, UnderlayContext, partState, useLabelScale, useScene, type LookSide } from '../context';
import { Note } from '../Label';
import type { GLApi, GLItem, GLState } from './gl';
import { registerPublication } from './publication';

export type At3 = (p: V3, m?: M4) => { x: number; y: number; z: number };

/**
 * A view that takes over from another 3D view of the same continuity by itself, as one camera flight, with
 * no cross-fade of two pictures: the camera is carried from where the viewer was looking; when the models
 * differ (another `place`), the one just left stays where it belongs in the shared body and fades inside
 * this view while this one appears, and the faces of a cut glow where they slice it.
 */
export interface Handover {
  /** This model is a section: its cut faces, in its own space. */
  cut?: readonly Plane[];
  /** Said at the foot while the camera travels in from another model. */
  note?: string;
}

interface Stage3DProps {
  scene: Scene3;
  /** Names, notes and anything else drawn over the 3D picture, placed with `at` (frame coordinates). */
  /** `flight`: 1, or 0→1 as a handover's flight ends: names and notes come in with it. */
  children?: (at: At3, view: View3, flight: number) => ReactNode;
  /** The viewer may turn the picture by dragging it (default on). */
  orbit?: boolean;
  /** Three short axis names for the small orientation cross (up, towards the viewer, side). */
  axes?: { up: string; front: string; side: string; sideDir: V3; edges?: EdgeNames };
  /**
   * The same specimen across views (a key naming it): a view that takes over from one with the same key
   * starts from the camera the viewer was just looking through and glides to its own, so a stage change
   * on the same model never cuts to another angle.
   */
  continuity?: string;
  /**
   * Where this model sits in the shared embryo (the matrix that puts the embryo into the model's space). A
   * view taking over from another model of the same continuity carries the camera across through it.
   */
  place?: M4;
  /** See `Handover`. Omitted: the shell's cross-fade, with the camera carried under it (topics 10–15). */
  handover?: Handover;
}

/**
 * The six anatomical directions by name (`side` is `sideDir`, `otherSide` its opposite). Given, the frame's
 * edge pills follow the camera: each edge names the direction that now points that way on screen.
 */
export interface EdgeNames {
  up: string;
  down: string;
  front: string;
  back: string;
  side: string;
  otherSide: string;
}
type Edges = { top?: string; bottom?: string; left?: string; right?: string };

/**
 * Which anatomical direction faces each edge of the frame for this camera. An edge is named only when
 * one direction clearly points that way (within ~55 degrees); a name, once shown, stays until another
 * clearly beats it, so the pills do not flicker while the picture turns between two directions.
 */
export function edgesFor(m: M4, n: EdgeNames, sideDir: V3, was: Edges): Edges {
  const dirs: [V3, string, string][] = [
    [[0, 1, 0], n.up, n.down],
    [[0, 0, 1], n.front, n.back],
    [sideDir, n.side, n.otherSide],
  ];
  const cs = dirs.flatMap(([d, a, b]) => {
    const x = m[0] * d[0] + m[4] * d[1] + m[8] * d[2];
    const y = m[1] * d[0] + m[5] * d[1] + m[9] * d[2];
    return [
      { name: a, x, y },
      { name: b, x: -x, y: -y },
    ];
  });
  const pick = (score: (c: (typeof cs)[number]) => number, prev?: string) => {
    let best = cs.reduce((p, q) => (score(q) > score(p) ? q : p));
    const kept = prev ? cs.find((c) => c.name === prev) : undefined;
    if (kept && score(kept) > 0.42 && score(best) - score(kept) < 0.18) best = kept;
    return score(best) > (best === kept ? 0.42 : 0.58) ? best.name : undefined;
  };
  return { top: pick((c) => c.y, was.top), bottom: pick((c) => -c.y, was.bottom), left: pick((c) => -c.x, was.left), right: pick((c) => c.x, was.right) };
}
const sameEdges = (a: Edges, b: Edges) => a.top === b.top && a.bottom === b.bottom && a.left === b.left && a.right === b.right;

/** Where the eye is, seen from the specimen, for each named side. */
function lookDir(side: LookSide, sideDir: V3): V3 {
  const neg = (v: V3): V3 => [-v[0], -v[1], -v[2]];
  return side === 'front' ? [0, 0, 1] : side === 'back' ? [0, 0, -1] : side === 'up' ? [0, 1, 0] : side === 'down' ? [0, -1, 0] : side === 'side' ? sideDir : neg(sideDir);
}
const SIDES: LookSide[] = ['front', 'back', 'side', 'otherSide', 'up', 'down'];
/** From above the eye leans back and from below forward, so the front is at the top of the picture, as in the notes. */
const leanOf = (side: LookSide): V3 | undefined => (side === 'up' ? [0, 0, -1] : side === 'down' ? [0, 0, 1] : undefined);

/** The named side the camera looks from now (within ~20 degrees), if any. */
function facingOf(m: M4, sideDir: V3): LookSide | undefined {
  // The camera's own z axis in world space points from the specimen to the eye.
  const z: V3 = [m[2], m[6], m[10]];
  return SIDES.find((k) => {
    const d = lookDir(k, sideDir);
    return (z[0] * d[0] + z[1] * d[1] + z[2] * d[2]) / Math.hypot(d[0], d[1], d[2]) > 0.94;
  });
}

/** How long a turn asked for with the buttons (or a reset) takes. */
const TURN_MS = 420;

const STATE: Record<ReturnType<typeof partState>, GLState> = {
  idle: 'idle',
  dim: 'dim',
  active: 'active',
  focus: 'focus',
  spot: 'spot',
  shade: 'shade',
  ctx: 'ctx',
};

/**
 * A 3D view inside the usual scene frame. The picture is computed here from the scene's meshes and
 * camera (pure, synchronous: the server render and the tests see the same names and parts); inside
 * the viewport a lazily loaded WebGL layer under the SVG draws the shaded tissue, and the SVG keeps
 * only invisible outlines for pointing, plus the names. Without WebGL the outlines are drawn flat.
 */
/** How long the camera takes to turn to a structure put forward, and back. */
const GLIDE_MS = 1100;
const ease = (x: number) => x * x * x * (x * (x * 6 - 15) + 10);
/** A calm part (`Item3.calm`) steps back as context does, never to the dark states. */
const calmed = (state: GLState, calm: boolean | undefined): GLState => (calm && (state === 'dim' || state === 'shade') ? 'ctx' : state);
/**
 * A named part of the ground (a swelling of the perineal skin, a cut face named for its tissue) looks, while it is
 * not put forward, exactly like the unnamed ground round it: one surface, no patch where the name begins.
 */
const grounded = (state: GLState, ground: boolean | undefined, plain: GLState): GLState => (ground && (state === 'dim' || state === 'shade' || state === 'ctx') ? plain : state);

/**
 * The WebGL layer a 3D view leaves behind stays parked a few seconds for the next one in the same frame:
 * a camera move between views (which draws the view it leaves once more) or the next stage's 3D view
 * then shows at once, with no "preparing" moment in the middle of the move.
 */
const parked = new Map<HTMLDivElement, { api: GLApi; timer: number }>();
const PARK_MS = 5000;
/** 3D views on screen per frame: one still there when another mounts will hand its layer over. */
const live = new WeakMap<HTMLDivElement, number>();

function park(host: HTMLDivElement, api: GLApi) {
  // A route change removed the whole viewport: no successor can take over this host.
  if (!host.isConnected) { api.dispose(); return; }
  api.park();
  const old = parked.get(host);
  if (old && old.api !== api) {
    window.clearTimeout(old.timer);
    old.api.dispose();
  }
  parked.set(host, {
    api,
    timer: window.setTimeout(() => {
      if (parked.get(host)?.api === api) parked.delete(host);
      api.dispose();
    }, PARK_MS),
  });
}

/**
 * The camera each frame's 3D view last showed (and its specimen key), for the next view to start from; and
 * what it last drew, for a view that takes over by itself to let it fade in place (see `Handover`).
 */
const lastCam = new WeakMap<HTMLDivElement, { key: string; cam: Camera3; at: number; live: number; place?: M4; drew?: GLItem[]; cut?: readonly Plane[] }>();

/** Frames a handover view has just taken over: the picture the shell leaves to fade there stays out. */
const claims = new WeakMap<HTMLDivElement, number>();
const claimWatchers = new Set<() => void>();
const CLAIM_MS = 3000;
const watchClaims = (cb: () => void) => {
  claimWatchers.add(cb);
  return () => void claimWatchers.delete(cb);
};

/** Whether a view of this specimen is on screen or only just gone: the new view takes over from it. */
function takesOver(host: HTMLDivElement | null | undefined, continuity: string | undefined) {
  const l = continuity && host ? lastCam.get(host) : undefined;
  // Still on screen (the outgoing view fades out over this one) or only just gone.
  return l && l.key === continuity && (l.live > 0 || performance.now() - l.at < 1500) ? l : null;
}

/**
 * Whether the view mounting now continues the one just shown (the same specimen key): a stage played on
 * from the one before. Asked once, when the view mounts. A topic's linear story then flows on from the
 * camera the viewer was looking through instead of opening again from outside the embryo.
 */
export function useContinuing(continuity: string | undefined) {
  const ul = useContext(UnderlayContext);
  const [on] = useState(() => !!takesOver(ul?.host, continuity));
  return on;
}

/**
 * A camera of one model carried into another model of the same embryo: each model's `place` puts the
 * embryo into it (the wall, a section block cut from it), so the camera keeps looking at the same tissue
 * from the same side as the view changes from one model to the other.
 */
function carry(cam: Camera3, from: M4, to: M4): Camera3 {
  // from = s·R | t: its inverse is Rᵀ/s | −Rᵀt/s.
  const s2 = from[0] * from[0] + from[1] * from[1] + from[2] * from[2];
  const back = (p: V3, w: number): V3 => {
    const q: V3 = [p[0] - w * from[12], p[1] - w * from[13], p[2] - w * from[14]];
    return [(from[0] * q[0] + from[1] * q[1] + from[2] * q[2]) / s2, (from[4] * q[0] + from[5] * q[1] + from[6] * q[2]) / s2, (from[8] * q[0] + from[9] * q[1] + from[10] * q[2]) / s2];
  };
  const fwd = (p: V3, w: number): V3 => [to[0] * p[0] + to[4] * p[1] + to[8] * p[2] + w * to[12], to[1] * p[0] + to[5] * p[1] + to[9] * p[2] + w * to[13], to[2] * p[0] + to[6] * p[1] + to[10] * p[2] + w * to[14]];
  const pt = (p: V3) => fwd(back(p, 1), 1);
  return { ...cam, eye: pt(cam.eye), target: pt(cam.target), up: norm(fwd(back(cam.up ?? [0, 1, 0], 0), 0)) };
}
const ENTER_MS = 1100;
/** A stage that runs on in the same model (a handover without a flight): its camera's glide and its pose's run. */
export const RUN_ON_MS = 1400;
/** Harness only: `window.__flightAt = 0..1` holds every stage-change move at that moment (undefined: plays). */
export const heldFlight = (): number | null => {
  const v = typeof window !== 'undefined' ? (window as unknown as { __flightAt?: number }).__flightAt : undefined;
  return typeof v === 'number' ? Math.max(0, Math.min(1, v)) : null;
};
/** A flight from one model into another: long enough to see where the camera goes. */
const FLIGHT_MS = 2300;
/** A cut plane of a handover as drawn: its bright outline, and a faint sheet that never hides what it cuts. */
interface CutPart {
  key: string;
  mesh: Item3['mesh'];
  matrix?: M4;
  k: number;
}
const cutParts = (key: string, p: Plane, matrix: M4 | undefined): CutPart[] => [
  { key: `${key}:edge`, mesh: frameMesh(p), matrix, k: 0.95 },
  { key: `${key}:sheet`, mesh: planeMesh(p), matrix, k: 0.1 },
];
/** The angle between two cameras' lines of sight (radians). */
const turnOf = (a: Camera3, b: Camera3) => {
  const u = [a.eye[0] - a.target[0], a.eye[1] - a.target[1], a.eye[2] - a.target[2]];
  const v = [b.eye[0] - b.target[0], b.eye[1] - b.target[1], b.eye[2] - b.target[2]];
  const d = (u[0] * v[0] + u[1] * v[1] + u[2] * v[2]) / (Math.hypot(...u) * Math.hypot(...v) || 1);
  return Math.acos(Math.max(-1, Math.min(1, d)));
};
const smooth = (a: number, b: number, x: number) => {
  const u = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return u * u * (3 - 2 * u);
};
const differs = (a: Camera3, b: Camera3) => {
  const ea = norm(sub(a.eye, a.target));
  const eb = norm(sub(b.eye, b.target));
  return ea[0] * eb[0] + ea[1] * eb[1] + ea[2] * eb[2] < 0.9986 || Math.hypot(...sub(a.target, b.target)) > 0.05 || Math.abs(a.fov - b.fov) > 0.5 || Math.abs(len(sub(a.eye, a.target)) - len(sub(b.eye, b.target))) > 0.1;
};

type Pub = { orient: Edges | null; look: { names: Record<LookSide, string>; facing?: LookSide } | null };
/** The 3D views on each frame, oldest first: the last one sets the frame's side names and camera keys. */
const pubs = new WeakMap<HTMLDivElement, Pub[]>();

const noSubscribe = () => () => {};
const zero = () => 0;

/** The drag hint is a one-time lesson: once the viewer has turned a 3D view, it no longer takes room. */
let turnedOnce = false;

export function Stage3D(props: Stage3DProps) {
  const ghost = useContext(GhostContext);
  const host = useContext(UnderlayContext)?.host;
  // The picture a scene change leaves to fade: when the next view hands over by itself, it stays out.
  const claimed = useSyncExternalStore(watchClaims, () => (ghost && host ? (claims.get(host) ?? 0) : 0), zero);
  if (claimed && performance.now() - claimed < CLAIM_MS) return null;
  return <Stage3DView {...props} />;
}

function Stage3DView({ scene, children, orbit = true, axes, continuity, place, handover }: Stage3DProps) {
  const ctx = useScene();
  const ul = useContext(UnderlayContext);
  const isGhost = useContext(GhostContext);
  // Taking over from a view of the same specimen: start from its camera (see `continuity`).
  const [entry] = useState(() => {
    const l = takesOver(ul?.host, continuity);
    if (!l) return null;
    // Another model of the same embryo: the camera is carried into it (see `place`).
    const G = l.place && place && !sameM(l.place, place) ? between(l.place, place) : null;
    const cam = G ? carry(l.cam, l.place!, place!) : l.cam;
    if (!handover || isGhost || !ul?.host) return { cam, own: false, left: [] as GLItem[], cuts: [] as CutPart[] };
    // This view takes the frame over by itself: no cross-fade (the shell's fading copy stays out).
    claims.set(ul.host, performance.now());
    claimWatchers.forEach((cb) => cb());
    // The model just left, put where it belongs in this one's space; streams (blood cells) are let go.
    const left = G ? (l.drew ?? []).filter((it) => !it.stream).map((it) => ({ ...it, key: `left:${it.key}`, matrix: it.matrix ? mulM(G, it.matrix) : G, quiet: true })) : [];
    const cuts = G
      ? [
          ...(handover.cut ?? []).flatMap((p, i) => cutParts(`cut:in${i}`, p, undefined)),
          // Leaving a section for the model it was cut from: its faces glow where it was.
          ...(handover.cut ? [] : (l.cut ?? [])).flatMap((p, i) => cutParts(`cut:out${i}`, p, G)),
        ]
      : [];
    return { cam, own: true, left, cuts };
  });
  const enter = entry?.cam ?? null;
  // A flight between two models (the old one fading inside this view); else only the camera glides.
  const flying = !!entry && entry.left.length > 0;
  const [enterP, setEnterP] = useState(enter ? 0 : 1);
  useEffect(() => {
    if (!enter) return;
    const ms = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 1 : flying ? FLIGHT_MS : entry?.own ? RUN_ON_MS : ENTER_MS;
    let raf = 0;
    let last = 0;
    let done = 0;
    // The new stage's first frames can be slow (scene set-up): the glide counts at most one smooth
    // frame's worth per frame, so it is seen from its start instead of jumping a third of the way.
    const step = (now: number) => {
      done += last ? Math.min(now - last, 40) : 0;
      last = now;
      // The QA harness holds a flight at a moment to shoot it (scripts/quality/flight-sheet.mjs).
      const held = heldFlight();
      const p = held ?? Math.min(1, done / ms);
      setEnterP(p);
      if (p < 1 || held !== null) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [enter, flying, entry?.own]);
  const [turn, setTurn] = useState({ yaw: 0, pitch: 0 });
  const [gl, setGl] = useState<GLApi | null>(null);
  const [ready, setReady] = useState(false);
  // WebGL could not start (or is very late): only then the coarse flat picture stands in for it.
  const [flatOnly, setFlatOnly] = useState(false);
  // Bumped to build the WebGL layer again after its context was lost (once: see createRenderCircuit).
  const [rebuild, setRebuild] = useState(0);
  // A parked layer is waiting for this view: no "preparing" spinner, the picture is there next frame.
  const [warm] = useState(() => !!ul?.host && (parked.has(ul.host) || (live.get(ul.host) ?? 0) > 0));
  const drag = useRef<{ x: number; y: number; yaw: number; pitch: number; moved: boolean } | null>(null);
  // While the viewer turns the picture, the pointer is held by the turn: nothing can be pointed at.
  const [turning, setTurning] = useState(false);
  // Bumped once things settle, to bring outlines left behind during a turn or playback up to date.
  const [, setSettled] = useState(0);
  // Turns asked for with the buttons or a reset glide there (a drag follows the pointer at once).
  const turnNow = useRef(turn);
  turnNow.current = turn;
  const [turnGoal, setTurnGoal] = useState<{ yaw: number; pitch: number; serial: number } | null>(null);
  const turnRaf = useRef(0);
  useEffect(() => {
    if (!turnGoal) return;
    const from = turnNow.current;
    const ms = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 1 : TURN_MS;
    let t0 = 0;
    const step = (now: number) => {
      t0 ||= now;
      const p = Math.min(1, (now - t0) / ms);
      const e = ease(p);
      setTurn({ yaw: from.yaw + (turnGoal.yaw - from.yaw) * e, pitch: from.pitch + (turnGoal.pitch - from.pitch) * e });
      if (p < 1) turnRaf.current = requestAnimationFrame(step);
    };
    turnRaf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(turnRaf.current);
  }, [turnGoal]);
  const glideTurn = (to: { yaw: number; pitch: number }) => setTurnGoal((g) => ({ ...to, serial: (g?.serial ?? 0) + 1 }));

  // A camera move into a cut turns the picture to the side the cut is seen from first.
  const bridge = useContext(BridgeLookContext);
  const bridgeK = useSyncExternalStore(bridge?.subscribe ?? noSubscribe, bridge?.get ?? zero, zero);
  // The camera the scene asks for, turned by the viewer's drag around its target.
  const cam = useMemo(() => {
    if (!bridge || !axes || (bridgeK <= 0 && !bridge.from)) return orbitCamera(scene.camera, turn);
    const toward = (side: LookSide) => lookTurn(scene.camera, lookDir(side, axes.sideDir), leanOf(side));
    const start = bridge.from ? toward(bridge.from) : turn;
    const goal = toward(bridge.side);
    // The short way round.
    const yaw = start.yaw + Math.atan2(Math.sin(goal.yaw - start.yaw), Math.cos(goal.yaw - start.yaw));
    return orbitCamera(scene.camera, { yaw: start.yaw + (yaw - start.yaw) * bridgeK, pitch: start.pitch + (goal.pitch - start.pitch) * bridgeK });
  }, [scene.camera, turn, bridge, bridgeK, axes]);
  const orbitRequest = ul?.orbitRequest;
  const [appliedOrbit, setAppliedOrbit] = useState<typeof orbitRequest>(undefined);
  if (orbitRequest && orbit && appliedOrbit !== orbitRequest) {
    setAppliedOrbit(orbitRequest);
    const { direction } = orbitRequest;
    // From where the last asked-for turn is heading (quick presses add up), not from mid-glide.
    const base = turnGoal && !drag.current ? turnGoal : turn;
    const look = direction === 'look' && orbitRequest.look && axes ? lookTurn(scene.camera, lookDir(orbitRequest.look, axes.sideDir), leanOf(orbitRequest.look)) : null;
    // The short way round from where the picture is now.
    const wrap = (a: number) => base.yaw + Math.atan2(Math.sin(a - base.yaw), Math.cos(a - base.yaw));
    glideTurn(look ? { yaw: wrap(look.yaw), pitch: look.pitch } : direction === 'reset' || direction === 'look' ? { yaw: 0, pitch: 0 } : {
      // The keys move the camera, as ↑ does: → walks it round to the right of the specimen.
      yaw: base.yaw + (direction === 'left' ? -0.35 : direction === 'right' ? 0.35 : 0),
      pitch: Math.max(-1.1, Math.min(1.1, base.pitch + (direction === 'up' ? 0.22 : direction === 'down' ? -0.22 : 0))),
    });
  }

  // The structure put forward (the step's tour, the 3D tour): the camera turns to the side it is best
  // seen from, gliding there and back so the viewer always sees where the picture went.
  const spot = ctx.spotlight ?? null;
  // In the class the camera stays while the named structure is in sight, and turns only to show it.
  const goalFor = (id: string | null) => (!id ? cam : ctx.spotKeep ? showCamera(cam, scene.items, id, ctx.partsOf) : aimCamera(cam, centreOf(scene.items, id, ctx.partsOf)));
  const [aim, setAim] = useState<{ from: string | null; to: string | null; p: number }>({ from: spot, to: spot, p: 1 });
  // A new structure: the glide starts from where the camera is aimed now (adjusted during render, so
  // the first frame never shows the end of the move).
  if (aim.to !== spot) setAim({ from: aim.p < 0.5 ? aim.from : aim.to, to: spot, p: 0 });
  const gliding = aim.p < 1;
  useEffect(() => {
    if (!gliding) return;
    // Reduced motion: the camera is simply there on the next frame.
    const ms = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 1 : GLIDE_MS;
    let raf = 0;
    let t0 = 0;
    const step = (now: number) => {
      t0 ||= now;
      const p = Math.min(1, (now - t0) / ms);
      setAim((a) => ({ ...a, p }));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [gliding, aim.to]);
  const aimed = gliding ? blendCamera(goalFor(aim.from), goalFor(spot), ease(aim.p)) : goalFor(spot);
  // A flight first shows where it is going (the cut glows on the model just left), then moves.
  const camP = flying ? smooth(0.1, 0.94, enterP) : ease(enterP);
  const display = enter && enterP < 1 && (flying || differs(enter, aimed)) ? (flying ? flyCamera(enter, aimed, camP) : blendCamera(enter, aimed, camP)) : aimed;
  const view = viewOf(display);
  const drew = useRef<GLItem[]>([]);
  useEffect(() => {
    if (continuity && ul?.host && !isGhost) lastCam.set(ul.host, { key: continuity, cam: display, at: performance.now(), live: lastCam.get(ul.host)?.live ?? 0, place, drew: drew.current, cut: handover?.cut });
  });
  // A paused view stops rendering, so "how recent" counts from when it leaves, not from its last frame.
  useEffect(() => {
    const h = ul?.host;
    if (!continuity || !h || isGhost) return;
    const mark = (d: number) => {
      const l = lastCam.get(h);
      if (l) lastCam.set(h, { ...l, live: Math.max(0, l.live + d), at: performance.now() });
    };
    mark(1);
    return () => mark(-1);
  }, [continuity, ul?.host, isGhost]);
  const light = scene.light ?? KEY_LIGHT;

  // The frame's edge pills follow the camera (the step's turns, the tour's glides and the viewer's drag).
  const setOrient = ul?.setOrient;
  const setLook = ul?.setLook;
  const host0 = ul?.host ?? null;
  // Two views share the frame while one fades into the other: the newest one speaks for it, and the
  // one leaving hands the frame back to whoever is left instead of blanking it.
  const pub = useRef<Pub>({ orient: null, look: null });
  useEffect(() => {
    if (!host0) return;
    const entry = pub.current;
    const list = pubs.get(host0) ?? [];
    pubs.set(host0, list);
    return registerPublication(list, entry, !!root.current?.closest('.scene-ghost'), (next) => {
      setOrient?.(next?.orient ?? null);
      setLook?.(next?.look ?? null);
    });
  }, [host0, setOrient, setLook]);
  const speaks = () => {
    const list = host0 ? pubs.get(host0) : undefined;
    return !list || list[list.length - 1] === pub.current;
  };
  const edges = useRef<Edges>({});
  const edgeNames = axes?.edges;
  const nextEdges = edgeNames && axes ? edgesFor(view.view, edgeNames, axes.sideDir, edges.current) : null;
  useEffect(() => {
    if (!setOrient || !nextEdges || sameEdges(nextEdges, edges.current)) return;
    edges.current = nextEdges;
    pub.current.orient = nextEdges;
    if (speaks()) setOrient(nextEdges);
  });
  // The frame's camera keys offer the named sides and light the one the picture is seen from now.
  const facing = edgeNames && axes && orbit ? facingOf(view.view, axes.sideDir) : undefined;
  const lookKey = edgeNames && orbit ? `${SIDES.map((k) => edgeNames[k]).join('|')}|${facing ?? ''}` : '';
  useEffect(() => {
    if (!setLook || !lookKey || !edgeNames) return;
    pub.current.look = { names: edgeNames, facing };
    if (speaks()) setLook(pub.current.look);
    // Only when the names or the side change: the key says both.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setLook, lookKey]);

  const host = ul?.host ?? null;
  // The flat fallback is drawn without a viewport (server render, tests) or when WebGL fails. While the
  // WebGL layer is starting (well under a second) nothing is drawn: the coarse flat meshes would flash
  // a jagged picture before the smooth one.
  const flat = !ready && (!host || flatOnly);
  // Starting up: the spinner stands in for the picture, and its names wait for it.
  const waiting = !!host && !ready && !flatOnly && !warm;
  // The outlines for pointing are projected again when their item moved, but not while the picture is
  // being turned (nothing can be pointed at then) and at most every 100 ms while it plays; once things
  // settle they are all brought up to date. The flat picture (no WebGL) is drawn from them: always current.
  let behind = false;
  const drawn = scene.items
    .filter((it) => (it.show ?? 1) * (it.opacity ?? 1) > 0.01)
    .map((it) => {
      if (it.stream) return { it, pr: UNPROJECTED };
      const r = projectCached(it, view, light, flat, flat ? 'now' : turning ? 'hold' : 'soon');
      behind ||= r.behind;
      return { it, pr: r.pr };
    })
    .sort((a, b) => b.pr.depth - a.pr.depth);
  useEffect(() => {
    if (!behind) return;
    const id = window.setTimeout(() => setSettled((n) => n + 1), 120);
    return () => window.clearTimeout(id);
  });

  useEffect(() => {
    if (!host) return;
    live.set(host, (live.get(host) ?? 0) + 1);
    let dead = false;
    let api: GLApi | null = null;
    // The spinner holds while the layer starts (a heavy model's first picture can take seconds on a slow
    // computer); the coarse flat picture only if it never comes: shown early, it looked like a broken model.
    const late = window.setTimeout(() => setFlatOnly(true), 12000);
    // The GPU was lost (driver reset): the flat picture for a moment, then a new layer; for good only if
    // WebGL cannot start here or keeps being lost.
    let unLost = () => {};
    let again = 0;
    import('./gl')
      .then((m) => {
        if (dead) return;
        const lost = () => {
          window.clearTimeout(late);
          setReady(false);
          setFlatOnly(true);
          // Release the active layer too: otherwise scene updates still upload meshes to the lost
          // context, and a later view can wake this renderer out of the parking pool.
          api?.dispose();
          api = null;
          setGl(null);
          const p = parked.get(host);
          if (p) {
            parked.delete(host);
            window.clearTimeout(p.timer);
            p.api.dispose();
          }
          window.clearTimeout(again);
          if (!m.glWasLost()) again = window.setTimeout(() => !dead && setRebuild((n) => n + 1), 1200);
        };
        if (m.glWasLost()) lost();
        else unLost = m.onGLLost(lost);
      })
      .catch(() => {});
    const pooled = parked.get(host);
    if (pooled) {
      parked.delete(host);
      window.clearTimeout(pooled.timer);
      api = pooled.api;
      api.wake(() => {
        window.clearTimeout(late);
        if (!dead) setReady(true);
      });
      setGl(api);
    } else
      import('./gl')
        .then((m) => {
          if (dead) return;
          api = m.createGL(host, () => {
            window.clearTimeout(late);
            setReady(true);
          });
          setGl(api);
          if (!api) setFlatOnly(true);
        })
        .catch(() => !dead && setFlatOnly(true));
    return () => {
      dead = true;
      unLost();
      window.clearTimeout(again);
      live.set(host, (live.get(host) ?? 1) - 1);
      window.clearTimeout(late);
      // Parked for the next 3D view in this frame (one at a time), then let go.
      if (api) park(host, api);
      setGl(null);
      setReady(false);
      setFlatOnly(false);
    };
  }, [host, rebuild]);

  // The shaded picture follows this view's own group (not just the frame's zoom): a camera move between
  // views, which carries and fades the drawings, carries and fades the 3D picture with them.
  const root = useRef<SVGGElement>(null);
  const sceneEl = ul?.scene ?? null;
  useEffect(() => gl?.follow(root.current ?? sceneEl), [gl, sceneEl]);

  // A flight between models, in three overlapping parts: the cut glows on the model just left; that model
  // fades where it stands while this one appears in its place; then the names come.
  const inFlight = flying && enterP < 1;
  const leftK = inFlight ? 1 - smooth(0.34, 0.74, enterP) : 0;
  const ownK = inFlight ? smooth(0.26, 0.62, enterP) : 1;
  const cutK = inFlight ? smooth(0.02, 0.14, enterP) * (1 - smooth(0.46, 0.66, enterP)) : 0;
  // Running on in the same model with the camera coming a long way round (front ↔ back): the names wait for it.
  const round = !flying && !!entry?.own && !!enter && enterP < 1 && turnOf(enter, aimed) > 1;
  const flight = inFlight ? smooth(0.8, 1, enterP) : round ? smooth(0.55, 0.95, enterP) : 1;
  // Every render hands the WebGL layer this frame's meshes, matrices and highlight states.
  useLayoutEffect(() => {
    const plain: GLState = ctx.hovered || ctx.selected || ctx.spotlight ? 'ctx' : 'idle';
    const own: GLItem[] = drawn.map(({ it }) => ({
      key: it.key,
      mesh: it.mesh,
      matrix: it.matrix,
      color: it.color,
      deep: it.deep,
      tissue: it.tissue ?? 'skin',
      opacity: (it.show ?? 1) * (it.opacity ?? 1),
      outline: it.outline ?? true,
      state: it.id ? grounded(calmed(STATE[partState(ctx, it.id, it.groups)], it.calm), it.ground, plain) : plain,
      quiet: !!it.quiet,
      clip: it.clip,
      stream: it.stream,
      thin: it.thin ?? 0,
      soft: it.mesh.tint ? (it.soft ?? 1) : 0,
    }));
    drew.current = own;
    const items = !inFlight
      ? own
      : [
          ...(leftK > 0.01 ? entry!.left.map((it) => ({ ...it, opacity: it.opacity * leftK })) : []),
          ...own.filter((it) => !it.stream || ownK > 0.98).map((it) => ({ ...it, opacity: it.opacity * ownK })),
          ...(cutK > 0.01 ? entry!.cuts.map((c) => ({ key: c.key, mesh: c.mesh, matrix: c.matrix, color: '#ffd27a', deep: '#c08a2a', tissue: 'membrane' as const, opacity: c.k * cutK, outline: false, state: 'idle' as const, quiet: true, thin: 0 })) : []),
        ];
    gl?.frame({
      view: view.view,
      proj: view.proj,
      light,
      ao: scene.look?.ao ?? 0,
      aoRadius: Math.hypot(display.eye[0] - display.target[0], display.eye[1] - display.target[1], display.eye[2] - display.target[2]) * (scene.look?.aoReach ?? 0.04),
      items,
    });
  });

  const at: At3 = (p, m) => {
    const q = m ? applyPoint(m, p) : p;
    const r = project(view, q);
    return { x: r.x, y: r.y, z: r.z };
  };

  const canTurn = orbit && !ul?.zoomed;
  // With the WebGL picture up, pointing finds what the eye sees at the pixel (lib/three-d/pick.ts) instead
  // of the outlines painted by mean depth, which let a wrapping or see-through item take the pointer.
  const pickOn = ready && !flat;
  const pickState = useRef({ id: null as string | null, raf: 0, x: 0, y: 0, items: [] as Item3[], view });
  useLayoutEffect(() => {
    pickState.current.items = drawn.map((d) => d.it);
    pickState.current.view = view;
  });
  const pickRect = useRef<SVGRectElement>(null);
  const frameAt = (e: { clientX: number; clientY: number }) => {
    // The frame-sized rectangle's box on screen (CSS zoom included, which getScreenCTM can miss).
    const r = pickRect.current?.getBoundingClientRect();
    if (!r || r.width < 1 || r.height < 1) return null;
    return { x: ((e.clientX - r.left) / r.width) * 1000, y: ((e.clientY - r.top) / r.height) * 640 };
  };
  const setPicked = (id: string | null) => {
    const ps = pickState.current;
    if (ps.id === id) return;
    ps.id = id;
    if (pickRect.current) pickRect.current.style.cursor = id ? 'pointer' : '';
    ctx.onHover(id);
  };
  useEffect(() => () => cancelAnimationFrame(pickState.current.raf), []);
  const onTheModel = (e: { target: EventTarget }) => e.target === pickRect.current;
  return (
    <g
      ref={root}
      className={`stage3d${ready ? ' is-gl' : ''}${entry?.own ? ' is-handover' : ''}`}
      data-orbit={orbit ? '' : undefined}
      onPointerDown={(e) => {
        if (!canTurn || e.button !== 0) return;
        // A drag takes over from a glide where it is.
        cancelAnimationFrame(turnRaf.current);
        drag.current = { x: e.clientX, y: e.clientY, yaw: turn.yaw, pitch: turn.pitch, moved: false };
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (pickOn && !d?.moved) {
          const ps = pickState.current;
          if (onTheModel(e)) {
            const q = frameAt(e);
            if (q) {
              ps.x = q.x;
              ps.y = q.y;
              if (!ps.raf)
                ps.raf = requestAnimationFrame(() => {
                  ps.raf = 0;
                  setPicked(pickAt(ps.items, ps.view, ps.x, ps.y));
                });
            }
          } else if (ps.id) {
            // Onto a name (which lights its own structure) or an overlay: this pointing is over.
            cancelAnimationFrame(ps.raf);
            ps.raf = 0;
            if ((e.target as Element).closest?.('[data-label],[data-part]')) ps.id = null;
            else setPicked(null);
          }
        }
        if (!d) return;
        const dx = e.clientX - d.x;
        const dy = e.clientY - d.y;
        if (!d.moved && Math.hypot(dx, dy) < 5) return;
        if (!d.moved) {
          d.moved = true;
          cancelAnimationFrame(pickState.current.raf);
          pickState.current.raf = 0;
          if (pickState.current.id) setPicked(null);
          turnedOnce = true;
          setTurning(true);
          (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
        }
        setTurn({ yaw: d.yaw - dx * 0.007, pitch: Math.max(-1.1, Math.min(1.1, d.pitch + dy * 0.006)) });
      }}
      onPointerUp={() => {
        setTurning(false);
        setTimeout(() => (drag.current = null), 0);
      }}
      onPointerCancel={() => {
        setTurning(false);
        drag.current = null;
      }}
      onLostPointerCapture={() => {
        setTurning(false);
        setTimeout(() => (drag.current = null), 0);
      }}
      onClickCapture={(e) => {
        // A drag that turned the picture is not a click on what it started on.
        if (drag.current?.moved) e.stopPropagation();
      }}
      onClick={(e) => {
        if (!pickOn || !onTheModel(e)) return;
        const q = frameAt(e);
        const id = q ? pickAt(pickState.current.items, pickState.current.view, q.x, q.y) : null;
        if (!id) return;
        e.stopPropagation();
        ctx.onSelect(id);
      }}
      onPointerLeave={() => {
        cancelAnimationFrame(pickState.current.raf);
        pickState.current.raf = 0;
        if (pickState.current.id) setPicked(null);
      }}
      onDoubleClick={() => glideTurn({ yaw: 0, pitch: 0 })}
    >
      {(canTurn || pickOn) && <rect ref={pickRect} className={canTurn ? 'stage3d-orbit' : 'stage3d-pick'} x={0} y={0} width={1000} height={640} fill="transparent" />}
      {drawn.map(({ it, pr }) => {
        if (!pr.any) return null;
        const deep = it.deep ?? mix(it.color, '#000000', 0.55);
        const lit = mix(it.color, '#ffffff', 0.22);
        const flatEl = flat && (
          <g className="stage3d-flat" opacity={it.opacity ?? 1}>
            <path d={pr.bands[0]} fill={deep} stroke={deep} strokeWidth={0.6} strokeLinejoin="round" />
            <path d={pr.bands[1]} fill={it.color} stroke={it.color} strokeWidth={0.6} strokeLinejoin="round" />
            <path d={pr.bands[2]} fill={lit} stroke={lit} strokeWidth={0.6} strokeLinejoin="round" />
          </g>
        );
        if (!it.id)
          return (
            <g key={it.key} opacity={it.show ?? 1} pointerEvents="none">
              {flatEl}
            </g>
          );
        // In a flight this model's parts are not there to point at (or to be marked by the tour) until they show.
        if (((inFlight && ownK < 0.6) || (round && flight < 0.5)) && !flat) return null;
        return (
          <Part key={it.key} id={it.id} groups={it.groups} quiet={it.quiet} show={it.show ?? 1}>
            {flatEl}
            <path className="stage3d-hit" d={pr.d} />
          </Part>
        );
      })}
      {waiting && <Loading3D />}
      {!waiting && axes && <Axes view={view} axes={axes} hint={canTurn && ready && !turnedOnce} />}
      {!waiting && children?.(at, view, flight)}
      {inFlight && handover?.note && (
        <Note x={500} y={612} tone="accent" show={smooth(0.02, 0.14, enterP) * (1 - smooth(0.7, 0.84, enterP))}>
          {handover.note}
        </Note>
      )}
    </g>
  );
}

/**
 * The last projection of each item: while the camera, the item's matrix and its cut stay the same (most
 * frames of a played view: only highlights and visibility change), its outlines are not projected again.
 */
const projections = new Map<string, { mesh: object; sig: string; pr: Projected; at: number }>();
/** A stream (blood cells) is placed by the GPU alone: nothing to point at, nothing drawn flat. */
const UNPROJECTED: Projected = { d: '', bands: ['', '', ''], depth: 0, any: false };
/**
 * `when`: 'now' projects a moved item at once; 'soon' at most every 100 ms; 'hold' keeps its last
 * outline (`behind` then says the outline is out of date).
 */
function projectCached(it: Item3, view: View3, light: V3, flat: boolean, when: 'now' | 'soon' | 'hold'): { pr: Projected; behind: boolean } {
  const mesh = it.hit ?? it.mesh;
  const sig = `${flat ? 1 : 0}|${Array.prototype.join.call(view.vp, ',')}|${it.matrix ? Array.prototype.join.call(it.matrix, ',') : ''}|${light.join(',')}|${it.clip ? JSON.stringify(it.clip) : ''}`;
  const last = projections.get(it.key);
  if (last && last.mesh === mesh && last.sig === sig) return { pr: last.pr, behind: false };
  const now = performance.now();
  if (last && last.sig.startsWith(flat ? '1' : '0') && (when === 'hold' || (when === 'soon' && now - last.at < 100))) return { pr: last.pr, behind: true };
  const pr = projectItem(it, view, light, flat);
  projections.set(it.key, { mesh, sig, pr, at: now });
  return { pr, behind: false };
}

/** Shown for the moment a 3D view's geometry is still being built (off the main thread). */
export function Loading3D() {
  return (
    <g className="stage3d-loading" pointerEvents="none" aria-label="3D eredua prestatzen">
      <circle cx={500} cy={300} r={22} fill="none" stroke="rgba(232,238,252,0.16)" strokeWidth={4} />
      <path d="M500,278 A22,22 0 0 1 522,300" fill="none" stroke="rgba(232,238,252,0.7)" strokeWidth={4} strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 500 300" to="360 500 300" dur="0.9s" repeatCount="indefinite" />
      </path>
      <text x={500} y={350} textAnchor="middle" fontSize={15} fill="rgba(232,238,252,0.72)">
        3D eredua prestatzen…
      </text>
    </g>
  );
}

const sstep = (a: number, b: number, x: number) => {
  const u = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return u * u * (3 - 2 * u);
};

function applyPoint(m: M4, p: V3): V3 {
  return [m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12], m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13], m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14]];
}

/**
 * Which way is which in a 3D view: a small orientation key that turns with the picture, on its own
 * plate in the top-left corner under the view's caption (the one corner the 3D scenes keep for it;
 * names live in the side columns, step notes at the foot). The cross only draws the directions; their
 * names are a legend beside it, so no name ever lands on another or on the drawing. How to turn the
 * picture is said once by the shell, in its view corner (never on the drawing), so `hint` is unused.
 */
function Axes({ view, axes }: { view: View3; axes: NonNullable<Stage3DProps['axes']>; hint: boolean }) {
  // Kept legible on small frames, like the names (but it grows less: it is a key, not the subject).
  const k = Math.min(1.5, useLabelScale().k);
  const dirs: { d: V3; name: string; c: string }[] = [
    { d: [0, 1, 0], name: axes.up, c: '#e8eefc' },
    { d: [0, 0, 1], name: axes.front, c: '#ffb86b' },
    { d: axes.sideDir, name: axes.side, c: '#8fb4f7' },
  ];
  // Directions in camera space (rotation part of the view matrix), drawn as a flat projection.
  const m = view.view;
  const cx = 26;
  const cy = 27;
  const L = 17;
  const rows = 13;
  const legendX = 54;
  const longest = Math.max(...dirs.map((d) => d.name.length));
  const w = legendX + 15 + longest * 5.9 + 10;
  const h = 54;
  return (
    <g pointerEvents="none" aria-hidden className="axes3d" transform={`translate(20 52) scale(${k})`}>
      <rect className="axes3d-plate" x={0} y={0} width={w} height={h} rx={9} />
      {dirs.map(({ d, name, c }, i) => {
        const x = m[0] * d[0] + m[4] * d[1] + m[8] * d[2];
        const y = m[1] * d[0] + m[5] * d[1] + m[9] * d[2];
        const z = m[2] * d[0] + m[6] * d[1] + m[10] * d[2];
        const tip: [number, number] = [cx + x * L, cy - y * L];
        const back = z < 0;
        // Pointing at (dot) or away from (ring) the viewer, the line shortens to nothing: it fades out as
        // the end mark fades in, gradually, so the key never jumps while the picture turns.
        const lineK = sstep(0.12, 0.42, Math.hypot(x, y));
        return (
          <g key={name} opacity={1 - 0.5 * sstep(0.05, 0.45, -z)}>
            {lineK > 0.01 && (
              <g opacity={lineK}>
                <line x1={cx} y1={cy} x2={tip[0]} y2={tip[1]} stroke={c} strokeWidth={2.2} strokeLinecap="round" />
                <circle cx={tip[0]} cy={tip[1]} r={2.4} fill={c} />
              </g>
            )}
            {lineK < 0.99 && <circle cx={cx} cy={cy} r={back ? 4.2 : 3.4} fill={back ? 'none' : c} stroke={c} strokeWidth={1.6} opacity={1 - lineK} />}
            <line x1={legendX} y1={14 + i * rows} x2={legendX + 9} y2={14 + i * rows} stroke={c} strokeWidth={2.2} strokeLinecap="round" />
            <text x={legendX + 15} y={14 + i * rows} dy="0.35em" fontSize={10.5} className="axes3d-name">
              {name}
            </text>
          </g>
        );
      })}
    </g>
  );
}

import {
  BackSide,
  BufferAttribute,
  BufferGeometry,
  Camera,
  Color,
  DepthTexture,
  FrontSide,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  LinearFilter,
  Mesh as TMesh,
  NearestFilter,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
  WebGLRenderTarget,
} from 'three';
import { perfCount } from '@/lib/perf';
import type { M4, V3 } from '@/lib/three-d/math';
import { createWaker } from '@/lib/three-d/waker';
import { createRenderCircuit, renderRatio, renderTiming } from '@/lib/three-d/render-policy';
import { sameGLFrame } from './frame-state';
import { geometryOf, updateGeometry } from './geometry';
import type { Mesh } from '@/lib/three-d/mesh';
import { STREAM_ROUTE_N, TISSUE_KIND, type Clip3, type Stream3, type Tissue3 } from '@/lib/three-d/scene';

/**
 * The WebGL layer of the 3D views (loaded only when a 3D view is on screen). It draws, behind the
 * scene SVG, the meshes the view computed, in an illustrative style: soft wrapped light, a warm
 * translucent rim (living tissue, not plastic), a fine texture per tissue, and a dark contour like a
 * textbook drawing. Highlight states mirror the 2D parts: dimmed, in focus (warm glow), pointed at.
 */

export type GLState = 'idle' | 'dim' | 'active' | 'focus' | 'spot' | 'shade' | 'ctx';

export interface GLItem {
  key: string;
  mesh: Mesh;
  matrix?: M4;
  color: string;
  deep?: string;
  tissue: Tissue3;
  opacity: number;
  outline: boolean;
  state: GLState;
  quiet: boolean;
  clip?: Clip3;
  /** The mesh drawn as copies moving along a route (see Stream3). */
  stream?: Stream3;
  /** 0–1: a thin wall (membrane, valve) that lets light through. */
  thin: number;
}

export interface GLFrame {
  view: M4;
  proj: M4;
  light: V3;
  items: GLItem[];
  /**
   * 0–1: ambient occlusion (crevices, contacts and the inner side of a bend darken, as in a photograph of a
   * specimen). Off (0) by default; the views of topic 15 on ask for it. Costs a half-size depth pass and two
   * small screen passes, only on the frames that are drawn at all.
   */
  ao?: number;
  /** World units the occlusion reaches (default 1). */
  aoRadius?: number;
}

export interface GLApi {
  frame(f: GLFrame): void;
  follow(el: SVGGElement | null): void;
  /** Set aside, drawing nothing, ready to be taken up by the next 3D view (shaders compiled, meshes kept). */
  park(): void;
  /** Taken up again: shown from its first frame on, when `onReady` is called. */
  wake(onReady: () => void): void;
  dispose(): void;
}

const VERT = /* glsl */ `
uniform float uOutline;
#ifdef STREAM
// Copies of the mesh carried along a route (blood cells): each copy's place is worked out here from its
// start and the phase, so a moving stream costs one number per frame and nothing is rebuilt.
uniform vec3 uRoute[ROUTE_N];
uniform float uPhase;
uniform float uGrow;
attribute vec4 aCell;   // start along the route (0-1), then a fixed offset from it
attribute float aGate;  // the uGrow at which this copy starts to appear
vec3 along(float u) {
  float x = u * float(ROUTE_N - 1);
  float i = min(floor(x), float(ROUTE_N - 2));
  int k = int(i);
  return mix(uRoute[k], uRoute[k + 1], x - i);
}
#endif
varying vec3 vN;
varying vec3 vV;
varying vec3 vObj;
varying vec2 vUv;
void main() {
#ifdef STREAM
  // Each copy grows in as uGrow passes its gate; not there yet, it is not drawn at all (nor its outline).
  float grow = clamp((uGrow - aGate) / 0.15, 0.0, 1.0);
  if (grow <= 0.0) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
  vec4 mv = modelViewMatrix * vec4(position * grow + along(fract(aCell.x + uPhase)) + aCell.yzw, 1.0);
#else
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
#endif
  vec3 n = normalize(normalMatrix * normal);
  // Outline pass: the back faces pushed out along the normal, by a width that stays the same on screen.
  if (uOutline > 0.0) mv.xyz += n * uOutline * (-mv.z);
  vN = n;
  vV = -mv.xyz;
  vObj = position;
  vUv = uv;
  gl_Position = projectionMatrix * mv;
}`;

const CLIP = /* glsl */ `
uniform float uClipOn;
uniform vec3 uClipO;
uniform vec3 uGrowDir;
uniform float uGrowCos;
uniform float uSpic;
uniform vec3 uHoleC[5];
uniform vec3 uHoleU[5];
uniform vec3 uHoleV[5];
uniform vec3 uHoleR[5];
uniform vec3 uKeepC;
uniform vec3 uKeepU;
uniform vec3 uKeepV;
uniform vec3 uKeepR;
uniform float uKeepOn;
bool inKite(vec3 q, vec3 c, vec3 u, vec3 v, vec3 r) {
  if (r.x < 1e-4 || r.z < 1e-4 || dot(q, c) < 0.3) return false;
  float a = dot(q, u);
  float b = abs(dot(q, v));
  return (a > 0.0 ? a / r.x : -a / max(1e-4, r.y)) + b / r.z < 1.0;
}
// 1 at the growing edge of a bone, 0 well inside it (for the spicules).
float clipFront;
void applyClip(vec3 p) {
  clipFront = 0.0;
  if (uClipOn < 0.5) return;
  vec3 q = normalize(p - uClipO);
  if (uGrowCos > -1.5) {
    float d = dot(q, uGrowDir);
    if (d < uGrowCos) discard;
    clipFront = 1.0 - smoothstep(0.0, 0.035, d - uGrowCos);
  }
  for (int i = 0; i < 5; i++) if (inKite(q, uHoleC[i], uHoleU[i], uHoleV[i], uHoleR[i])) discard;
  if (uKeepOn > 0.5 && !inKite(q, uKeepC, uKeepU, uKeepV, uKeepR)) discard;
}
`;

const FRAG = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uDeep;
uniform vec3 uLight;
uniform vec3 uGlow;
uniform float uGlowAmt;
uniform float uSat;
uniform float uBright;
uniform float uOpacity;
uniform float uKind;
uniform float uThin;
// The depth pre-pass of the ambient occlusion (1): the surface's normal only. Shared by every material.
uniform float uPass;
// The occlusion picture (half size, blurred), how strong it is in this frame, and whether this item takes it
// (see-through items are not in the depth pass: they would darken by what lies behind them).
uniform sampler2D tAO;
uniform float uAOOn;
uniform float uAOMine;
uniform vec2 uRes;
varying vec3 vN;
varying vec3 vV;
varying vec3 vObj;
varying vec2 vUv;

float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float noise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x), mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
             mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x), mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y), f.z);
}
// Detail finer than a pixel only shimmers as the picture turns: it fades to its mean value instead, and
// is not computed at all once gone (far or small surfaces cost less).
float px;  // object units per pixel here
float keep(float cyclesPerPx) { return 1.0 - smoothstep(0.35, 1.0, cyclesPerPx); }
// fbm of p * f, each octave faded by its own size on screen. Three octaves: a fourth would change the
// colour by under half a percent (tex is scaled by 0.16), less than one step of 8-bit colour, so only its
// mean is added.
float fbm(vec3 p, float f) {
  p *= f;
  float s = 0.0625 * 0.5;
  float a = 0.5;
  for (int i = 0; i < 3; i++) {
    float w = keep(f * px);
    s += a * (w < 0.004 ? 0.5 : mix(0.5, noise(p), w));
    p *= 2.03;
    f *= 2.03;
    a *= 0.5;
  }
  return s;
}

void main() {
  px = length(fwidth(vObj));
  applyClip(vObj);
  vec3 n = normalize(vN);
  if (!gl_FrontFacing) n = -n;
  if (uPass > 0.5) { gl_FragColor = vec4(n * 0.5 + 0.5, 1.0); return; }
  vec3 v = normalize(vV);
  vec3 l = normalize(uLight);
  float occ = uAOOn * uAOMine;
  float ao = occ > 0.0 ? mix(1.0, texture2D(tAO, gl_FragCoord.xy / uRes).r, occ) : 1.0;

  // Tissue texture: a fine variation of the colour, different for each kind of tissue.
  float tex = 0.0;
  float vessels = 0.0;
  if (uKind < 0.5) {                 // skin: soft mottling, and the fine vessels seen through thin embryonic skin
    tex = (fbm(vObj, 9.0) - 0.5) * 0.9;
    // The vessels are lines about a tenth of their noise's cell wide: they fade (to their sparse mean) by that width.
    float vk = keep(4.2 * 10.0 * px);
    if (vk > 0.004) {
      float r1 = 1.0 - abs(noise(vObj * 4.2 + fbm(vObj, 2.0) * 1.6) * 2.0 - 1.0);
      float r2 = 1.0 - abs(noise(vObj * 9.5 + 3.7) * 2.0 - 1.0);
      vessels = smoothstep(0.955, 0.992, r1) * 0.7 + smoothstep(0.97, 0.995, r2) * 0.3;
    }
    vessels = mix(0.02, vessels, vk);
  } else if (uKind < 1.5) {          // muscle: fibres running along the mass (24 per unit of u)
    float fk = keep(fwidth(vUv.x) * 24.0);
    // In bundles that come and go over the wall: one even ring after another reads as a rendering fault.
    float f = fk > 0.004 ? sin(vUv.x * 150.0 + fbm(vObj, 5.0) * 4.0) * fk * smoothstep(0.3, 0.75, noise(vObj * 6.0 + 1.7)) : 0.0;
    tex = f * 0.22 + (fbm(vObj, 12.0) - 0.5) * 0.5;
  } else if (uKind < 2.5) {          // mesenchyme: scattered cells
    float ck = keep(34.0 * px);
    float c = mix(0.12, ck > 0.004 ? smoothstep(0.62, 0.78, noise(vObj * 34.0)) : 0.0, ck);
    tex = c * 0.9 - 0.25 + (fbm(vObj, 6.0) - 0.5) * 0.4;
  } else if (uKind < 3.5) {          // cartilage: glassy, cells in lacunae
    float ck = keep(28.0 * px);
    float c = mix(0.05, ck > 0.004 ? smoothstep(0.7, 0.8, noise(vObj * 28.0)) : 0.0, ck);
    tex = c * 0.8 - 0.1;
  } else if (uKind < 4.5) {          // bone: fine porous grain
    tex = (fbm(vObj, 22.0) - 0.5) * 0.9;
  } else if (uKind < 5.5) {          // membrane: thin, almost even
    tex = (fbm(vObj, 5.0) - 0.5) * 0.35;
  } else if (uKind < 6.5) {          // tendon: bright fibres (35 per unit of u)
    tex = sin(vUv.x * 220.0) * 0.25 * keep(fwidth(vUv.x) * 35.0);
  } else {
    tex = (fbm(vObj, 8.0) - 0.5) * 0.5;
  }
  vec3 albedo = uColor * (1.0 + tex * 0.16);
  // Membrane bone still growing: spicules radiate from the centre, and the young edge is paler osteoid.
  if (uSpic > 0.0 && uGrowCos > -1.5) {
    vec3 q = normalize(vObj - uClipO);
    vec3 e1 = normalize(cross(uGrowDir, abs(uGrowDir.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0)));
    vec3 e2 = cross(uGrowDir, e1);
    float ang = atan(dot(q, e2), dot(q, e1));
    float rays = smoothstep(0.55, 0.95, sin(ang * 46.0 + fbm(q, 9.0) * 3.0) * 0.5 + 0.5);
    float reach = smoothstep(0.0, 0.25, 1.0 - dot(q, uGrowDir));
    albedo = mix(albedo, albedo * 0.72, rays * reach * uSpic * 0.7);
    albedo = mix(albedo, vec3(0.98, 0.93, 0.78), clipFront * uSpic * 0.6);
  }
  albedo = mix(albedo, albedo * vec3(0.8, 0.46, 0.5), vessels * 0.14);

  // Soft wrapped light: the shaded side keeps its colour (deep tint), never goes black.
  float nl = dot(n, l);
  float wrap = clamp((nl + 0.45) / 1.45, 0.0, 1.0);
  float band = smoothstep(0.0, 1.0, wrap);
  vec3 col = mix(uDeep, albedo, band);
  // Skin is translucent: light scattered inside warms the shaded side instead of greying it.
  if (uKind < 0.5) col += vec3(0.95, 0.38, 0.32) * 0.3 * band * (1.0 - band);
  // Sky/ground fill: the upper side a touch cooler and lighter.
  col += albedo * 0.10 * (n.y * 0.5 + 0.5);
  // Ambient occlusion: light reaches a fold, a contact or a hollow less (towards the deep tint, never black).
  col = mix(uDeep * 0.55, col, ao);
  // Living tissue lets light through at its edges: a warm translucent rim.
  float fres = pow(1.0 - max(dot(n, v), 0.0), 2.4);
  col += mix(albedo, vec3(1.0, 0.92, 0.86), 0.35) * fres * 0.32 * mix(0.35, 1.0, ao);
  // A moist sheen.
  vec3 h = normalize(l + v);
  float sheen = uKind > 2.5 && uKind < 4.5 ? 0.10 : 0.16;
  col += vec3(1.0) * pow(max(dot(n, h), 0.0), 36.0) * sheen;
  // A thin wall (membrane, valve) lets light through: its side turned from the light glows warm, more so
  // with the light behind it. Thick muscular walls beside it stay solid: the contrast that teaches which is which.
  if (uThin > 0.0) {
    float through = pow(0.5 - 0.5 * dot(n, l), 3.0) * (0.55 + 0.45 * pow(max(dot(l, -v), 0.0), 4.0));
    col += mix(albedo, vec3(1.0, 0.78, 0.62), 0.45) * through * uThin * 0.45;
  }

  // Highlight state (the same meanings as the 2D parts).
  float g = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(vec3(g), col, uSat) * uBright;
  col += uGlow * (fres * 0.9 + 0.12) * uGlowAmt;
  gl_FragColor = vec4(col, uOpacity);
}`;

const OUT_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
varying vec3 vObj;
void main() { applyClip(vObj); gl_FragColor = vec4(uColor, uOpacity); }`;

const FULL_VERT = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

/**
 * Ambient occlusion from the depth pre-pass (scalable ambient obscurance): samples on a spiral round each
 * pixel, within a fixed reach in the world, count how much surface rises above its tangent plane. Rotated
 * on a 4×4 pattern that the blur averages out exactly (no noise left, no temporal flicker).
 */
const AO_FRAG = /* glsl */ `
uniform sampler2D tDepth;
uniform sampler2D tNormal;
uniform mat4 uProj;
uniform mat4 uProjInv;
uniform float uRadius;
varying vec2 vUv;
const int N = 12;
vec3 viewAt(vec2 uv, float d) {
  vec4 p = uProjInv * vec4(uv * 2.0 - 1.0, d * 2.0 - 1.0, 1.0);
  return p.xyz / p.w;
}
void main() {
  float d = texture2D(tDepth, vUv).x;
  if (d >= 0.99999) { gl_FragColor = vec4(1.0); return; }
  vec3 P = viewAt(vUv, d);
  vec3 Nn = normalize(texture2D(tNormal, vUv).xyz * 2.0 - 1.0);
  // The reach on screen (uv units) at this depth.
  vec2 r = vec2(uProj[0][0], uProj[1][1]) * uRadius * 0.5 / max(1e-3, -P.z);
  float cell = mod(floor(gl_FragCoord.x), 4.0) * 4.0 + mod(floor(gl_FragCoord.y), 4.0);
  float a0 = cell * 0.39269908 + 0.3;
  float r2 = uRadius * uRadius;
  float sum = 0.0;
  for (int i = 0; i < N; i++) {
    float t = (float(i) + 0.5) / float(N);
    float a = a0 + t * 7.0 * 6.2831853;
    vec2 uv = vUv + vec2(cos(a), sin(a)) * r * t;
    float dq = texture2D(tDepth, uv).x;
    if (dq >= 0.99999) continue;
    vec3 v = viewAt(uv, dq) - P;
    float vv = dot(v, v);
    float f = max(r2 - vv, 0.0) / r2;
    sum += f * f * f * max((dot(v, Nn) - 0.02 * uRadius) / sqrt(vv + 1e-4 * r2), 0.0);
  }
  float ao = clamp(1.0 - sum * 5.0 / float(N), 0.0, 1.0);
  gl_FragColor = vec4(vec3(ao), 1.0);
}`;

/** 4×4 blur that keeps to one surface (a sample much farther or nearer counts less). */
const BLUR_FRAG = /* glsl */ `
uniform sampler2D tAOIn;
uniform sampler2D tDepth;
uniform vec2 uTexel;
uniform mat4 uProjInv;
varying vec2 vUv;
float viewZ(vec2 uv) {
  float d = texture2D(tDepth, uv).x;
  vec4 p = uProjInv * vec4(uv * 2.0 - 1.0, d * 2.0 - 1.0, 1.0);
  return p.z / p.w;
}
void main() {
  float z0 = viewZ(vUv);
  float s = 0.0;
  float w = 0.0;
  for (int x = -2; x < 2; x++)
    for (int y = -2; y < 2; y++) {
      vec2 uv = vUv + (vec2(float(x), float(y)) + 0.5) * uTexel;
      float k = 1.0 / (1.0 + abs(viewZ(uv) - z0) * 40.0 / max(1e-3, -z0));
      s += texture2D(tAOIn, uv).r * k;
      w += k;
    }
  gl_FragColor = vec4(vec3(s / max(w, 1e-4)), 1.0);
}`;

/** Whether the occlusion may run at all (a viewer can turn it off: localStorage 'enbrioatlas:3d-ao' = '0'). */
const aoAllowed = () => {
  try { return typeof window === 'undefined' || window.localStorage.getItem('enbrioatlas:3d-ao') !== '0'; } catch { return true; }
};

const TARGET: Record<GLState, { sat: number; bright: number; glow: [number, number, number]; amt: number }> = {
  idle: { sat: 1, bright: 1, glow: [1, 0.72, 0.42], amt: 0 },
  dim: { sat: 0.35, bright: 0.5, glow: [1, 1, 1], amt: 0 },
  active: { sat: 1.05, bright: 1.1, glow: [1, 1, 1], amt: 0.55 },
  focus: { sat: 1.05, bright: 1.06, glow: [1, 0.72, 0.42], amt: 0.5 },
  spot: { sat: 1.2, bright: 1.16, glow: [1, 0.8, 0.55], amt: 0.75 },
  shade: { sat: 0.25, bright: 0.42, glow: [1, 1, 1], amt: 0 },
  ctx: { sat: 0.72, bright: 0.78, glow: [1, 1, 1], amt: 0 },
};

interface Slot {
  mesh: Mesh;
  /** A stream's constant per-copy data (its geometry is built with it) and the route last copied in. */
  cells?: Float32Array;
  gates?: Float32Array;
  route?: Float32Array;
  geo: BufferGeometry;
  body: TMesh;
  edge: TMesh;
  mat: ShaderMaterial;
  edgeMat: ShaderMaterial;
  cur: { sat: number; bright: number; amt: number; op: number };
  goal: GLItem;
  seen: number;
}

/** A stream's uniforms: one set, shared by reference between its body and its outline. */
const streamUniforms = () => ({
  uRoute: { value: Array.from({ length: STREAM_ROUTE_N }, () => new Vector3()) },
  uPhase: { value: 0 },
  uGrow: { value: 1 },
});
type StreamUniforms = ReturnType<typeof streamUniforms>;
const STREAM_DEFINES = { STREAM: '', ROUTE_N: STREAM_ROUTE_N };

function clipUniforms() {
  return {
    uClipOn: { value: 0 },
    uClipO: { value: new Vector3() },
    uGrowDir: { value: new Vector3(0, 1, 0) },
    uGrowCos: { value: -2 },
    uSpic: { value: 0 },
    uHoleC: { value: Array.from({ length: 5 }, () => new Vector3()) },
    uHoleU: { value: Array.from({ length: 5 }, () => new Vector3()) },
    uHoleV: { value: Array.from({ length: 5 }, () => new Vector3()) },
    uHoleR: { value: Array.from({ length: 5 }, () => new Vector3()) },
    uKeepC: { value: new Vector3() },
    uKeepU: { value: new Vector3() },
    uKeepV: { value: new Vector3() },
    uKeepR: { value: new Vector3() },
    uKeepOn: { value: 0 },
  };
}

function setClip(u: Record<string, { value: any }>, c: Clip3 | undefined) {
  u.uClipOn.value = c ? 1 : 0;
  if (!c) return;
  u.uClipO.value.set(...c.o);
  u.uGrowCos.value = c.grow ? c.grow.cos : -2;
  if (c.grow) u.uGrowDir.value.set(...c.grow.dir);
  u.uSpic.value = c.grow?.spicules ?? 0;
  for (let i = 0; i < 5; i++) {
    const h = c.holes?.[i];
    u.uHoleR.value[i].set(h ? h.front : 0, h ? h.back : 0, h ? h.side : 0);
    if (h) {
      u.uHoleC.value[i].set(...h.c);
      u.uHoleU.value[i].set(...h.u);
      u.uHoleV.value[i].set(...h.v);
    }
  }
  u.uKeepOn.value = c.keep ? 1 : 0;
  if (c.keep) {
    u.uKeepC.value.set(...c.keep.c);
    u.uKeepU.value.set(...c.keep.u);
    u.uKeepV.value.set(...c.keep.v);
    u.uKeepR.value.set(c.keep.front, c.keep.back, c.keep.side);
  }
}

const DEEP_TINT = new Color('#2a1420');
/** The shaded side's colour for a colour that has no `deep` of its own (written into `out`). */
const deepInto = (out: Color, c: string) => out.set(c).multiplyScalar(0.42).lerp(DEEP_TINT, 0.25);

/** Uniform objects every body material shares by reference: set once per frame, not copied per item. */
const sharedUniforms = () => ({
  uLight: { value: new Vector3() },
  uPass: { value: 0 },
  tAO: { value: null as unknown },
  uAOOn: { value: 0 },
  uRes: { value: new Vector2(1, 1) },
});
type SharedUniforms = ReturnType<typeof sharedUniforms>;

const bodyMaterial = (shared: SharedUniforms, stream?: StreamUniforms) =>
  new ShaderMaterial({
    defines: stream ? STREAM_DEFINES : {},
    vertexShader: VERT,
    fragmentShader: CLIP + FRAG,
    uniforms: {
      uOutline: { value: 0 },
      uColor: { value: new Color() },
      uDeep: { value: new Color() },
      // The light, the depth pass's switch and the occlusion: objects shared by every material of the layer.
      ...shared,
      uAOMine: { value: 1 },
      uGlow: { value: new Color() },
      uGlowAmt: { value: 0 },
      uSat: { value: 1 },
      uBright: { value: 1 },
      uOpacity: { value: 1 },
      uKind: { value: 0 },
      uThin: { value: 0 },
      ...clipUniforms(),
      ...stream,
    },
    side: FrontSide,
  });

const edgeMaterial = (stream?: StreamUniforms) =>
  new ShaderMaterial({
    defines: stream ? STREAM_DEFINES : {},
    vertexShader: VERT,
    fragmentShader: CLIP + OUT_FRAG,
    uniforms: { uOutline: { value: 0.003 }, uColor: { value: new Color('#2a1317') }, uOpacity: { value: 0.75 }, ...clipUniforms(), ...stream },
    side: BackSide,
  });

/**
 * Once a WebGL context has been lost (the GPU driver reset, or the browser took it back), the 3D views
 * draw their flat picture for the rest of this tab's session, including reloads.
 */
const failureStore = () => {
  try { return typeof window === 'undefined' ? null : window.sessionStorage; } catch { return null; }
};
const circuit = createRenderCircuit(failureStore());
export const glWasLost = () => circuit.blocked;
/** Called once if the GPU is lost; returns the unsubscribe. */
export function onGLLost(cb: () => void) {
  return circuit.subscribe(cb);
}

export function createGL(host: HTMLDivElement, ready: () => void): GLApi | null {
  // A tab opened in the background still gets its layer: it sleeps until shown (`updateActivity`).
  // Refusing here would leave that view on the flat picture for good.
  if (circuit.blocked) return null;
  let onReady = ready;
  let hideTimer = 0;
  // Woken from the pool: the first frame drawn for the new view shows the canvas again.
  let waking = false;
  const canvas = document.createElement('canvas');
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, premultipliedAlpha: true, powerPreference: 'default', failIfMajorPerformanceCaveat: true });
  } catch {
    circuit.trip();
    return null;
  }
  const maxDimension = Math.min(renderer.capabilities.maxTextureSize, renderer.getContext().getParameter(renderer.getContext().MAX_RENDERBUFFER_SIZE));
  const ratioFor = (w: number, h: number) => renderRatio(w, h, window.devicePixelRatio || 1, maxDimension);
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.setClearColor(0x000000, 0);
  host.appendChild(canvas);
  let lost = false;
  let disposed = false;
  let parked = false;
  let intersecting = true;
  let active = false;
  const onLost = () => {
    if (lost) return;
    lost = true;
    canvas.style.visibility = 'hidden';
    waker.stop();
    circuit.trip();
  };
  canvas.addEventListener('webglcontextlost', onLost);
  const scene = new Scene();
  const camera = new Camera();
  camera.matrixAutoUpdate = false;
  camera.matrixWorldAutoUpdate = false;
  const slots = new Map<string, Slot>();
  let frame: GLFrame | null = null;
  let applied: GLFrame | null = null;
  let pending = false;
  let sceneEl: SVGGElement | null = null;
  let dirty = true;
  let lastCtm = '';
  let size = { w: 0, h: 0 };
  let shown = false;
  let tick = 0;
  let lastT = performance.now();

  const resize = () => {
    if (disposed || lost || parked || document.hidden) return;
    const r = host.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
    const ratio = ratioFor(w, h);
    if (size.w === w && size.h === h && renderer.getPixelRatio() === ratio) return;
    size = { w, h };
    // setPixelRatio resizes the OLD logical dimensions first, potentially allocating a huge
    // intermediate buffer. Shrink first, then set size + ratio together, even on aspect changes.
    renderer.setDrawingBufferSize(1, 1, 1);
    renderer.setDrawingBufferSize(w, h, ratio);
    dirty = true;
    kick();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(host);

  const sharedU = sharedUniforms();
  const lightV = sharedU.uLight.value;
  // Scratch for the screen projection (no allocation per frame).
  const screenM = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  const projOut = new Float32Array(16);

  // The shader programs are compiled before the first picture, without blocking the page where the
  // browser can compile in parallel (until then the SVG draws the flat picture): linking them in the
  // first render froze the page for a moment every time a 3D view opened.
  let compiled = false;
  // Kept until the layer goes: a program lives while some material uses it.
  const warmSt = streamUniforms();
  const warmMats = [bodyMaterial(sharedU), edgeMaterial(), bodyMaterial(sharedU), edgeMaterial()];
  // The occlusion's screen passes (compiled with the rest, so its first frame does not stall either).
  const fsGeo = new PlaneGeometry(2, 2);
  const aoMat = new ShaderMaterial({
    vertexShader: FULL_VERT,
    fragmentShader: AO_FRAG,
    uniforms: { tDepth: { value: null }, tNormal: { value: null }, uProj: { value: camera.projectionMatrix }, uProjInv: { value: camera.projectionMatrixInverse }, uRadius: { value: 1 } },
    depthTest: false,
    depthWrite: false,
  });
  const blurMat = new ShaderMaterial({
    vertexShader: FULL_VERT,
    fragmentShader: BLUR_FRAG,
    uniforms: { tAOIn: { value: null }, tDepth: { value: null }, uTexel: { value: new Vector2(1, 1) }, uProjInv: { value: camera.projectionMatrixInverse } },
    depthTest: false,
    depthWrite: false,
  });
  const fsQuad = new TMesh(fsGeo, aoMat);
  fsQuad.frustumCulled = false;
  const fsScene = new Scene();
  fsScene.add(fsQuad);
  const aoOk = aoAllowed();
  let aoT: { n: WebGLRenderTarget; a: WebGLRenderTarget; b: WebGLRenderTarget } | null = null;
  const dropAO = () => {
    if (!aoT) return;
    aoT.n.depthTexture?.dispose();
    aoT.n.dispose();
    aoT.a.dispose();
    aoT.b.dispose();
    aoT = null;
    sharedU.tAO.value = null;
  };
  /** The occlusion of the current picture into `sharedU.tAO`: depth pre-pass (opaque bodies only), occlusion, blur. */
  function occlusion(radius: number) {
    const bw = canvas.width, bh = canvas.height;
    const w = Math.max(1, bw >> 1), h = Math.max(1, bh >> 1);
    if (!aoT) {
      const n = new WebGLRenderTarget(w, h, { depthBuffer: true, minFilter: NearestFilter, magFilter: NearestFilter });
      n.depthTexture = new DepthTexture(w, h);
      aoT = { n, a: new WebGLRenderTarget(w, h, { depthBuffer: false, minFilter: NearestFilter, magFilter: NearestFilter }), b: new WebGLRenderTarget(w, h, { depthBuffer: false, minFilter: LinearFilter, magFilter: LinearFilter }) };
    } else if (aoT.n.width !== w || aoT.n.height !== h) {
      aoT.n.setSize(w, h);
      aoT.a.setSize(w, h);
      aoT.b.setSize(w, h);
    }
    const was: [TMesh, boolean][] = [];
    for (const s of slots.values()) {
      was.push([s.edge, s.edge.visible], [s.body, s.body.visible]);
      s.edge.visible = false;
      if (s.mat.transparent) s.body.visible = false;
    }
    sharedU.uPass.value = 1;
    renderer.setRenderTarget(aoT.n);
    renderer.render(scene, camera);
    sharedU.uPass.value = 0;
    for (const [m, v] of was) m.visible = v;
    aoMat.uniforms.tDepth.value = aoT.n.depthTexture;
    aoMat.uniforms.tNormal.value = aoT.n.texture;
    aoMat.uniforms.uRadius.value = radius;
    fsQuad.material = aoMat;
    renderer.setRenderTarget(aoT.a);
    renderer.render(fsScene, camera);
    blurMat.uniforms.tAOIn.value = aoT.a.texture;
    blurMat.uniforms.tDepth.value = aoT.n.depthTexture;
    (blurMat.uniforms.uTexel.value as Vector2).set(1 / w, 1 / h);
    fsQuad.material = blurMat;
    renderer.setRenderTarget(aoT.b);
    renderer.render(fsScene, camera);
    renderer.setRenderTarget(null);
    sharedU.tAO.value = aoT.b.texture;
    sharedU.uRes.value.set(bw, bh);
    perfCount('glAO');
  }
  // The streams' programs too (blood cells), so the first cells do not stall the page either.
  const warmStreamMats = [bodyMaterial(sharedU, warmSt), edgeMaterial(warmSt)];
  const warmTri = new BufferGeometry();
  const warmTris = new InstancedBufferGeometry();
  {
    const warm = new Scene();
    for (const tri of [warmTri, warmTris]) {
      tri.setAttribute('position', new BufferAttribute(new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]), 3));
      tri.setAttribute('normal', new BufferAttribute(new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]), 3));
      tri.setAttribute('uv', new BufferAttribute(new Float32Array([0, 0, 1, 0, 0, 1]), 2));
    }
    warmTris.setAttribute('aCell', new InstancedBufferAttribute(new Float32Array(4), 4));
    warmTris.setAttribute('aGate', new InstancedBufferAttribute(new Float32Array(1), 1));
    warmTris.instanceCount = 1;
    const mats = warmMats;
    mats.slice(2).forEach((m) => {
      m.transparent = true;
      m.depthWrite = false;
    });
    mats.forEach((m) => warm.add(new TMesh(warmTri, m)));
    for (const m of [aoMat, blurMat]) {
      const q = new TMesh(fsGeo, m);
      q.frustumCulled = false;
      warm.add(q);
    }
    warmStreamMats.forEach((m) => warm.add(new TMesh(warmTris, m)));
    const done = () => {
      if (disposed || lost) return;
      compiled = true;
      dirty = true;
      kick();
    };
    renderer.compileAsync(warm, camera).then(done, () => {
      if (!disposed) circuit.trip();
    });
  }

  function sync(f: GLFrame) {
    tick++;
    for (const it of f.items) {
      let s = slots.get(it.key);
      // A stream's geometry carries its copies: another set of copies (or none) needs a new slot.
      if (s && (s.cells !== it.stream?.cells || s.gates !== it.stream?.gates || s.mesh.uv.length !== it.mesh.uv.length)) {
        drop(it.key, s);
        s = undefined;
      }
      if (s && s.mesh !== it.mesh) {
        perfCount('glUpload');
        if (s.mesh.pos.length === it.mesh.pos.length && s.mesh.idx.length === it.mesh.idx.length) {
          // Geometry owns references, not copies into the old mesh-cache entry. Also update UVs
          // and indices: equal counts do not imply identical topology. Frustum bounds are unused.
          updateGeometry(s.geo, it.mesh);
        } else {
          s.geo.dispose();
          s.geo = geometryOf(it.mesh, it.stream);
          s.body.geometry = s.geo;
          s.edge.geometry = s.geo;
        }
        s.mesh = it.mesh;
      }
      if (!s) {
        perfCount('glUpload');
        const geo = geometryOf(it.mesh, it.stream);
        const su = it.stream && streamUniforms();
        const mat = bodyMaterial(sharedU, su);
        const edgeMat = edgeMaterial(su);
        const body = new TMesh(geo, mat);
        const edge = new TMesh(geo, edgeMat);
        for (const m of [body, edge]) {
          m.matrixAutoUpdate = false;
          m.matrixWorldAutoUpdate = false;
          m.frustumCulled = false;
          scene.add(m);
        }
        const t = TARGET[it.state];
        s = { mesh: it.mesh, cells: it.stream?.cells, gates: it.stream?.gates, geo, body, edge, mat, edgeMat, cur: { sat: t.sat, bright: t.bright, amt: t.amt, op: it.opacity }, goal: it, seen: tick };
        slots.set(it.key, s);
      }
      s.goal = it;
      s.seen = tick;
      for (const m of [s.body, s.edge]) {
        if (it.matrix) m.matrix.fromArray(it.matrix);
        else m.matrix.identity();
        m.matrixWorld.copy(m.matrix);
      }
      const u = s.mat.uniforms;
      (u.uColor.value as Color).set(it.color);
      if (it.deep) (u.uDeep.value as Color).set(it.deep);
      else deepInto(u.uDeep.value as Color, it.color);
      u.uKind.value = TISSUE_KIND[it.tissue];
      u.uThin.value = it.thin;
      setClip(u, it.clip);
      setClip(s.edgeMat.uniforms, it.clip);
      const st = it.stream;
      if (st) {
        // The route is copied in only when its shape changed; the phase is the one number that moves.
        if (s.route !== st.route) {
          s.route = st.route;
          (u.uRoute.value as Vector3[]).forEach((v, i) => v.fromArray(st.route, i * 3));
        }
        u.uPhase.value = st.phase - Math.floor(st.phase);
        u.uGrow.value = st.grow;
      }
    }
    // Items no longer drawn: removed.
    for (const [k, s] of slots) if (s.seen !== tick) drop(k, s);
  }

  function drop(key: string, s: Slot) {
    scene.remove(s.body, s.edge);
    s.geo.dispose();
    s.mat.dispose();
    s.edgeMat.dispose();
    slots.delete(key);
  }

  /** Screen transform of the scene group, relative to the host: the frame's place on screen right now. */
  function ctmNow() {
    if (!sceneEl) return null;
    const m = sceneEl.getScreenCTM();
    if (!m) return null;
    const r = host.getBoundingClientRect();
    return { a: m.a, b: m.b, c: m.c, d: m.d, e: m.e - r.left, f: m.f - r.top };
  }

  /** How visible the followed group is (its own and its ancestors' opacity, up to the svg). */
  let seenNow = 1;
  function seen() {
    let o = 1;
    for (let e: Element | null = sceneEl; e && !(e instanceof SVGSVGElement); e = e.parentElement) {
      const a = e.getAttribute('opacity');
      if (a !== null) o *= Number(a);
      const cs = getComputedStyle(e);
      if (cs.display === 'none' || cs.visibility === 'hidden') return 0;
      o *= Number(cs.opacity);
    }
    return Math.max(0, Math.min(1, o));
  }

  function draw(dt: number) {
    // The followed drawing just left the page (its view is being replaced): keep the last picture.
    if (disposed || lost || !active || !frame || !compiled || (sceneEl && !sceneEl.isConnected)) return false;
    if (pending) {
      lightV.set(frame.light[0], frame.light[1], frame.light[2]).normalize();
      sync(frame);
      applied = frame;
      pending = false;
      dirty = true;
    }
    // The picture fades with its drawing (a view fading in, a camera move between views).
    const o = seen();
    let faded = false;
    if (Math.abs(o - seenNow) > 0.004 || (o !== seenNow && (o === 0 || o === 1))) {
      faded = true;
      seenNow = o;
      canvas.style.opacity = o >= 0.999 ? '' : o.toFixed(3);
      // Frame by frame with the drawing: the canvas's own fade-in would lag behind it.
      canvas.style.transition = o >= 0.999 ? '' : 'none';
    }
    if (o <= 0.001) return faded;
    const m = ctmNow();
    if (!m || !size.w) return faded;
    const key = `${m.a.toFixed(4)},${m.d.toFixed(4)},${m.e.toFixed(2)},${m.f.toFixed(2)},${size.w},${size.h}`;
    // Highlight states glide like the CSS transitions of the 2D parts (≈0.22 s).
    const k = 1 - Math.exp(-dt / 70);
    let moving = false;
    for (const s of slots.values()) {
      const t = TARGET[s.goal.state];
      const quietGlow = s.goal.quiet ? 0.35 : 1;
      const c = s.cur;
      const next = { sat: c.sat + (t.sat - c.sat) * k, bright: c.bright + (t.bright - c.bright) * k, amt: c.amt + (t.amt * quietGlow - c.amt) * k, op: c.op + (s.goal.opacity - c.op) * Math.min(1, k * 2) };
      if (Math.abs(next.sat - t.sat) + Math.abs(next.bright - t.bright) + Math.abs(next.amt - t.amt * quietGlow) + Math.abs(next.op - s.goal.opacity) > 0.004) moving = true;
      else Object.assign(next, { sat: t.sat, bright: t.bright, amt: t.amt * quietGlow, op: s.goal.opacity });
      s.cur = next;
      const u = s.mat.uniforms;
      u.uSat.value = next.sat;
      u.uBright.value = next.bright;
      u.uGlowAmt.value = next.amt;
      (u.uGlow.value as Color).setRGB(...t.glow);
      u.uOpacity.value = next.op;
      const see = next.op < 0.995;
      s.mat.transparent = see;
      s.mat.depthWrite = !see;
      u.uAOMine.value = see ? 0 : 1;
      s.edgeMat.uniforms.uOpacity.value = 0.75 * next.op;
      s.edgeMat.transparent = see;
      s.edge.visible = s.goal.outline && next.op > 0.05;
      s.body.visible = next.op > 0.01;
    }
    if (!dirty && !moving && key === lastCtm) return faded;
    lastCtm = key;
    dirty = false;
    // Frame coordinates → this canvas: the projection is followed by the same 2D transform the SVG
    // applies to the scene group (fit, zoom, pan), so the 3D picture and the names stay together.
    const P = frame.proj;
    const W = size.w;
    const H = size.h;
    const sx = (2 / W) * m.a * 500;
    const sy = (2 / H) * m.d * 320;
    const tx = (2 / W) * (500 * m.a + 320 * m.c + m.e) - 1;
    const ty = 1 - (2 / H) * (500 * m.b + 320 * m.d + m.f);
    // Rows of the screen matrix S (column-major multiply S × P).
    const S = screenM;
    S[0] = sx;
    S[5] = sy;
    S[12] = tx;
    S[13] = ty;
    const out = projOut;
    for (let c = 0; c < 4; c++)
      for (let r = 0; r < 4; r++) {
        let s = 0;
        for (let q = 0; q < 4; q++) s += S[q * 4 + r] * P[c * 4 + q];
        out[c * 4 + r] = s;
      }
    camera.projectionMatrix.fromArray(out);
    camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
    camera.matrixWorldInverse.fromArray(frame.view);
    camera.matrixWorld.copy(camera.matrixWorldInverse).invert();
    const aoK = aoOk ? Math.max(0, Math.min(1, frame.ao ?? 0)) : 0;
    sharedU.uAOOn.value = 0;
    if (aoK > 0) {
      occlusion(frame.aoRadius ?? 1);
      sharedU.uAOOn.value = aoK;
    }
    renderer.render(scene, camera);
    perfCount('glRender');
    // The performance harness times the GPU on the picture last drawn (only when it turned the counters on).
    if ((globalThis as { __perf?: object }).__perf) {
      (globalThis as { __glBench?: typeof bench }).__glBench = bench;
      // And what that picture costs: draw calls, triangles, the drawing buffer's size, what the GPU holds.
      // And how much of the picture the subject takes (the quality harness): the share of the drawing buffer
      // the named, non-context items cover, and the box round them (shares of the width and height).
      (globalThis as { __glCoverage?: () => object | null }).__glCoverage = () => coverage();
      (globalThis as { __glInfo?: () => object }).__glInfo = () => ({
        calls: renderer.info.render.calls,
        triangles: renderer.info.render.triangles,
        w: canvas.width,
        h: canvas.height,
        geometries: renderer.info.memory.geometries,
        programs: renderer.info.programs?.length ?? 0,
      });
    }
    if (!shown) {
      shown = true;
      canvas.classList.add('is-ready');
      onReady();
    }
    if (waking) {
      waking = false;
      canvas.style.visibility = '';
      onReady();
    }
    return true;
  }

  /** For the quality harness: what the subject covers (context and ground hidden for one draw). Never called by the app. */
  function coverage() {
    if (disposed || lost || !frame || !shown) return null;
    const hidden: TMesh[] = [];
    for (const sl of slots.values())
      if (sl.goal.quiet || sl.goal.opacity < 0.3)
        for (const m of [sl.body, sl.edge])
          if (m.visible) {
            m.visible = false;
            hidden.push(m);
          }
    sharedU.uAOOn.value = 0;
    renderer.render(scene, camera);
    const gl = renderer.getContext();
    const w = gl.drawingBufferWidth, h = gl.drawingBufferHeight;
    const px = new Uint8Array(w * h * 4);
    gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, px);
    let n = 0, x0 = w, x1 = 0, y0 = h, y1 = 0;
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++)
        if (px[(y * w + x) * 4 + 3] > 80) {
          n++;
          if (x < x0) x0 = x;
          if (x > x1) x1 = x;
          if (y < y0) y0 = y;
          if (y > y1) y1 = y;
        }
    for (const m of hidden) m.visible = true;
    dirty = true;
    kick();
    // In the scene's 1000×640 frame (the canvas spans the whole viewport, wider than the frame).
    const m = ctmNow();
    if (!m || !n) return { cover: 0, box: null };
    const r = w / size.w;
    const fx = (q: number) => (q / r - m.e) / m.a;
    const fy = (q: number) => ((h - q) / r - m.f) / m.d;
    const box = [fx(x0), fy(y1), fx(x1) - fx(x0), fy(y0) - fy(y1)];
    return { cover: n / (r * r) / (1000 * m.a * 640 * m.d), box: [box[0] / 1000, box[1] / 640, box[2] / 1000, box[3] / 640] };
  }

  /**
   * For the harness: draws the current picture `n` times and waits for the GPU to finish (a one-pixel
   * read makes it), giving the time per picture. Never called by the app.
   */
  function bench(n = 30) {
    if (disposed || lost || !frame || !shown) return null;
    const gl = renderer.getContext();
    const px = new Uint8Array(4);
    renderer.render(scene, camera);
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
    const t0 = performance.now();
    for (let i = 0; i < n; i++) renderer.render(scene, camera);
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
    return (performance.now() - t0) / n;
  }

  // Frames are drawn only while something can change on screen: a new frame from the scene, a highlight
  // still gliding, the drawing it follows moving or fading. Then the loop stops; a still picture costs
  // nothing. Whatever can change it wakes the loop again (`kick`).
  const timing = renderTiming();
  const waker = createWaker((now) => {
    perfCount('glTick');
    const dt = Math.min(100, now - lastT);
    lastT = now;
    return draw(dt);
  }, { minFrameMs: timing.frameMs, preserveCadence: timing.preserveCadence });
  const kick = () => {
    // Back from sleep: the highlight glides go on from now, not from when the loop stopped.
    if (!waker.awake) lastT = performance.now();
    waker.kick();
  };
  const updateActivity = () => {
    const next = !disposed && !lost && !parked && !document.hidden && intersecting && !!sceneEl?.isConnected;
    if (next === active) return;
    active = next;
    waker.setEnabled(active);
    if (active) { resize(); dirty = true; kick(); }
  };
  waker.setEnabled(false);
  const onVisibility = () => updateActivity();
  document.addEventListener('visibilitychange', onVisibility);
  const io = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(([entry]) => {
    intersecting = entry.isIntersecting;
    updateActivity();
  });
  io?.observe(host);
  // The drawing's place and opacity can change without a new frame: a camera move between views or a
  // zoom sets transforms and opacities straight on the SVG; CSS transitions fade it; the page reflows.
  // Only changes to the followed drawing or to what holds it count: the rest of the frame (Kimu's
  // breathing, a label's pulse) animates on its own without waking the 3D layer.
  const watched = host.parentElement ?? host;
  const holds = (t: EventTarget | null) => !sceneEl || (t instanceof Node && t.contains(sceneEl));
  const mo = new MutationObserver((records) => {
    if (records.some((r) => r.target !== canvas && holds(r.target))) kick();
  });
  mo.observe(watched, { attributes: true, subtree: true, attributeFilter: ['transform', 'style', 'opacity', 'class', 'viewBox', 'width', 'height', 'x', 'y'] });
  const CSS_EVENTS = ['transitionrun', 'transitionstart', 'animationstart', 'animationiteration'] as const;
  const onCss = (e: Event) => holds(e.target) && kick();
  CSS_EVENTS.forEach((e) => watched.addEventListener(e, onCss, true));
  window.addEventListener('resize', kick);
  const svgRo = new ResizeObserver(kick);
  kick();

  return {
    frame(f) {
      if (disposed || lost) return;
      frame = f;
      pending = !sameGLFrame(applied, f);
      if (pending) kick();
    },
    follow(el) {
      sceneEl = el;
      svgRo.disconnect();
      if (el?.ownerSVGElement) svgRo.observe(el.ownerSVGElement);
      dirty = true;
      updateActivity();
      kick();
    },
    park() {
      frame = null;
      applied = null;
      pending = false;
      sceneEl = null;
      waking = false;
      parked = true;
      updateActivity();
      // The last picture stays a moment: handed straight to the next view (a camera move ending, the
      // same view drawn again), there is no blank frame; otherwise it goes.
      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => {
        if (disposed || !parked) return;
        canvas.style.visibility = 'hidden';
        for (const [key, slot] of slots) drop(key, slot);
        dropAO();
        renderer.renderLists.dispose();
        renderer.setDrawingBufferSize(1, 1, 1);
        size = { w: 0, h: 0 };
      }, 180);
    },
    wake(cb) {
      window.clearTimeout(hideTimer);
      onReady = cb;
      parked = false;
      waking = true;
      dirty = true;
      resize();
      updateActivity();
      kick();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      waker.stop();
      window.clearTimeout(hideTimer);
      io?.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('webglcontextlost', onLost);
      ro.disconnect();
      svgRo.disconnect();
      mo.disconnect();
      CSS_EVENTS.forEach((e) => watched.removeEventListener(e, onCss, true));
      window.removeEventListener('resize', kick);
      for (const s of slots.values()) {
        s.geo.dispose();
        s.mat.dispose();
        s.edgeMat.dispose();
      }
      slots.clear();
      [...warmMats, ...warmStreamMats, aoMat, blurMat].forEach((m) => m.dispose());
      dropAO();
      fsGeo.dispose();
      warmTri.dispose();
      warmTris.dispose();
      renderer.dispose();
      if (!lost) renderer.forceContextLoss();
      canvas.remove();
    },
  };
}

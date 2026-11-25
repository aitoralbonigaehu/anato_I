import { add, cross, dot, len, mix3, mul, norm, perp, sub, type V3 } from '@/lib/three-d/math';
import type { Mesh } from '@/lib/three-d/mesh';
import { contourLoops } from '@/lib/three-d/profile';
import type { Clip3 } from '@/lib/three-d/scene';
import { formingMandible, meckelAxis, meckelCartilage, type BonesPose } from './bones-model';

// Anterior and posterior stations on the same side of the jaw. Increasing axis parameter runs towards the chin.
export const MECKEL_STATIONS = [0.51, 0.40] as const;
type P2 = [number, number];
type Loops = P2[][];
const displayContours = (loops: Loops): Loops => loops.map(loop =>
  loop.map(([x, y]) => [Number(x.toFixed(4)), Number(y.toFixed(4))]));
type Plane = { origin: V3; normal: V3; right: V3; up: V3; extent: number };
const planes: { adult: number; plane: Plane }[] = [];

export function meckelPlane(pose: BonesPose, station = 0): Plane {
  const index = station === 1 ? 1 : 0;
  if (planes[index]?.adult === pose.adult) return planes[index].plane;
  const axis = meckelAxis(pose.adult);
  const t = MECKEL_STATIONS[index] * (axis.length - 1);
  const i = Math.floor(t);
  const origin = mix3(axis[i], axis[i + 1], t - i);
  const normal = norm(sub(axis[i + 1], axis[i]));
  const right = perp([1, 0, 0], normal);
  const up = cross(normal, right);
  const plane = { origin, normal, right, up, extent: 1.0 };
  planes[index] = { adult: pose.adult, plane };
  return plane;
}

// Join the exact triangle/plane edges of the visible model mesh. The SDF mesher duplicates vertices
// along cell boundaries, so identify coincident endpoints geometrically, independently of mesh indices.
function intersectMesh(mesh: Mesh, plane: Plane): Loops {
  const { pos, idx } = mesh;
  const distances = new Float64Array(pos.length / 3);
  for (let i = 0; i < distances.length; i++) {
    distances[i] = (pos[i * 3] - plane.origin[0]) * plane.normal[0]
      + (pos[i * 3 + 1] - plane.origin[1]) * plane.normal[1]
      + (pos[i * 3 + 2] - plane.origin[2]) * plane.normal[2];
  }
  type Node = { p: P2; neighbours: Node[] };
  const nodes = new Map<string, Node>();
  const crossing = (a: number, b: number) => {
    const f = distances[a] / (distances[a] - distances[b]);
    const coordinate = (j: number) => pos[a * 3 + j] + (pos[b * 3 + j] - pos[a * 3 + j]) * f - plane.origin[j];
    const p: V3 = [coordinate(0), coordinate(1), coordinate(2)];
    const uv: P2 = [dot(p, plane.right), dot(p, plane.up)];
    const key = Math.round(uv[0] * 1e6) + ',' + Math.round(uv[1] * 1e6);
    let node = nodes.get(key);
    if (!node) { node = { p: uv, neighbours: [] }; nodes.set(key, node); }
    return node;
  };
  for (let i = 0; i < idx.length; i += 3) {
    const a = idx[i], b = idx[i + 1], c = idx[i + 2];
    const e = distances[a] >= 0, f = distances[b] >= 0, g = distances[c] >= 0;
    if (e === f && f === g) continue;
    const first = e !== f ? crossing(a, b) : crossing(b, c);
    const second = e !== g ? crossing(c, a) : crossing(b, c);
    if (first !== second && !first.neighbours.includes(second)) {
      first.neighbours.push(second);
      second.neighbours.push(first);
    }
  }
  const loops: Loops = [];
  const visited = new Set<Node>();
  for (const start of nodes.values()) {
    if (visited.has(start)) continue;
    const loop: P2[] = [];
    let current = start, previous: Node | undefined;
    while (!visited.has(current) && current.neighbours.length === 2) {
      visited.add(current);
      loop.push(current.p);
      const next = current.neighbours[0] === previous ? current.neighbours[1] : current.neighbours[0];
      previous = current;
      current = next;
    }
    if (current === start && loop.length >= 3) loops.push(loop);
  }
  return loops;
}

function signedDistance(loops: Loops, x: number, y: number) {
  let inside = false, nearest = Infinity;
  for (const loop of loops) {
    for (let i = 0, j = loop.length - 1; i < loop.length; j = i++) {
      const [ax, ay] = loop[j], [bx, by] = loop[i];
      const dx = bx - ax, dy = by - ay;
      if ((ay > y) !== (by > y) && x < ax + dx * (y - ay) / dy) inside = !inside;
      const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1)));
      nearest = Math.min(nearest, (x - ax - t * dx) ** 2 + (y - ay - t * dy) ** 2);
    }
  }
  return (inside ? -1 : 1) * Math.sqrt(nearest);
}

// Maximum of the shader's cut field over a filled polygon. For a convex field it is attained
// at a vertex; for a concave field also check each edge's peak and the stationary point in the plane.
function peakCutField(loops: Loops, origin: V3, plane: Plane, grow: NonNullable<Clip3['grow']>) {
  const cu = dot(origin, plane.right), cv = dot(origin, plane.up), cw = dot(origin, plane.normal);
  const du = dot(grow.dir, plane.right), dv = dot(grow.dir, plane.up);
  const offset = dot(origin, grow.dir), c = grow.cos;
  const field = (u: number, v: number) => c * Math.hypot(cu + u, cv + v, cw) - offset - du * u - dv * v;
  let peak = -Infinity;
  for (const loop of loops) for (let i = 0, j = loop.length - 1; i < loop.length; j = i++) {
    const [x, y] = loop[j], [endX, endY] = loop[i];
    peak = Math.max(peak, field(x, y));
    if (c >= 0) continue;
    const dx = endX - x, dy = endY - y, length = Math.hypot(dx, dy);
    if (!length) continue;
    const ux = dx / length, uy = dy / length, slope = du * ux + dv * uy;
    const k = c * c - slope * slope;
    if (k <= 0) continue;
    const axial = (cu + x) * ux + (cv + y) * uy;
    const radial = Math.hypot(cw, (cu + x) * uy - (cv + y) * ux);
    const t = -slope * radial / Math.sqrt(k) - axial;
    if (t > 0 && t < length) peak = Math.max(peak, field(x + t * ux, y + t * uy));
  }
  const k = c * c - du * du - dv * dv;
  if (c < 0 && k > 0) {
    const radius = -Math.abs(cw) / Math.sqrt(k);
    const x = radius * du - cu, y = radius * dv - cv;
    if (signedDistance(loops, x, y) <= 0) peak = Math.max(peak, field(x, y));
  }
  return peak;
}

// Each fixed anatomical station keeps its 2-D section for as long as the shared 3-D mesh is alive.
// During ossification only the shader's angular growth threshold changes.
const slices = new WeakMap<Mesh, WeakMap<Plane, ReturnType<typeof makeSlice>>>();
function makeSlice(mesh: Mesh, plane: Plane) {
  const loops = displayContours(intersectMesh(mesh, plane));
  let xmin = Infinity, ymin = Infinity, xmax = -Infinity, ymax = -Infinity;
  for (const loop of loops) for (const [x, y] of loop) {
    xmin = Math.min(xmin, x); xmax = Math.max(xmax, x);
    ymin = Math.min(ymin, y); ymax = Math.max(ymax, y);
  }
  const lo: P2 = [xmin, ymin], hi: P2 = [xmax, ymax];
  const fields = new Map<number, number>();
  const h = 0.012;
  const row = Math.ceil((xmax - xmin) / h) + 16;
  function profile(x: number, y: number) {
    const key = Math.round((x - xmin) / h + 2) + row * Math.round((y - ymin) / h + 2);
    let value = fields.get(key);
    if (value === undefined) { value = signedDistance(loops, x, y); fields.set(key, value); }
    return value;
  }
  const full = { loops, front: [] as Loops };
  const empty = { loops: [] as Loops, front: [] as Loops };
  let lastCos: number | undefined, last = empty;
  function visible(clip?: Clip3) {
    if (!clip?.grow || !loops.length) return full;
    const grow = clip.grow;
    if (grow.cos === lastCos) return last;
    const origin = sub(plane.origin, clip.o);
    // In world units this has the same zero surface as the shader's dot(normalize(p-o),dir)-cos.
    // Spicules shade that visible edge; they do not change the discarded fragment domain.
    const front = (x: number, y: number) => {
      const q = add(origin, add(mul(plane.right, x), mul(plane.up, y)));
      return grow.cos * len(q) - dot(q, grow.dir);
    };
    const centre = front((xmin + xmax) / 2, (ymin + ymax) / 2);
    const reach = (1 + Math.abs(grow.cos)) * Math.hypot(xmax - xmin, ymax - ymin) / 2;
    lastCos = grow.cos;
    if (centre > reach) return last = empty;
    if (centre < -reach) return last = full;
    // A chord of a curved growth front can stray outside the shader domain. Certify the final
    // filled polygons at display precision and move the contour inwards if needed.
    let inset = 0.0003;
    let visibleLoops: Loops;
    for (;;) {
      visibleLoops = displayContours(contourLoops((x, y) => Math.max(profile(x, y), front(x, y) + inset), lo, hi, h));
      const excess = peakCutField(visibleLoops, origin, plane, grow) + 1e-9;
      if (excess <= 0) break;
      inset += Math.max(inset, excess * 2);
    }
    const fronts: Loops = [];
    for (const loop of visibleLoops) {
      // Only the edges on the angular cut advance. Start at the old bone outline so that a run
      // crossing the loop's array boundary is emitted as one open polyline.
      const onFront = loop.map(([x, y]) => Math.abs(front(x, y) + inset) < h * 0.08);
      const outside = onFront.indexOf(false);
      if (outside === -1) {
        fronts.push([...loop, loop[0]]);
        continue;
      }
      let run: P2[] = [];
      for (let step = 1; step <= loop.length; step++) {
        const i = (outside + step) % loop.length;
        if (onFront[i]) run.push(loop[i]);
        else {
          if (run.length > 1) fronts.push(run);
          run = [];
        }
      }
    }
    return last = { loops: visibleLoops, front: fronts };
  }
  return { loops, visible };
}

function slice(mesh: Mesh, plane: Plane) {
  let byPlane = slices.get(mesh);
  if (!byPlane) { byPlane = new WeakMap(); slices.set(mesh, byPlane); }
  let profile = byPlane.get(plane);
  if (!profile) { profile = makeSlice(mesh, plane); byPlane.set(plane, profile); }
  return profile;
}

export function meckelSection(pose: BonesPose, station = 0) {
  const plane = meckelPlane(pose, station);
  const cartilage = meckelCartilage(meckelAxis(pose.adult), Math.min(1, Math.max(0, pose.deg)));
  const mandible = formingMandible(pose);
  const cartilageLoops = cartilage ? slice(cartilage.mesh, plane).loops : [];
  const boneSlice = mandible && slice(mandible.parts.mesh, plane);
  const visibleBone = boneSlice?.visible(mandible?.clip);
  const boneLoops = visibleBone?.loops ?? [];
  function tissueAt(u: number, v: number): 'cartilage' | 'bone' | 'mesenchyme' {
    if (signedDistance(cartilageLoops, u, v) <= 0) return 'cartilage';
    return signedDistance(boneLoops, u, v) <= 0 ? 'bone' : 'mesenchyme';
  }
  return { ...plane, cartilage: cartilageLoops, bone: boneLoops, front: visibleBone?.front ?? [], tissueAt };
}

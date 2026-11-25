import { describe, expect, it } from 'vitest';
import { poseAt, type StageSpec } from '@/components/scenes/week14/common';
import { GlandDescent18, SD } from '@/components/scenes/week18/Neck18';
import { Pouch3, S3 } from '@/components/scenes/week18/Pharynx18';
import type { PharynxBOpts } from '@/components/scenes/week18/pharynx-b';
import { pharynxD } from '@/components/scenes/week18/pharynx-d';
import type { PharynxPose } from '@/components/scenes/week18/pharynx-model';
import { apply4, len, mul, sub, type V3 } from '@/lib/three-d/math';
import type { Item3 } from '@/lib/three-d/scene';

const spec = GlandDescent18.spec as StageSpec<PharynxPose, PharynxBOpts>;
const glands = ['beheko-paratiroidea', 'goiko-paratiroidea'] as const;
const frameAt = (time: number) => {
  const { pose, opts } = poseAt(spec, time);
  return pharynxD(pose, opts);
};

// Hold the rest of the neck still to isolate motion along the descent path.
const end = poseAt(spec, 1);
const atDescent = (descend: number) => pharynxD({ ...end.pose, descend }, end.opts);
const worldPoint = (item: Item3, point: V3): V3 => {
  if (!item.matrix) return point;
  const [x, y, z] = apply4(item.matrix, point);
  return [x, y, z];
};
const selectablePoints = (frame: ReturnType<typeof pharynxD>, id: string): V3[] => {
  const points: V3[] = [];
  for (const item of frame.items.filter((part) => part.id === id)) {
    const { pos } = item.hit ?? item.mesh;
    for (let i = 0; i < pos.length; i += 3) {
      points.push(worldPoint(item, [pos[i], pos[i + 1], pos[i + 2]]));
    }
  }
  return points;
};

// The leading pole of each rendered, capped thymic lobe is its first vertex.
const thymusTip = (frame: ReturnType<typeof pharynxD>, side: number): V3 => {
  const item = frame.items.find((part) => part.key === `thy${side}`)!;
  const [x, y, z] = item.mesh.pos;
  return worldPoint(item, [x, y, z]);
};

describe('gland descent on the topic 18 pharynx', () => {
  it('reverses the relative heights and restores the same glands when seeking backwards', () => {
    const origin = frameAt(SD[1]);
    const during = (SD[1] + SD[2]) / 2;
    const forward = frameAt(during);
    const arrival = frameAt(SD[3]);
    const back = frameAt(during);
    // The stage inherits a partially descended neck. Its two silhouettes must still read in origin order.
    const bottomOfThird = Math.min(...selectablePoints(origin, glands[0]).map((p) => p[1]));
    const topOfFourth = Math.max(...selectablePoints(origin, glands[1]).map((p) => p[1]));
    expect(bottomOfThird).toBeGreaterThan(topOfFourth);
    expect(arrival.pts[glands[0]][1]).toBeLessThan(arrival.pts[glands[1]][1]);
    for (const id of glands) {
      expect(back.pts[id]).toEqual(forward.pts[id]);
      for (const frame of [origin, forward, arrival, back]) {
        const anchor = frame.pts[id];
        // A selectable surface on the labelled side remains next to the label anchor.
        const nearest = Math.min(...selectablePoints(frame, id).map((point) => len(sub(point, anchor))));
        expect(nearest).toBeLessThan(0.13);
      }
    }
    expect(thymusTip(back, 1)).toEqual(thymusTip(forward, 1));
  });

  it('leaves the original ventral root continuously as the earlier pouch stage begins its descent', () => {
    const pouch = Pouch3.spec as StageSpec<PharynxPose, PharynxBOpts>;
    const { pose, opts } = poseAt(pouch, S3[3]);
    expect(pose.descend).toBe(0);
    const origin = pharynxD(pose, opts);
    const started = pharynxD({ ...pose, descend: 0.002 }, opts);
    for (const side of [1, -1]) {
      const jump = len(sub(thymusTip(started, side), thymusTip(origin, side)));
      expect(jump).toBeLessThan(0.01);
    }
  });

  it('moves both parathyroids between adjacent small seeks in their active descent', () => {
    let previous = atDescent(0.48);
    for (let i = 1; i <= 8; i++) {
      const next = atDescent(0.48 + i / 1000);
      for (const id of glands) {
        const distance = len(sub(next.pts[id], previous.pts[id]));
        expect(distance).toBeGreaterThan(0.00001);
        expect(distance).toBeLessThan(0.03);
      }
      previous = next;
    }
  });

  it('keeps the thymic heads on opposite sides through separation and at the final pose', () => {
    for (const d of [0.7, 0.72, 0.8, 1]) {
      const frame = atDescent(d);
      const [x, y, z] = thymusTip(frame, 1);
      expect(x).toBeGreaterThan(0);
      expect(len(sub(thymusTip(frame, -1), [-x, y, z]))).toBeLessThan(0.0001);
    }
  });

  it('carries the thymic head smoothly through release on each side', () => {
    const release = 0.72;
    const h = 0.0005;
    const before = atDescent(release - h);
    const crossing = atDescent(release);
    const after = atDescent(release + h);
    for (const side of [1, -1]) {
      const head = thymusTip(crossing, side);
      const incoming = mul(sub(head, thymusTip(before, side)), 1 / h);
      const outgoing = mul(sub(thymusTip(after, side), head), 1 / h);
      expect(len(incoming)).toBeGreaterThan(0.1);
      expect(len(sub(outgoing, incoming))).toBeLessThan(0.2);
    }
  });
});

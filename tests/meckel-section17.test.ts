import { describe, expect, it } from 'vitest';
import { Triangle, Vector3 } from 'three';
import { poseAt, type StageSpec } from '@/components/scenes/week14/common';
import { FirstArchBones17, SB1 } from '@/components/scenes/week17/Bones17';
import { bonesModel, type BonesOpts, type BonesPose } from '@/components/scenes/week17/bones-model';
import { meckelSection } from '@/components/scenes/week17/meckel-section';
import { stages17d } from '@/content/weeks/week17d';
import { add, dot, len, mul, sub, type V3 } from '@/lib/three-d/math';
import type { Mesh } from '@/lib/three-d/mesh';
import { clipped } from '@/lib/three-d/scene';

const spec = FirstArchBones17.spec as StageSpec<BonesPose, BonesOpts>;
const stagePose = (t: number) => poseAt(spec, t).pose;
const stage = stages17d.find((s) => s.id === 'lehen-arkua-kartilagoak')!;
const holds = stage.beats.filter((beat) => beat.compareLabel);
type Section = ReturnType<typeof meckelSection>;
type Face = Section['bone'];

// SVG's even-odd fill: this is the region a pointer can hit, including any holes.
function insideFace(face: Face, x: number, y: number) {
  let inside = false;
  for (const loop of face) {
    for (let i = 0, j = loop.length - 1; i < loop.length; j = i++) {
      const [ax, ay] = loop[j];
      const [bx, by] = loop[i];
      if ((ay > y) !== (by > y) && x < ax + (y - ay) * (bx - ax) / (by - ay)) inside = !inside;
    }
  }
  return inside;
}

const inModel = (s: Section, u: number, v: number) => add(s.origin, add(mul(s.right, u), mul(s.up, v)));

function distanceToSurface(mesh: Mesh, point: V3) {
  const p = new Vector3(...point), closest = new Vector3(), triangle = new Triangle();
  let nearest = Infinity;
  for (let i = 0; i < mesh.idx.length; i += 3) {
    triangle.a.fromArray(mesh.pos, mesh.idx[i] * 3);
    triangle.b.fromArray(mesh.pos, mesh.idx[i + 1] * 3);
    triangle.c.fromArray(mesh.pos, mesh.idx[i + 2] * 3);
    if (triangle.getArea() < 1e-12) continue;
    triangle.closestPointToPoint(p, closest);
    nearest = Math.min(nearest, closest.distanceTo(p));
  }
  return nearest;
}

describe('Meckel and mandibular ossification in transverse section', () => {
  it('keeps the cartilage separate as the adjacent bone forms, then loses the cartilage', () => {
    expect(holds.map((beat) => beat.compareLabel)).toEqual(['Hasiera', 'Hezurtzea', 'Endekapena']);
    for (const station of [0, 1]) {
      const [early, formed, regressed] = holds.map((beat) => meckelSection(stagePose(beat.compareAt ?? beat.completeAt!), station));
      expect(insideFace(early.cartilage, 0, 0)).toBe(true);
      expect(early.tissueAt(0, 0)).toBe('cartilage');
      expect(early.bone).toHaveLength(0);
      expect(insideFace(formed.cartilage, 0, 0)).toBe(true);
      expect(insideFace(formed.bone, 0, 0)).toBe(false);
      for (const [x, y] of formed.cartilage.flat()) expect(insideFace(formed.bone, x, y)).toBe(false);
      expect(formed.bone.length).toBeGreaterThan(0);
      expect(regressed.cartilage).toHaveLength(0);
      expect(regressed.tissueAt(0, 0)).toBe('mesenchyme');
      expect(regressed.bone.length).toBeGreaterThan(0);
    }
  });

  it('maps cross-section boundaries back onto the actual world-space meshes at both stations', () => {
    const { pose, opts } = poseAt(spec, SB1[2]);
    const { items } = bonesModel(pose, opts);
    for (const station of [0, 1]) {
      const s = meckelSection(pose, station);
      for (const [face, id] of [[s.bone, 'baraila'], [s.cartilage, 'meckel-kartilagoa']] as const) {
        const { mesh } = items.find((item) => item.id === id)!;
        const boundary = face[0];
        expect(boundary.length).toBeGreaterThan(2);
        for (const index of [0, Math.floor(boundary.length / 3), Math.floor(boundary.length * 2 / 3)]) {
          expect(distanceToSurface(mesh, inModel(s, ...boundary[index]))).toBeLessThan(1e-4);
        }
      }
    }
  });

  it('keeps the two cutting planes registered when seeking back through the animation', () => {
    const during = stagePose((SB1[1] + SB1[2]) / 2);
    const sections = [meckelSection(during, 0), meckelSection(during, 1)];
    expect(len(sub(sections[0].origin, sections[1].origin))).toBeGreaterThan(0.1);
    for (const [station, s] of sections.entries()) {
      for (const axis of [s.right, s.up, s.normal]) expect(len(axis)).toBeCloseTo(1, 5);
      expect(dot(s.right, s.up)).toBeCloseTo(0, 5);
      expect(dot(s.right, s.normal)).toBeCloseTo(0, 5);
      expect(dot(s.up, s.normal)).toBeCloseTo(0, 5);
      meckelSection(stagePose(SB1[3]), station);
      const back = meckelSection(during, station);
      expect(back.origin).toEqual(s.origin);
      expect(back.cartilage).toEqual(s.cartilage);
      expect(back.bone).toEqual(s.bone);
    }
  });

  it('excludes future bone from the selectable section while the ossification front crosses it', () => {
    const { pose, opts } = poseAt(spec, holds[1].compareAt ?? holds[1].completeAt!);
    const clip = bonesModel(pose, opts).items.find((part) => part.id === 'baraila')!.clip!;
    for (const station of [0, 1]) {
      const formed = meckelSection(stagePose(SB1[2]), station);
      const boundary = formed.bone.flat();
      const xs = boundary.map(([u]) => u), ys = boundary.map(([, v]) => v);
      const left = Math.min(...xs), bottom = Math.min(...ys);
      const du = (Math.max(...xs) - left) / 15, dv = (Math.max(...ys) - bottom) / 15;
      const s = meckelSection(pose, station);
      expect(meckelSection(stagePose(0.20), station).bone).toHaveLength(0);
      let hidden = 0, visible = 0;
      for (let a = 1; a < 15; a++) for (let b = 1; b < 15; b++) {
        const x = left + du * a, y = bottom + dv * b;
        // Skip pixels near either boundary so triangulation tolerances do not decide the result.
        const probes = [[x - du, y], [x + du, y], [x, y - dv], [x, y + dv]];
        if (!probes.every(([u, v]) => insideFace(formed.bone, u, v))) continue;
        const cut = clipped(clip, inModel(s, x, y));
        if (!probes.every(([u, v]) => clipped(clip, inModel(s, u, v)) === cut)) continue;
        expect(insideFace(s.bone, x, y)).toBe(!cut);
        expect(s.tissueAt(x, y)).toBe(cut ? 'mesenchyme' : 'bone');
        if (cut) hidden++; else visible++;
      }
      expect(hidden).toBeGreaterThan(0);
      expect(visible).toBeGreaterThan(0);
    }
  });

  it('marks only the advancing edge in the cutting plane', () => {
    const { pose, opts } = poseAt(spec, 0.215);
    const clip = bonesModel(pose, opts).items.find((part) => part.id === 'baraila')!.clip!;
    const { dir, cos } = clip.grow!;
    for (const station of [0, 1]) {
      expect(meckelSection(stagePose(0.20), station).front).toHaveLength(0);
      const s = meckelSection(pose, station);
      expect(s.front.length).toBeGreaterThan(0);
      for (const line of s.front) {
        expect(line.length).toBeGreaterThan(1);
        for (const [x, y] of line) {
          const q = sub(inModel(s, x, y), clip.o);
          expect(Math.abs(cos * len(q) - dot(q, dir))).toBeLessThan(0.0015);
        }
      }
      // At this station ossification has already passed even though the mandible is still growing elsewhere.
      expect(meckelSection(stagePose(0.24), station).front).toHaveLength(0);
      expect(meckelSection(stagePose(SB1[3]), station).front).toHaveLength(0);
    }
  });
});

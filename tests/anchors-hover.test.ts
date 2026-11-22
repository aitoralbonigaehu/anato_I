import { describe, expect, it } from 'vitest';
import { project, viewOf, type V3 } from '@/lib/three-d/math';
import { seenAt, seenOwn, visibleAnchor } from '@/lib/three-d/occlusion';
import { pickAt } from '@/lib/three-d/pick';
import type { Item3 } from '@/lib/three-d/scene';

/**
 * The dot solver (lib/three-d/occlusion.ts) and the hover pick (lib/three-d/pick.ts) must agree: a name's dot
 * is placed where the pointer lights its structure. These pin the cases the owner found on screen (topic 15,
 * 2026-11-22): a nephrotome's dot on the tubule that grew out of it, a dot floating beside a thin cord, and
 * both rules drifting apart.
 */

/** A flat rectangle at depth z, facing the camera (x0..x1, y0..y1), as a two-triangle mesh. */
const quad = (x0: number, x1: number, y0: number, y1: number, z: number) => ({
  pos: new Float32Array([x0, y0, z, x1, y0, z, x1, y1, z, x0, y1, z]),
  idx: new Uint32Array([0, 1, 2, 0, 2, 3]),
});
const item = (key: string, id: string | undefined, m: ReturnType<typeof quad>, extra: Partial<Item3> = {}): Item3 => ({ key, id, mesh: m, color: '#888888', ...extra }) as Item3;

const cam = { eye: [0, 0, 10] as V3, target: [0, 0, 0] as V3, up: [0, 1, 0] as V3, fov: 30 };
const view = viewOf(cam);
const eye = cam.eye;

describe('the dot solver uses the hover rule', () => {
  it('agrees with the pick at every point of a layered scene (solid, glass, unnamed ground)', () => {
    const items: Item3[] = [
      item('ground', undefined, quad(-3, 3, -3, 3, -1), { ground: true }),
      item('wall', 'horma', quad(-2, 0.5, -2, 2, 0)),
      item('glass', 'beira', quad(-0.5, 2, -1, 1, 0.5), { opacity: 0.3 }),
      item('front', 'aurrea', quad(-1, 0, -0.5, 0.5, 1)),
      item('faint', undefined, quad(-3, 3, -3, 3, 2), { opacity: 0.2 }),
    ];
    let checked = 0;
    for (let x = -2.6; x <= 2.6; x += 0.2)
      for (let y = -2.6; y <= 2.6; y += 0.2) {
        // A point on the ground behind everything: the eye's ray through it crosses every layer in front.
        const p: V3 = [x + 0.013, y + 0.017, -1];
        const q = project(view, p);
        expect(seenAt(items, eye, p)?.id ?? null, `(${x.toFixed(1)}, ${y.toFixed(1)})`).toBe(pickAt(items, view, q.x, q.y));
        checked++;
      }
    expect(checked).toBeGreaterThan(500);
  });

  it('moves a dot from under a cover lying a hair in front of it (the tubule round its nephrotome)', () => {
    // The tubule 0.05 in front of the nephrotome: nearer than the old 0.3 margin of `coverOf` could see.
    const items = [item('neph', 'nefrotomak', quad(-0.6, 0.6, -0.6, 0.6, 0)), item('tub', 'hodixka', quad(-0.3, 1.5, -0.1, 0.1, 0.05))];
    const p: V3 = [0.2, 0, 0];
    expect(seenOwn(items, eye, p, 'nefrotomak')).toBe(false);
    const q = visibleAnchor(items, eye, p, 'nefrotomak', () => true, 48, true);
    expect(seenOwn(items, eye, q, 'nefrotomak')).toBe(true);
    const s = project(view, q);
    expect(pickAt(items, view, s.x, s.y)).toBe('nefrotomak');
  });

  it('brings a dot floating beside a thin cord onto the cord (the urachus)', () => {
    const items = [item('ground', undefined, quad(-3, 3, -3, 3, -1), { ground: true }), item('cord', 'urakoa', quad(0.4, 0.5, -2, 2, 0))];
    const p: V3 = [0.75, 0.3, 0.1];
    expect(seenOwn(items, eye, p, 'urakoa')).toBe(false);
    const q = visibleAnchor(items, eye, p, 'urakoa', () => true, 48, true);
    const s = project(view, q);
    expect(pickAt(items, view, s.x, s.y)).toBe('urakoa');
  });

  it('keeps a written dot the pointer already lights', () => {
    const items = [item('kid', 'giltzurruna', quad(-1, 1, -1, 1, 0))];
    const p: V3 = [0.1, 0.2, 0];
    expect(visibleAnchor(items, eye, p, 'giltzurruna', () => true, 48, true)).toEqual(p);
  });

  it('counts a piece of a group as its own (the pronephros lights through its nephrotomes)', () => {
    const items = [item('neph', 'nefrotomak', quad(-0.5, 0.5, -0.5, 0.5, 0), { groups: ['pronefrosa'] })];
    expect(seenOwn(items, eye, [0, 0, 0], 'pronefrosa')).toBe(true);
    expect(seenOwn(items, eye, [0, 0, 0], 'mesonefrosa')).toBe(false);
  });
});

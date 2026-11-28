import { createElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { LabelScaleContext, SceneContext, type SceneContextValue } from '@/components/kit/context';
import { SceneView } from '@/components/kit/columns';
import { structures, weeks } from '@/content/registry';
import { archHead } from '@/components/scenes/week17/arch-head';
import { project, viewOf, type V3, type View3 } from '@/lib/three-d/math';
import { coverOf, visibleAnchor } from '@/lib/three-d/occlusion';
import { pickAt } from '@/lib/three-d/pick';
import { Birth3D, Secundum3D } from '@/components/scenes/week11/Septa3D';
import type { Item3, Scene3 } from '@/lib/three-d/scene';
import type { SceneComponent } from '@/lib/sim/types';

/**
 * A name's dot must sit on its own structure as the camera sees it, not on whatever lies in front of
 * it: from a front view the dorsal aortae hide behind the aortic sac, and a dot "on" them would land on
 * the sac. ModelView moves a covered anchor to the nearest point of the structure the eye does see
 * (lib/three-d/occlusion.ts); the other 3D views place theirs by hand. For every 3D step's settled
 * frame (topics 7–12), each shown name's dot must be seen and inside the frame: a structure with
 * nothing in sight needs another camera or another anchor.
 *
 * The 3D stage and the names are stood in for: the stage projects with the step's own camera and
 * remembers which 3D point each screen point came from; the names record what they were given.
 */

interface Taken {
  items: Item3[];
  view: View3;
  world: WeakMap<object, V3>;
}
type Named = { id: string; at: object; show: number; key?: string };
const probe: { stage: Taken | null; names: { stage: Taken; items: Named[] }[] } = { stage: null, names: [] };

vi.mock('@/components/kit/three/Stage3D', async (load) => {
  const real = await load<typeof import('@/components/kit/three/Stage3D')>();
  function Stage3D({ scene, children }: { scene: Scene3; children?: (at: unknown, view: View3) => ReactNode }) {
    const view = viewOf(scene.camera);
    const taken: Taken = { items: scene.items, view, world: new WeakMap() };
    probe.stage = taken;
    const at = (p: V3) => {
      const r = project(view, p);
      const s = { x: r.x, y: r.y, z: r.z };
      taken.world.set(s, p);
      return s;
    };
    return createElement('g', null, children?.(at, view));
  }
  return { ...real, Stage3D };
});

vi.mock('@/components/kit/callouts', async (load) => {
  const real = await load<typeof import('@/components/kit/callouts')>();
  function Callouts({ items }: { items: Named[] }) {
    if (probe.stage) probe.names.push({ stage: probe.stage, items });
    return null;
  }
  return { ...real, Callouts };
});

const ctx: SceneContextValue = {
  selected: null,
  hovered: null,
  focus: [],
  showLabels: true,
  quiz: false,
  quizFlash: null,
  nameOf: (id) => structures.get(id)?.name ?? id,
  onSelect: () => {},
  onHover: () => {},
};

function named(Scene: SceneComponent, t: number) {
  probe.stage = null;
  probe.names = [];
  renderToStaticMarkup(
    createElement(
      SceneContext.Provider,
      { value: ctx },
      createElement(LabelScaleContext.Provider, { value: { k: 1, left: false, right: false } }, createElement(SceneView, { Scene, t, reduced: true })),
    ),
  );
  return probe.names;
}

/**
 * Topics 15 on (and every topic after) also check what the pointer lights at each name's dot, at the middle
 * and the end of every step (lib/three-d/pick.ts, the hover rule):
 * - pick: the dot's pixel lights the named structure or a piece of it, not a neighbour, not nothing (a dot
 *   floating beside its structure, or on the tip of another that grew out of it);
 * - rim: at most one of four points 3 px round it lights another named structure (a dot on the seam);
 * - shared: no two names share a dot (several names of one changing piece spread along it).
 * Known exceptions (2026-11-22), to work down, never to add to: names with nothing of their own drawn (a
 * flexure, a fontanelle, "agenesia"), see-through spaces and fluids under a solid layer, thin sheets seen
 * nearly edge on, nerves and grooves thinner than the rim lying on another structure.
 * Key: topic|stage|step|name|check.
 */
/** Pixels (frame units, 1000 × 640) round the dot that must light its structure too. */
const RIM = [[-3, 0], [3, 0], [0, -3], [0, 3]] as const;
/** Two dots nearer than this (frame units) are one dot to the reader. */
const SAME_DOT = 9;

/** The known exceptions the audit met in this run. */
const KNOWN_SEEN = new Set<string>();

const HOVER_KNOWN = new Set<string>([
  '15|giltzurrun-gaineko-guruinak|4|fetu-kortexa:4|rim', // → giltzurrun-gaineko-muina, behin-betiko-kortexa
  '15|mesonefros-hodixkak|4|atzeko-bena-kardinalak:4|pick', // → arteriola-eferentea
  '15|zakil-uretra|0|ildo-koronarioa:0|rim', // → azaleko-ektodermoa
  '16|barrabila|1|tunika-albuginea:1|rim', // → gonadaren-epitelioa
  '16|barrabila|5|hodi-paramesonefrikoa:5|pick', // → ezer ez
  '16|hodi-genitalak-arrak|5|hodi-isurlea:5|pick', // → prostataren-utrikulua
  '16|hodi-genitalak-arrak|5|hodi-isurlea:5|rim', // → hodi-deferentea
  '16|hozi-zelulak|2|hasierako-hozi-zelulak:2|pick', // → gonada-gandorra
  '16|kanpo-genitalak-emeak|1|baginaren-zuloa:1|pick', // → baginaren-bestibulua
  '16|kanpo-genitalak-emeak|1|kanpoko-uretra-zuloa:1|pick', // → baginaren-bestibulua
  '16|obarioa|2|kortex-kordoiak:2|pick', // → gonadak
  '16|semen-bidea|0|hodixka-eferenteak:0|rim', // → epididimoa
  '16|semen-bidea|1|prostataren-utrikulua:1|rim', // → uretra-prostatikoa, gernu-maskuria
  '16|semen-bidea|3|gernu-maskuria:3|pick', // → hodi-deferentea
  '17|bigarren-arkua-muskuluak|3|estilohioideoa:3|rim', // → digastrikoaren-atzeko-sabela
  '17|bigarren-arkua|1|reichert-kartilagoa:1|pick', // → lotailu-estilohioideoa
  '17|buru-ganga|0|mintza:0|rim', // → aurreko-fontanela
  '17|hezurtze-motak|1|hezur-espikulak:1|rim', // → mesenkima
  '17|josturak-fontanelak|3|atzeko-fontanela:3|pick', // → mintza
  '17|josturak-fontanelak|4|aurreko-fontanela:4|pick', // → mintza
  '17|lehen-arkua-kartilagoak|1|baraila:1|pick', // → ezer ez
  '17|lehen-arkua-kartilagoak|2|meckel-kartilagoa:2|pick', // → ezer ez
  '18|aho-sabai-gandorrak|3|aho-sabaiko-errafea:3|rim', // → aho-sabai-gandorrak
  '18|aurpegia-hasiera|0|estomodeoa:0|rim', // → barail-luzapena
  '18|esne-behin-betiko|3|agenesia:3|pick', // → baraila
  '18|esne-behin-betiko|4|gelditua:4|pick', // → ezer ez
  '18|guruinen-jaisketa|3|laringeko-kartilagoak:3|pick', // → ezer ez
  '18|guruinen-jaisketa|3|tiroide-lobuluak:3|pick', // → ezer ez
  '18|hortzaren-geruzak|4|zementoa:4|rim', // → zementoblastoak
  '18|hortzaren-geruzak|4|zementoblastoak:4|rim', // → mesenkima
  '18|lehen-poltsa|0|lehen-poltsa:0|rim', // → lehen-arraildura
  '18|maxilar-arteko-segmentua|3|aho-sabaiko-errafea:3|rim', // → aho-sabai-gandorrak
  '18|mihiaren-sustraia|2|ildo-terminala:2|rim', // → kupula, mihiaren-gorputza
  '19|ornomuin-geruzak|1|barneko-mintz-mugatzailea:1|pick', // → neuroepitelioa
  '19|puntzioa-epidurala|0|likido-zefalorrakideoa:0|pick', // → ornoak
  // Class 31's copies of the same two scenes (topic 21 plays topic 19's notes for the other class).
  '21|ornomuin-geruzak|1|barneko-mintz-mugatzailea:1|pick', // → neuroepitelioa
  '21|puntzioa-epidurala|0|likido-zefalorrakideoa:0|pick', // → ornoak
  '21|puntzioa-epidurala|1|likido-zefalorrakideoa:1|pick', // → ornoak
]);

for (const [w, week] of weeks.entries()) {
  if (w + 1 < 7) continue;
  describe(`${w + 1}. gaia: izenen puntuak beren egituraren gainean, ez aurrean dagoen beste baten gainean`, () => {
    // The embryo head mesh takes several seconds to build here (in the app a worker builds it): warm it once.
    if (w + 1 === 17) beforeAll(() => void archHead(), 60_000);
    for (const stage of week.stages) {
      it(stage.id, () => {
        const problems: string[] = [];
        stage.beats.forEach((b, i) => {
          const view = stage.views.find((v) => v.id === (b.view ?? stage.views[0].id)) ?? stage.views[0];
          const end = stage.beats[i + 1]?.at ?? 1;
          // Topics 15+: the step's middle too (names and models mid-change), not only its settled end.
          const times = w + 1 >= 15 ? [b.at + 0.55 * (end - b.at), end - 0.035] : [end - 0.035];
          for (const t of times)
            for (const { stage: s, items } of named(view.scene, t)) {
              const shown: { n: Named; q: { x: number; y: number } }[] = [];
              for (const n of items) {
                const p = s.world.get(n.at);
                if (n.show < 0.5 || !p) continue;
                const name = n.key ?? n.id;
                const where = `${i}. urratsa (${view.id}, t=${t.toFixed(2)}): ${name}`;
                const known = (kind: string) => {
                  const k = `${w + 1}|${stage.id}|${i}|${name}|${kind}`;
                  if (HOVER_KNOWN.has(k)) KNOWN_SEEN.add(k);
                  return HOVER_KNOWN.has(k);
                };
                // As ModelView judges its anchors: a vessel's width short of the point (it sits inside its own tube).
                const hit = coverOf(s.items, s.view.eye, p, n.id, 0.3);
                const q = project(s.view, p);
                if (hit) problems.push(`${where} → ${hit}-ren atzean`);
                else if (q.x < 0 || q.x > 1000 || q.y < 0 || q.y > 640) problems.push(`${where} → markotik kanpo (${Math.round(q.x)}, ${Math.round(q.y)})`);
                if (w + 1 < 15) continue;
                shown.push({ n, q });
                // The pointer on the dot lights the named structure (what the hover picks at that pixel), or a piece of it.
                const lights = (x: number, y: number) => {
                  const got = pickAt(s.items, s.view, x, y);
                  return { got, own: got === n.id || s.items.some((it) => it.id === got && it.groups?.includes(n.id)) };
                };
                const at = lights(q.x, q.y);
                if (!at.own) {
                  if (!known('pick')) problems.push(`${where} → saguak ${at.got ?? 'ezer ez'} pizten du`);
                  continue;
                }
                // ...and a little off it: a dot on the seam between two named structures reads as on the neighbour,
                // and a pointer a few pixels off lights it. At most one of the four points round it may light
                // another named structure (off its edge onto the bare ground is fine: nothing lights there).
                const other = RIM.map(([dx, dy]) => lights(q.x + dx, q.y + dy)).filter((r) => !r.own && r.got);
                if (other.length > 1 && !known('rim')) problems.push(`${where} → ertzean, ${[...new Set(other.map((r) => r.got))].join(', ')} ondoan`);
              }
              // Two names, one dot: each name points at its own place (several names of one changing piece
              // spread along it), never stacked where the reader cannot tell which line ends where.
              for (let a = 0; a < shown.length; a++)
                for (let c = a + 1; c < shown.length; c++) {
                  const A = shown[a], C = shown[c];
                  if (Math.hypot(A.q.x - C.q.x, A.q.y - C.q.y) >= SAME_DOT) continue;
                  const pair = `${A.n.key ?? A.n.id}+${C.n.key ?? C.n.id}`;
                  const k = `${w + 1}|${stage.id}|${i}|${pair}|shared`;
                  if (HOVER_KNOWN.has(k)) KNOWN_SEEN.add(k);
                  else problems.push(`${i}. urratsa (${view.id}, t=${t.toFixed(2)}): ${pair} → puntu berean`);
                }
            }
        });
        expect(problems).toEqual([]);
        // Heavy models (the topic 19 brain) sampled twice a step with the hover pick: more than the default 5 s.
      }, 60_000);
    }
  });
}

// The known list only shrinks: an exception that no longer happens is struck off (runs after the audit above,
// in a full run of this file; a run filtered to some stages skips it).
it('every known hover exception still happens (strike off the fixed ones)', () => {
  const audited = weeks.length >= 19 && KNOWN_SEEN.size > 0;
  if (!audited) return;
  expect([...HOVER_KNOWN].filter((k) => !KNOWN_SEEN.has(k))).toEqual([]);
});

it('reconsiders a cached anchor when the frame changes without moving the eye', () => {
  const mesh = { pos: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]), idx: new Uint32Array([0, 1, 2]) };
  const items = [{ id: 'own', mesh }] as Item3[];
  const eye: V3 = [0, 0, 5];
  const p: V3 = [0, 0, 0];
  expect(visibleAnchor(items, eye, p, 'own')).toEqual(p);
  // Moved onto its own surface inside the new frame (a little in from the vertex, not on the outline).
  const q = visibleAnchor(items, eye, p, 'own', (q) => q[1] > 0.5);
  expect(q[1]).toBeGreaterThan(0.5);
  expect(q[0]).toBeGreaterThanOrEqual(0);
  expect(q[0] + q[1]).toBeLessThanOrEqual(1);
});

it('the oblique-path ostium dot is clear of the unnamed atrial rim too', () => {
  const s = named(Secundum3D, 0.78).find(({ items }) => items.some((n) => n.id === 'ostium-secunduma'))!;
  const n = s.items.find((n) => n.id === 'ostium-secunduma')!;
  const p = s.stage.world.get(n.at)!;
  const items = s.stage.items.map((item) => item.key === 'rim' ? { ...item, id: 'atrial-rim' } : item);
  expect(coverOf(items, s.stage.view.eye, p, n.id, 0.04)).toBeNull();
});

for (const t of [0.81, 0.96]) {
  it(`birth t=${t}: the patent opening's dot sits on the drawn residual slit`, () => {
    const samples = named(Birth3D, t);
    const s = samples.find(({ items }) => items.some((n) => n.id === 'zulo-obala' && n.show >= 0.5))!;
    const n = s.items.find((n) => n.id === 'zulo-obala' && n.show >= 0.5)!;
    const p = s.stage.world.get(n.at)!;
    const slit = s.stage.items.find((item) => item.key === 'slit')!;
    expect(slit).toBeDefined();
    let distance = Infinity;
    for (let i = 0; i < slit.mesh.pos.length; i += 3) {
      distance = Math.min(distance, Math.hypot(p[0] - slit.mesh.pos[i], p[1] - slit.mesh.pos[i + 1], p[2] - slit.mesh.pos[i + 2]));
    }
    expect(distance).toBeLessThan(0.04);
    expect(coverOf(s.stage.items, s.stage.view.eye, p, n.id, 0.12)).toBeNull();
  });
}

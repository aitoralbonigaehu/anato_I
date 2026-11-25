'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { nameOf } from '@/content/registry';
import {
  LAYER_NAME,
  LINK_READ,
  MAP15_LINKS,
  MAP15_NODES,
  MAP15_TRAILS,
  type LinkKind,
  type MapNode,
} from '@/content/eratorriak/map15';
import type { Moment } from '@/content/eratorriak/model';
import { orbit, type CalloutSpec } from '@/components/scenes/week10/Heart3D';
import { MAP_MOMENTS, mapModel, poseAt } from '@/components/scenes/week15/map-model';
import type { V3 } from '@/lib/three-d/math';
import { MomentBar } from './kit/MomentBar';
import { Room3D, useGlide, type Frame3 } from './kit/Room3D';
import type { RoomViewState } from './kit/StudyRoom';
import styles from './eratorriak.module.css';
import local from './Topic15.module.css';

/**
 * Topic 15's study room: the whole topic as ONE model ("Mapa osoa"). The simulator teaches the topic in
 * separate models; here the posterior wall and the pelvis are one body, a moment bar runs it from the 4th week
 * to birth, and every structure answers "where does it come from, what does it give, what sprouts out of it,
 * where does it empty, what lies beside it" (content/eratorriak/map15.ts). Picking lights the piece and what it
 * is linked to; the panel says each link, and a link picks the next piece, so the topic is walked as one web.
 * Ready-made walks ("Bideak") read the classic chains in order.
 */

const NODE = new Map(MAP15_NODES.map((n) => [n.id, n]));
const LAST = MAP_MOMENTS.length - 1;
const MOMENTS: Moment[] = MAP_MOMENTS.map((m) => ({ id: m.id, title: m.title, when: m.when, sim: '', sec: '' }));

/** Names shown with nothing picked: the moment's landmarks. */
const LANDMARKS: string[][] = [
  ['bitarteko-mesodermoa', 'pronefrosa', 'aorta-dortsalak', 'kloaka', 'alantoidea'],
  ['mesonefrosa', 'hodi-mesonefrikoa', 'gonada-gandorra', 'kloaka', 'trenkada-uroerrektala', 'alantoidea'],
  ['mesonefrosa', 'hodi-mesonefrikoa', 'ureter-kimua', 'blastema-metanefrikoa', 'kloaka', 'trenkada-uroerrektala'],
  ['giltzurruna', 'giltzurrun-gaineko-guruinak', 'ureterra', 'hodi-mesonefrikoa', 'gernu-maskuria', 'uzki-hodia', 'alantoidea', 'perineoa'],
  ['giltzurruna', 'giltzurrun-gaineko-guruinak', 'ureterra', 'gonadak', 'gernu-maskuria', 'urakoa', 'uretra', 'zakila'],
  ['giltzurruna', 'giltzurrun-gaineko-guruinak', 'ureterra', 'gonadak', 'gernu-maskuria', 'erdiko-zilbor-lotailua', 'uretra', 'glandea'],
];

/** Small pieces: the camera comes closer (distance), and what hides them turns see-through. */
const CLOSE: Record<string, number> = {
  'hobi-nabikularra': 4.6,
  'kordoi-ektodermikoa': 4.6,
  'kanpoko-uretra-zuloa': 4.6,
  prepuzioa: 5,
  'ildo-koronarioa': 5,
  glandea: 5.5,
  'azaleko-ektodermoa': 5.5,
  trigonoa: 6,
  prostata: 7,
  'uretra-prostatikoa': 7,
  'mintzezko-uretra': 7,
  'zakil-uretra': 8,
  'uretra-guruinak': 7,
  'baginaren-bestibulua': 7,
  'mintz-urogenitala': 7,
  'uzki-mintza': 7,
  'kloaka-mintza': 7,
  perineoa: 7,
  'atal-pelbianoa': 7,
  'behin-betiko-sinu-urogenitala': 7,
};
const XRAY: Record<string, string[]> = {
  trigonoa: ['gernu-maskuria'],
  'hobi-nabikularra': ['glandea', 'prepuzioa'],
  'kordoi-ektodermikoa': ['glandea'],
  'kanpoko-uretra-zuloa': ['glandea', 'prepuzioa'],
  'uretra-prostatikoa': ['prostata'],
  'ildo-koronarioa': ['prepuzioa'],
};

const OVERVIEW = { target: [0, -1.5, 0.4] as V3, dist: 23 };
const YAW = 36;
const ELEV = 6;

const alive = (n: MapNode, moment: number) => moment >= n.at && moment <= (n.until ?? LAST);
const drawnAs = (id: string) => NODE.get(id)?.in3d ?? id;

interface Rel {
  id: string;
  say?: string;
}
type Groups = { title: string; kind: LinkKind; items: Rel[] }[];

/** A node's links, grouped by how they read from it. */
function groupsOf(id: string): Groups {
  const out = new Map<string, { kind: LinkKind; items: Rel[] }>();
  const put = (title: string, kind: LinkKind, r: Rel) => {
    const g = out.get(title) ?? { kind, items: [] };
    if (!g.items.some((x) => x.id === r.id)) g.items.push(r);
    out.set(title, g);
  };
  for (const l of MAP15_LINKS) {
    if (l.a === id) put(LINK_READ[l.kind].out, l.kind, { id: l.b, say: l.say });
    if (l.b === id) put(LINK_READ[l.kind].in, l.kind, { id: l.a, say: l.say });
  }
  const order = ['Nondik dator', 'Nondik ateratzen da', 'Zeren zatia', 'Zatiak', 'Zer ematen du', 'Hemendik ateratzen da', 'Nora isurtzen du', 'Zer isurtzen da hemen', 'Aurretik', 'Ondoren', 'Ondoan'];
  return order.filter((t) => out.has(t)).map((t) => ({ title: t, ...out.get(t)! }));
}

/** A small glide of a few numbers (the camera's target and distance), so a pick never cuts the view. */
function useGlideVec(goal: readonly number[]) {
  const [v, setV] = useState<number[]>(() => [...goal]);
  const cur = useRef<number[]>([...goal]);
  const key = goal.map((x) => x.toFixed(3)).join(',');
  useEffect(() => {
    const from = [...cur.current];
    const to = key.split(',').map(Number);
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const ms = reduce ? 1 : 1100;
    const t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / ms);
      const e = p * p * (3 - 2 * p);
      const next = from.map((f, i) => f + (to[i] - f) * e);
      cur.current = next;
      setV(next);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [key]);
  return v;
}

const LAYER_CLASS: Record<MapNode['layer'], string> = {
  meso: local.meso,
  endo: local.endo,
  ekto: local.ekto,
  neural: local.neural,
};

function Chip({ id, say, moment, onPick }: { id: string; say?: string; moment: number; onPick: (id: string) => void }) {
  const n = NODE.get(id);
  const here = n ? alive(n, moment) : false;
  return (
    <button type="button" className={`${local.chip} ${n ? LAYER_CLASS[n.layer] : ''}${here ? '' : ` ${local.later}`}`} onClick={() => onPick(id)}>
      <b>{nameOf(id)}</b>
      {say && <small>{say}</small>}
    </button>
  );
}

function NodeCard({ id, moment, onPick }: { id: string; moment: number; onPick: (id: string) => void }) {
  const n = NODE.get(id);
  if (!n) return null;
  const groups = groupsOf(id);
  const first = MAP_MOMENTS[n.at];
  return (
    <div className={local.card}>
      <div className={local.cardHead}>
        <span className={`${local.layer} ${LAYER_CLASS[n.layer]}`}>{LAYER_NAME[n.layer]}</span>
        <h4>{nameOf(id)}</h4>
        <p className={local.meta}>
          {first.when} · apunteak §{n.sec}
          {n.in3d && <> · 3D-an: {nameOf(n.in3d)}</>}
        </p>
      </div>
      <p className={local.what}>{n.what}</p>
      {n.kontuz && (
        <p className={local.kontuz}>
          <b>Kontuz</b> {n.kontuz}
        </p>
      )}
      <div className={local.groups}>
        {groups.map((g) => (
          <div key={g.title} className={local.group}>
            <span className={local.groupTitle}>{g.title}</span>
            <div className={local.chips}>
              {g.items.map((r) => (
                <Chip key={r.id} id={r.id} say={r.say} moment={moment} onPick={onPick} />
              ))}
            </div>
          </div>
        ))}
      </div>
      {n.stage && (
        <Link className={local.simLink} href={`/astea/15?etapa=${n.stage}`}>
          Simulagailuan gertutik ikusi →
        </Link>
      )}
    </div>
  );
}

function MapExplorer() {
  const [moment, setMoment] = useState(0);
  const [sex, setSex] = useState<0 | 1>(0);
  const [lit, setLit] = useState<string | null>(null);
  const [trail, setTrail] = useState<{ id: string; i: number } | null>(null);
  const sexU = useGlide(sex);

  const pick = useCallback(
    (id: string) => {
      const n = NODE.get(id);
      setLit((cur) => (cur === id ? null : id));
      if (n && !alive(n, moment)) setMoment(n.at);
    },
    [moment],
  );
  // A pick in the 3D answers with the drawn id: a whole picked in the model is itself.
  const pick3 = useCallback((id: string) => (NODE.has(id) ? pick(id) : setLit(null)), [pick]);

  const tr = trail ? MAP15_TRAILS.find((t) => t.id === trail.id) : undefined;
  const goTrail = useCallback((id: string, i: number) => {
    const t = MAP15_TRAILS.find((x) => x.id === id);
    if (!t) return;
    const k = Math.max(0, Math.min(t.steps.length - 1, i));
    const s = t.steps[k];
    setTrail({ id, i: k });
    setLit(s.id);
    if (s.moment !== undefined) setMoment(s.moment);
    // A female-only piece shows on the female, a male-only one on the male.
    if (s.id === 'baginaren-bestibulua' || s.id === 'uretra-guruinak') setSex(1);
    else if (['uretra-prostatikoa', 'zakil-uretra', 'prostata', 'hobi-nabikularra', 'kordoi-ektodermikoa', 'prepuzioa', 'glandea'].includes(s.id)) setSex(0);
  }, []);

  // Keys: ← → walk the trail (or the moments), Esc clears the pick.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.closest('input, textarea, select, [role="tablist"]') || t.isContentEditable)) return;
      if (!document.activeElement?.closest(`.${local.map}`)) return;
      if (e.key === 'Escape') {
        setLit(null);
        setTrail(null);
      } else if (trail && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        e.preventDefault();
        goTrail(trail.id, trail.i + (e.key === 'ArrowRight' ? 1 : -1));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [trail, goTrail]);

  const related = useMemo(() => {
    if (!lit) return [];
    const ids = new Set<string>();
    for (const l of MAP15_LINKS) {
      if (l.a === lit) ids.add(drawnAs(l.b));
      if (l.b === lit) ids.add(drawnAs(l.a));
    }
    ids.delete(drawnAs(lit));
    return [...ids];
  }, [lit]);

  // The camera's goal: the whole system, or close on the picked piece (where it is at this moment).
  const goalPts = useMemo(() => mapModel(poseAt(moment, sex)).pts, [moment, sex]);
  const lit3 = lit ? drawnAs(lit) : null;
  const litAt = lit3 ? goalPts[lit3] : undefined;
  const goal = litAt ? { target: litAt, dist: CLOSE[lit!] ?? 15 } : OVERVIEW;
  const cam = useGlideVec([goal.target[0], goal.target[1], goal.target[2], goal.dist]);

  const frame = useCallback(
    (u: number): Frame3 => {
      const model = mapModel(poseAt(u, sexU));
      const xr = lit ? XRAY[lit] : undefined;
      const items = xr ? model.items.map((it) => (it.id && xr.includes(it.id) ? { ...it, opacity: (it.opacity ?? 1) * 0.35 } : it)) : model.items;
      const m = Math.round(u);
      let names: CalloutSpec[];
      if (lit && lit3) {
        const n = NODE.get(lit);
        names = [{ id: lit3, p: lit3, show: 1, text: nameOf(lit), sub: n?.in3d ? `3D-an: ${nameOf(n.in3d)}` : undefined }];
        for (const id of related.slice(0, 7)) if (model.pts[id]) names.push({ id, p: id, show: 1, small: true });
      } else names = (LANDMARKS[m] ?? []).filter((id) => model.pts[id]).map((id) => ({ id, p: id, show: 1 }));
      return { items, pts: model.pts, camera: orbit(YAW, ELEV, cam[3], [cam[0], cam[1], cam[2]]), names };
    },
    [sexU, lit, lit3, related, cam],
  );

  const state: RoomViewState = {
    stage: moment,
    mode: 'origin',
    lit: new Set(),
    labels: true,
    names: 'guztiak',
    stages: MAP_MOMENTS.map((m) => m.title),
    onStage: (n) => setMoment(Math.max(0, Math.min(LAST, n))),
  };

  const bySec = useMemo(() => {
    const out = new Map<string, MapNode[]>();
    for (const n of MAP15_NODES) {
      const k = n.sec.split('.').slice(0, 2).join('.');
      out.set(k, [...(out.get(k) ?? []), n]);
    }
    return [...out.entries()];
  }, []);
  const SEC_NAME: Record<string, string> = {
    '1': 'Gernu sistema',
    '1.1': 'Pronefrosa',
    '1.2': 'Mesonefrosa',
    '1.3': 'Metanefrosa',
    '2': 'Giltzurrunak',
    '2.1': 'Giltzurrun gaineko guruinak',
    '2.2': 'Sinu urogenitala',
    '2.3': 'Gernu maskuria',
    '2.4': 'Uretra',
  };

  return (
    <div className={local.map} tabIndex={-1}>
      <div className={local.top}>
        <MomentBar stages={MOMENTS} stage={moment} onStage={(n) => setMoment(Math.max(0, Math.min(LAST, n)))} />
        <div className={styles.seg2} role="group" aria-label="Sexua (uretra)">
          <span>Uretra</span>
          <button type="button" aria-pressed={sex === 0} className={sex === 0 ? styles.on : ''} onClick={() => setSex(0)}>
            Gizona
          </button>
          <button type="button" aria-pressed={sex === 1} className={sex === 1 ? styles.on : ''} onClick={() => setSex(1)}>
            Emakumea
          </button>
        </div>
      </div>
      <div className={local.body}>
        <div className={local.view}>
          <Room3D state={state} frame={frame} continuity="map15" label="15. gaiaren mapa osoa (3D)" pick={{ lit: lit3, related, onPick: pick3 }} />
          <p className={local.hint}>Sakatu egitura bat: argitu egiten da, eta harekin lotuta dagoena ere. Arrastatu biratzeko.</p>
        </div>
        <aside className={local.side} aria-live="polite">
          {tr && trail && (
            <div className={local.trailBox}>
              <div className={local.trailHead}>
                <b>{tr.title}</b>
                <button type="button" className={local.x} onClick={() => setTrail(null)} aria-label="Bidea itxi">
                  ✕
                </button>
              </div>
              <ol className={local.trailSteps}>
                {tr.steps.map((s, i) => (
                  <li key={`${s.id}${i}`}>
                    <button type="button" className={i === trail.i ? local.stepOn : i < trail.i ? local.stepPast : ''} onClick={() => goTrail(tr.id, i)} aria-label={`${i + 1}. urratsa`} />
                  </li>
                ))}
              </ol>
              <p className={local.trailLine}>{tr.steps[trail.i].line}</p>
              <div className={local.trailNav}>
                <button type="button" className={styles.btn} disabled={trail.i === 0} onClick={() => goTrail(tr.id, trail.i - 1)}>
                  ← Aurrekoa
                </button>
                <button type="button" className={styles.btn} disabled={trail.i === tr.steps.length - 1} onClick={() => goTrail(tr.id, trail.i + 1)}>
                  Hurrengoa →
                </button>
              </div>
            </div>
          )}
          {lit ? (
            <NodeCard id={lit} moment={moment} onPick={pick} />
          ) : (
            <div className={local.idle}>
              <h4>Gai osoa, eredu bakarrean</h4>
              <p>
                Goian unea aukeratu (4. astetik jaiotzera). Sakatu edozein egitura: nondik datorren, zer ematen duen, nondik ateratzen den, nora
                isurtzen duen eta zer duen ondoan ikusiko duzu, eta lotura bakoitza sakatuz hurrengora jauzi.
              </p>
              <div className={local.legend}>
                {(Object.keys(LAYER_NAME) as MapNode['layer'][]).map((l) => (
                  <span key={l} className={`${local.layer} ${LAYER_CLASS[l]}`}>
                    {LAYER_NAME[l]}
                  </span>
                ))}
              </div>
            </div>
          )}
          {!trail && (
            <div className={local.trails}>
              <span className={local.groupTitle}>Bideak: kateak ordenan</span>
              {MAP15_TRAILS.map((t) => (
                <button key={t.id} type="button" className={local.trailBtn} onClick={() => goTrail(t.id, 0)}>
                  <b>{t.title}</b>
                  <small>{t.lead}</small>
                </button>
              ))}
            </div>
          )}
        </aside>
      </div>
      <div className={local.index}>
        {bySec.map(([sec, nodes]) => (
          <div key={sec} className={local.indexRow}>
            <span className={local.indexSec}>
              <b>§{sec}</b> {SEC_NAME[sec]}
            </span>
            <div className={local.chips}>
              {nodes.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  className={`${local.chip} ${LAYER_CLASS[n.layer]}${alive(n, moment) ? '' : ` ${local.later}`}${lit === n.id ? ` ${local.chipOn}` : ''}`}
                  onClick={() => {
                    pick(n.id);
                    // The index lies under the model: bring the model back into view to see what lit.
                    document.getElementById('a15-mapa')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                >
                  <b>{nameOf(n.id)}</b>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Topic 15 study room. */
export function Topic15Study() {
  return (
    <section className={styles.room} id="a15-ikasgela" aria-labelledby="a15-title">
      <header className={styles.roomHead}>
        <p className={styles.eyebrow}>15. gaia · sistema urogenitala</p>
        <h2 id="a15-title">Mapa osoa: gai guztia eredu bakar batean</h2>
        <p className={styles.lead}>
          Simulagailuak gaia zatika erakusten du; hemen <b>dena batera</b>: hiru giltzurrunak atzeko paretan, Wolff hodia kloakaraino, kloaka
          banatuta, maskuria, urakoa eta uretra glandearaino. Zer dagoen <b>goian eta behean</b>, zer <b>ondoan</b> eta zer <b>nondik</b>{' '}
          ateratzen den, irudi bakarrean.
        </p>
      </header>
      <section className={styles.block} id="a15-mapa">
        <MapExplorer />
      </section>
    </section>
  );
}

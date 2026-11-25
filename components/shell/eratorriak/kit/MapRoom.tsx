'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { nameOf } from '@/content/registry';
import { GROUP_ORDER, LAYER_NAME, LINK_READ, type Layer, type LinkKind, type MapLink, type MapNode, type MapTrail } from '@/content/eratorriak/map-kit';
import type { Moment } from '@/content/eratorriak/model';
import { orbit, type CalloutSpec } from '@/components/scenes/week10/Heart3D';
import type { V3 } from '@/lib/three-d/math';
import type { Item3 } from '@/lib/three-d/scene';
import { MomentBar } from './MomentBar';
import { Room3D, useGlide, type Frame3 } from './Room3D';
import type { RoomViewState } from './StudyRoom';
import styles from '../eratorriak.module.css';
import local from './MapRoom.module.css';

/**
 * A topic as ONE model ("Mapa osoa", Ikasgela 15, 16 …). The simulator teaches a topic in separate models; here
 * they are one body, a moment bar runs it, and every structure answers "where does it come from, what does it
 * give, what sprouts out of it, where does it empty, what lies beside it, what is it in the other sex"
 * (content/eratorriak/mapN.ts). Picking lights the piece and what it is linked to; the panel says each link, and
 * a link picks the next piece, so the topic is walked as one web. Ready-made walks ("Bideak") read the classic
 * chains in order. A topic gives its data, its model and a few camera hints.
 */

export interface MapRoomSpec {
  /** Section anchor (scrolled back to when the index picks) and the 3D's continuity key. */
  anchor: string;
  week: number;
  label: string;
  nodes: MapNode[];
  links: MapLink[];
  trails: MapTrail[];
  moments: { id: string; title: string; when: string }[];
  /** The model at a moment that may lie between two; sex 0 male … 1 female. */
  model: (u: number, sex: number) => { items: Item3[]; pts: Record<string, V3> };
  /** Names with nothing picked, per moment (and sex). */
  landmarks: (moment: number, sex: 0 | 1) => string[];
  /** Small pieces: the camera's distance (and elevation, yaw) close on them. */
  close?: Record<string, number | { dist: number; elev?: number; yaw?: number }>;
  /** What hides a piece: see-through while it is picked. */
  xray?: Record<string, string[]>;
  overview: { target: V3; dist: number; yaw: number; elev: number };
  secName: Record<string, string>;
  /** The sex switch's label (topic 15: the urethra only; 16: everything). */
  sexLabel: string;
  /** From this moment on the sexes differ (before it the switch says so). */
  sexFrom?: number;
  idle: { title: string; text: string };
}

interface Rel {
  id: string;
  say?: string;
}
type Groups = { title: string; kind: LinkKind; items: Rel[] }[];

const LAYER_CLASS: Record<Layer, string> = {
  meso: local.meso,
  endo: local.endo,
  ekto: local.ekto,
  neural: local.neural,
  germ: local.germ,
  kanpo: local.kanpo,
};

/** A small glide of a few numbers (the camera), so a pick never cuts the view. */
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

export function MapRoom({ spec }: { spec: MapRoomSpec }) {
  const NODE = useMemo(() => new Map(spec.nodes.map((n) => [n.id, n])), [spec.nodes]);
  const LAST = spec.moments.length - 1;
  const moments: Moment[] = useMemo(() => spec.moments.map((m) => ({ id: m.id, title: m.title, when: m.when, sim: '', sec: '' })), [spec.moments]);
  const alive = useCallback((n: MapNode, m: number) => m >= n.at && m <= (n.until ?? LAST), [LAST]);
  const drawnAs = useCallback((id: string) => NODE.get(id)?.in3d ?? id, [NODE]);

  const [moment, setMoment] = useState(0);
  const [sex, setSex] = useState<0 | 1>(0);
  const [lit, setLit] = useState<string | null>(null);
  const [trail, setTrail] = useState<{ id: string; i: number } | null>(null);
  const sexU = useGlide(sex);

  const groupsOf = useCallback(
    (id: string): Groups => {
      const out = new Map<string, { kind: LinkKind; items: Rel[] }>();
      const put = (title: string, kind: LinkKind, r: Rel) => {
        const g = out.get(title) ?? { kind, items: [] };
        if (!g.items.some((x) => x.id === r.id)) g.items.push(r);
        out.set(title, g);
      };
      for (const l of spec.links) {
        if (l.a === id) put(LINK_READ[l.kind].out, l.kind, { id: l.b, say: l.say });
        if (l.b === id) put(LINK_READ[l.kind].in, l.kind, { id: l.a, say: l.say });
      }
      return GROUP_ORDER.filter((t) => out.has(t)).map((t) => ({ title: t, ...out.get(t)! }));
    },
    [spec.links],
  );

  /** Show a node: its moment if it is not drawn now, its sex if it has one. */
  const showNode = useCallback(
    (n: MapNode | undefined) => {
      if (!n) return;
      if (!alive(n, moment)) setMoment(n.at);
      if (n.sex) setSex(n.sex === 'f' ? 1 : 0);
    },
    [alive, moment],
  );
  const pick = useCallback(
    (id: string) => {
      setLit((cur) => (cur === id ? null : id));
      showNode(NODE.get(id));
    },
    [NODE, showNode],
  );
  // A pick in the 3D answers with the drawn id.
  const pick3 = useCallback((id: string) => (NODE.has(id) ? pick(id) : setLit(null)), [NODE, pick]);

  const tr = trail ? spec.trails.find((t) => t.id === trail.id) : undefined;
  const goTrail = useCallback(
    (id: string, i: number) => {
      const t = spec.trails.find((x) => x.id === id);
      if (!t) return;
      const k = Math.max(0, Math.min(t.steps.length - 1, i));
      const s = t.steps[k];
      setTrail({ id, i: k });
      setLit(s.id);
      if (s.moment !== undefined) setMoment(s.moment);
      const n = NODE.get(s.id);
      const sx = s.sex ?? n?.sex;
      if (sx) setSex(sx === 'f' ? 1 : 0);
    },
    [spec.trails, NODE],
  );

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
    // Only what is there now: a relation gone by this moment, not yet formed, or in the other sex (a
    // homologue) stays in the panel but is neither named nor lit on the model.
    const here = (id: string) => {
      const n = NODE.get(id);
      return !n || (alive(n, moment) && (!n.sex || (n.sex === 'f') === (sex === 1)));
    };
    const ids = new Set<string>();
    for (const l of spec.links) {
      if (l.a === lit && here(l.b)) ids.add(drawnAs(l.b));
      if (l.b === lit && here(l.a)) ids.add(drawnAs(l.a));
    }
    ids.delete(drawnAs(lit));
    return [...ids];
  }, [lit, spec.links, drawnAs, NODE, alive, moment, sex]);

  // The camera's goal: the whole system, or close on the picked piece (where it is at this moment).
  const goalPts = useMemo(() => spec.model(moment, sex).pts, [spec, moment, sex]);
  const lit3 = lit ? drawnAs(lit) : null;
  const litAt = lit3 ? goalPts[lit3] : undefined;
  const near = lit ? spec.close?.[lit] : undefined;
  const nearD = typeof near === 'number' ? { dist: near } : near;
  const ov = spec.overview;
  const goal = litAt
    ? [litAt[0], litAt[1], litAt[2], nearD?.dist ?? 15, nearD?.elev ?? ov.elev, nearD?.yaw ?? ov.yaw]
    : [ov.target[0], ov.target[1], ov.target[2], ov.dist, ov.elev, ov.yaw];
  const cam = useGlideVec(goal);

  const frame = useCallback(
    (u: number): Frame3 => {
      const model = spec.model(u, sexU);
      const xr = lit ? spec.xray?.[lit] : undefined;
      const items = xr ? model.items.map((it) => (it.id && xr.some((x) => it.id === x || it.groups?.includes(x)) ? { ...it, opacity: (it.opacity ?? 1) * 0.35 } : it)) : model.items;
      const m = Math.round(u);
      let names: CalloutSpec[];
      if (lit && lit3) {
        const n = NODE.get(lit);
        names = [{ id: lit3, p: lit3, show: 1, text: nameOf(lit), sub: n?.in3d ? `3D-an: ${nameOf(n.in3d)}` : undefined }];
        for (const id of related.slice(0, 7)) if (model.pts[id]) names.push({ id, p: id, show: 1, small: true });
      } else names = spec.landmarks(m, sexU > 0.5 ? 1 : 0).filter((id) => model.pts[id]).map((id) => ({ id, p: id, show: 1 }));
      return { items, pts: model.pts, camera: orbit(cam[5], cam[4], cam[3], [cam[0], cam[1], cam[2]]), names };
    },
    [spec, NODE, sexU, lit, lit3, related, cam],
  );

  const state: RoomViewState = {
    stage: moment,
    mode: 'origin',
    lit: new Set(),
    labels: true,
    names: 'guztiak',
    stages: spec.moments.map((m) => m.title),
    onStage: (n) => setMoment(Math.max(0, Math.min(LAST, n))),
  };

  const bySec = useMemo(() => {
    const out = new Map<string, MapNode[]>();
    for (const n of spec.nodes) {
      const k = n.sec.split('.').slice(0, 2).join('.');
      out.set(k, [...(out.get(k) ?? []), n]);
    }
    return [...out.entries()];
  }, [spec.nodes]);

  const Chip = ({ id, say }: { id: string; say?: string }) => {
    const n = NODE.get(id);
    const here = n ? alive(n, moment) && (!n.sex || (n.sex === 'f') === (sex === 1)) : false;
    return (
      <button type="button" className={`${local.chip} ${n ? LAYER_CLASS[n.layer] : ''}${here ? '' : ` ${local.later}`}`} onClick={() => pick(id)}>
        <b>
          {nameOf(id)}
          {n?.sex && <i className={local.sexTag}>{n.sex === 'f' ? '♀' : '♂'}</i>}
        </b>
        {say && <small>{say}</small>}
      </button>
    );
  };

  const card = (id: string) => {
    const n = NODE.get(id);
    if (!n) return null;
    const first = spec.moments[n.at];
    return (
      <div className={local.card}>
        <div className={local.cardHead}>
          <span className={`${local.layer} ${LAYER_CLASS[n.layer]}`}>{LAYER_NAME[n.layer]}</span>
          <h4>
            {nameOf(id)}
            {n.sex && <i className={local.sexTag}>{n.sex === 'f' ? '♀' : '♂'}</i>}
          </h4>
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
          {groupsOf(id).map((g) => (
            <div key={g.title} className={`${local.group}${g.kind === 'homologoa' ? ` ${local.homolog}` : ''}`}>
              <span className={local.groupTitle}>{g.title}</span>
              <div className={local.chips}>
                {g.items.map((r) => (
                  <Chip key={r.id} id={r.id} say={r.say} />
                ))}
              </div>
            </div>
          ))}
        </div>
        {n.stage && (
          <Link className={local.simLink} href={`/astea/${spec.week}?etapa=${n.stage}`}>
            Simulagailuan gertutik ikusi →
          </Link>
        )}
      </div>
    );
  };

  const sexSame = spec.sexFrom !== undefined && moment < spec.sexFrom;
  return (
    <div className={local.map} tabIndex={-1}>
      <div className={local.top}>
        <MomentBar stages={moments} stage={moment} onStage={(n) => setMoment(Math.max(0, Math.min(LAST, n)))} />
        <div className={`${styles.seg2}${sexSame ? ` ${local.same}` : ''}`} role="group" aria-label={spec.sexLabel} title={sexSame ? 'Une honetan berdinak dira sexu bietan' : undefined}>
          <span>{spec.sexLabel}</span>
          <button type="button" aria-pressed={sex === 0} className={sex === 0 ? styles.on : ''} onClick={() => setSex(0)}>
            ♂ Gizona
          </button>
          <button type="button" aria-pressed={sex === 1} className={sex === 1 ? styles.on : ''} onClick={() => setSex(1)}>
            ♀ Emakumea
          </button>
        </div>
      </div>
      <div className={local.body}>
        <div className={local.view}>
          <Room3D state={state} frame={frame} continuity={spec.anchor} label={spec.label} pick={{ lit: lit3, related, onPick: pick3 }} />
          <p className={local.hint}>
            {sexSame ? 'Desberdindu gabeko aroa: berdina sexu bietan. ' : ''}Sakatu egitura bat: argitu egiten da, eta harekin lotuta dagoena ere. Arrastatu
            biratzeko.
          </p>
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
            card(lit)
          ) : (
            <div className={local.idle}>
              <h4>{spec.idle.title}</h4>
              <p>{spec.idle.text}</p>
              <div className={local.legend}>
                {[...new Set(spec.nodes.map((n) => n.layer))].map((l) => (
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
              {spec.trails.map((t) => (
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
              <b>§{sec}</b> {spec.secName[sec]}
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
                    document.getElementById(spec.anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                >
                  <b>
                    {nameOf(n.id)}
                    {n.sex && <i className={local.sexTag}>{n.sex === 'f' ? '♀' : '♂'}</i>}
                  </b>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

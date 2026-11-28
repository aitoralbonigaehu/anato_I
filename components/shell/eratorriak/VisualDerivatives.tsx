'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { SceneView } from '@/components/kit';
import { Defs } from '@/components/kit/Defs';
import {
  LabelScaleContext,
  SceneContext,
  TextLayerContext,
  UnderlayContext,
  type LookSide,
  type SceneContextValue,
  type Underlay,
} from '@/components/kit/context';
import { getWeek, isSpace, nameOf, partsOf, structures } from '@/content/registry';
import { buildVisualFlows, type VisualFlow, type VisualNode } from '@/lib/learning/visual-derivatives';
import { categoryColor } from '@/lib/sim/palette';
import { TaughtOnly } from '@/lib/sim/taught-context';
import type { MNode } from '@/content/migrations';
import type { Orientation, SceneComponent } from '@/lib/sim/types';
// Prewarm off-thread 3D sculpted meshes so stepping through a tree never hits a loading spinner.
import { warmGeo } from '@/lib/three-d/geo-client';
import styles from './VisualDerivatives.module.css';
import { topicNo } from '@/content/topic-no';

const subscribeNothing = () => () => {};

const FROM_SIDE: Record<string, string> = {
  Bentrala: 'Aurretik',
  Dortsala: 'Atzetik',
  Ezkerra: 'Ezkerretik',
  Eskuina: 'Eskuinetik',
  Kraneala: 'Goitik',
  Kaudala: 'Behetik',
  Aurrea: 'Aurretik',
  Atzea: 'Atzetik',
  Goia: 'Goitik',
  Behea: 'Behetik',
};
const fromSide = (name: string) => FROM_SIDE[name] ?? `${name}etik`;
const lookOrder = (names: Record<LookSide, string>): LookSide[] => {
  const sides: LookSide[] = names.side === 'Eskuina' ? ['otherSide', 'side'] : ['side', 'otherSide'];
  return ['front', 'back', ...sides, 'up', 'down'];
};

/** Smoothly glides `t` when staying within the same 3D scene; snaps immediately when switching scenes. */
function useSmoothT(sceneKey: string, targetT: number): number {
  const [val, setVal] = useState({ key: sceneKey, t: targetT });
  const stateRef = useRef({ key: sceneKey, t: targetT });

  useEffect(() => {
    const prev = stateRef.current;
    if (prev.key !== sceneKey) {
      stateRef.current = { key: sceneKey, t: targetT };
      const raf = requestAnimationFrame(() => setVal({ key: sceneKey, t: targetT }));
      return () => cancelAnimationFrame(raf);
    }
    const from = prev.t;
    if (Math.abs(from - targetT) < 0.001) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const ms = reduce ? 1 : Math.min(1200, Math.max(420, Math.abs(targetT - from) * 1400));
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / ms);
      const e = p * p * (3 - 2 * p);
      const next = from + (targetT - from) * e;
      stateRef.current = { key: sceneKey, t: next };
      setVal({ key: sceneKey, t: next });
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [sceneKey, targetT]);

  return val.key === sceneKey ? val.t : targetT;
}

interface StageCanvasProps {
  Scene: SceneComponent;
  sceneKey: string;
  t: number;
  orientation?: Orientation;
  spotlight: string | null;
  focus: readonly string[];
  mentioned: readonly string[];
  hovered: string | null;
  showLabels: boolean;
  taughtOnly: boolean;
  label: string;
  big: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  onToggleLabels: () => void;
  onToggleBig: () => void;
}

function VisualStageCanvas({
  Scene,
  sceneKey,
  t,
  orientation,
  spotlight,
  focus,
  mentioned,
  hovered,
  showLabels,
  taughtOnly,
  label,
  big,
  onSelect,
  onHover,
  onToggleLabels,
  onToggleBig,
}: StageCanvasProps) {
  const mounted = useSyncExternalStore(subscribeNothing, () => true, () => false);
  const [host, setHost] = useState<HTMLDivElement | null>(null);
  const [sceneEl, setSceneEl] = useState<SVGGElement | null>(null);
  const [textLayer, setTextLayer] = useState<SVGGElement | null>(null);
  const [turn, setTurn] = useState<Underlay['orbitRequest']>(undefined);
  const [liveOrient, setLiveOrient] = useState<Orientation | null>(null);
  const [liveLook, setLiveLook] = useState<{ names: Record<LookSide, string>; facing?: LookSide } | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(1.45);
  const smoothT = useSmoothT(sceneKey, t);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => setK(Math.min(2.3, Math.max(1, (0.94 * 1000) / Math.max(1, el.clientWidth))));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const underlay = useMemo<Underlay | null>(
    () =>
      host
        ? {
            host,
            scene: sceneEl,
            zoomed: false,
            orbitRequest: turn,
            setOrient: setLiveOrient,
            setLook: setLiveLook,
          }
        : null,
    [host, sceneEl, turn],
  );

  const ctx = useMemo<SceneContextValue>(
    () => ({
      selected: null,
      hovered,
      focus,
      mentioned,
      spotlight,
      spotKeep: true,
      dimContext: !!(spotlight || focus.length),
      showLabels,
      quiz: false,
      quizFlash: null,
      nameOf,
      isSpace,
      partsOf,
      onSelect,
      onHover,
    }),
    [hovered, focus, mentioned, spotlight, showLabels, onSelect, onHover],
  );

  const ask = (direction: NonNullable<Underlay['orbitRequest']>['direction'], look?: LookSide) =>
    setTurn((prev) => ({ direction, look, serial: (prev?.serial ?? 0) + 1 }));

  const edges = liveOrient ?? orientation ?? null;
  const labelScale = useMemo(
    () => ({
      k,
      left: !!edges?.left,
      right: !!edges?.right,
      keysTop: 568,
      chrome: [{ x0: 420, y0: 572, x1: 996, y1: 636 }],
    }),
    [k, edges?.left, edges?.right],
  );

  return (
    <div className={`${styles.stage} theme-stage${big ? ` ${styles.stageBig}` : ''}`} ref={box}>
      <div ref={setHost} className={styles.underlay} aria-hidden />
      <svg
        viewBox="0 0 1000 640"
        preserveAspectRatio="xMidYMid meet"
        className={styles.svg}
        role="img"
        aria-label={`${label}: arrastatu biratzeko`}
      >
        <Defs />
        <g ref={setSceneEl}>
          {mounted && (
            <TaughtOnly.Provider value={taughtOnly}>
              <SceneContext.Provider value={ctx}>
                <UnderlayContext.Provider value={underlay}>
                  <TextLayerContext.Provider value={textLayer}>
                    <LabelScaleContext.Provider value={labelScale}>
                      <SceneView Scene={Scene} t={smoothT} reduced={false} />
                    </LabelScaleContext.Provider>
                  </TextLayerContext.Provider>
                </UnderlayContext.Provider>
              </SceneContext.Provider>
            </TaughtOnly.Provider>
          )}
        </g>
        <g ref={setTextLayer} />
      </svg>

      {edges && (
        <div className={styles.orientEdges} aria-hidden>
          {edges.top && <span className={`${styles.edgePill} ${styles.edgeTop}`}>{edges.top}</span>}
          {edges.bottom && <span className={`${styles.edgePill} ${styles.edgeBottom}`}>{edges.bottom}</span>}
          {edges.left && <span className={`${styles.edgePill} ${styles.edgeLeft}`}>{edges.left}</span>}
          {edges.right && <span className={`${styles.edgePill} ${styles.edgeRight}`}>{edges.right}</span>}
        </div>
      )}

      <div className={styles.turnKeys}>
        {liveLook ? (
          <div className={styles.lookGroup} role="group" aria-label="Ikuspegi anatomikoak">
            {lookOrder(liveLook.names).map((side) => (
              <button
                key={side}
                type="button"
                aria-pressed={liveLook.facing === side}
                className={liveLook.facing === side ? styles.keyActive : undefined}
                onClick={() => ask('look', side)}
                title={`${liveLook.names[side]} aldetik ikusi`}
              >
                {fromSide(liveLook.names[side])}
              </button>
            ))}
          </div>
        ) : (
          <>
            <button type="button" onClick={() => ask('left')} aria-label="Biratu ezkerrera" title="Biratu ezkerrera">
              ⟲
            </button>
            <button type="button" onClick={() => ask('reset')} title="Hasierako ikuspegira itzuli">
              Aurretik
            </button>
            <button type="button" onClick={() => ask('right')} aria-label="Biratu eskuinera" title="Biratu eskuinera">
              ⟳
            </button>
          </>
        )}
        <button type="button" onClick={onToggleLabels} aria-pressed={showLabels} title="3D etiketak erakutsi edo ezkutatu">
          {showLabels ? 'Izenak ✓' : 'Izenak'}
        </button>
        <button type="button" onClick={onToggleBig} title={big ? 'Itxi (Esc)' : 'Pantaila handian ikusi'}>
          {big ? 'Itxi' : 'Handitu'}
        </button>
      </div>
    </div>
  );
}

interface TreeBranchProps {
  node: MNode;
  pathKey: string;
  vFlow: VisualFlow;
  selectedKey: string;
  ancestorSet: ReadonlySet<string>;
  descendantIdSet: ReadonlySet<string>;
  hoveredId: string | null;
  quizOn: boolean;
  revealed: ReadonlySet<string>;
  onSelectNode: (vNode: VisualNode) => void;
  onHoverId: (id: string | null) => void;
}

function TreeBranch({
  node,
  pathKey,
  vFlow,
  selectedKey,
  ancestorSet,
  descendantIdSet,
  hoveredId,
  quizOn,
  revealed,
  onSelectNode,
  onHoverId,
}: TreeBranchProps) {
  const vNode = vFlow.byKey.get(pathKey);
  if (!vNode) return null;

  const isSelected = pathKey === selectedKey;
  const isAncestor = ancestorSet.has(pathKey);
  const isDescendant = !isSelected && !isAncestor && !!(vNode.id && descendantIdSet.has(vNode.id));
  const isHovered = !!(hoveredId && vNode.id && hoveredId === vNode.id);
  const isHidden = quizOn && !vNode.isRoot && !vNode.isGroup && !revealed.has(pathKey);
  const struct = vNode.id ? structures.get(vNode.id) : undefined;
  const dotColor = struct ? (struct.color ?? categoryColor[struct.category]) : undefined;

  return (
    <li className={styles.branchItem}>
      {vNode.isGroup ? (
        <div className={styles.groupHeading}>
          <span>{vNode.label}</span>
          {node.note && <em>{node.note}</em>}
        </div>
      ) : (
        <div className={styles.nodeRow}>
          {!vNode.isRoot && (
            <span className={`${styles.edgeTag}${node.move ? ` ${styles.edgeMove}` : ''}`}>
              <span className={styles.edgeArrow} aria-hidden>
                {node.move ? '⇢' : '→'}
              </span>
              {node.via && <span className={styles.edgeVia}>{node.via}</span>}
            </span>
          )}
          <button
            type="button"
            className={[
              styles.nodeBtn,
              isSelected && styles.isSelected,
              isAncestor && styles.isAncestor,
              isDescendant && styles.isDescendant,
              isHovered && styles.isHovered,
              node.gone && styles.isGone,
              node.blue && styles.isBlue,
              isHidden && styles.isHidden,
            ]
              .filter(Boolean)
              .join(' ')}
            aria-current={isSelected ? 'step' : undefined}
            onClick={() => onSelectNode(vNode)}
            onMouseEnter={() => onHoverId(vNode.effectiveId)}
            onMouseLeave={() => onHoverId(null)}
            onFocus={() => onHoverId(vNode.effectiveId)}
            onBlur={() => onHoverId(null)}
          >
            {dotColor ? (
              <i className={styles.dot} style={{ background: dotColor }} aria-hidden />
            ) : (
              <i className={`${styles.dot} ${node.gone ? styles.dotGone : styles.dotPlain}`} aria-hidden />
            )}
            <span className={styles.nodeText}>
              <strong>{isHidden ? 'Sakatu ikusteko…' : vNode.label}</strong>
              {!isHidden && node.note && <em>{node.note}</em>}
            </span>
            {vNode.target?.exact && (
              <span className={styles.badge3d} title="3D ereduan zuzenean kokatuta">
                3D
              </span>
            )}
          </button>
        </div>
      )}
      {!!node.kids?.length && (
        <ul className={styles.childrenList}>
          {node.kids.map((child, idx) => (
            <TreeBranch
              key={`${pathKey}.${idx}`}
              node={child}
              pathKey={`${pathKey}.${idx}`}
              vFlow={vFlow}
              selectedKey={selectedKey}
              ancestorSet={ancestorSet}
              descendantIdSet={descendantIdSet}
              hoveredId={hoveredId}
              quizOn={quizOn}
              revealed={revealed}
              onSelectNode={onSelectNode}
              onHoverId={onHoverId}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export interface VisualDerivativesProps {
  week: number;
  taughtOnly: boolean;
}

export function VisualDerivatives({ week, taughtOnly }: VisualDerivativesProps) {
  const flows = useMemo(() => buildVisualFlows(week, taughtOnly), [week, taughtOnly]);
  const [flowIdx, setFlowIdx] = useState(0);
  const safeFlowIdx = flowIdx < flows.length ? flowIdx : 0;
  const vFlow = flows[safeFlowIdx] ?? null;

  const [selectedKey, setSelectedKey] = useState<string>(() => vFlow?.steps[0]?.key ?? '0');
  const [viewOverride, setViewOverride] = useState<{ stageKey: string; viewIndex: number } | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [pickedOutside, setPickedOutside] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [quizOn, setQuizOn] = useState(false);
  const [revealed, setRevealed] = useState<ReadonlySet<string>>(new Set());
  const [playing, setPlaying] = useState(false);
  const [big, setBig] = useState(false);

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const activeNode: VisualNode | null = useMemo(() => {
    if (!vFlow) return null;
    return vFlow.byKey.get(selectedKey) ?? vFlow.steps[0] ?? null;
  }, [vFlow, selectedKey]);

  const stepIdx = useMemo(() => {
    if (!vFlow || !activeNode) return 0;
    const i = vFlow.steps.findIndex((s) => s.key === activeNode.key);
    return i >= 0 ? i : 0;
  }, [vFlow, activeNode]);

  const selectFlow = useCallback(
    (idx: number) => {
      const next = flows[idx];
      setFlowIdx(idx);
      setSelectedKey(next?.steps[0]?.key ?? '0');
      setViewOverride(null);
      setPickedOutside(null);
      setPlaying(false);
      setRevealed(new Set());
      tabRefs.current[idx]?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    },
    [flows],
  );

  const selectNode = useCallback((vNode: VisualNode) => {
    setSelectedKey(vNode.key);
    setPickedOutside(null);
    setPlaying(false);
    setRevealed((prev) => {
      if (prev.has(vNode.key)) return prev;
      const next = new Set(prev);
      next.add(vNode.key);
      return next;
    });
  }, []);

  const stepTo = useCallback(
    (idx: number) => {
      if (!vFlow || !vFlow.steps.length) return;
      const clamped = Math.max(0, Math.min(vFlow.steps.length - 1, idx));
      const next = vFlow.steps[clamped];
      setSelectedKey(next.key);
      setPickedOutside(null);
      setRevealed((prev) => {
        if (prev.has(next.key)) return prev;
        const copy = new Set(prev);
        copy.add(next.key);
        return copy;
      });
    },
    [vFlow],
  );

  // Auto-step playback through the derivative tree.
  useEffect(() => {
    if (!playing || !vFlow) return;
    const id = window.setInterval(() => {
      setSelectedKey((cur) => {
        const i = vFlow.steps.findIndex((s) => s.key === cur);
        const nextIdx = i + 1;
        if (nextIdx >= vFlow.steps.length) {
          setPlaying(false);
          return cur;
        }
        const nextNode = vFlow.steps[nextIdx];
        setRevealed((prev) => {
          const copy = new Set(prev);
          copy.add(nextNode.key);
          return copy;
        });
        return nextNode.key;
      });
    }, 3200);
    return () => window.clearInterval(id);
  }, [playing, vFlow]);

  // Native <dialog> modal lifecycle for fullscreen 3D view.
  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    if (big && !dlg.open) {
      dlg.showModal();
    } else if (!big && dlg.open) {
      dlg.close();
    }
  }, [big]);

  // Fallback light-dismiss for browsers without native <dialog closedby="any"> (Safari).
  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg || !big || 'closedBy' in HTMLDialogElement.prototype) return;
    const outside = (e: PointerEvent) => {
      const r = dlg.getBoundingClientRect();
      return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    };
    let pressedOut = false;
    const onDown = (e: PointerEvent) => {
      pressedOut = outside(e);
    };
    const onUp = (e: PointerEvent) => {
      if (pressedOut && outside(e)) dlg.close();
    };
    dlg.addEventListener('pointerdown', onDown);
    dlg.addEventListener('pointerup', onUp);
    return () => {
      dlg.removeEventListener('pointerdown', onDown);
      dlg.removeEventListener('pointerup', onUp);
    };
  }, [big]);

  const handle3DPick = useCallback(
    (structureId: string) => {
      if (!vFlow) return;
      const match = vFlow.byStructureId.get(structureId);
      if (match) {
        selectNode(match);
      } else {
        setPickedOutside(structureId);
      }
    },
    [vFlow, selectNode],
  );

  const target = activeNode?.target ?? null;
  const stageDef = useMemo(() => {
    if (!target) return null;
    return getWeek(target.week)?.stages.find((s) => s.id === target.stageId) ?? null;
  }, [target]);

  const stageKey = target ? `${target.week}:${target.stageId}` : '';
  const activeViewIndex =
    stageDef && viewOverride?.stageKey === stageKey && stageDef.views[viewOverride.viewIndex]
      ? viewOverride.viewIndex
      : (target?.viewIndex ?? 0);
  const activeView = stageDef?.views[activeViewIndex] ?? stageDef?.views[0] ?? null;
  const sceneKey = target && activeView ? `${target.week}:${target.stageId}:${activeView.id}` : '';

  const ancestorSet = useMemo(() => new Set(activeNode?.ancestorKeys ?? []), [activeNode]);
  const descendantIdSet = useMemo(() => new Set(activeNode?.descendantIds ?? []), [activeNode]);

  const focusIds = useMemo(() => {
    if (!activeNode) return [];
    const set = new Set<string>();
    if (activeNode.effectiveId) set.add(activeNode.effectiveId);
    for (const id of activeNode.ancestorIds) set.add(id);
    for (const id of activeNode.descendantIds) set.add(id);
    return [...set];
  }, [activeNode]);

  // Prewarm off-thread 3D geometries for all steps of the current flow (and next flow) so stepping never shows a spinner.
  useEffect(() => {
    const keys = new Set<string>();
    const collect = (flowItem: VisualFlow | undefined) => {
      if (!flowItem) return;
      for (const s of flowItem.steps) {
        if (!s.target) continue;
        const st = getWeek(s.target.week)?.stages.find((x) => x.id === s.target!.stageId);
        const view = st?.views[s.target.viewIndex] ?? st?.views[0];
        const geo = (view?.scene as { geo?: string[] } | undefined)?.geo;
        geo?.forEach((g) => keys.add(g));
      }
    };
    collect(vFlow ?? undefined);
    collect(flows[safeFlowIdx + 1]);
    if (keys.size) warmGeo([...keys]);
  }, [vFlow, flows, safeFlowIdx]);

  const effectiveShowLabels = showLabels && (!quizOn || !activeNode || activeNode.isRoot || revealed.has(activeNode.key));

  const mentionedIds = useMemo(() => {
    if (!effectiveShowLabels || !activeNode?.effectiveId) return [];
    return [activeNode.effectiveId];
  }, [effectiveShowLabels, activeNode]);

  const breadcrumbNodes = useMemo(() => {
    if (!vFlow || !activeNode) return [];
    return [...activeNode.ancestorKeys.map((k) => vFlow.byKey.get(k)).filter((x): x is VisualNode => !!x && !x.isGroup), activeNode];
  }, [vFlow, activeNode]);

  const activeStruct = activeNode?.effectiveId ? structures.get(activeNode.effectiveId) : undefined;
  const pickedOutsideStruct = pickedOutside ? structures.get(pickedOutside) : undefined;

  if (!flows.length || !vFlow || !activeNode) {
    return (
      <section className={styles.empty}>
        <p>Gai honetan ez dago eratorri bisualik erakusteko.</p>
      </section>
    );
  }

  const stageProps: StageCanvasProps | null =
    activeView && target
      ? {
          Scene: activeView.scene,
          sceneKey,
          t: target.t,
          orientation: activeView.orientation,
          spotlight: pickedOutside ?? activeNode.effectiveId,
          focus: focusIds,
          mentioned: mentionedIds,
          hovered: hoveredId,
          showLabels: effectiveShowLabels,
          taughtOnly,
          label: `${vFlow.flow.title} — ${target.stageTitle}`,
          big,
          onSelect: handle3DPick,
          onHover: setHoveredId,
          onToggleLabels: () => setShowLabels((v) => !v),
          onToggleBig: () => setBig((v) => !v),
        }
      : null;

  return (
    <section className={styles.root} aria-label="Eratorri bisualak (3D)">
      <header className={styles.introBar}>
        <div>
          <p className={styles.introK}>Eratorri bisualak · 3D</p>
          <p className={styles.introText}>
            Sakatu zuhaitzeko edozein egitura 3D ereduan kokatzeko, edo erabili <b>Ibilbidea</b> jatorritik eratorrietara pausoz pauso joateko.
          </p>
        </div>
        <div className={styles.introActions}>
          <button
            type="button"
            className={`${styles.toggleBtn}${quizOn ? ` ${styles.isOn}` : ''}`}
            aria-pressed={quizOn}
            onClick={() => {
              setQuizOn((q) => !q);
              setRevealed(new Set());
              setPlaying(false);
            }}
            title="Zuhaitzeko eratorrien eta 3Daren izenak ezkutatu, zeure burua probatzeko"
          >
            <i aria-hidden />
            <span>Proba modua</span>
          </button>
        </div>
      </header>

      <div className={styles.flowTabs} role="tablist" aria-label="Gaiaren eratorri-zuhaitzak">
        {flows.map((item, idx) => (
          <button
            key={item.flow.id}
            ref={(el) => {
              tabRefs.current[idx] = el;
            }}
            type="button"
            role="tab"
            aria-selected={idx === safeFlowIdx}
            className={styles.flowTab}
            onClick={() => selectFlow(idx)}
          >
            <b>{String(idx + 1).padStart(2, '0')}</b>
            <span>{item.flow.title}</span>
          </button>
        ))}
      </div>

      <div
        className={styles.studio}
        onKeyDown={(e) => {
          if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
          if (e.key === 'ArrowRight') {
            e.preventDefault();
            setPlaying(false);
            stepTo(stepIdx + 1);
          } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            setPlaying(false);
            stepTo(stepIdx - 1);
          }
        }}
      >
        <div className={styles.treePane}>
          <header className={styles.flowHead}>
            {vFlow.mapTitle && <p className={styles.mapK}>{vFlow.mapTitle}</p>}
            <h3>{vFlow.flow.title}</h3>
            {vFlow.flow.lead && <p className={styles.flowLead}>{vFlow.flow.lead}</p>}
          </header>

          <div className={styles.treeBox} aria-label="Eratorrien zuhaitza">
            <ul className={styles.rootList}>
              {vFlow.flow.roots.map((root, idx) => (
                <TreeBranch
                  key={`${vFlow.flow.id}-${idx}`}
                  node={root}
                  pathKey={String(idx)}
                  vFlow={vFlow}
                  selectedKey={activeNode.key}
                  ancestorSet={ancestorSet}
                  descendantIdSet={descendantIdSet}
                  hoveredId={hoveredId}
                  quizOn={quizOn}
                  revealed={revealed}
                  onSelectNode={selectNode}
                  onHoverId={setHoveredId}
                />
              ))}
            </ul>
            {vFlow.flow.join && (
              <div className={styles.joinBlock}>
                <p className={styles.joinLabel}>{vFlow.flow.joinVia ?? 'Fusionatzen dira'}</p>
                <ul className={styles.rootList}>
                  <TreeBranch
                    node={{ ...vFlow.flow.join, via: vFlow.flow.joinVia ?? vFlow.flow.join.via }}
                    pathKey="j.0"
                    vFlow={vFlow}
                    selectedKey={activeNode.key}
                    ancestorSet={ancestorSet}
                    descendantIdSet={descendantIdSet}
                    hoveredId={hoveredId}
                    quizOn={quizOn}
                    revealed={revealed}
                    onSelectNode={selectNode}
                    onHoverId={setHoveredId}
                  />
                </ul>
              </div>
            )}
          </div>

          {!!vFlow.flow.pitfalls?.length && (
            <aside className={styles.kontuz} aria-label="Kontuz">
              <b>Kontuz</b>
              <ul>
                {vFlow.flow.pitfalls.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </aside>
          )}
        </div>

        <div className={styles.stagePane}>
          <div className={styles.stageSticky}>
            <div className={styles.stageMeta}>
              <div className={styles.stageMetaText}>
                {target && (
                  <>
                    <span className={styles.stageBadge}>
                      {topicNo(target.week)}. gaia · {target.stageTitle}
                    </span>
                    {target.stagePeriod && <span className={styles.stagePeriod}>{target.stagePeriod}</span>}
                  </>
                )}
              </div>
              {target && (
                <Link className={styles.simLink} href={target.href}>
                  Simulagailuan <span aria-hidden>→</span>
                </Link>
              )}
            </div>

            {stageDef && stageDef.views.length > 1 && (
              <div className={styles.viewTabs} role="tablist" aria-label="3D ikuspegiak">
                {stageDef.views.map((v, i) => (
                  <button
                    key={v.id}
                    type="button"
                    role="tab"
                    aria-selected={i === activeViewIndex}
                    className={styles.viewTab}
                    onClick={() => setViewOverride({ stageKey, viewIndex: i })}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            )}

            {stageProps ? (
              big ? (
                <div className={`${styles.stage} ${styles.stagePlaceholder} theme-stage`} aria-hidden />
              ) : (
                <VisualStageCanvas {...stageProps} />
              )
            ) : (
              <div className={styles.noStage}>Ez dago 3D eredurik etapa honetarako.</div>
            )}

            <div className={styles.stepper}>
              <button
                type="button"
                className={styles.stepBtn}
                disabled={stepIdx <= 0}
                onClick={() => {
                  setPlaying(false);
                  stepTo(stepIdx - 1);
                }}
              >
                ← Aurrekoa
              </button>
              <span className={styles.stepCount} aria-live="polite">
                {stepIdx + 1} / {vFlow.steps.length}
              </span>
              <button
                type="button"
                className={styles.stepBtn}
                disabled={stepIdx >= vFlow.steps.length - 1}
                onClick={() => {
                  setPlaying(false);
                  stepTo(stepIdx + 1);
                }}
              >
                Hurrengoa →
              </button>
              <button
                type="button"
                className={`${styles.playBtn}${playing ? ` ${styles.isPlaying}` : ''}`}
                aria-pressed={playing}
                onClick={() => {
                  if (playing) {
                    setPlaying(false);
                  } else {
                    if (stepIdx >= vFlow.steps.length - 1) stepTo(0);
                    setPlaying(true);
                  }
                }}
              >
                {playing ? '⏸ Gelditu' : '▶ Ibilbidea'}
              </button>
            </div>

            <div className={styles.infoCard}>
              <nav className={styles.crumbs} aria-label="Jatorri katea">
                {breadcrumbNodes.map((b, i) => {
                  const hiddenCrumb = quizOn && !b.isRoot && !revealed.has(b.key);
                  return (
                    <span key={b.key} className={styles.crumbItem}>
                      {i > 0 && <span aria-hidden>→</span>}
                      <button
                        type="button"
                        className={b.key === activeNode.key ? styles.crumbActive : undefined}
                        onClick={() => selectNode(b)}
                      >
                        {hiddenCrumb ? '•••' : b.label}
                      </button>
                    </span>
                  );
                })}
              </nav>

              <div className={styles.infoBody}>
                <h4>
                  {quizOn && !activeNode.isRoot && !revealed.has(activeNode.key)
                    ? 'Asmatu egitura 3D ereduan'
                    : activeNode.label}
                </h4>
                {(activeNode.node.via || activeNode.node.note) && (
                  <p className={styles.infoMeta}>
                    {activeNode.node.via && <span>{activeNode.node.via}</span>}
                    {activeNode.node.note && <em>{activeNode.node.note}</em>}
                  </p>
                )}
                {activeStruct?.definition && !(quizOn && !activeNode.isRoot && !revealed.has(activeNode.key)) && (
                  <p className={styles.infoDef}>{activeStruct.definition}</p>
                )}
              </div>

              {pickedOutsideStruct && (
                <div className={styles.outsideNote}>
                  <div>
                    <b>3Dn hautatua: {pickedOutsideStruct.name}</b>
                    {pickedOutsideStruct.definition && <p>{pickedOutsideStruct.definition}</p>}
                  </div>
                  <button type="button" onClick={() => setPickedOutside(null)}>
                    Itzuli zuhaitzera
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        className={styles.bigDialog}
        aria-labelledby="visual-big-title"
        onClose={() => setBig(false)}
        {...({ closedby: 'any' } as Record<string, string>)}
      >
        {big && stageProps && (
          <div className={styles.bigWrap}>
            <header className={styles.bigBar}>
              <div className={styles.bigTitle}>
                <h1 id="visual-big-title">{activeNode.label}</h1>
                {activeNode.node.via && <span>{activeNode.node.via}</span>}
              </div>
              <div className={styles.bigControls}>
                <button type="button" disabled={stepIdx <= 0} onClick={() => stepTo(stepIdx - 1)}>
                  ← Aurrekoa
                </button>
                <span className={styles.stepCount}>
                  {stepIdx + 1} / {vFlow.steps.length}
                </span>
                <button type="button" disabled={stepIdx >= vFlow.steps.length - 1} onClick={() => stepTo(stepIdx + 1)}>
                  Hurrengoa →
                </button>
                <button type="button" autoFocus onClick={() => setBig(false)}>
                  Itxi
                </button>
              </div>
            </header>
            <div className={styles.bigStageSlot}>
              <VisualStageCanvas {...stageProps} big />
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}

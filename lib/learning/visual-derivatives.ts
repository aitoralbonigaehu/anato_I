import { LEARNING_MAPS } from '@/content/eratorriak/learning-maps';
import { flowShown, hasBlueContent, taughtFlow } from '@/content/eratorriak/taught';
import { MIGRATIONS, type Flow, type MNode } from '@/content/migrations';
import { appearances, getWeek, structures } from '@/content/registry';
import type { StageDef, ViewDef } from '@/lib/sim/types';

/** Topics 15+ have full 3D simulator models that back every derivative tree. */
export const VISUAL_MIN_WEEK = 15;

export function hasVisualDerivatives(week: number): boolean {
  return week >= VISUAL_MIN_WEEK && MIGRATIONS.some((m) => m.week === week);
}

export interface VisualTarget {
  /** Simulator week owning the 3D scene (for topic 20, resolves to week 19). */
  week: number;
  stageId: string;
  stageTitle: string;
  stagePeriod: string;
  viewIndex: number;
  viewId: string;
  viewLabel: string;
  beatIndex: number;
  /** Settled progress (0..1) inside the target beat so morphs and labels are complete. */
  t: number;
  /** Structure ID to spotlight in the 3D model, if any. */
  structureId: string | null;
  /** True when the target structure is explicitly present in that stage. */
  exact: boolean;
  href: string;
}

export interface VisualNode {
  key: string;
  node: MNode;
  label: string;
  /** The node's own structure id (only when it exists in the structure registry). */
  id: string | null;
  /** Own structure id, or nearest ancestor's structure id for plain labels / group items. */
  effectiveId: string | null;
  depth: number;
  parentKey: string | null;
  ancestorKeys: string[];
  ancestorIds: string[];
  descendantIds: string[];
  isRoot: boolean;
  isJoin: boolean;
  isGroup: boolean;
  target: VisualTarget | null;
}

export interface VisualFlow {
  flow: Flow;
  mapId: string | null;
  mapTitle: string | null;
  nodes: VisualNode[];
  steps: VisualNode[];
  byKey: Map<string, VisualNode>;
  byStructureId: Map<string, VisualNode>;
}

/** Pick a settled `t` inside beat `beatIndex` so pose transitions (`run: [0.08, 0.7]`) have completed. */
export function settledBeatT(stage: StageDef, beatIndex: number): number {
  if (!stage.beats.length) return 0.5;
  const idx = Math.max(0, Math.min(stage.beats.length - 1, beatIndex));
  const cur = stage.beats[idx].at;
  const next = stage.beats[idx + 1]?.at ?? 1;
  const span = Math.max(0.02, next - cur);
  return Math.min(0.99, Number((cur + span * 0.85).toFixed(4)));
}

function bestViewIndex(stage: StageDef): number {
  const idx = stage.views.findIndex((v) => v.plane !== 'eskema');
  return idx >= 0 ? idx : 0;
}

function stageHasFocus(stage: StageDef, id: string): number {
  return stage.beats.findIndex((b) => b.focus?.includes(id));
}

function stageContains(stage: StageDef, id: string): boolean {
  return stage.structures.includes(id) || stageHasFocus(stage, id) >= 0;
}

function makeTarget(weekNum: number, stage: StageDef, structureId: string | null, exact: boolean): VisualTarget {
  let beatIndex = 0;
  if (structureId) {
    const focusIdx = stageHasFocus(stage, structureId);
    if (focusIdx >= 0) beatIndex = focusIdx;
    else if (stage.beats.length > 1) beatIndex = Math.min(stage.beats.length - 1, Math.floor(stage.beats.length * 0.6));
  }
  const beatViewId = stage.beats[beatIndex]?.view;
  const beatViewIdx = beatViewId ? stage.views.findIndex((v) => v.id === beatViewId && v.plane !== 'eskema') : -1;
  const viewIndex = beatViewIdx >= 0 ? beatViewIdx : bestViewIndex(stage);
  const view: ViewDef | undefined = stage.views[viewIndex] ?? stage.views[0];
  const t = settledBeatT(stage, beatIndex);
  const href = `/astea/${weekNum}?etapa=${stage.id}${structureId ? `&egitura=${structureId}` : ''}`;
  return {
    week: weekNum,
    stageId: stage.id,
    stageTitle: stage.title,
    stagePeriod: stage.day,
    viewIndex,
    viewId: view?.id ?? 'default',
    viewLabel: view?.label ?? stage.title,
    beatIndex,
    t,
    structureId,
    exact,
    href,
  };
}

/** Resolve the best 3D simulator stage, view, and beat `t` for a derivative tree node. */
export function resolveVisualTarget(topicWeek: number, flowStageId: string, effectiveId: string | null, fallbackIds: readonly string[] = []): VisualTarget | null {
  const topic = getWeek(topicWeek);
  const flowStage = topic?.stages.find((s) => s.id === flowStageId);

  // 1. Prefer the flow's own stage when the structure is drawn/focused there (keeps continuous 3D morphing).
  if (effectiveId && flowStage && stageContains(flowStage, effectiveId)) {
    return makeTarget(topicWeek, flowStage, effectiveId, true);
  }

  // 2. Otherwise search other stages in the same topic (preferring an explicit beat focus).
  if (effectiveId && topic) {
    const byFocus = topic.stages.find((s) => stageHasFocus(s, effectiveId) >= 0);
    if (byFocus) return makeTarget(topicWeek, byFocus, effectiveId, true);
    const byStruct = topic.stages.find((s) => s.structures.includes(effectiveId));
    if (byStruct) return makeTarget(topicWeek, byStruct, effectiveId, true);
  }

  // 3. Cross-topic lookup (especially vital for topic 20 -> week 19 brain 3D models, and shared origins).
  if (effectiveId) {
    const refs = appearances.get(effectiveId) ?? [];
    if (refs.length) {
      const sorted = [...refs].sort((a, b) => {
        const aRecent = a.week.week >= VISUAL_MIN_WEEK ? 1 : 0;
        const bRecent = b.week.week >= VISUAL_MIN_WEEK ? 1 : 0;
        if (aRecent !== bRecent) return bRecent - aRecent;
        const aFocus = stageHasFocus(a.stage, effectiveId) >= 0 ? 1 : 0;
        const bFocus = stageHasFocus(b.stage, effectiveId) >= 0 ? 1 : 0;
        if (aFocus !== bFocus) return bFocus - aFocus;
        return Math.abs(a.week.week - topicWeek) - Math.abs(b.week.week - topicWeek);
      });
      const best = sorted[0];
      return makeTarget(best.week.week, best.stage, effectiveId, true);
    }
  }

  // 4. Fallback to the flow's own stage (e.g., for plain labels with no structure id).
  if (flowStage) {
    return makeTarget(topicWeek, flowStage, effectiveId, false);
  }

  // 5. Topic without its own WeekDef (e.g., topic 20): match any structure id in the flow via appearances.
  for (const id of fallbackIds) {
    const refs = appearances.get(id) ?? [];
    const best = refs.find((r) => r.week.week >= VISUAL_MIN_WEEK) ?? refs[0];
    if (best) return makeTarget(best.week.week, best.stage, effectiveId ?? id, false);
  }

  // 6. Ultimate fallback for topic 20: week 19's first stage.
  const w19 = getWeek(19);
  if (w19?.stages[0]) return makeTarget(19, w19.stages[0], effectiveId, false);
  return null;
}

function collectDescendantIds(node: MNode): string[] {
  const out: string[] = [];
  const walk = (m: MNode) => {
    for (const k of m.kids ?? []) {
      if (k.id && structures.has(k.id) && !out.includes(k.id)) out.push(k.id);
      walk(k);
    }
  };
  walk(node);
  return out;
}

function collectFlowStructureIds(flow: Flow): string[] {
  const out: string[] = [];
  const walk = (m: MNode) => {
    if (m.id && structures.has(m.id) && !out.includes(m.id)) out.push(m.id);
    m.kids?.forEach(walk);
  };
  flow.roots.forEach(walk);
  if (flow.join) walk(flow.join);
  return out;
}

/** Build all interactive visual derivative trees for a topic (respecting `taughtOnly`). */
export function buildVisualFlows(week: number, taughtOnly: boolean): VisualFlow[] {
  const topic = MIGRATIONS.find((t) => t.week === week);
  if (!topic) return [];

  const filterBlue = taughtOnly && hasBlueContent(week);
  const rawFlows = topic.flows
    .filter((f) => !filterBlue || flowShown(f))
    .map((f) => (filterBlue ? taughtFlow(f) : f))
    .filter((f) => !filterBlue || flowShown(f));

  const maps = LEARNING_MAPS.filter((m) => m.week === week);
  const mapByFlowId = new Map<string, { id: string; title: string }>();
  for (const m of maps) {
    for (const fid of m.flowIds) mapByFlowId.set(fid, { id: m.id, title: m.title });
  }

  return rawFlows.map((flow) => {
    const nodes: VisualNode[] = [];
    const byKey = new Map<string, VisualNode>();
    const byStructureId = new Map<string, VisualNode>();
    const flowStructIds = collectFlowStructureIds(flow);

    const visit = (
      node: MNode,
      key: string,
      depth: number,
      parentKey: string | null,
      ancestorKeys: string[],
      ancestorIds: string[],
      isRoot: boolean,
      isJoin: boolean,
    ) => {
      const validId = node.id && structures.has(node.id) ? node.id : null;
      const effectiveId = validId ?? ancestorIds[ancestorIds.length - 1] ?? null;
      const label = (validId ? structures.get(validId)?.name : undefined) ?? node.label ?? node.id ?? '';
      const descendantIds = collectDescendantIds(node);
      const target = resolveVisualTarget(week, flow.stage, effectiveId, flowStructIds);

      const vNode: VisualNode = {
        key,
        node,
        label,
        id: validId,
        effectiveId,
        depth,
        parentKey,
        ancestorKeys,
        ancestorIds,
        descendantIds,
        isRoot,
        isJoin,
        isGroup: !!node.group,
        target,
      };
      nodes.push(vNode);
      byKey.set(key, vNode);
      if (validId && !byStructureId.has(validId)) byStructureId.set(validId, vNode);

      const nextAncKeys = [...ancestorKeys, key];
      const nextAncIds = validId ? [...ancestorIds, validId] : ancestorIds;
      (node.kids ?? []).forEach((child, idx) => {
        visit(child, `${key}.${idx}`, depth + 1, key, nextAncKeys, nextAncIds, false, isJoin);
      });
    };

    flow.roots.forEach((root, idx) => {
      visit(root, String(idx), 0, null, [], [], true, false);
    });
    if (flow.join) {
      const rootIds = flow.roots.map((r) => (r.id && structures.has(r.id) ? r.id : null)).filter((x): x is string => !!x);
      visit({ ...flow.join, via: flow.joinVia ?? flow.join.via }, 'j.0', 0, null, [], rootIds, false, true);
    }

    const steps = nodes.filter((n) => !n.isGroup);
    const mapInfo = mapByFlowId.get(flow.id) ?? null;

    return {
      flow,
      mapId: mapInfo?.id ?? null,
      mapTitle: mapInfo?.title ?? null,
      nodes,
      steps,
      byKey,
      byStructureId,
    };
  });
}

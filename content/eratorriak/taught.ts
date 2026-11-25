/**
 * "Aurten emandakoa" (taught this year) views of the Eratorriak data, topics 15+ (the notes' blue or grey text left out).
 *
 * Blue text in the notes is what was not taught this year (see scripts/notes/README.md). The maps mark such
 * nodes `blue` and the tables mark rows `blue` (or a whole section); `plain` holds the wording without the blue
 * part. These helpers return copies without them; the full data stays as it is for the "Osoa" mode.
 */
import { MIGRATIONS, type Flow, type MNode } from '@/content/migrations';
import { GRID_SCHEMES, type GridCell, type GridRow, type GridScheme } from './grid-schemes';
import { mergeBranches, overviewRoots, type LearningMap } from './learning-maps';

/** A node with its `plain` wording applied (a null note removes the note). */
function plainNode({ plain, blue: _blue, kids: _kids, ...node }: MNode): MNode {
  if (!plain) return node;
  const out: MNode = { ...node };
  if (plain.label !== undefined) out.label = plain.label;
  if (plain.via !== undefined) out.via = plain.via;
  if (plain.note === null) delete out.note;
  else if (plain.note !== undefined) out.note = plain.note;
  return out;
}

/** Leaves out blue nodes; their own taught children move up to the parent. */
export function taughtNodes(nodes: MNode[]): MNode[] {
  return nodes.flatMap((node) => {
    const kids = node.kids ? taughtNodes(node.kids) : undefined;
    if (node.blue) return kids ?? [];
    const out = plainNode(node);
    if (kids?.length) out.kids = kids;
    return [out];
  });
}

export function taughtFlow(flow: Flow): Flow {
  const join = flow.join && !flow.join.blue ? { ...plainNode(flow.join), ...(flow.join.kids ? { kids: taughtNodes(flow.join.kids) } : {}) } : undefined;
  const { plainLead, plainPitfalls, blue: _blue, ...rest } = flow;
  return { ...rest, lead: plainLead ?? flow.lead, pitfalls: plainPitfalls ?? flow.pitfalls, roots: taughtNodes(flow.roots), join };
}

/** Whether a flow still has something to show in "Aurten emandakoa" mode. */
export const flowShown = (flow: Flow) => !flow.blue && (flow.roots.length > 0 || !!flow.join);

export function taughtMap(map: LearningMap): LearningMap {
  // A scheme that is wholly not taught leaves the overview too.
  const kept = map.details.filter((flow) => !flow.blue);
  const roots = kept.length === map.details.length ? map.roots : mergeBranches(kept.flatMap(overviewRoots));
  const details = kept.map(taughtFlow).filter(flowShown);
  return { ...map, roots: taughtNodes(roots), details, flowIds: details.map((flow) => flow.id) };
}

const plainCell = ({ plain, plainNote, ...cell }: GridCell): GridCell => {
  const out: GridCell = { ...cell, text: plain ?? cell.text };
  if (plainNote === null) delete out.note;
  else if (plainNote !== undefined) out.note = plainNote;
  return out;
};

/**
 * Leaves out blue rows. A cell spanning down from a removed row moves to the next row (one row shorter);
 * a cell above whose span reached into a removed row loses that row.
 */
function taughtRows(rows: GridRow[]): GridRow[] {
  const out = rows.map((row) => ({ ...row, cells: [...row.cells] }));
  out.forEach((row, i) => {
    if (!row.blue) return;
    row.cells.forEach((cell, j) => {
      if (cell) {
        const span = cell.span ?? 1;
        if (span > 1 && out[i + 1] && !out[i + 1].cells[j]) out[i + 1].cells[j] = { ...cell, span: span - 1 };
        return;
      }
      for (let a = i - 1; a >= 0; a--) {
        const up = out[a].cells[j];
        if (!up) continue;
        if ((up.span ?? 1) > i - a) out[a].cells[j] = { ...up, span: (up.span ?? 1) - 1 };
        break;
      }
    });
  });
  return out.filter((row) => !row.blue).map(({ blue: _blue, ...row }) => ({ ...row, cells: row.cells.map((cell) => (cell ? plainCell(cell) : null)) }));
}

/** The table without its blue parts, or null when the whole section is blue. */
export function taughtGrid(scheme: GridScheme): GridScheme | null {
  if (scheme.blue) return null;
  const { plainLead, plainPitfalls, ...rest } = scheme;
  return {
    ...rest,
    lead: plainLead ?? scheme.lead,
    pitfalls: plainPitfalls ?? scheme.pitfalls,
    rows: taughtRows(scheme.rows),
  };
}

const nodeHasBlue = (node: MNode): boolean => !!node.blue || !!node.plain || !!node.kids?.some(nodeHasBlue);
const flowHasBlue = (flow: Flow) =>
  !!flow.blue || flow.plainLead !== undefined || !!flow.plainPitfalls || flow.roots.some(nodeHasBlue) || (!!flow.join && nodeHasBlue(flow.join));
const gridHasBlue = (s: GridScheme) =>
  !!s.blue || s.plainLead !== undefined || !!s.plainPitfalls || s.rows.some((row) => row.blue || row.cells.some((cell) => cell && (cell.plain !== undefined || cell.plainNote !== undefined)));

const BLUE_WEEKS = new Set(
  [...MIGRATIONS.filter((t) => t.flows.some(flowHasBlue)).map((t) => t.week), ...GRID_SCHEMES.filter(gridHasBlue).map((s) => s.week)],
);

/** Topics whose Eratorriak pages hold notes text not taught this year. */
export const hasBlueContent = (week: number) => BLUE_WEEKS.has(week);
/** Whether a flow changes in "Aurten emandakoa" mode. */
export const flowChanges = flowHasBlue;

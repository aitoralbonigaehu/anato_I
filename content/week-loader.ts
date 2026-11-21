import { useEffect, useSyncExternalStore } from 'react';
import type { SceneComponent, WeekDef } from '@/lib/sim/types';
import { loadWeek, loadedWeek, subscribeWeeks } from './week-store';

export { loadWeek } from './week-store';

/** A topic's full definition once loaded (null until then); `load: false` waits without starting the download. */
export function useFullWeek(n: number, load = true): WeekDef | null {
  const w = useSyncExternalStore(subscribeWeeks, () => loadedWeek(n), () => loadedWeek(n));
  useEffect(() => {
    if (load && !loadedWeek(n)) void loadWeek(n);
  }, [n, load]);
  return w;
}

/** One view's scene (null while its topic loads). A view index picks by position, a string by id. */
export function useScene(week: number, stage: string, view: string | number, load = true): SceneComponent | null {
  const w = useFullWeek(week, load);
  const s = w?.stages.find((x) => x.id === stage);
  const v = typeof view === 'number' ? s?.views[view] : (s?.views.find((x) => x.id === view) ?? s?.views[0]);
  return v?.scene ?? null;
}

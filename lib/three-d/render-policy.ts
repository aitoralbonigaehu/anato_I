/** Conservative limits shared by every 3D view, including full-screen and retina displays. */
export const RENDER_PIXEL_BUDGET = 2_000_000;
export const RENDER_FRAME_MS = 1000 / 30;
/** Context losses in this tab (v2: a v1 tab was blocked for good after a single loss). */
export const GPU_FAILURE_KEY = 'enbrioatlas:gpu-lost:v2';
/** Losses after which the tab stops asking the GPU (a driver that keeps resetting). */
export const GPU_LOSSES_TO_BLOCK = 2;

/** Harness-only Topic 10 comparison. Ordinary visits and every other topic retain their limits. */
export function renderTiming() {
  const env = globalThis as { __perf?: unknown; __topic10Fps?: unknown; location?: { pathname: string } };
  const fps = env.__perf && /^\/astea\/10\/?$/.test(env.location?.pathname ?? '') &&
    (env.__topic10Fps === 30 || env.__topic10Fps === 40) ? env.__topic10Fps : null;
  return { frameMs: fps ? 1000 / fps : RENDER_FRAME_MS, preserveCadence: fps !== null };
}

/** Carry fractional display-frame time; skip missed deadlines instead of bursting after a stall. */
export function nextRenderDeadline(now: number, previous: number, interval: number, preserveCadence = false) {
  if (!preserveCadence || !Number.isFinite(previous) || interval <= 0) return now + interval;
  return previous + Math.max(1, Math.floor((now - previous + 0.25) / interval) + 1) * interval;
}

export function renderRatio(width: number, height: number, dpr: number, maxDimension = Infinity) {
  const w = Math.max(1, width), h = Math.max(1, height);
  return Math.min(2, dpr || 1, Math.sqrt(RENDER_PIXEL_BUDGET / (w * h)), maxDimension / w, maxDimension / h);
}

type FailureStore = Pick<Storage, 'getItem' | 'setItem'>;

/**
 * What a 3D view does when WebGL fails. A lost context (the driver reset, the browser took it back) is
 * rebuilt: only repeated losses stop the GPU for the rest of the tab, reloads included, so a driver that
 * keeps resetting is not hit again. A context that cannot start (or programs that cannot link) stops it for
 * this page only: a reload tries again. Storage can be unavailable.
 */
export function createRenderCircuit(storage: FailureStore | null) {
  let losses = 0;
  try { losses = Number(storage?.getItem(GPU_FAILURE_KEY)) || 0; } catch { /* In-memory protection still works. */ }
  let blocked = losses >= GPU_LOSSES_TO_BLOCK;
  const listeners = new Set<() => void>();
  const tell = () => { for (const cb of [...listeners]) cb(); };
  return {
    get blocked() { return blocked; },
    /** The context was lost: the views drop it, and build another unless this blocked the GPU. */
    lost() {
      if (blocked) return;
      losses++;
      try { storage?.setItem(GPU_FAILURE_KEY, String(losses)); } catch { /* Never lose the flat fallback to a storage error. */ }
      blocked = losses >= GPU_LOSSES_TO_BLOCK;
      tell();
    },
    /** WebGL could not start here: the flat picture until the page is loaded again. */
    unavailable() {
      if (blocked) return;
      blocked = true;
      tell();
    },
    subscribe(cb: () => void) {
      listeners.add(cb);
      return () => { listeners.delete(cb); };
    },
  };
}

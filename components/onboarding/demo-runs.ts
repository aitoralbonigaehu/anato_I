/**
 * The scripted moments of the onboarding, played on the real app inside its frame (same origin, demo
 * mode). Each run stops the moment `live()` turns false: the student touched the frame, or left the stop.
 * Nothing here draws on the app: it presses the app's own keys, the way a student would.
 */

const stopped = () => new Error('stopped');
/** The frame's window, with its own constructors (events made there are the page's own). */
type FrameWindow = Window & typeof globalThis;

export const sleep = (ms: number, live: () => boolean) =>
  new Promise<void>((res, rej) => window.setTimeout(() => (live() ? res() : rej(stopped())), ms));

async function until<T>(get: () => T | null | undefined | false, live: () => boolean, ms = 9000): Promise<T> {
  const t0 = Date.now();
  for (;;) {
    const v = get();
    if (v) return v;
    if (Date.now() - t0 > ms) throw new Error('timeout');
    await sleep(120, live);
  }
}

const playing = (doc: Document) => {
  const p = doc.querySelector('[data-tour="play"]');
  return !!p && (p.classList.contains('is-playing') || p.getAttribute('aria-label') === 'Pausatu');
};

/** The simulator stop: the scene plays on its own, as the student would see it after "Erreproduzitu". */
export function playScene(win: Window) {
  const p = win.document.querySelector<HTMLElement>('[data-tour="play"]');
  if (p && !playing(win.document)) p.click();
}

export const KIMU_QUESTION = 'Nondik dator baraila?';

/**
 * Kimu gets ready the way it does for a student (its button hovered): it loads its engine and builds its
 * index, a second of work. Done at the start of its stop, with the scene paused and only the stop's own
 * words moving in (CSS, which keeps moving while the page works), so Kimu then opens at once.
 */
function warmKimuIn(win: FrameWindow) {
  win.document.querySelector('.kimu-tool, .kimu-launch')?.dispatchEvent(new win.PointerEvent('pointerover', { bubbles: true, pointerType: 'mouse' }));
}

/**
 * Kimu, for real: open it (the K key), type a question, send it, let the answer from the notes be read,
 * then press its "take me there" so the simulator jumps to the step where it is shown.
 * `phase`: 1 typing, 2 answered, 3 about to go, 4 there.
 */
export async function runKimu(frameWin: Window, live: () => boolean, phase: (n: number) => void) {
  const win = frameWin as FrameWindow;
  const doc = win.document;
  const p = doc.querySelector<HTMLElement>('[data-tour="play"]');
  if (p && playing(doc)) p.click();
  phase(0);
  // After the stop's words are in (the title's blur waits for the page), with nothing else moving.
  await sleep(1350, live);
  warmKimuIn(win);
  await sleep(1500, live);
  if (!doc.querySelector('.kimu-panel')) win.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'k', bubbles: true }));
  const ta = await until(() => doc.querySelector<HTMLTextAreaElement>('.kimu-form textarea'), live);
  // A fresh conversation each run (the replay too).
  doc.querySelector<HTMLElement>('.kimu-head [aria-label="Elkarrizketa berria"]')?.click();
  await sleep(550, live);
  phase(1);
  const set = Object.getOwnPropertyDescriptor(win.HTMLTextAreaElement.prototype, 'value')!.set!;
  for (let i = 1; i <= KIMU_QUESTION.length; i++) {
    set.call(ta, KIMU_QUESTION.slice(0, i));
    ta.dispatchEvent(new win.Event('input', { bubbles: true }));
    await sleep(34 + Math.random() * 46, live);
  }
  await sleep(420, live);
  const answers = () => doc.querySelectorAll('.kimu-msg.is-kimu .kimu-answer').length;
  const before = answers();
  doc.querySelector<HTMLElement>('.kimu-send')?.click();
  ta.blur();
  await until(() => answers() > before && !doc.querySelector('.kimu-dots'), live, 15000);
  phase(2);
  await sleep(3000, live);
  // The card of the answer's own step ("in this stage", with its notes) first, else the notes' link.
  const cards = [...doc.querySelectorAll<HTMLElement>('.kimu-go')];
  const go =
    cards.find((c) => /Etapa honetan/.test(c.textContent ?? '')) ?? cards.find((c) => /Gai honetan/.test(c.textContent ?? '')) ?? doc.querySelector<HTMLElement>('.kimu-src-open') ?? cards[0];
  if (!go) return;
  go.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  go.classList.add('demo-glow');
  phase(3);
  await sleep(1800, live);
  go.classList.remove('demo-glow');
  go.click();
  phase(4);
}

/**
 * The simulator's full screen, shown: the pointer goes to the picture's full-screen key and presses it, and the
 * journey grows the frame over the whole screen (a real full screen needs the student's own press: the stop offers
 * that too); inside, the app's own F (focus mode) gives the picture the room, as its full screen does.
 * `phase`: 1 going to the key, 2 pressed, 3 full screen, 4 back.
 */
export async function runFullscreen(frameWin: Window, live: () => boolean, cursor: (c: Cursor | null) => void, phase: (n: number) => void) {
  const win = frameWin as FrameWindow;
  const doc = win.document;
  await sleep(4200, live);
  const keys = [...doc.querySelectorAll<HTMLElement>('[aria-label="Pantaila osoa"]')].filter((b) => b.getBoundingClientRect().width > 0);
  const key = keys[keys.length - 1];
  const r = key?.getBoundingClientRect();
  cursor({ x: win.innerWidth * 0.62, y: win.innerHeight * 0.58 });
  await sleep(160, live);
  phase(1);
  cursor(r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : { x: win.innerWidth - 28, y: win.innerHeight * 0.33 });
  await sleep(1150, live);
  key?.classList.add('demo-glow');
  phase(2);
  await sleep(420, live);
  key?.classList.remove('demo-glow');
  cursor(null);
  phase(3);
  win.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'f', bubbles: true }));
  try {
    await sleep(5200, live);
  } finally {
    // Back as it was, even when the student takes over or leaves the stop.
    if (doc.querySelector('.app.is-focus')) win.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'f', bubbles: true }));
    phase(4);
  }
}

/** Names of the heart-and-vessels figure: each lights a whole vessel or chamber, from end to end. */
const PLATE_NAMES = ['Eskuineko aorta dortsala', 'Zain sinua', 'Arteria-bulboa', 'Bitelo-arteriak', 'Zilbor-zainak (eskuinekoa eta ezkerrekoa)'];

export interface Cursor {
  x: number;
  y: number;
}

/**
 * Belortzioak, for real: the pointer goes from name to name and the app lights that structure only.
 * `cursor` gets where the pointer is, in the frame's own pixels (null: gone).
 */
/** The figure's picture, inside the SVG that also holds its names. */
export const PLATE_FIGURE = 'image[href*="belortzioak-irudiak"]';

/**
 * The figure framed in the window: its top under the app's bar, the names around it in view. Done as soon
 * as the frame is ready (before its stop comes, so the student arrives on the figure, not on the page's
 * header), and again when the demo starts.
 */
export function framePlate(frameWin: Window, behavior: ScrollBehavior = 'instant') {
  const win = frameWin as FrameWindow;
  // The figure is an SVG (the picture plus its names): framed whole.
  const img = win.document.querySelector(PLATE_FIGURE)?.closest('svg');
  if (!img) return;
  const r = img.getBoundingClientRect();
  // The app's own bar stays on top: the figure starts below it.
  const bar = win.document.querySelector('header')?.getBoundingClientRect();
  const under = bar && bar.top <= 0 && bar.bottom > 0 && win.getComputedStyle(win.document.querySelector('header')!).position !== 'static' ? bar.bottom : 0;
  win.scrollTo({ top: Math.max(0, r.top + win.scrollY - under - 14), behavior });
}

export async function runPlate(frameWin: Window, live: () => boolean, cursor: (c: Cursor | null) => void) {
  const win = frameWin as FrameWindow;
  const doc = win.document;
  const names = () => [...doc.querySelectorAll<HTMLButtonElement>('button[class*="name"]')].filter((b) => b.getClientRects().length > 0);
  await until(() => names().length > 0, live);
  framePlate(win, 'smooth');
  cursor({ x: win.innerWidth * 0.5, y: win.innerHeight * 0.86 });
  await sleep(1000, live);
  const byName = PLATE_NAMES.map((n) => names().find((b) => b.textContent?.trim() === n)).filter((b): b is HTMLButtonElement => !!b);
  const list = byName.length >= 3 ? byName : names().slice(0, 5);
  const over = (b: Element) => b.dispatchEvent(new win.PointerEvent('pointerover', { bubbles: true, pointerType: 'mouse' }));
  const out = (b: Element, to: Element | null) => b.dispatchEvent(new win.PointerEvent('pointerout', { bubbles: true, pointerType: 'mouse', relatedTarget: to }));
  let lit: Element | null = null;
  try {
    for (let round = 0; round < 4; round++)
      for (const b of list) {
        const r = b.getBoundingClientRect();
        cursor({ x: r.left + Math.min(r.width * 0.5, 64), y: r.top + r.height * 0.6 });
        await sleep(900, live);
        if (lit) out(lit, b);
        over(b);
        lit = b;
        await sleep(2000, live);
      }
  } finally {
    if (lit) out(lit, doc.body);
    cursor(null);
  }
}

/** The mind map of 18. gaia's face (the same upper lip Kimu was asked about), at /eratorriak#a18-eskemak. */
export const ERA_MAP = 'details[id$="mapa-18-aurpegia"]';

/**
 * Eratorriak, for real: the face's mind map opens, and the pointer goes from origin to origin; the app
 * lights each one and everything derived from it, arrows included. Then "Landu": a question from the
 * maps, and its answer. `phase`: 1 following the arrows, 2 a question, 3 its answer.
 */
export async function runSchemes(frameWin: Window, live: () => boolean, cursor: (c: Cursor | null) => void, phase: (n: number) => void) {
  const win = frameWin as FrameWindow;
  const doc = win.document;
  const mode = (name: string) => [...doc.querySelectorAll<HTMLButtonElement>('[aria-label="Ikasteko modua"] button')].find((b) => b.textContent?.trim() === name);
  const map = () => doc.querySelector<HTMLDetailsElement>(ERA_MAP);
  const point = (b: Element, fx = 0.4) => {
    const r = b.getBoundingClientRect();
    cursor({ x: r.left + Math.min(r.width * fx, 90), y: r.top + r.height * 0.55 });
  };
  const open = async () => {
    const learn = mode('Ikasi');
    if (learn && learn.getAttribute('aria-pressed') !== 'true') {
      learn.click();
      await sleep(500, live);
    }
    const m = await until(map, live);
    if (!m.open) m.querySelector<HTMLElement>(':scope > summary')?.click();
    await sleep(450, live);
    const top = m.getBoundingClientRect().top + win.scrollY;
    win.scrollTo({ top: Math.max(0, top - 120), behavior: 'smooth' });
    await sleep(1100, live);
    return m;
  };
  let lit: Element | null = null;
  const over = (b: Element) => {
    b.dispatchEvent(new win.MouseEvent('mouseover', { bubbles: true, relatedTarget: lit }));
    lit = b;
  };
  const leave = () => {
    if (lit) lit.dispatchEvent(new win.MouseEvent('mouseout', { bubbles: true, relatedTarget: doc.body }));
    lit = null;
  };
  try {
    cursor({ x: win.innerWidth * 0.5, y: win.innerHeight * 0.88 });
    for (let round = 0; round < 2; round++) {
      const m = await open();
      // The map's own scheme (not the detailed ones folded under it): the structures that something comes from.
      const scheme = m.querySelector(':scope > .mg-scroll') ?? m.querySelector('.mg-scroll');
      const origins = [...(scheme?.querySelectorAll<HTMLElement>('.mg-b:has(> .mg-kids) > [data-node]') ?? [])].filter((c) => {
        const r = c.getBoundingClientRect();
        return r.height > 0 && r.top > 40 && r.bottom < win.innerHeight - 20;
      });
      phase(1);
      for (const c of origins.slice(0, 4)) {
        point(c);
        await sleep(850, live);
        over(c);
        await sleep(2300, live);
      }
      leave();
      await sleep(600, live);
      const practise = mode('Landu');
      if (!practise) break;
      point(practise, 0.5);
      await sleep(900, live);
      practise.click();
      phase(2);
      // The page is shorter without the maps: bring the question into view.
      await sleep(250, live);
      const q = doc.querySelector<HTMLElement>('[aria-label="Ikasteko modua"]');
      if (q) win.scrollTo({ top: Math.max(0, q.getBoundingClientRect().top + win.scrollY - 120), behavior: 'smooth' });
      await sleep(1550, live);
      const reveal = [...doc.querySelectorAll<HTMLButtonElement>('button')].find((b) => b.textContent?.trim() === 'Erakutsi erantzuna' && b.getClientRects().length > 0);
      if (reveal) {
        point(reveal, 0.5);
        await sleep(1000, live);
        reveal.click();
        phase(3);
        await sleep(3400, live);
      }
    }
  } finally {
    leave();
    cursor(null);
  }
}

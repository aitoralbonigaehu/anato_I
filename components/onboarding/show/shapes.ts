import { N } from './engine';

/** Texture layers of the show. */
export const L = { text: 0, embryo: 1, skull: 2, face5: 3, face10: 4, logo: 5 } as const;

/** Lines of the notes (18. gaia, 4.1) the show opens on: the very fusion its last shape plays out. */
export const NOTE_LINES = [
  ['Sudur hastapenak aurrekalderantz mugitzen dira'],
  ['biak fusionatzeko: sudur plakoda bietako'],
  ['', 'ertz medialak', ' fusionatzen dira. '],
  ['', 'Luzapen maxilarrak', ' erdirantz luzatzen dira…'],
] as const;

export interface Points {
  xyzw: Float32Array;
  rgb: Uint8Array;
}

const rand = (() => {
  let s = 987654321;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
})();

/** A baked cloud (scripts/intro-v3/bake-clouds.test.ts): count × (Int16 xyz, Uint8 rgb, Uint8 weight). */
export async function loadCloud(name: string, signal: AbortSignal): Promise<Points> {
  const r = await fetch(`/intro-v3/${name}.bin`, { signal });
  if (!r.ok) throw Error(name);
  const buf = await r.arrayBuffer();
  const view = new DataView(buf);
  const count = buf.byteLength / 10;
  const xyzw = new Float32Array(N * 4),
    rgb = new Uint8Array(N * 4);
  for (let i = 0; i < N; i++) {
    const j = (i % count) * 10;
    xyzw[i * 4] = view.getInt16(j, true) / 16384;
    xyzw[i * 4 + 1] = view.getInt16(j + 2, true) / 16384;
    xyzw[i * 4 + 2] = view.getInt16(j + 4, true) / 16384;
    xyzw[i * 4 + 3] = view.getUint8(j + 9) / 255;
    rgb[i * 4] = view.getUint8(j + 6);
    rgb[i * 4 + 1] = view.getUint8(j + 7);
    rgb[i * 4 + 2] = view.getUint8(j + 8);
    rgb[i * 4 + 3] = view.getUint8(j + 9);
  }
  return { xyzw, rgb };
}

/**
 * Points spread over what is drawn on a canvas (each point on an inked pixel, coloured as the ink), as world
 * coordinates: width `worldW`, centred, y up. The ink's own colour is kept, so words can be marked.
 */
function fromCanvas(c: HTMLCanvasElement, worldW: number, weight = 1): Points {
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  const { data, width, height } = ctx.getImageData(0, 0, c.width, c.height);
  const lit: number[] = [];
  let x0 = width,
    x1 = 0,
    y0 = height,
    y1 = 0;
  for (let i = 0; i < width * height; i++)
    if (data[i * 4 + 3] > 110) {
      lit.push(i);
      const x = i % width,
        y = (i / width) | 0;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  // Centred on the ink, `worldW` across the ink's own width.
  const cx = (x0 + x1 + 1) / 2,
    cy = (y0 + y1 + 1) / 2,
    inkW = Math.max(1, x1 - x0 + 1);
  const xyzw = new Float32Array(N * 4),
    rgb = new Uint8Array(N * 4);
  const k = worldW / inkW;
  for (let i = 0; i < N; i++) {
    const p = lit.length ? lit[Math.floor(rand() * lit.length)] : 0;
    const x = (p % width) + rand(),
      y = Math.floor(p / width) + rand();
    xyzw[i * 4] = (x - cx) * k;
    xyzw[i * 4 + 1] = -(y - cy) * k;
    xyzw[i * 4 + 2] = (rand() - 0.5) * 0.012;
    xyzw[i * 4 + 3] = weight;
    rgb[i * 4] = data[p * 4];
    rgb[i * 4 + 1] = data[p * 4 + 1];
    rgb[i * 4 + 2] = data[p * 4 + 2];
    rgb[i * 4 + 3] = 255;
  }
  return { xyzw, rgb };
}

const CREAM = '#f6e3cc';
const COPPER = '#ff9a55';

/** The page of notes, in particles: 2 world units wide. */
export function notesText(): Points {
  const c = document.createElement('canvas');
  c.width = 2000;
  c.height = 520;
  const ctx = c.getContext('2d')!;
  ctx.font = 'italic 400 76px Georgia, "Times New Roman", serif';
  ctx.textBaseline = 'middle';
  NOTE_LINES.forEach((parts, row) => {
    const y = 70 + row * 124;
    const widths = parts.map((s) => ctx.measureText(s).width);
    let x = (c.width - widths.reduce((a, b) => a + b, 0)) / 2;
    parts.forEach((s, i) => {
      ctx.fillStyle = i === 1 ? COPPER : CREAM;
      ctx.fillText(s, x, y);
      if (i === 1) ctx.fillRect(x, y + 44, widths[i], 4);
      x += widths[i];
    });
  });
  return fromCanvas(c, 2);
}

/** The wordmark: the brand's mark and "EnbrioAtlas", 2 world units wide. */
export function wordmark(): Points {
  const c = document.createElement('canvas');
  c.width = 2200;
  c.height = 420;
  const ctx = c.getContext('2d')!;
  const family = getComputedStyle(document.body).getPropertyValue('--font-geist').trim() || 'system-ui, sans-serif';
  const h = c.height / 2;
  // The mark (icons.tsx BrandMark, 32-unit box), scaled.
  const s = 9.5,
    ox = 70,
    oy = h - 16 * s;
  ctx.save();
  ctx.translate(ox, oy);
  ctx.scale(s, s);
  ctx.strokeStyle = 'rgba(246,227,204,.62)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(16, 16, 14, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = CREAM;
  ctx.lineWidth = 2.6;
  ctx.lineCap = 'round';
  ctx.stroke(new Path2D('M21.2 10.4a7.4 7.4 0 1 0 0.9 10.6'));
  ctx.fillStyle = '#ff6a3d';
  ctx.beginPath();
  ctx.arc(22.3, 21.3, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.textBaseline = 'middle';
  ctx.fillStyle = CREAM;
  ctx.font = `400 220px ${family}`;
  const x0 = ox + 32 * s + 70;
  ctx.fillText('Enbrio', x0, h + 8);
  const w = ctx.measureText('Enbrio').width;
  ctx.font = `700 220px ${family}`;
  ctx.fillText('Atlas', x0 + w - 6, h + 8);
  // The release: a small copper "V2" plate after the name (the points reach it last, the sweep runs left to right).
  const end = x0 + w - 6 + ctx.measureText('Atlas').width;
  const bx = end + 44,
    bw = 236,
    bh = 150,
    by = h + 8 - bh / 2;
  ctx.strokeStyle = COPPER;
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 26);
  ctx.stroke();
  ctx.fillStyle = COPPER;
  ctx.font = `600 112px ${family}`;
  ctx.textAlign = 'center';
  ctx.fillText('V2', bx + bw / 2, h + 14);
  return fromCanvas(c, 2);
}

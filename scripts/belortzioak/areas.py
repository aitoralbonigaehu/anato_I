"""
Belortzioak: each name's whole structure, not just its arrow tip.

For every item in `areas_spec.py` (circulatory and digestive figures), the structure's extent is traced on
the figure itself: a region grown from seed points over pixels of the structure's own colour, kept inside a
hand-drawn clip polygon where the structure meets a neighbour of the same colour (a vein running on into the
next vein), or given outright as a polygon where the drawing has no colour of its own (a cavity, a line).
The outlines go to `content/belortzioak-areas.json` as fractions of the figure, keyed like the items
(`p11:2`). `--preview` renders, per figure, each structure lit the way the app lights it, for review.

  python3 scripts/belortzioak/areas.py [--preview OUTDIR] [--only p11]
"""
import json
import sys
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(Path(__file__).parent))
from areas_spec import SPEC  # noqa: E402

IMG = ROOT / 'public' / 'belortzioak-irudiak'
OUT = ROOT / 'content' / 'belortzioak-areas.json'


def load(plate):
    im = cv2.imread(str(IMG / f'{plate}.webp'), cv2.IMREAD_COLOR)
    return im


def region(im, lab, r):
    """One region of a structure as a binary mask, less any `sub` regions (a neighbour carved out)."""
    m = _region(im, lab, r)
    for s in r.get('sub', []):
        m &= cv2.bitwise_not(_region(im, lab, s))
    return m


def _region(im, lab, r):
    h, w = im.shape[:2]
    mask = np.zeros((h, w), np.uint8)
    if 'poly' in r:
        cv2.fillPoly(mask, [np.array(r['poly'], np.int32)], 255)
        return mask
    if 'line' in r:
        # a vessel or duct along its centre line, `w` pixels wide; with `snap`, only the pixels of the
        # vessel's own colour inside that band (so the outline follows the drawing, not the pen)
        pts = np.array(r['line'], np.int32)
        cv2.polylines(mask, [pts], False, 255, int(r.get('w', 12)), cv2.LINE_AA)
        mask = (mask > 127).astype(np.uint8) * 255
        if 'snap' not in r:
            return mask
        if isinstance(r['snap'], str):
            return snapped(lab, mask, r)
        r = {**r, 'clip': None, 'band': mask, 'tol': r['snap'], 'seeds': r.get('seeds', [tuple(x) for x in r['line']])}
    tol = r.get('tol', 18)
    clip = r.get('band')
    if r.get('clip') is not None:
        c = np.zeros((h, w), np.uint8)
        cv2.fillPoly(c, [np.array(r['clip'], np.int32)], 255)
        clip = c if clip is None else clip & c
    # Pixels whose colour is near any seed's (seed colour = median of a small patch), and, if asked,
    # also saturated enough (so the white paper and grey outlines never join the structure).
    if 'ink' in r:
        cand = colour(lab, r['ink'])
    else:
        near = np.zeros((h, w), bool)
        for sx, sy in r.get('colours', r.get('seeds', [])):
            patch = lab[max(0, sy - 2):sy + 3, max(0, sx - 2):sx + 3].reshape(-1, 3)
            c = np.median(patch, axis=0)
            d = np.sqrt(((lab.astype(np.float32) - c) ** 2).sum(axis=2))
            near |= d < tol
        cand = near.astype(np.uint8) * 255
    if clip is not None:
        cand &= clip
    # a little closing so hatching and outline gaps inside the structure do not split it
    k = r.get('close', 3)
    if k:
        cand = cv2.morphologyEx(cand, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k)))
        if clip is not None:
            cand &= clip
    n, lbl = cv2.connectedComponents(cand, connectivity=8)
    if (r.get('band') is not None and r.get('all', True)) or r.get('all') is True or not r.get('seeds'):
        cand_all = True
    else:
        cand_all = False
    keep = set()
    for sx, sy in r.get('seeds', []):
        # the component at the seed, or the nearest one within a few pixels
        best = None
        for dy in range(-4, 5):
            for dx in range(-4, 5):
                yy, xx = sy + dy, sx + dx
                if 0 <= yy < h and 0 <= xx < w and lbl[yy, xx]:
                    dd = dx * dx + dy * dy
                    if best is None or dd < best[0]:
                        best = (dd, lbl[yy, xx])
        if best:
            keep.add(best[1])
    if cand_all:
        sizes = np.bincount(lbl.ravel())
        big = [i for i in range(1, n) if sizes[i] >= r.get('min', 30)]
        mask = np.isin(lbl, big).astype(np.uint8) * 255
    else:
        mask = np.isin(lbl, list(keep)).astype(np.uint8) * 255
    # fill holes (the drawing's outlines and hatch inside the structure) — not for a vessel network,
    # whose meshes are not part of it
    if r.get('fill', True):
        inv = cv2.bitwise_not(mask)
        ff = inv.copy()
        cv2.floodFill(ff, None, (0, 0), 0)
        mask |= ff
    g = r.get('grow', 2)
    if g:
        mask = cv2.dilate(mask, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * g + 1, 2 * g + 1)))
        if clip is not None and r.get('hard', r.get('band') is not None):
            mask &= clip
    return mask


def colour(lab, name):
    """Pixels of one ink: the drawing's vessels and organs are coloured pencil over grey hatching."""
    L, a, b = [lab[..., i].astype(np.int16) for i in range(3)]
    chroma = np.sqrt((a - 128) ** 2 + (b - 128) ** 2)
    m = {
        'blue': (b <= 123) & (a <= 132),
        'red': (a >= 137) & (a - 128 > (b - 128) * 0.4),
        'pink': (a >= 133),
        'rose': (a >= 133) & (b >= 126),
        'pinklight': (a >= 131) & (L < 238),
        'bluelight': (b <= 125) & (a <= 132) & (L < 240),
        'green': (a <= 122) & (b >= 126),
        'purple': (a >= 133) & (b <= 125),
        'brown': (b >= 134) & (L < 200),
        'yellow': (b >= 140),
        'gut': (a <= 123) & (b >= 129),
        'olive': (a >= 124) & (a <= 131) & (b >= 137) & (L < 215),
        'any': chroma >= 7,
        'dark': L < 110,
        'black': L < 45,
        'notwhite': L < 225,
    }[name]
    return m.astype(np.uint8) * 255


def snapped(lab, band, r):
    """A band's pixels of the structure's own ink, closed and filled (hatching dots inside it join in)."""
    m = colour(lab, r['snap']) & band
    k = r.get('close', 7)
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k)))
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3)))
    inv = cv2.bitwise_not(m)
    ff = inv.copy()
    cv2.floodFill(ff, None, (0, 0), 0)
    m |= ff
    g = r.get('grow', 2)
    if g:
        m = cv2.dilate(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * g + 1, 2 * g + 1)))
    return m & band


def outline(mask, w, h):
    # outer rings and their holes alike (the app fills them as one even-odd path, so a vessel
    # network's meshes stay dark)
    cs, _ = cv2.findContours(mask, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
    polys = []
    for c in cs:
        if cv2.contourArea(c) < 40:
            continue
        a = cv2.approxPolyDP(c, 1.2, True).reshape(-1, 2)
        polys.append([[round(float(x) / w, 3), round(float(y) / h, 3)] for x, y in a])
    return polys


def build(only=None):
    out = json.loads(OUT.read_text()) if OUT.exists() else {}
    masks = {}
    for plate, items in SPEC.items():
        if only and plate not in only:
            continue
        im = load(plate)
        h, w = im.shape[:2]
        lab = cv2.cvtColor(im, cv2.COLOR_BGR2LAB)
        for key in [k for k in out if k.startswith(plate + ':')]:
            del out[key]
        for n, regions in items.items():
            m = np.zeros((h, w), np.uint8)
            for r in regions:
                m |= region(im, lab, r)
            key = f'{plate}:{n}'
            out[key] = outline(m, w, h)
            masks[key] = m
    OUT.write_text(json.dumps(dict(sorted(out.items(), key=lambda kv: (kv[0].split(':')[0], kv[0]))), separators=(',', ':')))
    return masks


def preview(masks, outdir):
    """Per figure: every structure lit on its own (cropped round it, with its name), as the app will."""
    outdir = Path(outdir)
    outdir.mkdir(parents=True, exist_ok=True)
    by = {}
    for key, m in masks.items():
        by.setdefault(key.split(':')[0], []).append((key, m))
    T = 360
    for plate, lst in by.items():
        im = load(plate)
        h, w = im.shape[:2]
        tiles = []
        for key, m in lst:
            soft = cv2.GaussianBlur(m, (0, 0), 3).astype(np.float32)[..., None] / 255
            dim = im.astype(np.float32) * 0.30 + 255 * 0.04
            t = (im * soft + dim * (1 - soft)).astype(np.uint8)
            cs, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
            cv2.drawContours(t, cs, -1, (40, 200, 255), 2)
            ys, xs = np.nonzero(m)
            if len(xs):
                x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
                side = max(x1 - x0, y1 - y0) * 1.25 + 80
                cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
                X0, Y0 = int(max(0, cx - side / 2)), int(max(0, cy - side / 2))
                X1, Y1 = int(min(w, cx + side / 2)), int(min(h, cy + side / 2))
                t = t[Y0:Y1, X0:X1]
            s = T / max(t.shape[:2])
            t = cv2.resize(t, (int(t.shape[1] * s), int(t.shape[0] * s)))
            tile = np.full((T + 26, T, 3), 30, np.uint8)
            tile[26:26 + t.shape[0], :t.shape[1]] = t
            cv2.putText(tile, key, (6, 19), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)
            tiles.append(tile)
        cols = 4
        rows = (len(tiles) + cols - 1) // cols
        sheet = np.full((rows * (T + 30), cols * (T + 4), 3), 30, np.uint8)
        for i, t in enumerate(tiles):
            y, x = (i // cols) * (T + 30), (i % cols) * (T + 4)
            sheet[y:y + t.shape[0], x:x + t.shape[1]] = t
        cv2.imwrite(str(outdir / f'{plate}_areas.png'), sheet)
        # and the whole figure with every outline, to catch overlaps and gaps
        ov = im.copy()
        rng = np.random.default_rng(3)
        for key, m in lst:
            col = tuple(int(c) for c in rng.integers(40, 230, 3))
            cs, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
            cv2.drawContours(ov, cs, -1, col, 2)
            ys, xs = np.nonzero(m)
            if len(xs):
                cv2.putText(ov, key.split(':')[1], (int(xs.mean()), int(ys.mean())), cv2.FONT_HERSHEY_SIMPLEX, 0.8, col, 2)
        cv2.imwrite(str(outdir / f'{plate}_all.png'), ov)


if __name__ == '__main__':
    args = sys.argv[1:]
    only = None
    if '--only' in args:
        only = set(args[args.index('--only') + 1].split(','))
    masks = build(only)
    if '--preview' in args:
        preview(masks, args[args.index('--preview') + 1])
    print(f'{len(masks)} structures traced')

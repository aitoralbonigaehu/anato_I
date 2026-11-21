"""
Belortzioak: every arrow tip well inside the structure it names.

The printed arrows often stop on a structure's outline (or a hair short of it), so the dot drawn at the
tip sat on the seam between two structures. For every name with a traced extent (`belortzioak-areas.json`,
overridden by `belortzioak-revised-areas.json`, as the app reads them), each tip is moved to the nearest
point that lies at least `DEPTH` pixels inside the extent (or, in a structure thinner than that, on its
middle line). Tips that already are stay where they were printed. The moved tips go to
`content/belortzioak-tips.json` (figure fractions, keyed like the items), which the app reads in place of
the printed ones. A tip carried further than `FAR` pixels is reported: the trace or the tip needs a look.

  python scripts/belortzioak/tips.py
"""
import json
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[2]
C = ROOT / 'content'
DEPTH = 7  # px of the figure (1600 px tall): the dot's radius is about 7 px there
FAR = 45


def main():
    geo = json.loads((C / 'belortzioak-geometry.json').read_text(encoding='utf8'))
    areas = json.loads((C / 'belortzioak-areas.json').read_text(encoding='utf8'))
    areas.update(json.loads((C / 'belortzioak-revised-areas.json').read_text(encoding='utf8')))
    out = {}
    for plate, g in geo.items():
        w, h = g['size']
        for it in g['items']:
            key = f"{plate}:{it.get('id', it['n'])}"
            if isinstance(it['n'], float) and 'id' not in it and it['n'].is_integer():
                key = f"{plate}:{int(it['n'])}"
            rings = areas.get(key)
            if not rings:
                continue
            m = np.zeros((h, w), np.uint8)
            # even-odd, as the app fills it
            for ring in rings:
                r = np.zeros_like(m)
                cv2.fillPoly(r, [np.array([[x * w, y * h] for x, y in ring], np.int32)], 1)
                m ^= r
            m = (m * 255).astype(np.uint8)
            dt = cv2.distanceTransform(m, cv2.DIST_L2, 5)
            targets = it['targets'] or [it['label']]
            moved = []
            changed = False
            for tx, ty in targets:
                px, py = tx * w, ty * h
                xi, yi = int(round(min(w - 1, max(0, px)))), int(round(min(h - 1, max(0, py))))
                need = min(DEPTH, 0.8 * float(dt.max()))
                if dt[yi, xi] >= need:
                    moved.append([tx, ty])
                    continue
                ys, xs = np.nonzero(dt >= need)
                d = (xs - px) ** 2 + (ys - py) ** 2
                i = int(np.argmin(d))
                dist = float(np.sqrt(d[i]))
                if dist > FAR:
                    print(f'far  {key}: {dist:.0f} px from ({px:.0f}, {py:.0f}) to ({xs[i]}, {ys[i]})')
                moved.append([round(float(xs[i]) / w, 4), round(float(ys[i]) / h, 4)])
                changed = True
            if changed:
                out[key] = moved
    (C / 'belortzioak-tips.json').write_text(json.dumps(dict(sorted(out.items())), separators=(',', ':')), encoding='utf8')
    print(f'{len(out)} names with a tip moved inside')


if __name__ == '__main__':
    main()

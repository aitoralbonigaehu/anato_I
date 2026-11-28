"""Corrections written on the 2026-11-27 version of the course PDF ("Belortzioak zuzenduta.pdf").

Read off the page in PDF points (72/inch) at 250-600 dpi, and converted here to the 1450 px page the
other correction modules use. Rows are (number, label, targets[, extra]); None keeps the printed
label, an empty target list puts the number on its structure, and `extra` sets what the figure shows
(`tag`) or a hand-written label's `n`.

  p04  9 is the lens (the circle on the arrow's start); 11 renamed only.
  p27  the eye (18 iris, 19 lens, 25 sclera) and the ear (20 auditory tube, 21 semicircular canals,
       22/23 utricle and saccule under one circle, 24 cochlea), written in pink on the figure.
  p29  the "itxita" bracket ends where each neuropore begins; 2 and 3 point there.
  p30  1 (III) gets its own hand-drawn arrow; the printed arrow that pointed to 1 is now 2 (IV);
       15 (optic cup) and 16 (lens) are new; 8 (VI) keeps its printed arrow.
  p32  the printed 2-4 boxes are blacked out: 2 (ganglion, circled) and 3 (dorsal root) are new
       hand-written labels, and 5-7 name the plexuses.
  p33  8 moved inside the diencephalon (its printed arrow is scribbled over); 13-17 and the isthmus
       are new.
  p34  17 (dorsal root) and 18 (spinal ganglion) are circled by hand beside the cord; 15 and 16 are
       renamed in the notes as not visible, so they stay off the figure (content/belortzioak.ts).
  p35  5 is circled as a region (its arrow tip painted out); 6.1 and 19 are brackets; 1 rewritten.
"""

K = 1450 / 842


def _p(point):
    return (round(point[0] * K, 2), round(point[1] * K, 2))


_ROWS = {
    27: [
        (18, (368.4, 248.4), [(346.0, 262.0)]),
        (19, (347.3, 323.5), [(339.6, 271.2)]),
        (25, (312.7, 314.9), [(318.0, 263.0)]),
        (20, (260.9, 217.8), [(237.8, 219.9)]),
        (21, (252.2, 120.5), [(194.6, 160.8), (229.2, 145.0)]),
        (22, (186.0, 189.6), [(212.8, 166.6)], {"tag": "22,23"}),
        (24, (266.6, 150.7), [(244.0, 168.0)]),
    ],
    29: [
        (2, None, [(207.0, 210.6)]),
        (3, None, [(207.0, 589.7)]),
    ],
    30: [
        (1, (383.0, 248.3), [(369.0, 231.7)]),
        (2, (366.3, 265.4), [(354.6, 224.0)]),
        (15, (356.0, 278.9), [(350.6, 260.9)]),
        (16, (342.0, 276.2), [(349.2, 247.4)]),
    ],
    32: [
        (2, (73.9, 279.2), []),
        (3, (21.7, 273.8), [(60.0, 277.8)]),
        (5, (121.6, 227.0), []),
        (6, (127.9, 332.3), []),
        (7, (357.4, 443.2), []),
    ],
    33: [
        (8, (386.4, 252.8), []),
        (13, (357.6, 304.8), []),
        (14, (422.4, 300.0), []),
        (15, (344.0, 188.0), []),
        (16, (58.0, 100.4), [(80.8, 126.8)]),
        (17, (70.0, 328.0), []),
        ("istmoa", (468.0, 111.6), [(436.8, 129.6)], {"n": 18, "tag": "a"}),
    ],
    34: [
        (17, (73.8, 416.4), [(74.9, 385.8)]),
        (18, (114.5, 355.2), [(94.3, 366.0)]),
    ],
    35: [
        (1, (76.0, 464.0), []),
        (5, None, []),
        (6.1, (187.0, 107.4), [(203.0, 138.0)]),
        (19, (61.7, 189.4), [(104.0, 208.0)]),
    ],
}

REVISED_TARGETS = {
    page: [(row[0], _p(row[1]) if row[1] else None, [_p(t) for t in row[2]], *row[3:]) for row in rows]
    for page, rows in _ROWS.items()
}

TRACES = {}

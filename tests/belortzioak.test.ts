import { describe, expect, it } from 'vitest';
import { BEL_ITEMS, BEL_KINDS, BEL_MERGED, BEL_PLATES, BEL_SYSTEMS, matchesName, normalizeName, sameKey } from '@/content/belortzioak';
import mergeJson from '@/content/belortzioak-merge.json';
import { arrange, H } from '@/lib/belortzioakLayout';
import { evaluateBelLocation } from '@/components/shell/Belortzioak';

const inUnit = ([x, y]: [number, number]) => x >= 0 && x <= 1 && y >= 0 && y <= 1;

describe('belortzioak: the figure set', () => {
  it('covers all 34 anatomical plates in the revised PDF', () => {
    expect(BEL_PLATES.map((p) => p.id)).toEqual(Array.from({ length: 34 }, (_, i) => `p${String(i + 2).padStart(2, '0')}`));
    for (const sys of BEL_SYSTEMS) expect(BEL_PLATES.some((p) => p.system === sys.id)).toBe(true);
  });

  it('gives every figure its size and named, placed structures', () => {
    for (const p of BEL_PLATES) {
      expect(p.size[0], p.id).toBeGreaterThan(500);
      expect(p.items.length, p.id).toBeGreaterThanOrEqual(2);
      for (const it of p.items) {
        expect(it.name.trim(), it.key).not.toBe('');
        expect(inUnit(it.label), it.key).toBe(true);
        expect(it.targets.length, it.key).toBeGreaterThan(0);
        expect(it.targets.every(inUnit), it.key).toBe(true);
        expect(it.r.length, it.key).toBe(it.targets.length);
        for (const shape of it.area ?? [])
          for (const ring of shape) {
            expect(ring.length, it.key).toBeGreaterThanOrEqual(3);
            expect(ring.every(inUnit), it.key).toBe(true);
          }
      }
    }
  });

  it('uses the revised digestive labels and leaves out crossed-out or hidden parts', () => {
    const at = (key: string) => BEL_ITEMS.find(({ item }) => item.key === key)?.item;
    for (const key of ['p16:6', 'p18:3', 'p18:4', 'p19:9', 'p20:2', 'p20:14', 'p21:5', 'p23:10', 'p26:6', 'p27:13', 'p30:10', 'p30:11', 'p32:4']) {
      expect(at(key), key).toBeUndefined();
    }
    expect(at('p16:16')?.name).toBe('Hodi tiroglosoa');
    expect(at('p17:14')?.name).toBe('Timoa');
    expect(at('p20:5')?.name).toBe('Hestegorria');
    expect(at('p20:8')?.name).toBe('Are-hasikin dortsala');
    expect(at('p20:9')?.name).toBe('Are-hasikin bentrala');
    expect(at('p20:23')?.name).toBe('Hodi tiroglosoa');
    expect(at('p21:13')).toMatchObject({ tag: '13/14', name: 'Jejunoa eta ileona' });
    expect(at('p22:5')?.name).toBe('Duodenoa');
    expect(at('p24:2.2')?.name).toBe('Bowmanen kapsula');
    expect(at('p35:17')?.name).toBe('Diafragma');
    expect(matchesName('hodi tiroglosoa', at('p20:5')!)).toBe(false);
  });

  it('keeps keys unique and one number per name within a figure', () => {
    const keys = BEL_ITEMS.map((x) => x.item.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const p of BEL_PLATES) {
      const names = p.items.map((it) => normalizeName(it.name));
      expect(new Set(names).size, p.id).toBe(names.length);
    }
  });

  it('leaves out numbers whose legend line is crossed out or not visible', () => {
    // p04 12 "Ildo zerbikala" (not visible), p07 6/21 (crossed out), p17 13 (not visible), p21 10/11 (no legend)
    const has = (k: string) => BEL_ITEMS.some((x) => x.item.key === k);
    for (const k of ['p04:12', 'p07:6', 'p07:21', 'p17:13', 'p21:10', 'p21:11']) expect(has(k), k).toBe(false);
  });

  it('follows the hand-written corrections of the figure set', () => {
    const at = (k: string) => BEL_ITEMS.find((x) => x.item.key === k)?.item;
    const name = (k: string) => at(k)?.name;
    // crossed-out names replaced by the hand-written ones
    expect(name('p07:1')).toBe('Zain sinua');
    expect(name('p07:2')).toBe('Atal aurikularra');
    expect(name('p07:4')).toBe('Atal bentrikularra');
    expect(BEL_PLATES.find((p) => p.id === 'p07')?.sub).toBe('1. enbrioia');
    expect(name('p08:4')).toBe('Arteria enborra');
    expect(name('p09:8')).toBe('Zain-balbulak');
    expect(name('p09:9')).toBe('Kuxin endokardikoa');
    expect(name('p10:10')).toBe('Lepauztaipeko arteria');
    expect(name('p13:1')).toBe('Ezkerreko bentrikulua');
    expect(name('p13:2')).toBe('Eskuineko bentrikulua');
    expect(name('p14:7')).toBe('Hodi benosoa');
    // a legend line scribbled out; numbers and names written only by hand
    expect(at('p12:17')).toBeUndefined();
    expect(name('p09:5')).toBe('Zain sinua');
    expect(at('p12:9.2')).toMatchObject({ tag: '9.2', name: 'Sahietsarteko arteriak' });
    expect(at('p12:r10b')).toMatchObject({ tag: '10b', ink: 'red', name: 'Beheko kaba zainaren zuloa' });
    expect(['a', 'b', 'c', 'd'].map((t) => name(`p06:${t}`))).toEqual(['Aorta-zakua', 'Enbor arteriosoa', 'Barrunbe perikardikoa', 'Erreten aurikulobentrikularra']);
    // box 10 crossed out on p.9: it points at the circled 10 on the canal, with no arrow
    expect(at('p09:10')!.targets).toEqual([at('p09:10')!.label]);
    // the same number written again on the section: it points at both places
    for (const k of ['p09:1', 'p09:2', 'p09:6', 'p09:7']) expect(at(k)!.targets.length, k).toBe(2);
    // blue arrows added on p.7
    expect(at('p07:15')!.arrow).toBe(true);
    expect(at('p07:16')!.targets.length).toBe(2);
  });

  it('preserves source readings that have no distinct locator on that plate', () => {
    const plate = BEL_PLATES.find((p) => p.id === 'p12')!;
    for (const key of ['p12:r5', 'p12:r6', 'p12:12', 'p12:19']) expect(plate.items.some((it) => it.key === key)).toBe(false);
    for (const [tag, term] of [['5', 'Septum primum'], ['6', 'Ostium secundum'], ['11', 'Birika-zain komun primitiboa'], ['12', 'Beheko arteria mesenterikoa']]) {
      expect(plate.unlocated?.some((entry) => entry.tag === tag && entry.name.includes(term)), term).toBe(true);
    }
    expect(BEL_PLATES.find((p) => p.id === 'p21')?.unlocated).toContainEqual({ tag: '17', name: 'Kolona' });
  });

  it('follows the 2026-11-27 corrections (eye and ear, cranial nerves, brain vesicles)', () => {
    const at = (key: string) => BEL_ITEMS.find(({ item }) => item.key === key)?.item;
    expect(at('p04:9')?.name).toBe('Begia: kristalinoa');
    expect(['p27:18', 'p27:19', 'p27:20', 'p27:21', 'p27:24', 'p27:25'].map((k) => at(k)?.name)).toEqual([
      'Irisa', 'Kristalinoa', 'Tronpa faringotinpanikoa', 'Hodi erdizirkularrak', 'Koklea (hemen entzumenaren errezeptoreak)', 'Esklerotika (zuri dagoena)',
    ]);
    expect(at('p27:22')).toMatchObject({ tag: '22,23', name: 'Utrikulua eta sakulua' });
    expect(at('p27:21')!.targets).toHaveLength(2);
    // the bracket marks the closed tube: each neuropore is where it ends
    const tube = BEL_PLATES.find((p) => p.id === 'p29')!;
    expect(tube.unlocated).toBeUndefined();
    expect(at('p29:2')!.targets[0][1]).toBeLessThan(at('p29:3')!.targets[0][1]);
    // III, IV and VI are taught now; 1 has its own arrow, the printed one is IV
    expect(['p30:1', 'p30:2', 'p30:8', 'p30:12'].map((k) => at(k)?.name)).toEqual([
      'Nerbio okulomotorra (III)', 'Nerbio troklearra (IV)', 'Nerbio abdentzailea (VI)', 'Nerbio estatoakustikoa (VIII)',
    ]);
    expect(at('p32:3')?.name).toBe('Atzeko sustraia');
    expect(at('p32:2')!.arrow).toBe(false);
    expect(at('p33:istmoa')).toMatchObject({ tag: 'a', name: 'Istmoa (estugunea)' });
    expect(at('p33:8')!.arrow).toBe(false);
    expect(['p35:5', 'p35:6', 'p35:6.1', 'p35:19'].map((k) => at(k)?.name)).toEqual(['Erraboila', 'Zubia', 'Zubi-tolespena', 'Lepo-tolespena']);
    expect(at('p35:13')?.name).toBe('Bentrikulu arteko zuloa');
    // p02 and p34 were corrected too: renamed 2 and 8; 17 and 18 circled by hand, 15 and 16 "ez da ikusten"
    expect(['p02:2', 'p02:8'].map((k) => at(k)?.name)).toEqual(['Plakoda otikoa (aurrerago belarria)', 'Nerbio trigeminoaren gongoilaren goragunea']);
    expect(['p34:17', 'p34:18'].map((k) => at(k)?.group)).toEqual(['Nerbio errakideoak', 'Nerbio errakideoak']);
    expect(at('p34:18')!.targets[0][0]).toBeGreaterThan(at('p34:17')!.targets[0][0]);
    expect(BEL_PLATES.find((p) => p.id === 'p34')!.unlocated?.map((u) => u.tag)).toEqual(['15', '16']);
    // the iris arrow starts on the blue arc, the lens one on the ring below it
    expect(at('p27:18')!.targets[0][1]).toBeLessThan(at('p27:19')!.targets[0][1]);
  });

  it('lights every structure of the corrected plates as an area, not only a dot', () => {
    for (const id of ['p02', 'p03', 'p04', 'p05', 'p07', 'p08', 'p27', 'p29', 'p30', 'p31', 'p32', 'p33', 'p34', 'p35']) {
      const plate = BEL_PLATES.find((p) => p.id === id)!;
      expect(plate.items.filter((it) => !it.area?.length).map((it) => it.key), id).toEqual([]);
    }
  });

  it('uses the audited anatomical landmarks in both drawings and removes extraneous leaders', () => {
    const at = (key: string) => BEL_ITEMS.find(({ item }) => item.key === key)!.item;
    // Tip of the PDF vector in the native p02 crop, independently measured before rounding.
    expect(at('p02:8').targets).toEqual([[0.4469, 0.1941]]);
    expect(at('p25:8').name).toBe('Gernu-maskuria');
    expect(at('p25:8').targets).not.toEqual(at('p25:9').targets);
    expect(at('p27:14.1').name).toBe('Loki-hezurraren ezkata');
    expect(at('p27:14.2').name).toBe('Loki-hezurraren harkaitza');
    expect(at('p27:17').name).toBe('Sudur-kartilagoa');
    for (const key of ['p25:3', 'p25:4', 'p25:6', 'p28:16']) expect(at(key).targets, key).toHaveLength(1);
    for (const key of ['p29:4', 'p29:5', 'p29:6']) {
      const { targets } = at(key);
      expect(targets, key).toHaveLength(2);
      expect(targets[1][0] - targets[0][0], key).toBeGreaterThan(0.15);
    }
  });

  it('links the same structure across figures', () => {
    const sinus = BEL_ITEMS.filter((x) => sameKey(x.item.name) === sameKey('Kloaka'));
    expect(sinus.map((x) => x.plate.id).sort()).toEqual(['p19', 'p20', 'p24']);
  });
});

describe('belortzioak: typed answers', () => {
  const item = (name: string, accept?: string[]) => ({ name, accept });

  it('forgives accents, case, hyphens, ordinals and small typos', () => {
    expect(matchesName('sinu benosua', item('Sinu benosoa'))).toBe(true);
    expect(matchesName('3 faringe arkua', item('III. faringe-arkua'))).toBe(true);
    expect(matchesName('zilborarteriak', item('Zilbor-arteriak'))).toBe(true);
    expect(matchesName('mesodermo paraxiala', item('Mesodermo paraxiala'))).toBe(true);
    expect(matchesName('hestegorria', item('Hodi tiroglosoa, hestegorria', ['hodi tiroglosoa', 'hestegorria']))).toBe(true);
    expect(matchesName('Rathke poltsa', item('Rathke poltsa (adenohipofisia)'))).toBe(true);
  });

  it('gives an exact anatomical name priority over a similar spelling', () => {
    for (const [first, second] of [['Atal epaxiala', 'Atal hipaxiala'], ['Endodermoa', 'Ektodermoa'], ['Laringea', 'Faringea']]) {
      expect(matchesName(first, item(second))).toBe(false);
      expect(matchesName(second, item(first))).toBe(false);
      expect(matchesName(first, item(first))).toBe(true);
    }
    expect(matchesName('epaxiala atal', item('Atal hipaxiala'))).toBe(false);
    expect(matchesName('laringea', item('Laringea (3. enbrioia)'))).toBe(true);
    expect(matchesName('larinhea', item('Laringea'))).toBe(true);
  });

  it('does not pass a sibling for the asked structure', () => {
    expect(matchesName('Beheko arteria mesenterikoa', item('Goiko arteria mesenterikoa'))).toBe(false);
    expect(matchesName('Ezkerreko aurikula', item('Eskuineko aurikula'))).toBe(false);
    expect(matchesName('II. faringe-arkua', item('III. faringe-arkua'))).toBe(false);
    expect(matchesName('Somita lunbarrak', item('Somita sakroak'))).toBe(false);
    expect(matchesName('ab', item('Ahoa'))).toBe(false);
  });
});

describe('belortzioak: name columns', () => {
  it('keeps every name on the plate, apart from its neighbours, with no crossing leaders', () => {
    for (const p of BEL_PLATES) {
      const placed = arrange(p.items);
      expect(placed.length, p.id).toBe(p.items.length);
      for (const side of ['l', 'r'] as const) {
        const col = placed.filter((x) => x.side === side).sort((a, b) => a.y - b.y);
        for (const x of col) expect(x.y >= 0 && x.y <= H, p.id).toBe(true);
        for (let i = 1; i < col.length; i++) expect(col[i].y - col[i - 1].y, `${p.id} ${side}`).toBeGreaterThanOrEqual(40);
        // leaders from the column edge to the mean target: no two cross
        const ex = side === 'l' ? 0 : 1;
        const seg = col.map((x) => {
          const it = p.items.find((i) => i.key === x.key)!;
          const tx = it.targets.reduce((a, t) => a + t[0], 0) / it.targets.length;
          const ty = it.targets.reduce((a, t) => a + t[1], 0) / it.targets.length;
          return [ex, x.y / H, tx, ty] as const;
        });
        const d = (ax: number, ay: number, bx: number, by: number, cx: number, cy: number) => (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
        for (let i = 0; i < seg.length; i++)
          for (let j = i + 1; j < seg.length; j++) {
            const [a, b] = [seg[i], seg[j]];
            const crosses = d(a[0], a[1], a[2], a[3], b[0], b[1]) * d(a[0], a[1], a[2], a[3], b[2], b[3]) < 0 && d(b[0], b[1], b[2], b[3], a[0], a[1]) * d(b[0], b[1], b[2], b[3], a[2], a[3]) < 0;
            expect(crosses, `${p.id}: ${col[i].key} × ${col[j].key}`).toBe(false);
          }
      }
    }
  });
});

describe('belortzioak: identifying the tissue at a tap', () => {
  it('distinguishes the sinus venosus from the adjacent right atrium in the cardiac section', () => {
    const plate = BEL_PLATES.find((p) => p.id === 'p09')!;
    const sinus = plate.items.find((it) => it.key === 'p09:5')!;
    const atrium = plate.items.find((it) => it.key === 'p09:6')!;
    expect(atrium.targets.length).toBe(2);
    for (const tip of atrium.targets) {
      expect(evaluateBelLocation(plate, atrium, tip).right).toBe(true);
      expect(evaluateBelLocation(plate, sinus, tip)).toEqual({ right: false, other: atrium.key });
    }
    expect(evaluateBelLocation(plate, atrium, sinus.targets[0]).right).toBe(false);
    expect(evaluateBelLocation(plate, sinus, sinus.targets[0]).right).toBe(true);
  });

  it('accepts the glomerulus as part of the mesonephric corpuscle and distinguishes its capsule', () => {
    const plate = BEL_PLATES.find((p) => p.id === 'p24')!;
    const get = (n: number) => plate.items.find((it) => it.n === n)!;
    const corpuscle = get(2), glomerulus = get(2.1), capsule = get(2.2);
    for (const part of [glomerulus, capsule]) {
      expect(evaluateBelLocation(plate, corpuscle, part.targets[0]).right).toBe(true);
      expect(evaluateBelLocation(plate, part, part.targets[0]).right).toBe(true);
    }
    expect(evaluateBelLocation(plate, glomerulus, capsule.targets[0]).right).toBe(false);
  });
});

describe('belortzioak: merged figures (one drawing, the names of all its copies)', () => {
  const members = (id: string) => Object.keys((mergeJson as Record<string, { members: Record<string, unknown> }>)[id].members);

  it('merges each repeated drawing, every copy once, no figure in two groups', () => {
    const all = BEL_MERGED.flatMap((g) => members(g.id));
    expect(new Set(all).size).toBe(all.length);
    expect(BEL_MERGED.map((g) => g.id)).toEqual(['f-sagitala', 'f-1', 'f-2', 'f-3', 'f-birika']);
  });

  it('keeps every name of every copy (a name in two copies once), placed on the figure', () => {
    for (const g of BEL_MERGED) {
      const names = new Set(g.all.items.flatMap((it) => [it.name, ...(it.accept ?? [])].map(sameKey)));
      for (const pid of members(g.id))
        for (const it of BEL_PLATES.find((p) => p.id === pid)!.items) expect(names.has(sameKey(it.name)), `${g.id} ${it.key} ${it.name}`).toBe(true);
      const keys = g.all.items.map((it) => it.key);
      expect(new Set(keys).size, g.id).toBe(keys.length);
      for (const it of g.all.items) {
        expect(it.targets.every(inUnit) && inUnit(it.label), it.key).toBe(true);
        expect(it.r.length, it.key).toBe(it.targets.length);
      }
    }
  });

  it('gives every name a kind, and each kind its own figure with only that kind', () => {
    for (const g of BEL_MERGED) {
      for (const it of g.all.items) expect(BEL_KINDS.some((k) => k.id === it.kind), it.key).toBe(true);
      expect(g.kinds.reduce((a, k) => a + k.plate.items.length, 0), g.id).toBe(g.all.items.length);
      for (const k of g.kinds) {
        expect(k.plate.items.every((it) => it.kind === k.kind), k.plate.id).toBe(true);
        // the picture drawn is a copy of this drawing, coloured for the kind
        expect(members(g.id), k.plate.id).toContain(k.plate.img);
      }
    }
    const kindOf = (g: string, name: string) => BEL_MERGED.find((x) => x.id === g)!.all.items.find((it) => it.name === name)?.kind;
    expect(kindOf('f-3', 'Zain sinua')).toBe('bihotza');
    expect(kindOf('f-3', 'Goiko kaba zaina')).toBe('zainak');
    expect(kindOf('f-2', 'Barea')).toBe('linfa');
    expect(kindOf('f-1', 'Bitelo-zainak')).toBe('zainak');
    expect(kindOf('f-1', '1. aorta-arkua')).toBe('arteriak');
  });

  it('keeps every merged target and mask registered to the image of its source', () => {
    type Pt = [number, number];
    const rounded = ([x, y]: Pt) => [Number(x.toFixed(8)), Number(y.toFixed(8))];
    for (const group of BEL_MERGED) {
      for (const plate of [group.all, ...group.kinds.map((k) => k.plate)]) {
        for (const item of plate.items) {
          const matrix = plate.imgTransforms![item.from!];
          const map = ([x, y]: Pt): Pt => [
            matrix[0][0] * x + matrix[0][1] * y + matrix[0][2],
            matrix[1][0] * x + matrix[1][1] * y + matrix[1][2],
          ];
          const names = new Set([item.name, ...(item.accept ?? [])].map(sameKey));
          const source = BEL_PLATES.find((p) => p.id === item.from)!.items.find((other) => names.has(sameKey(other.name)))!;
          const id = `${plate.id} ${item.key}`;
          expect(source, id).toBeDefined();
          expect(item.targets.map(rounded), id).toEqual(source.targets.map((p) => rounded(map(p))));
          expect(item.marks.map((m) => rounded(m.at)), id).toEqual(source.marks.map((m) => rounded(map(m.at))));
          expect(item.arrow, id).toBe(source.arrow);
          expect(item.area?.map((shape) => shape.map((ring) => ring.map(rounded))), id).toEqual(
            source.area?.map((shape) => shape.map((ring) => ring.map((p) => rounded(map(p))))),
          );
        }
      }
    }
  });
});

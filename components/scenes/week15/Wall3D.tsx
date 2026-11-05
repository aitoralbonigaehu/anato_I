'use client';

import { FRONT, KEY15, endPose, poseStage, type StageSpec, type Where } from './common';
import { UP0, uroModel, type UroOpts, type UroPose } from './uro-model';

/**
 * Topic 15 on the posterior body wall (uro-model.ts): the three kidney systems (stage 1), the pronephros at
 * the neck (2), the mesonephros and the urogenital ridge (5), the metanephros (7), the kidneys' ascent (10)
 * and the suprarenal glands where they form (11). Seen from the front: the embryo's left on the viewer's right.
 */

const build = (pose: UroPose, opts: UroOpts) => uroModel(pose, opts);
const CAP = 'Atzeko pareta aurretik (3D eredua): enbrioiaren ezkerra zure eskuinean';

/** The posterior wall in the embryo: its trunk, neck to cloaca, the wall's plane glowing behind the gut. */
export const WALL_WHERE: Where = {
  th: 0,
  at: [0, -0.3, -0.25],
  scale: 1.3,
  planes: [{ center: [0, -0.3, -0.62], a: [1.6, 0, 0], b: [0, 3.4, 0] }],
  note: 'Enbrioiaren enborra, lepotik kloakaraino: atzeko pareta aurretik ikusiko dugu',
};

// ———————————————————————————— 1. Sarrera: hiru azpisistemak ————————————————————————————

export const S1 = [0, 0.22, 0.47, 0.73] as const;

const spec1: StageSpec<UroPose, UroOpts> = {
  S: S1,
  pose: UP0,
  opts: { glom: 0 },
  caption: CAP,
  key: KEY15.three,
  keyTitle: 'Kolorea = azpisistema',
  where: WALL_WHERE,
  steps: [
    {
      cam: FRONT(21, [0, -0.1, -0.4]),
      dim: ['bitarteko-mesodermoa'],
      names: [
        { id: 'bitarteko-mesodermoa', sub: 'aortaren alde bietan: gernu sistemaren jatorria' },
        { id: 'aorta-dortsalak', small: true, from: 0.3 },
        { id: 'somitak', small: true, from: 0.4 },
        { id: 'kloaka', small: true, from: 0.5 },
      ],
      note: 'Gernu sistema bitarteko mesodermoaren eratorria da (mesodermikoa); 4. astean sortzen da, atzeko paretan',
    },
    {
      to: { pro: 1, proDuct: 1, meso: 1, wolff: 1, bud: 1, blast: 1 },
      run: [0.05, 0.75],
      cam: FRONT(21, [0, -0.1, -0.4]),
      names: [
        { id: 'pronefrosa', sub: 'alde zefalikoa (lepoa)', from: 0.1 },
        { id: 'mesonefrosa', sub: 'alde toraxikoa', from: 0.35 },
        { id: 'hodi-mesonefrikoa', small: true, from: 0.5 },
        { id: 'metanefrosa', sub: 'alde sakroa → behin betiko giltzurruna', from: 0.6 },
      ],
      note: 'Hiru azpisistema, atzeko paretan, goitik behera: pronefrosa (lepoa), mesonefrosa (toraxa), metanefrosa (sakroa)',
    },
    {
      to: { proGone: 0.8, mesoGone: 0.75 },
      run: [0.08, 0.85],
      cam: FRONT(21, [0, -0.1, -0.4], 18, 8),
      glide: 0.05,
      names: [
        { id: 'pronefrosa', sub: 'endekatzen (lehena)' },
        { id: 'mesonefrosa', sub: 'endekatzen (bigarrena)', from: 0.4 },
        { id: 'metanefrosa', sub: 'garatzen' },
      ],
      note: 'Prozesu jarraia, kranealetik kaudalera: sistema bat garatzen den heinean, aurrekoa endekatzen da',
    },
    {
      to: { kidney: 1 },
      run: [0.1, 0.7],
      cam: FRONT(21, [0, -0.4, -0.5], 10, 6),
      glide: 0.05,
      dim: ['giltzurruna', 'metanefrosa'],
      names: [
        { id: 'giltzurruna', text: 'Behin betiko giltzurruna', sub: 'metanefrosatik: funtzionala den bakarra' },
        { id: 'mesonefrosa', sub: 'ez funtzionala', small: true },
        { id: 'pronefrosa', sub: 'ez funtzionala', small: true },
      ],
      note: 'Pronefrosa eta mesonefrosa ez dira funtzionalak (4. astean hazi eta endekatu). Metanefrosa → behin betiko giltzurruna: funtzionala den bakarra',
    },
  ],
};
export const Intro15 = poseStage(spec1, build);

// ———————————————————————————— 2. Pronefrosa (lepoa) ————————————————————————————

export const S2 = [0, 0.33, 0.66] as const;
const NECK = (dist = 8.5, yaw = 0, elev = 8) => FRONT(dist, [0, 2.75, -0.5], yaw, elev);

const spec2: StageSpec<UroPose, UroOpts> = {
  S: S2,
  pose: { ...UP0, meso: 0, wolff: 0 },
  opts: { glom: 0, gut: 0 },
  caption: 'Lepo mailako atzeko pareta (3D eredua, aurretik)',
  key: KEY15.pro,
  steps: [
    {
      to: { pro: 0.3 },
      run: [0.1, 0.8],
      cam: NECK(),
      glide: 0.06,
      dim: ['pronefrosa', 'nefrotomak', 'somitak', 'bitarteko-mesodermoa'],
      names: [
        { id: 'somitak', text: 'Lepo-somitak' },
        { id: 'pronefrosa', sub: 'primitiboena; lepo mailan, 4. astean', from: 0.3 },
        { id: 'bitarteko-mesodermoa', small: true, from: 0.5 },
      ],
      note: 'Pronefrosa: hiruretan primitiboena. Lepo mailan (lepo-somiten parean), 4. astean sortu eta endekatzen da; ez da funtzionala',
    },
    {
      to: { pro: 0.45 },
      cam: NECK(7.5, 22, 10),
      dim: ['nefrotomak', 'bitarteko-mesodermoa'],
      names: [{ id: 'nefrotomak', sub: 'zelula metaketak · bikoitzak · 7–10 bikote', from: 0.1 }],
      note: 'Unitateak nefrotomak dira: zelula metaketa bikoitzak (eskuinean eta ezkerrean), 7–10 bikote',
      warn: false,
    },
    {
      to: { pro: 1, proDuct: 1, proGone: 0.55 },
      run: [0.06, 0.85],
      cam: NECK(9, 8, 8),
      glide: 0.05,
      dim: ['nefrotomak', 'pronefrosa', 'hodixka-pronefrikoak', 'hodi-pronefrikoa'],
      names: [
        { id: 'nefrotomak', sub: 'goikoak endekatzen' },
        { id: 'hodixka-pronefrikoak', from: 0.3 },
        { id: 'hodi-pronefrikoa', from: 0.5 },
      ],
      note: 'Beheko nefrotomak garatu ahala goikoak endekatzen dira: prozesu jarraia, kranealetik kaudalera',
    },
  ],
};
export const Pro15 = poseStage(spec2, build);

// ———————————————————————————— 5. Mesonefrosa eta gandor urogenitala ————————————————————————————

export const S5 = [0, 0.25, 0.5, 0.75] as const;
const TRUNK = (dist = 12.5, yaw = 0, elev = 8, target: [number, number, number] = [0, 0.0, -0.4]) => FRONT(dist, target, yaw, elev);

const spec5: StageSpec<UroPose, UroOpts> = {
  S: S5,
  pose: { ...UP0, pro: 1, proDuct: 1, proGone: 0.45 },
  opts: { glom: 0.6, gut: 0.4 },
  caption: CAP,
  key: KEY15.meso,
  steps: [
    {
      to: { meso: 0.65, proGone: 0.82 },
      run: [0.05, 0.85],
      cam: TRUNK(14, 0, 8, [0, 0.8, -0.4]),
      glide: 0.06,
      dim: ['mesonefrosa', 'pronefrosa'],
      names: [
        { id: 'pronefrosa', sub: 'endekatzen', small: true },
        { id: 'mesonefrosa', sub: 'kaudalerago, garatuagoa', from: 0.35 },
      ],
      note: 'Mesonefrosa pronefrosa baino kaudalerago eta garatuago: 4. astean sortzen da, pronefrosa endekatzen den bitartean',
    },
    {
      to: { meso: 1, wolff: 1 },
      run: [0.05, 0.8],
      cam: TRUNK(12, 26, 10),
      glide: 0.06,
      dim: ['mesonefrosa', 'kordoi-nefrogenoa', 'hodi-mesonefrikoa'],
      names: [
        { id: 'kordoi-nefrogenoa', sub: 'bi gandor trinko, toraxetik sakrora' },
        { id: 'hodi-mesonefrikoa', text: 'Hodi mesonefrikoa (Wolff hodia)', sub: 'gandor barruan · biltzailea', from: 0.4 },
      ],
      note: 'Bi gandor trinko (eskuinean eta ezkerrean), alde torazikotik sakrora: kordoi nefrogenoak. Bakoitzaren barruan, hodi mesonefrikoa (Wolff hodia)',
    },
    {
      cam: TRUNK(10, 30, 12, [0, -0.3, -0.35]),
      dim: ['mesonefrosa', 'hodixka-mesonefrikoak', 'gandor-urogenitala'],
      names: [
        { id: 'gandor-urogenitala', sub: 'gernu osagaia + osagai genitala' },
        { id: 'hodixka-mesonefrikoak', small: true, from: 0.3 },
      ],
      note: 'Kordoi nefrogenoen barruan bi osagai: gernu osagaia eta osagai genitala → gandor urogenitalak deitzen zaie',
    },
    {
      to: { gonadal: 1 },
      run: [0.08, 0.7],
      cam: TRUNK(9.5, 34, 14, [0, -0.4, -0.3]),
      glide: 0.05,
      dim: ['gernu-gandorra', 'gonada-gandorra', 'mesonefrosa'],
      names: [
        { id: 'gernu-gandorra', text: 'Gernu gandorra', sub: 'alboan: gernu sistema (mesonefrosa)' },
        { id: 'gonada-gandorra', sub: 'erdialdean: sistema genitala', from: 0.35 },
      ],
      note: 'Gandor urogenitala bitan banatzen da: alboko gernu gandorra (gernu osagaiak) eta erdialdeko gonada gandorra (osagai genitalak)',
    },
  ],
};
export const Meso15 = poseStage(spec5, build);

// ———————————————————————————— 7. Metanefrosa: ureter kimua eta blastema ————————————————————————————

export const S7 = [0, 0.26, 0.52, 0.76] as const;
const SACRAL = (dist = 8.5, yaw = 20, elev = 10) => FRONT(dist, [0, -3.6, -0.35], yaw, elev, [20, 10]);

const spec7: StageSpec<UroPose, UroOpts> = {
  S: S7,
  pose: { ...endPose(spec5).pose, gonadal: 0 },
  opts: { glom: 0, gut: 1 },
  caption: CAP,
  key: KEY15.meta,
  steps: [
    {
      to: { mesoGone: 0.5 },
      run: [0.1, 0.9],
      cam: FRONT(16.5, [0, -1.15, -0.4], 10, 8),
      glide: 0.06,
      dim: ['mesonefrosa', 'hodi-mesonefrikoa', 'kloaka'],
      names: [
        { id: 'mesonefrosa', sub: 'endekatzen ari da' },
        { id: 'hodi-mesonefrikoa', sub: 'kloakaraino', from: 0.3 },
        { id: 'kloaka', from: 0.5 },
      ],
      note: 'Metanefrosa: garatuena eta konplexuena. Atzeko paretan, alde oso kaudalean (sakroan), 28–29. egunean, mesonefrosa endekatzen ari den bitartean',
    },
    {
      to: { bud: 1 },
      run: [0.08, 0.8],
      cam: SACRAL(),
      glide: 0.06,
      dim: ['ureter-kimua', 'hodi-mesonefrikoa', 'kloaka'],
      names: [
        { id: 'ureter-kimua', sub: 'hodi mesonefrikoaren adar bat, kloakatik hurbil', from: 0.2 },
        { id: 'hodi-mesonefrikoa', small: true },
      ],
      note: 'Hodi mesonefrikoaren mutur kaudalean kimu txiki bat: ureter kimua. Inguruko mesenkimara luzatzen da, atzeko horman sartuz',
    },
    {
      to: { blast: 1 },
      run: [0.08, 0.7],
      cam: SACRAL(7.5, 34, 12),
      dim: ['blastema-metanefrikoa', 'ureter-kimua'],
      names: [{ id: 'blastema-metanefrikoa', sub: 'metaketa trinkoa, ureter kimuaren mailan', from: 0.15 }],
      note: 'Maila berean, mesenkimako zelulak desberdindu eta multzokatzen dira: blastema metanefrikoa (metaketa trinkoa)',
    },
    {
      cam: SACRAL(7.8, 24, 10),
      dim: ['blastema-metanefrikoa', 'ureter-kimua'],
      names: [
        { id: 'ureter-kimua', text: 'Ureter kimua → sistema biltzailea', sub: 'hodiak: gernua bildu eta eraman' },
        { id: 'blastema-metanefrikoa', text: 'Blastema metanefrikoa → sistema iraizlea', sub: 'odola filtratu, gernua ekoitzi' },
      ],
      note: 'Behin betiko giltzurrunaren bi sistemak, jatorri desberdinekoak (biak bitarteko mesodermotik): biltzailea ureter kimutik, iraizlea blastematik',
    },
  ],
};
export const Meta15 = poseStage(spec7, build);

// ———————————————————————————— 10. Giltzurrunen igoera ————————————————————————————

export const S10 = [0, 0.24, 0.46, 0.74] as const;

const spec10: StageSpec<UroPose, UroOpts> = {
  S: S10,
  pose: { ...UP0, meso: 1, wolff: 1, mesoGone: 0.5, bud: 1, blast: 1, kidney: 1, gonadal: 1, bladder: 1 },
  opts: { glom: 0, gut: 1, iliac: 1 },
  caption: CAP,
  key: KEY15.ascent,
  steps: [
    {
      cam: FRONT(11, [0, -3.55, -0.4], 6, 8, [-75, 0]),
      glide: 0.06,
      dim: ['giltzurruna', 'ureterra'],
      names: [
        { id: 'giltzurruna', sub: 'piramideak: hodi biltzaileak eta nefronak' },
        { id: 'ureterra', sub: 'gernua gernu maskurira', from: 0.4 },
      ],
      note: 'Giltzurruna: piramideetan hodi biltzaileak eta nefronak; kalizak eta pelbisa enbutuak. Ureterrak gernua gernu maskurira darama',
    },
    {
      cam: FRONT(11, [0, -3.55, -0.4], -4, 6, [-75, 0]),
      dim: ['giltzurruna', 'gernu-maskuria'],
      names: [
        { id: 'giltzurruna', sub: '14. astetik gernua egiten du' },
        { id: 'gernu-maskuria', small: true, from: 0.4 },
      ],
      note: 'Gernuaren ekoizpena 14. astean hasten da; nefrogenesia 35. astean amaitzen da',
    },
    {
      to: { ascend: 1, mesoGone: 0.88 },
      run: [0.08, 0.85],
      cam: FRONT(15, [0, -1.8, -0.4], 12, 6),
      glide: 0.06,
      dim: ['giltzurruna', 'ureterra', 'mesonefrosa', 'arteria-iliako-primitiboak', 'giltzurrun-arteriak'],
      names: [
        { id: 'giltzurruna', sub: 'sakrotik → lunbarrera (igoera)' },
        { id: 'arteria-iliako-primitiboak', small: true, from: 0.2 },
        { id: 'giltzurrun-arteriak', small: true, from: 0.55 },
        { id: 'mesonefrosa', sub: 'txikiagoa: endekatzen', from: 0.45 },
      ],
      note: 'Giltzurrunak alde sakroan eratzen dira, kloakatik gertu, eta gorantz mugitzen dira abdomena luzatzean. Mesonefrosa gero eta txikiagoa',
    },
    {
      to: { gonadDown: 1, mesoGone: 0.95 },
      run: [0.08, 0.85],
      cam: FRONT(15, [0, -1.8, -0.4], -14, 6),
      glide: 0.06,
      dim: ['gonadak', 'ureterra', 'hodi-mesonefrikoa', 'giltzurruna'],
      names: [
        { id: 'gonadak', sub: 'mesonefrosaren parean eratu → behera' },
        { id: 'ureterra', sub: 'luzeago', from: 0.3 },
        { id: 'hodi-mesonefrikoa', sub: 'txikiagoa', from: 0.5 },
      ],
      note: 'Gonadak mesonefrosaren parean eratu eta behera doaz. Ureterrak luzatu egiten dira; hodi mesonefrikoa txikiagotu: gernu maskurian egitura berezi bat (trigonoa)',
    },
  ],
};
export const Ascent15 = poseStage(spec10, build);

// ———————————————————————————— 11. Giltzurrun gaineko guruinak, horman ————————————————————————————

export const spec11wall: StageSpec<UroPose, UroOpts> = {
  S: [0],
  pose: { ...endPose(spec10).pose },
  opts: { glom: 0, gut: 1, iliac: 1 },
  caption: CAP,
  key: KEY15.ascent,
  // The stage opens on this view (its first beat): the fly-in is here.
  where: { ...WALL_WHERE, note: 'Enbrioiaren enborra: atzeko pareta aurretik ikusiko dugu, giltzurrunen mailan' },
  steps: [
    {
      to: { adrenal: 1 },
      run: [0.08, 0.19],
      cam: FRONT(10.5, [0, -0.35, -0.6], 4, 10, [-45, 0]),
      glide: 0.06,
      dim: ['giltzurrun-gaineko-guruinak', 'giltzurruna'],
      names: [
        { id: 'giltzurruna', sub: 'azpitik igo da', small: true, from: 0.08 },
        { id: 'giltzurrun-gaineko-guruinak', sub: 'eratzen diren tokian geratzen dira', from: 0.11 },
      ],
      note: 'Giltzurrun gaineko guruinak eratzen diren tokian geratzen dira (ez dira mugitzen); giltzurruna azpitik igotzen zaie',
    },
  ],
};
export const AdrenalWall15 = poseStage(spec11wall, build);

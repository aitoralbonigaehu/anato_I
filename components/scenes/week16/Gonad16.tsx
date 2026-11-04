'use client';

import { BLOCK16, BLOCK_AXES, KEY16, endPose, poseStage, type StageSpec } from './common';
import { GN0, gonadModel, type GonadOpts, type GonadPose } from './gonad-model';

/**
 * Topic 16's gonad cut across (gonad-model.ts): the indifferent gonad (stage 3), the testis (stage 5) and the
 * ovary (stage 9, and the recap view of stage 10). Dorsal up; the mesonephros (lateral) on the viewer's right.
 */

const build = (pose: GonadPose, opts: GonadOpts) => gonadModel(pose, opts);
const CAP = 'Gonada zeharka ebakita (3D blokea, goitik): bizkarra goian, mesonefrosa zure eskuinean';
const CAM = (dist = 9.5, target: [number, number, number] = [0.2, 0.1, 0], yaw = 12, elev = 10) => BLOCK16(dist, target, yaw, elev);

// ———————————————————————————— 3. Desberdindu gabeko gonada ————————————————————————————

export const S3 = [0, 0.34, 0.67] as const;

const spec3: StageSpec<GonadPose, GonadOpts> = {
  S: S3,
  pose: { ...GN0, germ: 1 },
  opts: {},
  caption: CAP,
  key: KEY16.gonad,
  axes: BLOCK_AXES,
  steps: [
    {
      to: { cords: 1 },
      run: [0.1, 0.85],
      cam: CAM(),
      glide: 0.06,
      dim: ['gonadaren-epitelioa', 'hasierako-sexu-kordoiak', 'hasierako-hozi-zelulak'],
      names: [
        { id: 'gonadaren-epitelioa', text: 'Gandorreko epitelioa', sub: 'loditu' },
        { id: 'hasierako-hozi-zelulak', small: true, from: 0.2 },
        { id: 'hasierako-sexu-kordoiak', sub: 'kortexetik muinerantz · sexu bietan berdin', from: 0.45 },
      ],
      note: 'Gandorreko epitelioa loditu eta zelulak muinerantz sartzen dira, kordoi forman: hasierako sexu kordoiak, sexu bietan berdinak',
    },
    {
      cam: CAM(9.5, [0, -0.2, 0], 2, 8),
      dim: ['gonadak', 'hasierako-sexu-kordoiak'],
      names: [
        { id: 'gonadak', text: 'Desberdindu gabeko gonada', sub: '6.–7. asteak: morfologikoki berdina (XX / XY)' },
        { id: 'hasierako-sexu-kordoiak', small: true },
      ],
      note: '6.–7. asteak: desberdindu gabeko aroa. Sexu bietan berdin-berdin: morfologikoki berdinak, genetikoki ez (XX eta XY)',
    },
    {
      cam: CAM(10, [0.4, 0.2, 0], 20, 12),
      glide: 0.05,
      dim: ['gonadak', 'hodi-mesonefrikoa', 'hodi-paramesonefrikoa'],
      names: [
        { id: 'hodi-mesonefrikoa', small: true },
        { id: 'hodi-paramesonefrikoa', small: true },
      ],
      note: '7. astetik gonadak desberdintzen hasten dira (arrak eta emeak bide desberdinetan). Sexua, berez, ernalkuntzan determinatzen da',
    },
  ],
};
export const Indifferent16 = poseStage(spec3, build);

// ———————————————————————————— 5. Barrabila ————————————————————————————

export const S5 = [0, 0.17, 0.34, 0.5, 0.67, 0.83] as const;

const spec5: StageSpec<GonadPose, GonadOpts> = {
  S: S5,
  pose: endPose(spec3).pose,
  opts: {},
  caption: CAP,
  key: KEY16.testis,
  axes: BLOCK_AXES,
  steps: [
    {
      to: { medulla: 0.6 },
      run: [0.08, 0.85],
      cam: CAM(9.5, [0, -0.3, 0], 10, 8),
      glide: 0.06,
      dim: ['muin-kordoiak', 'gonadaren-epitelioa'],
      names: [{ id: 'muin-kordoiak', sub: 'epiteliotik askatuta, muinean', from: 0.3 }],
      note: 'Kortexeko sexu kordoiak epiteliotik askatu eta gonadaren muinean sartzen dira: muin kordoiak',
    },
    {
      to: { medulla: 1 },
      run: [0.05, 0.6],
      cam: CAM(8.5, [-0.4, -0.6, 0], 4, 6),
      dim: ['tunika-albuginea', 'gonadaren-epitelioa', 'muin-kordoiak'],
      names: [{ id: 'tunika-albuginea', sub: 'ehun konektiboa: epitelioaren eta kordoien artean', from: 0.25 }],
      note: 'Epitelioaren eta muin kordoien artean ehun konektibozko geruza bat: tunika albuginea',
    },
    {
      to: { horseshoe: 1, link: 1 },
      run: [0.05, 0.85],
      cam: CAM(9, [0.5, 0.1, 0], 22, 12),
      glide: 0.05,
      dim: ['barrabil-kordoiak', 'barrabil-sarea', 'hodixka-mesonefrikoak'],
      names: [
        { id: 'barrabil-sarea', text: 'Barrabil sarea (rete testis)', sub: 'hiloan, kordoiak estutu eta fundituta', from: 0.2 },
        { id: 'barrabil-kordoiak', sub: 'ferra forma · trinkoak', from: 0.4 },
        { id: 'hodixka-mesonefrikoak', sub: 'sarearen bidez lotuta', from: 0.6 },
      ],
      note: 'Hiloan muin kordoiak estutu eta sare bat: barrabil sarea (rete testis). Ferra formako barrabil kordoiak; sarearen bidez hodixka mesonefrikoekin komunikatzen dira',
    },
    {
      to: { sertoli: 1 },
      run: [0.1, 0.7],
      cam: CAM(7, [-0.3, -0.6, 0], 12, 10),
      glide: 0.05,
      dim: ['sertoli-zelulak', 'barrabil-kordoiak'],
      names: [{ id: 'sertoli-zelulak', sub: '4. hilabetea: kordoien euspen zelulak', from: 0.25 }],
      note: '4. hilabetean, kordoien artean Sertoliren euspen zelulak: kordoien euspena',
    },
    {
      to: { leydig: 1 },
      run: [0.1, 0.7],
      cam: CAM(7, [-0.3, -0.6, 0], -6, 10),
      glide: 0.05,
      dim: ['leydig-zelulak', 'barrabil-kordoiak'],
      names: [{ id: 'leydig-zelulak', sub: '4.–6. hilabeteak: testosterona', from: 0.25 }],
      note: '4.–6. hilabeteak: kordoien inguruko muinean Leydig zelulak; funtzio nagusia testosterona ekoiztea',
    },
    {
      to: { hollow: 1, mullerGone: 1 },
      run: [0.06, 0.85],
      cam: CAM(10, [0.4, 0.0, 0], 16, 12),
      glide: 0.05,
      dim: ['hodixka-seminiferoak', 'hodi-paramesonefrikoa', 'hodi-mesonefrikoa'],
      names: [
        { id: 'hodixka-seminiferoak', sub: 'pubertaroan hustu: espermatozoideak' },
        { id: 'hodi-paramesonefrikoa', sub: 'testosterona + AMH: endekatu', from: 0.3 },
        { id: 'hodi-mesonefrikoa', sub: 'geratu eta garatu', from: 0.5 },
      ],
      note: 'Pubertaroan kordoiak hustu: hodixka seminiferoak. Testosteronak eta Sertoliren hormona anti-mullerianoak hodi paramesonefrikoa endekatzen dute; mesonefrikoa geratzen da',
    },
  ],
};
export const Testis16 = poseStage(spec5, build);

// ———————————————————————————— 9. Obarioa ————————————————————————————

export const S9 = [0, 0.25, 0.5, 0.75] as const;

const spec9: StageSpec<GonadPose, GonadOpts> = {
  S: S9,
  pose: { ...GN0, germ: 1, cords: 1 },
  opts: {},
  caption: CAP,
  key: KEY16.ovary,
  axes: BLOCK_AXES,
  steps: [
    {
      cam: CAM(9.5, [0, -0.3, 0], 8, 8),
      glide: 0.06,
      dim: ['gonadak', 'hasierako-sexu-kordoiak', 'gonadaren-epitelioa'],
      names: [
        { id: 'hasierako-sexu-kordoiak' },
        { id: 'gonadaren-epitelioa', sub: 'handitua', from: 0.3 },
      ],
      note: 'Hasieran gonada desberdindu gabe, mesonefrosaren aurre-erdialdean: hasierako sexu kordoiak eta epitelio handitua',
    },
    {
      to: { primGone: 1, wolffGone: 0.85 },
      run: [0.06, 0.85],
      cam: CAM(9, [0.1, -0.3, 0], 14, 10),
      glide: 0.05,
      dim: ['obarioaren-muina', 'hasierako-sexu-kordoiak'],
      names: [{ id: 'obarioaren-muina', sub: 'hasierako kordoiak muinean endekatuta', from: 0.35 }],
      note: '7. astetik hasierako sexu kordoiak epiteliotik askatu eta muinerantz sartzen dira, baina endekatu egiten dira: obarioaren muina',
    },
    {
      to: { cortex: 1, breakUp: 1 },
      run: [0.05, 0.9],
      cam: CAM(8.5, [-0.5, -0.7, 0], 4, 6),
      glide: 0.05,
      dim: ['obarioaren-kortexa', 'kortex-kordoiak'],
      names: [
        { id: 'obarioaren-kortexa', text: 'Kortexa', sub: 'epitelioa loditua' },
        { id: 'kortex-kordoiak', sub: '2. belaunaldia · 4. hilabetean askatu', from: 0.3 },
      ],
      note: 'Epitelioa loditu egiten da: kortexa. Hortik kortex kordoien 2. belaunaldia; 4. hilabetean epiteliotik askatu eta zelulak sakabanatuta geratzen dira',
    },
    {
      to: { follicles: 1 },
      run: [0.08, 0.8],
      cam: CAM(7.5, [-0.4, -0.7, 0], 10, 8),
      glide: 0.05,
      dim: ['folikulu-zelulak', 'obozito-primarioak'],
      names: [
        { id: 'folikulu-zelulak', sub: 'askatutako zelulen inguruan', from: 0.2 },
        { id: 'obozito-primarioak', from: 0.5 },
      ],
      note: 'Epiteliotik beste zelula batzuk, folikulu zelulak, askatutako zelulen inguruan: obozito primarioak',
    },
  ],
};
export const Ovary16 = poseStage(spec9, build);

/** The ovary's end state, as a recap view (stage 10, notes 3.4 p4). */
const spec10g: StageSpec<GonadPose, GonadOpts> = {
  S: [0],
  pose: endPose(spec9).pose,
  opts: {},
  caption: CAP,
  key: KEY16.ovary,
  axes: BLOCK_AXES,
  steps: [
    {
      cam: CAM(8.5, [-0.3, -0.5, 0], 8, 8),
      dim: ['kortex-kordoiak', 'obozito-primarioak', 'folikulu-zelulak', 'obarioaren-kortexa'],
      names: [
        { id: 'obozito-primarioak', sub: '~4. hilabetea' },
        { id: 'folikulu-zelulak', small: true },
        { id: 'obarioaren-muina', small: true },
      ],
    },
  ],
};
export const OvaryRecap16 = poseStage(spec10g, build);

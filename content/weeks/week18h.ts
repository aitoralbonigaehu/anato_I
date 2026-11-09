import type { StageDef } from '@/lib/sim/types';
import { FirstPouch18, S1, S2, SecondPouch18 } from '@/components/scenes/week18/Ear18';

const FILE = '18. GAIA_ Burua eta lepoa ll (Zuzenduta).pdf';
const src = (section: string) => ({ file: FILE, section });
const O = { top: 'Kraneala', bottom: 'Kaudala' };
const DESC = 'Faringearen ezker aldea, aurrealdetik ebakita (3D blokea, aurretik ikusita): faringea zure ezkerrean, azala eskuinean. I. arkua laranja, II. arkua urdina, III. arkua horia; endodermoa (poltsak) hori argia, ektodermoa urdin argia, barrunbeak ilunak. Arrastatu biratzeko.';
const v = (scene: StageDef['views'][number]['scene'], label: string) => ({ id: '3d', label, plane: 'eskema' as const, description: DESC, orientation: O, scene, travel: false as const });

export const stages18h: StageDef[] = [
  {
    id: 'lehen-poltsa',
    day: '5. astea eta aurrera',
    dayRange: [29, 56],
    title: 'Lehenengo poltsa: tronpa eta tinpano-kutxa',
    subtitle: 'Sakonune tubotinpanikoa → Eustakioren tronpa + tinpano-kutxa, hiru hezurtxoekin',
    intro: 'Lehenengo poltsa asko sakontzen da: sakonune tubotinpanikoa. Hurbileko atala hodi geratzen da (Eustakioren tronpa), eta muturra zabaldu egiten da (tinpano-kutxa). Han kokatzen dira hiru hezurtxoak.',
    duration: 42,
    source: src('1.1.1. Lehenengo poltsaren eratorriak'),
    views: [v(FirstPouch18, 'Ebaki frontala 3D')],
    beats: [
      { at: S1[0], notes: ['w18/1.1.1/p2/s1', 'w18/1.1.1/p3/s5'], recall: ['lehen-arkua', 'bigarren-arkua'], idea: '5. aste hasieran poltsak ez dira asko sakondu.', text: '5. aste hasieran poltsak ez daude asko sakonduta. Garapena aurrera doala, batzuk sakondu egiten dira, eta beste batzuetan egiturak garatzen dira. Lehenengo poltsa I. eta II. arkuen artean dago.', focus: ['lehen-poltsa'], view: '3d' },
      { at: S1[1], notes: ['w18/1.1.1/p3/s1', 'w18/1.1.1/p4/s1', 'w18/1.1.1/p4/s2'], idea: 'Lehenengo poltsaren endodermoa asko sakontzen da: sakonune tubotinpanikoa.', key: 'Lehenengo poltsa → sakonune tubotinpanikoa → bi egitura.', text: 'Lehenengo poltsaren endodermoa asko sakontzen da: sakonune tubotinpanikoa deritzo. Gero eta gehiago sakonduko da, eta bi egitura desberdin emango ditu.', focus: ['sakonune-tubotinpanikoa', 'lehen-poltsa'], exam: 'Lehenengo poltsaren endodermoa: sakonune tubotinpanikoa.', view: '3d' },
      { at: S1[2], notes: ['w18/1.1.1/p5/s1'], idea: 'Hurbileko atala: hodia, Eustakioren tronpa.', text: 'Hasierako atalak hodi forma hartzen du: tronpa faringeotinpanikoa edo Eustakioren tronpa. Tarteko belarria (tinpano-kutxa) eta faringea komunikatzen ditu.', focus: ['eustakioren-tronpa', 'faringe-hestea'], exam: 'Eustakioren tronpa: tarteko belarria eta faringea komunikatzen ditu.', view: '3d' },
      { at: S1[3], notes: ['w18/1.1.1/p3/s2', 'w18/1.1.1/p3/s3', 'w18/1.1.1/p6/s1'], idea: 'Muturra zabaldu: tinpano-kutxa.', text: 'Hodiaren muturrean poltsa zabaldu egiten da. Horrela barrunbe bat eratzen da: tinpano-kutxa.', focus: ['tinpano-kutxa'], view: '3d' },
      { at: S1[4], notes: ['w18/1.1.1/p3/s4', 'w18/1.1.1/p6/s2'], idea: 'Hiru hezurtxoak: mailua eta ingudea I. arkutik, ointokia II. arkutik.', key: 'Mailua + ingudea = I. arkua. Ointokia = II. arkua.', text: 'Tinpano-kutxan kokatzen dira tarteko belarriaren hiru hezurtxoak: mailua, ingudea eta ointokia. Lehenengo biak I. arku faringeotik sortzen dira (laranjak) eta ointokia II. arku faringeotik (urdina).', focus: ['mailua', 'ingudea', 'ointokia'], exam: 'Mailua eta ingudea I. arkutik; ointokia II. arkutik.', view: '3d' },
    ],
    structures: ['lehen-poltsa', 'sakonune-tubotinpanikoa', 'eustakioren-tronpa', 'tinpano-kutxa', 'mailua', 'ingudea', 'ointokia', 'faringe-hestea', 'lehen-arkua', 'bigarren-arkua', 'hirugarren-arkua', 'lehen-arraildura', 'bigarren-poltsa'],
    keyPoints: [
      'Lehenengo poltsaren endodermoa asko sakontzen da: sakonune tubotinpanikoa.',
      'Hurbileko atala: Eustakioren tronpa (tarteko belarria ↔ faringea).',
      'Muturra zabaldu: tinpano-kutxa, hiru hezurtxoekin.',
      'Mailua eta ingudea I. arkutik; ointokia II. arkutik.',
    ],
  },
  {
    id: 'bigarren-poltsa',
    day: '5. astea – 5. hilabetea',
    dayRange: [29, 150],
    title: 'Bigarren poltsa: aho-sabaiko amigdala',
    subtitle: '5. astean hasi · ehun linfatikoa 3.–5. hilabetean · funtzionala 5. hilabetean',
    intro: 'Bigarren poltsa faringeotik aho-sabaiko amigdala eratzen da. 5. astean hasten da, baina ehun linfatikoa 3.–5. hilabetera arte ez da agertzen, eta 5. hilabetean da funtzionala.',
    duration: 32,
    source: src('1.1.2. Bigarren poltsaren eratorriak'),
    views: [v(SecondPouch18, 'Ebaki frontala 3D')],
    beats: [
      { at: S2[0], notes: ['w18/1.1.1/p7/s1', 'w18/1.1.2/p2/s1'], recall: ['lehen-poltsa'], idea: '2.–5. poltsetan zelula bereizketak: egitura desberdinak.', text: '2., 3., 4. eta 5. poltsetan, sakontasunean, zelula bereizketa desberdinak ematen dira, eta egitura desberdinak eratzen dira.', focus: ['bigarren-poltsa'], view: '3d' },
      { at: S2[1], notes: ['w18/1.1.2/p3/s1', 'w18/1.1.2/p3/s2'], idea: '2. poltsa → aho-sabaiko amigdala; 5. astean hasi.', key: 'Bigarren poltsa → aho-sabaiko amigdala.', text: 'Bigarren poltsa faringeotik aho-sabaiko amigdala eratzen da. 5. astean hasten dira poltsako zelula batzuk bereizten, eta amigdala garatzen hasten da.', focus: ['aho-sabaiko-amigdala', 'bigarren-poltsa'], exam: 'Aho-sabaiko amigdala: bigarren poltsa, 5. astean hasi.', view: '3d' },
      { at: S2[2], notes: ['w18/1.1.2/p3/s2'], idea: 'Ehun linfatikoa ez 3.–5. hilabetera arte.', text: 'Baina 3.–5. hilabetera arte ez du barnean ehun linfatikorik izango.', focus: ['ehun-linfatikoa', 'aho-sabaiko-amigdala'], view: '3d' },
      { at: S2[3], notes: ['w18/1.1.2/p3/s3'], idea: '5. hilabetean funtzionala.', text: 'Beraz, 5. hilabetean funtzionala izango da.', focus: ['aho-sabaiko-amigdala'], exam: 'Aho-sabaiko amigdala 5. hilabetean funtzionala.', view: '3d' },
    ],
    structures: ['bigarren-poltsa', 'aho-sabaiko-amigdala', 'ehun-linfatikoa', 'lehen-poltsa'],
    keyPoints: [
      'Bigarren poltsa → aho-sabaiko amigdala.',
      '5. astean hasi; ehun linfatikoa 3.–5. hilabetean; funtzionala 5. hilabetean.',
    ],
  },
];

import type { StageDef } from '@/lib/sim/types';
import { GlandDescent18, MatureThyroid18, SD, SM } from '@/components/scenes/week18/Neck18';

const FILE = '18. GAIA_ Burua eta lepoa ll (Zuzenduta).pdf';
const src = (section: string) => ({ file: FILE, section });
const ORIENT = { top: 'Kraneala', bottom: 'Kaudala' };
const v = (scene: StageDef['views'][number]['scene'], label: string, description: string, id = '3d') => ({ id, label, plane: 'eskema' as const, description, orientation: ORIENT, scene, travel: false as const });

const DESCENT = 'Faringea eta lepoa atzetik (3D): burua goian, enbrioiaren ezkerra zure ezkerrean. 3. poltsatik datorrena horia da (timoa eta beheko paratiroidea), 4. poltsatik datorrena gorria (goiko paratiroidea), tiroidea granatea. Arrastatu biratzeko.';
const MATURE = 'Tiroide heldua laringearen inguruan (3D): lehenik aurretik (enbrioiaren ezkerra zure eskuinean), gero atzetik. Tiroidea granatea, kartilagoak berde argiak, paratiroideak horia (behekoa) eta gorria (goikoa), timoa hori argia. Arrastatu biratzeko.';

export const stages18i: StageDef[] = [
  {
    id: 'guruinen-jaisketa',
    day: '5.–7. asteak',
    dayRange: [35, 49],
    title: 'Nola jaisten dira guruinak?',
    subtitle: 'Timoak beheko paratiroidea arrastatzen du, goikoaren ondotik pasatuz',
    intro: '3. poltsako timoa behera eta erdialdera jaisten da eta 3. poltsako paratiroidea berekin darama. 4. poltsako paratiroidea ia ez da mugitzen: bi guruinak gurutzatzen dira, eta amaierako lekuak ematen die izena.',
    duration: 34,
    views: [v(GlandDescent18, 'Lepoa 3D', DESCENT)],
    beats: [
      {
        at: SD[0],
        notes: ['w18/1.2/p8/s1-s2'],
        idea: 'Abiapuntua: 3. poltsakoa goian, 4. poltsakoa behean.',
        text: 'Nola jaisten dira egiturak? Faringea atzetik ikusten ari gara. Bakarra den timoa bi aldeetan eratzen da, 3. poltsetan. Oraindik goian daude timoa eta 3. poltsako paratiroidea; 4. poltsako paratiroidea beherago dago.',
        focus: ['timoa', 'beheko-paratiroidea', 'goiko-paratiroidea'],
        view: '3d',
      },
      {
        at: SD[1],
        notes: ['w18/1.2/p8/s2-s3'],
        idea: 'Timoa jaisten da erdialdera eta beheko paratiroidea berekin darama.',
        text: 'Timoa alde medialera jaisten da. Beherantz desplazatzen doan heinean, 3. poltsan eratzen den beheko paratiroide guruina harekin desplazatzen du, eta horregatik tiroide guruinaren behekaldean kokatzen da.',
        focus: ['timoa', 'beheko-paratiroidea'],
        view: '3d',
      },
      {
        at: SD[2],
        notes: ['w18/1.2/p8/s4', 'w18/1.2/p8/s8'],
        idea: 'Gurutzaketa: izena amaierako lekutik dator.',
        text: 'Goiko paratiroide guruinak ez dira horrenbeste jaisten: 4. poltsan eratu arren, timoaren gorago gelditzen dira, eta horregatik deitzen dira goiko paratiroide guruinak. Goiko eta beheko izenak behin betiko kokapenetik datoz, ez jatorritik.',
        focus: ['goiko-paratiroidea', 'beheko-paratiroidea'],
        view: '3d',
      },
      {
        at: SD[3],
        notes: ['w18/1.2/p8/s5-s7', 'w18/1.2/p8/s9-s10'],
        idea: 'U forma: aurretik kartilagoak inguratu, atzean lau paratiroide.',
        text: 'Tiroide guruinak U forma dauka: aurrekaldetik laringeko kartilagoak inguratzen ditu, eta atzetik irekita gelditzen da. Atzekalde horretan, lau muturretan, lau paratiroide guruin daude: bi goiko eta bi beheko.',
        focus: ['tiroide-lobuluak', 'laringeko-kartilagoak'],
        view: '3d',
      },
    ],
    structures: ['timoa', 'beheko-paratiroidea', 'goiko-paratiroidea', 'hirugarren-poltsa', 'laugarren-poltsa', 'faringea', 'tiroide-lobuluak', 'laringeko-kartilagoak'],
    keyPoints: [
      'Timoa bi aldeetan eratzen da eta alde medialera jaisten da.',
      'Beheko paratiroidea 3. poltsatik dator: timoak arrastatzen du.',
      'Goiko paratiroidea 4. poltsatik dator: gutxi jaisten da.',
      'Izenak behin betiko kokapenetik datoz, ez poltsetako jatorritik.',
      'Tiroidea U forma: aurretik kartilagoak inguratu, atzetik irekita.',
    ],
    cautions: ['Goiko paratiroidea 4. poltsatik dator eta beheko paratiroidea 3. poltsatik: alderantziz dirudi.'],
    source: src('1.2'),
  },
  {
    id: 'tiroidea-heldua',
    day: '7. astea → heldua',
    dayRange: [49, 266],
    title: 'Tiroide heldua eta timoa',
    subtitle: 'Bi lobulu, istmoa, atzean lau paratiroide; azpian timoa',
    intro: 'Tiroide guruinaren behin betiko itxura: bi lobulu luzanga laringeko kartilagoak besarkatzen, istmoak aurretik lotuta, atzetik irekita lau paratiroideekin. Azpian timoa, handia enbrioian eta endekatua helduan.',
    duration: 38,
    views: [v(MatureThyroid18, 'Tiroidea 3D', MATURE)],
    beats: [
      {
        at: SM[0],
        notes: ['w18/3/p10/s1-s3'],
        idea: 'Bi lobulu luzanga kartilagoak besarkatzen.',
        text: 'Tiroide guruinak bi lobulu ditu, eskuineko bat eta ezkerreko bat. Biak luzangak dira eta laringeko kartilagoak besarkatzen dituzte.',
        focus: ['tiroide-lobuluak', 'laringeko-kartilagoak'],
        view: '3d',
      },
      {
        at: SM[1],
        notes: ['w18/3/p10/s3'],
        idea: 'Istmoa: lotura aurrekaldean.',
        text: 'Bi lobuluak aurrekaldetik lotuta daude eremu estu batez: istmoa.',
        focus: ['tiroide-istmoa'],
        view: '3d',
      },
      {
        at: SM[2],
        notes: ['w18/3/p10/s4-s8'],
        idea: 'Atzetik: irekita, lau paratiroide. 7. astean helduta.',
        text: 'Orain eredua aurretik atzera biratuko dugu. Atzetik lobuluak ez daude lotuta, eta bertan ikusten dira goiko eta beheko paratiroide guruinak: bi goiko eta bi beheko. Hau da egitura guztien behin betiko kokapena; 7. astean tiroidea helduta dago, eta jaio aurreko 3. hilabetean funtzionala izaten hasten da.',
        focus: ['goiko-paratiroidea', 'beheko-paratiroidea'],
        view: '3d',
      },
      {
        at: SM[3],
        notes: ['w18/3/p11/s1-s3'],
        idea: 'Piramide itxurako lobulua: anomalia arrunta, arazorik gabe.',
        text: 'Aurrera itzuli gara. Pertsona batzuetan (%50 edo gehiago) anomalia bat agertzen da, ezkerreko lobuluarekin edo istmoarekin erlazionatuta: piramide itxurako lobulua. Hodi tiroglosoaren azken atala ondo endekatzen ez bada gelditzen da, eta ez du arazorik ematen.',
        focus: ['piramide-lobulua'],
        view: '3d',
      },
      {
        at: SM[4],
        notes: ['w18/3/p12/s1-s4'],
        idea: 'Timoa tiroidearen azpian; pubertarotik endekatu.',
        text: 'Timoa ere lepo mailara jaisten da eta tiroide guruinaren behekaldean gelditzen da. Tamaina handia du enbrioi aroan eta pubertarora arte garatzen jarraitzen du; pubertarotik aurrera endekatuz doa, eta helduetan ia ez du funtziorik eta tamaina eskasekoa da.',
        focus: ['timoa'],
        view: '3d',
      },
    ],
    structures: ['tiroide-lobuluak', 'tiroide-istmoa', 'laringeko-kartilagoak', 'goiko-paratiroidea', 'beheko-paratiroidea', 'piramide-lobulua', 'timoa', 'trakea'],
    keyPoints: [
      'Bi lobulu luzanga, laringeko kartilagoak besarkatzen.',
      'Istmoak aurretik lotzen ditu; atzetik irekita.',
      'Atzean lau paratiroide: bi goiko eta bi beheko.',
      '7. astean helduta; jaio aurreko 3. hilabetean funtzionala.',
      'Piramide itxurako lobulua: hodi tiroglosoaren hondarra, arazorik gabe.',
      'Timoa: handia enbrioian, pubertarotik endekatu.',
    ],
    source: src('3'),
  },
];

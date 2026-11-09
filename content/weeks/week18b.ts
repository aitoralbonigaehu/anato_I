import type { StageDef } from '@/lib/sim/types';
import { S_JAISKETA, S_SORRERA, ThyroidBud18, ThyroidDescent18 } from '@/components/scenes/week18/Thyroid18';

const FILE = '18. GAIA_ Burua eta lepoa ll (Zuzenduta).pdf';
const src = (section: string) => ({ file: FILE, section });
const ORIENT = { left: 'Bentrala', right: 'Dortsala', top: 'Kraneala', bottom: 'Kaudala' };
const DESC = 'Burua eta lepoa erditik moztuta, ezkerretik ikusita (apunteetako irudiak bezala): aurpegia zure ezkerrean, bizkarra eskuinean. Endodermoa eta guruina horiak, ektodermoa urdina; mihiaren gorputza laranja (I. arkua), sustraia horia. Arrastatu biratzeko.';
const v = (scene: StageDef['views'][number]['scene']) => ({ id: '3d', label: 'Ebakidura sagitala 3D', plane: 'eskema' as const, description: DESC, orientation: ORIENT, scene, travel: false as const });

export const stages18b: StageDef[] = [
  {
    id: 'tiroidea-sorrera',
    day: '4. astea',
    dayRange: [22, 28],
    title: 'Tiroidearen sorrera',
    subtitle: 'Faringearen zorutik, zulo itsuan, hodi tiroglosoa eta guruinaren hasikina',
    intro: 'Tiroide guruina 4. astean eratzen hasten da, faringe hestearen zoruan, zulo itsuaren mailan. Luzapen bat sartzen da mesenkimarantz; erdian hodi bat du, hodi tiroglosoa, eta haren muturrean guruinaren hasikina garatzen da.',
    duration: 36,
    source: src('3. Tiroide guruinaren garapena'),
    views: [v(ThyroidBud18)],
    beats: [
      {
        at: S_SORRERA[0],
        notes: ['w18/3/p1/s1', 'w18/3/p2/s1', 'w18/3/p3/s1-s2', 'w18/3/p9/s1-s2'],
        recall: ['faringe-hestea'],
        idea: 'Tiroidea 4. astean hasten da, gorago, eta gero beheratzen da.',
        key: 'Tiroidea ez da lepoan sortzen: mihiaren atzean sortzen da eta lepora bidaiatzen du.',
        text: 'Burua erditik moztuta, ezkerretik. Aurrean estomodeoa, ektodermoz estalia, eta apur bat barnerago mintz bukofaringeoa. Haren atzean faringe hestea hasten da. Tiroide guruina 4. astean eratzen hasten da: gorago garatzen da, eta gero beherantz joaten da.',
        focus: ['estomodeoa', 'mintz-bukofaringeoa', 'faringe-hestea'],
        caution: 'Apunteen arabera, mintz bukofaringeoa endodermikoa da; estomodeoaren kanpoko estalkia ektodermikoa eta barneko atala, mintzarekin jarraia, endodermikoa.',
        view: '3d',
      },
      {
        at: S_SORRERA[1],
        notes: ['w18/3/p4/s1', 'w18/3/p5/s1'],
        idea: 'Zoruan, tuberkulu bakoitiaren eta kupularen artean, luzapen bat sartzen da mesenkimarantz.',
        text: 'Hurbilduta: faringearen zoruan, estomodeoaren atzean, zulo itsuaren mailan (tuberkulu bakoitiaren eta kupularen artean), luzapen edo ebaginazio bat agertzen da eta mesenkimarantz sartzen da.',
        focus: ['zulo-itsua', 'tuberkulu-bakoitia', 'kopula'],
        exam: 'Tiroidea zulo itsuaren mailan: tuberkulu bakoitiaren eta kupularen artean.',
        view: '3d',
      },
      {
        at: S_SORRERA[2],
        notes: ['w18/3/p5/s2-s3'],
        idea: 'Luzapenaren erdian hodi bat dago: hodi tiroglosoa.',
        text: 'Luzapen honek erdian hodi bat du, hemen ebakita ikusten dena: hodi tiroglosoa. Izenak dioena: mihiarekin (-gloso) eta tiroidearekin (tiro-) erlazionatuta dago.',
        focus: ['hodi-tiroglosoa'],
        view: '3d',
      },
      {
        at: S_SORRERA[3],
        notes: ['w18/3/p6/s1-s3'],
        idea: 'Hodiaren muturrean, guruinaren hasikina: hodia gida da.',
        text: 'Ondoren, hodi tiroglosoaren muturrean tiroide guruinaren hasikina garatzen da. Hasikin honek hodia gida bezala erabiliko du faringearen zorutik behin betiko tokira joateko.',
        focus: ['tiroide-guruina', 'hodi-tiroglosoa'],
        exam: 'Hasikina hodi tiroglosoaren muturrean; hodia gida da.',
        ask: {
          q: 'Non garatzen da tiroide guruinaren hasikina?',
          options: ['Hodi tiroglosoaren muturrean', 'Lepoan bertan, krikoidearen aurrean', 'Estomodeoaren ektodermoan', 'Hirugarren poltsan'],
          answer: 0,
          why: ['Hori da: gero hodia gida bezala erabiliz jaisten da.', 'Ez: hara 7. astean iristen da, jaitsi ondoren.', 'Ez: faringe hestearen zorutik dator.', 'Ez: hirugarren poltsatik beheko paratiroideak eta timoa datoz.'],
        },
        view: '3d',
      },
    ],
    structures: ['estomodeoa', 'mintz-bukofaringeoa', 'faringe-hestea', 'zulo-itsua', 'tuberkulu-bakoitia', 'kopula', 'hodi-tiroglosoa', 'tiroide-guruina'],
    keyPoints: [
      'Tiroidea 4. astean hasten da, faringe hestearen zoruan, estomodeoaren atzean.',
      'Zulo itsuaren mailan: tuberkulu bakoitiaren eta kupularen artean.',
      'Luzapenaren erdian hodi tiroglosoa; haren muturrean guruinaren hasikina.',
    ],
    cautions: ['Mintz bukofaringeoa endodermikoa dela diote apunteek; estomodeoaren kanpoko estalkia ektodermikoa da.'],
  },
  {
    id: 'tiroidea-jaisketa',
    day: '4.–7. asteak',
    dayRange: [22, 49],
    title: 'Tiroidearen jaisketa',
    subtitle: 'Hioidearen aurretik krikoidearen mailara; hodia itxi, zulo itsua geratu',
    intro: 'Guruina beherantz doa hioide hezurraren aurretik, hodi tiroglosoak zoruari lotuta. 7. astean krikoide kartilagoaren mailan gelditzen da. Hodia itxi eta endekatzen da; hasi zen tokian zulo itsua geratzen da.',
    duration: 40,
    source: src('3. Tiroide guruinaren garapena'),
    views: [v(ThyroidDescent18)],
    beats: [
      {
        at: S_JAISKETA[0],
        notes: ['w18/3/p7/s1', 'w18/3/p7/s3-s4'],
        idea: 'Guruina hioidearen aurretik jaisten da, hodiak zoruari lotuta.',
        text: 'Tiroide guruina beherantz doa eta hioide hezurra aurretik pasatzen du. Jaisten den bitartean faringearen zoruari lotuta dago, eta lotura hori hodi tiroglosoa da.',
        focus: ['tiroide-guruina', 'hodi-tiroglosoa', 'hioide-hezurra'],
        exam: 'Hioide hezurraren aurretik jaisten da.',
        view: '3d',
      },
      {
        at: S_JAISKETA[1],
        notes: ['w18/3/p7/s2'],
        idea: '7. astean krikoidearen mailan, aurrekaldean, gelditzen da.',
        text: 'Hioide hezurraren azpiko laringe kartilagoen mailan gelditzen da, krikoide kartilagoaren mailan, aurrekaldean. Hau da bere behin betiko kokapena, 7. astean hartzen duena.',
        focus: ['tiroide-guruina', 'krikoide-kartilagoa'],
        exam: 'Behin betiko kokapena: krikoide kartilagoaren mailan, 7. astean.',
        view: '3d',
      },
      {
        at: S_JAISKETA[2],
        notes: ['w18/3/p8/s1-s2'],
        idea: 'Hodia itxi eta endekatzen da; zulo itsua geratzen da.',
        text: 'Guruina beherantz doan heinean, hodi tiroglosoa itxi egiten da, eta amaieran endekatu. Helduetan hodia ia guztiz endekatuta dago, baina hasi den tokian, V erpinean, aztarna txiki bat uzten du: zulo itsua.',
        focus: ['hodi-tiroglosoa', 'zulo-itsua'],
        view: '3d',
      },
      {
        at: S_JAISKETA[3],
        notes: ['w18/3/p8/s3-s4'],
        idea: 'Zulo itsua da bidearen marka: hortik sartu zen guruina.',
        text: 'Ebakidura bera helduaren burua da orain. Zulo itsua enbrioi garapenean tiroidearen bidearen marka-zuloa da: hortik hasi zen sartzen guruina eta hor hasten zen hodi tiroglosoa. Puntuek bide osoa erakusten dute.',
        focus: ['zulo-itsua', 'tiroide-guruina'],
        exam: 'Zulo itsua: hodi tiroglosoaren aztarna, V erpinean.',
        view: '3d',
      },
    ],
    structures: ['zulo-itsua', 'hodi-tiroglosoa', 'tiroide-guruina', 'hioide-hezurra', 'krikoide-kartilagoa', 'tiroide-kartilagoa', 'trakea', 'mihiaren-gorputza', 'mihiaren-sustraia'],
    keyPoints: [
      'Guruina hioide hezurraren aurretik jaisten da, hodi tiroglosoak zoruari lotuta.',
      '7. astean krikoide kartilagoaren mailan, aurrekaldean.',
      'Hodia itxi eta endekatzen da; zulo itsua geratzen da V erpinean.',
    ],
  },
];

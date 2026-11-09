import type { StageDef } from '@/lib/sim/types';
import { Clefts18, Intro18, Pouch3, Pouch4, S1, S2, S3, S4 } from '@/components/scenes/week18/Pharynx18';

const FILE = '18. GAIA_ Burua eta lepoa ll (Zuzenduta).pdf';
const src = (section: string) => ({ file: FILE, section });
const ORIENT = { top: 'Kraneala', bottom: 'Kaudala' };
const DESC = 'Faringe hestea atzetik, sabaia kenduta (3D): enbrioiaren ezkerra zure ezkerrean. Ebakian arkuak: ektodermoa urdina, endodermoa horia, mesenkima marroia edo arkuaren kolorea. Arrastatu biratzeko.';
const v = (scene: StageDef['views'][number]['scene']) => ({ id: '3d', label: 'Faringea 3D', plane: 'eskema' as const, description: DESC, orientation: ORIENT, scene, travel: false as const });

export const stages18a: StageDef[] = [
  {
    id: 'sarrera',
    day: '4.–7. asteak',
    dayRange: [22, 49],
    title: 'Arraildurak eta poltsak: gaiaren bidea',
    subtitle: 'Arkuak faringe hestearen alboetan: kanpotik ektodermoa, barrutik endodermoa',
    intro: 'Gogoratu arkuak: faringe hestearen alboetako goraguneak, mesenkimaz eginak, kanpotik ektodermoz eta barrutik endodermoz estaliak. Arkuen artean, kanpotik arraildurak eta barrutik poltsak daude.',
    duration: 30,
    source: src('1. Faringe arraildurak eta faringe poltsak'),
    views: [v(Intro18)],
    beats: [
      {
        at: S1[0],
        notes: ['w18/1/p2/s1'],
        recall: ['faringe-arkuak'],
        text: 'Faringe hestearen alboetan arku faringeoak daude, arku brankialak ere deituak. Goraguneak dira, alde bietan.',
        idea: 'Arkuak: faringe hestearen alboetako goraguneak.',
      },
      {
        at: S1[1],
        notes: ['w18/1/p2/s1'],
        text: 'Ebakian geruzak ikusten dira: kanpotik ektodermoa, barrutik endodermoa, eta tartean mesenkima, gandor neuraletatik eta zelula mesodermikoetatik datorrena.',
        idea: 'Kanpotik ektodermoa, barrutik endodermoa, tartean mesenkima.',
      },
      {
        at: S1[2],
        notes: ['w18/1/p5/s2-s3'],
        text: 'Arkuen artean, kanpotik arraildurak eta barrutik poltsak. Goiko edo erdiko ikuspegia hartuko dugu aintzat.',
        idea: 'Arraildurak kanpotik, poltsak barrutik.',
      },
    ],
    structures: ['faringe-hestea', 'lehen-arkua', 'bigarren-arkua', 'hirugarren-arkua', 'laugarren-arkua', 'ektodermoa', 'endodermoa', 'mesenkima', 'faringe-arraildurak', 'faringe-poltsak'],
    keyPoints: ['Arkuak faringe hestearen alboetan daude: kanpotik ektodermoa, barrutik endodermoa, tartean mesenkima.', 'Arraildurak kanpotik daude eta poltsak barrutik.'],
  },
  {
    id: 'arraildurak-poltsak',
    day: '4.–7. asteak',
    dayRange: [22, 49],
    title: 'Arraildurak kanpotik, poltsak barrutik',
    subtitle: 'Arkuen artean, kontrako aldeetan; poltsak aorta arkuen artean; laringe zuloa',
    intro: 'Arraildurak ektodermoaren kanpoko inbaginazioak dira, eta poltsak endodermoaren barruko inbaginazioak, kontrako aldeetan. Poltsak aorta arkuen artean daude. Behealdean, aurreko paretan, laringe zuloa.',
    duration: 40,
    source: src('1. Faringe arraildurak eta faringe poltsak'),
    views: [v(Clefts18)],
    beats: [
      {
        at: S2[0],
        notes: ['w18/1/p3/s1-s2'],
        text: 'Arraildura faringeoak kanpoko inbaginazioak dira, ektodermoan, arkuen artean: arkuen kanpoko aldeko sakonguneak edo ildoak.',
        idea: 'Arraildurak: kanpotik, ektodermoa.',
        exam: 'Arraildurak ektodermikoak dira, poltsak endodermikoak.',
      },
      {
        at: S2[1],
        notes: ['w18/1/p4/s1', 'w18/1/p8/s1-s2', 'w18/1/p9/s1-s2'],
        text: 'Poltsa faringeoak barruko inbaginazioak dira, endodermoan, arkuen artean eta arrailduren kontrako aldean. 6 arku eta 4 poltsa ditugu: azkena batera ikasiko dugu, bi kimurekin (dortsala eta bentrala).',
        idea: 'Poltsak: barrutik, endodermoa; 4 poltsa.',
        caution: 'Liburuaren arabera azkena banatuta (4 eta 5) edo batera ikus daiteke; guk batera ikasten dugu.',
      },
      {
        at: S2[2],
        notes: ['w18/1/p4/s2'],
        text: 'Ezker aldean horma kendu dugu, endodermoa bakarrik uzteko. Aorta arku bakoitza arku batean doa, eta poltsak aorta arkuen artean kokatzen dira.',
        idea: 'Poltsak aorta arkuen artean.',
      },
      {
        at: S2[3],
        notes: ['w18/1/p4/s3', 'w18/1/p5/s1'],
        text: 'Behealdean, faringearen aurreko paretan, laringe zuloa dago: hortik ebaginatzen da arnas aparatuaren hastapena. Prozesu gehienak 4. astean hasi eta 7. asterako ia garatuta daude.',
        idea: 'Laringe zuloa: arnas aparatuaren hasiera.',
      },
    ],
    structures: ['faringe-arraildurak', 'lehen-arraildura', 'faringe-poltsak', 'lehen-poltsa', 'bigarren-poltsa', 'hirugarren-poltsa', 'laugarren-poltsa', 'aorta-arkuak', 'laringe-zuloa'],
    keyPoints: ['Arraildurak: kanpoko inbaginazioak, ektodermoan.', 'Poltsak: barruko inbaginazioak, endodermoan, aorta arkuen artean.', '6 arku eta 4 poltsa; azkena batera ikasten da.', 'Laringe zuloa faringearen aurreko paretan dago.'],
    cautions: ['Poltsak ez dira «poltsa brankialak»: barrutik ateratzen dira eta endodermozko epitelioa dute.'],
  },
  {
    id: 'hirugarren-poltsa',
    day: '5.–7. asteak',
    dayRange: [29, 49],
    title: 'Hirugarren poltsa: paratiroidea eta timoa',
    subtitle: 'Dortsala → beheko paratiroide guruina; bentrala → timoa',
    intro: 'Hirugarren poltsak bi kimu ditu. Dortsaletik beheko paratiroide guruina sortzen da eta bentraletik timoa. Biak jaitsi egingo dira.',
    duration: 36,
    source: src('1.1.3. Hirugarren poltsaren eratorriak'),
    views: [v(Pouch3)],
    beats: [
      {
        at: S3[0],
        notes: ['w18/1.1.3/p3/s1'],
        recall: ['faringe-poltsak'],
        text: 'Hirugarren poltsan bi alde edo kimu bereizten dira, dortsala eta bentrala. Biak mugituko dira garapenean.',
        idea: 'Hirugarren poltsa: bi kimu.',
      },
      {
        at: S3[1],
        notes: ['w18/1.1.3/p4/s1'],
        text: 'Alde dortsala kimatu eta beheko paratiroide guruina bihurtzen da. Parato hormona ekoizten du, eta helduan tiroidearekin batera kokatzen da.',
        idea: 'Dortsala: beheko paratiroidea.',
        exam: '3. poltsa: dortsala → beheko paratiroidea; bentrala → timoa.',
      },
      {
        at: S3[2],
        notes: ['w18/1.1.3/p5/s1-s2'],
        text: 'Alde bentrala luzatu eta timoa eratzen du. Timoa pubertaroraino garatzen da, gero endekatzen da eta helduan ia ez du funtziorik.',
        idea: 'Bentrala: timoa.',
      },
      {
        at: S3[3],
        notes: ['w18/1.1.3/p5/s3-s4'],
        text: 'Timoa bere behin betiko tokira jaisten hasten da, beherantz eta alde medialerantz. Beheko paratiroidea harekin batera doa.',
        idea: 'Timoa jaitsi, paratiroidea harekin.',
        caution: 'Apunteek hemen «timoaren behekaldean» diote, baina 1.2 atalean eta irudian beheko paratiroidea tiroidearen behekaldean geratzen da.',
      },
    ],
    structures: ['hirugarren-poltsa', 'beheko-paratiroidea', 'timoa'],
    keyPoints: ['3. poltsa: dortsala → beheko paratiroidea; bentrala → timoa.', 'Timoa beherantz eta medialerantz jaisten da, paratiroidea harekin.', 'Timoa pubertaroraino garatu eta gero endekatu.'],
    cautions: ['1.1.3 atalak «timoaren behekaldean» dio; 1.2 atalak eta irudiak tiroidearen behekaldean jartzen dute beheko paratiroidea.'],
  },
  {
    id: 'laugarren-poltsa',
    day: '5.–7. asteak',
    dayRange: [29, 49],
    title: 'Laugarren poltsa: goiko paratiroidea eta C zelulak',
    subtitle: 'Dortsala → goiko paratiroide guruina; bentrala → gorputz ultimobrankiala',
    intro: 'Laugarren poltsak ere bi kimu ditu. Dortsaletik goiko paratiroide guruina sortzen da, eta bentraletik gorputz ultimobrankiala, tiroidean barneratzen dena: C zelulak.',
    duration: 36,
    source: src('1.1.4. Laugarren poltsaren eratorriak'),
    views: [v(Pouch4)],
    beats: [
      {
        at: S4[0],
        notes: ['w18/1.1.4/p3/s1', 'w18/1.1.4/p4/s1'],
        text: 'Laugarren poltsak ere bi alde ditu, dortsala eta bentrala. Alde dortsala kimatu eta goiko paratiroide guruina bihurtzen da.',
        idea: 'Dortsala: goiko paratiroidea.',
      },
      {
        at: S4[1],
        notes: ['w18/1.1.4/p5/s1-s3', 'w18/1.1.4/p6/s1'],
        text: 'Behekoak goiko poltsan hasten dira, eta goikoak beheko poltsan. Izenak ez du sorrera adierazten, behin betiko kokapen anatomikoa baizik.',
        idea: 'Izena azken kokapenagatik, ez sorreragatik.',
        caution: 'Beheko paratiroidea 3. poltsatik dator, goikoa 4.etik.',
        exam: '3. poltsa → beheko paratiroidea; 4. poltsa → goiko paratiroidea.',
      },
      {
        at: S4[2],
        notes: ['w18/1.1.4/p7/s1-s3'],
        text: 'Alde bentraletik gorputz ultimobrankiala kimatzen da. Jaitsi eta tiroide guruinean barneratuko da: bere zelulak C zelulak izango dira, kaltzitonina ekoizten dutenak.',
        idea: 'Bentrala: gorputz ultimobrankiala → C zelulak.',
      },
      {
        at: S4[3],
        notes: ['w18/1.1.4/p8/s1-s3'],
        text: 'Gogoratu: goikaldean behekoa eratzen da eta behekaldean goikoa. Hirugarren zein laugarren poltsatik eratutako egiturak jaitsi egin behar dira.',
        idea: 'Goikaldean behekoa, behekaldean goikoa.',
      },
    ],
    structures: ['laugarren-poltsa', 'goiko-paratiroidea', 'beheko-paratiroidea', 'timoa', 'gorputz-ultimobrankiala'],
    keyPoints: ['4. poltsa: dortsala → goiko paratiroidea; bentrala → gorputz ultimobrankiala.', 'Gorputz ultimobrankiala tiroidean barneratzen da: C zelulak, kaltzitonina.', 'Paratiroideak behin betiko kokapenaren arabera izendatzen dira.'],
    cautions: ['Behekoak goiko poltsan (3.) hasten dira, goikoak beheko poltsan (4.): izena behin betiko kokapenarena da.'],
  },
];

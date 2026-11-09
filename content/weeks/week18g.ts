import type { StageDef } from '@/lib/sim/types';
import { FirstCleft18, S_EAR, S_SINUS, Sinus18 } from '@/components/scenes/week18/Clefts18';

const FILE = '18. GAIA_ Burua eta lepoa ll (Zuzenduta).pdf';
const src = (section: string) => ({ file: FILE, section });
const SEC = 'Ebaketa frontala (3D blokea, aurretik begiratuta): burua goian, kanpoaldea zure eskuinean, faringea zure ezkerrean. Ektodermoa urdina, endodermoa horia, mesenkima marroia, arkuaren kolorearekin tindatuta (I laranja, II urdina, III horia, IV gorria). Arrastatu biratzeko.';
const v = (scene: StageDef['views'][number]['scene'], label: string, description: string) => ({ id: '3d', label, plane: 'eskema' as const, description, orientation: { top: 'Kraneala', bottom: 'Kaudala' }, scene, travel: false as const });

export const stages18g: StageDef[] = [
  {
    id: 'lehen-arraildura',
    day: '4.–7. asteak',
    dayRange: [22, 49],
    title: 'Lehen arraildura eta tinpano mintza',
    subtitle: 'Arraildura eta poltsa batu egiten dira, baina muga ez da irekitzen',
    intro: 'Arrailduretatik bakarra gelditzen da: lehena. Sakondu egiten da poltsarantz, eta bien artean tinpano mintza geratzen da.',
    duration: 34,
    source: src('1.2 Arrailduretatik eratorritako egiturak'),
    views: [v(FirstCleft18, 'Lehen arraildura 3D', SEC)],
    beats: [
      {
        at: S_EAR[0],
        notes: ['w18/1.2/p1/s1', 'w18/1.2/p2/s1', 'w18/1.2/p3/s1'],
        recall: ['faringe-arraildurak', 'faringe-poltsak'],
        idea: 'Lehen arraildura sakondu eta luzatu.',
        text: 'Lehenengo arraildura sakondu eta luzatu egingo da, barruko lehen poltsarantz.',
        focus: ['lehen-arraildura', 'lehen-poltsa'],
        view: '3d',
      },
      {
        at: S_EAR[1],
        notes: ['w18/1.2/p3/s2'],
        idea: 'Poltsarekin batu (≠ fusionatu): muga ez da irekitzen; tinpano mintza.',
        key: 'Batu ≠ fusionatu: muga ez da irekitzen.',
        text: 'Barneko poltsarekin batu egingo da, baina ez fusionatu: muga ez da irekiko. Bi guneen artean muga bat geratzen da: tinpano mintza.',
        focus: ['tinpano-mintza'],
        exam: 'Lehen arraildura eta lehen poltsa batu egiten dira, ez fusionatu: tinpano mintza.',
        caution: 'Batu ≠ fusionatu: arraildura eta poltsa ez dira komunikatzen.',
        view: '3d',
      },
      {
        at: S_EAR[2],
        notes: ['w18/1.2/p3/s3'],
        idea: 'Sortzen den hodia: kanpoko entzumen hodia.',
        text: 'Bertan sortzen den hodia kanpoko entzumen hodia da, kanpoko belarria eta tinpanoa lotzen dituena. Beste aldean, poltsatik, tinpano-kutxa eta Eustakioren tronpa.',
        focus: ['kanpoko-entzumen-hodia', 'tinpano-kutxa', 'eustakioren-tronpa'],
        view: '3d',
      },
      {
        at: S_EAR[3],
        notes: ['w18/1.2/p3/s4-s5', 'w18/1.2/p4/s1', 'w18/1.2/p5/s1', 'w18/1.2/p6/s1'],
        idea: 'Tinpano mintza: kanpoan ektodermoa, barnean endodermoa, tartean mesodermo oso fina.',
        text: 'Tinpano mintza oso egitura fina da, ia gardena. Hala ere, hiru jatorri ditu: kanpoko epitelioa ektodermikoa, barneko epitelioa endodermikoa, eta tartean dauden zelulak mesodermikoak, geruza oso fina.',
        focus: ['tinpano-kanpoko-epitelioa', 'tinpano-tarteko-geruza', 'tinpano-barneko-epitelioa'],
        exam: 'Tinpano mintzaren hiru jatorriak: ektodermoa, mesodermoa, endodermoa.',
        view: '3d',
      },
    ],
    structures: ['lehen-arraildura', 'lehen-poltsa', 'tinpano-mintza', 'tinpano-kanpoko-epitelioa', 'tinpano-tarteko-geruza', 'tinpano-barneko-epitelioa', 'kanpoko-entzumen-hodia', 'tinpano-kutxa', 'eustakioren-tronpa', 'lehen-arkua', 'bigarren-arkua'],
    keyPoints: [
      'Lehen arraildura sakondu eta luzatu: kanpoko entzumen hodia.',
      'Poltsarekin batu (≠ fusionatu): muga, tinpano mintza.',
      'Tinpano mintza: ektodermoa + mesodermoa + endodermoa.',
    ],
    cautions: ['Batu ≠ fusionatu: muga ez da irekitzen.'],
  },
  {
    id: 'beste-arraildurak',
    day: '5.–7. asteak',
    dayRange: [29, 49],
    title: 'Gainerako arraildurak eta sinu zerbikala',
    subtitle: 'Bigarren arkua beherantz hazten da eta arraildurak estaltzen ditu',
    intro: 'Bigarren arkuaren mesenkima beherantz hazten da, gainerako arrailduren gainetik, goragune epikardikoarekin elkartu arte. Arraildurak estalita gelditzen dira eta desagertu egiten dira.',
    duration: 38,
    source: src('1.2 Arrailduretatik eratorritako egiturak'),
    views: [v(Sinus18, 'Sinu zerbikala 3D', SEC)],
    beats: [
      {
        at: S_SINUS[0],
        notes: ['w18/1.2/p7/s1'],
        idea: 'Gainerako arraildurak desagertu egiten dira.',
        text: 'Kanpotik ikusten diren gainerako faringe-arraildurak desagertu egiten dira.',
        focus: ['faringe-arraildurak', 'lehen-arraildura'],
        view: '3d',
      },
      {
        at: S_SINUS[1],
        notes: ['w18/1.2/p7/s2'],
        idea: 'II. arkuaren mesenkima behera hazi, arrailduren gainetik, goragune epikardikoarekin fusionatu.',
        text: 'Bigarren arkuko mesenkima beherantz luzatu eta hazi egiten da, arrailduren gainetik pasatuz eta goragune epikardikoarekin fusionatuz.',
        focus: ['bigarren-arkua', 'goragune-epikardikoa'],
        exam: 'II. arkua beherantz hazi eta goragune epikardikoarekin fusionatzen da.',
        view: '3d',
      },
      {
        at: S_SINUS[2],
        notes: ['w18/1.2/p7/s3', 'w18/1.2/p7/s4'],
        idea: 'Arraildurak estalita: aztarna txikia, sinu zerbikala.',
        text: 'Horrela, arraildurak estalita gelditzen dira. Hasieran aztarna txiki bat ageri da: sinu zerbikala.',
        focus: ['sinu-zerbikala'],
        view: '3d',
      },
      {
        at: S_SINUS[3],
        notes: ['w18/1.2/p7/s4'],
        idea: 'Sinua desagertu: egitura trinkoa.',
        text: 'Gero sinu zerbikala ere desagertu egiten da, eta egitura trinkoa eratzen da.',
        focus: ['bigarren-arkua', 'hirugarren-arkua', 'laugarren-arkua'],
        view: '3d',
      },
      {
        at: S_SINUS[4],
        notes: ['w18/1.2/p7/s5-s8'],
        idea: 'Batzuetan sinua mantentzen da: barrunbea lepoan; infekzioan likidoa, xiringaz kentzen da.',
        text: 'Batzuetan arraildurak ez dira guztiz desagertzen eta sinu zerbikala mantentzen da. Lepoan barrunbe bat geratzen da, normalean arazorik ematen ez duena. Helduetan, infekzio larri baten ondorioz, likido serosoa metatu daiteke eta lepoan bultoma bat nabaritzen da. Likidoa xiringa batekin kentzen da, eta ez du arazo handirik ematen.',
        focus: ['sinu-zerbikala'],
        view: '3d',
      },
    ],
    structures: ['faringe-arraildurak', 'lehen-arraildura', 'bigarren-arkua', 'hirugarren-arkua', 'laugarren-arkua', 'goragune-epikardikoa', 'sinu-zerbikala', 'faringe-poltsak'],
    keyPoints: [
      'Lehenengoa ez beste arraildurak desagertu egiten dira.',
      'II. arkua behera hazi, goragune epikardikoarekin fusionatu.',
      'Sinu zerbikala: aztarna txikia, gero desagertu; mantentzen bada, barrunbea lepoan.',
    ],
  },
];

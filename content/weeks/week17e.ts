import type { StageDef } from '@/lib/sim/types';
import { Muscles1, Muscles2, SM1, SM2 } from '@/components/scenes/week17/Muscles17';

const FILE = '17. GAIA. BURUA ETA LEPOA (ZUZENDUTA) fitxategiaren kopia.pdf';
const src = (section: string) => ({ file: FILE, section });
const ORIENT = { top: 'Kraneala', bottom: 'Kaudala' };
const HEADV = 'Fetu-burua 3D (apunteetako muskuluen irudia): muskulu bakoitza bere arkuaren kolorean (I laranja, II urdina, III horia, IV gorria, VI berdea). Ezkerretik ikusita aurpegia zure ezkerrean dago. Arrastatu biratzeko.';
const v = (scene: StageDef['views'][number]['scene'], label: string, description: string) => ({ id: '3d', label, plane: 'eskema' as const, description, orientation: ORIENT, scene, travel: false as const });

export const stages17e: StageDef[] = [
  {
    id: 'lehen-arkua-muskuluak',
    day: '20. astea (fetua)',
    dayRange: [28, 140],
    title: 'Lehen arkuaren muskuluak',
    subtitle: 'Murtxikatzaileak, milohioideoa eta digastrikoaren aurreko sabela: V3',
    intro: 'Muskuluek migratu egiten dute, eta nerbioak esaten digu zein arkutatik datozen. Lehen arkutik, barail-nerbioak inerbatuta, muskulu murtxikatzaileak eta ahoaren zoruko muskuluak ateratzen dira.',
    duration: 42,
    source: src('2.2.3. Muskuluak'),
    views: [v(Muscles1, 'Burua 3D', HEADV)],
    beats: [
      {
        at: SM1[0],
        notes: ['w17/2.2.3/p2/s1', 'w17/2.2.3/p3/s1', 'w17/2.2.3/p6/s1-s2'],
        idea: 'Muskuluak migratzen dira: jatorria nerbioak esaten du.',
        text: 'Enbrioiaren garapenean muskuluek migratu egiten dute, eta ez da erraza jakitea zein arkutakoa den haien jatorria. Horregatik begiratzen diogu nerbioari: inerbatzen dituzten nerbioen arabera jakin dezakegu zein arkutatik datozen muskuluak. Lehen arkuarena barail-nerbioa da (V3).',
        focus: ['barail-nerbioa'],
        exam: 'Muskulu baten jatorria arkua inerbatzen duen nerbioak esaten du.',
        view: '3d',
      },
      {
        at: SM1[1],
        notes: ['w17/2.2.3/p3/s2', 'w17/2.2.3/p3/s3'],
        idea: 'Maseteroa eta tenporala: muskulu murtxikatzaileak, I. arkua.',
        text: 'Lehen arkutik batez ere muskulu murtxikatzaileak ateratzen dira. Pare bat izendatzeko: maseteroa eta tenporala, muskulu indartsuenetarikoak, baraila igotzen dutenak, murtxikapenaren eragileak.',
        focus: ['maseteroa', 'muskulu-tenporala'],
        exam: 'Maseteroa eta tenporala: I. arkua, V3; baraila igotzen dute.',
        view: '3d',
      },
      {
        at: SM1[2],
        notes: ['w17/2.2.3/p4/s1'],
        idea: 'Milohioideoa: ahoaren zoruaren muskulu nagusia.',
        text: 'Mihiaren zorua eratzen duten eta haren mugimenduetan parte hartzen duten muskuluak ere arku honetatik datoz, degluzioan parte hartzen dutenak. Milohioideoa da ahoaren zorua eratzen duen muskulu nagusiena.',
        focus: ['milohioideoa'],
        view: '3d',
      },
      {
        at: SM1[3],
        notes: ['w17/2.2.3/p4/s1'],
        idea: 'Digastrikoa: bi sabel, V forma; aurreko sabela I. arkutik; baraila jaisten du.',
        text: 'Digastrikoak bi sabel ditu (di = bi, gastriko = sabela), aurrekoa eta atzekoa, eta V forma du. Aurreko sabela lehenengo arkuaren eratorria da. Muskuluaren funtzioa baraila jaistea da.',
        focus: ['digastrikoaren-aurreko-sabela'],
        view: '3d',
      },
      {
        at: SM1[4],
        notes: ['w17/2.2.3/p5/s1'],
        idea: 'Muskulu bat, bi jatorri: aurreko sabela V3, atzeko sabela II. arkuko nerbioa (VII).',
        text: 'Muskulu digastriko honek bi jatorri ditu. Aurreko sabela, lepotik barailaren behekalderaino doana, lehen arkuaren eratorria da, eta barail-nerbioak mugitzen du. Atzeko sabelak beste jatorri bat du: bigarren arkuko nerbioak inerbatzen du, VII.ak. Horregatik ageri da muskulu bakarra bi koloretan.',
        focus: ['digastrikoaren-aurreko-sabela', 'digastrikoaren-atzeko-sabela'],
        exam: 'Digastrikoa: aurreko sabela V3 (I. arkua), atzeko sabela VII (II. arkua).',
        ask: {
          q: 'Zein nerbiok inerbatzen du digastrikoaren atzeko sabela?',
          options: ['Aurpegi-nerbioak (VII)', 'Barail-nerbioak (V3)', 'Glosofaringeoak (IX)', 'Bagoak (X)'],
          answer: 0,
          why: ['Hori da: II. arkuko eratorria da.', 'Ez: V3-k aurreko sabela inerbatzen du.', 'Ez: IX III. arkuarena da.', 'Ez: X IV. eta VI. arkuena da.'],
        },
        view: '3d',
      },
    ],
    structures: ['barail-nerbioa', 'maseteroa', 'muskulu-tenporala', 'milohioideoa', 'digastrikoa', 'digastrikoaren-aurreko-sabela', 'digastrikoaren-atzeko-sabela', 'hioide-gorputza', 'baraila'],
    keyPoints: ['Muskuluen jatorria nerbioak esaten du.', 'I. arkua (V3): maseteroa, tenporala, milohioideoa, digastrikoaren aurreko sabela.', 'Digastrikoa: aurreko sabela V3, atzeko sabela VII.'],
  },
  {
    id: 'bigarren-arkua-muskuluak',
    day: '20. astea (fetua)',
    dayRange: [28, 140],
    title: 'Bigarren arkuaren muskuluak',
    subtitle: 'Muskulu mimikoak eta platisma, aurikularrak, okzipitala, digastrikoaren atzeko sabela eta estilohioideoa: VII',
    intro: 'Bigarren arkutik ateratzen diren muskuluak muskulu mimikoak dira: aurpegiko borondatezko muskulu somatikoak, aurpegi-nerbioak (VII) mugituak. Gehienak larruazalean txertatuta daude.',
    duration: 42,
    source: src('2.3.3. Muskuluak'),
    views: [v(Muscles2, 'Burua 3D', HEADV)],
    beats: [
      {
        at: SM2[0],
        notes: ['w17/2.3.3/p2/s1', 'w17/2.3.3/p3/s1', 'w17/2.3.2/p3/s3'],
        idea: 'II. arkuko muskuluak: mimikoak, aurpegi-nerbioak (VII) mugituak.',
        text: 'Arku honetatik ateratzen diren muskuluak muskulu mimikoak deitzen dira: mimikan parte hartzen dute, hau da, aurpegiko borondatezko muskulu somatikoak dira. Aurpegi-nerbioak mugitzen ditu, VII.ak: hori da haien arrastoa.',
        focus: ['aurpegi-nerbioa'],
        view: '3d',
      },
      {
        at: SM2[1],
        notes: ['w17/2.3.3/p3/s1', 'w17/2.3.3/p3/s2'],
        idea: 'Muskulu mimikoak: larruazalean txertatuta.',
        text: 'Muskulu mimiko gehienak larruazalean txertatuta daude, larruazala mugitzeko erabiltzen ditugulako: aurpegiko keinuak.',
        focus: ['muskulu-mimikoak', 'begietako-orbikularra', 'ahoko-orbikularra'],
        exam: 'Muskulu mimikoak: II. arkua, aurpegi-nerbioa; larruazalean txertatuta.',
        view: '3d',
      },
      {
        at: SM2[2],
        notes: ['w17/2.3.3/p4/s1', 'w17/2.3.3/p4/s2'],
        idea: 'Aurikularrak (funtzio gabeak gizakietan) eta okzipitala.',
        text: 'Gainera muskulu aurikularrak (belarria mugitzeko, baina gizakietan funtzio gabeak) eta okzipitala eratzen dira hemendik.',
        focus: ['muskulu-aurikularrak', 'okzipitala'],
        view: '3d',
      },
      {
        at: SM2[3],
        notes: ['w17/2.3.3/p4/s1', 'w17/2.3.3/p4/s2'],
        idea: 'Digastrikoaren atzeko sabela eta estilohioideoa.',
        text: 'Digastrikoaren atzeko sabela ere hemendik dator, eta baita estilohioideoa ere, apofisi estiloideotik hioide hezurrera doana. Apunteek «hezur» estilohioideoa diote, baina haien irudiak muskulu bezala izendatzen du.',
        focus: ['digastrikoaren-atzeko-sabela', 'estilohioideoa'],
        view: '3d',
      },
      {
        at: SM2[4],
        notes: ['w17/2.3.3/p3/s3'],
        idea: 'Platisma: lepoko azalaren azpian, fina eta zapala; muskulu mimikoen barnean.',
        text: 'Platisma muskulua ere bigarren arkutik eratzen da: lepoko azalaren azpian dago, fina eta zapala da, eta muskulu mimikoen barnean sar genezake.',
        focus: ['platisma'],
        view: '3d',
      },
    ],
    structures: ['aurpegi-nerbioa', 'muskulu-mimikoak', 'begietako-orbikularra', 'ahoko-orbikularra', 'muskulu-aurikularrak', 'okzipitala', 'digastrikoaren-atzeko-sabela', 'estilohioideoa', 'estiloide-apofisia', 'platisma'],
    keyPoints: ['II. arkuko muskuluak: mimikoak, borondatezkoak (somatikoak); aurpegi-nerbioa (VII).', 'Platisma (lepoko azalaren azpian, fina eta zapala) mimikoen barnean; aurikularrak, okzipitala, digastrikoaren atzeko sabela, estilohioideoa.'],
    cautions: ['«Hezur estilohioideoa» idatzita dago apunteetan, baina muskulua da (apunteetako irudiak M. estilohioidea dio).'],
  },
];

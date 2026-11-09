import type { StageDef } from '@/lib/sim/types';
import { Muscles1, Muscles2, SM1, SM2 } from '@/components/scenes/week17/Muscles17';

const FILE = '17. GAIA. BURUA ETA LEPOA (ZUZENDUTA).pdf';
const src = (section: string) => ({ file: FILE, section });
const ORIENT = { top: 'Kraneala', bottom: 'Kaudala' };
const HEADV = 'Fetu-burua 3D (apunteetako 6. orriko irudia): muskulu bakoitza bere arkuaren kolorean (I laranja, II urdina, III horia, IV gorria, VI berdea). Ezkerretik ikusita aurpegia zure ezkerrean dago. Arrastatu biratzeko.';
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
        notes: ['w17/2.2.3/p1/s1', 'w17/2.2.3/p2/s1', 'w17/2.2.3/p3/s1', 'w17/2.2.3/p7/s1'],
        idea: 'Muskuluak migratzen dira: jatorria nerbioak esaten du.',
        text: 'Garapenean muskuluek migratu egiten dute, eta ez da erraza jakitea zein arkutatik datozen. Horregatik begiratzen diogu nerbioari: inerbatzen dituen nerbioaren arabera dakigu muskulu baten jatorria. Lehen arkuarena barail-nerbioa da (V3).',
        focus: ['barail-nerbioa'],
        exam: 'Muskulu baten jatorria arkua inerbatzen duen nerbioak esaten du.',
        view: '3d',
      },
      {
        at: SM1[1],
        notes: ['w17/2.2.3/p3/s2', 'w17/2.2.3/p3/s3'],
        idea: 'Maseteroa eta tenporala: muskulu murtxikatzaileak, I. arkua.',
        text: 'Lehen arkutik batez ere muskulu murtxikatzaileak ateratzen dira. Pare bat izendatzeko: maseteroa eta tenporala, muskulu indartsuenetarikoak, baraila igotzen dutenak.',
        focus: ['maseteroa', 'muskulu-tenporala'],
        view: '3d',
      },
      {
        at: SM1[2],
        notes: ['w17/2.2.3/p4/s1'],
        idea: 'Milohioideoa: ahoaren zoruaren muskulu nagusia.',
        text: 'Ahoaren zorua eratzen duten muskuluak ere arku honetatik datoz, degluzioan parte hartzen dutenak. Milohioideoa da ahoaren zorua eratzen duen muskulu nagusiena.',
        focus: ['milohioideoa'],
        view: '3d',
      },
      {
        at: SM1[3],
        notes: ['w17/2.2.3/p4/s1', 'w17/2.2.3/p5/s1', 'w17/2.2.3/p5/s2', 'w17/2.2.3/p7/s2'],
        idea: 'Digastrikoaren aurreko sabela: hioidetik barailera; baraila jaisten du.',
        text: 'Digastrikoak bi sabel ditu (di = bi, gastriko = sabela) eta V forma du. Belarriaren mailatik atzetik aurrera pasatzen da. Aurreko sabela hioide hezurretik barailera doan atala da, eta muskuluaren funtzioa baraila jaistea da.',
        focus: ['digastrikoaren-aurreko-sabela'],
        view: '3d',
      },
      {
        at: SM1[4],
        notes: ['w17/2.2.3/p6/s1', 'w17/2.2.3/p6/s2'],
        idea: 'Muskulu bat, bi jatorri: aurreko sabela V3, atzeko sabela VII.',
        text: 'Sabel bakoitzak eratorri desberdina du. Aurreko sabela barail-nerbioak (V. bikote kraneala) inerbatzen du, eta atzeko sabela VII. bikote kranealak, jatorri ezberdina dutelako. Horregatik ageri da muskulu bakarra bi koloretan.',
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
    subtitle: 'Aurpegi-nerbioa: muskulu mimikoak, aurikularrak, okzipitala, digastrikoaren atzeko sabela, estilohioideoa eta platisma',
    intro: 'Bigarren arkuko muskulu guztiak aurpegi-nerbioak inerbatzen ditu. Aurpegiko muskulu txiki guztiak hemendik datoz, eta larruazalean txertatuta daude.',
    duration: 42,
    source: src('2.3.3. Muskuluak'),
    views: [v(Muscles2, 'Burua 3D', HEADV)],
    beats: [
      {
        at: SM2[0],
        notes: ['w17/2.3.3/p1/s1', 'w17/2.3.3/p2/s1', 'w17/2.3.3/p3/s1'],
        idea: 'II. arkuko muskulu guztiak: aurpegi-nerbioa (VII).',
        text: 'Arku honetatik ateratzen diren muskuluak aurpegi-nerbioak inerbatzen ditu. Hori da haien arrastoa.',
        focus: ['aurpegi-nerbioa'],
        view: '3d',
      },
      {
        at: SM2[1],
        notes: ['w17/2.3.3/p3/s2', 'w17/2.3.3/p3/s3'],
        idea: 'Muskulu mimikoak: larruazalean txertatuta, keinuak.',
        text: 'Aurpegiko muskulu txiki guztiak eratzen dira: muskulu mimikoak, aurpegiko keinuak ahalbidetzen dituztenak. Gehienak larruazalean txertatuta daude, larruazala mugitzeko erabiltzen ditugulako.',
        focus: ['muskulu-mimikoak', 'begietako-orbikularra', 'ahoko-orbikularra'],
        exam: 'Muskulu mimikoak: II. arkua, aurpegi-nerbioa.',
        view: '3d',
      },
      {
        at: SM2[2],
        notes: ['w17/2.3.3/p4/s1', 'w17/2.3.3/p4/s2'],
        idea: 'Aurikularrak (funtzio gabeak gizakietan) eta okzipitala.',
        text: 'Gainera muskulu aurikularrak (belarria mugitzeko, baina gizakietan funtzio gabeak) eta okzipitala eratzen dira.',
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
        notes: ['w17/2.3.3/p5/s1'],
        idea: 'Platisma: lepoaren larruazala mugitzen du.',
        text: 'Azkenik, platisma ere eratzen da: lepoaren larruazala mugitzeaz arduratzen den muskulua.',
        focus: ['platisma'],
        view: '3d',
      },
    ],
    structures: ['aurpegi-nerbioa', 'muskulu-mimikoak', 'begietako-orbikularra', 'ahoko-orbikularra', 'muskulu-aurikularrak', 'okzipitala', 'digastrikoaren-atzeko-sabela', 'estilohioideoa', 'estiloide-apofisia', 'platisma'],
    keyPoints: ['II. arkuko muskulu guztiak: aurpegi-nerbioa (VII).', 'Muskulu mimikoak, aurikularrak, okzipitala, digastrikoaren atzeko sabela, estilohioideoa, platisma.'],
    cautions: ['«Hezur estilohioideoa» idatzita dago apunteetan, baina muskulua da (apunteetako irudiak M. estilohioidea dio).'],
  },
];

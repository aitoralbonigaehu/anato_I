import type { StageDef } from '@/lib/sim/types';
import { Intro17, SA, SB, SC, SD, SE, Sutures17, TwoParts17, Vault17, Viscero17 } from '@/components/scenes/week17/Skull17';

const FILE = '17. GAIA. BURUA ETA LEPOA (ZUZENDUTA).pdf';
const src = (section: string) => ({ file: FILE, section });
const ORIENT = { top: 'Kraneala', bottom: 'Kaudala' };
const TOP_O = { top: 'Aurrea', bottom: 'Atzea' };
const v = (scene: StageDef['views'][number]['scene'], label: string, description: string, id = '3d', orientation = ORIENT) => ({ id, label, plane: 'eskema' as const, description, orientation, scene, travel: false as const });

const SKULL = 'Fetuaren burezurra 3D: hezurrak marfil kolorekoak, josturak eta fontanelak mintz urdinak. Arrastatu biratzeko.';
const TOPV = 'Burezurra goitik 3D (apunteetako irudia bezala): kopeta goian, fetuaren ezkerra zure ezkerrean. Hezurrak marfil kolorekoak, josturak eta fontanelak mintz urdinak. Arrastatu biratzeko.';

export const stages17a: StageDef[] = [
  {
    id: 'sarrera',
    day: 'Enbrioitik jaiotzera',
    dayRange: [22, 56],
    title: 'Burua eta lepoa: gaiaren bidea',
    subtitle: 'Kraneoa, faringe-arkuak eta eratorriak',
    intro: 'Gai honetan burua eta lepoa ikusten dira: lehenik kraneoaren garapena (neurokraneoa eta errai kraneoa), gero faringe-arkuak eta haien eratorriak.',
    duration: 24,
    source: src('1. Kraneoaren garapena'),
    views: [v(Intro17, 'Burezurra 3D', SKULL)],
    beats: [
      { at: SA[0], notes: ['w17/intro/p1/s1', 'w17/intro/p2/s1', 'w17/1/p1/s1', 'w17/1.1/p1/s1', 'w17/1.2/p1/s1', 'w17/1/p2/s1'], idea: 'Lehen kraneoa: neurokraneoa eta errai kraneoa.', text: 'Burua eta lepoaren lehen zatia: kraneoaren garapena, neurokraneoa eta errai kraneoa, eta ondoren faringe-arkuak eta eratorriak.', focus: ['neurokraneoa', 'errai-kraneoa'], view: '3d' },
      { at: SA[1], notes: ['w17/intro/p2/s1'], idea: 'Kolore bakoitza arku bat da, enbrioitik helduraino.', text: 'Eratorri batek bere arkuaren kolorea darama gai osoan: I. arkua laranja, II.a urdina, III.a horia. Baraila laranja da, hioidearen zati bat urdina eta bestea horia.', focus: ['baraila', 'hioide-hezurra'], view: '3d' },
    ],
    structures: ['neurokraneoa', 'errai-kraneoa', 'baraila', 'hioide-hezurra'],
    keyPoints: ['Kraneoa: neurokraneoa eta errai kraneoa.', 'Eratorri bakoitzak bere arkuaren kolorea darama.'],
  },
  {
    id: 'kraneoaren-bi-atalak',
    day: 'Enbrioi eta fetu aroa',
    dayRange: [22, 56],
    title: 'Kraneoaren bi atalak',
    subtitle: 'Neurokraneoa (garunaren kutxa) eta errai kraneoa (aurpegia)',
    intro: 'Kraneoan bi atal nagusi bereizten dira. Neurokraneoak garuna inguratu eta babesten du; errai kraneoa aurpegiko hezurrek osatzen dute. Jatorria ere desberdina da.',
    duration: 34,
    source: src('1. Kraneoaren garapena'),
    views: [v(TwoParts17, 'Burezurra 3D', SKULL)],
    beats: [
      { at: SB[0], notes: ['w17/1/p3/s1'], idea: 'Bi atal: neurokraneoa eta errai kraneoa.', text: 'Kraneoan bi atal nagusi bereizi behar dira: neurokraneoa eta errai kraneoa.', focus: ['neurokraneoa', 'errai-kraneoa'], view: '3d' },
      { at: SB[1], notes: ['w17/1/p4/s1', 'w17/1/p4/s2'], idea: 'Neurokraneoa: garuna babesten du; entzefaloa barnean.', text: 'Neurokraneoa garuna inguratu eta babesten duten hezurrek osatzen dute. Entzefaloa dago barnean.', focus: ['neurokraneoa', 'entzefaloa'], view: '3d', exam: 'Neurokraneoak entzefaloa inguratzen du.' },
      { at: SB[2], notes: ['w17/1/p4/s1'], idea: 'Neurokraneoa: mesodermo paraxiala + gandor neurala.', text: 'Neurokraneoko hezurrak bi jatorritik datoz: somita okzipitaletako mesodermo paraxialetik (neurokraneoko hezur leunak, mintzezko hezurtzapenaz) eta gandor neuraleko zeluletatik.', focus: ['hezur-frontala', 'hezur-parietala'], view: '3d', exam: 'Neurokraneoa: somita okzipitalen mesodermo paraxiala eta gandor neurala.' },
      { at: SB[3], notes: ['w17/1/p5/s1'], idea: 'Errai kraneoa: gandor neurala soilik.', text: 'Errai kraneoa aurpegian dauden hezurrek osatzen dute eta gandor neuraleko zeluletatik garatzen da.', focus: ['errai-kraneoa'], view: '3d', exam: 'Errai kraneoa: gandor neuraletik.' },
    ],
    structures: ['neurokraneoa', 'errai-kraneoa', 'entzefaloa', 'hezur-frontala', 'hezur-parietala'],
    keyPoints: ['Neurokraneoa: entzefaloa barnean; mesodermo paraxiala + gandor neurala.', 'Errai kraneoa: aurpegia; gandor neurala.'],
  },
  {
    id: 'josturak-fontanelak',
    day: 'Jaiotza eta lehen urteak',
    dayRange: [266, 266],
    title: 'Josturak eta fontanelak',
    subtitle: 'Goitik ikusita: hezur lauen arteko tarteak, mintzak eta erditzea',
    intro: 'Hezur lauen artean josturak agertzen dira. Hasieran mintzek lotzen dituzte, fontanelek. Haiei esker hezurrak hurbildu daitezke erditzean, eta burua errazago ateratzen da.',
    duration: 46,
    source: src('1.1. Neurokraneoa'),
    views: [v(Sutures17, 'Goitik 3D', TOPV, '3d', TOP_O)],
    beats: [
      { at: SC[0], notes: ['w17/1.1/p4/s1'], idea: 'Josturak: hezur lauen arteko giltzapenak.', text: 'Neurokraneoan jostura ezberdinak agertzen dira: hezur lauen artean ematen diren giltzapenak edo artikulazioak. Goitik: frontala, koronala, sagitala eta lambdoidea.', focus: ['joskura-metopikoa', 'joskura-koronala', 'joskura-sagitala', 'joskura-lanbdoidea'], view: '3d' },
      { at: SC[1], notes: ['w17/1.1/p4/s2', 'w17/1.1/p4/s3'], idea: 'Fontanelak: josturak baino lehen hezurrak lotzen dituzten mintzak.', text: 'Josturak eratu baino lehen mintz batzuk luzatzen dira hezurrak lotuz: fontanelak. Handienak aurrekoa eta atzekoa dira.', focus: ['aurreko-fontanela', 'atzeko-fontanela'], view: '3d' },
      { at: SC[2], notes: ['w17/1.1/p4/s3', 'w17/1.1/p5/s1', 'w17/1.1/p5/s2'], idea: 'Erditzean parietalak hurbildu: burua txikiago.', text: 'Neurokraneoko hezurrak ezin dira giltzatuta egon erditzean: burua oso egitura trinkoa izango litzateke eta arazo larriak emango lituzke. Oraindik josita ez daudenez, hurbildu egiten dira eta jaioberriaren burua errazago ateratzen da.', focus: ['hezur-parietala', 'aurreko-fontanela'], view: '3d', exam: 'Fontanelen funtzioa: erditzean hezurrak hurbiltzea.' },
      { at: SC[3], notes: ['w17/1.1/p4/s3'], idea: 'Atzeko fontanela: 2. hilabetean itxi.', text: 'Atzeko fontanela 2. hilabetean ixten da. Kontuz: apunteetako irudiak 3. hilabetea dio, baina testua da nagusi.', focus: ['atzeko-fontanela'], view: '3d', exam: 'Atzeko fontanela: 2. hilabetean.' },
      { at: SC[4], notes: ['w17/1.1/p4/s3'], idea: 'Aurreko fontanela: 2. urtean itxi.', text: 'Aurreko fontanela 2. urtean ixten da.', focus: ['aurreko-fontanela'], view: '3d', exam: 'Aurreko fontanela: 2. urtean.' },
    ],
    structures: ['joskura-metopikoa', 'joskura-koronala', 'joskura-sagitala', 'joskura-lanbdoidea', 'joskurak', 'aurreko-fontanela', 'atzeko-fontanela', 'fontanelak', 'hezur-frontala', 'hezur-parietala'],
    keyPoints: ['Josturak: hezur lauen arteko giltzapenak.', 'Fontanelak: mintzak; aurrekoa 2. urtean, atzekoa 2. hilabetean ixten dira.', 'Erditzean parietalak hurbildu egiten dira.'],
    cautions: ['Atzeko fontanela: testuak «2. hilabetean» dio, irudiak «3. hilabetean». Testua da nagusi.'],
  },
  {
    id: 'buru-ganga',
    day: 'Fetu aroa',
    dayRange: [56, 266],
    title: 'Buru ganga: mintzezko neurokraneoa',
    subtitle: 'Frontalak gandor neuraletik; parietalak eta okzipitalaren ezkata mesodermo paraxialetik',
    intro: 'Neurokraneoko hezur guztiak ez dira mintzezkoak: buru ganga bai, oinaldea endokondrala. Buru gangako hezurrak bi jatorritakoak dira.',
    duration: 36,
    source: src('1.1. Neurokraneoa'),
    views: [v(Vault17, 'Buru ganga 3D', SKULL)],
    beats: [
      { at: SD[0], notes: ['w17/1.1/p2/s1', 'w17/1.1/p3/s1', 'w17/1.1/p3/s2', 'w17/1.1/p6/s1'], idea: 'Buru ganga mintzezkoa; oinaldea endokondrala.', text: 'Hemengo hezurrak somita okzipitaletako mesodermo paraxialetik eta gandor neuraleko zeluletatik garatzen dira. Neurokraneoko hezur guztiek ez dute mintzezko hezurtzapena: oinaldean endokondrala da. Bi atal bereizten dira; lehena buru ganga edo mintzezko neurokraneoa.', focus: ['buru-ganga', 'mintza'], view: '3d' },
      { at: SD[1], notes: ['w17/1.1/p7/s1'], idea: 'Frontalak: gandor neurala, mintzezkoak.', text: 'Hezur frontalak gandor neuraleko zeluletatik garatu eta mintzezko hezurtzez eratzen dira.', focus: ['hezur-frontala'], view: '3d', exam: 'Frontalak: gandor neurala.' },
      { at: SD[2], notes: ['w17/1.1/p7/s2'], idea: 'Parietalak eta okzipitalaren ezkata: mesodermo paraxiala.', text: 'Parietalak eta okzipitalaren ezkata mesodermo paraxialaren eratorriak dira, eta mintzezko hezurtzez eratuko dira.', focus: ['hezur-parietala', 'okzipitalaren-ezkata'], view: '3d', exam: 'Parietalak eta okzipitalaren ezkata: mesodermo paraxiala.' },
    ],
    structures: ['buru-ganga', 'mintza', 'hezur-frontala', 'hezur-parietala', 'okzipitalaren-ezkata'],
    keyPoints: ['Buru ganga: mintzezko hezurtzea.', 'Frontalak: gandor neurala.', 'Parietalak eta okzipitalaren ezkata: mesodermo paraxiala.'],
  },
  {
    id: 'errai-kraneoa',
    day: 'Fetu aroa',
    dayRange: [56, 266],
    title: 'Errai kraneoa',
    subtitle: 'Aurpegiko hezurrak: gandor neurala, mintzezkoak, 1. eta 2. arkuetatik',
    intro: 'Aurpegiko hezurrak gandor neuraleko zeluletatik garatzen dira, mintzezko hezurtzearen ondorioz, eta 1. eta 2. arku faringeoen eratorriak dira.',
    duration: 32,
    source: src('1.2. Errai kraneoa'),
    views: [v(Viscero17, 'Aurpegia 3D', SKULL)],
    beats: [
      { at: SE[0], notes: ['w17/1.2/p2/s1', 'w17/1.2/p4/s1'], idea: 'Aurpegiko hezurrak mintzezko hezurtzez.', text: 'Errai kraneoko hezurrak mintzezko hezurtzearen ondorioz ateratzen dira.', focus: ['hezur-maxilarra', 'zigomatikoa', 'baraila'], view: '3d', exam: 'Errai kraneoa: mintzezko hezurtzea.' },
      { at: SE[1], notes: ['w17/1.2/p3/s1'], idea: 'Gandor neuraletik.', text: 'Hemengo hezurrak gandor neuraleko zeluletatik garatzen dira.', focus: ['errai-kraneoa'], view: '3d' },
      { at: SE[2], notes: ['w17/1.2/p5/s1'], idea: '1. eta 2. arkuen eratorriak.', text: '1. eta 2. arku faringeoen edo brankialen eratorriak dira.', focus: ['baraila', 'estiloide-apofisia', 'hioide-hezurra'], view: '3d' },
    ],
    structures: ['errai-kraneoa', 'hezur-maxilarra', 'zigomatikoa', 'baraila', 'estiloide-apofisia', 'hioide-hezurra'],
    keyPoints: ['Errai kraneoa: gandor neurala, mintzezkoa.', '1. eta 2. arkuen eratorriak.'],
  },
];

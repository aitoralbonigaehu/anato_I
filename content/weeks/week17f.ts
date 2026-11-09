import type { StageDef } from '@/lib/sim/types';
import { Chondrocranium17, Ossification17, S_BASE, S_OSS } from '@/components/scenes/week17/Base17';

const FILE = '17. GAIA. BURUA ETA LEPOA (ZUZENDUTA).pdf';
const src = (section: string) => ({ file: FILE, section });
const OSS = 'Bi ehun bloke ondoz ondo (3D): ezkerrean mintzezko hezurtzea, eskuinean hezurtze endokondrala. Mesenkima marroia, kartilagoa berde argia, osteoblastoak laranjak, hezurra krema. Arrastatu biratzeko.';
const BASE = 'Kraneoaren oinaldea goitik (3D), apunteetako irudia bezala: aurrealdea goian, zure ezkerreko erdian hezurrak (krema) eta eskuinekoan haien kartilagoak (berde argia). Arrastatu biratzeko.';
const v = (scene: StageDef['views'][number]['scene'], label: string, description: string, orientation: { top: string; bottom: string }) => ({ id: '3d', label, plane: 'eskema' as const, description, orientation, scene, travel: false as const });

export const stages17f: StageDef[] = [
    {
    id: 'hezurtze-motak',
    day: 'Garapen osoan',
    dayRange: [42, 56],
    title: 'Bi hezurtze mota',
    subtitle: 'Mintzezkoa (zuzenean, azkar) eta endokondrala (kartilagotik igarota, geldo)',
    intro: 'Kraneoko hezurrak bi modutan sortzen dira. Mintzezko hezurtzean mesenkimatik zuzenean hezurra ateratzen da. Hezurtze endokondralean mesenkimak lehenago kartilagoa eratzen du, eta kartilago hori hezurtzen da.',
    duration: 42,
    source: src('1. Kraneoaren garapena'),
    views: [v(Ossification17, 'Bi hezurtzeak 3D', OSS, { top: 'Atzealdea', bottom: 'Aurrealdea' })],
    beats: [
      {
        at: S_OSS[0],
        notes: ['w17/1/p6/s1'],
        recall: ['mesenkima'],
        idea: 'Bi hezurtze mota: bietan abiapuntua mesenkima da.',
        text: 'Bi hezurtze mota daude, eta biak mesenkimatik abiatzen dira. Ezkerreko blokean mintzezko hezurtzea ikusiko dugu, eskuinekoan hezurtze endokondrala, erloju berean, zein azkarrago doan ikusteko.',
        focus: ['mintzezko-hezurtzapena', 'hezurtzapen-endokondrala', 'mesenkima'],
        view: '3d',
      },
      {
        at: S_OSS[1],
        notes: ['w17/1/p7/s1', 'w17/1/p8/s1'],
        idea: 'Mintzezkoan mesenkima zuzenean hezur; endokondralean lehenago kartilagoa.',
        key: 'Bien arteko aldea kartilagoa da: endokondralak (kondro = kartilago) badu, mintzezkoak ez.',
        text: 'Ezkerrean, mesenkima-zelulak bildu eta hezurra ematen dute zuzenean. Eskuinean, zelula berberek hezurraren forma duen kartilagoa eratzen dute: barruan kondrozitoak dituen eredua.',
        focus: ['osteoblastoak', 'hezur-espikulak', 'kartilago-eredua', 'kondrozitoak'],
        exam: 'Mintzezkoa: mesenkima → hezurra. Endokondrala: mesenkima → kartilagoa → hezurra.',
        view: '3d',
      },
      {
        at: S_OSS[2],
        notes: ['w17/1/p7/s2'],
        idea: 'Mintzezko hezurtzea azkarragoa da.',
        text: 'Ezkerrekoak bukatu du: hezur laua dago. Mesenkimatik zuzenean hezurra ateratzen delako da hezurtze endokondrala baino azkarragoa. Eskuinean kartilagoa dago oraindik.',
        focus: ['hezur-lauak', 'kartilago-eredua'],
        view: '3d',
      },
      {
        at: S_OSS[3],
        notes: ['w17/1/p8/s1', 'w17/1/p9/s1'],
        idea: 'Kartilagoa hezurtzen da: kondrozitoak osteoblasto bihurtzen dira.',
        text: 'Orain eskuinekoa hezurtzen da, erditik muturretara. Apunteek dioten bezala, kondrozitoak osteoblasto bihurtzen dira. Kondro hitzak kartilago esan nahi du.',
        focus: ['kondrozitoak', 'osteoblastoak', 'hezur-endokondrala'],
        view: '3d',
      },
      {
        at: S_OSS[4],
        notes: ['w17/1/p7/s1', 'w17/1/p8/s2-s3'],
        idea: 'Hezur lauak mintzezkoak; oinaldeko gehienak endokondralak, luze eta geldo.',
        text: 'Mintzezko hezurtzeak hezur lauak ematen ditu: parietalak, okzipitalaren ezkata eta aurpegiarekin erlazionatutako hezurrak. Kraneoaren oinaldeko hezur gehienak endokondralak dira; horregatik, prozesu luze eta geldoa da.',
        focus: ['hezur-lauak', 'hezur-endokondrala'],
        exam: 'Hezur lauak: mintzezkoak. Kraneoaren oinaldeko gehienak: endokondralak.',
        view: '3d',
      },
    ],
    structures: ['mesenkima', 'osteoblastoak', 'kondrozitoak', 'mintzezko-hezurtzapena', 'hezurtzapen-endokondrala', 'kartilago-eredua', 'hezur-espikulak', 'hezur-lauak', 'hezur-endokondrala'],
    keyPoints: [
      'Mintzezko hezurtzea: mesenkimatik zuzenean hezurra; hezur lauak; azkarra.',
      'Hezurtze endokondrala: mesenkima → kartilagoa → hezurra (kondrozitoak osteoblasto bihurtu); oinaldeko hezur gehienak; luze eta geldoa.',
      'Kondro = kartilago.',
    ],
  },
    {
    id: 'kondrokraneoa',
    day: 'Garapen osoan',
    dayRange: [42, 56],
    title: 'Kondrokraneoa: oinaldea kartilagotik hezurrera',
    subtitle: 'Kartilagozko lamina baten ataletatik hezurren atalak',
    intro: 'Burezurraren oinaldea (kartilagozko neurokraneoa edo kondrokraneoa) hezurtze endokondralez eratzen da. Hasieran kartilagozko lamina bat dago, eta haren atal desberdinetatik hezurren atal desberdinak ateratzen dira.',
    duration: 46,
    source: src('1.1. Neurokraneoa'),
    views: [v(Chondrocranium17, 'Oinaldea goitik 3D', BASE, { top: 'Aurrealdea', bottom: 'Atzealdea' })],
    beats: [
      {
        at: S_BASE[0],
        notes: ['w17/1.1/p8/s1', 'w17/1.1/p8/s2', 'w17/1.1/p3/s2'],
        recall: ['hezurtzapen-endokondrala'],
        idea: 'Oinaldea hezurtze endokondralez: hasieran kartilagozko lamina bat.',
        text: 'Ganga kendu eta oinaldea goitik ikusten dugu. Neurokraneoko hezur guztiak ez dira mintzezkoak: oinaldean endokondrala da. Hasieran kartilagozko lamina bat dago. Erdian, atzetik aurrera: esklerotoma okzipitalak, kartilago parakordala, hipofisi kartilagoa eta trenkadatxo kranialak.',
        focus: ['kondrokraneoa', 'esklerotoma-okzipitalak', 'kartilago-parakordalak', 'hipofisi-kartilagoak', 'trenkada-kranialak'],
        exam: 'Kondrokraneoa: hezurtze endokondrala.',
        view: '3d',
      },
      {
        at: S_BASE[1],
        notes: ['w17/1.1/p8/s2'],
        idea: 'Alboetan kapsula periotikoa, hego tenporala eta begizulo hegoa.',
        text: 'Alboetan beste hiru atal: kapsula periotikoa, hego tenporala eta begizulo hegoa. Atal bakoitza hezur-atal bat izango da.',
        focus: ['kapsula-periotikoa', 'hego-tenporala', 'begizulo-hegoa'],
        view: '3d',
      },
      {
        at: S_BASE[2],
        notes: ['w17/1.1/p8/s2'],
        idea: 'Erdikoak: okzipitalaren oinaldea, esfenoidesaren gorputza, etmoidesa.',
        text: 'Zure ezkerreko erdian kartilagoa hezur bihurtzen da, eta eskuinekoan kartilagoa utzi dugu, jatorria ikusteko. Parakordalak eta esklerotomak okzipitalaren oinaldea ematen dute, hipofisi kartilagoak esfenoidesaren gorputza eta trenkadatxoek etmoidesa.',
        focus: ['okzipitalaren-oinaldea', 'esfenoidesaren-gorputza', 'etmoidesa'],
        view: '3d',
      },
      {
        at: S_BASE[3],
        notes: ['w17/1.1/p8/s2'],
        idea: 'Albokoak: harkaitza, hego handia, hego txikia.',
        text: 'Alboetan berdin: kapsula periotikotik harkaitza, hego tenporaletik esfenoidesaren hego handia, begizulo hegotik esfenoidesaren hego txikia.',
        focus: ['harkaitza', 'esfenoidesaren-hego-handia', 'esfenoidesaren-hego-txikia'],
        exam: 'Kapsula periotikoa → harkaitza; hego tenporala → hego handia; begizulo hegoa → hego txikia.',
        view: '3d',
      },
      {
        at: S_BASE[4],
        notes: ['w17/1.1/p8/s2', 'w17/1.1/p7/s2'],
        idea: 'Irudi osoa: hezurrak ezkerrean, kartilagoak eskuinean. Ezkata ez da kartilagotik.',
        text: 'Hau da apunteetako irudia, izen guztiekin. Okzipitalaren ezkata oinaldearen atzean dago, baina ez du kartilagorik: mintzezko hezurtzeaz sortzen da.',
        caution: 'Okzipitalaren oinaldea kartilagotik dator, baina okzipitalaren ezkata mintzezkoa da.',
        focus: ['okzipitalaren-ezkata', 'okzipitalaren-oinaldea'],
        view: '3d',
      },
    ],
    structures: ['kondrokraneoa', 'esklerotoma-okzipitalak', 'kartilago-parakordalak', 'hipofisi-kartilagoak', 'trenkada-kranialak', 'kapsula-periotikoa', 'hego-tenporala', 'begizulo-hegoa', 'okzipitalaren-oinaldea', 'okzipitalaren-ezkata', 'esfenoidesaren-gorputza', 'etmoidesa', 'harkaitza', 'esfenoidesaren-hego-handia', 'esfenoidesaren-hego-txikia'],
    keyPoints: [
      'Burezurraren oinaldea = kartilagozko neurokraneoa = kondrokraneoa: hezurtze endokondrala.',
      'Hasieran kartilagozko lamina bat; atal bakoitzetik hezur-atal bat.',
      'Kartilago parakordala + esklerotomak → okzipitalaren oinaldea; hipofisi kartilagoa → esfenoidesaren gorputza; trenkadatxoak → etmoidesa.',
      'Kapsula periotikoa → harkaitza; hego tenporala → hego handia; begizulo hegoa → hego txikia.',
    ],
    cautions: ['Okzipitala bi jatorritakoa da: oinaldea endokondrala, ezkata mintzezkoa.'],
  },
];

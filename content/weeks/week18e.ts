import type { StageDef } from '@/lib/sim/types';
import { Choana18, Defects18, IntermaxSeg18, Septum18, Shelves18, S_CH, S_DEF, S_SEG, S_SH, S_SP } from '@/components/scenes/week18/Palate18';

const FILE = '18. GAIA_ Burua eta lepoa ll (Zuzenduta).pdf';
const src = (section: string) => ({ file: FILE, section });
const COR = { top: 'Kraneala', bottom: 'Kaudala', left: 'Eskuina', right: 'Ezkerra' };
const UND = { top: 'Bentrala', bottom: 'Dortsala', left: 'Eskuina', right: 'Ezkerra' };
const SAG = { top: 'Kraneala', bottom: 'Kaudala', left: 'Bentrala', right: 'Dortsala' };
const v = (scene: StageDef['views'][number]['scene'], label: string, description: string, orientation: StageDef['views'][number]['orientation']) => ({ id: '3d', label, plane: 'eskema' as const, description, orientation, scene, travel: false as const });
const BELOW = 'Aho sabaia behetik (3D): ebakortzak goian, enbrioiaren ezkerra zure eskuinean. Luzakin maxilarrak eta plakak laranjak (I. arkua), hasierako aho sabaia horia. Arrastatu biratzeko.';
const CORONAL = 'Burua zeharka moztuta aurretik (3D): enbrioiaren ezkerra zure eskuinean. Gandorrak laranjak, mihia gorria, trenkada zuria. Arrastatu biratzeko.';
const SAGITTAL = 'Burua sudur-zuloan zehar moztuta (3D), ezkerretik: aurpegia zure ezkerrean. Hasierako aho sabaia horia, plakak laranjak, barrunbeak ilunak. Arrastatu biratzeko.';

export const stages18e: StageDef[] = [
  {
    id: 'maxilar-arteko-segmentua',
    day: '7.–10. asteak',
    dayRange: [43, 70],
    title: 'Maxilar arteko segmentua eta aho sabaia',
    subtitle: 'Hasierako aho sabaiaren hirukia eta bi plakak, behetik',
    intro: 'Ertz medialak erdian fusionatzean maxilar arteko segmentua sortzen da: aurrean hiruki bat, hasierako aho sabaia, 4 ebakortzekin eta ebakortz zuloarekin. Bi plakek gainerakoa ixten dute.',
    duration: 36,
    source: src('4.1. Sudur plakodak eta aho sabaia'),
    views: [v(IntermaxSeg18, 'Aho sabaia behetik', BELOW, UND)],
    beats: [
      { at: S_SEG[0], notes: ['w18/4.1/p12/s1'], recall: ['luzapen-maxilarra'], idea: 'Ertz medialak erdian fusionatu: maxilar arteko segmentua.', text: 'Alde bietako luzakin maxilarrak eta erdian ertz medialak fusionatu ondoren, egitura berri bat sortzen da: maxilar arteko segmentua.', focus: ['maxilar-arteko-segmentua', 'luzapen-maxilarra'], view: '3d' },
      { at: S_SEG[1], notes: ['w18/4.1/p12/s2', 'w18/4.1/p13/s1'], idea: 'Segmentua → hasierako aho sabaia, hiruki formakoa.', text: 'Maxilar arteko segmentuak aurrekaldean hiruki formako atala ematen du: hasierako aho sabaia. Sudur-hastapenen ertz medialetatik dator.', focus: ['hasierako-aho-sabaia'], exam: 'Hasierako aho sabaia: hirukia, maxilar arteko segmentutik.', view: '3d' },
      { at: S_SEG[2], notes: ['w18/4.1/p12/s3', 'w18/4.1/p13/s2-s3'], idea: '4 ebakortz hirukian; erpinean ebakortz zuloa.', text: 'Hirukian 4 ebakortzak txertatzen dira (horregatik "4 ebakortzen hezur maxilarraren atala"), eta erpinean ebakortz zuloa dago.', focus: ['ebakortzak', 'ebakortz-zuloa'], view: '3d' },
      { at: S_SEG[3], notes: ['w18/4.1/p14/s1-s3'], idea: 'Plakak erdian fusionatu; errafea ebakortz zuloan gelditzen da.', text: 'Bi aldeetako luzapen maxilarrak (aho sabaiaren plakak edo gandorrak) erdirantz doaz eta fusionatzen dira. Jostura-lerroa errafea da, eta ez da ebakortzetaraino heltzen: ebakortz zuloraino bakarrik. Hiru atalek aho sabai gogorra eratzen dute.', focus: ['aho-sabaiko-errafea', 'aho-sabai-gandorrak'], exam: 'Errafea ebakortz zuloan gelditzen da.', view: '3d' },
    ],
    structures: ['luzapen-maxilarra', 'maxilar-arteko-segmentua', 'hasierako-aho-sabaia', 'ebakortzak', 'ebakortz-zuloa', 'aho-sabai-gandorrak', 'aho-sabaiko-errafea'],
    keyPoints: ['Maxilar arteko segmentua → hasierako aho sabaia (hirukia).', '4 ebakortzak hirukian; erpinean ebakortz zuloa.', 'Errafea ebakortz zuloraino bakarrik.', 'Aho sabai gogorra: 2 plakak + hasierako aho sabaia.'],
  },
  {
    id: 'aho-sabai-gandorrak',
    day: '6.–9. asteak',
    dayRange: [36, 63],
    title: 'Aho sabaiko gandorrak',
    subtitle: 'Mihiaren alboan, mihiaren gainean, erdian fusionatuta',
    intro: 'Gandorrak prozesu maxilarretatik ateratzen dira. 6. astean mihiaren alboetan daude, 7. astean horizontal bihurtzen dira mihia jaistean, eta 9. astean erdian fusionatzen dira.',
    duration: 42,
    source: src('4.1. Sudur plakodak eta aho sabaia'),
    views: [v(Shelves18, 'Ebakidura koronala', CORONAL, COR)],
    beats: [
      { at: S_SH[0], notes: ['w18/4.1/p15/s1-s3'], recall: ['luzapen-maxilarra'], idea: '6. astea: gandorrak beherantz, mihiaren alboetan, mihia gorago.', text: 'Aho sabaiaren gandorrak prozesu maxilarretatik ateratzen dira eta erdirantz doaz. Baina 6. astean mihiaren azpikaldean daude: beherantz, eta mihia gandorrak baino gorago.', focus: ['aho-sabai-gandorrak', 'mihia'], exam: '6. astean gandorrak beherantz, mihia gorago.', view: '3d' },
      { at: S_SH[1], notes: ['w18/4.1/p15/s5-s7'], idea: '7. astea: mihia behera, gandorrak horizontal.', text: '7. astean gandorrak horizontalizatzen dira eta mihiaren goialdean kokatzen dira, mihia behera baitoa. Aldi berean goitik trenkada bat hasten da, hezur etmoidetik.', focus: ['aho-sabai-gandorrak', 'mihia', 'sudur-trenkada'], view: '3d' },
      { at: S_SH[2], notes: ['w18/4.1/p15/s8'], idea: '9. astea: erdian fusionatu.', text: '9. astean bi gandor horizontalak erdikaldean fusionatzen dira, aho sabaia eratzeko, eta hasierako aho sabaiarekin batzen dira.', focus: ['aho-sabai-gandorrak'], exam: '9. astean fusionatzen dira.', view: '3d' },
      { at: S_SH[3], notes: ['w18/4.1/p15/s4'], idea: 'Behetik: 3 atal, hasierako aho sabaia + 2 plakak.', text: 'Azkenean aho sabaia eratzeko 3 egitura lotzen dira josturen bidez: hasierako aho sabaia eta aho sabaiaren 2 plakak (luzakin maxilarren luzapenak).', focus: ['hasierako-aho-sabaia', 'aho-sabai-gandorrak', 'aho-sabaiko-errafea'], view: '3d' },
      { at: S_SH[4], notes: ['w18/4.1/p15/s9-s10'], idea: 'Hezurrezko aho sabaia.', text: 'Horrela eratzen da hezurrezko aho sabaia. Atzekaldean 3 hezurtxo palatino ditu (hau ez da garrantzitsua).', focus: ['aho-sabai-gogorra'], view: '3d' },
    ],
    structures: ['aho-sabai-gandorrak', 'mihia', 'sudur-barrunbea', 'aho-barrunbea', 'sudur-trenkada', 'hasierako-aho-sabaia', 'aho-sabaiko-errafea', 'ebakortz-zuloa', 'aho-sabai-gogorra'],
    keyPoints: ['6. astea: gandorrak beherantz, mihiaren alboan.', '7. astea: mihia behera, gandorrak horizontal.', '9. astea: erdian fusionatu.', '3 egitura: hasierako aho sabaia + 2 plakak.'],
  },
  {
    id: 'sudur-trenkada-korneteak',
    day: '10.–12. asteak',
    dayRange: [64, 84],
    title: 'Sudur trenkada eta korneteak',
    subtitle: 'Trenkada aho sabaira heltzen da; 3 kornete bikote',
    intro: 'Sudur barrunbean goitik behera trenkada bat garatzen da, etmoidetik, eta 10.–12. asteetan aho sabaira heltzen da. Alboko hormek 3 kornete bikote eratzen dituzte.',
    duration: 30,
    source: src('4.1. Sudur plakodak eta aho sabaia'),
    views: [v(Septum18, 'Ebakidura koronala', CORONAL, COR)],
    beats: [
      { at: S_SP[0], notes: ['w18/4.1/p15/s11', 'w18/4.1/p15/s14-s16'], idea: 'Trenkada etmoidetik behera; 10.–12. asteetan aho sabaiarekin fusionatu.', text: 'Sudur barrunbeak ere garatzen doaz. Goitik behera trenkada bat garatzen da (etmoide hezurretik dator) eta bi sudur barrunbe eratzen ditu. 10.–12. asteetarako aho sabaira heldu eta fusionatzen da.', focus: ['sudur-trenkada'], exam: '10.–12. asteetan trenkada eta aho sabaia fusionatzen dira.', view: '3d' },
      { at: S_SP[1], notes: ['w18/4.1/p15/s17-s20', 'w18/4.1/p16/s1-s2', 'w18/4.1/p17/s1'], idea: 'Korneteak: goikoa eta tartekoa etmoidetik; behekoa hezur propioa.', text: 'Trenkada leuna da; alboko hormak bihurriak: korneteak edo maskorrak, 3 bikote. Goikoa eta tartekoa etmoide hezurraren atalak dira. Behekoa hezur propioa da, soltea.', focus: ['goiko-kornetea', 'tarteko-kornetea', 'beheko-kornetea'], exam: 'Beheko kornetea hezur propioa da; goikoa eta tartekoa etmoidearenak.', view: '3d' },
      { at: S_SP[2], notes: ['w18/4.1/p15/s12-s13'], idea: 'Aurrekaldea kartilagoz, atzekaldea hezurrez.', text: 'Sudurraren aurreko aldea kartilagoz osatuta dago, atzeko aldea hezurrez. Beraz, sudur barrunbeak barnerago daude.', focus: ['sudur-barrunbea', 'sudur-trenkada'], view: '3d' },
    ],
    structures: ['sudur-trenkada', 'sudur-barrunbea', 'korneteak', 'goiko-kornetea', 'tarteko-kornetea', 'beheko-kornetea', 'aho-sabai-gandorrak'],
    keyPoints: ['Trenkada etmoidetik behera; 10.–12. asteetan aho sabaiarekin fusionatu.', '3 kornete bikote.', 'Goikoa eta tartekoa: etmoidea. Behekoa: hezur propioa.'],
  },
  {
    id: 'aho-sabai-akatsak',
    day: 'Garapenaren akatsak',
    dayRange: [63, 84],
    title: 'Aho sabai gogorra, biguna eta akatsak',
    subtitle: 'Bi atal, bi hutsegite modu',
    intro: 'Aurreko atala hezurrezkoa da eta atzekoa biguna. Fusioak huts egiten badu: erbi-ezpaina edo aho-sabai arraila.',
    duration: 32,
    source: src('4.1. Sudur plakodak eta aho sabaia'),
    views: [v(Defects18, 'Aho sabaia behetik', BELOW, UND)],
    beats: [
      { at: S_DEF[0], notes: ['w18/4.1/p18/s1-s5'], idea: 'Hezurrezkoa aurrean, biguna atzean.', text: 'Aho sabai osoa ez dago hezurtuta. Aurreko atala hezurrezkoa da, atzekoa biguna. Atzekoa ez da inoiz hezurtuko, hezurtzea ez baita ubularaino (kanpanillaraino) heltzen.', focus: ['aho-sabai-gogorra', 'aho-sabai-biguna', 'ubula'], exam: 'Atzeko aldea ez da inoiz hezurtzen.', view: '3d' },
      { at: S_DEF[1], notes: ['w18/4.1/p19/s1-s3', 'w18/4.1/p20/s1'], idea: 'Erbi-ezpaina, alde batekoa.', text: 'Aho sabaia ondo fusionatzen ez bada, anomaliak gerta daitezke, kanpoko egiturei ere eragin diezaieketenak. Denak kirurgiaz konpon daitezke. Batzuetan aho sabaia ondo dago eta arazoa kanpoan bakarrik: erbi-ezpaina.', focus: ['erbi-ezpaina', 'goiko-ezpaina'], view: '3d' },
      { at: S_DEF[2], notes: ['w18/4.1/p20/s1'], idea: 'Edo aldebikoa.', text: 'Erbi-ezpaina alde batekoa edo aldebikoa izan daiteke.', focus: ['erbi-ezpaina'], view: '3d' },
      { at: S_DEF[3], notes: ['w18/4.1/p19/s4', 'w18/4.1/p20/s2-s3'], idea: 'Aho-sabai arraila: janaria sudurrera.', text: 'Beste batzuetan aho sabaia bera ez da ondo fusionatzen: aho-sabai arraila. Jateko arazoak eragiten ditu, janaria sudur barrunbeetara pasa baitaiteke.', focus: ['aho-sabai-arraila'], view: '3d' },
    ],
    structures: ['aho-sabai-gogorra', 'aho-sabai-biguna', 'ubula', 'goiko-ezpaina', 'erbi-ezpaina', 'aho-sabai-arraila', 'aho-sabai-gandorrak'],
    keyPoints: ['Bi atal: hezurrezkoa (aurrean) eta biguna (atzean).', 'Biguna ez da inoiz hezurtzen.', 'Erbi-ezpaina: alde batekoa edo aldebikoa.', 'Aho-sabai arraila: janaria sudurrera.'],
  },
  {
    id: 'koanak',
    day: '5.–7. asteak',
    dayRange: [29, 49],
    title: 'Koanak',
    subtitle: 'Hobitxoa, mintz bukonasala, koana',
    intro: 'Sudur barrunbea eta ahoa faringean komunikatzen dira, koanen bidez. Sudur-hobitxoa sakontzen da, mintz bukonasala 7. astean apurtzen da, eta koana atzerantz mugitzen da.',
    duration: 36,
    source: src('4.1. Sudur plakodak eta aho sabaia'),
    views: [v(Choana18, 'Ebakidura sagitala', SAGITTAL, SAG)],
    beats: [
      { at: S_CH[0], notes: ['w18/4.1/p21/s1-s4'], recall: ['sudur-hobitxoa'], idea: 'Sudur zuloak kanpoan, hobitxotik; sakontzen doa.', text: 'Aho sabaia eta trenkada eratu ostean, aho sabaiaren eta sudur barrunbeen arteko komunikazioa faringe mailan ematen da. Lehenengo kanpoan sudur zuloak eratzen dira, sudur hobitxotik; hobitxoa gero eta sakonagoa da.', focus: ['sudur-hobitxoa'], view: '3d' },
      { at: S_CH[1], notes: ['w18/4.1/p21/s5'], idea: '6. astea: mintz bukonasala.', text: '6. astean sakonunearen eta ahoaren artean mintz fin bat dago: mintz bukonasala.', focus: ['mintz-bukonasala'], exam: 'Mintz bukonasala 6. astean; 7. astean apurtzen da.', view: '3d' },
      { at: S_CH[2], notes: ['w18/4.1/p21/s6-s7'], idea: '7. astea: mintza apurtu, hasierako koana.', text: '7. astean mintza apurtu eta desagertzen da, eta hasierako komunikabidea irekitzen da: hasierako koana.', focus: ['koana'], view: '3d' },
      { at: S_CH[3], notes: ['w18/4.1/p21/s8', 'w18/4.1/p22/s1', 'w18/4.1/p23/s1-s2'], idea: '4 zulo: 2 narina, 2 koana.', text: 'Sudurrean 4 zulo nagusi ditugu: 2 kanpoan, narinak, eta 2 kraneoaren barnean, koanak.', focus: ['narina', 'koana'], view: '3d' },
      { at: S_CH[4], notes: ['w18/4.1/p23/s3-s9'], idea: 'Koanak aurrean hasi, gero atzera, faringera.', text: 'Hasieran koanak aurrean daude, ahotik gertu, baina komunikazioa faringean dago: atzerantz mugitzen dira. Faringean nasofaringea eta ahofaringea koanen bidez lotzen dira. Horregatik janariaren usaina barnetik ere heltzen da sudurrera.', focus: ['koana'], exam: 'Koanak hasieran aurrean, gero atzerantz.', view: '3d' },
    ],
    structures: ['sudur-hobitxoa', 'sudur-barrunbea', 'aho-barrunbea', 'mihia', 'hasierako-aho-sabaia', 'mintz-bukonasala', 'koana', 'narina', 'aho-sabai-gandorrak'],
    keyPoints: ['5. astea: hobitxoa. 6.: mintz bukonasala. 7.: apurtu, hasierako koana.', '4 zulo: 2 narina (kanpoan), 2 koana (barnean).', 'Koanak aurrean hasi, gero atzera, faringera.'],
  },
];

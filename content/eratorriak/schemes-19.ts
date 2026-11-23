import type { MigrationTopic, MNode } from '../migrations';

/**
 * Topic 19 (nerbio sistema), from the notes of 2026-11-23 (11 sections), in their order and from their text only.
 * These notes have no blue (not taught) text. Long pathways are split under step headings so each map stays
 * readable on a tablet.
 */
const n = (id: string, kids?: MNode[], extra?: Omit<MNode, 'id' | 'kids'>): MNode => ({ id, kids, ...extra });
const l = (label: string, kids?: MNode[], extra?: Omit<MNode, 'label' | 'kids'>): MNode => ({ label, kids, ...extra });
const branch = (id: string, via: string, kids?: MNode[], note?: string) => n(id, kids, { via, note });
const leaf = (label: string, via: string, kids?: MNode[], note?: string) => l(label, kids, { via, note });
/** A heading that sorts the branches below it (steps of a pathway, kinds of derivative), not a structure. */
const g = (label: string, kids: MNode[]): MNode => ({ label, kids, group: true });

export const SCHEMES_19: MigrationTopic = {
  week: 19,
  short: 'Nerbio sistema',
  flows: [
    {
      id: 'mozketak-19',
      title: 'Mozketak eta ikuspegiak: ornomuina bertikala, burmuina horizontala',
      lead: 'Nerbio sisteman orokorrean mozketa horizontala erabiltzen da; ornomuinean, berriz, zeharkakoak. Garuna horizontalizatuta dago eta ornomuina bertikala.',
      stage: 'mozketak-ardatzak',
      pitfalls: [
        'Garunean dortsala ez da atzekoa, goikoa baizik; bentrala behekoa da.',
        'Ornomuinean (bertikala) bentrala = aurrekoa eta dortsala = atzekoa.',
        'Garunaren aurrekaldea rostrala da (frontala ere bai); atzekaldea okzipitala.',
      ],
      roots: [
        l('Mozketa motak', [
          leaf('Horizontala', 'zoruarekin horizontalki'),
          leaf('Koronala', 'ezkerretik eskuinera'),
          leaf('Sagitala', 'aurretik atzera'),
        ]),
        n('ornomuina', [
          leaf('Dortsala = atzekoa', 'bertikalki dagoelako'),
          leaf('Bentrala = aurrekoa', 'bertikalki dagoelako'),
        ], { note: 'bertikala · zeharkako mozketak' }),
        n('entzefaloa', [
          leaf('Dortsala = goikoa', 'horizontalizatuta'),
          leaf('Bentrala = behekoa', 'horizontalizatuta'),
          leaf('Rostrala = aurrekaldea', 'frontala ere bai'),
          leaf('Okzipitala = atzekaldea', 'garunean'),
        ], { note: 'garuna · horizontala' }),
      ],
    },
    {
      id: 'kokapen-sailkapena-19',
      title: 'Kokapenaren araberako sailkapena: zentrala eta periferikoa',
      lead: 'Hezurrez babestuta dagoena erdiko nerbio sistema da; hortik kanporantz ateratzen diren nerbio guztiak, periferikoa.',
      stage: 'zentrala-periferikoa',
      pitfalls: [
        'Entzefaloa eta ornomuina konektatuta daude: egitura jarraiak dira.',
        'Zentralean eta periferikoan, bietan daude somatikoa eta autonomoa.',
      ],
      roots: [
        n('nerbio-sistema-zentrala', [
          branch('entzefaloa', 'garezurraren barruan'),
          branch('ornomuina', 'bizkarrezurraren barruan', undefined, 'bizkar muina'),
        ], { note: 'hezurrez babestua · gorputzaren erdian' }),
        n('nerbio-sistema-periferikoa', [
          leaf('Sare zerbikala', 'lepokoa'),
          leaf('Sare brakiala', 'besokoa'),
          leaf('Sare lunbarra eta sakroa', 'lunbar eta sakro mailan'),
        ], { note: 'kanporantz ateratzen diren nerbio guztiak · sareak' }),
      ],
    },
    {
      id: 'sailkapen-funtzionala-19',
      title: 'Sailkapen funtzionala: somatikoa eta autonomoa',
      lead: 'Somatikoa borondatezkoa da. Autonomoak (begetatiboak) ez borondatezko mugimenduak eragiten ditu, bi sistema konplementariorekin.',
      stage: 'somatikoa-autonomoa',
      pitfalls: [
        'Bikote kraneal baten nerbioak osagai autonomoa badu, osagai hori beti parasinpatikoa da (adib. bagoa eta faziala).',
        'Parasinpatikoaren beheko muturrean neuronak ornomuinean bertan; goiko muturrean garezurreko nerbioen gongoiletan.',
        'Aurpegiko inerbazio parasinpatikoa ia guztiz guruinetara doa; 3. bikotetik datorrena izan ezik (begi-ninia dilatatzeko, apunteen arabera).',
      ],
      roots: [
        l('Nerbio sistema somatikoa', [leaf('Borondatezko mugimenduak', 'bideratu')]),
        n('nerbio-sistema-begetatiboa', [
          branch('sistema-sinpatikoa', 'estresaren sistema', [
            leaf('Bihotza', 'erritmoa arindu'),
            leaf('Arnasa', 'asko eta arin'),
            leaf('Izerdi guruinak', 'aktibatu'),
          ], 'T1–T12 (T1–L2 gutxi gorabehera)'),
          branch('sistema-parasinpatikoa', 'lasaitasunera: egoera basalera itzuli', [
            leaf('Bihotza', 'erritmoa jaitsi'),
            leaf('Esfinterrak', 'zabaldu'),
            branch('buruko-gongoil-parasinpatikoak', 'goiko muturra: garezurreko nerbioen gongoiletan', [
              branch('malko-guruina', 'aurpegiko guruinak'),
              branch('listu-guruinak', 'aurpegiko guruinak'),
            ]),
          ], 'S2–S4 eta entzefaloan · bi muturretan'),
          branch('errai-sareak', 'erraien inguruan', undefined, 'sinpatikoak eta parasinpatikoak'),
        ], { note: 'autonomoa · ez borondatezkoa: erraiak, esfinterrak, peristaltismoa' }),
      ],
    },
    {
      id: 'ornomuin-orokortasunak-19',
      title: 'Ornomuina: gai grisa, gai zuria, sustraiak eta gongoila',
      lead: 'Ornomuinean beti: barnean gai grisa H forman (somak), kanpoan gai zuria (axoiak). Sustraitxoak elkartu eta sustraiak; atzeko sustraian gongoila, neurona bipolarrekin.',
      stage: 'gai-grisa-zuria',
      pitfalls: [
        'Aurreko adarrak (bentralak) motorrak; atzeko adarrak (dortsalak) sentsitiboak; tartean interneuronak.',
        'Gongoila atzeko sustraian dago: neurona bipolarrak, luzapen zentripetoa (ornomuinera) eta zentrifugoa (periferiara).',
        'Gai zurian goranzko bideak sentsitiboak dira; beheranzkoak motorrak.',
      ],
      roots: [
        n('ornomuina', [
          branch('gai-grisa', 'barnean · H forma', [
            leaf('2 aurreko adar', 'bentralak · motorrak'),
            leaf('2 atzeko adar', 'dortsalak · sentsitiboak'),
            branch('interneurona', 'aurreko eta atzeko adarrak lotu'),
          ], 'neuronen somak'),
          branch('gai-zuria', 'kanpoan · axoiak', [
            branch('goranzko-bideak', 'sentsitiboak'),
            branch('beheranzko-bideak', 'motorrak'),
          ]),
          branch('sustraitxoak', 'ornomuinetik atera', [
            branch('atzeko-sustraia', 'atzekoak elkartu', [
              branch('gongoil-errakideoak', 'atzeko sustraian', [
                leaf('Luzapen zentripetoa', 'ornomuinerantz'),
                leaf('Luzapen zentrifugoa', 'periferiarantz'),
              ], 'neurona bipolarrak'),
            ]),
            branch('aurreko-sustraia', 'aurrekoak elkartu'),
          ]),
        ]),
      ],
    },
    {
      id: 'sentsibilitatea-erreflexua-19',
      title: 'Sentsibilitatea eta arku erreflexua',
      lead: 'Sentsazioa larruazaletik gongoilaren somara eta luzapen zentraletik ornomuinera sartzen da, beti atzeko sustraietatik. Burmuinera iritsi gabe erantzuten bada: arku erreflexua.',
      stage: 'aktu-erreflexua',
      pitfalls: [
        'Luzapen periferikoa (zentrifugoa) larruazalerantz doa, baina informazioa kontrako norantzan dabil: larruazaletik somara.',
        'Informazio sentsitiboa beti atzeko sustraietatik eta sustraitxoetatik sartzen da.',
        'Nerbio espinalak mistoak dira: axoi sentsitiboak eta motorrak.',
        'Arku erreflexua: mugimendu automatikoa; ezagunena erreflexu rotulianoa.',
      ],
      roots: [
        l('Arku erreflexua', [
          g('Gorantz', [
            leaf('Larruazaleko hartzaileak', '1 · beroa, mina hauteman'),
            branch('neurona-sentsitiboa', '2 · luzapen zentrifugotik somara, gongoilean'),
            branch('atzeko-sustraia', '3 · luzapen zentripetotik ornomuinera'),
          ]),
          g('Ornomuinean', [
            branch('interneurona', '4 · sinapsia'),
            branch('motoneurona', '5 · beste sinapsia'),
          ]),
          g('Erantzuna', [
            branch('aurreko-sustraia', '6 · axoiak irten'),
            leaf('Muskulua', '7 · agindua', undefined, 'adib. erreflexu rotulianoa'),
          ]),
        ], { note: 'burmuinera iritsi gabe' }),
      ],
    },
    {
      id: 'borondatezko-bidea-19',
      title: 'Borondatezko mugimendua: kortex sentsitibotik kortex motorrera',
      lead: 'Borondatezkoa bada, informazio sentsitiboa burmuineraino eraman behar da: bertan prozesatu eta erantzun motorra agintzen da (nerbio sistema somatikoa).',
      stage: 'borondatezko-mugimenduak',
      pitfalls: [
        'Batzuetan gongoileko neuronaren axoia zuzenean burmuinera heltzen da.',
        'Kortex sentsitiboan konturatzen gara zer sentitzen dugun; gero kortex motorrera pasatzen da.',
        'Agindua beheranzko bideetatik jaisten da (batzuetan sinapsiak eginez).',
      ],
      roots: [
        l('Borondatezko mugimendua', [
          g('Gorantz', [
            branch('neurona-sentsitiboa', '1 · luzapen zentrala ornomuinera'),
            branch('goranzko-bideak', '2 · sinapsia; axoiak garunera', undefined, 'edo zuzenean burmuinera'),
            branch('kortex-sentsitiboa', '3 · hainbat sinapsiren ondoren', undefined, 'konturatu'),
          ]),
          g('Beherantz', [
            branch('kortex-motorra', '4 · informazioa jaso'),
            branch('beheranzko-bideak', '5 · axoia jaitsi'),
            branch('motoneurona', '6 · helmugan'),
            leaf('Muskulua', '7 · mugimendua'),
          ]),
        ], { note: 'nerbio sistema somatikoa' }),
      ],
    },
    {
      id: 'mugimendu-automatikoak-19',
      title: 'Mugimendu automatikoak eta arinak',
      lead: 'Ondo ikasitako mugimenduak automatikoki egiten ditugu (bizikleta, gidatu): zerebeloak hartzen du parte. Mugimendu arinak ikasiak dira, baina oso arin egiten dira.',
      stage: 'mugimendu-automatikoak',
      pitfalls: [
        'Mugimendu automatikoak muskulu somatikoek eragindakoak dira, ez autonomoak.',
        'Haurrek buruan hartzen dituzte kolpeak eskuak jartzen ikasi arte; mugimendu arinetan ere zirkuitu osoa betetzen da.',
      ],
      roots: [
        l('Mugimendu automatikoak', [
          branch('garuntxoa', 'parte hartu', undefined, 'zerebeloa'),
          leaf('Adibideak', 'bizikletan ibili, gidatu'),
        ], { note: 'ondo ikasiak · muskulu somatikoak' }),
        l('Mugimendu arinak', [
          leaf('Haurrak erortzean', 'burua handia eta pisutsua: buruan kolpea'),
          leaf('Eskuak jartzen ikasi', 'mugimendu arina', undefined, 'zirkuitu osoa betetzen da'),
        ]),
      ],
    },
    {
      id: 'plaka-neurala-19',
      title: 'Plaka neuraletik hodi neuralera: neuroporoak',
      lead: 'Plaka zapalean bi goragune sortzen dira; muturrak (gandor neuralak) erdian fusionatu arte gerturatzen dira. Fusioa erdian hasi eta neuroporoak uzten ditu.',
      stage: 'plaka-neurala',
      pitfalls: [
        'Aurreko neuroporoa lehenago ixten da: 25. egunean; atzekoa 27./28. egunean.',
        'Fusioa erdi mailan hasten da, ez muturretan.',
      ],
      roots: [
        n('plaka-neurala', [
          branch('hodi-neurala', 'goraguneen muturrak erdian fusionatu', [
            branch('neuroporo-kraneala', 'aurrekoa · 25. egunean itxi'),
            branch('neuroporo-kaudala', 'atzekoa · 27./28. egunean itxi'),
          ], 'fusioa erdian hasi'),
          branch('gandor-neurala', 'tolestean muturretan bereizi'),
        ]),
      ],
    },
    {
      id: 'gandor-neuraleko-eratorriak-19',
      title: 'Gandor neuralaren eratorriak',
      lead: 'Hasieran hodiaren (ornomuinaren) eta ektodermoaren artean; gero zelulak askatu eta bereizi egiten dira, egitura desberdinak eratuz.',
      stage: 'gandor-eratorriak',
      pitfalls: [
        'Gongoil GUZTIETAKO neuronak gandorretik datoz, katean edo sarean egon.',
        'Giltzurrun gaineko guruinean muineko zelula kromafinak bakarrik (kortexa ez).',
        'Meningeetatik pia materra eta araknoidea bakarrik; dura materra ez.',
        'Mielina: periferikoan Schwann zelulek; zentralean oligodendrozitoek.',
        'Jaioberrien malformazio kongenitoen herena gandor neuraleko akatsengatik.',
      ],
      roots: [
        n('gandor-neurala', [
          g('Gongoilak (neuronak)', [
            branch('gongoil-errakideoak', 'espinalak'),
            branch('gongoil-sinpatikoak', 'sinpatikoak'),
            branch('gongoil-parasinpatikoak', 'parasinpatikoak'),
          ]),
          g('Beste eratorriak', [
            n('zelula-kromafinak', undefined, { via: 'giltzurrun gaineko muinean', move: true }),
            leaf('1., 2. eta 3. arkuetako hezurrak eta kartilagoak', 'faringe-arkuetan', undefined, 'anomalia → aurpegiko hezurrik ez'),
            branch('pia-materra', 'meningea'),
            branch('araknoidesa', 'meningea'),
            branch('schwann-zelulak', 'mielina, periferikoan'),
            n('melanozitoak', undefined, { via: 'larruazala eta ilea koloreztatu', move: true }),
          ]),
        ], { note: 'anomaliak: malformazio kongenitoen herena' }),
      ],
    },
    {
      id: 'ornomuinaren-geruzak-19',
      title: 'Ornomuinaren geruzak: barnetik kanpora',
      lead: 'Ependimoa hasieran zabala, gero estu eta borobila. Barneko mintz mugatzaileari lotuta neuroepitelioa: neuroblastoak, eta hauetatik neuronak.',
      stage: 'ornomuin-geruzak',
      pitfalls: [
        'Manto geruza → gai grisa (somak); geruza marginala → gai zuria (axoiak).',
        'Kanpoko mintz mugatzailea pia zelulak dira: gero pia materra.',
        'Neuroepitelioan geratzen diren zelulek ependimo geruza eratzen dute.',
      ],
      roots: [
        n('barneko-mintz-mugatzailea', [
          branch('neuroepitelioa', 'lotuta, kanporantz begira', [
            branch('neuroblastoak', 'bereizi', undefined, 'neuronak sortu'),
            branch('ependimo-geruza', 'geratzen diren zelulak'),
          ]),
        ], { note: 'ependimoa mugatu' }),
        n('manto-geruza', [branch('gai-grisa', 'bihurtu')], { note: 'neuroblastoen somak' }),
        n('geruza-marginala', [branch('gai-zuria', 'bihurtu')], { note: 'axoiak' }),
        n('kanpoko-mintz-mugatzailea', [branch('pia-materra', 'bihurtu')], { note: 'pia zelulak' }),
      ],
    },
    {
      id: 'ornomuinaren-plakak-19',
      title: 'Ornomuinaren plakak: dortsala sentsitiboa, bentrala motorra',
      lead: 'Bi plaka nagusi, ildo mugatzaileak banatuta; sabai eta zoru plaketan axoiak bakarrik. Helduan izenak aldatzen dira: eremu sentsitiboa eta motorra.',
      stage: 'ornomuin-plakak',
      pitfalls: [
        'Ildo mugatzailea muga birtuala da, ez anatomikoa.',
        'Sabai eta zoru plaketan ez dago manto geruzarik ez gai grisik: geruza marginala bakarrik.',
        'Alboko adarrak (neurona sinpatikoak) T1/T2–L2 artean: mozketan ikusten badira, maila hori da.',
        'Ornomuin garatuan bi ildo: aurrekoa askoz sakonagoa.',
      ],
      roots: [
        n('hodi-neurala', [
          branch('sabai-plaka', 'dortsalaren muturrean', undefined, 'axoiak bakarrik'),
          branch('hegal-plaka', 'dortsala · sentsitiboa', [branch('eremu-sentsitiboa', 'helduan')], 'atzeko sustraiak'),
          branch('ildo-mugatzailea', 'tartean · birtuala'),
          branch('oinalde-plaka', 'bentrala · motorra', [
            branch('eremu-motorra', 'helduan'),
            branch('alboko-adarra', 'T1/T2–L2', undefined, 'neurona sinpatikoak'),
          ], 'aurreko sustraiak'),
          branch('zoru-plaka', 'bentralaren muturrean', undefined, 'axoiak bakarrik'),
        ]),
      ],
    },
    {
      id: 'ornomuinaren-igoera-19',
      title: 'Bizkarrezurra ornomuina baino gehiago hazten da',
      lead: 'Hasieran tamaina berekoak; bizkarrezurra askoz azkarrago hazten da. 3. hilabetean nerbio bakoitza bere pareko zulotik; helduan beherago dauden zuloetatik.',
      stage: 'ornomuinaren-igoera',
      pitfalls: [
        'Ornomuina L1/L2 inguruan amaitzen da; bizkarrezurra sakroraino doa.',
        'L1–L2tik behera ez dago ornomuin trinkorik: zaldi buztana.',
        'Filum terminale pia materraren luzapena da.',
      ],
      roots: [
        n('ornomuina', [
          leaf('Loditzeak', 'lepoan eta amaiera toraziko/lunbarrean'),
          branch('ornomuinaren-konoa', 'amaiera, kono forma', [
            branch('zuntz-terminala', 'pia materraren luzapena', undefined, 'filum terminale'),
          ]),
          branch('zaldi-buztana', 'L1/L2tik behera', undefined, 'nerbio multzoak, lotu gabe'),
          branch('nerbio-espinalak', 'zuloak beherantz', undefined, 'helduan beherago dauden zuloetatik'),
          branch('poltsa-durala', 'dura materraren zakua', undefined, 'likido zefalorrakideoa barnean'),
        ], { note: 'L1/L2 inguruan amaitu' }),
      ],
    },
    {
      id: 'puntzioa-epidurala-19',
      title: 'Likido zefalorrakideoaren lagina eta anestesia epidurala',
      lead: 'Biak zaldi buztanaren eremuan: orratza likidoraino iritsi behar da ornomuina lesionatu gabe; nerbioak apartatu egiten dira.',
      stage: 'puntzioa-epidurala',
      pitfalls: [
        'Erdiko nerbio sistemako infekzioak likido zefalorrakideoan ikusten dira.',
        'Eremu epidurala hezurraren eta dura materraren artean (odol hodiak, gantza). Burmuinean EZ dago.',
      ],
      roots: [
        l('Lagina', [
          branch('zaldi-buztana', 'orratza sartu', undefined, 'nerbioak apartatu: lesiorik ez'),
          branch('likido-zefalorrakideoa', 'atera', undefined, 'infekzioak'),
        ]),
        n('anestesia-epidurala', [
          branch('eremu-epidurala', 'hezurraren eta dura materraren artean', undefined, 'odol hodiak, gantza'),
        ], { note: 'zaldi buztanean' }),
      ],
    },
    {
      id: 'garun-xixkuen-eratorriak-19',
      title: 'Burmuina: 3 xixkutik 5era eta haien eratorriak',
      lead: 'Lepotik kaudalera hodia itxi eta ornomuina da. Alde kranealean hodia zabaldu eta 3 xixku sortzen ditu; hauetatik beste batzuk.',
      stage: 'hiru-xixkuak',
      pitfalls: [
        'Mesentzefaloa BETI berdin geratzen da.',
        'Dientzefaloa, dortsaletik bentralera: epitalamoa, talamoa, hipotalamoa, azpitalamoa.',
        'Metentzefaloa: zubia bentralean, garuntxoa dortsalean. Mielentzefaloa: erraboila.',
      ],
      roots: [
        n('prosentzefaloa', [
          branch('telentzefaloa', 'luzatu eta dientzefaloa estali', [branch('garun-hemisferioak', 'atera')]),
          branch('dientzefaloa', 'erdian', [
            branch('epitalamoa', 'dortsalean', undefined, 'guruin pineala'),
            branch('talamoa', 'garrantzitsuena'),
            branch('hipotalamoa', 'hormonak'),
            leaf('Azpitalamoa', 'garrantzi txikiena'),
          ]),
        ], { note: '1 · aurrekoa' }),
        n('mesentzefaloa', undefined, { note: '2 · tartekoa · BETI berdin' }),
        n('erronbentzefaloa', [
          branch('metentzefaloa', 'banatu', [
            branch('zubia', 'bentralean'),
            branch('garuntxoa', 'dortsalean', undefined, 'zerebeloa'),
          ]),
          branch('mielentzefaloa', 'banatu', [branch('erraboila', 'burmuina eta ornomuina lotu')]),
        ], { note: '3 · azkena, erronbo forma' }),
      ],
    },
    {
      id: 'xixkuen-tolespenak-19',
      title: 'Bost xixkuak eta tolespenak',
      lead: '28. egunean enbrioia tolesten hasten da: bi tolespen. 5. astean bost xixku; gero zubi tolespena.',
      stage: 'bost-xixkuak',
      pitfalls: [
        'Hasieran dientzefaloa handiagoa da; gero telentzefaloa askoz handiagoa.',
        'Istmoa mesentzefaloaren eta metentzefaloaren arteko estutasuna da.',
        'Tolespen zefalikoa eta zerbikala mantendu egiten dira (mesentzefaloan eta erraboilan).',
      ],
      roots: [
        l('28. eguna', [
          branch('tolespen-zefalikoa', 'mesentzefaloaren inguruan'),
          branch('tolespen-zerbikala', 'erronbentzefaloaren eta ornomuinaren mugan', undefined, 'lepoko tolespena'),
        ]),
        l('5. astea', [
          leaf('Telentzefaloa eta dientzefaloa', 'prosentzefalotik', undefined, 'hasieran dientzefaloa handiagoa'),
          leaf('Metentzefaloa eta mielentzefaloa', 'erronbentzefalotik', undefined, 'zerebeloaren irtengunea'),
          branch('istmoa-entzefaloa', 'mesen- eta metentzefaloaren artean estutu'),
          branch('zubi-tolespena', 'geroago: hemen zubia'),
        ]),
      ],
    },
    {
      id: 'bentrikuluak-19',
      title: 'Sistema bentrikularra: xixku bakoitzaren barrunbea',
      lead: 'Ornomuinean hodi forma ez da aldatzen: ependimoa. Garunean xixkuaren barrunbea zabaldu eta bentrikulua deitzen da.',
      stage: 'bentrikuluak',
      pitfalls: [
        'Ez esan I. edo II. bentrikulua: ALBOKOAK dira.',
        'Alboko bentrikuluak tamainaz nagusienak dira.',
        'Mesentzefaloan ez dago bentrikulurik: pareta lodia eta hodia estu, akueduktoa (Silvio).',
      ],
      roots: [
        n('telentzefaloa', [branch('alboko-bentrikuluak', 'ezkerra eta eskuina', undefined, 'handienak')]),
        n('dientzefaloa', [branch('hirugarren-bentrikulua', 'barnean')]),
        n('mesentzefaloa', [branch('garun-akueduktoa', 'hodia estutu', undefined, 'Silvio akueduktoa')]),
        n('erronbentzefaloa', [branch('laugarren-bentrikulua', 'erronbo forma mantendu')]),
        n('ornomuina', [branch('hodi-ependimarioa', 'hodi forma mantendu', undefined, 'ependimoa')]),
      ],
    },
    {
      id: 'likido-zefalorrakideoa-19',
      title: 'Likido zefalorrakideoa: ekoizpena eta bidea',
      lead: 'Likido amortiguatzailea: 5. astean hasi, etengabe. Sare koroideek (arteriolak) ekoizten dute bentrikuluen sabaian; hezurrak eremua mugatzen duenez, xurgatu behar da.',
      stage: 'likido-zefalorrakideoa',
      pitfalls: [
        'IV. bentrikuluan ere gehiago ekoizten da.',
        'IV. bentrikulutik: parte bat ependimotik; bestea 3 zulotik (2 Luschka albokoak, Magendie erdikoa).',
        'Eremu azpiaraknoideotik zain-sistemara pasatzen da: xurgatu.',
      ],
      roots: [
        n('sare-koroideak', [
          g('Barnetik', [
            branch('alboko-bentrikuluak', '1 · abiatu'),
            branch('monro-zuloak', '2 · bentrikulu arteko zuloa'),
            branch('hirugarren-bentrikulua', '3 · iritsi'),
            branch('garun-akueduktoa', '4 · pasa'),
            branch('laugarren-bentrikulua', '5 · iritsi', undefined, 'gehiago ekoitzi'),
          ]),
          g('IV. bentrikulutik', [
            branch('hodi-ependimarioa', '6a · parte batek jarraitu'),
            branch('luschka-zuloak', '6b · 2 albokoak'),
            branch('magendie-zuloa', '6b · erdikoa'),
            branch('eremu-azpiaraknoideoa', '7 · inguratu'),
            leaf('Zain-sistema', '8 · xurgatu'),
          ]),
        ], { note: 'arteriolak · bentrikuluen sabaian' }),
      ],
    },
    {
      id: 'meningeak-19',
      title: 'Meningeak: hiru mintz, bi jatorri',
      lead: 'Meningeak 5.–8. astean garatzen dira: kanpoan dura materra, barnean araknoidea eta pia materra. Likido zefalorrakideoa meningeetan xurgatzen da.',
      stage: 'garuneko-meningeak',
      pitfalls: [
        'Pia materra eta araknoidea gandor neuraletik (ektodermikoak); dura materra mesodermikoa.',
        'Garunean dura hezurrari itsatsita: ez dago eremu epiduralik. Ornomuinean dura ez dago hezurrari lotuta: eremu epidurala.',
        'Araknoidea eta pia ez daude lotuta: tartean eremu azpiaraknoideoa, likidoa.',
      ],
      roots: [
        n('dura-materra', [
          leaf('Garunean', 'hezurrari itsatsita', undefined, 'eremu epiduralik ez'),
          leaf('Ornomuinean', 'hezurrari lotu gabe', [branch('eremu-epidurala', 'tartean')]),
        ], { note: '1 · kanpokoa · mesodermikoa' }),
        n('araknoidesa', [
          branch('eremu-azpiaraknoideoa', 'piarekiko tartean', [
            leaf('Zain-sistema', 'likidoa pasa eta xurgatu'),
          ], 'likido zefalorrakideoa'),
        ], { note: '2 · armiarma sarea · gandor neurala' }),
        n('pia-materra', [leaf('Ehunari lotuta', 'garunean eta ornomuinean')], { note: '3 · barnekoa · gandor neurala' }),
      ],
    },
    {
      id: 'erraboila-19',
      title: 'Mielentzefaloa: erraboila',
      lead: 'Burmuinaren lehen atala mutur kaudaletik: burmuina eta ornomuina lotzen ditu; ornomuinaren antzekoa, lodiagoa eta zabalagoa.',
      stage: 'erraboila',
      pitfalls: [
        'Hodi ependimarioak (zentralak) izen bera mantentzen du.',
        'Piramideak bentralean (axoi motorrak beherantz); goranzko bideak dortsalean (sentsitiboak).',
        'Zuntza = axoia.',
      ],
      roots: [
        n('mielentzefaloa', [
          branch('erraboila', 'eratorria', [
            branch('hodi-ependimarioa', 'erdian', undefined, 'izen bera'),
            branch('piramideak', 'bentralean', undefined, 'axoi motorrak beherantz'),
            branch('goranzko-bideak', 'dortsalean', undefined, 'sentsitiboak'),
          ], 'burmuina ↔ ornomuina'),
        ]),
      ],
    },
    {
      id: 'metentzefaloa-19',
      title: 'Metentzefaloa: IV. bentrikulua, zubia eta zerebeloa',
      lead: 'Sabai plaka zabaldu eta hodia goitik irekitzen da: IV. bentrikulua. Zoruan zubia; sabaian ezpain erronboideak, fusionatu eta zerebeloa.',
      stage: 'metentzefaloa',
      pitfalls: [
        'Sabai eta zoru plakak finak dira: hasieran axoiak bakarrik.',
        'Irekitzean: eremu motorra bentralean eta erdian; sentikorrak dortsalean eta alboetan.',
        'Hegal plakak kranealean bakarrik garatzen dira; zerebeloak IV. bentrikulu osoa estaltzen du.',
      ],
      roots: [
        n('sabai-plaka', [
          branch('laugarren-bentrikulua', 'zabaldu, hodia goitik ireki', [
            branch('zubia', 'zoruan', undefined, 'axoi sentsitibo eta motorrak'),
            branch('ezpain-erronboideak', 'sabaian: hegal plaken eremu dortsala loditu', [
              branch('garuntxoa', 'erdian fusionatu', undefined, 'zerebelo hasikina → IV. bentrikulua estali'),
            ]),
          ]),
        ]),
        n('hegal-plaka', [leaf('Eremu sentikorrak', 'alboratu', undefined, 'dortsalean eta alboetan')]),
        n('oinalde-plaka', [leaf('Eremu motorra', 'bentralean geratu', undefined, 'erdian')]),
      ],
    },
    {
      id: 'mesentzefaloa-19',
      title: 'Mesentzefaloa: akueduktoa, pedunkuluak eta gai beltza',
      lead: '6. astean hodi forma; 12. asterako zuloa estu eta gai zuri asko; 16. astean dortsalean sentikorrak, bentralean motorrak eta garun pedunkuluak.',
      stage: 'mesentzefaloa',
      pitfalls: [
        'Akueduktoak III. eta IV. bentrikuluak lotzen ditu.',
        'Gai beltza ez dago tindatuta: zelulek pigmentu beltza dute.',
        'Parkinson: neurona dopaminergikoak hil → dopamina ez oinaldeko nukleoetara → mugimendu automatikoak geldirik daudenean.',
      ],
      roots: [
        n('mesentzefaloa', [
          branch('garun-akueduktoa', 'zuloa estutu', undefined, 'III. ↔ IV.'),
          branch('garun-pedunkuluak', 'mutur bentralean', undefined, 'axoi guztiak gora eta behera'),
          branch('gai-beltza', 'barruan', [
            branch('oinaldeko-nukleoak', 'dopamina bidali', undefined, 'telentzefaloan'),
          ], 'zelula dopaminergikoak'),
        ]),
      ],
    },
    {
      id: 'dientzefaloa-19',
      title: 'Dientzefaloa eta hipofisia',
      lead: 'Xixku telentzefalikoek dientzefaloa estaltzen dute; barruan III. bentrikulua eta sare koroideak. Hipofisiak bi jatorri ditu.',
      stage: 'talamoa',
      pitfalls: [
        'Talamoa errelebo-zentroa da: DENA talamotik pasatzen da, usaimena izan ezik.',
        'Adenohipofisia estomodeotik (hipofisi poltsa); neurohipofisia hipotalamotik (infundibulua).',
        'Hipofisia: 3. astean hasi, 2. hilabetearen bukaeran eratuta.',
      ],
      roots: [
        n('dientzefaloa', [
          branch('epitalamoa', 'goian', [branch('guruin-pineala', 'barruan', undefined, 'melatonina: loaldi-esnaldia')]),
          branch('talamoa', 'nagusia', undefined, 'errelebo-zentroa · usaimena ez'),
          branch('hipotalamoa', 'behean', [
            branch('hipofisi-infundibulua', 'beherantz hazi', [branch('neurohipofisia', 'eratu', undefined, 'hipotalamoko hormonak askatu')]),
          ], 'hormonak'),
        ]),
        n('estomodeoa', [
          branch('rathke-poltsa', 'sabaitik gorantz', [
            branch('adenohipofisia', 'askatu', undefined, 'hormonak ekoitzi: somatotropina, prolaktina'),
          ], 'hipofisi poltsa'),
        ]),
      ],
    },
    {
      id: 'bikote-kranealak-19',
      title: '12 bikote kranealak, aurretik atzera',
      lead: 'Burmuinetik ateratzen diren 12 bikoteak. IV.a da alde dortsaletik ateratzen den bakarra.',
      stage: 'bikote-kranealak',
      pitfalls: [
        'I. eta II. ez dira ikusten (usaimen erraboila bakarrik); ikusmen nerbioa prestaketetan beti moztuta.',
        'III., IV. eta VI.: begiaren mugimenduak.',
        'X. bagoa: gorputz osoko nerbio parasinpatikorik handiena.',
        'XI. osagarria: zati bat burmuinetik, bestea ornomuinetik.',
      ],
      roots: [
        l('Bikote kranealak', [
          branch('usaimen-nerbioa', 'I', undefined, 'nerbio txiki asko · erraboilak'),
          branch('nerbio-optikoa', 'II', undefined, 'ikusmena'),
          branch('nerbio-begi-eragilea', 'III', undefined, 'begiaren mugimendua'),
          branch('nerbio-troklearra', 'IV', undefined, 'begia · dortsaletik bakarra'),
          branch('nerbio-trigeminoa', 'V', undefined, 'aurpegiaren sentsazioa · 3 adar'),
          branch('nerbio-aldentzailea', 'VI', undefined, 'begiaren mugimendua'),
          branch('aurpegi-nerbioa', 'VII', undefined, 'adierazpen muskuluak'),
          branch('nerbio-estatoakustikoa', 'VIII', undefined, 'oreka eta entzumena'),
          branch('nerbio-glosofaringeoa', 'IX', undefined, 'ahoaren atzea eta faringea'),
          branch('nerbio-bagoa', 'X', undefined, 'parasinpatikorik handiena'),
          branch('nerbio-osagarria', 'XI', undefined, 'lepoa eta burua'),
          branch('nerbio-hipoglosoa', 'XII', undefined, 'mihia'),
        ]),
      ],
    },
  ],
};

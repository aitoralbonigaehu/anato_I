import type { MigrationTopic, MNode } from '../migrations';

/**
 * Topic 19 (nerbio sistema), reorganized into 7 cohesive blocks (no repetition across
 * vesicles/ventricles/brain parts, cord anatomy/development, or meninges/CSF/clinical).
 * The notes have no blue (not taught) text. Anatomical errors in the notes are corrected.
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
    // ── 1. OINARRIAK: MOZKETAK ETA SAILKAPENAK ──────────────────────────────
    {
      id: 'mozketak-19',
      title: 'Mozketak eta ardatzak: ornomuina bertikala, burmuina horizontala',
      lead: 'Garunaren ardatza horizontala da eta ornomuinarena bertikala. Horregatik, norabide-izenak aldatu egiten dira bien artean.',
      stage: 'mozketak-ardatzak',
      pitfalls: [
        'Garunean dortsala ez da atzekoa, goikoa baizik; bentrala behekoa da.',
        'Ornomuinean (bertikala) bentrala = aurrekoa eta dortsala = atzekoa.',
        'Garunean, rostrala aurrealderantz da eta kaudala atzealderantz. Lobulu okzipitala garunaren atzealdean dago.',
      ],
      roots: [
        l('Mozketa motak', [
          leaf('Horizontala', 'goiko eta beheko zatiak bereizi'),
          leaf('Koronala', 'aurreko eta atzeko zatiak bereizi'),
          leaf('Sagitala', 'ezkerreko eta eskuineko zatiak bereizi'),
        ]),
        n('ornomuina', [
          leaf('Dortsala = atzekoa', 'bertikalki dagoelako'),
          leaf('Bentrala = aurrekoa', 'bertikalki dagoelako'),
        ], { note: 'bertikala · zeharkako mozketak' }),
        n('entzefaloa', [
          leaf('Dortsala = goikoa', 'garun hemisferioetan'),
          leaf('Bentrala = behekoa', 'garun hemisferioetan'),
          leaf('Rostrala = aurrealderantz', 'garunean'),
          leaf('Kaudala = atzealderantz', 'garunean'),
        ], { note: 'garun hemisferioen ardatz horizontala' }),
      ],
    },
    {
      id: 'kokapen-sailkapena-19',
      title: 'Kokapenaren araberako sailkapena: zentrala eta periferikoa',
      lead: 'Nerbio sistema zentralak entzefaloa eta ornomuina biltzen ditu. Periferikoak, besteak beste, nerbioak, gongoilak eta nerbio-sareak biltzen ditu.',
      stage: 'zentrala-periferikoa',
      pitfalls: [
        'Entzefaloa eta ornomuina konektatuta daude: egitura jarraiak dira.',
        'Zentralean eta periferikoan, bietan daude somatikoa eta autonomoa.',
      ],
      roots: [
        n('nerbio-sistema-zentrala', [
          branch('entzefaloa', 'garezurraren barruan'),
          branch('ornomuina', 'bizkarrezurraren barruan', undefined, 'bizkar muina'),
        ], { note: 'garezurrak eta bizkarrezurrak babestua' }),
        n('nerbio-sistema-periferikoa', [
          leaf('Sare zerbikala', 'lepokoa'),
          leaf('Sare brakiala', 'besokoa'),
          leaf('Sare lunbarra eta sakroa', 'lunbar eta sakro mailan'),
        ], { note: 'nerbioak, gongoilak eta sareak' }),
      ],
    },
    {
      id: 'sailkapen-funtzionala-19',
      title: 'Sailkapen funtzionala: somatikoa eta autonomoa',
      lead: 'Sistema somatikoak sentsibilitate somatikoa eta muskulu eskeletikoen kontrola biltzen ditu. Autonomoak (begetatiboak) erraien eta guruinen jarduera erregulatzen du.',
      stage: 'somatikoa-autonomoa',
      pitfalls: [
        'Garun-enborreko zuntz parasinpatiko preganglionarrak III., VII., IX. eta X. nerbio kranealek eramaten dituzte.',
        'Neurona parasinpatiko preganglionarren somak garun-enborrean eta S2–S4 segmentuetan daude. Postganglionarrenak itu-organotik gertu edo haren barruan.',
        'III. nerbioaren zuntz parasinpatikoek begi-ninia uzkurtzen dute, gongoil ziliarrean sinapsia egin ondoren.',
      ],
      roots: [
        l('Nerbio sistema somatikoa', [
          leaf('Sentsibilitate somatikoa', 'informazioa jaso'),
          leaf('Muskulu eskeletikoak', 'borondatezko mugimenduak eta erreflexuak kontrolatu'),
        ]),
        n('nerbio-sistema-begetatiboa', [
          branch('sistema-sinpatikoa', 'estresaren sistema', [
            leaf('Bihotza', 'erritmoa azkartu'),
            leaf('Bronkioak', 'zabaldu'),
            leaf('Izerdi guruinak', 'aktibatu'),
          ], 'T1–L2 · jatorri torakolunbarra'),
          branch('sistema-parasinpatikoa', 'lasaitasunera: egoera basalera itzuli', [
            leaf('Bihotza', 'erritmoa jaitsi'),
            leaf('Digestio-hodia', 'mugikortasuna eta jariaketa sustatu'),
            branch('buruko-gongoil-parasinpatikoak', 'buruko organoetatik gertu', [
              branch('malko-guruina', 'aurpegiko guruinak'),
              branch('listu-guruinak', 'listua jariatu'),
              leaf('Begi-ninia', 'uzkurtu · III. nerbioa eta gongoil ziliarra'),
            ]),
          ], 'garun-enborra eta S2–S4 · jatorri kraneosakroa'),
          branch('errai-sareak', 'erraien inguruan', undefined, 'sinpatikoak eta parasinpatikoak'),
        ], { note: 'autonomoa · ez borondatezkoa: erraiak, esfinterrak, peristaltismoa' }),
      ],
    },

    // ── 2. PLAKA NEURALA ETA GANDOR NEURALA ─────────────────────────────────
    {
      id: 'plaka-neurala-19',
      title: 'Plaka neuraletik hodi neuralera: neuroporoak',
      lead: 'Plaka neurala tolestean, tolestura neuralak erdiko lerroan elkartzen dira eta hodi neurala eratzen dute. Mutur kranealean eta kaudalean neuroporoak geratzen dira aldi baterako.',
      stage: 'plaka-neurala',
      pitfalls: [
        'Aurreko neuroporoa lehenago ixten da, 25. egunaren inguruan. Atzekoa 4. astearen amaieran (27–28. egunetan) ixten da.',
        'Fusioa erdialdeko eremu batean hasten da eta bi norabideetan hedatzen da.',
      ],
      roots: [
        n('plaka-neurala', [
          branch('hodi-neurala', 'tolestura neuralak elkartu', [
            branch('neuroporo-kraneala', 'aurrekoa · 25. egunaren inguruan itxi'),
            branch('neuroporo-kaudala', 'atzekoa · 4. astearen amaieran itxi'),
          ], 'fusioa erdialdean hasi'),
          branch('gandor-neurala', 'tolestura neuralen ertzetan bereizi'),
        ]),
      ],
    },
    {
      id: 'gandor-neuraleko-eratorriak-19',
      title: 'Gandor neuralaren eratorriak',
      lead: 'Hasieran hodi neuralaren eta azaleko ektodermoaren artean daude. Gero, gandorreko zelulak askatu, migratu eta bereizi egiten dira.',
      stage: 'gandor-eratorriak',
      pitfalls: [
        'Gandor neuralak gongoil espinal eta autonomoetako neuronak ematen ditu. Gongoil kraneal sentsitibo batzuetan plakoda ektodermikoek ere parte hartzen dute.',
        'Giltzurrun gaineko guruinean muineko zelula kromafinak bakarrik (kortexa ez).',
        'Gandor neuralak aurreko garunaren inguruko meningei laguntzen die. Meningeen jatorria eskualdearen arabera aldatzen da.',
        'Mielina: periferikoan Schwann zelulek; zentralean oligodendrozitoek.',
      ],
      roots: [
        n('gandor-neurala', [
          g('Gongoilak', [
            branch('gongoil-errakideoak', 'espinalak'),
            branch('gongoil-sinpatikoak', 'sinpatikoak'),
            branch('gongoil-parasinpatikoak', 'parasinpatikoak'),
            leaf('Hesteetako gongoilak', 'hestearen paretara migratu', undefined, 'nerbio-sistema enterikoko neuronak eta glia'),
          ]),
          g('Beste eratorriak', [
            n('zelula-kromafinak', undefined, { via: 'giltzurrun gaineko muinean', move: true }),
            leaf('1., 2. eta 3. faringe-arkuetako hezur eta kartilagoen osagaiak', 'mesenkimara migratu'),
            leaf('Aurreko garunaren inguruko meningeak', 'eskualde horretan parte hartu', [
              branch('dura-materra', 'kanpoan'),
              branch('araknoidesa', 'erdian'),
              branch('pia-materra', 'barnean'),
            ]),
            branch('schwann-zelulak', 'mielina, periferikoan'),
            n('melanozitoak', undefined, { via: 'larruazala eta ilea koloreztatu', move: true }),
          ]),
        ]),
      ],
    },

    // ── 3. ORNOMUINA: GARAPENA, EGITURA HELDUA ETA HAZKUNTZA ────────────────
    {
      id: 'ornomuin-geruzak-egitura-19',
      title: 'Ornomuina barnetik kanpora: enbrioi-geruzak → egitura heldua',
      lead: 'Hodi neuralaren paretako geruzek zuzenean ematen dute ornomuin helduaren antolaketa: barnean ependimoa eta gai grisa (H forman), kanpoan gai zuria eta pia materra.',
      stage: 'ornomuin-geruzak',
      pitfalls: [
        'Manto-geruza → gai grisa (barnean · somak); geruza marginala → gai zuria (kanpoan · axoiak).',
        'Gai zurian goranzko bideak sentsitiboak dira eta beheranzkoak motorrak.',
        'Neuroepitelioan geratzen diren zelulek ependimo-geruza eratzen dute; pia materra kanpoko gainazalari atxikitzen zaio.',
      ],
      roots: [
        n('ornomuina', [
          g('Barnetik kanpora (geruzak → heldua)', [
            branch('barneko-mintz-mugatzailea', 'hodi zentralaren ertzean', [
              branch('neuroepitelioa', 'lotuta, kanporantz begira', [
                branch('neuroblastoak', 'bereizi', undefined, 'ornomuinaren neuronak'),
                branch('ependimo-geruza', 'geratzen diren zelulak', [
                  branch('hodi-ependimarioa', 'barrunbe estua mugatu'),
                ]),
              ]),
            ]),
            branch('manto-geruza', 'neuroblastoen somak', [
              branch('gai-grisa', 'bihurtu · barnean, H forma', [
                branch('interneurona', 'zirkuitu lokaletan parte hartu'),
              ], 'neuronen somak'),
            ]),
            branch('geruza-marginala', 'axoiak', [
              branch('gai-zuria', 'bihurtu · kanpoan', [
                branch('goranzko-bideak', 'sentsitiboak'),
                branch('beheranzko-bideak', 'motorrak'),
              ]),
            ]),
            branch('kanpoko-mintz-mugatzailea', 'hodiaren gainazalean', [
              branch('pia-materra', 'kanpotik atxikita'),
            ]),
          ]),
        ]),
      ],
    },
    {
      id: 'ornomuin-plakak-sustraiak-19',
      title: 'Ornomuina dortsaletik bentralera: plakak, adarrak eta sustraiak',
      lead: 'Ildo mugatzaileak hegal-plaka dortsala (sentsitiboa) eta oinalde-plaka bentrala (motorra) bereizten ditu. Haietatik eratzen dira adarrak, sustraiak eta nerbio espinal mistoak.',
      stage: 'ornomuin-plakak',
      pitfalls: [
        'Hegal-plaka (dortsala) → eremu sentsitiboa / atzeko adarrak; oinalde-plaka (bentrala) → eremu motorra / aurreko adarrak.',
        'Alboko adar sinpatikoak T1–L2 mailetan bakarrik agertzen dira (alde motorrean).',
        'Atzeko sustraiko gongoilean neurona pseudounipolarrak daude: adar zentrala ornomuinera eta periferikoa larruazalera.',
        'Ornomuin garatuan bi ildo daude: aurrekoa askoz sakonagoa. Sabai- eta zoru-plaketan ez dago somarik.',
      ],
      roots: [
        n('ornomuina', [
          g('Dortsaletik bentralera (plakak → sustraiak)', [
            branch('sabai-plaka', 'mutur dortsalean', undefined, 'erdiko lerroa · axoiak bakarrik'),
            branch('hegal-plaka', 'dortsala · sentsitiboa', [
              branch('eremu-sentsitiboa', 'helduan · 2 atzeko adar', [
                branch('atzeko-sustraia', 'atzeko sustraitxoak elkartu', [
                  branch('gongoil-errakideoak', 'atzeko sustraian', [
                    leaf('Adar zentrala', 'ornomuinerantz'),
                    leaf('Adar periferikoa', 'periferiarantz'),
                  ], 'neurona pseudounipolarrak'),
                ]),
              ]),
            ]),
            branch('ildo-mugatzailea', 'tartean · barruko paretan', undefined, 'dortsala eta bentrala bereizi'),
            branch('oinalde-plaka', 'bentrala · motorra', [
              branch('eremu-motorra', 'helduan · 2 aurreko adar', [
                branch('aurreko-sustraia', 'aurreko sustraitxoak elkartu'),
              ]),
              branch('alboko-adarra', 'T1–L2 mailetan', undefined, 'neurona sinpatikoak'),
            ]),
            branch('zoru-plaka', 'mutur bentralean', undefined, 'erdiko lerroa · axoiak bakarrik'),
            branch('sustraitxoak', 'ornomuinarekin lotu', [
              branch('nerbio-espinalak', 'aurreko eta atzeko sustraiak elkartu', undefined, 'nerbio mistoak'),
            ]),
          ]),
        ]),
      ],
    },
    {
      id: 'ornomuinaren-igoera-19',
      title: 'Hazkuntza diferentziala: konoa, zaldi-buztana eta filum terminale',
      lead: 'Bizkarrezurra ornomuina baino gehiago hazten da. Horren ondorioz, ornomuina L1–L2 mailetan amaitzen da eta beheko nerbio-sustraiak beherantz luzatzen dira.',
      stage: 'ornomuinaren-igoera',
      pitfalls: [
        'Helduan, ornomuina L1–L2 ornoen parean amaitzen da normalean.',
        'Zaldi-buztana ornomuinaren konoaren azpitik jaisten diren nerbio-sustraiek osatzen dute.',
        'Filum terminale pia materraren luzapena da, zaldi-buztanaren erdian.',
      ],
      roots: [
        n('ornomuina', [
          g('Hazkuntza (L1–L2 amaiera)', [
            leaf('Loditzeak', 'zerbikala eta lunbosakroa'),
            branch('ornomuinaren-konoa', 'L1–L2 inguruan amaitu', [
              branch('zuntz-terminala', 'pia materraren luzapena', undefined, 'filum terminale'),
            ]),
            branch('zaldi-buztana', 'konoaren azpitik', undefined, 'beherantz luzatutako nerbio-sustraiak'),
            branch('poltsa-durala', 'dura materraren zakua', undefined, 'LZR barnean · sakroraino'),
          ]),
        ]),
      ],
    },

    // ── 4. BIDEAK: SENTSIBILITATEA, ERREFLEXUAK ETA MUGIMENDUAK ─────────────
    {
      id: 'sentsibilitatea-erreflexua-19',
      title: 'Sentsibilitatea eta arku erreflexua',
      lead: 'Estimulu periferikoaren seinalea atzeko sustraitik sartzen da ornomuinera. Ornomuineko erreflexuetan erantzun motorra bertan antolatzen da.',
      stage: 'aktu-erreflexua',
      pitfalls: [
        'Seinalea adar periferikotik adar zentralera igarotzen da. Neuronaren soma atzeko sustraiko gongoilean dago.',
        'Ornomuineko aferentzia sentsitiboa atzeko sustraietatik sartzen da beti.',
        'Erreflexu errotulianoan, neurona sentsitiboak sinapsi zuzena egiten du kuadrizepseko motoneuronarekin (monosinaptikoa).',
      ],
      roots: [
        l('Erretiratze-erreflexua', [
          g('Sarrera sentsitiboa', [
            leaf('Larruazaleko hartzaileak', '1 · estimulu mingarria hauteman'),
            branch('neurona-sentsitiboa', '2 · adar periferikotik zentralera'),
            branch('atzeko-sustraia', '3 · adar zentraletik ornomuinera'),
          ]),
          g('Ornomuinean', [
            branch('interneurona', '4 · sinapsia'),
            branch('motoneurona', '5 · beste sinapsia'),
          ]),
          g('Erantzuna', [
            branch('aurreko-sustraia', '6 · axoiak irten'),
            leaf('Muskulua', '7 · uzkurtu', undefined, 'gorputz-adarra erretiratu'),
          ]),
        ], { note: 'erreflexu polisinaptikoa' }),
        l('Erreflexu errotulianoa', [
          leaf('Kuadrizepseko muskulu-ardatza', '1 · tendoia jotzean aktibatu', [
            branch('neurona-sentsitiboa', '2 · seinalea ornomuinera', [
              branch('motoneurona', '3 · sinapsi zuzena', [
                leaf('Kuadrizepsa', '4 · uzkurtu eta belauna luzatu'),
              ]),
            ]),
          ]),
        ], { note: 'erreflexu monosinaptikoa' }),
      ],
    },
    {
      id: 'borondatezko-bidea-19',
      title: 'Borondatezko mugimendua: kortex sentsitibotik kortex motorrera',
      lead: 'Mugimendu borondatezkoetan informazio sentsitiboa garuneko kortexera iristen da, eta handik agindu motorra beheranzko bideetatik jaisten da.',
      stage: 'borondatezko-mugimenduak',
      pitfalls: [
        'Atzeko zutabeen bidean, lehen neuronak erraboileraino iristen dira, eta hantxe egiten dute lehen sinapsia.',
        'Kortex sentsitiboan pertzepzio kontzientea gertatzen da; kortex motorrak erantzuna antolatzen du.',
        'Agindua beheranzko bideetatik jaisten da (batzuetan sinapsiak eginez).',
      ],
      roots: [
        l('Borondatezko mugimendua', [
          g('Gorantz', [
            branch('neurona-sentsitiboa', '1 · luzapen zentrala ornomuinera'),
            branch('goranzko-bideak', '2 · goranzko bide sentsitiboetatik', undefined, 'sinapsiaren maila bidearen araberakoa'),
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
      lead: 'Praktikarekin mugimendu batzuk automatizatzen dira (bizikletan ibili, gidatu). Erortzean eskuak aurrera luzatzea babes-erantzun postural azkarra da.',
      stage: 'mugimendu-automatikoak',
      pitfalls: [
        'Mugimendu automatiko ikasiek muskulu eskeletikoak erabiltzen dituzte (sistema somatikoa) eta zerebeloak hartzen du parte.',
        'Eskuak jartzea bezalako mugimendu arinek zirkuitu osoa betetzen dute nerbio-sisteman.',
      ],
      roots: [
        l('Mugimendu automatikoak', [
          branch('garuntxoa', 'parte hartu', undefined, 'zerebeloa'),
          leaf('Adibideak', 'bizikletan ibili, gidatu'),
        ], { note: 'ondo ikasiak · muskulu somatikoak' }),
        l('Babes-erantzun posturala', [
          leaf('Aurrerantz erortzea', 'erantzuna abiarazi'),
          leaf('Besoak eta eskuak', 'aurrerantz luzatu', undefined, 'gorputza babesteko'),
        ]),
      ],
    },

    // ── 5. ENTZEFALOA: XIXKUAK, BARRUNBEAK, TOLESPEANAK ETA ATALAK ──────────
    {
      id: 'prosentzefaloa-19',
      title: 'Prosentzefaloa: telentzefaloa, dientzefaloa eta hipofisia',
      lead: 'Aurreko xixku primarioa telentzefaloan eta dientzefaloan banatzen da. Hasieran dientzefaloa handiagoa da; gero telentzefaloak estaltzen du. Hipofisiak bi jatorri ditu.',
      stage: 'bost-xixkuak',
      pitfalls: [
        'Ez esan I. edo II. bentrikulua: ALBOKO bentrikuluak dira (handienak).',
        'Talamoak informazio sentsitibo gehiena bideratzen du kortexera, usaimena izan ezik (zuzenean usaimen-kortexera doa).',
        'Hipofisia: adenohipofisia estomodeotik (Rathke / hipofisi-poltsa); neurohipofisia hipotalamotik (infundibulua).',
      ],
      roots: [
        n('prosentzefaloa', [
          branch('telentzefaloa', 'bigarren mailako xixkua', [
            branch('alboko-bentrikuluak', 'barrunbea', undefined, 'ezkerra eta eskuina · handienak'),
            branch('garun-hemisferioak', 'eratorria · hazi eta dientzefaloa estali'),
          ]),
          branch('dientzefaloa', 'bigarren mailako xixkua · erdian', [
            branch('hirugarren-bentrikulua', 'barrunbea', undefined, 'sare koroideak sabaian'),
            branch('epitalamoa', 'dortsalean', [
              branch('guruin-pineala', 'barruan', undefined, 'melatonina · loaldi-esnaldia'),
            ]),
            branch('talamoa', 'III. bentrikuluaren alboetan', undefined, 'errelebo sentsitiboa · usaimena izan ezik'),
            branch('hipotalamoa', 'bentralean', [
              branch('hipofisi-infundibulua', 'neuroektodermoa beherantz', [
                branch('neurohipofisia', 'eratu', undefined, 'oxitozina eta basopresina askatu'),
              ]),
            ], 'erregulazio endokrinoa'),
            leaf('Azpitalamoa', 'talamoaren azpian'),
          ]),
        ], { note: '1 · aurreko xixkua' }),
        n('estomodeoa', [
          branch('rathke-poltsa', 'aho-ektodermoa gorantz', [
            branch('adenohipofisia', 'estomodeotik askatu eta bereizi', undefined, 'hormonak ekoitzi: somatotropina, prolaktina'),
          ], 'hipofisi-poltsa · 3.–4. astean hasi'),
        ]),
      ],
    },
    {
      id: 'mesentzefaloa-19',
      title: 'Mesentzefaloa: akueduktoa, pedunkuluak, gai beltza eta tolespen zefalikoa',
      lead: 'Tarteko xixkua ez da banatzen: paretak loditzen dira eta erdiko hodia garun-akuedukto bihurtzen da. Alde bentralean garun-pedunkuluak eta gai beltza daude.',
      stage: 'bost-xixkuak',
      pitfalls: [
        'Mesentzefaloan ez dago bentrikulurik: garun-akueduktoak (Silvio) III. eta IV. bentrikuluak lotzen ditu.',
        'Gai beltza ez dago tindatuta: pigmentu beltza dute. Parkinsonean neurona dopaminergikoak hiltzean, dopamina ez da oinaldeko nukleoetara iristen.',
        'Tolespen zefalikoa mesentzefaloaren inguruan sortzen da (4. astean), eta istmoa metentzefaloarekiko estutasuna da (5. astean).',
      ],
      roots: [
        n('mesentzefaloa', [
          branch('garun-akueduktoa', 'barrunbe estua', undefined, 'Silvio · III. eta IV. bentrikuluak lotu'),
          branch('garun-pedunkuluak', 'mutur bentralean', undefined, 'goranzko eta beheranzko zuntzak'),
          branch('gai-beltza', 'zelula dopaminergikoak', [
            branch('oinaldeko-nukleoak', 'dopamina bidali', undefined, 'Parkinson: neurona hauek hil'),
          ], 'pigmentu beltza'),
          branch('tolespen-zefalikoa', '4. astean · bentralki okertu'),
          branch('istmoa-entzefaloa', '5. astean · metentzefaloarekiko muga estua'),
        ], { note: '2 · tarteko xixkua · banatu gabe' }),
      ],
    },
    {
      id: 'erronbentzefaloa-19',
      title: 'Erronbentzefaloa: IV. bentrikulua, metentzefaloa eta mielentzefaloa',
      lead: 'Azken xixkuak erronbo forma du (IV. bentrikulua) eta metentzefaloan (zubia, zerebeloa) eta mielentzefaloan (erraboila) banatzen da.',
      stage: 'bost-xixkuak',
      pitfalls: [
        'IV. bentrikuluaren zorua zabaltzean, eremu motorra medial (erdian) geratzen da eta sentsitiboa lateral (alboetan).',
        'Zerebeloa metentzefaloaren hegal-plaken alde dortsaletik (ezpain erronboideak) garatzen da eta IV. bentrikuluaren sabaia estaltzen du.',
        'Zubi-tolespena dortsalki okertzen da (tolespen zefaliko eta zerbikalaren kontrako noranzkoan).',
        'Erraboilaren zati kaudalean hodi ependimarioak jarraitzen du; rostrala IV. bentrikulura irekitzen da. Zuntza = axoia.',
      ],
      roots: [
        n('erronbentzefaloa', [
          branch('laugarren-bentrikulua', 'barrunbea · erronbo forma', undefined, 'motorra medial · sentsitiboa lateral'),
          branch('metentzefaloa', 'xixku kraneala', [
            branch('zubia', 'bentralean · IV.aren zoruan', [
              branch('zubi-tolespena', '5. astean · dortsalki okertu'),
            ], 'goranzko eta beheranzko bide trinkoak'),
            branch('hegal-plaka', 'dortsalean loditu', [
              branch('ezpain-erronboideak', 'ertz dortsaletan eratu', [
                branch('garuntxoa', 'fusionatu eta IV.aren sabaia estali', undefined, 'zerebeloa'),
              ]),
            ]),
          ]),
          branch('mielentzefaloa', 'xixku kaudala', [
            branch('erraboila', 'eratorria · burmuina ↔ ornomuina', [
              branch('hodi-ependimarioa', 'zati kaudalean'),
              branch('piramideak', 'bentralean', undefined, 'axoi motorrak beherantz'),
              leaf('Atzeko zutabeen nukleoak', 'dortsalean', undefined, 'errelebo sentsitiboa'),
              branch('tolespen-zerbikala', '4. astean · ornomuinarekiko mugan'),
            ]),
          ]),
        ], { note: '3 · azken xixkua · erronbo forma' }),
      ],
    },

    // ── 6. BABESA: MENINGEAK, LIKIDO ZEFALORRAKIDEOA ETA KLINIKA ────────────
    {
      id: 'meningeak-19',
      title: 'Meningeak: hiru mintz eta haien arteko eremuak',
      lead: 'Meningeek entzefaloa eta ornomuina babesten dituzte (5.–8. asteetan garatuak). Kanpotik barrurako ordena: dura materra, araknoidea eta pia materra.',
      stage: 'garuneko-meningeak',
      pitfalls: [
        'Meningeen mesenkimak gandor neuraleko eta mesodermoko ekarpenak ditu (apunteetan: pia + araknoidea gandor neuraletik; dura mesodermotik).',
        'Garezurrean, dura materra hezurrari itsatsita dago eta eremu epidurala potentziala da. Orno-kanalean eremu epidural erreala dago (gantza, zainak, nerbioak).',
        'Araknoidearen eta pia materraren artean eremu azpiaraknoideoa dago, likido zefalorrakideoz betea.',
      ],
      roots: [
        n('dura-materra', [
          leaf('Garunean', 'hezurrari itsatsita', undefined, 'eremu epidural potentziala'),
          leaf('Ornomuinean', 'hezurrari lotu gabe', [branch('eremu-epidurala', 'tartean · gantza eta zainak')]),
        ], { note: '1 · kanpokoa · gogorrena' }),
        n('araknoidesa', [
          branch('eremu-azpiaraknoideoa', 'piarekiko tartean', [
            leaf('Zain-sistema', 'likidoa pasa eta xurgatu'),
          ], 'likido zefalorrakideoa'),
        ], { note: '2 · erdikoa · armiarma-sarea' }),
        n('pia-materra', [leaf('Ehunari lotuta', 'garunean eta ornomuinean')], { note: '3 · barnekoa' }),
      ],
    },
    {
      id: 'likido-zefalorrakideoa-19',
      title: 'Likido zefalorrakideoa: ekoizpena, zirkulazioa eta drainatzea',
      lead: 'Likido zefalorrakideoa 5. astean hasten da eratzen bentrikuluetako sare koroideetan. Etengabe ekoizten da, NSZ amortiguatzen du eta zain-sistemara xurgatzen da.',
      stage: 'likido-zefalorrakideoa',
      pitfalls: [
        'Sare koroideak alboko bi bentrikuluetan eta III. eta IV. bentrikuluetan daude (sabaian).',
        'IV. bentrikulutik 3 zulotatik irteten da eremu azpiaraknoideora: 2 albokoak (Luschka) eta 1 erdikoa (Magendie); beste zati batek hodi ependimariotik jarraitzen du.',
        'Eremu azpiaraknoideoan zirkulatu ondoren, araknoideko granulazioetatik dura materraren zain-sinuetara drainatzen da.',
      ],
      roots: [
        n('sare-koroideak', [
          g('Barnetik', [
            branch('alboko-bentrikuluak', '1 · abiatu'),
            branch('monro-zuloak', '2 · alboko bakoitza III.arekin lotu'),
            branch('hirugarren-bentrikulua', '3 · iritsi'),
            branch('garun-akueduktoa', '4 · pasa'),
            branch('laugarren-bentrikulua', '5 · iritsi'),
          ]),
          g('IV. bentrikulutik kanpora', [
            branch('luschka-zuloak', '6 · alboko bi irekidura'),
            branch('magendie-zuloa', '6 · erdiko irekidura'),
            branch('eremu-azpiaraknoideoa', '7 · entzefaloa eta ornomuina inguratu'),
            leaf('Araknoideko granulazioak', '8 · drainatze-bideetako bat', [
              leaf('Dura materraren zain-sinuak', 'likidoa zain-sistemara igaro'),
            ]),
          ]),
          g('IV. bentrikuluaren jarraipen kaudala', [
            branch('hodi-ependimarioa', 'ornomuinaren hodi zentralarekin jarraitu'),
          ]),
        ], { note: 'epitelio jariatzailea eta kapilarrak' }),
      ],
    },
    {
      id: 'puntzioa-epidurala-19',
      title: 'Klinika: puntzio lunbarra eta anestesia epidurala',
      lead: 'Bi prozedurak ornomuinaren konoaren (L1–L2) azpitik egiten dira, zaldi-buztanaren mailan, ornomuina ez lesionatzeko.',
      stage: 'puntzioa-epidurala',
      pitfalls: [
        'Puntzio lunbarrean dura eta araknoidea zeharkatzen dira LZR lagina hartzeko (NSZko infekzioak detektatzeko); zaldi-buztaneko nerbioak apartatu egiten dira.',
        'Anestesia epiduralean EZ da dura materra zeharkatzen: eremu epiduralean (hezurra eta dura materraren artean) ematen da.',
      ],
      roots: [
        l('Puntzio lunbarra', [
          branch('eremu-azpiaraknoideoa', 'dura eta araknoidea zeharkatu', [
            branch('likido-zefalorrakideoa', 'lagina hartu'),
          ], 'konoaren azpitik · zaldi-buztana'),
        ]),
        n('anestesia-epidurala', [
          branch('eremu-epidurala', 'anestesikoa eman', undefined, 'dura materraren kanpoaldean'),
        ]),
      ],
    },
  ],
};

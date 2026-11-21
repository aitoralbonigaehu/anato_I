import type { MigrationTopic, MNode } from '../migrations';

/**
 * Topics 15–16 (sistema urogenitala, gonadak): where each structure comes from and what it becomes, as the
 * notes tell it. Ids are the structures of content/weeks/week15*.ts and week16*.ts.
 */
const n = (id: string, kids?: MNode[], extra?: Omit<MNode, 'id' | 'kids'>): MNode => ({ id, kids, ...extra });
const l = (label: string, kids?: MNode[], extra?: Omit<MNode, 'label' | 'kids'>): MNode => ({ label, kids, ...extra });

export const SCHEMES_15: MigrationTopic = {
  week: 15,
  short: 'Gernu sistema',
  flows: [
    {
      id: 'gernu-hiru-azpisistema',
      title: 'Bitarteko mesodermoa → hiru azpisistema, kranealetik kaudalera',
      lead: 'Hiru azpisistemak kranealetik kaudalera agertzen dira. Metanefrosak behin betiko giltzurruna ematen du.',
      stage: 'sarrera',
      roots: [
        n('bitarteko-mesodermoa', [
          n('pronefrosa', [l('Desagertu', undefined, { via: '4. astean endekatu', gone: true })], { via: 'lepoan eratu', note: '7–10 nefrotoma bikote' }),
          n('mesonefrosa', [
            n('hodi-mesonefrikoa', [n('ureter-kimua', undefined, { via: 'mutur kaudalak kimua eman' })], { via: 'hodixkak bertara hustu' }),
            l('Ia desagertu', undefined, { via: 'hodixka gehienak endekatu', gone: true }),
          ], { via: 'toraxetik lunbarrera eratu' }),
          n('metanefrosa', [n('giltzurruna', undefined, { via: 'bi jatorrik elkar induzitu' })], { via: 'sakroan eratu', note: '5. astea' }),
        ]),
      ],
    },
    {
      id: 'giltzurrun-bi-sistema',
      title: 'Giltzurrunaren bi sistema, bi jatorri',
      lead: 'Sistema biltzailea ureter kimutik, sistema iraizlea blastema metanefrikotik: biak bitarteko mesodermotik.',
      stage: 'metanefrosa',
      roots: [
        n('ureter-kimua', [
          n('ureterra', undefined, { via: 'zurtoina luzatu' }),
          n('giltzurrun-pelbisa', [
            n('kaliza-nagusiak', [
              n('kaliza-txikiak', [
                n('hodi-biltzaileak', undefined, { via: 'adarkatzea jarraitu' }),
              ], { via: 'hurrengo adarrak bateratu' }),
            ], { via: 'lehen adarrak bateratu' }),
          ], { via: 'muturra zabaldu' }),
        ]),
        n('blastema-metanefrikoa', [
          n('kapsula-metanefrikoa', [
            n('xixku-metanefrikoa', [
              n('nefrona', [
                n('kapsula-glomerularra', undefined, { via: 'glomerulua inguratu' }),
                n('hodixka-bihurgunetsu-proximala', undefined, { via: 'hasierako hodia bihurritu' }),
                n('henle-lakioa', undefined, { via: 'tarteko atala luzatu' }),
                n('hodixka-bihurgunetsu-distala', undefined, { via: 'hodi biltzaileari lotu' }),
              ], { via: 'hodia luzatu eta bereizi' }),
            ], { via: 'barrunbea ireki' }),
          ], { via: 'zelulak adar-muturretan metatu' }),
        ]),
      ],
    },
    {
      id: 'unitatearen-eraketa',
      title: 'Unitate bat: metaketatik korpuskulura',
      lead: 'Pronefrosean, mesonefrosan eta metanefrosan eskema bera: metaketa → xixkua → hodixka → txanoa glomeruluaren gainean.',
      stage: 'nefrotomak',
      roots: [
        n('nefrotomak', [n('hodixka-pronefrikoak', [n('hodi-pronefrikoa', undefined, { via: 'alboko zabalguneak batu' })], { via: 'xixkua luzatu' })], { note: 'bitarteko mesodermoa' }),
        n('xixku-mesonefrikoa', [n('hodixka-mesonefrikoak', [n('kapsula-glomerularra', undefined, { via: 'glomerulua inguratu (fusiorik gabe)' })], { via: 'luzatu' })]),
        n('glomeruluak', [n('korpuskulua', undefined, { via: 'Bowman kapsularekin osatu' })]),
      ],
    },
    {
      id: 'giltzurrun-gaineko-bi-jatorri',
      title: 'Giltzurrun gaineko guruina: kortexa eta muina',
      stage: 'giltzurrun-gaineko-guruinak',
      roots: [
        n('gandor-urogenitala', [n('fetu-kortexa', [l('Atzera egin', undefined, { via: 'jaio ondoren txikitu', gone: true })], { via: 'lehen zelula-uhina', note: '6. astea' }), n('behin-betiko-kortexa', undefined, { via: 'bigarren uhinak inguratu' })], { note: 'mesodermoa' }),
        n('gandor-neurala', [n('giltzurrun-gaineko-muina', undefined, { via: 'alde medialetik sartu', move: true })], { note: 'maila bereko gongoiletatik' }),
      ],
    },
    {
      id: 'kloaka-sinu-urogenitala',
      title: 'Kloaka → uzki hodia eta sinu urogenitala',
      lead: 'Trenkada uroerrektalak (4.–7. asteak) banatzen du; sinu urogenitala endodermikoa da.',
      stage: 'sinu-urogenitala',
      roots: [
        n('kloaka', [
          n('uzki-hodia', undefined, { via: 'atzean', note: 'uzki mintza' }),
          n('sinu-urogenitala', [
            n('gernu-maskuria', undefined, { via: 'goiko atala zabaldu' }),
            n('atal-pelbianoa', [n('uretra', undefined, { via: 'pelbiseko zatia eratu' })], { via: 'erdiko atala estu' }),
            n('behin-betiko-sinu-urogenitala', [n('baginaren-bestibulua', undefined, { via: 'emeetan irekita geratu' }), n('zakil-uretra', undefined, { via: 'arretan ildoak itxi' })], { via: 'beheko atal falikoa' }),
          ], { via: 'aurrean' }),
        ], { note: 'kloaka mintza' }),
      ],
    },
    {
      id: 'alantoidea-lotailua',
      title: 'Alantoidea → urakoa → erdiko zilbor-lotailua',
      stage: 'sinu-urogenitala',
      roots: [n('alantoidea', [n('urakoa', [n('erdiko-zilbor-lotailua', undefined, { via: 'itxi eta zuntz bihurtu', note: 'maskuritik zilborrera' }), n('fistula-urakala', undefined, { via: 'irekita irauten badu' })], { via: 'maskuriari lotutako hondarra' })])],
    },
    {
      id: 'trigonoaren-jatorria',
      title: 'Ureterra gora, hodi mesonefrikoa behera: trigonoa',
      lead: 'Gernu maskuriaren epitelioa endodermikoa da, trigonoa izan ezik (mesodermikoa); gero endodermoz estaltzen da.',
      stage: 'gernu-maskuria',
      roots: [n('hodi-mesonefrikoa', [n('ureterra', undefined, { via: 'kimua bereizi; ahoa gorago', move: true }), n('trigonoa', [l('Epitelio endodermikoa', undefined, { via: 'gero gainazala estali' })], { via: 'atzeko horman erantsi' })])],
    },
    {
      id: 'uretraren-muturra',
      title: 'Zakil uretra eta kanpoko zuloa',
      lead: 'Endodermoko hodi ia guztietan bezala, kanpoko atala ektodermikoa da.',
      stage: 'zakil-uretra',
      roots: [
        n('zakil-uretra', undefined, { note: 'endodermoa · ildo koronarioraino' }),
        n('kordoi-ektodermikoa', [n('kanpoko-uretra-zuloa', undefined, { via: 'hustu' }), n('hobi-nabikularra', undefined, { via: 'zabaldu' })], { note: 'glandearen ektodermotik' }),
        l('Alboko trenkada ektodermikoak', [n('prepuzioa', undefined, { via: 'xixkuak ireki' })]),
      ],
    },
  ],
};

export const SCHEMES_16: MigrationTopic = {
  week: 16,
  short: 'Gonadak',
  flows: [
    {
      id: 'hozi-zelulen-bidaia',
      title: 'Hasierako hozi zelulak: bitelo zakutik gonadara',
      lead: '3. astean bereizi; alantoidea gida; 6. asterako gonada gandorrean.',
      stage: 'hozi-zelulak',
      roots: [n('hasierako-hozi-zelulak', [
        n('bitelo-zaku-sekundarioa', [
          l('Atzeko hestearen pareta', [
            l('Mesenterio dortsala', [n('gonada-gandorra', undefined, { via: '6. asterako iritsi', move: true })], { via: 'mesotik zeharkatu', move: true }),
          ], { via: 'atzeko hesterantz migratu', move: true }),
        ], { via: 'aldi baterako kokatu', note: 'alantoidetik hurbil' }),
      ], { note: 'epiblastoan zehazten dira' })],
    },
    {
      id: 'gonada-bi-bide',
      title: 'Desberdindu gabeko gonada → barrabila edo obarioa',
      lead: 'Hasierako sexu kordoiak berdinak dira sexu bietan (6.–7. asteak); 7. astetik bide desberdinak.',
      stage: 'desberdindu-gabea',
      roots: [
        n('gonadaren-epitelioa', [n('hasierako-sexu-kordoiak', [
          n('muin-kordoiak', [n('barrabil-sarea', undefined, { via: 'hiloan elkartu' }), n('barrabil-kordoiak', [n('hodixka-seminiferoak', undefined, { via: 'pubertaroan lumena ireki' })], { via: 'ferra forman antolatu' })], { via: 'arretan iraun' }),
          n('obarioaren-muina', undefined, { via: 'emeetan kordoiak endekatu' }),
        ], { via: 'epitelioa mesenkiman sartu' })]),
        n('obarioaren-kortexa', [n('kortex-kordoiak', [
          l('Folikulu primordialak', undefined, { via: 'zelulek obozitoa inguratu' }),
        ], { via: 'bigarren belaunaldia eratu' })], { note: 'emeak: epitelioa loditu' }),
        n('hasierako-hozi-zelulak', [n('obozito-primarioak', undefined, { via: 'oogonioak meiosian sartu' })]),
      ],
    },
    {
      id: 'wolff-eratorriak',
      title: 'Hodi mesonefrikoa (Wolff): arretan hodi genitalak',
      lead: 'Testosteronak mantentzen du; emeetan endekatu eta aztarnak uzten ditu.',
      stage: 'hodi-genitalak-arrak',
      roots: [
        n('hodixka-epigenitalak', [n('hodixka-eferenteak', undefined, { via: 'arrak: rete testisaren bidez' }), n('epooforoa', undefined, { via: 'emeak: aztarna' })]),
        n('hodixka-paragenitalak', [n('paradidimoa', undefined, { via: 'arrak: aztarna' }), n('paraooforoa', undefined, { via: 'emeak: aztarna' })]),
        n('hodi-mesonefrikoa', [
          n('epididimoa', undefined, { via: 'atal kraneala kiribildu' }),
          n('hodi-deferentea', undefined, { via: 'erdiko zatia luzatu' }),
          n('semen-xixkua', undefined, { via: 'atal kaudalean kimatu' }),
          n('hodi-isurlea', undefined, { via: 'kimuaz azpiko zatia iraun', blue: true }),
        ], { note: 'arrak · testosteronaren eraginez' }),
      ],
    },
    {
      id: 'muller-eratorriak',
      title: 'Hodi paramesonefrikoa (Müller): emeetan hodi genitalak',
      lead: 'Hormona antimüllerianoak endekatzen du arretan (bi aztarna); emeetan mantentzen da.',
      stage: 'hodi-genitalak-emeak',
      roots: [
        n('hodi-paramesonefrikoa', [
          n('falopioren-tronpak', undefined, { via: 'emeak: atal kraneala', note: 'goian irekita' }),
          n('utero-hodia', [n('uteroa', undefined, { via: 'paretak eta barrunbea garatu' }), n('baginaren-fornixa', undefined, { via: 'baginaren goiko zatia' })], { via: 'emeetan atal kaudalak batu' }),
          n('barrabil-apendizea', undefined, { via: 'arrak: aztarna' }),
          n('prostataren-utrikulua', undefined, { via: 'arrak: aztarna' }),
        ]),
      ],
    },
    {
      id: 'baginaren-bi-jatorri',
      title: 'Bagina: bi jatorri',
      stage: 'bagina',
      roots: [
        n('utero-hodia', [n('baginaren-fornixa', undefined, { via: 'goiko zatia eratu', note: 'mesodermikoa' })]),
        n('sinu-urogenitala', [n('bulbo-sinubaginalak', [n('plaka-baginala', [n('bagina', undefined, { via: 'lumena ireki', note: 'beheko zatia · endodermikoa' })], { via: 'bulboak ugaldu eta elkartu' })], { via: 'bi kimu hazi' })]),
      ],
    },
    {
      id: 'gubernakulua-jaisketa',
      title: 'Gubernakulua eta gonaden jaisketa',
      lead: 'Jaisketa pasiboa: gorputza hazi, gubernakulua ez luzatu.',
      stage: 'jaisketa',
      roots: [
        n('gubernakulua', [
          l('Eskrotoko lotailua', undefined, { via: 'arretan hondarra geratu' }),
          n('lotailu-utero-obarikoa', undefined, { via: 'emeak' }),
          n('uteroaren-lotailu-biribila', undefined, { via: 'emeak' }),
        ]),
        n('luzapen-baginala', [n('iztai-hodia', undefined, { via: 'jaiotzean estutu' }), n('geruza-baginala', undefined, { via: 'barrabilaren inguruan' })], { note: '3. hilabetea' }),
      ],
    },
    {
      id: 'kanpo-genitalen-eratorriak',
      title: 'Kanpo genitalak: egitura bera, bi emaitza',
      stage: 'kanpo-genitalak',
      roots: [
        n('tuberkulu-genitala', [n('klitoria', undefined, { via: 'emeak' }), n('faloa', undefined, { via: 'arrak' })]),
        n('kloaka-tolespenak', [n('tolespen-urogenitalak', [n('ezpain-txikiak', undefined, { via: 'emeetan bereizita iraun' }), n('zakil-uretra', undefined, { via: 'arretan ildoa itxi' })], { via: 'aurreko zatia bereizi' })]),
        n('goragune-genitalak', [n('tolespen-ezpaineskrotalak', [n('ezpain-nagusiak', undefined, { via: 'emeetan bereizita iraun' }), n('eskrotoa', undefined, { via: 'arretan erdian batu' })], { via: 'alboetan handitu' })]),
        n('ildo-urogenitala', [n('baginaren-bestibulua', undefined, { via: 'emeak' })]),
      ],
    },
  ],
};

export const SCHEMES_15_16: MigrationTopic[] = [SCHEMES_15, SCHEMES_16];

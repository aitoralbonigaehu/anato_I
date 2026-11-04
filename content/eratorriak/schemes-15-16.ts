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
      lead: 'Bata bestearen atzetik garatu eta endekatzen dira; metanefrosa bakarrik da funtzionala.',
      stage: 'sarrera',
      roots: [
        n('bitarteko-mesodermoa', [
          n('pronefrosa', [l('Endekatu', undefined, { gone: true, note: '4. astea' })], { note: 'lepoa · 7–10 nefrotoma bikote' }),
          n('mesonefrosa', [n('hodi-mesonefrikoa', [n('ureter-kimua', undefined, { via: 'mutur kaudaleko kimua' })]), l('Ia endekatu', undefined, { gone: true, note: '4. astearen amaiera' })], { note: 'toraxetik sakrora · kordoi nefrogenoak' }),
          n('metanefrosa', [n('giltzurruna', undefined, { note: 'funtzionala den bakarra' })], { note: 'sakroa · 28–29. eguna' }),
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
          n('ureterra'),
          n('giltzurrun-pelbisa', [n('kaliza-nagusiak', [n('kaliza-txikiak', [n('hodi-biltzaileak', undefined, { note: '9.–10. astea' })], { note: '7. astea' })], { note: '2–3' })], { via: 'muturra zabaldu (metanefros hasikina)' }),
        ]),
        n('blastema-metanefrikoa', [n('kapsula-metanefrikoa', [n('xixku-metanefrikoa', [n('nefrona', undefined, { via: 'luzatu; hodi biltzailearekin fusionatu', note: 'gernua 14. astetik' })], { via: 'bakuolizatu' })], { via: 'hodi biltzaileen muturretan' })]),
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
        n('glomeruluak', [n('korpuskulua', undefined, { via: '+ kapsula' })], { note: 'aortaren adarrak' }),
      ],
    },
    {
      id: 'giltzurrun-gaineko-bi-jatorri',
      title: 'Giltzurrun gaineko guruina: kortexa eta muina',
      stage: 'giltzurrun-gaineko-guruinak',
      roots: [
        n('gandor-urogenitala', [n('fetu-kortexa', [l('Desagertu', undefined, { gone: true, note: '1. urtea' })], { note: '6. astea' }), n('behin-betiko-kortexa', undefined, { via: 'fetu-kortexean geruza berria' })], { note: 'mesodermoa' }),
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
            n('gernu-maskuria', undefined, { note: 'goian, zabalena' }),
            n('atal-pelbianoa', [n('uretra')], { note: 'estua' }),
            n('behin-betiko-sinu-urogenitala', [n('baginaren-bestibulua', undefined, { note: 'emeak' }), n('zakil-uretra', undefined, { note: 'arrak' })], { note: 'zapala' }),
          ], { via: 'aurrean' }),
        ], { note: 'kloaka mintza' }),
      ],
    },
    {
      id: 'alantoidea-lotailua',
      title: 'Alantoidea → urakoa → erdiko zilbor-lotailua',
      stage: 'sinu-urogenitala',
      roots: [n('alantoidea', [n('urakoa', [n('erdiko-zilbor-lotailua', undefined, { note: 'gernu maskuriaren erpinetik zilborrera' }), n('fistula-urakala', undefined, { via: 'ixten ez bada' })], { via: 'barrunbea galdu' })])],
    },
    {
      id: 'trigonoaren-jatorria',
      title: 'Ureterra gora, hodi mesonefrikoa behera: trigonoa',
      lead: 'Gernu maskuriaren epitelioa endodermikoa da, trigonoa izan ezik (mesodermikoa); gero endodermoz estaltzen da.',
      stage: 'gernu-maskuria',
      roots: [n('hodi-mesonefrikoa', [n('ureterra', undefined, { via: 'askatu: gorago', move: true }), n('trigonoa', [l('Endodermoz estalia; aztarna geratzen da')], { via: 'atzeko horman erantsi' })])],
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
      roots: [n('bitelo-zaku-sekundarioa', [n('hasierako-hozi-zelulak', [l('Alantoidea → atzeko hestearen pareta → mesoa', [n('gonada-gandorra', undefined, { note: '6. astea' })], { move: true })], { note: 'endodermoa, alantoidetik hurbil · 3. astea' })])],
    },
    {
      id: 'gonada-bi-bide',
      title: 'Desberdindu gabeko gonada → barrabila edo obarioa',
      lead: 'Hasierako sexu kordoiak berdinak dira sexu bietan (6.–7. asteak); 7. astetik bide desberdinak.',
      stage: 'desberdindu-gabea',
      roots: [
        n('gonadaren-epitelioa', [n('hasierako-sexu-kordoiak', [
          n('muin-kordoiak', [n('barrabil-sarea', undefined, { note: 'hiloan' }), n('barrabil-kordoiak', [n('hodixka-seminiferoak', undefined, { via: 'pubertaroan hustu' })], { note: 'ferra forma' })], { via: 'arrak: epiteliotik askatu' }),
          n('obarioaren-muina', undefined, { via: 'emeak: endekatu' }),
        ])]),
        n('obarioaren-kortexa', [n('kortex-kordoiak', [n('obozito-primarioak', undefined, { via: '4. hilabetean askatu + folikulu zelulak' })], { note: '2. belaunaldia' })], { note: 'emeak: epitelioa loditu' }),
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
        n('hodi-mesonefrikoa', [n('epididimoa'), n('hodi-deferentea', [n('semen-xixkua', undefined, { via: 'kimua' }), n('hodi-isurlea', undefined, { via: '+ semen xixkua' })])], { note: 'arrak' }),
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
          n('utero-hodia', [n('uteroa', undefined, { note: 'endometrioa' }), n('baginaren-fornixa', undefined, { note: 'goiko herena' })], { via: 'emeak: erdian fusionatu' }),
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
        n('utero-hodia', [n('baginaren-fornixa', undefined, { note: 'goiko herena · mesodermikoa' })]),
        n('sinu-urogenitala', [n('bulbo-sinubaginalak', [n('plaka-baginala', [n('bagina', undefined, { via: 'lumena (5. hilabetea)', note: 'beheko bi herenak · endodermikoa' })])])]),
      ],
    },
    {
      id: 'gubernakulua-jaisketa',
      title: 'Gubernakulua eta gonaden jaisketa',
      lead: 'Jaisketa pasiboa: gorputza hazi, gubernakulua ez luzatu.',
      stage: 'jaisketa',
      roots: [
        n('gubernakulua', [
          l('Arrak: laburtu eta desagertu', undefined, { gone: true }),
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
        n('kloaka-tolespenak', [n('tolespen-urogenitalak', [n('ezpain-txikiak', undefined, { via: 'emeak' }), n('zakil-uretra', undefined, { via: 'arrak: ildoa itxi' })])]),
        n('goragune-genitalak', [n('tolespen-ezpaineskrotalak', [n('ezpain-nagusiak', undefined, { via: 'emeak' }), n('eskrotoa', undefined, { via: 'arrak' })])]),
        n('ildo-urogenitala', [n('baginaren-bestibulua', undefined, { via: 'emeak' })]),
      ],
    },
  ],
};

export const SCHEMES_15_16: MigrationTopic[] = [SCHEMES_15, SCHEMES_16];

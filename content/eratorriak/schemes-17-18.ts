import type { MigrationTopic, MNode } from '../migrations';

/**
 * Topics 17–18 (burua eta lepoa): where each structure comes from and what it becomes, as the notes tell it.
 * Ids are the shared structures of docs/handover/topic-17-18-plan.md; a part with no structure of its own is a label.
 */
const n = (id: string, kids?: MNode[], extra?: Omit<MNode, 'id' | 'kids'>): MNode => ({ id, kids, ...extra });
const l = (label: string, kids?: MNode[], extra?: Omit<MNode, 'label' | 'kids'>): MNode => ({ label, kids, ...extra });

const branch = (id: string, via: string, kids?: MNode[], note?: string) => n(id, kids, { via, note });
/** Only in the notes' blue text (not taught this year): left out in "Aurten emandakoa" mode. */
const blue = (node: MNode): MNode => ({ ...node, blue: true });
const leaf = (label: string, via: string, kids?: MNode[], note?: string) => l(label, kids, { via, note });

export const SCHEMES_17: MigrationTopic = {
  week: 17,
  short: 'Burua eta lepoa I',
  flows: [
    {
      id: 'kraneoaren-jatorriak-17',
      title: 'Kraneoaren jatorriak: gandor neurala eta mesodermo paraxiala',
      stage: 'kraneoaren-bi-atalak',
      roots: [
        n('gandor-neurala', [
          blue(leaf('Hezur frontalak', 'gangan mintzez hezurtu')),
          branch('errai-kraneoa', 'aurpegira migratu', [
            leaf('Aurpegiko hezur gehienak', 'mintzez hezurtu', undefined, 'I. arkutik, adibidez, maxilarra eta baraila'),
          ]),
          blue(leaf('Kraneo-oinaldearen aurrealdea', 'aurreko kartilagoa eratu')),
        ]),
        blue(n('mesodermo-paraxiala', [
          blue(leaf('Hezur parietalak', 'gangan mintzez hezurtu')),
          blue(leaf('Okzipitalaren ezkataren zati bat', 'atzean mintzez hezurtu')),
          blue(leaf('Kraneo-oinaldearen atzealdea', 'somita okzipitalak elkartu')),
        ])),
      ],
    },
    {
      id: 'kraneo-hezurtzeak-17',
      title: 'Mesenkimatik hezurrera: mintzezkoa eta endokondrala',
      stage: 'hezurtze-motak',
      roots: [
        l('Kraneoko mesenkima', [
          branch('buru-ganga', 'mintzez hezurtu', [
            leaf('Josturak eta fontanelak', 'hezurren artean irekita', undefined, 'hazkundea ahalbidetzen dute'),
          ]),
          leaf('Kondrokraneoa', 'kartilagozko eredua eratu', [
            leaf('Kraneo-oinaldeko hezurrak', 'eredua hezurrez ordezkatu', undefined, 'hezurtze endokondrala'),
          ]),
        ]),
      ],
    },
    {
      id: 'kondrokraneoaren-eratorriak-17',
      title: 'Kondrokraneoa: kartilago bakoitza zer hezur-atal bihurtzen den',
      stage: 'kondrokraneoa',
      roots: [n('kondrokraneoa', [
        leaf('Erdiko kartilagoak', 'erdiko lerroan antolatu', [
          leaf('Parakordalak + esklerotoma okzipitalak', 'atzealdean elkartu', [
            branch('okzipitalaren-oinaldea', 'endokondralki hezurtu'),
          ]),
          branch('hipofisi-kartilagoak', 'hipofisiaren inguruan', [
            branch('esfenoidesaren-gorputza', 'endokondralki hezurtu'),
          ]),
          branch('trenkada-kranialak', 'aurrealdean eratu', [branch('etmoidesa', 'endokondralki hezurtu')]),
        ]),
        leaf('Alboko kartilagoak', 'alboetan antolatu', [
          branch('kapsula-periotikoa', 'barne-belarria inguratu', [branch('harkaitza', 'endokondralki hezurtu')]),
          branch('hego-tenporala', 'albora hedatu', [branch('esfenoidesaren-hego-handia', 'endokondralki hezurtu')]),
          branch('begizulo-hegoa', 'orbitara hedatu', [branch('esfenoidesaren-hego-txikia', 'endokondralki hezurtu')]),
        ]),
      ])],
    },
    {
      id: 'arkuaren-osagaiak-17',
      title: 'Faringe-arku baten osagaiak',
      stage: 'arkuaren-osagaiak',
      roots: [
        n('faringe-arkuak', [
          leaf('Ektodermoa', 'kanpotik estali', [branch('faringe-arraildurak', 'arkuen artean hondoratu')]),
          leaf('Endodermoa', 'barrutik estali', [branch('faringe-poltsak', 'arkuen artean irten')]),
          leaf('Mesenkima', 'erdigunea osatu', [
            branch('arkuko-kartilagoa', 'gandor neuraletik bereizi'),
            leaf('Muskuluak', 'mesodermoko mioblastoak'),
            branch('arkuko-arteria', 'aorta-zakua eta dortsala lotu'),
            branch('arkuko-zaina', 'bertako odola drainatu'),
            branch('arkuko-nerbioa', 'arkua inerbatu'),
          ]),
          branch('bosgarren-arkua', 'iragankorra edo falta da', [
            l('Eratorririk ez', undefined, { via: 'goiz endekatu', gone: true }),
          ]),
        ]),
      ],
    },
    {
      id: 'lehen-arkua-eratorriak-17',
      title: 'I. arkua · V3, Meckel eta murtxikatzea',
      stage: 'lehen-arkua-kartilagoak',
      roots: [
        n('lehen-arkua', [
          branch('barail-nerbioa', 'inerbazio motorra', undefined, 'V3 · trigeminoaren adarra'),
          branch('luzapen-maxilarra', 'goiko luzapena', [
            branch('hezur-maxilarra', 'mintzez hezurtu'),
            branch('zigomatikoa', 'mintzez hezurtu'),
            blue(leaf('Tenporalaren ezkata', 'mintzez hezurtu')),
          ]),
          branch('barail-luzapena', 'beheko luzapena', [
            branch('meckel-kartilagoa', 'kartilagoa eratu', [
              branch('mailua', 'mutur dortsala hezurtu'),
              branch('ingudea', 'mutur dortsala hezurtu'),
              l('Kartilagoaren zati handiena', undefined, { via: 'endekatu', gone: true }),
            ]),
            branch('baraila', 'Meckelen inguruan hezurtu', undefined, 'inguruko mesenkimatik'),
          ]),
          branch('loki-hezurraren-atal-tinpanikoa', 'mesenkima mintzez hezurtu'),
          leaf('Arkuko muskuluak', 'V3k inerbatzen ditu', [
            branch('maseteroa', 'baraila igo'),
            branch('muskulu-tenporala', 'baraila igo'),
            leaf('Pterigoideoak', 'baraila mugitu'),
            blue(branch('milohioideoa', 'ahoaren zorua osatu')),
            branch('digastrikoaren-aurreko-sabela', 'baraila jaitsi'),
          ]),
        ]),
      ],
    },
    {
      id: 'bigarren-arkua-eratorriak-17',
      title: 'II. arkua · VII, Reichert eta mimika',
      stage: 'bigarren-arkua',
      roots: [
        n('bigarren-arkua', [
          branch('aurpegi-nerbioa', 'arkuko muskuluak inerbatu', undefined, 'VII. bikotea'),
          branch('reichert-kartilagoa', 'kartilagoa eratu', [
            branch('ointokia', 'goiko muturrean eratu'),
            branch('estiloide-apofisia', 'hezurtu'),
            branch('lotailu-estilohioideoa', 'zuntz bihurtu'),
            branch('hioide-adar-txikia', 'beheko muturrean eratu'),
            branch('hioide-gorputz-goia', 'goiko erdia osatu'),
          ]),
          leaf('Arkuko muskuluak', 'VII.ak inerbatzen ditu', [
            branch('muskulu-mimikoak', 'aurpegiko adierazpena', [branch('platisma', 'lepoan hedatu')]),
            blue(branch('muskulu-aurikularrak', 'belarri inguruan')),
            blue(branch('okzipitala', 'garezurraren atzealdean')),
            branch('digastrikoaren-atzeko-sabela', 'hioidea igo'),
            blue(branch('estilohioideoa', 'hioidea igo eta atzeratu')),
          ]),
        ]),
      ],
    },
    {
      id: 'hirugarren-arkua-eratorriak-17',
      title: 'III. arkua · IX, hioidearen beheko erdia eta estilofaringeoa',
      stage: 'hirugarren-arkua',
      roots: [
        n('hirugarren-arkua', [
          branch('glosofaringeoa', 'arkuko nerbioa', undefined, 'IX. bikotea'),
          leaf('Hioidearen beheko atala', 'arkuko eskeletoa eratu', [
            branch('hioide-gorputz-behea', 'beheko erdia osatu'),
            branch('hioide-adar-nagusia', 'alboetara luzatu'),
          ]),
          branch('muskulu-estilofaringeoa', 'IX.ak inerbatzen du', undefined, 'faringea igo eta zabaldu'),
        ]),
      ],
    },
    {
      id: 'laugarren-seigarren-eratorriak-17',
      title: 'IV. eta VI. arkuak · bagoaren adarrak eta laringea',
      lead: 'Apunteek tiroide-kartilagoaren goiko aldea IV. arkuarekin eta behekoa VI.arekin lotzen dute.',
      stage: 'laugarren-seigarren-muskuluak',
      roots: [
        n('laugarren-arkua', [
          branch('goiko-laringe-nerbioa', 'X. bikotearen adarra', [
            branch('krikotiroidea', 'kanpoko adarrak inerbatu'),
          ]),
          leaf('Faringeko muskulu ertzatzaileak', 'muskuluak bereizi', undefined, 'inerbazio nagusia: bagoa, faringe-plexuaren bidez'),
          branch('tiroide-kartilagoa', 'kartilago laringeoari ekarpena', undefined, 'goiko aldea, apunteen arabera'),
        ]),
        n('seigarren-arkua', [
          branch('laringe-atzerakaria', 'X. bikotearen adarra', [
            leaf('Laringeko berezko muskulu gehienak', 'inerbazio motorra', undefined, 'krikotiroideoa IV. arkuari lotuta'),
          ]),
          branch('tiroide-kartilagoa', 'kartilago laringeoari ekarpena', undefined, 'beheko aldea, apunteen arabera'),
          branch('krikoide-kartilagoa', 'eraztuna eratu'),
          branch('aritenoide-kartilagoa', 'atzeko kartilago parea'),
          leaf('Kornikulatuak eta kuneiformeak', 'kartilago txiki parekatuak'),
        ]),
      ],
    },
  ],
};

export const SCHEMES_18: MigrationTopic = {
  week: 18,
  short: 'Burua eta lepoa II',
  flows: [
    {
      id: 'poltsen-eratorriak-18',
      title: 'Lau poltsak eta haien eratorriak',
      lead: 'Barruko inbaginazioak, endodermikoak. Azken poltsa bakarra bezala ikasten dugu.',
      stage: 'arraildurak-poltsak',
      roots: [
        n('lehen-poltsa', [
          n('eustakioren-tronpa', undefined, { via: 'hurbileko zatia estu geratu' }),
          n('tinpano-kutxa', undefined, { via: 'urruneko muturra zabaldu' }),
        ], { note: 'sakonune tubotinpanikoa' }),
        n('bigarren-poltsa', [n('aho-sabaiko-amigdala', undefined, { via: 'epitelioak kriptak eratu' })]),
        n('hirugarren-poltsa', [
          n('beheko-paratiroidea', undefined, { via: 'alde dortsala' }),
          n('timoa', undefined, { via: 'alde bentrala' }),
        ]),
        n('laugarren-poltsa', [
          n('goiko-paratiroidea', undefined, { via: 'alde dortsala' }),
          n('gorputz-ultimobrankiala', [l('C zelulak', undefined, { via: 'tiroidean barneratu', move: true, note: 'kaltzitonina' })], { via: 'alde bentrala' }),
        ]),
      ],
    },
    {
      id: 'arrailduren-eratorriak-18',
      title: 'Arraildurak: lehenak irauten du, besteak estaltzen dira',
      lead: 'Kanpoko inbaginazioak, ektodermikoak.',
      stage: 'lehen-arraildura',
      roots: [
        n('lehen-arraildura', [
          n('kanpoko-entzumen-hodia', undefined, { via: 'arraildurak iraun', blue: true }),
          n('tinpano-mintza', undefined, { via: 'poltsarekin batu (≠ fusionatu)', note: 'ektodermoa · mesodermoa · endodermoa' }),
        ]),
        n('faringe-arraildurak', [
          l('Sinu zerbikala', [
            l('Itxiera', undefined, { via: 'normalean desagertu', gone: true }),
            l('Kiste zerbikala', undefined, { via: 'hondarra geratzen bada' }),
          ], { via: 'II. arkuak estali' }),
        ], { note: 'gainerakoak' }),
      ],
    },
    {
      id: 'guruinen-jaisketa-18',
      title: 'Jaisketa: izena ez da sorrerarena, azken kokapenarena baizik',
      lead: 'Goikaldean behekoa eratzen da eta behekaldean goikoa.',
      stage: 'guruinen-jaisketa',
      roots: [
        n('timoa', [l('Aurreko mediastinoa', undefined, { via: 'behera eta medialera', move: true })], { note: '3. poltsa' }),
        n('beheko-paratiroidea', [l('Tiroidearen atzean, behean', undefined, { via: 'timoak eramanda', move: true })], { note: '3. poltsa' }),
        n('goiko-paratiroidea', [l('Tiroidearen atzean, goian', undefined, { via: 'gutxi jaitsi', move: true })], { note: '4. poltsa' }),
      ],
    },
    {
      id: 'mihiaren-jatorria-18',
      title: 'Mihia: hiru jatorri, bakoitza bere nerbioekin',
      lead: 'I. arkuak aurreko zatia osatzen du. III. eta IV. arkuak atzeko aldeari lotzen zaizkio, eta somita okzipitalek muskulu gehienak ematen dituzte.',
      stage: 'mihiaren-inerbazioa',
      roots: [
        n('lehen-arkua', [
          l('Bi goragune lateralak + tuberkulu bakoitia', [
            l('Mihiaren gorputza', [
              n('barail-nerbioa', undefined, { via: 'sentsibilitate orokorra · V3' }),
              n('aurpegi-nerbioa', undefined, { via: 'dastamena · tinpanoko korda' }),
            ], { via: 'fusionatu', note: 'aurreko bi herenak' }),
          ], { via: 'mihi-hasikinak hazi' }),
        ]),
        n('bigarren-arkua', [
          l('Kopula', undefined, { via: 'III. arkuak gainetik estali', gone: true }),
        ]),
        n('hirugarren-arkua', [
          l('Mihiaren sustraia', [n('glosofaringeoa', undefined, { via: 'sentsibilitatea eta dastamena' })], { via: 'atzeko herena osatu' }),
        ]),
        n('laugarren-arkua', [
          n('epiglotisa', [n('bagoa', undefined, { via: 'goiko laringe-adarrak inerbatu' })], { via: 'goragune hipobrankialetik', blue: true }),
        ]),
        l('Somita okzipitalak', [
          l('Mihiaren muskulu gehienak', [n('hipoglosoa', undefined, { via: 'inerbazio motorra · XII' })], { via: 'mioblastoak migratu', move: true, note: 'palatoglosoa: X' }),
        ], { note: '3 bikote' }),
      ],
    },
    {
      id: 'tiroidearen-bidea-18',
      title: 'Tiroidea: zulo itsutik krikoidearen mailara',
      lead: 'Hodi tiroglosoa gida bezala erabiltzen du eta gero itxi egiten da.',
      stage: 'tiroidea-jaisketa',
      roots: [
        n('faringe-hestea', [
          l('Tiroide-hasikina', [
            n('tiroide-guruina', undefined, { via: 'hioidea gainditu eta jaitsi', move: true, note: '7. astean, krikoidearen parean', plain: { via: 'beherantz jaitsi', note: '7. astean' } }),
            n('hodi-tiroglosoa', [
              l('Hodia desagertu', undefined, { via: 'jaitsieraren ondoren itxi', gone: true }),
              n('zulo-itsua', undefined, { via: 'mihiaren gainean aztarna utzi' }),
            ], { via: 'mihiarekiko lotura iragankorra' }),
          ], { via: 'zoruan endodermoa ebaginatu', note: '4. astea' }),
        ]),
      ],
    },
    {
      id: 'aurpegiaren-osagaiak-18',
      title: 'Aurpegiaren osagaiak eta zer ematen duten',
      lead: 'Hasieran lateralak dira; alde medialerantz eta aurrerantz mugituz enbrioiak giza itxura hartzen du.',
      stage: 'aurpegi-fusioa',
      roots: [
        n('goragune-frontonasala', [
          n('sudur-plakoda', [
            n('sudur-hobitxoa', undefined, { via: 'plakoda hondoratu' }),
            l('Ertz medialak', [
              l('Sudurraren erdiko atala', undefined, { via: 'erdiko sudurra osatu' }),
              l('Maxilar arteko segmentua', [
                l('Goiko ezpainaren erdiko atala', undefined, { via: 'aurreko zatia osatu' }),
                l('Hasierako aho sabaia', undefined, { via: 'barneko zatia osatu', note: 'ebakortz-zuloaren aurretik' }),
              ], { via: 'bi ertz medialak batu' }),
            ], { via: 'hobitxoaren erdialdean hazi' }),
            l('Ertz lateralak', [l('Sudur hegalak', undefined, { via: 'alboak osatu' })], { via: 'hobitxoaren alboan hazi' }),
          ], { via: 'ektodermoa loditu', note: '5. astea' }),
        ]),
        n('luzapen-maxilarra', [
          l('Goiko ezpainaren alboak', undefined, { via: 'ertz medialetara batu' }),
          l('Aho sabaiaren gandorrak', undefined, { via: 'aho barrurantz hazi' }),
        ], { note: 'medialera eta aurrera' }),
        n('barail-luzapena', [
          l('Beheko ezpaina eta kokotsa', undefined, { via: 'bi luzapenak erdian batu' }),
        ]),
        n('ildo-nasolagrimala', [
          l('Hodi nasolagrimala', [l('Malko zakua', undefined, { via: 'goiko muturra zabaldu' })], { via: 'ektodermo-kordoia kanalizatu' }),
        ], { note: 'ertz lateralaren eta luzapen maxilarraren artean' }),
      ],
    },
    {
      id: 'aho-sabaiaren-asteak-18',
      title: 'Aho sabaia astez aste',
      lead: 'Hiru atal: hasierako aho sabaia eta bi gandorrak.',
      stage: 'aho-sabai-gandorrak',
      roots: [
        l('Gandorrak mihiaren alboan', [
          l('Horizontalizatu, mihiaren gainean', [
            l('Erdian fusionatu', [
              l('Bigarren mailako ahosabaia', [
                l('Ahosabai gogorraren atzeko zatia', undefined, { via: 'aurreko zatia hezurtu' }),
                l('Ahosabai biguna eta ubula', undefined, { via: 'atzeko zatia bigun iraun' }),
              ], { via: 'lehen ahosabaiari eta trenkadari lotu' }),
            ], { via: 'ertzak elkartu', note: '9. astea' }),
          ], { via: 'mihitik gora biratu', note: '7. astea' }),
        ], { note: '6. astea · beherantz' }),
      ],
    },
    {
      id: 'hortzaren-jatorriak-18',
      title: 'Hortza: esmalte-organoa, papila eta folikulua',
      stage: 'hortzaren-geruzak',
      roots: [
        l('Hortz lamina', [
          l('Esmalte-organoa', [
            l('Ameloblastoak', [l('Esmaltea', undefined, { via: 'koroaren gainazala jariatu' })], { via: 'barneko epitelioa bereizi' }),
          ], { via: 'epitelio-kimua handitu' }),
        ], { note: 'aho-ektodermoa' }),
        l('Hortz papila', [
          l('Odontoblastoak', [l('Dentina', undefined, { via: 'dentinaren matrizea jariatu' })], { via: 'kanpoko zelulak bereizi' }),
          l('Hortz-mamia', undefined, { via: 'erdiko mesenkimak iraun' }),
        ], { note: 'ektomesenkima' }),
        l('Hortz-folikulua', [
          l('Zementoblastoak', [l('Zementoa', undefined, { via: 'sustraia estali' })], { via: 'sustrai inguruan bereizi' }),
          l('Lotailu periodontala', undefined, { via: 'zuntzak antolatu' }),
          l('Hezur albeolarra', undefined, { via: 'osteoblastoak bereizi' }),
        ], { note: 'inguruko ektomesenkima' }),
      ],
    },
  ],
};

export const SCHEMES_17_18: MigrationTopic[] = [SCHEMES_17, SCHEMES_18];

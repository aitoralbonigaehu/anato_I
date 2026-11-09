import type { MigrationTopic, MNode } from '../migrations';

/**
 * Topics 17–18 (burua eta lepoa): where each structure comes from and what it becomes, as the notes tell it.
 * Ids are the shared structures of docs/handover/topic-17-18-plan.md; a part with no structure of its own is a label.
 */
const n = (id: string, kids?: MNode[], extra?: Omit<MNode, 'id' | 'kids'>): MNode => ({ id, kids, ...extra });
const l = (label: string, kids?: MNode[], extra?: Omit<MNode, 'label' | 'kids'>): MNode => ({ label, kids, ...extra });

export const SCHEMES_17: MigrationTopic = {
  week: 17,
  short: 'Burua eta lepoa I',
  flows: [
    {
      id: 'kraneoaren-jatorriak-17',
      title: 'Kraneoa: bi atal, bi jatorri',
      lead: 'Errai kraneoa gandor neuraletik; neurokraneoa gandor neuraletik eta somita okzipitaletako mesodermo paraxialetik.',
      stage: 'kraneoaren-bi-atalak',
      roots: [
        n('gandor-neurala', [
          l('Hezur frontalak', undefined, { note: 'buru ganga · mintzezkoa' }),
          l('Errai kraneoa', [l('Aurpegiko hezurrak', undefined, { note: '1. eta 2. arkuen eratorriak' })], { note: 'mintzezkoa' }),
        ]),
        n('mesodermo-paraxiala', [
          l('Parietalak', undefined, { note: 'buru ganga · mintzezkoa' }),
          l('Okzipitalaren ezkata', undefined, { note: 'buru ganga · mintzezkoa' }),
        ], { note: 'somita okzipitalak' }),
      ],
    },
    {
      id: 'kraneo-hezurtzeak-17',
      title: 'Bi hezurtze mota',
      lead: 'Mintzezkoa zuzenean eta azkar; endokondrala kartilagotik eta geldo.',
      stage: 'hezurtze-motak',
      roots: [
        l('Mesenkima', [
          l('Hezur lauak', undefined, { via: 'mintzezko hezurtzea: zuzenean', note: 'parietalak, okzipitalaren ezkata, aurpegikoak' }),
          l('Kartilagoa', [l('Burezurraren oinaldea', undefined, { via: 'hezurtu (kondrozitoak → osteoblastoak)', note: 'kondrokraneoa · luze eta geldoa' })], { via: 'hezurtze endokondrala' }),
        ]),
      ],
    },
    {
      id: 'arkuaren-osagaiak-17',
      title: 'Arku bakoitzaren osagaiak',
      lead: 'Kanpoan ektodermoa, barruan endodermoa, tartean mesenkima; mesenkiman arteria, zaina, nerbioa eta kartilagoa.',
      stage: 'arkuaren-osagaiak',
      roots: [
        n('faringe-arkuak', [
          l('Ektodermoa', [n('faringe-arraildurak', undefined, { note: 'kanpoan, arkuen artean' })], { note: 'kanpoko estalkia' }),
          l('Endodermoa', [n('faringe-poltsak', undefined, { note: 'barruan, arkuen artean' })], { note: 'barneko epitelioa' }),
          l('Mesenkima', [l('Arteria'), l('Zaina'), l('Nerbioa', undefined, { note: 'bikote kraneal bat' }), l('Kartilagoa', undefined, { note: 'batzuetan ez · gero desagertu' }), l('Muskuluak'), l('Aurpegiko hezurrak', undefined, { note: 'gandor neuraletik' })], { note: 'mesodermoa + gandor neurala' }),
        ], { note: '4.–5. asteak · bikoteka' }),
        n('bosgarren-arkua', [l('Endekatu', undefined, { gone: true, note: 'ez du eratorririk uzten' })]),
      ],
    },
    {
      id: 'lehen-arkua-eratorriak-17',
      title: 'I. arkua: V nerbioa, bi luzapen, muskulu murtxikatzaileak',
      lead: 'Muskulu bat zein arkutakoa den, bere nerbioari begiratuta jakiten da.',
      stage: 'lehen-arkua-kartilagoak',
      roots: [
        n('lehen-arkua', [
          n('trigeminoa', [
            n('nerbio-oftalmikoa', undefined, { note: 'V1 · batez ere sentsitiboa' }),
            n('nerbio-maxilarra', undefined, { note: 'V2 · sentsitiboa' }),
            n('barail-nerbioa', undefined, { note: 'V3 · mistoa: muskuluak' }),
          ], { note: 'V · Gasser gongoila' }),
          n('luzapen-maxilarra', [
            n('hezur-maxilarra'),
            n('zigomatikoa'),
            n('tenporalaren-ezkata', undefined, { note: 'harkaitza oinaldeko mesenkimatik' }),
            n('mailua', undefined, { note: 'goiko muturra' }),
            n('ingudea', undefined, { note: 'adar luzea II.etik, beste liburuetan' }),
          ]),
          n('barail-luzapena', [
            n('meckel-kartilagoa', [
              l('Endekatu', undefined, { gone: true, note: 'gida da' }),
              n('baraila', undefined, { via: 'bere inguruan mintzezko hezurtzea' }),
            ]),
          ]),
          l('Muskuluak (V3)', [
            l('Maseteroa'),
            l('Tenporala'),
            l('Milohioideoa'),
            l('Digastrikoaren aurreko sabela', undefined, { note: 'atzekoa VII.ak' }),
          ], { note: 'murtxikatzaileak · azalekoak' }),
        ]),
      ],
    },
    {
      id: 'bigarren-arkua-eratorriak-17',
      title: 'II. arkua: VII nerbioa, Reichert, muskulu mimikoak',
      lead: 'Reichert kartilagoa endekatzen da eta muturretan bakarrik eratzen dira hezurrak.',
      stage: 'bigarren-arkua',
      roots: [
        n('bigarren-arkua', [
          n('aurpegi-nerbioa', undefined, { note: 'VII · mistoa' }),
          n('reichert-kartilagoa', [
            l('Endekatu', undefined, { gone: true }),
            n('ointokia', undefined, { note: 'goiko muturra' }),
            n('estiloide-apofisia'),
            n('hioide-adar-txikia'),
            n('hioide-gorputza', undefined, { note: 'goiko erdia' }),
          ]),
          l('Muskuluak (VII)', [
            l('Muskulu mimikoak'),
            l('Aurikularrak'),
            l('Okzipitala'),
            l('Digastrikoaren atzeko sabela'),
            l('Estilohioideoa'),
            l('Platisma'),
          ], { note: 'azalekoak' }),
        ]),
      ],
    },
    {
      id: 'hirugarren-arkua-eratorriak-17',
      title: 'III. arkua: IX nerbioa, hioidearen beheko zatia, muskulu sakonak',
      lead: 'Ez dago aurreko bi arkuen bezalako kartilagorik, baina hioidea osatzen du.',
      stage: 'hirugarren-arkua',
      roots: [
        n('hirugarren-arkua', [
          n('glosofaringeoa', undefined, { note: 'IX · mistoa' }),
          n('hioide-gorputza', undefined, { note: 'beheko erdia' }),
          n('hioide-adar-nagusia'),
          l('Muskuluak (IX)', [l('Estilofaringeoa'), l('Faringearen goiko ertzatzaileak')], { note: 'sakonak' }),
        ]),
      ],
    },
    {
      id: 'laugarren-seigarren-eratorriak-17',
      title: 'IV. eta VI. arkuak: bagoaren bi adar, laringeko kartilagoak',
      lead: 'X.aren adar bana arku bakoitzari; hezurrik ez, kartilagoak bakarrik.',
      stage: 'laugarren-seigarren-muskuluak',
      roots: [
        n('laugarren-arkua', [
          n('goiko-laringe-nerbioa', [l('Tarteko eta beheko ertzatzaileak')], { via: 'bagoaren adarra' }),
          n('tiroide-kartilagoa', undefined, { note: 'goiko aldea' }),
        ]),
        n('seigarren-arkua', [
          n('laringe-atzerakaria', [l('Laringe barneko muskuluak')], { via: 'bagoaren adarra' }),
          n('tiroide-kartilagoa', undefined, { note: 'beheko atala' }),
          n('krikoide-kartilagoa'),
          n('epiglotisa'),
          n('aritenoide-kartilagoa'),
          l('Kornikulatuak eta kuneiformeak'),
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
          n('eustakioren-tronpa', undefined, { note: 'hurbileko atala' }),
          n('tinpano-kutxa', undefined, { note: 'muturra zabaldu · hiru hezurtxoak' }),
        ], { note: 'sakonune tubotinpanikoa' }),
        n('bigarren-poltsa', [n('aho-sabaiko-amigdala', undefined, { note: 'funtzionala 5. hilabetean' })]),
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
          n('kanpoko-entzumen-hodia'),
          n('tinpano-mintza', undefined, { via: 'poltsarekin batu (≠ fusionatu)', note: 'ektodermoa · mesodermoa · endodermoa' }),
        ]),
        n('faringe-arraildurak', [
          l('Sinu zerbikala', [l('Desagertu', undefined, { gone: true, note: 'batzuetan mantendu' })], { via: 'II. arkua gainetik hazi', move: true }),
        ], { note: 'gainerakoak' }),
      ],
    },
    {
      id: 'guruinen-jaisketa-18',
      title: 'Jaisketa: izena ez da sorrerarena, azken kokapenarena baizik',
      lead: 'Goikaldean behekoa eratzen da eta behekaldean goikoa.',
      stage: 'guruinen-jaisketa',
      roots: [
        n('timoa', [l('Tiroidearen behekaldean', undefined, { via: 'behera eta medialera', move: true, note: 'pubertarotik endekatu' })], { note: '3. poltsa' }),
        n('beheko-paratiroidea', [l('Tiroidearen atzean, behean', undefined, { via: 'timoak eramanda', move: true })], { note: '3. poltsa' }),
        n('goiko-paratiroidea', [l('Tiroidearen atzean, goian', undefined, { via: 'gutxi jaitsi', move: true })], { note: '4. poltsa' }),
      ],
    },
    {
      id: 'mihiaren-jatorria-18',
      title: 'Mihia: hiru jatorri, bakoitza bere nerbioekin',
      lead: 'Gorputza I. arkutik, sustraia II., III. eta IV.aren zati batetik, muskuluak somitetatik.',
      stage: 'mihiaren-inerbazioa',
      roots: [
        n('lehen-arkua', [
          l('Bi goragune lateralak + tuberkulu bakoitia', [
            l('Mihiaren gorputza', [
              n('barail-nerbioa', undefined, { note: 'sentsibilitate orokorra' }),
              n('aurpegi-nerbioa', undefined, { note: 'dastamena' }),
            ], { via: 'fusionatu', note: 'aurreko bi herenak' }),
          ]),
        ]),
        l('II., III. eta IV.aren zati bat', [
          l('Kupula / kopula', [
            l('Mihiaren sustraia', [
              n('glosofaringeoa', undefined, { note: 'aurrealdea: dastamena eta orokorra' }),
              n('bagoa', undefined, { note: 'atzealdea: dastamena eta orokorra' }),
            ], { note: 'atzeko herena' }),
          ]),
        ]),
        l('Somita okzipitalak', [
          l('Muskulu intrintsekoak', [n('hipoglosoa', undefined, { note: 'XII · motorra' })], { via: 'mioblastoak migratu', move: true }),
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
          n('hodi-tiroglosoa', [
            n('tiroide-guruina', undefined, { via: 'hioidea pasatu', move: true, note: 'krikoidearen mailan · 7. astea' }),
            l('Endekatu', undefined, { gone: true }),
            n('zulo-itsua', undefined, { note: 'aztarna, ildo terminalaren erpinean' }),
          ], { via: 'zoruan ebaginatu', note: '4. astea' }),
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
            n('sudur-hobitxoa', undefined, { note: 'ertzen erdian' }),
            l('Ertz medialak', [
              l('Sudurraren erdiko atala'),
              l('Goiko ezpainaren erdiko atala'),
              l('Maxilar arteko segmentua', [l('Hasierako aho sabaia', undefined, { note: '4 ebakortzak · ebakortz zuloa' })]),
            ], { via: 'fusionatu', note: '10. astea' }),
            l('Ertz lateralak', [l('Sudur hegalak')]),
          ], { note: '5. astea' }),
        ]),
        n('luzapen-maxilarra', [
          l('Goiko ezpainaren alboak'),
          l('Aho sabaiaren gandorrak'),
        ], { note: 'medialera eta aurrera' }),
        n('ildo-nasolagrimala', [
          l('Hodi nasolagrimala', [l('Malko zakua', undefined, { note: 'begiaren erpin medialean' })]),
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
              l('Aho sabai gogorra', [l('Sudur trenkada iritsi', undefined, { note: '10.–12. asteak' })], { via: '+ hasierako aho sabaia', note: 'errafea ebakortz zuloraino' }),
            ], { note: '9. astea' }),
          ], { note: '7. astea' }),
        ], { note: '6. astea · beherantz' }),
      ],
    },
    {
      id: 'hortzaren-jatorriak-18',
      title: 'Hortza: lamina eta papila',
      lead: 'Hortz laminatik esmaltea; beste egitura guztiak papilatik.',
      stage: 'hortzaren-geruzak',
      roots: [
        l('Hortz lamina', [l('Ameloblastoak', [l('Esmaltea', undefined, { note: 'koroan bakarrik' })])], { note: 'epitelioa · ektodermoa · 8. astea' }),
        l('Hortz papila', [
          l('Odontoblastoak', [l('Dentina')]),
          l('Zementoblastoak', [l('Zementoa', undefined, { note: 'sustraiaren kanpoaldean' })]),
          l('Hortz pulpa', undefined, { note: 'hazi ahala estutu' }),
        ], { note: 'mesenkima · 10. astea' }),
      ],
    },
  ],
};

export const SCHEMES_17_18: MigrationTopic[] = [SCHEMES_17, SCHEMES_18];

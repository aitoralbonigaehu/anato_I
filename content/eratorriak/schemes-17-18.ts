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
/** A heading that sorts an arch's branches (the notes' «kartilagoak / nerbioa / muskuluak»), not a structure. */
const g = (label: string, kids: MNode[], extra?: Omit<MNode, 'label' | 'kids' | 'group'>): MNode => ({ label, kids, group: true, ...extra });
const leaf = (label: string, via: string, kids?: MNode[], note?: string) => l(label, kids, { via, note });

export const SCHEMES_17: MigrationTopic = {
  week: 17,
  short: 'Burua eta lepoa I',
  // The notes' order and headings: 1 kraneoa (1.1 neurokraneoa, 1.2 jatorri ezberdinak), 2 faringe-arkuak, then each
  // arch with its own three headings: kartilagoak eta hezurrak, nerbioa, muskuluak.
  flows: [
    {
      id: 'kraneoaren-bi-atalak-17',
      title: 'Kraneoaren bi atalak: neurokraneoa eta errai kraneoa',
      lead: 'Neurokraneoak garuna babesten du eta bi hezurtze mota ditu; errai kraneoa aurpegia da.',
      stage: 'kraneoaren-bi-atalak',
      pitfalls: [
        'Jostura: bi hezurren arteko lotura. Fontanela: bi hezur baino gehiago lotzen diren tokia.',
        'Aurreko fontanela jaio eta 18. hilabetean ixten da; atzekoa, txikiagoa, lehen hilabetean.',
      ],
      roots: [
        n('neurokraneoa', [
          n('buru-ganga', [
            n('fontanelak', undefined, { via: '2 hezur baino gehiago lotzen diren tokian', note: 'aurrekoa 18. hilabetean itxi, atzekoa 1.ean · erditzean buruaren neurria gutxitu' }),
            l('Josturak', undefined, { via: 'bi hezurren arteko lotura' }),
          ], { via: 'atal batzuk mintzez hezurtu', plain: { label: 'Neurokraneoaren atal batzuk' } }),
          l('Oinaldeko hezur gehienak', undefined, { via: 'hezurtze endokondrala' }),
        ], { note: 'garuna inguratu eta babestu' }),
        n('errai-kraneoa', [
          l('Aurpegiko hezur ia guztiak', undefined, { via: 'gandor neuraleko zeluletatik' }),
        ], { note: 'aurpegiko hezurrak' }),
      ],
    },
    {
      id: 'kraneoaren-jatorriak-17',
      title: 'Jatorri ezberdinak: buruan zer dator nondik',
      lead: 'Lau iturri: mesodermo paraxiala, alboko mesodermoa, gandor neurala eta ektodermo plakodak.',
      stage: 'errai-kraneoa',
      pitfalls: [
        'Hiru meninge, bi jatorri: dura materra mesodermo paraxialetik; aragnoidea eta pia materra gandor neuraletik.',
        'Gongoiletako zelulak ez datoz plakodetatik bakarrik: gandor neuraletik ere bai.',
        'Aritenoidea eta krikoidea: alboko mesodermoa (1.2) eta VI. arkua (2.6.2). Bat datoz: arkuen mesenkiman alboko mesodermoko zelulak daude.',
      ],
      roots: [
        n('mesodermo-paraxiala', [
          n('muskulu-somatikoak', undefined, { via: 'errai kraneoko muskuluak', note: 'borondatezkoak' }),
          n('dura-materra', undefined, { via: 'meninge bat' }),
        ]),
        n('alboko-mesodermoa', [
          n('aritenoide-kartilagoa', undefined, { via: 'laringeko kartilago txikiak' }),
          n('krikoide-kartilagoa', undefined, { via: 'laringeko kartilago txikiak' }),
        ]),
        n('gandor-neurala', [
          n('errai-kraneoa', undefined, { via: 'errai kraneoko hezurrak' }),
          l('Beste hezur batzuk', undefined, { via: 'errai kraneotik kanpo', note: 'zelotoki hezurra, loki hezurra ia osoa, esfenoidea' }),
          n('aragnoidea-pia', undefined, { via: 'beste bi meningeak' }),
          n('nerbio-kranialen-gongoilak', undefined, { via: 'zelula batzuk eman', note: 'V, VII, IX eta X' }),
        ]),
        l('Ektodermo plakodak', [
          n('nerbio-kranialen-gongoilak', undefined, { via: 'gongoiletako zelulak eratu', note: 'V, VII, IX eta X' }),
        ], { note: 'ektodermoko metaketak: sudur plakoda, plakoda optikoa…' }),
      ],
    },
    {
      id: 'arkuaren-osagaiak-17',
      title: 'Faringe-arku baten osagaiak',
      lead: 'Arku brankialak ere bai. 4.–5. asteak: mesenkima lodiguneak aurreko hestearen ormetan, estomodeoaren atzean, bikoteka. Lau ikusten dira: V.a endekatu egiten da eta IV.a eta VI.a elkarrekin daude. Kanpoan arraildurak, barnean poltsak.',
      stage: 'arkuaren-osagaiak',
      pitfalls: [
        'Poltsak ez dira «poltsa brankialak»: barruan ateratzen dira, faringe mailan.',
        'Arkuak beti bikoteka. V.ak ez du eratorririk uzten; IV.a eta VI.a elkarrekin daudenez, irudi batzuetan ez da VI.a ageri.',
      ],
      roots: [
        n('faringe-arkuak', [
          l('Ektodermoa', [n('faringe-arraildurak', undefined, { via: 'arkuen artean, kanpoan' })], { via: 'kanpotik estali' }),
          l('Endodermoa', [n('faringe-poltsak', undefined, { via: 'arkuen artean, barnean', note: 'ez dira «poltsa brankialak»' })], { via: 'barrutik estali' }),
          l('Mesenkima', [
            n('mesodermo-paraxiala', [l('Muskuluak', undefined, { via: 'berantago garatu' })], { via: 'zelulak ekarri' }),
            n('gandor-neurala', undefined, { via: 'zelulak ekarri' }),
            n('alboko-mesodermoa', undefined, { via: 'zelulak ekarri' }),
            n('arkuko-kartilagoa', undefined, { via: 'bereizi' }),
            n('arkuko-arteria', undefined, { via: 'bereizi' }),
            n('arkuko-zaina', undefined, { via: 'bereizi' }),
            n('arkuko-nerbioa', undefined, { via: 'bereizi', note: 'arku bakoitzak berea' }),
          ], { via: 'erdian' }),
          n('bosgarren-arkua', [l('Eratorririk ez', undefined, { via: 'endekatu', gone: true })], { via: 'agertu eta desagertu' }),
        ], { note: '4.–5. asteak · lepo mailan' }),
      ],
    },
    {
      id: 'lehen-arkua-eratorriak-17',
      title: 'I. arkua: Meckel, V3 eta murtxikatzaileak',
      lead: 'Meckel endekatu egiten da: goiko muturretik mailua eta ingudea. Baraila haren inguruko mesenkimatik.',
      stage: 'lehen-arkua-kartilagoak',
      pitfalls: [
        'Baraila EZ dator Meckel kartilagotik: haren inguruko mesenkimatik; Meckel gida da eta endekatu egiten da.',
        'Digastrikoak bi jatorri ditu: aurreko sabela I. arkutik (V3), atzeko sabela II.etik (VII).',
        'Muskuluek migratzen dute: nerbioak esaten du zein arkutatik datozen.',
      ],
      roots: [
        n('lehen-arkua', [
          g('Kartilagoak eta hezurrak', [
            n('meckel-kartilagoa', [
              n('mailua', undefined, { via: 'goiko muturretik' }),
              n('ingudea', undefined, { via: 'goiko muturretik' }),
              l('Gainerako kartilagoa', undefined, { via: 'endekatu', gone: true }),
            ], { via: 'arkuko kartilagoa' }),
            n('baraila', undefined, { via: 'Meckelen inguruko mesenkima hezurtu', note: 'EZ kartilagotik: Meckel gida da' }),
            n('hezur-maxilarra', undefined, { via: 'garatu' }),
            n('zigomatikoa', undefined, { via: 'garatu' }),
            n('loki-hezurraren-atal-tinpanikoa', undefined, { via: 'garatu', note: 'kutxa tinpanikoa + hezurtxoen ingurua' }),
            blue(leaf('Tenporalaren ezkata', 'mintzez hezurtu')),
          ]),
          g('Nerbioa', [n('barail-nerbioa', undefined, { via: 'V3', note: 'mistoa: trigeminoaren adar motor bakarra' })]),
          g('Muskuluak', [
            n('maseteroa', undefined, { via: 'baraila igo' }),
            n('muskulu-tenporala', undefined, { via: 'baraila igo' }),
            n('digastrikoaren-aurreko-sabela', undefined, { via: 'baraila jaitsi' }),
            blue(branch('milohioideoa', 'ahoaren zorua osatu')),
          ], { note: 'murtxikatzaileak · V3k mugitu' }),
        ]),
      ],
    },
    {
      id: 'trigeminoa-17',
      title: 'Trigeminoaren hiru adarrak: V3 bakarrik da I. arkukoa',
      lead: 'Buru eta lepoko sentsibilitate orokorra. Hiru adar goitik behera; V3 bakarrik da motorra.',
      stage: 'trigeminoa',
      pitfalls: [
        'V1 eta V2 sentsitiboak dira eta ez dira I. arkukoak; muskuluak V3k bakarrik mugitzen ditu.',
      ],
      roots: [
        n('trigeminoa', [
          n('nerbio-oftalmikoa', undefined, { via: 'aurreko adarra', note: 'gehien bat sentsitiboa · ez da I. arkukoa' }),
          n('nerbio-maxilarra', undefined, { via: 'tarteko adarra', note: 'sentsitiboa · ez da I. arkukoa' }),
          n('barail-nerbioa', undefined, { via: 'azken adarra', note: 'mistoa · I. arkua' }),
        ], { note: 'V. bikotea' }),
      ],
    },
    {
      id: 'bigarren-arkua-eratorriak-17',
      title: 'II. arkua: Reichert, VII eta muskulu mimikoak',
      lead: 'Reichert endekatu egiten da; muturretan bakarrik eratzen dira hezurrak.',
      stage: 'bigarren-arkua',
      pitfalls: [
        'Hioideak bi arku ditu: adar txikiak eta gorputzaren goiko erdia II.etik; beheko erdia eta adar nagusiak III.etik.',
        'I. eta II. arkuetako muskuluak azalekoak dira; III.etik aurrerakoak sakonak.',
      ],
      roots: [
        n('bigarren-arkua', [
          g('Kartilagoak eta hezurrak', [
            n('reichert-kartilagoa', [
              n('ointokia', undefined, { via: 'goiko muturrean' }),
              n('estiloide-apofisia', undefined, { via: 'beste muturrean', note: 'apofisia: hezurraren luzapen txiki orratz itxurakoa · lotailuak barailera eta faringera' }),
              n('lotailu-estilohioideoa', undefined, { via: 'estiloidetik hioidera' }),
              n('hioide-adar-txikia', undefined, { via: 'lepoan' }),
              n('hioide-gorputz-goia', undefined, { via: 'lepoan' }),
              l('Gainerako kartilagoa', undefined, { via: 'endekatu', gone: true }),
            ], { via: 'arkuko kartilagoa' }),
          ]),
          g('Nerbioa', [n('aurpegi-nerbioa', undefined, { via: 'VII', note: 'mistoa, batez ere motorra' })]),
          g('Muskuluak', [
            n('muskulu-mimikoak', undefined, { via: 'larruazalean txertatu' }),
            n('platisma', undefined, { via: 'lepoko azalaren azpian' }),
            n('digastrikoaren-atzeko-sabela', undefined, { via: 'baraila jaisten lagundu' }),
            blue(branch('muskulu-aurikularrak', 'belarri inguruan')),
            blue(branch('okzipitala', 'garezurraren atzealdean')),
            blue(branch('estilohioideoa', 'hioidea igo eta atzeratu')),
          ], { note: 'azalekoak · VII.ak mugitu' }),
        ]),
      ],
    },
    {
      id: 'hirugarren-arkua-eratorriak-17',
      title: 'III. arkua: hioidearen beheko atala, IX eta goiko ertzatzaileak',
      lead: 'Ez dago I. eta II.aren bezalako kartilagorik. Hemendik aurrera muskuluak sakonak dira.',
      stage: 'hirugarren-arkua',
      pitfalls: [
        'Hiru ertzatzaile talde: goikoak III. arkutik (IX), tartekoak eta behekoak IV.etik (X).',
      ],
      roots: [
        n('hirugarren-arkua', [
          g('Hezurrak', [
            n('hioide-gorputz-behea', undefined, { via: 'eratu' }),
            n('hioide-adar-nagusia', undefined, { via: 'eratu' }),
          ]),
          g('Nerbioa', [n('glosofaringeoa', undefined, { via: 'IX', note: 'mistoa · gloso = mihia · mihia eta faringea' })]),
          g('Muskuluak', [
            n('muskulu-estilofaringeoa', undefined, { via: 'faringea igo eta zabaldu', plain: { via: 'IX.ak inerbatu' } }),
            n('goiko-ertzatzailea', undefined, { via: 'faringea estutu' }),
          ], { note: 'sakonak · degluzioa · IX.ak mugitu', plain: { note: 'sakonak · IX.ak mugitu' } }),
        ]),
      ],
    },
    {
      id: 'laugarren-seigarren-eratorriak-17',
      title: 'IV. eta VI. arkuak: laringeko kartilagoak, bagoa eta muskulu sakonak',
      lead: 'Kartilagoak bakarrik: ez hezurrik, ez lotailurik. Tiroide kartilagoa bitan: goikoa IV.etik, behekoa VI.etik.',
      stage: 'laringeko-kartilagoak',
      pitfalls: [
        'IV. eta VI. arkuetan ez dago hezurrik ez lotailurik: laringeko kartilagoak bakarrik.',
        'Tiroide kartilagoa bitan: goiko aldea IV.etik, beheko atala VI.etik.',
        'Trakea ez da arku baten eratorria: aurreko hestetik dator.',
      ],
      plainPitfalls: [
        'IV. eta VI. arkuetan ez dago hezurrik ez lotailurik: laringeko kartilagoak bakarrik.',
        'Tiroide kartilagoa bitan: goiko aldea IV.etik, beheko atala VI.etik.',
      ],
      roots: [
        n('laugarren-arkua', [
          g('Kartilagoa', [n('tiroide-goiko-atala', undefined, { via: 'goranzko adarra' })]),
          g('Nerbioa', [n('goiko-laringe-nerbioa', undefined, { via: 'bagoaren adarra' })]),
          g('Muskuluak', [
            n('tarteko-ertzatzailea', undefined, { via: 'faringea estutu' }),
            n('beheko-ertzatzailea', undefined, { via: 'faringea estutu' }),
          ]),
        ]),
        n('seigarren-arkua', [
          g('Kartilagoak', [
            n('tiroide-beheko-atala', undefined, { via: 'gorputzaren beheko atala' }),
            n('krikoide-kartilagoa', undefined, { via: 'eratu' }),
            n('epiglotisa', undefined, { via: 'eratu', note: '«L» itxura', plain: { note: null } }),
            n('aritenoide-kartilagoa', undefined, { via: 'eratu', note: 'bikoitza' }),
            n('kartilago-kornikulatua', undefined, { via: 'eratu', note: 'bikoitza' }),
            n('kartilago-kuneiformea', undefined, { via: 'eratu', note: 'bikoitza' }),
          ]),
          g('Nerbioa', [n('laringe-atzerakaria', undefined, { via: 'bagoaren adarra' })]),
          g('Muskuluak', [n('laringe-barneko-muskuluak', undefined, { via: 'hedatu', note: 'intrintsekoak', plain: { note: null } })]),
        ]),
      ],
    },
    {
      id: 'bagoa-17',
      title: 'Nerbio bagoa: IV. eta VI. arkuetara adar bana',
      lead: 'X. bikotea, mistoa eta parasinpatiko nagusia.',
      stage: 'bagoa',
      pitfalls: [
        'Goiko laringe nerbioa eta laringe nerbio atzerakaria, biak bagoaren adarrak: IV.era goikoa, VI.era atzerakaria.',
      ],
      roots: [
        n('bagoa', [
          n('goiko-laringe-nerbioa', [
            n('tarteko-ertzatzailea', undefined, { via: 'inerbatu' }),
            n('beheko-ertzatzailea', undefined, { via: 'inerbatu' }),
          ], { via: 'IV. arkura' }),
          n('laringe-atzerakaria', [n('laringe-barneko-muskuluak', undefined, { via: 'inerbatu' })], { via: 'VI. arkura' }),
          l('Toraxeko eta abdomeneko erraiak', undefined, { via: 'parasinpatikoki inerbatu', note: 'bihotza; aurreko eta tarteko hestearen eratorriak' }),
        ], { note: 'X. bikotea · NSZtik' }),
      ],
    },
    {
      id: 'nerbio-sistema-17',
      title: 'Nerbio-sistema sailkatzeko bi irizpide',
      // 2.6.1 p7–p14 is grey in the notes: not taught this year (topic 19 teaches it).
      blue: true,
      lead: 'Bagoa (X) mistoa da, NSZtik ateratzen da eta parasinpatiko nagusia da.',
      stage: 'bagoa',
      pitfalls: ['Parasinpatikoa ez da «inhibitzailea»: egoera aktibotik egoera basal edo normalera itzultzen du.'],
      roots: [
        l('Irizpide anatomikoa', [
          l('Nerbio-sistema zentrala', undefined, { via: 'kokapena', note: 'bagoa hemendik ateratzen da, burmuinetik' }),
          l('Nerbio-sistema periferikoa', undefined, { via: 'kokapena' }),
        ], { note: 'kokapenaren arabera' }),
        l('Irizpide funtzionala', [
          l('Begetatiboa edo autonomoa', [
            l('Sinpatikoa', undefined, { via: 'aktibatu' }),
            l('Parasinpatikoa', undefined, { via: 'egoera basalera itzuli', note: 'bagoa da nagusiena' }),
          ], { via: 'ez-borondatezko ekintzak', note: 'adibidez erreflexuak' }),
          l('Somatikoa', undefined, { via: 'borondatezko ekintzak' }),
        ], { note: 'funtzioaren arabera' }),
      ],
    },
  ],
};

export const SCHEMES_18: MigrationTopic = {
  week: 18,
  short: 'Burua eta lepoa II',
  // The notes' order: 1 poltsak (1.1) eta arraildurak (1.2) with the descent, 2 mihia, 3 tiroidea (and the thymus),
  // 4 aurpegia: sudur plakodak, aho sabaia, sudurra (4.1) and hortzak (4.2).
  flows: [
    {
      id: 'poltsen-eratorriak-18',
      title: 'Lau poltsak eta haien eratorriak',
      lead: 'Poltsak barruko inbaginazioak dira, endodermikoak, arkuen artean. 4. astean hasi eta 7.erako ia garatuta.',
      stage: 'arraildurak-poltsak',
      pitfalls: [
        '6 arku eta 4 poltsa: azken poltsa (4.a eta 5.a) BATERA ikasten dugu.',
        'Ez dira «poltsa brankialak»: barruan ateratzen dira, faringe mailan.',
      ],
      roots: [
        n('lehen-poltsa', [
          n('eustakioren-tronpa', undefined, { via: 'hurbileko atala, hodi forma', note: 'tarteko belarria eta faringea komunikatu' }),
          n('tinpano-kutxa', undefined, { via: 'muturra zabaldu', note: 'hiru hezurtxoak barruan: mailua eta ingudea I. arkutik, ointokia II.etik' }),
        ], { note: 'sakondu: sakonune tubotinpanikoa' }),
        n('bigarren-poltsa', [
          n('aho-sabaiko-amigdala', undefined, { via: '5. astean zelulak bereizi', note: 'ehun linfatikoa 3.–5. hilabetean · funtzionala 5. hilabetean' }),
        ]),
        n('hirugarren-poltsa', [
          n('beheko-paratiroidea', undefined, { via: 'alde dortsala', note: 'paratohormona', plain: { note: null } }),
          n('timoa', undefined, { via: 'alde bentrala', note: 'immunitatea · pubertarotik endekatu' }),
        ], { note: 'bi kimu, biak jaitsi' }),
        n('laugarren-poltsa', [
          n('goiko-paratiroidea', undefined, { via: 'alde dortsala' }),
          n('gorputz-ultimobrankiala', [
            n('c-zelulak', undefined, { via: 'tiroidean barneratu', move: true, note: 'kaltzitonina: kaltzioaren erregulazioa' }),
          ], { via: 'alde bentrala' }),
        ], { note: 'bi kimu' }),
      ],
    },
    {
      id: 'guruinen-jaisketa-18',
      title: 'Jaisketa: izena azken kokapenarena da, ez sorrerarena',
      lead: 'Goikaldean behekoa eratzen da eta behekaldean goikoa.',
      stage: 'guruinen-jaisketa',
      pitfalls: [
        '3. poltsatik BEHEKO paratiroideak, 4.etik GOIKOAK: timoak eramaten ditu behekoak beherago.',
        'Tiroidearen atzealdean, irekita dagoen tokian, 4 paratiroide: 2 goian eta 2 behean.',
      ],
      roots: [
        n('hirugarren-poltsa', [
          n('beheko-paratiroidea', [l('Tiroidearen atzean, behean', undefined, { via: 'timoarekin jaitsi', move: true })], { via: 'alde dortsala', note: 'paratohormona', plain: { note: null } }),
          n('timoa', [l('Tiroidearen behekaldea, lepoan', undefined, { via: 'behera eta medialera jaitsi', move: true })], { via: 'alde bentrala', note: 'immunitatea · pubertarotik endekatu' }),
        ], { note: 'bi kimu, biak jaitsi' }),
        n('laugarren-poltsa', [
          n('goiko-paratiroidea', [l('Tiroidearen atzean, goian', undefined, { via: 'gutxi jaitsi', move: true })], { via: 'alde dortsala' }),
          n('gorputz-ultimobrankiala', [n('tiroide-guruina', undefined, { via: 'jaitsi eta barneratu', move: true, note: 'C zelulak' })], { via: 'alde bentrala' }),
        ], { note: 'bi kimu' }),
      ],
    },
    {
      id: 'arrailduren-eratorriak-18',
      title: 'Arraildurak: lehenak tinpano mintza ematen du, besteak estaltzen dira',
      lead: 'Arraildurak kanpoko inbaginazioak dira, ektodermikoak, arkuen artean, poltsen kontrako aldean.',
      stage: 'lehen-arraildura',
      pitfalls: [
        'Lehen arraildura eta poltsa batu egiten dira, ez fusionatu: muga ez da irekitzen, eta tinpano mintza geratzen da.',
        'Tinpano mintza oso fina da baina hiru jatorri ditu.',
      ],
      roots: [
        n('lehen-arraildura', [
          n('kanpoko-entzumen-hodia', undefined, { via: 'arraildurak iraun', blue: true }),
          n('tinpano-mintza', [
            n('tinpano-kanpoko-epitelioa', undefined, { via: 'kanpoan', note: 'ektodermoa' }),
            n('tinpano-tarteko-geruza', undefined, { via: 'tartean', note: 'mesodermoa, oso fina' }),
            n('tinpano-barneko-epitelioa', undefined, { via: 'barnean', note: 'endodermoa' }),
          ], { via: 'sakondu, luzatu eta poltsarekin batu' }),
        ]),
        n('faringe-arraildurak', [
          l('Estali eta desagertu', undefined, { via: 'II. arkuaren mesenkima beherantz hazi', gone: true, note: '3. eta 4.aren gainetik, goragune epikardikoarekin fusionatu' }),
          n('sinu-zerbikala', [
            l('Likido serosoa, lepoan bultoa', undefined, { via: 'infekzio batekin, helduetan', note: 'xiringaz kendu · ez da larria' }),
          ], { via: 'batzuetan iraun', note: 'lepoko sinua: barrunbe bat, normalean arazorik gabe' }),
        ], { note: 'gainerakoak' }),
      ],
    },
    {
      id: 'mihiaren-jatorria-18',
      title: 'Mihiaren jatorria: gorputza I. arkutik, sustraia II.–IV.etik',
      lead: 'Arku guztietatik (1–4) dator, 4.–8. asteetan. Muskuluak, berriz, somita okzipitaletatik.',
      stage: 'mihiaren-gorputza',
      pitfalls: [
        'Mihiaren gorputz osoa I. arkutik dator: bi goragune lateralak + tuberkulu bakoitia.',
        'Ildo terminalaren erpinean zulo itsua dago: tiroidearen bidearen hasiera.',
      ],
      roots: [
        n('lehen-arkua', [
          l('Bi goragune lateral + tuberkulu bakoitia', [n('mihiaren-gorputza', undefined, { via: 'hirurak fusionatu', note: 'gorputz osoa I. arkutik' })], { via: 'erdirantz atera', note: 'tuberkulua bien artean' }),
        ]),
        l('II., III. eta IV. arkuak', [
          n('kupula', [n('mihiaren-sustraia', undefined, { via: 'sortu', note: 'barnean; leporaino luzatu' })], { via: 'erdian goragune bat' }),
        ]),
        n('ildo-terminala', [n('zulo-itsua', undefined, { via: 'erpinean' })], { via: 'gorputzaren eta sustraiaren artean', note: 'V itxura' }),
        n('somita-okzipitalak', [n('mihiaren-muskuluak', undefined, { via: 'mioblastoak', note: 'intrintsekoak · ez arkuetatik' })]),
      ],
    },
    {
      id: 'mihiaren-inerbazioa-18',
      title: 'Mihiaren inerbazioa: atal bakoitza, bere nerbioak',
      lead: 'Arku bakoitzari nerbio bat dagokio; horregatik da konplexua. XII.ak mugitzen du, besteak sentsitiboak dira mihian.',
      stage: 'mihiaren-inerbazioa',
      pitfalls: [
        'Gorputzean bi nerbiok lana banatzen dute (V3 sentsibilitate orokorra, VII dastamena). Sustraian nerbio bakoitzak biak hartzen ditu: IX aurrean, X atzean.',
        'Hipoglosoa (XII) motor somatikoa da eta ez dago arkuekin lotuta. Gloso = mihia.',
      ],
      roots: [
        n('mihiaren-gorputza', [
          n('barail-nerbioa', undefined, { via: 'sentsibilitate orokorra', note: 'V3 · ukimena, mina, tenperatura, testurak' }),
          n('aurpegi-nerbioa', undefined, { via: 'dastamena', note: 'VII · dastamen botoiak' }),
        ]),
        n('mihiaren-sustraia', [
          n('glosofaringeoa', undefined, { via: 'aurreko atala: dena', note: 'IX · dastamena eta sentsibilitate orokorra' }),
          n('goiko-laringe-nerbioa', undefined, { via: 'atzeko atala: dena', note: 'X (bagoaren adarra) · dastamena eta sentsibilitate orokorra' }),
        ]),
        n('mihiaren-muskuluak', [n('hipoglosoa', undefined, { via: 'mugitu', note: 'XII · motorra, borondatezkoa' })], { note: 'intrintsekoak' }),
      ],
    },
    {
      id: 'tiroidearen-bidea-18',
      title: 'Tiroidea: mihiaren erdian sortu eta lepora jaitsi',
      lead: '4. astean sortu, gorago, eta 7. asterako behin betiko tokian eta itxuran. Jaio aurreko 3. hilabetean funtzionala.',
      stage: 'tiroidea-jaisketa',
      pitfalls: [
        'Hodi tiroglosoa gida da: jaisten den bitartean tiroidea faringearen zoruari lotuta dago, gero hodia itxi eta endekatu.',
        'Piramide itxurako lobulua (%50 edo gehiago): hodiaren azken atala ondo endekatzen ez bada. Anomalia da, baina ez du arazorik ematen.',
      ],
      // 3/p11 (lobes, isthmus), 3/p13 (pyramidal lobe) and 3/p14 (thymus) are grey in the notes: not taught this year.
      plainPitfalls: ['Hodi tiroglosoa gida da: jaisten den bitartean tiroidea faringearen zoruari lotuta dago, gero hodia itxi eta endekatu.'],
      roots: [
        n('faringe-hestea', [
          n('hodi-tiroglosoa', [
            n('tiroide-guruina', [
              n('tiroide-lobuluak', undefined, { via: 'bi lobulu luzanga', note: 'laringeko kartilagoak besarkatu', blue: true }),
              n('tiroide-istmoa', undefined, { via: 'aurrean lotu', blue: true }),
              l('Atzean irekita', [n('goiko-paratiroidea', undefined, { via: 'goian' }), n('beheko-paratiroidea', undefined, { via: 'behean' })], { via: 'atzean ez dago lotuta' }),
            ], { via: 'muturrean hasikina, beherantz jaitsi', move: true, note: '7. astean behin betiko tokian' }),
            n('zulo-itsua', undefined, { via: 'hodia itxi eta endekatu: aztarna', note: 'ildo terminalaren erpinean' }),
            n('piramide-lobulua', undefined, { via: 'azken atala endekatu ez bada', note: 'anomalia, arazorik gabe', blue: true }),
          ], { via: 'zoruan luzapena, erdian hodia', note: 'mihiaren gorputzaren eta sustraiaren artean · 4. astea' }),
        ]),
        n('timoa', [l('Tiroidearen behekaldea', undefined, { via: 'lepo mailara jaitsi', move: true })], { note: 'handia enbrioian · pubertarotik endekatu', blue: true }),
      ],
    },
    {
      id: 'aurpegiaren-hasiera-18',
      title: 'Aurpegia hasieran: estomodeoaren inguruko bost goragune',
      lead: '4. astearen bukaeran hasi eta 12. astearen inguruan amaitu. Egiturak lateralak dira hasieran eta medialera eta aurrera mugitzen dira.',
      stage: 'aurpegia-hasiera',
      pitfalls: ['Hobitxoak ez dira begiak, sudur plakodak baizik; begiak guztiz lateralki agertzen dira.'],
      roots: [
        n('estomodeoa', [
          n('goragune-frontonasala', [n('sudur-plakoda', undefined, { via: 'bi plakoda agertu', note: 'ektodermikoak · gero sudur hobiak' })], { via: 'goian' }),
          n('luzapen-maxilarra', undefined, { via: 'alboetan, goian', note: 'I. arkua' }),
          n('barail-luzapena', undefined, { via: 'alboetan, behean', note: 'I. arkua' }),
          n('mintz-bukofaringeoa', undefined, { via: 'barnerago', note: 'endodermikoa', plain: { note: null } }),
        ], { note: 'hasierako ahoa · ektodermoa' }),
      ],
    },
    {
      id: 'aurpegiaren-osagaiak-18',
      title: 'Sudur plakodak eta luzapen maxilarrak: zer ematen duten',
      lead: '5. astean sudur plakodak; 6.–7. asteetan aurrera eta erdira; 10. astean aurpegiak aurpegi itxura du.',
      stage: 'aurpegi-fusioa',
      pitfalls: [
        'Goiko ezpainak bi jatorri ditu: erdia sudur plakoden ertz medialetatik, alboak luzapen maxilarretatik.',
        '10. astean ez dago ildo nasolagrimalik: hodi nasolagrimala baizik.',
      ],
      roots: [
        n('sudur-plakoda', [
          n('sudur-hobitxoa', undefined, { via: 'erdia sakondu', note: 'usaimen hobitxoa' }),
          n('sudur-ertz-mediala', [
            l('Sudurraren erdiko atala', undefined, { via: '10. astean fusionatu' }),
            n('goiko-ezpainaren-erdiko-atala', undefined, { via: '10. astean fusionatu' }),
          ], { via: 'barneko ertza' }),
          n('sudur-ertz-laterala', [l('Sudur hegalak', undefined, { via: 'eman' })], { via: 'kanpoko ertza' }),
        ], { note: '5. astea · luzapen maxilarraren gainean' }),
        n('luzapen-maxilarra', [
          l('Goiko ezpainaren alboak', undefined, { via: 'medialera eta aurrera, fusionatu' }),
          n('aho-sabai-gandorrak', undefined, { via: 'barnean, erdirantz hazi' }),
        ]),
        n('maxilar-arteko-segmentua', [
          l('Ezpainaren zati bat', undefined, { via: 'kanpoan' }),
          l('4 ebakortzen hezur maxilarraren atala', undefined, { via: 'hezurra' }),
          n('hasierako-aho-sabaia', undefined, { via: 'barnean', note: 'hirukia; erpinean ebakortz zuloa' }),
        ], { note: 'ertz medialak + luzapen maxilarrak fusionatuta' }),
        n('ildo-nasolagrimala', [
          n('hodi-nasolagrimala', [n('malko-zakua', undefined, { via: 'goian zabaldu', note: 'begiaren erpin medialean' })], { via: 'begiak aurrera etortzean eraldatu', note: 'begia eta sudur barrunbea komunikatu' }),
        ], { note: 'ertz lateralaren eta luzapen maxilarraren artean' }),
      ],
    },
    {
      id: 'aho-sabaiaren-asteak-18',
      title: 'Aho sabaia: hiru atal, astez aste',
      lead: 'Aho sabai gogorra = hasierako aho sabaia + bi gandorrak (luzapen maxilarretatik).',
      stage: 'aho-sabai-gandorrak',
      pitfalls: [
        'Errafea ez da ebakortzetaraino heltzen: ebakortz zuloan gelditzen da.',
        'Atzeko aldea ez da inoiz hezurtzen: aho sabai biguna, ubularaino.',
        'Ondo fusionatzen ez bada: erbi-ezpaina (alde batekoa edo aldebikoa) edo aho sabai arraila; janaria sudurrera pasa daiteke. Kirurgiaz konpontzen dira.',
      ],
      roots: [
        n('aho-sabai-gandorrak', [
          l('Horizontalizatu, mihiaren gainean', [
            n('aho-sabaiko-errafea', undefined, { via: '9. astean erdian fusionatu', note: 'ebakortz zuloraino' }),
            n('aho-sabai-gogorra', undefined, { via: 'hasierako aho sabaiarekin batu', note: 'aurreko aldea, hezurrezkoa' }),
            n('aho-sabai-biguna', undefined, { via: 'atzean ez da hezurtzen', note: 'ubularaino' }),
          ], { via: '7. astean', note: 'mihia behera' }),
        ], { note: '6. astea: mihiaren azpian, beherantz' }),
        n('hasierako-aho-sabaia', [n('aho-sabai-gogorra', undefined, { via: 'gandorrekin batu' })], { note: 'ertz medialetatik' }),
        l('Ondo fusionatzen ez bada', [
          n('erbi-ezpaina', undefined, { via: 'kanpoan, ezpainetan', note: 'alde batekoa edo aldebikoa' }),
          n('aho-sabai-arraila', undefined, { via: 'aho sabaia bera', note: 'janaria sudurrera pasa daiteke' }),
        ], { note: 'kirurgiaz konpondu' }),
      ],
    },
    {
      id: 'sudurraren-garapena-18',
      title: 'Sudurra barrutik: trenkada, korneteak eta koanak',
      lead: 'Aho sabaia garatzen den bitartean, sudur barrunbeak ere bai. Aurrealdea kartilagozkoa, atzealdea hezurrezkoa.',
      stage: 'koanak',
      pitfalls: [
        'Beheko kornetea hezur propioa da; goikoa eta tartekoa etmoidearen atalak.',
        'Sudurrak 4 zulo: 2 narina kanpoan eta 2 koana barruan. Koanak aurrean sortu eta atzerantz mugitzen dira, faringera.',
      ],
      roots: [
        l('Etmoides hezurra', [
          n('sudur-trenkada', undefined, { via: '7. astetik beherantz hazi', note: '10.–12. astean aho sabaiarekin fusionatu · bi sudur barrunbe' }),
          n('goiko-kornetea', undefined, { via: 'etmoidearen atala' }),
          n('tarteko-kornetea', undefined, { via: 'etmoidearen atala' }),
        ]),
        n('beheko-kornetea', undefined, { note: 'hezur propioa, soltea' }),
        n('sudur-hobitxoa', [
          n('narina', undefined, { via: 'kanpoan', note: '2' }),
          n('mintz-bukonasala', [
            n('koana', undefined, { via: '7. astean apurtu: hasierako koana', note: '2 · gero atzerantz, faringera' }),
          ], { via: '6. astean sakondu', note: 'sudurra eta ahoa bereizi' }),
        ]),
      ],
    },
    {
      id: 'hortzaren-aroak-18',
      title: 'Hortzak: laminatik kanpaira',
      lead: 'Hortzak eta haginak berdin eratzen dira, barailaren eta hezur maxilarraren gaineko epitelioan.',
      stage: 'txano-kanpai',
      roots: [
        l('Aho epitelioa', [
          n('hortz-lamina', [
            l('Hortz hasikinak', [
              n('txanoa', [
                n('kanpaia', undefined, { via: 'laminatik askatu', note: '3. hilabetea · kanpai aroa' }),
              ], { via: 'zelulak bereizi', note: '10. astea · txano aroa' }),
            ], { via: 'mesenkimara inbaginatu', note: '8. astea · hezurrean sartu' }),
          ], { via: 'loditu', note: '8. astea' }),
        ], { note: 'ektodermikoa, barnean mesenkima' }),
        n('hortz-papila', undefined, { via: 'txanoaren barneko mesenkima', note: 'gandor neuraletik' }),
      ],
    },
    {
      id: 'hortzaren-jatorriak-18',
      title: 'Hortzaren geruzak: zein zelulak zer eratzen duen',
      lead: 'Dentina kanpotik esmaltez babestuta, eta zementoz eta hezurrez sustraian.',
      stage: 'hortzaren-geruzak',
      pitfalls: [
        'Esmaltea gorputzeko ehunik gogorrena da eta koroan bakarrik dago; dentinak ematen dio sentsibilitatea hortzari.',
        'Zementoblastoak odontoblasto batzuk bereizita sortzen dira.',
      ],
      roots: [
        n('kanpaia', [
          n('ameloblastoak', [n('esmaltea', undefined, { via: 'eratu', note: 'koroan bakarrik, dentinaren gainean' })], { via: 'kanpoko geruza, epiteliotik' }),
        ]),
        n('hortz-papila', [
          n('odontoblastoak', [
            n('dentina', undefined, { via: 'eratu', note: 'barneko epitelioaren kontra' }),
            n('zementoblastoak', [
              n('zementoa', [n('lotailu-periodontalak', undefined, { via: 'hezurrera lotu', note: 'zementoaren eta albeoloen artean' })], { via: 'eratu', note: 'sustraian, dentina babestu' }),
            ], { via: 'batzuk gehiago bereizi' }),
          ], { via: 'bereizi' }),
          n('hortz-pulpa', [n('pulpa-hodiak', undefined, { via: 'pasatu' }), n('pulpa-nerbioa', undefined, { via: 'pasatu' })], { via: 'erdian', note: 'hortza hazi ahala estutu' }),
        ]),
      ],
    },
    {
      id: 'hortz-motak-18',
      title: 'Esne hortzak eta behin betikoak',
      lead: 'Behin betikoek sakatzen dituzte esnekoak: haiek gabe ez dira erortzen.',
      stage: 'esne-behin-betiko',
      pitfalls: ['Agenesia: behin betikoa eratzen ez bada, esnekoa ez da erortzen; 14–16 urte bitartean atera eta beste bat jarri behar da.'],
      roots: [
        n('esne-hortzak', undefined, { note: '6. hilabetetik 24.era ateratzen' }),
        n('behin-betiko-hortzak', [
          n('esne-hortzak', undefined, { via: 'sakatu eta erorarazi' }),
        ], { note: 'jaio aurreko 3. hilabetean eratu, bigarren ilaran · 6 urterekin ateratzen hasi' }),
      ],
    },
  ],
};

export const SCHEMES_17_18: MigrationTopic[] = [SCHEMES_17, SCHEMES_18];

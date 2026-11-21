import type { MigrationTopic, MNode } from '../migrations';

/**
 * Topic 19 (nerbio sistema), in the notes' order and from their plain text only: the blue text (talamoa, kortexa,
 * mugimendu erreflexuak 5.1…) is not taught this year and is left out. Long pathways are split under step headings
 * so each map stays readable on a tablet.
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
      lead: 'Enbrioian dena luzetara dago. Helduan ornomuina bertikala da eta burmuina horizontala, eta norabideen izenak aldatzen dira.',
      stage: 'mozketak-ardatzak',
      pitfalls: [
        'Burmuinean dortsala ez da atzekoa, goikoa baizik; bentrala behekoa da (burmuinaren oinaldea).',
        'Burmuinaren atzekaldea okzipitala da, ez kaudala. Aurrekaldea rostrala (frontala ere bai).',
        'Ornomuinean zeharkako mozketak erabiltzen dira, ez horizontalak.',
      ],
      roots: [
        l('Mozketa motak', [
          leaf('Horizontala', 'lurraren paraleloa', undefined, 'gainerako gorputzeko zeharkakoaren baliokidea'),
          leaf('Frontala edo koronala', 'ezkerretik eskuinera'),
          leaf('Sagitala', 'aurretik atzera, bertikalki'),
        ]),
        n('ornomuina', [
          leaf('Dortsala = atzekoa', 'bertikalki dagoelako'),
          leaf('Bentrala = aurrekoa', 'bertikalki dagoelako'),
        ], { note: 'bertikala · zeharkako mozketak' }),
        n('entzefaloa', [
          leaf('Dortsala = goikoa', 'horizontalki dagoelako'),
          leaf('Bentrala = behekoa', 'oinaldea'),
          leaf('Rostrala = aurrekaldea', 'frontala ere esaten da'),
          leaf('Okzipitala = atzekaldea', 'kaudala ez'),
        ], { note: 'burmuina · horizontala' }),
      ],
    },
    {
      id: 'kokapen-sailkapena-19',
      title: 'Kokapenaren araberako sailkapena: zentrala eta periferikoa',
      lead: 'Hezurrez babestuta dagoena zentrala da; hortik kanpora ateratzen diren nerbio guztiak, periferikoa.',
      stage: 'zentrala-periferikoa',
      pitfalls: [
        'Kokapena eta funtzioa bi sailkapen dira eta ezin dira batu: zentralean eta periferikoan, biotan daude somatikoa eta autonomoa.',
        'Muina = hezurrez inguratuta dagoena: burmuina eta bizkarmuina bai, nerbioak ez.',
        'Sareetan nerbioen adarrak nahasten dira, baina ez dira inoiz fusionatzen.',
      ],
      roots: [
        n('nerbio-sistema-zentrala', [
          branch('entzefaloa', 'garezurraren barruan'),
          branch('ornomuina', 'bizkarrezurraren barruan', undefined, 'bizkar muina'),
        ], { note: 'hezurrez babestua · bi atalak jarraiak' }),
        n('nerbio-sistema-periferikoa', [
          branch('nerbio-kranialak', 'kraneotik atera', undefined, 'bikote kranealak'),
          branch('nerbio-espinalak', 'ornomuinetik atera, bikoteka', undefined, 'ezkerrera eta eskuinera'),
        ], { note: 'hezurrez babestu gabeko nerbioak' }),
        n('nerbio-sareak', [
          leaf('Sare zerbikala', 'lepo mailan'),
          leaf('Sare brankiala', 'goiko gorputz adarra inerbatu'),
          leaf('Sare lunbosakroa', 'lunbarra + sakroa nahastu', undefined, 'beheko gorputz adarra · adib. nerbio ziatikoa'),
        ], { note: 'nerbio espinalen adarrak nahastu, ez fusionatu' }),
      ],
    },
    {
      id: 'sailkapen-funtzionala-19',
      title: 'Sailkapen funtzionala: somatikoa eta autonomoa',
      lead: 'Somatikoa borondatezkoa da. Autonomoak erraiak mugitzen ditu gure borondatetik kanpo, bi sistema kontrajarrirekin.',
      stage: 'somatikoa-autonomoa',
      pitfalls: [
        'NSZean biak osagarriak dira: parasinpatikoa bi muturretan (garunean, bikote kranealak; eta ornomuinaren alde sakroan, S2–S4), sinpatikoa tartean.',
        'Sinpatikoa T1–T12 (eremu toraxikoa); gai grisaren alboko adarrak, neurona sinpatikoen somekin, T1etik L2ra.',
        'Autonomoaren bikote kraneal guztiak parasinpatikoak dira (adib. bagoa), baina bikote kraneal guztiak ez dira parasinpatikoak.',
      ],
      // «S2–S4» and «bagoa» are blue in the notes (2/p13–p14): not taught this year.
      plainPitfalls: [
        'NSZean biak osagarriak dira: parasinpatikoa bi muturretan (garunean, bikote kranealak; eta ornomuinaren alde sakroan), sinpatikoa tartean.',
        'Sinpatikoa T1–T12 (eremu toraxikoa); gai grisaren alboko adarrak, neurona sinpatikoen somekin, T1etik L2ra.',
        'Autonomoaren bikote kraneal guztiak parasinpatikoak dira, baina bikote kraneal guztiak ez dira parasinpatikoak.',
      ],
      roots: [
        l('Nerbio sistema somatikoa', [
          leaf('Borondatezko mugimenduak', 'gauzak borondatez mugitu', undefined, 'gorputz adarrak, lepoa, burua…'),
        ]),
        n('nerbio-sistema-begetatiboa', [
          branch('sistema-sinpatikoa', 'estresa, ihesa, emergentzia', [
            leaf('Bihotza', 'erritmoa arindu', undefined, 'takikardia'),
            leaf('Bronkioak', 'zabaldu', undefined, 'bronkodilatazioa'),
            leaf('Izerdi guruinak', 'aktibatu'),
            leaf('Begi-ninia', 'dilatatu'),
            leaf('Esfinterrak', 'itxi'),
            leaf('Ahoa', 'lehortu'),
            leaf('Peristaltismoa', 'jaitsi'),
          ], 'T1–T12, eremu toraxikoan'),
          { ...branch('sistema-parasinpatikoa', 'lasaitasuna, egoera basalera itzuli', [
            leaf('Bihotza', 'erritmoa jaitsi'),
            leaf('Bronkioak', 'estutu', undefined, 'bronkokonstrikzioa'),
            leaf('Esfinterrak', 'zabaldu'),
            leaf('Peristaltismoa', 'normaltasunera itzuli', undefined, 'gosea eman'),
          ], 'S2–S4 eta entzefaloan · erlaxazioa'), plain: { note: 'erlaxazioa' } },
        ], { note: 'autonomoa · ez borondatezkoa: erraiak' }),
      ],
    },
    {
      id: 'sustraiak-gongoila-19',
      title: 'Sustraiak eta gongoila: sentsitiboa atzean, motorra aurrean',
      lead: 'Atzeko sustraitik sartzen dira sentsazioak; aurrekotik irteten da agindu motorra. Nerbio espinalean bien axoiak batzen dira.',
      stage: 'sustraiak-gongoila',
      pitfalls: [
        'Gongoila atzeko sustraian bakarrik dago, eta haren neuronak sentsitiboak bakarrik dira.',
        'Nerbio espinala mistoa da: axoi sentsitiboak eta motorrak batu egiten dira, ez fusionatu. Nerbio periferiko guztietan berdin.',
        'Sustraitxoak multzokatuta sustrai bakarra sortzen dute. Nerbioak = neuronen axoi multzoak, «kableak» bezala.',
        'Sentsibilitate orokorra larruazaletik (ukimena, mina, tenperatura, testura); bereziak usaimena, dastamena…',
      ],
      roots: [
        n('ornomuina', [
          branch('atzeko-sustraia', 'dortsala · sentsitiboa bakarrik', undefined, 'atzeko sustraitxoen multzoa · gongoila'),
          branch('aurreko-sustraia', 'bentrala · motorra bakarrik', undefined, 'aurreko sustraitxoen multzoa'),
        ]),
        n('gongoil-errakideoak', [
          branch('neurona-sentsitiboa', 'soma hemen', [
            leaf('Luzapen zentripetoa', 'ornomuinerantz, zentrora'),
            leaf('Luzapen zentrifugoa', 'nerbiotik periferiara'),
          ]),
        ], { note: 'atzeko sustraian bakarrik' }),
        n('nerbio-espinalak', [
          leaf('Axoi sentsitiboak', 'atzeko sustraitik'),
          leaf('Axoi motorrak', 'aurreko sustraitik'),
        ], { note: 'mistoa · batu, ez fusionatu' }),
      ],
    },
    {
      id: 'borondatezko-bidea-19',
      title: 'Borondatezko mugimendua: estimulutik muskulura',
      lead: 'Ikasi egiten da, ez da innatoa (umeak erretzean eskua kentzen ikasten du). Sentsazioa burmuineraino iritsi behar da kontziente egiteko; dena milisegundutan.',
      stage: 'borondatezko-mugimenduak',
      pitfalls: [
        'Sentsazioa kortex somatosentsitibora iristen ez bada, ez dugu nabaritzen.',
        'Axoi sentsitiboak ornomuinean sinaptatu ordez luzatu eta burmuinean edo erraboilean egin dezake sinapsia.',
        'Agindu motorraren axoia motzagoa da goiko gorputz adarretarako, luzeagoa behekoetarako.',
      ],
      roots: [
        l('Borondatezko mugimendua', [
          g('Gorantz: sentsazioa', [
            branch('gongoil-errakideoak', '1 · larruazaleko nerbiotik estimulua iritsi'),
            branch('atzeko-sustraia', '2 · ornomuinera sartu'),
            branch('gai-grisa', '3 · sinapsia beste neurona batekin'),
            branch('gai-zuria', '4 · gorantz, burmuinera'),
            branch('kortex-sentsitiboa', '5 · sentsazioa nabaritu', undefined, 'kontziente egin'),
          ]),
          g('Beherantz: agindua', [
            branch('kortex-motorra', '6 · kortex sentsitibotik informazioa jaso'),
            leaf('Gai zuria, beherantz', '7 · axoiak ornomuinean behera'),
            branch('motoneurona', '8 · nahi den mailan agindua eragin'),
            branch('aurreko-sustraia', '9 · ornomuinetik irten'),
            leaf('Muskulua', '10 · mugimendua'),
          ]),
        ], { note: 'ikasia, ez innatoa' }),
      ],
    },
    {
      id: 'aktu-erreflexua-19',
      title: 'Aktu erreflexua: erantzuna ornomuinean bertan',
      lead: 'Estimulua ez da burmuineraino garraiatzen: ornomuinean prozesatu eta bertatik erantzuten da. Oso arinak dira eta ez borondatezkoak.',
      stage: 'aktu-erreflexua',
      pitfalls: [
        'Erreflexuan burmuina ez da tartean; borondatezko mugimenduan kortexeraino igo behar da.',
        'Benetako ornomuinaren argazkian estalki gogorra, plastiko itxurakoa, dura materra da: moztu eta zabaldu behar da ornomuina ikusteko.',
      ],
      roots: [
        l('Aktu erreflexua', [
          branch('neurona-sentsitiboa', '1 · larruazaleko estimulua ornomuinera eraman'),
          branch('motoneurona', '2 · ornomuinean bertan informazioa jaso'),
          leaf('Muskulua', '3 · agindua bidali', undefined, 'adib. hanka mugitu'),
        ], { note: 'adib. mailuarekin belauna kolpatu' }),
      ],
    },
    {
      id: 'meningeak-19',
      title: 'Meningeak: hiru mintz, kanpotik barnera',
      lead: 'Nerbio sistema zentrala babesten dute; 25.–35. egunetan (5.–8. astean) eratzen dira. Bi jatorri: dura materra mesodermotik, beste biak gandor neuraletik.',
      stage: 'meningeak',
      pitfalls: [
        'Garunean ez dago eremu epiduralik: dura materra kraneoari itsatsita dago. Bizkarrezurrean ez dago lotuta.',
        'Eremu azpiaraknoideoa araknoidesaren eta pia materraren artean dago; dura materra eta araknoidesa oso hurbil daude.',
        'Hiru meninge, bi jatorri: dura materra mesodermikoa; araknoidesa eta pia materra gandor neuraletik.',
      ],
      roots: [
        n('dura-materra', [
          leaf('Garunean', 'kraneoari itsatsita', undefined, 'ez dago eremu epiduralik'),
          leaf('Bizkarrezurrean', 'ez dago lotuta', [
            branch('eremu-epidurala', 'tartean'),
          ]),
        ], { note: '1 · kanpokoa, gogorrena · mesodermikoa' }),
        n('araknoidesa', [
          branch('eremu-azpiaraknoideoa', 'pia materrarekiko tartean', undefined, 'likido zefalorrakideoa'),
        ], { note: '2 · tartekoa, armiarma sarea · gandor neuraletik' }),
        n('pia-materra', [
          leaf('Garunean eta ornomuinean', 'ehunari lotuta'),
        ], { note: '3 · barnekoena · gandor neuraletik' }),
      ],
    },
    {
      id: 'gandor-neuraleko-eratorriak-19',
      title: 'Gandor neuralaren eratorriak',
      lead: 'Hodi neurala ektodermotik askatzean gandor zelulak hodiaren bi aldeetara banatu eta metatzen dira (atze-alboetan, atzeko sustraietako gongoilak). Hortik eratorri hauek.',
      stage: 'gandor-eratorriak',
      pitfalls: [
        'Jaioberrien malformazio kongenitoen %30 gandor neuraleko anomaliengatik gertatzen dira: ez da mielinarik ekoizten, ez dira aurpegiko hezurrak eratzen…',
        'Mielina: nerbio sistema periferikoan Schwann zelulek (gandorretik); zentralean oligodendrozitoek.',
        'Meningeetatik bi bakarrik datoz gandorretik (araknoidesa eta pia materra); dura materra mesodermotik.',
        '4. astean oraindik hodi neurala da, ez ornomuina.',
        'Nerbio sisteman ez daude neuronak bakarrik: nerbio zelula gehienak neuronak eta glia dira.',
      ],
      roots: [
        n('gandor-neurala', [
          g('Gongoilak (neuronen somak)', [
            branch('gongoil-errakideoak', 'atze-alboetan metatu', undefined, 'gongoil espinalak, atzeko sustraian'),
            branch('gongoil-sinpatikoak', 'kate sinpatikoan'),
            branch('aorta-aurreko-gongoilak', 'erraien aurreko sareetan', undefined, 'sinpatikoak ere bai'),
            branch('gongoil-parasinpatikoak', 'erraien inguruko sareetan'),
          ]),
          g('Glia eta meningeak', [
            branch('schwann-zelulak', 'mielina, periferikoan bakarrik', undefined, 'zentralean oligodendrozitoak'),
            branch('araknoidesa', 'meninge bat'),
            branch('pia-materra', 'meninge bat'),
          ]),
          g('Beste eratorriak', [
            leaf('I., II. eta III. arkuetako hezurrak eta kartilagoak', 'faringe-arkuetan', undefined, 'anomalia → aurpegiko hezurrik ez'),
            n('zelula-kromafinak', undefined, { via: 'giltzurrun gaineko guruinen muinean sartu', move: true }),
            n('melanozitoak', undefined, { via: 'larruazala eta ilea koloreztatu', move: true }),
          ]),
        ], { note: 'anomaliak: malformazio kongenitoen %30' }),
      ],
    },
    {
      id: 'ornomuinaren-geruzak-19',
      title: 'Ornomuinaren geruzak: barnetik kanpora',
      lead: 'Ependimoaren kanpoaldean neuroepitelioa; haren zeluletatik neuroblastoak, eta hauetatik neuronak. Somak barnean geratzen dira, axoiak kanpora.',
      stage: 'ornomuin-geruzak',
      pitfalls: [
        'Manto geruza → gai grisa (somak); geruza marginala → gai zuria (axoiak). Ez nahastu.',
        'Ependimo geruza paretan gelditu diren zelula neuroepiteliarrek osatzen dute.',
        'Kanpoko mintz mugatzailean pia materra eratzen da, ehunari lotuta.',
      ],
      roots: [
        n('neuroepitelioa', [
          branch('neuroblastoak', 'bereizi', undefined, 'neuronak sortu'),
          branch('ependimo-geruza', 'paretan gelditutako zelulak'),
        ], { note: 'barneko mintz mugatzailea (5. astea)' }),
        n('manto-geruza', [branch('gai-grisa', 'bihurtu')], { note: 'neuroblastoen somak' }),
        n('geruza-marginala', [branch('gai-zuria', 'bihurtu')], { note: 'neuroblastoen axoiak, kanporantz' }),
        l('Kanpoko mintz mugatzailea', [branch('pia-materra', 'bertan eratu')], { note: 'kanpoko muga' }),
      ],
    },
    {
      id: 'ornomuinaren-plakak-19',
      title: 'Ornomuinaren plakak: dortsala sentsitiboa, bentrala motorra',
      lead: 'Lau plaka. Hegal eta oinalde plakak, garatu ondoren, eremu sentsitiboa eta motorra dira; sabai eta zoru plaketan axoiak alde batetik bestera pasatzen dira.',
      stage: 'ornomuin-plakak',
      pitfalls: [
        '3. hilabetean jada ez dago plakarik: ornomuinaren eremu sentsitiboa eta motorra daude.',
        'Ildo mugatzailea muga fisiologikoa da, ez anatomikoa.',
        'Sabai eta zoru plaketan ez dago manto geruzarik: geruza marginala bakarrik.',
      ],
      roots: [
        n('hodi-neurala', [
          branch('sabai-plaka', 'muturra, alde dortsalean', undefined, 'manto geruzarik ez · axoiak gurutzatu'),
          branch('hegal-plaka', 'dortsala · sentsitiboa', [branch('eremu-sentsitiboa', 'plaka desagertu')]),
          branch('ildo-mugatzailea', 'tartean · fisiologikoa'),
          branch('oinalde-plaka', 'bentrala · motorra', [branch('eremu-motorra', 'plaka desagertu')]),
          branch('zoru-plaka', 'muturra, alde bentralean', undefined, 'manto geruzarik ez · axoiak gurutzatu'),
        ]),
      ],
    },
    {
      id: 'gai-grisa-zuria-19',
      title: 'Ornomuin heldua: gai grisa H forman eta gai zuria',
      lead: 'Barnean gai grisa H forman (neuronen somak), ependimoa inguratuz; kanpoan gai zuria, axoi mielinizatuak. Bi idor, aurrekoa askoz sakonagoa.',
      stage: 'gai-grisa-zuria',
      pitfalls: [
        'Alboko adarrak (neurona sinpatikoen somak) T1etik L2ra bakarrik daude.',
        'Gai zuriaren kolorea mielinak ematen du.',
      ],
      roots: [
        n('ornomuina', [
          branch('gai-grisa', 'barnean · H forma', [
            leaf('Aurreko adarrak', 'motorrak'),
            leaf('Atzeko adarrak', 'sentsitiboak'),
            leaf('Alboko adarrak', 'sinpatikoak · T1–L2'),
          ], 'somak · manto geruzatik'),
          branch('gai-zuria', 'kanpoan · axoiak', [
            leaf('Goranzko bideak', 'sentsitiboak'),
            leaf('Beheranzko bideak', 'motorrak'),
          ], 'mielina · geruza marginaletik'),
          leaf('Bi idor', 'aurrean eta atzean', undefined, 'aurrekoa askoz sakonagoa'),
        ]),
      ],
    },
    {
      id: 'ornomuinaren-igoera-19',
      title: 'Ornomuinaren aldaketak: konoa eta zaldi buztana',
      lead: 'Bizkarrezurra (metamerikoa) ornomuina baino gehiago luzatzen da. 4. hilabetetik aurrera ornomuina L1–T12/L2 mailaraino bakarrik iristen da.',
      stage: 'ornomuinaren-igoera',
      pitfalls: [
        'Ornomuina ez da sakroraino iristen; hortik behera nerbio solteak daude (zaldi buztana), ez ornomuin trinkoa.',
        'Nerbio espinalak ornoen arteko zuloetatik irteten dira eta bizkarrezurrarekin batera luzatzen dira.',
        'Zaldi buztanaren poltsa dura materraren eta araknoidesaren artean eratzen da.',
      ],
      roots: [
        n('ornomuina', [
          branch('ornomuinaren-konoa', 'amaiera, kono forma', [
            leaf('Lotailua', 'konotik aurrera', undefined, 'euspena'),
          ]),
          branch('zaldi-buztana', 'L2tik behera nerbio solteak'),
          branch('poltsa-durala', 'zaldi buztana barruan', undefined, 'likido zefalorrakideoz beteta · dura eta araknoidesaren artean'),
          branch('nerbio-espinalak', 'ornoen arteko zuloetatik irten', undefined, 'bizkarrezurrarekin batera luzatu'),
        ], { note: 'L1–T12/L2 mailan amaitu' }),
      ],
    },
    {
      id: 'puntzioa-epidurala-19',
      title: 'Puntzio lunbarra eta anestesia epidurala',
      lead: 'Biak zaldi buztanaren eremuan, ornomuin trinkorik ez dagoen tokian, lesio arriskua txikiagoa delako.',
      stage: 'puntzioa-epidurala',
      pitfalls: [
        'Puntzioak likido zefalorrakideoa ateratzen du; epidurala dura materraren kanpoan ematen da, dura materraren eta bizkarrezurraren artean.',
        'Likido zefalorrakideoaren funtzio nagusia kolpeak amortiguatzea da.',
      ],
      roots: [
        l('Puntzio lunbarra', [
          branch('zaldi-buztana', 'L2 mailan sartu', undefined, 'ornomuin trinkorik ez'),
          leaf('Likido zefalorrakideoaren lagina', 'hartu', undefined, 'meningitisaren eta beste gaixotasunen markatzaileak'),
        ]),
        n('anestesia-epidurala', [
          branch('eremu-epidurala', 'dura materraren eta bizkarrezurraren artean eman', undefined, 'gantza, nerbioak, odol hodiak'),
          leaf('Zaldi buztaneko nerbioak', 'lokartu', undefined, 'beheko gorputz adarrak eta barrunbe pelbianoa'),
        ], { note: 'erditzean edo beheko gorputz adarretako kirurgian' }),
      ],
    },
    {
      id: 'plaka-neurala-19',
      title: 'Plaka neuraletik hodi neuralera: neuroporoak',
      lead: 'Plakaren aldeak tolestu eta erdian fusionatzen dira. Fusioa erdi mailan hasten da eta bi muturretan neuroporoak uzten ditu.',
      stage: 'plaka-neurala',
      pitfalls: [
        'Atzeko neuroporoa aurrekoa baino lehen ixten da: 25. egunean atzekoa, 28.ean aurrekoa.',
        'Fusioa erdian hasten da, ez muturretan.',
      ],
      // The days (9/p3/s3) are grey in the notes: not taught this year.
      plainPitfalls: ['Atzeko neuroporoa aurrekoa baino lehen ixten da.', 'Fusioa erdian hasten da, ez muturretan.'],
      roots: [
        n('plaka-neurala', [
          branch('hodi-neurala', 'aldeak tolestu, erdian fusionatu', [
            { ...branch('neuroporo-kaudala', 'atzekoa · 25. egunean itxi'), plain: { via: 'atzekoa · lehenago itxi' } },
            { ...branch('neuroporo-kraneala', 'aurrekoa · 28. egunean itxi'), plain: { via: 'aurrekoa · geroago itxi' } },
          ], 'fusioa erdi mailan hasi'),
          branch('gandor-neurala', 'tolesduren muturretan', undefined, 'batzuk migratu, beste batzuk ez'),
        ]),
      ],
    },
    {
      id: 'garun-xixkuen-eratorriak-19',
      title: 'Garun-xixkuak: 3tik 5era eta haien eratorriak',
      lead: 'Alde kranealean hodiak hodi forma galdu eta xixkuak eratzen ditu; alde kaudalean hodi izaten jarraitzen du (ornomuina). Egiturak aurretik atzera izendatuta daude.',
      stage: 'bost-xixkuak',
      pitfalls: [
        'Hiru xixkuak alde zefalikoan bakarrik eratzen dira; alde kaudalean hodia ez da eraldatzen.',
        'Mesentzefaloak mesentzefalo izaten jarraitzen du: ez da ezer eratzen bertatik.',
        'Talamoa: sentsazioak hortik ez badira pasatzen ez ditugu nabaritzen (testurak, mina, tenperatura, ikusmena, entzumena…).',
      ],
      roots: [
        n('prosentzefaloa', [
          branch('telentzefaloa', '5. astean', [
            branch('garun-hemisferioak', 'garun kortexa · bihurgunetsua', undefined, 'gehien hazi, dientzefaloa inguratu'),
          ]),
          branch('dientzefaloa', '5. astean · barnean, oinaldean', [
            branch('epitalamoa', 'talamoaren gainean'),
            branch('talamoa', 'erdian · nagusiena', undefined, 'sentsazioak hemendik pasatu'),
            branch('hipotalamoa', 'talamoaren azpian', undefined, 'hormonen arduradun nagusia'),
            leaf('Azpitalamoa', 'dientzefaloaren atala'),
          ]),
        ], { note: '1 · aurrekoa, zefalikoena' }),
        n('mesentzefaloa', undefined, { note: '2 · tartekoa · berdin jarraitu: ez da ezer eratzen' }),
        n('erronbentzefaloa', [
          branch('metentzefaloa', 'banatu', [
            branch('zubia', 'erraboilaren eta mesentzefaloaren artean'),
            branch('garuntxoa', 'atzean', undefined, 'zerebeloa'),
          ]),
          branch('mielentzefaloa', 'banatu · kaudalena', [
            branch('erraboila', 'ornomuinarekin kontaktuan', undefined, 'garuna eta ornomuinaren lotura'),
          ]),
        ], { note: '3 · erronbo forma' }),
        n('hodi-neurala', [
          branch('ornomuina', 'alde kaudalean hodi izaten jarraitu'),
        ], { note: 'xixkuak alde kranealean bakarrik' }),
      ],
    },
    {
      id: 'xixkuen-tolespenak-19',
      title: 'Xixkuen egutegia eta tolespenak',
      lead: 'Barneko egiturak hazten dira eta espazioa mugatua da: bihurritu edo tolestu egin behar dute.',
      stage: 'hiru-xixkuak',
      pitfalls: [
        'Tolespen zefalikoa mesentzefaloan; zerbikala erronbentzefalo mailan (lepoko tolespena); zubi tolespena geroago, metentzefaloan.',
        'Istmoa mesentzefaloaren eta metentzefaloaren arteko estugunea da: gene asko istmotik garatzen dira garuna antolatzeko.',
      ],
      roots: [
        l('28. eguna', [
          leaf('3 xixkuak', 'erlatiboki erdieratuta'),
          branch('tolespen-zefalikoa', 'mesentzefalo mailan'),
          branch('tolespen-zerbikala', 'erronbentzefalo mailan', undefined, 'lepoko tolespena'),
        ]),
        l('5. astea', [
          leaf('Telentzefaloa eta dientzefaloa', 'prosentzefalotik atera'),
          leaf('Metentzefaloa eta mielentzefaloa', 'erronbentzefalotik atera'),
          branch('zubi-tolespena', 'zubian, metentzefalo mailan'),
          branch('istmoa-entzefaloa', 'mesen- eta metentzefaloaren muga estutu', undefined, 'genetikoki oso garrantzitsua'),
        ]),
      ],
    },
    {
      id: 'bentrikuluak-19',
      title: 'Bentrikulu sistema: xixku bakoitzaren barrunbea',
      lead: 'Hodi neuralaren barrunbea ornomuinean hodi ependimarioa da. Garunean xixkuen barruan zabaltzen da eta bentrikuluak sortzen dira, denak komunikatuta.',
      stage: 'bentrikuluak',
      pitfalls: [
        'Ez esan I. eta II. bentrikuluak: bi alboko bentrikuluak bata bestearen parean daude.',
        'Monro zuloek alboko bentrikuluak III.arekin lotzen dituzte; Luschka (2, alboetan) eta Magendie (1, erdian) IV. bentrikuluan daude.',
        'Mesentzefaloak ez du bentrikulurik: hodia estutu eta akueduktoa da.',
      ],
      roots: [
        n('telentzefaloa', [branch('alboko-bentrikuluak', 'hemisferio bakoitzean bat', undefined, '2 · lateralak')]),
        n('dientzefaloa', [
          branch('hirugarren-bentrikulua', 'talamoaren mailan', [
            branch('monro-zuloak', 'alboko bentrikuluekin lotu'),
          ], 'pixka bat atzerago'),
        ]),
        n('mesentzefaloa', [branch('garun-akueduktoa', 'hodia estutu', undefined, 'hodi forma mantendu')]),
        n('erronbentzefaloa', [
          branch('laugarren-bentrikulua', 'met- eta mielentzefalo parean', [
            branch('luschka-zuloak', '2 · alboetan'),
            branch('magendie-zuloa', '1 · erdian'),
          ], 'erronbo forma'),
        ]),
        n('ornomuina', [branch('hodi-ependimarioa', 'hodi forma mantendu', undefined, 'barneko eremua')]),
      ],
    },
    {
      id: 'likido-zefalorrakideoa-19',
      title: 'Likido zefalorrakideoa: ekoizpena eta bidea',
      lead: '5. astean hasten da, etengabe. Sare koroideek (arteriolak + benulak) ekoizten dute bentrikuluen sabaian; espazioa mugatua denez, jarraian drenatu eta berxurgatu behar da.',
      stage: 'likido-zefalorrakideoa',
      pitfalls: [
        'Sare koroideak alboko bentrikuluen, III.aren eta IV.aren sabaian daude.',
        'IV. bentrikuluan likidoa banatzen da: zati batek hodi ependimarioan jarraitzen du, bestea 3 zuloetatik irteten da.',
        'Kanpoan eremu azpiaraknoideotik doa (pia materraren eta araknoidesaren artean). Funtzioa: NSZ babestu, kolpeak amortiguatu.',
      ],
      roots: [
        n('sare-koroideak', [
          g('Barnetik', [
            branch('alboko-bentrikuluak', '1 · bentrikulu lateraletatik abiatu'),
            branch('monro-zuloak', '2 · bentrikulu arteko zuloetatik pasa'),
            branch('hirugarren-bentrikulua', '3 · iritsi'),
            branch('garun-akueduktoa', '4 · pasa'),
            branch('laugarren-bentrikulua', '5 · iritsi'),
          ]),
          g('IV. bentrikulutik aurrera', [
            branch('hodi-ependimarioa', '6a · zati batek barnetik jarraitu'),
            leaf('Luschka eta Magendie zuloak', '6b · bestea 3 zuloetatik irten'),
            branch('eremu-azpiaraknoideoa', '7 · NSZ kanpotik inguratu', undefined, 'pia materraren eta araknoidesaren artean'),
            leaf('Zain-sistema', '8 · kraneoko egitura berezietatik berxurgatu'),
          ]),
        ], { note: 'arteriolak + benulak · bentrikuluen sabaian' }),
      ],
    },
  ],
};

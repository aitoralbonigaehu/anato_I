import type { MigrationTopic, MNode } from '../migrations';

const n = (id: string, via?: string, kids?: MNode[], note?: string): MNode => ({ id, via, kids, note });
const l = (label: string, via?: string, kids?: MNode[], note?: string): MNode => ({ label, via, kids, note });

const hipofisiPitfalls = [
  'Bi hasikinak elkarren ondoan geratzen dira eta guruinaren atal bereiziak eratzen dituzte.',
  'Hipofisi poltsa estomodeotik askatzen da. Infundibuluak hipofisiaren eta hipotalamoaren arteko lotura mantentzen du.',
  'Adenohipofisiak somatotropina eta prolaktina bezalako hormonak ekoizten ditu. Neurohipofisira, berriz, hipotalamoan ekoitzitako oxitozina eta basopresina heltzen dira, axoien bidez.',
];

/** 20. gaia, Entzefaloaren garapena (apunte zuzenduak). Urdinez edo grisez markatutako edukia Osoa moduan ageri da. */
export const SCHEMES_20: MigrationTopic = {
  week: 20,
  short: 'Entzefaloaren garapena',
  flows: [
    {
      id: 'entzefalo-enborraren-eratorriak-20',
      title: 'Entzefalo-enborra eta haren barrunbeak',
      stage: 'entzefalo-enborra',
      lead: 'Entzefalo-enborra mesentzefaloak, zubiak eta erraboilak osatzen dute. Zubia metentzefalotik dator eta erraboila mielentzefalotik.',
      pitfalls: [
        'Zubi-tolespenarekin, sabai plaka zabaldu eta IV. bentrikuluaren barrunbeak erronbo forma hartzen du.',
        'Erraboilaren alde kaudalean hodi zentrala dago. Alde kranealeko erraboilak eta zubiak IV. bentrikuluaren zorua osatzen dute.',
        'IV. nerbio kraneala (troklearra) entzefalo-enborraren alde dortsaletik irteten da eta mesentzefaloa inguratzen du.',
      ],
      roots: [
        n('erronbentzefaloa', undefined, [
          n('mielentzefaloa', 'atal kaudala', [
            n('erraboila', 'eratu', [
              l('Hodi zentrala', 'alde kaudalean jarraitu', undefined, 'ornomuinarekin jarraitua'),
              n('piramideak', 'aurrealdean', undefined, 'beheranzko zuntz kortikoespinalak'),
            ]),
          ]),
          n('metentzefaloa', 'atal kraneala', [
            n('zubia', 'eratu', undefined, 'IV. bentrikuluaren zoruaren alde kranealean'),
          ]),
          n('zubi-tolespena', 'zubiaren inguruan tolestu', [
            n('laugarren-bentrikulua', 'sabai-plaka zabaldu', undefined, 'zubiaren eta erraboilaren bizkarraldean'),
            n('oinalde-plaka', 'medial geratu', undefined, 'eremu motorra'),
            n('hegal-plaka', 'alboetara zabaldu', undefined, 'eremu sentsitiboa'),
          ]),
        ]),
        n('mesentzefaloa', undefined, [
          n('garun-akueduktoa', 'barrunbea estutu', undefined, 'III. eta IV. bentrikuluak lotzen ditu'),
          n('garun-pedunkuluak', 'alde bentralean', undefined, 'beheranzko zuntz ugari'),
          n('gai-beltza', 'tegmentuaren eta pedunkuluaren oinaldearen artean', undefined, 'zati trinkoak dopamina gorputz ildaskatura bidali'),
        ]),
      ],
    },
    {
      id: 'bikote-kranealen-irteerak-20',
      title: 'Bikote kranealen lotuneak eta irteerak',
      stage: 'bikote-kranealen-irteerak',
      blue: true,
      lead: 'Bikote kraneal gehienak entzefalo-enborrari lotzen zaizkio. I.a eta II.a aurreko garunari lotzen zaizkio, eta XI.aren osagai espinala lepoko ornomuinean hasten da.',
      pitfalls: [
        'IV.a da entzefalo-enborraren atzealdetik irteten den bakarra; gero mesentzefaloa inguratzen du.',
        'III., IV. eta VI. nerbioek begiko kanpoko muskuluak inerbatzen dituzte. III.ak, VII.ak, IX.ak eta X.ak zuntz parasinpatikoak ere badituzte.',
        'Nerbio baten ageriko lotunea eta haren nukleoaren kokapena bereizi: VI., VII. eta VIII. zubiaren eta erraboilaren arteko mugan agertzen dira.',
      ],
      roots: [
        l('Aurreko garuna', undefined, [
          n('usaimen-nerbioa', 'I · usaimen-erraboilera', undefined, 'sudur-mukosako hartzaileen axoiak'),
          n('nerbio-optikoa', 'II · kiasma optikora', undefined, 'erretinako gongoil-zelulen axoiak'),
        ]),
        n('mesentzefaloa', undefined, [
          n('nerbio-begi-eragilea', 'III · alde bentralean'),
          n('nerbio-troklearra', 'IV · alde dortsalean'),
        ]),
        n('zubia', undefined, [n('nerbio-trigeminoa', 'V · alboko aurpegian', undefined, 'hiru adar')]),
        l('Zubiaren eta erraboilaren arteko muga', undefined, [
          n('nerbio-aldentzailea', 'VI · erditik hurbil'),
          n('aurpegi-nerbioa', 'VII · alboan'),
          n('nerbio-estatoakustikoa', 'VIII · alboan', undefined, 'entzumena eta oreka'),
        ]),
        n('erraboila', undefined, [
          n('nerbio-glosofaringeoa', 'IX · olibaren atzean'),
          n('nerbio-bagoa', 'X · olibaren atzean'),
          n('nerbio-hipoglosoa', 'XII · olibaren aurrean', undefined, 'mihiaren mugimendua'),
        ]),
        l('Lepoko ornomuina', undefined, [
          n('nerbio-osagarria', 'XI · sustrai espinalak', undefined, 'esternokleidomastoideoa eta trapezioa'),
        ]),
      ],
    },
    {
      id: 'garuntxoaren-jatorria-20',
      title: 'Garuntxoa: hegal plaketatik zerebelo plakara',
      stage: 'garuntxoaren-garapena',
      lead: 'Garuntxoa metentzefaloaren hegal-plaken alde dortsaletik garatzen da. Alde dortsolaterala loditzean, ezpain erronboideak sortzen dira.',
      pitfalls: [
        'Ezpain erronboideak sabai-plakaren ondoan daude. Ezpainek eta eremu bentrikularrak garuntxoko neuronen sorreran parte hartzen dute.',
        'Garuntxoa IV. bentrikuluaren alde dortsalean hazten da.',
      ],
      roots: [
        n('hegal-plaka', undefined, [
          n('ezpain-erronboideak', 'neuroblastoak ugaritu', [
            { ...l('Zerebelo plaka', 'erdirantz hazi eta elkartu', [
              n('garuntxoa', 'handitu eta bereizi', [
                l('Bermisa', 'erdialdean eratu'),
                l('Bi hemisferio zerebelosoak', 'alboetan eratu'),
              ]),
            ]), move: true },
          ]),
        ], 'metentzefaloaren alde dortsolateralean'),
      ],
    },
    {
      id: 'dientzefaloaren-eratorriak-20',
      title: 'Dientzefaloa: lau eskualde eta III. bentrikulua',
      stage: 'dientzefaloaren-garapena',
      lead: 'Prosentzefalotik bereizitako dientzefaloak lau eskualde nagusi ditu. Eskuineko eta ezkerreko pareten artean III. bentrikulua dago.',
      pitfalls: [
        'Kortex sentsorial primariora heltzen diren seinale gehienek talamoan dute erreleboa. Usaimena zuzenean heltzen da lehen mailako usaimen-kortexera.',
        'Guruin pinealak melatonina jariatzen du. Jariaketaren erritmoak argi-ilun zikloari jarraitzen dio eta lo-esna zikloarekin lotuta dago.',
      ],
      roots: [
        n('prosentzefaloa', undefined, [
          n('dientzefaloa', 'bereizi', [
            n('epitalamoa', 'alde dortsalean', [
              n('guruin-pineala', 'eratu', undefined, 'epifisia · melatonina eta lo-esna zikloa'),
            ]),
            n('talamoa', 'III. bentrikuluaren alboetan', undefined, 'errelebo sentsoriala'),
            l('Azpitalamoa', 'talamoaren azpian'),
            {
              ...n('hipotalamoa', 'alde bentralean', undefined, 'erregulazio endokrinoa · tenperatura, gosea eta egarria'),
              plain: { note: 'erregulazio endokrinoa' },
            },
            n('hirugarren-bentrikulua', 'erdiko barrunbea'),
          ]),
        ]),
      ],
    },
    {
      id: 'hipofisiaren-bi-jatorriak-20',
      title: 'Hipofisia: aho-ektodermoa eta neuroektodermoa',
      stage: 'hipofisiaren-garapena',
      lead: 'Estomodeoaren sabaiko hipofisi poltsak eta dientzefalo bentraleko infundibuluak hipofisiaren bi atalak eratzen dituzte.',
      pitfalls: [
        ...hipofisiPitfalls,
        'Hipofisia esfenoideko zela turkiarrean dago. Bi atalek hormonak odolera askatzen dituzte.',
      ],
      plainPitfalls: hipofisiPitfalls,
      roots: [
        n('prosentzefaloa', undefined, [
          n('dientzefaloa', 'bereizi', [
            {
              ...n('hipotalamoa', 'alde bentralean', [
                n('hipofisi-infundibulua', 'neuroektodermoa beherantz luzatu', [
                  n('neurohipofisia', 'bereizi'),
                ]),
              ], 'erregulazio endokrinoa · tenperatura, gosea eta egarria'),
              plain: { note: 'erregulazio endokrinoa' },
            },
          ]),
        ]),
        n('estomodeoa', undefined, [
          n('rathke-poltsa', 'aho-ektodermoa gorantz luzatu', [
            n('adenohipofisia', 'estomodeotik askatu eta bereizi'),
          ]),
        ]),
      ],
    },
    {
      id: 'telentzefaloaren-eratorriak-20',
      title: 'Telentzefaloa: hemisferioak, kortexa eta oinaldeko nukleoak',
      stage: 'telentzefaloaren-garapena',
      lead: 'Bi xixku telentzefalikoek hemisferioak sortzen dituzte. Handitzean dientzefaloa estaltzen dute; xixkuen barrunbeak alboko bentrikulu bihurtzen dira.',
      pitfalls: [
        'Ornomuinean, H formako gai grisa barruan dago eta gai zuria kanpoan. Garun-hemisferioetan kortexa kanpoko gai grisa da. Barruan gai zuria eta gai griseko nukleo sakonak daude.',
        'Nukleo kaudatuak eta putamenak dortsaleko gorputz ildaskatua osatzen dute. Putamenak eta globo zurbilak nukleo lentikularra osatzen dute.',
        'Oinaldeko nukleoek mugimendua erregulatzen dute. Parkinsonen gaixotasunean, gai beltzetik estriatura heltzen den dopamina gutxitzen da. Huntingtonen gaixotasunean korea ager daiteke.',
      ],
      roots: [
        n('telentzefaloa', undefined, [
          n('garun-hemisferioak', 'bi xixkuak hazi', [
            l('Garun-kortexa', 'kanpoko gai grisa', [
              l('Ildoak eta zirkunboluzioak', 'gainazala tolestu'),
            ]),
            l('Gai zuria', 'kortexaren azpian', undefined, 'axoi sortak'),
            n('oinaldeko-nukleoak', 'gai gris sakona', [
              l('Nukleo kaudatua eta putamena', 'dortsaleko gorputz ildaskatua osatu'),
              l('Putamena eta globo zurbila', 'nukleo lentikularra osatu'),
            ]),
          ]),
          n('alboko-bentrikuluak', 'xixkuen barrunbeak', undefined, 'bat hemisferio bakoitzean'),
        ]),
      ],
    },
    {
      id: 'komisurak-20',
      title: 'Komisurak: erdiko lerroa zeharkatzen duten zuntzak',
      stage: 'komisuren-garapena',
      lead: 'Komisuretako axoiek erdiko lerroa zeharkatzen dute eta bi aldeetako egiturak lotzen dituzte.',
      pitfalls: [
        'Gorputz kailukarra eta aurreko komisura hemisferioen arteko lotuneak dira. Atzeko komisura dientzefaloaren eta mesentzefaloaren arteko mugaren inguruan dago.',
      ],
      roots: [
        n('telentzefaloa', undefined, [
          l('Gorputz kailukarra', 'hemisferioak lotu', undefined, 'lotune kortikal nagusia'),
          l('Aurreko komisura', 'hemisferioak lotu', undefined, 'batez ere eremu tenporal eta usaimenekoak'),
        ]),
        l('Dientzefaloaren eta mesentzefaloaren arteko muga', undefined, [
          l('Atzeko komisura', 'erdiko lerroa zeharkatu', undefined, 'guruin pinealaren azpian'),
        ]),
      ],
    },
    {
      id: 'bide-sinpatikoak-20',
      title: 'Bide sinpatikoak: katea eta orno aurreko gongoilak',
      stage: 'bide-sinpatikoak',
      lead: 'T1–L2 inguruko neurona gongoil-aurrekoen axoiak aurreko sustraitik eta nerbio espinaletik igarotzen dira, kate sinpatikora heldu arte.',
      pitfalls: [
        'Adar komunikante zuria: gongoil-aurreko axoi mielinadunak katera sartzen dira. Grisa: gongoil-osteko axoi mielinagabeak nerbio espinalera itzultzen dira.',
        'Gongoil-aurreko neuronen somak ornomuinean daude. Gongoil sinpatikoetako neuronen jatorria gandor neurala da.',
        'Zuntzek katean maila berean, gorago edo beherago egin dezakete sinapsia. Abdomeneko erraietara doazen zuntz esplankniko askok katea zeharkatu eta orno aurreko gongoiletan egiten dute sinapsia.',
      ],
      roots: [
        l('Neurona gongoil-aurrekoak', undefined, [
          n('kate-sinpatikoa', 'adar komunikante zuriaren bidez sartu', [
            n('gongoil-sinpatikoak', 'katean sinapsia', [
              l('Toraxeko erraiak', 'gongoil-osteko zuntzetatik'),
              n('nerbio-espinalak', 'adar komunikante grisaren bidez itzuli', undefined, 'gorputz-paretara eta gorputz-adarretara'),
            ]),
            n('aorta-aurreko-gongoilak', 'katea sinapsirik gabe zeharkatu', [
              l('Abdomeneko eta pelbiseko erraiak', 'gongoil-osteko axoien bidez'),
            ], 'nerbio esplanknikoak · orno aurreko gongoiletan sinapsia'),
          ]),
        ], 'ornomuinaren alboko adarretan · T1–L2'),
      ],
    },
    {
      id: 'bide-parasinpatikoak-20',
      title: 'Bide parasinpatikoak: irteera kraneala eta sakroa',
      stage: 'bide-parasinpatikoak',
      lead: 'Bide parasinpatikoa entzefalo-enborretik eta ornomuin sakrotik abiatzen da. Sinapsia xede-organoaren ondoan edo haren paretan gertatzen da.',
      pitfalls: [
        'III., VII. eta IX. nerbioek buruko egiturak inerbatzen dituzte. X. nerbioa toraxeko eta abdomeneko erraietara heltzen da.',
        'Hestean, bagoa zeharkako kolonaren lehen bi herenetara heltzen da gutxi gorabehera. S2–S4ko zuntzak atzeko hestera eta pelbiseko beste erraietara heltzen dira.',
        'Bidean zeharreko plexuetatik igaro ondoren, zuntz luze gongoil-aurrekoek bukaerako gongoiletan sinapsia egiten dute. Zuntz gongoil-ostekoak laburrak dira.',
      ],
      roots: [
        n('entzefalo-enborra', undefined, [
          l('III., VII. eta IX. nerbioak', 'zuntz gongoil-aurrekoak', [
            n('buruko-gongoil-parasinpatikoak', 'sinapsia', undefined, 'begi-ninia eta guruinak'),
          ]),
          n('nerbio-bagoa', 'X · zuntz gongoil-aurrekoak', [
            l('Toraxeko eta abdomeneko erraiak', 'sinapsia paretan edo inguruan'),
          ]),
        ]),
        l('Ornomuin sakroa', undefined, [
          l('Pelbiseko nerbio esplanknikoak', 'S2–S4 · zuntz gongoil-aurrekoak', [
            l('Atzeko hestea eta pelbiseko erraiak', 'sinapsia paretan edo inguruan'),
          ]),
        ]),
      ],
    },
    {
      id: 'entzefalo-enborreko-zutabeak-20',
      title: 'Entzefalo-enborreko zutabe funtzionalak',
      stage: 'entzefalo-enborreko-zutabeak',
      blue: true,
      lead: 'IV. bentrikuluaren barrunbea zabaltzean, nukleo motorren eremua erdialdean geratzen da eta sentsitiboena alboetarantz zabaltzen da.',
      pitfalls: [
        'Eferenteak entzefalo-enborretik irteten dira; aferenteak bertara heltzen dira.',
        'Zutabeak funtzio bereko nukleoen multzoak dira. Entzumena eta oreka aferentzia somatiko berezian ere bereiz daitezke.',
      ],
      roots: [
        n('oinalde-plaka', undefined, [
          l('Eferente somatikoa', 'muskulu somatikoetara', undefined, 'III., IV., VI. eta XII.'),
          l('Erraietako eferente berezia', 'faringe-arkuetako muskuluetara', undefined, 'V., VII., IX. eta X.'),
          l('Erraietako eferente orokorra', 'irteera parasinpatikoa', undefined, 'III., VII., IX. eta X.'),
        ], 'motorra · alde medialean'),
        n('hegal-plaka', undefined, [
          l('Erraietako aferente orokorra', 'erraietatik', undefined, 'batez ere IX. eta X.'),
          l('Erraietako aferente berezia', 'dastamenetik', undefined, 'VII., IX. eta X.'),
          l('Aferente somatiko orokorra', 'ukimena, mina eta tenperatura', undefined, 'batez ere V.'),
          l('Aferente somatiko berezia', 'entzumena eta oreka', undefined, 'VIII.'),
        ], 'sentsitiboa · alboetan'),
      ],
    },
  ],
};

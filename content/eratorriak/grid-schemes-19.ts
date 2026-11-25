import { c, r, type GridScheme } from './grid-kit';

/**
 * Topic 19, nerbio sistema: integrated master tables that fuse the topic's layered sections
 * (vesicles + ventricles + brain parts, cord embryo -> adult, meninges + CSF + clinic, cranial nerves).
 */
export const GRID_19: GridScheme[] = [
  {
    id: 'entzefalo-matrizea-19',
    week: 19,
    section: '6 · 7 · 10',
    title: 'Entzefaloa begirada batean: xixkuak, barrunbeak eta atalak',
    lead: 'Hiru atal bereizitan emandakoa errenkada bakarrean: xixku primarioa → sekundarioa → barrunbea → egitura helduak eta tolespenak.',
    stage: 'bost-xixkuak',
    path: true,
    columns: [
      { label: 'Xixku primarioa', tone: 'jatorria', w: 0.9 },
      { label: 'Xixku sekundarioa', tone: 'aldaketa', w: 0.9 },
      { label: 'Barrunbea', tone: 'kokapena', w: 0.95 },
      { label: 'Egitura helduak eta funtzioa', tone: 'ondorioa', w: 1.75 },
      { label: 'Tolespena / berezitasuna', tone: 'nerbioa', w: 1.15 },
    ],
    rows: [
      r(
        [
          c('Prosentzefaloa', { span: 2, note: '1 · aurrekoa' }),
          'Telentzefaloa',
          c('Alboko bentrikuluak', { note: 'ezkerra eta eskuina · handienak' }),
          c('Garun-hemisferioak', { note: 'hazi eta dientzefaloa estali' }),
          c('Hasieran txikiagoa, gero askoz handiagoa', { note: 'Monro zuloetatik III.era' }),
        ],
        ['aurrekoa'],
      ),
      r(
        [
          null,
          'Dientzefaloa',
          c('III. bentrikulua', { note: 'erdian · sare koroideak' }),
          c('Epitalamoa (pineala: melatonina) · Talamoa (errelebo sentsitiboa) · Hipotalamoa (hormonak + neurohipofisia) · Azpitalamoa'),
          c('Usaimena EZ da talamotik pasatzen', { note: 'Adenohipofisia estomodeotik (Rathke)' }),
        ],
        ['aurrekoa'],
      ),
      r(
        [
          c('Mesentzefaloa', { note: '2 · tartekoa' }),
          c('Mesentzefaloa', { note: 'banatu gabe' }),
          c('Garun-akueduktoa', { note: 'Silvio · hodi estua' }),
          c('Garun-pedunkuluak (bentralean) · Gai beltza (zelula dopaminergikoak → oinaldeko nukleoak)'),
          c('Tolespen zefalikoa (4. astea) · Istmoa (5. astea)', { note: 'Parkinson: gai beltzeko neuronak hil' }),
        ],
        ['tartekoa'],
      ),
      r(
        [
          c('Erronbentzefaloa', { span: 2, note: '3 · erronbo forma' }),
          'Metentzefaloa',
          c('IV. bentrikulua', { span: 2, note: 'erronbo forma · Luschka (2) + Magendie (1)' }),
          c('Zubia (bentralean, bide trinkoak) · Zerebeloa / garuntxoa (dortsalean, ezpain erronboideetatik)'),
          c('Zubi-tolespena (5. astea, dortsalki)', { note: 'Zoruan: motorra medial, sentsitiboa lateral' }),
        ],
        ['atzekoa'],
      ),
      r(
        [
          null,
          'Mielentzefaloa',
          null,
          c('Erraboila (burmuina ↔ ornomuina): piramideak (bentralean, motorrak) eta atzeko zutabeen nukleoak (dortsalean)'),
          c('Tolespen zerbikala (4. astea)', { note: 'Kaudalean hodi ependimarioa' }),
        ],
        ['atzekoa'],
      ),
      r(
        [
          c('Hodi neural kaudala', { note: 'lepotik behera' }),
          'Ornomuina',
          c('Hodi ependimarioa', { note: 'hodi zentrala' }),
          c('Gai grisa barnean (H forma) · Gai zuria kanpoan (goranzko eta beheranzko bideak)'),
          c('L1–L2 mailetan amaitu', { note: 'Konoa + zaldi-buztana + filum terminale' }),
        ],
        ['ornomuina'],
      ),
    ],
    filters: [
      { tag: 'aurrekoa', label: 'Prosentzefaloa' },
      { tag: 'tartekoa', label: 'Mesentzefaloa' },
      { tag: 'atzekoa', label: 'Erronbentzefaloa' },
      { tag: 'ornomuina', label: 'Ornomuina' },
    ],
    pitfalls: [
      'Ez esan I. edo II. bentrikulua: ALBOKO bentrikuluak dira.',
      'Mesentzefaloan ez dago bentrikulurik: akueduktoak (Silvio) lotzen ditu III. eta IV. bentrikuluak.',
      'Hipofisiak bi jatorri ditu: neurohipofisia hipotalamotik (infundibulua), adenohipofisia estomodeotik (Rathke poltsa).',
    ],
  },
  {
    id: 'ornomuin-matrizea-19',
    week: 19,
    section: '3 · 5 · 5.1',
    title: 'Ornomuina: enbrioitik heldura (geruzak, plakak eta hazkuntza)',
    lead: '3. ataleko anatomia heldua eta 5. ataleko garapena batera: enbrioi-egitura bakoitza zertan bihurtzen den.',
    stage: 'ornomuin-plakak',
    path: true,
    columns: [
      { label: 'Enbrioi-egitura', tone: 'jatorria', w: 1.05 },
      { label: 'Egitura heldua', tone: 'ondorioa', w: 1.15 },
      { label: 'Kokapena', tone: 'kokapena', w: 0.9 },
      { label: 'Funtzioa eta bideak', tone: 'nerbioa', w: 1.55 },
    ],
    rows: [
      r(['Neuroepitelioa', 'Ependimo-geruza + neuroblastoak', 'Hodi zentralaren ertzean', 'Ornomuinaren neuronak eta ependimoa sortzen ditu'], ['geruzak']),
      r(['Manto-geruza', c('Gai grisa', { note: 'H / tximeleta forma' }), 'Barnean', 'Neuronen somak + interneuronak'], ['geruzak']),
      r(['Geruza marginala', 'Gai zuria', 'Kanpoan', 'Axoiak: goranzko (sentsitiboak) eta beheranzko (motorrak) bideak'], ['geruzak']),
      r(['Kanpoko mintz mugatzailea', c('Pia materra', { note: 'behean filum terminale' }), 'Gainazalean', 'Ornomuinari zuzenean itsatsita'], ['geruzak']),
      r(
        [
          'Hegal-plaka',
          c('Eremu sentsitiboa', { note: '2 atzeko adar' }),
          'Dortsala (atzekoa)',
          'Atzeko sustraiak + atzeko sustraiko gongoila (neurona pseudounipolarrak)',
        ],
        ['plakak'],
      ),
      r(['Ildo mugatzailea', 'Muga funtzionala', 'Barruko paretan', 'Alde dortsal sentsitiboa eta bentral motorra bereizten ditu'], ['plakak']),
      r(
        [
          'Oinalde-plaka',
          c('Eremu motorra', { note: '2 aurreko adar' }),
          'Bentrala (aurrekoa)',
          c('Aurreko sustraiak (axoi motorrak)', { note: 'T1–L2 mailetan: alboko adar sinpatikoa' }),
        ],
        ['plakak'],
      ),
      r(['Sabai- eta zoru-plakak', 'Erdiko lerroko muga', 'Mutur dortsal / bentrala', 'Soilik axoiak (konexio-geruzak, ez dute somarik)'], ['plakak']),
      r(
        [
          'Hazkuntza diferentziala',
          c('Konoa (L1–L2) + zaldi-buztana', { move: true }),
          'L1–L2tik behera',
          'Bizkarrezurra azkarrago hazten denez, beheko sustraiak luzatu egiten dira',
        ],
        ['hazkuntza'],
      ),
    ],
    filters: [
      { tag: 'geruzak', label: 'Geruzak (barnetik kanpora)' },
      { tag: 'plakak', label: 'Plakak eta adarrak' },
      { tag: 'hazkuntza', label: 'Hazkuntza (L1–L2)' },
    ],
    pitfalls: [
      'Azterketan izenak aldatzen dira garapenaren arabera: hegal-plaka → eremu sentsitiboa; oinalde-plaka → eremu motorra.',
      'Alboko adarra agertzen bada, mozketa T1–L2 artekoa da (neurona sinpatikoak).',
    ],
  },
  {
    id: 'babesa-meningeak-19',
    week: 19,
    section: '5.1 · 8 · 9',
    title: 'Babesa: meningeak, eremuak, LZR eta klinika',
    lead: 'Kanpotik barrurako ordena, garunaren eta ornomuinaren arteko aldea, eta prozedura kliniko bakoitza non egiten den.',
    stage: 'garuneko-meningeak',
    path: false,
    columns: [
      { label: 'Mintza / eremua', tone: 'kokapena', w: 1.05 },
      { label: 'Jatorria', tone: 'jatorria', w: 0.95 },
      { label: 'Garunean vs. Ornomuinean', tone: 'aldaketa', w: 1.4 },
      { label: 'LZR eta klinika', tone: 'ondorioa', w: 1.4 },
    ],
    rows: [
      r(
        [
          c('Eremu epidurala', { note: 'hezurra ↔ dura' }),
          '—',
          'Garunean potentziala (dura hezurrari itsatsia); ornomuinean erreala (gantza, zainak, nerbioak)',
          c('Anestesia epidurala', { note: 'dura materraren kanpoaldean' }),
        ],
        ['eremuak'],
      ),
      r(
        [
          c('1. Dura materra', { note: 'kanpokoena · gogorrena' }),
          c('Mesodermoa', { note: 'aurreko garunean gandor neurala ere bai' }),
          'Garezurrean hezurrari itsatsita; bizkarrezurrean poltsa durala eratzen du',
          'NSZ babesten du; haren zain-sinuetara drainatzen da LZR',
        ],
        ['mintzak'],
      ),
      r(
        [
          c('2. Araknoidea', { note: 'armiarma-sarea' }),
          c('Gandor neurala', { note: 'mesenkimarekin batera' }),
          'Dura materraren barnean, garunean eta ornomuinean',
          'Araknoideko granulazioetatik LZR zain-sistemara pasatzen da',
        ],
        ['mintzak'],
      ),
      r(
        [
          c('Eremu azpiaraknoideoa', { note: 'araknoidea ↔ pia' }),
          '—',
          'Garuna eta ornomuina inguratzen ditu (LZRz betea)',
          c('LZR zirkulazioa + puntzio lunbarra', { note: 'Luschka (2) eta Magendie (1) zuloetatik; konoaren azpitik' }),
        ],
        ['eremuak'],
      ),
      r(
        [
          c('3. Pia materra', { note: 'barnekoena' }),
          c('Gandor neurala', { note: 'mesenkimarekin batera' }),
          'Zuzenean garuneko eta ornomuineko ehunari atxikita',
          'Behealdean filum terminale osatzen du zaldi-buztanaren erdian',
        ],
        ['mintzak'],
      ),
    ],
    filters: [
      { tag: 'mintzak', label: '3 meningeak' },
      { tag: 'eremuak', label: 'Eremuak eta klinika' },
    ],
    pitfalls: [
      'Garunean EZ dago eremu epidural errealik; ornomuinean bai.',
      'Puntzio lunbarra (eremu azpiaraknoideoa) eta anestesia epidurala (eremu epidurala) biak konoaren (L1–L2) azpitik egiten dira.',
    ],
  },
  {
    id: 'bikote-kranealak-matrizea-19',
    week: 19,
    section: '2 · 11',
    title: '12 bikote kranealak: funtzioa eta berezitasunak',
    lead: 'Aurretik atzera ordenatuta, begiko mugimenduak eta osagai parasinpatikoak bereizita.',
    stage: 'bikote-kranealak',
    path: false,
    columns: [
      { label: 'Bikotea', tone: 'nerbioa', w: 0.5 },
      { label: 'Izena', tone: 'kokapena', w: 1.1 },
      { label: 'Funtzio nagusia', tone: 'ondorioa', w: 1.65 },
      { label: 'Berezitasuna / autonomoa', tone: 'aldaketa', w: 1.3 },
    ],
    rows: [
      r(['I', 'Usaimen-nerbioa', 'Usaimena (nerbio txiki asko → usaimen-erraboilak)', 'Talamotik pasatu gabe doa kortexera'], ['sentsitiboa']),
      r(['II', 'Ikusmen-nerbioa', 'Ikusmena (erretinatik burmuinera)', 'Preparatu anatomikoetan moztuta ageri da'], ['sentsitiboa']),
      r(['III', 'Begi-eragilea', 'Begiaren mugimendu borondatezkoak', c('Parasinpatikoa: begi-ninia uzkurtu', { note: 'gongoil ziliarra' })], ['begia', 'parasinpatikoa']),
      r(['IV', 'Troklearra', 'Begiaren mugimendua', c('Alde dortsaletik ateratzen den bakarra', { note: 'istmoa inguratuz' })], ['begia']),
      r(['V', 'Trigeminoa', 'Aurpegiaren, ahoaren eta hortzen sentsibilitatea + murtxikatzea', '3 adar: oftalmikoa, maxilarra, mandibularra'], ['sentsitiboa', 'motorra']),
      r(['VI', 'Aldentzailea', 'Begiaren mugimendua', 'III. eta IV.arekin batera begiko mugimenduak'], ['begia']),
      r(['VII', 'Faziala (aurpegi-nerbioa)', 'Aurpegiko adierazpen-muskuluak + dastamena', 'Parasinpatikoa: malko- eta listu-guruinak'], ['motorra', 'parasinpatikoa']),
      r(['VIII', 'Estatoakustikoa', 'Oreka (bestibularra) eta entzumena (koklearra)', 'Belarritik burmuinera'], ['sentsitiboa']),
      r(['IX', 'Glosofaringeoa', 'Ahoaren atzeko zatia, faringea eta dastamena', 'Osagai parasinpatikoa (parotida)'], ['sentsitiboa', 'parasinpatikoa']),
      r(['X', 'Bagoa', 'Nerbio mistoa: toraxeko eta abdomeneko erraiak', c('Gorputz osoko parasinpatiko handiena', { note: 'errai-sareak' })], ['parasinpatikoa']),
      r(['XI', 'Osagarria (espinala)', 'Lepo eta burua mugitu (esternokleidomastoideoa, trapezioa)', 'Atal bat burmuinetik, bestea lepoko ornomuinetik'], ['motorra']),
      r(['XII', 'Hipoglosoa', 'Mihiaren mugimendua', 'Mihiko muskuluak inerbatzen ditu'], ['motorra']),
    ],
    filters: [
      { tag: 'sentsitiboa', label: 'Sentsitiboak' },
      { tag: 'begia', label: 'Begia (III, IV, VI)' },
      { tag: 'parasinpatikoa', label: 'Parasinpatikoak (III, VII, IX, X)' },
      { tag: 'motorra', label: 'Motorrak' },
    ],
    pitfalls: [
      'Bikote kraneal batek osagai autonomoa badu, BETI parasinpatikoa da (III., VII., IX. eta X.).',
      'IV. bikotea (troklearra) da garun-enborraren alde dortsaletik ateratzen den bakarra.',
    ],
  },
];

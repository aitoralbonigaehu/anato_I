import type { StudyCard } from './model';

export type ArchId = 'I' | 'II' | 'III' | 'IV' | 'VI';

export interface ArchFamily {
  arch: ArchId;
  label: string;
  level: 'Azalekoa' | 'Sakona';
  cartilage: string;
  nerve: string;
  muscles: string;
}

export const ARCH_FAMILIES: Record<ArchId, ArchFamily> = {
  I: {
    arch: 'I',
    label: 'I. arkua',
    level: 'Azalekoa',
    cartilage: 'Meckel (endekatu) → mailua, ingudea · Baraila inguruko mesenkimatik · Maxilarra, zigomatikoa, kutxa tinpanikoa',
    nerve: 'V3 · barail-nerbioa (trigeminoaren adar motor bakarra)',
    muscles: 'Murtxikatzaileak: maseteroa, tenporala, digastrikoaren aurreko sabela',
  },
  II: {
    arch: 'II',
    label: 'II. arkua',
    level: 'Azalekoa',
    cartilage: 'Reichert (endekatu) → ointokia, estiloide apofisia, lotailu estilohioideoa · Hioidearen adar txikiak eta goiko erdia',
    nerve: 'VII · aurpegi-nerbioa (mistoa, batez ere motorra)',
    muscles: 'Muskulu mimikoak, platisma, digastrikoaren atzeko sabela',
  },
  III: {
    arch: 'III',
    label: 'III. arkua',
    level: 'Sakona',
    cartilage: 'Hioidearen gorputzaren beheko erdia eta adar nagusiak',
    nerve: 'IX · glosofaringeoa (mistoa)',
    muscles: 'Estilofaringeoa, faringearen goiko ertzatzaileak',
  },
  IV: {
    arch: 'IV',
    label: 'IV. arkua',
    level: 'Sakona',
    cartilage: 'Tiroide kartilagoaren goiko aldea (kartilagoa bakarrik)',
    nerve: 'X · bagoa: goiko laringe-nerbioa',
    muscles: 'Faringearen tarteko eta beheko ertzatzaileak',
  },
  VI: {
    arch: 'VI',
    label: 'VI. arkua',
    level: 'Sakona',
    cartilage: 'Tiroide kartilagoaren beheko atala, krikoidea, epiglotisa, aritenoideak, kornikulatuak, kuneiformeak',
    nerve: 'X · bagoa: laringe-nerbio atzerakaria',
    muscles: 'Laringe barneko muskuluak',
  },
};

export const ARCH_ORDER: ArchId[] = ['I', 'II', 'III', 'IV', 'VI'];

export interface ArchDrillItem {
  id: string;
  item: string;
  kind: 'Kartilagoa / Hezurra' | 'Nerbioa' | 'Muskulua';
  arch: ArchId;
  trap?: boolean;
  contrast?: string;
}

/** Quick-fire classifier: one derivative → pick I / II / III / IV / VI and lock in its full family. */
export const ARCH_DRILL_17: ArchDrillItem[] = [
  // I. arkua
  {
    id: 'd-mailua',
    item: 'Mailua eta ingudea',
    kind: 'Kartilagoa / Hezurra',
    arch: 'I',
    trap: true,
    contrast: 'Belarriko hezurtxoak: mailua eta ingudea I. arkutik (Meckel); ointokia II. arkutik (Reichert).',
  },
  {
    id: 'd-meckel',
    item: 'Meckel kartilagoa',
    kind: 'Kartilagoa / Hezurra',
    arch: 'I',
    trap: true,
    contrast: 'Meckel I. arkukoa da (endekatu egiten da; baraila inguruko mesenkimatik dator, ez kartilagotik). Reichert II. arkukoa da.',
  },
  {
    id: 'd-baraila',
    item: 'Baraila (inguruko mesenkimatik)',
    kind: 'Kartilagoa / Hezurra',
    arch: 'I',
    trap: true,
    contrast: 'Baraila I. arkukoa da, baina EZ da Meckel kartilagotik sortzen: haren inguruko mesenkimatik, Meckel gida dela.',
  },
  {
    id: 'd-maxilarra',
    item: 'Hezur maxilarra eta zigomatikoa',
    kind: 'Kartilagoa / Hezurra',
    arch: 'I',
  },
  {
    id: 'd-v3',
    item: 'V3 · barail-nerbioa',
    kind: 'Nerbioa',
    arch: 'I',
    trap: true,
    contrast: 'Trigeminoaren 3 adarretatik V3 bakarrik da I. arkukoa eta motorra (V1 eta V2 soilik sentsitiboak dira).',
  },
  {
    id: 'd-maseteroa',
    item: 'Maseteroa eta tenporala (murtxikatzaileak)',
    kind: 'Muskulua',
    arch: 'I',
  },
  {
    id: 'd-digastriko-aurre',
    item: 'Digastrikoaren aurreko sabela',
    kind: 'Muskulua',
    arch: 'I',
    trap: true,
    contrast: 'Digastrikoak bi arku ditu: aurreko sabela I. arkua (V3); atzeko sabela II. arkua (VII).',
  },

  // II. arkua
  {
    id: 'd-ointokia',
    item: 'Ointokia',
    kind: 'Kartilagoa / Hezurra',
    arch: 'II',
    trap: true,
    contrast: 'Ointokia II. arkutik dator (Reichert); mailua eta ingudea I. arkutik (Meckel).',
  },
  {
    id: 'd-reichert',
    item: 'Reichert kartilagoa',
    kind: 'Kartilagoa / Hezurra',
    arch: 'II',
    trap: true,
    contrast: 'Reichert II. arkukoa da (ointokia + estiloide apofisia); Meckel I. arkukoa da.',
  },
  {
    id: 'd-estiloide',
    item: 'Estiloide apofisia eta lotailu estilohioideoa',
    kind: 'Kartilagoa / Hezurra',
    arch: 'II',
  },
  {
    id: 'd-hioide-goi',
    item: 'Hioidearen adar txikiak eta gorputzaren goiko erdia',
    kind: 'Kartilagoa / Hezurra',
    arch: 'II',
    trap: true,
    contrast: 'Hioideak bi arku ditu: goiko erdia eta adar txikiak II. arkutik; beheko erdia eta adar nagusiak III.etik.',
  },
  {
    id: 'd-vii',
    item: 'VII · aurpegi-nerbioa',
    kind: 'Nerbioa',
    arch: 'II',
  },
  {
    id: 'd-mimikoak',
    item: 'Muskulu mimikoak eta platisma',
    kind: 'Muskulua',
    arch: 'II',
  },
  {
    id: 'd-digastriko-atze',
    item: 'Digastrikoaren atzeko sabela',
    kind: 'Muskulua',
    arch: 'II',
    trap: true,
    contrast: 'Atzeko sabela II. arkua da (VII); aurreko sabela I. arkua da (V3).',
  },

  // III. arkua
  {
    id: 'd-hioide-behe',
    item: 'Hioidearen gorputzaren beheko erdia eta adar nagusiak',
    kind: 'Kartilagoa / Hezurra',
    arch: 'III',
    trap: true,
    contrast: 'Beheko erdia eta adar nagusiak III. arkutik; goiko erdia eta adar txikiak II. arkutik.',
  },
  {
    id: 'd-ix',
    item: 'IX · nerbio glosofaringeoa',
    kind: 'Nerbioa',
    arch: 'III',
  },
  {
    id: 'd-estilofaringeoa',
    item: 'Estilofaringeoa',
    kind: 'Muskulua',
    arch: 'III',
    trap: true,
    contrast: 'Estilofaringeoa III. arkukoa da (IX). Estiloide apofisia eta lotailu estilohioideoa, berriz, II. arkukoak.',
  },
  {
    id: 'd-ertzatzaile-goi',
    item: 'Faringearen goiko ertzatzaileak',
    kind: 'Muskulua',
    arch: 'III',
    trap: true,
    contrast: 'Faringearen ertzatzaileak: goikoak III. arkutik (IX); tartekoak eta behekoak IV. arkutik (X).',
  },

  // IV. arkua
  {
    id: 'd-tiroide-goi',
    item: 'Tiroide kartilagoaren goiko aldea',
    kind: 'Kartilagoa / Hezurra',
    arch: 'IV',
    trap: true,
    contrast: 'Tiroide kartilagoa: goiko aldea IV. arkutik; beheko atala VI. arkutik.',
  },
  {
    id: 'd-goiko-laringe',
    item: 'X · bagoa: goiko laringe-nerbioa',
    kind: 'Nerbioa',
    arch: 'IV',
    trap: true,
    contrast: 'Bagoaren bi adarrak: goiko laringe-nerbioa IV. arkukoa; laringe-nerbio atzerakaria VI. arkukoa.',
  },
  {
    id: 'd-ertzatzaile-behe',
    item: 'Faringearen tarteko eta beheko ertzatzaileak',
    kind: 'Muskulua',
    arch: 'IV',
    trap: true,
    contrast: 'Tartekoak eta behekoak IV. arkutik (X); goiko ertzatzaileak III. arkutik (IX).',
  },

  // VI. arkua
  {
    id: 'd-tiroide-behe',
    item: 'Tiroide kartilagoaren beheko atala',
    kind: 'Kartilagoa / Hezurra',
    arch: 'VI',
    trap: true,
    contrast: 'Beheko atala VI. arkutik dator; goiko aldea IV. arkutik.',
  },
  {
    id: 'd-krikoidea',
    item: 'Krikoidea, epiglotisa, aritenoideak, kornikulatuak eta kuneiformeak',
    kind: 'Kartilagoa / Hezurra',
    arch: 'VI',
  },
  {
    id: 'd-atzerakaria',
    item: 'X · bagoa: laringe-nerbio atzerakaria',
    kind: 'Nerbioa',
    arch: 'VI',
    trap: true,
    contrast: 'Atzerakaria VI. arkukoa da (laringe barneko muskuluak); goiko laringe-nerbioa IV. arkukoa.',
  },
  {
    id: 'd-laringe-barnekoak',
    item: 'Laringe barneko muskuluak',
    kind: 'Muskulua',
    arch: 'VI',
  },
];

export const CARDS17_TAGS = [
  { id: 'paketea', label: 'Pista → arku osoa' },
  { id: 'kontrasteak', label: 'Nahasketa klasikoak' },
  { id: 'kraneoa', label: 'Kraneoa eta jatorriak' },
];

/**
 * Relationship-first Anki cards for Topic 17 (taught content only):
 * - paketea: 1 clue → reconstruct the entire arch family (arch + cartilage + nerve + muscles).
 * - kontrasteak: face-to-face pairs that students routinely confuse.
 * - kraneoa: skull parts, fontanelles, germ origins and arch layers.
 */
export const CARDS17: StudyCard[] = [
  // ── PISTA → ARKU OSOA (reconstruct full package from any entry point) ──
  {
    id: 'p1-arkua',
    tag: 'paketea',
    q: 'I. arkua: zein kartilago/hezur, zein nerbio eta zein muskulu ditu?',
    a: 'Meckel (mailua, ingudea; baraila inguruko mesenkimatik; maxilarra, zigomatikoa) · V3 barail-nerbioa · Murtxikatzaileak (maseteroa, tenporala) eta digastrikoaren aurreko sabela.',
    keys: ['I'],
  },
  {
    id: 'p1-nerbioa',
    tag: 'paketea',
    q: 'Pista: V3 barail-nerbioa. Zein arkukoa da, eta zein kartilago/hezur eta muskulu dagozkio?',
    a: 'I. arkua (azalekoa): Meckel (mailua, ingudea), baraila (mesenkimatik), maxilarra/zigomatikoa + murtxikatzaileak (maseteroa, tenporala) eta digastrikoaren aurreko sabela.',
    keys: ['I'],
  },
  {
    id: 'p1-hezurra',
    tag: 'paketea',
    q: 'Pista: mailua eta ingudea. Zein arkutakoak dira, eta zein nerbio eta muskulurekin partekatzen dute arkua?',
    a: 'I. arkua (Meckel kartilagoaren goiko muturra): V3 barail-nerbioa + murtxikatzaileak eta digastrikoaren aurreko sabela.',
    keys: ['I'],
  },
  {
    id: 'p2-arkua',
    tag: 'paketea',
    q: 'II. arkua: zein kartilago/hezur, zein nerbio eta zein muskulu ditu?',
    a: 'Reichert (ointokia, estiloide apofisia, lotailu estilohioideoa; hioidearen goiko erdia eta adar txikiak) · VII aurpegi-nerbioa · Muskulu mimikoak, platisma eta digastrikoaren atzeko sabela.',
    keys: ['II'],
  },
  {
    id: 'p2-nerbioa',
    tag: 'paketea',
    q: 'Pista: VII aurpegi-nerbioa. Zein arkukoa da, eta zein hezur/kartilago eta muskulu dagozkio?',
    a: 'II. arkua (azalekoa): Reichert (ointokia, estiloide apofisia, hioidearen goiko erdia eta adar txikiak) + muskulu mimikoak, platisma eta digastrikoaren atzeko sabela.',
    keys: ['II'],
  },
  {
    id: 'p2-hezurra',
    tag: 'paketea',
    q: 'Pista: ointokia. Zein arkutakoa da, eta zein nerbio eta muskulurekin partekatzen du arkua?',
    a: 'II. arkua (Reichert kartilagoa): VII aurpegi-nerbioa + muskulu mimikoak, platisma eta digastrikoaren atzeko sabela.',
    keys: ['II'],
  },
  {
    id: 'p3-arkua',
    tag: 'paketea',
    q: 'III. arkua: zein hezur, zein nerbio eta zein muskulu ditu?',
    a: 'Hioidearen gorputzaren beheko erdia eta adar nagusiak · IX glosofaringeoa · Estilofaringeoa eta faringearen goiko ertzatzaileak (sakonak).',
    keys: ['III'],
  },
  {
    id: 'p3-nerbioa',
    tag: 'paketea',
    q: 'Pista: IX glosofaringeoa. Zein arkukoa da, eta zein hezur eta muskulu dagozkio?',
    a: 'III. arkua (sakona): hioidearen beheko erdia eta adar nagusiak + estilofaringeoa eta faringearen goiko ertzatzaileak.',
    keys: ['III'],
  },
  {
    id: 'p4-arkua',
    tag: 'paketea',
    q: 'IV. arkua: zein kartilago, zein nerbio-adar eta zein muskulu ditu?',
    a: 'Tiroide kartilagoaren goiko aldea (kartilagoa bakarrik) · X bagoaren goiko laringe-nerbioa · Faringearen tarteko eta beheko ertzatzaileak (sakonak).',
    keys: ['IV'],
  },
  {
    id: 'p4-nerbioa',
    tag: 'paketea',
    q: 'Pista: goiko laringe-nerbioa (X). Zein arkukoa da, eta zein kartilago eta muskulu dagozkio?',
    a: 'IV. arkua (sakona): tiroide kartilagoaren goiko aldea + faringearen tarteko eta beheko ertzatzaileak.',
    keys: ['IV'],
  },
  {
    id: 'p6-arkua',
    tag: 'paketea',
    q: 'VI. arkua: zein kartilago, zein nerbio-adar eta zein muskulu ditu?',
    a: 'Tiroidearen beheko atala, krikoidea, epiglotisa, aritenoideak, kornikulatuak, kuneiformeak · X bagoaren laringe-nerbio atzerakaria · Laringe barneko muskuluak.',
    keys: ['VI'],
  },
  {
    id: 'p6-nerbioa',
    tag: 'paketea',
    q: 'Pista: laringe-nerbio atzerakaria (X). Zein arkukoa da, eta zein kartilago eta muskulu dagozkio?',
    a: 'VI. arkua (sakona): tiroidearen beheko atala + krikoidea, epiglotisa, aritenoideak, kornikulatuak, kuneiformeak + laringe barneko muskuluak.',
    keys: ['VI'],
  },

  // ── NAHASKETA KLASIKOAK (face-to-face contrasts) ──
  {
    id: 'c-digastrikoa',
    tag: 'kontrasteak',
    q: 'Digastrikoa: aurreko sabela vs. atzeko sabela — zein arku eta zein nerbio bakoitza?',
    a: 'Aurreko sabela → I. arkua (V3 barail-nerbioa). Atzeko sabela → II. arkua (VII aurpegi-nerbioa).',
    keys: ['I', 'II'],
  },
  {
    id: 'c-hioidea',
    tag: 'kontrasteak',
    q: 'Hioidea: goiko erdia eta adar txikiak vs. beheko erdia eta adar nagusiak — zein arku bakoitza?',
    a: 'Goiko erdia eta adar txikiak → II. arkua (Reichert). Beheko erdia eta adar nagusiak → III. arkua.',
    keys: ['II', 'III'],
  },
  {
    id: 'c-belarria',
    tag: 'kontrasteak',
    q: 'Tarteko belarriko 3 hezurtxoak: nola banatzen dira I. eta II. arkuen artean?',
    a: 'Mailua eta ingudea → I. arkua (Meckel kartilagoa). Ointokia → II. arkua (Reichert kartilagoa).',
    keys: ['I', 'II'],
  },
  {
    id: 'c-ertzatzaileak',
    tag: 'kontrasteak',
    q: 'Faringearen ertzatzaileak: goikoak vs. tartekoak eta behekoak — zein arku eta nerbio?',
    a: 'Goiko ertzatzaileak → III. arkua (IX glosofaringeoa). Tartekoak eta behekoak → IV. arkua (X goiko laringe-nerbioa).',
    keys: ['III', 'IV'],
  },
  {
    id: 'c-tiroidea',
    tag: 'kontrasteak',
    q: 'Tiroide kartilagoa: nola banatzen da IV. eta VI. arkuen artean?',
    a: 'Goiko aldea → IV. arkua. Beheko atala → VI. arkua (krikoidea, epiglotisa eta gainerako laringe-kartilagoekin batera).',
    keys: ['IV', 'VI'],
  },
  {
    id: 'c-bagoa',
    tag: 'kontrasteak',
    q: 'Bagoaren (X) bi adarrak faringe-arkuetan: zein da IV. arkukoa eta zein VI. arkukoa?',
    a: 'IV. arkua → goiko laringe-nerbioa (faringearen tarteko/beheko ertzatzaileak). VI. arkua → laringe-nerbio atzerakaria (laringe barneko muskuluak).',
    keys: ['IV', 'VI'],
  },
  {
    id: 'c-baraila',
    tag: 'kontrasteak',
    q: 'Baraila Meckel kartilagotik sortzen al da?',
    a: 'EZ. Meckel kartilagoa gida da eta endekatu egiten da; baraila haren inguruko mesenkimatik sortzen da (I. arkua).',
    keys: ['I'],
  },
  {
    id: 'c-trigeminoa',
    tag: 'kontrasteak',
    q: 'Trigeminoaren (V) 3 adarrak: zein dira soilik sentsitiboak eta zein da I. arkuko adar motor bakarra?',
    a: 'V1 (oftalmikoa) eta V2 (maxilarra) soilik sentsitiboak dira. V3 (barail-nerbioa) mistoa da: trigeminoaren adar motor bakarra eta I. arkukoa.',
    keys: ['I'],
  },
  {
    id: 'c-estilo',
    tag: 'kontrasteak',
    q: 'Estiloide apofisia / lotailu estilohioideoa vs. estilofaringeo muskulua — zein arku bakoitza?',
    a: 'Estiloide apofisia eta lotailu estilohioideoa → II. arkua (Reichert). Estilofaringeo muskulua → III. arkua (IX glosofaringeoa).',
    keys: ['II', 'III'],
  },
  {
    id: 'c-v-arkua',
    tag: 'kontrasteak',
    q: 'Zer gertatzen da V. arkuarekin, eta zer berezitasun dute IV. eta VI. arkuek hezurrei dagokienez?',
    a: 'V. arkua agertu eta endekatu egiten da (ez du eratorririk uzten). IV. eta VI. arkuetan EZ dago hezurrik ez lotailurik: laringeko kartilagoak bakarrik.',
    keys: ['IV', 'VI'],
  },
  {
    id: 'c-nerbio-araua',
    tag: 'kontrasteak',
    q: 'Zergatik esaten da nerbioak adierazten duela muskulu bat zein arkutatik datorren?',
    a: 'Muskuluek migratu egiten dute beren azken kokapenera, baina jatorrizko arkuko nerbioa beraiekin eramaten dute beti.',
  },

  // ── KRANEOA ETA JATORRIAK ──
  {
    id: 'k-bi-atalak',
    tag: 'kraneoa',
    q: 'Kraneoaren bi atalak: zertan bereizten dira neurokraneoa eta errai-kraneoa?',
    a: 'Neurokraneoak garuna babesten du (ganga mintzezko hezurtzapenez; oinaldeko gehienak endokondralez). Errai-kraneoa aurpegiko hezurrak dira, ia guztiak gandor neuraletik.',
  },
  {
    id: 'k-fontanelak',
    tag: 'kraneoa',
    q: 'Jostura vs. fontanela, eta noiz ixten dira aurreko eta atzeko fontanelak?',
    a: 'Jostura: 2 hezurren arteko lotura. Fontanela: 2 hezur baino gehiago elkartzen diren tokia. Aurrekoa 18. hilabetean ixten da; atzekoa (txikiagoa) lehen hilabetean.',
  },
  {
    id: 'k-meningeak',
    tag: 'kraneoa',
    q: 'Hiru meningeak, bi jatorri: nondik dator bakoitza?',
    a: 'Dura materra → mesodermo paraxiala. Araknoidea eta pia materra → gandor neurala.',
  },
  {
    id: 'k-gandorra',
    tag: 'kraneoa',
    q: 'Zer lau multzo ematen ditu gandor neuralak buruan?',
    a: 'Errai-kraneoko hezurrak · beste hezur batzuk (kopeta/zelotokia, loki-hezurra ia osoa, esfenoidea) · araknoidea eta pia materra · V., VII., IX. eta X. nerbioen gongoiletako zelulak (plakodekin batera).',
  },
  {
    id: 'k-mesodermoa',
    tag: 'kraneoa',
    q: 'Mesodermo paraxiala vs. alboko mesodermoa buruan: zer ematen du bakoitzak?',
    a: 'Mesodermo paraxiala → errai-kraneoko muskulu somatikoak + dura materra. Alboko mesodermoa → aritenoide eta krikoide kartilagoak (VI. arkuan).',
  },
  {
    id: 'k-geruzak',
    tag: 'kraneoa',
    q: 'Faringe-arku baten 3 estalki/geruzak kanpotik barrura, eta zer dago barneko mesenkiman?',
    a: 'Kanpoan ektodermoa, barnean endodermoa, erdian mesenkima (mesodermoa + gandor neurala). Barnean: kartilagoa, arteria, nerbioa eta muskuluak.',
  },
];

import { findTargets, type ElementLike, type RootLike, type TargetSpec } from './geometry';
import type { TourId } from './store';

/** One way of lighting a stop; a stop tries its variants in order (e.g. the desk layout, then the tablet one). */
export type Variant = TargetSpec & { title?: string; text?: string };

export type Stop = {
  id: string;
  title: string;
  text: string;
  /** Keys shown under the text: [key, what it does]. */
  keys?: [string, string][];
  targets: Variant[];
  /** A toggle (its data-tour id) the stop presses to show its target; pressed back when the stop ends. */
  open?: string;
  /** Lit elements that can come and go mid-stop (a drawer sliding in): keep measuring. */
  live?: boolean;
};

/**
 * Simulator: how to study, in the order a student meets it — where you are, the picture, what to
 * click, how to move through it, the notes, testing yourself, and where help lives. One sentence,
 * at most two, per stop: about a minute in all.
 */
export const SIM_STOPS: Stop[] = [
  {
    id: 'gaiak',
    title: 'Aukeratu gaia',
    text: 'Hemen aukeratzen duzu gaia: klikatuta, gai guztiak agertzen dira, garapenaren ordenan.',
    targets: [{ ids: ['gaiak'], max: 1 }, { ids: ['gaia-hautatu'], max: 1 }],
  },
  {
    id: 'etapak',
    title: 'Etapak',
    text: 'Gaia etapatan banatuta dago, apunteen ordenan. Hemen ikusten duzu non zauden; klikatuta, etapa guztien zerrenda.',
    targets: [{ ids: ['etapak'] }],
  },
  {
    id: 'eszena',
    title: 'Eszena',
    text: 'Hau da enbrioia, zure apunteetako izenekin. Arrastatu mugitzeko; Ctrl + gurpila, handitzeko.',
    targets: [{ ids: ['eszena'] }],
  },
  {
    id: 'egitura',
    title: 'Klikatu egitura bat',
    text: 'Klikatu edozein egitura edo haren izena: zer den, nondik datorren eta zertan bihurtzen den. Testuko izen azpimarratuek gauza bera egiten dute.',
    targets: [{ ids: ['etiketak'], children: true, max: 1 }, { ids: ['eszena'] }],
  },
  {
    id: 'norabideak',
    title: 'Norabideak',
    text: 'Ertzetako etiketek irudiaren orientazioa ematen dute: zer dagoen goian, behean eta alboetan.',
    targets: [{ ids: ['norabideak'], children: true, min: 2 }],
  },
  {
    id: 'ebakiak',
    title: 'Ebakiak',
    text: 'Aldatu ebakia gauza bera beste ikuspegi batetik ikusteko (1–9 teklak). Irudi txikiak non zauden erakusten du.',
    targets: [
      { ids: ['ebakiak', 'non-nago'], min: 2 },
      { ids: ['non-nago'], title: 'Non nago?', text: 'Irudi txiki honek zer ikusten duzun erakusten du: zein ebaki den eta nondik begiratzen duzun.' },
    ],
  },
  {
    id: 'erreproduzitu',
    title: 'Urratsez urrats',
    text: 'Etapa martxan jarri edo pausatu (Zuriunea). Barrako zati bakoitza urrats bat da: klikatu edo arrastatu.',
    targets: [{ ids: ['erreprodukzioa-mugikorra'], text: 'Etapa martxan jarri edo pausatu, eta urratsez urrats aurrera edo atzera egin.' }, { ids: ['erreprodukzioa'] }],
  },
  {
    id: 'modua',
    title: 'Hiru modu',
    text: '«Gidatua» urratsez urrats doa, galdera txikiekin (gai batzuetan Kimuk klasea ematen du); «Arrunta», jarraian; «Azkarra», minutu batean errepasatzeko (G).',
    targets: [{ ids: ['modua'] }],
  },
  {
    id: 'apunteak',
    title: 'Apunteak',
    text: 'Zure apunteak, simulazioarekin batera argituta (N tekla). Esaldi edo irudi bat klikatuta, hara joaten da simulazioa.',
    open: 'apunteak',
    live: true,
    targets: [{ ids: ['apunteak', 'eskuineko-zutabea'], min: 2 }, { ids: ['apunteak'] }],
  },
  {
    id: 'frogatu',
    title: 'Frogatu zure burua',
    text: '«Aurkitu»: egitura irudian topatu. «Galderak»: akats bakoitzaren azalpenarekin, eta huts egindakoak errepasatzeko.',
    targets: [
      { ids: ['aurkitu', 'galderak'], min: 2 },
      { ids: ['galderak'], text: '«Galderak»: akats bakoitzaren azalpenarekin, eta huts egindakoak errepasatzeko. «Aurkitu» jokoa «Tresnak» menuan dago.' },
    ],
  },
  {
    id: 'eguna',
    title: 'Zer dago egun honetan?',
    text: 'Egun-txipak zer den berria, zer dagoen jada eta zer desagertu den erakusten du. Kronologia osoa «Tresnak» menuan duzu.',
    targets: [{ ids: ['eguna'] }],
  },
  {
    id: 'kimu',
    title: 'Galdetu Kimuri',
    text: 'Galdetu edozer, euskaraz, gaztelaniaz edo ingelesez (K tekla): azalpena hasten den urratsera eramango zaitu.',
    targets: [{ ids: ['kimu'], max: 1 }, { ids: ['tresnak'], title: 'Kimu eta tresnak', text: 'Kimu, glosarioa, kronologia eta irudiak hemen daude. Galdetu Kimuri edozer: azalpenaren urratsera eramango zaitu.' }],
  },
  {
    id: 'aurrerapena',
    title: 'Zure aurrerapena',
    text: 'Ireki duzun etapa bakoitza eta hor emandako denbora gordetzen dira: «Tresnak» menuko «Aurrerapena» orrian ikusiko dituzu, gaika, zure bolada eta lorpenekin.',
    targets: [{ ids: ['tresnak'] }],
  },
  {
    id: 'laguntza',
    title: 'Teklak eta laguntza',
    text: 'Teklatuarekin azkarrago ikasten da. Gida hau eta botoi guztien azalpena «?» botoian dituzu beti.',
    keys: [
      ['Zuriunea', 'hasi, pausatu'],
      ['← →', 'urratsak'],
      ['1–9', 'ebakiak'],
      ['L', 'etiketak'],
      ['N', 'apunteak'],
      ['K', 'Kimu'],
    ],
    targets: [{ ids: ['laguntza'] }, { ids: ['tresnak'], text: 'Gida hau eta botoi guztien azalpena «Tresnak» menuko «Laguntza» atalean dituzu beti.' }],
  },
];

/** Home: where to start, and where everything lives. The simulator has its own guide, offered the first time it opens. */
export const HOME_STOPS: Stop[] = [
  {
    id: 'hasi',
    title: 'Hasi edo jarraitu',
    text: 'Hemendik hasten zara. Itzultzen zarenean, utzi zenuen etapatik jarraitzen du.',
    targets: [{ ids: ['hasi'] }],
  },
  {
    id: 'gaiak',
    title: 'Aukeratu gaia',
    text: 'Gai bakoitza apunteetako bat da, bere eszenarekin eta zure aurrerapenarekin. Klikatu bat, hantxe hasteko.',
    targets: [{ ids: ['gaiak'], children: true, row: true, max: 4 }],
  },
  {
    id: 'simulagailua',
    title: 'Simulagailua',
    text: 'Han ikasten da benetan: urratsez urrats, 2D eta 3D, zure apunteekin batera. Beti goiko barra honetan.',
    targets: [{ ids: ['simulagailua'] }],
  },
  {
    id: 'ikasgela',
    title: 'Ikasgela menua',
    text: 'Ikasteko orri guztiak: gai bakoitzaren gela (mapa, taulak, fitxak), Eratorriak, Belortzioak (Ikasketa moduarekin), Irudiak, Egiturak eta Fitxak.',
    targets: [{ ids: ['ikasgela'] }],
  },
  {
    id: 'kronologia',
    title: 'Kronologia',
    text: 'Garapen osoa egunez egun, gai guztiak denbora-lerro bakarrean. Aukeratu egun bat, eta zer dagoen ikusiko duzu.',
    targets: [{ ids: ['kronologia'] }],
  },
  {
    id: 'bilatu',
    title: 'Bilatu edozer',
    text: 'Gai, etapa, egitura edo ekintza bat: idatzi eta joan zuzenean (Ctrl + K, edonondik).',
    targets: [{ ids: ['bilatu'], max: 1 }],
  },
  {
    id: 'aurrerapena',
    title: 'Zure aurrerapena',
    text: 'Sugarrak zure bolada erakusten du: zenbat egun jarraian ikasi duzun. Klikatuta: zure maila, gaika zer ikusi duzun eta zenbat aldiz, txartelak eta lorpenak.',
    targets: [{ ids: ['aurrerapena'] }],
  },
  {
    id: 'kimu',
    title: 'Galdetu Kimuri',
    text: 'Kimu zure enbriologia-laguna da: galdetu edozer, eta azalpena dagoen lekura eramango zaitu (K tekla).',
    targets: [{ ids: ['kimu'], max: 1 }],
  },
  {
    id: 'laguntza',
    title: 'Gida, beti eskura',
    text: 'Gida hau «?» botoian duzu beti. Simulagailuak eta Belortzioak berea dute, toki berean.',
    targets: [{ ids: ['laguntza'] }],
  },
];

/** Belortzioak: the figures, the three ways to use them, and the study mode. */
export const BEL_STOPS: Stop[] = [
  {
    id: 'sistemak',
    title: 'Aukeratu sistema',
    text: 'Irudiak sistemaka daude. «Fusionatuak»: irudi bera, kopia guztietako izenak batera.',
    targets: [{ ids: ['bel-sistemak'] }],
  },
  {
    id: 'irudiak',
    title: 'Irudiak',
    text: 'Sistemaren irudi guztiak, ehunekoarekin: zenbat egitura dakizkizun. ← → teklekin ere mugitzen zara.',
    targets: [{ ids: ['bel-irudiak'] }],
  },
  {
    id: 'irudia',
    title: 'Esploratu',
    text: 'Pasatu sagua izen baten gainetik: haren egitura argitzen da. Klikatu izena gorriz edo laranjaz markatzeko (ez dakit / zalantza).',
    targets: [{ ids: ['bel-irudia'] }],
  },
  {
    id: 'moduak',
    title: 'Zer da? Non dago?',
    text: '«Zer da?»: gezi batek egitura seinalatzen du, eta zuk izena esan (aukerak, buruz edo idatziz). «Non dago?»: izena ematen da, eta zuk irudian sakatu.',
    targets: [{ ids: ['bel-moduak'] }],
  },
  {
    id: 'ikasketa',
    title: 'Ikasketa modua',
    text: 'Gezi bat argitzen da: pentsatu izena, eman buelta txartelari eta esan asmatu duzun. Huts egindakoak berriz agertzen dira.',
    targets: [{ ids: ['ikasketa'] }],
  },
  {
    id: 'aurrerapena',
    title: 'Zure aurrerapenean gordeta',
    text: 'Txartel bakoitza bere kutxan doa (berria → ikasten → badakizu → menderatuta). Aurrerapena orrian ikusiko duzu, sistemaka.',
    targets: [{ ids: ['aurrerapena'] }],
  },
];

export const STOPS: Record<TourId, Stop[]> = { sim: SIM_STOPS, home: HOME_STOPS, bel: BEL_STOPS };

/** What a stop says when lit by a given variant (a variant can reword it for its layout). */
export const copyOf = (s: Stop, v?: Variant) => ({ title: v?.title ?? s.title, text: v?.text ?? s.text });

/** The first variant of a stop that is on screen now, with its elements; null when none is. */
export function resolveStop(stop: Stop, root: RootLike, vw: number, vh: number, scrolls = false, visible?: (el: ElementLike) => boolean): { variant: Variant; els: ElementLike[] } | null {
  for (const v of stop.targets) {
    const els = findTargets(root, v, vw, vh, scrolls, visible);
    if (els.length >= (v.min ?? 1)) return { variant: v, els };
  }
  return null;
}

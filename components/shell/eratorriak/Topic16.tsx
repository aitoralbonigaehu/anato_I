'use client';

import { MAP16_LINKS, MAP16_NODES, MAP16_TRAILS } from '@/content/eratorriak/map16';
import { MAP16_MOMENTS, mapModel16, poseAt16 } from '@/components/scenes/week16/map-model';
import { MapRoom, type MapRoomSpec } from './kit/MapRoom';
import styles from './eratorriak.module.css';

/**
 * Topic 16's study room: the whole topic as ONE model ("Mapa osoa", kit/MapRoom.tsx): the germ cells' road,
 * the gonads and both duct pairs on the posterior wall, the descent and the external genitalia, from the 3rd
 * week to birth, male and female through the same primordia (components/scenes/week16/map-model.ts), every
 * structure with its links (content/eratorriak/map16.ts).
 */

/** Names shown with nothing picked: the moment's landmarks, per sex once they differ. */
const LANDMARKS: { m: string[]; f: string[] }[] = [
  {
    m: ['bitelo-zaku-sekundarioa', 'hasierako-hozi-zelulak', 'alantoidea', 'gonadak', 'mesonefrosa', 'kloaka-mintza'],
    f: ['bitelo-zaku-sekundarioa', 'hasierako-hozi-zelulak', 'alantoidea', 'gonadak', 'mesonefrosa', 'kloaka-mintza'],
  },
  {
    m: ['gonadak', 'hodi-mesonefrikoa', 'hodi-paramesonefrikoa', 'sinu-urogenitala', 'tuberkulu-genitala', 'mintz-urogenitala'],
    f: ['gonadak', 'hodi-mesonefrikoa', 'hodi-paramesonefrikoa', 'sinu-urogenitala', 'tuberkulu-genitala', 'mintz-urogenitala'],
  },
  {
    m: ['barrabila', 'hodi-mesonefrikoa', 'hodi-paramesonefrikoa', 'gernu-maskuria', 'tuberkulu-genitala', 'ildo-urogenitala'],
    f: ['obarioa', 'falopioren-tronpak', 'utero-hodia', 'hodi-mesonefrikoa', 'tuberkulu-genitala', 'ildo-urogenitala'],
  },
  {
    m: ['barrabila', 'gubernakulua', 'luzapen-baginala', 'hodi-deferentea', 'prostata', 'faloa', 'eskrotoa'],
    f: ['obarioa', 'uteroa', 'plaka-baginala', 'gubernakulua', 'klitoria', 'ezpain-nagusiak'],
  },
  {
    m: ['barrabila', 'epididimoa', 'hodi-deferentea', 'semen-xixkua', 'prostata', 'iztai-hodia', 'faloa', 'eskrotoa'],
    f: ['obarioa', 'falopioren-tronpak', 'uteroa', 'bagina', 'lotailu-zabala', 'uteroaren-lotailu-biribila', 'ezpain-nagusiak'],
  },
];

/** The external genitalia lie in the perineal plane (facing down): seen from below and a little in front. */
const EXT = { dist: 6.5, elev: -52, yaw: 8 };
/** The phallus stands out of that plane: a lower, side-on look shows its length. */
const PHALLUS = { dist: 6.5, elev: -18, yaw: 26 };
const SCROTUM = ['eskrotoa', 'geruza-baginala'];

const SPEC: MapRoomSpec = {
  anchor: 'a16-mapa',
  week: 16,
  label: '16. gaiaren mapa osoa (3D)',
  nodes: MAP16_NODES,
  links: MAP16_LINKS,
  trails: MAP16_TRAILS,
  moments: MAP16_MOMENTS,
  model: (u, sex) => mapModel16(poseAt16(u, sex)),
  landmarks: (m, sex) => (sex ? LANDMARKS[m]?.f : LANDMARKS[m]?.m) ?? [],
  close: {
    'kloaka-mintza': EXT,
    'tuberkulu-genitala': EXT,
    'kloaka-tolespenak': EXT,
    'goragune-genitalak': EXT,
    'mintz-urogenitala': EXT,
    'uzki-mintza': EXT,
    perineoa: EXT,
    'tolespen-urogenitalak': EXT,
    'tolespen-ezpaineskrotalak': EXT,
    'ildo-urogenitala': EXT,
    klitoria: EXT,
    'ezpain-txikiak': EXT,
    'ezpain-nagusiak': EXT,
    'baginaren-bestibulua': EXT,
    'kanpoko-uretra-zuloa': EXT,
    'baginaren-zuloa': EXT,
    himena: EXT,
    faloa: PHALLUS,
    glandea: PHALLUS,
    'kordoi-ektodermikoa': PHALLUS,
    'zakil-uretra': PHALLUS,
    eskrotoa: EXT,
    'eskroto-errafea': EXT,
    'barrabil-apendizea': 5,
    paradidimoa: 5,
    'hodixka-eferenteak': 5,
    epididimoa: 6,
    'prostataren-utrikulua': 6,
    'uretra-prostatikoa': 6,
    'hodi-isurlea': 6,
    'semen-xixkua': 7,
    prostata: 7,
    'tuberkulu-paramesonefrikoa': 7,
    'bulbo-sinubaginalak': 7,
    'plaka-baginala': 7,
    epooforoa: 6,
    paraooforoa: 6,
    'hasierako-hozi-zelulak': 12,
  },
  xray: {
    barrabila: SCROTUM,
    epididimoa: SCROTUM,
    'barrabil-apendizea': SCROTUM,
    paradidimoa: SCROTUM,
    'hodixka-eferenteak': SCROTUM,
    'hodi-isurlea': ['prostata'],
    'uretra-prostatikoa': ['prostata'],
    'prostataren-utrikulua': ['prostata'],
    epooforoa: ['lotailu-zabala'],
    paraooforoa: ['lotailu-zabala'],
    obarioa: ['lotailu-zabala'],
    himena: ['ezpain-txikiak', 'ezpain-nagusiak'],
  },
  overview: { target: [0, -1.0, 0.2], dist: 17, yaw: 30, elev: 8 },
  secName: {
    '1': 'Sarrera',
    '2': 'Gonaden garapena',
    '2.1': 'Hozi zelulak',
    '3': 'Desberdintzapen aroa',
    '3.1': 'Arren desberdintzapena',
    '3.2': 'Gonadak arretan',
    '3.2.1': 'Semen bidea',
    '3.3': 'Gonadak emeetan',
    '3.4': 'Hodiak emeetan',
    '3.4.1': 'Bagina',
    '4': 'Gonaden jaisketa',
    '4.1': 'Jaisketa arretan',
    '4.2': 'Jaisketa emeetan',
    '5': 'Kanpo genitalak, desberdindu gabe',
    '6.1': 'Kanpo genitalak emeetan',
    '6.2': 'Kanpo genitalak arretan',
  },
  sexLabel: 'Sexua',
  sexFrom: 2,
  idle: {
    title: 'Gai osoa, eredu bakarrean',
    text: 'Goian unea aukeratu (hozi zelulen bidaiatik jaiotzera) eta ♂/♀ aldatu: hasikin berak, bi emaitza. Sakatu edozein egitura: nondik datorren, zer ematen duen, zer duen ondoan eta beste sexuan zer den (homologoa).',
  },
};

/** Topic 16 study room. */
export function Topic16Study() {
  return (
    <section className={styles.room} id="a16-ikasgela" aria-labelledby="a16-title">
      <header className={styles.roomHead}>
        <p className={styles.eyebrow}>16. gaia · gonadak eta genitalak</p>
        <h2 id="a16-title">Mapa osoa: gai guztia eredu bakar batean</h2>
        <p className={styles.lead}>
          Simulagailuak gaia zatika erakusten du; hemen <b>dena batera</b>: hozi zelulen bidaia, gonada eta bi hodi pareak, jaisketa eta kanpo
          genitalak. Aldatu <b>♂/♀</b> une berean: zer <b>gordetzen</b> den, zer <b>endekatzen</b> den eta beste sexuan zer den{' '}
          <b>homologoa</b>.
        </p>
      </header>
      <section className={styles.block} id="a16-mapa">
        <MapRoom spec={SPEC} />
      </section>
    </section>
  );
}

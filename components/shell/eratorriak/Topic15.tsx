'use client';

import { MAP15_LINKS, MAP15_NODES, MAP15_TRAILS } from '@/content/eratorriak/map15';
import { MAP_MOMENTS, mapModel, poseAt } from '@/components/scenes/week15/map-model';
import { MapRoom, type MapRoomSpec } from './kit/MapRoom';
import styles from './eratorriak.module.css';

/**
 * Topic 15's study room: the whole topic as ONE model ("Mapa osoa", kit/MapRoom.tsx): the posterior wall and the
 * pelvis as one body, from the 4th week to birth (components/scenes/week15/map-model.ts), every structure with
 * its links (content/eratorriak/map15.ts).
 */

/** Names shown with nothing picked: the moment's landmarks. */
const LANDMARKS: string[][] = [
  ['bitarteko-mesodermoa', 'pronefrosa', 'aorta-dortsalak', 'kloaka', 'alantoidea'],
  ['mesonefrosa', 'hodi-mesonefrikoa', 'gonada-gandorra', 'kloaka', 'trenkada-uroerrektala', 'alantoidea'],
  ['mesonefrosa', 'hodi-mesonefrikoa', 'ureter-kimua', 'blastema-metanefrikoa', 'kloaka', 'trenkada-uroerrektala'],
  ['giltzurruna', 'giltzurrun-gaineko-guruinak', 'ureterra', 'hodi-mesonefrikoa', 'gernu-maskuria', 'uzki-hodia', 'alantoidea', 'perineoa'],
  ['giltzurruna', 'giltzurrun-gaineko-guruinak', 'ureterra', 'gonadak', 'gernu-maskuria', 'urakoa', 'uretra', 'zakila'],
  ['giltzurruna', 'giltzurrun-gaineko-guruinak', 'ureterra', 'gonadak', 'gernu-maskuria', 'erdiko-zilbor-lotailua', 'uretra', 'glandea'],
];

const SPEC: MapRoomSpec = {
  anchor: 'a15-mapa',
  week: 15,
  label: '15. gaiaren mapa osoa (3D)',
  nodes: MAP15_NODES,
  links: MAP15_LINKS,
  trails: MAP15_TRAILS,
  moments: MAP_MOMENTS,
  model: (u, sex) => mapModel(poseAt(u, sex)),
  landmarks: (m) => LANDMARKS[m] ?? [],
  close: {
    'hobi-nabikularra': 4.6,
    'kordoi-ektodermikoa': 4.6,
    'kanpoko-uretra-zuloa': 4.6,
    prepuzioa: 5,
    'ildo-koronarioa': 5,
    glandea: 5.5,
    'azaleko-ektodermoa': 5.5,
    trigonoa: 6,
    prostata: 7,
    'uretra-prostatikoa': 7,
    'mintzezko-uretra': 7,
    'zakil-uretra': 8,
    'uretra-guruinak': 7,
    'baginaren-bestibulua': 7,
    'mintz-urogenitala': 7,
    'uzki-mintza': 7,
    'kloaka-mintza': 7,
    perineoa: 7,
    'atal-pelbianoa': 7,
    'behin-betiko-sinu-urogenitala': 7,
  },
  xray: {
    trigonoa: ['gernu-maskuria'],
    'hobi-nabikularra': ['glandea', 'prepuzioa'],
    'kordoi-ektodermikoa': ['glandea'],
    'kanpoko-uretra-zuloa': ['glandea', 'prepuzioa'],
    'uretra-prostatikoa': ['prostata'],
    'ildo-koronarioa': ['prepuzioa'],
  },
  overview: { target: [0, -1.5, 0.4], dist: 23, yaw: 36, elev: 6 },
  secName: {
    '1': 'Gernu sistema',
    '1.1': 'Pronefrosa',
    '1.2': 'Mesonefrosa',
    '1.3': 'Metanefrosa',
    '2': 'Giltzurrunak',
    '2.1': 'Giltzurrun gaineko guruinak',
    '2.2': 'Sinu urogenitala',
    '2.3': 'Gernu maskuria',
    '2.4': 'Uretra',
  },
  sexLabel: 'Uretra',
  sexFrom: 4,
  idle: {
    title: 'Gai osoa, eredu bakarrean',
    text: 'Goian unea aukeratu (4. astetik jaiotzera). Sakatu edozein egitura: nondik datorren, zer ematen duen, nondik ateratzen den, nora isurtzen duen eta zer duen ondoan ikusiko duzu, eta lotura bakoitza sakatuz hurrengora jauzi.',
  },
};

/** Topic 15 study room. */
export function Topic15Study() {
  return (
    <section className={styles.room} id="a15-ikasgela" aria-labelledby="a15-title">
      <header className={styles.roomHead}>
        <p className={styles.eyebrow}>15. gaia · sistema urogenitala</p>
        <h2 id="a15-title">Mapa osoa: gai guztia eredu bakar batean</h2>
        <p className={styles.lead}>
          Simulagailuak gaia zatika erakusten du; hemen <b>dena batera</b>: hiru giltzurrunak atzeko paretan, Wolff hodia kloakaraino, kloaka
          banatuta, maskuria, urakoa eta uretra glandearaino. Zer dagoen <b>goian eta behean</b>, zer <b>ondoan</b> eta zer <b>nondik</b>{' '}
          ateratzen den, irudi bakarrean.
        </p>
      </header>
      <section className={styles.block} id="a15-mapa">
        <MapRoom spec={SPEC} />
      </section>
    </section>
  );
}

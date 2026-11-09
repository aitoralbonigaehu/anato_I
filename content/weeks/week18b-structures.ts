import type { StructureDef } from '@/lib/sim/types';

/** Structures of the thyroid stages (topic 18, notes 3). Week 18 de-duplicates them against its other parts by id. */
const ENDO = '#f6d365';

export const structures18b: StructureDef[] = [
  {
    id: 'tiroide-guruina',
    name: 'Tiroide guruina',
    es: 'Glándula tiroides',
    aka: ['Tiroidea', 'Tiroide guruinaren hasikina'],
    category: 'endodermoa',
    color: '#f7b52d',
    definition: 'Faringe hestearen zorutik, zulo itsuaren mailan, sortzen den guruina; hodi tiroglosoa gida bezala erabiliz lepora jaisten da.',
    location: 'Krikoide kartilagoaren mailan, aurrekaldean.',
    origin: 'Faringe hestearen zoruko endodermoa.',
    related: ['hodi-tiroglosoa', 'zulo-itsua'],
  },
  {
    id: 'hodi-tiroglosoa',
    name: 'Hodi tiroglosoa',
    es: 'Conducto tirogloso',
    category: 'endodermoa',
    color: ENDO,
    definition: 'Faringearen zorutik mesenkimarantz sartzen den luzapenaren erdiko hodia; guruinaren gida eta faringearen zoruarekiko lotura.',
    fate: 'Itxi eta endekatzen da; zulo itsua geratzen da.',
    related: ['tiroide-guruina', 'zulo-itsua'],
  },
  {
    id: 'zulo-itsua',
    name: 'Zulo itsua',
    es: 'Foramen ciego',
    aka: ['Mihiaren zulo itsua'],
    category: 'endodermoa',
    color: '#c79a2d',
    definition: 'Hodi tiroglosoaren aztarna: ildo terminalaren erpinean geratzen den zakuondo txikia, tiroidearen bidearen marka-zuloa.',
    location: 'Tuberkulu bakoitiaren eta kupularen arteko mugan; gero ildo terminalaren erpinean.',
    related: ['hodi-tiroglosoa', 'tiroide-guruina'],
  },
  {
    id: 'tuberkulu-bakoitia',
    name: 'Tuberkulu bakoitia',
    es: 'Tubérculo impar',
    category: 'mesodermoa',
    color: '#f0883e',
    definition: 'Lehen arkutik, bi alboko goraguneen artean ateratzen den goragunea; haiekin fusionatuta mihiaren gorputza osatzen du.',
    related: ['kopula', 'zulo-itsua'],
  },
  {
    id: 'kopula',
    name: 'Kupula',
    es: 'Cópula',
    aka: ['Kopula', 'Goragune hipobrakiala'],
    category: 'mesodermoa',
    color: '#f2cd3f',
    definition: 'Bigarren, hirugarren eta laugarren arkuen erdian ateratzen den goragunea; hortik mihiaren sustraia sortzen da.',
    caution: 'Apunteek testuan «kupula» eta irudian «Kopula» diote: gauza bera da.',
    related: ['tuberkulu-bakoitia', 'zulo-itsua'],
  },
];

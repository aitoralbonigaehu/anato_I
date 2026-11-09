import type { StructureDef } from '@/lib/sim/types';

/** The neck glands of topic 18 (components/scenes/week18/neck-model.ts). Colours as the scene draws them. */
export const structures18i: StructureDef[] = [
  { id: 'timoa', name: 'Timoa', es: 'Timo', category: 'endodermoa', color: '#f5d86a', definition: 'Guruin bakarra, bi aldeetan eratzen dena (3. poltsak) eta alde medialera jaisten dena.', location: 'Tiroide guruinaren behekaldean', origin: '3. faringe poltsa', fate: 'Handia enbrioi aroan; pubertarotik aurrera endekatuz doa' },
  { id: 'beheko-paratiroidea', name: 'Beheko paratiroide guruina', es: 'Paratiroides inferior', aka: ['Beheko paratiroidea'], category: 'endodermoa', color: '#f2cd3f', definition: 'Timoak arrastatuta jaisten den paratiroide guruina.', location: 'Tiroidearen atzekaldean, behean', origin: '3. faringe poltsa', caution: '3. poltsatik dator: 4. poltsakoa baino gorago hasi arren, behean amaitzen du.' },
  { id: 'goiko-paratiroidea', name: 'Goiko paratiroide guruina', es: 'Paratiroides superior', aka: ['Goiko paratiroidea'], category: 'endodermoa', color: '#e4505a', definition: 'Gutxi jaisten den paratiroide guruina; timoaren gorago gelditzen da.', location: 'Tiroidearen atzekaldean, goian', origin: '4. faringe poltsa', caution: 'Izena behin betiko kokapenetik dator, ez jatorritik.' },
  { id: 'hirugarren-poltsa', name: '3. faringe poltsa', es: 'Tercera bolsa faríngea', category: 'endodermoa', color: '#f6d365', definition: 'Timoa eta beheko paratiroidea ematen dituen faringe poltsa.' },
  { id: 'laugarren-poltsa', name: '4. faringe poltsa', es: 'Cuarta bolsa faríngea', category: 'endodermoa', color: '#f6d365', definition: 'Goiko paratiroidea ematen duen faringe poltsa.' },
  { id: 'faringea', name: 'Faringea', es: 'Faringe', category: 'endodermoa', color: '#f6d365', definition: 'Aurrehestearen goiko zatia; poltsak bere horman sortzen dira.' },
  { id: 'trakea', name: 'Trakea', es: 'Tráquea', category: 'anatomia', color: '#a7dbd2', definition: 'Laringearen azpiko aire bidea; tiroidearen istmoa aurrean du.' },
  { id: 'tiroide-lobuluak', name: 'Tiroidearen lobuluak', es: 'Lóbulos tiroideos', aka: ['Lobuluak'], category: 'anatomia', color: '#b23c56', definition: 'Tiroide guruinaren bi lobulu luzangak, eskuinekoa eta ezkerrekoa, laringeko kartilagoak besarkatzen dituztenak.', location: 'Laringearen alboetan; atzetik lotu gabe' },
  { id: 'tiroide-istmoa', name: 'Istmoa', es: 'Istmo tiroideo', category: 'anatomia', color: '#b23c56', definition: 'Bi lobuluak aurrekaldetik lotzen dituen eremu estua.' },
  { id: 'piramide-lobulua', name: 'Piramide itxurako lobulua', es: 'Lóbulo piramidal', category: 'anatomia', color: '#b23c56', definition: 'Anomalia arrunta (%50 edo gehiago), ezkerreko lobuluarekin edo istmoarekin erlazionatua.', origin: 'Ondo endekatu ez den hodi tiroglosoaren azken atala', fate: 'Ez du arazorik ematen' },
  { id: 'laringeko-kartilagoak', name: 'Laringeko kartilagoak', es: 'Cartílagos laríngeos', category: 'anatomia', color: '#a7dbd2', definition: 'Tiroide guruinak aurrekaldetik inguratzen dituen kartilagoak.' },
];

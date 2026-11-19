import type { MigrationTopic, MNode } from '../migrations';

const n = (id: string, via?: string, kids?: MNode[], move?: boolean): MNode => ({ id, via, kids, move });
const l = (label: string, via: string, kids?: MNode[]): MNode => ({ label, via, kids });

export const SCHEMES_19: MigrationTopic = {
  week: 19,
  short: 'Nerbio sistema',
  flows: [
    {
      id: 'gandor-neuraleko-eratorriak-19',
      title: 'Gandor neuralaren migrazioa eta eratorriak',
      stage: 'gandor-eratorriak',
      roots: [n('gandor-neurala', undefined, [
        n('gongoil-errakideoak', 'atzeko sustraietara migratu', undefined, true),
        n('gongoil-sinpatikoak', 'aortarantz migratu', [
          n('aorta-aurreko-gongoilak', 'erraien aurrean kokatu'),
        ], true),
        l('Gongoil parasinpatikoak', 'organoen ondoan bereizi'),
        l('Gongoil sentsitibo kranealak', 'neurona batzuen jatorria', [
          l('Plakoda ektodermikoen ekarpena', 'beste neurona batzuk'),
        ]),
        n('schwann-zelulak', 'glia periferikoa bereizi'),
        n('zelula-kromafinak', 'guruin gaineko muinera migratu', undefined, true),
        n('melanozitoak', 'larruazalera migratu', undefined, true),
        l('Arkuetako hezurrak eta kartilagoak', 'I.–III. arkuetan mesenkima eratu'),
        l('Araknoidesa eta pia materra', 'aurreko garezurrean ekarpena'),
      ])],
    },
    {
      id: 'ornomuinaren-geruzak-19',
      title: 'Neuroepiteliotik ornomuinaren geruzetara',
      stage: 'ornomuin-geruzak',
      roots: [n('neuroepitelioa', undefined, [
        n('neuroblastoak', 'neuronak bereizi', [
          n('manto-geruza', 'somak metatu', [n('gai-grisa', 'somak bertan geratu')]),
          n('geruza-marginala', 'axoiak kanporantz luzatu', [n('gai-zuria', 'axoiak mielinizatu')]),
        ]),
        n('ependimo-geruza', 'barrunbea estali'),
      ])],
    },
    {
      id: 'ornomuinaren-plakak-19',
      title: 'Ornomuina: plaka sentsitiboak eta motorrak',
      stage: 'ornomuin-plakak',
      roots: [n('hodi-neurala', undefined, [
        n('hegal-plaka', 'manto dortsala loditu', [n('eremu-sentsitiboa', 'atzeko adarrak eratu')]),
        n('oinalde-plaka', 'manto bentrala loditu', [n('eremu-motorra', 'aurreko adarrak eratu')]),
        n('sabai-plaka', 'erdiko lerro dortsala'),
        n('zoru-plaka', 'erdiko lerro bentrala'),
      ])],
    },
    {
      id: 'garun-xixkuen-eratorriak-19',
      title: 'Hiru lehen xixkuetatik garunaren bost ataletara',
      stage: 'bost-xixkuak',
      roots: [n('hodi-neurala', undefined, [
        n('prosentzefaloa', 'aurreko xixkua', [
          n('telentzefaloa', 'alboetara zabaldu', [n('garun-hemisferioak', 'bi aldeak hazi')]),
          n('dientzefaloa', 'erdian bereizi', [
            n('talamoa', 'alboko pareta bereizi'),
            l('Epitalamoa, hipotalamoa eta azpitalamoa', 'beste eskualdeak bereizi'),
          ]),
        ]),
        n('mesentzefaloa', 'erdiko xixkua; bere horretan'),
        n('erronbentzefaloa', 'atzeko xixkua', [
          n('metentzefaloa', 'aurreko atala bereizi', [n('zubia', 'alde bentralean'), n('garuntxoa', 'alde dortsalean')]),
          n('mielentzefaloa', 'atzeko atala bereizi', [n('erraboila', 'ornomuinaren gainean garatu')]),
        ]),
      ])],
    },
    {
      id: 'garun-xixkuen-barrunbeak-19',
      title: 'Xixkuen barrunbeak eta bentrikulu sistema',
      stage: 'bentrikuluak',
      roots: [
        n('telentzefaloa', undefined, [n('alboko-bentrikuluak', 'barrunbe bana hemisferioko')]),
        n('dientzefaloa', undefined, [n('hirugarren-bentrikulua', 'erdiko barrunbea')]),
        n('mesentzefaloa', undefined, [n('garun-akueduktoa', 'barrunbea estutu')]),
        n('erronbentzefaloa', undefined, [n('laugarren-bentrikulua', 'meten- eta mielentzefaloan zabaldu')]),
        n('ornomuina', undefined, [n('hodi-ependimarioa', 'erdiko kanala mantendu')]),
      ],
    },
    {
      id: 'likido-zefalorrakideoaren-bidea-19',
      title: 'Likido zefalorrakideoaren ibilbidea',
      stage: 'likido-zefalorrakideoa',
      roots: [n('alboko-bentrikuluak', undefined, [
        n('hirugarren-bentrikulua', 'Monroren zuloetatik', [
          n('laugarren-bentrikulua', 'garun-akueduktutik', [
            n('eremu-azpiaraknoideoa', 'Magendie eta Luschkatik', [
              l('Dura materraren zain-sinuak', 'araknoide-bikorretan xurgatu'),
            ]),
            n('hodi-ependimarioa', 'ornomuinaren kanalean jarraitu'),
          ]),
        ]),
      ])],
      lead: 'Sare koroideek likidoa sortzen dute alboko, III. eta IV. bentrikuluetan.',
    },
  ],
};

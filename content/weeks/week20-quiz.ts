import type { QuizQuestion } from '@/lib/sim/types';

/** Topic 20 (class 32): the questions on the brain's parts, from their former topic 19 (sections 10–11). */
export const quiz20: QuizQuestion[] = [
  {
    id: 'w20-q-piramideak',
    question: 'Erraboilan, zer daude piramideetan?',
    options: ['Beherantz doazen axoi motorrak', 'Goranzko bide sentsitiboak', 'Neuronen somak', 'Hodi ependimarioa'],
    answer: 0,
    explanation: 'Piramideak alde bentralean daude, axoi motorrekin; goranzko bideak (sentsitiboak) dortsalean.',
    stageId: 'erraboila',
  },
  {
    id: 'w20-q-iv-irekiera',
    question: 'Metentzefaloan hodia irekitzean, nola geratzen dira eremuak?',
    options: ['Motorra bentralean eta erdian; sentikorrak dortsalean eta alboetan', 'Sentikorrak erdian; motorra alboetan', 'Motorra dortsalean; sentikorrak bentralean', 'Ez dira aldatzen'],
    answer: 0,
    explanation: 'Sabai plaka zabaldu eta hodia goitik irekitzen da (IV. bentrikulua): hegal plakak alboratu egiten dira.',
    stageId: 'zubia-garuntxoa',
  },
  {
    id: 'w20-q-zerebeloa-jatorria',
    question: 'Nondik sortzen da garuntxoa (zerebeloa)?',
    options: ['Ezpain erronboideetatik, erdian fusionatuta', 'Oinalde plaketatik', 'Zoru plakatik', 'Mesentzefalotik'],
    answer: 0,
    explanation: 'Hegal plaken eremu dortsala lodituz ezpain erronboideak sortzen dira; erdian fusionatu eta zerebeloak IV. bentrikulua estaltzen du.',
    stageId: 'zubia-garuntxoa',
  },
  {
    id: 'w20-q-parkinson',
    question: 'Parkinsonean, zer gertatzen da?',
    options: ['Gai beltzeko neurona dopaminergikoak hiltzen dira', 'Zerebeloa ez da fusionatzen', 'Akueduktoa ixten da', 'Talamoak usaimena jasotzen du'],
    answer: 0,
    explanation: 'Gai beltzak dopamina bidaltzen die oinaldeko nukleoei. Neuronak hiltzean, mugimendu automatikoak agertzen dira geldirik daudenean.',
    stageId: 'mesentzefaloa',
  },
  {
    id: 'w20-q-talamoa',
    question: 'Zein informazio EZ da talamotik pasatzen?',
    options: ['Usaimena', 'Ikusmena', 'Ukimena', 'Mina'],
    answer: 0,
    explanation: 'Talamoa errelebo-zentroa da: dena talamotik pasatzen da, usaimena izan ezik.',
    stageId: 'dientzefaloa',
  },
  {
    id: 'w20-q-neurohipofisia',
    question: 'Nondik sortzen da neurohipofisia?',
    options: ['Hipotalamotik, infundibuluaren bidez', 'Estomodeotik, Rathkeren poltsaren bidez', 'Gandor neuraletik', 'Epitalamotik'],
    answer: 0,
    explanation: 'Hipofisiak bi jatorri ditu: adenohipofisia estomodeotik (hipofisi poltsa) eta neurohipofisia hipotalamotik (infundibulua).',
    stageId: 'hipofisia',
  },
  {
    id: 'w20-q-troklearra',
    question: 'Zein bikote kraneal ateratzen da alde dortsaletik?',
    options: ['IV. troklearra', 'III. begi-eragilea', 'VI. aldentzailea', 'XII. hipoglosoa'],
    answer: 0,
    explanation: 'IV.a da alde dortsaletik ateratzen den bakarra. III., IV. eta VI. bikoteek begiaren mugimenduak eragiten dituzte.',
    stageId: 'bikote-kranealak',
  },
  {
    id: 'w20-q-bagoa',
    question: 'Zein da gorputz osoko nerbio parasinpatikorik handiena?',
    options: ['X. bagoa', 'VII. aurpegi-nerbioa', 'IX. glosofaringeoa', 'XI. osagarria'],
    answer: 0,
    explanation: 'Bagoa (X) da nerbio parasinpatikorik handiena.',
    stageId: 'bikote-kranealak',
  },
];

import type { QuizQuestion } from '@/lib/sim/types';

/** Topic 19, sections 7–9 (ventricles, CSF, meninges), worded from the notes of 2026-11-23. */
export const quiz19c: QuizQuestion[] = [
  {
    id: 'w19-q-mesentzefalo-barrunbea',
    question: 'Zer barrunbe du mesentzefaloak?',
    options: ['Garun akueduktoa (Silvio), bentrikulurik ez', 'Hirugarren bentrikulua', 'Laugarren bentrikulua', 'Alboko bentrikuluak'],
    answer: 0,
    explanation: 'Mesentzefaloaren pareta lodia da eta hodia estu geratzen da: akueduktoak III. eta IV. bentrikuluak lotzen ditu.',
    stageId: 'bentrikuluak',
  },
  {
    id: 'w19-q-likidoa-ekoizpena',
    question: 'Zerk ekoizten du likido zefalorrakideoa?',
    options: ['Sare koroideek, bentrikuluen sabaian', 'Araknoideak', 'Pia materrak', 'Dura materrak'],
    answer: 0,
    explanation: 'Sare koroideek (arteriolak) ekoizten dute, 5. astetik aurrera eta etengabe. Hezurrak eremua mugatzen duenez, xurgatu egin behar da.',
    stageId: 'likido-zefalorrakideoa',
  },
  {
    id: 'w19-q-luschka-magendie',
    question: 'IV. bentrikulutik eremu azpiaraknoideora, zein zulotatik ateratzen da likidoa?',
    options: ['Bi Luschka zuloetatik (albokoak) eta Magendie zulotik (erdikoa)', 'Monro zuloetatik', 'Garun akueduktotik', 'Hodi ependimariotik bakarrik'],
    answer: 0,
    explanation: 'Parte batek ependimotik jarraitzen du; bestea hiru zulotatik ateratzen da: bi Luschka albokoak eta Magendie erdikoa.',
    stageId: 'likido-zefalorrakideoa',
  },
  {
    id: 'w19-q-epidurala-garunean',
    question: 'Zergatik ez dago eremu epiduralik garunean?',
    options: ['Dura materra hezurrari itsatsita dagoelako', 'Araknoidea hezurrari lotuta dagoelako', 'Pia materrik ez dagoelako', 'Likido zefalorrakideorik ez dagoelako'],
    answer: 0,
    explanation: 'Garunean dura hezurrari itsatsita dago. Ornomuinean, berriz, dura ez dago hezurrari lotuta, eta tartean eremu epidurala dago.',
    stageId: 'garuneko-meningeak',
  },
];

/// <reference lib="webworker" />
// Builds the question bank off the main thread (about a second of work). Asked for 'slim', it answers with
// the few fields the counting pages need (Home's reviews, the study route, Progress, the structure atlas);
// asked for 'full', with every question whole (the class's pool checks).
import { KEY_IDS, POOL } from './pool';

self.onmessage = (e: MessageEvent<'slim' | 'full'>) => {
  const pool = e.data === 'full' ? POOL : POOL.map(({ id, week, comp, concept, options, answer }) => ({ id, week, comp, concept, options, answer }));
  self.postMessage({ pool, keyIds: KEY_IDS });
};

/// <reference lib="webworker" />
// Builds the question bank off the main thread (about a second of work) and answers with the few
// fields the counting pages need: Home's reviews, the study route, Progress and the structure atlas.
import { KEY_IDS, POOL } from './pool';

const pool = POOL.map(({ id, week, comp, concept, options, answer }) => ({ id, week, comp, concept, options, answer }));
self.postMessage({ pool, keyIds: KEY_IDS });

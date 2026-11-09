import type { StructureDef } from '@/lib/sim/types';

/** Topic 17 §1. Vault, suture and fontanelle ids are owned by topic 8 and reused as they are. */
export const structures17a: StructureDef[] = [
  { id: 'entzefaloa', name: 'Entzefaloa', es: 'Encéfalo', category: 'ektodermoa', color: '#eab7b0', definition: 'Kraneoaren barnean dagoen nerbio-sistema zentralaren atala; neurokraneoak inguratu eta babesten du.', related: ['neurokraneoa'] },
  { id: 'mintza', name: 'Mintza', es: 'Membrana', category: 'mesodermoa', color: '#8fc7ea', definition: 'Entzefaloaren inguruko mesenkimazko mintza: hemen sortzen dira buru gangako hezur lauak, zuzenean.', related: ['buru-ganga', 'mintzezko-hezurtzapena'] },
  { id: 'hezur-nasala', name: 'Sudur-hezurra', es: 'Hueso nasal', category: 'mesodermoa', color: '#efe5cf', definition: 'Sudurraren sustraiko hezur txikia, errai kraneokoa.', related: ['errai-kraneoa'] },
  { id: 'hezur-maxilarra', name: 'Hezur maxilarra', es: 'Maxilar', category: 'mesodermoa', color: '#f0883e', definition: 'Goiko masailezurra; errai kraneoko hezurra, I. arkuaren prozesu maxilarretik.', origin: 'Gandor neurala; mintzezko hezurtzea.', related: ['errai-kraneoa', 'zigomatikoa'] },
  { id: 'zigomatikoa', name: 'Zigomatikoa', es: 'Hueso cigomático', category: 'mesodermoa', color: '#f0883e', definition: 'Masailaren hezurra; errai kraneokoa, I. arkuaren prozesu maxilarretik.', origin: 'Gandor neurala; mintzezko hezurtzea.', related: ['errai-kraneoa', 'hezur-maxilarra'] },
  { id: 'baraila', name: 'Baraila', es: 'Mandíbula', category: 'mesodermoa', color: '#f0883e', definition: 'Beheko masailezurra; I. arkuaren eratorria, errai kraneokoa.', origin: 'Gandor neurala; mintzezko hezurtzea.', related: ['errai-kraneoa'] },
  { id: 'estiloide-apofisia', name: 'Estiloide apofisia', es: 'Apófisis estiloides', category: 'mesodermoa', color: '#4f9be8', definition: 'Hezur tenporalaren beheko luzapen fina; II. arkuaren eratorria.', related: ['errai-kraneoa', 'hioide-hezurra'] },
  { id: 'hioide-hezurra', name: 'Hioide hezurra', es: 'Hueso hioides', category: 'mesodermoa', color: '#f2cd3f', parts: ['hioide-gorputza', 'hioide-adar-txikia', 'hioide-adar-nagusia'], definition: 'Lepoko hezur askea; II. eta III. arkuen eratorria.', related: ['estiloide-apofisia'] },
  { id: 'hioide-gorputza', name: 'Hioidearen gorputza', es: 'Cuerpo del hioides', category: 'mesodermoa', color: '#f2cd3f', definition: 'Hioidearen erdiko zatia: goiko erdia II. arkutik, behekoa III. arkutik.', related: ['hioide-hezurra'] },
  { id: 'hioide-adar-txikia', name: 'Hioidearen adar txikia', es: 'Asta menor del hioides', category: 'mesodermoa', color: '#4f9be8', definition: 'Hioidearen goiko adar txikia, II. arkutik.', related: ['hioide-hezurra'] },
  { id: 'hioide-adar-nagusia', name: 'Hioidearen adar nagusia', es: 'Asta mayor del hioides', category: 'mesodermoa', color: '#f2cd3f', definition: 'Hioidearen adar handia, III. arkutik.', related: ['hioide-hezurra'] },
];

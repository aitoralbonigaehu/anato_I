import { readFileSync } from 'fs';
import { structures } from '@/content/registry';
const files = ['midgut-model.ts', 'Midgut3D.tsx', 'cloaca-model.ts', 'Cloaca3D.tsx', 'lung-model.ts', 'Lung3D.tsx'];
const ids = new Set<string>();
for (const f of files) {
  const s = readFileSync('components/scenes/week14/' + f, 'utf8');
  for (const m of s.matchAll(/(?:id|p): '([a-z0-9-]+)'/g)) ids.add(m[1]);
  for (const m of s.matchAll(/pts\['([a-z0-9-]+)'\]/g)) ids.add(m[1]);
  for (const m of s.matchAll(/dim: \[([^\]]*)\]/g)) for (const x of m[1].matchAll(/'([a-z0-9-]+)'/g)) ids.add(x[1]);
}
const missing = [...ids].filter((i) => !structures.has(i)).sort();
console.log(missing.join('\n'));

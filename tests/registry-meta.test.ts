import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from 'vitest';
import { structures, weeks } from '@/content/registry';
import { toMeta } from '@/content/registry-meta';
import { LIFE } from '@/content/chronology';

/**
 * content/registry-meta.json is the registry's text without the scenes, for the homepage (content/registry-lite.ts).
 * This test regenerates it: when the topics changed, it writes the new file and fails once, so the change is seen
 * and committed. Run it again and it passes.
 */
test('registry-meta.json matches the registry', () => {
  const file = join(__dirname, '..', 'content', 'registry-meta.json');
  const fresh = JSON.stringify(toMeta(weeks, structures.values(), new Set(Object.keys(LIFE)))) + '\n';
  let old = '';
  try {
    old = readFileSync(file, 'utf8');
  } catch {}
  if (old !== fresh) writeFileSync(file, fresh);
  expect(old === fresh, 'content/registry-meta.json was stale and has been regenerated: re-run the test').toBe(true);
}, 120_000);

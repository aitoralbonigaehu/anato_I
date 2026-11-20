import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

/** Only for baking the opening show's clouds: npx vitest run --config scripts/intro-v3/vitest.bake.config.ts */
export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('../../', import.meta.url)) } },
  test: { root: fileURLToPath(new URL('../../', import.meta.url)), include: ['scripts/intro-v3/bake-clouds.test.ts'] },
});

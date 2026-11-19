// Export the atlas mesh for Blender with node scripts/intro-v2/render.mjs --model.
// Render studio.py in Blender, then compose.py landscape and compose.py portrait.
import { registerHooks } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const root = new URL('../../', import.meta.url);


const hooks = registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith('@/') || (specifier.startsWith('.') && context.parentURL?.endsWith('.ts'))) {
      const base = specifier.startsWith('@/') ? new URL(specifier.slice(2), root) : new URL(specifier, context.parentURL);
      if (existsSync(new URL(base.href + '.ts'))) return { url: base.href + '.ts', shortCircuit: true };
    }
    return next(specifier, context);
  },
});
const { embryo5 } = await import('../../lib/three-d/embryo5.ts');
const embryo = embryo5();
hooks.deregister();
const pack = (arr) => Buffer.from(arr.buffer, arr.byteOffset, arr.byteLength).toString('base64');
const packMesh = m => ({ p: pack(m.pos), n: pack(m.nrm), i: pack(m.idx) });
const specimen = JSON.stringify([embryo.body, ...embryo.eyes].map(packMesh));
const stageDir = process.env.ATLAS_FILM_STAGE || join(tmpdir(),'atlas-v2-film-stage');
await mkdir(stageDir,{recursive:true});
await writeFile(join(stageDir,'embryo.json'),specimen);

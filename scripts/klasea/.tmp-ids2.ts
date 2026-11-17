import { structures } from '@/content/registry';
for (const [id, s] of structures) if (/zilbor|zeloma|kanpoko|hemorroid|pudenda|kapilar|birika|bronk|albeol|uretra|perineo|sinu-uro|mesokolon|kolon|ileon|ondeste|uzki|alantoid|kloaka/.test(id)) console.log(id, '|', s.name);

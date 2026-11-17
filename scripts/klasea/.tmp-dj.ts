import { duodenumLine, FP_DONE } from '@/components/scenes/week14/foregut-model';
const d = duodenumLine({ ...FP_DONE, bowel: 0, omentum: 0, duodParts: 1, pancParts: 1 } as never);
console.log(JSON.stringify(d[d.length - 1]), JSON.stringify(d[Math.floor(d.length * 0.8)]));

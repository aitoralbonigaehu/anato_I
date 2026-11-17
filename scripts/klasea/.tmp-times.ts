import { lesson11 } from '@/content/klasea/w11';
import { speakSeconds } from '@/lib/klasea/voice';
const L: any = lesson11;
for (const c of L.chunks) {
  const lines = c.lines.map((l: any) => [0.8 + speakSeconds(l.say) + (l.writes ? 0.8 : 0) + (l.hold ?? 0), l.say] as const);
  const t = lines.reduce((a: number, b: any) => a + b[0], 0) + (c.checks ?? []).reduce((s: number, k: any) => s + (k.kind === 'fill' ? 60 : k.kind === 'order' ? 25 : 15), 0);
  console.log(c.id, t.toFixed(1));
  for (const [s, say] of [...lines].sort((a, b) => b[0] - a[0]).slice(0, 2)) console.log('   ', s.toFixed(1), say.slice(0, 140));
}

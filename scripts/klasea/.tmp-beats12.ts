import { week12 } from '@/content/weeks/week12';
const out: [string, string, number][] = [];
for (const st of week12.stages) {
  const beats = st.beats ?? [];
  beats.forEach((b, i) => {
    const next = beats[i + 1]?.at ?? 1;
    out.push([st.id, b.view ?? st.views[0].id, +Math.min(0.995, next - 0.03).toFixed(3)]);
  });
}
console.log(JSON.stringify(out));

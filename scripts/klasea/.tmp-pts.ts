import { weeks } from '@/content/registry';
for (const wk of weeks.filter((w) => w.week === 10 || w.week === 11)) {
  for (const st of wk.stages as any[]) for (const v of st.views ?? []) {
    const beats = st.beats.filter((b: any) => b.view === v.id).map((b: any) => b.at);
    if (/3d/i.test(v.id) || /3D/.test(v.label ?? '')) console.log(JSON.stringify([wk.week, st.id, v.id, beats.map((x: number) => +x.toFixed(3))]));
  }
}

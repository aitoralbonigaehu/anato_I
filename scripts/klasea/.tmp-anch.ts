import { weeks } from '@/content/registry';
import { sectionOf } from '@/content/notes';
import { NOTES_EXCEPTIONS, expandNotes, sentence } from '@/content/notes-text';
const w = weeks.find((x) => x.week === 14)!;
const sectionMatches = (s: string, c: { n: string }) => s === c.n;
for (const stage of w.stages) stage.beats.forEach((beat, i) => {
  const key = `14/${stage.id}/${i}`;
  const cfg = sectionOf(14, stage.id);
  if (!cfg) { console.log('NO SECTION', stage.id); return; }
  const exc = NOTES_EXCEPTIONS[key] ?? NOTES_EXCEPTIONS[`14/${stage.id}`];
  for (const id of expandNotes(beat.notes)) {
    const sec = id.split('/')[1];
    if (!sentence(id)) console.log('MISSING SENTENCE', key, id);
    if (!(sectionMatches(sec, cfg.section) || exc?.sections?.includes(sec))) console.log('SECTION', key, id, cfg.section.n);
  }
});

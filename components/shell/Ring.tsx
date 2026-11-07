import { IconCheck } from './icons';

/** How far through a topic: a small ring in the topic's colour; a check when every stage has been seen. */
export function Ring({ part }: { part: number }) {
  const C = 2 * Math.PI * 7;
  if (part >= 1)
    return (
      <span className="tsw-ring is-done" aria-hidden>
        <IconCheck size={11} />
      </span>
    );
  return (
    <svg className="tsw-ring" width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <circle cx="9" cy="9" r="7" className="tsw-ring-track" />
      {part > 0 && <circle cx="9" cy="9" r="7" className="tsw-ring-fill" strokeDasharray={`${Math.max(1.5, part * C)} ${C}`} transform="rotate(-90 9 9)" />}
    </svg>
  );
}

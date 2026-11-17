/** Medal glyphs for the progress page's badges and tiles (24-unit stroke icons, like icons.tsx). */

const PATHS: Record<string, React.ReactNode> = {
  seed: (
    <>
      <path d="M12 20v-7" />
      <path d="M12 13c0-4 3-6.5 7-6.5 0 4-3 6.5-7 6.5Z" />
      <path d="M12 15c0-3-2.3-5-5.5-5 0 3 2.3 5 5.5 5Z" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m15.5 8.5-2 5-5 2 2-5z" />
    </>
  ),
  flag: (
    <>
      <path d="M6 21V4" />
      <path d="M6 4h11l-2 4 2 4H6" />
    </>
  ),
  map: (
    <>
      <path d="m3.5 6.5 5.5-2.5 6 2.5 5.5-2.5v13.5L15 20l-6-2.5-5.5 2.5z" />
      <path d="M9 4v13.5M15 6.5V20" />
    </>
  ),
  flame: <path d="M12 21c-3.9 0-6.5-2.6-6.5-6.1 0-3.6 2.8-5.6 3.8-8.9 2.2 1.3 3 3.3 3 4.9 1-.6 1.7-1.8 1.8-3.2 2.4 1.9 4.4 4.5 4.4 7.3C18.5 18.4 15.9 21 12 21Z" />,
  bolt: <path d="M13 3 5 13.5h6L10 21l8-10.5h-6z" />,
  trophy: (
    <>
      <path d="M8 4h8v5a4 4 0 0 1-8 0z" />
      <path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4" />
      <path d="M12 13v4M8.5 20h7M10 17h4" />
    </>
  ),
  cards: (
    <>
      <rect x="7" y="4" width="11" height="15" rx="2" transform="rotate(8 12.5 11.5)" />
      <rect x="5" y="5" width="11" height="15" rx="2" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.8" fill="currentColor" />
    </>
  ),
  brain: (
    <>
      <path d="M9 5.5a3 3 0 0 0-5 2.2 3 3 0 0 0 .5 5.6A3 3 0 0 0 9 18.5V5.5Z" />
      <path d="M15 5.5a3 3 0 0 1 5 2.2 3 3 0 0 1-.5 5.6 3 3 0 0 1-4.5 5.2V5.5Z" />
      <path d="M9 5.5a3 3 0 0 1 6 0M9 18.5a3 3 0 0 0 6 0" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  cap: (
    <>
      <path d="m2.5 9.5 9.5-4.5 9.5 4.5-9.5 4.5z" />
      <path d="M6.5 11.5v4c2.8 2.3 8.2 2.3 11 0v-4M21.5 9.5v5" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  lock: (
    <>
      <rect x="5.5" y="10.5" width="13" height="10" rx="2" />
      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
    </>
  ),
  cloud: <path d="M7 18.5a4.5 4.5 0 0 1-.6-9A6 6 0 0 1 18 9.6a4.5 4.5 0 0 1-.5 8.9Z" />,
  play: <path d="M8 5.5v13l10-6.5z" fill="currentColor" stroke="none" />,
};

export function Glyph({ name, size = 20 }: { name: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {PATHS[name] ?? PATHS.target}
    </svg>
  );
}

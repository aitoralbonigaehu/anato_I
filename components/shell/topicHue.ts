import type { CSSProperties } from 'react';

/**
 * Every topic has its own hue (an OKLCH angle), chosen from what it is about: warm flesh for the first
 * weeks, violet for the cavities, sand for bone, red for muscle and the heart, blues for arteries and veins,
 * green for the gut, gold for the urinary system, orchid for the gonads. The stylesheet turns the angle
 * into colours at the right lightness for each theme (--topic, --topic-soft, --topic-glow), so a topic
 * reads the same on paper and in the dark, and the hue can glide from one topic to the next.
 */
export const TOPIC_HUE: Record<number, number> = {
  1: 40,
  2: 18,
  3: 300,
  4: 28,
  5: 70,
  6: 355,
  7: 295,
  8: 80,
  9: 22,
  10: 12,
  11: 2,
  12: 255,
  13: 235,
  14: 155,
  15: 92,
  16: 325,
};

export const hueOf = (week: number) => TOPIC_HUE[week] ?? 40;

/** The CSS custom property that carries a topic's hue to everything inside it. */
export const hueStyle = (week: number, extra?: CSSProperties): CSSProperties => ({ ...extra, ['--th' as string]: hueOf(week) });

/**
 * The first sentence of a text (a definition's short form). Its own module: importing it from
 * `generate.ts` built every self-test question at load, a second of work on every page that only
 * wanted this line. A full stop after a number or a Roman numeral (5., IV.) does not end the sentence.
 */
export const firstSentence = (t: string) => t.match(/^.+?(?<!\d)(?<![\s(][IVX]{1,4})[.!?](?=\s|$)/)?.[0] ?? t;

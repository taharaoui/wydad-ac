const graphemes = new Intl.Segmenter(undefined, { granularity: 'grapheme' });

/**
 * At most `max` UTF-16 units of `text`, cut between whole characters. A plain `.slice` can split an
 * emoji (🇲🇦 is four units): the lone half is dropped from the server HTML but kept by the browser,
 * which breaks React hydration of the whole page.
 */
export function clipText(text: string, max: number): string {
  if (text.length <= max) return text;
  let out = '';
  for (const { segment } of graphemes.segment(text)) {
    if (out.length + segment.length > max) break;
    out += segment;
  }
  return out;
}

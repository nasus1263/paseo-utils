/** Lines of a selection, 1-based and inclusive. */
export interface LineRange {
  start: number;
  end: number;
}

/**
 * Characters a rendered Markdown view drops or adds: whitespace, markup, bullets, escapes, and
 * the superscript numbers previews draw for footnote references.
 */
const MARKUP = /[\s*_`~#>[\]|\-+=•\\⁰¹²³⁴⁵⁶⁷⁸⁹]/;
const FOOTNOTE_REF = /^\[\^[^\]\s]+\]/;

/** `text` without the characters rendering adds or drops, for comparing rendered and source text. */
export function plain(text: string): string {
  return [...text].filter((ch) => !MARKUP.test(ch)).join("");
}

/** How many times `needle` occurs in `text`, overlapping matches included. */
export function countOccurrences(text: string, needle: string): number {
  if (needle === "") return 0;
  let count = 0;
  for (let i = text.indexOf(needle); i !== -1; i = text.indexOf(needle, i + 1)) count++;
  return count;
}

/**
 * Finds rendered text `selected` in Markdown `source`: the match number `occurrence` (0-based)
 * when there are that many, else the first. Returns source offsets, or null when absent.
 */
export function locateRendered(
  source: string,
  selected: string,
  occurrence: number,
): { from: number; to: number } | null {
  const needle = plain(selected);
  if (needle === "") return null;
  let text = "";
  const map: number[] = [];
  for (let i = 0; i < source.length; i++) {
    if (source.startsWith("](", i)) {
      const close = source.indexOf(")", i + 2);
      if (close !== -1 && !source.slice(i, close).includes("\n")) {
        i = close;
        continue;
      }
    }
    const ref = source[i] === "[" ? FOOTNOTE_REF.exec(source.slice(i, i + 80)) : null;
    if (ref) {
      i += ref[0].length - 1;
      continue;
    }
    if (MARKUP.test(source[i])) continue;
    text += source[i];
    map.push(i);
  }
  let first = -1;
  let found = -1;
  for (let i = text.indexOf(needle), n = 0; i !== -1; i = text.indexOf(needle, i + 1), n++) {
    if (first === -1) first = i;
    if (n === occurrence) {
      found = i;
      break;
    }
  }
  const at = found === -1 ? first : found;
  if (at === -1) return null;
  return { from: map[at], to: map[at + needle.length - 1] + 1 };
}

/** Lines that offsets `from`..`to` of `text` span. A range ending at a line start stops before it. */
export function lineRange(text: string, from: number, to: number): LineRange {
  const lineAt = (offset: number) => {
    let line = 1;
    for (let i = text.indexOf("\n"); i !== -1 && i < offset; i = text.indexOf("\n", i + 1)) line++;
    return line;
  };
  const start = lineAt(from);
  const last = to > from && text[to - 1] === "\n" ? to - 1 : to;
  return { start, end: Math.max(start, lineAt(last)) };
}

/** `path`, followed by `:12` or `:12-15` when lines are given. */
export function withLines(path: string, lines: LineRange | null): string {
  if (!lines) return path;
  return lines.start === lines.end ? `${path}:${lines.start}` : `${path}:${lines.start}-${lines.end}`;
}

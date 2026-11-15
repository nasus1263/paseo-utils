import assert from "node:assert/strict";
import { test } from "node:test";
import { countOccurrences, lineRange, locateRendered, plain, withLines } from "../shared/locate.ts";

test("lineRange counts 1-based lines and drops a trailing line start", () => {
  const text = "a\nbb\nccc\n";
  assert.deepEqual(lineRange(text, 0, 1), { start: 1, end: 1 });
  assert.deepEqual(lineRange(text, 2, 7), { start: 2, end: 3 });
  assert.deepEqual(lineRange(text, 2, 5), { start: 2, end: 2 });
});

test("locateRendered finds rendered text across markup", () => {
  const source = "# 제목\n\n본문 **굵게** 와 [링크](a/b.md) 끝\n\n둘째 줄 굵게\n";
  const range = locateRendered(source, "굵게 와 링크", 0);
  assert.ok(range);
  assert.deepEqual(lineRange(source, range.from, range.to), { start: 3, end: 3 });
});

test("locateRendered picks the requested occurrence, else the first", () => {
  const source = "foo\nbar\nfoo\n";
  assert.deepEqual(lineRange(source, ...Object.values(locateRendered(source, "foo", 1))), { start: 3, end: 3 });
  assert.deepEqual(lineRange(source, ...Object.values(locateRendered(source, "foo", 5))), { start: 1, end: 1 });
  assert.equal(locateRendered(source, "zzz", 0), null);
});

test("locateRendered spans several lines and skips footnote references", () => {
  const source = "- 하나[^1]\n- 둘\n- 셋\n";
  const range = locateRendered(source, "하나\n둘", 0);
  assert.deepEqual(lineRange(source, range.from, range.to), { start: 1, end: 2 });
});

test("helpers", () => {
  assert.equal(plain("**a** b"), "ab");
  assert.equal(countOccurrences("aaa", "aa"), 2);
  assert.equal(withLines("a.md", null), "a.md");
  assert.equal(withLines("a.md", { start: 3, end: 3 }), "a.md:3");
  assert.equal(withLines("a.md", { start: 3, end: 5 }), "a.md:3-5");
});

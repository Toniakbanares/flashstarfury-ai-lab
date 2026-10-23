import { describe, it, expect, beforeEach } from "vitest";
import { saveLyric, listLyrics } from "@/lib/lyricsLibrary";

describe("lyrics library versions", () => {
  beforeEach(() => localStorage.clear());
  it("saving the same title again creates version 2", () => {
    saveLyric("Luz", "a");
    const l = saveLyric("Luz", "b");
    expect(l.versions.map((v) => v.version)).toEqual([1, 2]);
    expect(listLyrics()).toHaveLength(1);
  });
  it("identical text does not add a version", () => {
    saveLyric("Luz", "a");
    expect(saveLyric("Luz", "a").versions).toHaveLength(1);
  });
});

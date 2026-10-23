export type LyricVersion = { version: number; text: string; savedAt: number };
export type SavedLyric = { id: string; title: string; versions: LyricVersion[]; updatedAt: number };

const KEY = "starfury_lyrics_library_v1";

export const listLyrics = (): SavedLyric[] => {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(v) ? v.sort((a, b) => b.updatedAt - a.updatedAt) : [];
  } catch {
    return [];
  }
};

const persist = (all: SavedLyric[]) => localStorage.setItem(KEY, JSON.stringify(all));

/** Save lyrics. Same title (case-insensitive) or id adds a new version; identical text is not duplicated. */
export const saveLyric = (title: string, text: string, id?: string): SavedLyric => {
  const all = listLyrics();
  const now = Date.now();
  const clean = title.trim() || "Sem título";
  const found = all.find((l) => (id ? l.id === id : l.title.toLowerCase() === clean.toLowerCase()));
  if (found) {
    const last = found.versions[found.versions.length - 1];
    found.title = clean;
    if (!last || last.text !== text) {
      found.versions.push({ version: (last?.version ?? 0) + 1, text, savedAt: now });
    }
    found.updatedAt = now;
    persist(all);
    return found;
  }
  const created: SavedLyric = {
    id: crypto.randomUUID(),
    title: clean,
    versions: [{ version: 1, text, savedAt: now }],
    updatedAt: now,
  };
  persist([created, ...all]);
  return created;
};

export const deleteLyric = (id: string) => persist(listLyrics().filter((l) => l.id !== id));

import { saveAs } from "file-saver";

export type MusicProject = {
  id: string;
  title: string;
  artist: string;
  lyrics?: string;
  chords?: string;
  publishing?: Record<string, string>;
  coverUrl?: string;
  status: "draft" | "published";
  createdAt: number;
  updatedAt: number;
};

const KEY = "pixelnova_music_projects";
const DL_KEY = "pixelnova_music_downloads";

export const listProjects = (): MusicProject[] => {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
};

export const saveProject = (p: Partial<MusicProject> & { id?: string }): MusicProject => {
  const all = listProjects();
  const now = Date.now();
  if (p.id) {
    const idx = all.findIndex((x) => x.id === p.id);
    if (idx >= 0) {
      all[idx] = { ...all[idx], ...p, updatedAt: now } as MusicProject;
      localStorage.setItem(KEY, JSON.stringify(all));
      return all[idx];
    }
  }
  const created: MusicProject = {
    id: crypto.randomUUID(),
    title: p.title || "Untitled",
    artist: p.artist || "Unknown Artist",
    status: p.status || "draft",
    createdAt: now,
    updatedAt: now,
    ...p,
  } as MusicProject;
  all.unshift(created);
  localStorage.setItem(KEY, JSON.stringify(all));
  return created;
};

export const deleteProject = (id: string) => {
  const all = listProjects().filter((p) => p.id !== id);
  localStorage.setItem(KEY, JSON.stringify(all));
};

export const trackDownload = (name: string) => {
  try {
    const arr = JSON.parse(localStorage.getItem(DL_KEY) || "[]");
    arr.unshift({ name, at: Date.now() });
    localStorage.setItem(DL_KEY, JSON.stringify(arr.slice(0, 100)));
  } catch {}
};

export const listDownloads = (): { name: string; at: number }[] => {
  try { return JSON.parse(localStorage.getItem(DL_KEY) || "[]"); } catch { return []; }
};

export const downloadBlob = (blob: Blob, filename: string) => {
  saveAs(blob, filename);
  trackDownload(filename);
};

export const downloadText = (text: string, filename: string) => {
  downloadBlob(new Blob([text], { type: "text/plain;charset=utf-8" }), filename);
};

// Lightweight typed localStorage store for guest data + user submissions.
// Used as a fallback when Supabase is not available or user is not logged in.

const KEYS = {
  submittedTools: "pixelnova_submitted_tools",
  savedTools: "pixelnova_saved_tools",
  savedOffers: "pixelnova_saved_offers",
  savedCreations: "pixelnova_saved_creations",
} as const;

export type SubmittedTool = {
  id: string;
  slug: string;
  title: string;
  description: string;
  url: string;
  category: string;
  image_url: string | null;
  tags: string[];
  tier: "free" | "premium";
  is_featured: false;
  is_trending: false;
  is_new: true;
  likes_count: number;
  clicks_count: number;
  views_count: number;
  created_at: string;
  is_user_submission: true;
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("pixelnova:store", { detail: { key } }));
  } catch {
    /* quota / private mode */
  }
}

// ---------- Submitted tools ----------
export const getSubmittedTools = (): SubmittedTool[] =>
  read<SubmittedTool[]>(KEYS.submittedTools, []);

export const addSubmittedTool = (
  data: Omit<SubmittedTool, "id" | "slug" | "created_at" | "likes_count" | "clicks_count" | "views_count" | "is_featured" | "is_trending" | "is_new" | "is_user_submission">
): SubmittedTool => {
  const id = `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const slug = data.title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60) || id;
  const tool: SubmittedTool = {
    ...data,
    id,
    slug,
    created_at: new Date().toISOString(),
    likes_count: 0,
    clicks_count: 0,
    views_count: 0,
    is_featured: false,
    is_trending: false,
    is_new: true,
    is_user_submission: true,
  };
  const list = getSubmittedTools();
  write(KEYS.submittedTools, [tool, ...list]);
  return tool;
};

// ---------- Generic saved sets ----------
function setOps(key: string) {
  const get = () => new Set<string>(read<string[]>(key, []));
  const save = (s: Set<string>) => write(key, [...s]);
  return {
    get,
    has: (id: string) => get().has(id),
    toggle: (id: string) => {
      const s = get();
      if (s.has(id)) s.delete(id);
      else s.add(id);
      save(s);
      return s;
    },
    remove: (id: string) => {
      const s = get();
      s.delete(id);
      save(s);
      return s;
    },
  };
}

export const savedToolsStore = setOps(KEYS.savedTools);
export const savedOffersStore = setOps(KEYS.savedOffers);
export const savedCreationsStore = setOps(KEYS.savedCreations);

export const STORE_EVENT = "pixelnova:store";

// Hybrid storage: localStorage for guests, Supabase `user_data` for logged-in users.
// One unified API. Auto-migrates local entries to Cloud on first sign-in.
import { supabase } from "@/integrations/supabase/client";

type Value = unknown;
const LOCAL_PREFIX = "pn_hs::";
const MIGRATED_FLAG = "pn_hs_migrated_v1";

const localKey = (ns: string, k: string) => `${LOCAL_PREFIX}${ns}::${k}`;

async function currentUserId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.user?.id ?? null;
  } catch { return null; }
}

export const hybrid = {
  async get<T = Value>(namespace: string, key: string): Promise<T | null> {
    const uid = await currentUserId();
    if (uid) {
      const { data, error } = await supabase
        .from("user_data").select("value")
        .eq("user_id", uid).eq("namespace", namespace).eq("key", key).maybeSingle();
      if (!error && data) return data.value as T;
    }
    try {
      const raw = localStorage.getItem(localKey(namespace, key));
      return raw ? (JSON.parse(raw) as T) : null;
    } catch { return null; }
  },

  async set<T = Value>(namespace: string, key: string, value: T): Promise<void> {
    // Always mirror to localStorage so guest data survives sign-out and offline works.
    try { localStorage.setItem(localKey(namespace, key), JSON.stringify(value)); } catch { /* quota */ }
    const uid = await currentUserId();
    if (uid) {
      await supabase.from("user_data").upsert(
        { user_id: uid, namespace, key, value: value as any, updated_at: new Date().toISOString() },
        { onConflict: "user_id,namespace,key" },
      );
    }
  },

  async list<T = Value>(namespace: string): Promise<Array<{ key: string; value: T }>> {
    const uid = await currentUserId();
    if (uid) {
      const { data } = await supabase
        .from("user_data").select("key,value")
        .eq("user_id", uid).eq("namespace", namespace).order("updated_at", { ascending: false });
      if (data) return data.map((r) => ({ key: r.key, value: r.value as T }));
    }
    const out: Array<{ key: string; value: T }> = [];
    const prefix = `${LOCAL_PREFIX}${namespace}::`;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k || !k.startsWith(prefix)) continue;
        try {
          const raw = localStorage.getItem(k);
          if (raw) out.push({ key: k.slice(prefix.length), value: JSON.parse(raw) as T });
        } catch { /* skip */ }
      }
    } catch { /* no storage */ }
    return out;
  },

  async remove(namespace: string, key: string): Promise<void> {
    try { localStorage.removeItem(localKey(namespace, key)); } catch { /* noop */ }
    const uid = await currentUserId();
    if (uid) {
      await supabase.from("user_data").delete()
        .eq("user_id", uid).eq("namespace", namespace).eq("key", key);
    }
  },
};

// Migrate every pn_hs::* entry into user_data the first time a user signs in.
export async function migrateLocalToCloud(): Promise<void> {
  const uid = await currentUserId();
  if (!uid) return;
  if (localStorage.getItem(MIGRATED_FLAG) === uid) return;
  const rows: Array<{ user_id: string; namespace: string; key: string; value: any }> = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith(LOCAL_PREFIX)) continue;
      const rest = k.slice(LOCAL_PREFIX.length);
      const sep = rest.indexOf("::");
      if (sep < 0) continue;
      const ns = rest.slice(0, sep); const key = rest.slice(sep + 2);
      try {
        const raw = localStorage.getItem(k);
        if (raw) rows.push({ user_id: uid, namespace: ns, key, value: JSON.parse(raw) });
      } catch { /* skip malformed */ }
    }
  } catch { /* no storage */ }
  if (rows.length) {
    // Best-effort — ignore errors so a bad row doesn't block sign-in.
    await supabase.from("user_data").upsert(rows, { onConflict: "user_id,namespace,key" });
  }
  try { localStorage.setItem(MIGRATED_FLAG, uid); } catch { /* noop */ }
}

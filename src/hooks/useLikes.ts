import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const LOCAL_KEY = "pixelnova_guest_likes";

function getGuestLikes(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]"));
  } catch { return new Set(); }
}
function saveGuestLikes(s: Set<string>) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify([...s]));
}

export function useLikes(generationIds: string[]) {
  const { user } = useAuth();
  const [liked, setLiked] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) { setLiked(getGuestLikes()); return; }
    if (generationIds.length === 0) return;
    supabase.from("generation_likes").select("generation_id").eq("user_id", user.id)
      .in("generation_id", generationIds)
      .then(({ data }) => {
        if (data) setLiked(new Set(data.map(d => d.generation_id)));
      });
  }, [user, generationIds.join(",")]);

  const toggle = useCallback(async (genId: string): Promise<"liked" | "unliked" | null> => {
    if (!user) {
      const guest = getGuestLikes();
      if (guest.has(genId)) { guest.delete(genId); saveGuestLikes(guest); setLiked(new Set(guest)); return "unliked"; }
      guest.add(genId); saveGuestLikes(guest); setLiked(new Set(guest)); return "liked";
    }
    const isLiked = liked.has(genId);
    if (isLiked) {
      const { error } = await supabase.from("generation_likes").delete().eq("user_id", user.id).eq("generation_id", genId);
      if (error) return null;
      const next = new Set(liked); next.delete(genId); setLiked(next);
      return "unliked";
    } else {
      const { error } = await supabase.from("generation_likes").insert({ user_id: user.id, generation_id: genId });
      if (error) return null;
      const next = new Set(liked); next.add(genId); setLiked(next);
      return "liked";
    }
  }, [user, liked]);

  return { liked, toggle };
}

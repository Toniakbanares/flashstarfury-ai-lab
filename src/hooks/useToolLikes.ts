import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const LOCAL_KEY = "pixelnova_guest_tool_likes";

function getGuest(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]")); } catch { return new Set(); }
}
function saveGuest(s: Set<string>) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify([...s]));
}

export function useToolLikes(offerIds: string[]) {
  const { user } = useAuth();
  const [liked, setLiked] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) { setLiked(getGuest()); return; }
    if (offerIds.length === 0) return;
    supabase.from("offer_likes").select("offer_id").eq("user_id", user.id).in("offer_id", offerIds)
      .then(({ data }) => { if (data) setLiked(new Set(data.map(d => d.offer_id))); });
  }, [user, offerIds.join(",")]);

  const toggle = useCallback(async (offerId: string) => {
    if (!user) {
      const g = getGuest();
      if (g.has(offerId)) g.delete(offerId); else g.add(offerId);
      saveGuest(g); setLiked(new Set(g));
      return;
    }
    if (liked.has(offerId)) {
      await supabase.from("offer_likes").delete().eq("user_id", user.id).eq("offer_id", offerId);
      const n = new Set(liked); n.delete(offerId); setLiked(n);
    } else {
      await supabase.from("offer_likes").insert({ user_id: user.id, offer_id: offerId });
      setLiked(new Set(liked).add(offerId));
    }
  }, [user, liked]);

  return { liked, toggle };
}

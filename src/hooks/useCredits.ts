import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  getBonusCredits,
  useBonusCredit as consumeBonusLocal,
  STORE_EVENT,
} from "@/lib/localStore";

const DAILY_CREDITS = 5;

export function useCredits() {
  const { user } = useAuth();
  const [dailyCredits, setDailyCredits] = useState<number>(DAILY_CREDITS);
  const [bonus, setBonus] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // ---- bonus (local) ----
  const refreshBonus = useCallback(() => setBonus(getBonusCredits()), []);
  useEffect(() => {
    refreshBonus();
    const onStore = () => refreshBonus();
    window.addEventListener(STORE_EVENT, onStore);
    window.addEventListener("storage", onStore);
    return () => {
      window.removeEventListener(STORE_EVENT, onStore);
      window.removeEventListener("storage", onStore);
    };
  }, [refreshBonus]);

  // ---- daily (DB or local for guests) ----
  const fetchCredits = useCallback(async () => {
    if (!user) {
      // Guest: 5 daily, reset every 24h via localStorage
      try {
        const raw = localStorage.getItem("pixelnova_guest_credits");
        const now = Date.now();
        if (raw) {
          const { credits, last } = JSON.parse(raw);
          const diffH = (now - last) / 36e5;
          if (diffH >= 24) {
            localStorage.setItem("pixelnova_guest_credits", JSON.stringify({ credits: DAILY_CREDITS, last: now }));
            setDailyCredits(DAILY_CREDITS);
          } else {
            setDailyCredits(credits);
          }
        } else {
          localStorage.setItem("pixelnova_guest_credits", JSON.stringify({ credits: DAILY_CREDITS, last: now }));
          setDailyCredits(DAILY_CREDITS);
        }
      } catch {
        setDailyCredits(DAILY_CREDITS);
      }
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("user_credits")
      .select("credits_remaining, last_reset_at")
      .eq("user_id", user.id)
      .single();

    if (error || !data) { setLoading(false); return; }

    const lastReset = new Date(data.last_reset_at);
    const now = new Date();
    const diffHours = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);

    if (diffHours >= 24) {
      await supabase
        .from("user_credits")
        .update({ credits_remaining: DAILY_CREDITS, last_reset_at: now.toISOString() })
        .eq("user_id", user.id);
      setDailyCredits(DAILY_CREDITS);
    } else {
      setDailyCredits(data.credits_remaining);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchCredits(); }, [fetchCredits]);

  const credits = dailyCredits + bonus;

  const useCredit = async (): Promise<boolean> => {
    // Prefer daily first, then bonus
    if (dailyCredits > 0) {
      if (!user) {
        const next = dailyCredits - 1;
        try {
          const raw = localStorage.getItem("pixelnova_guest_credits");
          const last = raw ? JSON.parse(raw).last : Date.now();
          localStorage.setItem("pixelnova_guest_credits", JSON.stringify({ credits: next, last }));
        } catch { /* ignore */ }
        setDailyCredits(next);
        return true;
      }
      const next = dailyCredits - 1;
      const { error } = await supabase
        .from("user_credits")
        .update({ credits_remaining: next })
        .eq("user_id", user.id);
      if (!error) { setDailyCredits(next); return true; }
      return false;
    }
    // fall back to bonus
    if (bonus > 0) {
      const ok = consumeBonusLocal();
      if (ok) { refreshBonus(); return true; }
    }
    return false;
  };

  return { credits, dailyCredits, bonus, loading, useCredit, refetch: fetchCredits };
}

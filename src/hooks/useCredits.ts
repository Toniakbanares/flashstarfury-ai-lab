import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const DAILY_CREDITS = 5;

export function useCredits() {
  const { user } = useAuth();
  const [credits, setCredits] = useState<number>(DAILY_CREDITS);
  const [loading, setLoading] = useState(true);

  const fetchCredits = useCallback(async () => {
    if (!user) { setCredits(0); setLoading(false); return; }
    
    const { data, error } = await supabase
      .from("user_credits")
      .select("credits_remaining, last_reset_at")
      .eq("user_id", user.id)
      .single();

    if (error || !data) { setLoading(false); return; }

    // Check if daily reset needed
    const lastReset = new Date(data.last_reset_at);
    const now = new Date();
    const diffHours = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);

    if (diffHours >= 24) {
      await supabase
        .from("user_credits")
        .update({ credits_remaining: DAILY_CREDITS, last_reset_at: now.toISOString() })
        .eq("user_id", user.id);
      setCredits(DAILY_CREDITS);
    } else {
      setCredits(data.credits_remaining);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchCredits(); }, [fetchCredits]);

  const useCredit = async (): Promise<boolean> => {
    if (!user || credits <= 0) return false;
    const newCredits = credits - 1;
    const { error } = await supabase
      .from("user_credits")
      .update({ credits_remaining: newCredits })
      .eq("user_id", user.id);
    if (!error) { setCredits(newCredits); return true; }
    return false;
  };

  return { credits, loading, useCredit, refetch: fetchCredits };
}

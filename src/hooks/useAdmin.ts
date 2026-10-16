import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useAdmin() {
  const { user } = useAuth();
  const [adminId, setAdminId] = useState<string | null>(null);
  useEffect(() => {
    let current = true;
    setAdminId(null);
    if (user) supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data, error }) => {
      if (current && !error && data) setAdminId(user.id);
    });
    return () => { current = false; };
  }, [user?.id]);
  return Boolean(user && adminId === user.id);
}
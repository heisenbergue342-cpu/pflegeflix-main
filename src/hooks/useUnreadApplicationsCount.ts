import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useUnreadApplicationsCount() {
  const { user, profile } = useAuth();
  const [count, setCount] = useState<number>(0);

  const refresh = async () => {
    if (!user || profile?.role !== "arbeitgeber") {
      setCount(0);
      return;
    }
    // Count new applications (not yet viewed) for this employer
    const { count: unreadCount } = await supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("jobs.owner_id", user.id)
      .is("viewed_at", null);
    setCount(unreadCount || 0);
  };

  useEffect(() => {
    refresh();
    const channel = supabase
      .channel("unread-applications")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "applications" },
        () => refresh()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, profile?.role]);

  return count;
}
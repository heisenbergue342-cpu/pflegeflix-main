import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useUnreadMessagesCount() {
  const { user } = useAuth();
  const [count, setCount] = useState<number>(0);

  const refresh = async () => {
    if (!user) {
      setCount(0);
      return;
    }
    // Count unread messages across all user's applications
    const { data: apps } = await supabase
      .from("applications")
      .select("id")
      .eq("user_id", user.id);
    const appIds = (apps || []).map((a: any) => a.id);
    if (appIds.length === 0) {
      setCount(0);
      return;
    }
    const { count: unreadCount } = await supabase
      .from("application_messages")
      .select("*", { count: "exact", head: true })
      .in("application_id", appIds)
      .neq("sender_id", user.id)
      .is("read_at", null);
    setCount(unreadCount || 0);
  };

  useEffect(() => {
    refresh();
    const channel = supabase
      .channel("unread-messages")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "application_messages" },
        () => refresh()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return count;
}
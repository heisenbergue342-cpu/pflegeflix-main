import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUnreadTotalCount } from "@/hooks/useUnread";
import { useAuth } from "@/contexts/AuthContext";

export default function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const unread = useUnreadTotalCount();

  if (!user) return null;

  return (
    <button
      type="button"
      onClick={() => navigate("/applications")}
      className="relative inline-flex items-center justify-center rounded-full p-2 text-netflix-text hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--focus-outline))] focus-visible:ring-offset-2 focus-visible:ring-offset-netflix-bg"
      aria-label="Benachrichtigungen öffnen"
    >
      <Bell className="w-6 h-6" aria-hidden="true" />
      {unread > 0 && (
        <span
          className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-netflix-red text-white text-[10px] font-semibold leading-4 text-center"
          aria-label={`${unread} ungelesene Nachrichten`}
        >
          {unread}
        </span>
      )}
    </button>
  );
}
import { Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUnreadTotalCount } from "@/hooks/useUnread";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const unread = useUnreadTotalCount();
  const { t, language } = useLanguage();

  if (!user) return null;

  const destination = "/applications";
  const displayCount = unread > 99 ? "99+" : unread;
  const ariaLabel = `${t("messages.tooltip")} (${unread} ${t("messages.unread")})`;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => navigate(destination)}
            className="relative inline-flex items-center justify-center rounded-full min-w-[40px] min-h-[40px] p-2 text-netflix-text hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--focus-outline))] focus-visible:ring-offset-2 focus-visible:ring-offset-netflix-bg"
            aria-label={ariaLabel}
          >
            {/* Envelope / Mail icon to match provided design (subtle gray on dark bg) */}
            <Mail className="w-7 h-7 text-muted-foreground" aria-hidden="true" />
            {unread > 0 && (
              <span
                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-netflix-red text-white text-[10px] font-semibold leading-4 text-center"
                aria-label={`${displayCount} ${t("messages.unread")}`}
              >
                {displayCount}
              </span>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <span>{t("messages.tooltip")}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
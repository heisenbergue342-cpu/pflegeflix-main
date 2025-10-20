import { useSearchParams } from "react-router-dom";
import { PillChip } from "@/components/PillChip";
import { useLanguage } from "@/contexts/LanguageContext";
import { trackAnalyticsEvent } from "@/hooks/useAnalytics";

type PostedValue = "24h" | "7d" | "30d" | null;

interface PostedFilterToggleProps {
  value?: PostedValue;
  onChange?: (value: PostedValue) => void;
  // If provided, will sync with URL; otherwise controlled via value/onChange
  urlSync?: boolean;
}

const OPTIONS: { value: PostedValue; labelKey: string }[] = [
  { value: "24h", labelKey: "search.posted_options.24h" },
  { value: "7d", labelKey: "search.posted_options.7d" },
  { value: "30d", labelKey: "search.posted_options.30d" },
];

export function PostedFilterToggle({ value, onChange, urlSync = true }: PostedFilterToggleProps) {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const selected = urlSync ? (searchParams.get("posted") as PostedValue) : value;

  const select = (newValue: PostedValue) => {
    if (urlSync) {
      if (newValue) {
        searchParams.set("posted", newValue);
      } else {
        searchParams.delete("posted");
      }
      setSearchParams(searchParams);
    } else {
      onChange?.(newValue);
    }
    // Analytics
    trackAnalyticsEvent("filter_change", {
      filter: "posted",
      value: newValue ?? null,
    });
  };

  const handleClick = (optValue: PostedValue) => {
    if (selected === optValue) {
      select(null);
    } else {
      select(optValue);
    }
  };

  return (
    <div role="radiogroup" aria-label={t("search.posted_label")} className="flex flex-wrap gap-3">
      {OPTIONS.map((opt) => (
        <PillChip
          key={opt.value}
          label={t(opt.labelKey)}
          selected={selected === opt.value}
          onClick={() => handleClick(opt.value)}
          aria-checked={selected === opt.value}
        />
      ))}
    </div>
  );
}
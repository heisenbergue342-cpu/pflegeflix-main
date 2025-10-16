import { cn } from "@/lib/utils";

interface PillChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

export function PillChip({ label, selected, onClick, disabled }: PillChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      role="button"
      aria-pressed={selected}
      aria-label={`${label}${selected ? ' (selected)' : ''}`}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={cn(
        "px-3.5 py-2.5 rounded-full text-sm font-semibold transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--focus-outline))] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F0F10]",
        "active:scale-[1.03]",
        selected
          ? "bg-[hsl(var(--netflix-red))] text-white border-0"
          : "bg-[#1A1A1B] border border-[#2A2A2B] text-[#EDEDED] hover:bg-[#242424]",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {label}
    </button>
  );
}

"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const STATES = [
  "Baden-Württemberg", "Bayern", "Berlin", "Brandenburg", "Bremen",
  "Hamburg", "Hessen", "Mecklenburg-Vorpommern", "Niedersachsen",
  "Nordrhein-Westfalen", "Rheinland-Pfalz", "Saarland", "Sachsen",
  "Sachsen-Anhalt", "Schleswig-Holstein", "Thüringen"
];

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ä/g, "a")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .replace(/ß/g, "ss")
    .replace(/ae/g, "a")
    .replace(/oe/g, "o")
    .replace(/ue/g, "u")
    .trim();

interface StateComboboxProps {
  value: string | null;
  onChange: (state: string) => void;
  placeholder?: string;
  error?: string | null;
}

const StateCombobox: React.FC<StateComboboxProps> = ({ value, onChange, placeholder, error }) => {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const normalizedQuery = normalize(query);
  const filteredStates = useMemo(() => {
    if (!normalizedQuery) return STATES.slice(0, 8);
    return STATES.filter((s) => normalize(s).includes(normalizedQuery)).slice(0, 8);
  }, [normalizedQuery]);

  const selectState = (s: string) => {
    onChange(s);
    setOpen(false);
    setQuery("");
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((prev) => Math.min(prev + 1, filteredStates.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      setOpen(true);
      if (activeIndex >= 0 && activeIndex < filteredStates.length) {
        selectState(filteredStates[activeIndex]);
      } else if (filteredStates.length > 0) {
        selectState(filteredStates[0]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  useEffect(() => {
    const onDocClick = (ev: MouseEvent) => {
      if (!open) return;
      const target = ev.target as Node;
      if (
        inputRef.current &&
        !inputRef.current.contains(target) &&
        listRef.current &&
        !listRef.current.contains(target)
      ) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const renderHighlighted = (label: string) => {
    if (!normalizedQuery) return label;
    const normLabel = normalize(label);
    const idx = normLabel.indexOf(normalizedQuery);
    if (idx === -1) return label;
    const before = label.slice(0, idx);
    const match = label.slice(idx, idx + normalizedQuery.length);
    const after = label.slice(idx + normalizedQuery.length);
    return (
      <>
        {before}
        <mark className="bg-transparent text-primary font-semibold">{match}</mark>
        {after}
      </>
    );
  };

  return (
    <div className="relative">
      {/* Display selected state */}
      {value && (
        <div className="mb-2 text-sm text-foreground" aria-live="polite">
          {value}
        </div>
      )}

      <div className={`flex items-center gap-2 rounded-md border ${error ? "border-destructive" : "border-input"} bg-background px-3 py-2`}>
        <Search className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          className="w-full bg-transparent outline-none text-sm placeholder:text-muted-foreground"
          placeholder={placeholder || t("job.field.state_placeholder")}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActiveIndex(0);
          }}
          onKeyDown={onKeyDown}
          role="combobox"
          aria-controls="state-listbox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label={t("job.field.state")}
        />
      </div>

      <div className="mt-1 text-xs">
        {error ? (
          <p className="text-destructive">{error}</p>
        ) : (
          <p className="text-muted-foreground">{t("job.field.state_placeholder")}</p>
        )}
      </div>

      {open && (
        <ul
          id="state-listbox"
          ref={listRef}
          role="listbox"
          className="absolute z-40 mt-2 w-full max-h-60 overflow-auto rounded-md border border-input bg-popover text-popover-foreground shadow-lg"
        >
          {filteredStates.length === 0 ? (
            <li
              className="px-3 py-3 text-sm text-muted-foreground"
              aria-live="polite"
              role="option"
              aria-disabled="true"
            >
              {t("common.no_results")}
            </li>
          ) : (
            filteredStates.map((s, idx) => {
              const selected = value === s;
              const active = idx === activeIndex;
              return (
                <li
                  key={s}
                  role="option"
                  aria-selected={selected}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectState(s);
                  }}
                  className={`px-3 py-3 text-sm cursor-pointer ${active ? "bg-accent text-accent-foreground" : ""} ${selected ? "opacity-60" : ""}`}
                >
                  {renderHighlighted(s)}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
};

export default StateCombobox;
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { X, Search } from "lucide-react";
import { germanCities, City } from "@/data/cities_de";
import { useLanguage } from "@/contexts/LanguageContext";

interface CityComboboxMultiProps {
  value: string[];
  onChange: (cities: string[]) => void;
  max?: number; // default 3
  placeholder?: string;
  hint?: string;
  error?: string | null;
}

/**
 * Normalizes strings for fuzzy matching (umlauts and common typos).
 * Converts to lowercase ASCII and collapses ae/oe/ue to a/o/u.
 */
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

const CityComboboxMulti: React.FC<CityComboboxMultiProps> = ({
  value,
  onChange,
  max = 3,
  placeholder,
  hint,
  error,
}) => {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const normalizedQuery = normalize(query);

  const filteredCities: City[] = useMemo(() => {
    if (!normalizedQuery) return germanCities.slice(0, 8);
    const results = germanCities.filter((c) => normalize(c.name).includes(normalizedQuery));
    return results.slice(0, 8);
  }, [normalizedQuery]);

  const addCity = (name: string) => {
    if (value.includes(name)) {
      // Already selected; do nothing
      setOpen(false);
      setQuery("");
      setActiveIndex(-1);
      return;
    }
    if (value.length >= max) {
      // Show limit hint inline via error handler outside (we keep UI consistent)
      setOpen(false);
      setQuery("");
      setActiveIndex(-1);
      return;
    }
    const next = [...value, name];
    onChange(next);
    setOpen(false);
    setQuery("");
    setActiveIndex(-1);
    // Move focus back to input
    inputRef.current?.focus();
  };

  const removeCity = (name: string) => {
    const next = value.filter((v) => v !== name);
    onChange(next);
    inputRef.current?.focus();
  };

  // Keyboard interactions
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((prev) => Math.min(prev + 1, filteredCities.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      setOpen(true);
      if (activeIndex >= 0 && activeIndex < filteredCities.length) {
        addCity(filteredCities[activeIndex].name);
      } else if (filteredCities.length > 0) {
        addCity(filteredCities[0].name);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    } else if (e.key === "Backspace") {
      if (!query && value.length > 0) {
        removeCity(value[value.length - 1]);
      }
    }
  };

  // Close on outside click
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

  // Highlight matched substring using indices from normalized strings
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
    <div className="relative" role="group" aria-label={t("filter.location")}>
      {/* Selected chips */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2" aria-live="polite">
          {value.map((city) => (
            <span
              key={city}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-accent text-accent-foreground text-sm"
            >
              {city}
              <button
                type="button"
                onClick={() => removeCity(city)}
                className="rounded-full hover:bg-muted p-0.5"
                aria-label={t("filter.remove_city", { city })}
              >
                <X className="w-3 h-3" aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Combobox input */}
      <div className={`flex items-center gap-2 rounded-md border ${error ? "border-destructive" : "border-input"} bg-background px-3 py-2`}>
        <Search className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          className="w-full bg-transparent outline-none text-sm placeholder:text-muted-foreground"
          placeholder={placeholder || t("filter.search_cities")}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActiveIndex(0);
          }}
          onKeyDown={onKeyDown}
          role="combobox"
          aria-controls="city-listbox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label={t("filter.location")}
        />
      </div>

      {/* Helper / error */}
      <div className="mt-1 text-xs">
        {error ? (
          <p className="text-destructive">{error}</p>
        ) : (
          <p className="text-muted-foreground">{hint || t("filter.city_helper")}</p>
        )}
      </div>

      {/* Results listbox */}
      {open && (
        <ul
          id="city-listbox"
          ref={listRef}
          role="listbox"
          className="absolute z-40 mt-2 w-full max-h-60 overflow-auto rounded-md border border-input bg-popover text-popover-foreground shadow-lg"
        >
          {filteredCities.length === 0 ? (
            <li
              className="px-3 py-3 text-sm text-muted-foreground"
              aria-live="polite"
              role="option"
              aria-disabled="true"
            >
              {t("common.no_results")}
            </li>
          ) : (
            filteredCities.map((c, idx) => {
              const selected = value.includes(c.name);
              const active = idx === activeIndex;
              return (
                <li
                  key={`${c.slug}-${idx}`}
                  role="option"
                  aria-selected={selected}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    addCity(c.name);
                  }}
                  className={`px-3 py-3 text-sm cursor-pointer flex items-center justify-between ${
                    active ? "bg-accent text-accent-foreground" : ""
                  } ${selected ? "opacity-60" : ""}`}
                >
                  <span>{renderHighlighted(c.name)}</span>
                  <span className="text-xs text-muted-foreground">{c.state}</span>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
};

export default CityComboboxMulti;
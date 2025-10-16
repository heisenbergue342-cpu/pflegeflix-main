import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { X, MapPin, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { germanCities, City } from '@/data/cities_de';

interface LocationFilterProps {
  selectedCities: string[];
  onApply: (cities: string[]) => void;
  onClear: () => void;
}

export default function LocationFilter({ selectedCities, onApply, onClear }: LocationFilterProps) {
  const { t } = useLanguage();
  const [localSelected, setLocalSelected] = useState<string[]>(selectedCities);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  const MAX_SELECTIONS = 3;
  const isMaxReached = localSelected.length >= MAX_SELECTIONS;

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (searchTerm.trim()) {
        const filtered = germanCities.filter(city =>
          city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          city.state.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 10);
        setFilteredCities(filtered);
        setShowDropdown(true);
      } else {
        setFilteredCities([]);
        setShowDropdown(false);
      }
      setHighlightedIndex(-1);
    }, 250);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchTerm]);

  // Sync with parent
  useEffect(() => {
    setLocalSelected(selectedCities);
  }, [selectedCities]);

  const handleAddCity = (cityName: string) => {
    if (!localSelected.includes(cityName) && !isMaxReached) {
      setLocalSelected([...localSelected, cityName]);
      setSearchTerm('');
      setShowDropdown(false);
      setHighlightedIndex(-1);
    }
  };

  const handleRemoveCity = (cityName: string) => {
    setLocalSelected(localSelected.filter(c => c !== cityName));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || filteredCities.length === 0) {
      if (e.key === 'Backspace' && !searchTerm && localSelected.length > 0) {
        // Remove last chip
        handleRemoveCity(localSelected[localSelected.length - 1]);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < filteredCities.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredCities.length) {
          handleAddCity(filteredCities[highlightedIndex].name);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleApply = () => {
    onApply(localSelected);
  };

  const handleClearAll = () => {
    setLocalSelected([]);
    onClear();
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownRef.current) {
      const highlightedElement = dropdownRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          {t('filter.location')}
        </label>
        
        {/* Selected cities chips */}
        {localSelected.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {localSelected.map(city => (
              <Badge
                key={city}
                variant="secondary"
                className="pl-3 pr-2 py-1.5 text-sm"
              >
                <MapPin className="w-3 h-3 mr-1" />
                {city}
                <button
                  onClick={() => handleRemoveCity(city)}
                  className="ml-2 hover:bg-muted rounded-full p-0.5 transition-colors"
                  aria-label={t('filter.remove_city').replace('{city}', city)}
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Search input */}
        <div className="relative">
          <Input
            ref={searchInputRef}
            type="text"
            placeholder={t('filter.search_cities')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (searchTerm && filteredCities.length > 0) {
                setShowDropdown(true);
              }
            }}
            disabled={isMaxReached}
            className="bg-secondary border-border text-foreground"
            aria-describedby="city-search-help"
            aria-autocomplete="list"
            aria-controls="city-dropdown"
            aria-expanded={showDropdown}
          />

          {/* Dropdown */}
          {showDropdown && filteredCities.length > 0 && (
            <div
              id="city-dropdown"
              ref={dropdownRef}
              className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto"
              role="listbox"
            >
              {filteredCities.map((city, index) => {
                const isSelected = localSelected.includes(city.name);
                const isDisabled = isMaxReached && !isSelected;
                const isHighlighted = index === highlightedIndex;

                return (
                  <button
                    key={city.slug}
                    onClick={() => !isDisabled && handleAddCity(city.name)}
                    disabled={isDisabled}
                    className={`w-full px-4 py-2.5 text-left flex items-center justify-between transition-colors ${
                      isHighlighted ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'
                    } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${
                      isSelected ? 'bg-secondary' : ''
                    }`}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={isDisabled}
                  >
                    <div>
                      <div className="font-medium text-foreground">{city.name}</div>
                      <div className="text-xs text-muted-foreground">{city.state}</div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-primary" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Helper text */}
        <p id="city-search-help" className="text-xs text-muted-foreground mt-2">
          {isMaxReached
            ? t('filter.max_cities_reached')
            : t('filter.city_helper')}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 pt-2">
        <Button
          onClick={handleClearAll}
          variant="outline"
          className="flex-1"
          disabled={localSelected.length === 0}
        >
          {t('search.clear')}
        </Button>
        <Button
          onClick={handleApply}
          className="flex-1 bg-primary hover:bg-primary/90"
        >
          {t('search.apply_filters')}
        </Button>
      </div>
    </div>
  );
}

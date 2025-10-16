import { useState, useMemo, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { PillChip } from '@/components/PillChip';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface SpecialtyCount {
  specialty: string;
  count: number;
}

interface SpecialtyFilterProps {
  selected: string[];
  onToggle: (specialty: string) => void;
  onReset: () => void;
  currentFilters: {
    cities: string[];
    facilities: string[];
    contracts: string[];
    posted?: string;
  };
}

const SYNONYM_MAP: Record<string, string> = {
  'ICU': 'Intensivpflege',
  'OP': 'OP/Anästhesie',
  'Anästhesie': 'OP/Anästhesie',
  'Innere': 'Internistik',
  'Geronto': 'Gerontopsychiatrie',
  'Homecare': 'Häusliche Pflege',
};

const SPECIALTY_GROUPS = {
  'Stationär': [
    'Intensivpflege',
    'OP/Anästhesie',
    'Chirurgie',
    'Internistik',
    'Kardiologie',
    'Neurologie',
    'Pädiatrie',
    'Geriatrie',
    'Notaufnahme',
    'Dialyse',
    'Onkologie'
  ],
  'Ambulant / 1:1': [
    '1:1',
    'Ambulant',
    'Wundmanagement',
    'Palliativ (SAPV)',
    'Häusliche Pflege',
    'Reha'
  ],
  'Spezial / Weitere': [
    'Beatmung',
    'Endoskopie',
    'Radiologie',
    'Orthopädie',
    'Psychiatrie',
    'Gerontopsychiatrie',
    'Demenz',
    'Leitung/Management',
    'Ausbildung/Praktikum',
    'Flexibel'
  ]
};

export function normalizeSpecialty(specialty: string): string {
  return SYNONYM_MAP[specialty] || specialty;
}

export function SpecialtyFilter({ selected, onToggle, onReset, currentFilters }: SpecialtyFilterProps) {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [counts, setCounts] = useState<SpecialtyCount[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch job counts per specialty
  useEffect(() => {
    const fetchCounts = async () => {
      setLoading(true);
      let query = supabase
        .from('jobs')
        .select('tags')
        .eq('approved', true);

      // Apply current filters (excluding specialties)
      if (currentFilters.cities.length > 0) {
        query = query.in('city', currentFilters.cities);
      }
      if (currentFilters.facilities.length > 0) {
        query = query.in('facility_type', currentFilters.facilities as any);
      }
      if (currentFilters.contracts.length > 0) {
        query = query.in('contract_type', currentFilters.contracts as any);
      }
      if (currentFilters.posted) {
        const daysAgo = currentFilters.posted === '24h' ? 1 : currentFilters.posted === '7d' ? 7 : 30;
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        query = query.gte('posted_at', date.toISOString());
      }

      const { data } = await query;
      
      if (data) {
        const countMap: Record<string, number> = {};
        data.forEach(job => {
          (job.tags || []).forEach(tag => {
            const normalized = normalizeSpecialty(tag);
            countMap[normalized] = (countMap[normalized] || 0) + 1;
          });
        });

        const countsArray = Object.entries(countMap).map(([specialty, count]) => ({
          specialty,
          count
        }));
        
        setCounts(countsArray);
      }
      setLoading(false);
    };

    fetchCounts();
  }, [currentFilters]);

  // Get top 8 specialties by count
  const topSpecialties = useMemo(() => {
    return [...counts]
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
      .map(s => s.specialty);
  }, [counts]);

  // Get count for a specialty
  const getCount = (specialty: string) => {
    return counts.find(c => c.specialty === specialty)?.count || 0;
  };

  // All specialties from groups
  const allSpecialties = useMemo(() => {
    const grouped = Object.values(SPECIALTY_GROUPS).flat();
    const fromData = counts.map(c => c.specialty);
    return Array.from(new Set([...grouped, ...fromData]));
  }, [counts]);

  // Filtered specialties based on search
  const filteredSpecialties = useMemo(() => {
    if (!search) return allSpecialties;
    const searchLower = search.toLowerCase();
    return allSpecialties.filter(s => 
      s.toLowerCase().includes(searchLower)
    );
  }, [allSpecialties, search]);

  // Selected pills
  const selectedPills = useMemo(() => {
    return selected.map(s => ({
      specialty: s,
      count: getCount(s)
    }));
  }, [selected, counts]);

  // Visible pills (top 8 or all if expanded/searching)
  const visibleSpecialties = useMemo(() => {
    if (search || expanded) {
      return filteredSpecialties;
    }
    return topSpecialties;
  }, [search, expanded, filteredSpecialties, topSpecialties]);

  const remainingCount = allSpecialties.length - topSpecialties.length;

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold">Fachbereich</h3>
        {selected.length > 0 && (
          <button
            onClick={onReset}
            className="text-[#0080FF] hover:underline text-xs font-medium"
          >
            Zurücksetzen
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
        <Input
          placeholder="Fachbereich suchen…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-[#1A1A1B] border-[#2A2A2B] text-white placeholder:text-[#666] pl-10"
        />
      </div>

      {/* Selected Pills (floating at top) */}
      {selectedPills.length > 0 && (
        <div className="mb-3 pb-3 border-b border-[#242424]">
          <p className="text-xs text-[#999] mb-2">Ausgewählt ({selected.length})</p>
          <div className="flex flex-wrap gap-2">
            {selectedPills.map(({ specialty, count }) => (
              <button
                key={specialty}
                onClick={() => onToggle(specialty)}
                className={cn(
                  "px-3.5 py-2.5 rounded-full text-sm font-semibold transition-all duration-150",
                  "bg-[#E50914] text-white border-0 flex items-center gap-1.5",
                  "hover:bg-[#CC0812] active:scale-[1.03]"
                )}
              >
                <Check className="w-3.5 h-3.5" />
                {specialty}
                <span className="ml-1 text-xs opacity-80">({count})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Specialty Pills */}
      <div className="space-y-4">
        {!search && !expanded && (
          <div>
            <p className="text-xs text-[#999] mb-2">Top (Empfohlen)</p>
            <div className="flex flex-wrap gap-2">
              {visibleSpecialties.map(specialty => {
                const count = getCount(specialty);
                const isSelected = selected.includes(specialty);
                return (
                  <button
                    key={specialty}
                    onClick={() => onToggle(specialty)}
                    disabled={count === 0}
                    className={cn(
                      "px-3.5 py-2.5 rounded-full text-sm font-semibold transition-all duration-150",
                      "focus:outline-none focus:ring-2 focus:ring-[#E50914] focus:ring-offset-2 focus:ring-offset-[#0F0F10]",
                      "active:scale-[1.03] flex items-center gap-1.5",
                      isSelected
                        ? "bg-[#E50914] text-white border-0"
                        : "bg-[#1A1A1B] border border-[#2A2A2B] text-[#EDEDED] hover:bg-[#242424]",
                      count === 0 && "opacity-40 cursor-not-allowed"
                    )}
                  >
                    {specialty}
                    <span className={cn(
                      "text-xs",
                      isSelected ? "opacity-80" : "text-[#999]"
                    )}>
                      ({count})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Expanded view with groups */}
        {(search || expanded) && (
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {Object.entries(SPECIALTY_GROUPS).map(([groupName, specialties]) => {
              const groupFiltered = specialties.filter(s => 
                !search || filteredSpecialties.includes(s)
              );
              
              if (groupFiltered.length === 0) return null;

              return (
                <div key={groupName}>
                  <p className="text-xs text-[#999] mb-2">{groupName}</p>
                  <div className="flex flex-wrap gap-2">
                    {groupFiltered.map(specialty => {
                      const count = getCount(specialty);
                      const isSelected = selected.includes(specialty);
                      return (
                        <button
                          key={specialty}
                          onClick={() => onToggle(specialty)}
                          disabled={count === 0}
                          className={cn(
                            "px-3.5 py-2.5 rounded-full text-sm font-semibold transition-all duration-150",
                            "focus:outline-none focus:ring-2 focus:ring-[#E50914] focus:ring-offset-2 focus:ring-offset-[#0F0F10]",
                            "active:scale-[1.03] flex items-center gap-1.5",
                            isSelected
                              ? "bg-[#E50914] text-white border-0"
                              : "bg-[#1A1A1B] border border-[#2A2A2B] text-[#EDEDED] hover:bg-[#242424]",
                            count === 0 && "opacity-40 cursor-not-allowed"
                          )}
                        >
                          {specialty}
                          <span className={cn(
                            "text-xs",
                            isSelected ? "opacity-80" : "text-[#999]"
                          )}>
                            ({count})
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Other specialties not in groups */}
            {(() => {
              const grouped = Object.values(SPECIALTY_GROUPS).flat();
              const others = filteredSpecialties.filter(s => !grouped.includes(s));
              if (others.length === 0) return null;
              
              return (
                <div>
                  <p className="text-xs text-[#999] mb-2">Weitere</p>
                  <div className="flex flex-wrap gap-2">
                    {others.map(specialty => {
                      const count = getCount(specialty);
                      const isSelected = selected.includes(specialty);
                      return (
                        <button
                          key={specialty}
                          onClick={() => onToggle(specialty)}
                          disabled={count === 0}
                          className={cn(
                            "px-3.5 py-2.5 rounded-full text-sm font-semibold transition-all duration-150",
                            "focus:outline-none focus:ring-2 focus:ring-[#E50914] focus:ring-offset-2 focus:ring-offset-[#0F0F10]",
                            "active:scale-[1.03] flex items-center gap-1.5",
                            isSelected
                              ? "bg-[#E50914] text-white border-0"
                              : "bg-[#1A1A1B] border border-[#2A2A2B] text-[#EDEDED] hover:bg-[#242424]",
                            count === 0 && "opacity-40 cursor-not-allowed"
                          )}
                        >
                          {specialty}
                          <span className={cn(
                            "text-xs",
                            isSelected ? "opacity-80" : "text-[#999]"
                          )}>
                            ({count})
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Show More/Less Toggle */}
        {!search && remainingCount > 0 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-[#0080FF] hover:underline text-sm font-medium"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Weniger anzeigen
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Mehr anzeigen ({remainingCount})
              </>
            )}
          </button>
        )}

        {/* No results */}
        {search && filteredSpecialties.length === 0 && (
          <p className="text-sm text-[#666] text-center py-4">
            Keine Fachbereiche gefunden
          </p>
        )}
      </div>
    </section>
  );
}

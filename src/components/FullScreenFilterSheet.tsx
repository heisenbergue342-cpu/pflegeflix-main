import { useState, useEffect, useMemo, useRef } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PillChip } from '@/components/PillChip';
import { SpecialtyFilter } from '@/components/SpecialtyFilter';
import { Slider } from '@/components/ui/slider';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { germanCities, City } from '@/data/cities_de';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface FilterState {
  cities: string[];
  radius?: number;
  facilities: string[];
  contracts: string[];
  posted?: string;
  specialties: string[];
  salaryMin?: number;
  salaryMax?: number;
  shiftTypes: string[];
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: FilterState;
  onApplyFilters: (filters: FilterState) => void;
}

export function FullScreenFilterSheet({ open, onOpenChange, filters, onApplyFilters }: Props) {
  const { t } = useLanguage();
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);
  const [citySearch, setCitySearch] = useState('');
  const [jobCount, setJobCount] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef<number>(0);
  const focusTrapRef = useFocusTrap(open);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Restore scroll position when reopening
  useEffect(() => {
    if (open && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollPositionRef.current;
    }
  }, [open]);

  // Save scroll position before closing
  const handleClose = () => {
    if (scrollContainerRef.current) {
      scrollPositionRef.current = scrollContainerRef.current.scrollTop;
    }
    onOpenChange(false);
  };

  // Calculate job count based on current filters
  useEffect(() => {
    const fetchCount = async () => {
      let query = supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('approved', true);

      if (localFilters.cities.length > 0) {
        query = query.in('city', localFilters.cities);
      }
      if (localFilters.facilities.length > 0) {
        query = query.in('facility_type', localFilters.facilities as any);
      }
      if (localFilters.contracts.length > 0) {
        query = query.in('contract_type', localFilters.contracts as any);
      }
      if (localFilters.specialties.length > 0) {
        query = query.overlaps('tags', localFilters.specialties);
      }
      if (localFilters.posted) {
        const daysAgo = localFilters.posted === '24h' ? 1 : localFilters.posted === '7d' ? 7 : 30;
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        query = query.gte('posted_at', date.toISOString());
      }
      if (localFilters.salaryMin !== undefined) {
        query = query.gte('salary_min', localFilters.salaryMin);
      }
      if (localFilters.salaryMax !== undefined) {
        query = query.lte('salary_max', localFilters.salaryMax);
      }
      if (localFilters.shiftTypes.length > 0) {
        query = query.in('shift_type', localFilters.shiftTypes);
      }

      const { count } = await query;
      setJobCount(count || 0);
    };
    fetchCount();
  }, [localFilters]);

  const filteredCities = useMemo(() => {
    if (!citySearch) return [];
    return germanCities
      .filter(city => 
        city.name.toLowerCase().includes(citySearch.toLowerCase()) &&
        !localFilters.cities.includes(city.name)
      )
      .slice(0, 8);
  }, [citySearch, localFilters.cities]);

  const handleReset = () => {
    setLocalFilters({
      cities: [],
      radius: undefined,
      facilities: [],
      contracts: [],
      specialties: [],
      salaryMin: undefined,
      salaryMax: undefined,
      shiftTypes: [],
    });
    setCitySearch('');
  };

  const handleApply = () => {
    if (scrollContainerRef.current) {
      scrollPositionRef.current = scrollContainerRef.current.scrollTop;
    }
    onApplyFilters(localFilters);
    onOpenChange(false);
  };

  const toggleArrayFilter = (key: keyof FilterState, value: string) => {
    setLocalFilters(prev => {
      const current = prev[key] as string[];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [key]: updated };
    });
  };

  const addCity = (city: string) => {
    if (localFilters.cities.length < 3) {
      setLocalFilters(prev => ({
        ...prev,
        cities: [...prev.cities, city]
      }));
      setCitySearch('');
    }
  };

  const removeCity = (city: string) => {
    setLocalFilters(prev => {
      const newCities = prev.cities.filter(c => c !== city);
      return {
        ...prev,
        cities: newCities,
        // Clear radius when no cities remain
        radius: newCities.length === 0 ? undefined : prev.radius
      };
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent 
        ref={focusTrapRef as any}
        className="max-w-full h-full m-0 p-0 bg-[#0F0F10] text-white border-0 gap-0"
        style={{ animation: 'slide-in-from-bottom 220ms ease-out' }}
        role="dialog"
        aria-labelledby="filter-sheet-title"
        aria-modal="true"
      >
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-[#242424]">
          <div className="flex items-center justify-between">
            <button
              onClick={handleClose}
              className="p-2 hover:bg-[#1A1A1B] rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F0F10]"
              aria-label={t('filter.close_menu')}
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
            <DialogTitle id="filter-sheet-title" className="text-xl font-bold absolute left-1/2 -translate-x-1/2">
              {t('search.title')}
            </DialogTitle>
            <button
              onClick={handleReset}
              className="text-[#0080FF] hover:underline text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F0F10]"
              aria-label={t('search.reset_all_filters')}
            >
              {t('search.reset_filters')}
            </button>
          </div>
        </DialogHeader>

        {/* Scrollable Content */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto pb-20"
          role="region"
          aria-label={t('search.filter_options')}
        >
          <div className="p-6 space-y-8">
            {/* Standort */}
            <section aria-labelledby="location-heading">
              <h3 id="location-heading" className="text-lg font-bold mb-3">{t('search.location')}</h3>
              <div className="space-y-3">
                <Input
                  placeholder={t('search.search_cities')}
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  className="bg-[#1A1A1B] border-[#2A2A2B] text-white placeholder:text-[#666]"
                  aria-label={t('search.search_cities')}
                />
                {localFilters.cities.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {localFilters.cities.map(city => (
                      <PillChip
                        key={city}
                        label={city}
                        selected
                        onClick={() => removeCity(city)}
                      />
                    ))}
                  </div>
                )}
                {filteredCities.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {filteredCities.map(city => (
                      <PillChip
                        key={city.name}
                        label={city.name}
                        onClick={() => addCity(city.name)}
                        disabled={localFilters.cities.length >= 3}
                      />
                    ))}
                  </div>
                )}
                <p className="text-xs text-[#666]">{t('search.city_helper')}</p>
                
                {/* Radius */}
                {localFilters.cities.length > 0 && (
                  <div className="pt-2">
                    <p className="text-sm mb-2 text-[#999]">
                      {t('search.radius_around', { city: localFilters.cities[0] })}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {[10, 25, 50].map(km => (
                        <PillChip
                          key={km}
                          label={`${km} km`}
                          selected={localFilters.radius === km}
                          onClick={() => setLocalFilters(prev => ({ ...prev, radius: km }))}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Einrichtung */}
            <section aria-labelledby="facility-heading">
              <h3 id="facility-heading" className="text-lg font-bold mb-3">{t('job.field.facility_type')}</h3>
              <div className="flex flex-wrap gap-3">
                <PillChip
                  label={t('category.clinics')}
                  selected={localFilters.facilities.includes('Klinik')}
                  onClick={() => toggleArrayFilter('facilities', 'Klinik')}
                />
                <PillChip
                  label={t('category.hospitals')}
                  selected={localFilters.facilities.includes('Krankenhaus')}
                  onClick={() => toggleArrayFilter('facilities', 'Krankenhaus')}
                />
                <PillChip
                  label={t('category.nursing_homes')}
                  selected={localFilters.facilities.includes('Altenheim')}
                  onClick={() => toggleArrayFilter('facilities', 'Altenheim')}
                />
                <PillChip
                  label={t('category.intensive_care')}
                  selected={localFilters.facilities.includes('1zu1')}
                  onClick={() => toggleArrayFilter('facilities', '1zu1')}
                />
                <PillChip
                  label={t('category.outpatient')}
                  selected={localFilters.facilities.includes('Ambulante Pflege')}
                  onClick={() => toggleArrayFilter('facilities', 'Ambulante Pflege')}
                />
              </div>
            </section>

            {/* Vertragstyp */}
            <section aria-labelledby="contract-heading">
              <h3 id="contract-heading" className="text-lg font-bold mb-3">{t('job.field.contract_type')}</h3>
              <div className="flex flex-wrap gap-3">
                {['Vollzeit', 'Teilzeit', 'Minijob'].map(type => (
                  <PillChip
                    key={type}
                    label={t(`contract.${type}`)}
                    selected={localFilters.contracts.includes(type)}
                    onClick={() => toggleArrayFilter('contracts', type)}
                  />
                ))}
              </div>
            </section>

            {/* Veröffentlichung */}
            <section aria-labelledby="posted-heading">
              <h3 id="posted-heading" className="text-lg font-bold mb-3">{t('search.posted_label')}</h3>
              <div className="flex flex-wrap gap-3">
                {[
                  { value: '24h', label: t('search.posted_options.24h') },
                  { value: '7d', label: t('search.posted_options.7d') },
                  { value: '30d', label: t('search.posted_options.30d') }
                ].map(({ value, label }) => (
                  <PillChip
                    key={value}
                    label={label}
                    selected={localFilters.posted === value}
                    onClick={() => setLocalFilters(prev => ({ ...prev, posted: value }))}
                  />
                ))}
              </div>
            </section>

            {/* Schichttyp */}
            <section aria-labelledby="shift-heading">
              <h3 id="shift-heading" className="text-lg font-bold mb-3">{t('job.field.shift_type')}</h3>
              <div className="flex flex-wrap gap-3">
                {['Tagschicht', 'Nachtschicht', 'Wechselschicht', 'Bereitschaftsdienst'].map(type => (
                  <PillChip
                    key={type}
                    label={t(`shift_type.${type.toLowerCase().replace(/\s/g, '_')}`)}
                    selected={localFilters.shiftTypes.includes(type)}
                    onClick={() => toggleArrayFilter('shiftTypes', type)}
                  />
                ))}
              </div>
            </section>

            {/* Gehalt */}
            <section aria-labelledby="salary-heading">
              <h3 id="salary-heading" className="text-lg font-bold mb-3">{t('salary_planner.estimation_title')}</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="salary-min" className="text-sm text-[#999] mb-2 block">
                    {t('search.min_salary_label')}: {localFilters.salaryMin ? `${localFilters.salaryMin}€/${t('job.field.month')}` : t('search.no_info')}
                  </label>
                  <Slider
                    id="salary-min"
                    min={1500}
                    max={6000}
                    step={100}
                    value={[localFilters.salaryMin || 1500]}
                    onValueChange={([value]) => setLocalFilters(prev => ({ ...prev, salaryMin: value === 1500 ? undefined : value }))}
                    className="w-full"
                    aria-label={t('search.min_salary_label')}
                  />
                </div>
                <div>
                  <label htmlFor="salary-max" className="text-sm text-[#999] mb-2 block">
                    {t('search.max_salary_label')}: {localFilters.salaryMax ? `${localFilters.salaryMax}€/${t('job.field.month')}` : t('search.no_info')}
                  </label>
                  <Slider
                    id="salary-max"
                    min={1500}
                    max={6000}
                    step={100}
                    value={[localFilters.salaryMax || 6000]}
                    onValueChange={([value]) => setLocalFilters(prev => ({ ...prev, salaryMax: value === 6000 ? undefined : value }))}
                    className="w-full"
                    aria-label={t('search.max_salary_label')}
                  />
                </div>
              </div>
            </section>

            {/* Fachbereich */}
            <SpecialtyFilter
              selected={localFilters.specialties}
              onToggle={(specialty) => toggleArrayFilter('specialties', specialty)}
              onReset={() => setLocalFilters(prev => ({ ...prev, specialties: [] }))}
              currentFilters={{
                cities: localFilters.cities,
                facilities: localFilters.facilities,
                contracts: localFilters.contracts,
                posted: localFilters.posted
              }}
            />
          </div>
        </div>

        {/* Sticky Bottom Bar */}
        <button
          onClick={handleApply}
          disabled={jobCount === 0}
          className="fixed bottom-0 left-0 right-0 h-16 flex items-center justify-center font-bold text-base shadow-[0_-2px_8px_rgba(0,0,0,0.3)] pb-safe transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#E50914] disabled:pointer-events-none disabled:opacity-50"
          style={{
            backgroundColor: jobCount === 0 ? '#2A2A2A' : '#E50914',
            color: jobCount === 0 ? '#888' : '#fff',
          }}
          onMouseEnter={(e) => {
            if (jobCount > 0) {
              e.currentTarget.style.backgroundColor = '#F40612';
            }
          }}
          onMouseLeave={(e) => {
            if (jobCount > 0) {
              e.currentTarget.style.backgroundColor = '#E50914';
            }
          }}
          onMouseDown={(e) => {
            if (jobCount > 0) {
              e.currentTarget.style.backgroundColor = '#B20710';
            }
          }}
          onMouseUp={(e) => {
            if (jobCount > 0) {
              e.currentTarget.style.backgroundColor = '#F40612';
            }
          }}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && jobCount > 0) {
              e.preventDefault();
              handleApply();
            }
          }}
          aria-label={t('search.show_results', { count: jobCount })}
          aria-live="polite"
        >
          {t('search.show_results', { count: jobCount })}
        </button>
      </DialogContent>
    </Dialog>
  );
}
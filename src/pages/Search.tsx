import { useEffect, useState, useRef, useMemo } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon, Filter, X, FileSearch, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import JobCard from '@/components/JobCard';
import { FullScreenFilterSheet } from '@/components/FullScreenFilterSheet';
import EmptyState from '@/components/EmptyState';
import SEO from '@/components/SEO';
import { BreadcrumbStructuredData } from '@/components/StructuredData';
import { SaveSearchDialog } from '@/components/SaveSearchDialog';
import { PostedFilterToggle } from '@/components/PostedFilterToggle';

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

export default function Search() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [saveSearchOpen, setSaveSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef<number>(0);
  const [filters, setFilters] = useState<FilterState>({
    cities: [],
    radius: undefined,
    facilities: [],
    contracts: [],
    posted: undefined,
    specialties: [],
    salaryMin: undefined,
    salaryMax: undefined,
    shiftTypes: [],
  });

  // Auto-focus search input when navigating from Suche button
  useEffect(() => {
    if (location.state?.autoFocus && searchInputRef.current) {
      // Immediate focus without delay for iOS Safari gesture context
      const focusInput = () => {
        searchInputRef.current?.focus();
        // Force keyboard on iOS by triggering click
        searchInputRef.current?.click();
      };
      
      // Try immediate focus first
      focusInput();
      
      // Fallback with minimal delay for Android/other browsers
      setTimeout(focusInput, 100);
    }
  }, [location.state]);

  // Initialize from URL params and redirect near=true
  useEffect(() => {
    // Redirect near=true to clean /search
    if (searchParams.get('near') === 'true') {
      setSearchParams(new URLSearchParams());
      return;
    }

    const newFilters: FilterState = {
      cities: searchParams.get('cities')?.split(',').filter(Boolean) || [],
      radius: searchParams.get('radius') ? parseInt(searchParams.get('radius')!) : undefined,
      facilities: searchParams.get('facilities')?.split(',').filter(Boolean) || [],
      contracts: searchParams.get('contracts')?.split(',').filter(Boolean) || [],
      posted: searchParams.get('posted') || undefined,
      specialties: searchParams.get('specialties')?.split(',').filter(Boolean) || [],
      salaryMin: searchParams.get('salaryMin') ? parseInt(searchParams.get('salaryMin')!) : undefined,
      salaryMax: searchParams.get('salaryMax') ? parseInt(searchParams.get('salaryMax')!) : undefined,
      shiftTypes: searchParams.get('shiftTypes')?.split(',').filter(Boolean) || [],
    };
    setFilters(newFilters);
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    fetchJobs();
  }, [searchQuery, filters]);

  const fetchJobs = async () => {
    let query = supabase
      .from('jobs')
      .select('*')
      .eq('approved', true)
      .order('boosted_at', { ascending: false, nullsFirst: false })
      .order('posted_at', { ascending: false });

    // Special handling: 'Ambulante Pflege' filters by tag instead of facility_type
    const includesOutpatient = filters.facilities.includes('Ambulante Pflege');
    const facilityTypes = filters.facilities.filter(f => f !== 'Ambulante Pflege');

    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    }

    if (filters.cities.length > 0) {
      query = query.in('city', filters.cities);
    }
    if (facilityTypes.length > 0) {
      query = query.in('facility_type', facilityTypes as any);
    }
    if (includesOutpatient) {
      query = query.contains('tags', ['Ambulante Pflege']);
    }
    if (filters.contracts.length > 0) {
      query = query.in('contract_type', filters.contracts as any);
    }
    if (filters.specialties.length > 0) {
      query = query.overlaps('tags', filters.specialties);
    }
    if (filters.posted) {
      const daysAgo = filters.posted === '24h' ? 1 : filters.posted === '7d' ? 7 : 30;
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      query = query.gte('posted_at', date.toISOString());
    }
    if (filters.salaryMin !== undefined) {
      query = query.gte('salary_min', filters.salaryMin);
    }
    if (filters.salaryMax !== undefined) {
      query = query.lte('salary_max', filters.salaryMax);
    }
    if (filters.shiftTypes.length > 0) {
      query = query.in('shift_type', filters.shiftTypes);
    }

    const { data } = await query;
    setJobs(data || []);
  };

  // Save scroll position before opening filter
  const handleOpenFilter = () => {
    scrollPositionRef.current = window.scrollY;
    setIsFilterOpen(true);
  };

  // Restore scroll position when closing filter
  const handleCloseFilter = (open: boolean) => {
    setIsFilterOpen(open);
    if (!open) {
      requestAnimationFrame(() => {
        window.scrollTo({ top: scrollPositionRef.current, behavior: 'instant' as ScrollBehavior });
      });
    }
  };

  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
    
    // Update URL params
    const params = new URLSearchParams();
    if (newFilters.cities.length > 0) params.set('cities', newFilters.cities.join(','));
    if (newFilters.radius) params.set('radius', newFilters.radius.toString());
    if (newFilters.facilities.length > 0) params.set('facilities', newFilters.facilities.join(','));
    if (newFilters.contracts.length > 0) params.set('contracts', newFilters.contracts.join(','));
    if (newFilters.posted) params.set('posted', newFilters.posted);
    if (newFilters.specialties.length > 0) params.set('specialties', newFilters.specialties.join(','));
    if (newFilters.salaryMin) params.set('salaryMin', newFilters.salaryMin.toString());
    if (newFilters.salaryMax) params.set('salaryMax', newFilters.salaryMax.toString());
    if (newFilters.shiftTypes.length > 0) params.set('shiftTypes', newFilters.shiftTypes.join(','));
    
    setSearchParams(params);
    
    // Track analytics event (consent-aware)
    import('@/hooks/useAnalytics').then(({ trackAnalyticsEvent }) => {
      const payload: any = { activeFilters: activeFilterCount + 0 };
      if (newFilters.facilities.includes('Ambulante Pflege')) {
        payload.category = 'ambulant';
      }
      trackAnalyticsEvent('filter_applied', payload);
    });
    
    // Restore scroll position after applying filters
    requestAnimationFrame(() => {
      window.scrollTo({ top: scrollPositionRef.current, behavior: 'instant' as ScrollBehavior });
    });
  };

  const removeFilter = (key: keyof FilterState, value?: string) => {
    const newFilters = { ...filters };
    if (Array.isArray(newFilters[key]) && value) {
      (newFilters[key] as string[]) = (newFilters[key] as string[]).filter(v => v !== value);
    } else if (typeof newFilters[key] === 'boolean') {
      (newFilters[key] as boolean) = false;
    } else {
      delete newFilters[key];
    }
    handleApplyFilters(newFilters);
  };

  const activeFilterCount = 
    filters.cities.length +
    filters.facilities.length +
    filters.contracts.length +
    filters.specialties.length +
    filters.shiftTypes.length +
    (filters.posted ? 1 : 0) +
    (filters.salaryMin ? 1 : 0) +
    (filters.salaryMax ? 1 : 0);

  // Generate dynamic SEO title and description
  const seoTitle = useMemo(() => {
    const parts = [];
    if (searchQuery) parts.push(searchQuery);
    if (filters.cities.length > 0) parts.push(filters.cities.join(', '));
    if (filters.specialties.length > 0) parts.push(filters.specialties.join(', '));
    return parts.length > 0 ? `${parts.join(' - ')} ${t('search.jobs_find')}` : t('search.title');
  }, [searchQuery, filters, t]);

  const seoDescription = useMemo(() => {
    let desc = t('search.description_base');
    if (filters.cities.length > 0) desc += ` ${t('search.location')} ${filters.cities.join(', ')}`;
    if (filters.specialties.length > 0) desc += ` ${t('job.field.specialties')} ${filters.specialties.join(', ')}`;
    desc += `. ${t('hero.subtitle')}`;
    return desc;
  }, [filters, t]);

  const seoNoindex = useMemo(() => {
    return activeFilterCount > 0 || !!searchQuery;
  }, [activeFilterCount, searchQuery]);

  return (
    <div className="min-h-screen bg-netflix-bg">
      <SEO 
        title={seoTitle}
        description={seoDescription}
        canonical="/search"
        noindex={seoNoindex}
      />
      <BreadcrumbStructuredData 
        items={[
          { name: t('nav.home'), url: window.location.origin },
          { name: t('nav.search'), url: window.location.href }
        ]} 
      />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="sr-only">{seoTitle}</h1>
        <div className="mb-6 flex gap-3">
          {/* Search input */}
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-netflix-text-muted" aria-hidden="true" />
            <Input
              ref={searchInputRef}
              type="search"
              placeholder={t('search.placeholder')}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-netflix-card border-netflix-card text-white"
              aria-label={t('search.placeholder')}
              enterKeyHint="search"
            />
          </div>

          {/* Filter button */}
          <Button
            variant="outline"
            onClick={handleOpenFilter}
            className="flex items-center gap-2 bg-secondary border-border hover:bg-secondary/80"
            aria-label={`${t('search.filters')} ${activeFilterCount > 0 ? `(${activeFilterCount} ${t('search.active_filters')})` : ''}`}
          >
            <Filter className="w-4 h-4" aria-hidden="true" />
            {t('search.filters')}
            {activeFilterCount > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-primary text-primary-foreground rounded-full text-xs">
                {activeFilterCount}
              </span>
            )}
          </Button>

          {/* Save Search Button */}
          {user && activeFilterCount > 0 && (
            <Button
              variant="outline"
              onClick={() => setSaveSearchOpen(true)}
              className="flex items-center gap-2"
              aria-label={t('saved_searches.save_current')}
            >
              <Bookmark className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">{t('saved_searches.save_current')}</span>
            </Button>
          )}
        </div>

        {/* Active filters as removable pills */}
        {activeFilterCount > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {filters.facilities.map(f => (
              <Badge key={f} variant="secondary" className="gap-1 pr-1">
                {f === 'Klinik' ? t('category.clinics')
                  : f === 'Krankenhaus' ? t('category.hospitals')
                  : f === 'Altenheim' ? t('category.nursing_homes')
                  : f === '1zu1' ? t('category.intensive_care')
                  : f === 'Ambulante Pflege' ? t('category.outpatient')
                  : f}
                <button
                  onClick={() => removeFilter('facilities', f)}
                  className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                  aria-label={t('search.remove_filter', { filter: f === 'Klinik' ? t('category.clinics') : f === 'Krankenhaus' ? t('category.hospitals') : f })}
                >
                  <X className="w-3 h-3" aria-hidden="true" />
                </button>
              </Badge>
            ))}
            {filters.cities.map(city => (
              <Badge key={city} variant="secondary" className="gap-1 pr-1">
                {city}
                <button onClick={() => removeFilter('cities', city)} className="ml-1 hover:bg-primary/20 rounded-full p-0.5" aria-label={t('search.remove_city', { city })}>
                  <X className="w-3 h-3" aria-hidden="true" />
                </button>
              </Badge>
            ))}
            {filters.contracts.map(c => (
              <Badge key={c} variant="secondary" className="gap-1 pr-1">
                {c}
                <button onClick={() => removeFilter('contracts', c)} className="ml-1 hover:bg-primary/20 rounded-full p-0.5" aria-label={t('search.remove_filter', { filter: c })}>
                  <X className="w-3 h-3" aria-hidden="true" />
                </button>
              </Badge>
            ))}
            {filters.specialties.map(s => (
              <Badge key={s} variant="secondary" className="gap-1 pr-1">
                {s}
                <button onClick={() => removeFilter('specialties', s)} className="ml-1 hover:bg-primary/20 rounded-full p-0.5" aria-label={t('search.remove_filter', { filter: s })}>
                  <X className="w-3 h-3" aria-hidden="true" />
                </button>
              </Badge>
            ))}
            {filters.shiftTypes.map(st => (
              <Badge key={st} variant="secondary" className="gap-1 pr-1">
                {st}
                <button onClick={() => removeFilter('shiftTypes', st)} className="ml-1 hover:bg-primary/20 rounded-full p-0.5" aria-label={t('search.remove_filter', { filter: st })}>
                  <X className="w-3 h-3" aria-hidden="true" />
                </button>
              </Badge>
            ))}
            {filters.salaryMin && (
              <Badge variant="secondary" className="gap-1 pr-1">
                {t('search.min_salary', { value: filters.salaryMin })}
                <button onClick={() => removeFilter('salaryMin')} className="ml-1 hover:bg-primary/20 rounded-full p-0.5" aria-label={t('search.remove_filter', { filter: t('search.min_salary_label') })}>
                  <X className="w-3 h-3" aria-hidden="true" />
                </button>
              </Badge>
            )}
            {filters.salaryMax && (
              <Badge variant="secondary" className="gap-1 pr-1">
                {t('search.max_salary', { value: filters.salaryMax })}
                <button onClick={() => removeFilter('salaryMax')} className="ml-1 hover:bg-primary/20 rounded-full p-0.5" aria-label={t('search.remove_filter', { filter: t('search.max_salary_label') })}>
                  <X className="w-3 h-3" aria-hidden="true" />
                </button>
              </Badge>
            )}
            {filters.posted && (
              <Badge variant="secondary" className="gap-1 pr-1">
                {t(`search.posted_options.${filters.posted}`)}
                <button onClick={() => removeFilter('posted')} className="ml-1 hover:bg-primary/20 rounded-full p-0.5" aria-label={t('search.remove_filter', { filter: t('search.posted_label') })}>
                  <X className="w-3 h-3" aria-hidden="true" />
                </button>
              </Badge>
            )}
          </div>
        )}

        <div 
          ref={mainContentRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          role="region"
          aria-label={t('search.results_region_label')}
        >
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>

        {jobs.length === 0 && (
          <div className="max-w-2xl mx-auto mt-12">
            <EmptyState
              icon={FileSearch}
              title={activeFilterCount > 0 ? t('search.no_jobs_found') : t('search.no_jobs_available')}
              description={
                activeFilterCount > 0
                  ? t('search.no_jobs_found_description')
                  : t('search.no_jobs_available_description')
              }
              action={{
                label: activeFilterCount > 0 ? t('search.reset_filters') : t('menu.home'),
                onClick: () => {
                  if (activeFilterCount > 0) {
                    setFilters({
                      cities: [],
                      radius: undefined,
                      facilities: [],
                      contracts: [],
                      posted: undefined,
                      specialties: [],
                      salaryMin: undefined,
                      salaryMax: undefined,
                      shiftTypes: [],
                    });
                    setSearchParams(new URLSearchParams());
                    setSearchQuery('');
                  } else {
                    navigate('/');
                  }
                }
              }}
            />
          </div>
        )}
      </div>

      <FullScreenFilterSheet
        open={isFilterOpen}
        onOpenChange={handleCloseFilter}
        filters={filters}
        onApplyFilters={handleApplyFilters}
      />

      <SaveSearchDialog
        open={saveSearchOpen}
        onOpenChange={setSaveSearchOpen}
        filters={filters}
      />
    </div>
  );
}

const onSearchChange = (value: string) => {
  setSearchQuery(value);
  import('@/hooks/useAnalytics').then(({ trackAnalyticsEvent }) => {
    if (value.trim().length > 0) {
      trackAnalyticsEvent('search_performed', { q: value.trim() });
    }
  });
};
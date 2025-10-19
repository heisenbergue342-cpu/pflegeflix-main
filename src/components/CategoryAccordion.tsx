import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Building2, Users, Heart, ChevronLeft, Hospital, Home as HomeIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type FacilityType = Database['public']['Enums']['facility_type'];

interface SubCategory {
  key: string;
  labelDE: string;
  labelEN: string;
  tag: string;
}

interface Category {
  key: string;
  labelDE: string;
  labelEN: string;
  descDE: string;
  descEN: string;
  icon: any;
  facility?: FacilityType;
  tagBased?: boolean;
  tagValue?: string;
  subCategories: SubCategory[];
}

const CATEGORIES: Category[] = [
  {
    key: 'clinics',
    labelDE: 'Kliniken',
    labelEN: 'Clinics',
    descDE: 'Finde Jobs in Kliniken',
    descEN: 'Find jobs in clinics',
    icon: Building2,
    facility: 'Klinik',
    subCategories: [
      { key: 'icu', labelDE: 'Intensivstation', labelEN: 'ICU', tag: 'Intensivstation' },
      { key: 'surgery', labelDE: 'OP/Anästhesie', labelEN: 'Surgery/Anesthesia', tag: 'OP' },
      { key: 'chirurgie', labelDE: 'Chirurgie', labelEN: 'Surgery', tag: 'Chirurgie' },
      { key: 'internal', labelDE: 'Internistik', labelEN: 'Internal Medicine', tag: 'Internistik' },
      { key: 'emergency', labelDE: 'Notaufnahme', labelEN: 'Emergency', tag: 'Notaufnahme' },
      { key: 'dialysis', labelDE: 'Dialyse', labelEN: 'Dialysis', tag: 'Dialyse' },
    ],
  },
  {
    key: 'hospitals',
    labelDE: 'Krankenhäuser',
    labelEN: 'Hospitals',
    descDE: 'Finde Jobs in Krankenhäusern',
    descEN: 'Find jobs in hospitals',
    icon: Hospital,
    facility: 'Krankenhaus',
    subCategories: [
      { key: 'icu_h', labelDE: 'Intensivstation', labelEN: 'ICU', tag: 'Intensivstation' },
      { key: 'surgery_h', labelDE: 'OP/Anästhesie', labelEN: 'Surgery/Anesthesia', tag: 'OP' },
      { key: 'chirurgie_h', labelDE: 'Chirurgie', labelEN: 'Surgery', tag: 'Chirurgie' },
      { key: 'internal_h', labelDE: 'Internistik', labelEN: 'Internal Medicine', tag: 'Internistik' },
      { key: 'emergency_h', labelDE: 'Notaufnahme', labelEN: 'Emergency', tag: 'Notaufnahme' },
      { key: 'dialysis_h', labelDE: 'Dialyse', labelEN: 'Dialysis', tag: 'Dialyse' },
    ],
  },
  {
    key: 'nursing_homes',
    labelDE: 'Altenheime',
    labelEN: 'Nursing Homes',
    descDE: 'Stellenangebote in Pflegeheimen',
    descEN: 'Job opportunities in care facilities',
    icon: Users,
    facility: 'Altenheim',
    subCategories: [
      { key: 'inpatient', labelDE: 'Stationär', labelEN: 'Inpatient', tag: 'Stationär' },
      { key: 'short_term', labelDE: 'Kurzzeitpflege', labelEN: 'Short-term Care', tag: 'Kurzzeitpflege' },
      { key: 'dementia', labelDE: 'Demenz', labelEN: 'Dementia', tag: 'Demenz' },
      { key: 'geronto', labelDE: 'Gerontopsychiatrie', labelEN: 'Geriatric Psychiatry', tag: 'Gerontopsychiatrie' },
      { key: 'management', labelDE: 'Leitung', labelEN: 'Management', tag: 'Leitung' },
    ],
  },
  {
    key: 'intensive',
    labelDE: '1:1 Intensivpflege',
    labelEN: '1:1 Intensive Care',
    descDE: 'Individuelle Intensivbetreuung',
    descEN: 'Individual intensive care',
    icon: Heart,
    facility: '1zu1',
    subCategories: [
      { key: 'ventilation', labelDE: 'Beatmung', labelEN: 'Ventilation', tag: 'Beatmung' },
      { key: 'homecare', labelDE: 'Homecare', labelEN: 'Homecare', tag: 'Homecare' },
      { key: 'children', labelDE: 'Kinder', labelEN: 'Children', tag: 'Kinder' },
      { key: 'night', labelDE: 'Nacht', labelEN: 'Night', tag: 'Nacht' },
      { key: '24h', labelDE: '24 h', labelEN: '24 h', tag: '24h' },
    ],
  },
  {
    key: 'outpatient',
    labelDE: 'Ambulante Pflege',
    labelEN: 'Outpatient Care',
    descDE: 'Pflege im häuslichen Umfeld und ambulante Dienste.',
    descEN: 'Home care and outpatient services.',
    icon: HomeIcon,
    tagBased: true,
    tagValue: 'Ambulante Pflege',
    subCategories: []
  },
];

const STORAGE_KEY = 'pflegeflix_category_last_opened';

interface CategoryAccordionProps {
  onNavigate?: () => void;
}

type ViewMode = 'grid' | 'detail';

export default function CategoryAccordion({ onNavigate }: CategoryAccordionProps) {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [subcategoryCounts, setSubcategoryCounts] = useState<Record<string, number>>({});
  const [categoryCounts, setCategoryCounts] = useState<Partial<Record<FacilityType, number>>>({});

  // Restore last opened category on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const category = CATEGORIES.find(c => c.facility === saved);
      if (category) {
        setSelectedCategory(category);
        setViewMode('detail');
      }
    }
  }, []);

  // Fetch counts for category tiles and subcategories
  useEffect(() => {
    const fetchCounts = async () => {
      const facilityCounts: Partial<Record<FacilityType, number>> = {};
      for (const category of CATEGORIES) {
        if (category.key === 'clinics') {
          const { count } = await supabase
            .from('jobs')
            .select('*', { count: 'exact', head: true })
            .eq('approved', true)
            .eq('facility_type', 'Klinik');
          facilityCounts['Klinik'] = count || 0;
        } else if (category.key === 'hospitals') {
          const { count } = await supabase
            .from('jobs')
            .select('*', { count: 'exact', head: true })
            .eq('approved', true)
            .eq('facility_type', 'Krankenhaus');
          facilityCounts['Krankenhaus'] = count || 0;
        } else if (category.tagBased && category.tagValue) {
          const { count } = await supabase
            .from('jobs')
            .select('*', { count: 'exact', head: true })
            .eq('approved', true)
            .contains('tags', [category.tagValue]);
          // store under a pseudo key; we will read it by category.tagValue
          // no direct FacilityType key for tag-based category
          // we'll read counts inline when rendering
          facilityCounts[category.tagValue as FacilityType] = count || 0 as any;
        } else {
          const { count } = await supabase
            .from('jobs')
            .select('*', { count: 'exact', head: true })
            .eq('approved', true)
            .eq('facility_type', category.facility as FacilityType);
          facilityCounts[category.facility as FacilityType] = count || 0;
        }
      }
      setCategoryCounts(facilityCounts as Record<FacilityType, number>);

      // Subcategory counts
      const counts: Record<string, number> = {};
      for (const category of CATEGORIES) {
        for (const sub of category.subCategories) {
          if (category.key === 'clinics') {
            const { count } = await supabase
              .from('jobs')
              .select('*', { count: 'exact', head: true })
              .eq('approved', true)
              .eq('facility_type', 'Klinik')
              .contains('tags', [sub.tag]);
            counts[sub.key] = count || 0;
          } else if (category.key === 'hospitals') {
            const { count } = await supabase
              .from('jobs')
              .select('*', { count: 'exact', head: true })
              .eq('approved', true)
              .eq('facility_type', 'Krankenhaus')
              .contains('tags', [sub.tag]);
            counts[sub.key] = count || 0;
          } else if (category.tagBased && category.tagValue) {
            const { count } = await supabase
              .from('jobs')
              .select('*', { count: 'exact', head: true })
              .eq('approved', true)
              .contains('tags', [sub.tag || category.tagValue]);
            counts[sub.key] = count || 0;
          } else {
            const { count } = await supabase
              .from('jobs')
              .select('*', { count: 'exact', head: true })
              .eq('approved', true)
              .eq('facility_type', category.facility as FacilityType)
              .contains('tags', [sub.tag]);
            counts[sub.key] = count || 0;
          }
        }
      }
      setSubcategoryCounts(counts);
    };

    fetchCounts();
  }, []);

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category);
    setViewMode('detail');
    localStorage.setItem(STORAGE_KEY, category.facility);
  };

  const handleBackClick = () => {
    setViewMode('grid');
    setSelectedCategory(null);
  };

  const handleSubCategoryClick = (category: Category, sub: SubCategory) => {
    const params = new URLSearchParams();
    if (category.key === 'clinics') {
      params.set('facilities', ['Klinik', 'Krankenhaus'].join(','));
    } else {
      params.set('facilities', category.facility);
    }
    params.set('specialties', sub.tag);
    
    navigate(`/search?${params.toString()}`);
    onNavigate?.();
  };

  const isParentActive = (category: Category) => {
    if (location.pathname !== '/search') return false;
    const params = new URLSearchParams(location.search);
    const facilities = params.get('facilities')?.split(',') || [];
    if (category.key === 'clinics') {
      return facilities.includes('Klinik');
    }
    if (category.key === 'hospitals') {
      return facilities.includes('Krankenhaus');
    }
    return facilities.includes(category.facility);
  };

  // Keyboard navigation for grid
  const handleKeyDown = (e: React.KeyboardEvent, category: Category, index: number) => {
    if (viewMode !== 'grid') return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleCategoryClick(category);
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        const nextIndex = (index + 1) % CATEGORIES.length;
        document.getElementById(`category-card-${nextIndex}`)?.focus();
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        const prevIndex = (index - 1 + CATEGORIES.length) % CATEGORIES.length;
        document.getElementById(`category-card-${prevIndex}`)?.focus();
        break;
    }
  };

  if (viewMode === 'grid') {
    return (
      <div className="w-full">
        <div className="border-t border-border/40 pt-3 pb-2 px-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white/60">
            {t('category.section')}
          </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 px-4 pb-4">
          {CATEGORIES.map((category, index) => {
            const Icon = category.icon;
            const count = category.tagBased && category.tagValue
              ? (categoryCounts[category.tagValue as FacilityType] || 0)
              : (categoryCounts[category.facility as FacilityType] || 0);
            const isActive = isParentActive(category);
            const label = language === 'de' ? category.labelDE : category.labelEN;
            const desc = language === 'de' ? category.descDE : category.descEN;

            return (
              <Card
                key={category.key}
                id={`category-card-${index}`}
                tabIndex={0}
                role="button"
                aria-label={`${label}, ${count} jobs`}
                onClick={() => handleCategoryClick(category)}
                onKeyDown={(e) => handleKeyDown(e, category, index)}
                className={cn(
                  "relative p-4 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg",
                  "focus:outline-none focus:ring-2 focus:ring-netflix-red focus:ring-offset-2 focus:ring-offset-background",
                  "bg-netflix-card border-border",
                  isActive && "bg-netflix-red/10 border-netflix-red/30 shadow-lg"
                )}
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <div className={cn(
                    "p-3 rounded-full transition-colors",
                    isActive ? "bg-netflix-red/20" : "bg-secondary"
                  )}>
                    <Icon className={cn(
                      "h-6 w-6",
                      isActive ? "text-netflix-red" : "text-netflix-text"
                    )} />
                  </div>
                  <div className="space-y-1 w-full">
                    <h3 className="font-semibold text-sm leading-tight text-netflix-text">
                      {label}
                    </h3>
                    <p className="text-xs text-netflix-text-muted line-clamp-2">
                      {desc}
                    </p>
                  </div>
                  <Badge 
                    className="absolute top-2 right-2 h-5 px-2 text-xs font-bold bg-netflix-red text-white border-0"
                  >
                    {count}
                  </Badge>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // Detail view - show subcategory pills for selected category
  return (
    <div className="w-full p-4 space-y-4 animate-fade-in">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleBackClick}
        className="gap-2 text-netflix-text-muted hover:text-netflix-text hover:bg-netflix-card"
      >
        <ChevronLeft className="h-4 w-4" />
        {t('category.back')}
      </Button>

      {selectedCategory && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <selectedCategory.icon className="h-5 w-5 text-netflix-red" />
            <h3 className="text-lg font-semibold text-netflix-text">
              {language === 'de' ? selectedCategory.labelDE : selectedCategory.labelEN}
            </h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedCategory.subCategories.map((sub) => {
              const count = subcategoryCounts[sub.key] || 0;
              const subLabel = language === 'de' ? sub.labelDE : sub.labelEN;

              return (
                <button
                  key={sub.key}
                  onClick={() => handleSubCategoryClick(selectedCategory, sub)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-full text-sm font-semibold bg-netflix-card hover:bg-netflix-card/70 border border-netflix-card hover:border-netflix-red/50 text-netflix-text-muted hover:text-netflix-text transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-netflix-red focus:ring-offset-2 focus:ring-offset-background active:scale-[1.03]"
                >
                  <span>{subLabel}</span>
                  {count > 0 && (
                    <Badge 
                      className="ml-0.5 h-4 px-1.5 text-[10px] bg-netflix-red/80 text-white border-0 font-bold"
                    >
                      {count}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
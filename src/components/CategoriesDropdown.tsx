import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Hospital, Users, Heart, Home as HomeIcon, ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { trackAnalyticsEvent } from '@/hooks/useAnalytics';

type CategoryKey = 'clinics' | 'hospitals' | 'nursing_homes' | 'intensive' | 'outpatient';

const CATEGORIES: { key: CategoryKey; icon: any; facility?: 'Klinik' | 'Krankenhaus' | 'Altenheim' | '1zu1'; tag?: 'Ambulante Pflege' }[] = [
  { key: 'clinics', icon: Building2, facility: 'Klinik' },
  { key: 'hospitals', icon: Hospital, facility: 'Krankenhaus' },
  { key: 'nursing_homes', icon: Users, facility: 'Altenheim' },
  { key: 'intensive', icon: Heart, facility: '1zu1' },
  { key: 'outpatient', icon: HomeIcon, tag: 'Ambulante Pflege' },
];

export default function CategoriesDropdown() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [counts, setCounts] = useState<Record<CategoryKey, number>>({
    clinics: 0,
    hospitals: 0,
    nursing_homes: 0,
    intensive: 0,
    outpatient: 0,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCounts = async () => {
      const [clinics, hospitals, nursing, intensive, outpatient] = await Promise.all([
        supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('approved', true).eq('facility_type', 'Klinik'),
        supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('approved', true).eq('facility_type', 'Krankenhaus'),
        supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('approved', true).eq('facility_type', 'Altenheim'),
        supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('approved', true).eq('facility_type', '1zu1'),
        supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('approved', true).contains('tags', ['Ambulante Pflege']),
      ]);
      setCounts({
        clinics: clinics.count || 0,
        hospitals: hospitals.count || 0,
        nursing_homes: nursing.count || 0,
        intensive: intensive.count || 0,
        outpatient: outpatient.count || 0,
      });
    };
    fetchCounts();
  }, []);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!open) return;
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const onSelect = (key: CategoryKey) => {
    // Analytics
    trackAnalyticsEvent('menu_category_click', { value: key });
    // Navigate to search page with facilities param or tag
    const params = new URLSearchParams();
    const cat = CATEGORIES.find(c => c.key === key)!;
    if (cat.tag) {
      params.set('facilities', 'Ambulante Pflege'); // handled in Search.tsx as tag filter
    } else if (cat.facility) {
      params.set('facilities', cat.facility);
    }
    navigate(`/search?${params.toString()}`);
    setOpen(false);
  };

  const labelFor = (key: CategoryKey) => {
    switch (key) {
      case 'clinics': return t('category.clinics');
      case 'hospitals': return t('category.hospitals');
      case 'nursing_homes': return t('category.nursing_homes');
      case 'intensive': return t('category.intensive_care');
      case 'outpatient': return t('category.outpatient');
      default: return key;
    }
  };

  return (
    <div ref={containerRef} className="relative hidden md:block">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(o => !o)}
        className="bg-netflix-card border-netflix-card text-netflix-text hover:bg-netflix-card/70"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={t('menu.categories')}
      >
        {t('menu.categories')}
        <ChevronDown className="w-4 h-4 ml-2" aria-hidden="true" />
      </Button>

      {open && (
        <div
          role="menu"
          aria-label={t('menu.categories')}
          className={cn(
            'absolute left-0 mt-2 w-[280px] rounded-md shadow-lg border border-netflix-card bg-[#141414] z-50',
            'p-2'
          )}
        >
          {CATEGORIES.map(({ key, icon: Icon }) => (
            <button
              key={key}
              role="menuitem"
              onClick={() => onSelect(key)}
              className="flex w-full items-center justify-between gap-3 px-3 py-2 rounded-md hover:bg-netflix-card/60 focus:bg-netflix-card/80 text-left transition"
              aria-label={`${labelFor(key)}, ${counts[key]} jobs`}
            >
              <div className="flex items-center gap-2">
                <Icon className="w-4.5 h-4.5 text-netflix-text" aria-hidden="true" />
                <span className="text-sm text-netflix-text">{labelFor(key)}</span>
              </div>
              <Badge className="bg-netflix-red text-white border-0 font-bold text-[11px] h-5 px-2">
                {counts[key]}
              </Badge>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, Heart, GripVertical, Hospital } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { trackAnalyticsEvent } from '@/hooks/useAnalytics';
import type { Database } from '@/integrations/supabase/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'react-router-dom';

type FacilityType = Database['public']['Enums']['facility_type'];

interface Category {
  key: string;
  labelDE: string;
  labelEN: string;
  icon: any;
  facility: FacilityType;
}

const DEFAULT_CATEGORIES: Category[] = [
  {
    key: 'clinics',
    labelDE: 'Kliniken',
    labelEN: 'Clinics',
    icon: Building2,
    facility: 'Klinik',
  },
  {
    key: 'hospitals',
    labelDE: 'Krankenhäuser',
    labelEN: 'Hospitals',
    icon: Hospital,
    facility: 'Krankenhaus',
  },
  {
    key: 'nursing_homes',
    labelDE: 'Altenheime',
    labelEN: 'Nursing Homes',
    icon: Users,
    facility: 'Altenheim',
  },
  {
    key: 'intensive',
    labelDE: '1:1 Intensivpflege',
    labelEN: '1:1 Intensive Care',
    icon: Heart,
    facility: '1zu1',
  },
];

const STORAGE_KEY_ORDER = 'pflegeflix_category_order';

interface CategorySlimListProps {
  onNavigate?: () => void;
  showHeader?: boolean;
}

export default function CategorySlimList({ selected }: { selected: string[] }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();
  const toggle = (slug: string) => {
    const current = (searchParams.get('facility_type') || '').split(',').filter(Boolean);
    const next = current.includes(slug) ? current.filter(s => s !== slug) : [...current, slug];
    if (next.length > 0) {
      searchParams.set('facility_type', next.join(','));
    } else {
      searchParams.delete('facility_type');
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="space-y-2">
      {CATEGORIES.map(c => (
        <button
          key={c.slug}
          onClick={() => toggle(c.slug)}
          className={`flex w-full items-center justify-between px-3 py-2 rounded-md transition-colors ${selected.includes(c.slug) ? 'bg-primary text-white' : 'bg-netflix-card text-white hover:bg-netflix-card/80'}`}
          aria-pressed={selected.includes(c.slug)}
        >
          <span>{t(c.labelKey)}</span>
        </button>
      ))}
    </div>
  );
}
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

type FacilityType = Database['public']['Enums']['facility_type'];

interface Category {
  key: string;
  labelDE: string;
  labelEN: string;
  icon: any;
  facility: FacilityType;
}

// Canonical category list used for filtering and URL sync
const CATEGORIES = [
  { slug: 'clinic', labelKey: 'category.clinics' },
  { slug: 'hospital', labelKey: 'category.hospitals' },
  { slug: 'nursing_home', labelKey: 'category.nursing_homes' },
  { slug: 'intensive_care', labelKey: 'category.intensive_care' },
  { slug: 'ambulant', labelKey: 'category.outpatient' },
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
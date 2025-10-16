import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, Heart, GripVertical } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
    labelDE: 'Kliniken & Krankenhäuser',
    labelEN: 'Clinics & Hospitals',
    icon: Building2,
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

export default function CategorySlimList({ onNavigate, showHeader = true }: CategorySlimListProps) {
  const { language, t } = useLanguage();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [categoryCounts, setCategoryCounts] = useState<Partial<Record<FacilityType, number>>>({});
  const [editMode, setEditMode] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const isAdmin = profile?.role === 'admin';

  // Load saved order from localStorage
  useEffect(() => {
    const savedOrder = localStorage.getItem(STORAGE_KEY_ORDER);
    if (savedOrder) {
      try {
        const orderKeys = JSON.parse(savedOrder) as string[];
        const reordered = orderKeys
          .map(key => DEFAULT_CATEGORIES.find(c => c.key === key))
          .filter(Boolean) as Category[];
        
        // Add any new categories that weren't in saved order
        const newCategories = DEFAULT_CATEGORIES.filter(
          c => !orderKeys.includes(c.key)
        );
        setCategories([...reordered, ...newCategories]);
      } catch {
        setCategories(DEFAULT_CATEGORIES);
      }
    }
  }, []);

  // Fetch counts
  useEffect(() => {
    const fetchCounts = async () => {
      const facilityCounts: Partial<Record<FacilityType, number>> = {};
      for (const category of categories) {
        const { count } = await supabase
          .from('jobs')
          .select('*', { count: 'exact', head: true })
          .eq('approved', true)
          .eq('facility_type', category.facility);
        facilityCounts[category.facility] = count || 0;
      }
      setCategoryCounts(facilityCounts as Record<FacilityType, number>);
    };

    fetchCounts();
  }, [categories]);

  const handleCategoryClick = (facility: FacilityType) => {
    const params = new URLSearchParams();
    params.set('facilities', facility);
    navigate(`/search?${params.toString()}`);
    onNavigate?.();
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newCategories = [...categories];
    const draggedItem = newCategories[draggedIndex];
    newCategories.splice(draggedIndex, 1);
    newCategories.splice(index, 0, draggedItem);

    setCategories(newCategories);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    // Save order to localStorage
    const orderKeys = categories.map(c => c.key);
    localStorage.setItem(STORAGE_KEY_ORDER, JSON.stringify(orderKeys));
  };

  const handleKeyDown = (e: React.KeyboardEvent, facility: FacilityType, index: number) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleCategoryClick(facility);
        break;
      case 'ArrowDown':
        e.preventDefault();
        const nextIndex = Math.min(index + 1, categories.length - 1);
        document.getElementById(`category-row-${nextIndex}`)?.focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        const prevIndex = Math.max(index - 1, 0);
        document.getElementById(`category-row-${prevIndex}`)?.focus();
        break;
    }
  };

  return (
    <div className="w-full">
      {/* Section Header */}
      {showHeader && (
        <div className="flex items-center justify-between px-4 pt-3 pb-2 border-t border-netflix-card">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-netflix-text-muted">
            {t('category.section')}
          </h3>
          {isAdmin && (
            <Button
              onClick={() => setEditMode(!editMode)}
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-netflix-text-muted hover:text-netflix-text hover:bg-netflix-card"
            >
              {editMode ? t('category.done') || 'Done' : t('category.edit_order') || 'Edit order'}
            </Button>
          )}
        </div>
      )}

      {/* Category List */}
      <div className={showHeader ? "space-y-0" : "space-y-0 mt-2"}>
        {categories.map((category, index) => {
          const Icon = category.icon;
          const count = categoryCounts[category.facility] || 0;
          const label = language === 'de' ? category.labelDE : category.labelEN;

          return (
            <div
              key={category.key}
              id={`category-row-${index}`}
              draggable={editMode}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={cn(
                "relative",
                draggedIndex === index && "opacity-50"
              )}
            >
              <button
                onClick={() => handleCategoryClick(category.facility)}
                className={cn(
                  "flex items-center gap-3 w-full px-4 py-2.5 transition-all duration-200",
                  "hover:bg-netflix-card/50 focus:outline-none focus:bg-netflix-card/70",
                  "border-b border-netflix-card/30"
                )}
                tabIndex={0}
                onKeyDown={(e) => handleKeyDown(e, category.facility, index)}
                aria-label={`${label}, ${count} jobs`}
              >
                {/* Drag Handle (admin only) */}
                {editMode && isAdmin && (
                  <GripVertical className="w-4 h-4 text-netflix-text-muted cursor-grab active:cursor-grabbing" />
                )}

                {/* Icon */}
                <Icon className="w-5 h-5 text-netflix-text shrink-0" />

                {/* Title */}
                <span className="flex-1 text-left text-sm font-medium text-netflix-text">
                  {label}
                </span>

                {/* Count Badge */}
                <Badge className="bg-netflix-red text-white border-0 font-bold text-xs h-5 px-2">
                  {count}
                </Badge>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

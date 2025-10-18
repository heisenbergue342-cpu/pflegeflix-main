import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSearchParams, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import SEO from '@/components/SEO';
import JobCard from '@/components/JobCard';
import { Card } from '@/components/ui/card';
import { Building2, Users, Heart } from 'lucide-react';

type CategorySlug = 'kliniken' | 'altenheime' | 'intensivpflege' | 'kliniken-und-krankenhaeuser';

const CATEGORY_META: Record<CategorySlug, {
  titleDE: string;
  titleEN: string;
  descDE: string;
  descEN: string;
  facilities: FacilityType[] | FacilityType;
  Icon: any;
}> = {
  'kliniken': {
    titleDE: 'Kliniken Jobs',
    titleEN: 'Clinics Jobs',
    descDE: 'Finde Pflegejobs in Kliniken.',
    descEN: 'Find healthcare jobs in clinics.',
    facilities: ['Klinik', 'Krankenhaus'],
    Icon: Building2
  },
  'altenheime': {
    titleDE: 'Altenheime Jobs',
    titleEN: 'Nursing Homes Jobs',
    descDE: 'Pflegejobs in Altenheimen.',
    descEN: 'Nursing home jobs.',
    facilities: 'Altenheim',
    Icon: Users
  },
  'intensivpflege': {
    titleDE: '1:1 Intensivpflege Jobs',
    titleEN: '1:1 Intensive Care Jobs',
    descDE: 'Individuelle Intensivpflege.',
    descEN: 'Individual intensive care.',
    facilities: '1zu1',
    Icon: Heart
  },
  'kliniken-und-krankenhaeuser': {
    titleDE: 'Kliniken Jobs',
    titleEN: 'Clinics Jobs',
    descDE: 'Weiterleitung auf Kliniken.',
    descEN: 'Redirect to Clinics.',
    facilities: ['Klinik', 'Krankenhaus'],
    Icon: Building2
  }
};

export default function CategoryHub() {
  const { slug } = useParams<{ slug: CategorySlug }>();
  const { language } = useLanguage();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const meta = CATEGORY_META[(slug as CategorySlug) || 'kliniken-und-krankenhaeuser'];
  const title = language === 'de' ? meta.titleDE : meta.titleEN;
  const desc = language === 'de' ? meta.descDE : meta.descEN;

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      const facilities = Array.isArray(meta.facilities) ? meta.facilities : [meta.facilities];
      let query = supabase.from('jobs').select('*').eq('approved', true);
      if (facilities.length > 1) {
        query = query.in('facility_type', facilities as any);
      } else {
        query = query.eq('facility_type', facilities[0]);
      }
      const { data } = await query.order('posted_at', { ascending: false });
      setJobs(data || []);
      setLoading(false);
    };
    fetchJobs();
  }, [meta.facilities]);

  return (
    <div className="min-h-screen bg-netflix-bg">
      <SEO 
        title={title}
        description={desc}
        canonical={`/jobs/${slug === 'kliniken-und-krankenhaeuser' ? 'kliniken' : slug}`}
      />
      <div className="container mx-auto px-4 py-10 max-w-6xl">
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <meta.Icon className="w-7 h-7 text-netflix-red" />
            <h1 className="text-3xl font-bold text-white">{title}</h1>
          </div>
          <p className="text-netflix-text-muted mt-2">{desc}</p>
        </div>
        {loading ? (
          <Card className="p-8 bg-netflix-card border-netflix-card text-white">Loading...</Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {jobs.map(job => <JobCard key={job.id} job={job} />)}
          </div>
        )}
      </div>
    </div>
  );
}
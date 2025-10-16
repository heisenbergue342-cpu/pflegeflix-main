import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRecommendations } from '@/hooks/useRecommendations';
import { Button } from '@/components/ui/button';
import { Search, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import JobCarousel from '@/components/JobCarousel';
import SEO from '@/components/SEO';
import { OrganizationStructuredData } from '@/components/StructuredData';

export default function Home() {
  const { t } = useLanguage();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Get recommendations for logged-in users
  const { recommendations: recommendedJobs, loading: recsLoading } = useRecommendations(10);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .eq('approved', true)
      .order('posted_at', { ascending: false });
    setJobs(data || []);
    setLoading(false);
  };

  const featuredJobs = jobs.filter(j => j.featured);
  const clinicJobs = jobs.filter(j => j.facility_type === 'Klinik' || j.facility_type === 'Krankenhaus');
  const nursingHomeJobs = jobs.filter(j => j.facility_type === 'Altenheim');
  const oneOnOneJobs = jobs.filter(j => j.facility_type === '1zu1');
  const nightPartTimeJobs = jobs.filter(j => j.shift_type?.includes('Nacht') || j.contract_type === 'Teilzeit');

  // Convert recommended jobs to full job objects
  const personalizedJobs = recommendedJobs
    .map(rec => jobs.find(j => j.id === rec.job_id))
    .filter(Boolean)
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-netflix-bg">
      <SEO 
        title="Traumjob in der Pflege finden"
        description="Finde die perfekte Pflegestelle in Deutschland. Aktuelle Jobs in Kliniken, Krankenhäusern, Altenheimen und 1:1 Intensivpflege. Jetzt bewerben bei Pflegeflix."
        canonical="/"
      />
      <OrganizationStructuredData />
      
      {/* Hero Section */}
      <div className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-netflix-bg via-netflix-bg/50 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-netflix-bg via-transparent to-netflix-bg z-10" />
        
        <div className="relative z-20 text-center px-4 max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-2xl">
            {t('hero.title')}
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 drop-shadow-lg">
            {t('hero.subtitle')}
          </p>
          <Button
            onClick={() => navigate('/search', { state: { autoFocus: true } })}
            size="lg"
            className="bg-netflix-red hover:bg-netflix-red-dark text-white text-lg px-8 py-6 rounded-sm shadow-2xl"
          >
            <Search className="w-5 h-5 mr-2" />
            {t('nav.search')}
          </Button>
        </div>
      </div>

      {/* Carousels */}
      <div className="container mx-auto px-4 pb-12">
        {loading ? (
          <div className="space-y-8">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="min-h-[320px] space-y-4">
                <div className="h-8 w-48 bg-netflix-card animate-pulse rounded" />
                <div className="h-[280px] bg-netflix-card animate-pulse rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Personalized recommendations for logged-in users */}
            {user && profile?.recommendations_enabled && personalizedJobs.length > 0 && (
              <div className="min-h-[320px]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h2 className="text-2xl font-bold">Für Dich</h2>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/for-you')}
                  >
                    Alle ansehen
                  </Button>
                </div>
                <JobCarousel title="" jobs={personalizedJobs} priority={true} />
              </div>
            )}
            
            {featuredJobs.length > 0 && (
              <div className="min-h-[320px]">
                <JobCarousel title={t('carousel.recommended')} jobs={featuredJobs} priority={!user} />
              </div>
            )}
            <div className="min-h-[320px]">
              <JobCarousel title={t('carousel.clinics')} jobs={clinicJobs} />
            </div>
            <div className="min-h-[320px]">
              <JobCarousel title={t('carousel.nursing_homes')} jobs={nursingHomeJobs} />
            </div>
            <div className="min-h-[320px]">
              <JobCarousel title={t('carousel.one_on_one')} jobs={oneOnOneJobs} />
            </div>
            <div className="min-h-[320px]">
              <JobCarousel title={t('carousel.night_part')} jobs={nightPartTimeJobs} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

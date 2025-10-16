import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import JobCard from '@/components/JobCard';
import EmptyState from '@/components/EmptyState';
import { Bookmark } from 'lucide-react';
import SEO from '@/components/SEO';

export default function Saved() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    if (user) fetchSavedJobs();
  }, [user]);

  const fetchSavedJobs = async () => {
    const { data } = await supabase
      .from('saved_jobs')
      .select('job_id, jobs(*)')
      .eq('user_id', user?.id);
    setJobs(data?.map(d => d.jobs) || []);
  };

  return (
    <div className="min-h-screen bg-netflix-bg">
      <SEO 
        title="Meine Favoriten"
        description="Verwalte deine gespeicherten Pflegejobs. Behalte den Überblick über interessante Stellenangebote bei Pflegeflix."
        canonical="/saved"
        noindex={true}
      />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">{t('favorites.title')}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} onSaveChange={fetchSavedJobs} />
          ))}
        </div>
        {jobs.length === 0 && (
          <div className="max-w-2xl mx-auto mt-12">
            <EmptyState
              icon={Bookmark}
              title="Keine gespeicherten Jobs"
              description="Sie haben noch keine Jobs gespeichert. Durchsuchen Sie verfügbare Stellenangebote und speichern Sie interessante Jobs für später."
              action={{
                label: "Jobs durchsuchen",
                onClick: () => navigate('/search')
              }}
              secondaryAction={{
                label: "Zur Startseite",
                onClick: () => navigate('/')
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

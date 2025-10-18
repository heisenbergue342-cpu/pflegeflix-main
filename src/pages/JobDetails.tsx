import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Heart, MapPin, Briefcase, Clock, Euro } from 'lucide-react';
import { toast } from 'sonner';
import SEO from '@/components/SEO';
import { JobPostingStructuredData, BreadcrumbStructuredData, OrganizationStructuredData } from '@/components/StructuredData';
import { trackAnalyticsEvent } from '@/hooks/useAnalytics';

export default function JobDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [job, setJob] = useState<any>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (id) {
      fetchJob();
      if (user) {
        checkIfSaved();
      }
    }
  }, [id, user]);

  const fetchJob = async () => {
    setLoading(true);
    setNotFound(false);
    
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error || !data) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    
    // Increment view count
    await supabase.rpc('increment_job_views', { job_id: id });
    
    setJob(data);
    setLoading(false);
    const category =
      data.facility_type === 'Altenheim' ? 'Altenheime' :
      data.facility_type === '1zu1' ? '1:1 Intensivpflege' :
      'Kliniken';
    trackAnalyticsEvent('job_viewed', { jobId: data.id, city: data.city, state: data.state, category });
  };

  const checkIfSaved = async () => {
    if (!user || !id) return;
    const { data } = await supabase
      .from('saved_jobs')
      .select('*')
      .eq('user_id', user.id)
      .eq('job_id', id)
      .maybeSingle();
    setIsSaved(!!data);
  };

  const toggleSave = async () => {
    if (!user) {
      toast.error(t('auth.login_required.message'));
      navigate('/auth');
      return;
    }

    if (isSaved) {
      await supabase
        .from('saved_jobs')
        .delete()
        .eq('user_id', user.id)
        .eq('job_id', id);
      setIsSaved(false);
      toast.success(t('favorites.removed'));
    } else {
      await supabase
        .from('saved_jobs')
        .insert({ user_id: user.id, job_id: id });
      setIsSaved(true);
      toast.success(t('favorites.saved'));
    }
  };

  const handleApply = async () => {
    if (!user) {
      toast.error(t('auth.login_required.message'));
      navigate('/auth');
      return;
    }
    // Track apply click
    trackAnalyticsEvent('apply_click', { jobId: id });
    setApplying(true);
    const { error } = await supabase
      .from('applications')
      .insert({
        job_id: id,
        user_id: user.id,
        cover_letter: coverLetter
      });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t('application.success'));
      setCoverLetter('');
      navigate('/applications');
    }
    if (!error) {
      const category =
        job.facility_type === 'Altenheim' ? 'Altenheime' :
        job.facility_type === '1zu1' ? '1:1 Intensivpflege' :
        'Kliniken';
      trackAnalyticsEvent('application_submitted', { jobId: id, category });
    }
    setApplying(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-netflix-bg flex items-center justify-center">
        <div className="text-white text-xl">{t('common.loading')}</div>
      </div>
    );
  }

  if (notFound || !job) {
    return (
      <div className="min-h-screen bg-netflix-bg">
        <SEO 
          title={t('error.job_not_found_seo_title')}
          description={t('error.job_not_found_description')}
          canonical="/404"
        />
        
        <div className="container mx-auto px-4 py-16 max-w-2xl">
          <Card className="bg-netflix-card border-netflix-card">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <Briefcase className="w-16 h-16 text-netflix-red mx-auto mb-4" aria-hidden="true" />
                <h1 className="text-3xl font-bold text-white mb-3">
                  {t('error.job_not_found')}
                </h1>
                <p className="text-netflix-text-muted text-lg">
                  {t('error.job_not_found_description')}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => navigate(-1)}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  {t('navigation.go_back')}
                </Button>
                <Button
                  onClick={() => navigate('/search')}
                  className="bg-netflix-red hover:bg-netflix-red-dark text-white"
                >
                  {t('navigation.to_search')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-bg">
      <SEO 
        title={`${job.title} in ${job.city}, ${job.state}`}
        description={`${job.title} ${t('job.at_facility')} ${job.facility_type || t('job.default_facility')} ${t('search.location')} ${job.city}. ${job.contract_type} | ${job.salary_min && job.salary_max ? `€${job.salary_min}-${job.salary_max}${job.salary_unit}` : t('job.competitive_salary')}. ${job.description?.substring(0, 100) || t('job.apply_now_description')}`}
        canonical={`/job/${id}`}
        ogType="article"
      />
      
      <JobPostingStructuredData job={job} />
      <BreadcrumbStructuredData 
        items={[
          { name: t('nav.home'), url: window.location.origin },
          { name: t('nav.search'), url: `${window.location.origin}/search` },
          { name: job.facility_type, url: `${window.location.origin}/search?facilities=${job.facility_type}` },
          { name: `${job.city}, ${job.state}`, url: `${window.location.origin}/search?cities=${job.city}` },
          { name: job.title, url: window.location.href }
        ]} 
      />
      <OrganizationStructuredData />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="bg-netflix-card border-netflix-card">
          <CardContent className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{job.title}</h1>
                <div className="flex items-center gap-2 text-netflix-text-muted">
                  <MapPin className="w-4 h-4" aria-hidden="true" />
                  {job.city}, {job.state}
                </div>
              </div>
              <Button
                onClick={toggleSave}
                variant="outline"
                size="icon"
                className="border-netflix-red text-netflix-red hover:bg-netflix-red hover:text-white"
                aria-label={isSaved ? t('job.remove_from_saved') : t('job.save_job')}
                aria-pressed={isSaved}
              >
                <Heart className={isSaved ? 'fill-current' : ''} aria-hidden="true" />
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center gap-2 text-white">
                <Euro className="w-5 h-5 text-netflix-red" aria-hidden="true" />
                <div>
                  <div className="text-sm text-netflix-text-muted">{t('job.salary_label')}</div>
                  <div className="font-semibold">
                    {job.salary_min}-{job.salary_max} {job.salary_unit}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-white">
                <Briefcase className="w-5 h-5 text-netflix-red" aria-hidden="true" />
                <div>
                  <div className="text-sm text-netflix-text-muted">{t('job.contract_label')}</div>
                  <div className="font-semibold">{job.contract_type}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-white">
                <Clock className="w-5 h-5 text-netflix-red" aria-hidden="true" />
                <div>
                  <div className="text-sm text-netflix-text-muted">{t('job.shift_label')}</div>
                  <div className="font-semibold">{job.shift_type}</div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {job.tags?.map((tag: string) => (
                <Badge key={tag} variant="outline" className="border-white/20 text-white">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="space-y-6 mb-8">
              <div>
                <h2 className="text-xl font-bold text-white mb-3">{t('job.description_heading')}</h2>
                <p className="text-netflix-text-muted">{job.description}</p>
              </div>

              {job.requirements && job.requirements.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-3">{t('job.requirements_heading')}</h2>
                  <ul className="list-disc list-inside space-y-2 text-netflix-text-muted">
                    {job.requirements.map((req: string, idx: number) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              {job.bonus && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-3">{t('job.bonus_heading')}</h2>
                  <p className="text-netflix-text-muted">{job.bonus}</p>
                </div>
              )}
            </div>

            <div className="space-y-4 border-t border-netflix-card pt-6">
              <h2 className="text-xl font-bold text-white">{t('job.apply_for_position')}</h2>
              <Textarea
                placeholder={t('application.cover_letter')}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="bg-netflix-bg border-netflix-card text-white min-h-[120px]"
                aria-label={t('application.cover_letter')}
              />
              <Button
                onClick={handleApply}
                disabled={applying}
                className="w-full bg-netflix-red hover:bg-netflix-red-dark text-white"
              >
                {applying ? t('application.submitting') : t('job.apply')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
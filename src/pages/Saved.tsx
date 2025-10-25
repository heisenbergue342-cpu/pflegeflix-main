import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import JobCard from '@/components/JobCard';
import EmptyState from '@/components/EmptyState';
import { Bookmark, CheckSquare, Square, Scales } from 'lucide-react';
import SEO from '@/components/SEO';
import SavedJobNotes from '@/components/SavedJobNotes';
import ComparePanel from '@/components/ComparePanel';
import { Button } from '@/components/ui/button';

export default function Saved() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<any[]>([]);
  const [notesMap, setNotesMap] = useState<Record<string, string | null>>({});
  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [compareStartCity, setCompareStartCity] = useState<string | undefined>(searchParams.get('start') || undefined);
  const [compareMode, setCompareMode] = useState<any>((searchParams.get('mode') as 'car' | 'transit') || 'car');

  useEffect(() => {
    if (user) fetchSavedJobs();
    // Initialize compare ids from URL
    const compareIds = (searchParams.get('compare') || '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean)
      .slice(0, 3);
    if (compareIds.length) setSelectedCompareIds(compareIds);
  }, [user]);

  useEffect(() => {
    // Persist compare selections and commute settings in URL
    const params = new URLSearchParams(searchParams);
    if (selectedCompareIds.length > 0) {
      params.set('compare', selectedCompareIds.join(','));
    } else {
      params.delete('compare');
    }
    if (compareStartCity) params.set('start', compareStartCity);
    else params.delete('start');
    if (compareMode) params.set('mode', compareMode);
    else params.delete('mode');
    setSearchParams(params);
  }, [selectedCompareIds, compareStartCity, compareMode]);

  const fetchSavedJobs = async () => {
    const { data } = await supabase
      .from('saved_jobs')
      .select('job_id, notes, jobs(*)')
      .eq('user_id', user?.id);
    const j = data?.map(d => d.jobs) || [];
    setJobs(j);
    const n: Record<string, string | null> = {};
    (data || []).forEach((row: any) => {
      n[row.job_id] = row.notes ?? null;
    });
    setNotesMap(n);
  };

  const toggleCompare = (jobId: string) => {
    setSelectedCompareIds((prev) => {
      const exists = prev.includes(jobId);
      let next = exists ? prev.filter((id) => id !== jobId) : [...prev, jobId];
      if (next.length > 3) next = next.slice(1); // keep max 3 (drop oldest)
      return next;
    });
  };

  const isSelected = (jobId: string) => selectedCompareIds.includes(jobId);

  return (
    <div className="min-h-screen bg-netflix-bg">
      <SEO 
        title={t('favorites.title')}
        description={t('favorites.description')}
        canonical="/saved"
        noindex={true}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
          <h1 className="text-3xl font-bold text-white">{t('favorites.title')}</h1>
          {selectedCompareIds.length > 0 && (
            <Button variant="secondary" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })} aria-label={t('favorites.compare_selected')}>
              <Scales className="h-4 w-4 mr-2" />
              {t('favorites.compare_selected')}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {jobs.map((job) => (
            <div key={job.id} className="relative">
              <div className="flex items-center justify-between mb-2">
                <button
                  type="button"
                  onClick={() => toggleCompare(job.id)}
                  className="inline-flex items-center gap-2 text-sm text-white/90 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--focus-outline))] rounded-md"
                  aria-pressed={isSelected(job.id)}
                  aria-label={t('favorites.compare')}
                >
                  {isSelected(job.id) ? <CheckSquare className="h-4 w-4 text-netflix-red" /> : <Square className="h-4 w-4" />}
                  {t('favorites.compare')}
                </button>
              </div>

              <JobCard key={job.id} job={job} onSaveChange={fetchSavedJobs} />

              <SavedJobNotes
                jobId={job.id}
                initialNotes={notesMap[job.id] || ""}
                userId={user!.id}
                onSaved={(newNotes) => setNotesMap((prev) => ({ ...prev, [job.id]: newNotes }))}
              />
            </div>
          ))}
        </div>

        {jobs.length === 0 && (
          <div className="max-w-2xl mx-auto mt-12">
            <EmptyState
              icon={Bookmark}
              title={t('favorites.empty_title')}
              description={t('favorites.empty_description')}
              action={{
                label: t('favorites.browse_jobs'),
                onClick: () => navigate('/search')
              }}
              secondaryAction={{
                label: t('menu.home'),
                onClick: () => navigate('/')
              }}
            />
          </div>
        )}

        {/* Compare panel */}
        {selectedCompareIds.length > 0 ? (
          <ComparePanel
            jobs={jobs}
            selectedIds={selectedCompareIds}
            startCity={compareStartCity}
            mode={compareMode}
            onStartCityChange={setCompareStartCity}
            onModeChange={(m) => setCompareMode(m)}
            onClearSelection={() => setSelectedCompareIds([])}
          />
        ) : (
          <div className="mt-8 text-center text-sm text-netflix-text-muted">
            {t('favorites.compare_add_hint')}
          </div>
        )}
      </div>
    </div>
  );
}
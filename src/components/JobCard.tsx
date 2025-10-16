import { Heart, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import LoginPromptModal from '@/components/LoginPromptModal';
import { analyticsJob } from '@/lib/analytics-events';

interface JobCardProps {
  job: any;
  onSaveChange?: () => void;
  priority?: boolean;
}

export default function JobCard({ job, onSaveChange, priority = false }: JobCardProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (user) {
      checkIfSaved();
    }
  }, [user, job.id]);

  const checkIfSaved = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('saved_jobs')
      .select('*')
      .eq('user_id', user.id)
      .eq('job_id', job.id)
      .maybeSingle();
    setIsSaved(!!data);
  };

  const toggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    if (isSaved) {
      await supabase
        .from('saved_jobs')
        .delete()
        .eq('user_id', user.id)
        .eq('job_id', job.id);
      setIsSaved(false);
      toast.success(t('favorites.removed'));
      analyticsJob.unsaved(job.id);
      onSaveChange?.();
    } else {
      await supabase
        .from('saved_jobs')
        .insert({ user_id: user.id, job_id: job.id });
      setIsSaved(true);
      toast.success(t('favorites.saved'));
      analyticsJob.saved(job.id);
      onSaveChange?.();
    }
  };

  const daysAgo = Math.floor((new Date().getTime() - new Date(job.posted_at).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Link 
      to={`/job/${job.id}`} 
      className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--focus-outline))] focus-visible:ring-offset-2 rounded-md inline-block"
      aria-label={t('job.view_details_for', { title: job.title, city: job.city, state: job.state })}
    >
      <div 
        className="relative bg-netflix-card rounded-md overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-netflix-red/20 min-w-[280px]"
        style={{ 
          height: '400px',
          aspectRatio: '7/10'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10" aria-hidden="true" />
        
        <div className="absolute top-3 right-3 z-20">
          <Button
            size="icon"
            variant="ghost"
            onClick={toggleSave}
            aria-label={!user ? t('auth.login_required.save_hint') : isSaved ? t('job.remove_from_saved', { title: job.title }) : t('job.save_job', { title: job.title })}
            aria-pressed={isSaved}
            className={`rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--focus-outline))] focus-visible:ring-offset-2 ${!user ? 'cursor-pointer' : ''}`}
          >
            <Heart className={`w-5 h-5 ${isSaved ? 'fill-netflix-red text-netflix-red' : 'text-white'}`} aria-hidden="true" />
          </Button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 z-20 space-y-2">
          {daysAgo <= 3 && (
            <Badge className="bg-netflix-red text-white border-0" aria-label={daysAgo === 0 ? t('job.new') : t('job.posted_days_ago', { days: daysAgo.toString() })}>
              {daysAgo === 0 ? t('job.new') : t('job.days_ago').replace('{days}', daysAgo.toString())}
            </Badge>
          )}
          
          <h3 className="text-lg font-bold text-white line-clamp-2">{job.title}</h3>
          
          <div className="flex items-center gap-1 text-sm text-gray-300">
            <MapPin className="w-4 h-4" aria-hidden="true" />
            <span>{job.city}, {job.state}</span>
          </div>

          <div className="flex flex-wrap gap-1.5" role="list" aria-label={t('job.tags_label')}>
            {job.tags?.map((tag: string) => (
              <Badge key={tag} variant="outline" className="bg-white/10 text-white border-white/20" role="listitem">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="text-netflix-red font-bold text-lg" aria-label={t('job.salary_range_label', { salary_min: job.salary_min?.toLocaleString(), salary_max: job.salary_max?.toLocaleString(), salary_unit: job.salary_unit })}>
            {job.salary_min && job.salary_max ? (
              `${job.salary_min.toLocaleString()}-${job.salary_max.toLocaleString()} ${job.salary_unit}`
            ) : (
              t('job.by_agreement')
            )}
          </div>

          <div className="text-sm text-gray-400" aria-label={t('job.contract_shift_label', { contract_type: job.contract_type, shift_type: job.shift_type })}>
            {job.contract_type} • {job.shift_type}
          </div>
        </div>
      </div>
      <LoginPromptModal open={showLoginPrompt} onOpenChange={setShowLoginPrompt} />
    </Link>
  );
}
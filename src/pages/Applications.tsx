import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { ApplicationInbox } from '@/components/candidate/ApplicationInbox';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import SEO from '@/components/SEO';

export default function Applications() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-netflix-bg">
      <SEO 
        title={t('nav.applications')}
        description={t('applications.description')}
        canonical="/applications"
        noindex={true}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{t('nav.applications')}</h1>
            <p className="text-netflix-text-muted">
              {t('applications.subtitle')}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/privacy-settings')}
            className="gap-2"
            aria-label={t('privacy_settings.title')}
          >
            <Shield className="h-4 w-4" aria-hidden="true" />
            {t('privacy_settings.title_short')}
          </Button>
        </div>

        <ApplicationInbox />
      </div>
    </div>
  );
}
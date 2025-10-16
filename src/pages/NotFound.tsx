import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useLanguage } from '@/contexts/LanguageContext';
import { Home, Search, ArrowLeft } from 'lucide-react';
import SEO from '@/components/SEO';
import EmptyState from '@/components/EmptyState';

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const title = language === 'de' 
    ? 'Seite nicht gefunden – 404 | Pflegeflix' 
    : 'Page Not Found – 404 | Pflegeflix';
  
  const description = language === 'de'
    ? 'Die angeforderte Seite konnte nicht gefunden werden. Kehren Sie zur Startseite zurück oder nutzen Sie die Suche, um offene Pflegestellen zu finden.'
    : 'The requested page could not be found. Return to the homepage or use the search to find open nursing positions.';

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title={title}
        description={description}
        noindex={true}
      />
      
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="text-6xl font-bold text-muted-foreground mb-2">404</h1>
          <h2 className="text-2xl font-semibold mb-4">
            {t('error.page_not_found')}
          </h2>
        </div>
        
        <EmptyState
          icon={Home}
          title={t('error.page_not_found')}
          description={t('error.page_not_found_description')}
          action={{
            label: language === 'de' ? 'Zur Startseite' : 'Go to Homepage',
            onClick: () => navigate('/')
          }}
          secondaryAction={{
            label: language === 'de' ? 'Jobs durchsuchen' : 'Browse Jobs',
            onClick: () => navigate('/search')
          }}
        />
        
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {language === 'de' ? 'Zurück zur vorherigen Seite' : 'Back to previous page'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

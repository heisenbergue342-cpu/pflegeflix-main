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

  const title = t('error.page_not_found_seo_title');
  const description = t('error.page_not_found_description');

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
            label: t('menu.home'),
            onClick: () => navigate('/')
          }}
          secondaryAction={{
            label: t('nav.search'),
            onClick: () => navigate('/search')
          }}
        />
        
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            aria-label={t('navigation.go_back')}
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            {t('navigation.go_back')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
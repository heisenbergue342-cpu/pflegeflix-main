import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, FileText, Briefcase, Shield, LogOut, Menu, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import NavigationDrawer from '@/components/NavigationDrawer';

export default function Header() {
  const { language, setLanguage, t } = useLanguage();
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchSavedCount();
      
      // Subscribe to realtime updates
      const channel = supabase
        .channel('saved_jobs_count')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'saved_jobs',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchSavedCount();
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setSavedCount(0);
    }
  }, [user]);

  const fetchSavedCount = async () => {
    if (!user) return;
    const { count } = await supabase
      .from('saved_jobs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);
    setSavedCount(count || 0);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <>
      <NavigationDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
      <header className="sticky top-0 z-50 bg-netflix-bg border-b border-netflix-card" role="banner">
        <a href="#main-content" className="skip-to-main">
          Skip to main content
        </a>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex items-center justify-center min-w-[56px] min-h-[56px] sm:min-w-[64px] sm:min-h-[64px] pl-3 sm:pl-4 -ml-2 sm:-ml-3 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--focus-outline))] focus-visible:ring-offset-2 focus-visible:ring-offset-netflix-bg hover:bg-white/10 active:bg-white/15"
              aria-label="Open navigation menu"
              aria-expanded={drawerOpen}
              type="button"
            >
              <Menu className="w-12 h-12 sm:w-16 sm:h-16 text-netflix-text" strokeWidth={2.5} aria-hidden="true" />
            </button>
            <Link to="/" className="flex items-center gap-2">
              <div className="text-2xl font-bold text-netflix-red leading-none">Pflegeflix</div>
            </Link>
          </div>

        <nav className="hidden md:flex items-center gap-6" role="navigation" aria-label="Main navigation">
          <Link 
            to="/search" 
            className="flex items-center gap-2 text-netflix-text-muted hover:text-netflix-text transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--focus-outline))] focus-visible:ring-offset-2 rounded"
            aria-label={t('nav.search')}
          >
            <Search className="w-4 h-4" aria-hidden="true" />
            {t('nav.search')}
          </Link>
          {user && (
            <>
              <Link 
                to="/for-you" 
                className="flex items-center gap-2 text-netflix-text-muted hover:text-netflix-text transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--focus-outline))] focus-visible:ring-offset-2 rounded"
                aria-label="Für Dich - Personalisierte Empfehlungen"
              >
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                Für Dich
              </Link>
              <Link 
                to="/career" 
                className="flex items-center gap-2 text-netflix-text-muted hover:text-netflix-text transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--focus-outline))] focus-visible:ring-offset-2 rounded"
                aria-label="Meine Karriere - CV Builder, Anschreiben Generator, Gehaltsplaner"
              >
                <Briefcase className="w-4 h-4" aria-hidden="true" />
                Meine Karriere
              </Link>
              <Link 
                to="/saved" 
                className="flex items-center gap-2 text-netflix-text-muted hover:text-netflix-text transition relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--focus-outline))] focus-visible:ring-offset-2 rounded"
                aria-label={`${t('nav.saved')}${savedCount > 0 ? ` (${savedCount} saved jobs)` : ''}`}
              >
                <Heart className="w-4 h-4" aria-hidden="true" />
                {t('nav.saved')}
                {savedCount > 0 && (
                  <Badge className="ml-1 bg-netflix-red text-white border-0 px-1.5 py-0 h-5 min-w-[20px] text-xs" aria-label={`${savedCount} saved jobs`}>
                    {savedCount}
                  </Badge>
                )}
              </Link>
              <Link 
                to="/applications" 
                className="flex items-center gap-2 text-netflix-text-muted hover:text-netflix-text transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--focus-outline))] focus-visible:ring-offset-2 rounded"
                aria-label={t('nav.applications')}
              >
                <FileText className="w-4 h-4" aria-hidden="true" />
                {t('nav.applications')}
              </Link>
              {(profile?.role === 'arbeitgeber' || profile?.role === 'admin') && (
                <Link 
                  to="/employer" 
                  className="flex items-center gap-2 text-netflix-text-muted hover:text-netflix-text transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--focus-outline))] focus-visible:ring-offset-2 rounded"
                  aria-label={t('nav.employer')}
                >
                  <Briefcase className="w-4 h-4" aria-hidden="true" />
                  {t('nav.employer')}
                </Link>
              )}
              {profile?.role === 'admin' && (
                <Link 
                  to="/admin" 
                  className="flex items-center gap-2 text-netflix-text-muted hover:text-netflix-text transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--focus-outline))] focus-visible:ring-offset-2 rounded"
                  aria-label={t('nav.admin')}
                >
                  <Shield className="w-4 h-4" aria-hidden="true" />
                  {t('nav.admin')}
                </Link>
              )}
            </>
          )}
        </nav>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-sm" role="group" aria-label="Language selection">
            <button
              onClick={() => setLanguage('de')}
              aria-label="Switch to German"
              aria-pressed={language === 'de'}
              aria-live="polite"
              className={`px-2 py-1 rounded transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--focus-outline))] focus-visible:ring-offset-2 ${language === 'de' ? 'bg-netflix-red text-white' : 'text-netflix-text-muted hover:text-netflix-text'}`}
            >
              DE
            </button>
            <span className="text-netflix-text-muted" aria-hidden="true">|</span>
            <button
              onClick={() => setLanguage('en')}
              aria-label="Switch to English"
              aria-pressed={language === 'en'}
              aria-live="polite"
              className={`px-2 py-1 rounded transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--focus-outline))] focus-visible:ring-offset-2 ${language === 'en' ? 'bg-netflix-red text-white' : 'text-netflix-text-muted hover:text-netflix-text'}`}
            >
              EN
            </button>
          </div>
          
          {user ? (
            <Button 
              onClick={handleSignOut} 
              variant="outline" 
              size="sm" 
              className="border-netflix-red text-netflix-red hover:bg-netflix-red hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--focus-outline))] focus-visible:ring-offset-2"
              aria-label={t('nav.logout')}
            >
              <LogOut className="w-4 h-4 mr-2" aria-hidden="true" />
              {t('nav.logout')}
            </Button>
          ) : (
            <Button 
              onClick={() => navigate('/auth')} 
              className="bg-netflix-red hover:bg-netflix-red-dark text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--focus-outline))] focus-visible:ring-offset-2"
              aria-label={t('nav.login')}
            >
              {t('nav.login')}
            </Button>
          )}
        </div>
      </div>
    </header>
    </>
  );
}

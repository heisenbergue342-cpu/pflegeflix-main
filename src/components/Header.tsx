import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NotificationBell from '@/components/NotificationBell';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import NavigationDrawer from '@/components/NavigationDrawer';

export default function Header() {
  const { t } = useLanguage();
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

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

          {/* Intentionally empty on desktop: Search and language are available in the Menu and Footer. */}

          <div className="flex items-center gap-4">
            <NotificationBell />
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
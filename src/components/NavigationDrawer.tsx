import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  X, Home, Search, Heart, FileText, Building2, Users, Shield, Eye, LogOut, LogIn, UserPlus, 
  RefreshCw, Settings, ChevronDown, ChevronRight, Bell, Bookmark, User, Sparkles, Briefcase
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import CategorySlimList from '@/components/CategorySlimList';
import { Home as HomeIcon } from 'lucide-react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface NavigationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function NavigationDrawer({ open, onOpenChange }: NavigationDrawerProps) {
  const { language, setLanguage, t } = useLanguage();
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [savedCount, setSavedCount] = useState(0);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [outpatientCount, setOutpatientCount] = useState(0);
  const [switchingRole, setSwitchingRole] = useState(false);
  
  // Persisted collapsible states
  const [categoriesOpen, setCategoriesOpen] = useState(() => {
    const saved = localStorage.getItem('nav-categories-open');
    return saved ? JSON.parse(saved) : true;
  });
  
  const [employerOpen, setEmployerOpen] = useState(() => {
    const saved = localStorage.getItem('nav-employer-open');
    return saved ? JSON.parse(saved) : true;
  });
  
  const [adminOpen, setAdminOpen] = useState(() => {
    const saved = localStorage.getItem('nav-admin-open');
    return saved ? JSON.parse(saved) : true;
  });

  // Persist collapsible states
  useEffect(() => {
    localStorage.setItem('nav-categories-open', JSON.stringify(categoriesOpen));
  }, [categoriesOpen]);
  
  useEffect(() => {
    localStorage.setItem('nav-employer-open', JSON.stringify(employerOpen));
  }, [employerOpen]);
  
  useEffect(() => {
    localStorage.setItem('nav-admin-open', JSON.stringify(adminOpen));
  }, [adminOpen]);

  // Fetch counts for saved jobs and applications
  useEffect(() => {
    if (!user) return;
    
    const fetchCounts = async () => {
      const [savedRes, appsRes] = await Promise.all([
        supabase.from('saved_jobs').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('applications').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      ]);
      setSavedCount(savedRes.count || 0);
      setApplicationsCount(appsRes.count || 0);
    };
    
    fetchCounts();
    
    // Subscribe to realtime updates
    const savedChannel = supabase
      .channel('saved_jobs_drawer')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'saved_jobs', filter: `user_id=eq.${user.id}` }, fetchCounts)
      .subscribe();
    
    const appsChannel = supabase
      .channel('applications_drawer')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'applications', filter: `user_id=eq.${user.id}` }, fetchCounts)
      .subscribe();
    
    return () => {
      supabase.removeChannel(savedChannel);
      supabase.removeChannel(appsChannel);
    };
  }, [user]);

  // Fetch outpatient count
  useEffect(() => {
    const fetchOutpatientCount = async () => {
      const { count } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('approved', true)
        .contains('tags', ['Ambulante Pflege']);
      setOutpatientCount(count || 0);
    };
    fetchOutpatientCount();
    const channel = supabase
      .channel('outpatient_count')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, fetchOutpatientCount)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // Close drawer on route change
  useEffect(() => {
    onOpenChange(false);
  }, [location.pathname, onOpenChange]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.overflow = '';
      document.body.style.width = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.overflow = '';
      document.body.style.width = '';
    };
  }, [open]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  const handleSignOut = async () => {
    await signOut();
    onOpenChange(false);
    navigate('/auth');
  };

  const handleRoleSwitch = async () => {
    if (!user || !profile) return;
    setSwitchingRole(true);
    
    // Cycle through roles: bewerber → arbeitgeber → bewerber
    const newRole = profile.role === 'bewerber' ? 'arbeitgeber' : 'bewerber';
    
    await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', user.id);
    
    // Refresh page to update context
    window.location.reload();
  };

  const isActive = (path: string) => location.pathname === path;

  const canSwitchRole = profile && ['bewerber', 'arbeitgeber'].includes(profile.role);

  const NavItem = ({ to, icon: Icon, label, count, compact }: { to: string; icon: any; label: string; count?: number; compact?: boolean }) => (
    <Link
      to={to}
      className={`flex items-center gap-2.5 px-3 rounded-md transition-all duration-200 group relative ${
        compact ? 'py-2' : 'py-2.5'
      } ${
        isActive(to)
          ? 'bg-netflix-card text-netflix-text font-medium border-l-3 border-netflix-red'
          : 'text-netflix-text-muted hover:text-netflix-text hover:bg-netflix-card/50'
      }`}
    >
      <Icon className={compact ? 'w-4 h-4' : 'w-4.5 h-4.5'} />
      <span className="flex-1 text-sm">{label}</span>
      {count !== undefined && count > 0 && (
        <Badge variant="secondary" className="bg-netflix-red text-white text-xs px-1.5 py-0 h-5 min-w-[20px]">
          {count}
        </Badge>
      )}
    </Link>
  );

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="left">
      <DrawerContent
        className="fixed inset-y-0 left-0 mt-0 h-full w-full sm:w-[300px] rounded-none bg-[#141414] border-r border-netflix-card"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <DrawerHeader className="flex items-center justify-between p-4 border-b border-netflix-card">
          <DrawerTitle className="text-xl font-bold text-netflix-red">Pflegeflix</DrawerTitle>
          <DrawerClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-netflix-text-muted hover:text-netflix-text hover:bg-netflix-card"
              aria-label="Menü schließen"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        {/* Sticky Profile Header */}
        {user && profile && (
          <div className="sticky top-0 z-10 bg-[#141414] border-b border-netflix-card">
            <div className="p-4 space-y-3">
              {/* Avatar, Name, Role */}
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 bg-netflix-red shrink-0">
                  <AvatarFallback className="bg-netflix-red text-white font-semibold text-sm">
                    {profile.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-netflix-text font-medium text-sm truncate leading-tight">
                    {profile.name || user.email}
                  </p>
                  <p className="text-xs text-netflix-text-muted capitalize leading-tight mt-0.5">
                    {profile.role}
                  </p>
                </div>
              </div>
              
              {/* Counters and Role Switch */}
              <div className="flex items-center gap-2">
                {/* Counters */}
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-netflix-text-muted" />
                    <span className="text-xs font-medium text-netflix-text">{savedCount}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-netflix-text-muted" />
                    <span className="text-xs font-medium text-netflix-text">{applicationsCount}</span>
                  </div>
                </div>
                
                {/* Role Switch Button */}
                {canSwitchRole && (
                  <Button
                    onClick={handleRoleSwitch}
                    disabled={switchingRole}
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs border-netflix-card hover:bg-netflix-card text-netflix-text-muted hover:text-netflix-text"
                    aria-label={switchingRole ? "Rolle wird gewechselt..." : "Rolle wechseln"}
                  >
                    <RefreshCw className={`w-3 h-3 mr-1 ${switchingRole ? 'animate-spin' : ''}`} aria-hidden="true" />
                    {t('menu.switch_role') || 'Switch'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-3 space-y-4">

          {/* Browse Section */}
          <div className="space-y-1">
            <h3 className="px-3 text-[10px] font-semibold text-netflix-text-muted uppercase tracking-wider mb-1.5">
              {t('menu.browse')}
            </h3>
            <NavItem to="/" icon={Home} label={t('menu.home')} compact />
            <button
              onClick={() => {
                navigate('/search', { state: { autoFocus: true } });
                onOpenChange(false);
              }}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md transition-all duration-200 group relative w-full text-left ${
                isActive('/search')
                  ? 'bg-netflix-card text-netflix-text font-medium border-l-3 border-netflix-red'
                  : 'text-netflix-text-muted hover:text-netflix-text hover:bg-netflix-card/50'
              }`}
              aria-label={t('nav.search')}
            >
              <Search className="w-4 h-4" aria-hidden="true" />
              <span className="flex-1 text-sm">{t('nav.search')}</span>
            </button>
          </div>

          {/* My Pflegeflix Section (logged-in users) */}
          {user && (
            <>
              <Separator className="bg-netflix-card/50" />
              <div className="space-y-1">
                <h3 className="px-3 text-[10px] font-semibold text-netflix-text-muted uppercase tracking-wider mb-1.5">
                  {t('menu.my_pflegeflix')}
                </h3>
                <NavItem to="/dashboard" icon={User} label={t('menu.dashboard')} compact />
                <NavItem to="/for-you" icon={Sparkles} label={t('menu.for_you')} compact />
                <NavItem to="/career" icon={Briefcase} label={t('menu.career')} compact />
                <NavItem to="/saved" icon={Heart} label={t('menu.saved_jobs')} count={savedCount} compact />
                <NavItem to="/applications" icon={FileText} label={t('menu.applications')} count={applicationsCount} compact />
                <NavItem to="/saved-searches" icon={Bookmark} label={t('saved_searches.title')} compact />
                <NavItem to="/privacy-settings" icon={Settings} label={t('menu.account_settings')} compact />
              </div>
            </>
          )}

          <Separator className="bg-netflix-card/50" />

          {/* Categories - Collapsible */}
          <Collapsible open={categoriesOpen} onOpenChange={setCategoriesOpen}>
            <CollapsibleTrigger 
              className="flex items-center justify-between w-full px-3 py-1.5 hover:bg-netflix-card/30 rounded transition group"
              aria-label={categoriesOpen ? t('menu.categories') + ' einklappen' : t('menu.categories') + ' ausklappen'}
              aria-expanded={categoriesOpen}
            >
              <h3 className="text-[10px] font-semibold text-netflix-text-muted uppercase tracking-wider">
                {t('menu.categories')}
              </h3>
              {categoriesOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-netflix-text-muted" aria-hidden="true" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-netflix-text-muted" aria-hidden="true" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <CategorySlimList onNavigate={() => onOpenChange(false)} showHeader={false} />
              <Link
                to="/jobs/ambulante-pflege"
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md transition-all duration-200 group relative w-full text-left ${
                  isActive('/jobs/ambulante-pflege')
                    ? 'bg-netflix-card text-netflix-text font-medium border-l-3 border-netflix-red'
                    : 'text-netflix-text-muted hover:text-netflix-text hover:bg-netflix-card/50'
                }`}
                aria-label={t('category.outpatient')}
                onClick={() => onOpenChange(false)}
              >
                <HomeIcon className="w-4 h-4" aria-hidden="true" />
                <span className="flex-1 text-sm">{t('category.outpatient')}</span>
                {outpatientCount > 0 && (
                  <Badge variant="secondary" className="bg-netflix-red text-white text-xs px-1.5 py-0 h-5 min-w-[20px]">
                    {outpatientCount}
                  </Badge>
                )}
              </Link>
            </CollapsibleContent>
          </Collapsible>

          {/* Employer Section - Collapsible */}
          {user && profile?.role === 'arbeitgeber' && (
            <>
              <Separator className="bg-netflix-card/50" />
              <Collapsible open={employerOpen} onOpenChange={setEmployerOpen}>
                <CollapsibleTrigger 
                  className="flex items-center justify-between w-full px-3 py-1.5 hover:bg-netflix-card/30 rounded transition group"
                  aria-label={employerOpen ? `${t('nav.employer')} einklappen` : `${t('nav.employer')} ausklappen`}
                  aria-expanded={employerOpen}
                >
                  <h3 className="text-[10px] font-semibold text-netflix-text-muted uppercase tracking-wider">
                    {t('nav.employer')}
                  </h3>
                  {employerOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 text-netflix-text-muted" aria-hidden="true" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-netflix-text-muted" aria-hidden="true" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 pt-1">
                  <NavItem to="/employer/post" icon={FileText} label={t('menu.post_job')} compact />
                  <NavItem to="/employer/dashboard" icon={Building2} label={t('menu.my_jobs')} compact />
                  <NavItem to="/employer/applicants" icon={Users} label={t('menu.applicants')} compact />
                </CollapsibleContent>
              </Collapsible>
            </>
          )}

          {/* Admin Section - Collapsible */}
          {user && profile?.role === 'admin' && (
            <>
              <Separator className="bg-netflix-card/50" />
              <Collapsible open={adminOpen} onOpenChange={setAdminOpen}>
                <CollapsibleTrigger 
                  className="flex items-center justify-between w-full px-3 py-1.5 hover:bg-netflix-card/30 rounded transition group"
                  aria-label={adminOpen ? `${t('nav.admin')} einklappen` : `${t('nav.admin')} ausklappen`}
                  aria-expanded={adminOpen}
                >
                  <h3 className="text-[10px] font-semibold text-netflix-text-muted uppercase tracking-wider">
                    {t('nav.admin')}
                  </h3>
                  {adminOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 text-netflix-text-muted" aria-hidden="true" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-netflix-text-muted" aria-hidden="true" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 pt-1">
                  <NavItem to="/admin/moderation" icon={Shield} label={t('menu.moderation')} compact />
                  <NavItem to="/admin/data" icon={Eye} label={t('menu.data_view')} compact />
                  <NavItem to="/admin/legal-settings" icon={Settings} label={t('menu.legal_settings')} compact />
                </CollapsibleContent>
              </Collapsible>
            </>
          )}

          <Separator className="bg-netflix-card/50" />

          {/* Language Toggle - Compact */}
          <div className="px-3 space-y-1.5">
            <h3 className="text-[10px] font-semibold text-netflix-text-muted uppercase tracking-wider">
              {t('menu.language')}
            </h3>
            <div className="flex gap-1.5">
              <Button
                onClick={() => setLanguage('de')}
                variant={language === 'de' ? 'default' : 'outline'}
                className={`flex-1 h-8 text-xs ${language === 'de' ? 'bg-netflix-red hover:bg-netflix-red-dark' : 'border-netflix-card text-netflix-text-muted'}`}
                size="sm"
                aria-label="Zu Deutsch wechseln"
                aria-pressed={language === 'de'}
              >
                DE
              </Button>
              <Button
                onClick={() => setLanguage('en')}
                variant={language === 'en' ? 'default' : 'outline'}
                className={`flex-1 h-8 text-xs ${language === 'en' ? 'bg-netflix-red hover:bg-netflix-red-dark' : 'border-netflix-card text-netflix-text-muted'}`}
                size="sm"
                aria-label="Switch to English"
                aria-pressed={language === 'en'}
              >
                EN
              </Button>
            </div>
          </div>

          <Separator className="bg-netflix-card/50" />

          {/* Legal Links - Compact */}
          <div className="space-y-0.5">
            <h3 className="px-3 text-[10px] font-semibold text-netflix-text-muted uppercase tracking-wider mb-1">
              {t('menu.legal')}
            </h3>
            <Link
              to="/impressum"
              className="block px-3 py-1.5 text-xs text-netflix-text-muted hover:text-netflix-text hover:bg-netflix-card/30 rounded transition"
            >
              {t('footer.impressum')}
            </Link>
            <Link
              to="/privacy"
              className="block px-3 py-1.5 text-xs text-netflix-text-muted hover:text-netflix-text hover:bg-netflix-card/30 rounded transition"
            >
              {t('footer.privacy')}
            </Link>
            <Link
              to="/agb"
              className="block px-3 py-1.5 text-xs text-netflix-text-muted hover:text-netflix-text hover:bg-netflix-card/30 rounded transition"
            >
              AGB
            </Link>
            <Link
              to="/cookie-policy"
              className="block px-3 py-1.5 text-xs text-netflix-text-muted hover:text-netflix-text hover:bg-netflix-card/30 rounded transition"
            >
              Cookie-Richtlinie
            </Link>
          </div>
        </div>

        {/* Account Actions - Compact */}
        <div className="p-3 border-t border-netflix-card space-y-1.5">
          {user ? (
            <Button
              onClick={handleSignOut}
              variant="outline"
              size="sm"
              className="w-full h-9 border-netflix-red text-netflix-red hover:bg-netflix-red hover:text-white text-sm"
              aria-label={t('menu.sign_out')}
            >
              <LogOut className="w-3.5 h-3.5 mr-2" aria-hidden="true" />
              {t('menu.sign_out')}
            </Button>
          ) : (
            <>
              <Button
                onClick={() => {
                  navigate('/auth');
                  onOpenChange(false);
                }}
                size="sm"
                className="w-full h-9 bg-netflix-red hover:bg-netflix-red-dark text-sm"
                aria-label={t('menu.sign_in')}
              >
                <LogIn className="w-3.5 h-3.5 mr-2" aria-hidden="true" />
                {t('menu.sign_in')}
              </Button>
              <Button
                onClick={() => {
                  navigate('/auth?mode=signup');
                  onOpenChange(false);
                }}
                variant="outline"
                size="sm"
                className="w-full h-8 border-netflix-card text-xs text-netflix-text-muted"
                aria-label={t('menu.register')}
              >
                <UserPlus className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                {t('menu.register')}
              </Button>
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
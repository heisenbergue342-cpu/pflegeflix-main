import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Briefcase, FileText, Users, Settings } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SEO from "@/components/SEO";

export default function EmployerPortal() {
  const { user, profile, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (loading) return;

      if (!user) {
        navigate("/auth");
        return;
      }

      if (profile?.role !== 'arbeitgeber' && profile?.role !== 'admin') {
        navigate("/not-authorized");
        return;
      }

      setCheckingAuth(false);
    };

    checkAccess();
  }, [user, profile, loading, navigate]);

  if (loading || checkingAuth) {
    return (
      <div className="min-h-screen bg-netflix-bg flex items-center justify-center">
        <div className="text-netflix-text text-xl">{t('common.loading')}</div>
      </div>
    );
  }

  // Determine active tab based on current path
  const getActiveTab = () => {
    if (location.pathname.includes('/employer/post')) return 'post';
    if (location.pathname.includes('/employer/applicants')) return 'applicants';
    if (location.pathname.includes('/employer/settings')) return 'settings';
    return 'jobs';
  };

  return (
    <div className="min-h-screen bg-netflix-bg">
      <SEO
        title={t("employer.portal_title")}
        description={t("employer.portal_subtitle")}
        canonical="/employer"
        noindex={true}
      />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-netflix-text mb-2">
            {t("employer.portal_title")}
          </h1>
          <p className="text-netflix-text-muted">
            {t("employer.portal_subtitle")}
          </p>
        </div>

        <Tabs value={getActiveTab()} className="mb-8">
          <TabsList className="flex w-full overflow-x-auto bg-netflix-card p-1 rounded-md scrollbar-hide">
            <TabsTrigger 
              value="jobs" 
              asChild
              className="flex-shrink-0 data-[state=active]:bg-netflix-red data-[state=active]:text-white"
            >
              <Link to="/employer" className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3" aria-label={t('employer.my_jobs')}>
                <Briefcase className="w-4 h-4" aria-hidden="true" />
                <span className="text-xs sm:text-sm whitespace-nowrap">{t("employer.my_jobs")}</span>
              </Link>
            </TabsTrigger>
            <TabsTrigger 
              value="post" 
              asChild
              className="flex-shrink-0 data-[state=active]:bg-netflix-red data-[state=active]:text-white"
            >
              <Link to="/employer/post" className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3" aria-label={t('employer.post_job')}>
                <FileText className="w-4 h-4" aria-hidden="true" />
                <span className="text-xs sm:text-sm whitespace-nowrap">{t("employer.post_job")}</span>
              </Link>
            </TabsTrigger>
            <TabsTrigger 
              value="applicants" 
              asChild
              className="flex-shrink-0 data-[state=active]:bg-netflix-red data-[state=active]:text-white"
            >
              <Link to="/employer/applicants" className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3" aria-label={t('employer.applicants')}>
                <Users className="w-4 h-4" aria-hidden="true" />
                <span className="text-xs sm:text-sm whitespace-nowrap">{t("employer.applicants")}</span>
              </Link>
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              asChild
              className="flex-shrink-0 data-[state=active]:bg-netflix-red data-[state=active]:text-white"
            >
              <Link to="/employer/settings" className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3" aria-label={t('employer.settings')}>
                <Settings className="w-4 h-4" aria-hidden="true" />
                <span className="text-xs sm:text-sm whitespace-nowrap">{t("employer.settings")}</span>
              </Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Outlet />
      </div>
    </div>
  );
}
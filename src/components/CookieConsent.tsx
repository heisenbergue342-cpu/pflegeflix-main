import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { X, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const COOKIE_CONSENT_KEY = "pflegeflix-cookie-consent";
const CONSENT_VERSION = "2.0"; // Updated for GDPR/TTDSG compliance

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  version: string;
  timestamp: string;
}

// Generate a unique session ID for consent logging
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('consent-session-id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    sessionStorage.setItem('consent-session-id', sessionId);
  }
  return sessionId;
};

export default function CookieConsent() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
    version: CONSENT_VERSION,
    timestamp: new Date().toISOString(),
  });

  useEffect(() => {
    const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!savedConsent) {
      setShowBanner(true);
    } else {
      try {
        const parsed = JSON.parse(savedConsent);
        if (parsed.version !== CONSENT_VERSION) {
          setShowBanner(true);
        } else {
          setPreferences(parsed);
        }
      } catch {
        setShowBanner(true);
      }
    }

    // Listen for cookie settings requests
    const handleOpenSettings = () => {
      setShowSettings(true);
    };
    window.addEventListener('openCookieSettings', handleOpenSettings);
    return () => window.removeEventListener('openCookieSettings', handleOpenSettings);
  }, []);

  const logConsent = async (prefs: CookiePreferences) => {
    try {
      await supabase.from('consent_logs').insert({
        user_id: user?.id || null,
        session_id: getSessionId(),
        consent_version: CONSENT_VERSION,
        essential: prefs.essential,
        analytics: prefs.analytics,
        marketing: prefs.marketing,
        user_agent: navigator.userAgent,
      });
    } catch (error) {
      console.error('Failed to log consent:', error);
    }
  };

  const savePreferences = async (prefs: CookiePreferences) => {
    const consentData = {
      ...prefs,
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentData));
    setPreferences(consentData);
    
    // Log consent to database
    await logConsent(consentData);
    
    // Track cookie preferences changed (only if analytics was already enabled)
    if (preferences.analytics) {
      const { trackAnalyticsEvent } = await import('@/hooks/useAnalytics');
      trackAnalyticsEvent('cookie_preferences_changed', {
        analyticsEnabled: prefs.analytics,
        marketingEnabled: prefs.marketing,
      });
    }
    
    // Load or unload scripts based on preferences
    if (prefs.analytics) {
      loadAnalyticsScripts();
    } else {
      removeAnalyticsScripts();
    }
    
    if (prefs.marketing) {
      loadMarketingScripts();
    } else {
      removeMarketingScripts();
    }
    
    setShowBanner(false);
    setShowSettings(false);
  };

  const loadAnalyticsScripts = () => {
    // Load Plausible Analytics (GDPR-compliant, EU-hosted)
    if (typeof window !== 'undefined') {
      const existingScript = document.querySelector('script[data-domain="pflegeflix.lovable.app"]');
      if (!existingScript) {
        const script = document.createElement('script');
        script.defer = true;
        script.dataset.domain = 'pflegeflix.lovable.app';
        script.src = 'https://plausible.io/js/script.js';
        script.dataset.respectDnt = 'true'; // Respect Do Not Track
        document.head.appendChild(script);
        console.log('Plausible Analytics loaded after consent');
      }
    }
  };

  const removeAnalyticsScripts = () => {
    // Remove Plausible script
    const plausibleScript = document.querySelector('script[data-domain="pflegeflix.lovable.app"]');
    if (plausibleScript) {
      document.head.removeChild(plausibleScript);
    }
    
    // Clear Plausible localStorage
    if (typeof window !== 'undefined') {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('plausible_')) {
          localStorage.removeItem(key);
        }
      });
    }
    console.log('Analytics scripts removed');
  };

  const loadMarketingScripts = () => {
    // Only load marketing scripts after explicit consent
    if (typeof window !== 'undefined') {
      // Facebook Pixel Example (only loads when consent is given)
      // !function(f,b,e,v,n,t,s){...}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
      console.log('Marketing scripts loaded after consent');
    }
  };

  const removeMarketingScripts = () => {
    // Remove marketing cookies
    document.cookie.split(";").forEach((c) => {
      if (c.trim().startsWith('_fbp') || c.trim().startsWith('_fbc')) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      }
    });
    console.log('Marketing scripts removed');
  };

  const acceptAll = () => {
    savePreferences({
      essential: true,
      analytics: true,
      marketing: true,
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
    });
  };

  const rejectAll = () => {
    savePreferences({
      essential: true,
      analytics: false,
      marketing: false,
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
    });
  };

  const saveCustom = () => {
    savePreferences(preferences);
  };

  if (!showBanner && !showSettings) return null;

  return (
    <>
      {/* Banner */}
      {showBanner && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-netflix-bg/95 backdrop-blur-sm border-t border-netflix-card">
          <div className="container max-w-6xl mx-auto">
            <Card className="border-netflix-card bg-netflix-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{t("cookie_consent.title")}</CardTitle>
                    <CardDescription className="text-sm">
                      {t("cookie_consent.description")}{" "}
                      <Link to="/cookie-policy" className="underline hover:text-netflix-red">
                        {t("cookie_consent.learn_more")}
                      </Link>
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={rejectAll}
                    className="ml-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={acceptAll} className="flex-1 bg-netflix-red hover:bg-netflix-red-dark">
                    {t("cookie_consent.accept_all")}
                  </Button>
                  <Button onClick={rejectAll} variant="outline" className="flex-1">
                    {t("cookie_consent.reject_all")}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowBanner(false);
                      setShowSettings(true);
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    {t("cookie_consent.customize")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("cookie_consent.settings_title")}</DialogTitle>
            <DialogDescription>
              {t("cookie_consent.settings_description")}{" "}
              <Link to="/cookie-policy" className="underline hover:text-netflix-red">
                {t("cookie_consent.detailed_policy")}
              </Link>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Essential */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox id="essential" checked disabled />
                  <Label htmlFor="essential" className="font-semibold cursor-not-allowed">
                    {t("cookie_consent.essential")}
                  </Label>
                </div>
                <span className="text-sm text-muted-foreground">{t("cookie_consent.always_active")}</span>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                {t("cookie_consent.essential_description")}
              </p>
            </div>

            {/* Analytics */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="analytics"
                  checked={preferences.analytics}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, analytics: checked as boolean })
                  }
                />
                <Label htmlFor="analytics" className="font-semibold cursor-pointer">
                  {t("cookie_consent.analytics")}
                </Label>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                {t("cookie_consent.analytics_description")}
              </p>
            </div>

            {/* Marketing */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="marketing"
                  checked={preferences.marketing}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, marketing: checked as boolean })
                  }
                />
                <Label htmlFor="marketing" className="font-semibold cursor-pointer">
                  {t("cookie_consent.marketing")}
                </Label>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                {t("cookie_consent.marketing_description")}
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={saveCustom} className="flex-1">
              {t("cookie_consent.save_preferences")}
            </Button>
            <Button onClick={acceptAll} variant="outline" className="flex-1">
              {t("cookie_consent.accept_all")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

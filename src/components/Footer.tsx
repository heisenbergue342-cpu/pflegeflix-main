import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect } from "react";
import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function Footer() {
  const { t, language } = useLanguage();
  const location = useLocation();
  const [legalData, setLegalData] = useState<{ [key: string]: string }>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load legal settings for address
  useEffect(() => {
    loadLegalSettings();
  }, [language]);

  // Monitor for unsaved changes in forms
  useEffect(() => {
    const checkUnsavedChanges = () => {
      const forms = document.querySelectorAll('form');
      let hasChanges = false;
      forms.forEach(form => {
        if (form.querySelector('[data-unsaved]')) {
          hasChanges = true;
        }
      });
      setHasUnsavedChanges(hasChanges);
    };

    checkUnsavedChanges();
    window.addEventListener('formchange', checkUnsavedChanges);
    return () => window.removeEventListener('formchange', checkUnsavedChanges);
  }, [location]);

  const loadLegalSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('legal_settings')
        .select('*');

      if (error) throw error;

      const settingsMap: { [key: string]: string } = {};
      data?.forEach((setting) => {
        const value = language === 'de' ? setting.value_de : setting.value_en;
        settingsMap[setting.key] = value || '';
      });

      setLegalData(settingsMap);
    } catch (error) {
      console.error('Failed to load legal settings:', error);
    }
  };

  const handleExternalLink = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (hasUnsavedChanges) {
      e.preventDefault();
      const confirmed = window.confirm(
        language === 'de' 
          ? 'Sie haben ungespeicherte Änderungen. Möchten Sie die Seite wirklich verlassen?' 
          : 'You have unsaved changes. Do you really want to leave the page?'
      );
      if (confirmed) {
        window.open(href, '_blank', 'noopener,noreferrer');
      }
    }
  };

  const handleCookieSettings = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('openCookieSettings'));
  };

  const companyAddress = legalData.street_address && legalData.postal_code && legalData.city
    ? `${legalData.company_name || 'Pflegeflix GmbH'}, ${legalData.street_address}, ${legalData.postal_code} ${legalData.city}, ${legalData.country || 'Deutschland'}`
    : t("footer.company_address");

  return (
    <footer className="bg-netflix-bg border-t border-netflix-card mt-auto" role="contentinfo" aria-label="Site footer">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-netflix-red font-bold text-lg mb-4">Pflegeflix</h3>
            <p className="text-sm text-netflix-text-muted mb-4">{t("footer.company_info")}</p>
            
            {/* Social Media Links */}
            <div className="flex gap-3 mt-4">
              <a 
                href="https://facebook.com/pflegeflix" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-netflix-text-muted hover:text-netflix-red transition"
                aria-label="Visit Pflegeflix on Facebook"
              >
                <Facebook size={20} aria-hidden="true" />
              </a>
              <a 
                href="https://twitter.com/pflegeflix" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-netflix-text-muted hover:text-netflix-red transition"
                aria-label="Visit Pflegeflix on Twitter"
              >
                <Twitter size={20} aria-hidden="true" />
              </a>
              <a 
                href="https://linkedin.com/company/pflegeflix" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-netflix-text-muted hover:text-netflix-red transition"
                aria-label="Visit Pflegeflix on LinkedIn"
              >
                <Linkedin size={20} aria-hidden="true" />
              </a>
              <a 
                href="https://instagram.com/pflegeflix" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-netflix-text-muted hover:text-netflix-red transition"
                aria-label="Visit Pflegeflix on Instagram"
              >
                <Instagram size={20} aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Legal & Compliance */}
          <div>
            <h4 className="font-semibold mb-4 text-netflix-text">{t("footer.legal")}</h4>
            <nav aria-label="Legal links">
              <ul className="space-y-2">
                <li>
                  <Link 
                    to="/impressum" 
                    className="text-sm text-netflix-text-muted hover:text-netflix-text transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-netflix-red"
                    aria-label="View legal notice and imprint"
                  >
                    {t("footer.impressum")}
                  </Link>
                </li>
                <li>
                  <a 
                    href="/datenschutz" 
                    target={hasUnsavedChanges ? "_blank" : undefined}
                    rel={hasUnsavedChanges ? "noopener noreferrer" : undefined}
                    onClick={(e) => hasUnsavedChanges && handleExternalLink(e, '/datenschutz')}
                    className="text-sm text-netflix-text-muted hover:text-netflix-text transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-netflix-red"
                    aria-label="Read our privacy policy"
                  >
                    {t("footer.privacy")}
                  </a>
                </li>
                <li>
                  <a 
                    href="/agb" 
                    target={hasUnsavedChanges ? "_blank" : undefined}
                    rel={hasUnsavedChanges ? "noopener noreferrer" : undefined}
                    onClick={(e) => hasUnsavedChanges && handleExternalLink(e, '/agb')}
                    className="text-sm text-netflix-text-muted hover:text-netflix-text transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-netflix-red"
                    aria-label="View terms and conditions"
                  >
                    {t("footer.terms")}
                  </a>
                </li>
                <li>
                  <a 
                    href="/cookie-policy" 
                    target={hasUnsavedChanges ? "_blank" : undefined}
                    rel={hasUnsavedChanges ? "noopener noreferrer" : undefined}
                    onClick={(e) => hasUnsavedChanges && handleExternalLink(e, '/cookie-policy')}
                    className="text-sm text-netflix-text-muted hover:text-netflix-text transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-netflix-red"
                    aria-label="Read cookie policy"
                  >
                    {t("footer.cookies")}
                  </a>
                </li>
                <li>
                  <Link 
                    to="/accessibility-statement" 
                    className="text-sm text-netflix-text-muted hover:text-netflix-text transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-netflix-red"
                    aria-label="View accessibility statement"
                  >
                    {t("footer.accessibility")}
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Privacy & Support */}
          <div>
            <h4 className="font-semibold mb-4 text-netflix-text">{t("footer.support")}</h4>
            <nav aria-label="Privacy and support links">
              <ul className="space-y-2">
                <li>
                  <Link 
                    to="/privacy-center" 
                    className="text-sm text-netflix-text-muted hover:text-netflix-text transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-netflix-red"
                    aria-label="Access privacy center to manage your data"
                  >
                    {t("footer.privacy_center")}
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/bewerber-datenschutz" 
                    className="text-sm text-netflix-text-muted hover:text-netflix-text transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-netflix-red"
                    aria-label="Read candidate-specific privacy information"
                  >
                    {t("footer.candidate_privacy")}
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleCookieSettings}
                    className="text-sm text-netflix-text-muted hover:text-netflix-text transition text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-netflix-red"
                    aria-label="Open cookie consent settings manager"
                  >
                    {t("footer.cookie_settings")}
                  </button>
                </li>
              </ul>
            </nav>
          </div>

          {/* For Employers */}
          <div>
            <h4 className="font-semibold mb-4 text-netflix-text">{t("footer.employers")}</h4>
            <nav aria-label="Employer resources">
              <ul className="space-y-2">
                <li>
                  <a 
                    href="/avv" 
                    target={hasUnsavedChanges ? "_blank" : undefined}
                    rel={hasUnsavedChanges ? "noopener noreferrer" : undefined}
                    onClick={(e) => hasUnsavedChanges && handleExternalLink(e, '/avv')}
                    className="text-sm text-netflix-text-muted hover:text-netflix-text transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-netflix-red"
                    aria-label="View data processing agreement for employers"
                  >
                    {t("footer.dpa")}
                  </a>
                </li>
                <li>
                  <Link 
                    to="/employer" 
                    className="text-sm text-netflix-text-muted hover:text-netflix-text transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-netflix-red"
                    aria-label="Post a new job listing"
                  >
                    {t("footer.post_job")}
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-netflix-card">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-netflix-text-muted">
              © {new Date().getFullYear()} Pflegeflix. {t("footer.rights")}
            </p>
            <p className="text-sm text-netflix-text-muted text-center md:text-right">
              {companyAddress}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

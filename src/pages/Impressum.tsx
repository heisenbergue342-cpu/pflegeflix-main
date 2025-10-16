import { useState, useEffect } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import SEO from '@/components/SEO';

interface LegalData {
  [key: string]: string;
}

export default function Impressum() {
  const { t, language } = useLanguage();
  const [legalData, setLegalData] = useState<LegalData>({});
  const [loading, setLoading] = useState(true);
  const [hasPlaceholders, setHasPlaceholders] = useState(false);

  useEffect(() => {
    loadLegalSettings();
  }, []);

  const loadLegalSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('legal_settings')
        .select('*');

      if (error) throw error;

      const settingsMap: LegalData = {};
      const placeholderPattern = /\[.*?\]/;
      let foundPlaceholders = false;

      data?.forEach((setting) => {
        const value = language === 'de' ? setting.value_de : setting.value_en;
        settingsMap[setting.key] = value || '';
        
        if (setting.is_required && (placeholderPattern.test(value || '') || !value?.trim())) {
          foundPlaceholders = true;
        }
      });

      setLegalData(settingsMap);
      setHasPlaceholders(foundPlaceholders);
    } catch (error) {
      console.error('Failed to load legal settings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-16 flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-16 print:pt-8">
      <SEO 
        title="Impressum"
        description="Rechtliche Angaben und Kontaktdaten von Pflegeflix gemäß §5 TMG und §18 MStV."
        canonical="/impressum"
      />
      
      <div className="container max-w-4xl mx-auto px-4">
        <article className="prose prose-invert max-w-none print:prose-print">
          <h1 className="text-4xl font-bold mb-8 print:text-black">
            {t("legal.impressum.title")}
          </h1>

          {hasPlaceholders && (
            <Alert className="mb-6 border-destructive print:hidden">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive">
                <strong>Warning:</strong> This Impressum contains incomplete information. 
                An administrator must complete all required fields.
              </AlertDescription>
            </Alert>
          )}
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 print:text-black">
              {t("legal.impressum.provider")}
            </h2>
            <p className="whitespace-pre-wrap">
              {legalData.company_name}<br />
              {legalData.legal_form}<br />
              {legalData.street_address}<br />
              {legalData.postal_code} {legalData.city}<br />
              {legalData.country}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 print:text-black">
              {t("legal.impressum.contact")}
            </h2>
            <p className="whitespace-pre-wrap">
              {language === 'de' ? 'Telefon: ' : 'Phone: '}{legalData.contact_phone}<br />
              E-Mail: <a href={`mailto:${legalData.contact_email}`} className="text-primary hover:underline">
                {legalData.contact_email}
              </a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 print:text-black">
              {t("legal.impressum.representative")}
            </h2>
            <p className="whitespace-pre-wrap">
              {language === 'de' ? 'Geschäftsführer: ' : 'Managing Director: '}{legalData.managing_director}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 print:text-black">
              {t("legal.impressum.register")}
            </h2>
            <p className="whitespace-pre-wrap">
              {language === 'de' ? 'Registergericht: ' : 'Register Court: '}{legalData.register_court}<br />
              {language === 'de' ? 'Registernummer: ' : 'Register Number: '}{legalData.register_number}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 print:text-black">
              {t("legal.impressum.vat")}
            </h2>
            <p className="whitespace-pre-wrap">
              {language === 'de' 
                ? `Umsatzsteuer-Identifikationsnummer gemäß §27a UStG: ${legalData.vat_id}`
                : `VAT ID according to §27a UStG: ${legalData.vat_id}`
              }
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 print:text-black">
              {t("legal.impressum.editorial")}
            </h2>
            <p className="whitespace-pre-wrap">
              {language === 'de' 
                ? 'Verantwortlich für Inhalte gemäß §18 Abs. 2 MStV:'
                : 'Responsible for content according to §18(2) MStV:'
              }<br />
              {legalData.editorial_responsible}<br />
              {legalData.editorial_address}
            </p>
          </section>

          {legalData.supervisory_authority && (
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 print:text-black">
                {language === 'de' ? 'Aufsichtsbehörde' : 'Supervisory Authority'}
              </h2>
              <p className="whitespace-pre-wrap">{legalData.supervisory_authority}</p>
            </section>
          )}

          {legalData.insurance_provider && (
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 print:text-black">
                {language === 'de' ? 'Berufshaftpflichtversicherung' : 'Professional Liability Insurance'}
              </h2>
              <p className="whitespace-pre-wrap">
                {language === 'de' ? 'Versicherer: ' : 'Insurer: '}{legalData.insurance_provider}<br />
                {legalData.insurance_address && (
                  <>{language === 'de' ? 'Adresse: ' : 'Address: '}{legalData.insurance_address}<br /></>
                )}
                {legalData.insurance_scope && (
                  <>{language === 'de' ? 'Geltungsbereich: ' : 'Territorial Scope: '}{legalData.insurance_scope}</>
                )}
              </p>
            </section>
          )}

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 print:text-black">
              {t("legal.impressum.dispute")}
            </h2>
            <p className="mb-4">{t("legal.impressum.dispute_text")}</p>
            <a 
              href="https://ec.europa.eu/consumers/odr" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline print:text-blue-600"
            >
              https://ec.europa.eu/consumers/odr
            </a>
          </section>

          {legalData.external_links_note && (
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 print:text-black">
                {language === 'de' ? 'Haftung für externe Links' : 'Liability for External Links'}
              </h2>
              <p className="whitespace-pre-wrap">{legalData.external_links_note}</p>
            </section>
          )}

          <footer className="mt-12 pt-8 border-t border-border text-sm text-muted-foreground print:border-gray-300 print:text-black">
            {t("legal.last_updated")}: {new Date().toLocaleDateString()}
          </footer>
        </article>
      </div>

      <style>{`
        @media print {
          body { background: white; }
          .prose-invert { color: black !important; }
          a { color: blue !important; }
        }
      `}</style>
    </div>
  );
}

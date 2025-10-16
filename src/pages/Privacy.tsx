import { useLanguage } from "@/contexts/LanguageContext";
import SEO from '@/components/SEO';

export default function Privacy() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background pt-20 pb-16">
      <SEO 
        title="Datenschutzerklärung"
        description="Datenschutzerklärung von Pflegeflix. Erfahren Sie, wie wir Ihre personenbezogenen Daten verarbeiten und schützen."
        canonical="/datenschutz"
      />
      
      <div className="container max-w-4xl mx-auto px-4">
        <article className="prose prose-invert max-w-none">
          <h1 className="text-4xl font-bold mb-8">{t("legal.privacy.title")}</h1>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t("legal.privacy.controller")}</h2>
            <p className="whitespace-pre-wrap">{t("legal.privacy.controller_details")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t("legal.privacy.dpo")}</h2>
            <p className="whitespace-pre-wrap">{t("legal.privacy.dpo_details")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t("legal.privacy.purposes")}</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">{t("legal.privacy.purpose_account")}</h3>
            <p className="whitespace-pre-wrap">{t("legal.privacy.purpose_account_text")}</p>

            <h3 className="text-xl font-semibold mt-6 mb-3">{t("legal.privacy.purpose_jobs")}</h3>
            <p className="whitespace-pre-wrap">{t("legal.privacy.purpose_jobs_text")}</p>

            <h3 className="text-xl font-semibold mt-6 mb-3">{t("legal.privacy.purpose_security")}</h3>
            <p className="whitespace-pre-wrap">{t("legal.privacy.purpose_security_text")}</p>

            <h3 className="text-xl font-semibold mt-6 mb-3">{t("legal.privacy.purpose_email")}</h3>
            <p className="whitespace-pre-wrap">{t("legal.privacy.purpose_email_text")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t("legal.privacy.recipients")}</h2>
            <p className="whitespace-pre-wrap">{t("legal.privacy.recipients_details")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t("legal.privacy.data_categories")}</h2>
            <p className="whitespace-pre-wrap">{t("legal.privacy.data_categories_details")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t("legal.privacy.transfers")}</h2>
            <p className="whitespace-pre-wrap">{t("legal.privacy.transfers_details")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t("legal.privacy.retention")}</h2>
            <p className="whitespace-pre-wrap">{t("legal.privacy.retention_details")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t("legal.privacy.rights")}</h2>
            <p className="whitespace-pre-wrap">{t("legal.privacy.rights_details")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t("legal.privacy.complaint")}</h2>
            <p className="whitespace-pre-wrap">{t("legal.privacy.complaint_details")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t("legal.privacy.requirement")}</h2>
            <p className="whitespace-pre-wrap">{t("legal.privacy.requirement_details")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t("legal.privacy.automated")}</h2>
            <p className="whitespace-pre-wrap">{t("legal.privacy.automated_details")}</p>
          </section>

          <footer className="mt-12 pt-8 border-t border-border text-sm text-muted-foreground">
            {t("legal.last_updated")}: {new Date().toLocaleDateString()}
          </footer>
        </article>
      </div>
    </div>
  );
}

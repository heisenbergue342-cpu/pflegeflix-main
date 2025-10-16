import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import SEO from '@/components/SEO';

export default function CandidatePrivacy() {
  const { t } = useLanguage();

  const downloadPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-16">
      <SEO 
        title="Bewerber-Datenschutzhinweise"
        description="Datenschutzhinweise für Bewerber auf Pflegeflix. Erfahren Sie, wie wir Ihre Bewerberdaten verarbeiten und schützen."
        canonical="/bewerber-datenschutz"
      />
      <div className="container max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8 print:hidden">
          <h1 className="text-4xl font-bold">{t("legal.candidate.title")}</h1>
          <Button onClick={downloadPDF} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            {t("legal.download_pdf")}
          </Button>
        </div>

        <article className="prose prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t("legal.candidate.introduction")}</h2>
            <p className="whitespace-pre-wrap">{t("legal.candidate.introduction_text")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t("legal.candidate.joint_roles")}</h2>
            <p className="whitespace-pre-wrap">{t("legal.candidate.joint_roles_text")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t("legal.candidate.data_types")}</h2>
            <p className="whitespace-pre-wrap">{t("legal.candidate.data_types_text")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t("legal.candidate.purposes")}</h2>
            <p className="whitespace-pre-wrap">{t("legal.candidate.purposes_text")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t("legal.candidate.legal_basis")}</h2>
            <p className="whitespace-pre-wrap">{t("legal.candidate.legal_basis_text")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t("legal.candidate.retention")}</h2>
            <p className="whitespace-pre-wrap">{t("legal.candidate.retention_text")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t("legal.candidate.recipients")}</h2>
            <p className="whitespace-pre-wrap">{t("legal.candidate.recipients_text")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t("legal.candidate.rights")}</h2>
            <p className="whitespace-pre-wrap">{t("legal.candidate.rights_text")}</p>
          </section>

          <footer className="mt-12 pt-8 border-t border-border text-sm text-muted-foreground">
            {t("legal.last_updated")}: {new Date().toLocaleDateString()}
          </footer>
        </article>
      </div>
    </div>
  );
}

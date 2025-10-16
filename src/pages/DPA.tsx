import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Download, FileCheck } from "lucide-react";

export default function DPA() {
  const { t } = useLanguage();

  const downloadPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-16">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8 print:hidden">
          <h1 className="text-4xl font-bold">{t("legal.dpa.title")}</h1>
          <div className="flex gap-2">
            <Button onClick={downloadPDF} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              {t("legal.download_pdf")}
            </Button>
            <Button variant="default">
              <FileCheck className="w-4 h-4 mr-2" />
              {t("legal.dpa.sign")}
            </Button>
          </div>
        </div>

        <article className="prose prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t("legal.dpa.preamble")}</h2>
            <p className="whitespace-pre-wrap">{t("legal.dpa.preamble_text")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t("legal.dpa.scope")}</h2>
            <p className="whitespace-pre-wrap">{t("legal.dpa.scope_text")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t("legal.dpa.instructions")}</h2>
            <p className="whitespace-pre-wrap">{t("legal.dpa.instructions_text")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t("legal.dpa.confidentiality")}</h2>
            <p className="whitespace-pre-wrap">{t("legal.dpa.confidentiality_text")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t("legal.dpa.security")}</h2>
            <p className="whitespace-pre-wrap">{t("legal.dpa.security_text")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t("legal.dpa.subprocessors")}</h2>
            <p className="whitespace-pre-wrap">{t("legal.dpa.subprocessors_text")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t("legal.dpa.data_subject_rights")}</h2>
            <p className="whitespace-pre-wrap">{t("legal.dpa.data_subject_rights_text")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t("legal.dpa.breach")}</h2>
            <p className="whitespace-pre-wrap">{t("legal.dpa.breach_text")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t("legal.dpa.audit")}</h2>
            <p className="whitespace-pre-wrap">{t("legal.dpa.audit_text")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t("legal.dpa.deletion")}</h2>
            <p className="whitespace-pre-wrap">{t("legal.dpa.deletion_text")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t("legal.dpa.transfers")}</h2>
            <p className="whitespace-pre-wrap">{t("legal.dpa.transfers_text")}</p>
          </section>

          <footer className="mt-12 pt-8 border-t border-border text-sm text-muted-foreground">
            {t("legal.last_updated")}: {new Date().toLocaleDateString()}
          </footer>
        </article>
      </div>
    </div>
  );
}

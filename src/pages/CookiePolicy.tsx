import { useLanguage } from "@/contexts/LanguageContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import SEO from '@/components/SEO';

export default function CookiePolicy() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background pt-20 pb-16">
      <SEO 
        title="Cookie-Richtlinie"
        description="Cookie-Richtlinie von Pflegeflix. Erfahren Sie, welche Cookies wir verwenden und wie Sie Ihre Einstellungen verwalten können."
        canonical="/cookie-policy"
      />
      
      <div className="container max-w-4xl mx-auto px-4">
        <article className="prose prose-invert max-w-none">
          <h1 className="text-4xl font-bold mb-8">{t("legal.cookies.title")}</h1>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t("legal.cookies.introduction")}</h2>
            <p className="whitespace-pre-wrap">{t("legal.cookies.introduction_text")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t("legal.cookies.what_are")}</h2>
            <p className="whitespace-pre-wrap">{t("legal.cookies.what_are_text")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t("legal.cookies.essential")}</h2>
            <p className="mb-4">{t("legal.cookies.essential_text")}</p>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("legal.cookies.table.name")}</TableHead>
                    <TableHead>{t("legal.cookies.table.provider")}</TableHead>
                    <TableHead>{t("legal.cookies.table.purpose")}</TableHead>
                    <TableHead>{t("legal.cookies.table.duration")}</TableHead>
                    <TableHead>{t("legal.cookies.table.basis")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono">sb-auth-token</TableCell>
                    <TableCell>Pflegeflix (Supabase)</TableCell>
                    <TableCell>Authentifizierung und Sitzungsverwaltung</TableCell>
                    <TableCell>Sitzung</TableCell>
                    <TableCell>Art. 6(1)(b) DSGVO</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono">pflegeflix-cookie-consent</TableCell>
                    <TableCell>Pflegeflix</TableCell>
                    <TableCell>Speicherung der Cookie-Einwilligungspräferenzen</TableCell>
                    <TableCell>12 Monate</TableCell>
                    <TableCell>Art. 6(1)(c) DSGVO</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono">consent-session-id</TableCell>
                    <TableCell>Pflegeflix</TableCell>
                    <TableCell>Temporäre Session-ID für Consent-Logging</TableCell>
                    <TableCell>Sitzung (sessionStorage)</TableCell>
                    <TableCell>Art. 6(1)(c) DSGVO</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t("legal.cookies.analytics")}</h2>
            <p className="mb-4">{t("legal.cookies.analytics_text")}</p>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("legal.cookies.table.name")}</TableHead>
                    <TableHead>{t("legal.cookies.table.provider")}</TableHead>
                    <TableHead>{t("legal.cookies.table.purpose")}</TableHead>
                    <TableHead>{t("legal.cookies.table.duration")}</TableHead>
                    <TableHead>{t("legal.cookies.table.basis")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono">_ga</TableCell>
                    <TableCell>Google Analytics</TableCell>
                    <TableCell>{t("legal.cookies.ga_purpose")}</TableCell>
                    <TableCell>{t("legal.cookies.24_months")}</TableCell>
                    <TableCell>Art. 6(1)(a) GDPR</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono">_gid</TableCell>
                    <TableCell>Google Analytics</TableCell>
                    <TableCell>{t("legal.cookies.gid_purpose")}</TableCell>
                    <TableCell>{t("legal.cookies.24_hours")}</TableCell>
                    <TableCell>Art. 6(1)(a) GDPR</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t("legal.cookies.marketing")}</h2>
            <p className="mb-4">{t("legal.cookies.marketing_text")}</p>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("legal.cookies.table.name")}</TableHead>
                    <TableHead>{t("legal.cookies.table.provider")}</TableHead>
                    <TableHead>{t("legal.cookies.table.purpose")}</TableHead>
                    <TableHead>{t("legal.cookies.table.duration")}</TableHead>
                    <TableHead>{t("legal.cookies.table.basis")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono">_fbp</TableCell>
                    <TableCell>Facebook</TableCell>
                    <TableCell>{t("legal.cookies.fbp_purpose")}</TableCell>
                    <TableCell>{t("legal.cookies.90_days")}</TableCell>
                    <TableCell>Art. 6(1)(a) GDPR</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t("legal.cookies.manage")}</h2>
            <p className="mb-4">{t("legal.cookies.manage_text")}</p>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('openCookieSettings'))}
              className="px-4 py-2 bg-netflix-red text-white rounded hover:bg-netflix-red-dark transition"
            >
              {t("footer.cookie_settings")}
            </button>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t("legal.cookies.withdrawal")}</h2>
            <p className="whitespace-pre-wrap">{t("legal.cookies.withdrawal_text")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t("legal.cookies.third_party")}</h2>
            <p className="whitespace-pre-wrap">{t("legal.cookies.third_party_text")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t("legal.cookies.rights")}</h2>
            <p className="whitespace-pre-wrap">{t("legal.cookies.rights_text")}</p>
          </section>

          <footer className="mt-12 pt-8 border-t border-border text-sm text-muted-foreground">
            {t("legal.last_updated")}: {new Date().toLocaleDateString()}
          </footer>
        </article>
      </div>
    </div>
  );
}

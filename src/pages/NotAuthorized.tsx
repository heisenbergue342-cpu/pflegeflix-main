"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";

export default function NotAuthorized() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-netflix-bg flex items-center justify-center px-4">
      <SEO
        title={t("error.unauthorized")}
        description={t("error.unauthorized")}
        canonical="/not-authorized"
        noindex={true}
      />
      <Card className="bg-netflix-card border-netflix-card max-w-lg w-full">
        <CardContent className="p-8 text-center space-y-6">
          <h1 className="text-2xl font-bold text-white">{t("error.unauthorized")}</h1>
          <p className="text-netflix-text-muted">
            {t("employer.portal_subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate("/auth")} className="bg-netflix-red text-white">
              {t("nav.login")}
            </Button>
            <Button variant="outline" onClick={() => navigate("/")}>
              {t("nav.home")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
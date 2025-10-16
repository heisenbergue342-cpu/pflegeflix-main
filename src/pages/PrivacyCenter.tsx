import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Download, Trash2, Settings, Shield, FileText } from "lucide-react";
import SEO from '@/components/SEO';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function PrivacyCenter() {
  const { t } = useLanguage();
  const { user, signOut } = useAuth();
  const [dsrRequest, setDsrRequest] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleExportData = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      const { data: applications } = await supabase
        .from("applications")
        .select("*")
        .eq("user_id", user.id);

      const { data: savedJobs } = await supabase
        .from("saved_jobs")
        .select("*")
        .eq("user_id", user.id);

      const exportData = {
        profile,
        applications,
        savedJobs,
        exportDate: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pflegeflix-data-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: t("privacy_center.export_success"),
      });
    } catch (error) {
      toast({
        title: t("error.generic"),
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    try {
      // Delete user data (cascading will handle auth.users deletion)
      await supabase.from("applications").delete().eq("user_id", user.id);
      await supabase.from("saved_jobs").delete().eq("user_id", user.id);
      await supabase.from("profiles").delete().eq("id", user.id);

      toast({
        title: t("privacy_center.delete_success"),
        description: t("privacy_center.delete_success_description"),
      });

      await signOut();
    } catch (error) {
      toast({
        title: t("error.generic"),
        variant: "destructive",
      });
    }
  };

  const handleDSRSubmit = async () => {
    if (!dsrRequest.trim()) {
      toast({
        title: t("privacy_center.dsr_empty"),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // In production, this would send to a support system
      toast({
        title: t("privacy_center.dsr_submitted"),
        description: t("privacy_center.dsr_response_time"),
      });
      setDsrRequest("");
    } catch (error) {
      toast({
        title: t("error.generic"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-16">
        <div className="container max-w-4xl mx-auto px-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("privacy_center.login_required")}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-16">
      <SEO 
        title="Datenschutz-Center"
        description="Verwalten Sie Ihre Datenschutzeinstellungen, exportieren Sie Ihre Daten oder löschen Sie Ihr Konto. Volle Kontrolle über Ihre persönlichen Daten."
        canonical="/privacy-center"
        noindex={true}
      />
      
      <div className="container max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{t("privacy_center.title")}</h1>
          <p className="text-muted-foreground">{t("privacy_center.subtitle")}</p>
        </div>

        <div className="space-y-6">
          {/* Export Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                {t("privacy_center.export_title")}
              </CardTitle>
              <CardDescription>{t("privacy_center.export_description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleExportData}>
                <Download className="w-4 h-4 mr-2" />
                {t("privacy_center.export_button")}
              </Button>
            </CardContent>
          </Card>

          {/* Cookie Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                {t("privacy_center.cookies_title")}
              </CardTitle>
              <CardDescription>{t("privacy_center.cookies_description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={() => window.dispatchEvent(new CustomEvent('openCookieSettings'))}>
                <Settings className="w-4 h-4 mr-2" />
                {t("privacy_center.cookies_button")}
              </Button>
            </CardContent>
          </Card>

          {/* Data Subject Request */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {t("privacy_center.dsr_title")}
              </CardTitle>
              <CardDescription>{t("privacy_center.dsr_description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="dsr-request">{t("privacy_center.dsr_label")}</Label>
                <Textarea
                  id="dsr-request"
                  value={dsrRequest}
                  onChange={(e) => setDsrRequest(e.target.value)}
                  placeholder={t("privacy_center.dsr_placeholder")}
                  rows={4}
                  className="mt-2"
                />
              </div>
              <Button onClick={handleDSRSubmit} disabled={isSubmitting}>
                <FileText className="w-4 h-4 mr-2" />
                {t("privacy_center.dsr_submit")}
              </Button>
            </CardContent>
          </Card>

          {/* Delete Account */}
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="w-5 h-5" />
                {t("privacy_center.delete_title")}
              </CardTitle>
              <CardDescription>{t("privacy_center.delete_description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    {t("privacy_center.delete_button")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t("privacy_center.delete_confirm_title")}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("privacy_center.delete_confirm_description")}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("privacy_center.delete_cancel")}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive">
                      {t("privacy_center.delete_confirm")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                {t("privacy_center.links_title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="link" asChild className="justify-start p-0 h-auto">
                <a href="/datenschutz">{t("footer.privacy")}</a>
              </Button>
              <Button variant="link" asChild className="justify-start p-0 h-auto">
                <a href="/cookie-policy">{t("footer.cookies")}</a>
              </Button>
              <Button variant="link" asChild className="justify-start p-0 h-auto">
                <a href="/impressum">{t("footer.impressum")}</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

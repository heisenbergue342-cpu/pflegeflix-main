import { useLanguage } from "@/contexts/LanguageContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface StepApplicationProps {
  formData: any;
  updateFormData: (data: any) => void;
}

export function StepApplication({ formData, updateFormData }: StepApplicationProps) {
  const { t } = useLanguage();

  // Safety check
  if (!formData) {
    return (
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Lade Formulardaten...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">{t("job.step4.title")}</h2>

      <div className="space-y-4">
        <div>
          <Label>{t("job.field.application_method")} *</Label>
          <RadioGroup
            value={formData.application_method || "email"}
            onValueChange={(value) => updateFormData({ application_method: value })}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="email" id="email" />
              <Label htmlFor="email" className="font-normal">
                {t("job.field.application_email")}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="external" id="external" />
              <Label htmlFor="external" className="font-normal">
                {t("job.field.application_external")}
              </Label>
            </div>
          </RadioGroup>
        </div>

        {formData.application_method === "email" ? (
          <div>
            <Label htmlFor="application_email">{t("job.field.email")} *</Label>
            <Input
              id="application_email"
              type="email"
              value={formData.application_email || ""}
              onChange={(e) => updateFormData({ application_email: e.target.value })}
              placeholder="bewerbung@firma.de"
              className="mt-1"
            />
          </div>
        ) : (
          <div>
            <Label htmlFor="application_url">{t("job.field.url")} *</Label>
            <Input
              id="application_url"
              type="url"
              value={formData.application_url || ""}
              onChange={(e) => updateFormData({ application_url: e.target.value })}
              placeholder="https://..."
              className="mt-1"
            />
          </div>
        )}

        <div>
          <Label htmlFor="auto_reply_template">{t("job.field.auto_reply")}</Label>
          <Textarea
            id="auto_reply_template"
            value={formData.auto_reply_template || ""}
            onChange={(e) => updateFormData({ auto_reply_template: e.target.value })}
            placeholder={t("job.field.auto_reply_placeholder")}
            className="mt-1 min-h-[120px]"
          />
        </div>

        <div>
          <Label htmlFor="contact_person">{t("job.field.contact_person")}</Label>
          <Input
            id="contact_person"
            value={formData.contact_person || ""}
            onChange={(e) => updateFormData({ contact_person: e.target.value })}
            placeholder={t("job.field.contact_placeholder")}
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
}
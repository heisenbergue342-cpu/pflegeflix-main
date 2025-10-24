import { useLanguage } from "@/contexts/LanguageContext";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Euro, Briefcase } from "lucide-react";
import { useEffect } from "react";

interface StepPreviewProps {
  formData: any;
  updateFormData: (data: any) => void;
  onPublish: () => void;
}

export function StepPreview({ formData, updateFormData, onPublish }: StepPreviewProps) {
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

  useEffect(() => {
    // Sync local checkbox state with formData
    if (!formData.acceptedTerms) {
      updateFormData({ acceptedTerms: false });
    }
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">{t("job.step5.title")}</h2>

      {/* Preview Card */}
      <Card className="p-6 border-2">
        <div className="space-y-4">
          <div>
            <h3 className="text-2xl font-bold mb-2">{formData.title || "Untitled"}</h3>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{formData.city || "—"}, {formData.state || "—"}</span>
            </div>
          </div>

          {formData.tags && formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 py-4 border-y">
            {formData.salary_min && formData.salary_max && (
              <div className="flex items-center gap-2">
                <Euro className="w-4 h-4 text-muted-foreground" />
                <span className="font-semibold">
                  {formData.salary_min} - {formData.salary_max}€
                  {formData.salary_unit === "hour" ? "/h" : `/${t("job.field.month")}`}
                </span>
              </div>
            )}

            {formData.contract_type && (
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                <span>{t(`contract.${formData.contract_type}`)}</span>
              </div>
            )}

            {formData.shift_type && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>{formData.shift_type}</span>
              </div>
            )}
          </div>

          <div>
            <h4 className="font-semibold mb-2">{t("job.field.description")}</h4>
            <p className="text-sm whitespace-pre-wrap">{formData.description || "—"}</p>
          </div>

          {formData.requirements && formData.requirements.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">{t("job.field.requirements")}</h4>
              <ul className="list-disc list-inside space-y-1">
                {formData.requirements.map((req: string, index: number) => (
                  <li key={index} className="text-sm">{req}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Card>

      {/* Legal Acceptance */}
      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-start space-x-3">
          <Checkbox
            id="terms"
            checked={formData.acceptedTerms || false}
            onCheckedChange={(checked) => updateFormData({ acceptedTerms: checked as boolean })}
          />
          <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
            Ich bestätige, dass diese Stellenanzeige den{" "}
            <Link to="/agb" target="_blank" className="text-primary underline hover:text-primary/80">
              Allgemeinen Geschäftsbedingungen
            </Link>
            {" "}entspricht und insbesondere die Vorgaben des{" "}
            <strong>Allgemeinen Gleichbehandlungsgesetzes (AGG)</strong>{" "}
            einhält. Die Stellenanzeige ist diskriminierungsfrei formuliert.
          </Label>
        </div>
      </div>

      {!formData.acceptedTerms && (
        <p className="text-sm text-destructive">
          Sie müssen die AGB akzeptieren, um die Stellenanzeige zu veröffentlichen.
        </p>
      )}
    </div>
  );
}
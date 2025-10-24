import { useLanguage } from "@/contexts/LanguageContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface StepCompensationProps {
  formData: any;
  updateFormData: (data: any) => void;
}

export function StepCompensation({ formData, updateFormData }: StepCompensationProps) {
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
      <h2 className="text-2xl font-semibold">{t("job.step3.title")}</h2>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="salary_min">{t("job.field.salary_min")} *</Label>
            <Input
              id="salary_min"
              type="number"
              value={formData.salary_min || ""}
              onChange={(e) => updateFormData({ salary_min: parseFloat(e.target.value) })}
              placeholder="0"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="salary_max">{t("job.field.salary_max")} *</Label>
            <Input
              id="salary_max"
              type="number"
              value={formData.salary_max || ""}
              onChange={(e) => updateFormData({ salary_max: parseFloat(e.target.value) })}
              placeholder="0"
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="salary_unit">{t("job.field.salary_unit")} *</Label>
          <Select
            value={formData.salary_unit || ""}
            onValueChange={(value) => updateFormData({ salary_unit: value })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder={t("job.field.salary_unit_placeholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="€/h">€/h</SelectItem>
              <SelectItem value="€/Monat">€/Monat</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="contract_type">{t("job.field.contract_type")}</Label>
          <Select
            value={formData.contract_type || ""}
            onValueChange={(value) => updateFormData({ contract_type: value })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder={t("job.field.contract_placeholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Vollzeit">{t("contract.Vollzeit")}</SelectItem>
              <SelectItem value="Teilzeit">{t("contract.Teilzeit")}</SelectItem>
              <SelectItem value="Minijob">{t("contract.Minijob")}</SelectItem>
              <SelectItem value="Befristet">{t("contract.Befristet")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="featured">{t("job.field.featured")}</Label>
            <p className="text-sm text-muted-foreground">
              {t("job.field.featured_desc")}
            </p>
          </div>
          <Switch
            id="featured"
            checked={formData.featured || false}
            onCheckedChange={(checked) => updateFormData({ featured: checked })}
          />
        </div>
      </div>
    </div>
  );
}
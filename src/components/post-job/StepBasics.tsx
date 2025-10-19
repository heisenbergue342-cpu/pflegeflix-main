import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { germanCities } from "@/data/cities_de";
import PhotoUploader from "./PhotoUploader";

interface StepBasicsProps {
  formData: any;
  updateFormData: (data: any) => void;
}

export function StepBasics({ formData, updateFormData }: StepBasicsProps) {
  const { t } = useLanguage();

  const states = [
    "Baden-Württemberg", "Bayern", "Berlin", "Brandenburg", "Bremen",
    "Hamburg", "Hessen", "Mecklenburg-Vorpommern", "Niedersachsen",
    "Nordrhein-Westfalen", "Rheinland-Pfalz", "Saarland", "Sachsen",
    "Sachsen-Anhalt", "Schleswig-Holstein", "Thüringen"
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">{t("job.step1.title")}</h2>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">{t("job.field.title")} *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => updateFormData({ title: e.target.value })}
            placeholder={t("job.field.title_placeholder")}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="facility_type">{t("job.field.category")} *</Label>
          <Select
            value={formData.facility_type || ""}
            onValueChange={(value) => updateFormData({ facility_type: value === 'Kliniken' ? 'Klinik' : value === 'Krankenhäuser' ? 'Krankenhaus' : value })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder={t("job.field.category_placeholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Kliniken">{t("category.clinics")}</SelectItem>
              <SelectItem value="Krankenhäuser">{t("category.hospitals")}</SelectItem>
              <SelectItem value="Altenheim">{t("category.nursing_homes")}</SelectItem>
              <SelectItem value="1zu1">{t("category.intensive_care")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city">{t("job.field.city")} *</Label>
            <Select
              value={formData.city || ""}
              onValueChange={(value) => updateFormData({ city: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={t("job.field.city_placeholder")} />
              </SelectTrigger>
              <SelectContent>
                {germanCities.map((city) => (
                  <SelectItem key={city.name} value={city.name}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="state">{t("job.field.state")} *</Label>
            <Select
              value={formData.state || ""}
              onValueChange={(value) => updateFormData({ state: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={t("job.field.state_placeholder")} />
              </SelectTrigger>
              <SelectContent>
                {states.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Optional image upload */}
      <div className="pt-4 border-t">
        <PhotoUploader />
      </div>
    </div>
  );
}
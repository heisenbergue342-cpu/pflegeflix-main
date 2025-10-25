import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CityComboboxMulti from "./CityComboboxMulti";
import StateCombobox from "./StateCombobox";
import PhotoUploader from "./PhotoUploader";
import { CATEGORIES, facilityTypeForSlug, labelForCategory, CategorySlug, CATEGORY_BY_SLUG } from "@/constants/categories";

interface StepBasicsProps {
  formData: any;
  updateFormData: (data: Partial<any>) => void;
  isEditing?: boolean;
  editingJobId?: string;
}

export function StepBasics({ formData, updateFormData, isEditing, editingJobId }: StepBasicsProps) {
  const { t, language } = useLanguage();

  const states = [
    "Baden-Württemberg", "Bayern", "Berlin", "Brandenburg", "Bremen",
    "Hamburg", "Hessen", "Mecklenburg-Vorpommern", "Niedersachsen",
    "Nordrhein-Westfalen", "Rheinland-Pfalz", "Saarland", "Sachsen",
    "Sachsen-Anhalt", "Schleswig-Holstein", "Thüringen"
  ];

  // Ensure cities array is initialized from legacy single city if needed
  const selectedCities: string[] = Array.isArray(formData.cities)
    ? formData.cities
    : formData.city
    ? [formData.city]
    : [];

  const cityError =
    selectedCities.length === 0
      ? (t("error.required_fields") as string)
      : selectedCities.length > 3
      ? (t("filter.max_cities_reached") as string)
      : null;

  const stateError = !formData.state ? (t("error.required_fields") as string) : null;

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
          <select
            className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={
              // derive current selection slug from facility_type or tag
              (() => {
                const ft = formData.facility_type as string | null;
                if (ft === "Klinik") return "kliniken";
                if (ft === "Krankenhaus") return "krankenhaeuser";
                if (ft === "Altenheim") return "altenheime";
                if (ft === "1zu1") return "1-1-intensivpflege";
                if (Array.isArray(formData.tags) && formData.tags.includes("Ambulante Pflege")) return "ambulante-pflege";
                return "";
              })()
            }
            onChange={(e) => {
              const slug = e.target.value as CategorySlug;
              const def = CATEGORY_BY_SLUG[slug];
              if (!def) return;
              if (def.kind === "facility") {
                const ft = facilityTypeForSlug(slug);
                updateFormData({ facility_type: ft, tags: formData.tags || [] });
              } else {
                // Amb. Pflege: Tag hinzufügen (ohne facility_type zu überschreiben)
                const nextTags = Array.isArray(formData.tags) ? [...formData.tags] : [];
                if (!nextTags.includes("Ambulante Pflege")) nextTags.push("Ambulante Pflege");
                updateFormData({ tags: nextTags });
              }
            }}
          >
            <option value="" disabled>
              {t("job.field.category_placeholder")}
            </option>
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {labelForCategory(c.slug, language)}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city">{t("job.field.city")} *</Label>
            <div className="mt-1">
              <CityComboboxMulti
                value={selectedCities}
                onChange={(cities) => {
                  updateFormData({
                    cities,
                    city: cities[0] || "",
                  });
                }}
                max={3}
                placeholder={t("filter.search_cities")}
                hint={t("filter.city_helper")}
                error={cityError}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="state">{t("job.field.state")} *</Label>
            <div className="mt-1">
              <StateCombobox
                value={formData.state || null}
                onChange={(state) => updateFormData({ state })}
                placeholder={t("job.field.state_placeholder")}
                error={stateError}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Optional image upload */}
      <div className="pt-4 border-t">
        <PhotoUploader mode={isEditing ? 'job' : 'draft'} idOverride={isEditing ? editingJobId : undefined} />
      </div>
    </div>
  );
}
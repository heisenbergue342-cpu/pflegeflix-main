import { useLanguage } from "@/contexts/LanguageContext";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { PillChip } from "@/components/PillChip";
import { trackAnalyticsEvent } from "@/hooks/useAnalytics";

interface StepDetailsProps {
  formData: any;
  updateFormData: (data: any) => void;
}

const SPECIALTY_TAGS = [
  "Intensivstation", "OP/Anästhesie", "Chirurgie", "Internistik",
  "Notaufnahme", "Dialyse", "Stationär", "Kurzzeitpflege",
  "Demenz", "Gerontopsychiatrie", "Leitung", "Beatmung",
  "Homecare", "Kinder", "Nacht", "24h",
  // New specialties & roles
  "Ambulante Pflege", "OTA", "ATA", "Kinderpflege",
  "Physiotherapie", "Ergotherapie", "Logopädie"
];

export function StepDetails({ formData, updateFormData }: StepDetailsProps) {
  const { t } = useLanguage();

  const addRequirement = () => {
    const requirements = formData.requirements || [];
    updateFormData({ requirements: [...requirements, ""] });
  };

  const updateRequirement = (index: number, value: string) => {
    const requirements = [...(formData.requirements || [])];
    requirements[index] = value;
    updateFormData({ requirements });
  };

  const removeRequirement = (index: number) => {
    const requirements = (formData.requirements || []).filter((_: any, i: number) => i !== index);
    updateFormData({ requirements });
  };

  const toggleTag = (tag: string) => {
    const tags = formData.tags || [];
    if (tags.includes(tag)) {
      updateFormData({ tags: tags.filter((t: string) => t !== tag) });
    } else {
      updateFormData({ tags: [...tags, tag] });
    }
  };

  const toggleShiftType = (type: 'Tagschicht' | 'Spätschicht' | 'Nachtschicht') => {
    const current: string[] = Array.isArray(formData.shift_types) ? formData.shift_types : [];
    const updated = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type].slice(0, 2);
    // Persist array for UI; persist the first selected as single shift_type for schema
    updateFormData({
      shift_types: updated,
      shift_type: updated[0] || "",
    });
    const val = type === 'Tagschicht' ? 'day' : type === 'Spätschicht' ? 'late' : 'night';
    trackAnalyticsEvent('shift_selected', { value: val });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">{t("job.step2.title")}</h2>

      <div className="space-y-4">
        <div>
          <Label htmlFor="description">{t("job.field.description")} *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => updateFormData({ description: e.target.value })}
            placeholder={t("job.field.description_placeholder")}
            className="mt-1 min-h-[200px]"
          />
        </div>

        <div>
          <Label>{t("job.field.requirements")}</Label>
          <div className="space-y-2 mt-2">
            {(formData.requirements || []).map((req: string, index: number) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={req}
                  onChange={(e) => updateRequirement(index, e.target.value)}
                  placeholder={t("job.field.requirement_placeholder")}
                />
                <button
                  type="button"
                  onClick={() => removeRequirement(index)}
                  className="p-2 hover:bg-destructive/10 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addRequirement}
              className="text-sm text-primary hover:underline"
            >
              + {t("job.field.add_requirement")}
            </button>
          </div>
        </div>

        <div>
          <Label>{t("job.field.specialties")} *</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {SPECIALTY_TAGS.map((tag) => (
              <Badge
                key={tag}
                variant={(formData.tags || []).includes(tag) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleTag(tag)}
              >
                {t(`subcategory.${tag.toLowerCase().replace(/[\/\s]/g, "_")}`)}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <Label>{t("job.field.shift_type")}</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {['Tagschicht', 'Spätschicht', 'Nachtschicht'].map((type) => (
              <PillChip
                key={type}
                label={t(`shift_type.${type.toLowerCase().replace(/\s/g, '_')}`)}
                selected={(formData.shift_types || []).includes(type)}
                onClick={() => toggleShiftType(type as 'Tagschicht' | 'Spätschicht' | 'Nachtschicht')}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
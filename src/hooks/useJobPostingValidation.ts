"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";

export function useJobPostingValidation() {
  const { t } = useLanguage();

  const validateStep = (step: number, formData: any): boolean => {
    switch (step) {
      case 1:
        return !!(
          formData.title &&
          formData.city &&
          formData.state &&
          formData.facility_type
        );
      case 2:
        return !!(formData.description && formData.tags?.length > 0);
      case 3: {
        const validSalaryUnits = ["€/h", "€/Monat"];
        return !!(
          formData.salary_min &&
          formData.salary_max &&
          formData.salary_unit &&
          validSalaryUnits.includes(formData.salary_unit)
        );
      }
      case 4:
        return !!(
          formData.application_method &&
          (formData.application_method === "email"
            ? formData.application_email
            : formData.application_url)
        );
      case 5:
        return !!formData.acceptedTerms;
      default:
        return false;
    }
  };

  const showValidationError = () => {
    toast({
      title: t("error.required_fields"),
      variant: "destructive",
    });
  };

  return {
    validateStep,
    showValidationError,
  };
}
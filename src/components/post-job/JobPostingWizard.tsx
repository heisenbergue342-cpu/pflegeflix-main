"use client";

import React from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Save, Eye } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { StepBasics } from "./StepBasics";
import { StepDetails } from "./StepDetails";
import { StepCompensation } from "./StepCompensation";
import { StepApplication } from "./StepApplication";
import { StepPreview } from "./StepPreview";

interface JobPostingWizardProps {
  currentStep: number;
  totalSteps: number;
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  isEditing?: boolean;
  editingJobId?: string;
}

export function JobPostingWizard({
  currentStep,
  totalSteps,
  formData,
  updateFormData,
  onNext,
  onBack,
  onSaveDraft,
  onPublish,
  isEditing,
  editingJobId,
}: JobPostingWizardProps) {
  const { t } = useLanguage();

  // Safety check - if formData is not loaded yet
  if (!formData) {
    return (
      <div className="space-y-6">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Lade Formulardaten...</p>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepBasics
            formData={formData}
            updateFormData={updateFormData}
            isEditing={isEditing}
            editingJobId={editingJobId}
          />
        );
      case 2:
        return <StepDetails formData={formData} updateFormData={updateFormData} />;
      case 3:
        return <StepCompensation formData={formData} updateFormData={updateFormData} />;
      case 4:
        return <StepApplication formData={formData} updateFormData={updateFormData} />;
      case 5:
        return (
          <StepPreview
            formData={formData}
            updateFormData={updateFormData}
            onPublish={onPublish}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">
          {t("job.post.title") || "Post a Job"}
        </h1>
        <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
        <p className="text-sm text-muted-foreground mt-2">
          {t("job.post.step") || "Step"} {currentStep} {t("job.post.of") || "of"}{" "}
          {totalSteps}
        </p>
      </div>

      {/* Step Content */}
      <div className="bg-card rounded-lg border p-6">{renderStep()}</div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={currentStep === 1}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          {t("job.post.back") || "Back"}
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onSaveDraft}>
            <Save className="w-4 h-4 mr-2" />
            {t("job.post.save_draft") || "Save Draft"}
          </Button>

          {currentStep < totalSteps ? (
            <Button onClick={onNext}>
              {t("job.post.next") || "Next"}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={onPublish} disabled={!formData?.acceptedTerms}>
              <Eye className="w-4 h-4 mr-2" />
              {t("job.post.publish") || "Publish Job"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
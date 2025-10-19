"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface UpgradePromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpgrade: () => void;
  onManageJobs: () => void;
  activeCount?: number;
  limit?: number;
}

const UpgradePromptModal: React.FC<UpgradePromptModalProps> = ({
  open,
  onOpenChange,
  onUpgrade,
  onManageJobs,
  activeCount,
  limit,
}) => {
  const { t } = useLanguage();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("job.no_slots.title")}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("job.no_slots.description")}
            {typeof activeCount === "number" && typeof limit === "number" ? (
              <div className="mt-2 text-sm">
                {activeCount}/{limit} {t("dashboard.filter.online").toLowerCase()}
              </div>
            ) : null}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
          <div className="flex gap-2">
            <Button onClick={onManageJobs} variant="outline">
              {t("job.no_slots.manage_jobs")}
            </Button>
            <Button onClick={onUpgrade}>
              {t("job.no_slots.upgrade")}
            </Button>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default UpgradePromptModal;
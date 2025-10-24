"use client";

import React from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface PaywallScreenProps {
  subscriptionInfo: any;
}

export function PaywallScreen({ subscriptionInfo }: PaywallScreenProps) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background pt-20 pb-8">
      <div className="container max-w-4xl mx-auto px-4">
        <Card className="p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-orange-100 p-4">
              <AlertCircle className="w-16 h-16 text-orange-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-4">
            {t("job.no_slots.title") || "No Available Job Posting Slots"}
          </h1>
          <p className="text-lg text-muted-foreground mb-2">
            {t("job.no_slots.description") ||
              "You have reached your job posting limit for your current plan."}
          </p>
          {subscriptionInfo?.plan && (
            <p className="text-sm text-muted-foreground mb-8">
              Current plan: <strong>{subscriptionInfo.plan.name}</strong> (
              {subscriptionInfo.plan.max_active_jobs === -1
                ? "Unlimited"
                : `${subscriptionInfo.plan.max_active_jobs} active jobs`}
              )
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/employer/settings">
                {t("job.no_slots.upgrade") || "Upgrade Plan"}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/employer">
                {t("job.no_slots.manage_jobs") || "Manage Existing Jobs"}
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
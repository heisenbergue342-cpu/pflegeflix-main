"use client";

import React from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface PublishSuccessScreenProps {
  jobId: string;
  onPostAnother: () => void;
}

export function PublishSuccessScreen({ jobId, onPostAnother }: PublishSuccessScreenProps) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background pt-20 pb-8">
      <div className="container max-w-4xl mx-auto px-4">
        <Card className="p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-green-100 p-4">
              <CheckCircle2 className="w-16 h-16 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-4">
            {t("job.publish_success.title") || "Job Posted Successfully!"}
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            {t("job.publish_success.description") ||
              "Your job posting is now live and visible to candidates."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/employer">
                {t("job.publish_success.view_my_jobs") || "View My Jobs"}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to={`/job/${jobId}`}>
                {t("job.publish_success.view_posting") || "View Job Posting"}
              </Link>
            </Button>
            <Button variant="outline" size="lg" onClick={onPostAnother}>
              {t("job.publish_success.post_another") || "Post Another Job"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
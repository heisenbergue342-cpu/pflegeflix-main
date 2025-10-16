import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

const STAGES = ["submitted", "viewed", "interview", "offer", "rejected"] as const;

interface Application {
  id: string;
  user_id: string;
  stage: string;
  cover_letter: string | null;
  notes: string | null;
  created_at: string;
  viewed_at: string | null;
  profiles: {
    name: string;
    email: string;
    city: string | null;
    state: string | null;
  };
}

interface ApplicationsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string | null;
  jobTitle: string;
}

export default function ApplicationsDrawer({
  open,
  onOpenChange,
  jobId,
  jobTitle,
}: ApplicationsDrawerProps) {
  const { t, language } = useLanguage();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open && jobId) {
      loadApplications();
    }
  }, [open, jobId]);

  const loadApplications = async () => {
    if (!jobId) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("applications")
      .select(`
        id,
        user_id,
        stage,
        cover_letter,
        notes,
        created_at,
        viewed_at,
        profiles:user_id (
          name,
          email,
          city,
          state
        )
      `)
      .eq("job_id", jobId)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: t("error.load_failed"),
        variant: "destructive",
      });
    } else {
      setApplications(data || []);
    }
    setLoading(false);
  };

  const updateStage = async (appId: string, newStage: string) => {
    // Optimistic update
    setApplications((prev) =>
      prev.map((app) =>
        app.id === appId ? { ...app, stage: newStage } : app
      )
    );

    const { error } = await supabase
      .from("applications")
      .update({ stage: newStage })
      .eq("id", appId);

    if (error) {
      toast({
        title: t("error.update_failed"),
        variant: "destructive",
      });
      loadApplications(); // Revert on error
    } else {
      toast({
        title: t("dashboard.application.stage_updated"),
      });
    }
  };

  const saveNotes = async () => {
    if (!selectedApp) return;

    const { error } = await supabase
      .from("applications")
      .update({ notes })
      .eq("id", selectedApp.id);

    if (error) {
      toast({
        title: t("error.update_failed"),
        variant: "destructive",
      });
    } else {
      toast({
        title: t("dashboard.application.notes_saved"),
      });
      loadApplications();
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "submitted":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "viewed":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "interview":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "offer":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "rejected":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-muted";
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-3xl">
        <SheetHeader>
          <SheetTitle>{jobTitle}</SheetTitle>
          <p className="text-sm text-muted-foreground">
            {applications.length} {t("dashboard.applications")}
          </p>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">{t("loading")}</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground mb-2">
                {t("dashboard.no_applications")}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Kanban Columns */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {STAGES.map((stage) => {
                  const stageApps = applications.filter(
                    (app) => app.stage === stage
                  );
                  return (
                    <div key={stage} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">
                          {t(`dashboard.stage.${stage}`)}
                        </h3>
                        <Badge variant="outline" className="ml-2">
                          {stageApps.length}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {stageApps.map((app) => (
                          <Card
                            key={app.id}
                            className={`p-3 cursor-pointer transition-colors hover:bg-accent ${
                              selectedApp?.id === app.id ? "ring-2 ring-primary" : ""
                            }`}
                            onClick={() => {
                              setSelectedApp(app);
                              setNotes(app.notes || "");
                            }}
                          >
                            <p className="font-medium text-sm">
                              {app.profiles.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(app.created_at), {
                                addSuffix: true,
                                locale: language === "de" ? de : undefined,
                              })}
                            </p>
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Application Details */}
              {selectedApp && (
                <Card className="p-6 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      {selectedApp.profiles.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedApp.profiles.email}
                    </p>
                    {selectedApp.profiles.city && (
                      <p className="text-sm text-muted-foreground">
                        {selectedApp.profiles.city}, {selectedApp.profiles.state}
                      </p>
                    )}
                  </div>

                  {/* Stage Buttons */}
                  <div>
                    <p className="text-sm font-medium mb-2">
                      {t("dashboard.application.move_to")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {STAGES.map((stage) => (
                        <Button
                          key={stage}
                          size="sm"
                          variant={selectedApp.stage === stage ? "default" : "outline"}
                          onClick={() => updateStage(selectedApp.id, stage)}
                          className={
                            selectedApp.stage === stage ? getStageColor(stage) : ""
                          }
                        >
                          {t(`dashboard.stage.${stage}`)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Cover Letter */}
                  {selectedApp.cover_letter && (
                    <div>
                      <p className="text-sm font-medium mb-2">
                        {t("dashboard.application.cover_letter")}
                      </p>
                      <div className="bg-muted/50 rounded-lg p-4 text-sm whitespace-pre-wrap">
                        {selectedApp.cover_letter}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  <div>
                    <p className="text-sm font-medium mb-2">
                      {t("dashboard.application.notes")}
                    </p>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={t("dashboard.application.notes_placeholder")}
                      rows={4}
                    />
                    <Button
                      onClick={saveNotes}
                      size="sm"
                      className="mt-2"
                      disabled={notes === (selectedApp.notes || "")}
                    >
                      {t("dashboard.application.save_notes")}
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

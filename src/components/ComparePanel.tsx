import { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import JobPhotoGallery from "@/components/JobPhotoGallery";
import { estimateCommuteFromCities, CommuteMode } from "@/utils/commute";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";

interface ComparePanelProps {
  jobs: any[];
  selectedIds: string[];
  startCity?: string;
  mode?: CommuteMode;
  onStartCityChange: (city: string) => void;
  onModeChange: (mode: CommuteMode) => void;
  onClearSelection: () => void;
}

export default function ComparePanel({
  jobs,
  selectedIds,
  startCity,
  mode = "car",
  onStartCityChange,
  onModeChange,
  onClearSelection,
}: ComparePanelProps) {
  const { t, formatCurrency } = useLanguage();

  const selectedJobs = useMemo(
    () => jobs.filter((j) => selectedIds.includes(j.id)).slice(0, 3),
    [jobs, selectedIds],
  );

  if (selectedJobs.length === 0) return null;

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <h2 className="text-2xl font-bold text-white">{t("favorites.compare_panel_title")}</h2>
        <div className="flex items-center gap-2 ms-auto">
          <Input
            value={startCity || ""}
            onChange={(e) => onStartCityChange(e.target.value)}
            placeholder={t("search.commute.start")}
            className="w-48 bg-[#1A1A1B] border-[#2A2A2B] text-white"
            aria-label={t("search.commute.start")}
          />
          <div className="flex gap-2">
            <Button
              variant={mode === "car" ? "default" : "secondary"}
              onClick={() => onModeChange("car")}
              aria-label={t("search.commute.by_car")}
            >
              {t("search.commute.by_car")}
            </Button>
            <Button
              variant={mode === "transit" ? "default" : "secondary"}
              onClick={() => onModeChange("transit")}
              aria-label={t("search.commute.by_transit")}
            >
              {t("search.commute.by_transit")}
            </Button>
          </div>
          <Button variant="outline" onClick={onClearSelection} aria-label={t("favorites.compare_clear")}>
            {t("favorites.compare_clear")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {selectedJobs.map((job) => {
          const commuteMinutes =
            startCity ? estimateCommuteFromCities(startCity, job.city, mode) : null;

          return (
            <Card key={job.id} className="bg-netflix-card border-[#2A2A2B] text-white overflow-visible">
              <CardHeader>
                <CardTitle className="text-white">{job.title}</CardTitle>
                <div className="text-sm text-gray-300">{job.city}, {job.state}</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-gray-400">{t("job.salary_label")}</div>
                  <div className="font-semibold">
                    {job.salary_min && job.salary_max
                      ? `${formatCurrency(job.salary_min, job.salary_unit || "€/Monat")} – ${formatCurrency(job.salary_max, job.salary_unit || "€/Monat")}`
                      : t("job.by_agreement")}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-400">{t("job.shift_label")}</div>
                  <div className="font-semibold">{job.shift_type || t("search.no_info")}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-400">Benefits</div>
                  <div className="flex flex-wrap gap-2">
                    {job.housing ? <Badge variant="secondary" className="bg-white/10 text-white border-white/20">Housing</Badge> : null}
                    {job.bonus ? <Badge variant="secondary" className="bg-white/10 text-white border-white/20">{job.bonus}</Badge> : null}
                    {(job.tags || []).slice(0, 4).map((tag: string) => (
                      <Badge key={tag} variant="outline" className="bg-white/10 text-white border-white/20">{tag}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-400">{t("search.commute.estimated")}</div>
                  <div className="font-semibold">
                    {typeof commuteMinutes === "number"
                      ? `${commuteMinutes} ${t("search.commute.minutes_short")} (${mode === "car" ? t("search.commute.by_car") : t("search.commute.by_transit")})`
                      : t("search.no_info")}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-400">Media</div>
                  <JobPhotoGallery jobId={job.id} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const BUCKET = "job-photos";

export default function JobPhotoGallery({ jobId }: { jobId: string }) {
  const { t } = useLanguage();
  const [photos, setPhotos] = useState<string[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const list = async () => {
      const folder = `jobs/${jobId}`;
      const { data } = await supabase.storage.from(BUCKET).list(folder, { limit: 10 });
      const urls = (data || [])
        .filter((f) => !f.name.startsWith("."))
        .map((f) => supabase.storage.from(BUCKET).getPublicUrl(`${folder}/${f.name}`).data.publicUrl);
      setPhotos(urls);
      setIndex(0);
    };
    if (jobId) list();
  }, [jobId]);

  if (photos.length === 0) return null;

  const prev = () => setIndex((i) => (i - 1 + photos.length) % photos.length);
  const next = () => setIndex((i) => (i + 1) % photos.length);

  return (
    <div className="space-y-3" aria-label={t("common.gallery") || "Galerie"}>
      <Card className="relative overflow-hidden">
        <img
          src={photos[index]}
          alt={t("common.gallery_image_alt") || "Job Foto"}
          className="w-full h-64 object-cover"
        />
        <div className="absolute inset-y-0 left-0 flex items-center">
          <Button variant="ghost" size="icon" onClick={prev} aria-label={t("common.previous") || "Zurück"}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center">
          <Button variant="ghost" size="icon" onClick={next} aria-label={t("common.next") || "Weiter"}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </Card>
      <div className="flex gap-2 overflow-x-auto" role="list" aria-label={t("common.thumbnails") || "Vorschaubilder"}>
        {photos.map((url, i) => (
          <button
            key={url}
            onClick={() => setIndex(i)}
            role="listitem"
            className={`h-16 w-24 overflow-hidden rounded-md border ${i === index ? "border-netflix-red" : "border-border"}`}
            aria-label={`${t("common.thumbnail")} ${i + 1}`}
          >
            <img src={url} alt={`${t("common.thumbnail")} ${i + 1}`} className="h-16 w-24 object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
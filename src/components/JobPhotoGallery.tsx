"use client";

import React, { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { JOB_PHOTOS_BUCKET } from "@/utils/storage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const BUCKET = JOB_PHOTOS_BUCKET;

type MetaItem = {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  isCover?: boolean;
};

export default function JobPhotoGallery({ jobId }: { jobId: string }) {
  const { t } = useLanguage();
  const [photos, setPhotos] = useState<MetaItem[]>([]);
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const list = async () => {
      const folder = `jobs/${jobId}`;
      // Try metadata.json first
      const { data: metaBlob } = await supabase.storage.from(BUCKET).download(`${folder}/metadata.json`);
      if (metaBlob) {
        try {
          const text = await metaBlob.text();
          const parsed = JSON.parse(text) as MetaItem[];
          // Ensure cover is first
          const ordered = [...parsed].sort((a, b) => (b.isCover ? 1 : 0) - (a.isCover ? 1 : 0));
          setPhotos(ordered);
          setIndex(0);
          return;
        } catch {
          // fallback to folder listing
        }
      }
      const { data } = await supabase.storage.from(BUCKET).list(folder, { limit: 10 });
      const urls = (data || [])
        .filter((f) => !f.name.startsWith(".") && f.name !== "metadata.json")
        .map((f) => ({ url: supabase.storage.from(BUCKET).getPublicUrl(`${folder}/${f.name}`).data.publicUrl }));
      setPhotos(urls);
      setIndex(0);
    };
    if (jobId) list();
  }, [jobId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (photos.length === 0) return null;

  const prev = () => setIndex((i) => (i - 1 + photos.length) % photos.length);
  const next = () => setIndex((i) => (i + 1) % photos.length);

  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const start = touchStartX.current;
    touchStartX.current = null;
    if (start == null) return;
    const end = e.changedTouches[0].clientX;
    const delta = end - start;
    if (delta > 40) prev();
    else if (delta < -40) next();
  };

  const current = photos[index];

  return (
    <div className="space-y-3" aria-label={t("common.gallery")}>
      <Card className="relative overflow-hidden" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <img
          src={current.url}
          alt={current.alt || t("common.gallery_image_alt")}
          className="w-full h-64 object-cover"
          loading="lazy"
          width={current.width}
          height={current.height}
        />
        <div className="absolute inset-y-0 left-0 flex items-center">
          <Button variant="ghost" size="icon" onClick={prev} aria-label={t("common.previous")}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center">
          <Button variant="ghost" size="icon" onClick={next} aria-label={t("common.next")}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </Card>
      <div className="flex gap-2 overflow-x-auto" role="list" aria-label={t("common.thumbnails")}>
        {photos.map((p, i) => (
          <button
            key={`${p.url}-${i}`}
            onClick={() => setIndex(i)}
            role="listitem"
            className={`h-16 w-24 overflow-hidden rounded-md border ${i === index ? "border-netflix-red" : "border-border"} focus:ring-2 focus:ring-[hsl(var(--focus-outline))]`}
            aria-label={`${t("common.thumbnail")} ${i + 1}`}
          >
            <img src={p.url} alt={`${t("common.thumbnail")} ${i + 1}`} className="h-16 w-24 object-cover" loading="lazy" />
          </button>
        ))}
      </div>
    </div>
  );
}
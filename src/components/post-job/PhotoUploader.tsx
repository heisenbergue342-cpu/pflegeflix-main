"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { X, UploadCloud } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

type UploadedPhoto = {
  name: string;
  path: string;
  url: string;
};

const BUCKET = "job-photos";

export default function PhotoUploader() {
  const { t } = useLanguage();
  const { draftId } = useParams();
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [uploading, setUploading] = useState(false);

  const basePath = useMemo(() => {
    return draftId ? `drafts/${draftId}` : "drafts/temp";
  }, [draftId]);

  const listExisting = async () => {
    const { data, error } = await supabase.storage.from(BUCKET).list(basePath, { limit: 20 });
    if (error) return;
    const mapped: UploadedPhoto[] = (data || [])
      .filter((f) => !f.name.startsWith("."))
      .map((f) => {
        const publicUrl = supabase.storage.from(BUCKET).getPublicUrl(`${basePath}/${f.name}`).data.publicUrl;
        return { name: f.name, path: `${basePath}/${f.name}`, url: publicUrl };
      });
    setPhotos(mapped);
  };

  useEffect(() => {
    listExisting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basePath]);

  const onFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const currentCount = photos.length;
    const allowed = Math.max(0, 5 - currentCount);
    const filesArr = Array.from(files).slice(0, allowed);
    if (filesArr.length === 0) return;

    setUploading(true);
    for (const file of filesArr) {
      const ext = file.name.split(".").pop() || "jpg";
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      await supabase.storage.from(BUCKET).upload(`${basePath}/${filename}`, file, {
        cacheControl: "3600",
        upsert: false,
      });
    }
    setUploading(false);
    await listExisting();
  };

  const removePhoto = async (photo: UploadedPhoto) => {
    await supabase.storage.from(BUCKET).remove([photo.path]);
    await listExisting();
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{t("common.upload_photos") || "Fotos hochladen (optional)"}</Label>
      <p className="text-sm text-muted-foreground">{t("common.upload_photos_hint") || "Bis zu 5 Fotos. Unterstützte Formate: JPG, PNG."}</p>
      <div className="flex items-center gap-3">
        <input
          id="job-photos-input"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => onFilesSelected(e.target.files)}
          className="hidden"
        />
        <Button
          type="button"
          onClick={() => document.getElementById("job-photos-input")?.click()}
          disabled={uploading || photos.length >= 5}
          className="gap-2"
        >
          <UploadCloud className="h-4 w-4" />
          {uploading ? (t("loading") || "Laden...") : (t("common.upload") || "Hochladen")}
        </Button>
        <span className="text-sm text-muted-foreground">{photos.length}/5</span>
      </div>

      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {photos.map((p) => (
            <Card key={p.path} className="relative overflow-hidden">
              <img
                src={p.url}
                alt="Job photo"
                className="h-32 w-full object-cover"
                loading="lazy"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1 bg-black/40 text-white hover:bg-black/60"
                onClick={() => removePhoto(p)}
                aria-label={t("common.remove_item", { item: "Foto" })}
              >
                <X className="h-4 w-4" />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
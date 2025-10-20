"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { X, UploadCloud, ArrowUpCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

type UploadedPhoto = {
  name: string;
  path: string;
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  isCover?: boolean;
};

interface PhotoUploaderProps {
  mode?: 'draft' | 'job';
  idOverride?: string;
}

const BUCKET = import.meta.env.VITE_SUPABASE_BUCKET_JOB_PHOTOS || "job-photos";
const SIGNED_URL_SECONDS = Number(import.meta.env.VITE_SUPABASE_SIGNED_URL_SECONDS || 604800); // 7 Tage
const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILES = 5;
const MAX_SIZE = 5 * 1024 * 1024;

export default function PhotoUploader({ mode = 'draft', idOverride }: PhotoUploaderProps) {
  const { t } = useLanguage();
  const { draftId } = useParams();
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const dragSrcIndex = useRef<number | null>(null);

  const basePath = useMemo(() => {
    if (mode === 'job' && idOverride) return `jobs/${idOverride}`;
    if (mode === 'draft' && idOverride) return `drafts/${idOverride}`;
    return draftId ? `drafts/${draftId}` : "drafts/temp";
  }, [mode, idOverride, draftId]);

  const saveMetadata = async (list: UploadedPhoto[]) => {
    const payload = list.map(p => ({
      name: p.name,
      path: p.path,
      url: p.url,
      alt: p.alt || "",
      width: p.width || undefined,
      height: p.height || undefined,
      isCover: !!p.isCover,
    }));
    const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(`${basePath}/metadata.json`, blob, { upsert: true, contentType: "application/json" });
    if (error) {
      toast.error(`${t("common.upload_error_network")} (${error.message})`);
    }
  };

  const loadMetadata = async (): Promise<UploadedPhoto[] | null> => {
    const { data, error } = await supabase.storage.from(BUCKET).download(`${basePath}/metadata.json`);
    if (!data) return null;
    try {
      const text = await data.text();
      const parsed = JSON.parse(text) as UploadedPhoto[];
      return parsed;
    } catch {
      return null;
    }
  };

  const listExisting = async () => {
    const meta = await loadMetadata();
    if (meta && meta.length) {
      setPhotos(meta);
      return;
    }
    const { data } = await supabase.storage.from(BUCKET).list(basePath, { limit: 20 });
    const files = (data || []).filter((f) => !f.name.startsWith(".") && f.name !== "metadata.json");
    const mapped: UploadedPhoto[] = [];
    for (let idx = 0; idx < files.length; idx++) {
      const f = files[idx];
      const path = `${basePath}/${f.name}`;
      const { data: signed, error: signedError } = await supabase.storage.from(BUCKET).createSignedUrl(path, SIGNED_URL_SECONDS);
      const url = !signedError && signed?.signedUrl
        ? signed.signedUrl
        : supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
      mapped.push({ name: f.name, path, url, isCover: idx === 0 });
    }
    setPhotos(mapped);
    if (mapped.length) await saveMetadata(mapped);
  };

  useEffect(() => {
    listExisting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basePath]);

  const getImageDimensionsFromBlob = (blob: Blob): Promise<{ width: number; height: number }> =>
    new Promise((resolve) => {
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
        URL.revokeObjectURL(url);
      };
      img.src = url;
    });

  const fileToDataURL = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const convertToWebP = async (file: File): Promise<Blob> => {
    if (file.type === "image/webp") return file;
    const dataUrl = await fileToDataURL(file);
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = rej;
      img.src = dataUrl;
    });
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(img, 0, 0);
    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/webp", 0.85)
    );
    return blob || file;
  };

  const validateFiles = (files: File[]) => {
    for (const file of files) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error(`${t("common.upload_error_type")} (${file.name})`);
        return false;
      }
      if (file.size > MAX_SIZE) {
        toast.error(`${t("common.upload_error_size")} (${file.name})`);
        return false;
      }
    }
    return true;
  };

  // Check bucket/path availability before uploading to show actionable errors
  const preflightStorage = async (): Promise<string | null> => {
    const { error } = await supabase.storage.from(BUCKET).list(basePath, { limit: 1 });
    if (error) return error.message;
    return null;
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const preflightError = await preflightStorage();
    if (preflightError) {
      toast.error(`${t("common.upload_error_network")} (${preflightError})`);
      return;
    }
    const currentCount = photos.length;
    const allowed = Math.max(0, MAX_FILES - currentCount);
    const filesArr = Array.from(files).slice(0, allowed);
    if (filesArr.length === 0) return;

    if (!validateFiles(filesArr)) return;

    setUploading(true);
    setProgress(0);

    const newPhotos: UploadedPhoto[] = [];
    for (let i = 0; i < filesArr.length; i++) {
      const file = filesArr[i];
      // Step 1: convert (or pass-through)
      setProgress(Math.round(((i + 0.2) / filesArr.length) * 100));
      const processedBlob = await convertToWebP(file);
      // Step 2: upload
      const ext = "webp";
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const path = `${basePath}/${filename}`;
      setProgress(Math.round(((i + 0.5) / filesArr.length) * 100));
      const { error } = await supabase.storage.from(BUCKET).upload(path, processedBlob, {
        cacheControl: "3600",
        upsert: false,
        contentType: "image/webp",
      });
      if (error) {
        toast.error(`${t("common.upload_error_network")} (${error.message})`);
        continue;
      }
      // Step 3: public or signed URL + dimensions
      const { data: signed, error: signedError } = await supabase.storage.from(BUCKET).createSignedUrl(path, SIGNED_URL_SECONDS);
      const publicUrl = !signedError && signed?.signedUrl
        ? signed.signedUrl
        : supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
      const dims = await getImageDimensionsFromBlob(processedBlob);
      newPhotos.push({
        name: filename,
        path,
        url: publicUrl,
        width: dims.width,
        height: dims.height,
      });
      setProgress(Math.round(((i + 1) / filesArr.length) * 100));
    }

    const updated = [...photos, ...newPhotos].slice(0, MAX_FILES);
    if (updated.length) {
      updated.forEach((p, i) => (p.isCover = i === 0));
    }
    setPhotos(updated);
    await saveMetadata(updated);
    setUploading(false);
  };

  const onRemove = async (index: number) => {
    const p = photos[index];
    if (!p) return;
    const { error } = await supabase.storage.from(BUCKET).remove([p.path]);
    if (error) {
      toast.error(`${t("common.upload_error_network")} (${error.message})`);
      return;
    }
    const next = photos.filter((_, i) => i !== index);
    if (next.length) next.forEach((ph, i) => (ph.isCover = i === 0));
    setPhotos(next);
    await saveMetadata(next);
  };

  const onDragStart = (index: number) => { dragSrcIndex.current = index; };
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); };
  const onDrop = async (index: number) => {
    const src = dragSrcIndex.current;
    dragSrcIndex.current = null;
    if (src == null || src === index) return;
    const next = [...photos];
    const [moved] = next.splice(src, 1);
    next.splice(index, 0, moved);
    next.forEach((ph, i) => (ph.isCover = i === 0));
    setPhotos(next);
    await saveMetadata(next);
  };

  const setAsCover = async (index: number) => {
    if (index === 0) return;
    const next = [...photos];
    const [moved] = next.splice(index, 1);
    next.unshift(moved);
    next.forEach((ph, i) => (ph.isCover = i === 0));
    setPhotos(next);
    await saveMetadata(next);
  };

  const updateAlt = async (index: number, alt: string) => {
    const next = [...photos];
    next[index] = { ...next[index], alt };
    setPhotos(next);
    await saveMetadata(next);
  };

  const onDragEnterZone = () => setDragActive(true);
  const onDragLeaveZone = () => setDragActive(false);
  const onDropZone = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const files = e.dataTransfer.files;
    await handleFiles(files);
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{t("common.upload_photos")}</Label>
      <p className="text-sm text-muted-foreground">{t("common.upload_photos_hint")}</p>

      <div
        className={`flex items-center gap-3 p-3 border rounded-md ${dragActive ? "border-netflix-red bg-netflix-red/10" : "border-border"}`}
        onDragEnter={onDragEnterZone}
        onDragOver={onDragOver}
        onDragLeave={onDragLeaveZone}
        onDrop={onDropZone}
        aria-label={t("common.upload_photos")}
      >
        <input
          id="job-photos-input"
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
        <Button
          type="button"
          onClick={() => document.getElementById("job-photos-input")?.click()}
          disabled={uploading || photos.length >= MAX_FILES}
          className="gap-2"
        >
          <UploadCloud className="h-4 w-4" />
          {uploading ? t("loading") : t("common.upload")}
        </Button>
        <span className="text-sm text-muted-foreground">
          {t("common.upload_counter", { count: photos.length })}
        </span>
        <span className="ml-auto text-xs text-muted-foreground">
          {dragActive ? "Drop to upload" : "Drag & drop images here"}
        </span>
      </div>

      {uploading && (
        <div className="space-y-2">
          <Progress value={progress} />
          <p className="text-xs text-muted-foreground">{progress}%</p>
        </div>
      )}

      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {photos.map((p, idx) => (
            <Card
              key={p.path}
              className="relative overflow-hidden group focus-within:ring-2 focus-within:ring-[hsl(var(--focus-outline))]"
              draggable
              onDragStart={() => onDragStart(idx)}
              onDragOver={onDragOver}
              onDrop={() => onDrop(idx)}
            >
              <img
                src={p.url}
                alt={p.alt || t("common.gallery_image_alt")}
                className="h-32 w-full object-cover"
                loading="lazy"
                width={p.width}
                height={p.height}
              />
              {idx === 0 && (
                <div className="absolute top-1 left-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                  Cover
                </div>
              )}
              <div className="absolute top-1 right-1 flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="bg-black/40 text-white hover:bg-black/60"
                  onClick={() => setAsCover(idx)}
                  aria-label="Set as cover"
                >
                  <ArrowUpCircle className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="bg-black/40 text-white hover:bg-black/60"
                  onClick={() => onRemove(idx)}
                  aria-label={t("common.remove_item", { item: "Foto" })}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-2 bg-background">
                <label className="sr-only">Alt</label>
                <input
                  type="text"
                  value={p.alt || ""}
                  onChange={(e) => updateAlt(idx, e.target.value)}
                  placeholder="Alt-Text"
                  className="w-full bg-muted text-sm rounded px-2 py-1"
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
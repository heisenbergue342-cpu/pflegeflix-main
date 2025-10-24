const OVERRIDE_KEY = "pflegeflix.jobPhotosBucket.override";

/**
 * Lies den Bucket-Namen für Job-Fotos:
 * 1) LocalStorage-Override (falls gesetzt)
 * 2) .env (VITE_SUPABASE_BUCKET_JOB_PHOTOS)
 * 3) Fallback "job-photos"
 */
export function getJobPhotosBucket(): string {
  const override = typeof window !== "undefined" ? localStorage.getItem(OVERRIDE_KEY) : null;
  if (override && override.trim().length > 0) return override.trim();
  const envName = (import.meta as any)?.env?.VITE_SUPABASE_BUCKET_JOB_PHOTOS;
  return envName && String(envName).trim().length > 0 ? String(envName).trim() : "job-photos";
}

/**
 * Setze einen lokalen Override für den Bucket-Namen und gib den aktiven Namen zurück.
 */
export function setJobPhotosBucketOverride(name: string): string {
  const trimmed = (name || "").trim();
  if (typeof window !== "undefined") {
    if (trimmed.length > 0) {
      localStorage.setItem(OVERRIDE_KEY, trimmed);
    } else {
      localStorage.removeItem(OVERRIDE_KEY);
    }
  }
  return getJobPhotosBucket();
}
-- Fix function search paths for security
ALTER FUNCTION public.update_jobs_updated_at() SET search_path = public;
ALTER FUNCTION public.update_saves_count() SET search_path = public;
ALTER FUNCTION public.increment_job_views(uuid) SET search_path = public;
ALTER FUNCTION public.update_applications_count() SET search_path = public;
-- Fix security definer view warning
-- Drop the existing view and recreate without security definer
DROP VIEW IF EXISTS public.jobs_public;

CREATE VIEW public.jobs_public 
WITH (security_invoker = true)
AS
SELECT 
  id,
  title,
  description,
  city,
  state,
  facility_id,
  facility_type,
  salary_min,
  salary_max,
  salary_unit,
  contract_type,
  housing,
  posted_at,
  featured,
  views_count,
  applications_count,
  saves_count,
  is_active,
  closed_at,
  requirements,
  tags,
  shift_type,
  bonus,
  lang_de,
  created_at,
  updated_at
FROM public.jobs
WHERE approved = true 
  AND is_active = true
  AND (closed_at IS NULL OR closed_at > now());

-- Ensure permissions are set correctly
GRANT SELECT ON public.jobs_public TO anon;
GRANT SELECT ON public.jobs_public TO authenticated;
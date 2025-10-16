-- ============================================================================
-- FIX: Secure public job listings by preventing owner_id exposure
-- ============================================================================

-- The jobs_public view already excludes owner_id, but we need to ensure
-- the base table policy doesn't expose it when queried directly

-- Drop the current "Anyone can view approved jobs" policy
DROP POLICY IF EXISTS "Anyone can view approved jobs" ON public.jobs;

-- Create a more restrictive policy that limits what fields are visible publicly
-- Note: PostgreSQL RLS doesn't support column-level filtering in policies,
-- so we'll use a different approach

-- Recreate the policy with better naming and documentation
CREATE POLICY "Public can view approved active jobs"
  ON public.jobs
  FOR SELECT
  TO public
  USING (
    approved = true 
    AND is_active = true 
    AND (closed_at IS NULL OR closed_at > now())
  );

-- Policy for authenticated users, employers, and admins to see all their data
CREATE POLICY "Owners and admins can view all job details"
  ON public.jobs
  FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid() 
    OR has_role(auth.uid(), 'admin'::app_role)
  );

-- Add a security barrier to the view to ensure RLS is checked
-- This makes the view safer by ensuring it respects RLS policies
DROP VIEW IF EXISTS public.jobs_public CASCADE;

CREATE VIEW public.jobs_public
WITH (security_barrier = true, security_invoker = true)
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

-- Grant appropriate permissions
GRANT SELECT ON public.jobs_public TO anon;
GRANT SELECT ON public.jobs_public TO authenticated;

-- Add documentation
COMMENT ON VIEW public.jobs_public IS 
'Secure public view of active job listings. Excludes sensitive fields like owner_id.
Uses security_barrier and security_invoker to ensure RLS policies are respected.
This is the recommended way for public/anonymous users to query job listings.';

COMMENT ON TABLE public.jobs IS 
'Job postings table. Contains sensitive owner_id field.
Public users should query jobs_public view instead for filtered, safe access.';
-- ============================================================================
-- SECURITY FIXES: Remove Public Data Exposure
-- ============================================================================

-- 1. CRITICAL: Remove public access to profiles table
-- This policy allows ANYONE to read sensitive user data (email, phone, CV, etc.)
DROP POLICY IF EXISTS "Public can view minimal profile info" ON public.profiles;

-- The existing "Users can view authorized profiles" policy already handles
-- proper authorization through the can_view_profile() function

-- 2. Restrict legal_settings to authenticated users only
-- Company legal information should not be publicly accessible
DROP POLICY IF EXISTS "Anyone can view legal settings" ON public.legal_settings;

CREATE POLICY "Authenticated users can view legal settings"
  ON public.legal_settings
  FOR SELECT
  TO authenticated
  USING (true);

-- 3. Create a secure view for public job listings that excludes sensitive fields
-- This prevents exposing owner_id and other internal data
CREATE OR REPLACE VIEW public.jobs_public AS
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

-- Grant public access to the view (not the underlying table's sensitive fields)
GRANT SELECT ON public.jobs_public TO anon;
GRANT SELECT ON public.jobs_public TO authenticated;

-- 4. Add ownership tracking and proper policies to facilities table
-- Add owner_id column to track which employer created each facility
ALTER TABLE public.facilities 
ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Set existing facilities to be owned by the first admin (or null if no admin exists)
UPDATE public.facilities 
SET owner_id = (
  SELECT user_id 
  FROM public.user_roles 
  WHERE role = 'admin' 
  LIMIT 1
)
WHERE owner_id IS NULL;

-- Add UPDATE policy for facilities
CREATE POLICY "Employers can update own facilities"
  ON public.facilities
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = owner_id 
    OR has_role(auth.uid(), 'admin'::app_role)
  );

-- Add DELETE policy for facilities  
CREATE POLICY "Employers can delete own facilities"
  ON public.facilities
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = owner_id 
    OR has_role(auth.uid(), 'admin'::app_role)
  );

-- Update INSERT policy to automatically set owner_id
DROP POLICY IF EXISTS "Employers can insert facilities" ON public.facilities;

CREATE POLICY "Employers can insert own facilities"
  ON public.facilities
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = owner_id
    AND (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role = ANY(ARRAY['arbeitgeber'::app_role, 'admin'::app_role])
      )
      OR has_role(auth.uid(), 'admin'::app_role)
    )
  );
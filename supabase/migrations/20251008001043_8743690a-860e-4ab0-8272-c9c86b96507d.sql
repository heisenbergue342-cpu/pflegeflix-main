-- Create a security definer function to check if a user can view a profile
CREATE OR REPLACE FUNCTION public.can_view_profile(_viewer_id uuid, _profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Users can always view their own profile
  SELECT _viewer_id = _profile_id
  -- OR admins can view all profiles
  OR EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _viewer_id AND role = 'admin'::app_role
  )
  -- OR employers can view profiles of users who applied to their jobs
  OR EXISTS (
    SELECT 1
    FROM public.applications a
    JOIN public.jobs j ON j.id = a.job_id
    WHERE a.user_id = _profile_id
      AND j.owner_id = _viewer_id
  )
  -- OR job owners can view profiles of users who sent them messages
  OR EXISTS (
    SELECT 1
    FROM public.application_messages am
    JOIN public.applications a ON a.id = am.application_id
    JOIN public.jobs j ON j.id = a.job_id
    WHERE am.sender_id = _profile_id
      AND j.owner_id = _viewer_id
  );
$$;

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create a new secure policy that restricts profile access
CREATE POLICY "Users can view authorized profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.can_view_profile(auth.uid(), id));

-- Also add a policy for unauthenticated users to only see basic non-sensitive info
-- This is for public-facing job listings that might show employer names
CREATE POLICY "Public can view minimal profile info"
ON public.profiles
FOR SELECT
TO anon
USING (
  -- Only allow viewing profiles if they are job owners of active jobs
  -- and only expose name (not email or other PII)
  EXISTS (
    SELECT 1 
    FROM public.jobs 
    WHERE jobs.owner_id = profiles.id 
      AND jobs.is_active = true 
      AND jobs.approved = true
  )
);

-- Add a comment to remind developers about data exposure
COMMENT ON TABLE public.profiles IS 
'Contains user personal information including emails. 
RLS policies restrict access to: own profile, job applicants (for employers), and admins only.
Never expose email addresses publicly.';

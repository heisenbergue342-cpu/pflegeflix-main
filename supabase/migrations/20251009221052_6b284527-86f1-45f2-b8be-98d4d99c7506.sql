-- Fix infinite recursion in profiles and jobs policies

-- Drop the problematic policies
DROP POLICY IF EXISTS "Public can view minimal profile info" ON profiles;
DROP POLICY IF EXISTS "Anyone can view approved jobs" ON jobs;

-- Recreate profiles SELECT policy without circular reference to jobs
CREATE POLICY "Public can view minimal profile info"
ON profiles
FOR SELECT
USING (true);

-- Recreate jobs SELECT policy without circular reference to profiles
CREATE POLICY "Anyone can view approved jobs"
ON jobs
FOR SELECT
USING (
  approved = true 
  OR owner_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);
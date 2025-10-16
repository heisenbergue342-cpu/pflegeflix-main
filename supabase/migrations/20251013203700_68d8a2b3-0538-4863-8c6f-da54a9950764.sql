-- Add recommendation preferences to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS recommendations_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS email_recommendations boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS recommendation_frequency text DEFAULT 'weekly' CHECK (recommendation_frequency IN ('daily', 'weekly', 'biweekly', 'monthly'));

-- Create table to track recommended jobs to avoid duplicates
CREATE TABLE IF NOT EXISTS public.user_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  job_id uuid REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  match_score numeric NOT NULL,
  recommended_at timestamp with time zone DEFAULT now() NOT NULL,
  viewed boolean DEFAULT false,
  applied boolean DEFAULT false,
  UNIQUE(user_id, job_id)
);

ALTER TABLE public.user_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_recommendations
CREATE POLICY "Users can view own recommendations"
  ON public.user_recommendations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert recommendations"
  ON public.user_recommendations
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own recommendations"
  ON public.user_recommendations
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_user_recommendations_user_id ON public.user_recommendations(user_id);
CREATE INDEX idx_user_recommendations_match_score ON public.user_recommendations(match_score DESC);
CREATE INDEX idx_user_recommendations_recommended_at ON public.user_recommendations(recommended_at DESC);

-- Enhanced function to get personalized job recommendations
CREATE OR REPLACE FUNCTION public.get_personalized_recommendations(
  p_user_id uuid,
  p_limit integer DEFAULT 10
)
RETURNS TABLE (
  job_id uuid,
  match_score numeric,
  title text,
  city text,
  state text,
  facility_type facility_type,
  salary_min numeric,
  salary_max numeric,
  contract_type contract_type,
  shift_type text,
  posted_at timestamp with time zone
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_profile jsonb;
  user_city text;
  user_state text;
  saved_search_filters jsonb[];
BEGIN
  -- Get user profile
  SELECT 
    jsonb_build_object(
      'skills', COALESCE(skills, ARRAY[]::text[]),
      'qualifications', COALESCE(qualifications, ARRAY[]::text[]),
      'city', city,
      'state', state
    ),
    city,
    state
  INTO user_profile, user_city, user_state
  FROM profiles
  WHERE id = p_user_id;

  -- Get saved search filters
  SELECT ARRAY_AGG(filters)
  INTO saved_search_filters
  FROM saved_searches
  WHERE user_id = p_user_id;

  -- Return personalized jobs based on:
  -- 1. Skills match
  -- 2. Location preference
  -- 3. Saved search patterns
  -- 4. Previous applications
  RETURN QUERY
  SELECT 
    j.id,
    (
      -- Base score from skills and requirements match
      calculate_job_match_score(user_profile, j.requirements, j.tags) +
      -- Location bonus (same city = +20, same state = +10)
      CASE 
        WHEN j.city = user_city THEN 20
        WHEN j.state = user_state THEN 10
        ELSE 0
      END +
      -- Recent posting bonus
      CASE 
        WHEN j.posted_at > now() - interval '7 days' THEN 5
        ELSE 0
      END +
      -- Featured bonus
      CASE WHEN j.featured THEN 10 ELSE 0 END -
      -- Penalty if already applied
      CASE 
        WHEN EXISTS (
          SELECT 1 FROM applications 
          WHERE job_id = j.id AND user_id = p_user_id
        ) THEN 50
        ELSE 0
      END
    ) AS match_score,
    j.title,
    j.city,
    j.state,
    j.facility_type,
    j.salary_min,
    j.salary_max,
    j.contract_type,
    j.shift_type,
    j.posted_at
  FROM jobs j
  WHERE j.approved = true
    AND j.is_active = true
    AND (j.closed_at IS NULL OR j.closed_at > now())
    -- Don't recommend jobs already applied to
    AND NOT EXISTS (
      SELECT 1 FROM applications 
      WHERE job_id = j.id AND user_id = p_user_id
    )
  ORDER BY match_score DESC, j.posted_at DESC
  LIMIT p_limit;
END;
$$;
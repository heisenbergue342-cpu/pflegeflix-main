-- Create storage bucket for CVs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cvs',
  'cvs',
  false,
  5242880, -- 5MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- RLS policies for CV storage
CREATE POLICY "Users can upload their own CV"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'cvs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own CV"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'cvs' 
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR EXISTS (
      SELECT 1 FROM public.applications a
      JOIN public.jobs j ON j.id = a.job_id
      WHERE a.user_id::text = (storage.foldername(name))[1]
      AND j.owner_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can update their own CV"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'cvs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own CV"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'cvs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add candidate profile fields
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS cv_url text,
ADD COLUMN IF NOT EXISTS qualifications text[],
ADD COLUMN IF NOT EXISTS languages jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS availability jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS phone text;

-- Create subscription plans enum
CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'enterprise');

-- Create subscription plans table
CREATE TABLE public.subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tier subscription_tier NOT NULL UNIQUE,
  name text NOT NULL,
  price_monthly numeric NOT NULL,
  price_yearly numeric,
  max_active_jobs integer NOT NULL,
  features jsonb DEFAULT '[]'::jsonb,
  stripe_price_id_monthly text,
  stripe_price_id_yearly text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view subscription plans"
ON public.subscription_plans
FOR SELECT
USING (true);

-- Insert default subscription plans
INSERT INTO public.subscription_plans (tier, name, price_monthly, price_yearly, max_active_jobs, features) VALUES
('free', 'Free', 0, 0, 2, '["2 active job postings", "Basic analytics", "Email notifications"]'::jsonb),
('pro', 'Professional', 49, 470, 10, '["10 active job postings", "Advanced analytics", "Priority support", "Featured job listings", "Email notifications"]'::jsonb),
('enterprise', 'Enterprise', 199, 1990, -1, '["Unlimited job postings", "Advanced analytics", "Dedicated support", "Featured job listings", "API access", "Custom branding"]'::jsonb);

-- Create employer subscriptions table
CREATE TABLE public.employer_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id uuid REFERENCES public.subscription_plans(id) NOT NULL,
  stripe_subscription_id text UNIQUE,
  stripe_customer_id text,
  status text DEFAULT 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(employer_id)
);

ALTER TABLE public.employer_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employers can view own subscription"
ON public.employer_subscriptions
FOR SELECT
USING (auth.uid() = employer_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "System can manage subscriptions"
ON public.employer_subscriptions
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Create function to get employer active job count
CREATE OR REPLACE FUNCTION public.get_employer_active_job_count(employer_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer
  FROM public.jobs
  WHERE owner_id = employer_id
  AND is_active = true
  AND (closed_at IS NULL OR closed_at > now());
$$;

-- Create function to check if employer can post job
CREATE OR REPLACE FUNCTION public.can_employer_post_job(employer_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_jobs integer;
  max_jobs integer;
  subscription_status text;
BEGIN
  -- Get current active jobs
  current_jobs := public.get_employer_active_job_count(employer_id);
  
  -- Get subscription details
  SELECT sp.max_active_jobs, COALESCE(es.status, 'active')
  INTO max_jobs, subscription_status
  FROM public.employer_subscriptions es
  JOIN public.subscription_plans sp ON sp.id = es.plan_id
  WHERE es.employer_id = can_employer_post_job.employer_id;
  
  -- If no subscription, use free plan limits
  IF max_jobs IS NULL THEN
    SELECT sp.max_active_jobs INTO max_jobs
    FROM public.subscription_plans sp
    WHERE sp.tier = 'free';
  END IF;
  
  -- -1 means unlimited
  IF max_jobs = -1 THEN
    RETURN subscription_status = 'active';
  END IF;
  
  RETURN current_jobs < max_jobs AND subscription_status = 'active';
END;
$$;

-- Create job analytics table
CREATE TABLE public.job_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}'::jsonb,
  user_id uuid,
  session_id text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.job_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Job owners can view analytics"
ON public.job_analytics
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.jobs
    WHERE jobs.id = job_analytics.job_id
    AND jobs.owner_id = auth.uid()
  ) OR has_role(auth.uid(), 'admin')
);

CREATE POLICY "Anyone can insert analytics"
ON public.job_analytics
FOR INSERT
WITH CHECK (true);

-- Create index for analytics queries
CREATE INDEX idx_job_analytics_job_id ON public.job_analytics(job_id);
CREATE INDEX idx_job_analytics_created_at ON public.job_analytics(created_at);
CREATE INDEX idx_job_analytics_event_type ON public.job_analytics(event_type);

-- Create function to calculate job recommendation score
CREATE OR REPLACE FUNCTION public.calculate_job_match_score(
  candidate_profile jsonb,
  job_requirements text[],
  job_tags text[]
)
RETURNS numeric
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  score numeric := 0;
  candidate_skills text[];
  skill text;
  requirement text;
BEGIN
  -- Extract candidate skills from qualifications
  candidate_skills := ARRAY(SELECT jsonb_array_elements_text(candidate_profile->'qualifications'));
  
  -- Score based on matching requirements
  FOREACH requirement IN ARRAY job_requirements LOOP
    FOREACH skill IN ARRAY candidate_skills LOOP
      IF lower(skill) LIKE '%' || lower(requirement) || '%' THEN
        score := score + 10;
      END IF;
    END LOOP;
  END LOOP;
  
  -- Score based on matching tags
  FOREACH requirement IN ARRAY job_tags LOOP
    FOREACH skill IN ARRAY candidate_skills LOOP
      IF lower(skill) LIKE '%' || lower(requirement) || '%' THEN
        score := score + 5;
      END IF;
    END LOOP;
  END LOOP;
  
  RETURN score;
END;
$$;
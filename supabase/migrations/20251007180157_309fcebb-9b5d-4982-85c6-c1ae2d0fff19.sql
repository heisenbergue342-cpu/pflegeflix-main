-- Create user_roles table for secure role management
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Migrate existing roles from profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, role FROM public.profiles
ON CONFLICT (user_id, role) DO NOTHING;

-- Create draft_jobs table for autosave functionality
CREATE TABLE IF NOT EXISTS public.draft_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  step INTEGER DEFAULT 1,
  title TEXT,
  facility_id UUID,
  facility_type facility_type,
  city TEXT,
  state TEXT,
  description TEXT,
  requirements TEXT[],
  tags TEXT[],
  shift_type TEXT,
  salary_min NUMERIC,
  salary_max NUMERIC,
  salary_unit salary_unit,
  contract_type contract_type,
  featured BOOLEAN DEFAULT false,
  application_method TEXT,
  application_email TEXT,
  application_url TEXT,
  auto_reply_template TEXT,
  contact_person TEXT,
  scheduled_publish_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.draft_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own drafts"
  ON public.draft_jobs FOR ALL
  USING (auth.uid() = user_id);

-- Add application tracking fields to applications table
ALTER TABLE public.applications 
  ADD COLUMN IF NOT EXISTS stage TEXT DEFAULT 'submitted',
  ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add job analytics fields
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS applications_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS scheduled_unpublish_at TIMESTAMP WITH TIME ZONE;

-- Function to increment view count
CREATE OR REPLACE FUNCTION public.increment_job_views(job_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.jobs 
  SET views_count = views_count + 1 
  WHERE id = job_id;
END;
$$;

-- Trigger to update applications count
CREATE OR REPLACE FUNCTION public.update_applications_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.jobs
  SET applications_count = (
    SELECT COUNT(*) FROM public.applications WHERE job_id = NEW.job_id
  )
  WHERE id = NEW.job_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_job_applications_count
  AFTER INSERT ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_applications_count();
-- Create table for CV builder data
CREATE TABLE public.cv_builder_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_name TEXT NOT NULL DEFAULT 'modern',
  personal_info JSONB DEFAULT '{}'::jsonb,
  work_experience JSONB DEFAULT '[]'::jsonb,
  education JSONB DEFAULT '[]'::jsonb,
  skills JSONB DEFAULT '[]'::jsonb,
  certifications JSONB DEFAULT '[]'::jsonb,
  languages JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cv_builder_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own CV data"
  ON public.cv_builder_data
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own CV data"
  ON public.cv_builder_data
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own CV data"
  ON public.cv_builder_data
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own CV data"
  ON public.cv_builder_data
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_cv_builder_data_updated_at
  BEFORE UPDATE ON public.cv_builder_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_jobs_updated_at();

-- Create table for salary benchmarks
CREATE TABLE public.salary_benchmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role TEXT NOT NULL,
  facility_type facility_type NOT NULL,
  state TEXT NOT NULL,
  experience_level TEXT NOT NULL,
  salary_min NUMERIC NOT NULL,
  salary_max NUMERIC NOT NULL,
  salary_median NUMERIC NOT NULL,
  data_points INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS (public read for salary data)
ALTER TABLE public.salary_benchmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view salary benchmarks"
  ON public.salary_benchmarks
  FOR SELECT
  USING (true);
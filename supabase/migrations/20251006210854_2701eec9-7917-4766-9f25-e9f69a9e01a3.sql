-- Create enums
CREATE TYPE public.app_role AS ENUM ('bewerber', 'arbeitgeber', 'admin');
CREATE TYPE public.facility_type AS ENUM ('Klinik', 'Krankenhaus', 'Altenheim', '1zu1');
CREATE TYPE public.contract_type AS ENUM ('Vollzeit', 'Teilzeit', 'Minijob', 'Befristet');
CREATE TYPE public.salary_unit AS ENUM ('€/h', '€/Monat');
CREATE TYPE public.application_status AS ENUM ('submitted', 'viewed', 'interview', 'offer', 'rejected');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'bewerber',
  name TEXT,
  email TEXT UNIQUE,
  city TEXT,
  state TEXT,
  skills TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Facilities table
CREATE TABLE public.facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type public.facility_type NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs table
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  facility_id UUID REFERENCES public.facilities(id) ON DELETE CASCADE,
  facility_type public.facility_type NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  salary_min NUMERIC,
  salary_max NUMERIC,
  salary_unit public.salary_unit,
  shift_type TEXT,
  contract_type public.contract_type,
  visa_support BOOLEAN DEFAULT FALSE,
  housing BOOLEAN DEFAULT FALSE,
  bonus TEXT,
  description TEXT,
  requirements TEXT[],
  lang_de TEXT,
  posted_at TIMESTAMPTZ DEFAULT NOW(),
  approved BOOLEAN DEFAULT TRUE,
  featured BOOLEAN DEFAULT FALSE,
  tags TEXT[],
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Applications table
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status public.application_status DEFAULT 'submitted',
  cover_letter TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved jobs table
CREATE TABLE public.saved_jobs (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, job_id)
);

-- Create indexes
CREATE INDEX idx_jobs_facility_type ON public.jobs(facility_type);
CREATE INDEX idx_jobs_city_state ON public.jobs(city, state);
CREATE INDEX idx_jobs_approved_featured ON public.jobs(approved, featured);
CREATE INDEX idx_jobs_posted_at ON public.jobs(posted_at DESC);
CREATE INDEX idx_applications_user_id ON public.applications(user_id);
CREATE INDEX idx_applications_job_id ON public.applications(job_id);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for facilities
CREATE POLICY "Anyone can view facilities" ON public.facilities FOR SELECT USING (true);
CREATE POLICY "Employers can insert facilities" ON public.facilities FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('arbeitgeber', 'admin'))
);

-- RLS Policies for jobs
CREATE POLICY "Anyone can view approved jobs" ON public.jobs FOR SELECT USING (approved = true OR owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Employers can insert jobs" ON public.jobs FOR INSERT WITH CHECK (
  auth.uid() = owner_id AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('arbeitgeber', 'admin'))
);
CREATE POLICY "Employers can update own jobs" ON public.jobs FOR UPDATE USING (
  owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Employers can delete own jobs" ON public.jobs FOR DELETE USING (
  owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for applications
CREATE POLICY "Users can view own applications" ON public.applications FOR SELECT USING (
  user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.jobs WHERE id = applications.job_id AND owner_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can insert own applications" ON public.applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Employers can update applications for their jobs" ON public.applications FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.jobs WHERE id = applications.job_id AND owner_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for saved_jobs
CREATE POLICY "Users can view own saved jobs" ON public.saved_jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own saved jobs" ON public.saved_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own saved jobs" ON public.saved_jobs FOR DELETE USING (auth.uid() = user_id);

-- Trigger function for creating profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'bewerber')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
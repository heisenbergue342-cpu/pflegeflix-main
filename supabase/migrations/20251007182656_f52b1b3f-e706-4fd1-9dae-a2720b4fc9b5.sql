-- Add missing fields for employer dashboard
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS saves_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS closed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Create function to update jobs updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_jobs_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create trigger for jobs updated_at
DROP TRIGGER IF EXISTS update_jobs_updated_at_trigger ON public.jobs;
CREATE TRIGGER update_jobs_updated_at_trigger
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_jobs_updated_at();

-- Function to update saves count
CREATE OR REPLACE FUNCTION public.update_saves_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.jobs
    SET saves_count = saves_count + 1
    WHERE id = NEW.job_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.jobs
    SET saves_count = saves_count - 1
    WHERE id = OLD.job_id;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger for saves count
DROP TRIGGER IF EXISTS update_saves_count_trigger ON public.saved_jobs;
CREATE TRIGGER update_saves_count_trigger
  AFTER INSERT OR DELETE ON public.saved_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_saves_count();
-- Drop the housing column from jobs table (or set default to false and ignore it)
-- We'll keep the column for backward compatibility but ensure it's always false
ALTER TABLE public.jobs ALTER COLUMN housing SET DEFAULT false;

-- Update all existing jobs to have housing = false
UPDATE public.jobs SET housing = false WHERE housing = true;

-- Remove any "Wohnen" tags from existing jobs (case-insensitive)
UPDATE public.jobs 
SET tags = ARRAY(
  SELECT t 
  FROM unnest(tags) AS t 
  WHERE lower(trim(t)) NOT IN ('wohnen', 'unterkunft', 'housing')
)
WHERE tags IS NOT NULL;

-- The trigger to strip "Wohnen"/"Unterkunft"/"Housing" from tags already exists (strip_visa_from_tags)
-- but we need to update it to also remove housing-related terms
CREATE OR REPLACE FUNCTION public.strip_housing_and_visa_from_tags()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.tags IS NOT NULL THEN
    NEW.tags := (
      SELECT ARRAY(
        SELECT t 
        FROM unnest(NEW.tags) AS t 
        WHERE lower(trim(t)) NOT IN ('visa', 'wohnen', 'unterkunft', 'housing')
      )
    );
  END IF;
  -- Always set housing to false
  NEW.housing := false;
  RETURN NEW;
END;
$$;

-- Drop old trigger if exists
DROP TRIGGER IF EXISTS strip_visa_from_tags_trigger ON public.jobs;

-- Create new trigger that strips both visa and housing terms
CREATE TRIGGER strip_housing_and_visa_from_tags_trigger
BEFORE INSERT OR UPDATE ON public.jobs
FOR EACH ROW
EXECUTE FUNCTION public.strip_housing_and_visa_from_tags();
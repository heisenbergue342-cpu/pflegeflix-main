-- Strip visa and housing tags from existing jobs
UPDATE public.jobs
SET tags = (
  SELECT ARRAY(
    SELECT t 
    FROM unnest(tags) AS t 
    WHERE lower(trim(t)) NOT IN ('visa', 'wohnen', 'unterkunft', 'housing')
  )
)
WHERE tags IS NOT NULL 
  AND EXISTS (
    SELECT 1 
    FROM unnest(tags) AS tag 
    WHERE lower(trim(tag)) IN ('visa', 'wohnen', 'unterkunft', 'housing')
  );

-- Create or replace the trigger function to strip these values on insert/update
CREATE OR REPLACE FUNCTION public.strip_housing_and_visa_from_tags()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS strip_housing_visa_trigger ON public.jobs;

-- Create trigger to strip on insert and update
CREATE TRIGGER strip_housing_visa_trigger
  BEFORE INSERT OR UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.strip_housing_and_visa_from_tags();
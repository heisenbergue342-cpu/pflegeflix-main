-- Remove "Visa" from existing tags
UPDATE public.jobs
SET tags = (
  SELECT ARRAY(SELECT t FROM unnest(tags) AS t WHERE lower(trim(t)) <> 'visa')
)
WHERE tags IS NOT NULL;

-- Create function to strip "Visa" from tags on insert/update
CREATE OR REPLACE FUNCTION strip_visa_from_tags()
RETURNS trigger AS $$
BEGIN
  IF NEW.tags IS NOT NULL THEN
    NEW.tags := (SELECT ARRAY(SELECT t FROM unnest(NEW.tags) AS t WHERE lower(trim(t)) <> 'visa'));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically strip "Visa" from tags
DROP TRIGGER IF EXISTS trg_strip_visa_from_tags ON public.jobs;
CREATE TRIGGER trg_strip_visa_from_tags
BEFORE INSERT OR UPDATE ON public.jobs
FOR EACH ROW EXECUTE FUNCTION strip_visa_from_tags();
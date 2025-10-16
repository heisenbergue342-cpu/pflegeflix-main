-- Fix security issue: set search_path for the function
CREATE OR REPLACE FUNCTION strip_visa_from_tags()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.tags IS NOT NULL THEN
    NEW.tags := (SELECT ARRAY(SELECT t FROM unnest(NEW.tags) AS t WHERE lower(trim(t)) <> 'visa'));
  END IF;
  RETURN NEW;
END;
$$;
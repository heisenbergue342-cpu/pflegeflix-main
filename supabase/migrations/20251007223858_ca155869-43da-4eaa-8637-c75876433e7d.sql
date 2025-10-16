-- Fix function search_path security warning with CASCADE
DROP FUNCTION IF EXISTS update_legal_settings_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION update_legal_settings_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER update_legal_settings_timestamp
  BEFORE UPDATE ON public.legal_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_legal_settings_updated_at();
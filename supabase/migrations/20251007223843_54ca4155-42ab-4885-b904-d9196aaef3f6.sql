-- Create legal_settings table for admin-editable Impressum and legal pages
CREATE TABLE IF NOT EXISTS public.legal_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value_de TEXT,
  value_en TEXT,
  is_required BOOLEAN DEFAULT false,
  field_type TEXT DEFAULT 'text', -- text, textarea, email, phone, url
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.legal_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can view legal settings
CREATE POLICY "Anyone can view legal settings"
  ON public.legal_settings
  FOR SELECT
  USING (true);

-- Only admins can update legal settings
CREATE POLICY "Only admins can update legal settings"
  ON public.legal_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'::app_role
    )
  );

-- Insert default required Impressum fields
INSERT INTO public.legal_settings (key, value_de, value_en, is_required, field_type) VALUES
  ('company_name', 'Pflegeflix GmbH', 'Pflegeflix GmbH', true, 'text'),
  ('legal_form', 'GmbH (Gesellschaft mit beschränkter Haftung)', 'GmbH (Limited Liability Company)', true, 'text'),
  ('street_address', 'Musterstraße 123', 'Musterstraße 123', true, 'text'),
  ('postal_code', '10115', '10115', true, 'text'),
  ('city', 'Berlin', 'Berlin', true, 'text'),
  ('country', 'Deutschland', 'Germany', true, 'text'),
  ('managing_director', '[Name des Geschäftsführers]', '[Name of Managing Director]', true, 'text'),
  ('contact_email', 'info@pflegeflix.de', 'info@pflegeflix.de', true, 'email'),
  ('contact_phone', '+49 30 12345678', '+49 30 12345678', true, 'phone'),
  ('register_court', '[Amtsgericht]', '[District Court]', true, 'text'),
  ('register_number', 'HRB [Nummer]', 'HRB [Number]', true, 'text'),
  ('vat_id', 'DE123456789', 'DE123456789', true, 'text'),
  ('editorial_responsible', '[Name des Verantwortlichen]', '[Name of Responsible Person]', true, 'text'),
  ('editorial_address', 'Musterstraße 123, 10115 Berlin', 'Musterstraße 123, 10115 Berlin', true, 'textarea'),
  ('supervisory_authority', '', '', false, 'textarea'),
  ('insurance_provider', '', '', false, 'text'),
  ('insurance_address', '', '', false, 'textarea'),
  ('insurance_scope', 'Deutschland/Europa', 'Germany/Europe', false, 'text'),
  ('external_links_note', 'Für die Inhalte externer Links sind ausschließlich deren Betreiber verantwortlich.', 'The operators of external links are solely responsible for their content.', false, 'textarea')
ON CONFLICT (key) DO NOTHING;

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_legal_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_legal_settings_timestamp
  BEFORE UPDATE ON public.legal_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_legal_settings_updated_at();
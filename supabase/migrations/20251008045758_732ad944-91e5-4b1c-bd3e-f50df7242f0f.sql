-- Insert required legal settings for Impressum (§5 TMG and §18 MStV)
-- Note: Placeholders must be replaced with actual company information

-- Company information
INSERT INTO public.legal_settings (key, value_de, value_en, is_required, field_type)
VALUES 
  ('company_name', '[Firmenname eintragen]', '[Enter company name]', true, 'text'),
  ('legal_form', '[Rechtsform (z.B. GmbH, UG, AG)]', '[Legal form (e.g. GmbH, UG, AG)]', true, 'text'),
  ('street_address', '[Straße und Hausnummer]', '[Street and house number]', true, 'text'),
  ('postal_code', '[PLZ]', '[Postal code]', true, 'text'),
  ('city', '[Stadt]', '[City]', true, 'text'),
  ('country', 'Deutschland', 'Germany', true, 'text')
ON CONFLICT (key) DO UPDATE SET
  value_de = EXCLUDED.value_de,
  value_en = EXCLUDED.value_en,
  is_required = EXCLUDED.is_required;

-- Contact information
INSERT INTO public.legal_settings (key, value_de, value_en, is_required, field_type)
VALUES 
  ('contact_phone', '[+49 XXX XXXXXXX]', '[+49 XXX XXXXXXX]', true, 'text'),
  ('contact_email', '[kontakt@ihrefirma.de]', '[contact@yourcompany.com]', true, 'email')
ON CONFLICT (key) DO UPDATE SET
  value_de = EXCLUDED.value_de,
  value_en = EXCLUDED.value_en,
  is_required = EXCLUDED.is_required;

-- Representative (§5 TMG)
INSERT INTO public.legal_settings (key, value_de, value_en, is_required, field_type)
VALUES 
  ('managing_director', '[Vor- und Nachname des Geschäftsführers]', '[First and last name of managing director]', true, 'text')
ON CONFLICT (key) DO UPDATE SET
  value_de = EXCLUDED.value_de,
  value_en = EXCLUDED.value_en,
  is_required = EXCLUDED.is_required;

-- Commercial register (§5 TMG)
INSERT INTO public.legal_settings (key, value_de, value_en, is_required, field_type)
VALUES 
  ('register_court', '[Amtsgericht, z.B. Amtsgericht Berlin-Charlottenburg]', '[Register court, e.g. Local Court Berlin-Charlottenburg]', true, 'text'),
  ('register_number', '[HRB XXXXX]', '[HRB XXXXX]', true, 'text')
ON CONFLICT (key) DO UPDATE SET
  value_de = EXCLUDED.value_de,
  value_en = EXCLUDED.value_en,
  is_required = EXCLUDED.is_required;

-- VAT ID (§27a UStG)
INSERT INTO public.legal_settings (key, value_de, value_en, is_required, field_type)
VALUES 
  ('vat_id', '[DE123456789]', '[DE123456789]', true, 'text')
ON CONFLICT (key) DO UPDATE SET
  value_de = EXCLUDED.value_de,
  value_en = EXCLUDED.value_en,
  is_required = EXCLUDED.is_required;

-- Editorial responsibility (§18 MStV)
INSERT INTO public.legal_settings (key, value_de, value_en, is_required, field_type)
VALUES 
  ('editorial_responsible', '[Vor- und Nachname]', '[First and last name]', true, 'text'),
  ('editorial_address', '[Vollständige Adresse des Verantwortlichen]', '[Complete address of responsible person]', true, 'textarea')
ON CONFLICT (key) DO UPDATE SET
  value_de = EXCLUDED.value_de,
  value_en = EXCLUDED.value_en,
  is_required = EXCLUDED.is_required;

-- Optional: Supervisory authority (if applicable)
INSERT INTO public.legal_settings (key, value_de, value_en, is_required, field_type)
VALUES 
  ('supervisory_authority', '', '', false, 'textarea')
ON CONFLICT (key) DO UPDATE SET
  value_de = EXCLUDED.value_de,
  value_en = EXCLUDED.value_en,
  is_required = EXCLUDED.is_required;

-- Optional: Professional liability insurance (if applicable)
INSERT INTO public.legal_settings (key, value_de, value_en, is_required, field_type)
VALUES 
  ('insurance_provider', '', '', false, 'text'),
  ('insurance_address', '', '', false, 'textarea'),
  ('insurance_scope', '', '', false, 'text')
ON CONFLICT (key) DO UPDATE SET
  value_de = EXCLUDED.value_de,
  value_en = EXCLUDED.value_en,
  is_required = EXCLUDED.is_required;

-- External links disclaimer
INSERT INTO public.legal_settings (key, value_de, value_en, is_required, field_type)
VALUES 
  ('external_links_note', 
   'Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte externer Links. Für den Inhalt der verlinkten Seiten sind ausschließlich deren Betreiber verantwortlich.',
   'Despite careful content control, we assume no liability for the content of external links. The operators of the linked pages are solely responsible for their content.',
   false, 
   'textarea')
ON CONFLICT (key) DO UPDATE SET
  value_de = EXCLUDED.value_de,
  value_en = EXCLUDED.value_en,
  is_required = EXCLUDED.is_required;

-- Add comment to the table
COMMENT ON TABLE public.legal_settings IS 
'Stores legal information required for Impressum (§5 TMG) and editorial responsibility (§18 MStV). 
All fields marked is_required=true must be filled with actual company information before going live.';
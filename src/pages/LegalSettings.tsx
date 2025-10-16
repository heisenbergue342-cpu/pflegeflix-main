import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { AlertCircle, Save, CheckCircle } from 'lucide-react';

interface LegalSetting {
  id: string;
  key: string;
  value_de: string | null;
  value_en: string | null;
  is_required: boolean;
  field_type: string;
}

export default function LegalSettings() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<LegalSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasPlaceholders, setHasPlaceholders] = useState(false);

  useEffect(() => {
    if (profile?.role !== 'admin') {
      navigate('/');
      return;
    }
    loadSettings();
  }, [profile, navigate]);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('legal_settings')
        .select('*')
        .order('key');

      if (error) throw error;
      setSettings(data || []);
      checkPlaceholders(data || []);
    } catch (error: any) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const checkPlaceholders = (settingsList: LegalSetting[]) => {
    const placeholderPattern = /\[.*?\]/;
    const hasAnyPlaceholders = settingsList.some(
      (s) =>
        s.is_required &&
        (placeholderPattern.test(s.value_de || '') ||
          placeholderPattern.test(s.value_en || '') ||
          !s.value_de?.trim() ||
          !s.value_en?.trim())
    );
    setHasPlaceholders(hasAnyPlaceholders);
  };

  const handleChange = (key: string, lang: 'de' | 'en', value: string) => {
    setSettings((prev) =>
      prev.map((s) =>
        s.key === key ? { ...s, [`value_${lang}`]: value } : s
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = settings.map((setting) => ({
        id: setting.id,
        key: setting.key,
        value_de: setting.value_de,
        value_en: setting.value_en,
        updated_by: profile?.id,
      }));

      const { error } = await supabase
        .from('legal_settings')
        .upsert(updates, { onConflict: 'id' });

      if (error) throw error;

      toast.success('Settings saved successfully');
      checkPlaceholders(settings);
    } catch (error: any) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const getFieldLabel = (key: string): string => {
    const labels: Record<string, string> = {
      company_name: 'Company Name / Firmenname',
      legal_form: 'Legal Form / Rechtsform',
      street_address: 'Street Address / Straße',
      postal_code: 'Postal Code / PLZ',
      city: 'City / Stadt',
      country: 'Country / Land',
      managing_director: 'Managing Director / Geschäftsführer',
      contact_email: 'Contact Email / Kontakt E-Mail',
      contact_phone: 'Contact Phone / Telefon',
      register_court: 'Register Court / Registergericht',
      register_number: 'Register Number / Handelsregisternummer',
      vat_id: 'VAT ID / USt-IdNr.',
      editorial_responsible: 'Editorial Responsible (§18 MStV) / Redaktionell Verantwortlich',
      editorial_address: 'Editorial Address / Adresse des Verantwortlichen',
      supervisory_authority: 'Supervisory Authority (if applicable) / Aufsichtsbehörde',
      insurance_provider: 'Professional Liability Insurance Provider / Berufshaftpflichtversicherung',
      insurance_address: 'Insurance Address / Versicherungsadresse',
      insurance_scope: 'Insurance Territorial Scope / Geltungsbereich',
      external_links_note: 'External Links Note / Hinweis zu externen Links',
    };
    return labels[key] || key;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-16 flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-16">
      <div className="container max-w-5xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Legal Settings (Admin)</h1>
          <p className="text-muted-foreground">
            Edit Impressum and legal page content. Required fields must not contain placeholders like [Name].
          </p>
        </div>

        {hasPlaceholders && (
          <Alert className="mb-6 border-destructive">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">
              <strong>Warning:</strong> Some required fields contain placeholders or are empty. 
              Please fill all required fields with actual data before publishing.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {settings.map((setting) => (
            <Card key={setting.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getFieldLabel(setting.key)}
                  {setting.is_required && (
                    <span className="text-destructive text-sm">*</span>
                  )}
                </CardTitle>
                <CardDescription>Key: {setting.key}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor={`${setting.key}-de`}>German (DE)</Label>
                  {setting.field_type === 'textarea' ? (
                    <Textarea
                      id={`${setting.key}-de`}
                      value={setting.value_de || ''}
                      onChange={(e) => handleChange(setting.key, 'de', e.target.value)}
                      className={
                        setting.is_required && 
                        (!setting.value_de?.trim() || /\[.*?\]/.test(setting.value_de))
                          ? 'border-destructive'
                          : ''
                      }
                      rows={4}
                    />
                  ) : (
                    <Input
                      id={`${setting.key}-de`}
                      type={setting.field_type === 'email' ? 'email' : setting.field_type === 'phone' ? 'tel' : 'text'}
                      value={setting.value_de || ''}
                      onChange={(e) => handleChange(setting.key, 'de', e.target.value)}
                      className={
                        setting.is_required && 
                        (!setting.value_de?.trim() || /\[.*?\]/.test(setting.value_de))
                          ? 'border-destructive'
                          : ''
                      }
                    />
                  )}
                </div>
                <div>
                  <Label htmlFor={`${setting.key}-en`}>English (EN)</Label>
                  {setting.field_type === 'textarea' ? (
                    <Textarea
                      id={`${setting.key}-en`}
                      value={setting.value_en || ''}
                      onChange={(e) => handleChange(setting.key, 'en', e.target.value)}
                      className={
                        setting.is_required && 
                        (!setting.value_en?.trim() || /\[.*?\]/.test(setting.value_en))
                          ? 'border-destructive'
                          : ''
                      }
                      rows={4}
                    />
                  ) : (
                    <Input
                      id={`${setting.key}-en`}
                      type={setting.field_type === 'email' ? 'email' : setting.field_type === 'phone' ? 'tel' : 'text'}
                      value={setting.value_en || ''}
                      onChange={(e) => handleChange(setting.key, 'en', e.target.value)}
                      className={
                        setting.is_required && 
                        (!setting.value_en?.trim() || /\[.*?\]/.test(setting.value_en))
                          ? 'border-destructive'
                          : ''
                      }
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex items-center gap-4">
          <Button
            onClick={handleSave}
            disabled={saving}
            size="lg"
            className="flex items-center gap-2"
          >
            {saving ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save All Changes
              </>
            )}
          </Button>
          {!hasPlaceholders && !saving && (
            <div className="flex items-center gap-2 text-green-500">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">All required fields complete</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

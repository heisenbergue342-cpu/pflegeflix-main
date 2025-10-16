import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { DataDeletionRequest } from '@/components/gdpr/DataDeletionRequest';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Shield, Download, Eye, Trash2, Sparkles, Mail } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SEO from '@/components/SEO';

export default function PrivacySettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [retentionDays, setRetentionDays] = useState(730);
  const [autoDeleteEnabled, setAutoDeleteEnabled] = useState(false);
  const [deletionRequests, setDeletionRequests] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState({
    enabled: true,
    email: false,
    frequency: 'weekly' as 'daily' | 'weekly' | 'biweekly' | 'monthly',
  });

  useEffect(() => {
    if (user) {
      loadSettings();
      loadDeletionRequests();
      loadRecommendationSettings();
    }
  }, [user]);

  const loadRecommendationSettings = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('recommendations_enabled, email_recommendations, recommendation_frequency')
      .eq('id', user.id)
      .single();

    if (data) {
      setRecommendations({
        enabled: data.recommendations_enabled ?? true,
        email: data.email_recommendations ?? false,
        frequency: (data.recommendation_frequency as any) ?? 'weekly',
      });
    }
  };

  const loadSettings = async () => {
    const { data } = await supabase
      .from('data_retention_settings')
      .select('*')
      .eq('user_id', user?.id)
      .single();

    if (data) {
      setRetentionDays(data.retention_days || 730);
      setAutoDeleteEnabled(data.auto_delete_enabled || false);
    } else {
      // Create default settings
      await supabase
        .from('data_retention_settings')
        .insert({
          user_id: user?.id,
          retention_days: 730,
          auto_delete_enabled: false,
        });
    }
  };

  const loadDeletionRequests = async () => {
    const { data } = await supabase
      .from('data_deletion_requests')
      .select('*')
      .eq('user_id', user?.id)
      .order('requested_at', { ascending: false });

    setDeletionRequests(data || []);
  };

  const handleSaveSettings = async () => {
    try {
      // Save retention settings
      const { error: retentionError } = await supabase
        .from('data_retention_settings')
        .upsert({
          user_id: user?.id,
          retention_days: retentionDays,
          auto_delete_enabled: autoDeleteEnabled,
        });

      if (retentionError) throw retentionError;

      // Save recommendation preferences
      const { error: recError } = await supabase
        .from('profiles')
        .update({
          recommendations_enabled: recommendations.enabled,
          email_recommendations: recommendations.email,
          recommendation_frequency: recommendations.frequency,
        })
        .eq('id', user?.id);

      if (recError) throw recError;

      toast({ title: 'Einstellungen gespeichert' });
    } catch (error) {
      console.error('Save error:', error);
      toast({ title: 'Fehler beim Speichern', variant: 'destructive' });
    }
  };

  const exportData = async () => {
    // Export user data as JSON
    const { data: applications } = await supabase
      .from('applications')
      .select('*, jobs(*)')
      .eq('user_id', user?.id);

    const { data: messages } = await supabase
      .from('application_messages')
      .select('*')
      .eq('sender_id', user?.id);

    const exportData = {
      user: {
        id: user?.id,
        email: user?.email,
        exported_at: new Date().toISOString(),
      },
      applications,
      messages,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meine-daten-${new Date().toISOString().split('T')[0]}.json`;
    a.click();

    toast({ title: 'Daten exportiert' });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-400',
      processing: 'bg-blue-500/20 text-blue-400',
      completed: 'bg-green-500/20 text-green-400',
      cancelled: 'bg-red-500/20 text-red-400',
    };
    const labels: Record<string, string> = {
      pending: 'Ausstehend',
      processing: 'In Bearbeitung',
      completed: 'Abgeschlossen',
      cancelled: 'Abgebrochen',
    };
    return (
      <span className={`px-2 py-1 rounded text-xs ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getRequestTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      applications: 'Bewerbungen',
      messages: 'Nachrichten',
      full_account: 'Komplettes Konto',
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-netflix-bg">
      <SEO
        title="Datenschutz & DSGVO Einstellungen"
        description="Verwalten Sie Ihre Datenschutzeinstellungen und DSGVO-Rechte."
        canonical="/privacy-settings"
        noindex={true}
      />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Datenschutz & DSGVO</h1>
            <p className="text-muted-foreground">
              Verwalten Sie Ihre Daten und Privatsphäre-Einstellungen
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Recommendation Settings */}
          <Card className="bg-card border-border p-6">
            <div className="flex items-start gap-4">
              <Sparkles className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Jobempfehlungen
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Steuern Sie, wie wir Ihnen personalisierte Jobs vorschlagen.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="rec-enabled" className="text-foreground">
                        Empfehlungen aktivieren
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Personalisierte Jobs basierend auf Ihrem Profil anzeigen
                      </p>
                    </div>
                    <Switch
                      id="rec-enabled"
                      checked={recommendations.enabled}
                      onCheckedChange={(checked) =>
                        setRecommendations({ ...recommendations, enabled: checked })
                      }
                    />
                  </div>

                  {recommendations.enabled && (
                    <>
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <Label htmlFor="email-rec" className="text-foreground">
                              E-Mail Benachrichtigungen
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Neue passende Jobs per E-Mail erhalten
                            </p>
                          </div>
                        </div>
                        <Switch
                          id="email-rec"
                          checked={recommendations.email}
                          onCheckedChange={(checked) =>
                            setRecommendations({ ...recommendations, email: checked })
                          }
                        />
                      </div>

                      {recommendations.email && (
                        <div>
                          <Label htmlFor="frequency" className="text-foreground mb-2 block">
                            E-Mail-Häufigkeit
                          </Label>
                          <Select
                            value={recommendations.frequency}
                            onValueChange={(value: any) =>
                              setRecommendations({ ...recommendations, frequency: value })
                            }
                          >
                            <SelectTrigger id="frequency" className="bg-input border-border">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">Täglich</SelectItem>
                              <SelectItem value="weekly">Wöchentlich</SelectItem>
                              <SelectItem value="biweekly">Alle 2 Wochen</SelectItem>
                              <SelectItem value="monthly">Monatlich</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Data Retention Settings */}
          <Card className="bg-card border-border p-6">
            <div className="flex items-start gap-4">
              <Eye className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Datenaufbewahrung
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Bestimmen Sie, wie lange Ihre Daten gespeichert werden sollen.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="retention" className="text-foreground">
                      Aufbewahrungsdauer (Tage)
                    </Label>
                    <Input
                      id="retention"
                      type="number"
                      value={retentionDays}
                      onChange={(e) => setRetentionDays(parseInt(e.target.value))}
                      min="30"
                      max="3650"
                      className="bg-input border-border mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Minimum 30 Tage, Maximum 10 Jahre (3650 Tage)
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-delete" className="text-foreground">
                        Automatische Löschung aktivieren
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Daten werden nach Ablauf der Frist automatisch gelöscht
                      </p>
                    </div>
                    <Switch
                      id="auto-delete"
                      checked={autoDeleteEnabled}
                      onCheckedChange={setAutoDeleteEnabled}
                    />
                  </div>

                  <Button onClick={handleSaveSettings} className="w-full">
                    Einstellungen speichern
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Data Export */}
          <Card className="bg-card border-border p-6">
            <div className="flex items-start gap-4">
              <Download className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Datenexport
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Laden Sie eine Kopie all Ihrer gespeicherten Daten herunter (DSGVO Art. 15).
                </p>
                <Button onClick={exportData} variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Meine Daten exportieren
                </Button>
              </div>
            </div>
          </Card>

          {/* Data Deletion */}
          <DataDeletionRequest />

          {/* Deletion Requests History */}
          {deletionRequests.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Trash2 className="h-5 w-5" />
                  Löschanträge
                </h3>
                <div className="space-y-3">
                  {deletionRequests.map((request) => (
                    <Card key={request.id} className="bg-card border-border p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-foreground">
                              {getRequestTypeLabel(request.request_type)}
                            </span>
                            {getStatusBadge(request.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Eingereicht am{' '}
                            {new Date(request.requested_at).toLocaleDateString()}
                          </p>
                          {request.notes && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {request.notes}
                            </p>
                          )}
                        </div>
                        {request.completed_at && (
                          <div className="text-sm text-muted-foreground">
                            Abgeschlossen am{' '}
                            {new Date(request.completed_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
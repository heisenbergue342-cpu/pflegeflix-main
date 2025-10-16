import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Shield, AlertTriangle } from 'lucide-react';

export function DataDeletionRequest() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [requestType, setRequestType] = useState<string>('applications');
  const [notes, setNotes] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSubmitRequest = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('data_deletion_requests')
      .insert({
        user_id: user.id,
        request_type: requestType,
        notes: notes.trim() || null,
        status: 'pending',
      });

    if (!error) {
      toast({
        title: 'Löschantrag eingereicht',
        description: 'Ihr Antrag wird bearbeitet. Sie erhalten eine Bestätigung per E-Mail.',
      });
      setNotes('');
      setDialogOpen(false);
    } else {
      toast({
        title: 'Fehler',
        description: 'Der Antrag konnte nicht eingereicht werden.',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Card className="bg-card border-border p-6">
        <div className="flex items-start gap-4">
          <Shield className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                DSGVO-Datenlöschung
              </h3>
              <p className="text-sm text-muted-foreground">
                Sie haben das Recht, die Löschung Ihrer personenbezogenen Daten gemäß DSGVO
                Art. 17 zu beantragen. Wählen Sie aus, welche Daten gelöscht werden sollen.
              </p>
            </div>

            <RadioGroup value={requestType} onValueChange={setRequestType}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="applications" id="applications" />
                <Label htmlFor="applications" className="text-foreground cursor-pointer">
                  Nur Bewerbungsdaten löschen
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="messages" id="messages" />
                <Label htmlFor="messages" className="text-foreground cursor-pointer">
                  Nur Nachrichten löschen
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="full_account" id="full_account" />
                <Label htmlFor="full_account" className="text-foreground cursor-pointer">
                  Komplettes Konto löschen (unwiderruflich)
                </Label>
              </div>
            </RadioGroup>

            <div>
              <Label htmlFor="notes" className="text-foreground">
                Anmerkungen (optional)
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Zusätzliche Informationen oder Gründe für die Löschung..."
                className="bg-input border-border mt-2"
                rows={3}
              />
            </div>

            <div className="flex items-start gap-2 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
              <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-500">
                {requestType === 'full_account' ? (
                  <span>
                    <strong>Achtung:</strong> Die vollständige Kontolöschung kann nicht rückgängig
                    gemacht werden. Alle Ihre Daten werden dauerhaft entfernt.
                  </span>
                ) : (
                  <span>
                    Diese Aktion löscht die ausgewählten Daten dauerhaft aus unserem System.
                  </span>
                )}
              </div>
            </div>

            <Button onClick={() => setDialogOpen(true)} variant="destructive" className="w-full">
              Löschantrag einreichen
            </Button>
          </div>
        </div>
      </Card>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Datenlöschung bestätigen
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              {requestType === 'full_account' ? (
                <>
                  Sie sind dabei, Ihr komplettes Konto zu löschen. Diese Aktion kann nicht
                  rückgängig gemacht werden. Sind Sie sicher?
                </>
              ) : (
                <>
                  Sie sind dabei, einen Löschantrag für Ihre{' '}
                  {requestType === 'applications' ? 'Bewerbungsdaten' : 'Nachrichten'}{' '}
                  einzureichen. Sind Sie sicher?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmitRequest}
              className="bg-destructive text-destructive-foreground"
            >
              Antrag einreichen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
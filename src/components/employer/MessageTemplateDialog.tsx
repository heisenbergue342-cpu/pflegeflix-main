import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MessageTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: any;
  onSave: () => void;
}

export function MessageTemplateDialog({ open, onOpenChange, template, onSave }: MessageTemplateDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [templateType, setTemplateType] = useState<string>('general');

  useEffect(() => {
    if (template) {
      setName(template.name || '');
      setSubject(template.subject || '');
      setBody(template.body || '');
      setTemplateType(template.template_type || 'general');
    } else {
      setName('');
      setSubject('');
      setBody('');
      setTemplateType('general');
    }
  }, [template, open]);

  const handleSave = async () => {
    if (!name.trim() || !body.trim()) {
      toast({ title: 'Bitte alle Pflichtfelder ausfüllen', variant: 'destructive' });
      return;
    }

    const data = {
      employer_id: user?.id,
      name: name.trim(),
      subject: subject.trim() || null,
      body: body.trim(),
      template_type: templateType,
    };

    let error;
    if (template) {
      ({ error } = await supabase
        .from('message_templates')
        .update(data)
        .eq('id', template.id));
    } else {
      ({ error } = await supabase
        .from('message_templates')
        .insert(data));
    }

    if (!error) {
      toast({ title: template ? 'Vorlage aktualisiert' : 'Vorlage erstellt' });
      onSave();
      onOpenChange(false);
    } else {
      toast({ title: 'Fehler beim Speichern', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {template ? 'Vorlage bearbeiten' : 'Neue Vorlage erstellen'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-foreground">Name der Vorlage *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Einladung zum Vorstellungsgespräch"
              className="bg-input border-border"
            />
          </div>

          <div>
            <Label htmlFor="type" className="text-foreground">Typ</Label>
            <Select value={templateType} onValueChange={setTemplateType}>
              <SelectTrigger className="bg-input border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">Allgemein</SelectItem>
                <SelectItem value="interview_invite">Einladung zum Gespräch</SelectItem>
                <SelectItem value="offer">Stellenangebot</SelectItem>
                <SelectItem value="rejection">Absage</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="subject" className="text-foreground">Betreff (optional)</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Betreff der Nachricht"
              className="bg-input border-border"
            />
          </div>

          <div>
            <Label htmlFor="body" className="text-foreground">Nachrichtentext *</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Verwenden Sie {{name}}, {{job_title}}, {{company}} als Platzhalter"
              className="min-h-[200px] bg-input border-border"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Verfügbare Platzhalter: {'{{name}}'}, {'{{job_title}}'}, {'{{company}}'}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleSave}>
            Speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
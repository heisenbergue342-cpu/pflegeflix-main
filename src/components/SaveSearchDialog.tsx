import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { PostedFilterToggle } from '@/components/PostedFilterToggle';

interface SaveSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: {
    cities?: string[];
    facilities?: string[];
    contracts?: string[];
    posted?: string;
    specialties?: string[];
  };
}

export function SaveSearchDialog({ open, onOpenChange, filters }: SaveSearchDialogProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [emailAlert, setEmailAlert] = useState<'none' | 'daily' | 'weekly'>('none');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user) {
      toast.error(t('saved_searches.login_required'));
      return;
    }

    if (!name.trim()) {
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from('saved_searches')
      .insert({
        user_id: user.id,
        name: name.trim(),
        filters: filters,
        email_alert: emailAlert,
      });

    setSaving(false);

    if (error) {
      console.error('Error saving search:', error);
      toast.error(t('error.generic'));
    } else {
      toast.success(t('saved_searches.saved'));
      setName('');
      setEmailAlert('none');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('saved_searches.save_current')}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="search-name">{t('saved_searches.search_name')}</Label>
            <Input
              id="search-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('saved_searches.search_name_placeholder')}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="email-alert">{t('saved_searches.email_alerts')}</Label>
            <Select value={emailAlert} onValueChange={(value: any) => setEmailAlert(value)}>
              <SelectTrigger id="email-alert" className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('saved_searches.alert_none')}</SelectItem>
                <SelectItem value="daily">{t('saved_searches.alert_daily')}</SelectItem>
                <SelectItem value="weekly">{t('saved_searches.alert_weekly')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>{t('search.posted_label')}</Label>
            <div className="mt-2">
              <PostedFilterToggle
                value={filters.posted}
                urlSync={false}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('privacy_center.delete_cancel')}
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || saving}>
            {t('job.post.save_draft')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
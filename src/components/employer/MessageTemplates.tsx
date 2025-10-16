import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageTemplateDialog } from './MessageTemplateDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, FileText } from 'lucide-react';
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

export function MessageTemplates() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [templates, setTemplates] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<any>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    const { data } = await supabase
      .from('message_templates')
      .select('*')
      .eq('employer_id', user?.id)
      .order('created_at', { ascending: false });
    
    setTemplates(data || []);
  };

  const handleEdit = (template: any) => {
    setSelectedTemplate(template);
    setDialogOpen(true);
  };

  const handleNew = () => {
    setSelectedTemplate(null);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!templateToDelete) return;

    const { error } = await supabase
      .from('message_templates')
      .delete()
      .eq('id', templateToDelete.id);

    if (!error) {
      toast({ title: t('templates.deleted') });
      loadTemplates();
    } else {
      toast({ title: t('error.delete_failed'), variant: 'destructive' });
    }
    setDeleteDialogOpen(false);
    setTemplateToDelete(null);
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      general: t('templates.type_general'),
      interview_invite: t('templates.type_interview'),
      offer: t('templates.type_offer'),
      rejection: t('templates.type_rejection'),
    };
    return labels[type] || type;
  };

  const getTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      general: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      interview_invite: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      offer: 'bg-green-500/20 text-green-400 border-green-500/30',
      rejection: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return colors[type] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">{t('templates.title')}</h2>
        <Button onClick={handleNew} className="gap-2">
          <Plus className="h-4 w-4" />
          {t('templates.new')}
        </Button>
      </div>

      {templates.length === 0 ? (
        <Card className="bg-card border-border p-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            {t('templates.empty_description')}
          </p>
          <Button onClick={handleNew}>{t('templates.empty_action')}</Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {templates.map((template) => (
            <Card key={template.id} className="bg-card border-border p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-foreground">{template.name}</h3>
                      <Badge className={`border ${getTypeBadgeColor(template.template_type)}`}>
                        {getTypeLabel(template.template_type)}
                      </Badge>
                    </div>
                    {template.subject && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {t('templates.subject')}: {template.subject}
                      </p>
                    )}
                    <p className="text-sm text-foreground line-clamp-3">
                      {template.body}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(template)}
                    className="gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    {t('templates.edit')}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setTemplateToDelete(template);
                      setDeleteDialogOpen(true);
                    }}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    {t('templates.delete')}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <MessageTemplateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        template={selectedTemplate}
        onSave={loadTemplates}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">{t('templates.delete_confirm')}</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              {t('templates.delete_confirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Star,
  Mail,
  MapPin,
  Calendar,
  MessageSquare,
  Send,
  UserCheck,
  UserX,
  Trash2,
  Eye,
} from 'lucide-react';

interface ApplicantDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicant: any;
  onUpdate: () => void;
}

export function ApplicantDrawer({ open, onOpenChange, applicant, onUpdate }: ApplicantDrawerProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();

  const [stage, setStage] = useState('submitted');
  const [rating, setRating] = useState<number | null>(null);
  const [recommend, setRecommend] = useState(false);
  const [internalNotes, setInternalNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  useEffect(() => {
    if (applicant) {
      setStage(applicant.stage || 'submitted');
      setRating(applicant.rating);
      setRecommend(applicant.recommend || false);
      setInternalNotes(applicant.internal_notes || '');
      setTags(applicant.tags || []);
      loadMessages();
      loadActivity();
      loadTemplates();
    }
  }, [applicant]);

  const loadTemplates = async () => {
    const { data } = await supabase
      .from('message_templates')
      .select('*')
      .eq('employer_id', user?.id)
      .order('name');
    
    setTemplates(data || []);
  };

  const loadMessages = async () => {
    if (!applicant) return;
    
    const { data } = await supabase
      .from('application_messages')
      .select(`
        *,
        profiles!application_messages_sender_id_fkey(name)
      `)
      .eq('application_id', applicant.id)
      .order('created_at', { ascending: true });

    setMessages((data as any) || []);
  };

  const loadActivity = async () => {
    if (!applicant) return;

    const { data } = await supabase
      .from('application_activity')
      .select(`
        *,
        profiles!application_activity_actor_id_fkey(name)
      `)
      .eq('application_id', applicant.id)
      .order('created_at', { ascending: false });

    setActivity((data as any) || []);
  };

  const applyTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    // Replace placeholders
    let messageText = template.body;
    messageText = messageText.replace(/\{\{name\}\}/g, applicant?.profiles?.name || '');
    messageText = messageText.replace(/\{\{job_title\}\}/g, applicant?.jobs?.title || '');
    messageText = messageText.replace(/\{\{company\}\}/g, 'Ihre Firma'); // Can be dynamic

    setMessage(messageText);
    setSelectedTemplate(templateId);
  };

  const handleStageChange = async (newStage: string) => {
    if (!applicant) return;

    setStage(newStage);
    const { error } = await supabase
      .from('applications')
      .update({ stage: newStage })
      .eq('id', applicant.id);

    if (!error) {
      toast({ title: t('applicants.stage_updated') });
      onUpdate();
      loadActivity();
    } else {
      setStage(applicant.stage);
      toast({ title: t('error.generic'), variant: 'destructive' });
    }
  };

  const handleRatingChange = async (newRating: number) => {
    if (!applicant) return;

    setRating(newRating);
    const { error } = await supabase
      .from('applications')
      .update({ rating: newRating })
      .eq('id', applicant.id);

    if (!error) {
      toast({ title: t('applicants.rating_updated') });
      onUpdate();
    } else {
      setRating(applicant.rating);
      toast({ title: t('error.generic'), variant: 'destructive' });
    }
  };

  const handleRecommendToggle = async () => {
    if (!applicant) return;

    const newRecommend = !recommend;
    setRecommend(newRecommend);
    
    const { error } = await supabase
      .from('applications')
      .update({ recommend: newRecommend })
      .eq('id', applicant.id);

    if (!error) {
      toast({ title: t('applicants.recommend_updated') });
      onUpdate();
    } else {
      setRecommend(applicant.recommend);
      toast({ title: t('error.generic'), variant: 'destructive' });
    }
  };

  const handleSaveNotes = async () => {
    if (!applicant) return;

    const { error } = await supabase
      .from('applications')
      .update({ internal_notes: internalNotes })
      .eq('id', applicant.id);

    if (!error) {
      toast({ title: t('applicants.notes_saved') });
      onUpdate();
    } else {
      toast({ title: t('error.generic'), variant: 'destructive' });
    }
  };

  const handleAddTag = async () => {
    if (!newTag.trim() || !applicant) return;

    const updatedTags = [...tags, newTag.trim()];
    setTags(updatedTags);
    setNewTag('');

    const { error } = await supabase
      .from('applications')
      .update({ tags: updatedTags })
      .eq('id', applicant.id);

    if (!error) {
      onUpdate();
    } else {
      setTags(applicant.tags || []);
      toast({ title: t('error.generic'), variant: 'destructive' });
    }
  };

  const handleRemoveTag = async (tag: string) => {
    if (!applicant) return;

    const updatedTags = tags.filter(t => t !== tag);
    setTags(updatedTags);

    const { error } = await supabase
      .from('applications')
      .update({ tags: updatedTags })
      .eq('id', applicant.id);

    if (!error) {
      onUpdate();
    } else {
      setTags(applicant.tags || []);
      toast({ title: t('error.generic'), variant: 'destructive' });
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !applicant) return;

    const { error } = await supabase
      .from('application_messages')
      .insert({
        application_id: applicant.id,
        sender_id: user?.id,
        message: message.trim(),
      });

    if (!error) {
      setMessage('');
      loadMessages();
      toast({ title: t('applicants.message_sent') });
    } else {
      toast({ title: t('error.generic'), variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!applicant || !confirm(t('applicants.delete_confirm'))) return;

    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', applicant.id);

    if (!error) {
      toast({ title: t('applicants.deleted') });
      onOpenChange(false);
      onUpdate();
    } else {
      toast({ title: t('error.generic'), variant: 'destructive' });
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      submitted: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      viewed: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      interview: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      offer: 'bg-green-500/20 text-green-400 border-green-500/30',
      rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return colors[stage] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  if (!applicant) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl bg-card border-border overflow-y-auto">
        <SheetHeader className="space-y-4 pb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 bg-netflix-red">
                <AvatarFallback className="bg-netflix-red text-white text-xl font-medium">
                  {getInitials(applicant.profiles?.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <SheetTitle className="text-2xl text-foreground">
                  {applicant.profiles?.name}
                </SheetTitle>
                <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">{applicant.profiles?.email}</span>
                </div>
                {applicant.profiles?.city && (
                  <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{applicant.profiles?.city}</span>
                  </div>
                )}
              </div>
            </div>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <Badge className={`border ${getStageColor(stage)}`}>
              {t(`applicants.${stage}`)}
            </Badge>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <button
                  key={i}
                  onClick={() => handleRatingChange(i)}
                  className="focus:outline-none focus:ring-2 focus:ring-ring rounded"
                >
                  <Star
                    className={`h-5 w-5 ${
                      rating && i <= rating
                        ? 'fill-yellow-500 text-yellow-500'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
            <Button
              variant={recommend ? 'default' : 'outline'}
              size="sm"
              onClick={handleRecommendToggle}
              className="gap-2"
            >
              {recommend ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
              {t('applicants.recommend')}
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="space-y-6 pb-6">
            {/* Job Info */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {t('applicants.applied_for')}
              </h3>
              <div className="p-4 bg-muted rounded-lg border border-border">
                <div className="font-medium text-foreground">{applicant.jobs?.title}</div>
                <div className="text-sm text-muted-foreground">
                  {applicant.jobs?.city}, {applicant.jobs?.state}
                </div>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date(applicant.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            <Separator />

            {/* Stage Control */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {t('applicants.pipeline_stage')}
              </h3>
              <Select value={stage} onValueChange={handleStageChange}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="submitted">{t('applicants.submitted')}</SelectItem>
                  <SelectItem value="viewed">{t('applicants.viewed')}</SelectItem>
                  <SelectItem value="interview">{t('applicants.interview')}</SelectItem>
                  <SelectItem value="offer">{t('applicants.offer')}</SelectItem>
                  <SelectItem value="rejected">{t('applicants.rejected')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Cover Letter */}
            {applicant.cover_letter && (
              <>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {t('applicants.cover_letter')}
                  </h3>
                  <div className="p-4 bg-muted rounded-lg border border-border">
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {applicant.cover_letter}
                    </p>
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Internal Notes */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {t('applicants.internal_notes')}
              </h3>
              <Textarea
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder={t('applicants.notes_placeholder')}
                className="min-h-[120px] bg-input border-border"
              />
              <Button onClick={handleSaveNotes} size="sm" className="mt-2">
                {t('applicants.save_notes')}
              </Button>
            </div>

            <Separator />

            {/* Tags */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {t('applicants.tags')}
              </h3>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map(tag => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                  placeholder={t('applicants.add_tag')}
                  className="bg-input border-border"
                />
                <Button onClick={handleAddTag} size="sm">
                  {t('applicants.add')}
                </Button>
              </div>
            </div>

            <Separator />

            {/* Messages */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {t('applicants.messages')}
              </h3>

              {/* Template Selector */}
              {templates.length > 0 && (
                <div className="mb-4">
                  <Select value={selectedTemplate} onValueChange={applyTemplate}>
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue placeholder="Vorlage verwenden..." />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-3 mb-4">
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-lg ${
                      msg.sender_id === user?.id
                        ? 'bg-netflix-red/10 ml-8'
                        : 'bg-muted mr-8'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-foreground">
                        {msg.profiles?.name || t('applicants.you')}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(msg.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{msg.message}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder={t('applicants.message_placeholder')}
                  className="bg-input border-border resize-none"
                  rows={3}
                />
                <Button onClick={handleSendMessage} size="icon" className="self-end" aria-label="Nachricht senden">
                  <Send className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Activity Timeline */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {t('applicants.activity')}
              </h3>
              <div className="space-y-3">
                {activity.map(act => (
                  <div key={act.id} className="flex gap-3">
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-netflix-red mt-2" />
                    <div>
                      <div className="text-sm text-foreground">
                        <span className="font-medium">{act.profiles?.name || t('applicants.system')}</span>
                        {' '}
                        {act.action === 'stage_changed' && (
                          <>
                            {t('applicants.changed_stage_from')}{' '}
                            <Badge variant="outline" className="text-xs">
                              {act.details?.old_stage}
                            </Badge>
                            {' '}{t('applicants.to')}{' '}
                            <Badge variant="outline" className="text-xs">
                              {act.details?.new_stage}
                            </Badge>
                          </>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(act.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
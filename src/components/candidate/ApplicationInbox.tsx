import { useState, useEffect, useMemo, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Send, Mail, MailOpen, Briefcase, Dot, Check, CheckCheck } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistanceToNow } from 'date-fns';
import { de as deLocale, enUS as enLocale } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUnreadMessagesCount } from "@/hooks/useUnreadMessagesCount";
import { showDesktopNotification, getNotificationPermission, requestNotificationPermission, isNotificationSupported } from '@/hooks/useDesktopNotifications';

interface Message {
  id: string;
  application_id: string;
  sender_id: string;
  message: string;
  created_at: string;
  read_at: string | null;
  profiles: {
    name: string;
  };
}

interface Application {
  id: string;
  stage: string;
  status: string;
  jobs: {
    title: string;
    city: string;
    state: string;
  };
  messages: Message[];
  unread_count: number;
  last_message_at?: string | null;
  last_preview?: string | null;
}

export function ApplicationInbox() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { language, t } = useLanguage();
  const [typingFromOther, setTypingFromOther] = useState(false);
  const typingTimeoutRef = useRef<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [filterTab, setFilterTab] = useState<'all' | 'unread'>('all');
  const [jobFilter, setJobFilter] = useState<string>('all');
  const unreadMessagesCount = useUnreadMessagesCount(); // Live update header badge when thread opened

  useEffect(() => {
    loadApplications();
    
    // Subscribe to new messages
    const channel = supabase
      .channel('inbox-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'application_messages',
        },
        async (payload: any) => {
          const msg = payload?.new as Message | undefined;
          loadApplications();
          if (selectedApp) {
            loadMessages(selectedApp.id);
          }
          if (msg && msg.sender_id !== user?.id) {
            const senderName = msg.profiles?.name || (language === 'de' ? 'Unbekannt' : 'Unknown');

            // Toast info
            toast({
              title: language === 'de' ? `Neue Nachricht von ${senderName}` : `New message from ${senderName}`,
            });

            // Try desktop notification
            let permission = getNotificationPermission();
            if (isNotificationSupported() && permission === 'default') {
              permission = await requestNotificationPermission();
            }
            const notified = showDesktopNotification({
              title: language === 'de' ? 'Neue Nachricht' : 'New message',
              body: msg.message?.slice(0, 120),
              onClick: () => {
                // focus Applications page and open thread
                window.focus();
              },
            });

            // Email fallback if notifications are denied or unsupported
            if (!notified && (permission === 'denied' || !isNotificationSupported())) {
              const toEmail = profile?.email || user?.email;
              if (toEmail) {
                // fire-and-forget; errors logged in function
                supabase.functions.invoke('send-email-notification', {
                  body: {
                    to: toEmail,
                    subject: language === 'de' ? 'Neue Nachricht in Pflegeflix' : 'New message in Pflegeflix',
                    text: `${senderName}: ${String(msg.message || '').slice(0, 500)}`,
                  },
                });
              }
            }

            // Auto-scroll only if thread matches
            if (selectedApp && msg.application_id === selectedApp.id) {
              setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
              }, 50);
            }
          }
        }
      )
      .subscribe();

    // Typing Indicator via Broadcast
    const typingChannel = supabase
      .channel('inbox-typing', { config: { broadcast: { self: true } } })
      .on('broadcast', { event: 'typing' }, (payload: any) => {
        const { application_id, user_id } = payload?.payload || {};
        if (application_id && selectedApp?.id === application_id && user_id && user_id !== user?.id) {
          setTypingFromOther(true);
          if (typingTimeoutRef.current) {
            window.clearTimeout(typingTimeoutRef.current);
          }
          typingTimeoutRef.current = window.setTimeout(() => setTypingFromOther(false), 2000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(typingChannel);
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);
 
  useEffect(() => {
    if (selectedApp) {
      loadMessages(selectedApp.id);
      markMessagesAsRead(selectedApp.id);
    }
  }, [selectedApp]);
 
  // Refresh inbox list when unreadMessagesCount changes (e.g., new message arrives)
  useEffect(() => {
    loadApplications();
  }, [unreadMessagesCount]);

  const loadApplications = async () => {
    const { data } = await supabase
      .from('applications')
      .select(`
        id,
        stage,
        status,
        jobs(title, city, state)
      `)
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (data) {
      // Load unread counts and last message for each application
      const appsWithMeta = await Promise.all(
        data.map(async (app: any) => {
          const [{ count: unreadCount }, { data: lastMsgs }] = await Promise.all([
            supabase
              .from('application_messages')
              .select('*', { count: 'exact', head: true })
              .eq('application_id', app.id)
              .neq('sender_id', user?.id)
              .is('read_at', null),
            supabase
              .from('application_messages')
              .select('id, message, created_at')
              .eq('application_id', app.id)
              .order('created_at', { ascending: false })
              .limit(1),
          ]);
          const last = (lastMsgs || [])[0] as any;
          const lastPreview = last?.message ? String(last.message).slice(0, 60) : null;
          return { 
            ...app, 
            unread_count: unreadCount || 0,
            last_message_at: last?.created_at || null,
            last_preview: lastPreview,
          };
        })
      );
      // Sort by last_message_at desc
      appsWithMeta.sort((a, b) => {
        const ta = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
        const tb = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
        return tb - ta;
      });
      setApplications(appsWithMeta);
    }
  };

  const loadMessages = async (applicationId: string) => {
    const { data } = await supabase
      .from('application_messages')
      .select(`
        *,
        profiles!application_messages_sender_id_fkey(name)
      `)
      .eq('application_id', applicationId)
      .order('created_at', { ascending: true });
    
    setMessages((data as any) || []);
    // Scroll to bottom after load
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const markMessagesAsRead = async (applicationId: string) => {
    await supabase
      .from('application_messages')
      .update({ read_at: new Date().toISOString() })
      .eq('application_id', applicationId)
      .neq('sender_id', user?.id)
      .is('read_at', null);
    
    loadApplications();
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedApp) return;

    const { error } = await supabase
      .from('application_messages')
      .insert({
        application_id: selectedApp.id,
        sender_id: user?.id,
        message: newMessage.trim(),
      });

    if (!error) {
      setNewMessage('');
      loadMessages(selectedApp.id);
      toast({ title: t('application.message_sent_toast') || 'Nachricht gesendet' });
    } else {
      toast({ title: t('application.error_sending_message') || 'Fehler beim Senden', variant: 'destructive' });
    }
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

  const getStageLabel = (stage: string) => {
    const labels: Record<string, string> = {
      submitted: 'Eingereicht',
      viewed: 'Gesichtet',
      interview: 'Vorstellungsgespräch',
      offer: 'Angebot',
      rejected: 'Abgelehnt',
    };
    return labels[stage] || stage;
  };

  const localeObj = useMemo(() => (language === 'de' ? deLocale : enLocale), [language]);
  const relativeTime = (dateStr?: string | null) => {
    if (!dateStr) return '';
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: localeObj });
  };

  const filteredApplications = useMemo(() => {
    let list = [...applications];
    if (filterTab === 'unread') {
      list = list.filter(a => (a.unread_count || 0) > 0);
    }
    if (jobFilter !== 'all') {
      list = list.filter(a => a.jobs.title === jobFilter);
    }
    return list;
  }, [applications, filterTab, jobFilter]);

  return (
    <div className="grid md:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
      {/* Applications List */}
      <Card className="bg-card border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {t('application.inbox_title')}
            </h3>
            <div className="flex items-center gap-3">
              <Tabs value={filterTab} onValueChange={(v: any) => setFilterTab(v)}>
                <TabsList className="bg-muted">
                  <TabsTrigger value="all">{t('applicants.all') || 'Alle'}</TabsTrigger>
                  <TabsTrigger value="unread">{t('messages.unread') || 'Ungelesen'}</TabsTrigger>
                </TabsList>
              </Tabs>
              <Select value={jobFilter} onValueChange={(v) => setJobFilter(v)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder={t('applicants.filter_job')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('applicants.all_jobs')}</SelectItem>
                  {Array.from(new Set(applications.map(a => a.jobs.title))).map(title => (
                    <SelectItem key={title} value={title}>{title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <ScrollArea className="h-[calc(100%-4rem)]">
          <div className="p-2 space-y-2">
            {filteredApplications.map((app) => (
              <button
                key={app.id}
                onClick={() => setSelectedApp(app)}
                className={`w-full p-4 rounded-lg text-left transition-colors ${
                  selectedApp?.id === app.id
                    ? 'bg-muted'
                    : 'hover:bg-muted/50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      <h4 className={`text-foreground text-sm line-clamp-1 ${app.unread_count > 0 ? 'font-bold' : 'font-medium'}`}>
                        {app.jobs.title}
                      </h4>
                      {app.unread_count > 0 && <Dot className="h-4 w-4 text-netflix-red" aria-hidden="true" />}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-muted-foreground">
                        {app.jobs.city}, {app.jobs.state}
                      </p>
                      <p className="text-xs text-muted-foreground">{relativeTime(app.last_message_at)}</p>
                    </div>
                    {app.last_preview && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {app.last_preview}
                      </p>
                    )}
                  </div>
                  {app.unread_count > 0 && (
                    <Badge className="bg-netflix-red text-white text-xs">
                      {app.unread_count}
                    </Badge>
                  )}
                </div>
                <Badge className={`border text-xs ${getStageColor(app.stage)}`}>
                  {getStageLabel(app.stage)}
                </Badge>
              </button>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Messages */}
      <Card className="md:col-span-2 bg-card border-border overflow-hidden flex flex-col">
        {selectedApp ? (
          <>
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h3 className="font-semibold text-foreground">{selectedApp.jobs.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedApp.jobs.city}, {selectedApp.jobs.state}
                  </p>
                </div>
              </div>
              {typingFromOther && (
                <div className="mt-2 text-xs text-muted-foreground" aria-live="polite">
                  {language === 'de' ? 'tippt…' : 'typing…'}
                </div>
              )}
            </div>

            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef as any}>
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-lg ${
                      msg.sender_id === user?.id
                        ? 'bg-netflix-red/10 ml-12'
                        : 'bg-muted mr-12'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-foreground">
                        {msg.sender_id === user?.id ? 'Sie' : msg.profiles?.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(msg.created_at).toLocaleString()}
                      </span>
                      {/* Status-Ticks */}
                      {msg.sender_id === user?.id ? (
                        <span className="ml-auto flex items-center gap-1">
                          <Check className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                          <CheckCheck className={`h-3 w-3 ${msg.read_at ? 'text-blue-500' : 'text-muted-foreground'}`} aria-hidden="true" />
                        </span>
                      ) : (
                        msg.read_at && <MailOpen className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {msg.message}
                    </p>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <Separator />

            <div className="p-4">
              <div className="flex gap-2">
                <Textarea
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    // Broadcast typing
                    if (selectedApp) {
                      supabase.channel('inbox-typing').send({
                        type: 'broadcast',
                        event: 'typing',
                        payload: { application_id: selectedApp.id, user_id: user?.id },
                      });
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Nachricht eingeben..."
                  className="bg-input border-border resize-none"
                  rows={3}
                />
                <Button onClick={handleSendMessage} size="icon" className="self-end" aria-label="Nachricht senden">
                  <Send className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t('application.select_app_message')}</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
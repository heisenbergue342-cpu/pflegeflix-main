import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Send, Mail, MailOpen, Briefcase } from 'lucide-react';

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
}

export function ApplicationInbox() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

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
        () => {
          loadApplications();
          if (selectedApp) {
            loadMessages(selectedApp.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (selectedApp) {
      loadMessages(selectedApp.id);
      markMessagesAsRead(selectedApp.id);
    }
  }, [selectedApp]);

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
      // Load unread counts for each application
      const appsWithCounts = await Promise.all(
        data.map(async (app: any) => {
          const { count } = await supabase
            .from('application_messages')
            .select('*', { count: 'exact', head: true })
            .eq('application_id', app.id)
            .neq('sender_id', user?.id)
            .is('read_at', null);
          
          return { ...app, unread_count: count || 0 };
        })
      );
      
      setApplications(appsWithCounts);
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
      toast({ title: 'Nachricht gesendet' });
    } else {
      toast({ title: 'Fehler beim Senden', variant: 'destructive' });
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

  return (
    <div className="grid md:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
      {/* Applications List */}
      <Card className="bg-card border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Bewerbungen
          </h3>
        </div>
        <ScrollArea className="h-[calc(100%-4rem)]">
          <div className="p-2 space-y-2">
            {applications.map((app) => (
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
                    <h4 className="font-medium text-foreground text-sm line-clamp-1">
                      {app.jobs.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {app.jobs.city}, {app.jobs.state}
                    </p>
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
            </div>

            <ScrollArea className="flex-1 p-4">
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
                      {msg.sender_id !== user?.id && msg.read_at && (
                        <MailOpen className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {msg.message}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <Separator />

            <div className="p-4">
              <div className="flex gap-2">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
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
              <p>Wählen Sie eine Bewerbung aus, um Nachrichten zu sehen</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
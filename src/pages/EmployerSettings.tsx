import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageTemplates } from '@/components/employer/MessageTemplates';
import { FileText, Settings } from 'lucide-react';
import SEO from '@/components/SEO';
import { useLanguage } from '@/contexts/LanguageContext';

export default function EmployerSettings() {
  const { t, language } = useLanguage();
  
  return (
    <div className="min-h-screen bg-netflix-bg">
      <SEO
        title={t('employer.settings_page_title')}
        description={t('employer.settings_page_description')}
        canonical="/employer-settings"
        noindex={true}
      />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center gap-3 mb-8">
          <Settings className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('employer.settings_page_title')}</h1>
            <p className="text-muted-foreground">
              {t('employer.settings_page_subtitle')}
            </p>
          </div>
        </div>

        <Tabs defaultValue="templates" className="space-y-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="templates" className="gap-2">
              <FileText className="h-4 w-4" />
              {t('employer.message_templates')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="templates">
            <MessageTemplates />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Eye, Users, TrendingUp, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AnalyticsDashboard from '@/components/employer/AnalyticsDashboard';

export default function EmployerDashboard() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, views: 0, applications: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboard();
    }
  }, [user]);

  const loadDashboard = async () => {
    setLoading(true);
    
    // Load jobs
    const { data: jobsData } = await supabase
      .from('jobs')
      .select('*, applications(count)')
      .eq('employer_id', user?.id)
      .order('created_at', { ascending: false });

    if (jobsData) {
      setJobs(jobsData);
      
      const total = jobsData.length;
      const active = jobsData.filter(j => j.is_active).length;
      const views = jobsData.reduce((sum, j) => sum + (j.view_count || 0), 0);
      const applications = jobsData.reduce((sum, j) => sum + (j.applications?.[0]?.count || 0), 0);
      
      setStats({ total, active, views, applications });
    }
    
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{language === 'de' ? 'Dashboard' : 'Dashboard'}</h1>
          <p className="text-muted-foreground">
            {language === 'de' ? 'Verwalten Sie Ihre Stellenanzeigen' : 'Manage your job postings'}
          </p>
        </div>
        <Button onClick={() => navigate('/employer/post')} className="bg-netflix-red hover:bg-netflix-red-dark">
          {language === 'de' ? 'Neue Stelle' : 'New Job'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{language === 'de' ? 'Stellen gesamt' : 'Total Jobs'}</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{language === 'de' ? 'Aktive Stellen' : 'Active Jobs'}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{language === 'de' ? 'Aufrufe' : 'Views'}</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.views}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{language === 'de' ? 'Bewerbungen' : 'Applications'}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.applications}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="jobs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="jobs">
            <Briefcase className="h-4 w-4 mr-2" />
            {language === 'de' ? 'Stellen' : 'Jobs'}
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            {language === 'de' ? 'Analytics' : 'Analytics'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-4">
          {/* ... existing jobs list ... */}
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
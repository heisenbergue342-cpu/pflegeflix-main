import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  User, MapPin, Briefcase, Calendar, Heart, FileText, 
  Settings, Save, Mail, Phone, Edit2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import JobCard from '@/components/JobCard';
import EmptyState from '@/components/EmptyState';
import SEO from '@/components/SEO';
import { useLanguage } from '@/contexts/LanguageContext';

export default function CandidateDashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Profile data
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    city: '',
    state: '',
    skills: [] as string[],
  });
  const [newSkill, setNewSkill] = useState('');
  
  // Stats
  const [stats, setStats] = useState({
    savedJobs: 0,
    applications: 0,
    savedSearches: 0,
  });
  
  // Jobs and applications
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileData) {
        setProfileData({
          name: profileData.name || '',
          email: profileData.email || user.email || '',
          city: profileData.city || '',
          state: profileData.state || '',
          skills: profileData.skills || [],
        });
      }
      
      // Load stats
      const [savedJobsRes, appsRes] = await Promise.all([
        supabase.from('saved_jobs').select('job_id, jobs(*)').eq('user_id', user.id),
        supabase.from('applications').select('*, jobs(title, city, state)').eq('user_id', user.id).order('created_at', { ascending: false }),
      ]);
      
      setSavedJobs(savedJobsRes.data?.map(s => s.jobs) || []);
      setApplications(appsRes.data || []);
      
      setStats({
        savedJobs: savedJobsRes.data?.length || 0,
        applications: appsRes.data?.length || 0,
        savedSearches: 0, // Placeholder
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: t('error.load_failed'),
        description: t('dashboard.load_data_error'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: profileData.name,
          city: profileData.city,
          state: profileData.state,
          skills: profileData.skills,
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast({
        title: t('dashboard.profile_saved'),
        description: t('dashboard.profile_saved_description'),
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: t('error.save_failed'),
        description: t('dashboard.profile_save_error'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill),
    }));
  };

  const getApplicationStatusBadge = (status: string, stage: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      submitted: { label: t('dashboard.stage.submitted'), variant: 'outline' },
      viewed: { label: t('dashboard.stage.viewed'), variant: 'secondary' },
      interview: { label: t('dashboard.stage.interview'), variant: 'default' },
      offer: { label: t('dashboard.stage.offer'), variant: 'default' },
      rejected: { label: t('dashboard.stage.rejected'), variant: 'destructive' },
    };
    
    const config = statusConfig[stage] || statusConfig[status] || { label: status, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-8">
        <div className="container max-w-7xl mx-auto px-4">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-8">
      <SEO 
        title={t('menu.dashboard')}
        description={t('dashboard.manage_profile_applications')}
        canonical="/dashboard"
        noindex={true}
      />
      
      <div className="container max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('dashboard.welcome')}, {profileData.name || t('dashboard.user')}!</h1>
          <p className="text-muted-foreground">{t('dashboard.manage_profile_applications')}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="cursor-pointer hover:border-primary transition" onClick={() => setActiveTab('saved')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.saved_jobs')}</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.savedJobs}</div>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:border-primary transition" onClick={() => setActiveTab('applications')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.applications')}</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.applications}</div>
            </CardContent>
          </Card>
          
          <Card className="opacity-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.saved_searches')}</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.savedSearches}</div>
              <Badge variant="outline" className="mt-1 text-xs">{t('dashboard.coming_soon')}</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="overview">{t('dashboard.overview')}</TabsTrigger>
            <TabsTrigger value="profile">{t('dashboard.profile')}</TabsTrigger>
            <TabsTrigger value="saved">{t('dashboard.saved_jobs')}</TabsTrigger>
            <TabsTrigger value="applications">{t('dashboard.applications')}</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Applications */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('dashboard.recent_applications')}</CardTitle>
                  <CardDescription>{t('dashboard.last_5_applications')}</CardDescription>
                </CardHeader>
                <CardContent>
                  {applications.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      {t('dashboard.no_applications_yet')}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {applications.slice(0, 5).map((app) => (
                        <div key={app.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{app.jobs?.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {app.jobs?.city}, {app.jobs?.state}
                            </p>
                          </div>
                          {getApplicationStatusBadge(app.status, app.stage)}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Profile Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('dashboard.profile_summary')}</CardTitle>
                  <CardDescription>{t('dashboard.profile_data')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t('dashboard.name')}</p>
                      <p className="font-medium">{profileData.name || t('dashboard.not_specified')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t('dashboard.email')}</p>
                      <p className="font-medium">{profileData.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t('dashboard.location')}</p>
                      <p className="font-medium">
                        {profileData.city && profileData.state 
                          ? `${profileData.city}, ${profileData.state}` 
                          : t('dashboard.not_specified')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t('dashboard.skills')}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {profileData.skills.length > 0 ? (
                          profileData.skills.slice(0, 3).map(skill => (
                            <Badge key={skill} variant="secondary">{skill}</Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">{t('dashboard.no_skills_specified')}</span>
                        )}
                        {profileData.skills.length > 3 && (
                          <Badge variant="outline">+{profileData.skills.length - 3}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={() => setActiveTab('profile')}
                  >
                    <Edit2 className="w-4 h-4 mr-2" aria-hidden="true" />
                    {t('dashboard.edit_profile')}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.edit_profile_title')}</CardTitle>
                <CardDescription>{t('dashboard.update_profile_info')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('dashboard.name')} *</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Max Mustermann"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('dashboard.email')} *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">{t('dashboard.email_cannot_be_changed')}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="city">{t('dashboard.city')}</Label>
                    <Input
                      id="city"
                      value={profileData.city}
                      onChange={(e) => setProfileData(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="Berlin"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="state">{t('dashboard.state')}</Label>
                    <Input
                      id="state"
                      value={profileData.state}
                      onChange={(e) => setProfileData(prev => ({ ...prev, state: e.target.value }))}
                      placeholder="Berlin"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t('dashboard.skills')}</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      placeholder={t('dashboard.add_skill_placeholder')}
                    />
                    <Button type="button" onClick={addSkill}>{t('dashboard.add')}</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {profileData.skills.map(skill => (
                      <Badge key={skill} variant="secondary" className="gap-2">
                        {skill}
                        <button
                          onClick={() => removeSkill(skill)}
                          className="hover:text-destructive"
                          aria-label={t('common.remove_item', { item: skill })}
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSaveProfile} disabled={saving}>
                    <Save className="w-4 h-4 mr-2" aria-hidden="true" />
                    {saving ? t('dashboard.saving') : t('dashboard.save_changes')}
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/privacy-settings')}>
                    <Settings className="w-4 h-4 mr-2" aria-hidden="true" />
                    {t('dashboard.privacy_settings')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Saved Jobs Tab */}
          <TabsContent value="saved">
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.saved_jobs')} ({stats.savedJobs})</CardTitle>
                <CardDescription>{t('dashboard.jobs_for_later')}</CardDescription>
              </CardHeader>
              <CardContent>
                {savedJobs.length === 0 ? (
                  <EmptyState
                    icon={Heart}
                    title={t('dashboard.no_saved_jobs')}
                    description={t('dashboard.no_saved_jobs_description')}
                    action={{
                      label: t('dashboard.browse_jobs'),
                      onClick: () => navigate('/search')
                    }}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedJobs.map(job => job && <JobCard key={job.id} job={job} onSaveChange={loadDashboardData} />)}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.applications')} ({stats.applications})</CardTitle>
                <CardDescription>{t('dashboard.all_applications_overview')}</CardDescription>
              </CardHeader>
              <CardContent>
                {applications.length === 0 ? (
                  <EmptyState
                    icon={FileText}
                    title={t('dashboard.no_applications')}
                    description={t('dashboard.no_applications_description')}
                    action={{
                      label: t('dashboard.browse_jobs'),
                      onClick: () => navigate('/search')
                    }}
                  />
                ) : (
                  <div className="space-y-4">
                    {applications.map((app) => (
                      <div key={app.id} className="border rounded-lg p-4 hover:border-primary transition">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">{app.jobs?.title}</h4>
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3" aria-hidden="true" />
                              {app.jobs?.city}, {app.jobs?.state}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <Calendar className="w-3 h-3" aria-hidden="true" />
                              {t('dashboard.applied_on')}: {new Date(app.created_at).toLocaleDateString('de-DE')}
                            </p>
                          </div>
                          <div className="text-right">
                            {getApplicationStatusBadge(app.status, app.stage)}
                          </div>
                        </div>
                        {app.cover_letter && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-sm text-muted-foreground font-medium mb-1">{t('dashboard.cover_letter_short')}:</p>
                            <p className="text-sm line-clamp-2">{app.cover_letter}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
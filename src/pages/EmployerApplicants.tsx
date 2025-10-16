import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ApplicantDrawer } from '@/components/employer/ApplicantDrawer';
import EmptyState from '@/components/EmptyState';
import { Search, Download, Star, UserCheck, UserX, Users, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import SEO from '@/components/SEO';

interface Applicant {
  id: string;
  user_id: string;
  job_id: string;
  stage: string;
  status: string;
  cover_letter: string;
  notes: string;
  internal_notes: string;
  rating: number | null;
  recommend: boolean;
  tags: string[] | null;
  created_at: string;
  viewed_at: string | null;
  jobs: {
    id: string;
    title: string;
    city: string;
    state: string;
    facility_type: string;
  };
  profiles: {
    id: string;
    name: string;
    email: string;
    city: string;
  };
}

export default function EmployerApplicants() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [filteredApplicants, setFilteredApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedIds, setSelectedIds] = new Set<string>(); // Use a ref or state for this

  // Filters from URL
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [stageFilter, setStageFilter] = useState(searchParams.get('stage') || 'all');
  const [jobFilter, setJobFilter] = useState(searchParams.get('job') || 'all');
  const [tab, setTab] = useState(searchParams.get('tab') || 'all');
  
  const [jobs, setJobs] = useState<any[]>([]);

  // Analytics
  const [analytics, setAnalytics] = useState({
    total: 0,
    submitted: 0,
    viewed: 0,
    interview: 0,
    offer: 0,
    rejected: 0,
  });

  useEffect(() => {
    if (user) {
      loadJobs();
      loadApplicants();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [applicants, searchTerm, stageFilter, jobFilter, tab]);

  useEffect(() => {
    // Update URL params
    const params: any = {};
    if (searchTerm) params.search = searchTerm;
    if (stageFilter !== 'all') params.stage = stageFilter;
    if (jobFilter !== 'all') params.job = jobFilter;
    if (tab !== 'all') params.tab = tab;
    setSearchParams(params);
  }, [searchTerm, stageFilter, jobFilter, tab]);

  const loadJobs = async () => {
    const { data } = await supabase
      .from('jobs')
      .select('id, title')
      .eq('owner_id', user?.id)
      .order('created_at', { ascending: false });
    
    setJobs(data || []);
  };

  const loadApplicants = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        jobs!inner(id, title, city, state, facility_type, owner_id),
        profiles!inner(id, name, email, city)
      `)
      .eq('jobs.owner_id', user?.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setApplicants(data as any);
      calculateAnalytics(data as any);
    }
    setLoading(false);
  };

  const calculateAnalytics = (data: Applicant[]) => {
    const stats = {
      total: data.length,
      submitted: data.filter(a => a.stage === 'submitted').length,
      viewed: data.filter(a => a.stage === 'viewed').length,
      interview: data.filter(a => a.stage === 'interview').length,
      offer: data.filter(a => a.stage === 'offer').length,
      rejected: data.filter(a => a.stage === 'rejected').length,
    };
    setAnalytics(stats);
  };

  const applyFilters = () => {
    let filtered = [...applicants];

    // Tab filter
    if (tab !== 'all' && jobFilter !== 'all') {
      filtered = filtered.filter(a => a.job_id === jobFilter);
    }

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(a =>
        a.profiles.name?.toLowerCase().includes(term) ||
        a.profiles.email?.toLowerCase().includes(term) ||
        a.jobs.title?.toLowerCase().includes(term)
      );
    }

    // Stage filter
    if (stageFilter !== 'all') {
      filtered = filtered.filter(a => a.stage === stageFilter);
    }

    // Job filter
    if (jobFilter !== 'all') {
      filtered = filtered.filter(a => a.job_id === jobFilter);
    }

    setFilteredApplicants(filtered);
  };

  const handleRowClick = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setDrawerOpen(true);
    
    // Mark as viewed
    if (!applicant.viewed_at) {
      supabase
        .from('applications')
        .update({ viewed_at: new Date().toISOString() })
        .eq('id', applicant.id)
        .then(() => loadApplicants());
    }
  };

  const handleBulkAction = async (action: 'stage' | 'delete', value?: string) => {
    const ids = Array.from(selectedIds);
    
    if (action === 'delete') {
      const { error } = await supabase
        .from('applications')
        .delete()
        .in('id', ids);
      
      if (!error) {
        toast({ title: t('applicants.bulk_deleted') });
        loadApplicants();
        selectedIds.clear(); // Clear the Set
      }
    } else if (action === 'stage' && value) {
      const { error } = await supabase
        .from('applications')
        .update({ stage: value })
        .in('id', ids);
      
      if (!error) {
        toast({ title: t('applicants.bulk_updated') });
        loadApplicants();
        selectedIds.clear(); // Clear the Set
      }
    }
  };

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Job', 'Stage', 'Rating', 'Applied', 'City'];
    const rows = filteredApplicants.map(a => [
      a.profiles.name || '',
      a.profiles.email || '',
      a.jobs.title,
      a.stage,
      a.rating || '',
      new Date(a.created_at).toLocaleDateString(),
      a.profiles.city || ''
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `applicants-${new Date().toISOString()}.csv`;
    a.click();
    
    toast({ title: t('applicants.exported') });
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

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-netflix-bg p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-bg p-6">
      <SEO
        title={t('applicants.title')}
        description={t('employer.portal_subtitle')}
        canonical="/employer/applicants"
        noindex={true}
      />
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">{t('applicants.title')}</h1>
          <Button onClick={exportCSV} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            {t('applicants.export')}
          </Button>
        </div>

        {/* Analytics */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[
            { key: 'total', label: t('applicants.total'), value: analytics.total, color: 'text-foreground' },
            { key: 'submitted', label: t('applicants.submitted'), value: analytics.submitted, color: 'text-blue-400' },
            { key: 'viewed', label: t('applicants.viewed'), value: analytics.viewed, color: 'text-purple-400' },
            { key: 'interview', label: t('applicants.interview'), value: analytics.interview, color: 'text-yellow-400' },
            { key: 'offer', label: t('applicants.offer'), value: analytics.offer, color: 'text-green-400' },
            { key: 'rejected', label: t('applicants.rejected'), value: analytics.rejected, color: 'text-red-400' },
          ].map(stat => (
            <Card key={stat.key} className="bg-card border-border p-4">
              <div className="text-sm text-muted-foreground">{stat.label}</div>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-muted">
            <TabsTrigger value="all">{t('applicants.all')}</TabsTrigger>
            <TabsTrigger value="by-job">{t('applicants.by_job')}</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('applicants.search_placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-input border-border"
                />
              </div>
              
              <Select value={stageFilter} onValueChange={setStageFilter}>
                <SelectTrigger className="w-[180px] bg-input border-border">
                  <SelectValue placeholder={t('applicants.filter_stage')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('applicants.all_stages')}</SelectItem>
                  <SelectItem value="submitted">{t('applicants.submitted')}</SelectItem>
                  <SelectItem value="viewed">{t('applicants.viewed')}</SelectItem>
                  <SelectItem value="interview">{t('applicants.interview')}</SelectItem>
                  <SelectItem value="offer">{t('applicants.offer')}</SelectItem>
                  <SelectItem value="rejected">{t('applicants.rejected')}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={jobFilter} onValueChange={setJobFilter}>
                <SelectTrigger className="w-[200px] bg-input border-border">
                  <SelectValue placeholder={t('applicants.filter_job')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('applicants.all_jobs')}</SelectItem>
                  {jobs.map(job => (
                    <SelectItem key={job.id} value={job.id}>{job.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bulk Actions */}
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg border border-border">
                <span className="text-sm text-muted-foreground">
                  {selectedIds.size} {t('applicants.selected')}
                </span>
                <Select onValueChange={(v) => handleBulkAction('stage', v)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={t('applicants.change_stage')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewed">{t('applicants.viewed')}</SelectItem>
                    <SelectItem value="interview">{t('applicants.interview')}</SelectItem>
                    <SelectItem value="offer">{t('applicants.offer')}</SelectItem>
                    <SelectItem value="rejected">{t('applicants.rejected')}</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="destructive" onClick={() => handleBulkAction('delete')}>
                  {t('applicants.delete_selected')}
                </Button>
              </div>
            )}

            {/* Applicants Table */}
            <Card className="bg-card border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border bg-muted/50">
                    <tr>
                      <th className="p-4 text-left">
                        <Checkbox
                          checked={selectedIds.size === filteredApplicants.length && filteredApplicants.length > 0}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              filteredApplicants.forEach(a => selectedIds.add(a.id));
                            } else {
                              selectedIds.clear();
                            }
                            // Force re-render
                            setSelectedApplicant(null);
                          }}
                        />
                      </th>
                      <th className="p-4 text-left text-sm font-medium text-muted-foreground">{t('applicants.applicant')}</th>
                      <th className="p-4 text-left text-sm font-medium text-muted-foreground">{t('applicants.job')}</th>
                      <th className="p-4 text-left text-sm font-medium text-muted-foreground">{t('applicants.stage')}</th>
                      <th className="p-4 text-left text-sm font-medium text-muted-foreground">{t('applicants.rating')}</th>
                      <th className="p-4 text-left text-sm font-medium text-muted-foreground">{t('applicants.applied')}</th>
                      <th className="p-4 text-left text-sm font-medium text-muted-foreground">{t('applicants.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplicants.map((applicant) => (
                      <tr
                        key={applicant.id}
                        className="border-b border-border hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => handleRowClick(applicant)}
                      >
                        <td className="p-4" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedIds.has(applicant.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                selectedIds.add(applicant.id);
                              } else {
                                selectedIds.delete(applicant.id);
                              }
                              // Force re-render
                              setSelectedApplicant(null);
                            }}
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 bg-netflix-red">
                              <AvatarFallback className="bg-netflix-red text-white text-sm font-medium">
                                {getInitials(applicant.profiles.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-foreground">{applicant.profiles.name}</div>
                              <div className="text-sm text-muted-foreground">{applicant.profiles.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-foreground">{applicant.jobs.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {applicant.jobs.city}, {applicant.jobs.state}
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={`border ${getStageColor(applicant.stage)}`}>
                            {t(`applicants.${applicant.stage}`)}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            {applicant.rating ? (
                              <>
                                {Array.from({ length: applicant.rating }).map((_, i) => (
                                  <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                                ))}
                              </>
                            ) : (
                              <span className="text-muted-foreground text-sm">—</span>
                            )}
                            {applicant.recommend && (
                              <UserCheck className="h-4 w-4 text-green-500 ml-2" />
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {new Date(applicant.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRowClick(applicant);
                            }}
                          >
                            {t('applicants.view')}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredApplicants.length === 0 && applicants.length === 0 && (
                <div className="p-16 text-center">
                  <div className="rounded-full bg-muted p-6 mb-6 inline-block">
                    <Briefcase className="w-12 h-12 text-muted-foreground" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{t('applicants.empty_title')}</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6">{t('applicants.empty_description')}</p>
                  <Button asChild size="lg">
                    <Link to="/employer/post">{t('employer.post_job')}</Link>
                  </Button>
                </div>
              )}
              
              {filteredApplicants.length === 0 && applicants.length > 0 && (
                <div className="p-8">
                  <EmptyState
                    icon={Users}
                    title={t('applicants.no_results')}
                    description={t('applicants.no_results_description')}
                    action={{
                      label: t('applicants.clear_filters'),
                      onClick: () => {
                        setSearchTerm('');
                        setStageFilter('all');
                        setJobFilter('all');
                      }
                    }}
                  />
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="by-job" className="space-y-4">
            <div className="text-muted-foreground">{t('applicants.select_job_hint')}</div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Applicant Drawer */}
      <ApplicantDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        applicant={selectedApplicant}
        onUpdate={loadApplicants}
      />
    </div>
  );
}
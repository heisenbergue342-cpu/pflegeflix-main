import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, AlertCircle, Eye, MousePointerClick, FileText, Send, CheckCircle } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface FunnelData {
  job_id: string;
  job_title: string;
  impressions: number;
  list_clicks: number;
  detail_views: number;
  apply_opens: number;
  apply_submits: number;
}

interface TrendData {
  date: string;
  impressions: number;
  clicks: number;
  applications: number;
}

interface FilterHeatmap {
  filter_key: string;
  filter_value: string;
  conversions: number;
  total_views: number;
  conversion_rate: number;
}

const COLORS = ['#E50914', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'];

export default function AnalyticsDashboard() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('all');
  const [funnelData, setFunnelData] = useState<FunnelData[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [filterHeatmap, setFilterHeatmap] = useState<FilterHeatmap[]>([]);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadJobs();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user, selectedJobId, dateRange]);

  const loadJobs = async () => {
    const { data } = await supabase
      .from('jobs')
      .select('id, title')
      .eq('employer_id', user?.id)
      .order('created_at', { ascending: false });
    setJobs(data || []);
  };

  const loadAnalytics = async () => {
    setLoading(true);
    
    const daysAgo = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    // Build query
    let query = supabase
      .from('analytics_events')
      .select('*')
      .eq('employer_id', user?.id)
      .gte('timestamp', startDate.toISOString());

    if (selectedJobId !== 'all') {
      query = query.eq('job_id', selectedJobId);
    }

    const { data: events } = await query;

    if (events) {
      // Calculate funnel data per job
      const jobMap = new Map<string, FunnelData>();
      
      events.forEach((event) => {
        if (!jobMap.has(event.job_id)) {
          const job = jobs.find(j => j.id === event.job_id);
          jobMap.set(event.job_id, {
            job_id: event.job_id,
            job_title: job?.title || 'Unknown Job',
            impressions: 0,
            list_clicks: 0,
            detail_views: 0,
            apply_opens: 0,
            apply_submits: 0,
          });
        }

        const jobData = jobMap.get(event.job_id)!;
        switch (event.event_type) {
          case 'impression':
            jobData.impressions++;
            break;
          case 'list_click':
            jobData.list_clicks++;
            break;
          case 'detail_view':
            jobData.detail_views++;
            break;
          case 'apply_open':
            jobData.apply_opens++;
            break;
          case 'apply_submit':
            jobData.apply_submits++;
            break;
        }
      });

      setFunnelData(Array.from(jobMap.values()));

      // Calculate trend data (daily aggregates)
      const trendMap = new Map<string, TrendData>();
      events.forEach((event) => {
        const date = new Date(event.timestamp).toISOString().split('T')[0];
        if (!trendMap.has(date)) {
          trendMap.set(date, { date, impressions: 0, clicks: 0, applications: 0 });
        }
        const trend = trendMap.get(date)!;
        if (event.event_type === 'impression') trend.impressions++;
        if (event.event_type === 'list_click') trend.clicks++;
        if (event.event_type === 'apply_submit') trend.applications++;
      });

      setTrendData(Array.from(trendMap.values()).sort((a, b) => a.date.localeCompare(b.date)));

      // Calculate filter heatmap
      const filterMap = new Map<string, { conversions: number; views: number }>();
      events.forEach((event) => {
        if (event.filters_snapshot) {
          Object.entries(event.filters_snapshot).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              value.forEach((v) => {
                const filterKey = `${key}:${v}`;
                if (!filterMap.has(filterKey)) {
                  filterMap.set(filterKey, { conversions: 0, views: 0 });
                }
                const data = filterMap.get(filterKey)!;
                if (event.event_type === 'impression') data.views++;
                if (event.event_type === 'apply_submit') data.conversions++;
              });
            } else if (value) {
              const filterKey = `${key}:${value}`;
              if (!filterMap.has(filterKey)) {
                filterMap.set(filterKey, { conversions: 0, views: 0 });
              }
              const data = filterMap.get(filterKey)!;
              if (event.event_type === 'impression') data.views++;
              if (event.event_type === 'apply_submit') data.conversions++;
            }
          });
        }
      });

      const heatmap = Array.from(filterMap.entries())
        .map(([key, data]) => {
          const [filter_key, filter_value] = key.split(':');
          return {
            filter_key,
            filter_value,
            conversions: data.conversions,
            total_views: data.views,
            conversion_rate: data.views > 0 ? (data.conversions / data.views) * 100 : 0,
          };
        })
        .sort((a, b) => b.conversion_rate - a.conversion_rate)
        .slice(0, 10);

      setFilterHeatmap(heatmap);
    }

    setLoading(false);
  };

  const calculateConversionRate = (from: number, to: number) => {
    if (from === 0) return 0;
    return ((to / from) * 100).toFixed(1);
  };

  const findBiggestDropoff = (data: FunnelData) => {
    const stages = [
      { name: 'Impression → Click', from: data.impressions, to: data.list_clicks },
      { name: 'Click → Detail', from: data.list_clicks, to: data.detail_views },
      { name: 'Detail → Apply Open', from: data.detail_views, to: data.apply_opens },
      { name: 'Apply Open → Submit', from: data.apply_opens, to: data.apply_submits },
    ];

    let maxDropoff = { name: '', rate: 0 };
    stages.forEach((stage) => {
      if (stage.from > 0) {
        const dropoffRate = ((stage.from - stage.to) / stage.from) * 100;
        if (dropoffRate > maxDropoff.rate) {
          maxDropoff = { name: stage.name, rate: dropoffRate };
        }
      }
    });

    return maxDropoff;
  };

  const aggregatedFunnel = funnelData.reduce(
    (acc, job) => ({
      impressions: acc.impressions + job.impressions,
      list_clicks: acc.list_clicks + job.list_clicks,
      detail_views: acc.detail_views + job.detail_views,
      apply_opens: acc.apply_opens + job.apply_opens,
      apply_submits: acc.apply_submits + job.apply_submits,
    }),
    { impressions: 0, list_clicks: 0, detail_views: 0, apply_opens: 0, apply_submits: 0 }
  );

  const funnelChartData = [
    { stage: language === 'de' ? 'Impressionen' : 'Impressions', count: aggregatedFunnel.impressions, icon: Eye },
    { stage: language === 'de' ? 'Klicks' : 'Clicks', count: aggregatedFunnel.list_clicks, icon: MousePointerClick },
    { stage: language === 'de' ? 'Detailansichten' : 'Detail Views', count: aggregatedFunnel.detail_views, icon: FileText },
    { stage: language === 'de' ? 'Bewerbung geöffnet' : 'Apply Opened', count: aggregatedFunnel.apply_opens, icon: Send },
    { stage: language === 'de' ? 'Bewerbung abgeschickt' : 'Applied', count: aggregatedFunnel.apply_submits, icon: CheckCircle },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">{language === 'de' ? 'Lade Analytics...' : 'Loading analytics...'}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{language === 'de' ? 'Analytics' : 'Analytics'}</h2>
          <p className="text-muted-foreground">
            {language === 'de' ? 'Verfolgen Sie die Performance Ihrer Stellenanzeigen' : 'Track your job posting performance'}
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedJobId} onValueChange={setSelectedJobId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{language === 'de' ? 'Alle Stellen' : 'All Jobs'}</SelectItem>
              {jobs.map((job) => (
                <SelectItem key={job.id} value={job.id}>
                  {job.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={dateRange} onValueChange={(v: any) => setDateRange(v)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">{language === 'de' ? 'Letzte 7 Tage' : 'Last 7 days'}</SelectItem>
              <SelectItem value="30d">{language === 'de' ? 'Letzte 30 Tage' : 'Last 30 days'}</SelectItem>
              <SelectItem value="90d">{language === 'de' ? 'Letzte 90 Tage' : 'Last 90 days'}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Funnel Overview */}
      <Card>
        <CardHeader>
          <CardTitle>{language === 'de' ? 'Bewerbungs-Funnel' : 'Application Funnel'}</CardTitle>
          <CardDescription>
            {language === 'de' ? 'Von Impression bis zur Bewerbung' : 'From impression to application'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={funnelChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#E50914" />
            </BarChart>
          </ResponsiveContainer>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-netflix-red">
                {calculateConversionRate(aggregatedFunnel.impressions, aggregatedFunnel.list_clicks)}%
              </div>
              <div className="text-sm text-muted-foreground">
                {language === 'de' ? 'Impression → Klick' : 'Impression → Click'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-netflix-red">
                {calculateConversionRate(aggregatedFunnel.list_clicks, aggregatedFunnel.detail_views)}%
              </div>
              <div className="text-sm text-muted-foreground">
                {language === 'de' ? 'Klick → Detail' : 'Click → Detail'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-netflix-red">
                {calculateConversionRate(aggregatedFunnel.detail_views, aggregatedFunnel.apply_opens)}%
              </div>
              <div className="text-sm text-muted-foreground">
                {language === 'de' ? 'Detail → Bewerbung öffnen' : 'Detail → Apply Open'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-netflix-red">
                {calculateConversionRate(aggregatedFunnel.apply_opens, aggregatedFunnel.apply_submits)}%
              </div>
              <div className="text-sm text-muted-foreground">
                {language === 'de' ? 'Öffnen → Absenden' : 'Open → Submit'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{language === 'de' ? 'Trend über Zeit' : 'Trend Over Time'}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="impressions" stroke="#E50914" name={language === 'de' ? 'Impressionen' : 'Impressions'} />
              <Line type="monotone" dataKey="clicks" stroke="#4ECDC4" name={language === 'de' ? 'Klicks' : 'Clicks'} />
              <Line type="monotone" dataKey="applications" stroke="#45B7D1" name={language === 'de' ? 'Bewerbungen' : 'Applications'} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Per-Job Breakdown */}
      {selectedJobId === 'all' && funnelData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{language === 'de' ? 'Performance pro Stelle' : 'Per-Job Performance'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {funnelData.map((job) => {
                const dropoff = findBiggestDropoff(job);
                return (
                  <div key={job.job_id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{job.job_title}</h4>
                      {dropoff.rate > 50 && (
                        <Badge variant="destructive" className="gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {language === 'de' ? 'Hoher Abbruch' : 'High Drop-off'}
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-5 gap-2 text-center text-sm">
                      <div>
                        <div className="font-bold">{job.impressions}</div>
                        <div className="text-muted-foreground text-xs">{language === 'de' ? 'Impressionen' : 'Impressions'}</div>
                      </div>
                      <div>
                        <div className="font-bold">{job.list_clicks}</div>
                        <div className="text-muted-foreground text-xs">{language === 'de' ? 'Klicks' : 'Clicks'}</div>
                        <div className="text-xs text-netflix-red">{calculateConversionRate(job.impressions, job.list_clicks)}%</div>
                      </div>
                      <div>
                        <div className="font-bold">{job.detail_views}</div>
                        <div className="text-muted-foreground text-xs">{language === 'de' ? 'Details' : 'Details'}</div>
                        <div className="text-xs text-netflix-red">{calculateConversionRate(job.list_clicks, job.detail_views)}%</div>
                      </div>
                      <div>
                        <div className="font-bold">{job.apply_opens}</div>
                        <div className="text-muted-foreground text-xs">{language === 'de' ? 'Geöffnet' : 'Opened'}</div>
                        <div className="text-xs text-netflix-red">{calculateConversionRate(job.detail_views, job.apply_opens)}%</div>
                      </div>
                      <div>
                        <div className="font-bold">{job.apply_submits}</div>
                        <div className="text-muted-foreground text-xs">{language === 'de' ? 'Beworben' : 'Applied'}</div>
                        <div className="text-xs text-netflix-red">{calculateConversionRate(job.apply_opens, job.apply_submits)}%</div>
                      </div>
                    </div>
                    {dropoff.rate > 0 && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        {language === 'de' ? 'Größter Abbruch' : 'Biggest drop-off'}: {dropoff.name} ({dropoff.rate.toFixed(1)}%)
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Heatmap */}
      {filterHeatmap.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{language === 'de' ? 'Top-Filter nach Conversion' : 'Top Filters by Conversion'}</CardTitle>
            <CardDescription>
              {language === 'de' ? 'Welche Filter führen zu den meisten Bewerbungen?' : 'Which filters lead to the most applications?'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filterHeatmap.map((filter, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{filter.filter_value}</div>
                    <div className="text-sm text-muted-foreground">{filter.filter_key}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-netflix-red">{filter.conversion_rate.toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground">
                      {filter.conversions} / {filter.total_views}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { 
  Plus, Search, Filter, LayoutGrid, LayoutList, Download, 
  Eye, EyeOff, Edit, Trash2, Users, Copy, Star, 
  Play, Pause, XCircle, Calendar, ArrowUpDown, Briefcase
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import ApplicationsDrawer from "@/components/employer/ApplicationsDrawer";
import SEO from "@/components/SEO";

type ViewMode = "table" | "grid";
type SortBy = "newest" | "applications" | "views";
type StatusFilter = "all" | "draft" | "online" | "paused" | "closed" | "expired";
type CategoryFilter = "all" | "Kliniken" | "Altenheim" | "1:1 Intensivpflege";

export default function EmployerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [jobs, setJobs] = useState<any[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());
  const [applicationsDrawerOpen, setApplicationsDrawerOpen] = useState(false);
  const [selectedJobForApps, setSelectedJobForApps] = useState<{ id: string; title: string } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    checkRoleAndLoadJobs();
  }, [user]);

  const checkRoleAndLoadJobs = async () => {
    if (!user) return;

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["arbeitgeber", "admin"])
      .single();

    if (!roleData) {
      toast({
        title: t("error.unauthorized"),
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    loadJobs();
  };

  const loadJobs = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("owner_id", user.id);

    if (error) {
      toast({
        title: t("error.load_failed"),
        variant: "destructive",
      });
      return;
    }

    setJobs(data || []);
    setLoading(false);
  };

  // Filter and sort jobs
  useEffect(() => {
    let result = [...jobs];

    // Search
    if (searchQuery) {
      result = result.filter(job =>
        job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter(job => {
        const status = getJobStatus(job);
        return status === statusFilter;
      });
    }

    // Category filter
    if (categoryFilter !== "all") {
      result = result.filter(job => {
        if (categoryFilter === "Kliniken") {
          return job.facility_type === "Klinik" || job.facility_type === "Krankenhaus";
        }
        if (categoryFilter === "Altenheim") return job.facility_type === "Altenheim";
        if (categoryFilter === "1:1 Intensivpflege") return job.facility_type === "1zu1";
        return true;
      });
    }

    // Sort
    if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === "applications") {
      result.sort((a, b) => (b.applications_count || 0) - (a.applications_count || 0));
    } else if (sortBy === "views") {
      result.sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
    }

    setFilteredJobs(result);
  }, [jobs, searchQuery, statusFilter, categoryFilter, sortBy]);

  const getJobStatus = (job: any): StatusFilter => {
    if (!job.approved) return "draft";
    if (job.closed_at) return "closed";
    if (!job.is_active) return "paused";
    if (job.scheduled_unpublish_at && new Date(job.scheduled_unpublish_at) < new Date()) return "expired";
    return "online";
  };

  const getStatusBadgeVariant = (status: StatusFilter): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "online": return "default";
      case "paused": return "secondary";
      case "closed": return "destructive";
      case "draft": return "outline";
      case "expired": return "destructive";
      default: return "outline";
    }
  };

  const toggleJobStatus = async (jobId: string, currentActive: boolean) => {
    try {
      const { error } = await supabase
        .from("jobs")
        .update({ is_active: !currentActive })
        .eq("id", jobId);

      if (error) throw error;

      toast({
        description: currentActive ? t("job.toast.paused") : t("job.toast.activated"),
      });

      loadJobs();
    } catch (error: any) {
      toast({
        title: t("error.update_failed"),
        variant: "destructive",
      });
    }
  };

  const confirmDelete = (jobId: string) => {
    setJobToDelete(jobId);
    setDeleteDialogOpen(true);
  };

  const deleteJob = async () => {
    if (!jobToDelete) return;
    
    try {
      const { error } = await supabase
        .from("jobs")
        .delete()
        .eq("id", jobToDelete);

      if (error) throw error;

      toast({
        description: t("job.toast.deleted"),
      });

      loadJobs();
      setDeleteDialogOpen(false);
      setJobToDelete(null);
    } catch (error: any) {
      toast({
        title: t("error.delete_failed"),
        variant: "destructive",
      });
    }
  };

  const duplicateJob = async (jobId: string) => {
    try {
      const job = jobs.find(j => j.id === jobId);
      if (!job) return;

      const { data, error } = await supabase
        .from("draft_jobs")
        .insert({
          user_id: user?.id,
          title: `${job.title} (${t("dashboard.copy")})`,
          facility_type: job.facility_type,
          city: job.city,
          state: job.state,
          description: job.description,
          requirements: job.requirements,
          tags: job.tags,
          salary_min: job.salary_min,
          salary_max: job.salary_max,
          salary_unit: job.salary_unit,
          contract_type: job.contract_type,
          shift_type: job.shift_type,
          step: 5,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        description: t("job.published_success"),
      });

      navigate(`/employer/post/${data.id}`);
    } catch (error: any) {
      toast({
        title: t("error.duplicate_failed"),
        variant: "destructive",
      });
    }
  };

  const closeJob = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from("jobs")
        .update({ closed_at: new Date().toISOString() })
        .eq("id", jobId);

      if (error) throw error;

      toast({
        description: t("dashboard.job.closed"),
      });

      loadJobs();
    } catch (error: any) {
      toast({
        title: t("error.update_failed"),
        variant: "destructive",
      });
    }
  };

  const confirmBulkDelete = () => {
    if (selectedJobs.size === 0) return;
    setBulkDeleteDialogOpen(true);
  };

  const bulkAction = async (action: "pause" | "resume" | "close" | "delete") => {
    if (selectedJobs.size === 0) return;

    const jobIds = Array.from(selectedJobs);

    try {
      if (action === "pause") {
        const { error } = await supabase
          .from("jobs")
          .update({ is_active: false })
          .in("id", jobIds);

        if (error) throw error;

        toast({
          description: t("dashboard.bulk.pause_success"),
        });
      } else if (action === "resume") {
        const { error } = await supabase
          .from("jobs")
          .update({ is_active: true, closed_at: null })
          .in("id", jobIds);

        if (error) throw error;

        toast({
          description: t("dashboard.bulk.resume_success"),
        });
      } else if (action === "close") {
        const { error } = await supabase
          .from("jobs")
          .update({ closed_at: new Date().toISOString() })
          .in("id", jobIds);

        if (error) throw error;

        toast({
          description: t("dashboard.bulk.close_success"),
        });
      } else if (action === "delete") {
        const { error } = await supabase
          .from("jobs")
          .delete()
          .in("id", jobIds);

        if (error) throw error;

        toast({
          description: t("dashboard.bulk.delete_success"),
        });
        setBulkDeleteDialogOpen(false);
      }

      setSelectedJobs(new Set());
      loadJobs();
    } catch (error: any) {
      toast({
        title: t("error.generic"),
        variant: "destructive",
      });
    }
  };

  const exportCSV = () => {
    const headers = ["Titel", "Standort", "Status", "Aufrufe", "Bewerbungen", "Gespeichert", "Aktualisiert", "Kategorie"];
    const rows = filteredJobs.map(job => [
      job.title,
      `${job.city}, ${job.state}`,
      t(`dashboard.status.${getJobStatus(job)}`),
      job.views_count || 0,
      job.applications_count || 0,
      job.saves_count || 0,
      new Date(job.updated_at).toLocaleDateString(language === "de" ? "de-DE" : "en-US"),
      job.facility_type === "Klinik" || job.facility_type === "Krankenhaus" ? "Kliniken"
        : job.facility_type === "Altenheim" ? "Altenheime"
        : "1:1 Intensivpflege",
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `jobs-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();

    toast({
      description: t("applicants.exported"),
    });
  };

  const toggleSelection = (jobId: string) => {
    const newSelection = new Set(selectedJobs);
    if (newSelection.has(jobId)) {
      newSelection.delete(jobId);
    } else {
      newSelection.add(jobId);
    }
    setSelectedJobs(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedJobs.size === filteredJobs.length) {
      setSelectedJobs(new Set());
    } else {
      setSelectedJobs(new Set(filteredJobs.map(j => j.id)));
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <SEO
        title={t("dashboard.my_jobs")}
        description={t("employer.portal_subtitle")}
        canonical="/employer"
        noindex={true}
      />
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("dashboard.my_jobs")}</h1>
          <p className="text-muted-foreground mt-1">
            {filteredJobs.length} {t("dashboard.jobs_total")}
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-2" />
            {t("dashboard.export")}
          </Button>
          <Button asChild>
            <Link to="/employer/post">
              <Plus className="h-4 w-4 mr-2" />
              {t("employer.post_job")}
            </Link>
          </Button>
        </div>
      </div>

      {/* Empty State */}
      {jobs.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="rounded-full bg-muted p-6 mb-6">
              <Briefcase className="w-12 h-12 text-muted-foreground" aria-hidden="true" />
            </div>
            
            <h3 className="text-xl font-semibold mb-2">{t("dashboard.empty.title")}</h3>
            <p className="text-muted-foreground max-w-md mb-6">{t("dashboard.empty.description")}</p>
            
            <Button asChild size="lg">
              <Link to="/employer/post">{t("dashboard.empty.cta")}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("dashboard.search_placeholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={(value: StatusFilter) => setStatusFilter(value)}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("dashboard.filter.all_status")}</SelectItem>
                <SelectItem value="draft">{t("dashboard.filter.draft")}</SelectItem>
                <SelectItem value="online">{t("dashboard.filter.online")}</SelectItem>
                <SelectItem value="paused">{t("dashboard.filter.paused")}</SelectItem>
                <SelectItem value="closed">{t("dashboard.filter.closed")}</SelectItem>
                <SelectItem value="expired">{t("dashboard.filter.expired")}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={(value: CategoryFilter) => setCategoryFilter(value)}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("dashboard.filter.all_categories")}</SelectItem>
                <SelectItem value="Kliniken">{t('category.clinics')}</SelectItem>
                <SelectItem value="Altenheim">{t('category.nursing_homes')}</SelectItem>
                <SelectItem value="1:1 Intensivpflege">{t('category.intensive_care')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: SortBy) => setSortBy(value)}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{t("dashboard.sort.newest")}</SelectItem>
                <SelectItem value="applications">{t("dashboard.sort.applications")}</SelectItem>
                <SelectItem value="views">{t("dashboard.sort.views")}</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant={viewMode === "table" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("table")}
              >
                <LayoutList className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedJobs.size > 0 && (
            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
              <span className="text-sm font-medium">
                {selectedJobs.size} {t("dashboard.bulk.selected")}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => bulkAction("pause")}>
                  <Pause className="h-4 w-4 mr-2" />
                  {t("dashboard.bulk.pause")}
                </Button>
                <Button variant="outline" size="sm" onClick={() => bulkAction("resume")}>
                  <Play className="h-4 w-4 mr-2" />
                  {t("dashboard.bulk.resume")}
                </Button>
                <Button variant="outline" size="sm" onClick={() => bulkAction("close")}>
                  <XCircle className="h-4 w-4 mr-2" />
                  {t("dashboard.bulk.close")}
                </Button>
                <Button variant="destructive" size="sm" onClick={confirmBulkDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t("dashboard.bulk.delete")}
                </Button>
              </div>
            </div>
          )}

          {/* Table View */}
          {viewMode === "table" && (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedJobs.size === filteredJobs.length && filteredJobs.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>{t("dashboard.table.title")}</TableHead>
                    <TableHead>{t("dashboard.table.location")}</TableHead>
                    <TableHead>{t("dashboard.table.status")}</TableHead>
                    <TableHead>{t("dashboard.table.metrics")}</TableHead>
                    <TableHead>{t("dashboard.table.updated")}</TableHead>
                    <TableHead className="text-right">{t("dashboard.table.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJobs.map(job => (
                    <TableRow key={job.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedJobs.has(job.id)}
                          onCheckedChange={() => toggleSelection(job.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{job.title}</TableCell>
                      <TableCell>{job.city}, {job.state}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(getJobStatus(job))}>
                          {t(`dashboard.status.${getJobStatus(job)}`)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" /> {job.views_count || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" /> {job.applications_count || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="h-4 w-4" /> {job.saves_count || 0}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(job.updated_at), {
                          addSuffix: true,
                          locale: language === "de" ? de : undefined,
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                          >
                            <Link to={`/job/${job.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedJobForApps({ id: job.id, title: job.title });
                              setApplicationsDrawerOpen(true);
                            }}
                          >
                            <Users className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                          >
                            <Link to={`/employer/post/${job.id}`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => duplicateJob(job.id)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleJobStatus(job.id, job.is_active)}
                          >
                            {job.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => confirmDelete(job.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}

          {/* Grid View */}
          {viewMode === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredJobs.map(job => (
                <Card key={job.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <Checkbox
                      checked={selectedJobs.has(job.id)}
                      onCheckedChange={() => toggleSelection(job.id)}
                    />
                    <Badge variant={getStatusBadgeVariant(getJobStatus(job))}>
                      {t(`dashboard.status.${getJobStatus(job)}`)}
                    </Badge>
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-2">{job.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {job.city}, {job.state}
                  </p>

                  <div className="flex gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" /> {job.views_count || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" /> {job.applications_count || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4" /> {job.saves_count || 0}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/job/${job.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        {t("dashboard.action.preview")}
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/employer/post/${job.id}`}>
                        <Edit className="h-4 w-4 mr-2" />
                        {t("dashboard.action.edit")}
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleJobStatus(job.id, job.is_active)}
                    >
                      {job.is_active ? (
                        <>
                          <Pause className="h-4 w-4 mr-2" />
                          {t("dashboard.action.pause")}
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          {t("dashboard.action.resume")}
                        </>
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => confirmDelete(job.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t("dashboard.action.delete")}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Applications Drawer */}
      {selectedJobForApps && (
        <ApplicationsDrawer
          jobId={selectedJobForApps.id}
          jobTitle={selectedJobForApps.title}
          open={applicationsDrawerOpen}
          onOpenChange={setApplicationsDrawerOpen}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dashboard.action.delete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("job.delete_confirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={deleteJob} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t("dashboard.action.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dashboard.bulk.delete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("dashboard.bulk.delete_confirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => bulkAction("delete")} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t("dashboard.bulk.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
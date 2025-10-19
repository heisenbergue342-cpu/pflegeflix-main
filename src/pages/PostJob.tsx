import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Save, Eye, CheckCircle2, AlertCircle } from "lucide-react";
import { StepBasics } from "@/components/post-job/StepBasics";
import { StepDetails } from "@/components/post-job/StepDetails";
import { StepCompensation } from "@/components/post-job/StepCompensation";
import { StepApplication } from "@/components/post-job/StepApplication";
import { StepPreview } from "@/components/post-job/StepPreview";
import SEO from "@/components/SEO";
import { trackAnalyticsEvent } from '@/hooks/useAnalytics';

export default function PostJob() {
  const { draftId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [canPost, setCanPost] = useState<boolean | null>(null);
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [publishedJobId, setPublishedJobId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({
    title: "",
    facility_id: null,
    facility_type: null,
    city: "",
    state: "",
    description: "",
    requirements: [],
    tags: [],
    shift_type: "",
    salary_min: null,
    salary_max: null,
    salary_unit: null,
    contract_type: null,
    featured: false,
    application_method: "email",
    application_email: "",
    application_url: "",
    auto_reply_template: "",
    contact_person: "",
    acceptedTerms: false,
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const totalSteps = 5;

  // Check if user has employer role and can post jobs
  useEffect(() => {
    const checkRoleAndSubscription = async () => {
      if (!user) {
        navigate("/auth");
        return;
      }

      try {
        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .in("role", ["arbeitgeber", "admin"])
          .maybeSingle();

        console.log("Role check:", { roleData, roleError });

        if (!roleData) {
          navigate("/");
          return;
        }

        // Get subscription info first
        const { data: subData, error: subError } = await supabase
          .from("employer_subscriptions")
          .select(`
            *,
            plan:subscription_plans(*)
          `)
          .eq("employer_id", user.id)
          .maybeSingle();

        console.log("Subscription data:", { subData, subError });

        // If no subscription exists, create a free tier subscription
        if (!subData && !subError) {
          console.log("No subscription found, creating free tier subscription...");
          
          const { data: freePlan } = await supabase
            .from("subscription_plans")
            .select("id")
            .eq("tier", "free")
            .single();
          
          if (freePlan) {
            const { error: createError } = await supabase
              .from("employer_subscriptions")
              .insert({
                employer_id: user.id,
                plan_id: freePlan.id,
                status: 'active',
                current_period_start: new Date().toISOString(),
                current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
              });
            
            if (!createError) {
              console.log("Free tier subscription created successfully");
              // Reload subscription data
              const { data: newSubData } = await supabase
                .from("employer_subscriptions")
                .select(`
                  *,
                  plan:subscription_plans(*)
                `)
                .eq("employer_id", user.id)
                .maybeSingle();
              
              setSubscriptionInfo(newSubData);
            } else {
              console.error("Failed to create free subscription:", createError);
            }
          }
        } else {
          setSubscriptionInfo(subData);
        }

        // Check if employer can post jobs (subscription limits)
        const { data: canPostData, error: canPostError } = await supabase
          .rpc("can_employer_post_job", { employer_id: user.id });

        console.log("Can post check:", { canPostData, canPostError });

        if (canPostError) {
          console.error("Error checking posting limits:", canPostError);
          setCanPost(false);
        } else {
          setCanPost(canPostData === true);
        }
      } catch (error) {
        console.error("Error in checkRoleAndSubscription:", error);
        // Fallback to allowing if check fails
        setCanPost(true);
      }
    };

    checkRoleAndSubscription();
  }, [user, navigate]);

  // Load draft if draftId exists
  useEffect(() => {
    if (draftId) {
      loadDraft();
    }
  }, [draftId]);

  // Autosave every 30 seconds
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const timer = setTimeout(() => {
      saveDraft();
    }, 30000);

    return () => clearTimeout(timer);
  }, [formData, hasUnsavedChanges]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const loadDraft = async () => {
    const { data, error } = await supabase
      .from("draft_jobs")
      .select("*")
      .eq("id", draftId)
      .single();

    if (error || !data) {
      toast({
        title: t("error.load_failed"),
        variant: "destructive",
      });
      return;
    }

    // Migrate legacy salary_unit values
    if (data.salary_unit) {
      const legacyMap: Record<string, "€/h" | "€/Monat"> = {
        "hour": "€/h",
        "month": "€/Monat",
        "Monat": "€/Monat",
      };
      if (legacyMap[data.salary_unit as keyof typeof legacyMap]) {
        data.salary_unit = legacyMap[data.salary_unit as keyof typeof legacyMap];
      }
    }

    setFormData(data);
    setCurrentStep(data.step || 1);
  };

  const saveDraft = async () => {
    if (!user) return;

    const draftData = {
      ...formData,
      user_id: user.id,
      step: currentStep,
      updated_at: new Date().toISOString(),
    };

    if (draftId) {
      const { error } = await supabase
        .from("draft_jobs")
        .update(draftData)
        .eq("id", draftId);

      if (error) {
        console.error("Failed to update draft:", error);
        return;
      }
    } else {
      const { data, error } = await supabase
        .from("draft_jobs")
        .insert([draftData])
        .select()
        .single();

      if (error) {
        console.error("Failed to save draft:", error);
        return;
      }

      navigate(`/employer/post/${data.id}`, { replace: true });
    }

    setHasUnsavedChanges(false);
    toast({
      title: t("job.draft_saved"),
    });
  };

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData((prev: any) => ({ ...prev, ...data }));
    setHasUnsavedChanges(true);
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        return formData.title && formData.city && formData.state && formData.facility_type;
      case 2:
        return formData.description && formData.tags?.length > 0;
      case 3:
        const validSalaryUnits = ["€/h", "€/Monat"];
        return (
          formData.salary_min && 
          formData.salary_max && 
          formData.salary_unit &&
          validSalaryUnits.includes(formData.salary_unit)
        );
      case 4:
        return (
          formData.application_method &&
          (formData.application_method === "email"
            ? formData.application_email
            : formData.application_url)
        );
      case 5:
        return formData.acceptedTerms;
      default:
        return false;
    }
  };

  const goNext = () => {
    if (!validateStep()) {
      toast({
        title: t("error.required_fields"),
        variant: "destructive",
      });
      return;
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      saveDraft();
    }
  };

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const publishJob = async () => {
    if (!user || !validateStep()) return;

    // Double-check posting limits before publishing
    const { data: canPostData } = await supabase
      .rpc("can_employer_post_job", { employer_id: user.id });

    if (!canPostData) {
      toast({
        title: t("error.posting_limit_reached") || "Posting limit reached",
        description: t("error.upgrade_subscription") || "Please upgrade your subscription to post more jobs.",
        variant: "destructive",
      });
      return;
    }

    const jobData = {
      title: formData.title,
      facility_id: formData.facility_id,
      facility_type: formData.facility_type,
      city: formData.city,
      state: formData.state,
      description: formData.description,
      requirements: formData.requirements,
      tags: formData.tags,
      shift_type: formData.shift_type,
      salary_min: formData.salary_min,
      salary_max: formData.salary_max,
      salary_unit: formData.salary_unit,
      contract_type: formData.contract_type,
      featured: formData.featured,
      owner_id: user.id,
      approved: true,
      is_active: true,
    };

    const { data: newJob, error } = await supabase
      .from("jobs")
      .insert([jobData])
      .select()
      .single();

    if (error) {
      toast({
        title: t("error.publish_failed") || "Failed to publish job",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    // Move uploaded photos and metadata from drafts/{draftId} to jobs/{newJob.id}
    if (draftId && newJob?.id) {
      const BUCKET = "job-photos";
      const fromFolder = `drafts/${draftId}`;
      const toFolder = `jobs/${newJob.id}`;
      const { data: files } = await supabase.storage.from(BUCKET).list(fromFolder, { limit: 50 });
      if (files && files.length > 0) {
        for (const f of files) {
          const fromPath = `${fromFolder}/${f.name}`;
          const toPath = `${toFolder}/${f.name}`;
          const { error: moveError } = await supabase.storage.from(BUCKET).move(fromPath, toPath);
          if (moveError) {
            const { data: fileData } = await supabase.storage.from(BUCKET).download(fromPath);
            if (fileData) {
              await supabase.storage.from(BUCKET).upload(toPath, fileData as Blob, { upsert: true });
              await supabase.storage.from(BUCKET).remove([fromPath]);
            }
          }
        }
      }
    }

    // Delete draft if exists
    if (draftId) {
      await supabase.from("draft_jobs").delete().eq("id", draftId);
    }

    setPublishedJobId(newJob.id);
    setPublishSuccess(true);
    setHasUnsavedChanges(false);
    const category =
      newJob.facility_type === 'Altenheim' ? 'Altenheime' :
      newJob.facility_type === '1zu1' ? '1:1 Intensivpflege' :
      'Kliniken';
    trackAnalyticsEvent('job_post_published', { jobId: newJob.id, category });
    await supabase.functions.invoke('ping-search-engines', {
      body: { sitemapUrl: 'https://pflegeflix.lovable.app/sitemap.xml' }
    });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepBasics formData={formData} updateFormData={updateFormData} />;
      case 2:
        return <StepDetails formData={formData} updateFormData={updateFormData} />;
      case 3:
        return <StepCompensation formData={formData} updateFormData={updateFormData} />;
      case 4:
        return <StepApplication formData={formData} updateFormData={updateFormData} />;
      case 5:
        return <StepPreview formData={formData} updateFormData={updateFormData} onPublish={publishJob} />;
      default:
        return null;
    }
  };

  // Show permission error if user can't access
  if (canPost === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  // Show success screen
  if (publishSuccess) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-8">
        <div className="container max-w-4xl mx-auto px-4">
          <Card className="p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-green-100 p-4">
                <CheckCircle2 className="w-16 h-16 text-green-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-4">
              {t("job.publish_success.title") || "Job Posted Successfully!"}
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              {t("job.publish_success.description") || "Your job posting is now live and visible to candidates."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/employer">
                  {t("job.publish_success.view_my_jobs") || "View My Jobs"}
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to={`/job/${publishedJobId}`}>
                  {t("job.publish_success.view_posting") || "View Job Posting"}
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  setPublishSuccess(false);
                  setPublishedJobId(null);
                  setCurrentStep(1);
                  setFormData({
                    title: "",
                    facility_id: null,
                    facility_type: null,
                    city: "",
                    state: "",
                    description: "",
                    requirements: [],
                    tags: [],
                    shift_type: "",
                    salary_min: null,
                    salary_max: null,
                    salary_unit: null,
                    contract_type: null,
                    featured: false,
                    application_method: "email",
                    application_email: "",
                    application_url: "",
                    auto_reply_template: "",
                    contact_person: "",
                    acceptedTerms: false,
                  });
                }}
              >
                {t("job.publish_success.post_another") || "Post Another Job"}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Show empty state if no posting slots available
  if (canPost === false) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-8">
        <div className="container max-w-4xl mx-auto px-4">
          <Card className="p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-orange-100 p-4">
                <AlertCircle className="w-16 h-16 text-orange-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-4">
              {t("job.no_slots.title") || "No Available Job Posting Slots"}
            </h1>
            <p className="text-lg text-muted-foreground mb-2">
              {t("job.no_slots.description") || "You have reached your job posting limit for your current plan."}
            </p>
            {subscriptionInfo?.plan && (
              <p className="text-sm text-muted-foreground mb-8">
                Current plan: <strong>{subscriptionInfo.plan.name}</strong> (
                {subscriptionInfo.plan.max_active_jobs === -1
                  ? "Unlimited"
                  : `${subscriptionInfo.plan.max_active_jobs} active jobs`}
                )
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/employer/settings">
                  {t("job.no_slots.upgrade") || "Upgrade Plan"}
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/employer">
                  {t("job.no_slots.manage_jobs") || "Manage Existing Jobs"}
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-8">
      <SEO
        title={t("employer.post_job")}
        description={t("employer.portal_subtitle")}
        canonical="/employer/post"
        noindex={true}
      />
      <div className="container max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {t("job.post.title") || "Post a Job"}
          </h1>
          <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            {t("job.post.step") || "Step"} {currentStep} {t("job.post.of") || "of"}{" "}
            {totalSteps}
          </p>
        </div>

        {/* Step Content */}
        <div className="bg-card rounded-lg border p-6 mb-6">{renderStep()}</div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={goBack}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            {t("job.post.back") || "Back"}
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={saveDraft}>
              <Save className="w-4 h-4 mr-2" />
              {t("job.post.save_draft") || "Save Draft"}
            </Button>

            {currentStep < totalSteps ? (
              <Button onClick={goNext}>
                {t("job.post.next") || "Next"}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={publishJob} disabled={!formData.acceptedTerms}>
                <Eye className="w-4 h-4 mr-2" />
                {t("job.post.publish") || "Publish Job"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { trackAnalyticsEvent } from "@/hooks/useAnalytics";
import { PAYWALL_DISABLED, FREE_MODE_MAX_ACTIVE_JOBS } from "@/utils/featureFlags";

const FREE_PLAN_ACTIVE_LIMIT = 20;

export function useJobPosting(draftId?: string) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const ENV_URL = import.meta.env.VITE_SUPABASE_URL;
  const ENV_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const [canPost, setCanPost] = useState<boolean | null>(null);
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [loadingDraftOrJob, setLoadingDraftOrJob] = useState<boolean>(!!draftId);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

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

  // Check role and subscription
  useEffect(() => {
    const checkRoleAndSubscription = async () => {
      if (!user) {
        navigate("/auth");
        return;
      }

      // Diagnose: Missing Supabase env configuration
      const SUPABASE_CONFIG_OK = !!ENV_URL && !!ENV_KEY;
      if (!SUPABASE_CONFIG_OK) {
        toast({
          title: "Supabase nicht konfiguriert",
          description: "Bitte setze VITE_SUPABASE_URL und VITE_SUPABASE_PUBLISHABLE_KEY in deiner .env-Datei.",
          variant: "destructive",
        });
        // Erlaube den Wizard weiter, statt hart zu blockieren
        setCanPost(true);
        return;
      }

      if (PAYWALL_DISABLED) {
        setCanPost(true);
        setSubscriptionInfo({
          plan: {
            name: "Launch (Free)",
            max_active_jobs: FREE_MODE_MAX_ACTIVE_JOBS,
          },
        });
        return;
      }

      try {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .in("role", ["arbeitgeber", "admin"])
          .maybeSingle();

        // Fallback: wenn kein Eintrag in user_roles, prüfe Profile-Rolle
        if (!roleData) {
          const { data: profileRole } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .maybeSingle();
          if (!profileRole || (profileRole.role !== "arbeitgeber" && profileRole.role !== "admin")) {
            navigate("/");
            return;
          }
        }

        const { data: subData } = await supabase
          .from("employer_subscriptions")
          .select(`*, plan:subscription_plans(*)`)
          .eq("employer_id", user.id)
          .maybeSingle();

        setSubscriptionInfo(subData || null);

        if (subData?.plan?.name === "Free") {
          setCanPost(true);
          return;
        }

        const { data: canPostData } = await supabase.rpc("can_employer_post_job", {
          employer_id: user.id,
        });

        setCanPost(canPostData === true);
      } catch (_e) {
        setCanPost(true);
      }
    };

    checkRoleAndSubscription();
  }, [user, navigate]);

  // Load draft or existing job
  useEffect(() => {
    const loadDraftOrJob = async () => {
      if (!draftId) {
        if (!user) {
          setLoadingDraftOrJob(false);
          return;
        }
        setLoadingDraftOrJob(true);
        const { data: newDraft, error: createError } = await supabase
          .from("draft_jobs")
          .insert({
            user_id: user.id,
            step: 1,
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (!createError && newDraft?.id) {
          navigate(`/employer/post/${newDraft.id}`, { replace: true });
          return;
        } else {
          toast.error("Fehler beim Erstellen des Entwurfs. Bitte versuche es erneut.");
          setLoadingDraftOrJob(false);
          return;
        }
      }

      const { data: draft } = await supabase
        .from("draft_jobs")
        .select("*")
        .eq("id", draftId)
        .maybeSingle();

      if (draft) {
        setFormData(draft);
        setCurrentStep(draft.step || 1);
        setLoadingDraftOrJob(false);
        return;
      }

      const { data: job } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", draftId)
        .maybeSingle();

      if (job) {
        setEditingJobId(job.id);
        setFormData({
          title: job.title,
          facility_id: job.facility_id,
          facility_type: job.facility_type,
          city: job.city,
          state: job.state,
          description: job.description || "",
          requirements: job.requirements || [],
          tags: job.tags || [],
          shift_type: job.shift_type || "",
          salary_min: job.salary_min,
          salary_max: job.salary_max,
          salary_unit: job.salary_unit,
          contract_type: job.contract_type,
          featured: !!job.featured,
          application_method: "email",
          application_email: "",
          application_url: "",
          auto_reply_template: "",
          contact_person: "",
          acceptedTerms: true,
        });
        setCurrentStep(1);
        trackAnalyticsEvent("job_edit_opened", { jobId: job.id });
        setLoadingDraftOrJob(false);
        return;
      }

      toast({
        title: t("error.load_failed"),
        variant: "destructive",
      });
      setLoadingDraftOrJob(false);
    };

    loadDraftOrJob();
  }, [draftId, t, user, navigate]);

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData((prev: any) => ({ ...prev, ...data }));
    setHasUnsavedChanges(true);
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

  const publishJob = async () => {
    if (!user) return;

    if (editingJobId) {
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
      };

      const { error: updateError } = await supabase
        .from("jobs")
        .update(jobData)
        .eq("id", editingJobId);

      if (updateError) {
        toast({
          title: t("error.update_failed"),
          description: updateError.message,
          variant: "destructive",
        });
        return null;
      }

      setHasUnsavedChanges(false);
      trackAnalyticsEvent("job_edit_saved", { jobId: editingJobId });
      toast({ description: t("common.save") });
      navigate("/employer");
      return null;
    }

    if (!PAYWALL_DISABLED) {
      const { count: activeCount } = await supabase
        .from("jobs")
        .select("*", { count: "exact", head: true })
        .eq("owner_id", user.id)
        .eq("is_active", true)
        .is("closed_at", null);

      const isFreePlan = subscriptionInfo?.plan?.name === "Free";
      if (isFreePlan) {
        if ((activeCount || 0) >= FREE_PLAN_ACTIVE_LIMIT) {
          trackAnalyticsEvent("limit_block_publish", {
            context: "publish",
            activeCount: activeCount || 0,
            limit: FREE_PLAN_ACTIVE_LIMIT,
          });
          return "LIMIT_REACHED";
        }
      } else {
        const { data: canPostData } = await supabase.rpc("can_employer_post_job", {
          employer_id: user.id,
        });
        if (!canPostData) {
          toast({
            title: t("error.posting_limit_reached") || "Posting limit reached",
            description:
              t("error.upgrade_subscription") ||
              "Please upgrade your subscription to post more jobs.",
            variant: "destructive",
          });
          trackAnalyticsEvent("limit_block_publish", { context: "rpc_block" });
          return "LIMIT_REACHED";
        }
      }
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
      return null;
    }

    // Move photos
    if (draftId && newJob?.id) {
      const BUCKET = "job-photos";
      const fromFolder = `drafts/${draftId}`;
      const toFolder = `jobs/${newJob.id}`;
      const { data: files } = await supabase.storage
        .from(BUCKET)
        .list(fromFolder, { limit: 50 });
      if (files && files.length > 0) {
        for (const f of files) {
          const fromPath = `${fromFolder}/${f.name}`;
          const toPath = `${toFolder}/${f.name}`;
          const { error: moveError } = await supabase.storage
            .from(BUCKET)
            .move(fromPath, toPath);
          if (moveError) {
            const { data: fileData } = await supabase.storage
              .from(BUCKET)
              .download(fromPath);
            if (fileData) {
              await supabase.storage
                .from(BUCKET)
                .upload(toPath, fileData as Blob, { upsert: true });
              await supabase.storage.from(BUCKET).remove([fromPath]);
            }
          }
        }
      }
    }

    if (draftId) {
      await supabase.from("draft_jobs").delete().eq("id", draftId);
    }

    setHasUnsavedChanges(false);
    const category =
      newJob.facility_type === "Altenheim"
        ? "Altenheime"
        : newJob.facility_type === "1zu1"
        ? "1:1 Intensivpflege"
        : "Kliniken";
    trackAnalyticsEvent("job_created", { jobId: newJob.id, category });
    await supabase.functions.invoke("ping-search-engines", {
      body: { sitemapUrl: "https://pflegeflix.lovable.app/sitemap.xml" },
    });

    return newJob.id;
  };

  return {
    formData,
    currentStep,
    setCurrentStep,
    updateFormData,
    saveDraft,
    publishJob,
    canPost,
    subscriptionInfo,
    editingJobId,
    loadingDraftOrJob,
    hasUnsavedChanges,
  };
}
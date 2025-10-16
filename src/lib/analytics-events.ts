/**
 * Centralized analytics event tracking utilities
 * Ensures consistent event tracking across the application
 */

import { trackAnalyticsEvent, type AnalyticsEventProps } from '@/hooks/useAnalytics';

/**
 * Search & Discovery Events
 */
export const analyticsSearch = {
  performed: (query: string, hasFilters: boolean) => {
    trackAnalyticsEvent('search_performed', {
      query: query.substring(0, 100), // Limit PII exposure
      hasFilters,
      queryLength: query.length,
    });
  },
  
  cleared: () => {
    trackAnalyticsEvent('search_cleared');
  },
};

/**
 * Filter Events
 */
export const analyticsFilters = {
  applied: (filterTypes: string[], count: number) => {
    trackAnalyticsEvent('filter_applied', {
      filterTypes: filterTypes.join(','),
      filterCount: count,
    });
  },
  
  removed: (type: string, value?: string) => {
    trackAnalyticsEvent('filter_removed', {
      filterType: type,
      filterValue: value?.substring(0, 50),
    });
  },
};

/**
 * Job Interaction Events
 */
export const analyticsJob = {
  viewed: (jobId: string, jobTitle: string, city: string) => {
    trackAnalyticsEvent('job_viewed', {
      jobId,
      jobTitle: jobTitle.substring(0, 100),
      city,
    });
  },
  
  saved: (jobId: string) => {
    trackAnalyticsEvent('job_saved', { jobId });
  },
  
  unsaved: (jobId: string) => {
    trackAnalyticsEvent('job_unsaved', { jobId });
  },
  
  shared: (jobId: string, method: string) => {
    trackAnalyticsEvent('job_share', { jobId, method });
  },
};

/**
 * Application Process Events
 */
export const analyticsApplication = {
  applyClick: (jobId: string) => {
    trackAnalyticsEvent('apply_click', { jobId });
  },
  
  started: (jobId: string) => {
    trackAnalyticsEvent('application_started', { jobId });
  },
  
  submitted: (jobId: string, hasCoverLetter: boolean) => {
    trackAnalyticsEvent('application_submitted', {
      jobId,
      hasCoverLetter,
    });
  },
  
  abandoned: (jobId: string, step: string) => {
    trackAnalyticsEvent('application_abandoned', {
      jobId,
      abandonedAt: step,
    });
  },
};

/**
 * Employer Job Posting Events
 */
export const analyticsJobPost = {
  started: () => {
    trackAnalyticsEvent('job_post_started');
  },
  
  stepCompleted: (step: number, stepName: string) => {
    trackAnalyticsEvent('job_post_step_completed', {
      step,
      stepName,
    });
  },
  
  published: (jobId: string, isFeatured: boolean) => {
    trackAnalyticsEvent('job_post_published', {
      jobId,
      isFeatured,
    });
  },
  
  draftSaved: (draftId: string, step: number) => {
    trackAnalyticsEvent('job_post_draft_saved', {
      draftId,
      currentStep: step,
    });
  },
};

/**
 * Employer Applicant Management Events
 */
export const analyticsApplicant = {
  viewed: (applicationId: string) => {
    trackAnalyticsEvent('applicant_viewed', { applicationId });
  },
  
  stageChanged: (applicationId: string, fromStage: string, toStage: string) => {
    trackAnalyticsEvent('applicant_stage_changed', {
      applicationId,
      fromStage,
      toStage,
    });
  },
  
  messageSent: (applicationId: string, messageType: string) => {
    trackAnalyticsEvent('message_sent', {
      applicationId,
      messageType,
    });
  },
};

/**
 * User Account Events
 */
export const analyticsUser = {
  signupStarted: (role: string) => {
    trackAnalyticsEvent('signup_started', { role });
  },
  
  signupCompleted: (role: string) => {
    trackAnalyticsEvent('signup_completed', { role });
  },
  
  loginCompleted: (role: string) => {
    trackAnalyticsEvent('login_completed', { role });
  },
  
  logout: () => {
    trackAnalyticsEvent('logout');
  },
  
  profileUpdated: (fields: string[]) => {
    trackAnalyticsEvent('profile_updated', {
      updatedFields: fields.join(','),
      fieldCount: fields.length,
    });
  },
};

/**
 * Engagement Events
 */
export const analyticsEngagement = {
  carouselInteraction: (carouselType: string, action: 'next' | 'prev' | 'click') => {
    trackAnalyticsEvent('carousel_interaction', {
      carouselType,
      action,
    });
  },
  
  navigationMenuOpened: () => {
    trackAnalyticsEvent('navigation_menu_opened');
  },
  
  cookiePreferencesChanged: (analytics: boolean, marketing: boolean) => {
    trackAnalyticsEvent('cookie_preferences_changed', {
      analyticsEnabled: analytics,
      marketingEnabled: marketing,
    });
  },
};

/**
 * Error Tracking Events
 */
export const analyticsError = {
  occurred: (errorType: string, errorMessage: string, page: string) => {
    trackAnalyticsEvent('error_occurred', {
      errorType,
      errorMessage: errorMessage.substring(0, 200),
      page,
    });
  },
};

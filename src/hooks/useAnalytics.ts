import { useEffect, useCallback } from 'react';

// Privacy-first analytics service configuration
const PLAUSIBLE_DOMAIN = 'pflegeflix.lovable.app';
const PLAUSIBLE_API = 'https://plausible.io/api/event';

// Check if analytics consent is granted
const hasAnalyticsConsent = (): boolean => {
  const consent = localStorage.getItem('pflegeflix-cookie-consent');
  if (!consent) return false;
  
  try {
    const parsed = JSON.parse(consent);
    return parsed.analytics === true;
  } catch {
    return false;
  }
};

// Event types for type safety
export type AnalyticsEvent = 
  // Search & Discovery
  | 'search_performed'
  | 'filter_applied'
  | 'filter_removed'
  | 'search_cleared'
  
  // Job Interactions
  | 'job_viewed'
  | 'job_saved'
  | 'job_unsaved'
  | 'job_share'
  
  // Application Process
  | 'apply_click'
  | 'application_started'
  | 'application_submitted'
  | 'application_abandoned'
  
  // Employer Actions
  | 'job_post_started'
  | 'job_post_step_completed'
  | 'job_post_published'
  | 'job_post_draft_saved'
  | 'applicant_viewed'
  | 'applicant_stage_changed'
  | 'message_sent'
  
  // User Account
  | 'signup_started'
  | 'signup_completed'
  | 'login_completed'
  | 'logout'
  | 'profile_updated'
  
  // Engagement
  | 'carousel_interaction'
  | 'navigation_menu_opened'
  | 'cookie_preferences_changed'
  | 'error_occurred'
  | 'menu_category_click'
  
  // Plan Limits
  | 'limit_warning_shown'
  | 'limit_block_publish'
  | 'cta_upgrade_clicked';

export interface AnalyticsEventProps {
  [key: string]: string | number | boolean | undefined;
}

/**
 * Privacy-first analytics hook using Plausible Analytics
 * Only tracks events if user has given explicit consent
 */
export function useAnalytics() {
  // Initialize Plausible script
  useEffect(() => {
    if (!hasAnalyticsConsent()) return;

    // Check if script already exists
    if (document.querySelector('script[data-domain="' + PLAUSIBLE_DOMAIN + '"]')) {
      return;
    }

    const script = document.createElement('script');
    script.defer = true;
    script.dataset.domain = PLAUSIBLE_DOMAIN;
    script.src = 'https://plausible.io/js/script.js';
    
    // Plausible respects Do Not Track
    script.dataset.respectDnt = 'true';
    
    document.head.appendChild(script);

    return () => {
      // Cleanup on unmount if consent is revoked
      const existingScript = document.querySelector('script[data-domain="' + PLAUSIBLE_DOMAIN + '"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  /**
   * Track a custom event with optional properties
   */
  const trackEvent = useCallback((
    eventName: AnalyticsEvent,
    props?: AnalyticsEventProps
  ) => {
    // Only track if consent is granted
    if (!hasAnalyticsConsent()) {
      console.debug('Analytics event blocked (no consent):', eventName);
      return;
    }

    // Check if Plausible is loaded
    if (typeof window === 'undefined' || !(window as any).plausible) {
      console.warn('Plausible not loaded yet');
      return;
    }

    try {
      // Track event with Plausible
      (window as any).plausible(eventName, { props });
      console.debug('Analytics event tracked:', eventName, props);
    } catch (error) {
      console.error('Failed to track analytics event:', error);
    }
  }, []);

  /**
   * Track page view (automatically tracked by Plausible for route changes)
   */
  const trackPageView = useCallback((path?: string) => {
    if (!hasAnalyticsConsent()) return;

    if (typeof window === 'undefined' || !(window as any).plausible) return;

    const url = path || window.location.pathname + window.location.search;
    (window as any).plausible('pageview', { u: url });
  }, []);

  return {
    trackEvent,
    trackPageView,
    hasConsent: hasAnalyticsConsent(),
  };
}

/**
 * Standalone function to track events without the hook
 * Useful for one-off tracking in event handlers
 */
export const trackAnalyticsEvent = (
  eventName: AnalyticsEvent,
  props?: AnalyticsEventProps
) => {
  if (!hasAnalyticsConsent()) return;

  if (typeof window === 'undefined' || !(window as any).plausible) {
    console.warn('Plausible not loaded');
    return;
  }

  try {
    (window as any).plausible(eventName, { props });
  } catch (error) {
    console.error('Failed to track event:', error);
  }
};

// Declare plausible on window object for TypeScript
declare global {
  interface Window {
    plausible?: (eventName: string, options?: { props?: any; u?: string }) => void;
  }
}
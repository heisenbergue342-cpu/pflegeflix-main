import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Privacy-first analytics service configuration
const PLAUSIBLE_DOMAIN = 'pflegeflix.lovable.app';
const PLAUSIBLE_API = 'https://plausible.io/api/event';

// Session management
const SESSION_KEY = 'pflegeflix_session_id';
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

function getOrCreateSessionId(): string {
  const stored = localStorage.getItem(SESSION_KEY);
  const now = Date.now();
  
  if (stored) {
    try {
      const { id, timestamp } = JSON.parse(stored);
      if (now - timestamp < SESSION_DURATION) {
        // Update timestamp to extend session
        localStorage.setItem(SESSION_KEY, JSON.stringify({ id, timestamp: now }));
        return id;
      }
    } catch (e) {
      // Invalid stored data, create new
    }
  }
  
  // Create new session
  const newId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem(SESSION_KEY, JSON.stringify({ id: newId, timestamp: now }));
  return newId;
}

function getDeviceType(): string {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

function getUTMParams(): { utm_source?: string; utm_medium?: string; utm_campaign?: string } {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source') || undefined,
    utm_medium: params.get('utm_medium') || undefined,
    utm_campaign: params.get('utm_campaign') || undefined,
  };
}

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

// Debounce helper
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout | null = null;
  return ((...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

// Funnel event types
export type FunnelEventType = 'impression' | 'list_click' | 'detail_view' | 'apply_open' | 'apply_submit';

// Event types for type safety (existing + funnel)
export type AnalyticsEvent = 
  // Funnel events
  | FunnelEventType
  // Search & Discovery
  | 'search_performed'
  | 'filter_applied'
  | 'filter_removed'
  | 'search_cleared'
  | 'filter_change'
  
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
  | 'job_refreshed'
  
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
  | 'shift_selected'
  | 'limit_warning_shown'
  | 'cta_upgrade_clicked';

export interface AnalyticsEventProps {
  [key: string]: string | number | boolean | undefined;
}

/**
 * Privacy-first analytics hook with funnel tracking
 */
export function useAnalytics() {
  const { user } = useAuth();
  const impressionObserverRef = useRef<IntersectionObserver | null>(null);
  const trackedImpressionsRef = useRef<Set<string>>(new Set());

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
   * Track a custom event with optional properties (Plausible)
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
   * Track funnel event to database
   */
  const trackFunnelEvent = useCallback(async (
    eventType: FunnelEventType,
    jobId: string,
    employerId: string,
    filters?: Record<string, any>
  ) => {
    if (!hasAnalyticsConsent()) {
      console.debug('[Funnel] Event blocked (no consent):', eventType);
      return;
    }

    const eventData = {
      event_type: eventType,
      job_id: jobId,
      employer_id: employerId,
      user_id: user?.id || null,
      session_id: getOrCreateSessionId(),
      referrer: document.referrer || null,
      device: getDeviceType(),
      locale: navigator.language || 'en',
      source: window.location.pathname,
      ...getUTMParams(),
      filters_snapshot: filters || null,
    };

    try {
      const { error } = await supabase
        .from('analytics_events')
        .insert(eventData);

      if (error) {
        console.error('[Funnel] Error tracking event:', error);
      } else {
        console.log('[Funnel] Event tracked:', eventType, jobId);
      }
    } catch (err) {
      console.error('[Funnel] Exception tracking event:', err);
    }
  }, [user]);

  // Debounced tracking functions
  const trackImpression = useCallback(
    debounce((jobId: string, employerId: string, filters?: Record<string, any>) => {
      if (trackedImpressionsRef.current.has(jobId)) return;
      trackedImpressionsRef.current.add(jobId);
      trackFunnelEvent('impression', jobId, employerId, filters);
    }, 500),
    [trackFunnelEvent]
  );

  const trackListClick = useCallback((jobId: string, employerId: string, filters?: Record<string, any>) => {
    trackFunnelEvent('list_click', jobId, employerId, filters);
  }, [trackFunnelEvent]);

  const trackDetailView = useCallback((jobId: string, employerId: string) => {
    // Delayed to ensure it's a real view, not just a quick bounce
    setTimeout(() => {
      trackFunnelEvent('detail_view', jobId, employerId);
    }, 2000);
  }, [trackFunnelEvent]);

  const trackApplyOpen = useCallback((jobId: string, employerId: string) => {
    trackFunnelEvent('apply_open', jobId, employerId);
  }, [trackFunnelEvent]);

  const trackApplySubmit = useCallback((jobId: string, employerId: string) => {
    trackFunnelEvent('apply_submit', jobId, employerId);
  }, [trackFunnelEvent]);

  // Setup intersection observer for impressions
  const observeJobCard = useCallback((element: HTMLElement, jobId: string, employerId: string, filters?: Record<string, any>) => {
    if (!impressionObserverRef.current) {
      impressionObserverRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const { jobId, employerId, filters } = (entry.target as any).dataset;
              if (jobId && employerId) {
                trackImpression(jobId, employerId, filters ? JSON.parse(filters) : undefined);
              }
            }
          });
        },
        { threshold: 0.5, rootMargin: '0px' }
      );
    }

    element.dataset.jobId = jobId;
    element.dataset.employerId = employerId;
    if (filters) element.dataset.filters = JSON.stringify(filters);
    impressionObserverRef.current.observe(element);

    return () => {
      impressionObserverRef.current?.unobserve(element);
    };
  }, [trackImpression]);

  /**
   * Track page view (automatically tracked by Plausible for route changes)
   */
  const trackPageView = useCallback((path?: string) => {
    if (!hasAnalyticsConsent()) return;

    if (typeof window === 'undefined' || !(window as any).plausible) return;

    const url = path || window.location.pathname + window.location.search;
    (window as any).plausible('pageview', { u: url });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      impressionObserverRef.current?.disconnect();
    };
  }, []);

  return {
    trackEvent,
    trackPageView,
    hasConsent: hasAnalyticsConsent(),
    // Funnel tracking methods
    trackImpression,
    trackListClick,
    trackDetailView,
    trackApplyOpen,
    trackApplySubmit,
    observeJobCard,
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
import { useEffect } from 'react';

interface WebVitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

/**
 * WebVitals - Core Web Vitals monitoring component
 * Tracks and reports:
 * - LCP (Largest Contentful Paint) - Target: < 2.5s
 * - INP (Interaction to Next Paint) - Target: < 200ms (replaces FID)
 * - CLS (Cumulative Layout Shift) - Target: < 0.1
 * - FCP (First Contentful Paint) - Target: < 1.8s
 * - TTFB (Time to First Byte) - Target: < 600ms
 */
export default function WebVitals() {
  useEffect(() => {
    // Only monitor in production and when available
    if (process.env.NODE_ENV !== 'production') return;

    const reportWebVitals = async () => {
      try {
        // Use web-vitals library if available (install via: npm i web-vitals)
        const { onCLS, onINP, onFCP, onLCP, onTTFB } = await import('web-vitals');

        const handleMetric = (metric: WebVitalsMetric) => {
          // Log to console in development
          console.log(`[Web Vitals] ${metric.name}:`, {
            value: metric.value,
            rating: metric.rating,
            delta: metric.delta,
          });

          // Send to analytics service (Google Analytics, etc.)
          if (window.gtag) {
            window.gtag('event', metric.name, {
              value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
              event_category: 'Web Vitals',
              event_label: metric.id,
              non_interaction: true,
            });
          }

          // Send to custom analytics endpoint
          if (navigator.sendBeacon) {
            const body = JSON.stringify({
              metric: metric.name,
              value: metric.value,
              rating: metric.rating,
              page: window.location.pathname,
              timestamp: Date.now(),
            });

            navigator.sendBeacon('/api/web-vitals', body);
          }
        };

        // Monitor all Core Web Vitals
        onCLS(handleMetric);
        onINP(handleMetric); // INP replaces FID in web-vitals v3
        onFCP(handleMetric);
        onLCP(handleMetric);
        onTTFB(handleMetric);
      } catch (error) {
        // web-vitals library not installed - monitoring disabled
        console.warn('Web Vitals monitoring not available:', error);
      }
    };

    reportWebVitals();
  }, []);

  // Check for layout shifts manually if web-vitals is not available
  useEffect(() => {
    if ('PerformanceObserver' in window) {
      try {
        // Observe layout shifts
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if ((entry as any).hadRecentInput) continue;
            
            console.log('[Layout Shift]', {
              value: (entry as any).value,
              sources: (entry as any).sources,
            });
          }
        });

        observer.observe({ type: 'layout-shift', buffered: true });

        return () => observer.disconnect();
      } catch (e) {
        console.warn('Layout shift observer not supported');
      }
    }
  }, []);

  return null;
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

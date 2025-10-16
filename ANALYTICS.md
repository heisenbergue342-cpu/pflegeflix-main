# Analytics Implementation Guide

## Overview

Pflegeflix uses **Plausible Analytics**, a privacy-first, GDPR-compliant analytics service hosted in the EU. Analytics tracking only occurs after explicit user consent via the cookie banner.

## Key Features

✅ **GDPR Compliant** - No cookies, no cross-site tracking  
✅ **EU-Hosted** - Data stored in EU servers  
✅ **Privacy-First** - Respects Do Not Track  
✅ **Consent-Based** - Only tracks after user consent  
✅ **Lightweight** - <1KB script size  

## Events Tracked

### Search & Discovery
- `search_performed` - User performs a job search
- `filter_applied` - User applies search filters
- `filter_removed` - User removes a filter
- `search_cleared` - User clears search

### Job Interactions
- `job_viewed` - User views job details
- `job_saved` - User saves a job to favorites
- `job_unsaved` - User removes job from favorites
- `job_share` - User shares a job listing

### Application Process
- `apply_click` - User clicks apply button
- `application_started` - User starts application
- `application_submitted` - User submits application
- `application_abandoned` - User abandons application

### Employer Actions
- `job_post_started` - Employer starts job posting
- `job_post_step_completed` - Step completed in posting wizard
- `job_post_published` - Job successfully published
- `job_post_draft_saved` - Draft saved
- `applicant_viewed` - Employer views applicant
- `applicant_stage_changed` - Application stage updated
- `message_sent` - Message sent to applicant

### User Account
- `signup_started` - User starts registration
- `signup_completed` - Registration completed
- `login_completed` - User logs in
- `logout` - User logs out
- `profile_updated` - Profile information updated

### Engagement
- `carousel_interaction` - User interacts with job carousel
- `navigation_menu_opened` - Navigation drawer opened
- `cookie_preferences_changed` - Cookie settings updated
- `error_occurred` - Error encountered

## Implementation

### Basic Usage

```typescript
import { useAnalytics } from '@/hooks/useAnalytics';

function MyComponent() {
  const { trackEvent } = useAnalytics();

  const handleAction = () => {
    trackEvent('search_performed', {
      query: 'Krankenpflege',
      hasFilters: true,
    });
  };
}
```

### Using Event Helpers

```typescript
import { analyticsJob } from '@/lib/analytics-events';

function JobCard({ job }) {
  const handleSave = () => {
    analyticsJob.saved(job.id);
  };
}
```

### Standalone Function

```typescript
import { trackAnalyticsEvent } from '@/hooks/useAnalytics';

// Track events outside components
trackAnalyticsEvent('error_occurred', {
  errorType: 'network',
  errorMessage: 'Failed to load jobs',
  page: '/search',
});
```

## Cookie Consent Management

### User Flow
1. User visits site → Cookie banner appears
2. User can:
   - Accept all cookies (analytics + marketing)
   - Reject all cookies (essential only)
   - Customize preferences

### Adjusting Preferences
Users can update cookie preferences at any time:
- Via footer link "Cookie-Einstellungen"
- In Privacy Center (`/privacy-center`)
- Both trigger the settings dialog

### Technical Implementation
- Consent stored in `localStorage` as `pflegeflix-cookie-consent`
- Consent logged to `consent_logs` table in Supabase
- Version-based consent (requires re-consent on updates)
- Scripts loaded/removed dynamically based on consent

## Data Privacy

### What We Track
- Page views (URL paths only, no query params with PII)
- Custom events with anonymized data
- Device type, browser, country (from IP, then discarded)
- Referrer source

### What We DON'T Track
- IP addresses (not stored)
- Individual user identities
- Cross-site behavior
- Personal information in event properties

### PII Protection
- Search queries truncated to 100 characters
- No email addresses or names in events
- Job IDs used instead of job titles where possible
- Location limited to city/state level

## Plausible Dashboard

Access analytics at: `https://plausible.io/pflegeflix.lovable.app`

### Key Metrics
- **Unique Visitors** - Total unique users
- **Pageviews** - Total page loads
- **Bounce Rate** - Single-page sessions
- **Visit Duration** - Average session length

### Top Pages
- Most visited routes
- Entry/exit pages
- Conversion funnels

### Goals & Conversions
- Application submissions
- Job postings published
- User registrations
- Saved jobs

## Development Testing

### Check if Analytics is Loaded
```javascript
// In browser console
window.plausible
// Should return function if loaded
```

### Test Event Tracking
```javascript
// In browser console
window.plausible('test_event', { props: { test: 'value' } })
```

### Debug Mode
Events are logged to console when `hasAnalyticsConsent()` returns false:
```
Analytics event blocked (no consent): search_performed
```

## GDPR Compliance Checklist

✅ No cookies used by Plausible  
✅ No personal data collected  
✅ Data stored in EU (Germany)  
✅ GDPR-compliant privacy policy  
✅ Opt-out mechanism (reject cookies)  
✅ Consent logged and versioned  
✅ Data retention: 365 days max  
✅ Respects Do Not Track header  
✅ No cross-site tracking  
✅ Transparent data processing  

## Migration from Other Analytics

If migrating from Google Analytics:
1. Update `loadAnalyticsScripts()` in `CookieConsent.tsx`
2. Remove GA initialization code
3. Map GA events to new event structure
4. Update privacy policy

## Best Practices

### Event Naming
- Use `snake_case` for event names
- Be specific but concise
- Group related events (e.g., `job_*`, `application_*`)

### Event Properties
- Keep properties minimal
- Use primitive types (string, number, boolean)
- Avoid nested objects
- Limit string length to prevent PII exposure

### When to Track
- User-initiated actions (clicks, form submits)
- Completed workflows (application submitted)
- Errors that impact user experience
- Key conversion points

### When NOT to Track
- Mousemove or scroll events
- Intermediate form field changes
- Automatic page updates
- Internal system events

## Support

- **Plausible Docs**: https://plausible.io/docs
- **GDPR Guide**: https://plausible.io/data-policy
- **API Reference**: https://plausible.io/docs/events-api

## Changelog

### Version 2.0 (Current)
- Implemented Plausible Analytics
- Added GDPR-compliant consent flow
- Created comprehensive event tracking
- Added footer cookie settings link
- Documented all tracked events

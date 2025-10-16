# I18N Glossary & Content Guidelines

This document serves as the single source of truth for translation decisions, tone rules, and content guidelines for the Pflegeflix platform.

## Table of Contents
1. [Tone & Voice](#tone--voice)
2. [Key Terminology](#key-terminology)
3. [Content Guidelines](#content-guidelines)
4. [Translation Decisions](#translation-decisions)
5. [Accessibility Requirements](#accessibility-requirements)

---

## Tone & Voice

### General Principles
- **Professional yet approachable**: We use "Du" (informal) in German to create a friendly, modern tone
- **Concise and clear**: Avoid jargon and overly technical language
- **Action-oriented**: Use clear verbs (e.g., "Veröffentlichen", "Speichern", "Bewerben")
- **Inclusive**: AGG-compliant language, gender-neutral where possible (e.g., "Bewerber/innen")

### German (DE)
- Use "Du" form consistently (not "Sie")
- Keep titles short and impactful
- Action buttons: Active verbs without articles (e.g., "Job veröffentlichen" not "Einen Job veröffentlichen")

### English (EN)
- Direct, conversational tone
- Use contractions sparingly but naturally
- Action buttons: Imperative form (e.g., "Post Job", not "Post a Job")

---

## Key Terminology

### Employer Experience

| English | German | Notes |
|---------|--------|-------|
| Employer Portal | Arbeitgeber-Portal | Keep hyphen in German |
| My Jobs | Meine Jobs | "Jobs" not "Stellen" for consistency |
| Post Job | Job veröffentlichen | Not "Stelle ausschreiben" |
| Applicants | Bewerber/innen | Gender-inclusive form |
| Settings | Einstellungen | |
| Templates | Vorlagen | Message templates context |

### Job Status

| English | German | Notes |
|---------|--------|-------|
| Draft | Entwurf | Unpublished job |
| Online | Online | Active and published |
| Paused | Pausiert | Temporarily disabled |
| Closed | Geschlossen | Permanently closed |
| Expired | Abgelaufen | Past expiration date |

### Application Stages

| English | German | Notes |
|---------|--------|-------|
| Submitted | Eingereicht | Initial submission |
| Viewed | Gesehen | Employer has viewed |
| Interview | Interview | Interview stage |
| Offer | Angebot | Job offer made |
| Rejected | Abgelehnt | Application rejected |

### Actions

| English | German | Notes |
|---------|--------|-------|
| Export | Exportieren | CSV download |
| Save | Speichern | Save draft/changes |
| Publish | Veröffentlichen | Make job live |
| Edit | Bearbeiten | Modify existing |
| Delete | Löschen | Remove permanently |

---

## Content Guidelines

### Empty States
- **Title**: Short, descriptive (max 5 words)
- **Description**: Explain why it's empty + what action to take
- **CTA**: Clear action button with compelling copy

**Examples:**
- DE: "Noch keine Bewerbungen – veröffentliche deine erste Stelle."
- EN: "No applications yet — publish your first job."

### Error Messages
- Start with what went wrong
- Provide actionable next steps
- Avoid technical jargon

**Examples:**
- DE: "Laden fehlgeschlagen" (not "Ein Fehler ist beim Laden aufgetreten")
- EN: "Loading failed" (not "An error occurred while loading")

### Success Messages (Toasts)
- Keep to 2-4 words
- Confirm the action completed
- No exclamation marks

**Examples:**
- DE: "Job gespeichert", "Bewerbungen gelöscht"
- EN: "Job saved", "Applications deleted"

### Button Labels
- Active verbs
- No articles in German
- Max 3 words

**Examples:**
- DE: "Job veröffentlichen", "Entwurf speichern"
- EN: "Post Job", "Save Draft"

---

## Translation Decisions

### Salary Units
- **UI Display**: Show localized labels
  - DE: "€/h", "€/Monat"
  - EN: "€/hr", "€/month"
- **Backend Payload**: Use enum values exactly as defined
  - Database: `'€/h'`, `'€/Monat'`

### Dates & Numbers
- Use locale-specific formatting via `Intl` API
- DE: DD.MM.YYYY, 1.234,56
- EN: MM/DD/YYYY, 1,234.56

### Pluralization
Always handle singular/plural forms:
- DE: "1 Bewerbung" vs "5 Bewerbungen"
- EN: "1 application" vs "5 applications"

---

## Accessibility Requirements

### Language Attribute
- HTML `lang` attribute must match current language
- Updated dynamically on language switch

### ARIA Labels
- All interactive elements need localized `aria-label`
- Screen reader announcements in chosen language
- Language switch buttons: `aria-pressed` state

### Skip Links
- Provide skip-to-main-content link
- Translate skip link text

### Focus Management
- Visible focus indicators
- Logical tab order
- Focus trap in modals

---

## AGG Compliance

### Gender-Neutral Language
- Use inclusive forms in job postings
- DE: "Bewerber/innen", "Pflegefachkraft (m/w/d)"
- EN: "Applicants", "Healthcare Professional"

### Age-Neutral Terms
- Avoid "jung", "dynamisch", "frisch"
- Focus on skills and qualifications

### Disability-Inclusive
- Accessible forms and interfaces
- Clear error messages
- Keyboard navigation support

---

## Namespace Organization

### Employer Routes (`employer.*`)
All employer-facing UI elements, navigation, portal titles

### Dashboard (`dashboard.*`)
Job listing management, filters, actions, status labels

### Applicants (`applicants.*`)
Application tracking, stages, candidate management

### Jobs (`job.*`)
Job posting flow, validation, success states

### Errors (`error.*`)
Generic and specific error messages

---

## Future Contributors

When adding new translations:

1. **Add to both languages** (DE + EN) simultaneously
2. **Follow naming convention**: `namespace.context.element`
3. **Test with screen readers** to ensure a11y
4. **Check pluralization** if text contains counts
5. **Verify AGG compliance** for user-facing content
6. **Update this glossary** with new terminology decisions

---

## Version History

- **v1.0** (2025-10-14): Initial i18n implementation for employer routes
  - Complete DE/EN coverage for employer portal
  - Language switcher with persistence
  - SEO meta tags with hreflang
  - A11y compliance with localized ARIA labels

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

type Language = 'de' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  formatNumber: (num: number) => string;
  formatCurrency: (amount: number, unit?: '€/h' | '€/Monat') => string;
  formatDate: (date: Date | string, format?: 'short' | 'long') => string;
}

export const translations: Record<Language, Record<string, string>> = {
  de: {
    'nav.home': 'Startseite',
    'nav.search': 'Suche',
    'nav.saved': 'Gespeichert',
    'nav.applications': 'Bewerbungen',
    'nav.admin': 'Admin',
    'nav.employer': 'Arbeitgeber',
    'nav.logout': 'Abmelden',
    'nav.login': 'Anmelden',
    
    // Menu
    'menu.browse': 'Entdecken',
    'menu.home': 'Startseite',
    'menu.my_pflegeflix': 'Mein Pflegeflix',
    'menu.dashboard': 'Dashboard',
    'menu.for_you': 'Für Dich',
    'menu.career': 'Meine Karriere',
    'menu.saved_jobs': 'Gespeicherte Jobs',
    'menu.applications': 'Bewerbungen',
    'menu.account_settings': 'Kontoeinstellungen',
    'menu.categories': 'Kategorien',
    'menu.post_job': 'Job veröffentlichen',
    'menu.my_jobs': 'Meine Jobs',
    'menu.applicants': 'Bewerber/innen',
    'menu.settings': 'Einstellungen',
    'menu.moderation': 'Moderation',
    'menu.data_view': 'Datenansicht',
    'menu.legal_settings': 'Rechtliche Einstellungen',
    'menu.language': 'Sprache',
    'menu.legal': 'Rechtliches',
    'menu.switch_role': 'Rolle wechseln',
    'menu.sign_out': 'Abmelden',
    'menu.sign_in': 'Anmelden',
    'menu.sign_up': 'Registrieren',
    'menu.close': 'Menü schließen',
    
    // Footer
    'footer.impressum': 'Impressum',
    'footer.privacy': 'Datenschutz',
    'footer.terms': 'AGB',
    'footer.cookies': 'Cookie-Richtlinie',
    
    // Auth
    'auth.switching_role': 'Rolle wird gewechselt...',
    'auth.switch_role': 'Rolle wechseln',
    'auth.confirm_password': 'Passwort bestätigen',
    'auth.passwords_match': 'Passwörter stimmen überein',
    'auth.passwords_no_match': 'Passwörter stimmen nicht überein',
    
    // Employer Portal
    'employer.portal_title': 'Arbeitgeber-Portal',
    'employer.portal_subtitle': 'Verwalte deine Jobs und Bewerbungen',
    'employer.my_jobs': 'Meine Jobs',
    'employer.post_job': 'Job veröffentlichen',
    'employer.applicants': 'Bewerber/innen',
    'employer.settings': 'Einstellungen',
    'employer.settings_page_title': 'Einstellungen',
    'employer.settings_page_description': 'Verwalte deine Arbeitgeber-Einstellungen und Vorlagen',
    'employer.settings_page_subtitle': 'Passe deine Einstellungen an',
    'employer.message_templates': 'Nachrichtenvorlagen',
    
    // Categories
    'category.clinics': 'Klinik',
    'category.hospital': 'Krankenhaus',
    'category.nursing_homes': 'Altenheime',
    'category.intensive_care': 'Intensivpflege',
    
    // Dashboard
    'dashboard.my_jobs': 'Meine Jobs',
    'dashboard.jobs_total': 'Jobs insgesamt',
    'dashboard.export': 'Exportieren',
    'dashboard.search_placeholder': 'Jobs durchsuchen...',
    'dashboard.copy': 'Kopie',
    'dashboard.empty.title': 'Noch keine Jobs',
    'dashboard.empty.description': 'Veröffentliche deine erste Stelle und erreiche qualifizierte Pflegekräfte.',
    'dashboard.empty.cta': 'Erste Stelle veröffentlichen',
    'dashboard.filter.all_status': 'Alle Status',
    'dashboard.filter.all_categories': 'Alle Kategorien',
    'dashboard.filter.draft': 'Entwurf',
    'dashboard.filter.online': 'Aktiv',
    'dashboard.filter.paused': 'Pausiert',
    'dashboard.filter.closed': 'Geschlossen',
    'dashboard.filter.expired': 'Abgelaufen',
    'dashboard.sort.newest': 'Neueste',
    'dashboard.sort.applications': 'Meiste Bewerbungen',
    'dashboard.sort.views': 'Meiste Aufrufe',
    'dashboard.status.draft': 'Entwurf',
    'dashboard.status.online': 'Aktiv',
    'dashboard.status.paused': 'Pausiert',
    'dashboard.status.closed': 'Geschlossen',
    'dashboard.status.expired': 'Abgelaufen',
    'dashboard.table.title': 'Titel',
    'dashboard.table.location': 'Standort',
    'dashboard.table.status': 'Status',
    'dashboard.table.views': 'Aufrufe',
    'dashboard.table.applications': 'Bewerbungen',
    'dashboard.table.metrics': 'Metriken',
    'dashboard.table.saved': 'Gespeichert',
    'dashboard.table.updated': 'Aktualisiert',
    'dashboard.table.actions': 'Aktionen',
    'dashboard.job.closed': 'Job erfolgreich geschlossen',
    'dashboard.bulk.selected': 'ausgewählt',
    'dashboard.bulk.pause': 'Pausieren',
    'dashboard.bulk.resume': 'Fortsetzen',
    'dashboard.bulk.close': 'Schließen',
    'dashboard.bulk.delete': 'Löschen',
    'dashboard.bulk.pause_success': 'Jobs pausiert',
    'dashboard.bulk.resume_success': 'Jobs aktiviert',
    'dashboard.bulk.close_success': 'Jobs geschlossen',
    'dashboard.bulk.delete_success': 'Jobs gelöscht',
    'dashboard.bulk.delete_confirm': 'Möchtest du die ausgewählten Jobs wirklich löschen?',
    'dashboard.action.preview': 'Vorschau',
    'dashboard.action.edit': 'Bearbeiten',
    'dashboard.action.pause': 'Pausieren',
    'dashboard.action.resume': 'Fortsetzen',
    'dashboard.action.delete': 'Löschen',
    
    // Applicants
    'applicants.title': 'Bewerber/innen',
    'applicants.subtitle': 'Verwalte alle eingehenden Bewerbungen',
    'applicants.empty_title': 'Noch keine Bewerbungen',
    'applicants.empty_description': 'Noch keine Bewerbungen – veröffentliche deine erste Stelle.',
    'applicants.empty_action': 'Job veröffentlichen',
    'applicants.exported': 'Bewerbungen exportiert',
    'applicants.export': 'Exportieren',
    'applicants.all': 'Alle Bewerbungen',
    'applicants.by_job': 'Nach Stelle',
    'applicants.search_placeholder': 'Bewerbende suchen…',
    'applicants.all_stages': 'Alle Stufen',
    'applicants.submitted': 'Eingereicht',
    'applicants.viewed': 'Gesehen',
    'applicants.interview': 'Interview',
    'applicants.offer': 'Angebot',
    'applicants.rejected': 'Abgelehnt',
    'applicants.select_job_hint': 'Wähle eine Stelle, um Bewerbungen zu sehen.',
    'applicants.filter_stage': 'Stufe filtern',
    'applicants.filter_job': 'Stelle filtern',
    'applicants.all_jobs': 'Alle Stellen',
    'applicants.selected': 'ausgewählt',
    'applicants.change_stage': 'Stufe ändern',
    'applicants.delete_selected': 'Ausgewählte löschen',
    'applicants.applicant': 'Bewerber/in',
    'applicants.job': 'Stelle',
    'applicants.stage': 'Stufe',
    'applicants.rating': 'Bewertung',
    'applicants.applied': 'Beworben',
    'applicants.actions': 'Aktionen',
    'applicants.total': 'Gesamt',
    'applicants.bulk_deleted': 'Bewerbungen gelöscht',
    'applicants.bulk_updated': 'Bewerbungen aktualisiert',
    'applicants.view': 'Ansehen',
    'applicants.no_results': 'Keine Ergebnisse gefunden',
    'applicants.no_results_description': 'Versuche, deine Filter anzupassen oder die Suche zurückzusetzen.',
    'applicants.clear_filters': 'Filter zurücksetzen',
    'applicants.applied_for': 'Beworben für',
    'applicants.pipeline_stage': 'Pipeline-Stufe',
    'applicants.cover_letter': 'Anschreiben',
    'applicants.internal_notes': 'Interne Notizen',
    'applicants.notes_placeholder': 'Füge private Notizen zu diesem Bewerber hinzu...',
    'applicants.save_notes': 'Notizen speichern',
    'applicants.tags': 'Tags',
    'applicants.add_tag': 'Tag hinzufügen...',
    'applicants.add': 'Hinzufügen',
    'applicants.messages': 'Nachrichten',
    'applicants.message_placeholder': 'Nachricht an Bewerber senden...',
    'applicants.message_sent': 'Nachricht gesendet',
    'applicants.activity': 'Aktivität',
    'applicants.system': 'System',
    'applicants.changed_stage_from': 'hat die Stufe geändert von',
    'applicants.to': 'zu',
    'applicants.you': 'Sie',
    'applicants.stage_updated': 'Stufe aktualisiert',
    'applicants.rating_updated': 'Bewertung aktualisiert',
    'applicants.recommend': 'Empfehlen',
    'applicants.recommend_updated': 'Empfehlung aktualisiert',
    'applicants.delete_confirm': 'Möchtest du diesen Bewerber wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
    'applicants.deleted': 'Bewerber gelöscht',
    
    // Saved Searches
    'saved_searches.title': 'Gespeicherte Suchen',
    'saved_searches.subtitle': 'Verwalte deine gespeicherten Filter und E-Mail-Benachrichtigungen.',
    'saved_searches.empty_title': 'Noch keine gespeicherten Suchen',
    'saved_searches.empty_description': 'Speichere eine Suche, um E-Mail-Benachrichtigungen zu erhalten, sobald passende Jobs erscheinen.',
    'saved_searches.empty_action': 'Erste Suche speichern',
    'saved_searches.filters_applied': 'Filter',
    'saved_searches.email_alerts': 'E-Mail-Benachrichtigungen',
    'saved_searches.alert_none': 'Keine',
    'saved_searches.alert_daily': 'Täglich',
    'saved_searches.alert_weekly': 'Wöchentlich',
    'saved_searches.view_results': 'Ergebnisse ansehen',
    'saved_searches.delete': 'Suche löschen',
    'saved_searches.delete_confirm': 'Möchtest du diese gespeicherte Suche wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
    'saved_searches.deleted': 'Suche gelöscht',
    'saved_searches.updated': 'Suche aktualisiert',
    'saved_searches.rename': 'Suche umbenennen',
    'saved_searches.search_name': 'Suchname',
    'saved_searches.search_name_placeholder': 'z. B. „Krankenpflege Berlin"',
    
    // Favorites (Saved Jobs)
    'favorites.title': 'Gespeicherte Jobs',
    'favorites.removed': 'Job aus Favoriten entfernt',
    'favorites.saved': 'Job gespeichert',

    // Footer
    'footer.company_info': 'Unternehmensangaben',
    'footer.legal': 'Rechtliches',
    'footer.support': 'Datenschutz & Support',
    'footer.employers': 'Für Arbeitgeber',
    'footer.privacy_center': 'Datenschutzcenter',
    'footer.candidate_privacy': 'Bewerber-Datenschutz',
    'footer.cookie_settings': 'Cookie-Einstellungen',
    'footer.dpa': 'Auftragsverarbeitung (AVV)',
    'footer.post_job': 'Job veröffentlichen',
    'footer.rights': 'Alle Rechte vorbehalten.',
    'footer.company_address': 'Pflegeflix GmbH, Musterstraße 123, 10115 Berlin, Deutschland',
    'footer.accessibility': 'Barrierefreiheit',
    
    // Job posting
    'job.published_success': 'Job erfolgreich veröffentlicht',
    'job.draft_saved': 'Entwurf gespeichert',
    'job.delete_confirm': 'Möchtest du diesen Job wirklich löschen?',
    'job.step1.title': 'Schritt 1 – Grunddaten',
    'job.field.title': 'Jobtitel',
    'job.field.title_placeholder': 'z. B. Pflegefachkraft',
    'job.field.category': 'Kategorie',
    'job.field.category_placeholder': 'Kategorie wählen',
    'job.field.city': 'Stadt',
    'job.field.city_placeholder': 'Stadt wählen',
    'job.field.state': 'Bundesland',
    'job.field.state_placeholder': 'Bundesland wählen',
    'job.post.back': 'Zurück',
    'job.post.save_draft': 'Entwurf speichern',
    'job.post.next': 'Weiter',
    'job.toast.paused': 'Job pausiert',
    'job.toast.activated': 'Job aktiviert',
    'job.toast.deleted': 'Job gelöscht',
    'job.new': 'Neu',
    'job.apply': 'Jetzt bewerben',
    
    // Application
    'application.cover_letter': 'Bewerbungsschreiben (optional)',
    'application.success': 'Bewerbung erfolgreich eingereicht!',
    
    // Carousels
    'carousel.recommended': 'Empfohlen',
    'carousel.clinics': 'Kliniken & Krankenhäuser',
    'carousel.nursing_homes': 'Altenheime',
    'carousel.one_on_one': '1:1 Intensivpflege',
    'carousel.night_part': 'Nachtschicht-Empfehlungen',
    'carousel.for_you': 'Für dich',
    
    // Hero
    'hero.title': 'Dein Traumjob in der Pflege',
    'hero.subtitle': 'Entdecke Tausende Stellen in ganz Deutschland',
    
    // Message Templates
    'templates.title': 'Nachrichtenvorlagen',
    'templates.new': 'Neue Vorlage',
    'templates.edit': 'Bearbeiten',
    'templates.delete': 'Löschen',
    'templates.delete_confirm': 'Möchtest du diese Vorlage wirklich löschen?',
    'templates.deleted': 'Vorlage gelöscht',
    'templates.saved': 'Vorlage gespeichert',
    'templates.empty_title': 'Noch keine Vorlagen',
    'templates.empty_description': 'Erstelle Vorlagen für häufig verwendete Nachrichten.',
    'templates.empty_action': 'Erste Vorlage erstellen',
    'templates.name': 'Name',
    'templates.subject': 'Betreff',
    'templates.body': 'Nachricht',
    'templates.type': 'Typ',
    'templates.type_general': 'Allgemein',
    'templates.type_interview': 'Einladung',
    'templates.type_offer': 'Angebot',
    'templates.type_rejection': 'Absage',
    
    // Common
    'common.loading': 'Laden...',
    'common.save': 'Speichern',
    'common.cancel': 'Abbrechen',
    'common.delete': 'Löschen',
    'common.edit': 'Bearbeiten',
    'common.close': 'Schließen',
    'common.confirm': 'Bestätigen',
    'common.search': 'Suchen',
    'common.filter': 'Filtern',
    'common.sort': 'Sortieren',
    'common.refresh': 'Aktualisieren',
    'common.view': 'Ansehen',
    'common.no_results': 'Keine Ergebnisse',
    'common.view_results': 'Ergebnisse ansehen',
    'common.rename': 'Umbenennen',
    'common.rename_search': 'Suche umbenennen',
    'common.rename_description': 'Gib einen neuen Namen für diese Suche ein.',
    'common.delete_search': 'Suche löschen?',
    'common.delete_search_description': 'Diese Aktion kann nicht rückgängig gemacht werden. Die Suche und alle zugehörigen E-Mail-Benachrichtigungen werden gelöscht.',
    'common.name': 'Name',
    'common.created': 'Erstellt am',
    'common.never': 'Nie',
    'common.daily': 'Täglich',
    'common.weekly': 'Wöchentlich',
    'loading': 'Laden...',
    'search.filters': 'Filter',
    'privacy_center.delete_cancel': 'Abbrechen',
    'cancel': 'Abbrechen',
    
    // Errors
    'error.unauthorized': 'Keine Berechtigung',
    'error.load_failed': 'Laden fehlgeschlagen',
    'error.update_failed': 'Aktualisierung fehlgeschlagen',
    'error.delete_failed': 'Löschen fehlgeschlagen',
    'error.duplicate_failed': 'Duplizierung fehlgeschlagen',
    'error.generic': 'Ein Fehler ist aufgetreten',
    'error.page_not_found': 'Seite nicht gefunden',
    'error.page_not_found_description': 'Entschuldigung, diese Seite existiert nicht.',
    'navigation.go_back': 'Zurück',
    'navigation.to_search': 'Zur Jobsuche',
  },
  en: {
    'nav.home': 'Home',
    'nav.search': 'Search',
    'nav.saved': 'Saved',
    'nav.applications': 'Applications',
    'nav.admin': 'Admin',
    'nav.employer': 'Employer',
    'nav.logout': 'Sign Out',
    'nav.login': 'Sign In',
    
    // Menu
    'menu.browse': 'Browse',
    'menu.home': 'Home',
    'menu.my_pflegeflix': 'My Pflegeflix',
    'menu.dashboard': 'Dashboard',
    'menu.for_you': 'For You',
    'menu.career': 'My Career',
    'menu.saved_jobs': 'Saved Jobs',
    'menu.applications': 'Applications',
    'menu.account_settings': 'Account Settings',
    'menu.categories': 'Categories',
    'menu.post_job': 'Post Job',
    'menu.my_jobs': 'My Jobs',
    'menu.applicants': 'Applicants',
    'menu.settings': 'Settings',
    'menu.moderation': 'Moderation',
    'menu.data_view': 'Data View',
    'menu.legal_settings': 'Legal Settings',
    'menu.language': 'Language',
    'menu.legal': 'Legal',
    'menu.switch_role': 'Switch Role',
    'menu.sign_out': 'Sign Out',
    'menu.sign_in': 'Sign In',
    'menu.sign_up': 'Sign Up',
    'menu.close': 'Close menu',
    
    // Footer
    'footer.impressum': 'Imprint',
    'footer.privacy': 'Privacy',
    'footer.terms': 'Terms',
    'footer.cookies': 'Cookie Policy',
    
    // Auth
    'auth.switching_role': 'Switching role...',
    'auth.switch_role': 'Switch role',
    'auth.confirm_password': 'Confirm password',
    'auth.passwords_match': 'Passwords match',
    'auth.passwords_no_match': 'Passwords do not match',
    
    // Employer Portal
    'employer.portal_title': 'Employer Portal',
    'employer.portal_subtitle': 'Manage your jobs and applicants',
    'employer.my_jobs': 'My Jobs',
    'employer.post_job': 'Post Job',
    'employer.applicants': 'Applicants',
    'employer.settings': 'Settings',
    'employer.settings_page_title': 'Settings',
    'employer.settings_page_description': 'Manage your employer settings and templates',
    'employer.settings_page_subtitle': 'Customize your settings',
    'employer.message_templates': 'Message Templates',
    
    // Categories
    'category.clinics': 'Clinic',
    'category.hospital': 'Hospital',
    'category.nursing_homes': 'Nursing Homes',
    'category.intensive_care': 'Intensive Care',
    
    // Dashboard
    'dashboard.my_jobs': 'My Jobs',
    'dashboard.jobs_total': 'jobs total',
    'dashboard.export': 'Export',
    'dashboard.search_placeholder': 'Search jobs...',
    'dashboard.copy': 'Copy',
    'dashboard.empty.title': 'No jobs yet',
    'dashboard.empty.description': 'Publish your first job and reach qualified healthcare professionals.',
    'dashboard.empty.cta': 'Publish First Job',
    'dashboard.filter.all_status': 'All Status',
    'dashboard.filter.all_categories': 'All Categories',
    'dashboard.filter.draft': 'Draft',
    'dashboard.filter.online': 'Active',
    'dashboard.filter.paused': 'Paused',
    'dashboard.filter.closed': 'Closed',
    'dashboard.filter.expired': 'Expired',
    'dashboard.sort.newest': 'Newest',
    'dashboard.sort.applications': 'Most Applications',
    'dashboard.sort.views': 'Most Views',
    'dashboard.status.draft': 'Draft',
    'dashboard.status.online': 'Active',
    'dashboard.status.paused': 'Paused',
    'dashboard.status.closed': 'Closed',
    'dashboard.status.expired': 'Expired',
    'dashboard.table.title': 'Title',
    'dashboard.table.location': 'Location',
    'dashboard.table.status': 'Status',
    'dashboard.table.views': 'Views',
    'dashboard.table.applications': 'Applications',
    'dashboard.table.metrics': 'Metrics',
    'dashboard.table.saved': 'Saved',
    'dashboard.table.updated': 'Updated',
    'dashboard.table.actions': 'Actions',
    'dashboard.job.closed': 'Job closed successfully',
    'dashboard.bulk.selected': 'selected',
    'dashboard.bulk.pause': 'Pause',
    'dashboard.bulk.resume': 'Resume',
    'dashboard.bulk.close': 'Close',
    'dashboard.bulk.delete': 'Delete',
    'dashboard.bulk.pause_success': 'Jobs paused',
    'dashboard.bulk.resume_success': 'Jobs activated',
    'dashboard.bulk.close_success': 'Jobs closed',
    'dashboard.bulk.delete_success': 'Jobs deleted',
    'dashboard.bulk.delete_confirm': 'Are you sure you want to delete the selected jobs?',
    'dashboard.action.preview': 'Preview',
    'dashboard.action.edit': 'Edit',
    'dashboard.action.pause': 'Pause',
    'dashboard.action.resume': 'Resume',
    'dashboard.action.delete': 'Delete',
    
    // Applicants
    'applicants.title': 'Applicants',
    'applicants.subtitle': 'Manage all incoming applications',
    'applicants.empty_title': 'No applications yet',
    'applicants.empty_description': 'No applications yet — publish your first job.',
    'applicants.empty_action': 'Post Job',
    'applicants.exported': 'Applications exported',
    'applicants.export': 'Export',
    'applicants.all': 'All Applicants',
    'applicants.by_job': 'By Job',
    'applicants.search_placeholder': 'Search applicants…',
    'applicants.all_stages': 'All Stages',
    'applicants.submitted': 'Submitted',
    'applicants.viewed': 'Viewed',
    'applicants.interview': 'Interview',
    'applicants.offer': 'Offer',
    'applicants.rejected': 'Rejected',
    'applicants.select_job_hint': 'Select a job to view applicants.',
    'applicants.filter_stage': 'Filter by stage',
    'applicants.filter_job': 'Filter by job',
    'applicants.all_jobs': 'All Jobs',
    'applicants.selected': 'selected',
    'applicants.change_stage': 'Change stage',
    'applicants.delete_selected': 'Delete selected',
    'applicants.applicant': 'Applicant',
    'applicants.job': 'Job',
    'applicants.stage': 'Stage',
    'applicants.rating': 'Rating',
    'applicants.applied': 'Applied',
    'applicants.actions': 'Actions',
    'applicants.total': 'Total',
    'applicants.bulk_deleted': 'Applications deleted',
    'applicants.bulk_updated': 'Applications updated',
    'applicants.view': 'View',
    'applicants.no_results': 'No results found',
    'applicants.no_results_description': 'Try adjusting your filters or resetting the search.',
    'applicants.clear_filters': 'Clear filters',
    'applicants.applied_for': 'Applied for',
    'applicants.pipeline_stage': 'Pipeline Stage',
    'applicants.cover_letter': 'Cover Letter',
    'applicants.internal_notes': 'Internal Notes',
    'applicants.notes_placeholder': 'Add private notes about this applicant...',
    'applicants.save_notes': 'Save Notes',
    'applicants.tags': 'Tags',
    'applicants.add_tag': 'Add tag...',
    'applicants.add': 'Add',
    'applicants.messages': 'Messages',
    'applicants.message_placeholder': 'Send message to applicant...',
    'applicants.message_sent': 'Message sent',
    'applicants.activity': 'Activity',
    'applicants.system': 'System',
    'applicants.changed_stage_from': 'changed stage from',
    'applicants.to': 'to',
    'applicants.you': 'You',
    'applicants.stage_updated': 'Stage updated',
    'applicants.rating_updated': 'Rating updated',
    'applicants.recommend': 'Recommend',
    'applicants.recommend_updated': 'Recommendation updated',
    'applicants.delete_confirm': 'Are you sure you want to delete this applicant? This action cannot be undone.',
    'applicants.deleted': 'Applicant deleted',
    
    // Saved Searches
    'saved_searches.title': 'Saved Searches',
    'saved_searches.subtitle': 'Manage your saved filters and email alerts.',
    'saved_searches.empty_title': 'No saved searches yet',
    'saved_searches.empty_description': 'Save a search to get email alerts when new jobs match your filters.',
    'saved_searches.empty_action': 'Create your first saved search',
    'saved_searches.filters_applied': 'filters',
    'saved_searches.email_alerts': 'Email Alerts',
    'saved_searches.alert_none': 'None',
    'saved_searches.alert_daily': 'Daily',
    'saved_searches.alert_weekly': 'Weekly',
    'saved_searches.view_results': 'View Results',
    'saved_searches.delete': 'Delete Search',
    'saved_searches.delete_confirm': 'Are you sure you want to delete this saved search? This action cannot be undone.',
    'saved_searches.deleted': 'Search deleted',
    'saved_searches.updated': 'Search updated',
    'saved_searches.rename': 'Rename Search',
    'saved_searches.search_name': 'Search name',
    'saved_searches.search_name_placeholder': 'e.g., "Nursing jobs in Berlin"',
    
    // Favorites (Saved Jobs)
    'favorites.title': 'Saved Jobs',
    'favorites.removed': 'Job removed from favorites',
    'favorites.saved': 'Job saved',

    // Footer
    'footer.company_info': 'Company Information',
    'footer.legal': 'Legal',
    'footer.support': 'Privacy & Support',
    'footer.employers': 'For Employers',
    'footer.privacy_center': 'Privacy Center',
    'footer.candidate_privacy': 'Candidate Privacy',
    'footer.cookie_settings': 'Cookie Settings',
    'footer.dpa': 'Data Processing Agreement',
    'footer.post_job': 'Post a Job',
    'footer.rights': 'All rights reserved.',
    'footer.company_address': 'Pflegeflix GmbH, Sample Street 123, 10115 Berlin, Germany',
    'footer.accessibility': 'Accessibility',
    
    // Job posting
    'job.published_success': 'Job published successfully',
    'job.draft_saved': 'Draft saved',
    'job.delete_confirm': 'Are you sure you want to delete this job?',
    'job.step1.title': 'Step 1 – Basics',
    'job.field.title': 'Job Title',
    'job.field.title_placeholder': 'e.g., Registered Nurse',
    'job.field.category': 'Category',
    'job.field.category_placeholder': 'Select a category',
    'job.field.city': 'City',
    'job.field.city_placeholder': 'Select a city',
    'job.field.state': 'State',
    'job.field.state_placeholder': 'Select a state',
    'job.post.back': 'Back',
    'job.post.save_draft': 'Save Draft',
    'job.post.next': 'Next',
    'job.toast.paused': 'Job paused',
    'job.toast.activated': 'Job activated',
    'job.toast.deleted': 'Job deleted',
    'job.new': 'New',
    'job.apply': 'Apply now',
    
    // Application
    'application.cover_letter': 'Cover letter (optional)',
    'application.success': 'Application submitted successfully!',
    
    // Carousels
    'carousel.recommended': 'Recommended',
    'carousel.clinics': 'Clinics & Hospitals',
    'carousel.nursing_homes': 'Nursing Homes',
    'carousel.one_on_one': '1:1 Intensive Care',
    'carousel.night_part': 'Night-Shift Picks',
    'carousel.for_you': 'For You',
    
    // Hero
    'hero.title': 'Your Dream Job in Healthcare',
    'hero.subtitle': 'Discover thousands of positions across Germany',
    
    // Message Templates
    'templates.title': 'Message Templates',
    'templates.new': 'New Template',
    'templates.edit': 'Edit',
    'templates.delete': 'Delete',
    'templates.delete_confirm': 'Are you sure you want to delete this template?',
    'templates.deleted': 'Template deleted',
    'templates.saved': 'Template saved',
    'templates.empty_title': 'No templates yet',
    'templates.empty_description': 'Create templates for frequently used messages.',
    'templates.empty_action': 'Create First Template',
    'templates.name': 'Name',
    'templates.subject': 'Subject',
    'templates.body': 'Message',
    'templates.type': 'Type',
    'templates.type_general': 'General',
    'templates.type_interview': 'Interview',
    'templates.type_offer': 'Offer',
    'templates.type_rejection': 'Rejection',
    
    // Common
    'common.loading': 'Laden...',
    'common.save': 'Speichern',
    'common.cancel': 'Abbrechen',
    'common.delete': 'Löschen',
    'common.edit': 'Bearbeiten',
    'common.close': 'Schließen',
    'common.confirm': 'Bestätigen',
    'common.search': 'Suchen',
    'common.filter': 'Filtern',
    'common.sort': 'Sortieren',
    'common.refresh': 'Aktualisieren',
    'common.view': 'Ansehen',
    'common.no_results': 'Keine Ergebnisse',
    'common.view_results': 'Ergebnisse ansehen',
    'common.rename': 'Umbenennen',
    'common.rename_search': 'Suche umbenennen',
    'common.rename_description': 'Gib einen neuen Namen für diese Suche ein.',
    'common.delete_search': 'Suche löschen?',
    'common.delete_search_description': 'Diese Aktion kann nicht rückgängig gemacht werden. Die Suche und alle zugehörigen E-Mail-Benachrichtigungen werden gelöscht.',
    'common.name': 'Name',
    'common.created': 'Erstellt am',
    'common.never': 'Nie',
    'common.daily': 'Täglich',
    'common.weekly': 'Wöchentlich',
    'loading': 'Laden...',
    'search.filters': 'Filter',
    'privacy_center.delete_cancel': 'Abbrechen',
    'cancel': 'Abbrechen',
    
    // Errors
    'error.unauthorized': 'Keine Berechtigung',
    'error.load_failed': 'Laden fehlgeschlagen',
    'error.update_failed': 'Aktualisierung fehlgeschlagen',
    'error.delete_failed': 'Löschen fehlgeschlagen',
    'error.duplicate_failed': 'Duplizierung fehlgeschlagen',
    'error.generic': 'Ein Fehler ist aufgetreten',
    'error.page_not_found': 'Seite nicht gefunden',
    'error.page_not_found_description': 'Entschuldigung, diese Seite existiert nicht.',
    'navigation.go_back': 'Zurück',
    'navigation.to_search': 'Zur Jobsuche',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Detect browser language with 'de' as fallback
  const detectLanguage = (): Language => {
    const stored = localStorage.getItem('pflegeflix-language');
    if (stored && (stored === 'de' || stored === 'en')) {
      return stored as Language;
    }
    
    const browserLang = navigator.language.toLowerCase();
    return browserLang.startsWith('de') ? 'de' : 'de'; // Default to 'de'
  };

  const [language, setLanguageState] = useState<Language>(detectLanguage);

  // Update html lang attribute and persist choice
  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem('pflegeflix-language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    toast.success(lang === 'de' ? 'Sprache auf Deutsch geändert' : 'Language changed to English');
  };

  // Translation function with interpolation and graceful fallback
  const t = (key: string, params?: Record<string, string | number>): string => {
    let translation = translations[language][key];
    
    // Fallback to German if key not found in current language
    if (!translation) {
      translation = translations.de[key];
      if (!translation) {
        console.warn(`Translation missing for key: ${key}`);
        return key; // Show key as last resort
      }
      console.warn(`Translation missing for key "${key}" in ${language}, using German fallback`);
    }

    // Handle interpolation
    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        translation = translation.replace(`{${paramKey}}`, String(value));
      });
    }

    return translation;
  };

  // Format numbers according to locale
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat(language === 'de' ? 'de-DE' : 'en-US').format(num);
  };

  // Format currency with localized unit labels
  const formatCurrency = (amount: number, unit: '€/h' | '€/Monat' = '€/Monat'): string => {
    const formatted = new Intl.NumberFormat(language === 'de' ? 'de-DE' : 'en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

    // Localize unit label
    const unitLabel = unit === '€/h' 
      ? (language === 'de' ? '/Std' : '/hr')
      : (language === 'de' ? '/Monat' : '/month');

    return `${formatted}${unitLabel}`;
  };

  // Format dates according to locale
  const formatDate = (date: Date | string, format: 'short' | 'long' = 'short'): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (format === 'long') {
      return new Intl.DateTimeFormat(language === 'de' ? 'de-DE' : 'en-US', {
        dateStyle: 'long',
      }).format(dateObj);
    }
    
    return new Intl.DateTimeFormat(language === 'de' ? 'de-DE' : 'en-US', {
      dateStyle: 'short',
    }).format(dateObj);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, formatNumber, formatCurrency, formatDate }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
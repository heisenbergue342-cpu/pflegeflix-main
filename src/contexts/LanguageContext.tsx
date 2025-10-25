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
    
    // Favorites (Saved Jobs) - ALLE KEYS HINZUGEFÜGT
    'favorites.title': 'Gespeicherte Jobs',
    'favorites.removed': 'Job aus Favoriten entfernt',
    'favorites.saved': 'Job gespeichert',
    'favorites.description': 'Verwalten Sie Ihre gespeicherten Jobs für später',
    'favorites.private_notes': 'Private Notizen',
    'favorites.save_note': 'Notiz speichern',
    'favorites.note_saved': 'Notiz gespeichert',
    'favorites.compare': 'Vergleichen',
    'favorites.compare_selected': 'Vergleich anzeigen',
    'favorites.compare_panel_title': 'Vergleich',
    'favorites.compare_clear': 'Auswahl löschen',
    'favorites.compare_add_hint': 'Wähle bis zu 3 Jobs zum Vergleich aus.',
    'favorites.empty_title': 'Keine gespeicherten Jobs',
    'favorites.empty_description': 'Du hast noch keine Jobs gespeichert. Durchsuche Stellenangebote und speichere interessante Jobs.',
    'favorites.browse_jobs': 'Jobs durchsuchen',

    // Auth
    'auth.switching_role': 'Rolle wird gewechselt...',
    'auth.switch_role': 'Rolle wechseln',
    'auth.confirm_password': 'Passwort bestätigen',
    'auth.passwords_match': 'Passwörter stimmen überein',
    'auth.passwords_no_match': 'Passwörter stimmen nicht überein',
    'auth.success.account_created': 'Konto erfolgreich erstellt! Bitte bestätigen Sie Ihre E-Mail-Adresse.',
    'auth.error.title': 'Anmeldefehler',
    'auth.error.invalid_credentials': 'Ungültige Anmeldeinformationen. Bitte überprüfen Sie Ihre E-Mail und Ihr Passwort.',
    'auth.error.email_not_confirmed': 'Ihre E-Mail-Adresse ist noch nicht bestätigt. Bitte überprüfen Sie Ihren Posteingang.',
    'auth.error.too_many_requests': 'Zu viele Anmeldeversuche. Bitte versuchen Sie es später erneut.',
    'auth.error.network': 'Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung.',
    'auth.error.generic': 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.',
    'auth.error.try_again': 'Erneut versuchen',
    'auth.error.reset_password': 'Passwort zurücksetzen',
    'auth.error.create_account': 'Konto erstellen',
    'auth.password.hide': 'Passwort ausblenden',
    'auth.password.show': 'Passwort anzeigen',
    'auth.password.visible': 'Passwort ist sichtbar',
    'auth.password.hidden': 'Passwort ist ausgeblendet',
    'auth.login_required.title': 'Anmeldung erforderlich',
    'auth.login_required.message': 'Bitte melden Sie sich an oder registrieren Sie sich, um diese Funktion zu nutzen.',
    'auth.login_required.save_hint': 'Anmelden zum Speichern',
    
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
    
    // Job
    'job.new': 'Neu',
    'job.apply': 'Jetzt bewerben',
    'job.days_ago': 'Vor {days} Tagen',
    'job.by_agreement': 'Nach Vereinbarung',
    'job.save_job': 'Job speichern',
    'job.remove_from_saved': 'Aus Favoriten entfernen',
    'job.boosted_badge': 'Geboostet',
    
    // Search
    'search.commute.estimated': 'Geschätzte Pendelzeit',
    'search.commute.minutes_short': 'Min.',
    'search.commute.by_car': 'Auto',
    'search.commute.by_transit': 'ÖPNV',
    'search.no_info': 'Keine Angabe',
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
    
    // Favorites (Saved Jobs) - ALL KEYS ADDED
    'favorites.title': 'Saved Jobs',
    'favorites.removed': 'Job removed from favorites',
    'favorites.saved': 'Job saved',
    'favorites.description': 'Manage the jobs you saved for later',
    'favorites.private_notes': 'Private Notes',
    'favorites.save_note': 'Save Note',
    'favorites.note_saved': 'Note saved',
    'favorites.compare': 'Compare',
    'favorites.compare_selected': 'Show Comparison',
    'favorites.compare_panel_title': 'Comparison',
    'favorites.compare_clear': 'Clear Selection',
    'favorites.compare_add_hint': 'Select up to 3 jobs to compare.',
    'favorites.empty_title': 'No saved jobs',
    'favorites.empty_description': 'You haven\'t saved any jobs yet. Browse job listings and save interesting jobs.',
    'favorites.browse_jobs': 'Browse Jobs',

    // Auth
    'auth.switching_role': 'Switching role...',
    'auth.switch_role': 'Switch role',
    'auth.confirm_password': 'Confirm password',
    'auth.passwords_match': 'Passwords match',
    'auth.passwords_no_match': 'Passwords do not match',
    'auth.success.account_created': 'Account successfully created! Please confirm your email address.',
    'auth.error.title': 'Login Error',
    'auth.error.invalid_credentials': 'Invalid login credentials. Please check your email and password.',
    'auth.error.email_not_confirmed': 'Your email address is not yet confirmed. Please check your inbox.',
    'auth.error.too_many_requests': 'Too many login attempts. Please try again later.',
    'auth.error.network': 'Network error. Please check your internet connection.',
    'auth.error.generic': 'An unexpected error occurred. Please try again.',
    'auth.error.try_again': 'Try Again',
    'auth.error.reset_password': 'Reset Password',
    'auth.error.create_account': 'Create Account',
    'auth.password.hide': 'Hide password',
    'auth.password.show': 'Show password',
    'auth.password.visible': 'Password is visible',
    'auth.password.hidden': 'Password is hidden',
    'auth.login_required.title': 'Login Required',
    'auth.login_required.message': 'Please log in or register to use this feature.',
    'auth.login_required.save_hint': 'Login to save',
    
    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.close': 'Close',
    'common.confirm': 'Confirm',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.refresh': 'Refresh',
    'common.view': 'View',
    'common.no_results': 'No results',
    
    // Job
    'job.new': 'New',
    'job.apply': 'Apply now',
    'job.days_ago': 'Posted {days} days ago',
    'job.by_agreement': 'By agreement',
    'job.save_job': 'Save job',
    'job.remove_from_saved': 'Remove from saved',
    'job.boosted_badge': 'Boosted',
    
    // Search
    'search.commute.estimated': 'Estimated commute',
    'search.commute.minutes_short': 'min',
    'search.commute.by_car': 'Car',
    'search.commute.by_transit': 'Transit',
    'search.no_info': 'No info',
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
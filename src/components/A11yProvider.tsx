import { useEffect } from 'react';

/**
 * A11yProvider - Accessibility Enhancement Provider
 * Implements WCAG 2.2 AA compliance features
 */
export default function A11yProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Track keyboard navigation to enhance focus indicators
    const handleFirstTab = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        document.body.setAttribute('data-keyboard-navigation', 'true');
      }
    };

    const handleMouseDown = () => {
      document.body.setAttribute('data-keyboard-navigation', 'false');
    };

    window.addEventListener('keydown', handleFirstTab);
    window.addEventListener('mousedown', handleMouseDown);

    // Announce page changes to screen readers
    const announcePageChange = () => {
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = `Seite geladen: ${document.title}`;
        document.body.appendChild(announcement);
        
        setTimeout(() => {
          document.body.removeChild(announcement);
        }, 1000);
      }
    };

    // Listen for route changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.target === document.querySelector('title')) {
          announcePageChange();
        }
      });
    });

    const titleElement = document.querySelector('title');
    if (titleElement) {
      observer.observe(titleElement, { childList: true });
    }

    return () => {
      window.removeEventListener('keydown', handleFirstTab);
      window.removeEventListener('mousedown', handleMouseDown);
      observer.disconnect();
    };
  }, []);

  return <>{children}</>;
}

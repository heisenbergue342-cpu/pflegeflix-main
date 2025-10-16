import { useEffect, useRef } from 'react';

/**
 * Custom hook to trap focus within a modal or dialog for accessibility
 * Conforms to WCAG 2.2 AA requirements for keyboard navigation
 */
export function useFocusTrap(isOpen: boolean) {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isOpen || !elementRef.current) return;

    const element = elementRef.current;
    const focusableElements = element.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    // Store the previously focused element to restore later
    const previouslyFocusedElement = document.activeElement as HTMLElement;

    // Focus the first element when modal opens
    firstElement?.focus();

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Let the parent component handle closing
        element.dispatchEvent(new CustomEvent('escape-pressed'));
      }
    };

    element.addEventListener('keydown', handleTabKey as EventListener);
    element.addEventListener('keydown', handleEscapeKey as EventListener);

    return () => {
      element.removeEventListener('keydown', handleTabKey as EventListener);
      element.removeEventListener('keydown', handleEscapeKey as EventListener);
      
      // Restore focus to the previously focused element
      previouslyFocusedElement?.focus();
    };
  }, [isOpen]);

  return elementRef;
}

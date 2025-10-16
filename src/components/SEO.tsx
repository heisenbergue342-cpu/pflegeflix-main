import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  noindex?: boolean;
}

export default function SEO({ 
  title, 
  description, 
  canonical, 
  ogImage = '/og-image.jpg',
  ogType = 'website',
  noindex = false 
}: SEOProps) {
  const location = useLocation();
  const { language } = useLanguage();
  const baseUrl = window.location.origin;
  const fullUrl = canonical || `${baseUrl}${location.pathname}`;
  const fullTitle = `${title} | Pflegeflix`;

  useEffect(() => {
    // Set page title
    document.title = fullTitle;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Standard meta tags
    updateMetaTag('description', description);
    
    if (noindex) {
      updateMetaTag('robots', 'noindex,nofollow');
    } else {
      updateMetaTag('robots', 'index,follow');
    }

    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = fullUrl;

    // Open Graph tags
    updateMetaTag('og:title', fullTitle, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:url', fullUrl, true);
    updateMetaTag('og:type', ogType, true);
    updateMetaTag('og:image', `${baseUrl}${ogImage}`, true);
    updateMetaTag('og:site_name', 'Pflegeflix', true);
    updateMetaTag('og:locale', language === 'de' ? 'de_DE' : 'en_US', true);
    
    // Hreflang tags for multi-language support
    const updateHreflang = (lang: string, url: string) => {
      const hreflangId = `hreflang-${lang}`;
      let element = document.querySelector(`link[hreflang="${lang}"]`) as HTMLLinkElement;
      
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', 'alternate');
        element.setAttribute('hreflang', lang);
        element.id = hreflangId;
        document.head.appendChild(element);
      }
      
      element.href = url;
    };
    
    // Add hreflang for both languages
    updateHreflang('de', `${baseUrl}${location.pathname}`);
    updateHreflang('en', `${baseUrl}${location.pathname}`);
    updateHreflang('x-default', `${baseUrl}${location.pathname}`);

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', fullTitle);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', `${baseUrl}${ogImage}`);

    // Cleanup function
    return () => {
      // Reset to default on unmount if needed
    };
  }, [title, description, fullUrl, fullTitle, ogImage, ogType, noindex, baseUrl, language, location.pathname]);

  return null;
}

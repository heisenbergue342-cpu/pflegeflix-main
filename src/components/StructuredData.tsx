import { useEffect } from 'react';

interface JobPostingData {
  title: string;
  description: string;
  datePosted: string;
  validThrough?: string;
  employmentType: string;
  hiringOrganization: {
    name: string;
    url?: string;
  };
  jobLocation: {
    city: string;
    state: string;
    country: string;
  };
  baseSalary?: {
    minValue: number;
    maxValue: number;
    currency: string;
    unitText: string;
  };
  identifier?: string;
}

interface StructuredDataProps {
  type: 'JobPosting' | 'Organization' | 'BreadcrumbList';
  data: any;
}

const isPreviewMode = (): boolean => {
  // Check if we're in Lovable preview mode
  const hostname = window.location.hostname;
  return hostname.includes('lovable.app') || hostname.includes('localhost');
};

export function JobPostingStructuredData({ job }: { job: any }) {
  useEffect(() => {
    // Don't add structured data in preview mode
    if (isPreviewMode()) {
      return;
    }

    const jobPosting = {
      '@context': 'https://schema.org',
      '@type': 'JobPosting',
      'title': job.title,
      'description': job.description || `${job.title} in ${job.city}, ${job.state}`,
      'datePosted': job.posted_at || job.created_at,
      'validThrough': job.scheduled_unpublish_at || new Date(new Date(job.posted_at).getTime() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
      'employmentType': job.contract_type === 'Vollzeit' ? 'FULL_TIME' : 
                        job.contract_type === 'Teilzeit' ? 'PART_TIME' : 
                        job.contract_type === 'Befristet' ? 'TEMPORARY' : 
                        'OTHER',
      'hiringOrganization': {
        '@type': 'Organization',
        'name': 'Pflegeflix',
        'sameAs': window.location.origin,
        'logo': `${window.location.origin}/logo.png`
      },
      'jobLocation': {
        '@type': 'Place',
        'address': {
          '@type': 'PostalAddress',
          'addressLocality': job.city,
          'addressRegion': job.state,
          'addressCountry': 'DE'
        }
      },
      'identifier': {
        '@type': 'PropertyValue',
        'name': 'Pflegeflix Job ID',
        'value': job.id
      }
    };

    // Add salary if available
    if (job.salary_min && job.salary_max && job.salary_unit) {
      const unit = job.salary_unit;
      const unitText = unit === '€/h' ? 'HOUR' : unit === '€/Monat' ? 'MONTH' : 'MONTH';
      jobPosting['baseSalary'] = {
        '@type': 'MonetaryAmount',
        'currency': 'EUR',
        'value': {
          '@type': 'QuantitativeValue',
          'minValue': job.salary_min,
          'maxValue': job.salary_max,
          'unitText': unitText
        }
      };
    }

    // Add facility as additional organization if available
    if (job.facility_id) {
      const facilityOrg: any = {
        '@type': 'Organization',
        'name': job.facilities?.name || job.facility_type,
        'address': {
          '@type': 'PostalAddress',
          'addressLocality': job.city,
          'addressRegion': job.state,
          'addressCountry': 'DE'
        }
      };
      jobPosting['hiringOrganization'] = facilityOrg;
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'job-posting-structured-data';
    script.text = JSON.stringify(jobPosting);
    document.head.appendChild(script);

    return () => {
      const existing = document.getElementById('job-posting-structured-data');
      if (existing) {
        existing.remove();
      }
    };
  }, [job]);

  return null;
}

export function BreadcrumbStructuredData({ items }: { items: Array<{ name: string; url: string }> }) {
  useEffect(() => {
    if (isPreviewMode()) {
      return;
    }

    const breadcrumbList = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': items.map((item, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'name': item.name,
        'item': item.url
      }))
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'breadcrumb-structured-data';
    script.text = JSON.stringify(breadcrumbList);
    document.head.appendChild(script);

    return () => {
      const existing = document.getElementById('breadcrumb-structured-data');
      if (existing) {
        existing.remove();
      }
    };
  }, [items]);

  return null;
}

export function OrganizationStructuredData() {
  useEffect(() => {
    if (isPreviewMode()) {
      return;
    }

    const organization = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': 'Pflegeflix',
      'url': window.location.origin,
      'logo': `${window.location.origin}/logo.png`,
      'description': 'Die führende Job-Plattform für Pflegefachkräfte in Deutschland. Finde deinen Traumjob in Kliniken, Altenheimen und Intensivpflege.',
      'sameAs': [
        // Add social media profiles if available
      ],
      'contactPoint': {
        '@type': 'ContactPoint',
        'contactType': 'customer service',
        'availableLanguage': ['German', 'English']
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'organization-structured-data';
    script.text = JSON.stringify(organization);
    document.head.appendChild(script);

    return () => {
      const existing = document.getElementById('organization-structured-data');
      if (existing) {
        existing.remove();
      }
    };
  }, []);

  return null;
}
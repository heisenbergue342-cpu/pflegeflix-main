import { useLanguage } from "@/contexts/LanguageContext";
import SEO from "@/components/SEO";

export default function AccessibilityStatement() {
  const { t, language } = useLanguage();

  return (
    <div className="min-h-screen bg-background pt-20 pb-16">
      <SEO 
        title={language === 'de' ? 'Barrierefreiheitserklärung' : 'Accessibility Statement'}
        description={language === 'de' 
          ? 'Informationen zur Barrierefreiheit von Pflegeflix und Kontaktmöglichkeiten für Feedback.'
          : 'Information about Pflegeflix accessibility and contact options for feedback.'
        }
        canonical="/accessibility-statement"
      />
      
      <div className="container max-w-4xl mx-auto px-4">
        <article className="prose prose-invert max-w-none">
          <h1 className="text-4xl font-bold mb-8">
            {language === 'de' ? 'Barrierefreiheitserklärung' : 'Accessibility Statement'}
          </h1>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              {language === 'de' ? 'Unser Engagement' : 'Our Commitment'}
            </h2>
            <p className="text-netflix-text-muted mb-4">
              {language === 'de'
                ? 'Pflegeflix ist bestrebt, seine Website für alle Menschen zugänglich zu machen, unabhängig von Technologie oder Fähigkeiten. Wir arbeiten kontinuierlich daran, die Barrierefreiheit und Benutzerfreundlichkeit unserer Website zu verbessern und halten uns dabei an die relevanten Barrierefreiheitsstandards.'
                : 'Pflegeflix is committed to making its website accessible to all people, regardless of technology or ability. We are continuously working to improve the accessibility and usability of our website while adhering to relevant accessibility standards.'
              }
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              {language === 'de' ? 'Konformitätsstatus' : 'Conformance Status'}
            </h2>
            <p className="text-netflix-text-muted mb-4">
              {language === 'de'
                ? 'Diese Website strebt die Konformität mit den Web Content Accessibility Guidelines (WCAG) 2.2 Level AA an. Diese Richtlinien erklären, wie Webinhalte für Menschen mit Behinderungen zugänglicher gemacht werden können.'
                : 'This website aims for conformance with the Web Content Accessibility Guidelines (WCAG) 2.2 Level AA. These guidelines explain how to make web content more accessible for people with disabilities.'
              }
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              {language === 'de' ? 'Barrierefreiheitsmerkmale' : 'Accessibility Features'}
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-netflix-text-muted">
              <li>
                {language === 'de'
                  ? 'Tastaturnavigation für alle interaktiven Elemente'
                  : 'Keyboard navigation for all interactive elements'
                }
              </li>
              <li>
                {language === 'de'
                  ? 'Sichtbare Fokusindikatoren für bessere Orientierung'
                  : 'Visible focus indicators for better orientation'
                }
              </li>
              <li>
                {language === 'de'
                  ? 'ARIA-Labels und semantisches HTML für Screenreader'
                  : 'ARIA labels and semantic HTML for screen readers'
                }
              </li>
              <li>
                {language === 'de'
                  ? 'Ausreichende Farbkontraste gemäß WCAG 2.2 AA'
                  : 'Sufficient color contrasts according to WCAG 2.2 AA'
                }
              </li>
              <li>
                {language === 'de'
                  ? 'Alternative Texte für Bilder und Grafiken'
                  : 'Alternative texts for images and graphics'
                }
              </li>
              <li>
                {language === 'de'
                  ? 'Responsives Design für verschiedene Bildschirmgrößen'
                  : 'Responsive design for various screen sizes'
                }
              </li>
              <li>
                {language === 'de'
                  ? 'Klare Fehlermeldungen und Formularvalidierung'
                  : 'Clear error messages and form validation'
                }
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              {language === 'de' ? 'Bekannte Einschränkungen' : 'Known Limitations'}
            </h2>
            <p className="text-netflix-text-muted mb-4">
              {language === 'de'
                ? 'Trotz unserer Bemühungen können einige Teile der Website Barrierefreiheitsprobleme aufweisen. Wir arbeiten kontinuierlich daran, diese zu identifizieren und zu beheben.'
                : 'Despite our efforts, some parts of the website may have accessibility issues. We are continuously working to identify and resolve these.'
              }
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              {language === 'de' ? 'Feedback und Kontakt' : 'Feedback and Contact'}
            </h2>
            <p className="text-netflix-text-muted mb-4">
              {language === 'de'
                ? 'Wir begrüßen Ihr Feedback zur Barrierefreiheit dieser Website. Wenn Sie auf Barrieren stoßen oder Verbesserungsvorschläge haben, kontaktieren Sie uns bitte:'
                : 'We welcome your feedback on the accessibility of this website. If you encounter barriers or have suggestions for improvement, please contact us:'
              }
            </p>
            <ul className="list-none pl-0 space-y-2 text-netflix-text-muted">
              <li>
                <strong>{language === 'de' ? 'E-Mail:' : 'Email:'}</strong>{' '}
                <a href="mailto:accessibility@pflegeflix.de" className="text-primary hover:underline">
                  accessibility@pflegeflix.de
                </a>
              </li>
              <li>
                <strong>{language === 'de' ? 'Postanschrift:' : 'Postal address:'}</strong>{' '}
                {language === 'de'
                  ? 'Pflegeflix GmbH, Barrierefreiheit, Musterstraße 123, 10115 Berlin'
                  : 'Pflegeflix GmbH, Accessibility, Musterstraße 123, 10115 Berlin'
                }
              </li>
            </ul>
            <p className="text-netflix-text-muted mt-4">
              {language === 'de'
                ? 'Wir werden uns bemühen, innerhalb von 5 Werktagen zu antworten.'
                : 'We will strive to respond within 5 business days.'
              }
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              {language === 'de' ? 'Technische Spezifikationen' : 'Technical Specifications'}
            </h2>
            <p className="text-netflix-text-muted mb-4">
              {language === 'de'
                ? 'Die Barrierefreiheit dieser Website basiert auf folgenden Technologien:'
                : 'The accessibility of this website relies on the following technologies:'
              }
            </p>
            <ul className="list-disc pl-6 space-y-2 text-netflix-text-muted">
              <li>HTML5</li>
              <li>CSS3</li>
              <li>JavaScript</li>
              <li>ARIA (Accessible Rich Internet Applications)</li>
            </ul>
          </section>

          <footer className="mt-12 pt-8 border-t border-border text-sm text-muted-foreground">
            {t("legal.last_updated")}: {new Date().toLocaleDateString()}
          </footer>
        </article>
      </div>
    </div>
  );
}

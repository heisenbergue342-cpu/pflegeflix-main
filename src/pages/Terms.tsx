import { useLanguage } from "@/contexts/LanguageContext";
import SEO from '@/components/SEO';

export default function Terms() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background pt-20 pb-16">
      <SEO 
        title="Allgemeine Geschäftsbedingungen (AGB)"
        description="Allgemeine Geschäftsbedingungen von Pflegeflix. Nutzungsbedingungen für Bewerber und Arbeitgeber."
        canonical="/agb"
      />
      
      <div className="container max-w-4xl mx-auto px-4">
        <article className="prose prose-invert max-w-none">
          <h1 className="text-4xl font-bold mb-8">Allgemeine Geschäftsbedingungen (AGB)</h1>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Geltungsbereich</h2>
            <p className="mb-4">
              Diese Allgemeinen Geschäftsbedingungen (nachfolgend "AGB") gelten für die Nutzung der Plattform Pflegeflix 
              (nachfolgend "Plattform"), die von der Pflegeflix GmbH (nachfolgend "Betreiber") zur Verfügung gestellt wird.
            </p>
            <p className="mb-4">
              Die Plattform vermittelt zwischen Arbeitgebern aus dem Gesundheits- und Pflegebereich und Bewerbern. 
              Nutzer können sich entweder als Bewerber oder Arbeitgeber registrieren.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Nutzerkonten und Registrierung</h2>
            <p className="mb-4">
              <strong>2.1</strong> Die Nutzung bestimmter Funktionen der Plattform erfordert eine Registrierung. 
              Nutzer müssen bei der Registrierung wahrheitsgemäße und vollständige Angaben machen.
            </p>
            <p className="mb-4">
              <strong>2.2</strong> Jeder Nutzer darf nur ein Konto erstellen. Die Weitergabe von Zugangsdaten ist untersagt.
            </p>
            <p className="mb-4">
              <strong>2.3</strong> Nutzer sind verpflichtet, ihre Zugangsdaten vertraulich zu behandeln und den Betreiber 
              unverzüglich zu informieren, falls ein unbefugter Zugriff vermutet wird.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Akzeptable Nutzung</h2>
            <p className="mb-4">
              <strong>3.1</strong> Nutzer verpflichten sich, die Plattform ausschließlich für rechtmäßige Zwecke zu verwenden.
            </p>
            <p className="mb-4">
              <strong>3.2</strong> Untersagt sind insbesondere:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Die Veröffentlichung rechtswidriger, beleidigender, diskriminierender oder verleumderischer Inhalte</li>
              <li>Die Verbreitung von Schadsoftware oder Spam</li>
              <li>Die unbefugte Nutzung fremder Daten oder Inhalte</li>
              <li>Handlungen, die die Funktionsfähigkeit der Plattform beeinträchtigen</li>
              <li>Die kommerzielle Nutzung ohne vorherige Zustimmung des Betreibers</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Richtlinien für Stellenanzeigen</h2>
            <p className="mb-4">
              <strong>4.1</strong> Arbeitgeber sind verpflichtet, bei der Erstellung von Stellenanzeigen wahrheitsgemäße 
              und vollständige Angaben zu machen.
            </p>
            <p className="mb-4">
              <strong>4.2</strong> Stellenanzeigen dürfen keine diskriminierenden Inhalte enthalten und müssen den 
              Bestimmungen des Allgemeinen Gleichbehandlungsgesetzes (AGG) entsprechen.
            </p>
            <p className="mb-4">
              <strong>4.3</strong> Unzulässig sind insbesondere Diskriminierungen aufgrund von:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Rasse oder ethnischer Herkunft</li>
              <li>Geschlecht</li>
              <li>Religion oder Weltanschauung</li>
              <li>Behinderung</li>
              <li>Alter</li>
              <li>Sexueller Identität</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Einhaltung des AGG (Allgemeines Gleichbehandlungsgesetz)</h2>
            <p className="mb-4">
              <strong>5.1</strong> Der Betreiber ist dem Grundsatz der Gleichbehandlung verpflichtet. Alle Stellenanzeigen 
              müssen diskriminierungsfrei formuliert sein.
            </p>
            <p className="mb-4">
              <strong>5.2</strong> Der Betreiber behält sich das Recht vor, Stellenanzeigen zu prüfen und bei Verstößen 
              gegen das AGG abzulehnen oder zu löschen.
            </p>
            <p className="mb-4">
              <strong>5.3</strong> Arbeitgeber haften für alle aus diskriminierenden Stellenanzeigen entstehenden Schäden 
              und stellen den Betreiber von entsprechenden Ansprüchen frei.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Urheberrecht und Lizenzen</h2>
            <p className="mb-4">
              <strong>6.1</strong> Alle Inhalte der Plattform (Texte, Bilder, Grafiken, Software) sind urheberrechtlich 
              geschützt und Eigentum des Betreibers oder Dritter.
            </p>
            <p className="mb-4">
              <strong>6.2</strong> Nutzer räumen dem Betreiber durch das Einstellen von Inhalten ein nicht-exklusives, 
              weltweites, zeitlich unbegrenztes Nutzungsrecht ein.
            </p>
            <p className="mb-4">
              <strong>6.3</strong> Nutzer versichern, dass sie über alle erforderlichen Rechte an den von ihnen 
              eingestellten Inhalten verfügen.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Verfügbarkeit der Plattform</h2>
            <p className="mb-4">
              <strong>7.1</strong> Der Betreiber bemüht sich um eine hohe Verfügbarkeit der Plattform, übernimmt jedoch 
              keine Garantie für eine ununterbrochene Erreichbarkeit.
            </p>
            <p className="mb-4">
              <strong>7.2</strong> Wartungsarbeiten und technische Störungen können zu vorübergehenden Unterbrechungen führen.
            </p>
            <p className="mb-4">
              <strong>7.3</strong> Der Betreiber behält sich das Recht vor, die Plattform jederzeit zu ändern oder einzustellen.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Haftung</h2>
            <p className="mb-4">
              <strong>8.1</strong> Der Betreiber haftet unbeschränkt bei Vorsatz und grober Fahrlässigkeit sowie für Schäden 
              aus der Verletzung des Lebens, des Körpers oder der Gesundheit.
            </p>
            <p className="mb-4">
              <strong>8.2</strong> Bei leichter Fahrlässigkeit haftet der Betreiber nur bei Verletzung wesentlicher 
              Vertragspflichten (Kardinalpflichten). In diesem Fall ist die Haftung auf den typischerweise vorhersehbaren 
              Schaden begrenzt.
            </p>
            <p className="mb-4">
              <strong>8.3</strong> Der Betreiber übernimmt keine Haftung für die Richtigkeit, Vollständigkeit oder Aktualität 
              von Stellenanzeigen oder Bewerberprofilen.
            </p>
            <p className="mb-4">
              <strong>8.4</strong> Die Haftung für Datenverlust ist auf den typischen Wiederherstellungsaufwand beschränkt, 
              der bei regelmäßiger Datensicherung entstanden wäre.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Kündigung und Sperrung</h2>
            <p className="mb-4">
              <strong>9.1</strong> Nutzer können ihr Konto jederzeit über die Plattform oder per E-Mail kündigen.
            </p>
            <p className="mb-4">
              <strong>9.2</strong> Der Betreiber kann Nutzerkonten bei Verstößen gegen diese AGB oder geltendes Recht 
              sperren oder löschen.
            </p>
            <p className="mb-4">
              <strong>9.3</strong> Bei schwerwiegenden Verstößen ist eine fristlose Kündigung ohne vorherige Abmahnung möglich.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Geltendes Recht und Gerichtsstand</h2>
            <p className="mb-4">
              <strong>10.1</strong> Für diese AGB und alle Rechtsbeziehungen zwischen dem Betreiber und den Nutzern gilt 
              das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts.
            </p>
            <p className="mb-4">
              <strong>10.2</strong> Gerichtsstand für alle Streitigkeiten ist, soweit gesetzlich zulässig, der Sitz des Betreibers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Änderungen der AGB</h2>
            <p className="mb-4">
              Der Betreiber behält sich das Recht vor, diese AGB jederzeit zu ändern. Nutzer werden über Änderungen 
              per E-Mail oder durch einen Hinweis auf der Plattform informiert. Widersprechen Nutzer den geänderten AGB 
              nicht innerhalb von vier Wochen nach Bekanntgabe, gelten die Änderungen als akzeptiert.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Salvatorische Klausel</h2>
            <p className="mb-4">
              Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, bleibt die Wirksamkeit der übrigen 
              Bestimmungen davon unberührt. An die Stelle der unwirksamen Bestimmung tritt eine Regelung, die dem 
              wirtschaftlichen Zweck der unwirksamen Bestimmung am nächsten kommt.
            </p>
          </section>

          <footer className="mt-12 pt-8 border-t border-border text-sm text-muted-foreground">
            Letzte Aktualisierung: {new Date().toLocaleDateString('de-DE')}
          </footer>
        </article>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Sparkles, TrendingUp } from 'lucide-react';
import SEO from '@/components/SEO';

export default function CareerTools() {
  return (
    <>
      <SEO 
        title="Meine Karriere"
        description="Kostenlose Tools für Ihre Karriere im Gesundheitswesen"
      />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Meine Karriere</h1>
          <p className="text-muted-foreground">
            Professionelle Tools für Ihre Bewerbung und Karriereplanung
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">Lebenslauf-Builder</h2>
                <p className="text-muted-foreground text-sm mb-4">
                  Erstellen Sie einen professionellen Lebenslauf mit Vorlagen für das Gesundheitswesen
                </p>
              </div>
            </div>
            <Link to="/cv-builder">
              <Button className="w-full">Lebenslauf erstellen</Button>
            </Link>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">KI-Anschreiben</h2>
                <p className="text-muted-foreground text-sm mb-4">
                  Generieren Sie maßgeschneiderte Anschreiben mit künstlicher Intelligenz
                </p>
              </div>
            </div>
            <Link to="/cover-letter">
              <Button className="w-full">Anschreiben generieren</Button>
            </Link>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">Gehaltsplaner</h2>
                <p className="text-muted-foreground text-sm mb-4">
                  Vergleichen Sie Gehaltsspannen nach Rolle, Erfahrung und Region
                </p>
              </div>
            </div>
            <Link to="/salary-planner">
              <Button className="w-full">Gehalt vergleichen</Button>
            </Link>
          </Card>
        </div>

        <div className="mt-8 p-6 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">💡 Tipp</h3>
          <p className="text-sm text-muted-foreground">
            Nutzen Sie alle drei Tools, um Ihre Bewerbung optimal vorzubereiten. 
            Ihr erstellter Lebenslauf kann direkt bei Bewerbungen verwendet werden!
          </p>
        </div>
      </div>
    </>
  );
}

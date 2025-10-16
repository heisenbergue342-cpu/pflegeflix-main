import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { TrendingUp } from 'lucide-react';
import SEO from '@/components/SEO';

const GERMAN_STATES = [
  'Baden-Württemberg',
  'Bayern',
  'Berlin',
  'Brandenburg',
  'Bremen',
  'Hamburg',
  'Hessen',
  'Mecklenburg-Vorpommern',
  'Niedersachsen',
  'Nordrhein-Westfalen',
  'Rheinland-Pfalz',
  'Saarland',
  'Sachsen',
  'Sachsen-Anhalt',
  'Schleswig-Holstein',
  'Thüringen',
];

const ROLES = [
  'Krankenpfleger/in',
  'Gesundheits- und Krankenpfleger/in',
  'Altenpfleger/in',
  'Kinderkrankenpfleger/in',
  'Intensivpfleger/in',
  'OP-Pfleger/in',
  'Medizinische/r Fachangestellte/r',
  'Arzt/Ärztin',
  'Physiotherapeut/in',
  'Ergotherapeut/in',
];

const EXPERIENCE_LEVELS = [
  { value: 'entry', label: 'Berufseinsteiger (0-2 Jahre)' },
  { value: 'junior', label: 'Junior (2-5 Jahre)' },
  { value: 'mid', label: 'Erfahren (5-10 Jahre)' },
  { value: 'senior', label: 'Senior (10+ Jahre)' },
];

const FACILITY_TYPES = [
  { value: 'Krankenhaus', label: 'Krankenhaus' },
  { value: 'Klinik', label: 'Klinik' },
  { value: 'Altenheim', label: 'Altenheim' },
  { value: '1zu1', label: '1:1 Pflege' },
];

export default function SalaryPlanner() {
  const [role, setRole] = useState('');
  const [state, setState] = useState('');
  const [facilityType, setFacilityType] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [salaryData, setSalaryData] = useState<{
    min: number;
    max: number;
    median: number;
    dataPoints: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const calculateSalary = async () => {
    if (!role || !state || !facilityType || !experienceLevel) {
      toast.error('Bitte füllen Sie alle Felder aus');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('salary_benchmarks')
        .select('*')
        .eq('role', role)
        .eq('state', state)
        .eq('facility_type', facilityType as any)
        .eq('experience_level', experienceLevel)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setSalaryData({
          min: Number(data.salary_min),
          max: Number(data.salary_max),
          median: Number(data.salary_median),
          dataPoints: data.data_points || 0,
        });
      } else {
        // Generate estimated ranges based on experience level
        const baseRanges: Record<string, { min: number; max: number; median: number }> = {
          entry: { min: 28000, max: 38000, median: 33000 },
          junior: { min: 35000, max: 48000, median: 41500 },
          mid: { min: 42000, max: 58000, median: 50000 },
          senior: { min: 50000, max: 70000, median: 60000 },
        };

        const range = baseRanges[experienceLevel];
        setSalaryData({
          ...range,
          dataPoints: 0,
        });
        toast.info('Geschätzte Werte basierend auf Durchschnittsdaten');
      }
    } catch (error) {
      console.error('Error calculating salary:', error);
      toast.error('Fehler beim Berechnen der Gehaltsschätzung');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO 
        title="Gehaltsplaner"
        description="Vergleichen Sie Gehälter im Gesundheitswesen nach Rolle, Erfahrung und Region"
      />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Gehaltsplaner</h1>
          <p className="text-muted-foreground">
            Vergleichen Sie Gehaltsspannen basierend auf Rolle, Erfahrung und Region
          </p>
        </div>

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Ihre Angaben</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Berufsbezeichnung</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Wählen Sie eine Rolle" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Bundesland</Label>
              <Select value={state} onValueChange={setState}>
                <SelectTrigger>
                  <SelectValue placeholder="Wählen Sie ein Bundesland" />
                </SelectTrigger>
                <SelectContent>
                  {GERMAN_STATES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Einrichtungstyp</Label>
              <Select value={facilityType} onValueChange={setFacilityType}>
                <SelectTrigger>
                  <SelectValue placeholder="Wählen Sie einen Typ" />
                </SelectTrigger>
                <SelectContent>
                  {FACILITY_TYPES.map((ft) => (
                    <SelectItem key={ft.value} value={ft.value}>
                      {ft.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Erfahrungslevel</Label>
              <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Wählen Sie Ihr Level" />
                </SelectTrigger>
                <SelectContent>
                  {EXPERIENCE_LEVELS.map((el) => (
                    <SelectItem key={el.value} value={el.value}>
                      {el.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={calculateSalary} 
            disabled={loading} 
            className="mt-6 w-full"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Gehaltsspanne berechnen
          </Button>
        </Card>

        {salaryData && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Gehaltsschätzung</h2>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Minimum</p>
                <p className="text-2xl font-bold">
                  {salaryData.min.toLocaleString('de-DE')}€
                </p>
                <p className="text-xs text-muted-foreground">pro Jahr</p>
                <p className="text-lg font-semibold mt-2">
                  {Math.round(salaryData.min / 12).toLocaleString('de-DE')}€
                </p>
                <p className="text-xs text-muted-foreground">pro Monat</p>
              </div>
              
              <div className="text-center p-4 bg-primary/10 rounded-lg border-2 border-primary">
                <p className="text-sm text-muted-foreground mb-1">Median</p>
                <p className="text-2xl font-bold text-primary">
                  {salaryData.median.toLocaleString('de-DE')}€
                </p>
                <p className="text-xs text-muted-foreground">pro Jahr</p>
                <p className="text-lg font-semibold text-primary mt-2">
                  {Math.round(salaryData.median / 12).toLocaleString('de-DE')}€
                </p>
                <p className="text-xs text-muted-foreground">pro Monat</p>
              </div>
              
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Maximum</p>
                <p className="text-2xl font-bold">
                  {salaryData.max.toLocaleString('de-DE')}€
                </p>
                <p className="text-xs text-muted-foreground">pro Jahr</p>
                <p className="text-lg font-semibold mt-2">
                  {Math.round(salaryData.max / 12).toLocaleString('de-DE')}€
                </p>
                <p className="text-xs text-muted-foreground">pro Monat</p>
              </div>
            </div>

            <div className="relative h-3 bg-muted rounded-full overflow-hidden mb-4">
              <div 
                className="absolute h-full bg-gradient-to-r from-primary/60 to-primary"
                style={{ 
                  left: '0%',
                  width: '100%'
                }}
              />
              <div 
                className="absolute h-full w-1 bg-primary-foreground"
                style={{ 
                  left: `${((salaryData.median - salaryData.min) / (salaryData.max - salaryData.min)) * 100}%`
                }}
              />
            </div>

            {salaryData.dataPoints > 0 ? (
              <p className="text-sm text-muted-foreground text-center">
                Basierend auf {salaryData.dataPoints} Datenpunkten
              </p>
            ) : (
              <p className="text-sm text-muted-foreground text-center">
                Geschätzte Werte • Aktuelle Marktdaten werden gesammelt
              </p>
            )}

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h3 className="font-semibold mb-2">Hinweise:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Gehälter können je nach Arbeitgeber und Region variieren</li>
                <li>• Zusatzleistungen und Boni sind nicht enthalten</li>
                <li>• Brutto-Jahresgehalt vor Steuern</li>
                <li>• Werte basieren auf Vollzeitstellen</li>
              </ul>
            </div>
          </Card>
        )}
      </div>
    </>
  );
}

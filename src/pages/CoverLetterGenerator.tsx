import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Sparkles, Copy, Download } from 'lucide-react';
import SEO from '@/components/SEO';

export default function CoverLetterGenerator() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [jobTitle, setJobTitle] = useState(searchParams.get('title') || '');
  const [companyName, setCompanyName] = useState('');
  const [facilityType, setFacilityType] = useState(searchParams.get('facility') || '');
  const [coverLetter, setCoverLetter] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Pre-fill from job details if coming from a job page
    const jobId = searchParams.get('jobId');
    if (jobId) {
      loadJobDetails(jobId);
    }
  }, [user, searchParams]);

  const loadJobDetails = async (jobId: string) => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('title, facility_type')
        .eq('id', jobId)
        .single();

      if (error) throw error;
      if (data) {
        setJobTitle(data.title);
        setFacilityType(data.facility_type);
      }
    } catch (error) {
      console.error('Error loading job details:', error);
    }
  };

  const generateCoverLetter = async () => {
    if (!jobTitle || !companyName) {
      toast.error('Bitte füllen Sie alle Pflichtfelder aus');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-cover-letter', {
        body: {
          jobTitle,
          companyName,
          facilityType,
          userProfile: {
            name: profile?.name,
            skills: profile?.skills,
            qualifications: profile?.qualifications,
            bio: profile?.bio,
          },
        },
      });

      if (error) throw error;
      setCoverLetter(data.coverLetter);
      toast.success('Anschreiben generiert!');
    } catch (error) {
      console.error('Error generating cover letter:', error);
      toast.error('Fehler beim Generieren des Anschreibens');
    } finally {
      setLoading(false);
    }
  };

  const copyCoverLetter = () => {
    navigator.clipboard.writeText(coverLetter);
    toast.success('In Zwischenablage kopiert!');
  };

  const downloadCoverLetter = () => {
    const blob = new Blob([coverLetter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `anschreiben-${jobTitle.toLowerCase().replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Anschreiben heruntergeladen!');
  };

  return (
    <>
      <SEO 
        title="KI-Anschreiben Generator"
        description="Erstellen Sie mit KI professionelle Anschreiben für Ihre Bewerbungen"
      />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">KI-Anschreiben Generator</h1>
          <p className="text-muted-foreground">
            Erstellen Sie ein professionelles, auf die Stelle zugeschnittenes Anschreiben
          </p>
        </div>

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Stellendetails</h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label>Jobtitel *</Label>
              <Input
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="z.B. Krankenpfleger/in"
              />
            </div>
            <div>
              <Label>Unternehmen / Einrichtung *</Label>
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="z.B. Universitätsklinikum Berlin"
              />
            </div>
            <div>
              <Label>Einrichtungstyp (optional)</Label>
              <Input
                value={facilityType}
                onChange={(e) => setFacilityType(e.target.value)}
                placeholder="z.B. Krankenhaus, Pflegeheim"
              />
            </div>
          </div>
          <Button 
            onClick={generateCoverLetter} 
            disabled={loading} 
            className="mt-6 w-full"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {loading ? 'Wird generiert...' : 'Anschreiben mit KI generieren'}
          </Button>
        </Card>

        {coverLetter && (
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Ihr Anschreiben</h2>
              <div className="flex gap-2">
                <Button onClick={copyCoverLetter} variant="outline" size="sm">
                  <Copy className="w-4 h-4 mr-2" />
                  Kopieren
                </Button>
                <Button onClick={downloadCoverLetter} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
            <Textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="min-h-[400px] font-mono text-sm"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Sie können den generierten Text bearbeiten, bevor Sie ihn verwenden.
            </p>
          </Card>
        )}
      </div>
    </>
  );
}

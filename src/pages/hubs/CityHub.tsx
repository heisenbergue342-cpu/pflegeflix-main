import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import SEO from '@/components/SEO';
import JobCard from '@/components/JobCard';
import { Card } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { germanCities } from '@/data/cities_de';

export default function CityHub() {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const city = useMemo(() => germanCities.find(c => c.slug === slug), [slug]);
  const title = city 
    ? (language === 'de' ? `Pflegejobs in ${city.name}` : `Healthcare jobs in ${city.name}`)
    : (language === 'de' ? 'Pflegejobs in deiner Stadt' : 'Healthcare jobs in your city');
  const desc = city
    ? (language === 'de' 
      ? `Finde aktuelle Pflegejobs in ${city.name}, ${city.state}. Entdecke Kliniken, Altenheime und 1:1 Intensivpflege in deiner Nähe.` 
      : `Find current healthcare jobs in ${city.name}, ${city.state}. Explore clinics, nursing homes, and 1:1 intensive care near you.`)
    : (language === 'de'
      ? 'Entdecke Pflegejobs in deutschen Städten. Wähle deine Stadt für passende Ergebnisse.'
      : 'Discover healthcare jobs in German cities. Choose your city for matching results.');

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('jobs')
        .select('*')
        .eq('approved', true)
        .eq('city', city?.name || '')
        .order('posted_at', { ascending: false });
      setJobs(data || []);
      setLoading(false);
    };
    fetchJobs();
  }, [city?.name]);

  return (
    <div className="min-h-screen bg-netflix-bg">
      <SEO 
        title={title}
        description={desc}
        canonical={`/jobs/city/${slug}`}
      />
      <div className="container mx-auto px-4 py-10 max-w-6xl">
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <MapPin className="w-7 h-7 text-netflix-red" />
            <h1 className="text-3xl font-bold text-white">{title}</h1>
          </div>
          <p className="text-netflix-text-muted mt-2">{desc}</p>
        </div>
        {loading ? (
          <Card className="p-8 bg-netflix-card border-netflix-card text-white">Loading...</Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {jobs.map(job => <JobCard key={job.id} job={job} />)}
          </div>
        )}
      </div>
    </div>
  );
}
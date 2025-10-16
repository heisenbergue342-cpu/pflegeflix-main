import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRecommendations } from '@/hooks/useRecommendations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, MapPin, Calendar, TrendingUp, Settings } from 'lucide-react';
import SEO from '@/components/SEO';
import EmptyState from '@/components/EmptyState';
import { toast } from '@/hooks/use-toast';

export default function ForYou() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { recommendations, loading, error, markAsViewed } = useRecommendations(20);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleJobClick = (jobId: string) => {
    markAsViewed(jobId);
    navigate(`/jobs/${jobId}`);
  };

  const getMatchLevel = (score: number) => {
    if (score >= 50) return { label: 'Sehr gut', color: 'bg-green-500' };
    if (score >= 30) return { label: 'Gut', color: 'bg-blue-500' };
    if (score >= 15) return { label: 'Mittel', color: 'bg-yellow-500' };
    return { label: 'Niedrig', color: 'bg-gray-500' };
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pt-20 pb-8">
      <SEO 
        title="Für Dich - Personalisierte Jobempfehlungen"
        description="Entdecke Jobs, die perfekt zu deinem Profil passen. Personalisierte Empfehlungen basierend auf deinen Fähigkeiten und Präferenzen."
        canonical="/for-you"
        noindex={true}
      />

      <div className="container max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Für Dich</h1>
          </div>
          <p className="text-muted-foreground">
            Personalisierte Jobempfehlungen basierend auf deinem Profil, deinen Fähigkeiten und Suchpräferenzen
          </p>
        </div>

        {/* Recommendation Settings Banner */}
        {profile?.recommendations_enabled === false && (
          <Card className="mb-6 border-yellow-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="font-medium">Empfehlungen sind deaktiviert</p>
                    <p className="text-sm text-muted-foreground">
                      Aktiviere Empfehlungen in deinen Einstellungen, um personalisierte Jobs zu sehen.
                    </p>
                  </div>
                </div>
                <Button onClick={() => navigate('/privacy-settings')}>
                  Einstellungen
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">Fehler beim Laden der Empfehlungen: {error}</p>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!loading && !error && recommendations.length === 0 && (
          <EmptyState
            icon={Sparkles}
            title="Noch keine Empfehlungen"
            description="Vervollständige dein Profil und füge Fähigkeiten hinzu, um personalisierte Jobempfehlungen zu erhalten."
            action={{
              label: "Profil vervollständigen",
              onClick: () => navigate('/dashboard')
            }}
          />
        )}

        {/* Recommendations Grid */}
        {!loading && !error && recommendations.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {recommendations.length} personalisierte Empfehlungen für dich
              </p>
              <Button variant="outline" size="sm" onClick={() => navigate('/privacy-settings')}>
                <Settings className="w-4 h-4 mr-2" />
                Einstellungen
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((job) => {
                const match = getMatchLevel(job.match_score);
                return (
                  <Card 
                    key={job.job_id} 
                    className="hover:border-primary transition-colors cursor-pointer"
                    onClick={() => handleJobClick(job.job_id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg line-clamp-2">{job.title}</CardTitle>
                        <div className="flex items-center gap-1 shrink-0">
                          <div className={`w-2 h-2 rounded-full ${match.color}`} />
                          <span className="text-xs font-medium">{Math.round(job.match_score)}%</span>
                        </div>
                      </div>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {job.city}, {job.state}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-muted-foreground" />
                        <Badge variant="secondary" className="text-xs">
                          {match.label} Match
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {job.facility_type}
                        </Badge>
                      </div>

                      {job.contract_type && (
                        <div className="text-sm text-muted-foreground">
                          {job.contract_type}
                          {job.shift_type && ` • ${job.shift_type}`}
                        </div>
                      )}

                      {(job.salary_min || job.salary_max) && (
                        <div className="text-sm font-medium">
                          {job.salary_min && job.salary_max 
                            ? `${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()} €`
                            : job.salary_min 
                            ? `Ab ${job.salary_min.toLocaleString()} €`
                            : `Bis ${job.salary_max?.toLocaleString()} €`
                          }
                        </div>
                      )}

                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {new Date(job.posted_at).toLocaleDateString('de-DE')}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

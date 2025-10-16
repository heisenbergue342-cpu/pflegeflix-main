import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface RecommendedJob {
  job_id: string;
  match_score: number;
  title: string;
  city: string;
  state: string;
  facility_type: string;
  salary_min: number | null;
  salary_max: number | null;
  contract_type: string | null;
  shift_type: string | null;
  posted_at: string;
}

export function useRecommendations(limit: number = 10) {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<RecommendedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    fetchRecommendations();
  }, [user, limit]);

  const fetchRecommendations = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase
        .rpc('get_personalized_recommendations', {
          p_user_id: user.id,
          p_limit: limit
        });

      if (rpcError) throw rpcError;

      setRecommendations(data || []);
    } catch (err: any) {
      console.error('Error fetching recommendations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const markAsViewed = async (jobId: string) => {
    if (!user) return;

    const recommendation = recommendations.find(r => r.job_id === jobId);
    if (!recommendation) return;

    await supabase
      .from('user_recommendations')
      .upsert({
        user_id: user.id,
        job_id: jobId,
        match_score: recommendation.match_score,
        viewed: true
      }, {
        onConflict: 'user_id,job_id'
      });
  };

  return {
    recommendations,
    loading,
    error,
    refresh: fetchRecommendations,
    markAsViewed
  };
}

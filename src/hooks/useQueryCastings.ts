import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

/**
 * Hook to fetch castings/jobs with optional type filter
 */
export function useQueryCastings(type?: string) {
  return useQuery({
    queryKey: ['castings', type || 'all'],
    queryFn: async () => {
      let query = supabase
        .from('castings_jobs')
        .select('*')
        .eq('status', 'active');

      if (type && type !== 'all') {
        query = query.eq('job_type', type);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch single casting/job by ID
 */
export function useQueryCasting(castingId: string) {
  return useQuery({
    queryKey: ['castings', 'casting', castingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('castings_jobs')
        .select('*')
        .eq('id', castingId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!castingId,
    staleTime: 5 * 60 * 1000,
  });
}

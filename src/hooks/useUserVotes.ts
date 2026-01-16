import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useUserVotes(productId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-votes', user?.id, productId],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('review_votes')
        .select('review_id')
        .eq('user_id', user.id);

      if (error) throw error;
      return data.map((v) => v.review_id);
    },
    enabled: !!user,
  });
}

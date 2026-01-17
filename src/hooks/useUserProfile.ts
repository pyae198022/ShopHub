import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserReview {
  id: string;
  product_id: string;
  title: string | null;
  content: string;
  rating: number;
  helpful_count: number | null;
  created_at: string;
}

export interface UserVote {
  id: string;
  review_id: string;
  created_at: string;
  review?: {
    product_id: string;
    title: string | null;
    user_name: string;
    rating: number;
  };
}

export function useUserReviews() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-reviews', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('product_reviews')
        .select('id, product_id, title, content, rating, helpful_count, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as UserReview[];
    },
    enabled: !!user,
  });
}

export function useUserVotesWithDetails() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-votes-details', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('review_votes')
        .select(`
          id,
          review_id,
          created_at,
          product_reviews (
            product_id,
            title,
            user_name,
            rating
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data.map((vote) => ({
        id: vote.id,
        review_id: vote.review_id,
        created_at: vote.created_at,
        review: vote.product_reviews,
      })) as UserVote[];
    },
    enabled: !!user,
  });
}

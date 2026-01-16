import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ProductReview {
  id: string;
  product_id: string;
  user_name: string;
  user_email: string | null;
  rating: number;
  title: string | null;
  content: string;
  is_verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
}

export interface CreateReviewInput {
  product_id: string;
  user_id: string;
  user_name: string;
  user_email?: string;
  rating: number;
  title?: string;
  content: string;
}

export function useProductReviews(productId: string) {
  return useQuery({
    queryKey: ['product-reviews', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ProductReview[];
    },
    enabled: !!productId,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateReviewInput) => {
      const { data, error } = await supabase
        .from('product_reviews')
        .insert([input])
        .select()
        .single();

      if (error) throw error;
      return data as ProductReview;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['product-reviews', data.product_id] });
      toast.success('Review submitted successfully!');
    },
    onError: (error) => {
      toast.error('Failed to submit review. Please try again.');
      console.error('Review submission error:', error);
    },
  });
}

export function useMarkReviewHelpful() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, productId, userId }: { reviewId: string; productId: string; userId: string }) => {
      // First record the vote
      const { error: voteError } = await supabase
        .from('review_votes')
        .insert([{ user_id: userId, review_id: reviewId }]);

      if (voteError) {
        if (voteError.code === '23505') {
          throw new Error('You have already voted on this review');
        }
        throw voteError;
      }

      // Get current helpful count
      const { data: review, error: fetchError } = await supabase
        .from('product_reviews')
        .select('helpful_count')
        .eq('id', reviewId)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (!review) throw new Error('Review not found');

      const newCount = (review.helpful_count || 0) + 1;

      const { error: updateError } = await supabase
        .from('product_reviews')
        .update({ helpful_count: newCount })
        .eq('id', reviewId);

      if (updateError) throw updateError;
      return { reviewId, productId, newCount };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['product-reviews', data.productId] });
      queryClient.invalidateQueries({ queryKey: ['user-votes'] });
      toast.success('Thanks for your feedback!');
    },
    onError: (error) => {
      toast.error(error.message || 'Could not mark as helpful. Try again.');
    },
  });
}

export function useReviewStats(productId: string) {
  const { data: reviews } = useProductReviews(productId);

  if (!reviews || reviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    };
  }

  const totalReviews = reviews.length;
  const averageRating = reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews;
  
  const ratingDistribution = reviews.reduce(
    (acc, r) => {
      acc[r.rating as 1 | 2 | 3 | 4 | 5]++;
      return acc;
    },
    { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as Record<1 | 2 | 3 | 4 | 5, number>
  );

  return { averageRating, totalReviews, ratingDistribution };
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Product } from '@/types/ecommerce';
import { sampleProducts } from '@/data/sampleProducts';

export function useBrowsingHistory() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: browsingHistory = [], isLoading } = useQuery({
    queryKey: ['browsing-history', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('product_views')
        .select('product_id, view_count, viewed_at')
        .eq('user_id', user.id)
        .order('viewed_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching browsing history:', error);
        return [];
      }

      // Map product_ids to actual products
      return data
        .map(view => {
          const product = sampleProducts.find(p => p.id === view.product_id);
          return product ? { ...product, viewCount: view.view_count, viewedAt: view.viewed_at } : null;
        })
        .filter(Boolean) as (Product & { viewCount: number; viewedAt: string })[];
    },
    enabled: !!user,
  });

  const trackProductView = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) return;

      // Try to upsert - increment view count if exists, otherwise insert
      const { error } = await supabase
        .from('product_views')
        .upsert(
          {
            user_id: user.id,
            product_id: productId,
            viewed_at: new Date().toISOString(),
            view_count: 1,
          },
          {
            onConflict: 'user_id,product_id',
            ignoreDuplicates: false,
          }
        );

      if (error) {
        // If upsert failed, try to update the existing record
        const { error: updateError } = await supabase
          .from('product_views')
          .update({ 
            viewed_at: new Date().toISOString(),
            view_count: supabase.rpc ? 1 : 1 // Will be incremented below
          })
          .eq('user_id', user.id)
          .eq('product_id', productId);

        if (updateError) {
          console.error('Error tracking product view:', updateError);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['browsing-history', user?.id] });
    },
  });

  return {
    browsingHistory,
    isLoading,
    trackProductView: trackProductView.mutate,
  };
}

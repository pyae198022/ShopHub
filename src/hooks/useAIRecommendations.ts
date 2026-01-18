import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useBrowsingHistory } from './useBrowsingHistory';
import { useWishlist } from './useWishlist';
import { sampleProducts } from '@/data/sampleProducts';
import { Product } from '@/types/ecommerce';

export function useAIRecommendations() {
  const { user } = useAuth();
  const { browsingHistory } = useBrowsingHistory();
  const { data: wishlistItems = [] } = useWishlist();

  const { data: recommendations = [], isLoading, error, refetch } = useQuery({
    queryKey: ['ai-recommendations', user?.id, browsingHistory.length, wishlistItems.length],
    queryFn: async (): Promise<Product[]> => {
      // Prepare data for the AI
      const historyProducts = browsingHistory.slice(0, 10);
      const wishlistProducts = wishlistItems.map(item => 
        sampleProducts.find(p => p.id === item.product_id)
      ).filter(Boolean);

      const { data, error } = await supabase.functions.invoke('ai-recommendations', {
        body: {
          browsingHistory: historyProducts,
          wishlistItems: wishlistProducts,
          allProducts: sampleProducts.map(p => ({
            id: p.id,
            name: p.name,
            category: p.category,
            price: p.price,
            description: p.description,
          })),
        },
      });

      if (error) {
        console.error('Error fetching AI recommendations:', error);
        throw error;
      }

      // Map recommended IDs to actual products
      const recommendedIds: string[] = data?.recommendations || [];
      const recommendedProducts = recommendedIds
        .map(id => sampleProducts.find(p => p.id === id))
        .filter(Boolean) as Product[];

      // If AI didn't return enough recommendations, add some fallback products
      if (recommendedProducts.length < 4) {
        const existingIds = new Set(recommendedProducts.map(p => p.id));
        const wishlistIds = new Set(wishlistItems.map(w => w.product_id));
        
        const fallbackProducts = sampleProducts
          .filter(p => !existingIds.has(p.id) && !wishlistIds.has(p.id))
          .slice(0, 4 - recommendedProducts.length);
        
        recommendedProducts.push(...fallbackProducts);
      }

      return recommendedProducts.slice(0, 4);
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1,
  });

  return {
    recommendations,
    isLoading,
    error,
    refetch,
  };
}

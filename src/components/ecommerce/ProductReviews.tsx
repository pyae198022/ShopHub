import { useState } from 'react';
import { MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ReviewForm } from './ReviewForm';
import { ReviewList } from './ReviewList';
import { ReviewSummary } from './ReviewSummary';
import { useProductReviews, useReviewStats } from '@/hooks/useProductReviews';

interface ProductReviewsProps {
  productId: string;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const [showForm, setShowForm] = useState(false);
  const { data: reviews, isLoading } = useProductReviews(productId);
  const { averageRating, totalReviews, ratingDistribution } = useReviewStats(productId);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="h-6 w-6" />
          Customer Reviews
        </h2>
        <Button
          variant="outline"
          onClick={() => setShowForm(!showForm)}
          className="gap-2"
        >
          {showForm ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Hide Form
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              Write a Review
            </>
          )}
        </Button>
      </div>

      <ReviewSummary
        averageRating={averageRating}
        totalReviews={totalReviews}
        ratingDistribution={ratingDistribution}
      />

      {showForm && (
        <>
          <Separator />
          <ReviewForm productId={productId} onSuccess={() => setShowForm(false)} />
        </>
      )}

      <Separator />

      <ReviewList reviews={reviews} isLoading={isLoading} />
    </section>
  );
}

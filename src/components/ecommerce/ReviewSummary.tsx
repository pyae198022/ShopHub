import { Star } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ReviewSummaryProps {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

export function ReviewSummary({
  averageRating,
  totalReviews,
  ratingDistribution,
}: ReviewSummaryProps) {
  if (totalReviews === 0) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row gap-6 p-6 bg-card rounded-lg border">
      {/* Average Rating */}
      <div className="text-center sm:text-left sm:pr-6 sm:border-r">
        <div className="text-5xl font-bold">{averageRating.toFixed(1)}</div>
        <div className="flex justify-center sm:justify-start mt-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-5 w-5 ${
                star <= Math.round(averageRating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-muted'
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Rating Distribution */}
      <div className="flex-1 space-y-2">
        {([5, 4, 3, 2, 1] as const).map((rating) => {
          const count = ratingDistribution[rating];
          const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

          return (
            <div key={rating} className="flex items-center gap-2 text-sm">
              <span className="w-8 text-muted-foreground">{rating} ★</span>
              <Progress value={percentage} className="h-2 flex-1" />
              <span className="w-8 text-right text-muted-foreground">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

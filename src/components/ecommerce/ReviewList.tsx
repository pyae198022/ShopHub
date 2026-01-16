import { useState } from 'react';
import { Star, User, CheckCircle, ThumbsUp, LogIn } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ProductReview, useMarkReviewHelpful } from '@/hooks/useProductReviews';
import { useUserVotes } from '@/hooks/useUserVotes';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { formatDistanceToNow } from 'date-fns';

interface ReviewListProps {
  reviews: ProductReview[] | undefined;
  isLoading: boolean;
  productId: string;
}

export function ReviewList({ reviews, isLoading, productId }: ReviewListProps) {
  const { user } = useAuth();
  const { data: userVotes = [] } = useUserVotes(productId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No reviews yet. Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewCard 
          key={review.id} 
          review={review} 
          user={user}
          hasVoted={userVotes.includes(review.id)}
        />
      ))}
    </div>
  );
}

interface ReviewCardProps {
  review: ProductReview;
  user: ReturnType<typeof useAuth>['user'];
  hasVoted: boolean;
}

function ReviewCard({ review, user, hasVoted: initialHasVoted }: ReviewCardProps) {
  const [hasVoted, setHasVoted] = useState(initialHasVoted);
  const [authOpen, setAuthOpen] = useState(false);
  const { mutate: markHelpful, isPending } = useMarkReviewHelpful();

  const handleHelpfulClick = () => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    
    if (hasVoted) return;
    
    markHelpful(
      { reviewId: review.id, productId: review.product_id, userId: user.id },
      {
        onSuccess: () => setHasVoted(true),
      }
    );
  };

  return (
    <div className="p-4 border rounded-lg space-y-3 bg-card">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{review.user_name}</span>
              {review.is_verified_purchase && (
                <span className="flex items-center gap-1 text-xs text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  Verified Purchase
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= review.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted'
                    }`}
                  />
                ))}
              </div>
              <span>•</span>
              <span>
                {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {review.title && (
        <h4 className="font-semibold">{review.title}</h4>
      )}

      <p className="text-muted-foreground leading-relaxed">{review.content}</p>

      {/* Helpful Button */}
      <div className="flex items-center gap-2 pt-2">
        <Button
          variant={hasVoted ? "secondary" : "outline"}
          size="sm"
          onClick={handleHelpfulClick}
          disabled={isPending || hasVoted}
          className="gap-2"
        >
          {!user ? (
            <>
              <LogIn className="h-4 w-4" />
              Sign in to vote
            </>
          ) : (
            <>
              <ThumbsUp className={`h-4 w-4 ${hasVoted ? 'fill-current' : ''}`} />
              Helpful {review.helpful_count > 0 && `(${review.helpful_count})`}
            </>
          )}
        </Button>
        {hasVoted && (
          <span className="text-xs text-muted-foreground">Thank you for your feedback!</span>
        )}
      </div>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}

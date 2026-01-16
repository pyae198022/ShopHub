import { useState, useEffect } from 'react';
import { Star, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCreateReview } from '@/hooks/useProductReviews';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';

interface ReviewFormProps {
  productId: string;
  onSuccess?: () => void;
}

export function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [userName, setUserName] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const { mutate: createReview, isPending } = useCreateReview();

  // Pre-fill user name from profile
  useEffect(() => {
    if (user?.user_metadata?.full_name) {
      setUserName(user.user_metadata.full_name);
    } else if (user?.email) {
      setUserName(user.email.split('@')[0]);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="p-6 bg-card rounded-lg border text-center space-y-4">
        <h3 className="font-semibold text-lg">Write a Review</h3>
        <p className="text-muted-foreground">Sign in to share your experience with this product.</p>
        <Button onClick={() => setAuthOpen(true)} className="gap-2">
          <LogIn className="h-4 w-4" />
          Sign In to Review
        </Button>
        <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) return;
    if (!userName.trim() || !content.trim()) return;

    createReview(
      {
        product_id: productId,
        user_id: user.id,
        user_name: userName.trim(),
        user_email: user.email || undefined,
        rating,
        title: title.trim() || undefined,
        content: content.trim(),
      },
      {
        onSuccess: () => {
          setRating(0);
          setTitle('');
          setContent('');
          onSuccess?.();
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-card rounded-lg border">
      <h3 className="font-semibold text-lg">Write a Review</h3>

      {/* Star Rating */}
      <div className="space-y-2">
        <Label>Your Rating *</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                className={`h-7 w-7 transition-colors ${
                  star <= (hoveredRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-muted-foreground'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="userName">Display Name *</Label>
        <Input
          id="userName"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="Your name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Review Title (optional)</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Your Review *</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Tell others about your experience with this product..."
          rows={4}
          required
        />
      </div>

      <Button
        type="submit"
        disabled={isPending || rating === 0 || !userName.trim() || !content.trim()}
        className="w-full sm:w-auto"
      >
        {isPending ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  );
}

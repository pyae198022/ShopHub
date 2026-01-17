import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Star, ThumbsUp, MessageSquare, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useUserReviews, useUserVotesWithDetails } from '@/hooks/useUserProfile';
import { sampleProducts } from '@/data/sampleProducts';
import { useEffect } from 'react';

function getProductName(productId: string): string {
  const product = sampleProducts.find((p) => p.id === productId);
  return product?.name || 'Unknown Product';
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
          }`}
        />
      ))}
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { data: reviews, isLoading: reviewsLoading } = useUserReviews();
  const { data: votes, isLoading: votesLoading } = useUserVotesWithDetails();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">My Profile</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reviews?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Helpful Votes Given</CardTitle>
              <ThumbsUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{votes?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Helpful Votes Received</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reviews?.reduce((sum, r) => sum + (r.helpful_count || 0), 0) || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="reviews" className="space-y-4">
          <TabsList>
            <TabsTrigger value="reviews">My Reviews</TabsTrigger>
            <TabsTrigger value="votes">Voting History</TabsTrigger>
          </TabsList>

          <TabsContent value="reviews" className="space-y-4">
            {reviewsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-4 w-1/3 mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : reviews?.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>You haven't written any reviews yet.</p>
                  <Button asChild className="mt-4">
                    <Link to="/">Browse Products</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              reviews?.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                      <div>
                        <Link
                          to={`/shop/product/${review.product_id}`}
                          className="font-semibold hover:text-primary transition-colors"
                        >
                          {getProductName(review.product_id)}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <StarRating rating={review.rating} />
                          {review.title && (
                            <span className="text-sm font-medium">{review.title}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {formatDate(review.created_at)}
                      </div>
                    </div>
                    <p className="text-muted-foreground">{review.content}</p>
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                      <Badge variant="secondary">
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        {review.helpful_count || 0} helpful
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="votes" className="space-y-4">
            {votesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-4 w-1/3 mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : votes?.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  <ThumbsUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>You haven't voted on any reviews yet.</p>
                  <Button asChild className="mt-4">
                    <Link to="/">Browse Products</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              votes?.map((vote) => (
                <Card key={vote.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <Link
                          to={`/shop/product/${vote.review?.product_id}`}
                          className="font-semibold hover:text-primary transition-colors"
                        >
                          {getProductName(vote.review?.product_id || '')}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            Marked as helpful
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Review by {vote.review?.user_name}
                          {vote.review?.title && `: "${vote.review.title}"`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {formatDate(vote.created_at)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

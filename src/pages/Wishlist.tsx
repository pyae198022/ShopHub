import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist, useRemoveFromWishlist } from '@/hooks/useWishlist';
import { useCart } from '@/contexts/CartContext';
import { sampleProducts } from '@/data/sampleProducts';
import { useEffect } from 'react';

export default function Wishlist() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { data: wishlist, isLoading: wishlistLoading } = useWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const { addToCart } = useCart();

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

  const wishlistProducts = wishlist
    ?.map((item) => {
      const product = sampleProducts.find((p) => p.id === item.product_id);
      return product ? { ...product, wishlistId: item.id, addedAt: item.created_at } : null;
    })
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">My Wishlist</h1>
              <p className="text-sm text-muted-foreground">
                {wishlistProducts?.length || 0} items saved
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {wishlistLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-48 w-full mb-4" />
                  <Skeleton className="h-4 w-2/3 mb-2" />
                  <Skeleton className="h-4 w-1/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : wishlistProducts?.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              <Heart className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
              <p className="mb-6">Save items you love by clicking the heart icon on products.</p>
              <Button asChild>
                <Link to="/">Browse Products</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {wishlistProducts?.map((product) => (
              <Card key={product!.id} className="overflow-hidden group">
                <Link to={`/shop/product/${product!.id}`}>
                  <div className="aspect-square overflow-hidden bg-muted">
                    <img
                      src={product!.image}
                      alt={product!.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                </Link>
                <CardContent className="p-4">
                  <Link
                    to={`/shop/product/${product!.id}`}
                    className="font-semibold hover:text-primary transition-colors line-clamp-1"
                  >
                    {product!.name}
                  </Link>
                  <p className="text-lg font-bold text-primary mt-1">
                    ${product!.price.toFixed(2)}
                  </p>
                  <div className="flex gap-2 mt-4">
                    <Button
                      className="flex-1"
                      size="sm"
                      onClick={() => {
                        addToCart(product!);
                      }}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFromWishlist.mutate(product!.id)}
                      disabled={removeFromWishlist.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, Minus, Plus, ShoppingCart, Truck, Shield, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { sampleProducts } from '@/data/sampleProducts';
import { useCart } from '@/contexts/CartContext';
import { useState, useEffect } from 'react';
import { CartSheet } from '@/components/ecommerce/CartSheet';
import { ProductReviews } from '@/components/ecommerce/ProductReviews';
import { WishlistButton } from '@/components/ecommerce/WishlistButton';
import { useBrowsingHistory } from '@/hooks/useBrowsingHistory';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const { trackProductView } = useBrowsingHistory();

  const product = sampleProducts.find((p) => p.id === id);
  
  // Track product view when the page loads
  useEffect(() => {
    if (id) {
      trackProductView(id);
    }
  }, [id, trackProductView]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Button asChild>
            <Link to="/shop">Back to Shop</Link>
          </Button>
        </div>
      </div>
    );
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <Button variant="ghost" asChild>
            <Link to="/shop" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Shop
            </Link>
          </Button>
          <CartSheet />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Image */}
          <div className="aspect-square rounded-xl overflow-hidden bg-muted">
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">
                {product.category}
              </p>
              <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
              
              {product.rating && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(product.rating!)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-medium">{product.rating}</span>
                  {product.reviewCount && (
                    <span className="text-muted-foreground">
                      ({product.reviewCount} reviews)
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold">${product.price.toFixed(2)}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                    <Badge variant="destructive">Save {discount}%</Badge>
                  </>
                )}
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            {product.tags && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <Separator />

            {/* Quantity & Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-medium">Quantity:</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span className={product.stock > 10 ? 'text-green-600' : 'text-orange-500'}>
                  {product.stock > 10
                    ? 'In Stock'
                    : product.stock > 0
                    ? `Only ${product.stock} left`
                    : 'Out of Stock'}
                </span>
              </div>

              <div className="flex gap-3">
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={() => addToCart(product, quantity)}
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart - ${(product.price * quantity).toFixed(2)}
                </Button>
                <WishlistButton productId={product.id} variant="default" />
              </div>
            </div>

            <Separator />

            {/* Features */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-muted">
                <Truck className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-xs font-medium">Free Shipping</p>
                <p className="text-xs text-muted-foreground">Over $50</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted">
                <Shield className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-xs font-medium">Secure Payment</p>
                <p className="text-xs text-muted-foreground">100% Protected</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted">
                <RotateCcw className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-xs font-medium">Easy Returns</p>
                <p className="text-xs text-muted-foreground">30 Day Policy</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <Separator className="mb-8" />
          <ProductReviews productId={product.id} />
        </div>
      </main>
    </div>
  );
}

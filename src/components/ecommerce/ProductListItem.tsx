import { Star, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { Product } from '@/types/ecommerce';
import { useCart } from '@/contexts/CartContext';
import { Link } from 'react-router-dom';
import { WishlistButton } from './WishlistButton';

interface ProductListItemProps {
  product: Product;
}

export function ProductListItem({ product }: ProductListItemProps) {
  const { addToCart } = useCart();
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Card className="group overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
      <div className="flex flex-col sm:flex-row">
        <Link to={`/shop/product/${product.id}`} className="sm:w-48 flex-shrink-0">
          <div className="relative aspect-square sm:aspect-auto sm:h-full overflow-hidden bg-muted">
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {discount > 0 && (
              <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground">
                -{discount}%
              </Badge>
            )}
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <Badge variant="destructive" className="text-lg py-2 px-4">
                  Out of Stock
                </Badge>
              </div>
            )}
          </div>
        </Link>
        <CardContent className="flex-1 p-4 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 space-y-2">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                {product.category}
              </p>
              <Link to={`/shop/product/${product.id}`}>
                <h3 className="font-semibold text-foreground hover:text-primary transition-colors">
                  {product.name}
                </h3>
              </Link>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {product.description}
              </p>
            </div>

            {product.rating && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{product.rating}</span>
                {product.reviewCount && (
                  <span className="text-xs text-muted-foreground">
                    ({product.reviewCount} reviews)
                  </span>
                )}
              </div>
            )}

            {product.stock < 10 && product.stock > 0 && (
              <Badge variant="secondary" className="w-fit">
                Only {product.stock} left
              </Badge>
            )}
          </div>

          <div className="flex flex-row sm:flex-col items-center sm:items-end gap-4 sm:gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-foreground">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <WishlistButton productId={product.id} />
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  addToCart(product);
                }}
                disabled={product.stock === 0}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

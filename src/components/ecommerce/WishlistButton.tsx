import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWishlist, useToggleWishlist } from '@/hooks/useWishlist';
import { cn } from '@/lib/utils';

interface WishlistButtonProps {
  productId: string;
  variant?: 'icon' | 'default';
  className?: string;
}

export function WishlistButton({ productId, variant = 'icon', className }: WishlistButtonProps) {
  const { data: wishlist } = useWishlist();
  const { toggle, isLoading } = useToggleWishlist();
  
  const isInWishlist = wishlist?.some((item) => item.product_id === productId) ?? false;

  if (variant === 'icon') {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={cn('rounded-full', className)}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggle(productId);
        }}
        disabled={isLoading}
      >
        <Heart
          className={cn(
            'h-5 w-5 transition-colors',
            isInWishlist ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
          )}
        />
      </Button>
    );
  }

  return (
    <Button
      variant={isInWishlist ? 'secondary' : 'outline'}
      className={className}
      onClick={() => toggle(productId)}
      disabled={isLoading}
    >
      <Heart
        className={cn(
          'h-4 w-4 mr-2',
          isInWishlist ? 'fill-red-500 text-red-500' : ''
        )}
      />
      {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
    </Button>
  );
}

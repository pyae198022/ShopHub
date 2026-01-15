import { Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CheckoutForm } from '@/components/ecommerce/CheckoutForm';
import { useCart } from '@/contexts/CartContext';

export default function Checkout() {
  const { cart } = useCart();

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-4">
            Add some products before checking out
          </p>
          <Button asChild>
            <Link to="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 flex h-16 items-center">
          <Button variant="ghost" asChild>
            <Link to="/shop" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Shop
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        <CheckoutForm />
      </main>
    </div>
  );
}

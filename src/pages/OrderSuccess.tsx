import { Link } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function OrderSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>

          <div>
            <h1 className="text-2xl font-bold mb-2">Order Confirmed!</h1>
            <p className="text-muted-foreground">
              Thank you for your purchase. Your order has been received and is being processed.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-muted">
            <div className="flex items-center justify-center gap-3">
              <Package className="h-5 w-5 text-primary" />
              <div className="text-left">
                <p className="text-sm font-medium">Order Number</p>
                <p className="text-xs text-muted-foreground">
                  #{Math.random().toString(36).substring(2, 10).toUpperCase()}
                </p>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            We'll send you an email confirmation with tracking details once your order ships.
          </p>

          <div className="flex flex-col gap-3">
            <Button asChild>
              <Link to="/shop" className="flex items-center gap-2">
                Continue Shopping
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

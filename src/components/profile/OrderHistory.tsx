import { Link } from 'react-router-dom';
import { Package, Clock, ChevronDown, ChevronUp, Truck, MapPin, CheckCircle2, Circle } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { useOrderHistory, Order } from '@/hooks/useOrderHistory';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

function formatDate(dateString: string | null): string {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getStatusBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'confirmed':
    case 'delivered':
      return 'default';
    case 'processing':
    case 'shipped':
      return 'secondary';
    case 'cancelled':
      return 'destructive';
    default:
      return 'outline';
  }
}

function getStatusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getTrackingProgress(status: string): number {
  switch (status) {
    case 'pending':
      return 10;
    case 'confirmed':
      return 25;
    case 'processing':
      return 40;
    case 'shipped':
      return 70;
    case 'delivered':
      return 100;
    default:
      return 0;
  }
}

function TrackingTimeline({ order }: { order: Order }) {
  const steps = [
    { key: 'confirmed', label: 'Order Confirmed', date: order.created_at, completed: true },
    { key: 'processing', label: 'Processing', date: null, completed: ['processing', 'shipped', 'delivered'].includes(order.status) },
    { key: 'shipped', label: 'Shipped', date: order.shipped_at, completed: ['shipped', 'delivered'].includes(order.status) },
    { key: 'delivered', label: 'Delivered', date: order.delivered_at, completed: order.status === 'delivered' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium">Shipment Tracking</h4>
        {order.tracking_number && (
          <div className="text-sm">
            <span className="text-muted-foreground">Tracking: </span>
            <span className="font-mono">{order.tracking_number}</span>
            {order.carrier && (
              <span className="text-muted-foreground ml-2">({order.carrier})</span>
            )}
          </div>
        )}
      </div>
      
      <Progress value={getTrackingProgress(order.status)} className="h-2" />
      
      <div className="grid grid-cols-4 gap-2">
        {steps.map((step, index) => (
          <div key={step.key} className="text-center">
            <div className="flex justify-center mb-2">
              {step.completed ? (
                <CheckCircle2 className="h-6 w-6 text-primary" />
              ) : (
                <Circle className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <p className={`text-xs font-medium ${step.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
              {step.label}
            </p>
            {step.date && (
              <p className="text-xs text-muted-foreground mt-1">
                {formatDate(step.date)}
              </p>
            )}
          </div>
        ))}
      </div>

      {order.estimated_delivery && order.status !== 'delivered' && (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg mt-4">
          <Truck className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-medium">Estimated Delivery</p>
            <p className="text-sm text-muted-foreground">{formatDate(order.estimated_delivery)}</p>
          </div>
        </div>
      )}

      {order.status === 'delivered' && order.delivered_at && (
        <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg mt-4">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-medium">Delivered</p>
            <p className="text-sm text-muted-foreground">{formatDate(order.delivered_at)}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Order #{order.id.slice(0, 8)}</span>
                <Badge variant={getStatusBadgeVariant(order.status)}>
                  {getStatusLabel(order.status)}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {formatDate(order.created_at)}
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-lg">${order.total.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">
                {order.order_items?.length || 0} item{(order.order_items?.length || 0) !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full mt-4">
              {isOpen ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-2" />
                  Hide Details
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-2" />
                  View Details
                </>
              )}
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="mt-4 space-y-4">
            {/* Tracking Timeline */}
            <div className="border-t pt-4">
              <TrackingTimeline order={order} />
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Items</h4>
              <div className="space-y-3">
                {order.order_items?.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    {item.product_image && (
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="h-16 w-16 rounded-md object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/shop/product/${item.product_id}`}
                        className="text-sm font-medium hover:text-primary transition-colors line-clamp-1"
                      >
                        {item.product_name}
                      </Link>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      <p className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {order.shipping_address && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Shipping Address</h4>
                <p className="text-sm text-muted-foreground">
                  {order.shipping_address.firstName} {order.shipping_address.lastName}<br />
                  {order.shipping_address.address}<br />
                  {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zipCode}
                </p>
              </div>
            )}

            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Order Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${order.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium pt-1 border-t">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </CardContent>
      </Collapsible>
    </Card>
  );
}

export function OrderHistory() {
  const { data: orders, isLoading } = useOrderHistory();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-1/3 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>You haven't placed any orders yet.</p>
          <Button asChild className="mt-4">
            <Link to="/shop">Start Shopping</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}

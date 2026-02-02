import { useState } from 'react';
import { format } from 'date-fns';
import { Order, useUpdateOrder } from '@/hooks/useAdminOrders';
import { sendOrderNotification, OrderStatus } from '@/services/orderNotifications';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from '@/hooks/use-toast';
import {
  ChevronDown,
  ChevronUp,
  Mail,
  Package,
  Truck,
  CheckCircle,
  Clock,
  Loader2,
} from 'lucide-react';

interface AdminOrderCardProps {
  order: Order;
}

const statusConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  pending: { label: 'Pending', icon: <Clock className="h-4 w-4" />, color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Confirmed', icon: <CheckCircle className="h-4 w-4" />, color: 'bg-blue-100 text-blue-800' },
  processing: { label: 'Processing', icon: <Package className="h-4 w-4" />, color: 'bg-purple-100 text-purple-800' },
  shipped: { label: 'Shipped', icon: <Truck className="h-4 w-4" />, color: 'bg-orange-100 text-orange-800' },
  delivered: { label: 'Delivered', icon: <CheckCircle className="h-4 w-4" />, color: 'bg-green-100 text-green-800' },
};

export function AdminOrderCard({ order }: AdminOrderCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newStatus, setNewStatus] = useState(order.status);
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || '');
  const [carrier, setCarrier] = useState(order.carrier || '');
  const [estimatedDelivery, setEstimatedDelivery] = useState(order.estimatedDelivery || '');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const updateOrder = useUpdateOrder();

  const handleUpdateOrder = async (sendEmail: boolean = false) => {
    const updates: {
      orderId: string;
      status?: string;
      trackingNumber?: string;
      carrier?: string;
      estimatedDelivery?: string;
    } = {
      orderId: order.id,
    };

    if (newStatus !== order.status) updates.status = newStatus;
    if (trackingNumber !== order.trackingNumber) updates.trackingNumber = trackingNumber;
    if (carrier !== order.carrier) updates.carrier = carrier;
    if (estimatedDelivery !== order.estimatedDelivery) updates.estimatedDelivery = estimatedDelivery;

    if (Object.keys(updates).length === 1) {
      toast({
        title: 'No Changes',
        description: 'No changes were made to the order.',
      });
      return;
    }

    await updateOrder.mutateAsync(updates);

    if (sendEmail && newStatus !== order.status) {
      setIsSendingEmail(true);
      try {
        const result = await sendOrderNotification({
          orderId: order.id,
          status: newStatus as OrderStatus,
          trackingNumber: trackingNumber || undefined,
          carrier: carrier || undefined,
          estimatedDelivery: estimatedDelivery || undefined,
        });

        if (result.success) {
          toast({
            title: 'Email Sent',
            description: `${newStatus} notification email sent to customer.`,
          });
        } else {
          toast({
            title: 'Email Failed',
            description: result.error || 'Failed to send notification email.',
            variant: 'destructive',
          });
        }
      } finally {
        setIsSendingEmail(false);
      }
    }
  };

  const status = statusConfig[order.status] || statusConfig.pending;

  return (
    <Card className="shadow-card">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-left">
                  <p className="font-mono text-sm text-muted-foreground">
                    #{order.id.slice(0, 8)}
                  </p>
                  <p className="font-semibold text-foreground">
                    {order.shippingAddress
                      ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`
                      : 'No address'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge className={`${status.color} flex items-center gap-1`}>
                  {status.icon}
                  {status.label}
                </Badge>
                <p className="font-bold text-foreground">${order.total.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(order.createdAt), 'MMM d, yyyy')}
                </p>
                {isOpen ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Order Items */}
              <div>
                <h4 className="font-semibold text-foreground mb-3">Order Items</h4>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-2 bg-secondary/50 rounded-lg"
                    >
                      {item.productImage && (
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="h-10 w-10 rounded object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          Qty: {item.quantity} × ${item.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping Address */}
                {order.shippingAddress && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-foreground mb-2">Shipping Address</h4>
                    <p className="text-sm text-muted-foreground">
                      {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                      <br />
                      {order.shippingAddress.address}
                      <br />
                      {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                      {order.shippingAddress.zipCode}
                      <br />
                      {order.shippingAddress.country}
                    </p>
                  </div>
                )}
              </div>

              {/* Update Form */}
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Update Order</h4>

                <div className="space-y-2">
                  <Label htmlFor={`status-${order.id}`}>Status</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger id={`status-${order.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`tracking-${order.id}`}>Tracking Number</Label>
                  <Input
                    id={`tracking-${order.id}`}
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`carrier-${order.id}`}>Carrier</Label>
                  <Select value={carrier} onValueChange={setCarrier}>
                    <SelectTrigger id={`carrier-${order.id}`}>
                      <SelectValue placeholder="Select carrier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ups">UPS</SelectItem>
                      <SelectItem value="fedex">FedEx</SelectItem>
                      <SelectItem value="usps">USPS</SelectItem>
                      <SelectItem value="dhl">DHL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`delivery-${order.id}`}>Estimated Delivery</Label>
                  <Input
                    id={`delivery-${order.id}`}
                    type="date"
                    value={estimatedDelivery}
                    onChange={(e) => setEstimatedDelivery(e.target.value)}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => handleUpdateOrder(false)}
                    disabled={updateOrder.isPending}
                    variant="outline"
                    className="flex-1"
                  >
                    {updateOrder.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                  <Button
                    onClick={() => handleUpdateOrder(true)}
                    disabled={updateOrder.isPending || isSendingEmail || newStatus === order.status}
                    className="flex-1"
                  >
                    {isSendingEmail ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Mail className="mr-2 h-4 w-4" />
                    )}
                    Save & Send Email
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
